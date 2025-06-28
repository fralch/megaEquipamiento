# Manejo de Múltiples Imágenes en Productos

## Cambios Realizados

Se ha actualizado el sistema para soportar múltiples imágenes por producto. Anteriormente, cada producto tenía una sola imagen almacenada como string, ahora puede tener múltiples imágenes almacenadas como un array JSON.

### Ejemplo de formato anterior:
```json
{
  "imagen": "productos/1742441741.png"
}
```

### Ejemplo de formato actual:
```json
{
  "imagen": ["productos/1742441741.png", "productos/1742441742.png", "productos/1742441743.png"]
}
```

## Archivos Modificados

### 1. Base de Datos
- **Migración**: `2025_01_17_000000_modify_imagen_column_in_productos_table.php`
  - Convierte la columna `imagen` de VARCHAR(255) a JSON
  - Migra automáticamente los datos existentes de string a array
  - Mantiene compatibilidad hacia atrás en el rollback

### 2. Modelo
- **Archivo**: `app/Models/Producto.php`
  - Agregado cast `'imagen' => 'array'` para manejar automáticamente la conversión JSON ↔ Array
  - Agregados métodos auxiliares:
    - `getPrimeraImagenAttribute()`: Obtiene la primera imagen
    - `getImagenesAttribute()`: Obtiene todas las imágenes como array
    - `agregarImagen()`: Agrega una nueva imagen
    - `eliminarImagen()`: Elimina una imagen por índice

### 3. Backend - Controlador
- **Archivo**: `app/Http/Controllers/ProductoController.php`
  - **Método `createProduct()`**: Actualizado para manejar múltiples imágenes
    - Acepta array `imagenes[]` y imagen individual `imagen`
    - Mantiene compatibilidad con imagen única
  - **Método `updateProductImage()`**: Actualizado para múltiples imágenes
    - Elimina imágenes anteriores correctamente
    - Soporta subida de múltiples archivos
  - **Método `deleteProduct()`**: Actualizado para eliminar múltiples imágenes
    - Verifica si `imagen` es array o string
    - Elimina todos los archivos asociados

### 4. Frontend - Componentes

#### ProductGrid.jsx
- **Función**: `transformProduct()`
- **Cambio**: Maneja tanto arrays como strings para la imagen
- **Lógica**: Si es array, toma la primera imagen; si es string, mantiene compatibilidad

```javascript
// Manejar imagen como array o string
let image;
if (Array.isArray(item.imagen)) {
  // Si es un array, tomar la primera imagen
  const firstImage = item.imagen[0];
  image = firstImage && firstImage.startsWith('http') 
    ? firstImage 
    : `${URL_API}/${firstImage}`;
} else {
  // Mantener compatibilidad con string
  image = item.imagen && item.imagen.startsWith('http')
    ? item.imagen
    : `${URL_API}/${item.imagen}`;
}
```

#### CartItem.jsx
- **Cambio**: Actualizado para mostrar la primera imagen de un array
- **Lógica**: Verifica si `item.image` es array y toma la primera imagen

```javascript
src={
  Array.isArray(item.image)
    ? (item.image[0] ? `/${item.image[0]}` : '/api/placeholder/120/120')
    : (item.image ? `/${item.image}` : '/api/placeholder/120/120')
}
```

#### RelatedProducts.jsx
- **Cambio**: Actualizado para manejar arrays de imágenes
- **Lógica**: Similar a CartItem, toma la primera imagen del array

#### ConfirmStep.jsx
- **Cambio**: Actualizado para el checkout con múltiples imágenes
- **Lógica**: Muestra la primera imagen del array en el resumen de compra

#### createProductos.jsx
- **Cambios principales**:
  - **Estados agregados**:
    - `previewImages`: Array de vistas previas
    - `selectedImages`: Array de archivos seleccionados
  - **Input actualizado**: Agregado atributo `multiple`
  - **Función `handleImageChange()`**: Maneja múltiples archivos
    - Crea vistas previas para todas las imágenes
    - Mantiene compatibilidad con imagen única
  - **Función `handleSubmit()`**: Envía múltiples imágenes como `imagenes[index]`
  - **Componente `ImageUpload`**: Actualizado para mostrar grid de vistas previas

```javascript
// Manejar múltiples imágenes
setSelectedImages(files);

// Crear vistas previas para todas las imágenes
const previews = [];
files.forEach((file, index) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    previews[index] = reader.result;
    if (previews.length === files.length) {
      setPreviewImages([...previews]);
    }
  };
  reader.readAsDataURL(file);
});
```

#### ImageGallery.jsx
- **Estado**: Ya manejaba múltiples imágenes correctamente
- **Función `normalizedImages`**: Convierte string a array si es necesario
- **Navegación**: Permite navegar entre múltiples imágenes

#### ZoomImage.jsx
- **Estado**: Mantiene funcionalidad de edición de imagen individual
- **Uso**: Se utiliza dentro de ImageGallery para cada imagen individual

## Compatibilidad

### Retrocompatibilidad
El sistema mantiene **100% de compatibilidad** con productos existentes que tienen una sola imagen:
- Los productos con imagen string siguen funcionando normalmente
- La migración convierte automáticamente strings a arrays de un elemento
- Todos los componentes verifican el tipo de dato antes de procesarlo

### Formato de Datos
```javascript
// Formato anterior (sigue siendo válido)
{
  "imagen": "productos/imagen.jpg"
}

// Formato nuevo
{
  "imagen": ["productos/imagen1.jpg", "productos/imagen2.jpg"]
}

// Ambos formatos son procesados correctamente por todos los componentes
```

## Consideraciones Técnicas

### Performance
- Las vistas previas se generan de forma asíncrona
- Solo se carga la primera imagen en listados para optimizar rendimiento
- Las imágenes adicionales se cargan bajo demanda en la galería

### Validación
- El backend valida cada archivo individualmente
- Se mantienen las mismas restricciones de tamaño y formato
- Límite recomendado: 5 imágenes por producto

### Almacenamiento
- Las imágenes se almacenan en el directorio `public/productos/`
- Cada imagen mantiene su nombre único con timestamp
- La eliminación de productos limpia automáticamente todas las imágenes asociadas

## Próximos Pasos

1. **Optimización**: Implementar lazy loading para imágenes adicionales
2. **Reordenamiento**: Agregar funcionalidad de drag & drop para reordenar imágenes
3. **Compresión**: Implementar compresión automática de imágenes
4. **CDN**: Considerar migración a servicio de almacenamiento en la nube

## Consideraciones Técnicas

- **Rendimiento**: Las imágenes se cargan de forma lazy
- **Almacenamiento**: Usar compresión y optimización de imágenes
- **Límites**: Considerar límite máximo de imágenes por producto
- **Validación**: Validar tipos de archivo y tamaños en el backend

## Migración de Datos Existentes

La migración se ejecuta automáticamente y:
1. Convierte strings existentes a arrays de un elemento
2. Limpia datos inválidos que podrían causar problemas con JSON
3. Mantiene integridad de datos
4. Permite rollback seguro si es necesario

```bash
# Ejecutar migración
php artisan migrate

# Rollback si es necesario
php artisan migrate:rollback
```

## Próximos Pasos

1. Implementar subida múltiple en el panel de administración
2. Agregar reordenamiento de imágenes
3. Implementar eliminación individual de imágenes
4. Optimización automática de imágenes
5. Soporte para videos en la galería