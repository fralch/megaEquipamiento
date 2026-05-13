# Guia para verificar notificaciones en Expo - Modulo Match

Este documento es para el LLM/agente que trabaje en la app React Native Expo. Su objetivo es comprobar que la app esta preparada para recibir notificaciones del backend Match, especialmente cuando una foto de perfil es rechazada por el admin.

## Contrato actual del backend

Backend Laravel:

```txt
Base API app: /match-api
Base API admin: /admin-api-match
```

Cuando el admin rechaza una foto:

```txt
POST /admin-api-match/moderation/photos/{photoId}/reject
Authorization: Bearer <admin_token>
```

Body:

```json
{
  "reason": "La imagen no cumple las normas"
}
```

El backend hace dos cosas:

1. Guarda una notificacion interna en la tabla `match_notifications`.
2. Si el usuario tiene `fcm_token`, intenta enviar push por Firebase Cloud Messaging.

Payload push esperado:

```json
{
  "notification": {
    "title": "Tu foto fue rechazada",
    "body": "Motivo: La imagen no cumple las normas"
  },
  "data": {
    "type": "photo_rejected",
    "photo_id": "123"
  }
}
```

Notificacion interna esperada:

```json
{
  "type": "photo_rejected",
  "title": "Tu foto fue rechazada",
  "content": "Tu foto no fue aprobada. Motivo: La imagen no cumple las normas",
  "data": {
    "photo_id": 123,
    "reason": "La imagen no cumple las normas"
  },
  "is_read": false
}
```

## Punto critico: registrar `fcm_token`

El backend actual guarda `fcm_token` durante login si la app lo envia:

```txt
POST /match-api/login
```

Body minimo:

```json
{
  "email": "user@example.com",
  "password": "secret",
  "fcm_token": "FCM_DEVICE_TOKEN"
}
```

Importante:

- No usar `/match/auth/login`; el prefijo correcto es `/match-api/login`.
- Si la app obtiene o refresca el token despues del login, necesita volver a enviarlo al backend. Actualmente no hay un endpoint dedicado confirmado para actualizar solo `fcm_token`.
- Si el usuario no tiene `fcm_token` en `match_users`, solo vera la notificacion dentro de `/match-api/notifications`; no recibira push del sistema.

## Endpoints que debe consumir la app

Login y registro:

```txt
POST /match-api/register
POST /match-api/login
POST /match-api/logout
GET  /match-api/me
```

Notificaciones internas:

```txt
GET  /match-api/notifications
POST /match-api/notifications/{id}/read
```

Todos los endpoints protegidos usan:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

## Checklist de verificacion en Expo

### 1. Dependencias

Verificar que la app tenga una estrategia clara:

- `expo-notifications` para permisos, canales Android y manejo visual.
- `@react-native-firebase/app` y `@react-native-firebase/messaging` si se usa FCM nativo.
- `expo-dev-client` o build nativo si la app usa React Native Firebase.

Notas:

- React Native Firebase no funciona en Expo Go.
- Para probar FCM real se requiere development build, preview build o production build.

### 2. Configuracion Android

Verificar:

- Existe `google-services.json`.
- El package name de Firebase coincide con `android.package` en `app.json/app.config`.
- El plugin de Firebase esta configurado si se usa React Native Firebase.
- Se hizo `prebuild` o EAS Build despues de agregar Firebase.

Ejemplo esperado en `app.json` o `app.config`:

```json
{
  "expo": {
    "android": {
      "package": "com.tuempresa.tuapp"
    },
    "plugins": [
      "@react-native-firebase/app"
    ]
  }
}
```

### 3. Permisos

Verificar que al iniciar sesion o entrar a la app se pidan permisos:

```ts
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
```

En Android, verificar canal:

```ts
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
});
```

### 4. Obtener token FCM

Verificar que la app obtiene un token real:

```ts
import messaging from '@react-native-firebase/messaging';

const fcmToken = await messaging().getToken();
```

Validar en logs:

```txt
FCM token: <token largo>
```

Si retorna `null`, vacio o falla:

- La build no tiene Firebase nativo.
- Falta `google-services.json`.
- El package name no coincide.
- Se esta probando en Expo Go.

### 5. Enviar token al backend

Verificar que el login envia `fcm_token`:

```ts
await fetch(`${API_URL}/match-api/login`, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
    fcm_token: fcmToken,
  }),
});
```

Despues del login, confirmar en backend que `match_users.fcm_token` quedo guardado para ese usuario.

### 6. Listeners de notificaciones

Verificar tres estados:

Foreground:

```ts
messaging().onMessage(async remoteMessage => {
  console.log('Foreground push:', remoteMessage);
});
```

Background:

```ts
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background push:', remoteMessage);
});
```

Tap/open desde notificacion:

```ts
import * as Notifications from 'expo-notifications';

Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;

  if (data?.type === 'photo_rejected') {
    // Navegar a perfil/fotos/moderacion del usuario
  }
});
```

### 7. Manejo de `photo_rejected`

La app debe reconocer:

```ts
remoteMessage.data?.type === 'photo_rejected'
```

Comportamiento recomendado:

- Mostrar aviso local si la app esta abierta.
- Refrescar lista de fotos/perfil.
- Navegar a la pantalla de perfil o fotos cuando el usuario toca la notificacion.
- Consultar `GET /match-api/notifications` para mostrar el historial interno.
- Marcar como leida con `POST /match-api/notifications/{id}/read` cuando corresponda.

## Prueba manual end-to-end

1. Instalar la app en un dispositivo o emulador con Google Play Services.
2. Iniciar sesion con un usuario Match.
3. Confirmar en logs que se genero `fcmToken`.
4. Confirmar que el login envio `fcm_token` a `/match-api/login`.
5. Confirmar en BD que `match_users.fcm_token` no esta vacio.
6. Subir una foto desde la app.
7. Entrar como admin y rechazar la foto:

```txt
POST /admin-api-match/moderation/photos/{photoId}/reject
```

8. Verificar en BD:

```sql
select * from match_notifications
where match_user_id = <USER_ID>
order by created_at desc;
```

Debe existir una fila con:

```txt
type = photo_rejected
```

9. Verificar en la app:

- Si esta en foreground, debe entrar al listener `onMessage`.
- Si esta en background/cerrada, debe mostrarse o recibirse al tocar.
- `GET /match-api/notifications` debe devolver la notificacion interna.

## Prueba con curl/http

Login con FCM:

```bash
curl -X POST "$API_URL/match-api/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secret",
    "fcm_token": "FCM_DEVICE_TOKEN"
  }'
```

Listar notificaciones internas:

```bash
curl "$API_URL/match-api/notifications" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Accept: application/json"
```

Marcar como leida:

```bash
curl -X POST "$API_URL/match-api/notifications/NOTIFICATION_ID/read" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Accept: application/json"
```

## Fallos comunes

- La app usa `/match/auth/login` en vez de `/match-api/login`.
- El usuario inicia sesion sin enviar `fcm_token`.
- El token FCM cambia y la app no lo vuelve a guardar en backend.
- Se prueba en Expo Go, donde React Native Firebase no funciona.
- El package name no coincide con Firebase.
- Falta `google-services.json`.
- Android no tiene canal de notificaciones.
- La app solo maneja notificaciones en foreground y no maneja background/tap.
- El backend guarda notificacion interna, pero Firebase falla por credenciales o token invalido.

## Resultado esperado

La implementacion se considera funcional si se cumplen estas condiciones:

- El usuario tiene `fcm_token` guardado en `match_users`.
- Al rechazar una foto se crea una fila `photo_rejected` en `match_notifications`.
- El dispositivo recibe el push o al menos el listener registra el mensaje.
- La app reconoce `data.type = photo_rejected`.
- La app muestra/navega a la pantalla correspondiente y puede leer la notificacion interna desde `/match-api/notifications`.
