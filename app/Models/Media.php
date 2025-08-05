<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Media extends BaseMedia
{
    use HasFactory;

    /**
     * Obtener todas las imágenes del banco de imágenes
     */
    public static function getBancoImagenes()
    {
        return static::where('collection_name', 'banco_imagenes')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Obtener imágenes por tipo MIME
     */
    public static function getImagenesPorTipo($mimeType = 'image')
    {
        return static::where('mime_type', 'like', $mimeType . '%')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Buscar imágenes por nombre
     */
    public static function buscarImagenes($termino)
    {
        return static::where('name', 'like', '%' . $termino . '%')
            ->orWhere('file_name', 'like', '%' . $termino . '%')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Obtener URL completa de la imagen
     */
    public function getUrlAttribute()
    {
        return $this->getUrl();
    }

    /**
     * Obtener tamaño formateado
     */
    public function getTamanoFormateadoAttribute()
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}