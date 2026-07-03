# Resumen de Cambios — SEO Optimización de Marcas

## Objetivo
Migrar las URLs de marcas de `/marcas/{id}` (ej: `/marcas/65`) a `/marcas/{slug-con-nombre}-{id}` (ej: `/marcas/sartorius-peru-65`), mejorando el SEO con slugs semánticos, meta tags, canonical y redirecciones 301.

---

## Archivos Modificados

### 1. `app/Models/Marca.php`
**Se agregaron dos métodos públicos** (NO accesores `$appends`, para no contaminar las respuestas JSON del CRM):

- `getSeoSlug(): string` — Genera el slug SEO a partir del nombre de la marca + su ID (ej: `"sartorius-peru-65"`). Incluye fallback para nombres con caracteres no latinos.
- `getSeoUrl(): string` — Retorna la URL pública completa (ej: `"/marcas/sartorius-peru-65"`).

### 2. `routes/web.php`
- Línea 50: El parámetro de la ruta pública cambió de `{id}` a `{marcaSlug}`:
  ```php
  Route::get('/marcas/{marcaSlug}', [ProductoController::class, 'ProductViewByMarca'])->name('marcas.view');
  ```

### 3. `app/Http/Controllers/ProductoController.php`
**Se reescribió `ProductViewByMarca`** (líneas 97-145):
1. Extrae el ID numérico del final del slug (`"sartorius-peru-65"` → `65`, `"65"` → `65`).
2. Si el ID no es válido o la marca no existe → **404**.
3. **Redirección 301** si el slug no coincide con el canónico (retrocompatibilidad: `/marcas/65` → `/marcas/sartorius-peru-65`).
4. Pasa la prop `seoSlug` a la vista Inertia para el `<link rel="canonical">`.

**Se agregó método privado `extractMarcaIdFromSlug()`** para extraer el ID del slug via regex.

### 4. `resources/js/utils/productUrl.js`
**Se agregó la función `getMarcaUrl(brand)`** siguiendo el mismo patrón de `getProductUrl`:
- Soporta `brand.seo_url` (calculado por backend), `brand.id_marca`, `brand.nombre`.
- Genera slug client-side con normalización Unicode (NFD), eliminando acentos y caracteres especiales.
- Exportada para uso en todos los componentes.

### 5. `resources/js/Components/home/Header.jsx`
- **Import:** Se agregó `getMarcaUrl` desde `../../utils/productUrl`.
- **`handleMarcaClick`:** Cambió de `window.location.href = /marcas/${m.id_marca}` a `window.location.href = getMarcaUrl(m)`.

### 6. `resources/js/Components/home/BrandSection.jsx`
- **Import:** Se agregó `getMarcaUrl` desde `../../utils/productUrl`.
- **`handleBrandClick`:** Cambió de `window.location.href = /marcas/${brand.id_marca}` a `window.location.href = getMarcaUrl(brand)`.

### 7. `resources/js/Components/categoria/CategoryBrandSection.jsx`
- **Import:** Se agregó `getMarcaUrl` desde `../../utils/productUrl`.
- **`handleBrandClick`:** Cambió de `window.location.href = /marcas/${brand.id_marca}` a `window.location.href = getMarcaUrl(brand)`.

### 8. `resources/js/Pages/Marcas.jsx`
**SEO y limpieza:**
- **marcaId simplificado:** Se reemplazó el parsing complejo de URL (3 console.logs + fallbacks) por `marca?.id_marca || null` directamente desde las props del servidor.
- **`<Head>` mejorado con meta tags SEO:**
  - `<title>`: `"Equipamiento {marca.nombre} | Mega Equipamiento"` (dinámico según la marca).
  - `<meta name="description">`: Descripción con el nombre de la marca.
  - `<meta property="og:title">`, `og:description`, `og:image`, `og:type`: Open Graph tags completos.
  - `<link rel="canonical">`: Apunta a la URL canónica con slug (usando la prop `seoSlug` del backend).

### 9. `resources/js/Pages/Product.jsx`
**Breadcrumbs mejorados** (líneas 1362-1369):
- Se agregó el nombre del producto al final de las migas de pan, separado por `/`.
- Estilo visual diferenciado (fuente normal, color atenuado) para distinguirlo de los links navegables.
- Truncado responsivo: `max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg`.
- Atributo `title` con el nombre completo para verlo al hacer hover.

---

## Flujo de Navegación con la Nueva URL

1. **Usuario hace clic** en una marca desde Home, Header, o Categoría.
2. **Frontend** genera la URL con slug: `/marcas/nombre-marca-{id}` vía `getMarcaUrl()`.
3. **Backend** recibe el slug, extrae el ID, busca la marca.
4. Si el slug no es el canónico → **301 redirect** al slug correcto.
5. Si el ID no existe → **404**.
6. La página renderiza con meta tags SEO completos y canonical correcto.

---

## Retrocompatibilidad

- Las URLs antiguas como `/marcas/65` siguen funcionando: el backend extrae el ID del slug numérico y **redirige con 301** a la URL canónica con slug.
- Esto transfiere el pagerank de Google y no rompe links existentes.

---

## CRM No Afectado

Los métodos `getSeoSlug()` y `getSeoUrl()` son **métodos públicos normales** (no accesores `$appends`). Los endpoints del CRM como `/marca/all`, `/marca-categoria/marcas` siguen devolviendo exactamente los mismos campos que antes, sin `seo_slug` ni `seo_url` en el JSON.

---

## Acción Pendiente: Sitemap

El sitemap es un archivo estático servido por `SitemapController.php`. Se debe **regenerar manualmente** `public/sitemap.xml` para que las URLs de marcas reflejen el nuevo formato con slug antes del próximo crawl de Google.
