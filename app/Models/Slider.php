<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    use HasFactory;

    protected $table = 'sliders';

    protected $primaryKey = 'id_slider';

    public $incrementing = true;

    protected $fillable = [
        'tipo',
        'titulo',
        'subtitulo',
        'subtitulo_2',
        'subtitulo_pie',
        'texto_boton',
        'url_boton',
        'imagen',
        'video_youtube_id',
        'orden',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    /**
     * URL absoluta del botón. Si no hay url_boton, devuelve null.
     */
    public function getBotonUrlAttribute(): ?string
    {
        return $this->url_boton ?: null;
    }

    /**
     * URL absoluta de la imagen (para usar en el frontend público).
     */
    public function getImagenUrlAttribute(): ?string
    {
        if (! $this->imagen) {
            return null;
        }

        return asset($this->imagen);
    }

    /**
     * Thumbnail de YouTube estándar (maxresdefault -> hqdefault fallback).
     */
    public function getVideoThumbnailAttribute(): ?string
    {
        if (! $this->video_youtube_id) {
            return null;
        }

        return "https://i.ytimg.com/vi/{$this->video_youtube_id}/hqdefault.jpg";
    }

    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden')->orderBy('id_slider');
    }
}
