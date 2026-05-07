# Cambios backend Admin Match

Este documento resume los cambios actuales del worktree para implementar la API administrativa de Match descrita en `BACKEND_ENDPOINTS.md`.

## Estado Git Revisado

Salida relevante de `git status --short` al momento de documentar:

```txt
 M .env.example
 M app/Http/Controllers/Match/MatchAuthController.php
 M app/Models/Match/MatchPhoto.php
 M app/Models/Match/MatchUser.php
 M bootstrap/app.php
 M database/seeders/DatabaseSeeder.php
 M routes/web.php
?? BACKEND_ENDPOINTS.md
?? app/Http/Controllers/Match/Admin/
?? app/Http/Middleware/EnsureMatchAdmin.php
?? app/Models/Match/MatchAdmin.php
?? app/Models/Match/MatchSetting.php
?? database/migrations/2026_05_06_000000_create_match_admins_table.php
?? database/migrations/2026_05_06_000001_add_admin_status_fields_to_match_users_table.php
?? database/migrations/2026_05_06_000002_add_moderation_fields_to_match_photos_table.php
?? database/migrations/2026_05_06_000003_create_match_settings_table.php
?? database/seeders/MatchAdminSeeder.php
?? tests/Feature/Match/MatchAdminApiTest.php
```

## Objetivo

Se agrego una API aislada para la app admin Expo/React Native bajo el prefijo:

```txt
/admin-api-match
```

La API usa autenticacion Bearer Token con Laravel Sanctum y administra usuarios, fotos pendientes, dashboard y configuracion del modulo Match.

## Credenciales Admin Hardcodeadas

Para simplificar la gestion inicial, las credenciales quedaron hardcodeadas en `App\Models\Match\MatchAdmin`:

```txt
Email: admin@gmail.com
Password: 12345678
Role response: super_admin
```

El endpoint `POST /admin-api-match/auth/login` valida esas credenciales directamente. Si el registro no existe en `match_admins`, lo crea o actualiza automaticamente con `updateOrCreate` y emite un token Sanctum.

Importante: esto es util para una primera integracion, pero no deberia mantenerse asi si el panel va a produccion con acceso publico. Lo correcto luego seria moverlo a `.env`, crear admins desde seeder seguro o usar una gestion real de administradores.

## Endpoints Implementados

Rutas registradas bajo `routes/web.php`:

```txt
POST      /admin-api-match/auth/login
POST      /admin-api-match/auth/logout
GET       /admin-api-match/dashboard/stats
GET       /admin-api-match/users
GET       /admin-api-match/users/{userId}
POST      /admin-api-match/users/{userId}/ban
POST      /admin-api-match/users/{userId}/unban
GET       /admin-api-match/moderation/photos
POST      /admin-api-match/moderation/photos/{photoId}/approve
POST      /admin-api-match/moderation/photos/{photoId}/reject
GET       /admin-api-match/settings
PUT       /admin-api-match/settings
```

Todas las rutas excepto login estan protegidas por:

```php
['auth:sanctum', 'match.admin']
```

## Archivos Nuevos

`BACKEND_ENDPOINTS.md`

Documento base con la especificacion requerida por la app admin.

`app/Http/Controllers/Match/Admin/MatchAdminAuthController.php`

Maneja login y logout del admin Match. El login valida las credenciales hardcodeadas, crea/actualiza el admin por defecto y retorna `token` junto con datos del admin.

`app/Http/Controllers/Match/Admin/MatchAdminDashboardController.php`

Devuelve contadores para dashboard: usuarios totales, matches activos, reportes pendientes, fotos pendientes y usuarios baneados.

`app/Http/Controllers/Match/Admin/MatchAdminUserController.php`

Permite listar, buscar, ver detalle, banear y desbanear usuarios Match. Al banear elimina los tokens Sanctum del usuario para cortar acceso inmediato.

`app/Http/Controllers/Match/Admin/MatchAdminPhotoModerationController.php`

Permite listar fotos por estado y aprobar/rechazar fotos. Guarda `status`, `moderated_at`, `moderation_reason` y `moderated_by`.

`app/Http/Controllers/Match/Admin/MatchAdminSettingsController.php`

Permite obtener y actualizar configuracion del modulo Match: radio default, limite diario de swipes y modo mantenimiento.

`app/Http/Middleware/EnsureMatchAdmin.php`

Middleware que verifica que el token autenticado pertenezca a `MatchAdmin`, no a un usuario normal de Match. Tambien rechaza administradores inactivos.

`app/Models/Match/MatchAdmin.php`

Modelo autenticable Sanctum para la tabla `match_admins`. Define las credenciales por defecto y castea password e `is_active`.

`app/Models/Match/MatchSetting.php`

Modelo para `match_settings`. Incluye `current()` para obtener o crear una unica configuracion por defecto.

`database/migrations/2026_05_06_000000_create_match_admins_table.php`

Crea la tabla `match_admins` con nombre, email unico, password, remember token, estado activo y timestamps.

`database/migrations/2026_05_06_000001_add_admin_status_fields_to_match_users_table.php`

Agrega campos administrativos a `match_users`: `status`, `banned_at`, `ban_reason`, `ban_notes` y `last_active_at`.

`database/migrations/2026_05_06_000002_add_moderation_fields_to_match_photos_table.php`

Agrega moderacion a `match_photos`: `status`, `moderated_at`, `moderation_reason` y `moderated_by` relacionado con `match_admins`.

`database/migrations/2026_05_06_000003_create_match_settings_table.php`

Crea `match_settings` con valores iniciales: radio `50`, limite diario `100` y mantenimiento `false`.

`database/seeders/MatchAdminSeeder.php`

Crea o actualiza el admin por defecto usando las constantes de `MatchAdmin`. Elimina otros admins para mantener un unico admin Match.

`tests/Feature/Match/MatchAdminApiTest.php`

Cubre login, rechazo de tokens de usuarios normales, listado y baneo de usuarios, desbaneo, moderacion de fotos, settings y estadisticas.

## Archivos Modificados


Actualmente el codigo usa constantes hardcodeadas, no lee estas variables.

`app/Http/Controllers/Match/MatchAuthController.php`

El login de usuarios Match ahora bloquea acceso si el usuario tiene `status` igual a `banned` o `inactive`. Tambien actualiza `last_active_at` al iniciar sesion correctamente.

`app/Models/Match/MatchPhoto.php`

Agrega cast de `moderated_at` a datetime y relacion `moderator()` hacia `MatchAdmin`.

`app/Models/Match/MatchUser.php`

Agrega casts de `banned_at` y `last_active_at` a datetime. Tambien se aplico formato al arreglo `$fillable`.

`bootstrap/app.php`

Registra el alias de middleware:

```php
'match.admin' => \App\Http\Middleware\EnsureMatchAdmin::class
```

`database/seeders/DatabaseSeeder.php`

Incluye `MatchAdminSeeder::class` para sembrar el admin Match junto con los seeders existentes.

`routes/web.php`

Agrega el grupo de rutas `admin-api-match` con login publico y endpoints protegidos por Sanctum + `match.admin`.

## Flujo De Autenticacion

1. La app hace `POST /admin-api-match/auth/login` con `admin@gmail.com` y `12345678`.
2. El backend valida esas credenciales contra `MatchAdmin::DEFAULT_EMAIL` y `MatchAdmin::DEFAULT_PASSWORD`.
3. Si son validas, se crea o actualiza el admin en `match_admins`.
4. Se emite un token Sanctum con `createToken('admin-api-match')`.
5. La app debe enviar el token en `Authorization: Bearer <token>` para los demas endpoints.
6. El middleware `match.admin` impide usar tokens de usuarios Match normales en endpoints admin.

## Modelo De Datos Agregado

Tabla `match_admins`:

```txt
id, name, email, password, remember_token, is_active, created_at, updated_at
```

Campos agregados a `match_users`:

```txt
status, banned_at, ban_reason, ban_notes, last_active_at
```

Campos agregados a `match_photos`:

```txt
status, moderated_at, moderation_reason, moderated_by
```

Tabla `match_settings`:

```txt
id, discovery_default_radius_km, daily_swipe_limit, maintenance_mode, created_at, updated_at
```

## Comandos Necesarios

Aplicar migraciones:

```bash
php artisan migrate
```

Crear o actualizar el admin hardcodeado:

```bash
php artisan db:seed --class=MatchAdminSeeder
```

Si se usa `DatabaseSeeder`, tambien se ejecuta `MatchAdminSeeder`:

```bash
php artisan db:seed
```

Ver rutas admin Match:

```bash
php artisan route:list --path=admin-api-match
```

Ejecutar pruebas relacionadas:

```bash
php artisan test --filter MatchAdminApiTest
```

## Verificacion Realizada

Se ejecuto:

```bash
php artisan route:list --path=admin-api-match
php artisan test --filter MatchAdminApiTest
```

Resultado de pruebas:

```txt
Tests: 6 passed (31 assertions)
```

Durante las pruebas aparecen warnings de PHPUnit sobre metadata en doc-comments de `PdfCotizacionViewTest`; no estan relacionados con la API admin Match.

## Consideraciones Pendientes

Las credenciales estan hardcodeadas por decision de simplicidad. Antes de produccion conviene moverlas a configuracion segura.

`pending_reports` devuelve `0` porque todavia no existe una entidad de reportes Match implementada.

`active_matches` cuenta todos los registros de `match_pairs`; no filtra por expiracion o estado porque actualmente esa tabla no tiene un campo de vigencia.

`MatchAdminSeeder` elimina otros administradores Match, por lo que esta pensado para un unico admin hardcodeado.
