<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MarcaCategoria;
use App\Models\Marca;
use App\Models\Categoria;

class MarcaCategoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $marcaCategorias = MarcaCategoria::with(['marca', 'categoria'])->get();
        return view('marca_categoria.index', compact('marcaCategorias'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $marcas = Marca::all();
        $categorias = Categoria::all();
        return view('marca_categoria.create', compact('marcas', 'categorias'));
    }

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

    /**
     * Display the specified resource.
     */
    public function show(MarcaCategoria $marcaCategoria)
    {
        return view('marca_categoria.show', compact('marcaCategoria'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MarcaCategoria $marcaCategoria)
    {
        $marcas = Marca::all();
        $categorias = Categoria::all();
        return view('marca_categoria.edit', compact('marcaCategoria', 'marcas', 'categorias'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MarcaCategoria $marcaCategoria)
    {
        $request->validate([
            'marca_id' => 'required|exists:marcas,id_marca',
            'categoria_id' => 'required|exists:categorias,id_categoria',
        ]);

        $marcaCategoria->update($request->all());

        return redirect()->route('marca-categoria.index')
                         ->with('success', 'Relación Marca-Categoría actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MarcaCategoria $marcaCategoria)
    {
        $marcaCategoria->delete();

        return redirect()->route('marca-categoria.index')
                         ->with('success', 'Relación Marca-Categoría eliminada exitosamente.');
    }
}
