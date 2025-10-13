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

### ⚠️ IMPORTANTE: Extensiones PHP Necesarias

Para que funcione correctamente, **DEBES** instalar las siguientes extensiones de PHP:

#### 🐧 En Ubuntu/Debian/WSL (Recomendado):
```bash
# Instalar todas las extensiones necesarias
sudo apt-get update
sudo apt-get install -y php8.2-xml php8.2-dom php8.2-simplexml php8.2-gd php8.2-mbstring

# Reiniciar PHP-FPM (si usas Nginx)
sudo service php8.2-fpm restart

# O reiniciar Apache (si usas Apache)
sudo service apache2 restart
```

#### 🪟 En Windows (XAMPP/WAMP/Laragon):
1. Abrir el archivo `php.ini` (buscar en XAMPP: `C:\xampp\php\php.ini`)
2. Buscar y descomentar (quitar `;` al inicio de estas líneas):
   ```ini
   extension=dom
   extension=xml
   extension=xmlreader
   extension=xmlwriter
   extension=simplexml
   extension=gd
   extension=mbstring
   ```
3. Guardar el archivo
4. Reiniciar el servidor Apache desde el panel de control de XAMPP

#### ✅ Verificar que las extensiones están instaladas:
```bash
php -m | grep -E 'dom|xml|simplexml|gd'
```

Deberías ver algo como:
```
dom
SimpleXML
xml
xmlreader
xmlwriter
gd
```

### 📦 Librería Instalada

**barryvdh/laravel-dompdf** - Ya agregada al `composer.json`

#### Finalizar instalación:
```bash
# Si aún no has instalado las dependencias
composer install

# Si ya las instalaste pero agregaste las extensiones después
php artisan config:clear
php artisan cache:clear
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

## 🚨 Solución de Problemas

### Error: "The PHP GD extension is required, but is not installed"
**Este es el error más común**

**Solución en WSL/Ubuntu:**
```bash
# Instalar la extensión GD
sudo apt-get update
sudo apt-get install -y php8.2-gd

# Verificar instalación
php -m | grep gd

# Reiniciar servidor
php artisan serve
```

**Solución en Windows (XAMPP):**
1. Abrir `C:\xampp\php\php.ini`
2. Buscar `;extension=gd` (tiene punto y coma al inicio)
3. Quitar el `;` para que quede: `extension=gd`
4. Guardar y cerrar
5. Reiniciar Apache desde el panel de XAMPP

### Error: "Class 'DOMDocument' not found"
**Solución**: Instalar extensiones PHP dom y xml
```bash
sudo apt-get install -y php8.2-dom php8.2-xml
```

### Las imágenes no aparecen en el PDF
**Posibles soluciones**:
1. Verificar que las rutas en BD sean correctas
2. Verificar permisos de carpetas: `chmod 755 public/img/empresas/*`
3. Las imágenes deben estar en `public/storage/` (ejecutar `php artisan storage:link`)

### PDF se descarga corrupto
**Solución**:
1. Verificar que no haya salida antes de `return $pdf->download()`
2. Revisar logs: `storage/logs/laravel.log`
3. Limpiar cache: `php artisan cache:clear && php artisan config:clear`

### Texto con caracteres extraños (ñ, tildes, etc.)
**Solución**: Ya está configurado con `<meta charset="UTF-8">` en el template

### ⚡ Solución Rápida (Todo en uno para WSL/Ubuntu)
```bash
# Instalar TODAS las extensiones necesarias de una vez
sudo apt-get update && sudo apt-get install -y \
  php8.2-xml \
  php8.2-dom \
  php8.2-simplexml \
  php8.2-gd \
  php8.2-mbstring

# Limpiar cache de Laravel
php artisan config:clear
php artisan cache:clear

# Reiniciar servidor
# Ctrl+C para detener el servidor actual, luego:
php artisan serve
```

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
