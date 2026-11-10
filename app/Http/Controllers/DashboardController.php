<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman dashboard dengan data asli ulasan milik pengguna.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        // Ambil data ulasan riil milik user yang login
        $baseQuery = Review::where('user_id', $userId);
        $totalReviews = (clone $baseQuery)->count();

        $positifCount = (clone $baseQuery)->where('sentiment', 'Positif')->count();
        $netralCount = (clone $baseQuery)->where('sentiment', 'Netral')->count();
        $negatifCount = (clone $baseQuery)->where('sentiment', 'Negatif')->count();
        $unanalyzedCount = (clone $baseQuery)->where(function ($q) {
            $q->whereNull('sentiment')->orWhere('sentiment', 'Belum Dianalisis');
        })->count();

        // Hitung persentase sentimen nyata sesuai isi ulasan
        $positifPct = $totalReviews > 0 ? (int) round(($positifCount / $totalReviews) * 100) : 0;
        $netralPct = $totalReviews > 0 ? (int) round(($netralCount / $totalReviews) * 100) : 0;
        $negatifPct = $totalReviews > 0 ? (int) round(($negatifCount / $totalReviews) * 100) : 0;

        // Data 6 Titik Tren Mingguan (5 minggu lalu s/d minggu ini)
        // Dihitung dari reviewed_at (fallback created_at) dengan zona waktu Asia/Jakarta
        Carbon::setLocale('id');
        $weeklyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $weekStart = Carbon::now('Asia/Jakarta')->subWeeks($i)->startOfWeek()->startOfDay();
            $weekEnd = Carbon::now('Asia/Jakarta')->subWeeks($i)->endOfWeek()->endOfDay();

            $wPos = Review::where('user_id', $userId)
                ->where('sentiment', 'Positif')
                ->whereRaw('COALESCE(reviewed_at, created_at) BETWEEN ? AND ?', [
                    $weekStart->toDateTimeString(),
                    $weekEnd->toDateTimeString(),
                ])
                ->count();

            $wNet = Review::where('user_id', $userId)
                ->where('sentiment', 'Netral')
                ->whereRaw('COALESCE(reviewed_at, created_at) BETWEEN ? AND ?', [
                    $weekStart->toDateTimeString(),
                    $weekEnd->toDateTimeString(),
                ])
                ->count();

            $wNeg = Review::where('user_id', $userId)
                ->where('sentiment', 'Negatif')
                ->whereRaw('COALESCE(reviewed_at, created_at) BETWEEN ? AND ?', [
                    $weekStart->toDateTimeString(),
                    $weekEnd->toDateTimeString(),
                ])
                ->count();

            $label = match ($i) {
                0 => 'Minggu Ini',
                1 => 'Mgg Lalu',
                default => $weekStart->translatedFormat('d M'),
            };

            $range = $weekStart->format('m') === $weekEnd->format('m')
                ? $weekStart->format('d').'–'.$weekEnd->translatedFormat('d M')
                : $weekStart->translatedFormat('d M').'–'.$weekEnd->translatedFormat('d M');

            $weeklyTrend[] = [
                'label' => $label,
                'range' => $range,
                'is_current' => $i === 0,
                'positif' => $wPos,
                'netral' => $wNet,
                'negatif' => $wNeg,
                'total' => $wPos + $wNet + $wNeg,
            ];
        }

        // 3 Keluhan Teratas yang nyata dari ulasan negatif / keluhan di database
        $topComplaints = [];

        // 1. Cek dari kolom complaint_topic jika sudah tersimpan
        $topicsFromDb = Review::where('user_id', $userId)
            ->whereNotNull('complaint_topic')
            ->where('complaint_topic', '!=', '')
            ->selectRaw('complaint_topic as title, count(*) as count')
            ->groupBy('complaint_topic')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->toArray();

        if (! empty($topicsFromDb)) {
            $topComplaints = $topicsFromDb;
        } else {
            // 2. Ekstrak dari ulasan negatif / masukan pelanggan yang ada
            $negReviews = Review::where('user_id', $userId)
                ->where('sentiment', 'Negatif')
                ->latest('created_at')
                ->get();

            $topicPatterns = [
                'Waktu tunggu / antrean lama' => ['lama', 'lambat', 'antri', 'antre', 'menunggu', 'waktu'],
                'Kualitas / rasa makanan' => ['asin', 'hambar', 'basi', 'dingin', 'anyep', 'kurang rasa', 'tidak enak', 'keasinan', 'pedas', 'sambal', 'sambel', 'ngga enak', 'nggak enak', 'ga enak', 'gak enak', 'rasa'],
                'Kebersihan meja & alat makan' => ['kotor', 'jorok', 'bau', 'meja', 'lalat', 'tisu', 'alat makan'],
                'Pelayanan kasir / staf' => ['kasir', 'pelayanan', 'jutek', 'kasar', 'salah pesanan', 'ramah', 'staf'],
                'Porsi / harga makanan' => ['mahal', 'sedikit', 'pelit', 'porsi', 'harga', 'kemahalan'],
            ];

            $topicCounts = [];
            foreach ($negReviews as $rev) {
                $text = strtolower($rev->content.' '.($rev->menu_item ?? ''));
                $matched = false;
                foreach ($topicPatterns as $topicName => $keywords) {
                    foreach ($keywords as $kw) {
                        if (str_contains($text, $kw)) {
                            $topicCounts[$topicName] = ($topicCounts[$topicName] ?? 0) + 1;
                            $matched = true;
                            break;
                        }
                    }
                }

                if (! $matched) {
                    if (! empty($rev->menu_item)) {
                        $itemTopic = 'Masukan menu: '.$rev->menu_item;
                        $topicCounts[$itemTopic] = ($topicCounts[$itemTopic] ?? 0) + 1;
                    } else {
                        $topicCounts['Kualitas / rasa hidangan'] = ($topicCounts['Kualitas / rasa hidangan'] ?? 0) + 1;
                    }
                }
            }

            arsort($topicCounts);
            foreach (array_slice($topicCounts, 0, 3, true) as $title => $count) {
                $topComplaints[] = [
                    'title' => $title,
                    'count' => $count,
                ];
            }
        }

        // Teks rentang tanggal dinamis
        $start = Carbon::now('Asia/Jakarta')->startOfWeek()->translatedFormat('d M');
        $end = Carbon::now('Asia/Jakarta')->endOfWeek()->translatedFormat('d M Y');
        $dateRangeText = "Minggu Ini ({$start} – {$end})";

        return Inertia::render('dashboard/Index', [
            'totalReviews' => $totalReviews,
            'stats' => [
                'positif' => $positifCount,
                'positifPercentage' => $positifPct,
                'netral' => $netralCount,
                'netralPercentage' => $netralPct,
                'negatif' => $negatifCount,
                'negatifPercentage' => $negatifPct,
                'unanalyzed' => $unanalyzedCount,
            ],
            'weeklyTrend' => $weeklyTrend,
            'topComplaints' => $topComplaints,
            'dateRangeText' => $dateRangeText,
        ]);
    }
}
