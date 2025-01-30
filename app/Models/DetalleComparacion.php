<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleComparacion extends Model
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'detalles_comparaciones';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_detalle_comparacion';

    // Indicar que la clave primaria no es un entero incremental
    public $incrementing = false;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'id_comparacion',
        'id_producto',
        'notas',
    ];

    // Definir los campos que deben ser ocultados en arrays
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Definir los campos que deben ser convertidos a fechas
    protected $dates = [
        'created_at',
        'updated_at',
    ];

    // Definir la relación con el modelo ComparacionProducto
    public function comparacion()
    {
        return $this->belongsTo(ComparacionProducto::class, 'id_comparacion');
    }

    // Definir la relación con el modelo Producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }
}
