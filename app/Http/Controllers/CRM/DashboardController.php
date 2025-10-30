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
            $isAdmin = $usuario && $usuario->nombre_usuario === 'Admin';

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
            $isAdmin = $usuario && $usuario->nombre_usuario === 'Admin';

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

            return response()->json([
                'success' => true,
                'data' => [
                    'ventas_por_mes' => $ventasPorMes,
                    'cotizaciones_por_estado' => $cotizacionesPorEstado,
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
