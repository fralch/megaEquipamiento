<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubcategoriaFiltro extends Model
{
    protected $table = 'subcategoria_filtros';
    
    protected $fillable = [
        'id_subcategoria',
        'id_filtro',
        'orden',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class, 'id_subcategoria');
    }

    public function filtro()
    {
        return $this->belongsTo(Filtro::class, 'id_filtro');
    }
}