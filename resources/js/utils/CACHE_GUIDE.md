# 📚 Guía de Gestión de Cache - MegaEquipamiento

## ✅ Problema Resuelto

Con las optimizaciones de React implementadas, se agregó un **sistema de cache** para mejorar el rendimiento:
- ⏱️ **Productos**: Cache de 1 hora
- ⏱️ **Categorías**: Cache de 24 horas
- ⏱️ **Marcas**: Cache de 1 hora

**Problema**: Los productos/categorías/marcas nuevos NO se mostraban inmediatamente en la web hasta que el cache expirara.

**Solución**: Sistema de invalidación de cache manual y automática.

---

## 🎯 Cómo Usar el Sistema

### Opción 1: Botón Flotante en Admin (Recomendado)

Cuando estés en las páginas de administración (`/crear` o `/admin-products`):

1. **Verás un botón flotante púrpura** en la esquina inferior derecha 🔮
2. **Haz click** en el botón para abrir el panel de gestión de cache
3. **Elige qué limpiar**:
   - 🛒 **Limpiar Cache de Productos** - Después de crear/editar productos
   - 📁 **Limpiar Cache de Categorías y Subcategorías** - Después de crear/editar categorías O subcategorías
   - 🏷️ **Limpiar Cache de Marcas** - Después de crear/editar marcas
   - 🗑️ **Limpiar TODO el Cache** - Limpieza completa
4. **La página se recargará automáticamente** y mostrará los datos nuevos

### Opción 2: Desde la Consola del Navegador

Si prefieres usar JavaScript directamente:

```javascript
// Importar el gestor de cache (en consola del navegador)
import cacheManager from './resources/js/utils/cacheManager.js';

// Limpiar cache específico
cacheManager.clearProductsCache();     // Solo productos
cacheManager.clearCategoriesCache();   // Categorías Y subcategorías (ambas juntas)
cacheManager.clearBrandsCache();       // Solo marcas

// Limpiar todo
cacheManager.clearAllCache();

// Ver información del cache
cacheManager.logCacheInfo();

// Invalidar y recargar (limpia + recarga página)
cacheManager.invalidateCacheAndReload('products');     // Productos
cacheManager.invalidateCacheAndReload('categories');   // Categorías + Subcategorías
cacheManager.invalidateCacheAndReload('brands');       // Marcas
```

### Opción 3: Programáticamente desde Componentes React

```javascript
import { clearProductsCache, clearAllCache } from '../utils/cacheManager';

// Después de crear un producto con éxito
const handleCreateProduct = async (productData) => {
    const response = await axios.post('/api/products', productData);

    if (response.status === 200) {
        // Limpiar cache de productos
        clearProductsCache();

        // Opcional: recargar página
        window.location.reload();
    }
};
```

---

## 📋 Cuándo Limpiar el Cache

### ✅ **SÍ debes limpiar el cache** en estos casos:

1. **Después de crear un nuevo producto** → Limpiar cache de productos
2. **Después de editar un producto existente** → Limpiar cache de productos
3. **Después de crear/editar categorías** → Limpiar cache de categorías y subcategorías
4. **Después de crear/editar subcategorías** → Limpiar cache de categorías y subcategorías
5. **Después de mover subcategorías entre categorías** → Limpiar cache de categorías y subcategorías
6. **Después de crear/editar marcas** → Limpiar cache de marcas
7. **Después de cambiar imágenes** → Limpiar cache correspondiente
8. **Si no ves cambios recientes en la web** → Limpiar TODO el cache

### ❌ **NO necesitas limpiar el cache** en estos casos:

1. Solo estás navegando por la web
2. Solo estás viendo productos
3. No has hecho cambios en el admin
4. El cache se limpió hace menos de 5 minutos

---

## 🔄 Flujos de Trabajo Paso a Paso

### 📦 Crear/Editar Productos
```
1. Crear producto nuevo en admin
2. Click en botón púrpura flotante 🔮
3. Click en "🛒 Limpiar Cache de Productos"
4. ✅ Producto aparece inmediatamente en la web
```

### 📁 Crear/Editar Categorías o Subcategorías
```
1. Crear/editar categoría o subcategoría en admin
2. Click en botón púrpura flotante 🔮
3. Click en "📁 Limpiar Cache de Categorías y Subcategorías"
4. ✅ Cambios aparecen inmediatamente en toda la web
```

### 🔀 Mover Subcategorías entre Categorías
```
1. Usar la herramienta "Mover Subcategorías"
2. Mover subcategoría de categoría A a categoría B
3. Click en botón púrpura flotante 🔮
4. Click en "📁 Limpiar Cache de Categorías y Subcategorías"
5. ✅ La nueva estructura se muestra inmediatamente
```

### 🏷️ Crear/Editar Marcas
```
1. Crear/editar marca en admin
2. Click en botón púrpura flotante 🔮
3. Click en "🏷️ Limpiar Cache de Marcas"
4. ✅ Marca aparece inmediatamente en la web
```

---

## 🔍 Verificar Estado del Cache

El panel de gestión muestra:
- ✅ **Cache activo** (verde) - Con antigüedad en minutos
- ❌ **Sin cache** (rojo) - No hay datos guardados

Ejemplo:
```
Productos:  ✓ (15 min)  ← Cache de 15 minutos
Categorías: ✓ (240 min) ← Cache de 4 horas
Marcas:     ✗ Sin cache  ← No hay cache
```

---

## ⚡ Tiempos de Expiración del Cache

| Tipo                          | Duración | Motivo                                    |
|-------------------------------|----------|-------------------------------------------|
| Productos                     | 1 hora   | Se actualizan con frecuencia              |
| Categorías + Subcategorías    | 24 horas | Cambian raramente (estructura estable)    |
| Marcas                        | 1 hora   | Balance entre performance y actualización |

**Nota Importante**: Las categorías y subcategorías comparten el mismo cache porque se cargan juntas desde el endpoint `/categorias-completa`. Al limpiar el cache de categorías, también se limpian las subcategorías automáticamente.

---

## 🎨 Ubicación de los Archivos

```
resources/js/
├── utils/
│   ├── cacheManager.js      ← Funciones de gestión de cache
│   └── CACHE_GUIDE.md       ← Esta guía
└── Components/
    └── admin/
        └── CacheCleaner.jsx  ← Botón flotante en admin
```

---

## 🐛 Solución de Problemas

### Problema: "No veo mis productos nuevos"
**Solución**: Limpia el cache de productos usando el botón flotante

### Problema: "Las categorías o subcategorías no se actualizan"
**Solución**: Limpia el cache de categorías y subcategorías (tiene duración de 24 horas - el más largo)

### Problema: "El botón flotante no aparece"
**Solución**: Verifica que estés en `/crear` o `/admin-products` como administrador

### Problema: "Limpié el cache pero sigue igual"
**Solución**:
1. Asegúrate de que la página se recargó
2. Limpia el cache del navegador (Ctrl + F5)
3. Verifica que el cache se limpió revisando el estado en el panel

---

## 💡 Mejores Prácticas

1. **Después de crear productos**: Limpia solo el cache de productos, no todo
2. **Cambios masivos**: Limpia TODO el cache para estar seguro
3. **Desarrollo**: Si estás probando, considera reducir los tiempos de cache
4. **Producción**: Los tiempos actuales son óptimos para balance rendimiento/actualización

---

## 🔧 Configuración Avanzada

Si quieres cambiar los tiempos de cache, edita estos archivos:

**ProductGrid.jsx** (línea ~161):
```javascript
const oneHour = 60 * 60 * 1000; // Cambiar duración aquí
```

**Categorias_cuadrado.jsx** (línea ~6):
```javascript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
```

**BrandSection.jsx** (línea ~172):
```javascript
const oneHour = 60 * 60 * 1000; // 1 hora
```

---

## ✨ Resumen Visual

```
┌─────────────────────────────────────────┐
│  1. CREAR PRODUCTO NUEVO                │
│  ├─ Admin crea producto                 │
│  ├─ Producto guardado en BD             │
│  └─ ❌ NO se ve en web (cache activo)  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. LIMPIAR CACHE                       │
│  ├─ Click en botón flotante púrpura     │
│  ├─ "Limpiar Cache de Productos"        │
│  └─ Página se recarga automáticamente   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. DATOS ACTUALIZADOS                  │
│  ├─ Cache limpiado ✅                   │
│  ├─ API consulta nuevos datos           │
│  └─ ✅ Producto nuevo visible en web   │
└─────────────────────────────────────────┘
```

---

## 📞 Soporte

Si tienes problemas con el cache:
1. Revisa esta guía
2. Intenta limpiar TODO el cache
3. Revisa la consola del navegador (F12) para errores
4. Contacta al equipo de desarrollo

---

**Última actualización**: $(date)
**Versión**: 1.0.0
