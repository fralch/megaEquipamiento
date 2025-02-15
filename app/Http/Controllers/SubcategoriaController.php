<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subcategoria;
use App\Models\Categoria;

class SubcategoriaController extends Controller
{
        /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id_categoria',
        ]);

        Subcategoria::create($request->all());

        return redirect()->route('subcategorias.index')
                         ->with('success', 'Subcategoría creada exitosamente.');
    }

   

   
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subcategoria $subcategoria)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id_categoria',
        ]);

        $subcategoria->update($request->all());

        return redirect()->route('subcategorias.index')
                         ->with('success', 'Subcategoría actualizada exitosamente.');
    }

    // Obtener todas las subcategorías
    public function getSubcategorias(){
        $subcategorias = Subcategoria::all();
        return response()->json($subcategorias);
    }

    // obtener las subcategorias de una categoria
    public function getSubcategoriasCategoria(Categoria $categoria){
        $subcategorias = $categoria->subcategorias;
        return response()->json($subcategorias);
    }


    // obtener subcategoria por id
    public function getSubcategoriaById($id_subcategoria){
        $subcategoria = Subcategoria::find($id_subcategoria);
        return response()->json($subcategoria);
    }
  
}
