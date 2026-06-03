# Propuestas graficas - Unificacion de catalogos

## Contexto

El proyecto actual es una web Laravel + Inertia + React para Mega Equipamiento / EquinLab. La experiencia vigente se apoya en:

- Header blanco con logo, buscador global y accesos de carrito/comparador.
- Azul corporativo dominante (`#1e3a8a` y `#0c2249`), fondos claros y modo oscuro.
- Home de catalogo con slider grande, bloque editorial de equipos de laboratorio, categorias visuales, marcas y clientes.
- Navegacion de muchas categorias, subcategorias, productos, marcas y productos externos.

El reto no es solo unir dos webs. El reto es que laboratorio, clinico, industrial y medicion convivan sin que la home se vuelva una grilla infinita.

## Criterios de decision

| Criterio | Peso | Que evalua |
|---|---:|---|
| Claridad de entrada | Alto | Si el usuario entiende rapido donde buscar. |
| Escalabilidad | Alto | Si soporta cientos o miles de productos sin saturar. |
| Venta cruzada | Medio | Si permite descubrir lineas relacionadas. |
| Reuso tecnico | Medio | Si se integra con `Categoria`, `Subcategoria`, `Marca`, buscador y comparador actuales. |
| SEO | Medio | Si genera secciones indexables y no es todo contenido oculto. |
| Calidad visual | Alto | Si eleva la marca a una experiencia mas robusta y profesional. |

## Opcion 1 - Home Hub Profesional

**Idea:** convertir la home en un centro de compra B2B. Mantiene el buscador como entrada principal y organiza los rubros en tarjetas grandes con datos, accesos rapidos y marcas destacadas.

**Estructura:**

- Hero compacto con busqueda, CTA a catalogo y CTA a cotizacion.
- Panel lateral de "Comprar por linea": Laboratorio, Medicion industrial, Clinico, Insumos.
- Cards de linea con imagen, conteo de categorias, productos destacados y boton "Explorar".
- Banda de servicios: calibracion, mantenimiento, asesoria, importacion.
- Carruseles cortos de marcas y clientes.

**Fortalezas:**

- Es la opcion mas equilibrada para una marca con catalogo grande.
- Evita que el usuario llegue a una pared de productos.
- Permite cross-selling sin mezclar todo en la misma grilla.
- Reutiliza casi toda la infraestructura actual: buscador, categorias, marcas y comparador.

**Riesgos:**

- Requiere curar los datos iniciales: lineas, categorias principales y productos recomendados.
- Si las cards se llenan demasiado, puede perder elegancia.

**Veredicto:** recomendada como primera iteracion si se quiere una mejora fuerte sin cambiar toda la arquitectura.

## Opcion 2 - Mega Menu Industrial

**Idea:** evolucionar la referencia tipo Alibaba hacia una navegacion B2B: panel lateral de rubros, grid de subcategorias, marcas relacionadas y accesos a ficha tecnica/cotizacion.

**Estructura:**

- Header actual con boton "Todas las categorias".
- Mega menu ancho con 3 zonas:
  - Rubros principales.
  - Subcategorias por rubro.
  - Panel comercial con marcas, documentos y productos destacados.
- En mobile se transforma en drawer por pasos.

**Fortalezas:**

- Muy escalable para catalogos grandes.
- Reduce friccion cuando el usuario ya sabe lo que busca.
- Puede implementarse como mejora del `Menu.jsx` y `NavVertical`.

**Riesgos:**

- No resuelve por si solo la narrativa de la home.
- En mobile necesita un drawer bien cuidado para no sentirse pesado.

**Veredicto:** excelente como componente de navegacion transversal, incluso si se elige otra home.

## Opcion 3 - Catalogo Editorial por Sectores

**Idea:** organizar la web por casos de uso y sectores: laboratorio academico, control de calidad, ambiental, industrial, salud, alimentos. Cada sector muestra categorias y equipos relevantes.

**Estructura:**

- Hero con busqueda por necesidad: "Necesito medir temperatura", "Necesito esterilizar", "Necesito calibrar".
- Selector de sectores.
- Secciones editoriales con equipos recomendados, marcas y servicios asociados.
- Accesos a guias o fichas tecnicas para capturar leads.

**Fortalezas:**

- Diferencia la marca frente a una tienda generica.
- Muy buena para usuarios que no conocen el nombre exacto del producto.
- Aporta contenido SEO por sector y aplicacion.

**Riesgos:**

- Requiere mas trabajo de contenido y clasificacion.
- La compra directa puede quedar un paso mas lejos si no se equilibra con el buscador.

**Veredicto:** fuerte para una segunda fase si el objetivo es posicionamiento y asesoria tecnica.

## Opcion 4 - Marketplace Compacto

**Idea:** una home mas cercana a MercadoLibre/Amazon, con busqueda, categorias top, ofertas, marcas y productos vistos. La diferencia es que se mantiene sobria y B2B.

**Estructura:**

- Barra de busqueda prominente.
- Grid de accesos rapidos por rubro.
- Filas horizontales: "Mas buscados", "Laboratorio", "Medicion", "Marcas oficiales".
- Bloques de confianza: clientes, certificados, servicio tecnico.

**Fortalezas:**

- Patron muy familiar para usuarios finales.
- Bueno para venta cruzada y volumen.
- Facil de iterar con datos reales.

**Riesgos:**

- Puede parecer menos especializado si se carga de promociones.
- Si no hay curaduria, vuelve a sentirse como catalogo infinito.

**Veredicto:** util si el foco comercial es convertir rapido desde productos populares.

## Opcion 5 - Asistente de Compra Tecnica

**Idea:** un flujo guiado para usuarios que no saben que equipo necesitan. Es un modulo dentro de la home, no un reemplazo total.

**Estructura:**

- Preguntas breves: "Que necesitas hacer?", "Rango de medicion", "Norma o aplicacion", "Presupuesto".
- Resultados sugeridos: categorias, productos, marcas y opcion de cotizacion.
- CTA directo a WhatsApp o formulario de cotizacion.

**Fortalezas:**

- Reduce abandono en compras tecnicas.
- Genera leads de mayor calidad.
- Diferencia mucho la experiencia frente a catalogos comunes.

**Riesgos:**

- Necesita reglas de recomendacion y mantenimiento de datos.
- No debe bloquear el acceso directo al catalogo.

**Veredicto:** recomendable como modulo complementario luego de definir la estructura principal.

## Comparativa

| Criterio | Hub Profesional | Mega Menu | Editorial Sectores | Marketplace Compacto | Asistente |
|---|:---:|:---:|:---:|:---:|:---:|
| Claridad inicial | 5 | 4 | 4 | 4 | 5 |
| Escala catalogo grande | 4 | 5 | 4 | 3 | 3 |
| Venta cruzada | 4 | 3 | 5 | 5 | 4 |
| Reuso del proyecto actual | 5 | 5 | 3 | 4 | 2 |
| SEO | 4 | 2 | 5 | 4 | 2 |
| Percepcion premium/B2B | 5 | 4 | 5 | 3 | 4 |
| Complejidad tecnica | Media | Media | Alta | Media | Alta |

## Recomendacion

La ruta mas robusta es combinar:

1. **Opcion 1 - Home Hub Profesional** como nueva home.
2. **Opcion 2 - Mega Menu Industrial** como navegacion permanente.
3. **Opcion 5 - Asistente de Compra Tecnica** como modulo futuro para captura de leads.

Esta combinacion mantiene la identidad actual, mejora la decision de compra y permite integrar medicion industrial sin romper el catalogo existente.

## Archivos del laboratorio

- `index.html`: tablero comparativo con enlaces a cada propuesta.
- `hub/index.html`: home B2B recomendada.
- `mega-menu/index.html`: navegacion de catalogo grande.
- `sectores/index.html`: catalogo editorial por sectores.
- `marketplace/index.html`: home tipo marketplace compacto.
- `asistente/index.html`: asistente de compra tecnica.
- `styles.css`: sistema visual compartido y estilos propios por propuesta.
- `script.js`: interacciones del mega menu, sectores y asistente.

Para visualizar: abrir `design-lab/index.html` y entrar a cada propuesta por separado.
