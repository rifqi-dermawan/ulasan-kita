<?php

namespace Tests\Feature;

use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReviewManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock Gemini API agar pengujian cepat & terisolasi
        Http::fake([
            '*generativelanguage.googleapis.com*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Positif'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);
    }

    public function test_owner_can_create_review_with_valid_date(): void
    {
        $user = User::factory()->create();
        $today = Carbon::now('Asia/Jakarta')->toDateString();

        $response = $this->actingAs($user)->post(route('ulasan.store'), [
            'content' => 'Rasa soto lamongan sangat enak dan kuahnya gurih mantap.',
            'menu_item' => 'Soto Lamongan',
            'reviewed_at' => $today,
        ]);

        $response->assertRedirect(route('ulasan.index'));
        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'source' => 'qr',
            'menu_item' => 'Soto Lamongan',
        ]);

        $created = Review::where('user_id', $user->id)->first();
        $this->assertNotNull($created->reviewed_at);
        $this->assertEquals($today, $created->reviewed_at->toDateString());
    }

    public function test_owner_cannot_create_review_with_future_date(): void
    {
        $user = User::factory()->create();
        $tomorrow = Carbon::now('Asia/Jakarta')->addDays(2)->toDateString();

        $response = $this->actingAs($user)->post(route('ulasan.store'), [
            'content' => 'Ulasan makanan enak tapi tanggal lusa di masa depan.',
            'source' => 'google_maps',
            'reviewed_at' => $tomorrow,
        ]);

        $response->assertSessionHasErrors(['reviewed_at']);
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_public_user_can_submit_review_with_automatic_qr_source_and_date(): void
    {
        $kantin = User::factory()->create(['name' => 'Kantin Mbak Sri']);

        $response = $this->post(route('kantin.ulas.store', $kantin->id), [
            'content' => 'Pelayanan ramah, porsi nasi banyak dan ayam geprek lezat!',
            'menu_item' => 'Ayam Geprek Sambal Korek',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('reviews', [
            'user_id' => $kantin->id,
            'source' => 'qr',
            'menu_item' => 'Ayam Geprek Sambal Korek',
        ]);

        $review = Review::where('user_id', $kantin->id)->first();
        $this->assertNotNull($review->reviewed_at);
        $this->assertNotNull($review->sentiment);
    }

    public function test_public_review_rejects_honeypot_spam(): void
    {
        $kantin = User::factory()->create();

        $response = $this->post(route('kantin.ulas.store', $kantin->id), [
            'content' => 'Spam bot promotion buy cheap followers now!',
            'hp_token' => 'i_am_a_bot',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_owner_cannot_update_delete_or_analyze_other_owners_review(): void
    {
        $ownerA = User::factory()->create();
        $ownerB = User::factory()->create();

        $reviewA = Review::create([
            'user_id' => $ownerA->id,
            'content' => 'Ulasan sah milik kantin A yang tidak boleh diubah orang lain.',
            'source' => 'google_maps',
            'reviewed_at' => now(),
            'review_date' => now()->toDateString(),
            'sentiment' => 'Positif',
            'original_sentiment' => 'Positif',
        ]);

        // Percobaan Update oleh Owner B -> 403 Forbidden
        $updateResponse = $this->actingAs($ownerB)->put(route('ulasan.update', $reviewA->id), [
            'content' => 'Konten dibajak oleh orang lain.',
            'source' => 'google_maps',
            'sentiment' => 'Negatif',
        ]);
        $updateResponse->assertForbidden();

        // Percobaan Analyze oleh Owner B -> 403 Forbidden
        $analyzeResponse = $this->actingAs($ownerB)->post(route('ulasan.analyze', $reviewA->id));
        $analyzeResponse->assertForbidden();

        // Percobaan Delete oleh Owner B -> 403 Forbidden
        $deleteResponse = $this->actingAs($ownerB)->delete(route('ulasan.destroy', $reviewA->id));
        $deleteResponse->assertForbidden();

        // Pastikan ulasan A tetap utuh
        $this->assertDatabaseHas('reviews', [
            'id' => $reviewA->id,
            'user_id' => $ownerA->id,
            'sentiment' => 'Positif',
        ]);
    }

    public function test_public_review_route_is_throttled(): void
    {
        $kantin = User::factory()->create();

        // Jalankan 10 permintaan yang diizinkan dalam 1 menit
        for ($i = 0; $i < 10; $i++) {
            $this->post(route('kantin.ulas.store', $kantin->id), [
                'content' => "Ulasan ke-{$i} pengujian throttle rate limit.",
            ]);
        }

        // Permintaan ke-11 harus diblokir oleh throttle (429 Too Many Requests)
        $rateLimitedResponse = $this->post(route('kantin.ulas.store', $kantin->id), [
            'content' => 'Ulasan ke-11 yang seharusnya kena rate limit.',
        ]);

        $rateLimitedResponse->assertStatus(429);
    }
}
