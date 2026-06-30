# Plan de Optimización SEO para Rutas de Marcas

## Contexto

Las marcas se sirven en `/marcas/{id}` (ej: `/marcas/65`). Esta URL con ID numérico no contiene palabras clave relevantes y ofrece un SEO pobre. El objetivo es migrar a URLs con slug semántico tipo `/marcas/sartorius-peru-65`, siguiendo el mismo patrón que ya usan los productos (`/producto/nombre-slug-{id}`).

---

## Cambios Propuestos

### 1. Modelo de Marca — Helper de slug (sin `$appends`)

#### [MODIFY] [Marca.php](app/Models/Marca.php)

Agregar **dos métodos públicos** (NO accesores appended) para generar el slug y la URL SEO. No se toca `$appends` para evitar incluir campos innecesarios en todas las respuestas JSON del CRM (`/marca/all`, `/marca-categoria/marcas`, etc.).

```php
/**
 * Genera el slug SEO de la marca (ej: "sartorius-peru-65").
 */
public function getSeoSlug(): string
{
    $slug = \Illuminate\Support\Str::slug($this->nombre);
    // Fallback si el nombre genera un slug vacío (caracteres no latinos, etc.)
    if (empty($slug)) {
        $slug = 'marca';
    }
    return $slug . '-' . $this->id_marca;
}

/**
 * URL pública SEO de la marca.
 */
public function getSeoUrl(): string
{
    return '/marcas/' . $this->getSeoSlug();
}
```

---

### 2. Rutas y Controlador

#### [MODIFY] [web.php](routes/web.php)

Cambiar el parámetro de la ruta pública (línea 50):

```diff
-Route::get('/marcas/{id}', [ProductoController::class, 'ProductViewByMarca'])->name('marcas.view');
+Route::get('/marcas/{marcaSlug}', [ProductoController::class, 'ProductViewByMarca'])->name('marcas.view');
```

#### [MODIFY] [ProductoController.php](app/Http/Controllers/ProductoController.php)

Reescribir `ProductViewByMarca` (líneas 97-110) para:
1. Extraer el ID numérico del final del slug (`sartorius-peru-65` → `65`).
2. Buscar la marca o devolver **404**.
3. **Redirigir 301** si el slug no coincide con el canónico (compatibilidad retroactiva: `/marcas/65` → `/marcas/sartorius-peru-65`).
4. Pasar `seoSlug` explícitamente a la vista Inertia para el `<link rel="canonical">`.

```php
/* Vista de productos por marca view */
public function ProductViewByMarca(Request $request, $marcaSlug)
{
    // Extraer ID del final del slug (ej: "sartorius-peru-65" → 65, "65" → 65)
    $marcaId = $this->extractMarcaIdFromSlug($marcaSlug);

    $marca = Marca::find($marcaId);

    if (! $marca) {
        abort(404);
    }

    // Redirección 301 si el slug no coincide con el canónico
    $canonicalSlug = $marca->getSeoSlug();
    if ($marcaSlug !== $canonicalSlug) {
        return redirect('/marcas/' . $canonicalSlug, 301);
    }

    $productos = Producto::with('marca')
        ->where('marca_id', $marcaId)
        ->get();

    return Inertia::render('Marcas', [
        'marca' => $marca,
        'productos' => $productos,
        'seoSlug' => $canonicalSlug,
    ]);
}

/**
 * Extrae el ID numérico del slug de marca.
 * Soporta: "sartorius-peru-65" → 65, "65" → 65
 */
private function extractMarcaIdFromSlug(string $slug): ?int
{
    // Si es puramente numérico
    if (ctype_digit($slug)) {
        return (int) $slug;
    }

    // Extraer último segmento numérico tras el último guion
    if (preg_match('/-(\d+)$/', $slug, $matches)) {
        return (int) $matches[1];
    }

    return null;
}
```

> **IMPORTANTE:** La redirección 301 asegura que Google y cualquier link existente con `/marcas/65` transfiera su pagerank al nuevo slug. También protege contra slugs desactualizados si una marca se renombra.

---

### 3. Utilidades y Componentes Frontend

#### [MODIFY] [productUrl.js](resources/js/utils/productUrl.js)

Agregar y exportar `getMarcaUrl(brand)` siguiendo el mismo patrón de `getProductUrl`:

```js
export const getMarcaUrl = (brand) => {
  if (!brand) return '/';

  // Si el backend ya calculó la URL
  if (brand.seo_url) return brand.seo_url;

  const id = brand.id_marca || brand.id;
  const name = brand.nombre || brand.name || 'marca';
  const slug = name
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/marcas/${slug || 'marca'}-${id}`;
};
```

#### [MODIFY] [Header.jsx](resources/js/Components/home/Header.jsx) (línea 194)

```diff
-import { getProductUrl } from "../../utils/productUrl";
+import { getProductUrl, getMarcaUrl } from "../../utils/productUrl";

-  const handleMarcaClick = (m) => { window.location.href = `/marcas/${m.id_marca}`; setIsModalOpen(false); };
+  const handleMarcaClick = (m) => { window.location.href = getMarcaUrl(m); setIsModalOpen(false); };
```

#### [MODIFY] [BrandSection.jsx](resources/js/Components/home/BrandSection.jsx) (línea 42)

```diff
+import { getMarcaUrl } from "../../utils/productUrl";

-      window.location.href = `/marcas/${brand.id_marca}`;
+      window.location.href = getMarcaUrl(brand);
```

#### [MODIFY] [CategoryBrandSection.jsx](resources/js/Components/categoria/CategoryBrandSection.jsx) (línea 20)

```diff
+import { getMarcaUrl } from "../../utils/productUrl";

-      window.location.href = `/marcas/${brand.id_marca}`;
+      window.location.href = getMarcaUrl(brand);
```

---

### 4. Página Marcas — SEO Meta Tags, Canonical y Cleanup

#### [MODIFY] [Marcas.jsx](resources/js/Pages/Marcas.jsx)

**4a. Simplificar obtención de marcaId** (líneas 36-51):

Reemplazar el parsing complejo de la URL por el uso directo de la prop `marca`. Eliminar los `console.log` de debug:

```diff
-        // Obtener el ID de la marca de múltiples fuentes
-        const urlParts = window.location.pathname.split('/');
-        const marcaIdFromUrl = urlParts[urlParts.length - 1];
-        
-        // Intentar obtener marca_id de los productos si está disponible
-        const marcaIdFromProducts = productos && productos.length > 0 
-            ? productos[0]?.marca?.marca_id || productos[0]?.marca_id
-            : null;
-        
-        // Usar la marca de los productos como prioridad, fallback a URL
-        const marcaId = marcaIdFromProducts || (marcaIdFromUrl && !isNaN(marcaIdFromUrl) ? marcaIdFromUrl : null);
-        
-        console.log('Marca ID from URL:', marcaIdFromUrl);
-        console.log('Marca ID from Products:', marcaIdFromProducts);
-        console.log('Marca ID final:', marcaId);
-        console.log('Productos:', productos);
+        // Obtener el ID de la marca directamente de las props del servidor
+        const marcaId = marca?.id_marca || null;
```

**4b. Mejorar el `<Head>` con meta tags SEO y URL canónica** (línea 226):

```diff
-            <Head title="Marca" />
+            <Head title={marca ? `Equipamiento ${marca.nombre} | Mega Equipamiento` : 'Marca | Mega Equipamiento'}>
+                {marca && (
+                    <>
+                        <meta name="description" content={`Descubre la línea completa de equipamiento ${marca.nombre} en Mega Equipamiento. Productos de laboratorio, equipos industriales y soluciones profesionales con garantía y soporte técnico.`} />
+                        <meta property="og:title" content={`Equipamiento ${marca.nombre} | Mega Equipamiento`} />
+                        <meta property="og:description" content={`Explora los productos de ${marca.nombre}. Equipamiento de laboratorio e industrial de alta calidad.`} />
+                        {marca.imagen_url && <meta property="og:image" content={marca.imagen_url} />}
+                        <meta property="og:type" content="website" />
+                        <link rel="canonical" href={`${window.location.origin}/marcas/${seoSlug}`} />
+                    </>
+                )}
+            </Head>
```

> **NOTA:** `seoSlug` se recibe como prop desde el controlador (paso 2). Esto garantiza que el canonical siempre apunte al slug correcto calculado por el backend.

---

### 5. Sitemap (Acción manual post-implementación)

El sitemap actual es un archivo estático en `public/sitemap.xml` servido por `SitemapController.php`. **No se genera dinámicamente.**

> **ACCIÓN REQUERIDA:** Después de implementar los cambios, regenerar el `sitemap.xml` manualmente para que las URLs de marcas reflejen el nuevo formato con slug. Esto no bloquea la implementación pero debe hacerse antes del próximo crawl de Google.

---

## Resumen de Archivos a Modificar

| # | Archivo | Cambio |
|---|---|---|
| 1 | `app/Models/Marca.php` | Agregar `getSeoSlug()` y `getSeoUrl()` como métodos públicos |
| 2 | `routes/web.php` | Renombrar parámetro `{id}` → `{marcaSlug}` |
| 3 | `app/Http/Controllers/ProductoController.php` | Reescribir `ProductViewByMarca` con slug parsing, 404, redirect 301 |
| 4 | `resources/js/utils/productUrl.js` | Agregar función `getMarcaUrl()` |
| 5 | `resources/js/Components/home/Header.jsx` | Usar `getMarcaUrl()` en `handleMarcaClick` |
| 6 | `resources/js/Components/home/BrandSection.jsx` | Usar `getMarcaUrl()` en `handleBrandClick` |
| 7 | `resources/js/Components/categoria/CategoryBrandSection.jsx` | Usar `getMarcaUrl()` en `handleBrandClick` |
| 8 | `resources/js/Pages/Marcas.jsx` | Simplificar marcaId, meta tags SEO, canonical, eliminar console.logs |

---

## Plan de Verificación

### Pruebas Manuales
1. **Navegación desde Home**: Hacer clic en una marca en el carrusel. Verificar que la URL cambie a `/marcas/nombre-marca-{id}` y la página cargue correctamente sus productos.
2. **Búsqueda en Header**: Buscar una marca en el buscador global y hacer clic. Verificar URL amigable.
3. **Marcas en Categoría**: Ir a una página de categoría, hacer clic en una marca relacionada. Verificar URL amigable.
4. **Redirección 301 (Compatibilidad Retroactiva)**: Acceder directamente a `/marcas/65`. Verificar en la pestaña Network de DevTools que el servidor responde con HTTP 301 y redirige a `/marcas/sartorius-peru-65`.
5. **404 para marca inexistente**: Acceder a `/marcas/invalido-99999`. Verificar respuesta 404.
6. **SEO & Meta Tags**: Inspeccionar el HTML fuente de la página de una marca y confirmar:
   - `<title>` contiene el nombre de la marca.
   - `<meta name="description">` contiene el nombre de la marca.
   - `<meta property="og:*">` presentes y correctos.
   - `<link rel="canonical">` apunta a la URL con slug.
7. **CRM no afectado**: Verificar que endpoints del CRM (`/marca/all`, etc.) no incluyan campos `seo_slug` o `marca_url` innecesarios en su respuesta JSON.
