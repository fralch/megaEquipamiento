<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class OptimizeApp extends Command
{
    protected $signature = 'app:optimize';
    protected $description = 'Optimize the application for better performance';

    public function handle()
    {
        $this->info('🚀 Optimizing MegaEquipamiento application...');

        $this->info('📦 Clearing caches...');
        $this->clearCaches();

        $this->info('🔧 Optimizing configurations...');
        $this->optimizeConfigs();

        $this->info('💾 Warming up caches...');
        $this->warmupCaches();

        $this->info('✅ Application optimized successfully!');
        
        $this->displayTips();

        return Command::SUCCESS;
    }

    private function clearCaches()
    {
        $commands = [
            'cache:clear',
            'config:clear',
            'route:clear',
            'view:clear',
        ];

        foreach ($commands as $command) {
            try {
                Artisan::call($command);
                $this->line("   ✓ {$command}");
            } catch (\Exception $e) {
                $this->warn("   ⚠ {$command} failed: " . $e->getMessage());
            }
        }
    }

    private function optimizeConfigs()
    {
        $commands = [
            'config:cache',
            'route:cache',
            'view:cache',
        ];

        foreach ($commands as $command) {
            try {
                Artisan::call($command);
                $this->line("   ✓ {$command}");
            } catch (\Exception $e) {
                $this->warn("   ⚠ {$command} failed: " . $e->getMessage());
            }
        }
    }

    private function warmupCaches()
    {
        // Cache categorías por 1 hora
        Cache::remember('todas_categorias', 3600, function () {
            return \App\Models\Categoria::with('subcategorias')->get();
        });

        // Cache marcas por 1 hora
        Cache::remember('todas_marcas', 3600, function () {
            return \App\Models\Marca::all();
        });

        $this->line("   ✓ Categorías and marcas cached");
    }

    private function displayTips()
    {
        $this->info('💡 Performance Tips:');
        $this->line('   • Use "composer run dev" for development');
        $this->line('   • Run "npm run build" for production');
        $this->line('   • Enable OPcache in production');
        $this->line('   • Consider using Redis for sessions/cache in production');
        $this->line('   • Monitor with "composer run dev" during development');
    }
}