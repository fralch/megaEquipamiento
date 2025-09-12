<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Tag;
use App\Models\TagParent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductoTagController extends Controller
{
    /**
     * Display the product-tag relationship management interface
     */
    public function index(Request $request)
    {
        $query = Producto::with(['tags.tagParent', 'subcategoria.categoria', 'marca'])
                         ->orderBy('nombre');

        // Filtros opcionales
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tag_id')) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('tags.id_tag', $request->get('tag_id'));
            });
        }

        $productos = $query->paginate(20);
        $tags = Tag::with('tagParent')->orderBy('nombre')->get();
        $tagParents = TagParent::with('tags')->orderBy('nombre')->get();

        if ($request->expectsJson()) {
            return response()->json([
                'productos' => $productos,
                'tags' => $tags,
                'tagParents' => $tagParents,
            ]);
        }

        return Inertia::render('ProductoTags', [
            'productos' => $productos,
            'tags' => $tags,
            'tagParents' => $tagParents,
            'filters' => $request->only(['search', 'tag_id'])
        ]);
    }

    /**
     * Get tags for a specific product
     */
    public function getProductTags($id)
    {
        $producto = Producto::with('tags.tagParent')->findOrFail($id);
        
        return response()->json([
            'producto' => $producto,
            'tags' => $producto->tags
        ]);
    }

    /**
     * Sync tags for a product (replace all tags)
     */
    public function syncTags(Request $request, $id)
    {
        $request->validate([
            'tag_ids' => 'array',
            'tag_ids.*' => 'exists:tags,id_tag'
        ]);

        $producto = Producto::findOrFail($id);
        $tagIds = $request->get('tag_ids', []);

        $producto->tags()->sync($tagIds);

        $producto->load('tags.tagParent');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Tags actualizados exitosamente',
                'producto' => $producto,
                'tags' => $producto->tags
            ]);
        }

        return redirect()->back()->with('success', 'Tags del producto actualizados');
    }

    /**
     * Attach a single tag to a product
     */
    public function attachTag(Request $request, $id)
    {
        $request->validate([
            'tag_id' => 'required|exists:tags,id_tag'
        ]);

        $producto = Producto::findOrFail($id);
        $tagId = $request->get('tag_id');

        // Check if tag is already attached
        if (!$producto->tags()->where('id_tag', $tagId)->exists()) {
            $producto->tags()->attach($tagId);
        }

        $producto->load('tags.tagParent');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Tag agregado exitosamente',
                'producto' => $producto,
                'tags' => $producto->tags
            ]);
        }

        return redirect()->back()->with('success', 'Tag agregado al producto');
    }

    /**
     * Detach a single tag from a product
     */
    public function detachTag(Request $request, $id)
    {
        $request->validate([
            'tag_id' => 'required|exists:tags,id_tag'
        ]);

        $producto = Producto::findOrFail($id);
        $tagId = $request->get('tag_id');

        $producto->tags()->detach($tagId);
        $producto->load('tags.tagParent');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Tag removido exitosamente',
                'producto' => $producto,
                'tags' => $producto->tags
            ]);
        }

        return redirect()->back()->with('success', 'Tag removido del producto');
    }

    /**
     * Get products by tag
     */
    public function getProductsByTag($tagId)
    {
        $tag = Tag::with('tagParent')->findOrFail($tagId);
        $productos = $tag->productos()
                         ->with(['subcategoria.categoria', 'marca'])
                         ->orderBy('nombre')
                         ->paginate(20);

        return response()->json([
            'tag' => $tag,
            'productos' => $productos
        ]);
    }

    /**
     * Bulk assign tags to multiple products
     */
    public function bulkAssignTags(Request $request)
    {
        $request->validate([
            'producto_ids' => 'required|array',
            'producto_ids.*' => 'exists:productos,id_producto',
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id_tag',
            'action' => 'required|in:attach,detach,sync'
        ]);

        $productoIds = $request->get('producto_ids');
        $tagIds = $request->get('tag_ids');
        $action = $request->get('action');

        $affected = 0;

        foreach ($productoIds as $productoId) {
            $producto = Producto::find($productoId);
            if ($producto) {
                switch ($action) {
                    case 'attach':
                        $producto->tags()->syncWithoutDetaching($tagIds);
                        break;
                    case 'detach':
                        $producto->tags()->detach($tagIds);
                        break;
                    case 'sync':
                        $producto->tags()->sync($tagIds);
                        break;
                }
                $affected++;
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => "Operación completada en {$affected} productos",
                'affected' => $affected
            ]);
        }

        return redirect()->back()->with('success', "Tags actualizados en {$affected} productos");
    }

    /**
     * Get tag statistics
     */
    public function getTagStats()
    {
        $stats = DB::table('tags as t')
            ->leftJoin('producto_tag as pt', 't.id_tag', '=', 'pt.id_tag')
            ->leftJoin('tag_parents as tp', 't.id_tag_parent', '=', 'tp.id_tag_parent')
            ->select(
                't.id_tag',
                't.nombre as tag_nombre',
                't.color',
                'tp.nombre as sector_nombre',
                'tp.color as sector_color',
                DB::raw('COUNT(pt.id_producto) as productos_count')
            )
            ->groupBy('t.id_tag', 't.nombre', 't.color', 'tp.nombre', 'tp.color')
            ->orderBy('productos_count', 'desc')
            ->get();

        return response()->json([
            'stats' => $stats
        ]);
    }
}