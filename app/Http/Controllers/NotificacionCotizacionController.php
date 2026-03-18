<?php

namespace App\Http\Controllers;

use App\Models\NotificacionCotizacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;

class NotificacionCotizacionController extends Controller
{
    /**
     * Helper para regenerar notificaciones
     */
    private function regenerarNotificaciones()
    {
        try {
            Artisan::call('cotizaciones:generar-notificaciones');
        } catch (\Exception $e) {
            \Log::error('Error al generar notificaciones: ' . $e->getMessage());
        }
    }

    /**
     * Obtener todas las notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $this->regenerarNotificaciones();
        $usuarioId = Auth::id();

        $query = NotificacionCotizacion::with(['cotizacion.clienteParticular', 'cotizacion.empresaCliente'])
            ->porUsuario($usuarioId)
            ->orderBy('created_at', 'desc');

        // Filtrar por estado de visualización si se especifica
        if ($request->has('visualizado')) {
            $visualizado = filter_var($request->visualizado, FILTER_VALIDATE_BOOLEAN);
            if (!$visualizado) {
                $query->noVisualizadas();
            } else {
                $query->where('visualizado', true);
            }
        }

        // Filtrar por nivel de urgencia
        if ($request->has('urgencia')) {
            $query->porUrgencia($request->urgencia);
        }

        $notificaciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $notificaciones,
            'total' => $notificaciones->count(),
            'no_visualizadas' => NotificacionCotizacion::porUsuario($usuarioId)
                ->noVisualizadas()
                ->count(),
        ]);
    }

    /**
     * Marcar una notificación como visualizada
     */
    public function marcarComoVisualizada($id)
    {
        $usuarioId = Auth::id();

        $notificacion = NotificacionCotizacion::where('id', $id)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $notificacion->marcarComoVisualizado();

        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como visualizada',
            'data' => $notificacion->fresh(),
        ]);
    }

    /**
     * Marcar todas las notificaciones como visualizadas
     */
    public function marcarTodasComoVisualizadas()
    {
        $usuarioId = Auth::id();

        $updated = NotificacionCotizacion::porUsuario($usuarioId)
            ->noVisualizadas()
            ->update([
                'visualizado' => true,
                'fecha_visualizado' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones han sido marcadas como visualizadas',
            'updated' => $updated,
        ]);
    }

    /**
     * Obtener el conteo de notificaciones no visualizadas
     */
    public function conteoNoVisualizadas()
    {
        $usuarioId = Auth::id();

        $count = NotificacionCotizacion::porUsuario($usuarioId)
            ->noVisualizadas()
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    /**
     * Eliminar una notificación
     */
    public function destroy($id)
    {
        $usuarioId = Auth::id();

        $notificacion = NotificacionCotizacion::where('id', $id)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $notificacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificación eliminada correctamente',
        ]);
    }

    /**
     * Obtener notificaciones agrupadas por nivel de urgencia
     */
    public function porUrgencia()
    {
        $this->regenerarNotificaciones();
        $usuarioId = Auth::id();

        $notificaciones = [
            'danger' => NotificacionCotizacion::porUsuario($usuarioId)
                ->noVisualizadas()
                ->porUrgencia('danger')
                ->with(['cotizacion.clienteParticular', 'cotizacion.empresaCliente'])
                ->get(),
            'warning' => NotificacionCotizacion::porUsuario($usuarioId)
                ->noVisualizadas()
                ->porUrgencia('warning')
                ->with(['cotizacion.clienteParticular', 'cotizacion.empresaCliente'])
                ->get(),
            'info' => NotificacionCotizacion::porUsuario($usuarioId)
                ->noVisualizadas()
                ->porUrgencia('info')
                ->with(['cotizacion.clienteParticular', 'cotizacion.empresaCliente'])
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $notificaciones,
            'totales' => [
                'danger' => $notificaciones['danger']->count(),
                'warning' => $notificaciones['warning']->count(),
                'info' => $notificaciones['info']->count(),
            ],
        ]);
    }
}
