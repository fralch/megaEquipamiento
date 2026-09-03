<?php

namespace App\Console\Commands;

use App\Models\Marca;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RegenerateSitemapMarcas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:regenerate-marcas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualiza las URLs de marcas en public/sitemap.xml al formato SEO con slug.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sitemapPath = public_path('sitemap.xml');

        if (! file_exists($sitemapPath)) {
            $this->error('No se encontró public/sitemap.xml');

            return 1;
        }

        $xml = file_get_contents($sitemapPath);

        // Extraer todos los IDs de marca presentes en el sitemap
        preg_match_all('#<loc>https?://[^/]+/marcas/(\d+)</loc>#', $xml, $matches);
        $ids = array_unique(array_map('intval', $matches[1]));

        if (empty($ids)) {
            $this->info('No se encontraron URLs de marcas para actualizar.');

            return 0;
        }

        $this->info('Marcas encontradas en sitemap: '.count($ids));

        // Cargar nombres de marcas en una sola consulta (bajo consumo de memoria)
        $marcas = Marca::whereIn('id_marca', $ids)
            ->get(['id_marca', 'nombre'])
            ->keyBy('id_marca');

        $reemplazos = 0;

        foreach ($ids as $id) {
            $marca = $marcas->get($id);

            if (! $marca) {
                $this->warn("Marca ID {$id} no existe en la BD. Se omite.");
                continue;
            }

            $slug = $this->buildSlug($marca->nombre, $id);
            $oldUrl = "/marcas/{$id}";
            $newUrl = "/marcas/{$slug}";

            // Reemplazo seguro dentro de etiquetas <loc> para la ruta exacta
            $xml = preg_replace(
                '#(<loc>https?://[^/]+)'.preg_quote($oldUrl, '#').'(</loc>)#',
                '$1'.$newUrl.'$2',
                $xml,
                -1,
                $count
            );

            $reemplazos += $count;
        }

        file_put_contents($sitemapPath, $xml);

        $this->info("Sitemap actualizado. Reemplazos realizados: {$reemplazos}");

        return 0;
    }

    /**
     * Genera el slug SEO de una marca (igual que Marca::getSeoSlug).
     */
    private function buildSlug(string $nombre, int $id): string
    {
        $slug = Str::slug($nombre);
        if (empty($slug)) {
            $slug = 'marca';
        }

        return $slug.'-'.$id;
    }
}
