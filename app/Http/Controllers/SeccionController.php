<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Seccion;
use App\Models\Subcategoria;
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

        $seoSlug = $seccion->slug.'-'.$seccion->id_seccion;

        return Inertia::render('Seccion', [
            'seccion' => $seccion,
            'productos' => $productos,
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
     * Admin: devuelve JSON con todas las secciones y los catálogos para los selectores del formulario.
     */
    public function index(Request $request)
    {
        $secciones = Seccion::with(['productos:id_producto', 'categorias:id_categoria', 'subcategorias:id_subcategoria', 'marcas:id_marca'])
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
                    'producto_ids' => $seccion->productos->pluck('id_producto')->values(),
                    'categoria_ids' => $seccion->categorias->pluck('id_categoria')->values(),
                    'subcategoria_ids' => $seccion->subcategorias->pluck('id_subcategoria')->values(),
                    'marca_ids' => $seccion->marcas->pluck('id_marca')->values(),
                ];
            });

        $productos = Producto::orderBy('nombre')->get(['id_producto', 'nombre', 'sku']);

        $categorias = Categoria::orderBy('nombre')->get(['id_categoria', 'nombre']);

        $subcategorias = Subcategoria::with('categoria:id_categoria,nombre')
            ->orderBy('nombre')
            ->get(['id_subcategoria', 'nombre', 'id_categoria']);

        $marcas = Marca::orderBy('nombre')->get(['id_marca', 'nombre']);

        return response()->json([
            'secciones' => $secciones,
            'productos' => $productos,
            'categorias' => $categorias,
            'subcategorias' => $subcategorias,
            'marcas' => $marcas,
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
     * Admin: sincronizar productos manuales.
     */
    public function syncProductos(Request $request, $id)
    {
        $validated = $request->validate([
            'producto_ids' => 'array',
            'producto_ids.*' => 'exists:productos,id_producto',
        ]);

        $seccion = Seccion::findOrFail($id);
        $seccion->productos()->sync($validated['producto_ids'] ?? []);

        return response()->json(['message' => 'Productos sincronizados exitosamente']);
    }

    /**
     * Admin: sincronizar categorías.
     */
    public function syncCategorias(Request $request, $id)
    {
        $validated = $request->validate([
            'categoria_ids' => 'array',
            'categoria_ids.*' => 'exists:categorias,id_categoria',
        ]);

        $seccion = Seccion::findOrFail($id);
        $seccion->categorias()->sync($validated['categoria_ids'] ?? []);

        return response()->json(['message' => 'Categorías sincronizadas exitosamente']);
    }

    /**
     * Admin: sincronizar subcategorías.
     */
    public function syncSubcategorias(Request $request, $id)
    {
        $validated = $request->validate([
            'subcategoria_ids' => 'array',
            'subcategoria_ids.*' => 'exists:subcategorias,id_subcategoria',
        ]);

        $seccion = Seccion::findOrFail($id);
        $seccion->subcategorias()->sync($validated['subcategoria_ids'] ?? []);

        return response()->json(['message' => 'Subcategorías sincronizadas exitosamente']);
    }

    /**
     * Admin: sincronizar marcas.
     */
    public function syncMarcas(Request $request, $id)
    {
        $validated = $request->validate([
            'marca_ids' => 'array',
            'marca_ids.*' => 'exists:marcas,id_marca',
        ]);

        $seccion = Seccion::findOrFail($id);
        $seccion->marcas()->sync($validated['marca_ids'] ?? []);

        return response()->json(['message' => 'Marcas sincronizadas exitosamente']);
    }
}
