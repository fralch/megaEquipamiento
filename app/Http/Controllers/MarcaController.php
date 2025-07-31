<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;

class MarcaController extends Controller
{
   
   
    public function create(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string|max:255',
            // Añadido 'webp' a la lista de mimes permitidos
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video_url' => 'nullable|url|max:500',
        ]);

        // Prepare data for creation
        $data = [
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'video_url' => $request->video_url,
        ];

        if ($request->hasFile('imagen')) {
            $image = $request->file('imagen');
            
            // Sanitizar el nombre de la marca para usarlo como nombre de archivo
            $nombreSanitizado = preg_replace('/[^a-z0-9]+/', '_', strtolower($request->nombre));
            // Añadir timestamp para evitar colisiones si hay marcas con nombres similares
            $nombreArchivo = $nombreSanitizado ;
            // Obtener la extensión original del archivo
            $extension = $image->getClientOriginalExtension();
            // Generar el nombre completo del archivo
            $imagePath = $nombreArchivo . '.' . $extension;
            
            // Set destination path
            $destinationPath = public_path('img/marcas') . '/' . $imagePath;
            
            // Move the uploaded file
            if (move_uploaded_file($image->getPathname(), $destinationPath)) {
                // Add the correct image path to the data array
                $data['imagen'] = '/img/marcas/' . $imagePath;
            } else {
                return response()->json(['error' => 'Error al mover el archivo.'], 500);
            }
        }

        $creado = Marca::create($data);

        return response()->json($creado);
    }

    /**
     * Remove the specified marca from storage.
     *
     * @param  \App\Models\Marca  $marca
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $marca = Marca::findOrFail($id);
        // Verificar si existe una imagen asociada y eliminarla
        if ($marca->imagen) {
            $imagePath = public_path(ltrim($marca->imagen, '/'));
            if (file_exists($imagePath)) {
                if (!@unlink($imagePath)) {
                    // Registrar el error si no se puede eliminar, pero continuar
                    \Log::warning('No se pudo eliminar la imagen de la marca: ' . $imagePath);
                }
            }
        }
        // Eliminar la marca
        $marca->delete();
        return response()->json(['message' => 'Marca eliminada correctamente']);
    }
   
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string|max:255',
            // Añadido 'webp' a la lista de mimes permitidos
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
            'video_url' => 'nullable|url|max:500',
        ]);

        $marca = Marca::findOrFail($id);

        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('marcas', 'public');
            $request->merge(['imagen' => $imagePath]);
        }

        $marca->update($request->all());

        // Check if it's an AJAX request (for API usage)
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'message' => 'Marca actualizada exitosamente.',
                'marca' => $marca
            ]);
        }

        return redirect()->route('marcas.index')
                         ->with('success', 'Marca actualizada exitosamente.');
    }

    // obtener todos los marcas en json 
    public function getMarcas ()
    {
        $marcas = Marca::all();
        return response()->json($marcas);
    }

    /*  
      Crea una busqueda por nombre de marca donde el texto sea similar al nombre de la marca
      y devuelve un json con una marca con el nombre similar al texto
      @param  \Illuminate\Http\Request  $request
      @return \Illuminate\Http\Response
    */
    public function buscarPorNombre(Request $request)
    {
        $texto = $request->input('nombre');
        // $texto = str_replace(['-', '_'], ' ', strtolower($texto));
        // Modificado para devolver solo la marca más similar al texto
        // Ordenamos por similitud (las que empiezan con el texto tienen prioridad)
        $marca = Marca::where('nombre', 'like', $texto . '%') // Primero busca los que empiezan exactamente con el texto
                    ->orWhere('nombre', 'like', '%' . $texto . '%') // Luego busca cualquier coincidencia
                    ->orderByRaw("CASE 
                        WHEN nombre LIKE '{$texto}%' THEN 1 
                        WHEN nombre LIKE '%{$texto}%' THEN 2 
                        ELSE 3 
                    END") // Prioriza coincidencias exactas
                    ->first(); // Devuelve solo el primer resultado (el más similar)
        
        return response()->json($marca);
    }
    
}
