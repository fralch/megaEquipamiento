<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Marca;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productos = Producto::with(['subcategoria', 'marca'])->get();
        return view('productos.index', compact('productos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $subcategorias = Subcategoria::all();
        $marcas = Marca::all();
        return view('productos.create', compact('subcategorias', 'marcas'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

        Producto::create($request->all());

        return redirect()->route('productos.index')
                         ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Producto $producto)
    {
        return view('productos.show', compact('producto'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Producto $producto)
    {
        $subcategorias = Subcategoria::all();
        $marcas = Marca::all();
        return view('productos.edit', compact('producto', 'subcategorias', 'marcas'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Producto $producto)
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Producto $producto)
    {
        if ($producto->imagen) {
            \Storage::delete('public/' . $producto->imagen);
        }

        $producto->delete();

        return redirect()->route('productos.index')
                         ->with('success', 'Producto eliminado exitosamente.');
    }
}
