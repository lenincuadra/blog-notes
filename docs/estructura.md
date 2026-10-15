# Estructura del proyecto

Este blog parte de la plantilla oficial de blog de Astro (Astro 7). La plantilla se usa solo como base técnica: su diseño se reemplazará por uno propio.

Este documento describe la estructura del proyecto y separa la lógica técnica que conviene conservar del diseño de la plantilla que se va a reemplazar. Actualízalo cada vez que cambie la estructura.

## Dos ideas clave

1. **Las rutas salen de los archivos.** Cada archivo dentro de `src/pages/` se convierte en una URL.
2. **Un archivo `.astro` tiene dos partes.**
   - Entre las líneas `---` va código que se ejecuta al generar la página, nunca en el navegador. Esa es la lógica.
   - Debajo van el HTML y el `<style>`, que son el diseño.

   Casi siempre conviene conservar la primera parte y reemplazar la segunda.

## Las páginas del sitio

| Dirección | Archivo | Qué muestra |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Todos los posts, con el filtro `All · practice` |
| `/practice/` | `src/pages/practice.astro` | Solo los posts con la etiqueta `practice`. Es la dirección que enlaza el portafolio; el ✕ quita el filtro y lleva a la portada |
| `/<id-del-post>/` | `src/pages/[...slug].astro` | Un post. Cada post tiene una sola dirección |
| `/about/` | `src/pages/about.astro` | La página "About" |
| `/rss.xml` | `src/pages/rss.xml.js` | El feed RSS con todos los posts |

Como los posts van en la raíz, un post no puede llamarse igual que una página (ver `CLAUDE.md`).

## Lógica técnica: conservar

| Archivo | Para qué sirve |
| --- | --- |
| `package.json`, `package-lock.json` | Dependencias y comandos (`dev`, `build`, `preview`). El lock fija las versiones exactas. |
| `astro.config.mjs` | Configuración: URL del sitio (`site`, hoy `https://notes.lenincuadra.com`), integraciones (MDX y sitemap). De `site` salen las URLs del RSS, del sitemap y las canónicas. |
| `tsconfig.json` | TypeScript en modo strict (extiende `astro/tsconfigs/strict`). |
| `src/content.config.ts` | Define la colección `blog`: dónde están los posts (`src/content/blog/`) y qué campos lleva su frontmatter. `title`, `description` y `pubDate` son obligatorios; `updatedDate`, `heroImage` y `tags`, opcionales (`tags` queda como lista vacía si se omite). Si un post no cumple, Astro muestra un error. |
| `src/pages/[...slug].astro` | Crea una página por cada post (`getStaticPaths`) y convierte su Markdown en HTML (`render`). Los corchetes indican una ruta dinámica: cada post obtiene su URL en `/<id-del-post>/`. |
| `src/pages/rss.xml.js` | Genera el feed en `/rss.xml` a partir de la colección `blog`. |
| `src/consts.ts` | Título y descripción del sitio. Los usan el `<head>`, el header y el RSS. Conserva el archivo y cambia los valores. |
| `src/components/FormattedDate.astro` | Formatea las fechas. Por defecto usa `en-us`; si el blog va en español, se cambia aquí. |

## Mixtos: lógica dentro de archivos de diseño

| Archivo | Conservar | Reemplazar |
| --- | --- | --- |
| `src/components/BaseHead.astro` | Metadatos SEO, URL canónica, Open Graph, enlaces a RSS y sitemap | El import de `global.css` y la imagen por defecto para redes sociales (`blog-placeholder-1.jpg`) |
| `src/pages/index.astro` | La obtención de todos los posts (`getCollection`) y el orden por fecha | La estructura de la página |
| `src/pages/practice.astro` | El filtro por la etiqueta `practice` y el orden por fecha | La estructura de la página |
| `src/components/PostList.astro` | El enlace de cada post a `/<id-del-post>/` | La maquetación del listado |
| `src/components/PostFilter.astro` | La lista de filtros, cuál está activo y el ✕ que lo quita | Su apariencia |
| `src/components/HeaderLink.astro` | El cálculo del enlace activo | Su apariencia |
| `src/layouts/BlogPost.astro` | Las props que recibe del post y el `<slot />`, donde se inserta el contenido | Toda la presentación del post |

## Diseño: reemplazar

Los estilos de la plantilla ya se borraron. Lo que queda en esta sección es la estructura visual (el HTML) que se va a rediseñar.

- **`src/styles/global.css`:** por ahora, una base mínima: `box-sizing`, imágenes que no se salen de la pantalla y la clase `.sr-only`, que oculta texto a la vista pero lo deja para los lectores de pantalla.
- **`src/components/Header.astro` y `Footer.astro`:** navegación (Home y About), íconos sociales de Astro y el texto "Your name here".
- **`src/pages/about.astro`:** página "About" con texto de ejemplo. Usa el mismo layout que los posts, así que cambia cuando se rediseña `BlogPost.astro`.
- **`src/assets/`:** imágenes de la plantilla. Astro procesa estos archivos al compilar (a diferencia de `public/`).
  - `BaseHead.astro` y `about.astro` importan estas imágenes: si borras alguna, actualiza esos imports.
  - Las imágenes de los posts no van aquí, sino junto a los posts (ver `CLAUDE.md`).
- **`public/`:** archivos que se sirven tal cual, sin procesar. En la plantilla solo contiene los favicons.

## Otros

- **`src/content/blog/`:** los posts y sus imágenes. Por ahora hay dos posts de prueba: uno personal y otro con la etiqueta `practice`. Es la única carpeta con todos los derechos reservados (ver `LICENSE`).
- **`CLAUDE.md`:** reglas que Claude Code lee al empezar cada sesión: dónde va el contenido, cómo se escriben las fechas y qué nombres no pueden usar los posts.
- **`LICENSE`:** el código está bajo la licencia MIT; el contenido de `src/content/blog/` tiene todos los derechos reservados.
- **`docs/`:** documentación del proyecto, como este archivo. Astro no la publica en el sitio.
- **`.vscode/`:** recomienda las extensiones de Astro y MDX y permite iniciar el servidor desde el editor.
- **`README.md`:** el de la plantilla, en inglés. Incluye la tabla de comandos.
- **Carpetas generadas:** `node_modules/`, `.astro/` (tipos que genera Astro) y `dist/` (resultado de `npm run build`). Se crean solas y no se versionan.
