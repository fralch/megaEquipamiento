<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;

class MarcaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $marcas = Marca::all();
        return view('marcas.index', compact('marcas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('marcas.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string|max:255',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('marcas', 'public');
            $request->merge(['imagen' => $imagePath]);
        }

        Marca::create($request->all());

        return redirect()->route('marcas.index')
                         ->with('success', 'Marca creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Marca $marca)
    {
        return view('marcas.show', compact('marca'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Marca $marca)
    {
        return view('marcas.edit', compact('marca'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Marca $marca)
    {
        $request->validate([
            'nombre' => 'required|max:100',
            'descripcion' => 'nullable|string|max:255',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            $imagePath = $request->file('imagen')->store('marcas', 'public');
            $request->merge(['imagen' => $imagePath]);
        }

        $marca->update($request->all());

        return redirect()->route('marcas.index')
                         ->with('success', 'Marca actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Marca $marca)
    {
        if ($marca->imagen) {
            \Storage::delete('public/' . $marca->imagen);
        }

        $marca->delete();

        return redirect()->route('marcas.index')
                         ->with('success', 'Marca eliminada exitosamente.');
    }
}
