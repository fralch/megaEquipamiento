# Documentación del Módulo Match (MegaEquipamiento)

Este documento detalla la arquitectura, flujos de datos y endpoints de la API para el módulo "Match" (estilo Tinder), el cual funciona como un sistema aislado dentro del backend de MegaEquipamiento.

## 📋 Descripción General

El módulo Match permite a usuarios independientes (separados de la autenticación principal de MegaEquipamiento) crear perfiles, subir fotos, ver candidatos basados en preferencias, realizar acciones de "swipe" (like/dislike) y chatear en tiempo real (vía API) con sus "Matches".

### Características Principales
*   **Usuarios Independientes**: Tabla `match_users` separada de `users`.
*   **Gestión de Perfiles**: Nombre, edad, género, descripción, intereses, fotos.
*   **Sistema de Match**: Lógica de "Double Opt-in" (el match ocurre solo si ambas partes se dan like).
*   **Algoritmo de Candidatos**: Filtra por género de interés, excluye usuarios ya vistos (swiped) y el propio perfil.
*   **Mensajería Privada**: Solo permitida entre usuarios que han hecho Match.

---

## 🗄️ Esquema de Base de Datos

El módulo utiliza un conjunto de tablas con prefijo `match_` para mantener el aislamiento.

### 1. Usuarios (`match_users`)
Almacena la información del perfil del usuario.
*   `id`: PK
*   `name`, `age`, `gender`: Datos demográficos.
*   `interested_in`: Preferencia de género ('male', 'female', 'everyone', etc).
*   `description`: Biografía.
*   `instagram`, `whatsapp`: Contacto (opcional).

### 2. Fotos (`match_photos`)
Galería de fotos del usuario.
*   `url`: Ruta de almacenamiento (pública).
*   `order`: Orden de visualización.

### 3. Swipes (`match_swipes`)
Registro de interacciones.
*   `swiper_id`: Quien hace la acción.
*   `swiped_id`: A quien se le hace la acción.
*   `type`: 'like', 'dislike', 'superlike'.
*   *Restricción*: Unique constraint en `[swiper_id, swiped_id]` para evitar duplicados.

### 4. Matches (`match_pairs`)
Representa una conexión exitosa (Match) entre dos usuarios.
*   `user_1_id`: ID del primer usuario (menor).
*   `user_2_id`: ID del segundo usuario (mayor).
*   *Nota*: Se genera automáticamente cuando se detecta reciprocidad.

### 5. Mensajes (`match_messages`)
Chat entre pares.
*   `match_pair_id`: Referencia a la conexión.
*   `sender_id`: Autor del mensaje.
*   `content`: Texto del mensaje.
*   `is_read`: Estado de lectura.

---

## 🔌 API Endpoints

**Base URL**: `/match-api`
**Autenticación**: Dado que es un módulo aislado para una app externa, actualmente se maneja pasando `?user_id={id}` en los requests (simulando autenticación stateless simple para el MVP).

### 👤 Perfil (`/profile`)

#### Obtener Perfil Actual
*   **GET** `/profile?user_id={id}`
*   Retorna: Objeto `User` con relaciones `photos`.

#### Crear Perfil
*   **POST** `/profile`
*   Body:
    ```json
    {
      "name": "Juan",
      "age": 25,
      "gender": "male",
      "interested_in": "female",
      "description": "Hola...",
      "instagram": "@juan",
      "whatsapp": "+54..."
    }
    ```

#### Actualizar Perfil
*   **PATCH** `/profile?user_id={id}`
*   Body: Campos a actualizar.

#### Subir Foto
*   **POST** `/profile/photo?user_id={id}`
*   Body (Multipart):
    *   `photo`: Archivo de imagen.

---

### 🔥 Discovery & Swipes

#### Obtener Candidatos
*   **GET** `/candidates?user_id={id}`
*   **Lógica**:
    1.  Excluye al propio usuario.
    2.  Filtra por `interested_in` del usuario actual.
    3.  **Excluye** usuarios que ya han sido `swiped` (vistos) por el usuario actual.
    4.  Orden aleatorio.

#### Realizar Swipe (Acción)
*   **POST** `/swipe?user_id={id}`
*   Body:
    ```json
    {
      "swiped_profile_id": 15,
      "type": "like" // 'like', 'dislike', 'superlike'
    }
    ```
*   **Respuesta**:
    ```json
    {
      "status": "success",
      "match": true // true si se generó un match en este momento
    }
    ```
*   **Lógica Interna**:
    *   Registra el swipe en `match_swipes`.
    *   Si `type` es 'like', verifica si el otro usuario YA le dio like al usuario actual.
    *   Si hay reciprocidad -> Crea registro en `match_pairs`.

---

### 💬 Matches & Chat

#### Listar Matches
*   **GET** `/matches?user_id={id}`
*   Retorna lista de pares donde el usuario es integrante, incluyendo el perfil del "otro" usuario (`other_profile`) y el último mensaje.

#### Obtener Mensajes
*   **GET** `/matches/{match_id}/messages?user_id={id}`
*   Retorna historial de chat ordenado cronológicamente.

#### Probar Notificaciones Push
*   **GET** `/notifications/test-push`
*   Requiere autenticación Sanctum como usuario de la app de citas.
*   Dispara una notificación FCM de prueba a todos los dispositivos con `fcm_token` registrado en `match_users`.
*   Query params opcionales:
    *   `title`: Título de la notificación.
    *   `body`: Cuerpo de la notificación.
*   Respuesta:
    ```json
    {
      "status": "success",
      "test_id": "uuid",
      "devices_targeted": 3,
      "sent": 3,
      "failed": 0
    }
    ```

#### Enviar Mensaje
*   **POST** `/matches/{match_id}/messages?user_id={id}`
*   Body:
    ```json
    {
      "content": "Hola, ¿cómo estás?"
    }
    ```

---

## 🧪 Testing

Se ha creado un suite de pruebas dedicado y aislado para este módulo.

**Importante**: Las pruebas manejan su propia migración de tablas en memoria (SQLite) para no afectar la base de datos de desarrollo principal.

Para ejecutar los tests del módulo Match:

```bash
php artisan test tests/Feature/Match/MatchFeatureTest.php
```

### Cobertura de Tests
1.  `can_create_match_profile`: Verifica inserción en DB.
2.  `can_update_profile`: Verifica PATCH.
3.  `can_upload_photo`: Verifica carga de archivos y Storage Mock.
4.  `get_candidates_filters_correctly`: Valida lógica de exclusión de swiped y filtro de género.
5.  `swipe_creates_match_if_reciprocal`: Simula el escenario de Match.
6.  `swipe_no_match_if_not_reciprocal`: Simula like unilateral (sin Match).
7.  `messaging_flow`: Verifica envío y recuperación de mensajes en un par válido.

---

## 📂 Estructura de Archivos

*   **Controllers**: `app/Http/Controllers/Match/`
*   **Models**: `app/Models/Match/`
*   **Migration**: `database/migrations/2025_12_12_000000_create_match_users_table.php`
*   **Tests**: `tests/Feature/Match/MatchFeatureTest.php`
*   **Rutas**: `routes/web.php` (Grupo `match-api`)
