<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleCotizacion extends Model
{
    use HasFactory;

    protected $table = 'detalles_cotizacion';
    protected $primaryKey = 'id';

    protected $fillable = [
        'cotizacion_id',
        'producto_id',
        'producto_temporal_id',
        'tipo', // 'producto' o 'adicional'
        'nombre',
        'descripcion',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot method para calcular subtotal automáticamente
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($detalle) {
            $detalle->subtotal = $detalle->cantidad * $detalle->precio_unitario;
        });
    }

    /**
     * Relación con Cotizacion
     */
    public function cotizacion()
    {
        return $this->belongsTo(Cotizacion::class, 'cotizacion_id', 'id');
    }

    /**
     * Relación con Producto (solo para productos del catálogo)
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    /**
     * Relación con ProductoTemporal
     */
    public function productoTemporal()
    {
        return $this->belongsTo(ProductoTemporal::class, 'producto_temporal_id', 'id');
    }

    /**
     * Scope para filtrar por tipo
     */
    public function scopeTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para productos del catálogo
     */
    public function scopeProductos($query)
    {
        return $query->where('tipo', 'producto')->whereNotNull('producto_id');
    }

    /**
     * Scope para productos adicionales (servicios, etc.)
     */
    public function scopeAdicionales($query)
    {
        return $query->where('tipo', 'adicional');
    }


}
