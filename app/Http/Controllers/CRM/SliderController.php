<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SliderController extends Controller
{
    /**
     * Vista Inertia: página de gestión del slider dentro del CRM.
     */
    public function index()
    {
        return Inertia::render('CRM/Slider/GestionSlider');
    }

    /**
     * API: lista completa (incluyendo inactivos) para la tabla del CRM.
     */
    public function data(): JsonResponse
    {
        $slides = Slider::ordenado()
            ->get()
            ->map(function (Slider $slide) {
                return $this->serialize($slide);
            });

        return response()->json(['slides' => $slides]);
    }

    /**
     * API: detalle de un slide.
     */
    public function show($id): JsonResponse
    {
        $slide = Slider::findOrFail($id);

        return response()->json(['slide' => $this->serialize($slide)]);
    }

    /**
     * API: crear un slide.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        $pathImagen = null;
        if ($request->hasFile('imagen')) {
            $pathImagen = $this->storeImage($request->file('imagen'));
        }

        $slide = Slider::create([
            'tipo' => $validated['tipo'],
            'titulo' => $validated['titulo'] ?? null,
            'subtitulo' => $validated['subtitulo'] ?? null,
            'subtitulo_2' => $validated['subtitulo_2'] ?? null,
            'subtitulo_pie' => $validated['subtitulo_pie'] ?? null,
            'texto_boton' => $validated['texto_boton'] ?? 'Ver más',
            'url_boton' => $validated['url_boton'] ?? null,
            'imagen' => $pathImagen,
            'video_youtube_id' => $validated['tipo'] === 'video' ? ($validated['video_youtube_id'] ?? null) : null,
            'orden' => $validated['orden'] ?? (Slider::max('orden') ?? 0) + 1,
            'activo' => $validated['activo'] ?? true,
        ]);

        return response()->json([
            'message' => 'Slide creado exitosamente',
            'slide' => $this->serialize($slide),
        ], 201);
    }

    /**
     * API: actualizar un slide.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $slide = Slider::findOrFail($id);

        $validated = $this->validatePayload($request, $slide->id_slider);

        if ($request->hasFile('imagen')) {
            $this->deleteImageFile($slide->imagen);
            $slide->imagen = $this->storeImage($request->file('imagen'));
        }

        $slide->tipo = $validated['tipo'];
        $slide->titulo = $validated['titulo'] ?? null;
        $slide->subtitulo = $validated['subtitulo'] ?? null;
        $slide->subtitulo_2 = $validated['subtitulo_2'] ?? null;
        $slide->subtitulo_pie = $validated['subtitulo_pie'] ?? null;
        $slide->texto_boton = $validated['texto_boton'] ?? 'Ver más';
        $slide->url_boton = $validated['url_boton'] ?? null;
        $slide->video_youtube_id = $validated['tipo'] === 'video' ? ($validated['video_youtube_id'] ?? null) : null;
        $slide->orden = $validated['orden'] ?? $slide->orden;
        $slide->activo = $validated['activo'] ?? $slide->activo;
        $slide->save();

        return response()->json([
            'message' => 'Slide actualizado exitosamente',
            'slide' => $this->serialize($slide),
        ]);
    }

    /**
     * API: eliminar un slide (y su imagen física).
     */
    public function destroy($id): JsonResponse
    {
        $slide = Slider::findOrFail($id);
        $this->deleteImageFile($slide->imagen);
        $slide->delete();

        return response()->json(['message' => 'Slide eliminado exitosamente']);
    }

    /**
     * API: toggle activo/inactivo.
     */
    public function toggleActivo($id): JsonResponse
    {
        $slide = Slider::findOrFail($id);
        $slide->activo = ! $slide->activo;
        $slide->save();

        return response()->json([
            'message' => 'Estado del slide actualizado',
            'slide' => $this->serialize($slide),
        ]);
    }

    /**
     * API: reordenar. Espera { items: [{ id_slider, orden }, ...] }.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id_slider' => 'required|integer|exists:sliders,id_slider',
            'items.*.orden' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                foreach ($validated['items'] as $item) {
                    Slider::where('id_slider', $item['id_slider'])->update(['orden' => $item['orden']]);
                }
            });
        } catch (\Throwable $e) {
            Log::error('Error reordenando sliders: '.$e->getMessage());

            return response()->json(['message' => 'No se pudo reordenar'], 500);
        }

        return response()->json(['message' => 'Orden actualizado']);
    }

    /**
     * Validación central de payload de creación / edición.
     */
    private function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        // Normaliza el input de YouTube: acepta URL completa o ID crudo y guarda solo el ID.
        // Si el input es no-vacío pero no se puede extraer un ID, se deja el valor original
        // para que el validator lo rechace con 422.
        if ($request->has('video_youtube_id')) {
            $raw = (string) $request->input('video_youtube_id');
            $trimmed = trim($raw);
            if ($trimmed !== '') {
                $extracted = $this->extractYouTubeId($trimmed);
                $request->merge(['video_youtube_id' => $extracted !== '' ? $extracted : $raw]);
            }
        }

        return $request->validate([
            'tipo' => 'required|in:imagen,video',
            'titulo' => 'nullable|string|max:255',
            'subtitulo' => 'nullable|string|max:255',
            'subtitulo_2' => 'nullable|string|max:255',
            'subtitulo_pie' => 'nullable|string|max:255',
            'texto_boton' => 'nullable|string|max:100',
            'url_boton' => 'nullable|url|max:500',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'video_youtube_id' => 'nullable|string|max:50|regex:/^[A-Za-z0-9_-]{11}$/',
            'orden' => 'nullable|integer|min:0',
            'activo' => 'nullable|boolean',
        ]);
    }

    /**
     * Extrae el ID de 11 caracteres de cualquier URL de YouTube.
     * Si ya es un ID crudo válido, lo devuelve tal cual.
     * Devuelve string vacío si no se puede extraer.
     */
    private function extractYouTubeId(string $input): string
    {
        $input = trim($input);
        if ($input === '') {
            return '';
        }
        if (preg_match('/^[A-Za-z0-9_-]{11}$/', $input)) {
            return $input;
        }
        if (preg_match('/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/', $input, $m)) {
            return $m[1];
        }

        return '';
    }

    /**
     * Guarda la imagen subida en public/img/slider/ y devuelve la ruta relativa.
     */
    private function storeImage($file): string
    {
        $dir = public_path('img/slider');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $ext = strtolower($file->getClientOriginalExtension() ?: 'webp');
        $filename = 'slider-'.Str::random(20).'.'.$ext;
        $file->move($dir, $filename);

        return 'img/slider/'.$filename;
    }

    /**
     * Elimina el archivo físico de una imagen (si existe).
     */
    private function deleteImageFile(?string $relativePath): void
    {
        if (! $relativePath) {
            return;
        }
        $abs = public_path($relativePath);
        if (is_file($abs)) {
            @unlink($abs);
        }
    }

    /**
     * Serializa un slide para enviarlo al frontend.
     */
    private function serialize(Slider $slide): array
    {
        return [
            'id_slider' => $slide->id_slider,
            'tipo' => $slide->tipo,
            'titulo' => $slide->titulo,
            'subtitulo' => $slide->subtitulo,
            'subtitulo_2' => $slide->subtitulo_2,
            'subtitulo_pie' => $slide->subtitulo_pie,
            'texto_boton' => $slide->texto_boton,
            'url_boton' => $slide->url_boton,
            'imagen' => $slide->imagen,
            'imagen_url' => $slide->imagen_url,
            'video_youtube_id' => $slide->video_youtube_id,
            'video_thumbnail' => $slide->video_thumbnail,
            'orden' => $slide->orden,
            'activo' => $slide->activo,
        ];
    }
}
