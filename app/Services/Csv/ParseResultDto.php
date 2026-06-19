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
     */
    public function __construct(
        public array $productos = [],
        public array $categoriasPendientes = [],
        public array $subcategoriasPendientes = [],
        public array $marcasPendientes = [],
        public array $errores = [],
    ) {}

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
        return [
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
    }
}
