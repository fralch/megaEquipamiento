# Componentes de Checkout

Esta carpeta contiene todos los componentes relacionados con el proceso de checkout/compra, organizados en un sistema de tabs para una mejor experiencia de usuario.

## Estructura

```
checkout/
├── CheckoutTabs.jsx          # Componente principal con navegación por tabs
├── steps/                    # Componentes de cada paso del checkout
│   ├── CartStep.jsx         # Paso 1: Revisión del carrito
│   ├── AddressStep.jsx      # Paso 2: Dirección de envío
│   ├── ShippingStep.jsx     # Paso 3: Opciones de envío
│   ├── PaymentStep.jsx      # Paso 4: Método de pago
│   └── ConfirmStep.jsx      # Paso 5: Confirmación del pedido
└── README.md                # Este archivo
```

## Componentes

### CheckoutTabs.jsx
Componente principal que maneja:
- Navegación entre pasos
- Estado global del checkout
- Validación de pasos completados
- Progreso visual del proceso

**Props:**
- `cartItems`: Array de productos en el carrito
- `onUpdateQuantity`: Función para actualizar cantidad de productos
- `onRemoveItem`: Función para eliminar productos
- `isDarkMode`: Boolean para modo oscuro

### CartStep.jsx
Primer paso del checkout que permite:
- Revisar productos en el carrito
- Modificar cantidades
- Eliminar productos
- Ver resumen de precios
- Proceder al siguiente paso

### AddressStep.jsx
Segundo paso para gestionar direcciones:
- Seleccionar dirección guardada
- Agregar nueva dirección
- Validar campos obligatorios
- Guardar direcciones para uso futuro

### ShippingStep.jsx
Tercer paso para opciones de envío:
- Seleccionar método de envío (estándar, express, mismo día)
- Elegir fecha de entrega preferida
- Agregar instrucciones especiales
- Calcular costos de envío

### PaymentStep.jsx
Cuarto paso para métodos de pago:
- Tarjeta de crédito/débito
- Transferencia bancaria
- Yape/Plin
- Datos de facturación
- Validación de formularios

### ConfirmStep.jsx
Paso final de confirmación:
- Resumen completo del pedido
- Revisión de todos los datos
- Confirmación y procesamiento
- Pantalla de éxito

## Características

### Navegación
- **Progresiva**: Solo se puede avanzar completando el paso actual
- **Regresiva**: Se puede regresar a pasos anteriores
- **Visual**: Indicadores de progreso y pasos completados

### Estado
- **Persistente**: Los datos se mantienen al navegar entre pasos
- **Validado**: Cada paso valida sus datos antes de permitir continuar
- **Reactivo**: Cambios en tiempo real reflejados en resúmenes

### Responsive
- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Adaptativo**: Layout que se ajusta a diferentes tamaños de pantalla
- **Accesible**: Navegación por teclado y lectores de pantalla

### Temas
- **Modo claro/oscuro**: Soporte completo para ambos temas
- **Consistente**: Colores y estilos coherentes en todos los componentes

## Uso

```jsx
import CheckoutTabs from '../Components/checkout/CheckoutTabs';

function CarritoPage() {
    return (
        <CheckoutTabs 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            isDarkMode={isDarkMode}
        />
    );
}
```

## Integración con Backend

Los componentes están preparados para integrarse con:
- **Inertia.js**: Para navegación y envío de formularios
- **Laravel**: Para validación y procesamiento de datos
- **APIs**: Para servicios de pago y envío

## Personalización

Cada componente puede ser personalizado modificando:
- **Estilos**: Clases de Tailwind CSS
- **Validaciones**: Reglas de validación de formularios
- **Opciones**: Métodos de pago y envío disponibles
- **Textos**: Mensajes y etiquetas

## Consideraciones de Rendimiento

- **Lazy loading**: Los pasos se cargan según se necesiten
- **Memoización**: Componentes optimizados para re-renders
- **Validación eficiente**: Solo se valida cuando es necesario

## Próximas Mejoras

- [ ] Integración con pasarelas de pago reales
- [ ] Cálculo dinámico de envío por ubicación
- [ ] Guardado automático de progreso
- [ ] Notificaciones push de estado del pedido
- [ ] Integración con sistemas de inventario