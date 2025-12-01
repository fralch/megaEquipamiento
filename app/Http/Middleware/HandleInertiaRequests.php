<?php

namespace App\Http\Middleware;

use App\Models\Cotizacion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $usuario = $request->user();
        $notificationStats = [
            'warningCount' => 0,
            'dangerCount' => 0,
            'totalCount' => 0
        ];

        if ($usuario) {
            $now = Carbon::now();
            $userId = $usuario->id_usuario ?? $usuario->id;

            $baseQuery = Cotizacion::query();
            if ($usuario->nombre_usuario !== 'Admin') {
                $baseQuery->where('usuario_id', $userId);
            }

            // Warning: Vencimiento entre 3 y 4 días atrás
            $warningDateStart = $now->copy()->subDays(4)->startOfDay();
            $warningDateEnd = $now->copy()->subDays(3)->endOfDay();
            
            // Danger: Vencimiento hace 5 días o más
            $dangerDateEnd = $now->copy()->subDays(5)->endOfDay();

            $warningCount = (clone $baseQuery)
                ->whereBetween('fecha_vencimiento', [$warningDateStart, $warningDateEnd])
                ->count();

            $dangerCount = (clone $baseQuery)
                ->where('fecha_vencimiento', '<=', $dangerDateEnd)
                ->count();

            $notificationStats = [
                'warningCount' => $warningCount,
                'dangerCount' => $dangerCount,
                'totalCount' => $warningCount + $dangerCount
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('rol') : null,
            ],
            'notificationStats' => $notificationStats,
        ];
    }
}
