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
            return Inertia::render('Categoria', [
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

        // Obtener los productos que pertenecen a esas subcategorías y cargar la relación 'marca'
        $productos = Producto::with('marca')->whereIn('id_subcategoria', $subcategoriaIds)->get();

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
            'img' => 'nullable|file|mimes:jpeg,png,jpg,gif,webm|max:2048',
        ]);

        // Preparar datos para la creación
        $data = [
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'img' => null,
        ];

        if ($request->hasFile('img')) {
            $file = $request->file('img');

            // Generar nombre único de archivo con timestamp
            $filePath = time() . '.' . $file->getClientOriginalExtension();

            // Establecer ruta de destino
            $destinationPath = public_path('img/categorias') . '/' . $filePath;

            // Crear el directorio si no existe
            if (!file_exists(public_path('img/categorias'))) {
                mkdir(public_path('img/categorias'), 0777, true);
            }

            // Mover el archivo subido
            if (move_uploaded_file($file->getPathname(), $destinationPath)) {
                // Añadir solo el nombre del archivo al array de datos
                $data['img'] = '/img/categorias/'.$filePath; // Store only the filename
            } else {
                return response()->json(['error' => 'Error al mover el archivo.'], 500);
            }
        }

        $creado = Categoria::create($data);

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
    /**
     * Eliminar una categoría y devolver el id
     */ 
    public function destroy($id){
        Categoria::destroy($id);
        return response()->json($id);
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
