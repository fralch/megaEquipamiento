<?php

namespace App\Console\Commands;

use App\Services\Csv\CsvProductoParser;
use App\Models\Producto;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ImportarCsvsProductos extends Command
{
    protected $signature = 'productos:importar-csvs
        {directorio : Ruta al directorio que contiene los CSVs}
        {--auto-crear : Crear automáticamente categorías, subcategorías y marcas pendientes}
        {--dry-run : Solo mostrar preview sin insertar en BD}';

    protected $description = 'Importa productos desde todos los archivos CSV de un directorio';

    public function __construct(private readonly CsvProductoParser $parser)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $directorio = $this->argument('directorio');
        $autoCrear = $this->option('auto-crear');
        $dryRun = $this->option('dry-run');

        // Resolver ruta relativa al base_path
        if (! str_starts_with($directorio, '/') && ! preg_match('/^[A-Za-z]:/', $directorio)) {
            $directorio = base_path($directorio);
        }

        if (! is_dir($directorio)) {
            $this->error("El directorio no existe: {$directorio}");

            return self::FAILURE;
        }

        // Buscar archivos CSV/TXT
        $archivos = glob($directorio.DIRECTORY_SEPARATOR.'*.{csv,txt,CSV,TXT}', GLOB_BRACE);

        if (empty($archivos)) {
            $this->error('No se encontraron archivos .csv o .txt en el directorio.');

            return self::FAILURE;
        }

        $this->info("Encontrados ".count($archivos)." archivo(s) CSV:");
        foreach ($archivos as $archivo) {
            $this->line("  • ".basename($archivo));
        }
        $this->newLine();

        // Preparar la lista de archivos
        $fileInfos = [];
        foreach ($archivos as $archivo) {
            $fileInfos[] = [
                'path' => $archivo,
                'name' => basename($archivo),
            ];
        }

        // Parsear
        $this->info('Parseando archivos...');
        $result = count($fileInfos) === 1
            ? $this->parser->parse($fileInfos[0]['path'], $fileInfos[0]['name'])
            : $this->parser->parseMultiple($fileInfos);

        // Resumen del parseo
        $this->newLine();
        $this->info('═══ Resumen del parseo ═══');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Archivos procesados', count($fileInfos)],
                ['Productos encontrados', count($result->productos)],
                ['Errores de parseo', count($result->errores)],
                ['Categorías pendientes', count($result->categoriasPendientes)],
                ['Subcategorías pendientes', count($result->subcategoriasPendientes)],
                ['Marcas pendientes', count($result->marcasPendientes)],
            ]
        );

        // Mostrar errores de parseo
        if (! empty($result->errores)) {
            $this->newLine();
            $this->warn('Errores de parseo:');
            foreach ($result->errores as $error) {
                $archivo = $error['archivo'] ?? '';
                $prefix = $archivo ? "[{$archivo}] " : '';
                $this->line("  ⚠ {$prefix}Fila {$error['fila']}, SKU: ".($error['sku'] ?? '(vacío)')." — {$error['motivo']}");
            }
        }

        if (empty($result->productos)) {
            $this->error('No hay productos válidos para importar.');

            return self::FAILURE;
        }

        if ($dryRun) {
            $this->newLine();
            $this->info('═══ Modo --dry-run: no se modificará la BD ═══');
            $this->mostrarTablaProductos($result->productos);

            if ($result->tienePendientes()) {
                $this->mostrarPendientes($result);
            }

            return self::SUCCESS;
        }

        // Resolver dependencias pendientes
        if ($result->tienePendientes()) {
            if ($autoCrear) {
                $this->info('Creando dependencias automáticamente (--auto-crear)...');
                $this->resolverDependencias($result);
            } else {
                $this->mostrarPendientes($result);
                $this->newLine();

                if (! $this->confirm('¿Deseas crear todas las dependencias pendientes automáticamente?')) {
                    $this->warn('Importación cancelada. Crea las dependencias manualmente o usa --auto-crear.');

                    return self::FAILURE;
                }
                $this->resolverDependencias($result);
            }
        }

        // Mostrar preview y confirmar
        $this->mostrarTablaProductos($result->productos);

        if (! $autoCrear && ! $this->confirm('¿Proceder con la importación de '.count($result->productos).' productos?')) {
            $this->warn('Importación cancelada por el usuario.');

            return self::FAILURE;
        }

        // Importar
        $this->info('Importando productos...');
        $bar = $this->output->createProgressBar(count($result->productos));
        $bar->start();

        $insertados = 0;
        $actualizados = 0;
        $omitidos = [];

        foreach ($result->productos as $row) {
            $sku = $row['sku'];
            $idSubcategoria = $row['id_subcategoria'] ?? null;
            $marcaId = $row['marca_id'] ?? null;

            if (empty($idSubcategoria)) {
                $omitidos[] = [
                    'sku' => $sku,
                    'motivo' => 'Subcategoría no resuelta',
                    'archivo' => $row['archivo_origen'] ?? null,
                ];
                $bar->advance();

                continue;
            }

            $payloadRow = [
                'sku' => $sku,
                'nombre' => $row['nombre'],
                'id_subcategoria' => $idSubcategoria,
                'marca_id' => $marcaId,
                'pais' => $row['pais'] ?? null,
                'precio_sin_ganancia' => $row['precio_sin_ganancia'],
                'precio_ganancia' => $row['precio_ganancia'],
                'precio_igv' => $row['precio_igv'],
                'descripcion' => $row['descripcion'] ?? null,
                'video' => $row['video'] ?? null,
                'envio' => $row['envio'] ?? null,
                'soporte_tecnico' => $row['soporte_tecnico'] ?? null,
                'caracteristicas' => $row['caracteristicas'] ?? [],
                'especificaciones_tecnicas' => $row['especificaciones_tecnicas'] ?? null,
            ];

            $producto = Producto::updateOrCreate(['sku' => $sku], $payloadRow);
            if ($producto->wasRecentlyCreated) {
                $insertados++;
            } else {
                $actualizados++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Resultado final
        $this->info('═══ Resultado de la importación ═══');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Insertados', $insertados],
                ['Actualizados', $actualizados],
                ['Omitidos', count($omitidos)],
            ]
        );

        if (! empty($omitidos)) {
            $this->warn('Productos omitidos:');
            foreach ($omitidos as $o) {
                $archivo = $o['archivo'] ? " [{$o['archivo']}]" : '';
                $this->line("  ⚠ {$o['sku']}{$archivo}: {$o['motivo']}");
            }
        }

        Log::info('Importación CSV por artisan finalizada', [
            'directorio' => $directorio,
            'archivos' => count($fileInfos),
            'insertados' => $insertados,
            'actualizados' => $actualizados,
            'omitidos' => count($omitidos),
        ]);

        return self::SUCCESS;
    }

    private function resolverDependencias($result): void
    {
        $categoriasMap = $this->parser->resolveCategorias($result);
        $this->info('  ✓ Categorías resueltas: '.count($categoriasMap));

        $subcategoriasMap = $this->parser->resolveSubcategorias($result, $categoriasMap);
        $this->info('  ✓ Subcategorías resueltas: '.count($subcategoriasMap));

        $marcasMap = $this->parser->resolveMarcas($result);
        $this->info('  ✓ Marcas resueltas: '.count($marcasMap));

        // Actualizar IDs en los productos
        foreach ($result->productos as &$producto) {
            if (empty($producto['id_subcategoria']) && ! empty($producto['subcategoria_pendiente_key'])) {
                $producto['id_subcategoria'] = $subcategoriasMap[$producto['subcategoria_pendiente_key']] ?? null;
            }
            if (empty($producto['marca_id']) && ! empty($producto['marca_nombre'])) {
                $key = $this->parser->normalizeNameForKey($producto['marca_nombre']);
                $producto['marca_id'] = $marcasMap[$key] ?? null;
            }
        }
        unset($producto);

        $result->categoriasPendientes = [];
        $result->subcategoriasPendientes = [];
        $result->marcasPendientes = [];

        $this->newLine();
    }

    private function mostrarTablaProductos(array $productos): void
    {
        $this->newLine();
        $this->info('Primeros '.min(20, count($productos)).' productos:');

        $rows = [];
        foreach (array_slice($productos, 0, 20) as $p) {
            $rows[] = [
                $p['sku'],
                mb_substr($p['nombre'], 0, 40),
                $p['categoria_nombre'] ?? '-',
                $p['subcategoria_nombre'] ?? '-',
                number_format($p['precio_igv'], 2),
                $p['archivo_origen'] ?? '-',
            ];
        }

        $this->table(
            ['SKU', 'Nombre', 'Categoría', 'Subcategoría', 'Precio IGV', 'Archivo'],
            $rows
        );

        if (count($productos) > 20) {
            $this->line('  ... y '.(count($productos) - 20).' productos más.');
        }
    }

    private function mostrarPendientes($result): void
    {
        if (! empty($result->categoriasPendientes)) {
            $this->newLine();
            $this->warn('Categorías pendientes por crear:');
            foreach ($result->categoriasPendientes as $c) {
                $this->line("  • {$c['nombre']} ({$c['ocurrencias']} productos)");
            }
        }

        if (! empty($result->subcategoriasPendientes)) {
            $this->newLine();
            $this->warn('Subcategorías pendientes por crear:');
            foreach ($result->subcategoriasPendientes as $s) {
                $this->line("  • {$s['nombre']} (categoría: {$s['categoria']}, {$s['ocurrencias']} productos)");
            }
        }

        if (! empty($result->marcasPendientes)) {
            $this->newLine();
            $this->warn('Marcas pendientes por crear:');
            foreach ($result->marcasPendientes as $m) {
                $this->line("  • {$m['nombre']} ({$m['ocurrencias']} productos)");
            }
        }
    }
}
