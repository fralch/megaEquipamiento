<?php

namespace App\Console\Commands;

use App\Models\Producto;
use App\Services\Csv\CsvProductoParser;
use Illuminate\Console\Command;

class ImportProductosCsvCommand extends Command
{
    protected $signature = 'productos:import-csv
        {archivo : Ruta absoluta o relativa al CSV}
        {--dry-run : Solo parsea y muestra el resumen, no inserta nada}
        {--auto-create : Crea categorías/subcategorías/marcas faltantes sin preguntar}';

    protected $description = 'Importa productos desde un CSV al catálogo.';

    public function handle(CsvProductoParser $parser): int
    {
        $path = $this->argument('archivo');
        if (! file_exists($path)) {
            $this->error("No se encontró el archivo: {$path}");

            return self::FAILURE;
        }

        $this->info("Parseando {$path}…");
        $result = $parser->parse($path);

        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Productos detectados', $result->totalProcesables()],
                ['Errores de filas', $result->totalErrores()],
                ['Categorías pendientes', count($result->categoriasPendientes)],
                ['Subcategorías pendientes', count($result->subcategoriasPendientes)],
                ['Marcas pendientes', count($result->marcasPendientes)],
            ]
        );

        if ($result->errores !== []) {
            $this->warn('Errores de filas:');
            foreach ($result->errores as $e) {
                $this->line("  fila {$e['fila']} (sku: ".($e['sku'] ?? '—')."): {$e['motivo']}");
            }
        }

        if ($result->tienePendientes() && ! $this->option('auto-create')) {
            $this->warn('Hay dependencias pendientes. Usa --auto-create para crearlas automáticamente.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->info('Dry-run: no se insertó nada.');

            return self::SUCCESS;
        }

        if (! $this->option('auto-create')) {
            $this->info('Use --auto-create para crear dependencias faltantes, o resuélvalas vía UI.');

            return self::SUCCESS;
        }

        // Auto-create: resolver marcas, categorías, subcategorías, luego importar
        $marcasMap = $parser->resolveMarcas($result);
        $categoriasMap = $parser->resolveCategorias($result);
        $subcategoriasMap = $parser->resolveSubcategorias($result, $categoriasMap);

        $insertados = 0;
        $actualizados = 0;
        foreach ($result->productos as $row) {
            $idSubcategoria = $subcategoriasMap[$row['subcategoria_pendiente_key']] ?? $row['id_subcategoria'];
            $marcaKey = $row['marca_nombre'] !== null
                ? $parser->normalizeNameForKey($row['marca_nombre'])
                : null;
            $marcaId = $marcaKey !== null
                ? ($marcasMap[$marcaKey] ?? $row['marca_id'])
                : $row['marca_id'];

            if (empty($idSubcategoria)) {
                continue;
            }

            $payload = [
                'sku' => $row['sku'],
                'nombre' => $row['nombre'],
                'id_subcategoria' => $idSubcategoria,
                'marca_id' => $marcaId,
                'pais' => $row['pais'],
                'precio_sin_ganancia' => $row['precio_sin_ganancia'],
                'precio_ganancia' => $row['precio_ganancia'],
                'precio_igv' => $row['precio_igv'],
                'descripcion' => $row['descripcion'],
                'video' => $row['video'],
                'envio' => $row['envio'],
                'soporte_tecnico' => $row['soporte_tecnico'],
                'caracteristicas' => $row['caracteristicas'] ?? [],
                'especificaciones_tecnicas' => $row['especificaciones_tecnicas'],
                'archivos_adicionales' => $row['documentos'] ?? null,
            ];

            $p = Producto::updateOrCreate(['sku' => $row['sku']], $payload);
            $p->wasRecentlyCreated ? $insertados++ : $actualizados++;
        }

        $this->info("Importación finalizada: {$insertados} insertados, {$actualizados} actualizados.");

        return self::SUCCESS;
    }
}
