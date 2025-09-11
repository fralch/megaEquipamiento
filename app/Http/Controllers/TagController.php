<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\TagParent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::with('tagParent')
                   ->orderBy('id_tag_parent', 'asc')
                   ->orderBy('nombre')
                   ->get();
        
        $tagParents = TagParent::orderBy('nombre')->get();
        
        return Inertia::render('AdminTags', [
            'tags' => $tags,
            'tagParents' => $tagParents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'color' => 'nullable|string|max:20',
            'id_tag_parent' => 'nullable|exists:tag_parents,id_tag_parent',
        ]);

        $slug = Str::slug($validated['nombre']);

        Tag::firstOrCreate(
            ['slug' => $slug],
            [
                'nombre' => $validated['nombre'],
                'color' => $validated['color'] ?? null,
                'id_tag_parent' => $validated['id_tag_parent'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Tag creado');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'color' => 'nullable|string|max:20',
            'id_tag_parent' => 'nullable|exists:tag_parents,id_tag_parent',
        ]);

        $tag = Tag::findOrFail($id);

        $tag->nombre = $validated['nombre'];
        $tag->slug = Str::slug($validated['nombre']);
        $tag->color = $validated['color'] ?? null;
        $tag->id_tag_parent = $validated['id_tag_parent'] ?? null;
        $tag->save();

        return redirect()->back()->with('success', 'Tag actualizado');
    }

    public function destroy($id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();
        return redirect()->back()->with('success', 'Tag eliminado');
    }
}

