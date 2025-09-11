<?php

namespace App\Http\Controllers;

use App\Models\TagParent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TagParentController extends Controller
{
    public function index()
    {
        $tagParents = TagParent::with('tags')->orderBy('nombre')->get();
        
        return Inertia::render('AdminTagParents', [
            'tagParents' => $tagParents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'color' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string|max:255',
        ]);

        $slug = Str::slug($validated['nombre']);

        TagParent::firstOrCreate(
            ['slug' => $slug],
            [
                'nombre' => $validated['nombre'],
                'color' => $validated['color'] ?? null,
                'descripcion' => $validated['descripcion'] ?? null,
                'imagen' => $validated['imagen'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Sector creado');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'color' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string|max:255',
        ]);

        $tagParent = TagParent::findOrFail($id);
        $tagParent->nombre = $validated['nombre'];
        $tagParent->slug = Str::slug($validated['nombre']);
        $tagParent->color = $validated['color'] ?? null;
        $tagParent->descripcion = $validated['descripcion'] ?? null;
        $tagParent->imagen = $validated['imagen'] ?? null;
        $tagParent->save();

        return redirect()->back()->with('success', 'Sector actualizado');
    }

    public function destroy($id)
    {
        $tagParent = TagParent::findOrFail($id);
        $tagParent->delete();
        return redirect()->back()->with('success', 'Sector eliminado');
    }
}