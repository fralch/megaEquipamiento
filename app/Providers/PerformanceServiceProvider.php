<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;

class PerformanceServiceProvider extends ServiceProvider
{
    public function boot()
    {
        if (app()->environment('production')) {
            // Desactivar query log en producción para mejor rendimiento
            DB::connection()->disableQueryLog();
        }

        // Compartir datos comunes globalmente para evitar consultas repetidas
        View::composer('*', function ($view) {
            // Solo en desarrollo, puedes agregar métricas de rendimiento aquí
            if (app()->environment('local') && config('app.debug')) {
                $view->with('performance_info', [
                    'memory_usage' => memory_get_usage(true),
                    'peak_memory' => memory_get_peak_usage(true),
                ]);
            }
        });
    }

    public function register()
    {
        // Configuraciones de rendimiento
        if (app()->environment('production')) {
            config(['app.debug' => false]);
            config(['app.log_level' => 'warning']);
        }
    }
}