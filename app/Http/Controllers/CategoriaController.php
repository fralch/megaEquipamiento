<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Seccion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public function CategoriasWiew($categoriaSlug = null)
    {
        // Cache para todas las categorías por 1 hora
        $todasCategorias = Cache::remember('todas_categorias', 3600, function () {
            return Categoria::with('subcategorias')->get();
        });

        if ($categoriaSlug === null) {
            // Si no se proporciona categoría, devolver un array vacío
            $productos = [];
            $categoria = null;
            $subcategorias = [];
            $marcas = [];

            return Inertia::render('Categoria', [
                'productos' => $productos,
                'categoria' => $categoria,
                'subcategorias' => $subcategorias,
                'marcas' => $marcas,
                'todasCategorias' => $todasCategorias,
                'categoriasSidebar' => null,
                'seccion' => null,
                'seoSlug' => null,
                'canonicalPath' => null,
            ]);
        }

        $categoria = null;

        // 1. Si es numérico (retrocompatibilidad ej: /categorias/105)
        if (ctype_digit((string) $categoriaSlug)) {
            $categoria = Categoria::with(['subcategorias', 'marcas', 'seccion'])->find($categoriaSlug);
            if ($categoria) {
                return redirect($categoria->getSeoUrl(), 301);
            }
            abort(404);
        }

        // 2. Si viene con formato slug-id (ej: /categorias/alcoholimetro-105)
        if (preg_match('/-(\d+)$/', (string) $categoriaSlug, $matches)) {
            $idFromSlug = (int) $matches[1];
            $categoria = Categoria::with(['subcategorias', 'marcas', 'seccion'])->find($idFromSlug);
            if ($categoria) {
                return redirect($categoria->getSeoUrl(), 301);
            }
        }

        // 3. Buscar por slug directo
        $categoria = Categoria::with(['subcategorias', 'marcas', 'seccion'])
            ->where('slug', $categoriaSlug)
            ->first();

        // 4. Fallback si no coincide con slug directo (por ejemplo caracteres con tildes o variaciones)
        if (! $categoria) {
            $categoria = $todasCategorias->first(function ($cat) use ($categoriaSlug) {
                return Str::slug($cat->nombre) === $categoriaSlug;
            });

            if ($categoria) {
                $categoria->load(['subcategorias', 'marcas', 'seccion']);
                if (! empty($categoria->slug) && $categoriaSlug !== $categoria->slug) {
                    return redirect($categoria->getSeoUrl(), 301);
                }
            }
        }

        if (! $categoria) {
            abort(404);
        }

        // Si el slug solicitado difiere del canónico, redirigir 301
        $canonicalSlug = $categoria->getSeoSlug();
        if ($categoriaSlug !== $canonicalSlug) {
            return redirect($categoria->getSeoUrl(), 301);
        }

        // Las subcategorías y marcas ya están cargadas por el eager loading
        $subcategorias = $categoria->subcategorias;
        $marcas = $categoria->marcas;

        // Verificar los IDs de las subcategorías
        $subcategoriaIds = $subcategorias->pluck('id_subcategoria')->toArray();

        // Obtener los productos que pertenecen a esas subcategorías y cargar la relación 'marca'
        $productos = Producto::with('marca')->whereIn('id_subcategoria', $subcategoriaIds)->get();

        [$seccion, $categoriasSidebar, $canonicalPath] = $this->resolveSeccionContext($categoria);

        // Devolver los productos en la vista usando Inertia
        return Inertia::render('Categoria', [
            'productos' => $productos,
            'categoria' => $categoria,
            'subcategorias' => $subcategorias,
            'marcas' => $marcas,
            'todasCategorias' => $todasCategorias,
            'categoriasSidebar' => $categoriasSidebar,
            'seccion' => $seccion,
            'seoSlug' => $canonicalSlug,
            'canonicalPath' => $canonicalPath,
        ]);
    }

    /**
     * Vista pública: categoría dentro de una sección específica.
     * URL: /seccion/{seccionSlug}/categoria/{categoriaSlug}
     */
    public function CategoriaSeccionView($seccionSlug, $categoriaSlug)
    {
        $seccion = Seccion::where('slug', $seccionSlug)->where('activo', true)->firstOrFail();

        // Resolver la categoría solo dentro de esta sección (no mezclamos secciones)
        $categoria = null;

        if (ctype_digit((string) $categoriaSlug)) {
            $categoria = Categoria::with(['subcategorias', 'marcas'])
                ->where('id_seccion', $seccion->id_seccion)
                ->find($categoriaSlug);

            if ($categoria) {
                return redirect($categoria->getSeccionSeoUrl($seccion), 301);
            }
            abort(404);
        }

        if (preg_match('/-(\d+)$/', (string) $categoriaSlug, $matches)) {
            $idFromSlug = (int) $matches[1];
            $categoria = Categoria::with(['subcategorias', 'marcas'])
                ->where('id_seccion', $seccion->id_seccion)
                ->find($idFromSlug);

            if ($categoria) {
                return redirect($categoria->getSeccionSeoUrl($seccion), 301);
            }
        }

        $categoria = Categoria::with(['subcategorias', 'marcas'])
            ->where('slug', $categoriaSlug)
            ->where('id_seccion', $seccion->id_seccion)
            ->first();

        if (! $categoria) {
            $todasCategorias = Cache::remember('todas_categorias', 3600, function () {
                return Categoria::with('subcategorias')->get();
            });

            $categoria = $todasCategorias->first(function ($cat) use ($categoriaSlug, $seccion) {
                return $cat->id_seccion === $seccion->id_seccion
                    && Str::slug($cat->nombre) === $categoriaSlug;
            });

            if ($categoria) {
                $categoria->load(['subcategorias', 'marcas']);
                if (! empty($categoria->slug) && $categoriaSlug !== $categoria->slug) {
                    return redirect($categoria->getSeccionSeoUrl($seccion), 301);
                }
            }
        }

        if (! $categoria) {
            abort(404);
        }

        $canonicalSlug = $categoria->getSeoSlug();
        if ($categoriaSlug !== $canonicalSlug) {
            return redirect($categoria->getSeccionSeoUrl($seccion), 301);
        }

        $subcategorias = $categoria->subcategorias;
        $marcas = $categoria->marcas;
        $subcategoriaIds = $subcategorias->pluck('id_subcategoria')->toArray();

        $productos = Producto::with('marca')->whereIn('id_subcategoria', $subcategoriaIds)->get();

        $categoria->setRelation('seccion', $seccion);
        [$resolvedSeccion, $categoriasSidebar, $canonicalPath] = $this->resolveSeccionContext($categoria);

        return Inertia::render('Categoria', [
            'productos' => $productos,
            'categoria' => $categoria,
            'subcategorias' => $subcategorias,
            'marcas' => $marcas,
            'todasCategorias' => Cache::remember('todas_categorias', 3600, function () {
                return Categoria::with('subcategorias')->get();
            }),
            'categoriasSidebar' => $categoriasSidebar,
            'seccion' => $resolvedSeccion,
            'seoSlug' => $canonicalSlug,
            'canonicalPath' => $canonicalPath,
        ]);
    }

    /**
     * Resuelve sección y categorías de sidebar para una categoría dada.
     *
     * @return array{0: ?Seccion, 1: Collection, 2: string}
     */
    private function resolveSeccionContext(Categoria $categoria): array
    {
        $seccion = $categoria->seccion;

        if ($seccion && $seccion->activo) {
            $categoriasSidebar = Cache::remember(
                'categorias_seccion_'.$seccion->id_seccion,
                3600,
                fn () => $seccion->categorias()
                    ->with(['subcategorias' => fn ($q) => $q->orderBy('nombre')])
                    ->orderBy('nombre')
                    ->get()
            );

            return [$seccion, $categoriasSidebar, $categoria->getSeccionSeoUrl($seccion)];
        }

        return [null, collect(), $categoria->getSeoUrl()];
    }

    /*
     * obtener todas las categorias  em json
    */
    public function getCategorias()
    {
        // Obtener todas las categorías
        $categorias = Categoria::all();

        return response()->json($categorias);
    }

    /**
     * crear una nueva categoría y devolver el id
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|max:200',
            'descripcion' => 'nullable|string',
            'video' => 'nullable|url|max:500',
            'imagen' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
            'imagenes.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
        ]);

        // Procesar las imágenes si se proporcionan
        $imagenesArray = [];

        if ($request->has('imagenesDelBanco')) {
            $imagenesDelBanco = json_decode($request->input('imagenesDelBanco'), true);
            $imagenesArray = array_map(function ($imagen) {
                return $imagen['url'];
            }, $imagenesDelBanco);
        } elseif ($request->hasFile('imagenes')) {
            try {
                $imagenes = $request->file('imagenes');
                foreach ($imagenes as $index => $imagen) {
                    $imageName = time().'_'.$index.'.'.$imagen->getClientOriginalExtension();
                    $imagePath = 'categorias/'.$imageName;
                    $imagen->move(public_path('categorias'), $imageName);
                    $imagenesArray[] = $imagePath;
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al subir las imágenes.'], 500);
            }
        } elseif ($request->hasFile('imagen')) {
            // Mantener compatibilidad con imagen única
            try {
                $image = $request->file('imagen');
                $imageName = time().'.'.$image->getClientOriginalExtension();
                $imagePath = 'categorias/'.$imageName;
                $image->move(public_path('categorias'), $imageName);
                $imagenesArray[] = $imagePath;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al subir la imagen.'], 500);
            }
        }

        // Crear directorio de categorías si no existe
        $categoriasDir = public_path('categorias');
        if (! file_exists($categoriasDir)) {
            mkdir($categoriasDir, 0777, true);
        }

        // Crear la categoría
        $categoria = Categoria::create(array_merge($request->except(['imagen', 'imagenes', 'imagenesDelBanco']), [
            'img' => $imagenesArray,
        ]));

        // Ejecutar la lógica de la migración para actualizar relaciones marca-categoria
        $this->actualizarRelacionesMarcaCategoria();

        // Invalidar cache de categorías
        Cache::forget('todas_categorias');
        $this->forgetSeccionCache($categoria->id_seccion);

        return response()->json($categoria);
    }

    /**
     * Actualizar una categoría y devolver el id
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|max:200',
            'descripcion' => 'nullable|string',
            'video' => 'nullable|url|max:500',
            'imagen' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
            'imagenes.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,webm|max:2048',
        ]);

        // Buscar la categoría por ID
        $categoria = Categoria::find($id);

        if (! $categoria) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        $previousSeccionId = $categoria->id_seccion;

        // Preparar datos para actualización
        $dataToUpdate = $request->except(['imagen', 'imagenes', 'imagenesDelBanco']);

        // Solo procesar imágenes si se envían nuevas imágenes
        if ($request->hasFile('imagen') || $request->hasFile('imagenes') || $request->has('imagenesDelBanco')) {
            try {
                // Crear directorio de categorías si no existe
                $categoriasDir = public_path('categorias');
                if (! file_exists($categoriasDir)) {
                    mkdir($categoriasDir, 0777, true);
                }
                // Eliminar las imágenes anteriores si existen
                if ($categoria->img) {
                    $imagenesAnteriores = is_array($categoria->img) ? $categoria->img : [$categoria->img];
                    foreach ($imagenesAnteriores as $imagenAnterior) {
                        if ($imagenAnterior && file_exists(public_path($imagenAnterior))) {
                            unlink(public_path($imagenAnterior));
                        }
                    }
                }

                $imagenesArray = [];

                // Procesar las imágenes si se proporcionan
                if ($request->has('imagenesDelBanco')) {
                    $imagenesDelBanco = json_decode($request->input('imagenesDelBanco'), true);
                    $imagenesArray = array_map(function ($imagen) {
                        return $imagen['url'];
                    }, $imagenesDelBanco);
                } elseif ($request->hasFile('imagenes')) {
                    $imagenes = $request->file('imagenes');
                    foreach ($imagenes as $index => $imagen) {
                        $imageName = time().'_'.$index.'.'.$imagen->getClientOriginalExtension();
                        $imagePath = 'categorias/'.$imageName;
                        $imagen->move(public_path('categorias'), $imageName);
                        $imagenesArray[] = $imagePath;
                    }
                } elseif ($request->hasFile('imagen')) {
                    // Mantener compatibilidad con imagen única
                    $image = $request->file('imagen');
                    $imageName = time().'.'.$image->getClientOriginalExtension();
                    $imagePath = 'categorias/'.$imageName;
                    $image->move(public_path('categorias'), $imageName);
                    $imagenesArray[] = $imagePath;
                }

                // Agregar las imágenes a los datos de actualización
                $dataToUpdate['img'] = $imagenesArray;

            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => 'Error al actualizar las imágenes: '.$e->getMessage(),
                ], 500);
            }
        }

        // Actualizar la categoría
        $categoria->update($dataToUpdate);

        // Invalidar cache de categorías
        Cache::forget('todas_categorias');
        $this->forgetSeccionCache($categoria->id_seccion);
        $this->forgetSeccionCache($previousSeccionId);

        return response()->json($categoria);
    }

    /**
     * Actualizar solo la imagen de una categoría
     */
    public function updateCategoryImage(Request $request)
    {
        $request->validate([
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'imagen.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Buscar la categoría por ID
        $categoria = Categoria::find($request->id_categoria);

        try {
            // Crear directorio de categorías si no existe
            $categoriasDir = public_path('categorias');
            if (! file_exists($categoriasDir)) {
                mkdir($categoriasDir, 0777, true);
            }

            // Eliminar las imágenes anteriores si existen
            if ($categoria->img) {
                $imagenesAnteriores = is_array($categoria->img) ? $categoria->img : [$categoria->img];
                foreach ($imagenesAnteriores as $imagenAnterior) {
                    if ($imagenAnterior && file_exists(public_path($imagenAnterior))) {
                        unlink(public_path($imagenAnterior));
                    }
                }
            }

            $imagenesArray = [];

            // Procesar múltiples imágenes con formato imagen[0], imagen[1], etc.
            if ($request->has('imagen') && is_array($request->file('imagen'))) {
                $imagenes = $request->file('imagen');
                foreach ($imagenes as $index => $imagen) {
                    if ($imagen && $imagen->isValid()) {
                        $imageName = time().'_'.$index.'.'.$imagen->getClientOriginalExtension();
                        $imagePath = 'categorias/'.$imageName;
                        $imagen->move(public_path('categorias'), $imageName);
                        $imagenesArray[] = $imagePath;
                    }
                }
            }
            // Mantener compatibilidad con el formato anterior 'imagenes'
            elseif ($request->hasFile('imagenes')) {
                $imagenes = $request->file('imagenes');
                foreach ($imagenes as $index => $imagen) {
                    $imageName = time().'_'.$index.'.'.$imagen->getClientOriginalExtension();
                    $imagePath = 'categorias/'.$imageName;
                    $imagen->move(public_path('categorias'), $imageName);
                    $imagenesArray[] = $imagePath;
                }
            }
            // Mantener compatibilidad con imagen única
            elseif ($request->hasFile('imagen') && ! is_array($request->file('imagen'))) {
                $image = $request->file('imagen');
                $imageName = time().'.'.$image->getClientOriginalExtension();
                $imagePath = 'categorias/'.$imageName;
                $image->move(public_path('categorias'), $imageName);
                $imagenesArray[] = $imagePath;
            }

            // Actualizar el campo de imágenes
            $categoria->img = $imagenesArray;
            $categoria->save();

            // Invalidar cache de categorías
            Cache::forget('todas_categorias');

            return response()->json([
                'success' => true,
                'message' => 'Imágenes actualizadas correctamente',
                'img' => $imagenesArray,
                'categoria' => $categoria->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar las imágenes: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar una categoría y devolver el id
     */
    public function destroy($id)
    {
        try {
            // Buscar la categoría
            $categoria = Categoria::findOrFail($id);

            // Eliminar las imágenes si existen
            if ($categoria->img) {
                $imagenes = is_array($categoria->img) ? $categoria->img : [$categoria->img];
                foreach ($imagenes as $imagen) {
                    if ($imagen && file_exists(public_path($imagen))) {
                        unlink(public_path($imagen));
                    }
                }
            }

            // Eliminar la categoría
            $seccionId = $categoria->id_seccion;
            $categoria->delete();

            // Invalidar cache de categorías
            Cache::forget('todas_categorias');
            $this->forgetSeccionCache($seccionId);

            return response()->json($id);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la categoría: '.$e->getMessage(),
            ], 500);
        }
    }

    // obtener  las categorias y las sub categorias con sus ids y sus nombres
    public function getCategoriasConSubcategoriasIds()
    {
        // Obtener todas las categorías con sus subcategorías incluyendo las imágenes
        $categorias = Categoria::with('subcategorias:id_subcategoria,nombre,id_categoria')->get(['id_categoria', 'nombre', 'slug', 'img']);

        // Debug: agregar información sobre las imágenes
        $categorias->each(function ($categoria) {
            $rawImg = $categoria->getAttributes()['img'] ?? null;
            \Log::info("Categoria {$categoria->nombre}: raw_img = ".($rawImg ? $rawImg : 'NULL').', processed_img = '.json_encode($categoria->img));
        });

        // Devolver las categorías como respuesta JSON
        return response()->json($categorias);
    }

    /**
     * Debug endpoint for category images
     */
    public function debugCategoryImages()
    {
        $categorias = Categoria::all(['id_categoria', 'nombre', 'img']);

        $debug = [];
        foreach ($categorias as $categoria) {
            $rawImg = $categoria->getAttributes()['img'] ?? null;
            $processedImg = $categoria->img;

            $debug[] = [
                'id' => $categoria->id_categoria,
                'nombre' => $categoria->nombre,
                'raw_img' => $rawImg,
                'processed_img' => $processedImg,
                'is_array' => is_array($processedImg),
                'count' => is_array($processedImg) ? count($processedImg) : null,
            ];
        }

        return response()->json($debug);
    }

    /**
     * Obtener las subcategorías de una categoría específica
     */
    public function getSubcategorias($id_categoria)
    {
        $categoria = Categoria::find($id_categoria);

        if (! $categoria) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        $subcategorias = $categoria->subcategorias;

        return response()->json($subcategorias);
    }

    /**
     * Olvida la caché de categorías de una sección específica.
     */
    private function forgetSeccionCache(?int $seccionId): void
    {
        if ($seccionId) {
            Cache::forget('categorias_seccion_'.$seccionId);
        }
    }

    /**
     * Actualizar relaciones marca-categoria basándose en productos existentes
     */
    private function actualizarRelacionesMarcaCategoria()
    {
        // Insertar las relaciones marca-categoria basadas en los productos existentes
        $query = '
            INSERT INTO marca_categoria (marca_id, categoria_id, created_at, updated_at)
            SELECT DISTINCT 
                p.marca_id,
                s.id_categoria,
                NOW(),
                NOW()
            FROM productos p
            INNER JOIN subcategorias s ON p.id_subcategoria = s.id_subcategoria
            WHERE p.marca_id IS NOT NULL 
            AND s.id_categoria IS NOT NULL
            ON DUPLICATE KEY UPDATE updated_at = NOW()
        ';

        DB::statement($query);
    }
}
