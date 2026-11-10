<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;

    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        // Mengambil API Key dari file .env (melalui config/services.php)
        $this->apiKey = config('services.gemini.key');
    }

    /**
     * Fungsi untuk menganalisis sentimen dari sebuah ulasan.
     * Mengembalikan salah satu dari: 'Positif', 'Netral', atau 'Negatif'.
     */
    public function analyzeSentiment(string $reviewContent): string
    {
        // Jika API Key belum diatur, gunakan analisis fallback kata kunci
        if (empty($this->apiKey)) {
            Log::warning('GEMINI_API_KEY belum diatur di file .env, menggunakan fallback lokal.');

            return $this->fallbackSentiment($reviewContent);
        }

        // Prompt yang spesifik agar AI hanya merespons sentimen ulasan
        $prompt = "Tugasmu adalah menganalisis sentimen dari ulasan restoran/kantin berikut. Jawablah HANYA dengan SATU KATA yang paling tepat: 'Positif', 'Netral', atau 'Negatif'. Ulasan: \"".$reviewContent.'"';

        try {
            // Gunakan model gemini-flash-latest yang aktif di Google Generative AI
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->post("{$this->baseUrl}/gemini-flash-latest:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'maxOutputTokens' => 500,
                    ],
                ]);

            if ($response->successful()) {
                $rawText = (string) $response->json('candidates.0.content.parts.0.text');

                if (preg_match('/\b(positif|positive)\b/i', $rawText)) {
                    return 'Positif';
                }
                if (preg_match('/\b(negatif|negative)\b/i', $rawText)) {
                    return 'Negatif';
                }
                if (preg_match('/\b(netral|neutral)\b/i', $rawText)) {
                    return 'Netral';
                }

                $clean = ucfirst(strtolower(trim(preg_replace('/[^a-zA-Z]/', '', $rawText))));
                if (in_array($clean, ['Positif', 'Netral', 'Negatif'])) {
                    return $clean;
                }

                return 'Netral';
            }

            Log::error('Gemini API Error: '.$response->body());
        } catch (\Exception $e) {
            Log::error('Gemini API Exception: '.$e->getMessage());
        }

        // Jika API gagal atau timeout, gunakan fallback lokal berbasis kata kunci
        return $this->fallbackSentiment($reviewContent);
    }

    /**
     * Fallback analisis sentimen berbasis kata kunci bahasa Indonesia
     */
    public function fallbackSentiment(string $content): string
    {
        $text = strtolower($content);

        $negScore = 0;
        $posScore = 0;

        // Frasa negatif dengan kata negasi (e.g. "ngga enak", "tidak ramah", "terlalu pedas")
        $negationPhrases = [
            'ga enak', 'gak enak', 'tidak enak', 'ngga enak', 'nggak enak', 'kurang enak', 'tak enak',
            'kurang sedap', 'kurang rasa', 'kurang pedas', 'terlalu pedas', 'terlalu asin', 'terlalu manis', 'keasinan',
            'ga ramah', 'gak ramah', 'tidak ramah', 'ngga ramah', 'nggak ramah', 'kurang ramah',
            'ga bersih', 'gak bersih', 'tidak bersih', 'ngga bersih', 'nggak bersih', 'kurang bersih',
            'ga cepat', 'gak cepat', 'tidak cepat', 'ngga cepat', 'nggak cepat',
            'ga higienis', 'gak higienis', 'tidak higienis',
        ];

        foreach ($negationPhrases as $phrase) {
            if (str_contains($text, $phrase)) {
                $negScore += 2;
                $text = str_replace($phrase, '', $text);
            }
        }

        $negativeWords = [
            'buruk', 'jelek', 'kecewa', 'lama', 'lambat', 'kotor', 'mahal', 'asin',
            'hambar', 'basi', 'dingin', 'bau', 'jorok', 'kasar', 'sedikit', 'pelit',
            'anyep', 'kurang', 'parah', 'amis', 'jutek', 'bangsat', 'anjing', 'antri',
            'antre', 'kecewa', 'kapok', 'benci', 'salah pesanan',
        ];

        foreach ($negativeWords as $word) {
            if (str_contains($text, $word)) {
                $negScore++;
            }
        }

        $positiveWords = [
            'enak', 'lezat', 'mantap', 'mantul', 'nikmat', 'puas', 'suka', 'bagus',
            'ramah', 'cepat', 'segar', 'bersih', 'murah', 'rekomendasi', 'juara',
            'jos', 'josjis', 'gurih', 'nagih', 'top', 'istimewa', 'pol', 'banyak',
        ];

        foreach ($positiveWords as $word) {
            if (str_contains($text, $word)) {
                $posScore++;
            }
        }

        if ($posScore > $negScore) {
            return 'Positif';
        }

        if ($negScore > $posScore) {
            return 'Negatif';
        }

        if ($posScore > 0 && $posScore === $negScore) {
            return 'Netral';
        }

        return 'Netral';
    }
}
