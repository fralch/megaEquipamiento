<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpcionFiltro extends Model
{
    protected $table = 'opciones_filtros';
    protected $primaryKey = 'id_opcion';
    
    protected $fillable = [
        'id_filtro',
        'valor',
        'etiqueta',
        'color',
        'orden',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    public function filtro()
    {
        return $this->belongsTo(Filtro::class, 'id_filtro');
    }
}