<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TiposRelacionProductos;
use Illuminate\Support\Facades\DB;

class TiposRelacionProductosController extends Controller
{

        /* obtener todos los registros de la tabla */
    function get_all()  {
            $tipos = TiposRelacionProductos::all();
            return response()->json($tipos, 200);
    }
    
   
    /**
     * Store a newly created resource in storage. es para una api
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $tipoRelacionProducto = new TiposRelacionProductos();
        $tipoRelacionProducto->nombre = $request->nombre;
        $tipoRelacionProducto->descripcion = $request->descripcion;
        $tipoRelacionProducto->save();

        return response()->json($tipoRelacionProducto, 201);
    }

   
    /**
     * Update the specified resource in storage.s es para una api
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage. es para una api
     */
    public function destroy(string $id)
    {
        //
    }
}
