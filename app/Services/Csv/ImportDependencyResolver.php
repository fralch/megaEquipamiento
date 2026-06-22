<?php

namespace App\Services\Csv;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Subcategoria;

/**
 * Resuelve (crea o reutiliza) las dependencias de un CSV de productos:
 * categorías, subcategorías y marcas.
 */
class ImportDependencyResolver
{
    /**
     * Crea las marcas pendientes y devuelve un mapa [nombre_normalizado => id_marca].
     *
     * @return array<string, int>
     */
    public function resolveMarcas(ParseResultDto $result): array
    {
        $map = Marca::pluck('id_marca', 'nombre')
            ->mapWithKeys(fn ($id, $nombre) => [$this->normalizeName($nombre) => $id])
            ->all();

        foreach ($result->marcasPendientes as $pendiente) {
            $nombre = $pendiente['nombre'];
            $key = $this->normalizeName($nombre);
            if (isset($map[$key])) {
                continue;
            }
            $map[$key] = Marca::create(['nombre' => $nombre])->id_marca;
        }

        return $map;
    }

    /**
     * Crea las categorías pendientes y devuelve un mapa [nombre_normalizado => id_categoria].
     *
     * @return array<string, int>
     */
    public function resolveCategorias(ParseResultDto $result): array
    {
        $map = Categoria::pluck('id_categoria', 'nombre')
            ->mapWithKeys(fn ($id, $nombre) => [$this->normalizeName($nombre) => $id])
            ->all();

        foreach ($result->categoriasPendientes as $pendiente) {
            $nombre = $pendiente['nombre'];
            $key = $this->normalizeName($nombre);
            if (isset($map[$key])) {
                continue;
            }
            $map[$key] = Categoria::create(['nombre' => $nombre])->id_categoria;
        }

        return $map;
    }

    /**
     * Crea las subcategorías pendientes (requiere que las categorías ya estén
     * en $categoriasMap) y devuelve un mapa [key => id_subcategoria]
     * donde la key es `categoria|subcategoria` normalizada.
     *
     * @param  array<string, int>  $categoriasMap
     * @return array<string, int>
     */
    public function resolveSubcategorias(ParseResultDto $result, array $categoriasMap): array
    {
        $map = Subcategoria::with('categoria')->get()
            ->mapWithKeys(fn (Subcategoria $s) => [
                $this->normalizeName($s->categoria->nombre.'|'.$s->nombre) => $s->id_subcategoria,
            ])->all();

        foreach ($result->subcategoriasPendientes as $pendiente) {
            $catNombre = $pendiente['categoria'];
            $subNombre = $pendiente['nombre'];
            $key = $this->normalizeName($catNombre.'|'.$subNombre);
            if (isset($map[$key])) {
                continue;
            }
            $idCategoria = $categoriasMap[$this->normalizeName($catNombre)] ?? null;
            if ($idCategoria === null) {
                continue;
            }
            $map[$key] = Subcategoria::create([
                'nombre' => $subNombre,
                'id_categoria' => $idCategoria,
            ])->id_subcategoria;
        }

        return $map;
    }

    /**
     * Aplica los mapas resueltos a los productos del DTO, rellenando
     * id_subcategoria y marca_id, y limpia las listas de pendientes.
     *
     * @param  array<string, int>  $categoriasMap
     * @param  array<string, int>  $subcategoriasMap
     * @param  array<string, int>  $marcasMap
     */
    public function applyToProductos(
        ParseResultDto $result,
        array $categoriasMap,
        array $subcategoriasMap,
        array $marcasMap
    ): void {
        foreach ($result->productos as &$producto) {
            if (empty($producto['id_subcategoria']) && ! empty($producto['subcategoria_pendiente_key'])) {
                $producto['id_subcategoria'] = $subcategoriasMap[$producto['subcategoria_pendiente_key']] ?? null;
            }

            if (empty($producto['marca_id']) && ! empty($producto['marca_nombre'])) {
                $key = $this->normalizeName($producto['marca_nombre']);
                $producto['marca_id'] = $marcasMap[$key] ?? null;
            }

            if (empty($producto['id_categoria']) && ! empty($producto['categoria_nombre'])) {
                $key = $this->normalizeName($producto['categoria_nombre']);
                $producto['id_categoria'] = $categoriasMap[$key] ?? null;
            }
        }
        unset($producto);

        $result->categoriasPendientes = [];
        $result->subcategoriasPendientes = [];
        $result->marcasPendientes = [];
    }

    private function normalizeName(string $s): string
    {
        $s = trim($s);
        $s = mb_strtolower($s, 'UTF-8');
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;

        return $s;
    }
}
