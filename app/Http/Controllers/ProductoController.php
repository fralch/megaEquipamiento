<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use  Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Marca;

class ProductoController extends Controller
{
     /* Vista de productos */
     public function ProductView(Request $request, $producto_id)
     {
        // Cache por 30 minutos para cada producto
        $producto = Cache::remember("producto_{$producto_id}", 1800, function () use ($producto_id) {
            return Producto::with(['marca', 'subcategoria', 'productosRelacionados'])->find($producto_id);
        });
    
        // Renderizar la vista con Inertia y pasar el producto
        return Inertia::render('Product', compact('producto'));
     }

     /* vista de subcategoria */
     public function subCategoriaView(Request $request, $subcategoria_id, $marca_id = null)
    {
        // Usar el ID de la subcategoría desde el parámetro de la ruta
        $id = $subcategoria_id;
        
        // El ID de la marca viene como parámetro opcional de la ruta
        // $marca_id ya está disponible como parámetro de la función

        // Obtener la subcategoría por su ID
        $subcategoria = Subcategoria::find($id);

        if (!$subcategoria) {
            return response()->json(['error' => 'Subcategoría no encontrada'], 404);
        }

        // Obtener solo las marcas que tienen productos en esta subcategoría específica
        $marcas = Marca::whereHas('productos', function($query) use ($id) {
            $query->where('id_subcategoria', $id);
        })->get();

        // Construir la consulta base para productos de la subcategoría
        $query = Producto::with('marca')->where('id_subcategoria', $id);
        
        // Si se proporciona un ID de marca, agregar el filtro
        if ($marca_id) {
            $query->where('marca_id', $marca_id);
        }
        
        // Ejecutar la consulta
        $productos = $query->get();
    
        // Renderizar la vista con Inertia y pasar los productos
        if ($marca_id) {
            // Si hay marca_id, renderizar Subcategorias-marcas y pasar el marcaId
            return Inertia::render('Subcategorias-marcas', [
                'productos' => $productos,
                'marcaId' => $marca_id,
                'marcas' => $marcas
            ]);
        } else {
            // Si no hay marca_id, renderizar la vista normal
            return Inertia::render('Subcategorias', [
                'productos' => $productos,
                'marcas' => $marcas
            ]);
        }
    }

    /* Vista de productos por marca view */
    public function ProductViewByMarca(Request $request, $marca_id)
    {
        // Obtener la información de la marca
        $marca = Marca::find($marca_id);
        
        // Obtener todos los productos de la marca especificada
        $productos = Producto::with('marca')
            ->where('marca_id', $marca_id)
            ->get();
    
        // Renderizar la vista con Inertia y pasar tanto la marca como los productos
        return Inertia::render('Marcas', compact('marca', 'productos'));
    }


    /**
     * Crear producto
     */
    public function createProduct(Request $request)
    {
        $request->validate([
            'sku' => 'required|max:100',
            'nombre' => 'required|max:100',
            'id_subcategoria' => 'required|exists:subcategorias,id_subcategoria',
            'marca_id' => 'required|exists:marcas,id_marca',
            'pais' => 'nullable|max:100',
            'precio_sin_ganancia' => 'nullable|numeric',
            'precio_ganancia' => 'nullable|numeric',
            'precio_igv' => 'nullable|numeric',
            'imagen' =>  'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
            'descripcion' => 'nullable|string',
            'video' => 'nullable|string|max:255',
            'envio' => 'nullable|string|max:100',
            'soporte_tecnico' => 'nullable|string',
            'caracteristicas' => 'nullable|json',

            "especificaciones_tecnicas" => 'nullable|string|json', 
            'archivos_adicionales' => 'nullable|string',
        ]);
    
        // Procesar las imágenes si se proporcionan
        $imagenesArray = [];

        if ($request->has('imagenesDelBanco')) {
            $imagenesDelBanco = json_decode($request->input('imagenesDelBanco'), true);
            $imagenesArray = array_map(function($imagen) {
                return $imagen['url'];
            }, $imagenesDelBanco);
        } elseif ($request->hasFile('imagenes')) {
            try {
                $imagenes = $request->file('imagenes');
                foreach ($imagenes as $index => $imagen) {
                    $imageName = time() . '_' . $index . '.' . $imagen->getClientOriginalExtension();
                    $imagePath = 'productos/' . $imageName;
                    $imagen->move(public_path('productos'), $imageName);
                    $imagenesArray[] = $imagePath;
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al subir las imágenes.'], 500);
            }
        } elseif ($request->hasFile('imagen')) {
            // Mantener compatibilidad con imagen única
            try {
                $image = $request->file('imagen');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $imagePath = 'productos/' . $imageName;
                $image->move(public_path('productos'), $imageName);
                $imagenesArray[] = $imagePath;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al subir la imagen.'], 500);
            }
        }
    
        // Convertir caracteristicas a array si es string JSON
        $caracteristicas = is_string($request->caracteristicas) ? json_decode($request->caracteristicas, true) : $request->caracteristicas;
    
        // Crear el producto
        $producto = Producto::create(array_merge($request->except(['imagen', 'imagenes', 'imagenesDelBanco']), [
            'imagen' => $imagenesArray,
            'caracteristicas' => $caracteristicas,

        ]));
    
        // Invalidar cache relacionado
        Cache::forget('todas_categorias');
        Cache::forget("producto_{$producto->id_producto}");
    
        return response()->json($producto);
    }
    
    
    

    /**
     * Actualizar producto
     */
    public function updateProduct(Request $request)
    {
        // Buscar el producto por ID
        $producto = Producto::find($request->id_producto);
        
        // Verificar si el producto existe
        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
        
        // Obtener todos los datos de la solicitud excepto el id_producto
        $dataToUpdate = $request->except('id_producto');
        
        // Actualizar el producto con el campo proporcionado
        $producto->update($dataToUpdate);
        
        // Invalidar cache del producto específico
        Cache::forget("producto_{$producto->id_producto}");
        Cache::forget('todas_categorias');
        
        // Recargar el producto con la relación marca
        $producto = $producto->fresh('marca');
        
        return response()->json($producto);
    }

    public function productsAdminView(Request $request)
    {
        return Inertia::render('AdminProducts');
    }

    // obtener todos los productos con paginación
    public function getProductosAll(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        
        $perPage = max(1, min(100, (int)$perPage));
        
        $productos = Producto::with('marca')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
            
        return response()->json($productos);
    }

    // Obtener todos los productos
    public function getProductos(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        
        $perPage = max(1, min(100, (int)$perPage));
        
        $productos = Producto::with('marca')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
            
        return response()->json($productos);
    }


    // Obtener todos los productos con su imagen
    public function getProductosImagen()
    {
        $productos = Producto::with('marca')->get(); // Incluir relación de marca
        return response()->json($productos);
    }

    // Obtener un producto
    public function showProduct($producto_id)
    {
        // Obtener el producto desde la solicitud
        $producto = Producto::with('marca')->find($producto_id);

        // Devolver el producto con los datos de la marca
        return response()->json($producto);
    }

    // Obtener la imagen de un producto
    public function getImagenProducto(Producto $producto)
    {
        return response()->json(['imagen' => $producto->imagen]);
    }

    // Obtener producto por subcategoria id
    public function getProductosSubcategoria($subcategoria_id)
    {
        // Obtener los productos de la subcategoría y cargar la relación 'marca'
        $productos = Producto::with('marca')->where('id_subcategoria', $subcategoria_id)->get();

        // Devolver los productos con los datos de la marca
        return response()->json($productos);
    }

    

    /**
     * Buscar productos por iniciales
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function buscarPorIniciales(Request $request)
    {
        $request->validate([
            'producto' => 'required|string|min:2'
        ]);

        $termino = $request->input('producto');
        
        // Buscar productos que coincidan con el término
        $productos = Producto::with(['marca', 'subcategoria.categoria'])
            ->where('nombre', 'LIKE', '%' . $termino . '%')
            ->orWhere('sku', 'LIKE', '%' . $termino . '%')
            ->get();

        // Buscar marcas que coincidan con el término O que tengan productos que coincidan
        $marcasDirectas = \App\Models\Marca::where('nombre', 'LIKE', '%' . $termino . '%')
            ->with(['productos' => function($query) {
                $query->with(['marca', 'subcategoria.categoria'])->limit(5);
            }])
            ->get();
            
        // Obtener marcas de los productos encontrados
        $marcasDeProductos = \App\Models\Marca::whereHas('productos', function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%');
            })
            ->with(['productos' => function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%')
                      ->with(['marca', 'subcategoria.categoria'])
                      ->limit(5);
            }])
            ->get();
            
        // Combinar ambas colecciones de marcas y eliminar duplicados
        $marcas = $marcasDirectas->merge($marcasDeProductos)->unique('id_marca');

        // Buscar categorías que coincidan con el término O que tengan productos que coincidan
        $categoriasDirectas = \App\Models\Categoria::where('nombre', 'LIKE', '%' . $termino . '%')
            ->with(['subcategorias.productos' => function($query) {
                $query->with(['marca', 'subcategoria.categoria'])->limit(5);
            }])
            ->get();
            
        // Obtener categorías de los productos encontrados
        $categoriasDeProductos = \App\Models\Categoria::whereHas('subcategorias.productos', function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%');
            })
            ->with(['subcategorias.productos' => function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%')
                      ->with(['marca', 'subcategoria.categoria'])
                      ->limit(5);
            }])
            ->get();
            
        // Combinar ambas colecciones de categorías y eliminar duplicados
        $categorias = $categoriasDirectas->merge($categoriasDeProductos)->unique('id_categoria');

        // Buscar subcategorías que coincidan con el término O que tengan productos que coincidan
        $subcategoriasDirectas = \App\Models\Subcategoria::where('nombre', 'LIKE', '%' . $termino . '%')
            ->with(['productos' => function($query) {
                $query->with(['marca', 'subcategoria.categoria'])->limit(5);
            }, 'categoria'])
            ->get();
            
        // Obtener subcategorías de los productos encontrados
        $subcategoriasDeProductos = \App\Models\Subcategoria::whereHas('productos', function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%');
            })
            ->with(['productos' => function($query) use ($termino) {
                $query->where('nombre', 'LIKE', '%' . $termino . '%')
                      ->orWhere('sku', 'LIKE', '%' . $termino . '%')
                      ->with(['marca', 'subcategoria.categoria'])
                      ->limit(5);
            }, 'categoria'])
            ->get();
            
        // Combinar ambas colecciones de subcategorías y eliminar duplicados
        $subcategorias = $subcategoriasDirectas->merge($subcategoriasDeProductos)->unique('id_subcategoria');

        // Estructurar la respuesta
        $respuesta = [
            'productos' => $productos,
            'marcas' => $marcas->map(function($marca) {
                 return [
                     'id_marca' => $marca->id_marca,
                     'nombre' => $marca->nombre,
                     'tipo' => 'marca',
                     'productos_relacionados' => $marca->productos
                 ];
             }),
            'categorias' => $categorias->map(function($categoria) {
                $productosCategoria = collect();
                foreach($categoria->subcategorias as $subcategoria) {
                    $productosCategoria = $productosCategoria->merge($subcategoria->productos);
                }
                return [
                    'id_categoria' => $categoria->id_categoria,
                    'nombre' => $categoria->nombre,
                    'tipo' => 'categoria',
                    'productos_relacionados' => $productosCategoria->take(5)
                ];
            }),
            'subcategorias' => $subcategorias->map(function($subcategoria) {
                return [
                    'id_subcategoria' => $subcategoria->id_subcategoria,
                    'nombre' => $subcategoria->nombre,
                    'categoria_nombre' => $subcategoria->categoria ? $subcategoria->categoria->nombre : '',
                    'categoria_id' => $subcategoria->categoria ? $subcategoria->categoria->id_categoria : null,
                    'tipo' => 'subcategoria',
                    'productos_relacionados' => $subcategoria->productos
                ];
            })
        ];

        return response()->json($respuesta);
    }
    /**
     * Actualizar solo la imagen de un producto
     */
    public function updateProductImage(Request $request)
    {
        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'imagen.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);
        
        // Buscar el producto por ID
        $producto = Producto::find($request->id_producto);
        
        try {
            $imagenesArray = [];

            // Verificar si se están usando imágenes del banco
            if ($request->has('imagenesDelBanco')) {
                $imagenesDelBanco = json_decode($request->input('imagenesDelBanco'), true);
                if ($imagenesDelBanco && is_array($imagenesDelBanco)) {
                    // Mantener las imágenes existentes y agregar las del banco
                    $imagenesExistentes = $producto->imagen;
                    if ($imagenesExistentes && is_array($imagenesExistentes)) {
                        $imagenesArray = $imagenesExistentes;
                    } elseif ($imagenesExistentes) {
                        $imagenesArray = [$imagenesExistentes];
                    }
                    
                    // Agregar las nuevas imágenes del banco
                    foreach ($imagenesDelBanco as $imagenBanco) {
                        if (isset($imagenBanco['url'])) {
                            $imagenesArray[] = $imagenBanco['url'];
                        }
                    }
                }
            }
            // Si se suben archivos normales (reemplazar todas las imágenes)
            else {
                // Eliminar las imágenes anteriores si existen (solo para archivos nuevos)
                if ($producto->imagen) {
                    $imagenesAnteriores = is_array($producto->imagen) ? $producto->imagen : [$producto->imagen];
                    foreach ($imagenesAnteriores as $imagenAnterior) {
                        if ($imagenAnterior && !str_starts_with($imagenAnterior, 'http') && file_exists(public_path($imagenAnterior))) {
                            unlink(public_path($imagenAnterior));
                        }
                    }
                }

                // Procesar múltiples imágenes con formato imagen[0], imagen[1], etc.
                if ($request->has('imagen') && is_array($request->file('imagen'))) {
                    $imagenes = $request->file('imagen');
                    
                    foreach ($imagenes as $index => $imagen) {
                        if ($imagen && $imagen->isValid()) {
                            // Procesar imagen normalmente para el producto
                            $imageName = time() . '_' . $index . '.' . $imagen->getClientOriginalExtension();
                            $imagePath = 'productos/' . $imageName;
                            
                            // Crear directorio si no existe
                            $destDir = public_path('productos');
                            if (!is_dir($destDir)) {
                                if (!mkdir($destDir, 0755, true)) {
                                    throw new \Exception("No se pudo crear el directorio: $destDir");
                                }
                            }
                            
                            // Usar una ruta temporal y copiar manualmente si move() falla
                            $tempPath = $imagen->getPathname();
                            $finalPath = $destDir . DIRECTORY_SEPARATOR . $imageName;
                            
                            \Log::info("Copiando desde: $tempPath a: $finalPath");
                            
                            // Intentar primero move(), luego copy() como fallback
                            if (!$imagen->move($destDir, $imageName)) {
                                if (!copy($tempPath, $finalPath)) {
                                    throw new \Exception("No se pudo copiar el archivo desde $tempPath a $finalPath");
                                }
                            }
                            
                            $imagenesArray[] = $imagePath;
                        }
                    }
                }
                // Mantener compatibilidad con el formato anterior 'imagenes'
                elseif ($request->hasFile('imagenes')) {
                    $imagenes = $request->file('imagenes');
                    $destDir = public_path('productos');
                    if (!file_exists($destDir)) {
                        mkdir($destDir, 0755, true);
                    }
                    
                    foreach ($imagenes as $index => $imagen) {
                        $imageName = time() . '_' . $index . '.' . $imagen->getClientOriginalExtension();
                        $imagePath = 'productos/' . $imageName;
                        
                        if (!$imagen->move($destDir, $imageName)) {
                            throw new \Exception("No se pudo mover el archivo al directorio de destino: $destDir/$imageName");
                        }
                        
                        $imagenesArray[] = $imagePath;
                    }
                }
                // Mantener compatibilidad con imagen única
                elseif ($request->hasFile('imagen') && !is_array($request->file('imagen'))) {
                    $image = $request->file('imagen');
                    $imageName = time() . '.' . $image->getClientOriginalExtension();
                    $imagePath = 'productos/' . $imageName;
                    
                    $destDir = public_path('productos');
                    if (!file_exists($destDir)) {
                        mkdir($destDir, 0755, true);
                    }
                    
                    if (!$image->move($destDir, $imageName)) {
                        throw new \Exception("No se pudo mover el archivo al directorio de destino: $destDir/$imageName");
                    }
                    
                    $imagenesArray[] = $imagePath;
                }
            }
            
            // Actualizar el campo de imágenes
            $producto->imagen = $imagenesArray;
            $producto->save();
            
            // Invalidar cache del producto específico
            Cache::forget("producto_{$producto->id_producto}");
            
            return response()->json([
                'success' => true,
                'message' => 'Imágenes actualizadas correctamente',
                'imagen' => $imagenesArray,
                'producto' => $producto->fresh('marca')
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar las imágenes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una imagen específica de un producto
     */
    public function deleteProductImage(Request $request, $id)
    {
        $request->validate([
            'imagen' => 'required|string'
        ]);

        // Buscar el producto por ID
        $producto = Producto::find($id);
        
        if (!$producto) {
            return response()->json([
                'success' => false,
                'error' => 'Producto no encontrado'
            ], 404);
        }

        try {
            $imagenAEliminar = $request->input('imagen');
            $imagenesActuales = $producto->imagen;

            // Si no hay imágenes o está vacío
            if (!$imagenesActuales) {
                return response()->json([
                    'success' => false,
                    'error' => 'El producto no tiene imágenes'
                ], 400);
            }

            // Convertir a array si es un string
            if (!is_array($imagenesActuales)) {
                $imagenesActuales = [$imagenesActuales];
            }

            // Verificar si la imagen existe en el producto
            $indexImagenAEliminar = array_search($imagenAEliminar, $imagenesActuales);
            if ($indexImagenAEliminar === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'La imagen especificada no existe en este producto'
                ], 400);
            }

            // Eliminar el archivo físico si existe
            if (file_exists(public_path($imagenAEliminar))) {
                unlink(public_path($imagenAEliminar));
            }

            // Remover la imagen del array
            array_splice($imagenesActuales, $indexImagenAEliminar, 1);

            // Actualizar el producto - si no quedan imágenes, poner null
            $producto->imagen = empty($imagenesActuales) ? null : $imagenesActuales;
            $producto->save();

            // Invalidar cache del producto específico
            Cache::forget("producto_{$producto->id_producto}");

            return response()->json([
                'success' => true,
                'message' => 'Imagen eliminada correctamente',
                'imagen' => $producto->imagen,
                'producto' => $producto->fresh('marca')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a related product relationship
     * 
     * Example JSON request:
     * {
     *    "id": 1,              // ID of the main product
     *    "relacionado_id": 2,  // ID of the product to relate
     *    "tipo": "similar"     // Relationship type (e.g., "similar", "complementary", etc.)
     * }
     */
    public function agregarRelacion(Request $request)
    {
        $producto = Producto::findOrFail($request->id);

        // Validar si la relación ya existe
        $relacionExistente = $producto->productosRelacionados()
            ->where('relacionado_id', $request->relacionado_id)
            ->wherePivot('tipo', $request->tipo)
            ->exists();

        if ($relacionExistente) {
            return response()->json([
                'message' => 'La relación ya existe entre estos productos con el mismo tipo'
            ], 409); // 409 Conflict
        }

        $producto->productosRelacionados()->attach($request->relacionado_id, ['tipo' => $request->tipo]);

        return response()->json(['message' => 'Relación agregada correctamente']);
    }
    /**
     * Obtener productos relacionados
     */
    public function obtenerRelacionados($id)
    {
        $producto = Producto::with(['productosRelacionados.marca'])->findOrFail($id);
        return response()->json($producto->productosRelacionados);
    }

    /**
     * Obtener productos que tienen como relacionado al producto especificado
     * 
     * @param int $id ID del producto relacionado
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerProductosQueRelacionan($id)
    {
        // Buscar todos los productos que tienen como relacionado al producto con ID $id
        $productos = Producto::with('marca')
            ->whereHas('productosRelacionados', function($query) use ($id) {
                $query->where('relacionado_id', $id);
            })
            ->get();
        
        return response()->json($productos);
    }
    
    /**
     * Eliminar una relación entre productos
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function eliminarRelacion(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:productos,id_producto',
            'relacionado_id' => 'required|exists:productos,id_producto'
        ]);

        $idProductoPrincipal = $request->id;
        $idProductoRelacionado = $request->relacionado_id;

        // Encontrar el producto principal
        $productoPrincipal = Producto::findOrFail($idProductoPrincipal);
        
        // Eliminar la relación específica (Principal -> Relacionado)
        $productoPrincipal->productosRelacionados()->detach($idProductoRelacionado);

        // Buscar el producto relacionado para eliminar la relación inversa si existe
        $productoRelacionado = Producto::find($idProductoRelacionado);

        // Si el producto relacionado existe, eliminar la relación inversa (Relacionado -> Principal)
        if ($productoRelacionado) {
            $productoRelacionado->productosRelacionados()->detach($idProductoPrincipal);
        }

        return response()->json(['message' => 'Relación eliminada correctamente']);
    }

    /* 
        * Obtener productos por marca
        *
        * @param int $marca_id ID de la marca
        * @return \Illuminate\Http\JsonResponse
    */
    public function getProductosByMarca($marca_id, Request $request)
    {
        $perPage = $request->input('per_page', 50); // Default 50 items per page
        $productos = Producto::with('marca')
            ->where('marca_id', $marca_id)
            ->paginate($perPage);
        return response()->json($productos);
    }
    
    /**
     * Actualizar categoría, subcategoría, marca y país de un producto
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProductCategory(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'id_subcategoria' => 'nullable|exists:subcategorias,id_subcategoria',
            'marca_id' => 'nullable',  // Asegúrate que esto coincida con el nombre de la columna en tu base de datos
            'pais' => 'nullable|max:100',
        ]);
        
        try {
            // Buscar el producto por ID
            $producto = Producto::find($request->id_producto);
            
            // Verificar si el producto existe
            if (!$producto) {
                return response()->json(['error' => 'Producto no encontrado'], 404);
            }
            
            // Preparar los datos a actualizar
            $dataToUpdate = [];
            
            // Solo incluir los campos que están presentes en la solicitud
            if ($request->has('id_subcategoria')) {
                $dataToUpdate['id_subcategoria'] = $request->id_subcategoria;
            }
            if ($request->has('marca_id')) {
                $dataToUpdate['marca_id'] = $request->marca_id;
            }
            if ($request->has('pais')) {
                $dataToUpdate['pais'] = $request->pais;
            }
            
            // Actualizar solo los campos proporcionados
            if (!empty($dataToUpdate)) {
                $producto->update($dataToUpdate);
                // Invalidar cache del producto específico
                Cache::forget("producto_{$producto->id_producto}");
                Cache::forget('todas_categorias');
            }
            
            
            return response()->json($producto);
        } catch (\Exception $e) {
            // Registrar el error para depuración
            \Log::error('Error al actualizar producto: ' . $e->getMessage());
            
            // Devolver una respuesta de error
            return response()->json([
                'error' => 'Error al actualizar el producto',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /* Crear una funcion que elimine un producto */
    public function deleteProduct(Request $request, $id_producto)
    {
        try {
            // Buscar el producto
            $producto = Producto::findOrFail($id_producto);

            // Eliminar las imágenes si existen
            if ($producto->imagen) {
                $imagenes = is_array($producto->imagen) ? $producto->imagen : [$producto->imagen];
                foreach ($imagenes as $imagen) {
                    if ($imagen && file_exists(public_path($imagen))) {
                        unlink(public_path($imagen));
                    }
                }
            }

            // Eliminar las relaciones bidireccionales
            $producto->productosRelacionados()->detach(); // Elimina las relaciones donde este producto es el principal
            Producto::whereHas('productosRelacionados', function($query) use ($id_producto) {
                $query->where('relacionado_id', $id_producto);
            })->each(function($p) use ($id_producto) {
                $p->productosRelacionados()->detach($id_producto);
            });

            // Eliminar el producto
            $producto->delete();

            // Invalidar cache del producto específico
            Cache::forget("producto_{$id_producto}");
            Cache::forget('todas_categorias');

            // Verificar si es una petición AJAX
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Producto eliminado correctamente'
                ], 200);
            }

            return Inertia::location('/');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el producto: ' . $e->getMessage()
            ], 500);
        }
    }
}