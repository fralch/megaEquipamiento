<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'slug',
        'descripcion',
        'img',
        'video',
        'id_seccion',
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

    // Definir los campos que deben ser convertidos a arrays
    protected $casts = [
        'img' => 'array', // Convertir a array para múltiples imágenes
    ];

    // Eager loading por defecto para optimizar consultas
    // protected $with = ['subcategorias']; // Removed for debugging

    // Configurar incrementing timestamps
    const UPDATED_AT = 'updated_at';

    const CREATED_AT = 'created_at';

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

    // Relación many-to-one con secciones (una categoría pertenece a una sola sección)
    public function seccion()
    {
        return $this->belongsTo(Seccion::class, 'id_seccion');
    }

    protected static function booted()
    {
        static::creating(function ($categoria) {
            if (empty($categoria->slug) && !empty($categoria->nombre)) {
                $categoria->slug = static::generateUniqueSlug($categoria->nombre);
            }
        });

        static::updating(function ($categoria) {
            if ($categoria->isDirty('nombre') && empty($categoria->slug)) {
                $categoria->slug = static::generateUniqueSlug($categoria->nombre, $categoria->id_categoria);
            }
        });
    }

    /**
     * Genera un slug único para la categoría.
     */
    public static function generateUniqueSlug(string $nombre, $excludeId = null): string
    {
        $baseSlug = Str::slug($nombre);
        if (empty($baseSlug)) {
            $baseSlug = 'categoria';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (static::where('slug', $slug)
            ->when($excludeId, fn ($q) => $q->where('id_categoria', '!=', $excludeId))
            ->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Genera el slug SEO de la categoría (ej: "alcoholimetro").
     */
    public function getSeoSlug(): string
    {
        if (!empty($this->slug)) {
            return $this->slug;
        }

        $slug = Str::slug($this->nombre);
        if (empty($slug)) {
            return 'categoria-'.$this->id_categoria;
        }

        return $slug;
    }

    /**
     * URL pública SEO de la categoría.
     */
    public function getSeoUrl(): string
    {
        return '/categorias/'.$this->getSeoSlug();
    }
}
