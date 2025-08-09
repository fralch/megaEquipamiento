<?php

// Define el espacio de nombres para el controlador
namespace App\Http\Controllers;

// Importa los modelos necesarios para interactuar con la base de datos
use App\Models\Filtro;
use App\Models\OpcionFiltro;
use App\Models\SubcategoriaFiltro;
use App\Models\Subcategoria;
use App\Models\Producto;
use Illuminate\Http\Request; // Para manejar las solicitudes HTTP
use Illuminate\Support\Str; // Para manipular strings, como generar slugs
use Illuminate\Support\Facades\DB; // Para manejar transacciones de base de datos

class FiltroController extends Controller
{
    // Método para listar todos los filtros con sus opciones y subcategorías
    public function index()
    {
        // Obtiene todos los filtros, incluyendo sus relaciones con opciones y subcategorías, ordenados por el campo 'orden'
        $filtros = Filtro::with(['opciones', 'subcategorias'])
            ->orderBy('orden')
            ->get();
        // Devuelve una respuesta JSON con los filtros
        return response()->json($filtros);
    }

    // Método para crear un nuevo filtro
    public function store(Request $request)
    {
        try {
            // Log de los datos recibidos para debug
            \Log::info('Datos recibidos en store filtro:', $request->all());
            
            // Valida los datos de entrada
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

            // Validación adicional para tipos que requieren opciones
            if (in_array($validatedData['tipo_input'], ['checkbox', 'select', 'radio'])) {
                if (!isset($validatedData['opciones']) || count($validatedData['opciones']) < 1) {
                    return response()->json([
                        'error' => 'Los filtros de tipo checkbox, select y radio requieren al menos una opción'
                    ], 422);
                }
            }

            // Convertir strings vacíos a null para valores numéricos
            $validatedData['min_value'] = empty($validatedData['min_value']) ? null : $validatedData['min_value'];
            $validatedData['max_value'] = empty($validatedData['max_value']) ? null : $validatedData['max_value'];

            \Log::info('Datos validados correctamente');

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

            // Crear opciones si existen
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

            // Asociar subcategorías
            if (isset($validatedData['subcategorias'])) {
                $filtro->subcategorias()->attach($validatedData['subcategorias'], ['activo' => true]);
            }

            DB::commit();
            return response()->json($filtro->load(['opciones', 'subcategorias']), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Error de validación específico
            \Log::error('Error de validación en filtro:', $e->errors());
            return response()->json([
                'error' => 'Error de validación',
                'details' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear filtro:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al crear el filtro: ' . $e->getMessage()], 500);
        }
    }

    // Método para mostrar un filtro específico
    public function show($id)
    {
        // Busca un filtro por su ID, incluyendo sus relaciones con opciones y subcategorías
        $filtro = Filtro::with(['opciones', 'subcategorias'])->findOrFail($id);
        // Devuelve una respuesta JSON con el filtro
        return response()->json($filtro);
    }

    // Método para actualizar un filtro existente
    public function update(Request $request, $id)
    {
        // Busca un filtro por su ID
        $filtro = Filtro::findOrFail($id);

        // Valida los datos de entrada
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
            // Convertir strings vacíos a null para valores numéricos
            $request->merge([
                'min_value' => empty($request->min_value) ? null : $request->min_value,
                'max_value' => empty($request->max_value) ? null : $request->max_value,
            ]);

            // Inicia una transacción de base de datos
            DB::beginTransaction();

            // Actualiza el filtro con los nuevos datos
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

            // Si hay opciones, actualiza las existentes o crea nuevas
            if ($request->has('opciones')) {
                // Eliminar opciones existentes si no están en la nueva lista
                $opcionesExistentes = $filtro->opciones()->pluck('id_opcion')->toArray();
                $opcionesEnviadas = collect($request->opciones)
                    ->filter(function($opcion) {
                        return isset($opcion['id_opcion']);
                    })
                    ->pluck('id_opcion')
                    ->toArray();
                
                // Eliminar opciones que ya no están
                $opcionesAEliminar = array_diff($opcionesExistentes, $opcionesEnviadas);
                if (!empty($opcionesAEliminar)) {
                    OpcionFiltro::whereIn('id_opcion', $opcionesAEliminar)->delete();
                }
                
                // Actualizar o crear opciones
                foreach ($request->opciones as $index => $opcionData) {
                    if (!empty($opcionData['valor']) && !empty($opcionData['etiqueta'])) {
                        if (isset($opcionData['id_opcion']) && $opcionData['id_opcion']) {
                            // Actualizar opción existente
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
                            // Crear nueva opción
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

            // Si hay subcategorías, sincroniza las asociaciones
            if ($request->has('subcategorias')) {
                $filtro->subcategorias()->sync($request->subcategorias);
            }

            // Confirma la transacción
            DB::commit();
            // Devuelve el filtro actualizado con sus relaciones cargadas
            return response()->json($filtro->load(['opciones', 'subcategorias']));

        } catch (\Exception $e) {
            // Revierte la transacción en caso de error
            DB::rollBack();
            // Devuelve un mensaje de error
            return response()->json(['error' => 'Error al actualizar el filtro'], 500);
        }
    }

    // Método para eliminar un filtro
    public function destroy($id)
    {
        try {
            // Busca un filtro por su ID y lo elimina
            $filtro = Filtro::findOrFail($id);
            $filtro->delete();
            // Devuelve una respuesta vacía con código 204 (sin contenido)
            return response()->json(null, 204);
        } catch (\Exception $e) {
            // Devuelve un mensaje de error
            return response()->json(['error' => 'Error al eliminar el filtro'], 500);
        }
    }

    // Método para obtener los filtros asociados a una subcategoría
    public function getBySubcategoria($subcategoriaId)
    {
        // Busca una subcategoría por su ID
        $subcategoria = Subcategoria::findOrFail($subcategoriaId);
        // Obtiene los filtros asociados a la subcategoría, incluyendo sus opciones, ordenados por el campo 'orden'
        $filtros = $subcategoria->filtros()
            ->with('opciones')
            ->orderBy('orden')
            ->get();
        // Devuelve una respuesta JSON con los filtros
        return response()->json($filtros);
    }

    // Método para actualizar una opción de filtro
    public function updateOpcion(Request $request, $id)
    {
        // Busca una opción de filtro por su ID
        $opcion = OpcionFiltro::findOrFail($id);

        // Valida los datos de entrada
        $request->validate([
            'valor' => 'string|max:100',
            'etiqueta' => 'string|max:100',
            'color' => 'nullable|string|max:7',
            'orden' => 'integer',
            'activo' => 'boolean'
        ]);

        // Actualiza la opción con los nuevos datos
        $opcion->update($request->all());
        // Devuelve una respuesta JSON con la opción actualizada
        return response()->json($opcion);
    }

    // Método para eliminar una opción de filtro
    public function deleteOpcion($id)
    {
        // Busca una opción de filtro por su ID y la elimina
        $opcion = OpcionFiltro::findOrFail($id);
        $opcion->delete();
        // Devuelve una respuesta vacía con código 204 (sin contenido)
        return response()->json(null, 204);
    }

    // Método para filtrar productos por filtros seleccionados
    public function filtrarProductos(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'subcategoria_id' => 'required|exists:subcategorias,id_subcategoria',
            'filtros' => 'array'
        ]);

        // Obtener la subcategoría
        $subcategoriaId = $request->subcategoria_id;
        
        // Iniciar la consulta base para productos de esta subcategoría
        $query = Producto::where('id_subcategoria', $subcategoriaId);
        
        // Si hay filtros seleccionados, aplicarlos a la consulta con OR
        if ($request->has('filtros') && !empty($request->filtros)) {
            // Usar orWhere para combinar los filtros con OR en lugar de AND
            $query->where(function($mainQuery) use ($request) {
                $isFirstFilter = true;
                
                foreach ($request->filtros as $filtroId => $valorSeleccionado) {
                    // Obtener el filtro para conocer su tipo
                    $filtro = Filtro::find($filtroId);
                    
                    if (!$filtro) continue;
                    
                    // Para el primer filtro usar where, para los siguientes usar orWhere
                    $whereMethod = $isFirstFilter ? 'where' : 'orWhere';
                    $isFirstFilter = false;
                    
                    // Aplicar el filtro según su tipo usando OR entre filtros diferentes
                    $mainQuery->$whereMethod(function($subQuery) use ($filtro, $valorSeleccionado) {
                        switch ($filtro->tipo_input) {
                            case 'checkbox':
                                // Para checkbox, valorSeleccionado es un array de IDs de opciones
                                if (is_array($valorSeleccionado) && !empty($valorSeleccionado)) {
                                    $subQuery->where(function($q) use ($filtro, $valorSeleccionado) {
                                        foreach ($valorSeleccionado as $opcionId) {
                                            $opcion = OpcionFiltro::find($opcionId);
                                            if ($opcion) {
                                                // Normalizar el valor para búsqueda flexible
                                                $valorNormalizado = trim(strtolower($opcion->valor));
                                                // Búsqueda case-insensitive y flexible con espacios
                                                $q->orWhere(function($subQ) use ($valorNormalizado) {
                                                    $subQ->whereRaw('LOWER(REPLACE(caracteristicas, " ", "")) LIKE ?', ['%' . str_replace(' ', '', $valorNormalizado) . '%']);
                                                });
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
                                        // Normalizar el valor para búsqueda flexible
                                        $valorNormalizado = trim(strtolower($opcion->valor));
                                        // Búsqueda case-insensitive y flexible con espacios
                                        $subQuery->whereRaw('LOWER(REPLACE(caracteristicas, " ", "")) LIKE ?', ['%' . str_replace(' ', '', $valorNormalizado) . '%']);
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
        
        // Obtener los productos filtrados con la relación de marca
        $productos = $query->with('marca')->get();
        
        // Devolver los productos filtrados
        return response()->json($productos);
    }
}
