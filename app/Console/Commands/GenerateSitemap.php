<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Subcategoria;
use Carbon\Carbon;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sitemap for better SEO';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generando sitemap...');
        
        // Configurar la URL base para producción
        $baseUrl = 'https://megaequipamiento.pe';
        $sitemap = Sitemap::create($baseUrl);
        
        // Página principal
        $sitemap->add(
            Url::create('/')
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(1.0)
        );
        
        // Página de contacto
        $sitemap->add(
            Url::create('/contacto')
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.8)
        );
        
        // Agregar productos
        $this->info('Agregando productos al sitemap...');
        Producto::chunk(100, function ($productos) use ($sitemap) {
            foreach ($productos as $producto) {
                $url = Url::create("/producto/{$producto->id}")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8);
                
                if ($producto->updated_at) {
                    $url->setLastModificationDate($producto->updated_at);
                }
                
                $sitemap->add($url);
            }
        });
        
        // Categorías
        $this->info('Agregando categorías al sitemap...');
        Categoria::chunk(50, function ($categorias) use ($sitemap) {
            foreach ($categorias as $categoria) {
                $url = Url::create('/categorias/' . $categoria->id_categoria)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8);
                
                if ($categoria->updated_at) {
                    $url->setLastModificationDate($categoria->updated_at);
                }
                
                $sitemap->add($url);
            }
        });
        
        // Marcas
        $this->info('Agregando marcas al sitemap...');
        Marca::chunk(50, function ($marcas) use ($sitemap) {
            foreach ($marcas as $marca) {
                $url = Url::create('/marcas/' . $marca->id_marca)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.7);
                
                if ($marca->updated_at) {
                    $url->setLastModificationDate($marca->updated_at);
                }
                
                $sitemap->add($url);
            }
        });
        
        // Subcategorías (si tienes rutas específicas para ellas)
        $this->info('Agregando subcategorías al sitemap...');
        Subcategoria::chunk(50, function ($subcategorias) use ($sitemap) {
            foreach ($subcategorias as $subcategoria) {
                // Asumiendo que tienes rutas para subcategorías
                $url = Url::create('/subcategoria/' . $subcategoria->id_subcategoria)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.6);
                
                if ($subcategoria->updated_at) {
                    $url->setLastModificationDate($subcategoria->updated_at);
                }
                
                $sitemap->add($url);
            }
        });
        
        // Guardar el sitemap
        $sitemap->writeToFile(public_path('sitemap.xml'));
        
        $this->info('Sitemap generado exitosamente en public/sitemap.xml');
        
        return Command::SUCCESS;
    }
}
