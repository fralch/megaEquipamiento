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
        // Valida los datos de entrada
        $request->validate([
            'nombre' => 'required|string|max:100',
            'tipo_input' => 'required|in:range,checkbox,select,radio',
            'unidad' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string',
            'orden' => 'integer',
            'obligatorio' => 'boolean',
            // Cambiar esta línea:
            'opciones' => 'required_if:tipo_input,checkbox,select,radio|array|min:1',
            'opciones.*.valor' => 'required_with:opciones|string|max:100',
            'opciones.*.etiqueta' => 'required_with:opciones|string|max:100',
            'opciones.*.color' => 'nullable|string|max:7',
            'opciones.*.orden' => 'nullable|integer',
            'subcategorias' => 'array',
            'subcategorias.*' => 'exists:subcategorias,id_subcategoria'
        ]);

        try {
            // Inicia una transacción de base de datos
            DB::beginTransaction();

            // Crea un nuevo filtro con los datos proporcionados
            $filtro = Filtro::create([
                'nombre' => $request->nombre,
                'slug' => Str::slug($request->nombre), // Genera un slug a partir del nombre
                'tipo_input' => $request->tipo_input,
                'unidad' => $request->unidad,
                'descripcion' => $request->descripcion,
                'orden' => $request->orden ?? 0, // Usa 0 si no se proporciona un valor
                'obligatorio' => $request->obligatorio ?? false // Usa false si no se proporciona un valor
            ]);

            // Si hay opciones, las crea y asocia al filtro
            if ($request->has('opciones') && is_array($request->opciones)) {
                foreach ($request->opciones as $index => $opcion) {
                    // Filtrar opciones vacías
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

            // Si hay subcategorías, las asocia al filtro
            if ($request->has('subcategorias')) {
                $filtro->subcategorias()->attach($request->subcategorias, ['activo' => true]);
            }

            // Confirma la transacción
            DB::commit();
            // Devuelve el filtro creado con sus relaciones cargadas
            return response()->json($filtro->load(['opciones', 'subcategorias']), 201);

        } catch (\Exception $e) {
            // Revierte la transacción en caso de error
            DB::rollBack();
            // Devuelve un mensaje de error
            return response()->json(['error' => 'Error al crear el filtro'], 500);
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
                'obligatorio' => $request->obligatorio ?? $filtro->obligatorio
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
        
        // Si hay filtros seleccionados, aplicarlos a la consulta
        if ($request->has('filtros') && !empty($request->filtros)) {
            foreach ($request->filtros as $filtroId => $valorSeleccionado) {
                // Obtener el filtro para conocer su tipo
                $filtro = Filtro::find($filtroId);
                
                if (!$filtro) continue;
                
                // Aplicar el filtro según su tipo
                switch ($filtro->tipo_input) {
                    case 'checkbox':
                        // Para checkbox, valorSeleccionado es un array de IDs de opciones
                        if (is_array($valorSeleccionado) && !empty($valorSeleccionado)) {
                            // Aquí implementamos la lógica para filtrar por opciones múltiples
                            // Como no hay una relación directa en la base de datos, usamos LIKE en JSON
                            $query->where(function($q) use ($filtro, $valorSeleccionado) {
                                foreach ($valorSeleccionado as $opcionId) {
                                    // Buscar en campos JSON como características, datos_técnicos, etc.
                                    $opcion = OpcionFiltro::find($opcionId);
                                    if ($opcion) {
                                        $q->orWhere('caracteristicas', 'LIKE', '%' . $opcion->valor . '%')
                                          ->orWhere('datos_tecnicos', 'LIKE', '%' . $opcion->valor . '%')
                                          ->orWhere('especificaciones_tecnicas', 'LIKE', '%' . $opcion->valor . '%');
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
                                $query->where(function($q) use ($opcion) {
                                    $q->where('caracteristicas', 'LIKE', '%' . $opcion->valor . '%')
                                      ->orWhere('datos_tecnicos', 'LIKE', '%' . $opcion->valor . '%');
                                });
                            }
                        }
                        break;
                        
                    case 'range':
                        // Para range, valorSeleccionado es un valor numérico
                        if (is_numeric($valorSeleccionado)) {
                            // Aquí implementamos la lógica para filtrar por rango
                            // Como ejemplo, filtramos por precio
                            $query->where('precio_igv', '<=', $valorSeleccionado);
                        }
                        break;
                }
            }
        }
        
        // Obtener los productos filtrados
        $productos = $query->get();
        
        // Devolver los productos filtrados
        return response()->json($productos);
    }
}
