<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Services\Csv\CsvProductoParser;
use App\Services\Csv\ImportDependencyResolver;
use App\Services\Csv\ParseResultDto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductoImportController extends Controller
{
    private const CACHE_KEY = 'csv_import_payload';

    private const CACHE_TTL_SECONDS = 1800; // 30 min

    public function __construct(
        private readonly CsvProductoParser $parser,
        private readonly ImportDependencyResolver $dependencyResolver,
    ) {}

    /**
     * Fase 1: recibe uno o varios CSVs, los parsea y guarda el resultado en cache
     * para que la siguiente fase (import) pueda usarlo sin re-subir los archivos.
     *
     * Acepta tanto `archivo` (un solo file) como `archivo[]` (múltiples files).
     */
    public function previewCsv(Request $request)
    {
        // Detectar si viene como array (multi-upload) o archivo suelto
        $isMultiple = is_array($request->file('archivo'));
        $files = $isMultiple
            ? $request->file('archivo')
            : ($request->hasFile('archivo') ? [$request->file('archivo')] : []);

        if (empty($files)) {
            return response()->json([
                'success' => false,
                'errors' => ['archivo' => ['Se requiere al menos un archivo.']],
            ], 422);
        }

        // Validar cada archivo
        $errors = [];
        foreach ($files as $idx => $file) {
            if (! $file || ! $file->isValid()) {
                $errors[] = 'Archivo '.($idx + 1).': archivo inválido o no subido correctamente.';

                continue;
            }
            if ($file->getSize() > 10240 * 1024) {
                $errors[] = 'Archivo "'.$file->getClientOriginalName().'": excede el límite de 10 MB.';
            }
            $ext = strtolower($file->getClientOriginalExtension());
            if (! in_array($ext, ['csv', 'txt'], true)) {
                $errors[] = 'Archivo "'.$file->getClientOriginalName().'": debe tener extensión .csv o .txt (recibido: .'.$ext.').';
            }
        }

        if (! empty($errors)) {
            return response()->json([
                'success' => false,
                'errors' => ['archivo' => $errors],
            ], 422);
        }

        // Almacenar y parsear
        $storedPaths = [];
        $fileInfos = [];

        foreach ($files as $file) {
            $stored = $file->storeAs(
                'csv-imports',
                uniqid('import_', true).'.'.$file->getClientOriginalExtension(),
                'local'
            );
            $storedPaths[] = $stored;
            $fileInfos[] = [
                'path' => Storage::disk('local')->path($stored),
                'name' => $file->getClientOriginalName(),
            ];
        }

        // Si es un solo archivo, usar parse() directamente (compatible con el flujo existente)
        if (count($fileInfos) === 1) {
            $result = $this->parser->parse($fileInfos[0]['path'], $fileInfos[0]['name']);
        } else {
            $result = $this->parser->parseMultiple($fileInfos);
        }

        Cache::put(self::CACHE_KEY.':'.$this->cacheId($request), [
            'stored_paths' => $storedPaths,
            'stored_path' => $storedPaths[0], // compatibilidad hacia atrás
            'original_names' => array_column($fileInfos, 'name'),
            'original_name' => $fileInfos[0]['name'], // compatibilidad hacia atrás
            'result' => $result->toArray(),
        ], self::CACHE_TTL_SECONDS);

        return response()->json([
            'success' => true,
            'data' => $result->toArray(),
            'cache_key' => $this->cacheId($request),
        ]);
    }

    /**
     * Vuelve a parsear los archivos temporales guardados en caché y devuelve
     * un preview fresco. Útil después de crear categorías/subcategorías/marcas.
     */
    public function refreshPreview(Request $request)
    {
        $data = $request->validate([
            'cache_key' => 'required|string',
        ]);

        $cached = $this->getCachedPayload($data['cache_key']);
        if (! $cached) {
            return response()->json([
                'success' => false,
                'error' => 'La sesión de importación expiró. Vuelve a subir el CSV.',
            ], 410);
        }

        $result = $this->reparseCachedFiles($cached);
        $this->storeResultInCache($data['cache_key'], $cached, $result);

        Log::debug('refresh-preview completado', [
            'cache_key' => $data['cache_key'],
            'productos' => count($result->productos),
            'categorias_pendientes' => count($result->categoriasPendientes),
            'subcategorias_pendientes' => count($result->subcategoriasPendientes),
            'marcas_pendientes' => count($result->marcasPendientes),
            'productos_con_marca_id' => count(array_filter($result->productos, fn ($p) => ! empty($p['marca_id']))),
        ]);

        return response()->json([
            'success' => true,
            'data' => $result->toArray(),
        ]);
    }

    /**
     * Crea una categoría desde el wizard y devuelve la fila actualizada
     * para que el frontend la pueda refrescar.
     */
    public function quickCategoria(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
        ]);

        $nombreNormalizado = $this->normalizeName($data['nombre']);
        $existente = Categoria::all()->first(function (Categoria $c) use ($nombreNormalizado) {
            return $this->normalizeName($c->nombre) === $nombreNormalizado;
        });

        if ($existente) {
            return response()->json([
                'success' => true,
                'created' => false,
                'categoria' => $existente,
            ]);
        }

        $cat = Categoria::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
        ]);
        Cache::forget('todas_categorias');

        return response()->json([
            'success' => true,
            'created' => true,
            'categoria' => $cat,
        ], 201);
    }

    /**
     * Crea una subcategoría asociada a la categoría indicada.
     */
    public function quickSubcategoria(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'id_categoria' => 'required|integer|exists:categorias,id_categoria',
            'descripcion' => 'nullable|string',
        ]);

        $existente = Subcategoria::where('id_categoria', $data['id_categoria'])
            ->get()
            ->first(function (Subcategoria $s) use ($data) {
                return $this->normalizeName($s->nombre) === $this->normalizeName($data['nombre']);
            });

        if ($existente) {
            return response()->json([
                'success' => true,
                'created' => false,
                'subcategoria' => $existente,
            ]);
        }

        $sub = Subcategoria::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'id_categoria' => $data['id_categoria'],
        ]);
        Cache::forget('todas_categorias');

        return response()->json([
            'success' => true,
            'created' => true,
            'subcategoria' => $sub,
        ], 201);
    }

    /**
     * Crea una marca.
     */
    public function quickMarca(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $nombreNormalizado = $this->normalizeName($data['nombre']);
        $existente = Marca::all()->first(function (Marca $m) use ($nombreNormalizado) {
            return $this->normalizeName($m->nombre) === $nombreNormalizado;
        });

        if ($existente) {
            return response()->json([
                'success' => true,
                'created' => false,
                'marca' => $existente,
            ]);
        }

        $marca = Marca::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'created' => true,
            'marca' => $marca,
        ], 201);
    }

    /**
     * Fase 2: importa los productos cuyas dependencias ya están resueltas.
     *
     * Espera:
     *   - cache_key: identificador devuelto por previewCsv
     *   - mapping:   { [sku]: { id_subcategoria: int, marca_id?: int } }
     *   - skus:      [string] subset a importar
     */
    public function importCsv(Request $request)
    {
        $data = $request->validate([
            'cache_key' => 'required|string',
            'skus' => 'required|array|min:1',
            'skus.*' => 'required|string',
            'mapping' => 'nullable|array',
            'mapping.*.id_subcategoria' => 'nullable|integer|exists:subcategorias,id_subcategoria',
            'mapping.*.marca_id' => 'nullable|integer|exists:marcas,id_marca',
        ]);

        $cached = $this->getCachedPayload($data['cache_key']);
        if (! $cached) {
            return response()->json([
                'success' => false,
                'error' => 'La sesión de importación expiró. Vuelve a subir el CSV.',
            ], 410);
        }

        /** @var array $payload */
        $payload = $cached['result'];
        $productos = collect($payload['productos']);
        $seleccionados = $productos->whereIn('sku', $data['skus'])->values();

        if ($seleccionados->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'No hay productos para importar con los SKUs provistos.',
            ], 422);
        }

        $mapping = $data['mapping'] ?? [];
        $insertados = 0;
        $actualizados = 0;
        $omitidos = [];

        foreach ($seleccionados as $row) {
            $sku = $row['sku'];
            $overrides = $mapping[$sku] ?? [];

            $idSubcategoria = $overrides['id_subcategoria']
                ?? ($row['id_subcategoria'] ?: null);
            $marcaId = array_key_exists('marca_id', $overrides)
                ? ($overrides['marca_id'] ?: null)
                : ($row['marca_id'] ?: null);

            if (empty($idSubcategoria)) {
                $omitidos[] = [
                    'sku' => $sku,
                    'motivo' => 'Subcategoría no resuelta. Créala en el paso anterior.',
                ];

                continue;
            }

            $payloadRow = [
                'sku' => $sku,
                'nombre' => $row['nombre'],
                'id_subcategoria' => $idSubcategoria,
                'marca_id' => $marcaId,
                'pais' => $row['pais'] ?? null,
                'precio_sin_ganancia' => $row['precio_sin_ganancia'],
                'precio_ganancia' => $row['precio_ganancia'],
                'precio_igv' => $row['precio_igv'],
                'descripcion' => $row['descripcion'] ?? null,
                'video' => $row['video'] ?? null,
                'envio' => $row['envio'] ?? null,
                'soporte_tecnico' => $row['soporte_tecnico'] ?? null,
                'caracteristicas' => $row['caracteristicas'] ?? [],
                'especificaciones_tecnicas' => $row['especificaciones_tecnicas'] ?? null,
                'archivos_adicionales' => $row['documentos'] ?? null,
            ];

            $producto = Producto::updateOrCreate(['sku' => $sku], $payloadRow);
            if ($producto->wasRecentlyCreated) {
                $insertados++;
            } else {
                $actualizados++;
            }
        }

        // Limpia los archivos temporales y la cache si se importó todo
        if (count($omitidos) === 0) {
            $pathsToDelete = $cached['stored_paths']
                ?? (! empty($cached['stored_path']) ? [$cached['stored_path']] : []);
            foreach ($pathsToDelete as $path) {
                Storage::disk('local')->delete($path);
            }
            Cache::forget($this->cacheKeyFromString($data['cache_key']));
        }

        Log::info('Importación CSV finalizada', [
            'insertados' => $insertados,
            'actualizados' => $actualizados,
            'omitidos' => count($omitidos),
        ]);

        return response()->json([
            'success' => true,
            'insertados' => $insertados,
            'actualizados' => $actualizados,
            'omitidos' => $omitidos,
            'errores_previos' => $payload['errores'] ?? [],
        ]);
    }

    /**
     * Crea todas las dependencias pendientes de una sola vez y devuelve
     * el preview actualizado, sin borrar los archivos temporales.
     */
    public function createPendingDependencies(Request $request)
    {
        $data = $request->validate([
            'cache_key' => 'required|string',
        ]);

        $cached = $this->getCachedPayload($data['cache_key']);
        if (! $cached) {
            return response()->json([
                'success' => false,
                'error' => 'La sesión de importación expiró. Vuelve a subir el CSV.',
            ], 410);
        }

        $oldResult = $this->resultFromCache($cached['result']);

        try {
            // Crear dependencias en BD
            $categoriasMap = $this->dependencyResolver->resolveCategorias($oldResult);
            $subcategoriasMap = $this->dependencyResolver->resolveSubcategorias($oldResult, $categoriasMap);
            $marcasMap = $this->dependencyResolver->resolveMarcas($oldResult);

            Log::debug('create-pending-dependencies: dependencias resueltas', [
                'cache_key' => $data['cache_key'],
                'categorias_map' => count($categoriasMap),
                'subcategorias_map' => count($subcategoriasMap),
                'marcas_map' => $marcasMap,
            ]);

            // Re-parsear para obtener IDs resueltos de forma fiable
            $newResult = $this->reparseCachedFiles($cached);
            $this->storeResultInCache($data['cache_key'], $cached, $newResult);

            Log::debug('create-pending-dependencies: preview re-parseado', [
                'cache_key' => $data['cache_key'],
                'productos_con_marca_id' => count(array_filter($newResult->productos, fn ($p) => ! empty($p['marca_id']))),
                'marcas_pendientes_despues' => count($newResult->marcasPendientes),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Todas las dependencias creadas correctamente.',
                'data' => $newResult->toArray(),
                'resumen' => $this->buildSummary($oldResult, $newResult),
            ]);
        } catch (\Exception $e) {
            Log::error('Error creando dependencias en importación: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al crear dependencias: '.$e->getMessage(),
            ], 500);
        }
    }

    private function cacheId(Request $request): string
    {
        $userId = $request->user()?->id ?? 'anon';
        $session = $request->session()?->getId() ?? 'no-session';

        return hash('sha256', $userId.'|'.$session);
    }

    private function cacheKeyFromString(string $key): string
    {
        return self::CACHE_KEY.':'.$key;
    }

    private function getCachedPayload(string $cacheId): ?array
    {
        return Cache::get($this->cacheKeyFromString($cacheId));
    }

    private function normalizeName(string $s): string
    {
        $s = trim($s);
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;

        return mb_strtolower($s, 'UTF-8');
    }

    /**
     * Reconstruye los fileInfos a partir de la entrada en caché.
     *
     * @return array<int, array{path: string, name: string}>
     */
    private function buildFileInfos(array $cached): array
    {
        $storedPaths = $cached['stored_paths'] ?? (! empty($cached['stored_path']) ? [$cached['stored_path']] : []);
        $originalNames = $cached['original_names'] ?? (! empty($cached['original_name']) ? [$cached['original_name']] : []);

        $fileInfos = [];
        foreach ($storedPaths as $idx => $storedPath) {
            $fileInfos[] = [
                'path' => Storage::disk('local')->path($storedPath),
                'name' => $originalNames[$idx] ?? basename($storedPath),
            ];
        }

        return $fileInfos;
    }

    private function reparseCachedFiles(array $cached): ParseResultDto
    {
        $fileInfos = $this->buildFileInfos($cached);

        if (count($fileInfos) === 0) {
            throw new \RuntimeException('No se encontraron archivos temporales para re-parsear.');
        }

        if (count($fileInfos) === 1) {
            return $this->parser->parse($fileInfos[0]['path'], $fileInfos[0]['name']);
        }

        return $this->parser->parseMultiple($fileInfos);
    }

    private function storeResultInCache(string $cacheId, array $cached, ParseResultDto $result): void
    {
        Cache::put($this->cacheKeyFromString($cacheId), [
            'stored_paths' => (array) ($cached['stored_paths'] ?? $cached['stored_path'] ?? []),
            'stored_path' => $cached['stored_path'] ?? null,
            'original_names' => (array) ($cached['original_names'] ?? $cached['original_name'] ?? []),
            'original_name' => $cached['original_name'] ?? null,
            'result' => $result->toArray(),
        ], self::CACHE_TTL_SECONDS);
    }

    /**
     * Construye un DTO a partir de los datos crudos guardados en caché.
     */
    private function resultFromCache(array $payload): ParseResultDto
    {
        return new ParseResultDto(
            productos: $payload['productos'] ?? [],
            categoriasPendientes: $payload['categorias_pendientes'] ?? [],
            subcategoriasPendientes: $payload['subcategorias_pendientes'] ?? [],
            marcasPendientes: $payload['marcas_pendientes'] ?? [],
            errores: $payload['errores'] ?? [],
            archivosOrigen: $payload['archivos_origen'] ?? [],
        );
    }

    /**
     * Resume cuántas dependencias quedaron resueltas tras el re-parseo.
     */
    private function buildSummary(ParseResultDto $old, ParseResultDto $new): array
    {
        return [
            'categorias' => [
                'pendientes_antes' => count($old->categoriasPendientes),
                'pendientes_despues' => count($new->categoriasPendientes),
            ],
            'subcategorias' => [
                'pendientes_antes' => count($old->subcategoriasPendientes),
                'pendientes_despues' => count($new->subcategoriasPendientes),
            ],
            'marcas' => [
                'pendientes_antes' => count($old->marcasPendientes),
                'pendientes_despues' => count($new->marcasPendientes),
            ],
        ];
    }
}
