<?php

namespace App\Http\Controllers\CRM\Productos;

use App\Http\Controllers\Controller;
use App\Models\ProductoTemporal;
use App\Models\Marca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductoTemporalController extends Controller
{
    /**
     * Display a listing of temporary products
     */
    public function index(Request $request)
    {
        try {
            $query = ProductoTemporal::with('marca:id_marca,nombre');

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('procedencia', 'like', "%{$search}%");
                });
            }

            // Brand filter
            if ($request->has('marca_id') && $request->marca_id) {
                $query->where('marca_id', $request->marca_id);
            }

            // Sorting
            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Pagination
            $perPage = $request->input('per_page', 15);
            $productos = $query->paginate($perPage);

            // If AJAX request, return JSON
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json($productos);
            }

            // Render view with Inertia
            return Inertia::render('CRM/Productos/ProductosTemporales', [
                'productos' => $productos->items(),
                'pagination' => [
                    'current_page' => $productos->currentPage(),
                    'last_page' => $productos->lastPage(),
                    'per_page' => $productos->perPage(),
                    'total' => $productos->total(),
                    'from' => $productos->firstItem(),
                    'to' => $productos->lastItem(),
                ],
                'filters' => $request->only(['search', 'marca_id', 'sort_field', 'sort_direction'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener productos temporales: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener productos temporales',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all temporary products for quotations (without pagination)
     */
    public function getAllForQuotation(Request $request)
    {
        try {
            $query = ProductoTemporal::with('marca:id_marca,nombre');

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('procedencia', 'like', "%{$search}%");
                });
            }

            // Brand filter
            if ($request->has('marca_id') && $request->marca_id) {
                $query->where('marca_id', $request->marca_id);
            }

            $productos = $query->orderBy('descripcion')->get();

            return response()->json([
                'success' => true,
                'productos' => $productos
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener productos temporales para cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener productos temporales',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created temporary product
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio' => 'required|numeric|min:0',
                'marca_id' => 'nullable|exists:marcas,id_marca',
                'procedencia' => 'nullable|string|max:255',
                'especificaciones_tecnicas' => 'nullable|array',
                'imagenes' => 'nullable|array',
                'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only([
                'titulo',
                'marca_id',
                'descripcion',
                'especificaciones_tecnicas',
                'procedencia',
                'precio'
            ]);

            // Handle image uploads
            if ($request->hasFile('imagenes')) {
                $imagenes = [];
                foreach ($request->file('imagenes') as $imagen) {
                    $path = $imagen->store('productos_temporales', 'public');
                    $imagenes[] = $path;
                }
                $data['imagenes'] = $imagenes;
            }

            $producto = ProductoTemporal::create($data);
            $producto->load('marca');

            return response()->json([
                'success' => true,
                'message' => 'Producto temporal creado exitosamente',
                'producto' => $producto
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear producto temporal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al crear producto temporal',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified temporary product
     */
    public function show($id)
    {
        try {
            $producto = ProductoTemporal::with('marca')->findOrFail($id);

            return response()->json([
                'success' => true,
                'producto' => $producto
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener producto temporal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Producto temporal no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified temporary product
     */
    public function update(Request $request, $id)
    {
        try {
            $producto = ProductoTemporal::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'titulo' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio' => 'sometimes|required|numeric|min:0',
                'marca_id' => 'nullable|exists:marcas,id_marca',
                'procedencia' => 'nullable|string|max:255',
                'especificaciones_tecnicas' => 'nullable|array',
                'imagenes' => 'nullable|array',
                'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'imagenes_eliminadas' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only([
                'titulo',
                'marca_id',
                'descripcion',
                'especificaciones_tecnicas',
                'procedencia',
                'precio'
            ]);

            // Handle deleted images
            if ($request->has('imagenes_eliminadas')) {
                $imagenesActuales = $producto->imagenes ?? [];
                foreach ($request->imagenes_eliminadas as $imagenEliminada) {
                    if (($key = array_search($imagenEliminada, $imagenesActuales)) !== false) {
                        Storage::disk('public')->delete($imagenEliminada);
                        unset($imagenesActuales[$key]);
                    }
                }
                $data['imagenes'] = array_values($imagenesActuales);
            }

            // Handle new image uploads
            if ($request->hasFile('imagenes')) {
                $imagenesActuales = $data['imagenes'] ?? $producto->imagenes ?? [];
                foreach ($request->file('imagenes') as $imagen) {
                    $path = $imagen->store('productos_temporales', 'public');
                    $imagenesActuales[] = $path;
                }
                $data['imagenes'] = $imagenesActuales;
            }

            $producto->update($data);
            $producto->load('marca');

            return response()->json([
                'success' => true,
                'message' => 'Producto temporal actualizado exitosamente',
                'producto' => $producto
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar producto temporal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar producto temporal',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified temporary product
     */
    public function destroy($id)
    {
        try {
            $producto = ProductoTemporal::findOrFail($id);

            // Delete associated images
            if ($producto->imagenes) {
                foreach ($producto->imagenes as $imagen) {
                    Storage::disk('public')->delete($imagen);
                }
            }

            $producto->delete();

            return response()->json([
                'success' => true,
                'message' => 'Producto temporal eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar producto temporal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar producto temporal',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete temporary products
     */
    public function bulkDelete(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array',
                'ids.*' => 'required|exists:productos_temporales,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $productos = ProductoTemporal::whereIn('id', $request->ids)->get();

            // Delete associated images
            foreach ($productos as $producto) {
                if ($producto->imagenes) {
                    foreach ($producto->imagenes as $imagen) {
                        Storage::disk('public')->delete($imagen);
                    }
                }
            }

            ProductoTemporal::whereIn('id', $request->ids)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Productos temporales eliminados exitosamente',
                'count' => count($request->ids)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar productos temporales: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar productos temporales',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get brands for temporary products
     */
    public function getMarcas()
    {
        try {
            $marcas = Marca::select('id_marca', 'nombre')
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'marcas' => $marcas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener marcas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener marcas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search temporary products
     */
    public function search(Request $request)
    {
        try {
            $search = $request->input('search', '');
            $limit = $request->input('limit', 10);

            $productos = ProductoTemporal::with('marca:id_marca,nombre')
                ->where(function ($query) use ($search) {
                    $query->where('titulo', 'like', "%{$search}%")
                          ->orWhere('descripcion', 'like', "%{$search}%")
                          ->orWhere('procedencia', 'like', "%{$search}%");
                })
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'productos' => $productos
            ]);
        } catch (\Exception $e) {
            Log::error('Error al buscar productos temporales: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al buscar productos temporales',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
