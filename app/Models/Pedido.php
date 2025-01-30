<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'pedidos';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_pedido';

    // Indicar que la clave primaria no es un entero incremental
    public $incrementing = false;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'id_usuario',
        'monto_total',
        'fecha_pedido',
        'estado',
    ];

    // Definir los campos que deben ser ocultados en arrays
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Definir los campos que deben ser convertidos a fechas
    protected $dates = [
        'fecha_pedido',
        'created_at',
        'updated_at',
    ];

    // Definir la relación con el modelo Usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
