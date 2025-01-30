<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subcategoria;
use App\Models\Categoria;

class SubcategoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subcategorias = Subcategoria::with('categoria')->get();
        return view('subcategorias.index', compact('subcategorias'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categorias = Categoria::all();
        return view('subcategorias.create', compact('categorias'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id_categoria',
        ]);

        Subcategoria::create($request->all());

        return redirect()->route('subcategorias.index')
                         ->with('success', 'Subcategoría creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subcategoria $subcategoria)
    {
        return view('subcategorias.show', compact('subcategoria'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Subcategoria $subcategoria)
    {
        $categorias = Categoria::all();
        return view('subcategorias.edit', compact('subcategoria', 'categorias'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subcategoria $subcategoria)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id_categoria',
        ]);

        $subcategoria->update($request->all());

        return redirect()->route('subcategorias.index')
                         ->with('success', 'Subcategoría actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subcategoria $subcategoria)
    {
        $subcategoria->delete();

        return redirect()->route('subcategorias.index')
                         ->with('success', 'Subcategoría eliminada exitosamente.');
    }
}
