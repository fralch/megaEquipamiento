<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'categorias';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_categoria';

    // Indicar que la clave primaria es un entero incremental
    public $incrementing = true;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'nombre',
        'descripcion',
        'img',
        'video',
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

    // En el modelo Categoria.php
    public function subcategorias()
    {
        return $this->hasMany(Subcategoria::class, 'id_categoria');
    }

    // Relación many-to-many con marcas
    public function marcas()
    {
        return $this->belongsToMany(Marca::class, 'marca_categoria', 'categoria_id', 'marca_id');
    }
}
