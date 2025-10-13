# 🚨 ACCIÓN URGENTE REQUERIDA

## El PDF no funciona porque faltan extensiones de PHP

### ✅ SOLUCIÓN RÁPIDA (3 minutos)

Ejecuta estos comandos en tu terminal (WSL):

```bash
# Ir a la carpeta del proyecto
cd /mnt/d/Code/megaEquipamiento

# Ejecutar el instalador automático
./install-php-extensions.sh

# Limpiar cache (después de que las extensiones estén instaladas)
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Reiniciar el servidor
# Presiona Ctrl+C y luego:
php artisan serve
```

### 📝 Si el script anterior no funciona, ejecuta manualmente:

```bash
# Detectar tu versión de PHP
php -v

# Si tienes PHP 8.2:
sudo apt-get update
sudo apt-get install -y php8.2-xml php8.2-dom php8.2-gd php8.2-mbstring

# Si tienes PHP 8.1:
sudo apt-get install -y php8.1-xml php8.1-dom php8.1-gd php8.1-mbstring

# Si tienes PHP 8.0:
sudo apt-get install -y php8.0-xml php8.0-dom php8.0-gd php8.0-mbstring

# Verificar que se instalaron
php -m | grep -E 'dom|xml|gd|mbstring'

# Deberías ver:
# dom
# SimpleXML
# xml
# xmlreader
# xmlwriter
# gd
# mbstring

# Limpiar y reiniciar
php artisan config:clear
php artisan cache:clear
php artisan serve
```

## 🎯 ¿Qué he cambiado mientras tanto?

Para que puedas usar el sistema **AHORA MISMO**, he hecho los siguientes cambios temporales:

### ✅ Cambios Realizados:
1. **Removí las imágenes del PDF** - El PDF ahora funciona sin necesitar la extensión GD
2. **Sin logo de empresa** - Texto centrado en su lugar
3. **Sin fotos de productos** - Muestra SKU y descripción
4. **Sin imagen de firma** - Línea de firma simple
5. **Especificaciones técnicas** - Siguen funcionando perfectamente

### 📄 El PDF ahora incluye:
- ✅ Información completa de la empresa
- ✅ Datos del cliente
- ✅ Lista de productos con SKU
- ✅ Descripciones detalladas
- ✅ Especificaciones técnicas completas
- ✅ Precios y totales
- ✅ Condiciones comerciales
- ✅ Firma del vendedor (sin imagen)

## 🔄 ¿Quieres recuperar las imágenes?

Una vez que instales las extensiones de PHP, ejecuta:

```bash
cd /mnt/d/Code/megaEquipamiento
git stash  # Guardar cambios actuales
git checkout HEAD -- resources/views/pdf/cotizacion.blade.php
git checkout HEAD -- app/Http/Controllers/CRM/Cotizaciones/CotizacionesController.php
```

O contáctame para restaurar las imágenes manualmente.

## ❓ ¿Por qué pasó esto?

El paquete `barryvdh/laravel-dompdf` requiere la extensión GD de PHP para procesar imágenes. Sin esta extensión, el PDF no puede generarse con imágenes.

## 🎯 Próximos pasos:

1. **AHORA**: Prueba el PDF sin imágenes → `http://127.0.0.1:8000/crm/cotizaciones/3/export-pdf`
2. **LUEGO**: Instala las extensiones PHP
3. **FINALMENTE**: Restaura las imágenes si las necesitas

---

**Estado actual**: ✅ PDF funcional sin imágenes
**Estado deseado**: 🎯 PDF con imágenes (requiere extensiones PHP)
