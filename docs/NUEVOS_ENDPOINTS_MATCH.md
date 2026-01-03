# Documentación de Nuevos Endpoints de Match

Este documento detalla las actualizaciones y nuevos endpoints implementados para la gestión de Matches y visualización de perfiles.

## 1. Obtener Mis Matches (Actualizado)

Se ha actualizado la respuesta para incluir la URL de la foto principal directamente en el objeto del perfil, facilitando su visualización en listas.

*   **URL:** `/match-api/matches`
*   **Método:** `GET`
*   **Requiere Autenticación:** Sí (Token Bearer)

### Respuesta Exitosa (200 OK)

Devuelve un array de objetos "MatchPair". Cada par incluye:
*   `other_profile`: El objeto del usuario con el que se hizo match.
    *   **`photo`**: (Nuevo) URL de la primera foto del usuario (o `null`).
    *   `photos`: Array completo de fotos.
    *   Otros datos: `name`, `age`, `gender`, etc.
*   `messages`: Último mensaje intercambiado (si existe).

**Ejemplo de Respuesta:**
```json
[
  {
    "id": 1,
    "user_1_id": 10,
    "user_2_id": 25,
    "created_at": "2023-10-27T10:00:00.000000Z",
    "updated_at": "2023-10-27T10:00:00.000000Z",
    "other_profile": {
      "id": 25,
      "name": "Ana",
      "age": 24,
      "gender": "female",
      "photo": "/storage/match_photos/ana_main.jpg", // <--- Nuevo campo accesible directamente
      "photos": [
        { "id": 5, "url": "/storage/match_photos/ana_main.jpg", "order": 0 },
        { "id": 6, "url": "/storage/match_photos/ana_beach.jpg", "order": 1 }
      ]
    },
    "messages": [ ... ]
  }
]
```

---

## 2. Ver Detalle de Perfil Matcheado (Nuevo)

Permite obtener la información completa de un usuario específico con el que ya se tiene un Match, incluyendo todas sus fotos y detalles. Ideal para una vista de "Detalle de Match".

*   **URL:** `/match-api/matches/{id}/profile`
*   **Método:** `GET`
*   **Parámetros de URL:**
    *   `id`: El ID del Match (`match_pair_id`), NO el ID del usuario.
*   **Requiere Autenticación:** Sí (Token Bearer)

### Validaciones
*   Verifica que el usuario autenticado sea parte del Match especificado. Si no lo es, retorna `403 Unauthorized`.

### Respuesta Exitosa (200 OK)

Devuelve el objeto `MatchUser` completo de la otra persona.

**Ejemplo de Respuesta:**
```json
{
  "id": 25,
  "name": "Ana",
  "email": "ana@example.com",
  "age": 24,
  "gender": "female",
  "description": "Me encanta viajar y la fotografía.",
  "interested_in": "male",
  "instagram": "@ana_travels",
  "whatsapp": "+5491122334455",
  "created_at": "2023-09-15T14:30:00.000000Z",
  "updated_at": "2023-10-01T09:15:00.000000Z",
  "photos": [
    {
      "id": 5,
      "match_user_id": 25,
      "url": "/storage/match_photos/ana_main.jpg",
      "order": 0,
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": 6,
      "match_user_id": 25,
      "url": "/storage/match_photos/ana_beach.jpg",
      "order": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```
