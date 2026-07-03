# Reporte de Importación CSV - Características, Marca, Procedencia y Especificaciones Técnicas

> **Archivo analizado:** `CSV Megaequipamiento/3NH - PRUEBA_1.csv`  
> **Componente afectado:** `resources/js/Components/create/assets/CsvImportWizard.jsx`  
> **Fecha:** 30 Junio 2026

---

## 1. Resumen Ejecutivo

Al importar el CSV `3NH - PRUEBA_1.csv` (3 productos: TS7708, YS4580PLUS, YS4560PLUS), los campos **Marca**, **Procedencia**, **Características** y **Especificaciones Técnicas** no se reconocen. El problema es doble:

1. El CSV tiene todas las columnas estructuradas (Attribute 1–6, Especificaciones Técnicas), pero **no las puebla** con datos. Toda la información está embebida como HTML dentro del campo `Descripción`.
2. El parser `CsvProductoParser` espera esos datos en las columnas dedicadas y **no tiene lógica de fallback** para extraerlos de la Descripción.

---

## 2. Análisis del CSV

### 2.1 Cabeceras del CSV

```
SKU | Nombre | Precio Base | % Ganancia | Video YouTube | Descripción |
Attribute 1 name | Attribute 1 value(s) | Attribute 2 name | Attribute 2 value(s) |
Attribute 3 name | Attribute 3 value(s) | Attribute 4 name | Attribute 4 value(s) |
Attribute 5 name | Attribute 5 value(s) | Attribute 6 name | Attribute 6 value(s) |
Especificaciones Técnicas | Documentos/Descargas | Contenido de Envío |
Soporte Técnico | Categorías | SubCategorías
```

Las cabeceras son **correctas** y el parser las reconoce sin problema.

### 2.2 Contenido real de las filas (ejemplo: TS7708)

| Columna | ¿Poblada? | Contenido |
|---|---|---|
| SKU | Sí | `TS7708` |
| Nombre | Sí | `Espectrofotómetro Portátil de Rejilla TS7708 - 3NH PERÚ` |
| Precio Base | No | *(vacío)* |
| % Ganancia | No | *(vacío)* |
| Descripción | Sí | `<p>...</p><br><br><p>...</p>` + tabla HTML completa con ~40 specs |
| Attribute 1–6 | **NO** | *(todos vacíos)* |
| Especificaciones Técnicas | **NO** | *(vacío)* |
| Documentos/Descargas | **NO** | *(vacío)* |
| Contenido de Envío | Sí | `<ul><li>01 x ...</li></ul>` |
| Soporte Técnico | Sí | HTML con garantía |
| Categorías | Sí | `INSTRUMENTOS DE MEDIDA` |
| SubCategorías | Sí | `Espectrofotómetros` |

### 2.3 Consecuencia directa

| Dato esperado | ¿Dónde está realmente? | Resultado en la importación |
|---|---|---|
| Marca (`3NH`) | Embebido en el nombre del producto (`... - 3NH PERÚ`) y en la descripción | `marca_nombre = null`, `marca_id = null` |
| Procedencia (`Perú` / `China`) | No está en ninguna parte del CSV | `pais = null` |
| Características | No hay datos en las columnas Attribute | `caracteristicas = {}` (vacío) |
| Especificaciones Técnicas | Tabla HTML dentro del campo `Descripción` | `especificaciones_tecnicas = null` |

---

## 3. Análisis del Código Actual

### 3.1 Flujo de importación

```
CSV → CsvImportWizard.jsx (frontend)
    → POST /admin/products/preview-csv
    → ProductoImportController::previewCsv()
    → CsvProductoParser::parse()
    → ParseResultDto (devuelto al frontend como JSON)
    
Wizard → POST /admin/products/import-csv
      → ProductoImportController::importCsv()
      → Producto::updateOrCreate()
```

### 3.2 Lógica de extracción en `CsvProductoParser::parse()` (líneas 219–289)

```php
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

// Especificaciones técnicas
$especificaciones = $this->parseEspecificaciones($data['especificaciones_tecnicas'] ?? null);
```

**Problema:** Si las columnas Attribute están vacías, `$atributos` es un array vacío → `marcaNombre = null`, `pais = null`, `caracteristicas = {}`.  
Si `especificaciones_tecnicas` está vacío, `$especificaciones = null`.

### 3.3 Vista previa en el Wizard (líneas 667–770)

La tabla de confirmación muestra: SKU, Nombre, Subcategoría, Marca, Precio IGV.  
No hay columnas para mostrar características ni especificaciones técnicas en la previsualización, lo que dificulta la verificación.

---

## 4. Causas Raíz

| # | Causa | Impacto |
|---|---|---|
| 1 | El CSV no puebla las columnas `Attribute 1–6 name/value` | No se extrae Marca, Procedencia ni Características |
| 2 | El CSV no puebla la columna `Especificaciones Técnicas` | Las specs se pierden (están en Descripción pero el parser no las extrae de ahí) |
| 3 | El parser no tiene fallback para extraer datos desde `Descripción` | Aunque los datos estén en el HTML de Descripción, se ignoran |
| 4 | La tabla de confirmación del Wizard no muestra características ni specs | El usuario no puede verificar qué datos se importarán |

---

## 5. Plan de Acción

### Fase 1: Mejoras al Parser (Backend) — Prioridad ALTA

#### 1.1 Extraer Especificaciones Técnicas desde Descripción como fallback

**Archivo:** `app/Services/Csv/CsvProductoParser.php`  
**Método:** `parse()` (línea ~280)

Cuando `especificaciones_tecnicas` esté vacío PERO la `descripcion` contenga un `<table>`, extraer la tabla y usarla como especificaciones. Opcionalmente, limpiar la tabla del HTML de descripción para no duplicar.

```php
// Después de parsear especificaciones (línea ~280)
$especificaciones = $this->parseEspecificaciones($data['especificaciones_tecnicas'] ?? null);

// FALLBACK: si no hay specs en la columna dedicada, buscar <table> en la descripción
if ($especificaciones === null && !empty($data['descripcion'])) {
    $especificaciones = $this->parseEspecificaciones($data['descripcion']);
    // Opcional: limpiar la tabla del HTML de descripción para no duplicar contenido
    if ($especificaciones !== null) {
        $data['descripcion'] = $this->stripTableFromHtml($data['descripcion']);
    }
}
```

**Nuevo método helper `stripTableFromHtml()`:**

```php
private function stripTableFromHtml(string $html): string
{
    // Eliminar <table>...</table> del HTML preservando el resto
    return preg_replace('/<table[^>]*>.*?<\/table>/is', '', $html);
}
```

#### 1.2 Extraer Marca desde el nombre del producto como fallback

**Archivo:** `app/Services/Csv/CsvProductoParser.php`  
**Método:** `parse()` (después de línea ~247)

Cuando `marcaNombre` sea null, intentar extraer la marca del nombre del producto usando patrones comunes. En el CSV de 3NH, el formato es `"Nombre del producto - MARCA PAÍS"`.

```php
// FALLBACK: si no hay marca en atributos, intentar extraer del nombre
if ($marcaNombre === null && !empty($nombre)) {
    $marcaNombre = $this->extractMarcaFromNombre($nombre);
}

// FALLBACK: si no hay procedencia, intentar extraer del nombre
if ($pais === null && !empty($nombre)) {
    $pais = $this->extractPaisFromNombre($nombre);
}
```

**Nuevo método `extractMarcaFromNombre()`:**

```php
private function extractMarcaFromNombre(string $nombre): ?string
{
    // Patrón: "Producto XYZ - MARCA PERÚ" o "Producto XYZ - MARCA"
    if (preg_match('/\s[-–—]\s*([A-Za-z0-9\s]+?)(?:\s+(?:PER[UÚ]|SAC?\.?\s*$|S\.?A\.?\s*$|$))/iu', $nombre, $m)) {
        return trim($m[1]);
    }
    return null;
}
```

#### 1.3 Extraer características desde la tabla HTML de especificaciones como fallback

Si las características están vacías pero hay una tabla de specs parseada, se pueden copiar las primeras N filas relevantes como características (ej. Modelo, Marca, Producto).

```php
// FALLBACK: si no hay características pero hay especificaciones parseadas,
// extraer datos clave como características
if (empty($caracteristicas) && !empty($especificaciones['filas'])) {
    $caracteristicas = $this->extractCaracteristicasFromSpecs($especificaciones, $marcaNombre, $pais);
}
```

#### 1.4 Agregar columnas dedicadas para Marca y Procedencia en el CSV

**Archivo:** `app/Services/Csv/CsvProductoParser.php`  

Agregar al `HEADER_MAP` columnas directas para Marca y Procedencia, para que los generadores de CSV puedan poblarlas sin depender de los Attribute columns:

```php
private const HEADER_MAP = [
    // ... existentes ...
    'marca' => 'marca_directa',        // NUEVO
    'procedencia' => 'pais_directa',   // NUEVO
];
```

Esto permite que futuros CSVs tengan columnas `Marca` y `Procedencia` directamente, sin necesidad de usar el mecanismo de Attributes.

### Fase 2: Mejoras al Frontend (Wizard) — Prioridad MEDIA

#### 2.1 Mostrar características en la tabla de confirmación

**Archivo:** `resources/js/Components/create/assets/CsvImportWizard.jsx`

Agregar una columna o tooltip que muestre las características y especificaciones técnicas parseadas para que el usuario pueda verificar antes de importar.

```jsx
// En la tabla de confirmación (línea ~668), agregar columna:
<th className="px-2 py-1 text-left">Características</th>
// ...
<td className="px-2 py-1 max-w-xs">
  {p.caracteristicas && Object.keys(p.caracteristicas).length > 0 ? (
    <div className="text-[10px]">
      {Object.entries(p.caracteristicas).slice(0, 3).map(([k, v]) => (
        <div key={k}><strong>{k}:</strong> {v}</div>
      ))}
      {Object.keys(p.caracteristicas).length > 3 && (
        <span className="text-gray-400">+{Object.keys(p.caracteristicas).length - 3} más</span>
      )}
    </div>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>
```

#### 2.2 Mostrar indicador de specs en la previsualización

Agregar un badge que indique si el producto tiene especificaciones técnicas:

```jsx
{p.especificaciones_tecnicas && (
  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
    Specs ✓
  </span>
)}
```

### Fase 3: Pruebas

#### 3.1 Pruebas unitarias para el parser

**Archivo:** `tests/Unit/CsvProductoParserTest.php`

Agregar tests para:
- `test_extracts_specs_from_description_when_specs_column_empty()`
- `test_extracts_marca_from_product_name_fallback()`
- `test_does_not_override_explicit_marca_with_fallback()`
- `test_strips_table_from_description_html()`
- `test_parses_direct_marca_column()`

#### 3.2 Pruebas de feature

**Archivo:** `tests/Feature/ProductoImportTest.php`

Agregar tests de integración con un CSV que replique el formato de `3NH - PRUEBA_1.csv`:
- `test_imports_product_with_specs_in_description_fallback()`
- `test_imports_product_with_marca_extracted_from_name()`

### Fase 4: Corrección del Generador de CSV (si aplica)

Si el CSV es generado por un sistema externo o un exportador interno, corregir el generador para que:

1. Pueble `Attribute 1 name = "Marca"`, `Attribute 1 value(s) = "3NH"`
2. Pueble `Attribute 2 name = "Procedencia"`, `Attribute 2 value(s) = "Perú"`
3. Ponga la tabla HTML de specs en `Especificaciones Técnicas`, NO en `Descripción`
4. Deje `Descripción` solo con los párrafos descriptivos

---

## 6. Archivos a Modificar

| Archivo | Tipo de cambio | Prioridad |
|---|---|---|
| `app/Services/Csv/CsvProductoParser.php` | Agregar fallbacks: extraer specs de descripción, extraer marca de nombre, columna directa Marca/Procedencia | **Alta** |
| `resources/js/Components/create/assets/CsvImportWizard.jsx` | Mostrar características y specs en tabla de confirmación | Media |
| `tests/Unit/CsvProductoParserTest.php` | Agregar tests unitarios para nuevos fallbacks | Media |
| `tests/Feature/ProductoImportTest.php` | Agregar tests de integración con CSV formato 3NH | Media |
| `tests/Fixtures/` | Crear CSV de prueba que replique el formato 3NH | Media |
| Generador de CSV (origen externo) | Poblar columnas Attribute y Especificaciones Técnicas correctamente | Media |

---

## 7. Criterios de Aceptación

- [ ] Al importar `3NH - PRUEBA_1.csv`, los productos TS7708, YS4580PLUS y YS4560PLUS deben tener `especificaciones_tecnicas` con la tabla de specs (filas clave/valor)
- [ ] La marca `3NH` debe ser reconocida y asociada a cada producto (se crea la marca "3NH" si no existe)
- [ ] Las características deben incluir al menos los campos extraídos de la tabla de specs (Modelo, Producto, etc.)
- [ ] La tabla de confirmación del Wizard debe mostrar un resumen de características y specs
- [ ] Si un CSV SÍ tiene datos en las columnas Attribute y Especificaciones Técnicas, esos deben tener prioridad sobre los fallbacks (no debe haber regresión)
- [ ] Los tests nuevos y existentes pasan (`php artisan test`)
