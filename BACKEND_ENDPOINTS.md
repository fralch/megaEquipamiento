# Endpoints requeridos para APP-ADMIN

Este documento describe los endpoints que necesita la app admin Expo/React Native para reemplazar los datos mock actuales.

## Base URL

```txt
https://megaequipamiento.pe/admin-api-match
```

Todas las rutas siguientes son relativas a esa base URL.

## Autenticacion

La app espera autenticacion por token Bearer:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

El token se guarda localmente en `expo-secure-store`.

## Formato recomendado de error

Para errores `4xx` o `5xx`, devolver JSON:

```json
{
  "message": "Descripcion legible del error",
  "errors": {
    "email": ["El email es obligatorio"]
  }
}
```

`errors` puede omitirse si no hay errores de validacion.

## 1. Login admin

### `POST /auth/login`

Permite iniciar sesion en la app administrativa.

Request:

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

Response `200`:

```json
{
  "token": "plain_or_jwt_token",
  "admin": {
    "id": "1",
    "name": "Admin Principal",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

Errores esperados:

- `401`: credenciales invalidas.
- `422`: campos faltantes o formato invalido.

## 2. Cerrar sesion

### `POST /auth/logout`

Invalida el token actual.

Response `200`:

```json
{
  "message": "Sesion cerrada correctamente"
}
```

## 3. Dashboard

### `GET /dashboard/stats`

Devuelve los contadores usados en la pantalla Dashboard.

Response `200`:

```json
{
  "total_users": 1250,
  "active_matches": 450,
  "pending_reports": 12,
  "pending_photos": 8,
  "banned_users": 3
}
```

Notas:

- `total_users`: total de usuarios registrados.
- `active_matches`: matches activos o vigentes.
- `pending_reports`: reportes pendientes de revision.
- `pending_photos`: fotos pendientes de moderacion.
- `banned_users`: usuarios bloqueados/suspendidos.

## 4. Listado y busqueda de usuarios

### `GET /users`

Lista usuarios para la pantalla Users.

Query params:

```txt
search?: string
status?: active|banned|inactive|all
page?: number
per_page?: number
```

Ejemplo:

```txt
GET /users?search=juan&status=all&page=1&per_page=20
```

Response `200`:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "status": "active",
      "created_at": "2026-05-05T15:00:00Z",
      "last_active_at": "2026-05-05T15:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1250,
    "last_page": 63
  }
}
```

## 5. Detalle de usuario

### `GET /users/{userId}`

Devuelve informacion ampliada para el modal o futura pantalla de detalle.

Response `200`:

```json
{
  "id": "1",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "status": "active",
  "bio": "Texto de perfil",
  "phone": "+51999999999",
  "photos_count": 4,
  "matches_count": 12,
  "reports_count": 0,
  "created_at": "2026-05-05T15:00:00Z",
  "last_active_at": "2026-05-05T15:30:00Z"
}
```

## 6. Banear usuario

### `POST /users/{userId}/ban`

Bloquea o suspende un usuario desde el panel admin.

Request:

```json
{
  "reason": "Incumplimiento de normas",
  "notes": "Detalle interno opcional"
}
```

Response `200`:

```json
{
  "id": "1",
  "status": "banned",
  "banned_at": "2026-05-05T16:00:00Z",
  "message": "Usuario baneado correctamente"
}
```

## 7. Desbanear usuario

### `POST /users/{userId}/unban`

Reactiva un usuario bloqueado.

Response `200`:

```json
{
  "id": "1",
  "status": "active",
  "message": "Usuario reactivado correctamente"
}
```

## 8. Fotos pendientes de moderacion

### `GET /moderation/photos`

Lista fotos pendientes para la pantalla Moderation.

Query params:

```txt
status?: pending|approved|rejected
page?: number
per_page?: number
```

Ejemplo:

```txt
GET /moderation/photos?status=pending&page=1&per_page=20
```

Response `200`:

```json
{
  "data": [
    {
      "id": "1",
      "user_id": "10",
      "user_name": "Juan Perez",
      "url": "https://example.com/photos/1.jpg",
      "status": "pending",
      "created_at": "2026-05-05T15:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 8,
    "last_page": 1
  }
}
```

## 9. Aprobar foto

### `POST /moderation/photos/{photoId}/approve`

Aprueba una foto pendiente.

Response `200`:

```json
{
  "id": "1",
  "status": "approved",
  "moderated_at": "2026-05-05T16:00:00Z",
  "message": "Foto aprobada correctamente"
}
```

## 10. Rechazar foto

### `POST /moderation/photos/{photoId}/reject`

Rechaza una foto pendiente.

Request:

```json
{
  "reason": "Contenido inapropiado"
}
```

Response `200`:

```json
{
  "id": "1",
  "status": "rejected",
  "moderated_at": "2026-05-05T16:00:00Z",
  "message": "Foto rechazada correctamente"
}
```

## 11. Obtener configuracion

### `GET /settings`

Devuelve la configuracion usada por la pantalla Settings.

Response `200`:

```json
{
  "discovery_default_radius_km": 50,
  "daily_swipe_limit": 100,
  "maintenance_mode": false
}
```

## 12. Actualizar configuracion

### `PUT /settings`

Actualiza la configuracion del algoritmo y sistema.

Request:

```json
{
  "discovery_default_radius_km": 50,
  "daily_swipe_limit": 100,
  "maintenance_mode": false
}
```

Response `200`:

```json
{
  "discovery_default_radius_km": 50,
  "daily_swipe_limit": 100,
  "maintenance_mode": false,
  "message": "Configuracion actualizada correctamente"
}
```

Validaciones recomendadas:

- `discovery_default_radius_km`: entero, minimo `1`, maximo segun regla del negocio.
- `daily_swipe_limit`: entero, minimo `1`.
- `maintenance_mode`: booleano.

## Codigos HTTP esperados

- `200`: operacion exitosa.
- `201`: recurso creado, si aplica en endpoints futuros.
- `401`: token ausente, invalido o expirado.
- `403`: admin sin permisos.
- `404`: recurso no encontrado.
- `422`: error de validacion.
- `500`: error interno.

## Prioridad de implementacion

1. `POST /auth/login`
2. `GET /dashboard/stats`
3. `GET /users`
4. `POST /users/{userId}/ban`
5. `GET /moderation/photos`
6. `POST /moderation/photos/{photoId}/approve`
7. `POST /moderation/photos/{photoId}/reject`
8. `GET /settings`
9. `PUT /settings`
10. `POST /auth/logout`
11. `GET /users/{userId}`
12. `POST /users/{userId}/unban`

