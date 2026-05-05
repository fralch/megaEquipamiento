# 📱 Guía de Integración: Módulo Match (Nuevas Funcionalidades)

Este documento detalla los nuevos endpoints y cambios en la lógica del backend diseñados para la integración con la App móvil (Android/Kotlin).

---

## 📍 1. Ubicación y Geolocalización

### Actualizar Ubicación (y Token Push)
Es fundamental enviar las coordenadas para que el sistema de búsqueda por cercanía funcione. Se recomienda enviar esto al iniciar sesión o cada vez que la ubicación cambie significativamente.

**Endpoint:** `PATCH /match-api/profile`  
**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
```json
{
  "latitude": -34.6037,
  "longitude": -58.3816,
  "city": "Buenos Aires",
  "fcm_token": "TOKEN_DE_FIREBASE_AQUI"
}
```

### Búsqueda por Cercanía (Discovery)
El endpoint de candidatos ahora calcula automáticamente la distancia si el usuario tiene coordenadas registradas.

**Endpoint:** `GET /match-api/candidates?radius=50`  
*   `radius`: (Opcional) Radio en kilómetros. Por defecto 50.

**Respuesta:**
```json
[
  {
    "id": 10,
    "name": "Valentina",
    "distance": 5.2, // Distancia calculada en KM
    "photos": [...]
  }
]
```

---

## 🔔 2. Sistema de Notificaciones

El backend ahora gestiona un **Historial Circular de 10 notificaciones**. No necesitas borrar notificaciones antiguas, el servidor lo hace solo al llegar la número 11.

### Obtener Notificaciones
Ideal para mostrar en una pantalla de "Actividad" o "Alertas".

**Endpoint:** `GET /match-api/notifications`  
**Headers:** `Authorization: Bearer {token}`

**Respuesta:**
```json
[
  {
    "id": 150,
    "type": "match", // 'match' o 'message'
    "title": "¡Nuevo Match!",
    "content": "Has hecho match con Valentina",
    "data": {
      "match_user_id": 10
    },
    "is_read": false,
    "created_at": "2026-05-05T15:30:00.000000Z"
  }
]
```

### Marcar como Leída
**Endpoint:** `POST /match-api/notifications/{id}/read`  
**Headers:** `Authorization: Bearer {token}`

---

## 🚀 3. Flujos Automáticos (Backend side)

No necesitas llamar a endpoints extra para estas acciones, el servidor las dispara automáticamente:

1.  **Evento Match**: Cuando haces `POST /match-api/swipe` con `type: "like"` y la otra persona también te dio like:
    *   Se crea el Match automáticamente.
    *   Se genera una notificación para TI.
    *   Se genera una notificación para ELLA/ÉL.
2.  **Mensajería**: Cuando haces `POST /match-api/matches/{id}/messages`:
    *   Se guarda el mensaje.
    *   Se genera una notificación automática para el destinatario.

---

## 🛠 4. Resumen de Campos en `MatchUser`

Para tus modelos en Kotlin/Android, asegúrate de incluir estos campos:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `latitude` | Double | Latitud GPS |
| `longitude` | Double | Longitud GPS |
| `city` | String | Nombre de la ciudad |
| `fcm_token` | String | Token de Firebase Cloud Messaging |
| `distance` | Double | (Solo en Candidates) Distancia al usuario |

---

## ⚠️ Notas Técnicas
*   **Aislamiento**: Recuerda que este módulo usa la tabla `match_users`, totalmente independiente de los clientes de MegaEquipamiento.
*   **Auth**: Utiliza Laravel Sanctum. El token se obtiene en `/match-api/login` o `/match-api/register`.
