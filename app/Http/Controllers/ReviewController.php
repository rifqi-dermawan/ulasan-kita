<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Tampilkan form publik untuk pelanggan memberikan ulasan via QR Code.
     */
    public function publicCreate(User $user): Response
    {
        return Inertia::render('Public/Ulas', [
            'kantin' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    }

    /**
     * Simpan ulasan publik dari pelanggan ke database.
     * Otomatis menetapkan source = 'qr' dan reviewed_at = sekarang.
     */
    public function publicStore(Request $request, User $user, GeminiService $gemini): RedirectResponse
    {
        // Proteksi Honeypot anti-spam bot
        if ($request->filled('hp_token') || $request->filled('website')) {
            return redirect()->back()->with('error', 'Permintaan tidak valid.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:5', 'max:1000'],
            'menu_item' => ['nullable', 'string', 'max:100'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'device_id' => ['nullable', 'string', 'max:100'],
        ], [
            'content.required' => 'Mohon tuliskan ulasan Anda.',
            'content.min' => 'Ulasan minimal 5 karakter agar bermakna.',
            'content.max' => 'Ulasan maksimal 1000 karakter.',
            'receipt_number.max' => 'Nomor struk / ID pesanan maksimal 50 karakter.',
            'photo.image' => 'File bukti harus berupa gambar (JPG, PNG, WebP).',
            'photo.max' => 'Ukuran foto maksimal 5 MB.',
        ]);

        $deviceId = $validated['device_id'] ?? null;
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();
        $receiptNumber = ! empty($validated['receipt_number']) ? trim($validated['receipt_number']) : null;

        // 1. Validasi Duplikasi Nomor Struk / ID Pesanan (1 struk hanya untuk 1 ulasan di kantin ini)
        if ($receiptNumber) {
            $duplicateReceipt = Review::where('user_id', $user->id)
                ->where('receipt_number', $receiptNumber)
                ->exists();

            if ($duplicateReceipt) {
                return redirect()->back()
                    ->withErrors(['receipt_number' => 'Nomor struk / ID pesanan ini sudah pernah digunakan untuk ulasan sebelumnya.'])
                    ->withInput();
            }
        }

        // 2. Batasi Per Agen / Device (Cooldown 15 menit agar tidak bisa spam penilaian berulang-ulang)
        $recentReview = Review::where('user_id', $user->id)
            ->where(function ($q) use ($deviceId, $ipAddress) {
                if (! empty($deviceId)) {
                    $q->where('device_id', $deviceId);
                }
                if (! empty($ipAddress)) {
                    $q->orWhere('ip_address', $ipAddress);
                }
            })
            ->where('created_at', '>=', now('Asia/Jakarta')->subMinutes(15))
            ->first();

        if ($recentReview) {
            return redirect()->back()
                ->withErrors(['device_id' => 'Perangkat Anda baru saja mengirimkan ulasan untuk kantin ini. Mohon tunggu beberapa saat sebelum mengirim ulasan baru.'])
                ->withInput();
        }

        // 3. Simpan foto jika diunggah
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('reviews', 'public');
        }

        // 4. Memanggil AI untuk deteksi sentimen ulasan
        $sentiment = $gemini->analyzeSentiment($validated['content']);
        $now = now('Asia/Jakarta');

        Review::create([
            'user_id' => $user->id,
            'content' => $validated['content'],
            'menu_item' => $validated['menu_item'] ?? null,
            'receipt_number' => $receiptNumber,
            'photo_path' => $photoPath,
            'device_id' => $deviceId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'source' => 'qr',
            'reviewed_at' => $now,
            'review_date' => $now->toDateString(),
            'sentiment' => $sentiment,
            'original_sentiment' => $sentiment,
            'is_edited_by_user' => false,
        ]);

        return redirect()->back()->with('success', 'Terima kasih banyak! Ulasan Anda berhasil dikirim dan diverifikasi.');
    }

    /**
     * Tampilkan daftar ulasan dengan fitur filter, pencarian, dan status analisis.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $query = Review::where('user_id', $userId);

        if ($request->filled('sentiment')) {
            if ($request->sentiment === 'Belum Dianalisis') {
                $query->where(function ($q) {
                    $q->whereNull('sentiment')
                        ->orWhere('sentiment', 'Belum Dianalisis');
                });
            } else {
                $query->where('sentiment', $request->sentiment);
            }
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhere('menu_item', 'like', "%{$search}%");
            });
        }

        $reviews = $query->orderByRaw('COALESCE(reviewed_at, created_at) DESC')
            ->paginate(10)
            ->withQueryString();

        // Hitung statistik untuk badge & tab filter
        $baseQuery = Review::where('user_id', $userId);
        $stats = [
            'total' => (clone $baseQuery)->count(),
            'positif' => (clone $baseQuery)->where('sentiment', 'Positif')->count(),
            'netral' => (clone $baseQuery)->where('sentiment', 'Netral')->count(),
            'negatif' => (clone $baseQuery)->where('sentiment', 'Negatif')->count(),
            'unanalyzed' => (clone $baseQuery)->where(function ($q) {
                $q->whereNull('sentiment')
                    ->orWhere('sentiment', 'Belum Dianalisis');
            })->count(),
        ];

        return Inertia::render('ulasan/index', [
            'reviews' => $reviews,
            'filters' => [
                'sentiment' => $request->sentiment ?? '',
                'source' => $request->source ?? '',
                'search' => $request->search ?? '',
            ],
            'sourceOptions' => Review::SOURCE_LABELS,
            'stats' => $stats,
        ]);
    }

    /**
     * Tampilkan form tambah ulasan manual oleh pemilik kantin.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Menghasilkan URL absolut sesuai domain aktif saat ini (lokal, IP, atau Ngrok)
        $publicUrl = route('kantin.ulas', ['user' => $user->id]);

        return Inertia::render('ulasan/create', [
            'kantin' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
            'publicUrl' => $publicUrl,
        ]);
    }

    /**
     * Simpan ulasan baru manual dari pemilik kantin ke database.
     */
    public function store(Request $request, GeminiService $gemini): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'min:5', 'max:1000'],
            'source' => ['nullable', 'string', 'max:50'],
            'menu_item' => ['nullable', 'string', 'max:100'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
            'reviewed_at' => ['required', 'date', 'before_or_equal:today'],
        ], [
            'content.required' => 'Isi ulasan wajib diisi.',
            'content.min' => 'Ulasan minimal 5 karakter.',
            'content.max' => 'Ulasan maksimal 1000 karakter.',
            'receipt_number.max' => 'Nomor struk maksimal 50 karakter.',
            'reviewed_at.required' => 'Tanggal ulasan wajib diisi.',
            'reviewed_at.before_or_equal' => 'Tanggal ulasan tidak boleh di masa depan.',
        ]);

        $receiptNumber = ! empty($validated['receipt_number']) ? trim($validated['receipt_number']) : null;
        if ($receiptNumber) {
            $duplicateReceipt = Review::where('user_id', $request->user()->id)
                ->where('receipt_number', $receiptNumber)
                ->exists();

            if ($duplicateReceipt) {
                return redirect()->back()
                    ->withErrors(['receipt_number' => 'Nomor struk / ID pesanan ini sudah pernah dicatat sebelumnya.'])
                    ->withInput();
            }
        }

        $reviewedAt = Carbon::parse($validated['reviewed_at'], 'Asia/Jakarta')->setTimeFrom(now('Asia/Jakarta'));

        // Memanggil AI untuk deteksi sentimen
        $sentiment = $gemini->analyzeSentiment($validated['content']);

        Review::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'source' => $validated['source'] ?? 'qr',
            'menu_item' => $validated['menu_item'] ?: null,
            'receipt_number' => $receiptNumber,
            'reviewed_at' => $reviewedAt,
            'review_date' => $reviewedAt->toDateString(),
            'sentiment' => $sentiment,
            'original_sentiment' => $sentiment,
            'is_edited_by_user' => false,
        ]);

        return redirect()->route('ulasan.index')->with('success', 'Ulasan berhasil ditambahkan dan dianalisis.');
    }

    /**
     * Perbarui ulasan yang ada (fitur Edit ulasan & sentimen).
     */
    public function update(Request $request, Review $review, GeminiService $gemini): RedirectResponse
    {
        Gate::authorize('update', $review);

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:5', 'max:1000'],
            'source' => ['nullable', 'string', 'max:50'],
            'menu_item' => ['nullable', 'string', 'max:100'],
            'reviewed_at' => ['nullable', 'date', 'before_or_equal:today'],
            'sentiment' => ['required', 'string', 'in:Positif,Netral,Negatif,Belum Dianalisis'],
            'reanalyze' => ['nullable', 'boolean'],
        ], [
            'content.required' => 'Isi ulasan wajib diisi.',
            'content.min' => 'Ulasan minimal 5 karakter.',
            'sentiment.required' => 'Pilihan sentimen wajib diisi.',
            'reviewed_at.before_or_equal' => 'Tanggal ulasan tidak boleh di masa depan.',
        ]);

        $reviewedAt = ! empty($validated['reviewed_at'])
            ? Carbon::parse($validated['reviewed_at'], 'Asia/Jakarta')->setTimeFrom(now('Asia/Jakarta'))
            : $review->reviewed_at;

        // Jika dicentang/diminta analisis ulang dengan AI
        if ($request->boolean('reanalyze')) {
            $newSentiment = $gemini->analyzeSentiment($validated['content']);
            $review->update([
                'content' => $validated['content'],
                'source' => $validated['source'] ?: $review->source,
                'menu_item' => $validated['menu_item'] ?: null,
                'reviewed_at' => $reviewedAt,
                'review_date' => $reviewedAt ? $reviewedAt->toDateString() : $review->review_date,
                'sentiment' => $newSentiment,
                'original_sentiment' => $newSentiment,
                'is_edited_by_user' => false,
            ]);

            return redirect()->back()->with('success', "Ulasan diperbarui dan berhasil dianalisis ulang AI: {$newSentiment}");
        }

        // Cek apakah sentimen diubah secara manual dari sentimen asli AI
        $isEditedByUser = $review->is_edited_by_user;
        if (! empty($review->original_sentiment) && $validated['sentiment'] !== $review->original_sentiment) {
            $isEditedByUser = true;
        }

        $review->update([
            'content' => $validated['content'],
            'source' => $validated['source'] ?: $review->source,
            'menu_item' => $validated['menu_item'] ?: null,
            'reviewed_at' => $reviewedAt,
            'review_date' => $reviewedAt ? $reviewedAt->toDateString() : $review->review_date,
            'sentiment' => $validated['sentiment'],
            'is_edited_by_user' => $isEditedByUser,
        ]);

        return redirect()->back()->with('success', 'Ulasan berhasil diperbarui.');
    }

    /**
     * Hapus ulasan dari database.
     */
    public function destroy(Request $request, Review $review): RedirectResponse
    {
        Gate::authorize('delete', $review);

        $review->delete();

        return redirect()->back()->with('success', 'Ulasan berhasil dihapus.');
    }

    /**
     * Analisis satu ulasan tertentu menggunakan AI Gemini.
     */
    public function analyze(Request $request, Review $review, GeminiService $gemini): RedirectResponse
    {
        Gate::authorize('analyze', $review);

        $sentiment = $gemini->analyzeSentiment($review->content);

        $review->update([
            'sentiment' => $sentiment,
            'original_sentiment' => $sentiment,
            'is_edited_by_user' => false,
        ]);

        return redirect()->back()->with('success', "Ulasan berhasil dianalisis AI! Sentimen: {$sentiment}");
    }

    /**
     * Analisis semua ulasan yang belum dianalisis milik pengguna aktif.
     */
    public function analyzeAll(Request $request, GeminiService $gemini): RedirectResponse
    {
        $unanalyzedReviews = Review::where('user_id', $request->user()->id)
            ->where(function ($q) {
                $q->whereNull('sentiment')
                    ->orWhere('sentiment', 'Belum Dianalisis');
            })
            ->get();

        if ($unanalyzedReviews->isEmpty()) {
            return redirect()->back()->with('info', 'Semua ulasan sudah selesai dianalisis.');
        }

        $count = 0;
        foreach ($unanalyzedReviews as $review) {
            $sentiment = $gemini->analyzeSentiment($review->content);
            $review->update([
                'sentiment' => $sentiment,
                'original_sentiment' => $sentiment,
                'is_edited_by_user' => false,
            ]);
            $count++;
        }

        return redirect()->back()->with('success', "Berhasil menganalisis {$count} ulasan dengan AI Gemini!");
    }
}
