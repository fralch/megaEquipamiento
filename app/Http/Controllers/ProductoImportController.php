<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Services\Csv\CsvProductoParser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductoImportController extends Controller
{
    private const CACHE_KEY = 'csv_import_payload';

    private const CACHE_TTL_SECONDS = 1800; // 30 min

    public function __construct(private readonly CsvProductoParser $parser) {}

    /**
     * Fase 1: recibe el CSV, lo parsea y guarda el resultado en cache
     * para que la siguiente fase (import) pueda usarlo sin re-subir el archivo.
     */
    public function previewCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => ['required', 'file', 'max:10240'],
        ]);

        $validator->after(function ($v) use ($request) {
            if (! $request->hasFile('archivo')) {
                return;
            }
            $ext = strtolower($request->file('archivo')->getClientOriginalExtension());
            if (! in_array($ext, ['csv', 'txt'], true)) {
                $v->errors()->add('archivo', 'El archivo debe tener extensión .csv o .txt (recibido: .'.$ext.').');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('archivo');
        $stored = $file->storeAs(
            'csv-imports',
            uniqid('import_', true).'.'.$file->getClientOriginalExtension(),
            'local'
        );

        $fullPath = Storage::disk('local')->path($stored);
        $result = $this->parser->parse($fullPath);

        Cache::put(self::CACHE_KEY.':'.$this->cacheId($request), [
            'stored_path' => $stored,
            'original_name' => $file->getClientOriginalName(),
            'result' => $result->toArray(),
        ], self::CACHE_TTL_SECONDS);

        return response()->json([
            'success' => true,
            'data' => $result->toArray(),
            'cache_key' => $this->cacheId($request),
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

        $cacheKey = self::CACHE_KEY.':'.$data['cache_key'];
        $cached = Cache::get($cacheKey);
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
            ];

            $producto = Producto::updateOrCreate(['sku' => $sku], $payloadRow);
            if ($producto->wasRecentlyCreated) {
                $insertados++;
            } else {
                $actualizados++;
            }
        }

        // Limpia el archivo temporal y la cache si se importó todo
        if (count($omitidos) === 0) {
            if (! empty($cached['stored_path'])) {
                Storage::disk('local')->delete($cached['stored_path']);
            }
            Cache::forget($cacheKey);
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

    private function cacheId(Request $request): string
    {
        $userId = $request->user()?->id ?? 'anon';
        $session = $request->session()?->getId() ?? 'no-session';

        return hash('sha256', $userId.'|'.$session);
    }

    private function normalizeName(string $s): string
    {
        $s = trim($s);
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;

        return mb_strtolower($s, 'UTF-8');
    }
}
