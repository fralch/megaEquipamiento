<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class BancoImagenesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un producto temporal para usar Media Library
        $productoTemporal = Producto::create([
            'sku' => 'TEMP-BANCO-IMAGENES',
            'nombre' => 'Producto Temporal para Banco de Imágenes',
            'id_subcategoria' => 1, // Asume que existe al menos una subcategoría
            'marca_id' => 1, // Asume que existe al menos una marca
            'pais' => 'Perú',
            'precio_sin_ganancia' => 0,
            'precio_ganancia' => 0,
            'precio_igv' => 0,
            'descripcion' => 'Producto temporal para poblar banco de imágenes',
            'envio' => 'No',
            'soporte_tecnico' => 'No'
        ]);

        // Crear algunas imágenes de ejemplo en el banco
        $imagenesEjemplo = [
            [
                'nombre' => 'Logo Empresa',
                'coleccion' => 'banco_imagenes',
                'contenido' => $this->crearImagenSVG('Logo', '#3B82F6')
            ],
            [
                'nombre' => 'Banner Principal',
                'coleccion' => 'banco_imagenes',
                'contenido' => $this->crearImagenSVG('Banner', '#10B981')
            ],
            [
                'nombre' => 'Icono Producto',
                'coleccion' => 'iconos',
                'contenido' => $this->crearImagenSVG('Icono', '#F59E0B')
            ],
            [
                'nombre' => 'Imagen Categoría',
                'coleccion' => 'categorias',
                'contenido' => $this->crearImagenSVG('Categoría', '#EF4444')
            ],
            [
                'nombre' => 'Placeholder Producto',
                'coleccion' => 'productos',
                'contenido' => $this->crearImagenSVG('Producto', '#8B5CF6')
            ]
        ];

        foreach ($imagenesEjemplo as $imagen) {
            // Crear archivo temporal
            $nombreArchivo = str_replace(' ', '_', strtolower($imagen['nombre'])) . '.svg';
            $rutaTemporal = storage_path('app/temp/' . $nombreArchivo);
            
            // Crear directorio si no existe
            if (!file_exists(dirname($rutaTemporal))) {
                mkdir(dirname($rutaTemporal), 0755, true);
            }
            
            // Escribir contenido SVG
            file_put_contents($rutaTemporal, $imagen['contenido']);
            
            // Agregar al banco de imágenes
            $productoTemporal->addMedia($rutaTemporal)
                ->usingName($imagen['nombre'])
                ->usingFileName($nombreArchivo)
                ->toMediaCollection($imagen['coleccion']);
            
            // Limpiar archivo temporal si aún existe
            if (file_exists($rutaTemporal)) {
                unlink($rutaTemporal);
            }
        }

        // No eliminamos el producto temporal para mantener las imágenes
        // Las imágenes quedan disponibles en el banco independientemente del modelo

        $this->command->info('Banco de imágenes poblado con ' . count($imagenesEjemplo) . ' imágenes de ejemplo.');
    }

    /**
     * Crear una imagen SVG de ejemplo
     */
    private function crearImagenSVG($texto, $color = '#3B82F6')
    {
        return '<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="' . $color . '" rx="8"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">' . $texto . '</text>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white" opacity="0.8">Imagen de ejemplo</text>
</svg>';
    }
}