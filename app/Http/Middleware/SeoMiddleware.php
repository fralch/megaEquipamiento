<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;

class SeoMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $seoData = $this->generateSeoData($request);
        
        // Compartir datos SEO con Inertia
        Inertia::share('seo', $seoData);
        
        return $next($request);
    }
    
    /**
     * Generar datos SEO basados en la ruta actual
     */
    private function generateSeoData(Request $request): array
    {
        $path = $request->path();
        $segments = explode('/', $path);
        
        $defaultSeo = [
            'title' => 'MegaEquipamiento - Equipos de Laboratorio',
            'description' => 'Encuentra los mejores equipos de laboratorio, instrumentos científicos y suministros para tu laboratorio. Calidad garantizada y envío a todo el país.',
            'keywords' => 'equipos laboratorio, instrumentos científicos, suministros laboratorio, equipamiento médico',
            'image' => asset('img/logo2.png'),
            'url' => $request->url(),
            'type' => 'website'
        ];
        
        // SEO específico por ruta
        switch ($segments[0]) {
            case 'producto':
                if (isset($segments[1])) {
                    return $this->getProductSeo($segments[1], $defaultSeo);
                }
                break;
                
            case 'categoria':
                if (isset($segments[1])) {
                    return $this->getCategorySeo($segments[1], $defaultSeo);
                }
                break;
                
            case 'marcas':
                if (isset($segments[1])) {
                    return $this->getBrandSeo($segments[1], $defaultSeo);
                }
                break;
                
            case 'contacto':
                return array_merge($defaultSeo, [
                    'title' => 'Contacto - MegaEquipamiento',
                    'description' => 'Contáctanos para obtener información sobre nuestros equipos de laboratorio. Atención personalizada y asesoría técnica especializada.',
                    'keywords' => 'contacto, asesoría técnica, equipos laboratorio, soporte'
                ]);
                
            case '':
                // Página principal
                return array_merge($defaultSeo, [
                    'title' => 'MegaEquipamiento - Equipos de Laboratorio de Calidad',
                    'description' => 'Líder en equipos de laboratorio en Perú. Amplio catálogo de instrumentos científicos, equipamiento médico y suministros para laboratorios.',
                    'keywords' => 'equipos laboratorio Perú, instrumentos científicos, equipamiento médico, suministros laboratorio, MegaEquipamiento'
                ]);
        }
        
        return $defaultSeo;
    }
    
    /**
     * SEO para páginas de productos
     */
    private function getProductSeo($productId, $defaultSeo): array
    {
        try {
            $producto = Producto::with(['marca', 'subcategoria.categoria'])->find($productId);
            
            if (!$producto) {
                return $defaultSeo;
            }
            
            $title = $producto->nombre . ' - ' . ($producto->marca ? $producto->marca->nombre : 'MegaEquipamiento');
            $description = $producto->descripcion ? 
                substr(strip_tags($producto->descripcion), 0, 155) . '...' : 
                'Encuentra ' . $producto->nombre . ' de calidad en MegaEquipamiento. Envío a todo el país.';
            
            $keywords = $producto->nombre;
            if ($producto->marca) {
                $keywords .= ', ' . $producto->marca->nombre;
            }
            if ($producto->subcategoria) {
                $keywords .= ', ' . $producto->subcategoria->nombre;
                if ($producto->subcategoria->categoria) {
                    $keywords .= ', ' . $producto->subcategoria->categoria->nombre;
                }
            }
            
            $image = $defaultSeo['image'];
            if ($producto->imagen && is_array($producto->imagen) && count($producto->imagen) > 0) {
                $image = asset('storage/' . $producto->imagen[0]);
            }
            
            return array_merge($defaultSeo, [
                'title' => $title,
                'description' => $description,
                'keywords' => $keywords,
                'image' => $image,
                'type' => 'product'
            ]);
            
        } catch (\Exception $e) {
            return $defaultSeo;
        }
    }
    
    /**
     * SEO para páginas de categorías
     */
    private function getCategorySeo($categoryId, $defaultSeo): array
    {
        try {
            $categoria = Categoria::find($categoryId);
            
            if (!$categoria) {
                return $defaultSeo;
            }
            
            $title = $categoria->nombre . ' - Equipos de Laboratorio | MegaEquipamiento';
            $description = $categoria->descripcion ? 
                substr(strip_tags($categoria->descripcion), 0, 155) . '...' : 
                'Encuentra los mejores equipos de ' . $categoria->nombre . ' para tu laboratorio. Calidad garantizada y envío a todo el país.';
            
            return array_merge($defaultSeo, [
                'title' => $title,
                'description' => $description,
                'keywords' => $categoria->nombre . ', equipos laboratorio, ' . $defaultSeo['keywords']
            ]);
            
        } catch (\Exception $e) {
            return $defaultSeo;
        }
    }
    
    /**
     * SEO para páginas de marcas
     */
    private function getBrandSeo($brandId, $defaultSeo): array
    {
        try {
            $marca = Marca::find($brandId);
            
            if (!$marca) {
                return $defaultSeo;
            }
            
            $title = 'Productos ' . $marca->nombre . ' - MegaEquipamiento';
            $description = $marca->descripcion ? 
                substr(strip_tags($marca->descripcion), 0, 155) . '...' : 
                'Encuentra todos los productos de la marca ' . $marca->nombre . ' en MegaEquipamiento. Calidad garantizada.';
            
            return array_merge($defaultSeo, [
                'title' => $title,
                'description' => $description,
                'keywords' => $marca->nombre . ', equipos laboratorio, ' . $defaultSeo['keywords']
            ]);
            
        } catch (\Exception $e) {
            return $defaultSeo;
        }
    }
}
