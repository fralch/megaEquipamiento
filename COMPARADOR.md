# Sistema de Comparación de Productos

Este documento describe el sistema de comparación de productos implementado en la aplicación.

## Características

- **Comparación de hasta 4 productos** simultáneamente
- **Modal interactivo** para visualizar comparaciones
- **Persistencia en localStorage** para mantener la lista entre sesiones
- **Contador visual** en el botón del comparador
- **Integración con tema oscuro/claro**
- **Responsive design** para dispositivos móviles

## Componentes Creados

### 1. CompareContext (`/resources/js/storage/CompareContext.jsx`)
Context de React que maneja el estado global de la comparación de productos.

**Acciones disponibles:**
- `ADD_TO_COMPARE`: Agregar producto a la comparación
- `REMOVE_FROM_COMPARE`: Remover producto de la comparación
- `CLEAR_COMPARE`: Limpiar toda la lista de comparación

### 2. CompareModal (`/resources/js/Components/compare/CompareModal.jsx`)
Modal que muestra la tabla de comparación de productos con sus características.

**Características mostradas:**
- Imagen del producto
- Nombre
- Precio
- Descripción
- Especificaciones técnicas
- Marca
- Stock disponible

### 3. CompareButton (`/resources/js/Components/compare/CompareButton.jsx`)
Botón reutilizable para agregar/quitar productos de la comparación.

**Estados:**
- Normal: Permite agregar producto
- Activo: Producto ya está en comparación (azul)
- Deshabilitado: Cuando se alcanza el límite de 4 productos

### 4. useCompare Hook (`/resources/js/hooks/useCompare.js`)
Hook personalizado que facilita el uso del CompareContext.

**Funciones disponibles:**
```javascript
const {
  compareList,      // Array de productos en comparación
  addToCompare,     // Función para agregar producto
  removeFromCompare, // Función para remover producto
  clearCompare,     // Función para limpiar lista
  isInCompare,      // Verificar si producto está en lista
  compareCount,     // Número de productos en comparación
  canAddMore,       // Si se pueden agregar más productos
  hasProducts       // Si hay productos en la lista
} = useCompare();
```

### 5. ProductCard (`/resources/js/Components/product/ProductCard.jsx`)
Componente de ejemplo que muestra cómo integrar el CompareButton en una tarjeta de producto.

## Integración en la Aplicación

### 1. Providers
El `CompareProvider` se agregó al archivo `app.jsx` para estar disponible globalmente:

```jsx
<ThemeProvider>
  <CartProvider>
    <CompareProvider>
      <App {...props} />
    </CompareProvider>
  </CartProvider>
</ThemeProvider>
```

### 2. Menu Principal
El componente `Menu.jsx` fue modificado para:
- Mostrar contador de productos en comparación
- Abrir el modal de comparación al hacer clic
- Incluir efectos hover y animaciones

## Uso en Componentes

### Agregar botón de comparación a un producto:
```jsx
import CompareButton from '../compare/CompareButton';

// En tu componente
<CompareButton product={producto} className="custom-class" />
```

### Usar el hook de comparación:
```jsx
import { useCompare } from '../hooks/useCompare';

const MiComponente = () => {
  const { addToCompare, compareCount, isInCompare } = useCompare();
  
  const handleAddToCompare = () => {
    addToCompare(producto);
  };
  
  return (
    <div>
      <p>Productos en comparación: {compareCount}</p>
      <button onClick={handleAddToCompare}>
        {isInCompare(producto.id) ? 'En comparación' : 'Comparar'}
      </button>
    </div>
  );
};
```

### Mostrar modal de comparación:
```jsx
import CompareModal from '../compare/CompareModal';

const [isModalOpen, setIsModalOpen] = useState(false);

<CompareModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
/>
```

## Estructura de Datos

### Producto esperado:
```javascript
{
  id: number,
  nombre: string,
  precio: number,
  descripcion: string,
  imagen: string,
  stock: number,
  especificaciones_tecnicas: string|object,
  marca: {
    nombre: string
  }
}
```

## Persistencia

La lista de comparación se guarda automáticamente en `localStorage` con la clave `compareList` y se restaura al cargar la aplicación.

## Limitaciones

- Máximo 4 productos para comparar simultáneamente
- Los productos se comparan por ID, asegúrate de que cada producto tenga un ID único
- Las especificaciones técnicas se muestran como texto plano o JSON stringificado

## Personalización

Todos los componentes respetan el tema oscuro/claro de la aplicación y pueden ser personalizados mediante clases CSS adicionales.

## Próximas Mejoras

- Exportar comparación como PDF
- Compartir comparación por URL
- Comparación por categorías específicas
- Filtros avanzados en el modal
- Animaciones de transición mejoradas