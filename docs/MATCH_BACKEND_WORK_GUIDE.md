# Guia de trabajo - Backend Match

Esta guia es para retomar rapido el modulo/backend de la app de citas dentro de este proyecto Laravel.

El modulo no es un subproyecto separado. Vive dentro del monolito de MegaEquipamiento, pero esta aislado por namespaces, tablas y prefijos de rutas.

## Resumen rapido

- API app movil: `/match-api`
- API admin app movil: `/admin-api-match`
- Controladores app: `app/Http/Controllers/Match/`
- Controladores admin: `app/Http/Controllers/Match/Admin/`
- Modelos: `app/Models/Match/`
- Tablas: prefijo `match_`
- Migraciones: `database/migrations/*match*`
- Tests: `tests/Feature/Match/`
- Docs relacionadas: `docs/MATCH_MODULE.md`, `docs/API_MATCH.md`, `docs/MATCH_MOBILE_INTEGRATION.md`, `BACKEND_ENDPOINTS.md`

## Arquitectura

El modulo Match usa usuarios independientes de los usuarios principales del sitio.

- `users`: usuarios del Laravel/CRM/ecommerce principal.
- `match_users`: usuarios de la app de citas.
- `match_admins`: administradores de la app admin Match.

La autenticacion usa Laravel Sanctum. Los tokens de usuario normal y admin comparten Sanctum, por eso el admin tiene middleware propio para validar que el token pertenezca a `MatchAdmin`.

## Rutas principales

Todas estan registradas al final de `routes/web.php`.

### API movil - `/match-api`

Publicas:

- `POST /match-api/register`
- `POST /match-api/login`
- `GET /match-api/instagram/profile-picture`

Protegidas con `auth:sanctum`:

- `POST /match-api/logout`
- `GET /match-api/me`
- `GET /match-api/profile`
- `POST /match-api/profile`
- `PUT|PATCH /match-api/profile`
- `POST /match-api/profile/photo`
- `GET /match-api/notifications`
- `POST /match-api/notifications/{id}/read`
- `GET /match-api/candidates`
- `POST /match-api/swipe`
- `GET /match-api/matches`
- `GET /match-api/matches/{id}/profile`
- `GET /match-api/matches/{id}/messages`
- `POST /match-api/matches/{id}/messages`

### API admin - `/admin-api-match`

Publica:

- `POST /admin-api-match/auth/login`

Protegidas con `auth:sanctum` y `match.admin`:

- `POST /admin-api-match/auth/logout`
- `GET /admin-api-match/dashboard/stats`
- `GET /admin-api-match/users`
- `GET /admin-api-match/users/{userId}`
- `POST /admin-api-match/users/{userId}/ban`
- `POST /admin-api-match/users/{userId}/unban`
- `GET /admin-api-match/moderation/photos`
- `POST /admin-api-match/moderation/photos/{photoId}/approve`
- `POST /admin-api-match/moderation/photos/{photoId}/reject`
- `GET /admin-api-match/settings`
- `PUT /admin-api-match/settings`

## Archivos por responsabilidad

### Autenticacion app

- `app/Http/Controllers/Match/MatchAuthController.php`
- `app/Models/Match/MatchUser.php`

Notas:

- `MatchUser` extiende `Authenticatable` y usa `HasApiTokens`.
- El password se hashea por cast: `'password' => 'hashed'`.
- `login` rechaza usuarios con `status` igual a `banned` o `inactive`.
- `login` puede guardar `fcm_token`.

### Perfil y fotos

- `app/Http/Controllers/Match/MatchProfileController.php`
- `app/Models/Match/MatchPhoto.php`
- `database/migrations/*match_photos*`

Revisar aqui para cambios en datos de perfil, subida de fotos, moderacion o respuesta JSON del perfil.

### Discovery y swipes

- `app/Http/Controllers/Match/MatchSwipeController.php`
- `app/Models/Match/MatchSwipe.php`
- `app/Models/Match/MatchPair.php`

Flujo actual:

1. `GET /candidates` excluye al usuario actual.
2. Excluye usuarios ya swiped por el usuario actual.
3. Filtra por `interested_in` si no es `everyone`.
4. Si hay lat/lng, filtra por distancia con Haversine y query param `radius` default `50`.
5. `POST /swipe` crea un registro en `match_swipes`.
6. Si el swipe es `like` o `superlike`, busca reciprocidad.
7. Si hay reciprocidad, crea o recupera `match_pairs` y envia notificaciones.

### Matches y chat

- `app/Http/Controllers/Match/MatchController.php`
- `app/Models/Match/MatchPair.php`
- `app/Models/Match/MatchMessage.php`

Revisar aqui para cambios en listado de matches, perfil del match, historial de mensajes y envio de mensajes.

### Notificaciones

- `app/Models/Match/MatchNotification.php`
- `docs/notificaciones-firebase-expo.md`
- `docs/MATCH_MOBILE_INTEGRATION.md`

El modulo guarda notificaciones en base de datos y usa `fcm_token` para integracion movil.

### Instagram

- `app/Http/Controllers/Match/MatchInstagramController.php`
- `docs/INSTAGRAM_INTEGRATION.md`

Endpoint publico para obtener foto de perfil de Instagram.

### Admin Match

- `app/Http/Controllers/Match/Admin/MatchAdminAuthController.php`
- `app/Http/Controllers/Match/Admin/MatchAdminDashboardController.php`
- `app/Http/Controllers/Match/Admin/MatchAdminUserController.php`
- `app/Http/Controllers/Match/Admin/MatchAdminPhotoModerationController.php`
- `app/Http/Controllers/Match/Admin/MatchAdminSettingsController.php`
- `app/Http/Middleware/EnsureMatchAdmin.php`
- `app/Models/Match/MatchAdmin.php`
- `app/Models/Match/MatchSetting.php`

Credenciales admin actuales:

```txt
Email: admin@gmail.com
Password: 12345678
```

Estas credenciales estan hardcodeadas en `MatchAdmin`. Antes de produccion publica, moverlas a `.env` o a una gestion real de administradores.

## Base de datos

Tablas esperadas:

- `match_users`
- `match_photos`
- `match_swipes`
- `match_pairs`
- `match_messages`
- `match_notifications`
- `match_admins`
- `match_settings`

Migraciones relevantes:

- `2025_12_12_000000_create_match_users_table.php`
- `2025_12_13_000000_add_auth_fields_to_match_users_table.php`
- `2026_05_05_000000_add_location_to_match_users_table.php`
- `2026_05_05_000001_create_match_notifications_table.php`
- `2026_05_06_000000_create_match_admins_table.php`
- `2026_05_06_000001_add_admin_status_fields_to_match_users_table.php`
- `2026_05_06_000002_add_moderation_fields_to_match_photos_table.php`
- `2026_05_06_000003_create_match_settings_table.php`
- `2026_05_07_163554_add_fcm_token_to_match_users_table.php`

## Middleware y config

El alias `match.admin` esta registrado en `bootstrap/app.php`:

```php
'match.admin' => \App\Http\Middleware\EnsureMatchAdmin::class,
```

CSRF esta desactivado globalmente en este proyecto y tambien aparece una excepcion para `match-api/*`.

## Comandos utiles

Instalar dependencias si hace falta:

```bash
composer install
npm ci
```

Migrar:

```bash
php artisan migrate
```

Ejecutar todos los tests Match:

```bash
php artisan test tests/Feature/Match
```

Ejecutar un test concreto:

```bash
php artisan test tests/Feature/Match/MatchFeatureTest.php
php artisan test tests/Feature/Match/MatchAdminApiTest.php
```

Ver rutas Match:

```bash
php artisan route:list --path=match-api
php artisan route:list --path=admin-api-match
```

Formatear PHP:

```bash
./vendor/bin/pint
```

## Checklist antes de tocar el modulo

- Confirmar si el cambio afecta app movil, app admin o ambas.
- Revisar la ruta en `routes/web.php`.
- Revisar controlador y modelo correspondiente en `app/Http/Controllers/Match` y `app/Models/Match`.
- Si cambia estructura de datos, crear migracion nueva; no editar migraciones ya corridas salvo que sea solo entorno local controlado.
- Si cambia una respuesta JSON, revisar docs existentes y actualizar contrato para Expo/React Native.
- Si cambia autenticacion, validar Sanctum y middleware `match.admin`.
- Si cambia fotos, revisar almacenamiento y moderacion.
- Si cambia swipes/matches, agregar o ajustar tests porque es la logica mas sensible.
- Correr tests Match antes de cerrar.

## Cuidados conocidos

- `POST /match-api/profile` esta marcado en rutas como deprecated en favor de `register`, pero aun existe.
- `MatchUser::matches()` devuelve una coleccion ejecutando query directamente, no una relacion Eloquent tradicional.
- El filtro por distancia depende de que el usuario actual tenga `latitude` y `longitude`.
- No mezclar `App\Models\User` con `App\Models\Match\MatchUser`.
- No permitir que tokens de `MatchUser` entren a endpoints admin; para eso existe `EnsureMatchAdmin`.
- El admin hardcodeado es util para integracion inicial, pero es deuda de seguridad.

## Docs existentes para consultar

- `docs/MATCH_MODULE.md`: arquitectura y flujo general del modulo.
- `docs/API_MATCH.md`: endpoints de la API movil.
- `docs/MATCH_MOBILE_INTEGRATION.md`: notas para integracion movil.
- `docs/match_profile_api.md`: endpoints del perfil.
- `docs/INSTAGRAM_INTEGRATION.md`: endpoint de Instagram.
- `docs/notificaciones-firebase-expo.md`: integracion de notificaciones.
- `BACKEND_ENDPOINTS.md`: contrato requerido por la app admin.
- `MATCH_ADMIN_BACKEND_CHANGES.md`: resumen de cambios del backend admin.
