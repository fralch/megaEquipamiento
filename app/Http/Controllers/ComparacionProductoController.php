<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ComparacionProducto;
use App\Models\Usuario;

class ComparacionProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $comparaciones = ComparacionProducto::with('usuario')->get();
        return view('comparaciones_productos.index', compact('comparaciones'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = Usuario::all();
        return view('comparaciones_productos.create', compact('usuarios'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
        ]);

        ComparacionProducto::create($request->all());

        return redirect()->route('comparaciones-productos.index')
                         ->with('success', 'Comparación de Productos creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ComparacionProducto $comparacionProducto)
    {
        return view('comparaciones_productos.show', compact('comparacionProducto'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ComparacionProducto $comparacionProducto)
    {
        $usuarios = Usuario::all();
        return view('comparaciones_productos.edit', compact('comparacionProducto', 'usuarios'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ComparacionProducto $comparacionProducto)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
        ]);

        $comparacionProducto->update($request->all());

        return redirect()->route('comparaciones-productos.index')
                         ->with('success', 'Comparación de Productos actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ComparacionProducto $comparacionProducto)
    {
        $comparacionProducto->delete();

        return redirect()->route('comparaciones-productos.index')
                         ->with('success', 'Comparación de Productos eliminada exitosamente.');
    }
}
