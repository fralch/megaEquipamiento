<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Inertia\Inertia;

class BancoImagenesController extends Controller
{
    /**
     * Mostrar el banco de imágenes
     */
    public function index(Request $request)
    {
        // Obtener imágenes de la carpeta public/img
        $imagenesPublic = $this->obtenerImagenesPublic();
        
        // Obtener imágenes de Media Library
        $imagenesMedia = $this->obtenerImagenesMedia();
        
        // Combinar ambas fuentes
        $todasImagenes = collect($imagenesPublic)->merge($imagenesMedia);
        
        // Aplicar filtros
        $tipoArchivo = $request->get('tipo', 'image');
        $termino = $request->get('buscar');
        $coleccion = $request->get('coleccion');
        
        $imagenesFiltradas = $todasImagenes->filter(function($imagen) use ($tipoArchivo, $termino, $coleccion) {
            // Filtro por tipo
            if ($tipoArchivo !== 'todos' && !str_starts_with($imagen['tipo'], $tipoArchivo)) {
                return false;
            }
            
            // Filtro por búsqueda
            if ($termino && !str_contains(strtolower($imagen['nombre']), strtolower($termino)) && 
                !str_contains(strtolower($imagen['archivo']), strtolower($termino))) {
                return false;
            }
            
            // Filtro por colección
            if ($coleccion && $imagen['coleccion'] !== $coleccion) {
                return false;
            }
            
            return true;
        });
        
        // Paginación manual
        $page = $request->get('page', 1);
        $perPage = 20;
        $offset = ($page - 1) * $perPage;
        
        $imagenesPaginadas = $imagenesFiltradas->slice($offset, $perPage)->values();
        
        $paginator = new LengthAwarePaginator(
            $imagenesPaginadas,
            $imagenesFiltradas->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ]
        );
        
        $paginator->appends($request->query());

        return Inertia::render('BancoImagenes/Index', [
            'imagenes' => $paginator,
            'filtros' => [
                'buscar' => $termino,
                'tipo' => $tipoArchivo,
                'coleccion' => $coleccion
            ],
            'colecciones' => $this->obtenerTodasColecciones()
        ]);
    }

    /**
     * Subir nueva imagen al banco
     */
    public function store(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:jpeg,png,gif,webp,pdf,doc,docx,mp4,avi,mov,wmv|max:10240', // 10MB max
            'nombre' => 'nullable|string|max:255',
            'coleccion' => 'nullable|string|max:100'
        ]);

        try {
            $archivo = $request->file('archivo');
            $nombre = $request->get('nombre', $archivo->getClientOriginalName());
            $coleccion = $request->get('coleccion', 'banco_imagenes');

            // Crear un modelo temporal para usar Media Library
            $modeloTemporal = new \App\Models\Producto();
            $modeloTemporal->save();

            // Subir el archivo
            $media = $modeloTemporal->addMediaFromRequest('archivo')
                ->usingName($nombre)
                ->toMediaCollection($coleccion);

            // Eliminar el modelo temporal (el archivo se mantiene)
            $modeloTemporal->delete();

            return back()->with('success', 'Archivo subido correctamente al banco de imágenes.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al subir el archivo: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar información de una imagen
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'coleccion' => 'nullable|string|max:100'
        ]);

        try {
            $media = Media::findOrFail($id);
            $media->name = $request->get('nombre');
            
            if ($request->filled('coleccion')) {
                $media->collection_name = $request->get('coleccion');
            }
            
            $media->save();

            return back()->with('success', 'Información actualizada correctamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al actualizar: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar imagen del banco
     */
    public function destroy($id)
    {
        try {
            $media = Media::findOrFail($id);
            $media->delete();

            return back()->with('success', 'Archivo eliminado correctamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar: ' . $e->getMessage());
        }
    }

    /**
     * Obtener información de una imagen específica
     */
    public function show($id)
    {
        try {
            // Verificar si es una imagen de Media Library
            if (str_starts_with($id, 'media_')) {
                $mediaId = str_replace('media_', '', $id);
                $media = Media::findOrFail($mediaId);
                
                return response()->json([
                    'id' => 'media_' . $media->id,
                    'nombre' => $media->name,
                    'archivo' => $media->file_name,
                    'url' => $media->getUrl(),
                    'tipo' => $media->mime_type,
                    'tamano_formateado' => $this->formatearTamano($media->size),
                    'coleccion' => $media->collection_name,
                    'fecha' => $media->created_at->format('Y-m-d H:i:s'),
                    'fuente' => 'media_library'
                ]);
            }
            
            // Buscar en imágenes públicas
            if (str_starts_with($id, 'public_')) {
                $imagenesPublic = $this->obtenerImagenesPublic();
                $imagen = collect($imagenesPublic)->firstWhere('id', $id);
                
                if ($imagen) {
                    return response()->json($imagen);
                }
            }
            
            return response()->json(['error' => 'Archivo no encontrado'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Archivo no encontrado'], 404);
        }
    }

    /**
     * Buscar imágenes para selector
     */
    public function buscar(Request $request)
    {
        $termino = $request->get('q', '');
        $tipo = $request->get('tipo', 'image');
        $limite = $request->get('limite', 10);

        // Obtener imágenes de ambas fuentes
        $imagenesPublic = $this->obtenerImagenesPublic();
        $imagenesMedia = $this->obtenerImagenesMedia();
        $todasImagenes = collect($imagenesPublic)->merge($imagenesMedia);

        // Aplicar filtros
        $resultados = $todasImagenes->filter(function($imagen) use ($tipo, $termino) {
            // Filtro por tipo
            if ($tipo !== 'todos' && !str_starts_with($imagen['tipo'], $tipo)) {
                return false;
            }
            
            // Filtro por búsqueda
            if (!empty($termino)) {
                $terminoLower = strtolower($termino);
                if (!str_contains(strtolower($imagen['nombre']), $terminoLower) && 
                    !str_contains(strtolower($imagen['archivo']), $terminoLower)) {
                    return false;
                }
            }
            
            return true;
        })
        ->sortByDesc('fecha')
        ->take($limite)
        ->map(function ($imagen) {
            return [
                'id' => $imagen['id'],
                'nombre' => $imagen['nombre'],
                'archivo' => $imagen['archivo'],
                'url' => $imagen['url'],
                'tipo' => $imagen['tipo'],
                'tamano' => $imagen['tamano'],
                'coleccion' => $imagen['coleccion'],
                'fuente' => $imagen['fuente']
            ];
        })
        ->values();

        return response()->json($resultados);
    }

    /**
     * Obtener imágenes de la carpeta public/img
     */
    private function obtenerImagenesPublic()
    {
        $imagenes = [];
        $rutaPublic = public_path('img');
        
        if (!is_dir($rutaPublic)) {
            return $imagenes;
        }
        
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($rutaPublic)
        );
        
        foreach ($iterator as $archivo) {
            if ($archivo->isFile()) {
                $extension = strtolower($archivo->getExtension());
                $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
                
                if (in_array($extension, $extensionesPermitidas)) {
                    $rutaRelativa = str_replace(public_path(), '', $archivo->getPathname());
                    $rutaRelativa = str_replace('\\', '/', $rutaRelativa);
                    
                    // Obtener la ruta completa de carpetas como colección
                    $rutaCarpeta = dirname($archivo->getPathname());
                    $rutaRelativaCarpeta = str_replace($rutaPublic, '', $rutaCarpeta);
                    $rutaRelativaCarpeta = trim(str_replace('\\', '/', $rutaRelativaCarpeta), '/');
                    
                    // Si está directamente en img/, usar 'general'
                    if (empty($rutaRelativaCarpeta)) {
                        $coleccion = 'general';
                    } else {
                        // Usar la ruta completa de carpetas como colección
                        $coleccion = $rutaRelativaCarpeta;
                    }
                    
                    $mimeType = $this->obtenerMimeType($extension);
                    $imagenes[] = [
                        'id' => 'public_' . md5($rutaRelativa),
                        'name' => pathinfo($archivo->getFilename(), PATHINFO_FILENAME),
                        'nombre' => pathinfo($archivo->getFilename(), PATHINFO_FILENAME),
                        'archivo' => $archivo->getFilename(),
                        'url' => asset($rutaRelativa),
                        'mime_type' => $mimeType,
                        'tipo' => $mimeType,
                        'tamano_formateado' => $this->formatearTamano($archivo->getSize()),
                        'tamano' => $this->formatearTamano($archivo->getSize()),
                        'collection_name' => $coleccion,
                        'coleccion' => $coleccion,
                        'fecha' => date('Y-m-d H:i:s', $archivo->getMTime()),
                        'fuente' => 'public',
                        'ruta_completa' => $rutaRelativa
                    ];
                }
            }
        }
        
        return $imagenes;
    }
    
    /**
     * Obtener imágenes de Media Library
     */
    private function obtenerImagenesMedia()
    {
        return Media::all()->map(function($media) {
            return [
                'id' => 'media_' . $media->id,
                'name' => $media->name,
                'nombre' => $media->name,
                'archivo' => $media->file_name,
                'url' => $media->getUrl(),
                'mime_type' => $media->mime_type,
                'tipo' => $media->mime_type,
                'tamano_formateado' => $this->formatearTamano($media->size),
                'tamano' => $this->formatearTamano($media->size),
                'collection_name' => $media->collection_name ?: 'sin_coleccion',
                'coleccion' => $media->collection_name ?: 'sin_coleccion',
                'fecha' => $media->created_at->format('Y-m-d H:i:s'),
                'fuente' => 'media_library',
                'media_id' => $media->id
            ];
        })->toArray();
    }
    
    /**
     * Obtener todas las colecciones disponibles
     */
    private function obtenerTodasColecciones()
    {
        // Colecciones de Media Library
        $coleccionesMedia = Media::select('collection_name')
                                ->distinct()
                                ->pluck('collection_name')
                                ->filter()
                                ->toArray();
        
        // Colecciones de carpetas public/img (incluyendo subcarpetas)
        $coleccionesPublic = [];
        $rutaPublic = public_path('img');
        
        if (is_dir($rutaPublic)) {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($rutaPublic),
                \RecursiveIteratorIterator::SELF_FIRST
            );
            
            foreach ($iterator as $archivo) {
                if ($archivo->isDir() && !in_array($archivo->getFilename(), ['.', '..'])) {
                    $rutaRelativaCarpeta = str_replace($rutaPublic, '', $archivo->getPathname());
                    $rutaRelativaCarpeta = trim(str_replace('\\', '/', $rutaRelativaCarpeta), '/');
                    
                    if (!empty($rutaRelativaCarpeta)) {
                        $coleccionesPublic[] = $rutaRelativaCarpeta;
                    }
                }
            }
        }
        
        // Agregar 'general' para imágenes directas en img/
        $coleccionesPublic[] = 'general';
        
        // Ordenar las colecciones para mejor visualización
        sort($coleccionesPublic);
        
        return collect($coleccionesMedia)
               ->merge($coleccionesPublic)
               ->unique()
               ->sort()
               ->values()
               ->toArray();
    }
    
    /**
     * Obtener MIME type basado en extensión
     */
    private function obtenerMimeType($extension)
    {
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'bmp' => 'image/bmp'
        ];
        
        return $mimeTypes[$extension] ?? 'image/unknown';
    }
    
    /**
     * Obtener todas las colecciones disponibles (método legacy)
     */
    private function obtenerColecciones()
    {
        return $this->obtenerTodasColecciones();
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