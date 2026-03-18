<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Verificar si el usuario tiene rol y si es 'admin'
        if (!$user || !$user->rol || strtolower($user->rol->nombre_rol) !== 'admin') {
            // Si es una petición JSON/Inertia, responder con error
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No tienes permisos de administrador.'], 403);
            }
            
            // Si es una petición normal, abortar con 403
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        return $next($request);
    }
}
