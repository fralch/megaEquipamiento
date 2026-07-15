# Plan: Nueva Entidad "Sección" para Agrupación de Productos

**Fecha**: 2026-07-14
**Objetivo**: Agregar una nueva entidad que permita agrupar productos de forma transversal (abarcando múltiples categorías, subcategorías y marcas).

---

## 1. Estructura de Base de Datos (5 tablas nuevas)

### 1.1 `secciones`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_seccion` | bigint PK auto_increment | Identificador único |
| `nombre` | varchar(150) | Nombre de la sección |
| `slug` | varchar(150) unique | Slug para URLs |
| `descripcion` | text nullable | Descripción |
| `imagen` | varchar(255) nullable | Imagen representativa |
| `activo` | boolean default true | Visible/habilitado |
| `orden` | integer default 0 | Orden de aparición |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### 1.2 `seccion_producto` (asignación manual)
| Columna | Tipo | Descripción |
|---|---|---|
| `seccion_id` | bigint FK → secciones(id_seccion) ON DELETE CASCADE | |
| `producto_id` | bigint FK → productos(id_producto) ON DELETE CASCADE | |

- PK compuesta: `(seccion_id, producto_id)`
- Índice unique en la combinación

### 1.3 `seccion_categoria` (asignación automática)
| Columna | Tipo | Descripción |
|---|---|---|
| `seccion_id` | bigint FK → secciones(id_seccion) ON DELETE CASCADE | |
| `categoria_id` | bigint FK → categorias(id_categoria) ON DELETE CASCADE | |

- PK compuesta: `(seccion_id, categoria_id)`

### 1.4 `seccion_subcategoria` (asignación automática)
| Columna | Tipo | Descripción |
|---|---|---|
| `seccion_id` | bigint FK → secciones(id_seccion) ON DELETE CASCADE | |
| `subcategoria_id` | bigint FK → subcategorias(id_subcategoria) ON DELETE CASCADE | |

- PK compuesta: `(seccion_id, subcategoria_id)`

### 1.5 `seccion_marca` (asignación automática)
| Columna | Tipo | Descripción |
|---|---|---|
| `seccion_id` | bigint FK → secciones(id_seccion) ON DELETE CASCADE | |
| `marca_id` | bigint FK → marcas(id_marca) ON DELETE CASCADE | |

- PK compuesta: `(seccion_id, marca_id)`

---

## 2. Migraciones

Crear los siguientes archivos en `database/migrations/`:

1. `YYYY_MM_DD_HHMMSS_create_secciones_table.php`
2. `YYYY_MM_DD_HHMMSS_create_seccion_producto_table.php`
3. `YYYY_MM_DD_HHMMSS_create_seccion_categoria_table.php`
4. `YYYY_MM_DD_HHMMSS_create_seccion_subcategoria_table.php`
5. `YYYY_MM_DD_HHMMSS_create_seccion_marca_table.php`

---

## 3. Modelos

### 3.1 Nuevo: `app/Models/Seccion.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seccion extends Model
{
    use HasFactory;

    protected $table = 'secciones';
    protected $primaryKey = 'id_seccion';
    protected $fillable = ['nombre', 'slug', 'descripcion', 'imagen', 'activo', 'orden'];
    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'seccion_producto', 'seccion_id', 'producto_id');
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'seccion_categoria', 'seccion_id', 'categoria_id');
    }

    public function subcategorias()
    {
        return $this->belongsToMany(Subcategoria::class, 'seccion_subcategoria', 'seccion_id', 'subcategoria_id');
    }

    public function marcas()
    {
        return $this->belongsToMany(Marca::class, 'seccion_marca', 'seccion_id', 'marca_id');
    }

    /**
     * Obtiene TODOS los productos de la sección (manuales + automáticos por categoría/subcategoría/marca).
     */
    public function getAllProductos()
    {
        $manualIds = $this->productos()->pluck('productos.id_producto');

        $categoriaIds = $this->categorias()->pluck('categorias.id_categoria');
        $subcategoriaIdsFromCats = Subcategoria::whereIn('id_categoria', $categoriaIds)->pluck('id_subcategoria');

        $subcategoriaIds = $this->subcategorias()->pluck('subcategorias.id_subcategoria');
        $allSubcategoriaIds = $subcategoriaIdsFromCats->merge($subcategoriaIds)->unique();

        $marcaIds = $this->marcas()->pluck('marcas.id_marca');

        $productoIds = Producto::whereIn('id_subcategoria', $allSubcategoriaIds)
            ->orWhereIn('marca_id', $marcaIds)
            ->pluck('id_producto')
            ->merge($manualIds)
            ->unique();

        return Producto::whereIn('id_producto', $productoIds);
    }

    /**
     * Scope: solo secciones activas.
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: ordenadas por el campo orden.
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden');
    }
}
```

### 3.2 Modificar: `app/Models/Producto.php`

Agregar relación:
```php
public function secciones()
{
    return $this->belongsToMany(Seccion::class, 'seccion_producto', 'producto_id', 'seccion_id');
}
```

### 3.3 Modificar: `app/Models/Categoria.php`

Agregar relación:
```php
public function secciones()
{
    return $this->belongsToMany(Seccion::class, 'seccion_categoria', 'categoria_id', 'seccion_id');
}
```

### 3.4 Modificar: `app/Models/Subcategoria.php`

Agregar relación:
```php
public function secciones()
{
    return $this->belongsToMany(Seccion::class, 'seccion_subcategoria', 'subcategoria_id', 'seccion_id');
}
```

### 3.5 Modificar: `app/Models/Marca.php`

Agregar relación:
```php
public function secciones()
{
    return $this->belongsToMany(Seccion::class, 'seccion_marca', 'marca_id', 'seccion_id');
}
```

---

## 4. Controlador

### `app/Http/Controllers/SeccionController.php`

Controlador unificado (público + admin) siguiendo el patrón de `TagController`, `TagParentController`, etc.

| Método | Tipo | Acción |
|---|---|---|
| `show($slug)` | Público | Página pública que muestra productos de la sección usando `getAllProductos()` |
| `indexApi()` | Público | API: listar todas las secciones activas |
| `productosApi($id)` | Público | API: productos de una sección |
| `index(Request)` | Admin | Devuelve JSON con todas las secciones (con relaciones cargadas: productos, categorias, subcategorias, marcas) para el componente React en `/crear`. También devuelve listados de productos, categorías, subcategorías y marcas disponibles para los selectores del formulario |
| `store(Request)` | Admin | Crear sección. Retorna JSON |
| `update(Request, $id)` | Admin | Editar sección. Retorna JSON |
| `destroy($id)` | Admin | Eliminar sección. Retorna JSON |
| `syncProductos(Request, $id)` | Admin | Sincronizar productos manuales (reemplaza el array completo) |
| `syncCategorias(Request, $id)` | Admin | Sincronizar categorías |
| `syncSubcategorias(Request, $id)` | Admin | Sincronizar subcategorías |
| `syncMarcas(Request, $id)` | Admin | Sincronizar marcas |

---

## 5. Rutas (`routes/web.php`)

```php
// Público
Route::get('/seccion/{slug}', [SeccionController::class, 'show'])->name('seccion.show');

// API pública
Route::get('/api/secciones', [SeccionController::class, 'indexApi']);
Route::get('/api/secciones/{id}/productos', [SeccionController::class, 'productosApi']);

// Admin (auth + admin role) — endpoints JSON consumidos por el componente React en /crear
Route::middleware(['auth', \App\Http\Middleware\CheckAdminRole::class])->prefix('admin/secciones')->group(function () {
    Route::get('/', [SeccionController::class, 'index']);
    Route::post('/', [SeccionController::class, 'store']);
    Route::match(['put', 'post'], '/{id}', [SeccionController::class, 'update']);
    Route::delete('/{id}', [SeccionController::class, 'destroy']);
    Route::post('/{id}/productos', [SeccionController::class, 'syncProductos']);
    Route::post('/{id}/categorias', [SeccionController::class, 'syncCategorias']);
    Route::post('/{id}/subcategorias', [SeccionController::class, 'syncSubcategorias']);
    Route::post('/{id}/marcas', [SeccionController::class, 'syncMarcas']);
});
```

**Nota**: No hay ruta que renderice una página Inertia separada para gestionar secciones. La UI de gestión se incrusta como un tab dentro de `/crear` (ver sección 6.2). El componente React consume estos endpoints vía axios, mismo patrón que `ProductoTagsManagement`.

---

## 6. Frontend (React/Inertia)

### 6.1 Página pública: `resources/js/Pages/Seccion.jsx`
- Muestra nombre, descripción, imagen de la sección
- Grid/listado de productos con filtros y paginación
- Similar a la página de marca (`/marcas/{slug}`)

### 6.2 Componente admin: `resources/js/Components/create/GestionarSecciones.jsx`
- **NO es una página Inertia separada**. Es un componente React que se embebe como un tab dentro de `Crear.jsx`, siguiendo el mismo patrón que `createTags.jsx`, `MoveSubcategories.jsx`, etc.
- Al montarse, hace `axios.get('/admin/secciones')` para obtener la lista de secciones + los catálogos (productos, categorías, subcategorías, marcas) para los selectores
- **Vista principal**: tabla con secciones existentes (nombre, slug, activo, orden, acciones: editar/eliminar)
- **Modal/formulario** para crear/editar sección con pestañas:
  - **General**: nombre (genera slug automáticamente con `Str::slug`), descripción, imagen, toggle activo, orden numérico
  - **Productos**: buscador multi-select para asignación manual de productos
  - **Categorías**: checkboxes de categorías (asignación automática)
  - **Subcategorías**: checkboxes de subcategorías (asignación automática)
  - **Marcas**: checkboxes de marcas (asignación automática)
- Las pestañas de categorías/subcategorías/marcas hacen sync vía endpoints dedicados (`POST /admin/secciones/{id}/categorias`, etc.)
- Soporta dark mode vía `useTheme()`
- Paginación en la tabla (mismo patrón que `createTags.jsx`)

### 6.3 Integración en `Crear.jsx`
- Agregar un nuevo botón en el sidebar, dentro de una nueva sección "📦 Secciones" (o dentro de "🔧 Herramientas Admin"), con el texto "Gestionar Secciones"
- Agregar el estado booleano `crearSecciones` y el handler `handleCrearSeccionesClick` que siga el mismo patrón que los demás handlers (setea todos los demás tabs a false, el nuevo a true, y actualiza `activeButton`)
- Agregar el bloque condicional en el área de contenido principal:
  ```jsx
  <div className={crearSecciones ? "block" : "hidden"}>
      <GestionarSecciones />
  </div>
  ```

---

## 7. Orden de Implementación

1. Crear las 5 migraciones
2. Ejecutar `php artisan migrate`
3. Crear modelo `Seccion`
4. Agregar relaciones a `Producto`, `Categoria`, `Subcategoria`, `Marca`
5. Crear `SeccionController` (con `index` retornando JSON para el tab en `/crear`, más endpoints CRUD y sync)
6. Agregar rutas en `web.php`
7. Crear `resources/js/Components/create/GestionarSecciones.jsx`
8. Integrar el componente en `Crear.jsx` (estado + handler + botón sidebar + bloque condicional)
9. Crear página pública `resources/js/Pages/Seccion.jsx`
10. Probar con `php artisan test` o manualmente

---

## 8. Notas
- Seguir las convenciones del proyecto: PKs con prefijo `id_` (ej. `id_seccion`), nombres de tablas en español/plural
- Las rutas admin usan middleware `auth` + `CheckAdminRole` y `Route::match(['put', 'post'], ...)` para compatibilidad con CSRF deshabilitado
- Las páginas React usan Inertia.js con Ziggy para rutas. Importar con `@/Pages/...`
- No usar `RefreshDatabase` en tests (el proyecto corre contra BD real)
- Las páginas admin no usan layout compartido; cada una replica el sidebar de `Crear.jsx`
