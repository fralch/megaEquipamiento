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

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'seccion_producto', 'seccion_id', 'producto_id');
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'seccion_categoria', 'seccion_id', 'categoria_id');
    }

    public function subcategorias()
    {
        return $this->belongsToMany(Subcategoria::class, 'seccion_subcategoria', 'seccion_id', 'subcategoria_id');
    }

    public function marcas()
    {
        return $this->belongsToMany(Marca::class, 'seccion_marca', 'seccion_id', 'marca_id');
    }

    /**
     * Obtiene TODOS los productos de la sección (manuales + automáticos por categoría/subcategoría/marca).
     */
    public function getAllProductos()
    {
        $manualIds = $this->productos()->pluck('productos.id_producto');

        $categoriaIds = $this->categorias()->pluck('categorias.id_categoria');
        $subcategoriaIdsFromCats = Subcategoria::whereIn('id_categoria', $categoriaIds)->pluck('id_subcategoria');

        $subcategoriaIds = $this->subcategorias()->pluck('subcategorias.id_subcategoria');
        $allSubcategoriaIds = $subcategoriaIdsFromCats->merge($subcategoriaIds)->unique();

        $marcaIds = $this->marcas()->pluck('marcas.id_marca');

        $productoIds = Producto::whereIn('id_subcategoria', $allSubcategoriaIds)
            ->orWhereIn('marca_id', $marcaIds)
            ->pluck('id_producto')
            ->merge($manualIds)
            ->unique();

        return Producto::whereIn('id_producto', $productoIds);
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
