# Documentación de API Match

Esta documentación describe los endpoints disponibles en la API de Match para la aplicación **MegaEquipamiento**. Todas las rutas tienen el prefijo `/match-api`.

## **Autenticación**

La API utiliza **Laravel Sanctum** para la autenticación. Los endpoints públicos son `register` y `login`, los cuales devuelven un token que debe ser enviado en el header de las peticiones protegidas.

**Header Requerido:**
`Authorization: Bearer {tu_token}`

---

## **Endpoints Públicos**

### **1. Registro de Usuario**
Crea una nueva cuenta de usuario para el módulo de Match.

- **URL:** `/match-api/register`
- **Método:** `POST`
- **Cuerpo (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "age": 25,
  "gender": "male",
  "interested_in": "female",
  "description": "Me gusta la tecnología y el deporte.",
  "instagram": "@juan_perez",
  "whatsapp": "+541122334455"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "user": { ... },
  "token": "1|abcdef..."
}
```

### **2. Inicio de Sesión**
Obtiene un token de acceso para un usuario existente.

- **URL:** `/match-api/login`
- **Método:** `POST`
- **Cuerpo (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "user": { ... },
  "token": "2|ghijk..."
}
```

---

## **Endpoints Protegidos (Requieren Token)**

### **3. Cerrar Sesión**
Revoca el token actual del usuario.

- **URL:** `/match-api/logout`
- **Método:** `POST`

### **4. Obtener Mi Perfil**
Devuelve la información completa del usuario autenticado.

- **URL:** `/match-api/me`
- **Método:** `GET`

### **5. Ver Perfil Detallado**
Obtiene los datos del perfil incluyendo las fotos asociadas.

- **URL:** `/match-api/profile`
- **Método:** `GET`

### **6. Actualizar Perfil**
Actualiza los datos del perfil del usuario.

- **URL:** `/match-api/profile`
- **Método:** `PUT` / `PATCH`
- **Cuerpo (JSON):** (Cualquier campo del registro es opcional)
```json
{
  "description": "Nueva descripción actualizada.",
  "interested_in": "everyone"
}
```

### **7. Subir Foto de Perfil**
Sube una imagen para la galería del usuario.

- **URL:** `/match-api/profile/photo`
- **Método:** `POST`
- **Cuerpo (Multipart/Form-Data):**
  - `photo`: (Archivo de imagen, máx 10MB)

---

## **Interacción (Swipe)**

### **8. Obtener Candidatos**
Obtiene una lista de perfiles sugeridos basados en las preferencias del usuario (género de interés) y que aún no han sido calificados (like/dislike).

- **URL:** `/match-api/candidates`
- **Método:** `GET`
- **Respuesta:** Array de perfiles con sus fotos.

### **9. Realizar Swipe (Like/Dislike)**
Registra una acción sobre otro perfil. Si ambos usuarios se dan "like", se genera un "Match".

- **URL:** `/match-api/swipe`
- **Método:** `POST`
- **Cuerpo (JSON):**
```json
{
  "swiped_profile_id": 15,
  "type": "like" 
}
```
*Tipos permitidos: `like`, `dislike`, `superlike`*

- **Respuesta Exitosa:**
```json
{
  "status": "success",
  "match": true 
}
```

---

## **Matches y Mensajería**

### **10. Listar Mis Matches**
Obtiene la lista de conexiones (matches) confirmadas, incluyendo el perfil de la otra persona y el último mensaje enviado/recibido.

- **URL:** `/match-api/matches`
- **Método:** `GET`

### **11. Obtener Mensajes de un Match**
Recupera el historial de chat con un match específico.

- **URL:** `/match-api/matches/{id}/messages`
- **Método:** `GET`

### **12. Enviar Mensaje**
Envía un nuevo mensaje de texto a un match.

- **URL:** `/match-api/matches/{id}/messages`
- **Método:** `POST`
- **Cuerpo (JSON):**
```json
{
  "content": "¡Hola! ¿Cómo estás?"
}
```
