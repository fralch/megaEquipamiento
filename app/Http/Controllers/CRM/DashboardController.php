<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\EmpresaCliente;
use App\Models\Usuario;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getEstadisticas(Request $request)
    {
        try {
            $usuario = auth()->user();
            // Cargar la relación rol para verificar si es admin
            $usuario->load('rol');
            $isAdmin = $usuario && $usuario->rol && strtolower($usuario->rol->nombre_rol) === 'admin';

            // Total de productos
            $totalProductos = Producto::count();

            // Cotizaciones activas (pendientes, enviadas, negociacion) del usuario o todas si es admin
            $cotizacionesQuery = Cotizacion::whereIn('estado', ['pendiente', 'enviada', 'negociacion']);
            if (!$isAdmin) {
                $cotizacionesQuery->where('usuario_id', $usuario->id_usuario);
            }
            $cotizacionesActivas = $cotizacionesQuery->count();

            // Ventas del mes actual (cotizaciones aprobadas)
            $inicioMes = Carbon::now()->startOfMonth();
            $finMes = Carbon::now()->endOfMonth();

            $ventasMesQuery = Cotizacion::where('estado', 'aprobada')
                ->whereBetween('fecha_cotizacion', [$inicioMes, $finMes]);

            if (!$isAdmin) {
                $ventasMesQuery->where('usuario_id', $usuario->id_usuario);
            }

            $ventasMes = $ventasMesQuery->sum('total');

            // Cotizaciones pendientes del usuario o todas si es admin
            $cotizacionesPendientesQuery = Cotizacion::where('estado', 'pendiente');
            if (!$isAdmin) {
                $cotizacionesPendientesQuery->where('usuario_id', $usuario->id_usuario);
            }
            $cotizacionesPendientes = $cotizacionesPendientesQuery->count();

            // Calcular cambios porcentuales (comparando con mes anterior)
            $inicioMesAnterior = Carbon::now()->subMonth()->startOfMonth();
            $finMesAnterior = Carbon::now()->subMonth()->endOfMonth();

            // Cambio en cotizaciones activas
            $cotizacionesActivasMesAnteriorQuery = Cotizacion::whereIn('estado', ['pendiente', 'enviada', 'negociacion'])
                ->whereBetween('created_at', [$inicioMesAnterior, $finMesAnterior]);
            if (!$isAdmin) {
                $cotizacionesActivasMesAnteriorQuery->where('usuario_id', $usuario->id_usuario);
            }
            $cotizacionesActivasMesAnterior = $cotizacionesActivasMesAnteriorQuery->count();

            $cambioCotizaciones = $cotizacionesActivasMesAnterior > 0
                ? (($cotizacionesActivas - $cotizacionesActivasMesAnterior) / $cotizacionesActivasMesAnterior) * 100
                : ($cotizacionesActivas > 0 ? 100 : 0);

            // Cambio en ventas del mes
            $ventasMesAnteriorQuery = Cotizacion::where('estado', 'aprobada')
                ->whereBetween('fecha_cotizacion', [$inicioMesAnterior, $finMesAnterior]);

            if (!$isAdmin) {
                $ventasMesAnteriorQuery->where('usuario_id', $usuario->id_usuario);
            }

            $ventasMesAnterior = $ventasMesAnteriorQuery->sum('total');

            $cambioVentas = $ventasMesAnterior > 0
                ? (($ventasMes - $ventasMesAnterior) / $ventasMesAnterior) * 100
                : ($ventasMes > 0 ? 100 : 0);

            // Cambio en pendientes
            $cotizacionesPendientesMesAnteriorQuery = Cotizacion::where('estado', 'pendiente')
                ->whereBetween('created_at', [$inicioMesAnterior, $finMesAnterior]);

            if (!$isAdmin) {
                $cotizacionesPendientesMesAnteriorQuery->where('usuario_id', $usuario->id_usuario);
            }

            $cotizacionesPendientesMesAnterior = $cotizacionesPendientesMesAnteriorQuery->count();

            $cambioPendientes = $cotizacionesPendientesMesAnterior > 0
                ? (($cotizacionesPendientes - $cotizacionesPendientesMesAnterior) / $cotizacionesPendientesMesAnterior) * 100
                : ($cotizacionesPendientes > 0 ? 100 : 0);

            // Actividad reciente (últimas acciones del usuario)
            $actividadRecienteQuery = Cotizacion::with(['vendedor:id_usuario,nombre,apellido', 'empresaCliente:id,razon_social', 'clienteParticular:id,nombrecompleto'])
                ->orderBy('created_at', 'desc')
                ->limit(5);

            if (!$isAdmin) {
                $actividadRecienteQuery->where('usuario_id', $usuario->id_usuario);
            }

            $actividadReciente = $actividadRecienteQuery->get()->map(function ($cotizacion) {
                $nombreCliente = $cotizacion->cliente_tipo === 'empresa'
                    ? ($cotizacion->empresaCliente->razon_social ?? 'N/A')
                    : ($cotizacion->clienteParticular->nombrecompleto ?? 'N/A');

                return [
                    'id' => $cotizacion->id,
                    'action' => 'Cotización ' . $cotizacion->numero . ' creada',
                    'client' => $nombreCliente,
                    'time' => $cotizacion->created_at->diffForHumans(),
                    'estado' => $cotizacion->estado,
                ];
            });

            // Cotizaciones próximas a vencer (próximas tareas)
            $tareasProximasQuery = Cotizacion::with(['empresaCliente:id,razon_social', 'clienteParticular:id,nombrecompleto'])
                ->whereIn('estado', ['pendiente', 'enviada', 'negociacion'])
                ->where('fecha_vencimiento', '>=', Carbon::now())
                ->where('fecha_vencimiento', '<=', Carbon::now()->addDays(7))
                ->orderBy('fecha_vencimiento', 'asc')
                ->limit(5);

            if (!$isAdmin) {
                $tareasProximasQuery->where('usuario_id', $usuario->id_usuario);
            }

            $tareasProximas = $tareasProximasQuery->get()->map(function ($cotizacion) {
                $nombreCliente = $cotizacion->cliente_tipo === 'empresa'
                    ? ($cotizacion->empresaCliente->razon_social ?? 'N/A')
                    : ($cotizacion->clienteParticular->nombrecompleto ?? 'N/A');

                $diasRestantes = Carbon::now()->diffInDays($cotizacion->fecha_vencimiento, false);
                $prioridad = $diasRestantes <= 1 ? 'high' : ($diasRestantes <= 3 ? 'medium' : 'low');

                $dueText = $diasRestantes == 0
                    ? 'Hoy'
                    : ($diasRestantes == 1 ? 'Mañana' : 'En ' . $diasRestantes . ' días');

                return [
                    'id' => $cotizacion->id,
                    'task' => 'Seguimiento cotización ' . $cotizacion->numero,
                    'client' => $nombreCliente,
                    'due' => $dueText,
                    'priority' => $prioridad,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_productos' => $totalProductos,
                        'cotizaciones_activas' => $cotizacionesActivas,
                        'ventas_mes' => $ventasMes,
                        'cotizaciones_pendientes' => $cotizacionesPendientes,
                        'cambio_cotizaciones' => round($cambioCotizaciones, 1),
                        'cambio_ventas' => round($cambioVentas, 1),
                        'cambio_pendientes' => round($cambioPendientes, 1),
                    ],
                    'actividad_reciente' => $actividadReciente,
                    'tareas_proximas' => $tareasProximas,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas del dashboard: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'error' => 'Error al obtener estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard chart data
     */
    public function getGraficos(Request $request)
    {
        try {
            $usuario = auth()->user();
            // Cargar la relación rol para verificar si es admin
            $usuario->load('rol');
            $isAdmin = $usuario && $usuario->rol && strtolower($usuario->rol->nombre_rol) === 'admin';

            // Ventas por mes (últimos 6 meses)
            $ventasPorMes = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes = Carbon::now()->subMonths($i);
                $inicioMes = $mes->copy()->startOfMonth();
                $finMes = $mes->copy()->endOfMonth();

                $ventasQuery = Cotizacion::where('estado', 'aprobada')
                    ->whereBetween('fecha_cotizacion', [$inicioMes, $finMes]);

                if (!$isAdmin) {
                    $ventasQuery->where('usuario_id', $usuario->id_usuario);
                }

                $total = $ventasQuery->sum('total');

                $ventasPorMes[] = [
                    'mes' => $mes->format('M Y'),
                    'total' => $total,
                ];
            }

            // Cotizaciones por estado
            $cotizacionesPorEstadoQuery = Cotizacion::select('estado', DB::raw('count(*) as total'));

            if (!$isAdmin) {
                $cotizacionesPorEstadoQuery->where('usuario_id', $usuario->id_usuario);
            }

            $cotizacionesPorEstado = $cotizacionesPorEstadoQuery
                ->groupBy('estado')
                ->get()
                ->map(function ($item) {
                    return [
                        'estado' => $item->estado,
                        'total' => $item->total,
                    ];
                });

            // --- Gráficos de evolución temporal (Diario, Semanal, Mensual) ---
            $now = Carbon::now();
            $baseQuery = Cotizacion::query();
            if (!$isAdmin) {
                $baseQuery->where('usuario_id', $usuario->id_usuario);
            }

            // 1. Diario (Últimos 7 días)
            $dailyRaw = (clone $baseQuery)
                ->where('created_at', '>=', $now->copy()->subDays(6)->startOfDay())
                ->get()
                ->groupBy(function($date) {
                    return Carbon::parse($date->created_at)->format('Y-m-d');
                });

            $dailyChart = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = $now->copy()->subDays($i)->format('Y-m-d');
                $dayData = $dailyRaw->get($date);
                $dailyChart[] = [
                    'name' => Carbon::parse($date)->locale('es')->isoFormat('dddd D'),
                    'full_date' => $date,
                    'count' => $dayData ? $dayData->count() : 0,
                    'monto' => $dayData ? $dayData->sum('total') : 0
                ];
            }

            // 2. Semanal (Últimas 4 semanas)
            $weeklyChart = [];
            for ($i = 3; $i >= 0; $i--) {
                $startOfWeek = $now->copy()->subWeeks($i)->startOfWeek();
                $endOfWeek = $now->copy()->subWeeks($i)->endOfWeek();
                
                $weekData = (clone $baseQuery)
                    ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->get();

                $weeklyChart[] = [
                    'name' => 'Sem ' . $startOfWeek->format('d/m'),
                    'range' => $startOfWeek->format('d/m') . ' - ' . $endOfWeek->format('d/m'),
                    'count' => $weekData->count(),
                    'monto' => $weekData->sum('total')
                ];
            }

            // 3. Mensual (Últimos 12 meses)
            $monthlyChart = [];
            for ($i = 11; $i >= 0; $i--) {
                $monthDate = $now->copy()->subMonths($i);
                $year = $monthDate->year;
                $month = $monthDate->month;

                $monthData = (clone $baseQuery)
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->get();

                $monthlyChart[] = [
                    'name' => $monthDate->locale('es')->isoFormat('MMM YY'),
                    'full_date' => $monthDate->format('Y-m'),
                    'count' => $monthData->count(),
                    'monto' => $monthData->sum('total')
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ventas_por_mes' => $ventasPorMes,
                    'cotizaciones_por_estado' => $cotizacionesPorEstado,
                    'evolution_charts' => [
                        'daily' => $dailyChart,
                        'weekly' => $weeklyChart,
                        'monthly' => $monthlyChart
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener gráficos del dashboard: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al obtener gráficos',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
