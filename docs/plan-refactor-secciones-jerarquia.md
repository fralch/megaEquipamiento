# Plan: Refactor de "Secciones" a Jerarquía Sección → Categoría → Subcategoría

**Fecha**: 2026-08-17
**Estado**: Implementado (2026-08-17)
**Reemplaza a**: `docs/plan-secciones.md` (diseño transversal N:N, implementado el 2026-07-15)

---

## 1. Contexto y problema

La feature "secciones" se implementó como **agrupación transversal many-to-many**: 4 tablas pivot (`seccion_producto`, `seccion_categoria`, `seccion_subcategoria`, `seccion_marca`) que permiten asignar productos, categorías, subcategorías y marcas a una sección de forma independiente.

**Esto es incorrecto.** Las secciones deben ser una **capa jerárquica superior** al catálogo:

```
Sección 1:N Categoría 1:N Subcategoría 1:N Producto
```

Una sección *tiene* categorías; las subcategorías y productos se heredan de forma transitiva. No existen asignaciones manuales de productos, subcategorías ni marcas.

### Estado actual de la BD (dev)

| Tabla | Filas | Destino |
|---|---|---|
| `secciones` | 1 | Se conserva |
| `seccion_categoria` | 7 | Se migran a `categorias.id_seccion` y se dropea |
| `seccion_producto` | 0 | Se dropea |
| `seccion_subcategoria` | 0 | Se dropea |
| `seccion_marca` | 0 | Se dropea |

---

## 2. Diseño objetivo

- **Cardinalidad estricta**: una categoría pertenece a **una sola sección** (o a ninguna: `id_seccion` nullable). Asignar una categoría que ya está en otra sección la **mueve**.
- **Subcategorías**: heredadas vía `subcategorias.id_categoria` (FK ya existente). No hay asignación directa.
- **Productos de una sección**: productos cuyas subcategorías pertenecen a categorías de la sección.
- **Marcas**: quedan fuera de la jerarquía de secciones.

---

## 3. Cambios de Base de Datos (2 migraciones nuevas)

### 3.1 `YYYY_MM_DD_HHMMSS_add_id_seccion_to_categorias_table.php`

```php
public function up(): void
{
    Schema::table('categorias', function (Blueprint $table) {
        $table->unsignedBigInteger('id_seccion')->nullable()->after('descripcion');
        $table->index('id_seccion');
        $table->foreign('id_seccion')
              ->references('id_seccion')->on('secciones')
              ->onDelete('set null');
    });

    // Migración de datos: conservar las asignaciones existentes de seccion_categoria
    DB::statement('
        UPDATE categorias c
        INNER JOIN seccion_categoria sc ON sc.categoria_id = c.id_categoria
        SET c.id_seccion = sc.seccion_id
    ');
}

public function down(): void
{
    Schema::table('categorias', function (Blueprint $table) {
        $table->dropForeign(['id_seccion']);
        $table->dropIndex(['id_seccion']);
        $table->dropColumn('id_seccion');
    });
}
```

### 3.2 `YYYY_MM_DD_HHMMSS_drop_seccion_pivot_tables.php`

```php
public function up(): void
{
    Schema::dropIfExists('seccion_producto');
    Schema::dropIfExists('seccion_subcategoria');
    Schema::dropIfExists('seccion_marca');
    Schema::dropIfExists('seccion_categoria');
}
```

> **Nota**: la migración 3.1 debe ejecutarse antes que 3.2 (copia datos desde `seccion_categoria`). MySQL no hace DDL transaccional; el orden por timestamp es suficiente.

---

## 4. Modelos

### `app/Models/Seccion.php`

- Eliminar `productos()`, `categorias()` (N:N), `subcategorias()`, `marcas()`.
- Agregar:

  ```php
  public function categorias()
  {
      return $this->hasMany(Categoria::class, 'id_seccion');
  }
  ```

- Reescribir `getAllProductos()`:

  ```php
  public function getAllProductos()
  {
      return Producto::whereHas('subcategoria.categoria', function ($q) {
          $q->where('id_seccion', $this->id_seccion);
      });
  }
  ```

### `app/Models/Categoria.php`

- Eliminar `secciones()` (belongsToMany).
- Agregar:

  ```php
  public function seccion()
  {
      return $this->belongsTo(Seccion::class, 'id_seccion');
  }
  ```

- Agregar `'id_seccion'` a `$fillable`.

### `app/Models/Subcategoria.php`, `Marca.php`, `Producto.php`

- Eliminar la relación `secciones()` de cada uno (líneas: Subcategoria 60-64, Marca 59-63, Producto 96-99).

---

## 5. Controlador: `app/Http/Controllers/SeccionController.php`

| Método | Cambio |
|---|---|
| `show($slug)` | Sin cambios de firma. Usa el nuevo `getAllProductos()`. Misma respuesta a Inertia. |
| `indexApi()` | Sin cambios. |
| `productosApi($id)` | Sin cambios de firma. Misma respuesta JSON. |
| `index()` (admin) | Secciones solo con `categoria_ids`. Catálogos reducidos a `categorias` (cada una con su `id_seccion` actual, para mostrar exclusividad en la UI). Se eliminan los catálogos `productos`, `subcategorias`, `marcas` de la respuesta. |
| `store()` / `update()` | Sin cambios. |
| `destroy()` | Sin cambios (las categorías quedan con `id_seccion = null` vía FK `set null`). |
| `syncCategorias()` | **Reescrito** con semántica exclusiva (ver abajo). |
| `syncProductos()` / `syncSubcategorias()` / `syncMarcas()` | **Eliminados**. |

### Nuevo `syncCategorias()`

```php
public function syncCategorias(Request $request, $id)
{
    $validated = $request->validate([
        'categoria_ids' => 'array',
        'categoria_ids.*' => 'exists:categorias,id_categoria',
    ]);

    $seccion = Seccion::findOrFail($id);
    $ids = $validated['categoria_ids'] ?? [];

    // Desasignar las que tenían esta sección y ya no están en la lista
    Categoria::where('id_seccion', $seccion->id_seccion)
        ->whereNotIn('id_categoria', $ids)
        ->update(['id_seccion' => null]);

    // Asignar (o mover desde otra sección) las de la lista
    Categoria::whereIn('id_categoria', $ids)
        ->update(['id_seccion' => $seccion->id_seccion]);

    return response()->json(['message' => 'Categorías sincronizadas exitosamente']);
}
```

---

## 6. Rutas (`routes/web.php`)

Grupo `admin/secciones` (líneas 365-375): eliminar las rutas de sync de productos, subcategorías y marcas. Queda:

```php
Route::middleware(['auth', 'role.admin'])->prefix('admin/secciones')->group(function () {
    Route::get('/', [SeccionController::class, 'index'])->name('admin.secciones.index');
    Route::post('/', [SeccionController::class, 'store'])->name('admin.secciones.store');
    Route::match(['put', 'post'], '/{id}', [SeccionController::class, 'update'])->name('admin.secciones.update');
    Route::delete('/{id}', [SeccionController::class, 'destroy'])->name('admin.secciones.destroy');
    Route::post('/{id}/categorias', [SeccionController::class, 'syncCategorias'])->name('admin.secciones.sync-categorias');
});
```

Las rutas públicas (`/seccion/{slug}`, `/api/secciones`, `/api/secciones/{id}/productos`) **no cambian**.

---

## 7. Frontend

### 7.1 `resources/js/Components/create/GestionarSecciones.jsx` (único archivo a modificar)

- **Tabs del modal**: solo `general` y `categorias`. Se eliminan los tabs `productos`, `subcategorias`, `marcas`, sus estados (`productoIds`, `subcategoriaIds`, `marcaIds`), sus handlers y sus llamadas axios.
- **Tab Categorías**: checkboxes de todas las categorías. Las que pertenecen a **otra** sección se muestran con etiqueta `(en: <nombre sección>)`; al marcarlas y guardar, se mueven a la sección actual (semántica exclusiva del backend).
- **Tabla principal**: contador solo de categorías asignadas (eliminar contadores P/S/M).
- Texto descriptivo actualizado: *"Las secciones agrupan categorías. Las subcategorías y productos se heredan automáticamente."*

### 7.2 Sin cambios

El contrato de las APIs públicas se mantiene, por lo que **no se tocan**:

- `hooks/useSecciones.js`
- `Components/home/SectionsFloatingMenu.jsx`, `SectionsNavRail.jsx`, `SeccionProductosPreview.jsx`
- `Pages/Seccion.jsx`, `Pages/Welcome.jsx`, `Pages/Crear.jsx` (integración del tab)

> La caché `localStorage("mega_secciones")` conserva el mismo shape; no requiere invalidación.

---

## 8. Orden de implementación

1. Crear migración `add_id_seccion_to_categorias_table`
2. Crear migración `drop_seccion_pivot_tables`
3. `php artisan migrate` y verificar en tinker que las 7 categorías quedaron con `id_seccion` correcto
4. Actualizar modelos (`Seccion`, `Categoria`, `Subcategoria`, `Marca`, `Producto`)
5. Actualizar `SeccionController` (index + syncCategorias, eliminar 3 syncs)
6. Actualizar rutas
7. Actualizar `GestionarSecciones.jsx`
8. Verificación manual: `/api/secciones`, `/api/secciones/{id}/productos` (mismos productos que antes), CRUD y mover categorías desde `/crear`
9. `vendor/bin/pint` en los PHP tocados
10. Reemplazar `docs/plan-secciones.md` por la referencia a este documento

---

## 9. Riesgos y notas

- **Sin tests automatizados**: la feature actual no tiene tests y el proyecto corre contra BD real (prohibido `RefreshDatabase`). Verificación manual + tinker.
- **Pérdida de datos**: ninguna. Las pivots a dropear están vacías salvo `seccion_categoria`, cuyos datos se migran en 3.1.
- **Rollback**: `down()` de 3.1 quita la columna. Las pivots no se recrean en `down()` (sus migraciones originales siguen en el historial si se necesitara `migrate:rollback` por pasos).
- **Convenciones del proyecto**: PKs con prefijo `id_`, rutas admin con `Route::match(['put','post'], ...)`, middleware `auth` + `role.admin`.
- **Deploy**: correr `php artisan migrate` en producción dentro del flujo de `deploy.yml`.

---

## 10. Archivos afectados

| Tipo | Archivo |
|---|---|
| Nueva | `database/migrations/..._add_id_seccion_to_categorias_table.php` |
| Nueva | `database/migrations/..._drop_seccion_pivot_tables.php` |
| Modificar | `app/Models/Seccion.php` |
| Modificar | `app/Models/Categoria.php` |
| Modificar | `app/Models/Subcategoria.php` |
| Modificar | `app/Models/Marca.php` |
| Modificar | `app/Models/Producto.php` |
| Modificar | `app/Http/Controllers/SeccionController.php` |
| Modificar | `routes/web.php` |
| Modificar | `resources/js/Components/create/GestionarSecciones.jsx` |
| Modificar | `docs/plan-secciones.md` |
