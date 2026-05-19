# Match App - Notificaciones Push con React Native Expo

Esta guia explica como implementar y probar las notificaciones push de la app de citas hecha con React Native Expo contra el backend de MegaEquipamiento.

## Contexto del Backend

El backend guarda el token del dispositivo en `match_users.fcm_token` y envia notificaciones con Firebase Cloud Messaging usando `FirebaseNotificationService`.

Endpoint de prueba:

```http
GET /match-api/notifications/test-push
Authorization: Bearer {MATCH_APP_TOKEN}
```

Tambien acepta texto personalizado:

```http
GET /match-api/notifications/test-push?title=Prueba&body=Las notificaciones funcionan
Authorization: Bearer {MATCH_APP_TOKEN}
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Notificacion de prueba enviada a los dispositivos registrados.",
  "test_id": "uuid",
  "devices_targeted": 1,
  "sent": 1,
  "failed": 0
}
```

## Punto Importante para Expo

Expo maneja dos tipos de token:

- `getExpoPushTokenAsync`: devuelve un Expo Push Token. Sirve si el backend envia por el servicio push de Expo.
- `getDevicePushTokenAsync`: devuelve el token nativo del dispositivo. En Android es FCM. Este es el que necesita este backend.

Como el backend actual envia directo por Firebase, guarda en `fcm_token` el valor retornado por `Notifications.getDevicePushTokenAsync()`.

## Requisitos

Instala las dependencias en la app Expo:

```bash
npx expo install expo-notifications expo-device
```

Para probar push reales necesitas:

- Un dispositivo fisico. No dependas del emulador para la prueba final.
- Un build de desarrollo o produccion hecho con EAS Build.
- Firebase configurado para Android.
- `FIREBASE_CREDENTIALS` configurado en el backend Laravel.
- El usuario de la app debe estar logueado y tener token Sanctum.

## Configuracion de Expo

Ejemplo de `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ],
    "android": {
      "package": "com.tuempresa.matchapp",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

El archivo `google-services.json` debe corresponder al mismo proyecto Firebase que usa el backend.

## Registrar el Token del Dispositivo

Crea un helper, por ejemplo `src/services/pushNotifications.ts`:

```ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Las notificaciones push reales requieren un dispositivo fisico.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ffffff',
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;

  if (currentPermissions.status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    console.warn('El usuario no concedio permisos de notificaciones.');
    return null;
  }

  const devicePushToken = await Notifications.getDevicePushTokenAsync();

  return devicePushToken.data;
}
```

## Guardar el Token en Laravel

El backend ya permite actualizar `fcm_token` con:

```http
PATCH /match-api/profile
Authorization: Bearer {MATCH_APP_TOKEN}
Content-Type: application/json

{
  "fcm_token": "{TOKEN_NATIVO_DEL_DISPOSITIVO}"
}
```

Ejemplo de cliente API:

```ts
const API_URL = 'https://tu-dominio.com/match-api';

export async function updateMatchProfile(token: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error actualizando perfil: ${response.status}`);
  }

  return response.json();
}
```

Uso despues de login:

```ts
import { registerForPushNotificationsAsync } from './services/pushNotifications';
import { updateMatchProfile } from './services/matchApi';

export async function syncPushToken(authToken: string) {
  const fcmToken = await registerForPushNotificationsAsync();

  if (!fcmToken) {
    return;
  }

  await updateMatchProfile(authToken, { fcm_token: fcmToken });
}
```

Llama `syncPushToken(authToken)` despues de login y tambien al abrir la app si ya existe sesion.

## Probar el Endpoint

1. Instala la app en un dispositivo fisico.
2. Inicia sesion en la app.
3. Acepta permisos de notificaciones.
4. Confirma en base de datos que el usuario tiene `match_users.fcm_token`.
5. Ejecuta:

```bash
curl -X GET "https://tu-dominio.com/match-api/notifications/test-push?title=Test&body=Push funcionando" \
  -H "Authorization: Bearer {MATCH_APP_TOKEN}" \
  -H "Accept: application/json"
```

Si funciona, el dispositivo debe recibir la notificacion y el backend debe responder con `sent > 0`.

## Debug Rapido

Si `devices_targeted` es `0`:

- El usuario no esta guardando `fcm_token`.
- La app esta enviando `null`.
- El usuario rechazo permisos.

Si `sent` es `0` y `failed` es mayor que `0`:

- Revisa `storage/logs/laravel.log`.
- Verifica `FIREBASE_CREDENTIALS`.
- Verifica que `google-services.json` y las credenciales del backend pertenecen al mismo proyecto Firebase.
- Revisa que el token guardado no sea un Expo Push Token. No debe empezar con `ExponentPushToken`.

Si Android no muestra la notificacion:

- Verifica que se haya creado el canal `default`.
- Revisa permisos de notificaciones en ajustes del sistema.
- Prueba con la app en segundo plano y cerrada.

Si iOS no funciona:

- `getDevicePushTokenAsync()` en iOS devuelve un token APNs, no un token FCM.
- Para iOS con el backend actual necesitas integrar FCM en iOS o cambiar el backend para usar Expo Push Service/APNs.
- Para una primera prueba directa con este backend, valida Android primero.

## Checklist de Implementacion

- `expo-notifications` instalado.
- `expo-device` instalado.
- `google-services.json` agregado al proyecto Expo.
- `app.json` tiene `android.googleServicesFile`.
- La app solicita permisos.
- La app obtiene token con `getDevicePushTokenAsync`.
- La app envia ese token a `PATCH /match-api/profile`.
- La tabla `match_users.fcm_token` tiene el token.
- `GET /match-api/notifications/test-push` devuelve `sent > 0`.

## Referencias Oficiales

- Expo Notifications SDK: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo con FCM: https://docs.expo.dev/push-notifications/using-fcm/
- Enviar con FCM/APNs desde Expo: https://docs.expo.dev/push-notifications/sending-notifications-custom/
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
