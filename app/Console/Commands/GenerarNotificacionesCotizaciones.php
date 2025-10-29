<?php

namespace App\Console\Commands;

use App\Models\Cotizacion;
use App\Models\NotificacionCotizacion;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerarNotificacionesCotizaciones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cotizaciones:generar-notificaciones';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera o actualiza notificaciones para cotizaciones vencidas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generando notificaciones de cotizaciones vencidas...');

        // Obtener todas las cotizaciones vencidas
        $cotizacionesVencidas = Cotizacion::where('fecha_vencimiento', '<', Carbon::now())
            ->whereIn('estado', ['pendiente', 'enviada', 'negociacion'])
            ->with(['notificaciones', 'vendedor'])
            ->get();

        $notificacionesCreadas = 0;
        $notificacionesActualizadas = 0;

        foreach ($cotizacionesVencidas as $cotizacion) {
            $diasVencimiento = $cotizacion->dias_vencimiento;

            // Solo crear notificaciones si ha pasado al menos 3 días
            if ($diasVencimiento < 3) {
                continue;
            }

            // Determinar nivel de urgencia
            if ($diasVencimiento >= 3 && $diasVencimiento < 5) {
                $nivelUrgencia = 'warning';
            } elseif ($diasVencimiento >= 5) {
                $nivelUrgencia = 'danger';
            } else {
                $nivelUrgencia = 'info';
            }

            // Verificar si ya existe una notificación para esta cotización
            $notificacionExistente = NotificacionCotizacion::where('cotizacion_id', $cotizacion->id)
                ->where('usuario_id', $cotizacion->usuario_id)
                ->first();

            $mensaje = "La cotización {$cotizacion->numero} ha vencido hace {$diasVencimiento} día(s)";

            if ($notificacionExistente) {
                // Actualizar la notificación existente si no ha sido visualizada
                if (!$notificacionExistente->visualizado) {
                    $notificacionExistente->update([
                        'dias_vencimiento' => $diasVencimiento,
                        'nivel_urgencia' => $nivelUrgencia,
                        'mensaje' => $mensaje,
                    ]);
                    $notificacionesActualizadas++;
                }
            } else {
                // Crear nueva notificación
                NotificacionCotizacion::create([
                    'cotizacion_id' => $cotizacion->id,
                    'usuario_id' => $cotizacion->usuario_id,
                    'tipo' => 'vencida',
                    'dias_vencimiento' => $diasVencimiento,
                    'nivel_urgencia' => $nivelUrgencia,
                    'mensaje' => $mensaje,
                    'visualizado' => false,
                ]);
                $notificacionesCreadas++;
            }
        }

        $this->info("Proceso completado:");
        $this->info("- Notificaciones creadas: {$notificacionesCreadas}");
        $this->info("- Notificaciones actualizadas: {$notificacionesActualizadas}");

        return Command::SUCCESS;
    }
}
