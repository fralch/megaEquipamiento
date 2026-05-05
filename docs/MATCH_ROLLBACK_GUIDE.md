# ↩️ Guía de Rollback: Cambios Módulo Match (05/05/2026)

Esta guía permite revertir todos los cambios realizados hoy en el módulo Match para devolver el sistema a su estado original.

## 🛠 1. Revertir Base de Datos (Importante)

Antes de borrar los archivos, debes deshacer las migraciones para eliminar las columnas y tablas nuevas de la base de datos.

```bash
# Deshacer las últimas 2 migraciones (Notificaciones y Ubicación)
php artisan migrate:rollback --step=2
```

---

## 📂 2. Archivos Creados (Eliminar)

Debes eliminar manualmente los siguientes archivos nuevos:

1.  `app/Models/Match/MatchNotification.php`
2.  `database/migrations/2026_05_05_000000_add_location_to_match_users_table.php`
3.  `database/migrations/2026_05_05_000001_create_match_notifications_table.php`
4.  `docs/MATCH_MOBILE_INTEGRATION.md`
5.  `docs/MATCH_ROLLBACK_GUIDE.md` (este archivo)

---

## 📝 3. Archivos Modificados (Restaurar)

Para los archivos existentes, aquí están los cambios que deben revertirse:

### `app/Models/Match/MatchUser.php`
*   **Quitar del `$fillable`**: `latitude`, `longitude`, `city`, `fcm_token`.
*   **Quitar relación**: método `notifications()`.

### `app/Http/Controllers/Match/MatchAuthController.php`
*   **En `register`**: Quitar validaciones y asignaciones de `latitude`, `longitude`, `city`.

### `app/Http/Controllers/Match/MatchProfileController.php`
*   **En `show`**: Quitar campos de ubicación de la respuesta JSON.
*   **En `update`**: Quitar validaciones de ubicación y `fcm_token`.
*   **Eliminar métodos**: `getNotifications()` y `markAsRead($id)`.

### `app/Http/Controllers/Match/MatchSwipeController.php`
*   **En `getCandidates`**: Revertir a la lógica simple de `inRandomOrder()` sin el cálculo de Haversine (`selectRaw`).
*   **En `swipe`**: Quitar el `use MatchNotification` y las llamadas a `MatchNotification::send()`.

### `app/Http/Controllers/Match/MatchController.php`
*   **En `sendMessage`**: Quitar el `use MatchNotification` y la llamada a `MatchNotification::send()` al destinatario.

### `routes/web.php`
*   **Eliminar rutas**: `/notifications` y `/notifications/{id}/read` dentro del grupo `match-api`.

---

## 🔍 4. Verificación
Después de realizar el rollback, ejecuta los tests del módulo para asegurar que el sistema base sigue funcionando:
```bash
php artisan test tests/Feature/Match/MatchFeatureTest.php
```
