# Guia para LLM: Implementar notificaciones push en React Native Expo

Este documento esta pensado para pasarlo a un LLM/agente que va a trabajar en el proyecto React Native Expo de la app de citas. El objetivo es que implemente el registro del token FCM, lo envie al backend Laravel y deje funcionando la recepcion de notificaciones push.

## Contexto del backend

El backend Laravel ya tiene implementado el envio de notificaciones push con Firebase Cloud Messaging.

La tabla usada por la app de citas es:

```txt
match_users
```

El campo donde debe guardarse el token del dispositivo es:

```txt
match_users.fcm_token
```

La ruta de prueba existente es:

```http
GET /match-api/notifications/test-push
Authorization: Bearer <MATCH_USER_SANCTUM_TOKEN>
Accept: application/json
```

Tambien acepta titulo y mensaje personalizados:

```http
GET /match-api/notifications/test-push?title=Hola&body=Mensaje%20de%20prueba
Authorization: Bearer <MATCH_USER_SANCTUM_TOKEN>
Accept: application/json
```

Si devuelve esto:

```json
{
  "status": "no_devices",
  "message": "No hay dispositivos registrados con fcm_token.",
  "devices_targeted": 0,
  "sent": 0,
  "failed": 0
}
```

significa que la ruta funciona, pero ningun usuario tiene `fcm_token` guardado.

## Objetivo de implementacion en Expo

Implementar en la app React Native Expo lo siguiente:

1. Pedir permisos de notificaciones.
2. Obtener el token nativo del dispositivo con Firebase Cloud Messaging.
3. Enviar ese token al backend como `fcm_token`.
4. Escuchar notificaciones recibidas con la app abierta.
5. Escuchar taps sobre notificaciones.
6. Verificar que `/match-api/notifications/test-push` envie y el dispositivo reciba la notificacion.

## Punto critico: usar FCM token, no Expo Push Token

El backend actual NO usa el servicio push de Expo. Usa Firebase Cloud Messaging directamente.

Por lo tanto, no usar este metodo para guardar el token en el backend:

```ts
Notifications.getExpoPushTokenAsync()
```

Ese metodo devuelve tokens tipo:

```txt
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

Ese token no sirve para este backend.

Usar este metodo:

```ts
Notifications.getDevicePushTokenAsync()
```

En Android devuelve el token FCM nativo que debe enviarse como `fcm_token`.

## Dependencias necesarias

Instalar en el proyecto Expo:

```bash
npx expo install expo-notifications expo-device
```

Si se usa EAS Build, asegurarse de tener configurado Android con Firebase.

## Configuracion requerida en Expo

En `app.json` o `app.config.js`, configurar el package Android y el archivo `google-services.json`.

Ejemplo `app.json`:

```json
{
  "expo": {
    "name": "Match App",
    "slug": "match-app",
    "android": {
      "package": "com.tuempresa.matchapp",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

El `package` debe coincidir con la app Android registrada en Firebase Console.

## Firebase Android

Pasos esperados:

1. Abrir Firebase Console.
2. Crear o seleccionar el proyecto Firebase.
3. Agregar una app Android.
4. Usar el mismo package name de Expo, por ejemplo `com.tuempresa.matchapp`.
5. Descargar `google-services.json`.
6. Colocar `google-services.json` en la raiz del proyecto Expo.
7. Hacer build con EAS o development build. No depender de Expo Go para esta prueba.

## Helper para registrar notificaciones

Crear un archivo similar a:

```txt
src/lib/registerPushNotifications.ts
```

Implementacion sugerida:

```ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerPushNotifications(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Las notificaciones push requieren un dispositivo fisico.');
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (currentPermission.status !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('El usuario no concedio permisos de notificaciones.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const devicePushToken = await Notifications.getDevicePushTokenAsync();

  return devicePushToken.data;
}
```

## Enviar `fcm_token` durante login

El backend ya guarda el `fcm_token` si se envia en el login.

Endpoint:

```http
POST /match-api/login
Accept: application/json
Content-Type: application/json
```

Body esperado:

```json
{
  "email": "usuario@test.com",
  "password": "password",
  "fcm_token": "TOKEN_FCM_DEL_DISPOSITIVO"
}
```

Ejemplo de implementacion:

```ts
import { registerPushNotifications } from '../lib/registerPushNotifications';

const API_URL = 'https://tu-dominio.com';

export async function login(email: string, password: string) {
  let fcmToken: string | null = null;

  try {
    fcmToken = await registerPushNotifications();
  } catch (error) {
    console.warn('No se pudo registrar FCM token:', error);
  }

  const response = await fetch(`${API_URL}/match-api/login`, {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo iniciar sesion');
  }

  return data;
}
```

## Sincronizar token si el usuario ya esta logueado

Si el usuario ya tiene token Sanctum, actualizar el perfil con `fcm_token`.

Endpoint:

```http
PATCH /match-api/profile
Authorization: Bearer <MATCH_USER_SANCTUM_TOKEN>
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "fcm_token": "TOKEN_FCM_DEL_DISPOSITIVO"
}
```

Implementacion sugerida:

```ts
import { registerPushNotifications } from '../lib/registerPushNotifications';

const API_URL = 'https://tu-dominio.com';

export async function syncFcmToken(authToken: string) {
  const fcmToken = await registerPushNotifications();

  const response = await fetch(`${API_URL}/match-api/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fcm_token: fcmToken,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo sincronizar el token FCM');
  }

  return fcmToken;
}
```

Recomendacion para el LLM: llamar `syncFcmToken(authToken)` al iniciar la app cuando exista sesion activa, o inmediatamente despues del login.

## Handler para mostrar notificaciones

Configurar una sola vez, idealmente en el entrypoint de la app.

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

## Hook para escuchar notificaciones

Crear un hook similar a:

```txt
src/hooks/usePushNotificationListeners.ts
```

Implementacion sugerida:

```ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export function usePushNotificationListeners() {
  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notificacion recibida:', notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Usuario abrio la notificacion:', response);

        const data = response.notification.request.content.data;
        console.log('Payload data:', data);

        // Si existe navegacion, usar data.type para decidir pantalla.
        // Ejemplo: photo_rejected, test_notification, match_created, etc.
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
```

Usarlo en el componente raiz:

```tsx
import { usePushNotificationListeners } from './src/hooks/usePushNotificationListeners';

export default function App() {
  usePushNotificationListeners();

  return null;
}
```

Adaptar el `return` al sistema real de navegacion de la app.

## Payload que envia la ruta de prueba

La ruta `/match-api/notifications/test-push` envia un payload parecido a:

```json
{
  "notification": {
    "title": "Prueba de notificaciones",
    "body": "Si ves esto, las notificaciones de la app de citas funcionan."
  },
  "data": {
    "type": "test_notification",
    "test_id": "uuid",
    "sent_at": "2026-05-20T00:00:00+00:00"
  }
}
```

La app debe poder recibir y loguear ese `data.type`.

## Flujo de prueba completo

1. Instalar dependencias de Expo.
2. Configurar Firebase y `google-services.json`.
3. Hacer un development build o build EAS.
4. Abrir la app en dispositivo fisico.
5. Iniciar sesion.
6. Confirmar en logs que `Notifications.getDevicePushTokenAsync()` devuelve un token.
7. Confirmar que el login envia `fcm_token` o que `PATCH /match-api/profile` lo actualiza.
8. Confirmar en la base de datos que `match_users.fcm_token` tiene valor.
9. Ejecutar:

```http
GET /match-api/notifications/test-push?title=Test&body=Push%20desde%20backend
Authorization: Bearer <MATCH_USER_SANCTUM_TOKEN>
Accept: application/json
```

10. Esperar respuesta del backend:

```json
{
  "status": "success",
  "message": "Notificacion de prueba enviada a los dispositivos registrados.",
  "devices_targeted": 1,
  "sent": 1,
  "failed": 0
}
```

11. Verificar que la notificacion aparece en el dispositivo.
12. Verificar que al tocarla se ejecuta `addNotificationResponseReceivedListener`.

## Errores comunes

### La ruta devuelve `no_devices`

El backend no tiene ningun usuario con `fcm_token`.

Revisar que la app envie `fcm_token` en login o en `PATCH /match-api/profile`.

### El token empieza con `ExponentPushToken`

Se esta usando el metodo incorrecto.

No usar:

```ts
Notifications.getExpoPushTokenAsync()
```

Usar:

```ts
Notifications.getDevicePushTokenAsync()
```

### No llegan notificaciones en Expo Go

No usar Expo Go para esta prueba. Usar development build o build EAS con Firebase configurado.

### No llegan notificaciones en emulador

Probar en dispositivo fisico.

### Android no recibe nada aunque el backend dice `sent: 1`

Revisar:

1. `google-services.json` correcto.
2. `android.package` coincide con Firebase.
3. La app fue compilada despues de agregar `google-services.json`.
4. El canal Android `default` existe.
5. El dispositivo tiene permisos de notificacion habilitados.
6. El token guardado en backend corresponde al dispositivo actual.

### Backend devuelve `firebase_unavailable`

El problema esta en Laravel/Firebase, no en Expo.

Revisar la variable de entorno del backend:

```env
FIREBASE_CREDENTIALS=/ruta/al/firebase-service-account.json
```

## Criterio de aceptacion

La implementacion se considera correcta cuando:

1. La app obtiene un token con `Notifications.getDevicePushTokenAsync()`.
2. El token se guarda en `match_users.fcm_token`.
3. `/match-api/notifications/test-push` devuelve `sent: 1` o mas.
4. La notificacion se muestra en el dispositivo.
5. Al tocar la notificacion, la app recibe el evento en `addNotificationResponseReceivedListener`.
