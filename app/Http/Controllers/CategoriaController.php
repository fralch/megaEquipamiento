<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Categoria;
use App\Models\Subcategoria;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class CategoriaController extends Controller
{
   
    public function CategoriasWiew($id_categoria = null)
    {
        // Obtener todas las categorías para la navegación
        $todasCategorias = Categoria::all();

        if ($id_categoria === null) {
            // Si no se proporciona id_categoria, devolver un array vacío
            $productos = [];
            $categoria = null;
            $subcategorias = [];
            $marcas = [];
            return Inertia::render('Categoria', [
                'productos' => $productos,
                'categoria' => $categoria,
                'subcategorias' => $subcategorias,
                'marcas' => $marcas,
                'todasCategorias' => $todasCategorias,
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

        // Obtener las marcas relacionadas a la categoría
        $marcas = $categoria->marcas;

        // Verificar los IDs de las subcategorías
        $subcategoriaIds = $subcategorias->pluck('id_subcategoria')->toArray();

        // Obtener los productos que pertenecen a esas subcategorías y cargar la relación 'marca'
        $productos = Producto::with('marca')->whereIn('id_subcategoria', $subcategoriaIds)->get();

        // Devolver los productos en la vista usando Inertia
        return Inertia::render('Categoria', [
            'productos' => $productos,
            'categoria' => $categoria,
            'subcategorias' => $subcategorias,
            'marcas' => $marcas,
            'todasCategorias' => $todasCategorias,
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
            'video' => 'nullable|url|max:500', // Validación para URL de video
            'imagenes.*' =>  'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048', // Validación para múltiples imágenes
            'imagenes' => 'max:5', // Máximo 5 imágenes
        ]);
    
        // Preparar datos para la creación
        $data = [
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'img' => null, // Mantenemos el campo principal de imagen
            'video' => $request->video,
        ];
    
        // Crear la categoría primero
        $categoria = Categoria::create($data);

        // Sanitize the category name for the folder path
        $categoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($request->nombre)); // Replace non-alphanumeric characters with underscores
        $categoryNameSanitized = preg_replace('/_+/', '_', $categoryNameSanitized); // Replace multiple underscores with a single one
    
        // Crear directorio específico para esta categoría usando el nombre sanitizado
        $categoryFolder = 'img/categorias/' . $categoryNameSanitized; // Use sanitized name instead of ID
        $fullPath = public_path($categoryFolder);
        
        // Crear el directorio si no existe
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }
    
        // Procesar imagen principal si existe
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            // Use a unique name for the file, keeping the original extension
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = $fullPath . '/' . $fileName;
    
            if (move_uploaded_file($file->getPathname(), $destinationPath)) {
                // Actualizar la ruta de la imagen principal
                $categoria->img = '/' . $categoryFolder . '/' . $fileName; // Use the new path structure
                $categoria->save();
            }
        }
    
        // Procesar imágenes adicionales (hasta 5)
        $imagenesGuardadas = [];
        
        if ($request->hasFile('imagenes')) {
            $imagenes = $request->file('imagenes');
            $count = 0;
            
            foreach ($imagenes as $imagen) {
                if ($count >= 5) break; // Limitar a 5 imágenes
                
                // Use a unique name for each additional image file
                $fileName = time() . '_' . uniqid() . '_' . $count . '.' . $imagen->getClientOriginalExtension();
                $destinationPath = $fullPath . '/' . $fileName;
                
                if (move_uploaded_file($imagen->getPathname(), $destinationPath)) {
                    // Guardar las rutas de las imágenes adicionales
                    $imagenesGuardadas[] = '/' . $categoryFolder . '/' . $fileName; // Use the new path structure
                    
                    // Si tienes una tabla para imágenes relacionadas:
                    // CategoriaImagen::create([
                    //     'categoria_id' => $categoria->id,
                    //     'ruta_imagen' => '/' . $categoryFolder . '/' . $fileName
                    // ]);
                }
                
                $count++;
            }
        }
    
        // Agregamos las imágenes al resultado para devolverlas
        // Note: You might want to save $imagenesGuardadas to the database if needed permanently
        $categoria->imagenes_adicionales = $imagenesGuardadas;
        
        // Ejecutar la lógica de la migración para actualizar relaciones marca-categoria
        $this->actualizarRelacionesMarcaCategoria();
    
        return response()->json($categoria);
    }


    /**
     * Actualizar una categoría y devolver el id
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|max:200',
            'descripcion' => 'nullable|string',
            'video' => 'nullable|url|max:500', // Validación para URL de video
            'imagenes.*' =>  'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048', // Validación para múltiples imágenes
            'imagenes' => 'max:5', // Máximo 5 imágenes
        ]);

        // Buscar la categoría por ID
        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        // Actualizar campos básicos
        $categoria->update([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'video' => $request->video,
        ]);

        // Manejar imágenes si se indica que deben actualizarse
        if ($request->has('update_images') && $request->input('update_images') === 'true') {
            // Sanitize the category name for the folder path
            $categoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($request->nombre));
            $categoryNameSanitized = preg_replace('/_+/', '_', $categoryNameSanitized);
        
            // Crear directorio específico para esta categoría usando el nombre sanitizado
            $categoryFolder = 'img/categorias/' . $categoryNameSanitized;
            $fullPath = public_path($categoryFolder);

            // Solo eliminar archivos físicos de la carpeta de la categoría (no imágenes del banco)
            // Las imágenes del banco no están en esta carpeta, están en el banco de imágenes
            if (file_exists($fullPath) && is_dir($fullPath)) {
                $files = glob($fullPath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
            }
            
            // Crear el directorio si no existe
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0777, true);
            }

            // Procesar imágenes adicionales (hasta 5)
            $imagenesGuardadas = [];
            
            if ($request->hasFile('imagenes')) {
                $imagenes = $request->file('imagenes');
                $count = 0;
                
                foreach ($imagenes as $imagen) {
                    if ($count >= 5) break; // Limitar a 5 imágenes
                    
                    // Use a unique name for each additional image file
                    $fileName = time() . '_' . uniqid() . '_' . $count . '.' . $imagen->getClientOriginalExtension();
                    $destinationPath = $fullPath . '/' . $fileName;
                    
                    if (move_uploaded_file($imagen->getPathname(), $destinationPath)) {
                        // Guardar las rutas de las imágenes adicionales
                        $imagenesGuardadas[] = '/' . $categoryFolder . '/' . $fileName;
                    }
                    
                    $count++;
                }
            }

            // Actualizar la imagen principal con la primera imagen nueva (reemplazar la existente)
            if (!empty($imagenesGuardadas)) {
                $categoria->img = $imagenesGuardadas[0];
                $categoria->save();
            } else {
                // Si no hay nuevas imágenes, limpiar la imagen principal también
                $categoria->img = null;
                $categoria->save();
            }

            // Agregamos las imágenes al resultado para devolverlas
            $categoria->imagenes_adicionales = $imagenesGuardadas;
        }

        return response()->json($categoria);
    }
    /**
     * Eliminar una categoría y devolver el id
     */ 
    public function destroy($id)
    {
        // Primero obtenemos la categoría para acceder a su información
        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }
        
        // Extraemos el nombre de la carpeta del path de la imagen
        if ($categoria->img) {
            $imgPath = $categoria->img;
            $pathParts = explode('/', $imgPath);
            
            // La estructura debería ser /img/categorias/nombre_categoria/...
            if (count($pathParts) >= 4) {
                $folderName = $pathParts[3]; // Obtenemos el nombre_categoria
                $categoryFolder = public_path('img/categorias/' . $folderName);
                
                // Verificamos si el directorio existe
                if (file_exists($categoryFolder) && is_dir($categoryFolder)) {
                    // Eliminamos todos los archivos dentro de la carpeta
                    $files = glob($categoryFolder . '/*');
                    foreach ($files as $file) {
                        if (is_file($file)) {
                            unlink($file);
                        }
                    }
                    
                    // Eliminamos la carpeta
                    rmdir($categoryFolder);
                }
            } else {
                // Si el path no contiene la estructura esperada, intentamos buscar la carpeta
                // basándonos en el nombre de la categoría
                $categoryNameSanitized = preg_replace('/[^A-Za-z0-9\-_\.]/', '_', strtolower($categoria->nombre));
                $categoryNameSanitized = preg_replace('/_+/', '_', $categoryNameSanitized);
                $categoryFolder = public_path('img/categorias/' . $categoryNameSanitized);
                
                if (file_exists($categoryFolder) && is_dir($categoryFolder)) {
                    // Eliminamos todos los archivos dentro de la carpeta
                    $files = glob($categoryFolder . '/*');
                    foreach ($files as $file) {
                        if (is_file($file)) {
                            unlink($file);
                        }
                    }
                    
                    // Eliminamos la carpeta
                    rmdir($categoryFolder);
                }
            }
        }
        
        // Finalmente eliminamos la categoría de la base de datos
        $categoria->delete();
        
        return response()->json($id);
    }


    // obtener  las categorias y las sub categorias con sus ids y sus nombres
    public function getCategoriasConSubcategoriasIds()
    {
        // Obtener todas las categorías con sus subcategorías incluyendo las imágenes
        $categorias = Categoria::with('subcategorias:id_subcategoria,nombre,id_categoria')->get(['id_categoria', 'nombre', 'img']);

        // Devolver las categorías como respuesta JSON
        return response()->json($categorias);
    }

    /**
     * Obtener las subcategorías de una categoría específica
     */
    public function getSubcategorias($id_categoria)
    {
        $categoria = Categoria::find($id_categoria);
        
        if (!$categoria) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }
        
        $subcategorias = $categoria->subcategorias;
        
        return response()->json($subcategorias);
    }

    /**
     * Actualizar relaciones marca-categoria basándose en productos existentes
     */
    private function actualizarRelacionesMarcaCategoria()
    {
        // Insertar las relaciones marca-categoria basadas en los productos existentes
        $query = "
            INSERT INTO marca_categoria (marca_id, categoria_id, created_at, updated_at)
            SELECT DISTINCT 
                p.marca_id,
                s.id_categoria,
                NOW(),
                NOW()
            FROM productos p
            INNER JOIN subcategorias s ON p.id_subcategoria = s.id_subcategoria
            WHERE p.marca_id IS NOT NULL 
            AND s.id_categoria IS NOT NULL
            ON DUPLICATE KEY UPDATE updated_at = NOW()
        ";
        
        DB::statement($query);
    }
}
