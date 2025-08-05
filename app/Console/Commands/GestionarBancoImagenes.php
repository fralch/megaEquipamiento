<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Media;
use App\Models\Producto;
use Illuminate\Support\Facades\Storage;

class GestionarBancoImagenes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'banco:imagenes {action} {--file=} {--name=} {--collection=banco_imagenes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gestionar el banco de imágenes desde la línea de comandos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                $this->listarImagenes();
                break;
            case 'add':
                $this->agregarImagen();
                break;
            case 'delete':
                $this->eliminarImagen();
                break;
            case 'clean':
                $this->limpiarHuerfanas();
                break;
            case 'stats':
                $this->mostrarEstadisticas();
                break;
            default:
                $this->error('Acción no válida. Usa: list, add, delete, clean, stats');
                return 1;
        }

        return 0;
    }

    /**
     * Listar todas las imágenes del banco
     */
    private function listarImagenes()
    {
        $imagenes = Media::orderBy('created_at', 'desc')->get();

        if ($imagenes->isEmpty()) {
            $this->info('No hay imágenes en el banco.');
            return;
        }

        $this->info('Imágenes en el banco:');
        $this->table(
            ['ID', 'Nombre', 'Archivo', 'Colección', 'Tipo', 'Tamaño', 'Fecha'],
            $imagenes->map(function ($imagen) {
                return [
                    $imagen->id,
                    $imagen->name,
                    $imagen->file_name,
                    $imagen->collection_name,
                    $imagen->mime_type,
                    $this->formatearTamano($imagen->size),
                    $imagen->created_at->format('Y-m-d H:i:s')
                ];
            })
        );
    }

    /**
     * Agregar una imagen al banco
     */
    private function agregarImagen()
    {
        $archivo = $this->option('file');
        $nombre = $this->option('name');
        $coleccion = $this->option('collection');

        if (!$archivo) {
            $this->error('Debes especificar un archivo con --file=ruta/al/archivo');
            return;
        }

        if (!file_exists($archivo)) {
            $this->error('El archivo no existe: ' . $archivo);
            return;
        }

        // Crear producto temporal
        $productoTemporal = new Producto();
        $productoTemporal->save();

        try {
            $media = $productoTemporal->addMedia($archivo)
                ->usingName($nombre ?: basename($archivo))
                ->toMediaCollection($coleccion);

            $this->info('Imagen agregada exitosamente:');
            $this->line('ID: ' . $media->id);
            $this->line('Nombre: ' . $media->name);
            $this->line('Archivo: ' . $media->file_name);
            $this->line('Colección: ' . $media->collection_name);
            $this->line('URL: ' . $media->getUrl());
        } catch (\Exception $e) {
            $this->error('Error al agregar la imagen: ' . $e->getMessage());
        } finally {
            // Eliminar producto temporal
            $productoTemporal->delete();
        }
    }

    /**
     * Eliminar una imagen del banco
     */
    private function eliminarImagen()
    {
        $id = $this->ask('¿Cuál es el ID de la imagen a eliminar?');

        if (!$id || !is_numeric($id)) {
            $this->error('ID no válido.');
            return;
        }

        $media = Media::find($id);

        if (!$media) {
            $this->error('Imagen no encontrada.');
            return;
        }

        $this->info('Imagen a eliminar:');
        $this->line('Nombre: ' . $media->name);
        $this->line('Archivo: ' . $media->file_name);
        $this->line('Colección: ' . $media->collection_name);

        if ($this->confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            $media->delete();
            $this->info('Imagen eliminada exitosamente.');
        } else {
            $this->info('Operación cancelada.');
        }
    }

    /**
     * Limpiar imágenes huérfanas
     */
    private function limpiarHuerfanas()
    {
        $this->info('Buscando imágenes huérfanas...');

        // Buscar media sin modelo asociado o con modelo inexistente
        $huerfanas = Media::whereDoesntHave('model')->get();

        if ($huerfanas->isEmpty()) {
            $this->info('No se encontraron imágenes huérfanas.');
            return;
        }

        $this->info('Se encontraron ' . $huerfanas->count() . ' imágenes huérfanas:');
        
        $this->table(
            ['ID', 'Nombre', 'Archivo', 'Colección'],
            $huerfanas->map(function ($imagen) {
                return [
                    $imagen->id,
                    $imagen->name,
                    $imagen->file_name,
                    $imagen->collection_name
                ];
            })
        );

        if ($this->confirm('¿Quieres eliminar todas las imágenes huérfanas?')) {
            foreach ($huerfanas as $huerfana) {
                $huerfana->delete();
            }
            $this->info('Imágenes huérfanas eliminadas exitosamente.');
        } else {
            $this->info('Operación cancelada.');
        }
    }

    /**
     * Mostrar estadísticas del banco
     */
    private function mostrarEstadisticas()
    {
        $total = Media::count();
        $imagenes = Media::where('mime_type', 'like', 'image/%')->count();
        $videos = Media::where('mime_type', 'like', 'video/%')->count();
        $documentos = Media::where('mime_type', 'like', 'application/%')->count();
        $tamanoTotal = Media::sum('size');

        // Estadísticas por colección
        $colecciones = Media::selectRaw('collection_name, COUNT(*) as total, SUM(size) as tamano')
            ->groupBy('collection_name')
            ->get();

        $this->info('=== ESTADÍSTICAS DEL BANCO DE IMÁGENES ===');
        $this->line('');
        $this->line('Total de archivos: ' . $total);
        $this->line('Imágenes: ' . $imagenes);
        $this->line('Videos: ' . $videos);
        $this->line('Documentos: ' . $documentos);
        $this->line('Tamaño total: ' . $this->formatearTamano($tamanoTotal));
        $this->line('');

        if ($colecciones->isNotEmpty()) {
            $this->info('Archivos por colección:');
            $this->table(
                ['Colección', 'Archivos', 'Tamaño'],
                $colecciones->map(function ($coleccion) {
                    return [
                        $coleccion->collection_name,
                        $coleccion->total,
                        $this->formatearTamano($coleccion->tamano)
                    ];
                })
            );
        }
    }

    /**
     * Formatear tamaño de archivo
     */
    private function formatearTamano($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}