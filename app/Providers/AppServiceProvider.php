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
        
        // Force HTTPS based on environment configuration
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
