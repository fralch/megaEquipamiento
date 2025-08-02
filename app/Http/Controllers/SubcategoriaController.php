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
            'img' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048'
        ]);
    
        // Preparar datos para la creación
        $data = [
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'id_categoria' => $request->id_categoria,
            'img' => null,
        ];
        
        // Crear la subcategoría primero
        $subcategoria = Subcategoria::create($data);
        
        // Obtener la categoría relacionada para crear una estructura organizada
        $categoria = Categoria::find($request->id_categoria);
        
        // Sanitize the subcategory name for the folder path
        $subcategoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($request->nombre));
        $subcategoryNameSanitized = preg_replace('/_+/', '_', $subcategoryNameSanitized);
        
        // Sanitize the category name as well for the parent folder
        $categoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($categoria->nombre));
        $categoryNameSanitized = preg_replace('/_+/', '_', $categoryNameSanitized);
        
        // Crear directorio específico para esta subcategoría
        $subcategoryFolder = 'img/subcategorias/' . $subcategoryNameSanitized;
        $fullPath = public_path($subcategoryFolder);
        
        // Crear el directorio si no existe
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }
        
        // Procesar imagen si existe
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            // Use a unique name for the file, keeping the original extension
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = $fullPath . '/' . $fileName;
            
            if (move_uploaded_file($file->getPathname(), $destinationPath)) {
                // Actualizar la ruta de la imagen
                $subcategoria->img = '/' . $subcategoryFolder . '/' . $fileName;
                $subcategoria->save();
            }
        }
    
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
            'img' => 'nullable|file|mimes:jpeg,png,jpg,gif,webm|max:2048',
        ]);
        
        // Actualizar campos básicos
        $subcategoria->nombre = $request->nombre;
        $subcategoria->descripcion = $request->descripcion;
        
        // Si ha cambiado la categoría
        if ($subcategoria->id_categoria != $request->id_categoria) {
            $subcategoria->id_categoria = $request->id_categoria;
        }
        
        // Procesar imagen si existe una nueva
        if ($request->hasFile('img')) {
            // Obtener la categoría relacionada
            $categoria = Categoria::find($request->id_categoria);
            
            // Sanitize names
            $subcategoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($request->nombre));
            $subcategoryNameSanitized = preg_replace('/_+/', '_', $subcategoryNameSanitized);
            
            $categoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($categoria->nombre));
            $categoryNameSanitized = preg_replace('/_+/', '_', $categoryNameSanitized);
            
            // Crear directorio específico para esta subcategoría
            $subcategoryFolder = 'img/categorias/' . $categoryNameSanitized . '/subcategorias/' . $subcategoryNameSanitized;
            $fullPath = public_path($subcategoryFolder);
            
            // Crear el directorio si no existe
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0777, true);
            }
            
            // Eliminar imagen anterior si existe
            if ($subcategoria->img && file_exists(public_path($subcategoria->img))) {
                unlink(public_path($subcategoria->img));
            }
            
            $file = $request->file('img');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = $fullPath . '/' . $fileName;
            
            if (move_uploaded_file($file->getPathname(), $destinationPath)) {
                $subcategoria->img = '/' . $subcategoryFolder . '/' . $fileName;
            }
        }
        
        $subcategoria->save();
    
        return response()->json([
            'success' => true,
            'message' => 'Subcategoría actualizada exitosamente.',
            'data' => $subcategoria
        ]);
    }
    
    // eliminar una subcategoria
    public function destroy($id)
    {
        $subcategoria = Subcategoria::find($id);
        
        if (!$subcategoria) {
            return response()->json(['error' => 'Subcategoría no encontrada'], 404);
        }
        
        // Eliminar la imagen si existe
        if ($subcategoria->img && file_exists(public_path($subcategoria->img))) {
            // Eliminar el archivo
            unlink(public_path($subcategoria->img));
            
            // Intentar eliminar el directorio si está vacío
            $dirPath = dirname(public_path($subcategoria->img));
            
            if (is_dir($dirPath) && count(glob("$dirPath/*")) === 0) {
                rmdir($dirPath);
                
                // Verificar si el directorio padre (subcategorias) está vacío y eliminarlo
                $parentDir = dirname($dirPath);
                if (is_dir($parentDir) && count(glob("$parentDir/*")) === 0) {
                    rmdir($parentDir);
                }
            }
        }
        
        $subcategoria->delete();
        return response()->json($id);
    }

    // Obtener todas las subcategorías
    public function getSubcategorias()
    {
        $subcategorias = Subcategoria::all();
        return response()->json($subcategorias);
    }

    // obtener las subcategorias de una categoria
    public function getSubcategoriasCategoria(Categoria $categoria)
    {
        $subcategorias = $categoria->subcategorias;
        return response()->json($subcategorias);
    }

    // obtener subcategoria por id
    public function getSubcategoriaById($id_subcategoria)
    {
        $subcategoria = Subcategoria::find($id_subcategoria);
        return response()->json($subcategoria);
    }
  
    // obtener nombre categoria de una subcategoria
    public function getCatBySub($idSubcategoria)
    {
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

    public function getCategoriasOptimizadasPorMarca($marca_id = null)
    {
        try {
            // Consulta optimizada usando subconsultas
            $categorias = Categoria::select('id_categoria', 'nombre', 'descripcion', 'img')
                ->with(['subcategorias' => function ($query) use ($marca_id) {
                    $query->select('id_subcategoria', 'nombre', 'descripcion', 'id_categoria')
                        ->whereExists(function ($subQuery) use ($marca_id) {
                            $subQuery->select(\DB::raw(1))
                                ->from('productos')
                                ->whereColumn('productos.id_subcategoria', 'subcategorias.id_subcategoria');
                            
                            if ($marca_id) {
                                $subQuery->where('productos.marca_id', $marca_id);
                            }
                        });
                }])
                ->whereExists(function ($query) use ($marca_id) {
                    $query->select(\DB::raw(1))
                        ->from('subcategorias')
                        ->whereColumn('subcategorias.id_categoria', 'categorias.id_categoria')
                        ->whereExists(function ($subQuery) use ($marca_id) {
                            $subQuery->select(\DB::raw(1))
                                ->from('productos')
                                ->whereColumn('productos.id_subcategoria', 'subcategorias.id_subcategoria');
                            
                            if ($marca_id) {
                                $subQuery->where('productos.marca_id', $marca_id);
                            }
                        });
                })
                ->orderBy('nombre')
                ->get();

            return response()->json($categorias, 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener las categorías optimizadas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function moverSubcategorias(Request $request)
    {
        $request->validate([
            'subcategorias' => 'required|array',
            'subcategorias.*' => 'exists:subcategorias,id_subcategoria',
            'categoria_destino_id' => 'required|exists:categorias,id_categoria',
        ]);

        Subcategoria::whereIn('id_subcategoria', $request->subcategorias)
            ->update(['id_categoria' => $request->categoria_destino_id]);

        return response()->json(['message' => 'Subcategorías movidas con éxito.']);
    }
}