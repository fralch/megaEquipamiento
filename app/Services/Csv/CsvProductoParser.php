<?php

namespace App\Services\Csv;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Subcategoria;
use Illuminate\Support\Facades\Log;

class CsvProductoParser
{
    public const IGV_PORCENTAJE = 18.0;

    public function __construct(private readonly ImportDependencyResolver $dependencyResolver) {}

    /**
     * Cabeceras esperadas (case-insensitive, tolerante a espacios/encoding).
     *
     * @var array<string, string>
     */
    private const HEADER_MAP = [
        'sku' => 'sku',
        'nombre' => 'nombre',
        'precio base' => 'precio_base',
        '% ganancia' => 'porcentaje_ganancia',
        'video youtube' => 'video',
        'descripción' => 'descripcion',
        'descripcion' => 'descripcion',
        'categorías' => 'categoria',
        'categorias' => 'categoria',
        'subcategorías' => 'subcategoria',
        'subcategorias' => 'subcategoria',
        'especificaciones técnicas' => 'especificaciones_tecnicas',
        'especificaciones tecnicas' => 'especificaciones_tecnicas',
        'contenido de envío' => 'envio',
        'contenido de envio' => 'envio',
        'soporte técnico' => 'soporte_tecnico',
        'soporte tecnico' => 'soporte_tecnico',
        'documentos/descargas' => 'documentos',
        'manual' => 'manual',
        'ficha técnica' => 'ficha_tecnica',
        'ficha tecnica' => 'ficha_tecnica',
        'certificados' => 'certificados',
        'marca' => 'marca_directa',
        'procedencia' => 'pais_directa',
        'país' => 'pais_directa',
        'pais' => 'pais_directa',
    ];

    /**
     * Parsea múltiples CSVs y fusiona los resultados en un solo DTO.
     * Detecta SKUs duplicados entre archivos.
     *
     * @param  array<int, array{path: string, name: string}>  $files  [{path, name}, ...]
     */
    public function parseMultiple(array $files): ParseResultDto
    {
        $combined = new ParseResultDto;
        $globalSkus = []; // sku => archivo de origen

        foreach ($files as $fileInfo) {
            $filePath = $fileInfo['path'];
            $fileName = $fileInfo['name'];

            $result = $this->parse($filePath, $fileName);
            $combined->merge($result);
        }

        // Detectar SKUs duplicados entre archivos
        $skuMap = [];
        $cleanProductos = [];
        foreach ($combined->productos as $producto) {
            $sku = $producto['sku'];
            if (isset($skuMap[$sku])) {
                $combined->errores[] = [
                    'fila' => $producto['fila'],
                    'sku' => $sku,
                    'archivo' => $producto['archivo_origen'] ?? null,
                    'motivo' => "SKU duplicado entre archivos (también en \"{$skuMap[$sku]}\")",
                ];

                continue;
            }
            $skuMap[$sku] = $producto['archivo_origen'] ?? 'desconocido';
            $cleanProductos[] = $producto;
        }
        $combined->productos = $cleanProductos;

        Log::info('CsvProductoParser::parseMultiple finalizado', [
            'archivos' => count($files),
            'productos' => count($combined->productos),
            'errores' => count($combined->errores),
        ]);

        return $combined;
    }

    /**
     * Parsea un CSV de productos y devuelve el resultado de la primera fase
     * (sin tocar la BD más allá de lecturas para resolver FKs existentes).
     *
     * @param  string|null  $archivoOrigen  Nombre del archivo original para trazabilidad
     */
    public function parse(string $filePath, ?string $archivoOrigen = null): ParseResultDto
    {
        $result = new ParseResultDto;

        if ($archivoOrigen !== null) {
            $result->archivosOrigen = [$archivoOrigen];
        }

        if (! is_readable($filePath)) {
            $result->errores[] = ['fila' => 0, 'sku' => null, 'motivo' => 'Archivo no legible: '.$filePath];

            return $result;
        }

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            $result->errores[] = ['fila' => 0, 'sku' => null, 'motivo' => 'No se pudo abrir el archivo'];

            return $result;
        }

        // Lee BOM si existe
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $header = fgetcsv($handle, 0, ',', '"', '"');
        if ($header === false) {
            $result->errores[] = ['fila' => 0, 'sku' => null, 'motivo' => 'CSV vacío o sin cabecera'];
            fclose($handle);

            return $result;
        }

        $normalizedHeader = $this->normalizeHeaderRow($header);
        $attributeIndexes = $this->collectAttributeIndexes($normalizedHeader);

        $categoriasExistentes = Categoria::pluck('id_categoria', 'nombre')
            ->mapWithKeys(fn ($id, $nombre) => [$this->normalizeName($nombre) => $id])
            ->all();
        $subcategoriasExistentes = Subcategoria::with('categoria')->get()
            ->mapWithKeys(function (Subcategoria $sub) {
                $key = $this->normalizeName($sub->categoria->nombre.'|'.$sub->nombre);

                return [$key => $sub->id_subcategoria];
            })->all();
        $marcasExistentes = Marca::pluck('id_marca', 'nombre')
            ->mapWithKeys(fn ($id, $nombre) => [$this->normalizeName($nombre) => $id])
            ->all();

        $categoriasPendientes = [];
        $subcategoriasPendientes = [];
        $marcasPendientes = [];

        $rowNumber = 1; // header = fila 1
        $skusVistos = [];

        while (($row = fgetcsv($handle, 0, ',', '"', '"')) !== false) {
            $rowNumber++;

            // Saltar filas totalmente vacías
            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $row = $this->fixRowEncoding($row);
            $data = $this->mapRow($row, $normalizedHeader, $attributeIndexes);

            // Validaciones duras
            $sku = trim((string) ($data['sku'] ?? ''));
            $nombre = trim((string) ($data['nombre'] ?? ''));

            if ($sku === '' || $nombre === '') {
                $result->errores[] = [
                    'fila' => $rowNumber,
                    'sku' => $sku ?: null,
                    'motivo' => 'Faltan SKU o Nombre',
                ];

                continue;
            }

            if (isset($skusVistos[$sku])) {
                $result->errores[] = [
                    'fila' => $rowNumber,
                    'sku' => $sku,
                    'motivo' => "SKU duplicado dentro del CSV (también en fila {$skusVistos[$sku]})",
                ];

                continue;
            }
            $skusVistos[$sku] = $rowNumber;

            $precioBaseRaw = trim((string) ($data['precio_base'] ?? ''));
            $porcentajeRaw = trim((string) ($data['porcentaje_ganancia'] ?? ''));

            // Ambos vacíos intencionalmente → permitir importación con precios nulos
            if ($precioBaseRaw === '' && $porcentajeRaw === '') {
                $precioBase = null;
                $porcentajeGanancia = null;
                $precios = [
                    'precio_sin_ganancia' => null,
                    'precio_ganancia' => null,
                    'precio_igv' => null,
                ];
            } else {
                $precioBase = $this->parseDecimal($precioBaseRaw);
                $porcentajeGanancia = $this->parseDecimal($porcentajeRaw);

                if ($precioBase === null || $porcentajeGanancia === null) {
                    $result->errores[] = [
                        'fila' => $rowNumber,
                        'sku' => $sku,
                        'motivo' => "Precio base o porcentaje de ganancia inválido ('{$precioBaseRaw}', '{$porcentajeRaw}')",
                    ];

                    continue;
                }

                $precios = $this->calcularPrecios($precioBase, (float) $porcentajeGanancia);
            }

            // Atributos variables → caracteristicas
            $atributos = $this->parseAtributos($row, $attributeIndexes);

            // Extraer marca y procedencia de los atributos si están ahí
            $marcaNombre = null;
            $pais = null;
            foreach ($atributos as $attr) {
                $keyLower = mb_strtolower(trim($attr['name']));
                if ($keyLower === 'marca' && ! empty($attr['value'])) {
                    $marcaNombre = trim($attr['value']);
                }
                if ($keyLower === 'procedencia' && ! empty($attr['value'])) {
                    $pais = trim($attr['value']);
                }
            }

            // FALLBACK: columna directa "Marca" en el CSV
            if ($marcaNombre === null && ! empty($data['marca_directa'])) {
                $marcaNombre = trim((string) $data['marca_directa']);
            }

            // FALLBACK: columna directa "Procedencia" en el CSV
            if ($pais === null && ! empty($data['pais_directa'])) {
                $pais = trim((string) $data['pais_directa']);
            }

            // FALLBACK: extraer marca y procedencia desde el nombre del producto
            if ($marcaNombre === null && ! empty($nombre)) {
                $marcaNombre = $this->extractMarcaFromNombre($nombre);
            }
            if ($pais === null && ! empty($nombre) && $marcaNombre !== null) {
                $pais = $this->extractPaisFromNombre($nombre);
            }

            // Resolver marca
            $marcaId = null;
            if ($marcaNombre !== null) {
                $marcaKey = $this->normalizeName($marcaNombre);
                if (isset($marcasExistentes[$marcaKey])) {
                    $marcaId = $marcasExistentes[$marcaKey];
                } else {
                    $marcasPendientes[$marcaKey] = [
                        'nombre' => $marcaNombre,
                        'ocurrencias' => ($marcasPendientes[$marcaKey]['ocurrencias'] ?? 0) + 1,
                    ];
                }
            }

            // Resolver categoría / subcategoría
            $categoriaNombre = trim((string) ($data['categoria'] ?? ''));
            $subcategoriaNombre = trim((string) ($data['subcategoria'] ?? ''));
            $idSubcategoria = null;
            $idCategoria = null;
            $subcategoriaPendienteKey = null;

            if ($subcategoriaNombre !== '') {
                $categoriaEfectiva = $categoriaNombre !== '' ? $categoriaNombre : 'Sin categoría';

                $idCategoria = $categoriasExistentes[$this->normalizeName($categoriaEfectiva)] ?? null;
                if ($idCategoria === null) {
                    $keyCat = $this->normalizeName($categoriaEfectiva);
                    $categoriasPendientes[$keyCat] = [
                        'nombre' => $categoriaEfectiva,
                        'ocurrencias' => ($categoriasPendientes[$keyCat]['ocurrencias'] ?? 0) + 1,
                    ];
                }

                $keySub = $this->normalizeName($categoriaEfectiva.'|'.$subcategoriaNombre);
                $subcategoriaPendienteKey = $keySub;
                $idSubcategoria = $subcategoriasExistentes[$keySub] ?? null;
                if ($idSubcategoria === null) {
                    $subcategoriasPendientes[$keySub] = [
                        'nombre' => $subcategoriaNombre,
                        'categoria' => $categoriaEfectiva,
                        'ocurrencias' => ($subcategoriasPendientes[$keySub]['ocurrencias'] ?? 0) + 1,
                    ];
                }
            }

            $especificaciones = $this->parseEspecificaciones($data['especificaciones_tecnicas'] ?? null);

            // FALLBACK: extraer especificaciones desde la descripción si la columna dedicada está vacía
            if ($especificaciones === null && ! empty($data['descripcion'])) {
                $especificaciones = $this->parseEspecificaciones($data['descripcion']);
            }

            $caracteristicas = [];
            foreach ($atributos as $attr) {
                $name = trim($attr['name']);
                if ($name === '' || mb_strtolower($name) === 'marca' || mb_strtolower($name) === 'procedencia') {
                    continue;
                }
                $caracteristicas[$name] = trim($attr['value']);
            }

            $result->productos[] = [
                'fila' => $rowNumber,
                'sku' => $sku,
                'nombre' => $nombre,
                'descripcion' => $this->normalizeMultilineHtml($data['descripcion'] ?? null),
                'video' => trim((string) ($data['video'] ?? '')) ?: null,
                'precio_base' => $precioBase,
                'porcentaje_ganancia' => $porcentajeGanancia !== null ? (float) $porcentajeGanancia : null,
                'precio_sin_ganancia' => $precios['precio_sin_ganancia'],
                'precio_ganancia' => $precios['precio_ganancia'],
                'precio_igv' => $precios['precio_igv'],
                'pais' => $pais,
                'envio' => trim((string) ($data['envio'] ?? '')) ?: null,
                'soporte_tecnico' => trim((string) ($data['soporte_tecnico'] ?? '')) ?: null,
                'documentos' => $this->buildDocumentos($data),
                'especificaciones_tecnicas' => $especificaciones,
                'caracteristicas' => $caracteristicas,
                'categoria_nombre' => $categoriaNombre !== '' ? $categoriaNombre : null,
                'subcategoria_nombre' => $subcategoriaNombre !== '' ? $subcategoriaNombre : null,
                'id_subcategoria' => $idSubcategoria,
                'id_categoria' => $idCategoria,
                'marca_nombre' => $marcaNombre,
                'marca_id' => $marcaId,
                'subcategoria_pendiente_key' => $subcategoriaPendienteKey,
                'archivo_origen' => $archivoOrigen,
            ];
        }

        fclose($handle);

        $result->categoriasPendientes = array_values($categoriasPendientes);
        $result->subcategoriasPendientes = array_values($subcategoriasPendientes);
        $result->marcasPendientes = array_values($marcasPendientes);

        Log::info('CsvProductoParser finalizado', [
            'productos' => count($result->productos),
            'errores' => count($result->errores),
            'categorias_pendientes' => count($result->categoriasPendientes),
            'subcategorias_pendientes' => count($result->subcategoriasPendientes),
            'marcas_pendientes' => count($result->marcasPendientes),
        ]);

        return $result;
    }

    /**
     * Calcula los 3 precios a partir de base + porcentaje de ganancia.
     * Reglas (alineadas con createProductos.jsx:calculatePrices):
     *   - precio_sin_ganancia = base
     *   - precio_ganancia = base * (100 / (100 - R%))   si 0 <= R < 100
     *   - precio_igv = precio_ganancia * 1.18
     *
     * @return array{precio_sin_ganancia: float, precio_ganancia: float, precio_igv: float}
     */
    public function calcularPrecios(float $base, float $porcentaje): array
    {
        $precioSinGanancia = round($base, 2);
        if ($porcentaje >= 0 && $porcentaje < 100) {
            $precioGanancia = round($base * (100 / (100 - $porcentaje)), 2);
        } else {
            $precioGanancia = $precioSinGanancia;
        }
        $precioIgv = round($precioGanancia * (1 + (self::IGV_PORCENTAJE / 100)), 2);

        return [
            'precio_sin_ganancia' => $precioSinGanancia,
            'precio_ganancia' => $precioGanancia,
            'precio_igv' => $precioIgv,
        ];
    }

    /**
     * Combina las columnas separadas Manual, Ficha técnica y Certificados
     * en un único string con el formato que espera el frontend:
     *
     *   MANUAL
     *   <url>
     *   FICHA TÉCNICA
     *   <url>
     *   CERTIFICADOS
     *   <url>
     *
     * Si ninguna de las tres columnas tiene contenido, cae al fallback
     * de la columna legacy "Documentos/Descargas".
     *
     * @param  array<string, mixed>  $data
     */
    private function buildDocumentos(array $data): ?string
    {
        $manual = trim((string) ($data['manual'] ?? ''));
        $ficha = trim((string) ($data['ficha_tecnica'] ?? ''));
        $certificados = trim((string) ($data['certificados'] ?? ''));

        if ($manual !== '' || $ficha !== '' || $certificados !== '') {
            $lines = [];

            foreach ([['MANUAL', $manual], ['FICHA TÉCNICA', $ficha], ['CERTIFICADOS', $certificados]] as [$label, $raw]) {
                $urls = array_filter(array_map('trim', preg_split('/[\n,]/', $raw) ?: []), fn ($u) => $u !== '');
                if (empty($urls)) {
                    continue;
                }
                $lines[] = $label;
                foreach ($urls as $url) {
                    $lines[] = $url;
                }
            }

            return ! empty($lines) ? implode("\n", $lines) : null;
        }

        $documentos = trim((string) ($data['documentos'] ?? ''));

        return $documentos !== '' ? $documentos : null;
    }

    /**
     * @param  array<int, string>  $row
     * @param  array<int, string>  $normalizedHeader
     * @param  array<int, int>  $attributeIndexes  mapa de idx-fila → nombre atributo
     * @return array<string, array{name:string, value:string}>
     */
    public function parseAtributos(array $row, array $attributeIndexes): array
    {
        $out = [];
        foreach ($attributeIndexes as $pair) {
            $nameIdx = $pair['name_idx'];
            $valueIdx = $pair['value_idx'];
            $name = isset($row[$nameIdx]) ? trim((string) $row[$nameIdx]) : '';
            $value = isset($row[$valueIdx]) ? trim((string) $row[$valueIdx]) : '';
            if ($name === '' && $value === '') {
                continue;
            }
            $out[] = ['name' => $name, 'value' => $value];
        }

        return $out;
    }

    /**
     * Parsea un bloque HTML de <table> en un array asociativo.
     * Acepta tanto la sección { secciones: [...] } (formato de la app)
     * como la estructura legacy de filas clave/valor.
     */
    public function parseEspecificaciones(?string $html): ?array
    {
        if ($html === null) {
            return null;
        }
        $html = trim($html);
        if ($html === '') {
            return null;
        }

        // Si ya viene como JSON estructurado, lo aceptamos tal cual
        $decoded = json_decode($html, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Parseo rápido de <tr><th>...</th><td>...</td></tr> sin dependencias externas
        $rows = [];
        if (preg_match_all('/<tr[^>]*>(.*?)<\/tr>/is', $html, $matches)) {
            foreach ($matches[1] as $tr) {
                $cells = [];
                if (preg_match_all('/<t[hd][^>]*>(.*?)<\/t[hd]>/is', $tr, $cellMatches)) {
                    foreach ($cellMatches[1] as $cell) {
                        $cells[] = trim(html_entity_decode(strip_tags($cell), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                    }
                }
                if (count($cells) >= 2) {
                    [$k, $v] = $cells;
                    $rows[$k] = $v;
                }
            }
        }

        if (! empty($rows)) {
            return ['filas' => $rows];
        }

        // Fallback: texto plano
        $stripped = trim(html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return $stripped !== '' ? ['descripcion' => $stripped] : null;
    }

    /**
     * @param  array<int, string>  $row
     * @return array<string, mixed>
     */
    private function mapRow(array $row, array $normalizedHeader, array $attributeIndexes): array
    {
        $data = [];
        foreach ($normalizedHeader as $idx => $logicalKey) {
            if ($logicalKey === null) {
                continue;
            }
            if (array_key_exists($idx, $row)) {
                $data[$logicalKey] = $row[$idx];
            }
        }

        return $data;
    }

    /**
     * Convierte la fila de cabeceras en [idx => logicalKey|null].
     * Detecta además las columnas "Característica N nombre/valor(s)".
     *
     * @param  array<int, string>  $header
     * @return array<int, string|null>
     */
    private function normalizeHeaderRow(array $header): array
    {
        $out = [];
        foreach ($header as $idx => $raw) {
            $key = $this->normalizeName((string) $raw);
            // Características en español (nuevo formato): "Característica N nombre" / "Característica N valor(s)"
            if (preg_match('/^caracter[ií]stica\s+(\d+)\s+nombre$/', $key, $m)) {
                $out[$idx] = '__attr_name_'.$m[1].'__';

                continue;
            }
            if (preg_match('/^caracter[ií]stica\s+(\d+)\s+valor\(s\)$/', $key, $m)) {
                $out[$idx] = '__attr_value_'.$m[1].'__';

                continue;
            }
            // Características en inglés (formato legacy): "Attribute N name" / "Attribute N value(s)"
            if (preg_match('/^attribute\s+(\d+)\s+name$/', $key, $m)) {
                $out[$idx] = '__attr_name_'.$m[1].'__';

                continue;
            }
            if (preg_match('/^attribute\s+(\d+)\s+value\(s\)$/', $key, $m)) {
                $out[$idx] = '__attr_value_'.$m[1].'__';

                continue;
            }
            $logical = self::HEADER_MAP[$key] ?? null;
            $out[$idx] = $logical;
        }

        return $out;
    }

    /**
     * @param  array<int, string|null>  $normalizedHeader
     * @return array<int, array{name_idx:int, value_idx:int}>
     */
    private function collectAttributeIndexes(array $normalizedHeader): array
    {
        $names = [];
        $values = [];
        foreach ($normalizedHeader as $idx => $logical) {
            if (! is_string($logical)) {
                continue;
            }
            if (preg_match('/^__attr_name_(\d+)__$/', $logical, $m)) {
                $names[(int) $m[1]] = $idx;
            }
            if (preg_match('/^__attr_value_(\d+)__$/', $logical, $m)) {
                $values[(int) $m[1]] = $idx;
            }
        }
        $pairs = [];
        foreach ($names as $n => $idx) {
            if (isset($values[$n])) {
                $pairs[] = ['name_idx' => $idx, 'value_idx' => $values[$n]];
            }
        }

        return $pairs;
    }

    private function parseDecimal(mixed $raw): ?float
    {
        if ($raw === null || $raw === '' || trim((string) $raw) === '') {
            return null;
        }
        $s = trim((string) $raw);
        // Acepta "1.234,56" y "1,234.56" y "1234.56"
        if (preg_match('/^-?\d{1,3}(\.\d{3})*(,\d+)?$/', $s)) {
            $s = str_replace('.', '', $s);
            $s = str_replace(',', '.', $s);
        } elseif (preg_match('/^-?\d{1,3}(,\d{3})*(\.\d+)?$/', $s)) {
            $s = str_replace(',', '', $s);
        }
        if (! is_numeric($s)) {
            return null;
        }

        return (float) $s;
    }

    public function normalizeNameForKey(string $s): string
    {
        return $this->normalizeName($s);
    }

    private function normalizeName(string $s): string
    {
        $s = $this->fixMojibake($s);
        $s = mb_strtolower($s, 'UTF-8');
        $s = trim(preg_replace('/\s+/u', ' ', $s) ?? $s);

        return $s;
    }

    /**
     * Intenta reparar mojibake típico: el CSV a veces se lee como Latin-1
     * cuando en realidad es UTF-8. Si la cadena tiene reemplazo chars o es
     * UTF-8 mal interpretada, intenta recuperar.
     */
    private function fixMojibake(string $s): string
    {
        if ($s === '') {
            return $s;
        }
        // Caso 1: bytes Latin-1 que en realidad codifican UTF-8
        $reencoded = @mb_convert_encoding($s, 'UTF-8', 'UTF-8');
        if ($reencoded === false || $reencoded === '') {
            $reencoded = $s;
        }
        // Si la cadena actual ya parece UTF-8 válida, no tocarla
        if (mb_check_encoding($reencoded, 'UTF-8')) {
            // Intento: tratar como Latin-1 → UTF-8 (mojibake inverso)
            $candidate = @mb_convert_encoding($s, 'UTF-8', 'ISO-8859-1');
            if (is_string($candidate) && $candidate !== $s && mb_check_encoding($candidate, 'UTF-8')) {
                // Heurística: la versión decodificada de Latin-1 suele tener
                // más letras con tildes legibles. Aceptamos si reduce
                // caracteres Unicode "raros".
                if (preg_match('/[ÁÉÍÓÚÑáéíóúñ]/u', $candidate) && ! preg_match('/[ÃÂ][\\x80-\\xBF]/', $candidate)) {
                    return $candidate;
                }
            }

            return $reencoded;
        }

        return $s;
    }

    /**
     * @param  array<int, string>  $row
     * @return array<int, string>
     */
    private function fixRowEncoding(array $row): array
    {
        return array_map(fn ($v) => $this->fixMojibake((string) $v), $row);
    }

    private function normalizeMultilineHtml(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $raw = trim($raw);

        return $raw === '' ? null : $raw;
    }

    /**
     * Intenta extraer el nombre de la marca desde el nombre del producto.
     * Busca el patrón "Producto - MARCA PAÍS" al final del nombre.
     */
    private function extractMarcaFromNombre(string $nombre): ?string
    {
        if (preg_match('/\s[-–—]\s*([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)\s+[A-ZÁÉÍÓÚÜÑ][A-Za-záéíóúüñÁÉÍÓÚÜÑ]+\s*$/u', $nombre, $m)) {
            return trim($m[1]);
        }

        return null;
    }

    /**
     * Intenta extraer el país de procedencia desde el nombre del producto.
     * Busca el patrón "Producto - MARCA PAÍS" al final del nombre.
     */
    private function extractPaisFromNombre(string $nombre): ?string
    {
        if (preg_match('/\s[-–—]\s*[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?\s+([A-ZÁÉÍÓÚÜÑ][A-Za-záéíóúüñÁÉÍÓÚÜÑ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][A-Za-záéíóúüñÁÉÍÓÚÜÑ]+)?)\s*$/u', $nombre, $m)) {
            return trim($m[1]);
        }

        return null;
    }

    /**
     * @see ImportDependencyResolver::resolveMarcas()
     *
     * @return array<string, int>
     */
    public function resolveMarcas(ParseResultDto $result): array
    {
        return $this->dependencyResolver->resolveMarcas($result);
    }

    /**
     * @see ImportDependencyResolver::resolveCategorias()
     *
     * @return array<string, int>
     */
    public function resolveCategorias(ParseResultDto $result): array
    {
        return $this->dependencyResolver->resolveCategorias($result);
    }

    /**
     * @see ImportDependencyResolver::resolveSubcategorias()
     *
     * @param  array<string, int>  $categoriasMap
     * @return array<string, int>
     */
    public function resolveSubcategorias(ParseResultDto $result, array $categoriasMap): array
    {
        return $this->dependencyResolver->resolveSubcategorias($result, $categoriasMap);
    }
}
