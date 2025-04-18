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
    
        $subcategoria = Subcategoria::create($request->all());
    
        return response()->json([
            'success' => true,
            'message' => 'Subcategoría creada exitosamente.',
            'data' => $subcategoria
        ]);
    }
    
    public function update(Request $request, Subcategoria $subcategoria)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id_categoria',
        ]);
    
        $subcategoria->update($request->all());
    
        return response()->json([
            'success' => true,
            'message' => 'Subcategoría actualizada exitosamente.',
            'data' => $subcategoria
        ]);
    }

    
    // eliminar una subcategoria
    public function destroy($id){
        Subcategoria::destroy($id);
        return response()->json($id);
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
  

    // obtener nombre categoria de una subcategoria
    public function getCatBySub($idSubcategoria){
        // Buscar la subcategoría por su ID
        $subcategoria = Subcategoria::find($idSubcategoria);

        // Verificar si la subcategoría existe
        if (!$subcategoria) {
            return response()->json(['error' => 'Subcategoría no encontrada'], 404);
        }

        // Obtener la categoría relacionada
        $categoria = $subcategoria->categoria;

        // Devolver el nombre de la categoría
        return response()->json(['nombre_categoria' => $categoria->nombre, 'id_categoria' => $categoria->id_categoria]);
    }
}
