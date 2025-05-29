<?php

// Define el espacio de nombres para el controlador
namespace App\Http\Controllers;

// Importa los modelos necesarios para interactuar con la base de datos
use App\Models\Filtro;
use App\Models\OpcionFiltro;
use App\Models\SubcategoriaFiltro;
use App\Models\Subcategoria;
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
            'opciones' => 'required_if:tipo_input,checkbox,select,radio|array',
            'opciones.*.valor' => 'required|string|max:100',
            'opciones.*.etiqueta' => 'required|string|max:100',
            'opciones.*.color' => 'nullable|string|max:7',
            'opciones.*.orden' => 'integer',
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
            if ($request->has('opciones')) {
                foreach ($request->opciones as $opcion) {
                    $filtro->opciones()->create([
                        'valor' => $opcion['valor'],
                        'etiqueta' => $opcion['etiqueta'],
                        'color' => $opcion['color'] ?? null,
                        'orden' => $opcion['orden'] ?? 0
                    ]);
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
            'opciones.*.id_opcion' => 'exists:opciones_filtros,id_opcion',
            'opciones.*.valor' => 'string|max:100',
            'opciones.*.etiqueta' => 'string|max:100',
            'opciones.*.color' => 'nullable|string|max:7',
            'opciones.*.orden' => 'integer',
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
                foreach ($request->opciones as $opcionData) {
                    if (isset($opcionData['id_opcion'])) {
                        $opcion = OpcionFiltro::find($opcionData['id_opcion']);
                        if ($opcion) {
                            $opcion->update($opcionData);
                        }
                    } else {
                        $filtro->opciones()->create($opcionData);
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
}
