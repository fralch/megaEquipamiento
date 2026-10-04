<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use Illuminate\Http\JsonResponse;

class SliderPublicController extends Controller
{
    /**
     * Lista pública de slides activos, ordenados.
     * Consumida por resources/js/Components/home/Slider.jsx
     */
    public function index(): JsonResponse
    {
        $slides = Slider::activo()
            ->ordenado()
            ->get()
            ->map(function (Slider $slide) {
                return [
                    'id_slider' => $slide->id_slider,
                    'tipo' => $slide->tipo,
                    'titulo' => $slide->titulo,
                    'subtitulo' => $slide->subtitulo,
                    'subtitulo_2' => $slide->subtitulo_2,
                    'subtitulo_pie' => $slide->subtitulo_pie,
                    'texto_boton' => $slide->texto_boton ?: 'Ver más',
                    'url_boton' => $slide->boton_url,
                    'imagen' => $slide->imagen,
                    'imagen_url' => $slide->imagen_url,
                    'video_youtube_id' => $slide->video_youtube_id,
                    'video_thumbnail' => $slide->video_thumbnail,
                    'orden' => $slide->orden,
                ];
            })
            ->values();

        return response()->json($slides);
    }
}
