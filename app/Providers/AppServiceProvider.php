<?php

namespace App\Providers;

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


    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Force HTTPS en producción o cuando la request viene por HTTPS
        if (app()->environment('production') || request()->secure()) {
            URL::forceScheme('https');
        }

        // Detectar HTTPS detrás de proxies (CloudFlare, Load Balancers, etc.)
        if (request()->header('X-Forwarded-Proto') === 'https' ||
            request()->header('CloudFront-Forwarded-Proto') === 'https') {
            URL::forceScheme('https');
        }
    }
}
