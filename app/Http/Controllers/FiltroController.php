<?php
namespace App\Http\Controllers;

use App\Models\Filtro;
use App\Models\OpcionFiltro;
use App\Models\SubcategoriaFiltro;
use App\Models\Subcategoria;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class FiltroController extends Controller
{
    public function index()
    {
        $filtros = Filtro::with(['opciones', 'subcategorias'])
            ->orderBy('orden')
            ->get();
        return response()->json($filtros);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:100',
                'tipo_input' => 'required|in:range,checkbox,select,radio',
                'unidad' => 'nullable|string|max:20',
                'descripcion' => 'nullable|string',
                'orden' => 'integer',
                'obligatorio' => 'boolean',
                'max_value' => 'nullable|numeric',
                'min_value' => 'nullable|numeric',
                'opciones' => 'required_if:tipo_input,checkbox,select,radio|array',
                'opciones.*.valor' => 'required_with:opciones|string|max:100',
                'opciones.*.etiqueta' => 'required_with:opciones|string|max:100',
                'opciones.*.color' => 'nullable|string|max:7',
                'opciones.*.orden' => 'nullable|integer',
                'subcategorias' => 'array',
                'subcategorias.*' => 'exists:subcategorias,id_subcategoria'
            ]);

            if (in_array($validatedData['tipo_input'], ['checkbox', 'select', 'radio'])) {
                if (!isset($validatedData['opciones']) || count($validatedData['opciones']) < 1) {
                    return response()->json([
                        'error' => 'Los filtros de tipo checkbox, select y radio requieren al menos una opción'
                    ], 422);
                }
            }

            $validatedData['min_value'] = empty($validatedData['min_value']) ? null : $validatedData['min_value'];
            $validatedData['max_value'] = empty($validatedData['max_value']) ? null : $validatedData['max_value'];

            DB::beginTransaction();

            $filtro = Filtro::create([
                'nombre' => $validatedData['nombre'],
                'slug' => Str::slug($validatedData['nombre']),
                'tipo_input' => $validatedData['tipo_input'],
                'unidad' => $validatedData['unidad'] ?? null,
                'descripcion' => $validatedData['descripcion'] ?? null,
                'orden' => $validatedData['orden'] ?? 0,
                'obligatorio' => $validatedData['obligatorio'] ?? false,
                'max_value' => $validatedData['max_value'] ?? null,
                'min_value' => $validatedData['min_value'] ?? null
            ]);

            if (isset($validatedData['opciones']) && is_array($validatedData['opciones'])) {
                foreach ($validatedData['opciones'] as $index => $opcion) {
                    if (!empty($opcion['valor']) && !empty($opcion['etiqueta'])) {
                        $filtro->opciones()->create([
                            'valor' => $opcion['valor'],
                            'etiqueta' => $opcion['etiqueta'],
                            'color' => $opcion['color'] ?? null,
                            'orden' => $opcion['orden'] ?? $index
                        ]);
                    }
                }
            }

            if (isset($validatedData['subcategorias'])) {
                $filtro->subcategorias()->attach($validatedData['subcategorias'], ['activo' => true]);
            }

            DB::commit();

            return response()->json($filtro->load(['opciones', 'subcategorias']), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Error de validación',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear el filtro: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $filtro = Filtro::with(['opciones', 'subcategorias'])->findOrFail($id);
        return response()->json($filtro);
    }

    public function update(Request $request, $id)
    {
        $filtro = Filtro::findOrFail($id);

        $request->validate([
            'nombre' => 'string|max:100',
            'tipo_input' => 'in:range,checkbox,select,radio',
            'unidad' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string',
            'orden' => 'integer',
            'obligatorio' => 'boolean',
            'max_value' => 'nullable|numeric',
            'min_value' => 'nullable|numeric',
            'opciones' => 'array',
            'opciones.*.id_opcion' => 'nullable|exists:opciones_filtros,id_opcion',
            'opciones.*.valor' => 'required_with:opciones|string|max:100',
            'opciones.*.etiqueta' => 'required_with:opciones|string|max:100',
            'opciones.*.color' => 'nullable|string|max:7',
            'opciones.*.orden' => 'nullable|integer',
            'subcategorias' => 'array',
            'subcategorias.*' => 'exists:subcategorias,id_subcategoria'
        ]);

        try {
            $request->merge([
                'min_value' => empty($request->min_value) ? null : $request->min_value,
                'max_value' => empty($request->max_value) ? null : $request->max_value,
            ]);

            DB::beginTransaction();

            $filtro->update([
                'nombre' => $request->nombre ?? $filtro->nombre,
                'slug' => $request->nombre ? Str::slug($request->nombre) : $filtro->slug,
                'tipo_input' => $request->tipo_input ?? $filtro->tipo_input,
                'unidad' => $request->unidad,
                'descripcion' => $request->descripcion,
                'orden' => $request->orden ?? $filtro->orden,
                'obligatorio' => $request->obligatorio ?? $filtro->obligatorio,
                'max_value' => $request->max_value,
                'min_value' => $request->min_value
            ]);

            if ($request->has('opciones')) {
                $opcionesExistentes = $filtro->opciones()->pluck('id_opcion')->toArray();
                $opcionesEnviadas = collect($request->opciones)
                    ->filter(function($opcion) {
                        return isset($opcion['id_opcion']);
                    })
                    ->pluck('id_opcion')
                    ->toArray();

                $opcionesAEliminar = array_diff($opcionesExistentes, $opcionesEnviadas);

                if (!empty($opcionesAEliminar)) {
                    OpcionFiltro::whereIn('id_opcion', $opcionesAEliminar)->delete();
                }

                foreach ($request->opciones as $index => $opcionData) {
                    if (!empty($opcionData['valor']) && !empty($opcionData['etiqueta'])) {
                        if (isset($opcionData['id_opcion']) && $opcionData['id_opcion']) {
                            $opcion = OpcionFiltro::find($opcionData['id_opcion']);
                            if ($opcion && $opcion->id_filtro === $filtro->id_filtro) {
                                $opcion->update([
                                    'valor' => $opcionData['valor'],
                                    'etiqueta' => $opcionData['etiqueta'],
                                    'color' => $opcionData['color'] ?? null,
                                    'orden' => $opcionData['orden'] ?? $index
                                ]);
                            }
                        } else {
                            $filtro->opciones()->create([
                                'valor' => $opcionData['valor'],
                                'etiqueta' => $opcionData['etiqueta'],
                                'color' => $opcionData['color'] ?? null,
                                'orden' => $opcionData['orden'] ?? $index
                            ]);
                        }
                    }
                }
            }

            if ($request->has('subcategorias')) {
                $filtro->subcategorias()->sync($request->subcategorias);
            }

            DB::commit();

            return response()->json($filtro->load(['opciones', 'subcategorias']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar el filtro'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $filtro = Filtro::findOrFail($id);
            $filtro->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el filtro'], 500);
        }
    }

    public function getBySubcategoria($subcategoriaId)
    {
        $subcategoria = Subcategoria::findOrFail($subcategoriaId);
        $filtros = $subcategoria->filtros()
            ->with('opciones')
            ->orderBy('orden')
            ->get();
        return response()->json($filtros);
    }

    public function updateOpcion(Request $request, $id)
    {
        $opcion = OpcionFiltro::findOrFail($id);
        $request->validate([
            'valor' => 'string|max:100',
            'etiqueta' => 'string|max:100',
            'color' => 'nullable|string|max:7',
            'orden' => 'integer',
            'activo' => 'boolean'
        ]);
        $opcion->update($request->all());
        return response()->json($opcion);
    }

    public function deleteOpcion($id)
    {
        $opcion = OpcionFiltro::findOrFail($id);
        $opcion->delete();
        return response()->json(null, 204);
    }

    public function filtrarProductos(Request $request)
    {
        $request->validate([
            'subcategoria_id' => 'required|exists:subcategorias,id_subcategoria',
            'filtros' => 'array'
        ]);

        $subcategoriaId = $request->subcategoria_id;

        \Log::info('=== INICIO FILTRADO ===');
        \Log::info('Subcategoria ID: ' . $subcategoriaId);
        \Log::info('Filtros recibidos: ', $request->filtros ?? []);

        // Contar productos totales en la subcategoría
        $totalProductos = Producto::where('id_subcategoria', $subcategoriaId)->count();
        \Log::info('Total productos en subcategoría: ' . $totalProductos);

        $query = Producto::where('id_subcategoria', $subcategoriaId);

        // Si hay filtros seleccionados, aplicarlos a la consulta con OR
        if ($request->has('filtros') && !empty($request->filtros)) {
            // Usar orWhere para combinar los filtros con OR en lugar de AND
            $query->where(function($mainQuery) use ($request, $subcategoriaId) {
                $isFirstFilter = true;

                foreach ($request->filtros as $filtroId => $valorSeleccionado) {
                    // Obtener el filtro para conocer su tipo
                    $filtro = Filtro::find($filtroId);

                    if (!$filtro) continue;

                    // Para el primer filtro usar where, para los siguientes usar orWhere
                    $whereMethod = $isFirstFilter ? 'where' : 'orWhere';
                    $isFirstFilter = false;

                    // Aplicar el filtro según su tipo usando OR entre filtros diferentes
                    $mainQuery->$whereMethod(function($subQuery) use ($filtro, $valorSeleccionado, $subcategoriaId) {
                        switch ($filtro->tipo_input) {
                            case 'checkbox':
                                // Para checkbox, valorSeleccionado es un array de IDs de opciones
                                if (is_array($valorSeleccionado) && !empty($valorSeleccionado)) {
                                    $subQuery->where(function($q) use ($filtro, $valorSeleccionado, $subcategoriaId) {
                                        foreach ($valorSeleccionado as $opcionId) {
                                            $opcion = OpcionFiltro::find($opcionId);
                                            if ($opcion) {
                                                $valorOriginal = trim($opcion->valor);

                                                \Log::info("Checkbox - Opción ID: {$opcionId}, Valor: '{$valorOriginal}'");

                                                // Test con diferentes formatos
                                                $test1 = \App\Models\Producto::where('id_subcategoria', $subcategoriaId)
                                                    ->whereRaw('caracteristicas LIKE ?', ['%Port%'])
                                                    ->count();
                                                \Log::info("Test 1 (solo 'Port'): {$test1} productos");

                                                // Test 2: Con unicode escape
                                                $test2 = \App\Models\Producto::where('id_subcategoria', $subcategoriaId)
                                                    ->whereRaw('caracteristicas LIKE ?', ['%Port\\u00e1til%'])
                                                    ->count();
                                                \Log::info("Test 2 (unicode \\u00e1): {$test2} productos");

                                                // Test 3: Usando JSON_SEARCH
                                                $test3 = \App\Models\Producto::where('id_subcategoria', $subcategoriaId)
                                                    ->whereRaw('JSON_SEARCH(caracteristicas, "one", ?) IS NOT NULL', ['Portátil'])
                                                    ->count();
                                                \Log::info("Test 3 (JSON_SEARCH): {$test3} productos");

                                                // Test 4: Buscar en el valor decodificado usando JSON_EXTRACT
                                                $test4 = \App\Models\Producto::where('id_subcategoria', $subcategoriaId)
                                                    ->whereRaw('JSON_EXTRACT(caracteristicas, "$[*]") LIKE ?', ['%Portátil%'])
                                                    ->count();
                                                \Log::info("Test 4 (JSON_EXTRACT): {$test4} productos");

                                                // Usar JSON_SEARCH para búsqueda correcta en JSON
                                                $q->orWhereRaw(
                                                    'JSON_SEARCH(caracteristicas, "one", ?) IS NOT NULL',
                                                    [$valorOriginal]
                                                );
                                            }
                                        }
                                    });
                                }
                                break;

                            case 'radio':
                            case 'select':
                                // Para radio y select, valorSeleccionado es un único ID de opción
                                if (!empty($valorSeleccionado)) {
                                    $opcion = OpcionFiltro::find($valorSeleccionado);
                                    if ($opcion) {
                                        $valorOriginal = trim($opcion->valor);

                                        \Log::info("Select/Radio - Buscando: '{$valorOriginal}'");

                                        // Búsqueda insensible a acentos y case usando COLLATE
                                        $subQuery->whereRaw(
                                            'caracteristicas COLLATE utf8mb4_general_ci LIKE ?',
                                            ['%' . $valorOriginal . '%']
                                        );
                                    }
                                }
                                break;

                            case 'range':
                                // Para range, valorSeleccionado es un objeto con min y max
                                if (is_array($valorSeleccionado) && (isset($valorSeleccionado['min']) || isset($valorSeleccionado['max']))) {
                                    $subQuery->where(function($q) use ($filtro, $valorSeleccionado) {
                                        // Extraer valores numéricos de las características usando regex
                                        // Busca patrones como "5kg", "10.5 cm", "100 watts", etc.
                                        $campoNombre = strtolower($filtro->nombre);

                                        // Aplicar filtro de valor mínimo si está definido
                                        if (isset($valorSeleccionado['min']) && $valorSeleccionado['min'] !== null && $valorSeleccionado['min'] !== '') {
                                            $minValue = (float) $valorSeleccionado['min'];
                                            // Buscar números en las características que coincidan con el nombre del filtro
                                            $q->whereRaw("CAST(REGEXP_REPLACE(
                                                LOWER(caracteristicas),
                                                CONCAT('.*', ?, '[^0-9]*([0-9]+(?:\.[0-9]+)?).*'),
                                                '$1'
                                            ) AS DECIMAL(10,2)) >= ?", [$campoNombre, $minValue]);
                                        }

                                        // Aplicar filtro de valor máximo si está definido
                                        if (isset($valorSeleccionado['max']) && $valorSeleccionado['max'] !== null && $valorSeleccionado['max'] !== '') {
                                            $maxValue = (float) $valorSeleccionado['max'];
                                            // Buscar números en las características que coincidan con el nombre del filtro
                                            $q->whereRaw("CAST(REGEXP_REPLACE(
                                                LOWER(caracteristicas),
                                                CONCAT('.*', ?, '[^0-9]*([0-9]+(?:\.[0-9]+)?).*'),
                                                '$1'
                                            ) AS DECIMAL(10,2)) <= ?", [$campoNombre, $maxValue]);
                                        }
                                    });
                                }
                                break;
                        }
                    });
                }
            });
        }

        // Logs para debugging
        $sql = $query->toSql();
        $bindings = $query->getBindings();
        \Log::info('SQL Query: ' . $sql);
        \Log::info('Bindings: ', $bindings);

        $productos = $query->with('marca')->get();

        \Log::info('Total productos encontrados: ' . $productos->count());
        if ($productos->count() > 0) {
            \Log::info('Productos IDs: ', $productos->pluck('id_producto')->toArray());
        }
        \Log::info('=== FIN FILTRADO ===');

        return response()->json($productos);
    }
}
