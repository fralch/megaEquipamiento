<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Categoria;

class DebugCategoryImages extends Command
{
    protected $signature = 'debug:category-images';
    protected $description = 'Debug category images in database';

    public function handle()
    {
        $this->info('Debugging category images...');
        
        $categorias = Categoria::all(['id_categoria', 'nombre', 'img']);
        
        foreach ($categorias as $categoria) {
            $rawImg = $categoria->getAttributes()['img'] ?? null;
            $processedImg = $categoria->img;
            
            $this->line("=== Categoria: {$categoria->nombre} (ID: {$categoria->id_categoria}) ===");
            $this->line("Raw img field: " . ($rawImg ? $rawImg : 'NULL'));
            $this->line("Processed img: " . json_encode($processedImg));
            $this->line("Is array: " . (is_array($processedImg) ? 'YES' : 'NO'));
            $this->line("Array count: " . (is_array($processedImg) ? count($processedImg) : 'N/A'));
            $this->line("");
        }
        
        $this->info('Debug complete.');
    }
}