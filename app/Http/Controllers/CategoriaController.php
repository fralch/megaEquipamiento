<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Models\Subcategoria;

class CategoriaController extends Controller
{
   
    /**
     * Obtener las categorías y subcategorías en el formato deseado.
     */
    public function getCategoriasConSubcategorias()
    {
        // Obtener todas las categorías con sus subcategorías relacionadas
        $categorias = Categoria::with('subcategorias')->get();

        // Formatear los datos
        $formattedData = [];
        foreach ($categorias as $categoria) {
            $subcategorias = $categoria->subcategorias->pluck('nombre')->toArray();
            $formattedData[$categoria->nombre] = $subcategorias;
        }

        return response()->json($formattedData);
    }
    


    /*
     * obtener todas las categorias  em json 
    */
    public function getCategorias()
    {
        // Obtener todas las categorías
        $categorias = Categoria::all();

        return response()->json($categorias);
    }


   

    /**
     * crear una nueva categoría y devolver el id
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:200',
            'descripcion' => 'nullable|string',
        ]);

        $creado = Categoria::create($request->all());
        return response()->json($creado);    
    }


    /**
     * Actualizar una categoría y devolver el id
     */
    public function update(Request $request, Categoria $categoria)
    {
        $request->validate([
            'nombre' => 'required|max:200',
            'descripcion' => 'nullable|string',
        ]);

        $categoria->update($request->all());

         return response()->json($categoria);
    }

    
   
}
