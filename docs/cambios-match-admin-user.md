# Cambio en MatchAdminUserController - Datos de Usuario

## Resumen
Se ampliaron los endpoints `index` y `show` del controlador `MatchAdminUserController` para incluir más datos demográficos de los usuarios.

## Campos añadidos

### Método `index()` (summary)
- `age` - Edad del usuario
- `gender` - Género
- `interested_in` - Género de interés
- `city` - Ciudad
- `instagram` - Usuario de Instagram
- `whatsapp` - Número de WhatsApp

### Método `show()`
- `age` - Edad del usuario
- `gender` - Género
- `interested_in` - Género de interés
- `description` - Biografía/descripción
- `city` - Ciudad
- `instagram` - Usuario de Instagram
- `whatsapp` - Número de WhatsApp
- `latitude` - Latitud
- `longitude` - Longitud

## Archivo modificado
- `app/Http/Controllers/Match/Admin/MatchAdminUserController.php`

## Campos disponibles en el modelo MatchUser
```php
protected $fillable = [
    'name', 'email', 'password', 'age', 'gender', 'description',
    'interested_in', 'instagram', 'whatsapp', 'latitude', 'longitude', 'city', 'fcm_token',
];
```