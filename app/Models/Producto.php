<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Producto extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'sku',
        'nombre',
        'id_subcategoria',
        'marca_id',
        'pais',
        'precio_sin_ganancia',
        'precio_ganancia',
        'precio_igv',
        'imagen',
        'descripcion',
        'video',
        'envio',
        'soporte_tecnico',
        'caracteristicas',
        'especificaciones_tecnicas',
        'archivos_adicionales',
    ];

    // 👇 Antes ocultabas las fechas. Ya NO las ocultamos.
    protected $hidden = [
        // 'created_at',
        // 'updated_at',
    ];

    // ✅ Casts para que created_at y updated_at salgan como string ISO 8601
    protected $casts = [
        'caracteristicas' => 'array',
        'imagen' => 'array',
        'archivos_adicionales' => 'array',
        'created_at' => 'datetime:Y-m-d\TH:i:sP',
        'updated_at' => 'datetime:Y-m-d\TH:i:sP',
    ];

    // Eager loading por defecto para optimizar consultas
    protected $with = ['marca', 'subcategoria'];

    // Relaciones
    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class, 'id_subcategoria');
    }

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    public function productosRelacionados()
    {
        return $this->belongsToMany(Producto::class, 'producto_relaciones', 'producto_id', 'relacionado_id')
            ->withPivot('tipo')
            ->withTimestamps();
    }

    public function relacionadosComo()
    {
        return $this->belongsToMany(Producto::class, 'producto_relaciones', 'relacionado_id', 'producto_id')
            ->withPivot('tipo')
            ->withTimestamps();
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'producto_tag', 'id_producto', 'id_tag')->withTimestamps();
    }

    // Helpers de imágenes
    public function getPrimeraImagenAttribute()
    {
        return is_array($this->imagen) && count($this->imagen) > 0 ? $this->imagen[0] : null;
    }

    public function getImagenesAttribute()
    {
        return is_array($this->imagen) ? $this->imagen : ($this->imagen ? [$this->imagen] : []);
    }

    public function agregarImagen($nuevaImagen)
    {
        $imagenes = $this->imagenes;
        $imagenes[] = $nuevaImagen;
        $this->imagen = $imagenes;
        return $this;
    }

    public function eliminarImagen($indice)
    {
        $imagenes = $this->imagenes;
        if (isset($imagenes[$indice])) {
            unset($imagenes[$indice]);
            $this->imagen = array_values($imagenes);
        }
        return $this;
    }

    // Configuración de Media Library
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('imagenes')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
            ->singleFile(false);

        $this->addMediaCollection('imagen_principal')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
            ->singleFile();

        $this->addMediaCollection('documentos')
            ->acceptsMimeTypes([
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ])
            ->singleFile(false);

        $this->addMediaCollection('videos')
            ->acceptsMimeTypes(['video/mp4', 'video/avi', 'video/mov', 'video/wmv'])
            ->singleFile(false);
    }

    public function getImagenesMediaAttribute()
    {
        return $this->getMedia('imagenes');
    }

    public function getImagenPrincipalMediaAttribute()
    {
        return $this->getFirstMedia('imagen_principal');
    }

    public function getDocumentosMediaAttribute()
    {
        return $this->getMedia('documentos');
    }

    public function getVideosMediaAttribute()
    {
        return $this->getMedia('videos');
    }

    public function agregarImagenDesdeBanco($mediaId, $coleccion = 'imagenes')
    {
        $media = \App\Models\Media::find($mediaId);
        if ($media) {
            $this->addMediaFromUrl($media->getUrl())->toMediaCollection($coleccion);
        }
        return $this;
    }
}
