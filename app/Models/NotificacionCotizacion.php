<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificacionCotizacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones_cotizacion';
    protected $primaryKey = 'id';

    protected $fillable = [
        'cotizacion_id',
        'usuario_id',
        'tipo',
        'dias_vencimiento',
        'nivel_urgencia',
        'visualizado',
        'fecha_visualizado',
        'mensaje',
    ];

    protected $casts = [
        'visualizado' => 'boolean',
        'fecha_visualizado' => 'datetime',
        'dias_vencimiento' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Cotizacion
     */
    public function cotizacion()
    {
        return $this->belongsTo(Cotizacion::class, 'cotizacion_id', 'id');
    }

    /**
     * Relación con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Scope para notificaciones no visualizadas
     */
    public function scopeNoVisualizadas($query)
    {
        return $query->where('visualizado', false);
    }

    /**
     * Scope para notificaciones por usuario
     */
    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    /**
     * Scope para notificaciones por nivel de urgencia
     */
    public function scopePorUrgencia($query, $urgencia)
    {
        return $query->where('nivel_urgencia', $urgencia);
    }

    /**
     * Marcar como visualizado
     */
    public function marcarComoVisualizado()
    {
        $this->update([
            'visualizado' => true,
            'fecha_visualizado' => now(),
        ]);
    }

    /**
     * Genera el mensaje de notificación
     */
    public function generarMensaje()
    {
        $mensaje = "La cotización {$this->cotizacion->numero} ";

        if ($this->tipo === 'vencida') {
            $mensaje .= "ha vencido hace {$this->dias_vencimiento} día(s)";
        } else {
            $mensaje .= "vencerá en {$this->dias_vencimiento} día(s)";
        }

        return $mensaje;
    }
}
