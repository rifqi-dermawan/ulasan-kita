<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Carbon::setLocale('id');

        if (! $this->app->runningInConsole()) {
            if (request()->header('x-forwarded-proto') === 'https' || request()->isSecure()) {
                URL::forceScheme('https');
            }
        }

        // Rate limiter anti-spam ulasan publik: maksimal 5 ulasan per jam per perangkat/IP
        RateLimiter::for('public-reviews', function (Request $request) {
            $key = $request->input('device_id') ?: $request->ip();

            return Limit::perHour(5)->by($key)->response(function () {
                return redirect()->back()->with('error', 'Terlalu banyak penilaian yang dikirim dari perangkat Anda. Silakan coba kembali beberapa saat lagi.');
            });
        });
    }
}
