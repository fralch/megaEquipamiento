<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class BancoImagenesController extends Controller
{
    /**
     * Mostrar el banco de imágenes (solo public/)
     */
    public function index(Request $request)
    {
        // Cargar imágenes desde public/
        $todasImagenes = collect($this->obtenerImagenesPublic());

        // Filtros
        $tipoArchivo = $request->get('tipo', 'image'); // 'image' | 'todos'
        $termino     = $request->get('buscar');
        $coleccion   = $request->get('coleccion');

        $imagenesFiltradas = $todasImagenes->filter(function ($imagen) use ($tipoArchivo, $termino, $coleccion) {
            // Filtro por tipo (mime)
            if ($tipoArchivo !== 'todos' && !str_starts_with(($imagen['tipo'] ?? ''), $tipoArchivo)) {
                return false;
            }

            // Filtro por término de búsqueda (nombre o archivo)
            if ($termino) {
                $q = mb_strtolower($termino);
                $nombre  = mb_strtolower($imagen['nombre'] ?? $imagen['name'] ?? '');
                $archivo = mb_strtolower($imagen['archivo'] ?? '');
                if (!str_contains($nombre, $q) && !str_contains($archivo, $q)) {
                    return false;
                }
            }

            // Filtro por colección (ruta relativa de carpeta o 'general')
            if ($coleccion && ($imagen['coleccion'] ?? $imagen['collection_name'] ?? null) !== $coleccion) {
                return false;
            }

            return true;
        })->values();

        // Paginación manual
        $page    = (int) $request->get('page', 1);
        $perPage = 20;
        $offset  = ($page - 1) * $perPage;

        $slice = $imagenesFiltradas->slice($offset, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $slice,
            $imagenesFiltradas->count(),
            $perPage,
            $page,
            [
                'path'     => $request->url(),
                'pageName' => 'page',
            ]
        );

        $paginator->appends($request->query());

        return Inertia::render('BancoImagenes/Index', [
            'imagenes'    => $paginator,
            'filtros'     => [
                'buscar'    => $termino,
                'tipo'      => $tipoArchivo,
                'coleccion' => $coleccion,
            ],
            'colecciones' => $this->obtenerTodasColecciones(),
        ]);
    }

    /**
     * Devolver todas las imágenes (json) y colecciones desde public/
     */
    public function getAllImagesJson(Request $request)
    {
        $imagenes = collect($this->obtenerImagenesPublic())
            ->filter(fn ($img) => str_starts_with(($img['tipo'] ?? ''), 'image'))
            ->values();

        return response()->json([
            'imagenes'    => $imagenes,
            'colecciones' => $this->obtenerTodasColecciones(),
        ]);
    }

    /**
     * Buscar imágenes para selector (solo public/)
     * Parámetros: q, tipo ('image' | 'todos'), limite
     */
    public function buscar(Request $request)
    {
        $termino = $request->get('q', '');
        $tipo    = $request->get('tipo', 'image');
        $limite  = (int) $request->get('limite', 10);

        $resultados = collect($this->obtenerImagenesPublic())
            ->filter(function ($imagen) use ($tipo, $termino) {
                // Tipo
                if ($tipo !== 'todos' && !str_starts_with(($imagen['tipo'] ?? ''), $tipo)) {
                    return false;
                }

                // Texto
                if ($termino !== '') {
                    $q = mb_strtolower($termino);
                    $nombre  = mb_strtolower($imagen['nombre'] ?? $imagen['name'] ?? '');
                    $archivo = mb_strtolower($imagen['archivo'] ?? '');
                    if (!str_contains($nombre, $q) && !str_contains($archivo, $q)) {
                        return false;
                    }
                }

                return true;
            })
            ->sortByDesc('fecha')
            ->take($limite)
            ->map(function ($imagen) {
                return [
                    'id'         => $imagen['id'],
                    'nombre'     => $imagen['nombre'] ?? $imagen['name'] ?? '',
                    'archivo'    => $imagen['archivo'] ?? '',
                    'url'        => $imagen['url'] ?? '',
                    'tipo'       => $imagen['tipo'] ?? $imagen['mime_type'] ?? '',
                    'tamano'     => $imagen['tamano'] ?? $imagen['tamano_formateado'] ?? '',
                    'coleccion'  => $imagen['coleccion'] ?? $imagen['collection_name'] ?? '',
                    'fuente'     => $imagen['fuente'] ?? 'public',
                ];
            })
            ->values();

        return response()->json($resultados);
    }

    /**
     * Escanear imágenes de la carpeta public/ (incluye subcarpetas)
     * Mantiene compatibilidad de claves para el frontend:
     * - nombre y name
     * - tipo y mime_type
     * - coleccion y collection_name
     * - tamano y tamano_formateado
     */
    private function obtenerImagenesPublic(): array
    {
        $imagenes   = [];
        $rutaPublic = public_path();

        if (!is_dir($rutaPublic)) {
            return $imagenes;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($rutaPublic, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $archivo) {
            if (!$archivo->isFile()) {
                continue;
            }

            $extension = strtolower($archivo->getExtension());
            $extPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

            if (!in_array($extension, $extPermitidas, true)) {
                continue;
            }

            // Rutas
            $rutaAbs      = $archivo->getPathname();
            $rutaRelativa = str_replace(public_path(), '', $rutaAbs);
            $rutaRelativa = ltrim(str_replace('\\', '/', $rutaRelativa), '/');

            // Colección = ruta de carpetas dentro de /public. Si está en /public directamente => 'general'
            $rutaCarpeta         = dirname($rutaAbs);
            $rutaRelativaCarpeta = str_replace(public_path(), '', $rutaCarpeta);
            $rutaRelativaCarpeta = trim(str_replace('\\', '/', $rutaRelativaCarpeta), '/');
            $coleccion           = $rutaRelativaCarpeta === '' ? 'general' : $rutaRelativaCarpeta;

            $mimeType  = $this->obtenerMimeType($extension);
            $nombreBase = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);

            $tam = $this->formatearTamano($archivo->getSize());

            $imagenes[] = [
                'id'                 => 'public_' . md5($rutaRelativa),
                // Compatibilidad de nombres
                'name'               => $nombreBase,
                'nombre'             => $nombreBase,
                'archivo'            => $archivo->getFilename(),
                'url'                => asset($rutaRelativa),
                // Compatibilidad de tipos
                'mime_type'          => $mimeType,
                'tipo'               => $mimeType,
                // Tamaño (dos llaves compatibles)
                'tamano_formateado'  => $tam,
                'tamano'             => $tam,
                // Colección (dos llaves compatibles)
                'collection_name'    => $coleccion,
                'coleccion'          => $coleccion,
                'fecha'              => date('Y-m-d H:i:s', $archivo->getMTime()),
                'fuente'             => 'public',
                'ruta_completa'      => $rutaRelativa,
            ];
        }

        return $imagenes;
    }

    /**
     * Listar todas las "colecciones" (carpetas) dentro de public/ + 'general'
     */
    private function obtenerTodasColecciones(): array
    {
        $colecciones = [];
        $rutaPublic  = public_path();

        if (is_dir($rutaPublic)) {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($rutaPublic, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($iterator as $item) {
                if ($item->isDir()) {
                    $rutaRel = str_replace($rutaPublic, '', $item->getPathname());
                    $rutaRel = trim(str_replace('\\', '/', $rutaRel), '/');
                    if ($rutaRel !== '') {
                        $colecciones[] = $rutaRel;
                    }
                }
            }
        }

        // Agregar 'general' para archivos en la raíz de /public
        $colecciones[] = 'general';

        $colecciones = array_values(array_unique($colecciones));
        sort($colecciones);

        return $colecciones;
    }

    /**
     * MIME type básico por extensión
     */
    private function obtenerMimeType(string $extension): string
    {
        $mimeTypes = [
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'svg'  => 'image/svg+xml',
            'bmp'  => 'image/bmp',
        ];

        return $mimeTypes[$extension] ?? 'image/unknown';
    }

    /**
     * Formatear tamaño de archivo en unidades legibles
     */
    private function formatearTamano(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes > 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
