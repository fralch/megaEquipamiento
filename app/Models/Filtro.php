<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filtro extends Model
{
    protected $table = 'filtros';
    protected $primaryKey = 'id_filtro';
    
    protected $fillable = [
        'nombre',
        'slug',
        'tipo_input',
        'unidad',
        'descripcion',
        'orden',
        'activo',
        'obligatorio',
        'max_value',
        'min_value'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'obligatorio' => 'boolean'
    ];

    public function opciones()
    {
        return $this->hasMany(OpcionFiltro::class, 'id_filtro');
    }

    public function subcategorias()
    {
        return $this->belongsToMany(Subcategoria::class, 'subcategoria_filtros', 'id_filtro', 'id_subcategoria')
                    ->withPivot('orden', 'activo')
                    ->withTimestamps();
    }
}