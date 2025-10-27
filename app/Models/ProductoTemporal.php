<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoTemporal extends Model
{
    protected $table = 'productos_temporales';

    protected $fillable = [
        'titulo',
        'marca_id',
        'descripcion',
        'especificaciones_tecnicas',
        'procedencia',
        'imagenes',
        'precio',
    ];

    protected $casts = [
        'especificaciones_tecnicas' => 'array',
        'imagenes' => 'array',
        'precio' => 'decimal:2',
    ];

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class, 'marca_id', 'id_marca');
    }
}
