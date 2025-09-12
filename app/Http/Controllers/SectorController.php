<?php

namespace App\Http\Controllers;

use App\Models\TagParent;
use App\Models\Tag;
use App\Models\Producto;
use App\Models\Marca;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectorController extends Controller
{
    /**
     * Display the sector page with products filtered by tag parent
     */
    public function show($id_tag_parent)
    {
        try {
            // Get the tag parent (sector) with its tags
            $tagParent = TagParent::with('tags')->findOrFail($id_tag_parent);
            
            // Get all tags that belong to this sector
            $tags = Tag::where('id_tag_parent', $id_tag_parent)
                       ->orderBy('nombre')
                       ->get();
            
            // Get all products that have tags from this sector
            $productos = Producto::with(['tags.tagParent', 'subcategoria.categoria', 'marca'])
                                ->whereHas('tags', function($query) use ($id_tag_parent) {
                                    $query->where('id_tag_parent', $id_tag_parent);
                                })
                                ->orderBy('nombre')
                                ->get();

            // Get unique brands from the products in this sector
            $marcaIds = $productos->pluck('marca_id')->filter()->unique();
            $marcas = Marca::whereIn('id_marca', $marcaIds)
                          ->orderBy('nombre')
                          ->get();

            // Get all tag parents for navigation
            $allTagParents = TagParent::with('tags')
                                    ->orderBy('nombre')
                                    ->get();

            return Inertia::render('Sector', [
                'productos' => $productos,
                'tagParent' => $tagParent,
                'tags' => $tags,
                'marcas' => $marcas,
                'allTagParents' => $allTagParents
            ]);
            
        } catch (\Exception $e) {
            // If sector not found, redirect to home or show error
            return redirect()->route('welcome')
                           ->with('error', 'Sector no encontrado');
        }
    }

    /**
     * Get products by specific tag within a sector
     */
    public function getProductsByTag(Request $request, $id_tag_parent, $id_tag)
    {
        try {
            $tagParent = TagParent::findOrFail($id_tag_parent);
            $tag = Tag::where('id_tag', $id_tag)
                     ->where('id_tag_parent', $id_tag_parent)
                     ->firstOrFail();

            $productos = Producto::with(['tags.tagParent', 'subcategoria.categoria', 'marca'])
                                ->whereHas('tags', function($query) use ($id_tag) {
                                    $query->where('tags.id_tag', $id_tag);
                                })
                                ->orderBy('nombre')
                                ->get();

            if ($request->expectsJson()) {
                return response()->json([
                    'productos' => $productos,
                    'tag' => $tag,
                    'tagParent' => $tagParent
                ]);
            }

            return $productos;
            
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Tag no encontrado'], 404);
            }
            
            return redirect()->back()->with('error', 'Tag no encontrado');
        }
    }

    /**
     * Get all sectors (tag parents) for navigation
     */
    public function index()
    {
        $tagParents = TagParent::with(['tags' => function($query) {
                                    $query->orderBy('nombre');
                                }])
                                ->orderBy('nombre')
                                ->get();

        return Inertia::render('Sectores', [
            'tagParents' => $tagParents
        ]);
    }

    /**
     * Search products within a sector
     */
    public function searchProducts(Request $request, $id_tag_parent)
    {
        $request->validate([
            'search' => 'required|string|min:2'
        ]);

        $termino = $request->input('search');
        
        $productos = Producto::with(['tags.tagParent', 'subcategoria.categoria', 'marca'])
                            ->whereHas('tags', function($query) use ($id_tag_parent) {
                                $query->where('id_tag_parent', $id_tag_parent);
                            })
                            ->where(function ($q) use ($termino) {
                                $q->where('nombre', 'LIKE', '%' . $termino . '%')
                                  ->orWhere('sku', 'LIKE', '%' . $termino . '%');
                            })
                            ->orderBy('nombre')
                            ->limit(25)
                            ->get();

        return response()->json($productos);
    }

    /**
     * Get sector statistics
     */
    public function getStats($id_tag_parent)
    {
        try {
            $tagParent = TagParent::findOrFail($id_tag_parent);
            
            $stats = [
                'total_tags' => $tagParent->tags()->count(),
                'total_products' => Producto::whereHas('tags', function($query) use ($id_tag_parent) {
                    $query->where('id_tag_parent', $id_tag_parent);
                })->count(),
                'tags_with_products' => $tagParent->tags()->whereHas('productos')->count(),
                'most_used_tags' => $tagParent->tags()
                    ->withCount('productos')
                    ->orderBy('productos_count', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'sector' => $tagParent,
                'stats' => $stats
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Sector no encontrado'], 404);
        }
    }
}