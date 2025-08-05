<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;

class Producto extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    // Definir la tabla asociada al modelo si no sigue la convención de nombres de Laravel
    protected $table = 'productos';

    // Definir la clave primaria si no es 'id'
    protected $primaryKey = 'id_producto';

    // Indicar que la clave primaria no es un entero incremental
    public $incrementing = true; // Cambiado a true porque 'id_producto' es autoincremental

    // Definir los campos que se pueden asignar en masa
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
        'archivos_adicionales', // Cambiado de 'documentos' a 'archivos_adicionales'
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
        'caracteristicas' => 'array',
        'imagen' => 'array', // Convertir a array para múltiples imágenes
        'archivos_adicionales' => 'array', // Cambiado de 'documentos' a 'archivos_adicionales'
    ];

    // Definir la relación con el modelo Subcategoria
    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class, 'id_subcategoria');
    }

    // Definir la relación con el modelo Marca
    public function marca()
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }
    
     // Relación de muchos a muchos con atributos adicionales
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

     // Métodos auxiliares para mantener compatibilidad con código existente
     
     /**
      * Obtener la primera imagen (para compatibilidad con código existente)
      */
     public function getPrimeraImagenAttribute()
     {
         return is_array($this->imagen) && count($this->imagen) > 0 ? $this->imagen[0] : null;
     }

     /**
      * Obtener todas las imágenes
      */
     public function getImagenesAttribute()
     {
         return is_array($this->imagen) ? $this->imagen : ($this->imagen ? [$this->imagen] : []);
     }

     /**
      * Agregar una nueva imagen al array
      */
     public function agregarImagen($nuevaImagen)
     {
         $imagenes = $this->imagenes;
         $imagenes[] = $nuevaImagen;
         $this->imagen = $imagenes;
         return $this;
     }

     /**
      * Eliminar una imagen del array por índice
      */
     public function eliminarImagen($indice)
     {
         $imagenes = $this->imagenes;
         if (isset($imagenes[$indice])) {
             unset($imagenes[$indice]);
             $this->imagen = array_values($imagenes); // Reindexar el array
         }
         return $this;
     }

     /**
      * Configurar las colecciones de media
      */
     public function registerMediaCollections(): void
     {
         $this->addMediaCollection('imagenes')
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
             ->singleFile(false);

         $this->addMediaCollection('imagen_principal')
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
             ->singleFile();

         $this->addMediaCollection('documentos')
             ->acceptsMimeTypes(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
             ->singleFile(false);

         $this->addMediaCollection('videos')
             ->acceptsMimeTypes(['video/mp4', 'video/avi', 'video/mov', 'video/wmv'])
             ->singleFile(false);
     }

     /**
      * Obtener todas las imágenes usando Media Library
      */
     public function getImagenesMediaAttribute()
     {
         return $this->getMedia('imagenes');
     }

     /**
      * Obtener la imagen principal usando Media Library
      */
     public function getImagenPrincipalMediaAttribute()
     {
         return $this->getFirstMedia('imagen_principal');
     }

     /**
      * Obtener todos los documentos usando Media Library
      */
     public function getDocumentosMediaAttribute()
     {
         return $this->getMedia('documentos');
     }

     /**
      * Obtener todos los videos usando Media Library
      */
     public function getVideosMediaAttribute()
     {
         return $this->getMedia('videos');
     }

     /**
      * Agregar imagen desde el banco de imágenes
      */
     public function agregarImagenDesdeBanco($mediaId, $coleccion = 'imagenes')
     {
         $media = \App\Models\Media::find($mediaId);
         if ($media) {
             // Copiar el archivo del banco de imágenes a este producto
             $this->addMediaFromUrl($media->getUrl())
                 ->toMediaCollection($coleccion);
         }
         return $this;
     }
}
