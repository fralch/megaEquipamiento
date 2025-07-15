# Sistema de Correo de Confirmación de Pedidos

## Descripción
Se ha implementado un sistema completo de envío de correos electrónicos cuando se confirma un pedido. El sistema incluye:

- Envío automático de correo al confirmar pedido
- Datos completos del pedido (productos, totales, cliente)
- Información bancaria para transferencias
- Diseño profesional y responsive del correo

## Archivos Creados/Modificados

### Nuevos Archivos:
1. **`app/Mail/PedidoConfirmacion.php`** - Clase de correo para confirmación de pedidos
2. **`resources/views/emails/pedido-confirmacion.blade.php`** - Plantilla HTML del correo
3. **`SISTEMA_CORREO_PEDIDOS.md`** - Este archivo de documentación

### Archivos Modificados:
1. **`app/Http/Controllers/PedidoController.php`** - Agregado método `confirmarPedido()`
2. **`routes/web.php`** - Agregadas rutas para pedidos y prueba de correo
3. **`resources/js/Components/checkout/steps/ConfirmStep.jsx`** - Modificado `handlePlaceOrder()` para enviar datos al backend

## Funcionalidades Implementadas

### 1. Confirmación de Pedido con Correo
Cuando el usuario confirma un pedido en el frontend:
- Se envían todos los datos al backend via POST a `/pedido/confirmar`
- Se validan los datos del pedido
- Se envía un correo de confirmación al email del cliente
- Se retorna respuesta JSON con el estado del proceso

### 2. Contenido del Correo
El correo incluye:
- **Datos del cliente**: Nombre, email, teléfono, documento
- **Dirección de envío**: Dirección completa de entrega
- **Método de pago**: Método seleccionado por el cliente
- **Productos**: Lista detallada con cantidades y precios
- **Totales**: Subtotal, envío, IGV y total final
- **Datos bancarios**: Información completa para transferencias

### 3. Información Bancaria Incluida
- Banco: Banco de Crédito del Perú (BCP)
- Titular: MegaEquipamiento S.A.C.
- Número de Cuenta: 194-2345678-0-12
- Cuenta Interbancaria: 002-194-002345678012-34
- RUC: 20123456789
- Email: ventas@megaequipamiento.com
- Teléfono: +51 1 234-5678

## Rutas Agregadas

```php
// Confirmar pedido y enviar correo
POST /pedido/confirmar

// Ver detalles del pedido
GET /orders/{orderNumber}

// Prueba de correo de pedido (solo desarrollo)
GET /test-pedido-email
```

## Uso en el Frontend

El componente `ConfirmStep.jsx` ahora:
1. Recopila todos los datos del pedido y checkout
2. Genera un número de orden único
3. Envía los datos al backend via fetch API
4. Maneja la respuesta y muestra confirmación al usuario

```javascript
const datosCompletos = {
    orderNumber: orderNum,
    orderData: orderData,
    checkoutState: checkoutState,
    totals: totals
};

const response = await fetch('/pedido/confirmar', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    },
    body: JSON.stringify(datosCompletos)
});
```

## Configuración de Correo

### Para Desarrollo
En el archivo `.env`, mantener:
```
MAIL_MAILER=log
```
Los correos se guardarán en `storage/logs/laravel.log`

### Para Producción
Configurar SMTP real en `.env`:
```
MAIL_MAILER=smtp
MAIL_HOST=tu-servidor-smtp.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@dominio.com
MAIL_PASSWORD=tu-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="ventas@megaequipamiento.com"
MAIL_FROM_NAME="MegaEquipamiento"
```

## Pruebas

### Probar el Correo de Pedido
Visitar: `http://localhost:8000/test-pedido-email`

Esto enviará un correo de prueba con datos ficticios para verificar que:
- La plantilla se renderiza correctamente
- Los datos se muestran apropiadamente
- El diseño es responsive

### Probar el Flujo Completo
1. Ir al checkout y completar todos los pasos
2. En el paso de confirmación, hacer clic en "Confirmar pedido"
3. Verificar que se muestre el mensaje de éxito
4. Revisar los logs para confirmar que el correo se envió

## Personalización

### Modificar Datos Bancarios
Editar el array `datosBancarios` en `PedidoController.php` línea 35:

```php
'datosBancarios' => [
    'banco' => 'Tu Banco',
    'titular' => 'Tu Empresa',
    'numeroCuenta' => 'Tu Número de Cuenta',
    // ... otros datos
]
```

### Personalizar Diseño del Correo
Modificar `resources/views/emails/pedido-confirmacion.blade.php`:
- Cambiar colores en las variables CSS
- Agregar logo de la empresa
- Modificar estructura del contenido

### Agregar Campos Adicionales
1. Modificar la validación en `PedidoController.php`
2. Agregar los campos en la plantilla del correo
3. Asegurar que el frontend envíe los nuevos datos

## Seguridad

- ✅ Validación de datos en el backend
- ✅ Protección CSRF en las peticiones
- ✅ Sanitización de datos antes del envío
- ✅ Manejo de errores apropiado

## Notas Importantes

1. **Token CSRF**: El frontend incluye automáticamente el token CSRF
2. **Validación**: Todos los datos se validan en el backend antes del procesamiento
3. **Logs**: En desarrollo, los correos se guardan en logs para revisión
4. **Responsive**: El correo está optimizado para dispositivos móviles
5. **Fallbacks**: Si falta algún dato, se muestran valores por defecto

## Próximos Pasos Sugeridos

1. **Persistencia**: Guardar los pedidos en la base de datos
2. **Notificaciones**: Agregar notificaciones al administrador
3. **Seguimiento**: Implementar sistema de tracking de pedidos
4. **Plantillas**: Crear más plantillas de correo (envío, entrega, etc.)
5. **Colas**: Usar colas para el envío de correos en producción