# Plan de Optimización SEO Integral — MegaEquipamiento

## Contexto

E-commerce dinámico (Laravel 11 + Inertia + React) donde los productos se suben y bajan varias veces al día. El servidor tiene recursos limitados. No es posible generar un sitio estático. Actualmente el SEO está desigualmente implementado: **solo `Product.jsx`** tiene meta tags, OpenGraph, structured data y canonical completos. El resto de páginas públicas (Welcome, Categoría, Subcategoría, Marcas, Sector, Contacto) carecen de la mayoría de estos elementos. El sitemap es un **archivo estático de 650 URLs con fechas de 2025**, y la única forma de actualizarlo es manualmente.

### Diagnóstico tras la revisión completa del proyecto

| Problema | Severidad | Páginas afectadas |
|---|---|---|
| Sitemap estático (104 KB, 650 URLs, `lastmod` de 2025) | 🔴 Crítica | Todo el sitio |
| Sin meta `description` dinámica | 🔴 Crítica | Welcome, Categoría, Subcategoría, Marcas, Sector |
| Sin `canonical` en frontend (solo Blade genérico) | 🟠 Alta | Categoría, Subcategoría, Marcas, Sector, Welcome |
| Sin structured data (JSON-LD) | 🟠 Alta | Welcome, Categoría, Subcategoría, Marcas, Sector, Contacto |
| Sin OpenGraph / Twitter Cards | 🟠 Alta | Welcome, Categoría, Subcategoría, Marcas, Sector |
| URLs con IDs numéricos sin slug semántico | 🟠 Alta | Marcas (`/marcas/65`), Categorías (`/categorias/1`) |
| `SeoMiddleware` hace queries en CADA request (incluidas API/CRM) | 🟠 Alta | Todo el sitio |
| `robots.txt` no bloquea CRM | 🟡 Media | Rutas `/crm/*` |
| 40+ `console.log` en producción | 🟡 Media | Product, Marcas, Subcategorías, Sector, Categoría |
| `nombre_categoria` en Categoria — el campo se llama `nombre` | 🟡 Media | `SeoMiddleware.php` → `getCategorySeo()` |
| `aggregateRating` con datos fabricados en Product.jsx | 🟡 Media | Product.jsx (línea 1284-1290) |
| `SeoMiddleware` busca producto por segmento raw (no extrae ID del slug) | 🟡 Media | SeoMiddleware.php línea 92 |

---

## Filosofía del plan

> **Máximo impacto SEO con mínimo impacto en recursos del servidor.**

- Priorizamos cambios que Google puede rastrear en el **primer render HTML** (Blade + SeoMiddleware) porque Inertia hace SSR parcial vía Blade.
- Evitamos procesamiento pesado: nada de SSR con Node, nada de generación estática.
- Usamos caché agresivo con TTL cortos para datos que cambian frecuentemente.
- Dividimos el trabajo en **fases independientes** que se pueden implementar y verificar una a la vez.

---

## Fase 1 — Sitemap Dinámico (Impacto Crítico)

> [!IMPORTANT]
> El sitemap estático actual tiene fechas de hace un año y no refleja los productos que se agregan/eliminan diariamente. Este es el problema SEO más grave del sitio.

### Estrategia: Generación bajo demanda con caché en archivo

Cuando Google solicite `/sitemap.xml`, generaremos el XML dinámicamente desde la BD, con caché de archivo (1 hora TTL). Esto evita regenerar en cada petición sin necesitar un cron dedicado. Dado que hay ~650 URLs, un solo archivo sitemap es suficiente (el límite es 50,000).

---

#### [MODIFY] [SitemapController.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/app/Http/Controllers/SitemapController.php)

Reescribir completamente para generar el sitemap desde la BD:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\TagParent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SitemapController extends Controller
{
    public function show()
    {
        // Caché de archivo por 1 hora — liviano para el servidor
        $xml = Cache::remember('sitemap_xml', 3600, function () {
            return $this->generateSitemap();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    private function generateSitemap(): string
    {
        $urls = [];

        // Páginas estáticas
        $urls[] = $this->urlEntry(url('/'), now(), 'daily', '1.0');
        $urls[] = $this->urlEntry(url('/contacto'), now(), 'monthly', '0.6');
        $urls[] = $this->urlEntry(url('/sectores'), now(), 'weekly', '0.7');

        // Categorías
        $categorias = Categoria::select('id_categoria', 'nombre', 'updated_at')->get();
        foreach ($categorias as $cat) {
            $urls[] = $this->urlEntry(
                url("/categorias/{$cat->id_categoria}"),
                $cat->updated_at,
                'weekly',
                '0.8'
            );
        }

        // Subcategorías
        $subcategorias = Subcategoria::select('id_subcategoria', 'updated_at')->get();
        foreach ($subcategorias as $sub) {
            $urls[] = $this->urlEntry(
                url("/subcategoria/{$sub->id_subcategoria}"),
                $sub->updated_at,
                'weekly',
                '0.7'
            );
        }

        // Marcas (con slug SEO)
        $marcas = Marca::select('id_marca', 'nombre', 'updated_at')->get();
        foreach ($marcas as $marca) {
            $slug = Str::slug($marca->nombre) ?: 'marca';
            $urls[] = $this->urlEntry(
                url("/marcas/{$slug}-{$marca->id_marca}"),
                $marca->updated_at,
                'weekly',
                '0.7'
            );
        }

        // Productos (los más numerosos — solo seleccionamos lo mínimo)
        Producto::select('id_producto', 'nombre', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->chunk(200, function ($productos) use (&$urls) {
                foreach ($productos as $prod) {
                    $slug = Str::slug($prod->nombre) ?: 'producto';
                    $urls[] = $this->urlEntry(
                        url("/producto/{$slug}-{$prod->id_producto}"),
                        $prod->updated_at,
                        'daily',
                        '0.9'
                    );
                }
            });

        // Sectores
        $sectores = TagParent::select('id_tag_parent', 'updated_at')->get();
        foreach ($sectores as $sector) {
            $urls[] = $this->urlEntry(
                url("/sector/{$sector->id_tag_parent}"),
                $sector->updated_at,
                'weekly',
                '0.7'
            );
        }

        // Generar XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $url) {
            $xml .= $url;
        }
        $xml .= '</urlset>';

        return $xml;
    }

    private function urlEntry(string $loc, $lastmod, string $changefreq, string $priority): string
    {
        $lastmodStr = $lastmod ? $lastmod->toW3cString() : now()->toW3cString();
        return "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmodStr}</lastmod>\n    <changefreq>{$changefreq}</changefreq>\n    <priority>{$priority}</priority>\n  </url>\n";
    }
}
```

**Invalidación automática del caché:** Agregar un listener o un observer que borre `sitemap_xml` del caché cuando se cree/actualice/elimine un producto:

#### [NEW] [InvalidateSitemapCache.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/app/Observers/InvalidateSitemapCache.php)

```php
<?php

namespace App\Observers;

use App\Models\Producto;
use Illuminate\Support\Facades\Cache;

class InvalidateSitemapCache
{
    public function created(Producto $producto): void
    {
        Cache::forget('sitemap_xml');
    }

    public function updated(Producto $producto): void
    {
        Cache::forget('sitemap_xml');
    }

    public function deleted(Producto $producto): void
    {
        Cache::forget('sitemap_xml');
    }
}
```

#### [MODIFY] [AppServiceProvider.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/app/Providers/AppServiceProvider.php)

Registrar el observer en `boot()`:

```php
\App\Models\Producto::observe(\App\Observers\InvalidateSitemapCache::class);
```

---

## Fase 2 — Optimizar `SeoMiddleware` (Impacto Alto, Rendimiento)

> [!WARNING]
> El middleware actual ejecuta queries a la BD en CADA request web (incluido CRM, login, carrito, etc.). En un servidor con pocos recursos, esto es un desperdicio significativo.

### Cambios:

#### [MODIFY] [SeoMiddleware.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/app/Http/Middleware/SeoMiddleware.php)

1. **Salir rápido** para rutas que no son públicas (CRM, admin, API, login, etc.)
2. **Corregir parsing del slug del producto** — actualmente busca por `$segments[1]` que es el slug completo (`balanza-analitica-45`), no el ID
3. **Corregir `getCategorySeo`** — el campo se llama `nombre`, no `nombre_categoria`
4. **Agregar soporte para subcategorías y sectores** en el switch
5. **Cachear las queries SEO por 5 minutos** para reducir la carga en BD

```php
public function handle(Request $request, Closure $next): Response
{
    $path = $request->path();
    
    // Salir rápido para rutas no públicas
    if (str_starts_with($path, 'crm') || 
        str_starts_with($path, 'admin') || 
        str_starts_with($path, 'api/') ||
        str_starts_with($path, 'login') ||
        str_starts_with($path, 'banco-imagenes') ||
        $path === 'logout' ||
        $path === 'register' ||
        str_starts_with($path, 'product/') ||  // API routes /product/all etc
        str_starts_with($path, 'marca/') ||     // API routes /marca/all etc
        str_starts_with($path, 'categoria/') || // API routes
        str_starts_with($path, 'subcategoria_') ||
        str_starts_with($path, 'filtros') ||
        str_starts_with($path, 'pedido') ||
        str_starts_with($path, 'orders') ||
        str_starts_with($path, 'productos/')) {
        return $next($request);
    }

    $seoData = $this->generateSeoData($request);
    Inertia::share('seo', $seoData);

    return $next($request);
}
```

Y corregir `getProductSeo` para extraer el ID del slug:

```php
private function getProductSeo($productSlug, $defaultSeo): array
{
    try {
        // Extraer ID del slug (ej: "balanza-analitica-45" → 45)
        $productId = ctype_digit($productSlug) 
            ? (int) $productSlug 
            : (preg_match('/(\d+)$/', $productSlug, $m) ? (int) $m[1] : null);

        if (! $productId) return $defaultSeo;

        $cacheKey = "seo_product_{$productId}";
        return Cache::remember($cacheKey, 300, function () use ($productId, $defaultSeo) {
            $producto = Producto::with(['marca', 'subcategoria.categoria'])->find($productId);
            if (! $producto) return $defaultSeo;
            // ... resto del código actual con correcciones ...
        });
    } catch (\Exception $e) {
        return $defaultSeo;
    }
}
```

Agregar caso `subcategoria` y `sector` al switch.

---

## Fase 3 — URLs con Slug Semántico para Marcas (Plan original mejorado)

> El plan original en `plan_optimizacion_seo_marcas.md` está **bien diseñado**. Los cambios que propongo son menores:

### Cambios al plan original:

1. **Mantener todo** lo propuesto en el plan original (modelo, rutas, controlador, frontend utils, components)
2. **Eliminar el `aggregateRating` fabricado** en Product.jsx (líneas 1284-1290) — Google penaliza datos ficticios de rating
3. **No usar `window.location.origin`** para canonical en el frontend — usar la prop `appUrl` desde el backend (más confiable con proxies/HTTPS)

#### Archivos del plan original (sin cambios):

| # | Archivo | Cambio |
|---|---|---|
| 1 | `app/Models/Marca.php` | Agregar `getSeoSlug()` y `getSeoUrl()` |
| 2 | `routes/web.php` | `{id}` → `{marcaSlug}` |
| 3 | `app/Http/Controllers/ProductoController.php` | Reescribir `ProductViewByMarca` con slug + 301 |
| 4 | `resources/js/utils/productUrl.js` | Agregar `getMarcaUrl()` |
| 5-7 | Header, BrandSection, CategoryBrandSection | Usar `getMarcaUrl()` |
| 8 | `resources/js/Pages/Marcas.jsx` | Meta tags SEO, canonical, limpieza |
| 9 | `resources/js/Pages/Product.jsx` | Breadcrumbs con nombre del producto |

---

## Fase 4 — Meta Tags SEO para TODAS las Páginas Públicas (Impacto Alto)

> [!IMPORTANT]
> Actualmente solo `Product.jsx` tiene meta tags completas. Todas las demás páginas públicas solo tienen un `<Head title="..." />` genérico sin description, OG tags ni canonical.

### 4a. Welcome.jsx — Página principal

#### [MODIFY] [Welcome.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Welcome.jsx) (línea 72)

```diff
-            <Head title="MegaEquipamiento" />
+            <Head title="MegaEquipamiento - Equipos de Laboratorio | Compra Online Perú">
+                <meta name="description" content="Líder en equipos de laboratorio en Perú. Amplio catálogo de instrumentos científicos, equipamiento médico, industrial y suministros. Envío a todo el país." />
+                <meta property="og:title" content="MegaEquipamiento - Equipos de Laboratorio en Perú" />
+                <meta property="og:description" content="Encuentra los mejores equipos de laboratorio, instrumentos científicos y suministros para tu laboratorio." />
+                <meta property="og:image" content={`${window.location.origin}/img/logo2.png`} />
+                <meta property="og:type" content="website" />
+                <meta property="og:url" content={window.location.origin} />
+                <meta property="og:site_name" content="Mega Equipamiento" />
+                <meta property="og:locale" content="es_PE" />
+                <link rel="canonical" href={window.location.origin} />
+            </Head>
```

### 4b. Categoria.jsx

#### [MODIFY] [Categoria.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Categoria.jsx) (línea 210)

```diff
-            <Head title="Categorias" />
+            <Head title={categoria ? `${categoria.nombre} - Equipos de Laboratorio | Mega Equipamiento` : 'Categorías | Mega Equipamiento'}>
+                {categoria && (
+                    <>
+                        <meta name="description" content={`Explora equipos de ${categoria.nombre} en Mega Equipamiento. ${productos?.length || 0} productos disponibles con envío a todo el Perú.`} />
+                        <meta property="og:title" content={`${categoria.nombre} | Mega Equipamiento`} />
+                        <meta property="og:description" content={`Equipos de ${categoria.nombre}: ${subcategorias?.length || 0} subcategorías disponibles.`} />
+                        <meta property="og:type" content="website" />
+                        <link rel="canonical" href={`${window.location.origin}/categorias/${categoria.id_categoria}`} />
+                    </>
+                )}
+            </Head>
```

### 4c. Subcategorias.jsx

#### [MODIFY] [Subcategorias.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Subcategorias.jsx) (línea 687)

Necesitamos pasar la subcategoría y categoría desde el backend. Actualmente `subCategoriaView` no las pasa explícitamente.

#### [MODIFY] [ProductoController.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/app/Http/Controllers/ProductoController.php) — `subCategoriaView` (línea 90)

Agregar `subcategoria` a las props de Inertia:

```diff
 return Inertia::render('Subcategorias', [
     'productos' => $productos,
     'marcas' => $marcas,
+    'subcategoria' => $subcategoria,
 ]);
```

Luego en el JSX:

```diff
-            <Head title="Subcategoria" />
+            <Head title={subcategoria ? `${subcategoria.nombre} | Mega Equipamiento` : 'Subcategoría | Mega Equipamiento'}>
+                {subcategoria && (
+                    <>
+                        <meta name="description" content={`Productos de ${subcategoria.nombre} en Mega Equipamiento. ${productos?.length || 0} productos disponibles. Envío a todo el Perú.`} />
+                        <meta property="og:title" content={`${subcategoria.nombre} | Mega Equipamiento`} />
+                        <meta property="og:type" content="website" />
+                    </>
+                )}
+            </Head>
```

### 4d. Sector.jsx

#### [MODIFY] [Sector.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Sector.jsx) (línea 309)

```diff
-            <Head title={`Sector ${tagParent ? tagParent.nombre : ''}`} />
+            <Head title={tagParent ? `${tagParent.nombre} - Sector | Mega Equipamiento` : 'Sector | Mega Equipamiento'}>
+                {tagParent && (
+                    <>
+                        <meta name="description" content={`Equipamiento para el sector ${tagParent.nombre}. Descubre ${productos?.length || 0} productos especializados en Mega Equipamiento.`} />
+                        <meta property="og:title" content={`Sector ${tagParent.nombre} | Mega Equipamiento`} />
+                        <meta property="og:type" content="website" />
+                        <link rel="canonical" href={`${window.location.origin}/sector/${tagParent.id_tag_parent}`} />
+                    </>
+                )}
+            </Head>
```

### 4e. Contacto.jsx

#### [MODIFY] [Contacto.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Contacto.jsx) (línea 216)

```diff
-      <Head title="Contacto - MEGA EQUIPAMIENTO" />
+      <Head title="Contacto - Mega Equipamiento | Asesoría Técnica en Equipos de Laboratorio">
+          <meta name="description" content="Contáctanos para asesoría técnica especializada en equipos de laboratorio. Atención personalizada, cotizaciones y soporte técnico. Envío a todo el Perú." />
+          <meta property="og:title" content="Contacto | Mega Equipamiento" />
+          <meta property="og:description" content="Asesoría técnica especializada en equipos de laboratorio." />
+          <meta property="og:type" content="website" />
+          <link rel="canonical" href={`${window.location.origin}/contacto`} />
+      </Head>
```

---

## Fase 5 — Structured Data (JSON-LD) para Páginas Clave

### 5a. Welcome.jsx — Schema WebSite + SearchAction

Agregar dentro del `<Head>`:

```jsx
<script type="application/ld+json">
    {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mega Equipamiento",
        "url": window.location.origin,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${window.location.origin}/producto?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    })}
</script>
```

### 5b. Categoria.jsx — Schema CollectionPage + BreadcrumbList

```jsx
{categoria && (
    <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": categoria.nombre,
            "description": `Equipos de ${categoria.nombre} en Mega Equipamiento`,
            "url": `${window.location.origin}/categorias/${categoria.id_categoria}`,
            "numberOfItems": productos?.length || 0
        })}
    </script>
)}
```

### 5c. Product.jsx — Eliminar aggregateRating fabricado

#### [MODIFY] [Product.jsx](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/js/Pages/Product.jsx) (líneas 1284-1290)

```diff
-                        "aggregateRating": {
-                            "@type": "AggregateRating",
-                            "ratingValue": "4.5",
-                            "reviewCount": "1",
-                            "bestRating": "5",
-                            "worstRating": "1"
-                        }
```

> [!CAUTION]
> Google penaliza explícitamente `aggregateRating` con datos inventados. "4.5 stars con 1 review" en todos los productos es una señal de spam que puede resultar en la pérdida de rich snippets para todo el sitio.

---

## Fase 6 — `robots.txt` Mejorado

#### [MODIFY] [web.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/routes/web.php) (líneas 462-474)

```diff
 Route::get('/robots.txt', function () {
     $content = "User-agent: *\n";
     $content .= "Allow: /\n";
     $content .= "Disallow: /admin/\n";
     $content .= "Disallow: /crear\n";
     $content .= "Disallow: /api/\n";
+    $content .= "Disallow: /crm/\n";
+    $content .= "Disallow: /login\n";
+    $content .= "Disallow: /carrito\n";
+    $content .= "Disallow: /orders/\n";
+    $content .= "Disallow: /banco-imagenes/\n";
+    $content .= "Disallow: /product/\n";
+    $content .= "Disallow: /marca/\n";
+    $content .= "Disallow: /productos/\n";
+    $content .= "Disallow: /subcategoria_\n";
+    $content .= "Disallow: /filtros/\n";
     $content .= "\n";
     $content .= 'Sitemap: '.url('/sitemap.xml')."\n";

     return response($content, 200, [
         'Content-Type' => 'text/plain',
     ]);
 })->name('robots.txt');
```

> Las rutas bloqueadas son endpoints API/JSON internos (ej: `/product/all`, `/marca/all`, `/productos/buscar`) que no son páginas HTML. Las URLs públicas de vista usan `/producto/{slug}`, `/marcas/{slug}`, `/categorias/{id}` etc., que NO se bloquean.

---

## Fase 7 — Limpieza de `console.log` en Producción

> 40+ console.log en páginas públicas afectan rendimiento y se ven poco profesionales si un dev/crawler inspecciona.

Dos opciones (recomiendo la primera por ser más rápida y segura):

### Opción A: Plugin Vite (recomendada — zero risk)

#### [MODIFY] [vite.config.js](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/vite.config.js)

Agregar `esbuild.drop` para el build de producción:

```js
export default defineConfig({
    // ... config existente ...
    esbuild: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
});
```

Esto elimina automáticamente TODOS los `console.log` y `debugger` del bundle de producción sin tocar el código fuente.

---

## Fase 8 — Mejoras al `app.blade.php`

#### [MODIFY] [app.blade.php](file:///c:/Users/Frank/Documents/CODE/megaEquipamiento/resources/views/app.blade.php)

1. **Mejorar el schema Organization** con datos reales (teléfono, dirección, etc.)
2. **Agregar `hreflang`** para indicar el idioma del sitio
3. **Agregar `Content-Security-Policy` básica** via meta tag

```diff
 <!-- Language and Region -->
 <meta name="language" content="Spanish">
 <meta name="geo.region" content="PE">
 <meta name="geo.country" content="Peru">
+<link rel="alternate" hreflang="es-PE" href="{{ request()->url() }}">
+<link rel="alternate" hreflang="x-default" href="{{ request()->url() }}">
```

Mejorar el schema Organization:

```diff
 <script type="application/ld+json">
 {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "MegaEquipamiento",
     "url": "{{ url('/') }}",
     "logo": "{{ asset('img/logo2.png') }}",
     "description": "Líder en equipos de laboratorio en Perú.",
     "address": {
         "@type": "PostalAddress",
-        "addressCountry": "PE"
+        "addressCountry": "PE",
+        "addressLocality": "Lima"
-    },
-    "sameAs": [
-        "{{ url('/') }}"
-    ]
+    }
 }
 </script>
```

> [!NOTE]
> El `sameAs` actual apunta al propio sitio, lo cual es incorrecto. `sameAs` debería apuntar a perfiles de redes sociales (Facebook, LinkedIn, etc.). Si no tienen redes, es mejor omitirlo.

---

## User Review Required

> [!IMPORTANT]
> **¿Tienen cuentas de redes sociales?** Si MegaEquipamiento tiene perfiles en Facebook, LinkedIn, Instagram, etc., debo agregarlos al schema Organization (`sameAs`) y al Twitter Card (`@MegaEquipamiento`). Actualmente Product.jsx referencia `@MegaEquipamiento` pero no verifico que exista.

> [!IMPORTANT]
> **Datos de contacto para schema LocalBusiness:** Si puedo agregar teléfono, dirección completa, horario de atención y email al schema Organization, esto mejora significativamente el SEO local. ¿Hay datos públicos de contacto que pueda usar?

## Open Questions

1. **¿Quieres que también agregue slugs semánticos a las categorías?** (ej: `/categorias/equipos-de-laboratorio-1` en vez de `/categorias/1`). El plan actual solo cubre marcas, pero el mismo patrón aplica. Esto lo podemos hacer en una fase posterior.

2. **¿Cuántos productos hay actualmente en la BD?** Si son más de 10,000, conviene dividir el sitemap en índice + archivos parciales. Con ~650 URLs actuales no es necesario, pero si los productos crecen significativamente sí.

3. **¿Usan Google Search Console?** Si sí, después de implementar el sitemap dinámico hay que hacer un "re-submit" del sitemap. Si no, recomiendo configurarlo.

---

## Resumen de Archivos por Fase

### Fase 1 — Sitemap Dinámico
| # | Archivo | Tipo |
|---|---|---|
| 1 | `app/Http/Controllers/SitemapController.php` | MODIFY |
| 2 | `app/Observers/InvalidateSitemapCache.php` | NEW |
| 3 | `app/Providers/AppServiceProvider.php` | MODIFY |

### Fase 2 — Optimizar SeoMiddleware
| # | Archivo | Tipo |
|---|---|---|
| 4 | `app/Http/Middleware/SeoMiddleware.php` | MODIFY |

### Fase 3 — Slugs de Marcas (del plan original)
| # | Archivo | Tipo |
|---|---|---|
| 5-13 | (9 archivos del plan original) | MODIFY |

### Fase 4 — Meta Tags para Todas las Páginas
| # | Archivo | Tipo |
|---|---|---|
| 14 | `resources/js/Pages/Welcome.jsx` | MODIFY |
| 15 | `resources/js/Pages/Categoria.jsx` | MODIFY |
| 16 | `resources/js/Pages/Subcategorias.jsx` | MODIFY |
| 17 | `resources/js/Pages/Sector.jsx` | MODIFY |
| 18 | `resources/js/Pages/Contacto.jsx` | MODIFY |
| 19 | `app/Http/Controllers/ProductoController.php` | MODIFY |

### Fase 5 — Structured Data
| # | Archivo | Tipo |
|---|---|---|
| 20 | `resources/js/Pages/Welcome.jsx` | MODIFY (mismo que 14) |
| 21 | `resources/js/Pages/Categoria.jsx` | MODIFY (mismo que 15) |
| 22 | `resources/js/Pages/Product.jsx` | MODIFY |

### Fase 6 — robots.txt
| # | Archivo | Tipo |
|---|---|---|
| 23 | `routes/web.php` | MODIFY |

### Fase 7 — Console.log cleanup
| # | Archivo | Tipo |
|---|---|---|
| 24 | `vite.config.js` | MODIFY |

### Fase 8 — app.blade.php
| # | Archivo | Tipo |
|---|---|---|
| 25 | `resources/views/app.blade.php` | MODIFY |

**Total: ~18 archivos únicos** (1 nuevo, 17 modificados)

---

## Plan de Verificación

### Pruebas Automatizadas
```bash
php artisan test
```

### Pruebas Manuales
1. **Sitemap:** Acceder a `/sitemap.xml` y verificar que se genera dinámicamente con URLs correctas y fechas actuales
2. **Rendimiento Sitemap:** Verificar que la segunda petición a `/sitemap.xml` sea instantánea (caché)
3. **Meta Tags:** Para cada página pública, verificar en "View Source" que aparezcan `title`, `description`, `og:*`, y `canonical`
4. **robots.txt:** Verificar que bloquee `/crm/`, `/login`, `/carrito`, etc.
5. **Slugs de Marcas:** Verificar redirección 301 de `/marcas/65` a `/marcas/sartorius-peru-65`
6. **Console.log:** Verificar que `npm run build` elimine los console.log del bundle final
7. **Structured Data:** Usar [Rich Results Test de Google](https://search.google.com/test/rich-results) para verificar Product, Organization, BreadcrumbList y WebSite schemas
8. **PageSpeed Insights:** Verificar que el middleware optimizado no añada latencia visible

### Validación post-deploy
- Re-submit sitemap en Google Search Console
- Verificar indexación de nuevas URLs con slug semántico durante las siguientes 2 semanas
