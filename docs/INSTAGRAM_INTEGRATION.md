# Integración con Instagram (API Match)

Este documento describe el endpoint para la obtención de información pública de Instagram, específicamente la foto de perfil.

## **Endpoints**

### **1. Obtener Foto de Perfil**
Obtiene la URL pública de la foto de perfil de un usuario de Instagram. Este endpoint realiza un "scraping" ligero de la página pública del perfil para extraer la imagen definida en los metadatos (`og:image`) o en el JSON incrustado.

- **URL:** `/match-api/instagram/profile-picture`
- **Método:** `GET`
- **Autenticación:** No requerida (Público) / Opcional (Dependiendo de la configuración de rutas, actualmente accesible públicamente).

#### **Parámetros (Query String)**

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `username` | `string` | Sí | El nombre de usuario de Instagram (sin @). |

#### **Ejemplo de Petición**

```http
GET /match-api/instagram/profile-picture?username=fralch HTTP/1.1
Host: tu-dominio.com
Accept: application/json
```

#### **Respuestas**

**Exitosa (200 OK)**

Retorna el nombre de usuario y la URL de la imagen encontrada.

```json
{
  "username": "fralch",
  "profile_picture_url": "https://scontent-mxp1-1.cdninstagram.com/v/t51.2885-19/..."
}
```

**No Encontrado (404 Not Found)**

Si el perfil no existe, es privado (y no muestra imagen pública accesible) o la estructura de Instagram ha cambiado y no se pudo detectar la imagen.

```json
{
  "message": "Profile picture not found. The profile might be private or Instagram structure changed.",
  "username": "usuario_inexistente"
}
```

**Error de Validación (422 Unprocessable Entity)**

Si falta el parámetro `username`.

```json
{
    "message": "The username field is required.",
    "errors": {
        "username": [
            "The username field is required."
        ]
    }
}
```

**Error del Servidor (500 Internal Server Error)**

Si ocurre una excepción al intentar conectar con Instagram.

```json
{
  "message": "An error occurred while fetching the profile picture.",
  "error": "Mensaje detallado del error..."
}
```

---

## **Notas de Implementación**

- **User-Agent:** El controlador utiliza un User-Agent de dispositivo móvil (iPhone) para simular una navegación legítima y evitar bloqueos o redirecciones al login de Instagram.
- **Método de Extracción:**
    1. Busca la etiqueta meta `<meta property="og:image" ...>`.
    2. Si falla, busca la clave `"profile_pic_url"` dentro de los scripts JSON incrustados en el HTML.
- **Limitaciones:** Instagram aplica límites de velocidad (Rate Limiting) y bloqueos agresivos a IPs de servidores. Este endpoint debe usarse con moderación o cachear los resultados para evitar ser bloqueado.
