<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MarcaCategoria;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class MarcaCategoriaController extends Controller
{
    /**
     * Get all marca-categoria relationships with marca and categoria details
     */
    public function index()
    {
        try {
            $relaciones = MarcaCategoria::with(['marca', 'categoria'])
                ->get()
                ->map(function ($relacion) {
                    return [
                        'marca_id' => $relacion->marca_id,
                        'categoria_id' => $relacion->categoria_id,
                        'marca_nombre' => $relacion->marca->nombre ?? 'N/A',
                        'categoria_nombre' => $relacion->categoria->nombre ?? 'N/A',
                        'marca_imagen' => $relacion->marca->imagen ?? null,
                        'categoria_imagen' => $relacion->categoria->imagen ?? null,
                    ];
                });

            return response()->json($relaciones);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener las relaciones'], 500);
        }
    }

    /**
     * Get all marcas
     */
    public function getMarcas()
    {
        try {
            $marcas = Marca::orderBy('nombre', 'asc')->get();
            return response()->json($marcas);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener las marcas'], 500);
        }
    }

    /**
     * Get all categorias
     */
    public function getCategorias()
    {
        try {
            $categorias = Categoria::orderBy('nombre', 'asc')->get();
            return response()->json($categorias);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener las categorías'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'marca_id' => 'required|exists:marcas,id_marca',
                'categoria_id' => 'required|exists:categorias,id_categoria',
            ]);

            // Check if relationship already exists
            $exists = MarcaCategoria::where('marca_id', $request->marca_id)
                ->where('categoria_id', $request->categoria_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Esta relación ya existe.'
                ], 409);
            }

            $relacion = MarcaCategoria::create([
                'marca_id' => $request->marca_id,
                'categoria_id' => $request->categoria_id,
            ]);

            // Load relationships
            $relacion->load(['marca', 'categoria']);

            return response()->json([
                'message' => 'Relación Marca-Categoría creada exitosamente.',
                'data' => [
                    'marca_id' => $relacion->marca_id,
                    'categoria_id' => $relacion->categoria_id,
                    'marca_nombre' => $relacion->marca->nombre ?? 'N/A',
                    'categoria_nombre' => $relacion->categoria->nombre ?? 'N/A',
                    'marca_imagen' => $relacion->marca->imagen ?? null,
                    'categoria_imagen' => $relacion->categoria->imagen ?? null,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la relación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a marca-categoria relationship
     */
    public function destroy($marca_id, $categoria_id)
    {
        try {
            $relacion = MarcaCategoria::where('marca_id', $marca_id)
                ->where('categoria_id', $categoria_id)
                ->first();

            if (!$relacion) {
                return response()->json([
                    'message' => 'Relación no encontrada.'
                ], 404);
            }

            $relacion->delete();

            return response()->json([
                'message' => 'Relación eliminada exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la relación: ' . $e->getMessage()
            ], 500);
        }
    }
}
