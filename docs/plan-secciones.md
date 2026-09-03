# Secciones: Jerarquía Sección → Categoría → Subcategoría

> **Nota (2026-08-17)**: Este documento describía originalmente un diseño transversal N:N que fue implementado y luego identificado como incorrecto. Ese diseño fue reemplazado por una jerarquía estricta. El plan de refactor (con el detalle completo de los cambios) está en [`plan-refactor-secciones-jerarquia.md`](./plan-refactor-secciones-jerarquia.md).

## Diseño vigente

```
Sección 1:N Categoría 1:N Subcategoría 1:N Producto
```

- Una sección **tiene** categorías (`categorias.id_seccion`, FK nullable, `ON DELETE SET NULL`).
- Una categoría pertenece a **una sola sección** (o a ninguna). Asignarla a otra sección la **mueve**.
- Las subcategorías y productos se heredan transitivamente; no existen asignaciones manuales de productos, subcategorías ni marcas.
- Los productos de una sección se obtienen con `Seccion::getAllProductos()` (query sobre `subcategoria.categoria.id_seccion`).

## Piezas involucradas

| Capa | Archivo | Notas |
|---|---|---|
| Tabla | `secciones` | `id_seccion`, `nombre`, `slug` unique, `descripcion`, `imagen`, `activo`, `orden` |
| Columna | `categorias.id_seccion` | Agregada en `2026_08_17_000000_add_id_seccion_to_categorias_table.php` |
| Modelo | `app/Models/Seccion.php` | `categorias()` hasMany, `getAllProductos()`, scopes `activo()`/`ordenado()` |
| Modelo | `app/Models/Categoria.php` | `seccion()` belongsTo |
| Controlador | `app/Http/Controllers/SeccionController.php` | Público (`show`, `indexApi`, `productosApi`) + admin (`index`, `store`, `update`, `destroy`, `syncCategorias`) |
| Rutas públicas | `routes/web.php` | `/seccion/{slug}`, `/api/secciones`, `/api/secciones/{id}/productos` |
| Rutas admin | `routes/web.php` | Grupo `admin/secciones` con `auth` + `role.admin` |
| Admin UI | `resources/js/Components/create/GestionarSecciones.jsx` | Tab en `/crear`; tabs General + Categorías |
| Público | `Pages/Seccion.jsx`, `Components/home/Sections*.jsx`, `hooks/useSecciones.js` | Sin cambios respecto a la implementación original |
