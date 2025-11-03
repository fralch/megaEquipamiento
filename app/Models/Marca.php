<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marca extends Model
{
    use HasFactory;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'marcas';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_marca';

    // Indicar que la clave primaria no es un entero incremental
    public $incrementing = false;

    // Definir los campos que se pueden asignar en masa
    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen',
        'video_url',
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

    // Añadir atributo calculado para la URL completa de la imagen
    protected $appends = [
        'imagen_url',
    ];

    // Relación many-to-many con categorías
    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'marca_categoria', 'marca_id', 'categoria_id');
    }

    // Relación one-to-many con productos
    public function productos()
    {
        return $this->hasMany(Producto::class, 'marca_id', 'id_marca');
    }

    // Accesor para obtener la URL completa de la imagen sin afectar el valor bruto
    public function getImagenUrlAttribute()
    {
        $value = $this->attributes['imagen'] ?? null;
        if (!$value) {
            return null;
        }

        // Si ya es una URL absoluta
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // Normalizar sin barra inicial
        $path = ltrim($value, '/');

        // Si el valor proviene de storage (antiguo formato 'marcas/...'), apuntar a 'storage/marcas/...'
        if (str_starts_with($path, 'marcas/')) {
            return asset('storage/' . $path);
        }

        // Para rutas en 'img/marcas/...'
        return asset($path);
    }
}
