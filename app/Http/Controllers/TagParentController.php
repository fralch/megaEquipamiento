<?php

namespace App\Http\Controllers;

use App\Models\TagParent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TagParentController extends Controller
{
    public function index(Request $request)
    {
        $tagParents = TagParent::with('tags')->orderBy('nombre')->get();
        
        if ($request->expectsJson()) {
            return response()->json([
                'tagParents' => $tagParents,
            ]);
        }
        
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

        $tagParent = TagParent::firstOrCreate(
            ['slug' => $slug],
            [
                'nombre' => $validated['nombre'],
                'color' => $validated['color'] ?? null,
                'descripcion' => $validated['descripcion'] ?? null,
                'imagen' => $validated['imagen'] ?? null,
            ]
        );

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Sector creado exitosamente',
                'tagParent' => $tagParent->load('tags')
            ], 201);
        }

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

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Sector actualizado exitosamente',
                'tagParent' => $tagParent->load('tags')
            ]);
        }

        return redirect()->back()->with('success', 'Sector actualizado');
    }

    public function destroy(Request $request, $id)
    {
        $tagParent = TagParent::findOrFail($id);
        $tagParent->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Sector eliminado exitosamente'
            ]);
        }

        return redirect()->back()->with('success', 'Sector eliminado');
    }

    /**
     * Get all tag parents with their tags for public consumption
     */
    public function getPublicTagParents()
    {
        $tagParents = TagParent::with(['tags' => function($query) {
                                    $query->orderBy('nombre');
                                }])
                                ->orderBy('nombre')
                                ->get();

        return response()->json($tagParents);
    }
}