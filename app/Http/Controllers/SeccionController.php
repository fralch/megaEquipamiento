<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Seccion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SeccionController extends Controller
{
    /**
     * Página pública que muestra los productos de una sección.
     */
    public function show($slug)
    {
        $seccion = Seccion::where('slug', $slug)->where('activo', true)->firstOrFail();

        $productos = $seccion->getAllProductos()
            ->with(['marca', 'subcategoria.categoria'])
            ->orderBy('nombre')
            ->get();

        // Solo las categorías de esta sección (con sus subcategorías) para el sidebar
        $categorias = $seccion->categorias()
            ->with(['subcategorias' => fn ($q) => $q->orderBy('nombre')])
            ->orderBy('nombre')
            ->get(['id_categoria', 'nombre', 'slug', 'id_seccion']);

        $seoSlug = $seccion->slug.'-'.$seccion->id_seccion;

        return Inertia::render('Seccion', [
            'seccion' => $seccion,
            'productos' => $productos,
            'categorias' => $categorias,
            'seoSlug' => $seoSlug,
        ]);
    }

    /**
     * API: listar todas las secciones activas (público).
     */
    public function indexApi()
    {
        $secciones = Seccion::activo()->ordenado()->get(['id_seccion', 'nombre', 'slug', 'imagen', 'descripcion', 'orden']);

        return response()->json($secciones);
    }

    /**
     * API: productos de una sección (público).
     */
    public function productosApi($id)
    {
        $seccion = Seccion::activo()->findOrFail($id);

        $productos = $seccion->getAllProductos()
            ->with(['marca', 'subcategoria.categoria'])
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'seccion' => $seccion,
            'productos' => $productos,
        ]);
    }

    /**
     * API: categorías de una sección con sus subcategorías e imágenes (público).
     */
    public function categoriasApi($id)
    {
        $seccion = Seccion::activo()->findOrFail($id);

        $categorias = $seccion->categorias()
            ->with('subcategorias:id_subcategoria,nombre,id_categoria')
            ->orderBy('nombre')
            ->get(['id_categoria', 'nombre', 'slug', 'img']);

        return response()->json($categorias);
    }

    /**
     * API: marcas asociadas a una sección (público).
     * Una marca pertenece a la sección si está vinculada a alguna de sus
     * categorías (marca_categoria) o si tiene productos en ellas.
     */
    public function marcasApi($id)
    {
        $seccion = Seccion::activo()->findOrFail($id);

        $marcas = Marca::query()
            ->where(function ($q) use ($seccion) {
                $q->whereHas('categorias', fn ($c) => $c->where('categorias.id_seccion', $seccion->id_seccion))
                    ->orWhereHas('productos.subcategoria.categoria', fn ($c) => $c->where('categorias.id_seccion', $seccion->id_seccion));
            })
            ->orderBy('nombre')
            ->get();

        return response()->json($marcas);
    }

    /**
     * Admin: devuelve JSON con todas las secciones y el catálogo de categorías para el formulario.
     */
    public function index(Request $request)
    {
        $secciones = Seccion::with(['categorias:id_categoria,id_seccion'])
            ->ordenado()
            ->get()
            ->map(function ($seccion) {
                return [
                    'id_seccion' => $seccion->id_seccion,
                    'nombre' => $seccion->nombre,
                    'slug' => $seccion->slug,
                    'descripcion' => $seccion->descripcion,
                    'imagen' => $seccion->imagen,
                    'activo' => $seccion->activo,
                    'orden' => $seccion->orden,
                    'categoria_ids' => $seccion->categorias->pluck('id_categoria')->values(),
                ];
            });

        $categorias = Categoria::orderBy('nombre')->get(['id_categoria', 'nombre', 'id_seccion']);

        return response()->json([
            'secciones' => $secciones,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Admin: crear sección.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string|max:255',
            'activo' => 'nullable|boolean',
            'orden' => 'nullable|integer|min:0',
        ]);

        $baseSlug = Str::slug($validated['nombre']);
        $slug = $baseSlug;
        $counter = 1;
        while (Seccion::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $seccion = Seccion::create([
            'nombre' => $validated['nombre'],
            'slug' => $slug,
            'descripcion' => $validated['descripcion'] ?? null,
            'imagen' => $validated['imagen'] ?? null,
            'activo' => $validated['activo'] ?? true,
            'orden' => $validated['orden'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Sección creada exitosamente',
            'seccion' => $seccion,
        ], 201);
    }

    /**
     * Admin: editar sección.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string|max:255',
            'activo' => 'nullable|boolean',
            'orden' => 'nullable|integer|min:0',
        ]);

        $seccion = Seccion::findOrFail($id);

        $baseSlug = Str::slug($validated['nombre']);
        $slug = $baseSlug;
        $counter = 1;
        while (Seccion::where('slug', $slug)->where('id_seccion', '!=', $seccion->id_seccion)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $seccion->update([
            'nombre' => $validated['nombre'],
            'slug' => $slug,
            'descripcion' => $validated['descripcion'] ?? null,
            'imagen' => $validated['imagen'] ?? null,
            'activo' => $validated['activo'] ?? $seccion->activo,
            'orden' => $validated['orden'] ?? $seccion->orden,
        ]);

        return response()->json([
            'message' => 'Sección actualizada exitosamente',
            'seccion' => $seccion,
        ]);
    }

    /**
     * Admin: eliminar sección.
     */
    public function destroy($id)
    {
        $seccion = Seccion::findOrFail($id);
        $seccion->delete();

        return response()->json(['message' => 'Sección eliminada exitosamente']);
    }

    /**
     * Admin: sincronizar categorías (semántica exclusiva: una categoría pertenece a una sola sección).
     */
    public function syncCategorias(Request $request, $id)
    {
        $validated = $request->validate([
            'categoria_ids' => 'array',
            'categoria_ids.*' => 'exists:categorias,id_categoria',
        ]);

        $seccion = Seccion::findOrFail($id);
        $ids = $validated['categoria_ids'] ?? [];

        // Desasignar las que tenían esta sección y ya no están en la lista
        Categoria::where('id_seccion', $seccion->id_seccion)
            ->whereNotIn('id_categoria', $ids)
            ->update(['id_seccion' => null]);

        // Asignar (o mover desde otra sección) las de la lista
        Categoria::whereIn('id_categoria', $ids)
            ->update(['id_seccion' => $seccion->id_seccion]);

        return response()->json(['message' => 'Categorías sincronizadas exitosamente']);
    }
}
