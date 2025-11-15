<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductoExterno;
use App\Services\TranslationService;
use Illuminate\Support\Facades\Log;

class ProductoExternoController extends Controller
{
    /**
     * Display a listing of productos externos.
     */
    public function index(Request $request)
    {
        // Obtener parámetros de paginación
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        // Paginar los productos externos
        $productosExternos = ProductoExterno::orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($productosExternos);
    }

    /**
     * Display the productos externos view with Inertia.
     */
    public function view(Request $request)
    {
        // Obtener parámetros de paginación y búsqueda
        $perPage = $request->input('per_page', 20);
        $search = $request->input('search', '');

        // Query base
        $query = ProductoExterno::orderBy('created_at', 'desc');

        // Aplicar búsqueda si existe
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereRaw('JSON_SEARCH(heading, "one", ?) IS NOT NULL', ["%{$search}%"])
                  ->orWhereRaw('JSON_SEARCH(paragraphs, "one", ?) IS NOT NULL', ["%{$search}%"]);
            });
        }

        // Paginar los productos externos
        $productosExternos = $query->paginate($perPage)->withQueryString();

        return Inertia::render('ProductosExternos', [
            'productosExternos' => $productosExternos,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Display the specified producto externo.
     */
    public function show(Request $request, $id)
    {
        $productoExterno = ProductoExterno::find($id);

        if (!$productoExterno) {
            return response()->json(['error' => 'Producto externo no encontrado'], 404);
        }

        $lang = $request->input('lang', 'es');
        if ($lang === 'es') {
            $productoExterno->heading = TranslationService::translateArray($productoExterno->heading, 'es', 'auto');
            $productoExterno->paragraphs = TranslationService::translateArray($productoExterno->paragraphs, 'es', 'auto');
            $productoExterno->tables = TranslationService::translateTables($productoExterno->tables, 'es', 'auto');
        }

        return response()->json($productoExterno);
    }

    /**
     * Translate a producto externo.
     */
    public function translate(Request $request, $id)
    {
        try {
            $productoExterno = ProductoExterno::find($id);

            if (!$productoExterno) {
                return response()->json(['error' => 'Producto externo no encontrado'], 404);
            }

            $lang = $request->input('lang', 'es');

            return response()->json([
                'heading' => TranslationService::translateArray($productoExterno->heading, $lang, 'auto'),
                'paragraphs' => TranslationService::translateArray($productoExterno->paragraphs, $lang, 'auto'),
                'tables' => TranslationService::translateTables($productoExterno->tables, $lang, 'auto'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error translating product: ' . $e->getMessage());
            return response()->json(['error' => 'Error al traducir el producto'], 500);
        }
    }

    /**
     * Store a newly created producto externo in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'heading' => 'nullable|json',
                'paragraphs' => 'nullable|json',
                'tables' => 'nullable|json',
                'images' => 'nullable|json',
            ]);

            // Convertir strings JSON a arrays si es necesario
            $data = [
                'heading' => is_string($request->heading) ? json_decode($request->heading, true) : $request->heading,
                'paragraphs' => is_string($request->paragraphs) ? json_decode($request->paragraphs, true) : $request->paragraphs,
                'tables' => is_string($request->tables) ? json_decode($request->tables, true) : $request->tables,
                'images' => is_string($request->images) ? json_decode($request->images, true) : $request->images,
            ];

            $productoExterno = ProductoExterno::create($data);

            return response()->json($productoExterno, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear producto externo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear el producto externo'], 500);
        }
    }

    /**
     * Update the specified producto externo in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $productoExterno = ProductoExterno::find($id);

            if (!$productoExterno) {
                return response()->json(['error' => 'Producto externo no encontrado'], 404);
            }

            $request->validate([
                'heading' => 'nullable|json',
                'paragraphs' => 'nullable|json',
                'tables' => 'nullable|json',
                'images' => 'nullable|json',
            ]);

            // Convertir strings JSON a arrays si es necesario
            $data = [];

            if ($request->has('heading')) {
                $data['heading'] = is_string($request->heading) ? json_decode($request->heading, true) : $request->heading;
            }
            if ($request->has('paragraphs')) {
                $data['paragraphs'] = is_string($request->paragraphs) ? json_decode($request->paragraphs, true) : $request->paragraphs;
            }
            if ($request->has('tables')) {
                $data['tables'] = is_string($request->tables) ? json_decode($request->tables, true) : $request->tables;
            }
            if ($request->has('images')) {
                $data['images'] = is_string($request->images) ? json_decode($request->images, true) : $request->images;
            }

            $productoExterno->update($data);

            return response()->json($productoExterno);
        } catch (\Exception $e) {
            Log::error('Error al actualizar producto externo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar el producto externo'], 500);
        }
    }

    /**
     * Remove the specified producto externo from storage.
     */
    public function destroy($id)
    {
        try {
            $productoExterno = ProductoExterno::find($id);

            if (!$productoExterno) {
                return response()->json(['error' => 'Producto externo no encontrado'], 404);
            }

            $productoExterno->delete();

            return response()->json(['message' => 'Producto externo eliminado exitosamente']);
        } catch (\Exception $e) {
            Log::error('Error al eliminar producto externo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar el producto externo'], 500);
        }
    }
}
