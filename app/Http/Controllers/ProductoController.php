<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use  Inertia\Inertia;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Marca;

class ProductoController extends Controller
{
     /* Vista de productos */
     public function ProductView(Request $request, $producto_id)
     {
        // Obtener el producto desde la solicitud
        $producto = Producto::with('marca')->find($producto_id);
    
        // Renderizar la vista con Inertia y pasar el producto
        return Inertia::render('Product', compact('producto'));
     }

     /* vista de subcategoria */
     public function subCategoriaView(Request $request, $subcategoria_id)
    {
        // Obtener el ID de la subcategoría desde la solicitud
        $id = $request->id;
    
        // Obtener los productos de la subcategoría y cargar la relación 'marca'
        $productos = Producto::with('marca')->where('id_subcategoria', $id)->get();
    
        // Renderizar la vista con Inertia y pasar los productos
        return Inertia::render('Subcategorias', compact('productos'));
    }

    /* Vista de productos por marca view */
    public function ProductViewByMarca(Request $request, $marca_id)
    {
        // Obtener todos los productos de la marca especificada
        $productos = Producto::with('marca')
            ->where('marca_id', $marca_id)
            ->get();
    
        // Renderizar la vista con Inertia y pasar los productos
        return Inertia::render('Marcas', compact('productos'));
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
            'datos_tecnicos' => 'nullable|json',
            "especificaciones_tecnicas" => 'nullable|string|json', 
        ]);
    
        // Procesar la imagen si se proporciona
        $imagePath = null;
    
        if ($request->hasFile('imagen')) {
            try {
                $image = $request->file('imagen');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $imagePath = 'productos/' . $imageName;
                $image->move(public_path('productos'), $imageName);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al subir la imagen.'], 500);
            }
        }
    
        // Convertir caracteristicas y datos_tecnicos a arrays si son strings JSON
        $caracteristicas = is_string($request->caracteristicas) ? json_decode($request->caracteristicas, true) : $request->caracteristicas;
        $datos_tecnicos = is_string($request->datos_tecnicos) ? json_decode($request->datos_tecnicos, true) : $request->datos_tecnicos;
    
        // Crear el producto
        $producto = Producto::create(array_merge($request->except('imagen'), [
            'imagen' => $imagePath,
            'caracteristicas' => $caracteristicas,
            'datos_tecnicos' => $datos_tecnicos,
        ]));
    
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
        
        // Recargar el producto con la relación marca
        $producto = $producto->fresh('marca');
        
        return response()->json($producto);
    }

    // obtener todos los productos con paginación
    public function getProductosAll(Request $request)
    {
        $perPage = $request->input('per_page', 50); // Default 50 items per page
        $productos = Producto::paginate($perPage);
        return response()->json($productos);
    }
    // Obtener todos los productos
    public function getProductos(Request $request)
    {
        $perPage = $request->input('per_page', 50); // Default 50 items per page
        $productos = Producto::with('marca')->paginate($perPage);
        return response()->json($productos);
    }


    // Obtener todos los productos con su imagen
    public function getProductosImagen()
    {
        $productos = Producto::all(); // No es necesario usar 'with' para la imagen
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
            'producto' => 'required|string|min:3'
        ]);

        $producto = $request->input('producto');
        

        $productos = Producto::with('marca')
            ->where('nombre', 'LIKE', '%' . $producto . '%')
            ->orWhere('sku', 'LIKE', '%' . $producto . '%')
            ->get();


        return response()->json($productos);
    }
    /**
     * Actualizar solo la imagen de un producto
     */
    public function updateProductImage(Request $request)
    {
        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'imagen' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        // Buscar el producto por ID
        $producto = Producto::find($request->id_producto);
        
        try {
            // Eliminar la imagen anterior si existe
            if ($producto->imagen && file_exists(public_path($producto->imagen))) {
                unlink(public_path($producto->imagen));
            }
            
            // Procesar la nueva imagen
            $image = $request->file('imagen');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $imagePath = 'productos/' . $imageName;
            $image->move(public_path('productos'), $imageName);
            
            // Actualizar solo el campo de imagen
            $producto->imagen = $imagePath;
            $producto->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Imagen actualizada correctamente',
                'producto' => $producto->fresh('marca')
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar la imagen: ' . $e->getMessage()
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

        $producto->productosRelacionados()->attach($request->relacionado_id, ['tipo' => $request->tipo]);

        return response()->json(['message' => 'Relación agregada correctamente']);
    }
    /**
     * Obtener productos relacionados
     */
    public function obtenerRelacionados($id)
    {
        $producto = Producto::with('productosRelacionados')->findOrFail($id);
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

}

    
