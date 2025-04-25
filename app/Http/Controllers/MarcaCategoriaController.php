<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MarcaCategoria;
use App\Models\Marca;
use App\Models\Categoria;

class MarcaCategoriaController extends Controller
{
   

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'marca_id' => 'required|exists:marcas,id_marca',
            'categoria_id' => 'required|exists:categorias,id_categoria',
        ]);

        MarcaCategoria::create($request->all());

        return redirect()->route('marca-categoria.index')
                         ->with('success', 'Relación Marca-Categoría creada exitosamente.');
    }

    
}
