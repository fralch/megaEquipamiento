# Documentación de Endpoints - Perfil Match

Esta documentación describe los endpoints relacionados con la gestión del perfil de usuario en el módulo Match.

---

## 1. Obtener Perfil del Usuario Actual

Obtiene la información detallada del usuario autenticado, incluyendo sus fotos.

- **URL:** `/match-api/profile`
- **Método:** `GET`
- **Autenticación:** Requerida (Bearer Token)

### Respuesta Exitosa (200 OK)

```json
{
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "age": 28,
    "gender": "male",
    "description": "Me gusta el senderismo y la fotografía.",
    "interested_in": "female",
    "instagram": "juan_perez_ok",
    "whatsapp": "+5491112345678",
    "photos": [
        {
            "id": 10,
            "match_user_id": 1,
            "url": "/storage/match_photos/foto1.jpg",
            "order": 0,
            "created_at": "2024-12-27T10:00:00.000000Z",
            "updated_at": "2024-12-27T10:00:00.000000Z"
        },
        {
            "id": 11,
            "match_user_id": 1,
            "url": "/storage/match_photos/foto2.jpg",
            "order": 1,
            "created_at": "2024-12-27T10:05:00.000000Z",
            "updated_at": "2024-12-27T10:05:00.000000Z"
        }
    ],
    "created_at": "2024-01-15T08:00:00.000000Z",
    "updated_at": "2024-12-27T10:05:00.000000Z"
}
```

### Respuestas de Error

- **401 Unauthorized:** El usuario no ha iniciado sesión o el token es inválido.

---

## 2. Actualizar Perfil

Actualiza la información básica del perfil del usuario (sin incluir fotos).

- **URL:** `/match-api/profile`
- **Método:** `PUT` o `PATCH`
- **Autenticación:** Requerida (Bearer Token)

### Cuerpo de la Petición (JSON)

Todos los campos son opcionales. Envía solo lo que deseas actualizar.

```json
{
    "name": "Juan Actualizado",
    "description": "Nueva descripción actualizada.",
    "age": 29,
    "instagram": "nuevo_insta",
    "whatsapp": "1234567890",
    "interested_in": "female" 
}
```

### Respuesta Exitosa (200 OK)

Devuelve el objeto de usuario actualizado (similar a la respuesta de "Obtener Perfil").

```json
{
    "id": 1,
    "name": "Juan Actualizado",
    "description": "Nueva descripción actualizada.",
    ...
}
```

---

## 3. Subir Foto de Perfil

Sube una nueva foto para el perfil del usuario. Se añade a la lista de fotos existentes.

- **URL:** `/match-api/profile/photo`
- **Método:** `POST`
- **Autenticación:** Requerida (Bearer Token)
- **Content-Type:** `multipart/form-data`

### Parámetros del Formulario (FormData)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `photo` | File | Sí | Archivo de imagen (jpg, png, etc.). Máx 10MB. |

### Respuesta Exitosa (200 OK)

Devuelve el objeto de la foto creada.

```json
{
    "id": 12,
    "match_user_id": 1,
    "url": "/storage/match_photos/nueva_foto_hash.jpg",
    "order": 2,
    "created_at": "2024-12-27T12:00:00.000000Z",
    "updated_at": "2024-12-27T12:00:00.000000Z"
}
```

### Respuestas de Error

- **400 Bad Request:** No se envió ningún archivo.
- **422 Unprocessable Entity:** El archivo no es una imagen válida o excede el tamaño permitido.
