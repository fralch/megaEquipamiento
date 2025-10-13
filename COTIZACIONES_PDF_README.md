# Exportación de Cotizaciones a PDF

Se ha implementado la funcionalidad de exportación de cotizaciones a PDF con las siguientes características:

## Características Implementadas

✅ **Logo de la Empresa**: Se muestra el logo de "Nuestra Empresa" seleccionada en la cotización
✅ **Firma**: Se incluye la imagen de firma de la empresa
✅ **Fotos de Productos**: Cada producto muestra su imagen principal
✅ **Descripción de Productos**: Incluye nombre y descripción detallada
✅ **Especificaciones Técnicas**: Muestra todas las especificaciones técnicas del producto en formato tabla
✅ **Información Completa**: Cliente, vendedor, fechas, moneda, condiciones comerciales
✅ **Productos Adicionales**: Tabla con servicios o productos adicionales
✅ **Totales**: Cálculo detallado de subtotales y total general

## Archivos Modificados/Creados

### Backend (PHP)
1. **`app/Http/Controllers/CRM/Cotizaciones/CotizacionesController.php`**
   - Método `exportPdf()` añadido (línea 629-723)
   - Carga cotización con todas sus relaciones
   - Procesa imágenes y especificaciones técnicas
   - Genera PDF usando DomPDF

2. **`resources/views/pdf/cotizacion.blade.php`** (NUEVO)
   - Template HTML/CSS profesional para el PDF
   - Diseño responsive con estructura de tabla
   - Secciones: Header, Cliente, Cotización, Productos, Especificaciones, Totales, Firma

3. **`routes/web.php`**
   - Ruta añadida (línea 90): `GET /crm/cotizaciones/{id}/export-pdf`

### Frontend (React)
4. **`resources/js/Pages/CRM/Cotizaciones/components/ShowCotizaciones.jsx`**
   - Botón "Exportar a PDF" agregado en el footer
   - Función `handleExportPdf()` para abrir PDF en nueva pestaña
   - Importado icono `FiDownload`

## Requisitos de Sistema

### Extensiones PHP Necesarias

Para que funcione correctamente, necesitas instalar las siguientes extensiones de PHP:

#### En Ubuntu/Debian/WSL:
```bash
sudo apt-get update
sudo apt-get install php8.2-xml php8.2-dom php8.2-simplexml php8.2-gd
```

#### En Windows (XAMPP/WAMP):
1. Abrir `php.ini`
2. Descomentar (quitar `;` al inicio):
   ```ini
   extension=dom
   extension=xml
   extension=xmlreader
   extension=xmlwriter
   extension=simplexml
   extension=gd
   ```
3. Reiniciar servidor Apache

#### Verificar extensiones instaladas:
```bash
php -m | grep -E 'dom|xml|simplexml'
```

### Librería Instalada

**barryvdh/laravel-dompdf** - Ya agregada al `composer.json`

Para finalizar la instalación:
```bash
composer install
```

## Uso

1. **Desde la interfaz CRM**:
   - Navegar a CRM > Cotizaciones
   - Hacer clic en "Ver detalles" (ícono de ojo) de cualquier cotización
   - En el modal, hacer clic en "Exportar a PDF"
   - El PDF se descargará automáticamente

2. **URL directa**:
   ```
   GET /crm/cotizaciones/{id}/export-pdf
   ```

## Estructura del PDF

```
┌─────────────────────────────────────┐
│ [LOGO]              EMPRESA INFO    │
├─────────────────────────────────────┤
│      COTIZACIÓN COT-2025-XXX        │
├─────────────────────────────────────┤
│  CLIENTE INFO    │  COTIZACIÓN INFO │
├─────────────────────────────────────┤
│  PRODUCTOS COTIZADOS                │
│  ┌─────────────────────────────┐   │
│  │ [IMAGEN] Nombre Producto    │   │
│  │ Descripción                 │   │
│  │ Cantidad | P.Unit | Subtotal│   │
│  │                             │   │
│  │ Especificaciones Técnicas:  │   │
│  │ • Característica 1: Valor   │   │
│  │ • Característica 2: Valor   │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  PRODUCTOS ADICIONALES (Tabla)      │
├─────────────────────────────────────┤
│  CONDICIONES COMERCIALES            │
├─────────────────────────────────────┤
│              [FIRMA]                │
│        _______________              │
│        Nombre Vendedor              │
│           Empresa                   │
└─────────────────────────────────────┘
```

## Configuración de Imágenes

### Para que las imágenes se muestren correctamente:

1. **Logo de Empresa**: Guardar en `public/img/empresas/logos/`
2. **Firma**: Guardar en `public/img/empresas/firmas/`
3. **Productos**: Las imágenes se obtienen de `storage/` según configuración del producto

### Base de Datos - Tabla `nuestras_empresas`:
```sql
- imagen_logo: "img/empresas/logos/nombre_archivo.jpg"
- imagen_firma: "img/empresas/firmas/firma_archivo.png"
```

## Personalización

### Modificar estilos del PDF:
Editar `/resources/views/pdf/cotizacion.blade.php` sección `<style>`

### Cambiar información mostrada:
Modificar método `exportPdf()` en `CotizacionesController.php`

## Solución de Problemas

### Error: "Class 'DOMDocument' not found"
**Solución**: Instalar extensión PHP dom
```bash
sudo apt-get install php8.2-dom
```

### Las imágenes no aparecen
**Solución**:
1. Verificar que las rutas en BD sean correctas
2. Verificar permisos de carpetas: `chmod 755 public/img/empresas/*`
3. Usar `public_path()` en lugar de `asset()` en el template Blade

### PDF se descarga corrupto
**Solución**:
1. Verificar que no haya salida antes de `return $pdf->download()`
2. Revisar logs: `storage/logs/laravel.log`

### Texto con caracteres extraños
**Solución**: Asegurar que el template use `<meta charset="UTF-8">`

## Mejoras Futuras (Opcionales)

- [ ] Agregar watermark personalizado
- [ ] Generar PDF en segundo plano y enviar por email
- [ ] Agregar códigos QR con enlace a la cotización
- [ ] Permitir seleccionar template de PDF (formal, moderno, minimalista)
- [ ] Exportar múltiples cotizaciones en un solo PDF
- [ ] Agregar firma digital
- [ ] Generar versión en inglés/otros idiomas

## Soporte

Para problemas o consultas relacionadas con esta funcionalidad, revisar:
- Logs de Laravel: `storage/logs/laravel.log`
- Documentación DomPDF: https://github.com/barryvdh/laravel-dompdf
