<?php

namespace App\Http\Controllers\CRM\Productos;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Subcategoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductoGestionController extends Controller
{
    /**
     * Display the CRM products index page
     */
    public function index()
    {
        return Inertia::render('CRM/Productos/Productos');
    }

    /**
     * Get products for CRM with search, pagination and filters
     * Endpoint: /api/productos/crm
     */
    public function getProductosCRM(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $marcaId = $request->input('marca_id');
            $subcategoriaId = $request->input('subcategoria_id');
            $categoriaId = $request->input('categoria_id');
            
            // Validar per_page
            $perPage = max(1, min(100, (int)$perPage));
            
            $query = Producto::with(['marca', 'subcategoria.categoria']);
            
            // Aplicar filtro de búsqueda
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'LIKE', '%' . $search . '%')
                      ->orWhere('sku', 'LIKE', '%' . $search . '%')
                      ->orWhere('descripcion', 'LIKE', '%' . $search . '%')
                      ->orWhereHas('marca', function($subQuery) use ($search) {
                          $subQuery->where('nombre', 'LIKE', '%' . $search . '%');
                      });
                });
            }
            
            // Filtro por marca
            if ($marcaId) {
                $query->where('marca_id', $marcaId);
            }
            
            // Filtro por subcategoría
            if ($subcategoriaId) {
                $query->where('id_subcategoria', $subcategoriaId);
            }
            
            // Filtro por categoría
            if ($categoriaId) {
                $query->whereHas('subcategoria', function($subQuery) use ($categoriaId) {
                    $subQuery->where('id_categoria', $categoriaId);
                });
            }
            
            // Ordenar por fecha de creación descendente
            $query->orderBy('created_at', 'desc');
            
            $productos = $query->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json($productos);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener productos CRM: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener productos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products excluding services for CRM
     * Endpoint: /api/productos/excluye-servicios
     */
    public function getProductosExcluyeServicios(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            
            // Validar per_page
            $perPage = max(1, min(100, (int)$perPage));
            
            $query = Producto::with(['marca', 'subcategoria.categoria']);
            
            // Excluir productos que sean servicios (asumiendo que los servicios tienen una característica específica)
            // Puedes ajustar esta lógica según cómo identifiques los servicios en tu sistema
            $query->where(function($q) {
                $q->whereNull('caracteristicas')
                  ->orWhere('caracteristicas', 'not like', '%servicio%')
                  ->orWhere('caracteristicas', 'not like', '%service%');
            });
            
            // Aplicar filtro de búsqueda
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'LIKE', '%' . $search . '%')
                      ->orWhere('sku', 'LIKE', '%' . $search . '%')
                      ->orWhere('descripcion', 'LIKE', '%' . $search . '%')
                      ->orWhereHas('marca', function($subQuery) use ($search) {
                          $subQuery->where('nombre', 'LIKE', '%' . $search . '%');
                      });
                });
            }
            
            // Ordenar por fecha de creación descendente
            $query->orderBy('created_at', 'desc');
            
            $productos = $query->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json($productos);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener productos excluyendo servicios: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener productos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific product for CRM
     */
    public function show($id)
    {
        try {
            $producto = Producto::with(['marca', 'subcategoria.categoria', 'tags.tagParent'])
                               ->findOrFail($id);
            
            return response()->json($producto);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener producto: ' . $e->getMessage());
            return response()->json([
                'error' => 'Producto no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a product from CRM
     * Endpoint: /api/productos/crm/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $producto = Producto::findOrFail($id);
            
            // Validar los datos de entrada
            $validatedData = $request->validate([
                'nombre' => 'sometimes|string|max:255',
                'sku' => 'sometimes|string|max:100',
                'descripcion' => 'sometimes|string',
                'precio_sin_ganancia' => 'sometimes|numeric|min:0',
                'precio_ganancia' => 'sometimes|numeric|min:0',
                'precio_igv' => 'sometimes|numeric|min:0',
                'marca_id' => 'sometimes|exists:marcas,id_marca',
                'id_subcategoria' => 'sometimes|exists:subcategorias,id_subcategoria',
                'pais' => 'sometimes|string|max:100',
                'envio' => 'sometimes|string',
                'soporte_tecnico' => 'sometimes|string',
                'caracteristicas' => 'sometimes|array',
                'especificaciones_tecnicas' => 'sometimes|string',
                'video' => 'sometimes|string',
            ]);
            
            // Actualizar el producto
            $producto->update($validatedData);
            
            // Invalidar cache relacionado
            Cache::forget("producto_{$producto->id_producto}");
            Cache::forget('todas_categorias');
            
            // Recargar el producto con relaciones
            $producto = $producto->fresh(['marca', 'subcategoria.categoria']);
            
            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado correctamente',
                'producto' => $producto
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al actualizar producto CRM: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al actualizar producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all brands for filters
     */
    public function getMarcas()
    {
        try {
            $marcas = Marca::orderBy('nombre')->get();
            return response()->json($marcas);
        } catch (\Exception $e) {
            Log::error('Error al obtener marcas: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener marcas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all subcategories for filters
     */
    public function getSubcategorias()
    {
        try {
            $subcategorias = Subcategoria::with('categoria')
                                        ->orderBy('nombre')
                                        ->get();
            return response()->json($subcategorias);
        } catch (\Exception $e) {
            Log::error('Error al obtener subcategorías: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener subcategorías',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories for filters
     */
    public function getCategorias()
    {
        try {
            $categorias = \App\Models\Categoria::orderBy('nombre')->get();
            return response()->json($categorias);
        } catch (\Exception $e) {
            Log::error('Error al obtener categorías: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener categorías',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product from CRM
     */
    public function destroy($id)
    {
        try {
            $producto = Producto::findOrFail($id);
            
            // Eliminar las imágenes si existen
            if ($producto->imagen) {
                $imagenes = is_array($producto->imagen) ? $producto->imagen : [$producto->imagen];
                foreach ($imagenes as $imagen) {
                    if ($imagen && !str_starts_with($imagen, 'http') && file_exists(public_path($imagen))) {
                        unlink(public_path($imagen));
                    }
                }
            }
            
            // Eliminar las relaciones bidireccionales
            $producto->productosRelacionados()->detach();
            Producto::whereHas('productosRelacionados', function($query) use ($id) {
                $query->where('relacionado_id', $id);
            })->each(function($p) use ($id) {
                $p->productosRelacionados()->detach($id);
            });
            
            // Eliminar tags
            $producto->tags()->detach();
            
            // Eliminar el producto
            $producto->delete();
            
            // Invalidar cache
            Cache::forget("producto_{$id}");
            Cache::forget('todas_categorias');
            
            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado correctamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al eliminar producto CRM: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al eliminar producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new product from CRM
     */
    public function store(Request $request)
    {
        try {
            // Validar los datos de entrada
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'sku' => 'required|string|max:100|unique:productos,sku',
                'descripcion' => 'nullable|string',
                'precio_sin_ganancia' => 'required|numeric|min:0',
                'precio_ganancia' => 'nullable|numeric|min:0',
                'precio_igv' => 'nullable|numeric|min:0',
                'marca_id' => 'required|exists:marcas,id_marca',
                'id_subcategoria' => 'required|exists:subcategorias,id_subcategoria',
                'pais' => 'nullable|string|max:100',
                'envio' => 'nullable|string',
                'soporte_tecnico' => 'nullable|string',
                'caracteristicas' => 'nullable|array',
                'especificaciones_tecnicas' => 'nullable|string',
                'video' => 'nullable|string',
            ]);
            
            // Crear el producto
            $producto = Producto::create($validatedData);
            
            // Invalidar cache
            Cache::forget('todas_categorias');
            
            // Cargar relaciones
            $producto->load(['marca', 'subcategoria.categoria']);
            
            return response()->json([
                'success' => true,
                'message' => 'Producto creado correctamente',
                'producto' => $producto
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al crear producto CRM: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al crear producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subcategories by category ID for CRM filters
     * Endpoint: /api/productos/crm/subcategorias/{categoria_id}
     */
    public function getSubcategoriasByCategoria($categoria_id)
    {
        try {
            $subcategorias = Subcategoria::where('id_categoria', $categoria_id)
                ->orderBy('nombre')
                ->get(['id_subcategoria', 'nombre']);

            return response()->json($subcategorias);

        } catch (\Exception $e) {
            Log::error('Error al obtener subcategorías por categoría: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener subcategorías',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search products for quotations (optimized for autocomplete)
     * Endpoint: /api/productos/crm/buscar
     */
    public function buscarProductos(Request $request)
    {
        try {
            $search = $request->input('q', '');
            $limit = $request->input('limit', 20);

            // Validar limit
            $limit = max(1, min(50, (int)$limit));

            if (empty($search) || strlen($search) < 2) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $productos = Producto::with(['marca', 'subcategoria.categoria'])
                ->where(function($query) use ($search) {
                    $query->where('nombre', 'LIKE', '%' . $search . '%')
                          ->orWhere('sku', 'LIKE', '%' . $search . '%')
                          ->orWhere('descripcion', 'LIKE', '%' . $search . '%')
                          ->orWhereHas('marca', function($subQuery) use ($search) {
                              $subQuery->where('nombre', 'LIKE', '%' . $search . '%');
                          });
                })
                // Excluir servicios si es necesario
                ->where(function($q) {
                    $q->whereNull('caracteristicas')
                      ->orWhere('caracteristicas', 'not like', '%servicio%')
                      ->orWhere('caracteristicas', 'not like', '%service%');
                })
                ->limit($limit)
                ->orderByRaw("
                    CASE
                        WHEN nombre LIKE ? THEN 1
                        WHEN sku LIKE ? THEN 2
                        WHEN nombre LIKE ? THEN 3
                        ELSE 4
                    END
                ", [$search . '%', $search . '%', '%' . $search . '%'])
                ->get()
                ->map(function($producto) {
                    return [
                        'id' => $producto->id_producto,
                        'nombre' => $producto->nombre,
                        'sku' => $producto->sku,
                        'descripcion' => $producto->descripcion,
                        'precio' => $producto->precio_igv ?? $producto->precio_ganancia ?? $producto->precio_sin_ganancia ?? 0,
                        'precio_sin_igv' => $producto->precio_ganancia ?? $producto->precio_sin_ganancia ?? 0,
                        'marca' => $producto->marca ? $producto->marca->nombre : null,
                        'categoria' => $producto->subcategoria && $producto->subcategoria->categoria
                            ? $producto->subcategoria->categoria->nombre
                            : null,
                        'subcategoria' => $producto->subcategoria ? $producto->subcategoria->nombre : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $productos
            ]);

        } catch (\Exception $e) {
            Log::error('Error al buscar productos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al buscar productos',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}