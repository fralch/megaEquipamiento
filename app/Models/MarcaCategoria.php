<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class MarcaCategoria extends Pivot
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'marca_categoria';

    // Indicar que no hay clave primaria incremental
    public $incrementing = false;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'marca_id',
        'categoria_id',
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

    // Definir la relación con el modelo Marca
    public function marca()
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    // Definir la relación con el modelo Categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}
