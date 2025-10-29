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

    /**
     * Boot method para generar número de cotización
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cotizacion) {
            if (!$cotizacion->numero) {
                $cotizacion->numero = self::generarNumeroCotizacion();
            }
        });
    }

    /**
     * Genera un número de cotización único
     */
    private static function generarNumeroCotizacion()
    {
        $year = date('Y');
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
