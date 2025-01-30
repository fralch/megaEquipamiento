<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetallePedido extends Model
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'detalles_pedidos';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_detalle_pedido';

    // Indicar que la clave primaria no es un entero incremental
    public $incrementing = false;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'id_pedido',
        'id_producto',
        'cantidad',
        'precio',
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

    // Definir la relación con el modelo Pedido
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'id_pedido');
    }

    // Definir la relación con el modelo Producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }
}
