# Solución para Error Mixed Content en Laravel + Vite

## 🚨 El Problema

**Error Mixed Content** ocurre cuando:
- La página se carga por **HTTPS** (seguro)
- Los assets (CSS, JS) se cargan por **HTTP** (inseguro)
- El navegador **bloquea** los recursos HTTP por seguridad

### Síntomas
```
Mixed Content: The page at 'https://dominio.com' was loaded over HTTPS, 
but requested an insecure stylesheet 'http://dominio.com/build/assets/app.css'
```

## 🔍 Causa

Laravel genera URLs basándose en `APP_URL`. Si está configurado con HTTP, todos los assets se generan con HTTP, incluso si el sitio se sirve por HTTPS.

## ✅ Solución

### 1. Configurar URLs en .env

```env
# ❌ ANTES - URLs HTTP
APP_URL=http://localhost
VITE_API_URL = "http://127.0.0.1:8000"

# ✅ DESPUÉS - URLs HTTPS
APP_URL=https://tu-dominio.com
VITE_API_URL = "https://tu-dominio.com"
```

### 2. Forzar HTTPS en Producción

**Archivo**: `app/Providers/AppServiceProvider.php`

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Force HTTPS in production
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
```

### 3. Pasos para Aplicar en Producción

1. **Subir cambios al servidor**
2. **Limpiar cache de configuración**:
   ```bash
   php artisan config:cache
   ```
3. **Reconstruir assets**:
   ```bash
   npm run build
   ```
4. **Verificar que funcione**

## 🔧 Configuración Adicional (Opcional)

### Para servidores con proxy reverso (nginx, Apache)

Si usas un proxy reverso, también puedes agregar:

```php
// En AppServiceProvider.php
public function boot(): void
{
    if (app()->environment('production')) {
        URL::forceScheme('https');
        
        // Si usas proxy reverso
        request()->server->set('HTTPS', 'on');
    }
}
```

### Variables de entorno adicionales

```env
# Asegurar que Laravel detecte HTTPS
FORCE_HTTPS=true
APP_ENV=production
```

## 🎯 Verificación

Después de aplicar los cambios, verifica que:

1. Las URLs de assets usen HTTPS:
   ```
   https://tu-dominio.com/build/assets/app.js ✅
   ```

2. No aparezcan errores de Mixed Content en la consola del navegador

3. Los recursos CSS y JS se carguen correctamente

## 📝 Notas Importantes

- **Siempre usa HTTPS** en producción para e-commerce
- **Limpia cache** después de cambiar configuración
- **Reconstruye assets** con `npm run build`
- **Verifica certificado SSL** esté funcionando

## 🔄 Comando Rápido

Para aplicar todos los cambios de una vez:

```bash
php artisan config:cache && npm run build
```

---

**Fecha**: $(date)
**Proyecto**: MegaEquipamiento
**Autor**: Claude Code