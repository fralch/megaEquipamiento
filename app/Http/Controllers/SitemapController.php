<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Subcategoria;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

class SitemapController extends Controller
{
    /**
     * Generar sitemap XML
     */
    public function generate()
    {
        try {
            Artisan::call('sitemap:generate');
            
            return response()->json([
                'success' => true,
                'message' => 'Sitemap generado exitosamente',
                'url' => url('/sitemap.xml')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar sitemap: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mostrar sitemap XML
     */
    public function show()
    {
        $sitemapPath = public_path('sitemap.xml');
        
        if (!file_exists($sitemapPath)) {
            // Si no existe, generarlo automáticamente
            Artisan::call('sitemap:generate');
        }
        
        return response()->file($sitemapPath, [
            'Content-Type' => 'application/xml'
        ]);
    }
    
    /**
     * Generar sitemap dinámicamente sin guardarlo
     */
    public function dynamic()
    {
        $sitemap = Sitemap::create();
        
        // Página principal
        $sitemap->add(
            Url::create(url('/'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(1.0)
        );
        
        // Página de contacto
        $sitemap->add(
            Url::create(url('/contacto'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.8)
        );
        
        // Productos
        Producto::chunk(100, function ($productos) use ($sitemap) {
            foreach ($productos as $producto) {
                $sitemap->add(
                    Url::create(url('/producto/' . $producto->id_producto))
                        ->setLastModificationDate($producto->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.9)
                );
            }
        });
        
        // Categorías
        Categoria::chunk(50, function ($categorias) use ($sitemap) {
            foreach ($categorias as $categoria) {
                $sitemap->add(
                    Url::create(url('/categoria/' . $categoria->id_categoria))
                        ->setLastModificationDate($categoria->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.8)
                );
            }
        });
        
        // Marcas
        Marca::chunk(50, function ($marcas) use ($sitemap) {
            foreach ($marcas as $marca) {
                $sitemap->add(
                    Url::create(url('/marcas/' . $marca->id_marca))
                        ->setLastModificationDate($marca->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.7)
                );
            }
        });
        
        return response($sitemap->render(), 200, [
            'Content-Type' => 'application/xml'
        ]);
    }
}