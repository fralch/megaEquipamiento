<?php

namespace Database\Seeders;

use App\Models\Slider;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    /**
     * Puebla la tabla sliders con los 3 slides que estaban hardcodeados
     * en resources/js/Components/home/Slider.jsx (versión previa).
     *
     * Idempotente: si ya existen slides activos, no hace nada.
     */
    public function run(): void
    {
        if (Slider::query()->exists()) {
            $this->command->info('SliderSeeder: ya existen slides, se omite.');

            return;
        }

        $whatsapp = 'https://wa.me/51999999999';

        $slides = [
            [
                'tipo' => 'video',
                'titulo' => 'Líder en Ventas de',
                'subtitulo' => 'Equipos de',
                'subtitulo_2' => 'Laboratorio',
                'subtitulo_pie' => 'En todas las regiones del Perú',
                'texto_boton' => 'Ver más',
                'url_boton' => $whatsapp,
                'imagen' => null,
                'video_youtube_id' => 'F8pMhuLK7nE',
                'orden' => 1,
                'activo' => true,
            ],
            [
                'tipo' => 'imagen',
                'titulo' => 'Líder en Ventas de',
                'subtitulo' => 'Equipos de',
                'subtitulo_2' => 'Laboratorio',
                'subtitulo_pie' => 'En todas las regiones del Perú',
                'texto_boton' => 'Ver más',
                'url_boton' => $whatsapp,
                'imagen' => 'img/slider-img1.webp',
                'video_youtube_id' => null,
                'orden' => 2,
                'activo' => true,
            ],
            [
                'tipo' => 'imagen',
                'titulo' => 'Líder en Ventas de',
                'subtitulo' => 'Equipos de',
                'subtitulo_2' => 'Laboratorio',
                'subtitulo_pie' => 'En todas las regiones del Perú',
                'texto_boton' => 'Ver más',
                'url_boton' => $whatsapp,
                'imagen' => 'img/slider-img2.webp',
                'video_youtube_id' => null,
                'orden' => 3,
                'activo' => true,
            ],
        ];

        foreach ($slides as $data) {
            Slider::create($data);
        }

        $this->command->info('SliderSeeder: '.count($slides).' slides creados.');
    }
}
