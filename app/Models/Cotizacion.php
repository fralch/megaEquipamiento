<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cotizacion extends Model
{
    use HasFactory;

    protected $table = 'cotizaciones';
    protected $primaryKey = 'id';

    protected $fillable = [
        'numero',
        'fecha_cotizacion',
        'fecha_vencimiento',
        'entrega',
        'lugar_entrega',
        'garantia',
        'forma_pago',
        'cliente_id',
        'cliente_tipo', // 'particular' o 'empresa'
        'usuario_id',
        'miempresa_id',
        'moneda',
        'tipo_cambio',
        'total_monto_productos',
        'total_adicionales_monto',
        'total',
        'estado', // 'pendiente', 'enviada', 'aprobada', 'rechazada', 'negociacion'
        'notas',
    ];

    protected $casts = [
        'fecha_cotizacion' => 'date',
        'fecha_vencimiento' => 'date',
        'tipo_cambio' => 'decimal:3',
        'total_monto_productos' => 'decimal:2',
        'total_adicionales_monto' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'dias_vencimiento',
        'nivel_urgencia',
        'necesita_notificacion',
    ];

    /**
     * Boot method para generar número de cotización
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cotizacion) {
            if (!$cotizacion->numero) {
                $cotizacion->numero = self::generarNumeroCotizacion($cotizacion);
            }
        });
    }

    /**
     * Genera un número de cotización único
     */
    private static function generarNumeroCotizacion($cotizacion)
    {
        // Obtener la empresa emisora
        $miEmpresa = NuestraEmpresa::find($cotizacion->miempresa_id);
        
        if ($miEmpresa) {
            $prefix = $miEmpresa->codigo_cotizacion ?: 'COT';
            $nextNumber = ($miEmpresa->contador_cotizacion ?: 0) + 1;
            
            // Determinar el año: usar configuración de empresa si existe, sino año de fecha cotización
            if ($miEmpresa->anio_cotizacion) {
                $year = $miEmpresa->anio_cotizacion;
            } else {
                $date = $cotizacion->fecha_cotizacion 
                    ? \Carbon\Carbon::parse($cotizacion->fecha_cotizacion) 
                    : now();
                $year = $date->format('Y');
            }
            
            // Actualizar el contador de la empresa
            $miEmpresa->contador_cotizacion = $nextNumber;
            $miEmpresa->save();
            
            // Formato: PREFIJO-NUMERO(8 digitos)-AÑO
            // Ejemplo: EIIL-00000123-2025
            return sprintf('%s-%08d-%s', $prefix, $nextNumber, $year);
        }
        
        // Fallback si no hay empresa o configuración (comportamiento anterior)
        $date = $cotizacion->fecha_cotizacion 
            ? \Carbon\Carbon::parse($cotizacion->fecha_cotizacion) 
            : now();
        $year = $date->format('Y');

        $lastCotizacion = self::where('numero', 'like', "COT-{$year}-%")
            ->orderBy('numero', 'desc')
            ->first();

        if ($lastCotizacion) {
            // Extraer el número secuencial del último número
            preg_match('/COT-\d{4}-(\d+)/', $lastCotizacion->numero, $matches);
            $lastNumber = isset($matches[1]) ? intval($matches[1]) : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('COT-%s-%03d', $year, $newNumber);
    }

    /**
     * Relación con el modelo Usuario (vendedor)
     */
    public function vendedor()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación polimórfica con Cliente (particular o empresa)
     */
    public function cliente()
    {
        // Dependiendo del tipo, retorna la relación correcta
        if ($this->cliente_tipo === 'empresa') {
            return $this->belongsTo(EmpresaCliente::class, 'cliente_id', 'id');
        } else {
            return $this->belongsTo(Cliente::class, 'cliente_id', 'id');
        }
    }

    /**
     * Relación con EmpresaCliente (cuando cliente_tipo es 'empresa')
     */
    public function empresaCliente()
    {
        return $this->belongsTo(EmpresaCliente::class, 'cliente_id', 'id');
    }

    /**
     * Relación con Cliente particular (cuando cliente_tipo es 'particular')
     */
    public function clienteParticular()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id');
    }

    /**
     * Relación con NuestraEmpresa
     */
    public function miEmpresa()
    {
        return $this->belongsTo(NuestraEmpresa::class, 'miempresa_id', 'id');
    }

    /**
     * Relación con DetalleCotizacion (productos regulares y temporales)
     */
    public function detallesProductos()
    {
        return $this->hasMany(DetalleCotizacion::class, 'cotizacion_id', 'id')
            ->whereIn('tipo', ['producto', 'temporal']);
    }

    /**
     * Relación con DetalleCotizacion (productos adicionales)
     */
    public function detallesAdicionales()
    {
        return $this->hasMany(DetalleCotizacion::class, 'cotizacion_id', 'id')
            ->where('tipo', 'adicional');
    }

    /**
     * Relación con todos los detalles
     */
    public function detalles()
    {
        return $this->hasMany(DetalleCotizacion::class, 'cotizacion_id', 'id');
    }

    /**
     * Relación con NotificacionCotizacion
     */
    public function notificaciones()
    {
        return $this->hasMany(NotificacionCotizacion::class, 'cotizacion_id', 'id');
    }

    /**
     * Relación con DetalleCotizacion (solo productos temporales)
     */
    public function detallesTemporales()
    {
        return $this->hasMany(DetalleCotizacion::class, 'cotizacion_id', 'id')
            ->where('tipo', 'temporal');
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para filtrar por vendedor
     */
    public function scopePorVendedor($query, $vendedorId)
    {
        return $query->where('usuario_id', $vendedorId);
    }

    /**
     * Scope para cotizaciones vigentes (no vencidas)
     */
    public function scopeVigentes($query)
    {
        return $query->where('fecha_vencimiento', '>=', now());
    }

    /**
     * Scope para cotizaciones vencidas
     */
    public function scopeVencidas($query)
    {
        return $query->where('fecha_vencimiento', '<', now());
    }

    /**
     * Calcula los días de vencimiento (negativo si aún no vence, positivo si ya venció)
     */
    public function getDiasVencimientoAttribute()
    {
        if (!$this->fecha_vencimiento) {
            return null;
        }

        $fechaVencimiento = \Carbon\Carbon::parse($this->fecha_vencimiento);
        $hoy = \Carbon\Carbon::now();

        // Retorna días positivos si ya venció, negativos si aún no vence
        return $hoy->diffInDays($fechaVencimiento, false) * -1;
    }

    /**
     * Determina el nivel de urgencia de la notificación
     * null: no vencida o recién vencida (menos de 3 días)
     * 'warning': vencida hace 3-4 días
     * 'danger': vencida hace 5 o más días
     */
    public function getNivelUrgenciaAttribute()
    {
        $diasVencimiento = $this->dias_vencimiento;

        if ($diasVencimiento === null || $diasVencimiento < 3) {
            return null;
        } elseif ($diasVencimiento >= 3 && $diasVencimiento < 5) {
            return 'warning';
        } else {
            return 'danger';
        }
    }

    /**
     * Verifica si la cotización necesita notificación
     */
    public function getNecesitaNotificacionAttribute()
    {
        return $this->nivel_urgencia !== null;
    }

    /**
     * Accessor para obtener el nombre del cliente
     */
    public function getClienteNombreAttribute()
    {
        if ($this->cliente_tipo === 'empresa' && $this->empresaCliente) {
            return $this->empresaCliente->razon_social;
        } elseif ($this->cliente_tipo === 'particular' && $this->clienteParticular) {
            return $this->clienteParticular->nombrecompleto;
        }
        return 'Sin cliente';
    }

    /**
     * Accessor para obtener el contacto del cliente
     */
    public function getClienteContactoAttribute()
    {
        if ($this->cliente_tipo === 'empresa' && $this->empresaCliente) {
            return $this->empresaCliente->contacto_principal;
        } elseif ($this->cliente_tipo === 'particular' && $this->clienteParticular) {
            return $this->clienteParticular->nombrecompleto;
        }
        return '';
    }

    /**
     * Accessor para obtener el email del cliente
     */
    public function getClienteEmailAttribute()
    {
        if ($this->cliente_tipo === 'empresa' && $this->empresaCliente) {
            return $this->empresaCliente->email;
        } elseif ($this->cliente_tipo === 'particular' && $this->clienteParticular) {
            return $this->clienteParticular->email;
        }
        return '';
    }

    /**
     * Accessor para obtener el teléfono del cliente
     */
    public function getClienteTelefonoAttribute()
    {
        if ($this->cliente_tipo === 'empresa' && $this->empresaCliente) {
            return $this->empresaCliente->telefono;
        } elseif ($this->cliente_tipo === 'particular' && $this->clienteParticular) {
            return $this->clienteParticular->telefono;
        }
        return '';
    }

    /**
     * Recalcular totales basándose en los detalles
     */
    public function recalcularTotales()
    {
        $this->total_monto_productos = $this->detallesProductos->sum('subtotal');
        $this->total_adicionales_monto = $this->detallesAdicionales->sum('subtotal');
        $this->total = $this->total_monto_productos + $this->total_adicionales_monto;
        $this->save();
    }
}
