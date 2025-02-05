<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Marca;

class ProductoController extends Controller
{
    /**   Crear producto   */
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
            'descripcion' => 'nullable|string|max:255',
            'video' => 'nullable|string|max:255',
            'envio' => 'nullable|string|max:100',
            'soporte_tecnico' => 'nullable|string|max:100',
            'caracteristicas' => 'nullable|json',
            'datos_tecnicos' => 'nullable|json',
            'documentos' => 'nullable|json',
        ]);

        // Procesar la imagen si se proporciona
        $imagePath = null;

        if ($request->hasFile('imagen')) {
            $image = $request->file('imagen');

            // Nombre de la imagen con marca de tiempo para evitar conflictos de nombres
            $imageName = time() . '.' . $image->getClientOriginalExtension();

            // Ruta de destino donde se guardará la imagen
            $imagePath = 'images/productos/' . $imageName;

            // Mover la imagen a la ruta de destino
            if (!move_uploaded_file($image->getPathname(), public_path($imagePath))) {
                return response()->json(['error' => 'Error al mover el archivo.'], 500);
            }
        }

        // Crear el producto
        $producto = Producto::create(array_merge($request->all(), ['imagen' => $imagePath]));

        return response()->json($producto);
    }


       /**
     *  Actualizar producto
     */
    public function updateProduct(Request $request, Producto $producto)
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
            'descripcion' => 'nullable|string|max:255',
            'video' => 'nullable|string|max:255',
            'envio' => 'nullable|string|max:100',
            'soporte_tecnico' => 'nullable|string|max:100',
            'caracteristicas' => 'nullable|json',
            'datos_tecnicos' => 'nullable|json',
            'documentos' => 'nullable|json',
        ]);

        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('productos', 'public');
            $request->merge(['imagen' => $imagePath]);
        }

        $producto->update($request->all());

        return redirect()->route('productos.index')
                         ->with('success', 'Producto actualizado exitosamente.');
    }

    // obtener todos los productos
    public function getProductos(){
        $productos = Producto::all();
        return response()->json($productos);
    }
    // obtener todos los productos con su imagen
    public function getProductosImagen(){
        $productos = Producto::with('imagen')->get();
        return response()->json($productos);
    }

    // obtener un producto
    public function showProduct(Producto $producto){
        return response()->json($producto);
    }

    // obtener la imagen de un producto
    public function getImagenProducto(Producto $producto){
        return response()->json($producto->imagen);
    }

   
}
