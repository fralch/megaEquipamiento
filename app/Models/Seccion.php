<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seccion extends Model
{
    use HasFactory;

    protected $table = 'secciones';

    protected $primaryKey = 'id_seccion';

    public $incrementing = true;

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'imagen',
        'activo',
        'orden',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    /**
     * Categorías que pertenecen a esta sección (jerarquía: Sección → Categorías → Subcategorías → Productos).
     */
    public function categorias()
    {
        return $this->hasMany(Categoria::class, 'id_seccion');
    }

    /**
     * Obtiene TODOS los productos de la sección (heredados de sus categorías vía subcategorías).
     */
    public function getAllProductos()
    {
        return Producto::whereHas('subcategoria.categoria', function ($q) {
            $q->where('id_seccion', $this->id_seccion);
        });
    }

    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden')->orderBy('nombre');
    }
}
