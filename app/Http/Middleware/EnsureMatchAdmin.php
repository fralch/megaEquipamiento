<?php

namespace App\Http\Middleware;

use App\Models\Match\MatchAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMatchAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof MatchAdmin) {
            return response()->json(['message' => 'No tienes permisos para administrar Match.'], 403);
        }

        if (! $user->is_active) {
            optional($user->currentAccessToken())->delete();

            return response()->json(['message' => 'El administrador Match esta inactivo.'], 403);
        }

        return $next($request);
    }
}
