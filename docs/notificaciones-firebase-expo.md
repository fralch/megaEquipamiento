# Configuración de Notificaciones Push con Firebase (React Native Expo)

## Requisitos Previos

1. Proyecto Expo ( Managed o Bare Workflow )
2. Cuenta de Firebase configurada
3. Backend Laravel con Firebase configurado (ya implementado)

---

## Paso 1: Instalar dependencias

```bash
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/messaging
npx expo install expo-notifications
```

## Paso 2: Configurar Firebase en la App

### Opción A: Usando expo prebuild (Recomendado para managed workflow)

1. Agregar en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-firebase/app",
        {
          "googleServicesFile": "./google-services.json"
        }
      ]
    ]
  }
}
```

2. Descargar `google-services.json` desde Firebase Console:
   - Ve a [Firebase Console](https://console.firebase.google.com)
   - Selecciona tu proyecto → Configuración → General
   - Descarga el archivo `google-services.json`
   - Colócalo en la raíz del proyecto

3. Ejecutar prebuild:

```bash
npx expo prebuild
```

### Opción B: Para desarrollo con canales de preview

```bash
npx expo install expo-dev-client
npx expo prebuild --platform android
npx expo run:android
```

---

## Paso 3: Configurar Android en Firebase

1. En Firebase Console → Configuración del proyecto → General
2. Agregar app Android:
   - **Nombre del paquete**: lo encontrarás en `android/app/build.gradle` (default: `com.yourcompany.yourapp`)
   - **SHA-1 del certificado de firma**: opcional para desarrollo

3. Descargar y colocar `google-services.json`

---

## Paso 4: Implementar lógica en la App

### 1. Crear servicio de notificaciones

```typescript
// services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

export async function requestPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function onMessageReceived(message: any) {
  console.log('Notification received:', message);
  // Aquí manejas la notificación cuando llega
}
```

### 2. Configurar listeners

```typescript
// App.tsx o tu componente principal
import { useEffect } from 'react';
import { requestPermission, getFcmToken, onMessageReceived } from './services/notificationService';
import messaging from '@react-native-firebase/messaging';

export default function App() {
  useEffect(() => {
    // Solicitar permisos
    requestPermission();

    // Obtener y guardar FCM token
    getFcmToken().then(token => {
      if (token) {
        // Guardar en tu backend
        saveFcmTokenToBackend(token);
      }
    });

    // Escuchar cuando la app está en foreground
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      onMessageReceived(remoteMessage);
    });

    // Manejar cuando la app se abre desde una notificación
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });

    // Cuando el usuario toca la notificación y la app está cerrada
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      handleNotificationTap(data);
    });

    return unsubscribe;
  }, []);

  return (/* Tu UI */);
}

function handleNotificationTap(data: any) {
  if (data.type === 'photo_rejected') {
    // Navegar a pantalla de perfil o fotos
    navigation.navigate('Profile');
  }
}
```

### 3. Función para guardar token en backend

```typescript
// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveFcmTokenToBackend(token: string) {
  try {
    // Obtener usuario del storage local
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return;

    const { token: authToken } = JSON.parse(userData);

    const response = await fetch(`${API_URL}/match/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        email: JSON.parse(userData).email,
        password: JSON.parse(userData).password, // O usar otro endpoint para actualizar token
        fcm_token: token
      }),
    });

    // O mejor, crear un endpoint específico para actualizar solo el token:
    // POST /match/fcm-token con Authorization Bearer
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}
```

---

## Paso 5: Registrar device token en el backend

### Opción recomendada: Crear endpoint específico

En tu backend Laravel, agregar esta ruta:

```php
// routes/api.php
Route::post('/match/fcm-token', [MatchAuthController::class, 'updateFcmToken'])
    ->middleware('auth:sanctum');
```

En `MatchAuthController`:

```php
public function updateFcmToken(Request $request)
{
    $request->validate([
        'fcm_token' => 'required|string',
    ]);

    $request->user()->forceFill(['fcm_token' => $request->fcm_token])->save();

    return response()->json(['message' => 'FCM token updated']);
}
```

---

## Paso 6: Enviar notificaciones desde la app (para testing)

Crear un endpoint de prueba:

```php
Route::post('/match/test-notification', function () {
    $user = MatchUser::first();
    $firebase = new FirebaseNotificationService();

    if ($user->fcm_token) {
        $firebase->sendToToken(
            $user->fcm_token,
            'Test Notification',
            'Esto es una prueba de notificación',
            ['type' => 'test']
        );
    }

    return response()->json(['success' => true]);
});
```

---

## Resumen del Flujo

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   App Móvil  │         │   Backend   │         │   Firebase  │
│  (Expo/RN)   │         │  (Laravel)  │         │   (FCM)     │
└─────────────┘         └─────────────┘         └─────────────┘
       │                      │                      │
       │  1. Login + FCM      │                      │
       │─────────────────────►│                      │
       │                      │                      │
       │  2. Guardar token    │                      │
       │                      │                      │
       │  3. Admin rechaza    │                      │
       │◄─────────────────────│                      │
       │                      │                      │
       │                      │  4. Enviar push      │
       │                      │─────────────────────►│
       │                      │                      │
       │  5. Notificación     │                      │
       │◄─────────────────────│                      │
```

---

## Troubleshooting

### Error: "Default FirebaseApp is not initialized"
- Asegúrate de que `google-services.json` está en la raíz del proyecto
- Verifica que el nombre del paquete en Firebase coincide con `android/app/build.gradle`

### Error: "Permission denied"
- Verifica que el usuario está autenticado (auth:sanctum middleware)
- Revisa que el token de Sanctum es válido

### No recibe notificaciones
- Verifica que el dispositivo tiene permisos de notificación
- Revisa los logs de Firebase Console →Messaging → Reports
- Verifica que el `fcm_token` está guardado en la base de datos