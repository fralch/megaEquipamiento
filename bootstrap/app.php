<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Configurar TrustProxies para detectar correctamente HTTPS detrás de proxies
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SeoMiddleware::class,
        ]);

        // Registrar alias de middleware personalizado
        $middleware->alias([
            'generar.notificaciones.cotizaciones' => \App\Http\Middleware\GenerarNotificacionesCotizaciones::class,
            'role.admin' => \App\Http\Middleware\CheckAdminRole::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Ejecutar el comando de notificaciones cada hora
        $schedule->command('cotizaciones:generar-notificaciones')
                 ->hourly()
                 ->withoutOverlapping()
                 ->runInBackground();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
