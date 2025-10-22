<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class VerificarEspecificaciones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'verificar:especificaciones {producto_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar las especificaciones técnicas de los productos en la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $productoId = $this->argument('producto_id');

        if ($productoId) {
            // Verificar un producto específico
            $this->verificarProducto($productoId);
        } else {
            // Verificar todos los productos
            $this->verificarTodos();
        }

        return 0;
    }

    private function verificarProducto($id)
    {
        $this->info("=== Verificando producto ID: {$id} ===");

        // Consulta directa a la base de datos
        $productoDB = DB::table('productos')->where('id_producto', $id)->first();

        if (!$productoDB) {
            $this->error("Producto no encontrado");
            return;
        }

        $this->info("Nombre: {$productoDB->nombre}");
        $this->info("SKU: {$productoDB->sku}");

        // Verificar especificaciones técnicas directamente de la BD
        $this->line("\n--- ESPECIFICACIONES TÉCNICAS (RAW desde BD) ---");
        $this->line("Tipo: " . gettype($productoDB->especificaciones_tecnicas));
        $this->line("Contenido: " . ($productoDB->especificaciones_tecnicas ?? 'NULL'));

        // Ahora con Eloquent
        $producto = Producto::find($id);

        $this->line("\n--- ESPECIFICACIONES TÉCNICAS (Eloquent con cast) ---");
        $this->line("Tipo: " . gettype($producto->especificaciones_tecnicas));

        if (is_array($producto->especificaciones_tecnicas)) {
            $this->line("Count: " . count($producto->especificaciones_tecnicas));
            $this->line("Contenido:");
            foreach ($producto->especificaciones_tecnicas as $key => $value) {
                $this->line("  - {$key}: {$value}");
            }
        } else {
            $this->line("Contenido: " . json_encode($producto->especificaciones_tecnicas));
        }

        // Verificar imagen
        $this->line("\n--- IMAGEN ---");
        $this->line("Tipo (BD): " . gettype($productoDB->imagen));
        $this->line("Tipo (Eloquent): " . gettype($producto->imagen));
        if (is_array($producto->imagen)) {
            $this->line("Count: " . count($producto->imagen));
        }
    }

    private function verificarTodos()
    {
        $this->info("=== Verificando todos los productos ===");

        // Contar productos con especificaciones técnicas
        $total = Producto::count();
        $conEspecificaciones = Producto::whereNotNull('especificaciones_tecnicas')
            ->where('especificaciones_tecnicas', '!=', '')
            ->where('especificaciones_tecnicas', '!=', '[]')
            ->where('especificaciones_tecnicas', '!=', '{}')
            ->count();

        $this->info("Total de productos: {$total}");
        $this->info("Con especificaciones técnicas: {$conEspecificaciones}");

        // Mostrar primeros 5 productos con especificaciones
        $this->line("\n--- Primeros 5 productos con especificaciones ---");

        $productos = Producto::whereNotNull('especificaciones_tecnicas')
            ->where('especificaciones_tecnicas', '!=', '')
            ->where('especificaciones_tecnicas', '!=', '[]')
            ->where('especificaciones_tecnicas', '!=', '{}')
            ->limit(5)
            ->get();

        foreach ($productos as $p) {
            $this->line("\nID: {$p->id_producto} - {$p->nombre}");
            $this->line("Tipo: " . gettype($p->especificaciones_tecnicas));
            if (is_array($p->especificaciones_tecnicas)) {
                $this->line("Count: " . count($p->especificaciones_tecnicas));
                $keys = array_keys($p->especificaciones_tecnicas);
                $this->line("Keys: " . implode(', ', array_slice($keys, 0, 5)));
            } else {
                $this->line("Valor: " . substr(json_encode($p->especificaciones_tecnicas), 0, 100));
            }
        }
    }
}
