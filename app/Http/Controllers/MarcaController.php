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
        ]);

        // Prepare data for creation
        $data = [
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
        ];

        if ($request->hasFile('imagen')) {
            $image = $request->file('imagen');
            
            // Sanitizar el nombre de la marca para usarlo como nombre de archivo
            $nombreSanitizado = preg_replace('/[^a-z0-9]+/', '-', strtolower($request->nombre));
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, Marca $marca)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string|max:255',
            // Añadido 'webp' a la lista de mimes permitidos
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('marcas', 'public');
            $request->merge(['imagen' => $imagePath]);
        }

        $marca->update($request->all());

        return redirect()->route('marcas.index')
                         ->with('success', 'Marca actualizada exitosamente.');
    }

    // obtener todos los marcas en json 
    public function getMarcas ()
    {
        $marcas = Marca::all();
        return response()->json($marcas);
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
                unlink($imagePath);
            }
        }
        
        // Eliminar la marca
        $marca->delete();
        
        return response()->json(['message' => 'Marca eliminada correctamente']);
    }
    
}
