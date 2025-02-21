<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Categoria;
use App\Models\Subcategoria;
use App\Models\Producto;

class CategoriaController extends Controller
{
   
    public function CategoriasWiew($id_categoria = null)
    {
        if ($id_categoria === null) {
            // Si no se proporciona id_categoria, devolver un array vacío
            $productos = [];
            $categoria = null;
            $subcategorias = [];
            return Inertia::render('Categoria',  [
                'productos' => $productos,
                'categoria' => $categoria,
                'subcategorias' => $subcategorias,
            ]);
        }

        // Obtener la categoría por su ID
        $categoria = Categoria::find($id_categoria);

        if (!$categoria) {
            // Manejar el caso en que la categoría no se encuentre
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        // Obtener las subcategorías asociadas a la categoría
        $subcategorias = $categoria->subcategorias;

        // Verificar los IDs de las subcategorías
        $subcategoriaIds = $subcategorias->pluck('id_subcategoria')->toArray();
        // \Log::info('Subcategoría IDs:', $subcategoriaIds);

        // Obtener los productos que pertenecen a esas subcategorías
        $productos = Producto::whereIn('id_subcategoria', $subcategoriaIds)->get();
        // \Log::info('Productos obtenidos:', $productos->toArray());

        // Devolver los productos en la vista usando Inertia
        return Inertia::render('Categoria', [
            'productos' => $productos,
            'categoria' => $categoria,
            'subcategorias' => $subcategorias,
        ]);
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


    // obtener  las categorias y las sub categorias con sus ids y sus nombres
    public function getCategoriasConSubcategoriasIds()
    {
        // Obtener todas las categorías con sus subcategorías
        $categorias = Categoria::with('subcategorias:id_subcategoria,nombre,id_categoria')->get(['id_categoria', 'nombre']);

        // Devolver las categorías como respuesta JSON
        return response()->json($categorias);
    }
}
