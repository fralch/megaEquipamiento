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
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
    public function updateProduct(Request $request, Producto $producto)
    {
        // Reglas de validación basadas en los campos presentes
        $rules = [];
        
        // Solo añadir reglas para los campos que están presentes en la solicitud
        if ($request->has('sku')) {
            $rules['sku'] = 'required|max:100';
        }
        if ($request->has('nombre')) {
            $rules['nombre'] = 'required|max:100';
        }
        if ($request->has('id_subcategoria')) {
            $rules['id_subcategoria'] = 'required|exists:subcategorias,id_subcategoria';
        }
        if ($request->has('marca_id')) {
            $rules['marca_id'] = 'required|exists:marcas,id_marca';
        }
        if ($request->has('pais')) {
            $rules['pais'] = 'nullable|max:100';
        }
        if ($request->has('precio_sin_ganancia')) {
            $rules['precio_sin_ganancia'] = 'nullable|numeric';
        }
        if ($request->has('precio_ganancia')) {
            $rules['precio_ganancia'] = 'nullable|numeric';
        }
        if ($request->has('precio_igv')) {
            $rules['precio_igv'] = 'nullable|numeric';
        }
        if ($request->hasFile('imagen')) {
            $rules['imagen'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048';
        }
        if ($request->has('descripcion')) {
            $rules['descripcion'] = 'nullable|string';
        }
        if ($request->has('video')) {
            $rules['video'] = 'nullable|string|max:255';
        }
        if ($request->has('envio')) {
            $rules['envio'] = 'nullable|string|max:100';
        }
        if ($request->has('soporte_tecnico')) {
            $rules['soporte_tecnico'] = 'nullable|string';
        }
        if ($request->has('caracteristicas')) {
            $rules['caracteristicas'] = 'nullable|json';
        }
        if ($request->has('datos_tecnicos')) {
            $rules['datos_tecnicos'] = 'nullable|json';
        }
        if ($request->has('archivos_adicionales')) {
            $rules['archivos_adicionales'] = 'nullable|json';
        }
        if ($request->has('especificaciones_tecnicas')) {
            $rules['especificaciones_tecnicas'] = 'nullable|string|json';
        }
        
        // Validar solo los campos presentes
        $request->validate($rules);
        
        // Preparar datos para actualizar
        $dataToUpdate = $request->only(array_keys($rules));
        
        // Manejar imagen si está presente
        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('productos', 'public');
            $dataToUpdate['imagen'] = $imagePath;
        }
        
        // Actualizar solo los campos proporcionados
        $producto->update($dataToUpdate);
        
        return redirect()->route('productos.index')
                        ->with('success', 'Producto actualizado exitosamente.');
    }

    // Obtener todos los productos
    public function getProductos()
    {
        // Obtener todos los productos y cargar la relación 'marca'
        $productos = Producto::with('marca')->get();

        // Devolver los productos con los datos de la marca
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

    
    
}
