<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\Response;

class GenerarNotificacionesCotizaciones
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ejecutar el comando de generación de notificaciones
        // Se ejecuta de forma silenciosa en segundo plano
        try {
            Artisan::call('cotizaciones:generar-notificaciones');
        } catch (\Exception $e) {
            // Si falla, no bloqueamos el acceso al CRM
            // Solo registramos el error en los logs
            \Log::error('Error al generar notificaciones de cotizaciones: ' . $e->getMessage());
        }

        return $next($request);
    }
}
