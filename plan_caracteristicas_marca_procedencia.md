# Plan: Inclusión de Marca y Procedencia en Características del Producto

## Contexto

En los archivos CSV de importación de productos, los campos **Marca** y **País** (Procedencia) tienen sus propias columnas dedicadas al final del CSV:

| Columna | Uso |
|---|---|
| `Marca` (col. 27) | Valor de marca para filtros y relaciones en BD |
| `País` (col. 28) | País de procedencia para filtros y relaciones en BD |

Sin embargo, estos mismos datos **también se incluyen** dentro de las columnas de características visibles al usuario:

| Columna | Nombre | Valor |
|---|---|---|
| `Característica 4 nombre` | Marca | MEGABRAS |
| `Característica 4 valor(s)` | — | MEGABRAS |
| `Característica 5 nombre` | Procedencia | Brasil |
| `Característica 5 valor(s)` | — | Brasil |

> [!IMPORTANT]
> Esta duplicación es **intencional** y debe mantenerse en todos los CSVs de productos.

---

## ¿Por qué se duplican?

Las columnas `Marca` y `País` del CSV se usan internamente para:
- Asociar el producto a la entidad `Marca` en base de datos
- Asociar el producto al país de procedencia
- Permitir filtros por marca y país en el catálogo

Las **Características 4 y 5** se usan para:
- Mostrar "Marca" y "Procedencia" como atributos visibles en la **ficha del producto** en el frontend
- El usuario final las ve junto a las demás características técnicas (Resistencia, Resolución, Precisión, etc.)

Si no se incluyen en las características, el usuario no vería la marca ni la procedencia en la sección de características de la página del producto.

---

## Regla para la creación de CSVs

### Siempre incluir Marca y Procedencia en las características

Al crear o editar un CSV de productos, se deben seguir estas reglas:

### 1. Posición fija en características

| Campo | Columna nombre | Columna valor |
|---|---|---|
| Marca | `Característica 4 nombre` → `"Marca"` | `Característica 4 valor(s)` → valor de la marca (ej. `MEGABRAS`) |
| Procedencia | `Característica 5 nombre` → `"Procedencia"` | `Característica 5 valor(s)` → país de origen (ej. `Brasil`) |

> [!NOTE]
> Las posiciones 4 y 5 son las recomendadas, pero si un producto tiene más de 3 características técnicas propias, Marca y Procedencia pueden ocupar las posiciones 5 y 6, o las últimas disponibles. Lo importante es que **siempre estén presentes**.

### 2. Consistencia con las columnas finales

Los valores deben coincidir exactamente:

```
Característica 4 valor(s)  ==  Marca   (col. 27)
Característica 5 valor(s)  ==  País    (col. 28)
```

### 3. Ejemplo de una fila correcta (columnas relevantes)

```csv
...,Marca,MEGABRAS,Procedencia,Brasil,...,MEGABRAS,Brasil
     ↑                                       ↑
     Característica 4                        Columna Marca (col. 27)
```

---

## Estructura completa de columnas del CSV

Para referencia del equipo, esta es la estructura completa de las 28 columnas:

| # | Columna | Tipo | Notas |
|---|---|---|---|
| 1 | `SKU` | Texto | Código único del producto |
| 2 | `Nombre` | Texto | Nombre completo incluyendo modelo y marca |
| 3 | `Precio Base` | Número | Puede estar vacío |
| 4 | `% Ganancia` | Número | Puede estar vacío |
| 5 | `Video YouTube` | URL | Enlace al video del producto |
| 6 | `Descripción` | HTML multilínea | Descripción completa con etiquetas `<p>`, `<br>` |
| 7 | `Característica 1 nombre` | Texto | Ej: "Resistencia" |
| 8 | `Característica 1 valor(s)` | Texto | Ej: "0,1 µΩ a 1 Ω" |
| 9 | `Característica 2 nombre` | Texto | Ej: "Resolución" |
| 10 | `Característica 2 valor(s)` | Texto | Ej: "0,1 µΩ" |
| 11 | `Característica 3 nombre` | Texto | Ej: "Precisión" |
| 12 | `Característica 3 valor(s)` | Texto | Ej: "±1 %" |
| 13 | `Característica 4 nombre` | Texto | **⚠️ Siempre "Marca"** |
| 14 | `Característica 4 valor(s)` | Texto | **⚠️ Mismo valor que col. 27** |
| 15 | `Característica 5 nombre` | Texto | **⚠️ Siempre "Procedencia"** |
| 16 | `Característica 5 valor(s)` | Texto | **⚠️ Mismo valor que col. 28** |
| 17 | `Característica 6 nombre` | Texto | Opcional, característica adicional |
| 18 | `Característica 6 valor(s)` | Texto | Opcional |
| 19 | `Especificaciones Técnicas` | HTML multilínea | Tabla `<table>` con specs detalladas |
| 20 | `Manual` | URL | Enlace al manual del fabricante |
| 21 | `Ficha técnica` | URL | Enlace a la ficha técnica PDF |
| 22 | `Certificados` | URL/Texto | Puede estar vacío |
| 23 | `Contenido de Envío` | Texto multilínea | Lista de ítems incluidos |
| 24 | `Soporte Técnico` | HTML multilínea | Garantía, servicios, etc. |
| 25 | `Categorías` | Texto | Ej: "INSTRUMENTOS DE MEDIDA" |
| 26 | `SubCategorías` | Texto | Ej: "Medidores de Resistencia" |
| 27 | `Marca` | Texto | **Valor de marca para la BD** |
| 28 | `País` | Texto | **País de procedencia para la BD** |

---

## Checklist para validar un CSV antes de importar

- [ ] Las columnas `Característica 4 nombre` y `Característica 5 nombre` contienen "Marca" y "Procedencia" respectivamente
- [ ] Los valores de `Característica 4 valor(s)` y `Característica 5 valor(s)` coinciden exactamente con las columnas `Marca` y `País`
- [ ] Si el producto tiene más de 3 características técnicas, Marca y Procedencia se desplazan a las posiciones siguientes disponibles pero siguen presentes
- [ ] Ningún producto tiene las columnas de características de Marca/Procedencia vacías

> [!WARNING]
> Si se omiten Marca y Procedencia de las características, el producto se importará correctamente en la BD pero **no mostrará** estos datos en la ficha visible del producto en el frontend.
