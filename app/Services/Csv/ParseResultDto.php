<?php

namespace App\Services\Csv;

class ParseResultDto
{
    /**
     * @param  array<int, array<string, mixed>>  $productos
     * @param  array<int, array<string, mixed>>  $categoriasPendientes
     * @param  array<int, array<string, mixed>>  $subcategoriasPendientes
     * @param  array<int, array<string, mixed>>  $marcasPendientes
     * @param  array<int, array<string, mixed>>  $errores
     * @param  array<int, string>  $archivosOrigen  Nombres de los archivos procesados
     */
    public function __construct(
        public array $productos = [],
        public array $categoriasPendientes = [],
        public array $subcategoriasPendientes = [],
        public array $marcasPendientes = [],
        public array $errores = [],
        public array $archivosOrigen = [],
    ) {}

    /**
     * Fusiona otro ParseResultDto dentro de este, deduplicando pendientes.
     */
    public function merge(ParseResultDto $other): void
    {
        // Acumular productos (duplicados entre archivos se detectan después)
        $this->productos = array_merge($this->productos, $other->productos);

        // Acumular errores
        $this->errores = array_merge($this->errores, $other->errores);

        // Fusionar categorías pendientes por nombre normalizado
        $this->categoriasPendientes = $this->mergePendientes(
            $this->categoriasPendientes,
            $other->categoriasPendientes,
            'nombre'
        );

        // Fusionar subcategorías pendientes por nombre+categoría
        $this->subcategoriasPendientes = $this->mergePendientesSubcategorias(
            $this->subcategoriasPendientes,
            $other->subcategoriasPendientes
        );

        // Fusionar marcas pendientes por nombre normalizado
        $this->marcasPendientes = $this->mergePendientes(
            $this->marcasPendientes,
            $other->marcasPendientes,
            'nombre'
        );

        // Fusionar archivos origen
        $this->archivosOrigen = array_values(array_unique(
            array_merge($this->archivosOrigen, $other->archivosOrigen)
        ));
    }

    /**
     * Fusiona dos listas de pendientes (categorías o marcas) deduplicando por campo clave.
     */
    private function mergePendientes(array $existing, array $incoming, string $keyField): array
    {
        $map = [];
        foreach ($existing as $item) {
            $key = mb_strtolower(trim($item[$keyField]), 'UTF-8');
            $map[$key] = $item;
        }
        foreach ($incoming as $item) {
            $key = mb_strtolower(trim($item[$keyField]), 'UTF-8');
            if (isset($map[$key])) {
                $map[$key]['ocurrencias'] = ($map[$key]['ocurrencias'] ?? 0) + ($item['ocurrencias'] ?? 0);
            } else {
                $map[$key] = $item;
            }
        }

        return array_values($map);
    }

    /**
     * Fusiona subcategorías pendientes deduplicando por nombre+categoría.
     */
    private function mergePendientesSubcategorias(array $existing, array $incoming): array
    {
        $map = [];
        foreach ($existing as $item) {
            $key = mb_strtolower(trim($item['categoria'] ?? '') . '|' . trim($item['nombre']), 'UTF-8');
            $map[$key] = $item;
        }
        foreach ($incoming as $item) {
            $key = mb_strtolower(trim($item['categoria'] ?? '') . '|' . trim($item['nombre']), 'UTF-8');
            if (isset($map[$key])) {
                $map[$key]['ocurrencias'] = ($map[$key]['ocurrencias'] ?? 0) + ($item['ocurrencias'] ?? 0);
            } else {
                $map[$key] = $item;
            }
        }

        return array_values($map);
    }

    public function tienePendientes(): bool
    {
        return ! empty($this->categoriasPendientes)
            || ! empty($this->subcategoriasPendientes)
            || ! empty($this->marcasPendientes);
    }

    public function totalProcesables(): int
    {
        return count($this->productos);
    }

    public function totalErrores(): int
    {
        return count($this->errores);
    }

    public function toArray(): array
    {
        $data = [
            'productos' => $this->productos,
            'categorias_pendientes' => $this->categoriasPendientes,
            'subcategorias_pendientes' => $this->subcategoriasPendientes,
            'marcas_pendientes' => $this->marcasPendientes,
            'errores' => $this->errores,
            'resumen' => [
                'productos' => $this->totalProcesables(),
                'errores' => $this->totalErrores(),
                'categorias_pendientes' => count($this->categoriasPendientes),
                'subcategorias_pendientes' => count($this->subcategoriasPendientes),
                'marcas_pendientes' => count($this->marcasPendientes),
            ],
        ];

        if (! empty($this->archivosOrigen)) {
            $data['archivos_origen'] = $this->archivosOrigen;
        }

        return $data;
    }
}
