# Estructura del proyecto

Este blog parte de la plantilla oficial de blog de Astro (Astro 7). La plantilla se usa solo como base técnica: su diseño se reemplazará por uno propio.

Este documento describe el proyecto tal como lo deja la plantilla y separa la lógica técnica que conviene conservar del diseño que se va a reemplazar. Cuando termines el rediseño, actualízalo.

## Dos ideas clave

1. **Las rutas salen de los archivos.** Cada archivo dentro de `src/pages/` se convierte en una URL.
2. **Un archivo `.astro` tiene dos partes.**
   - Entre las líneas `---` va código que se ejecuta al generar la página, nunca en el navegador. Esa es la lógica.
   - Debajo van el HTML y el `<style>`, que son el diseño.

   Casi siempre conviene conservar la primera parte y reemplazar la segunda.

## Lógica técnica: conservar

| Archivo | Para qué sirve |
| --- | --- |
| `package.json`, `package-lock.json` | Dependencias y comandos (`dev`, `build`, `preview`). El lock fija las versiones exactas. |
| `astro.config.mjs` | Configuración: URL del sitio, integraciones (MDX, sitemap) y fuentes. Cuando tengas dominio, cambia `site` (en la plantilla es `https://example.com`): de ahí salen las URLs del RSS, del sitemap y las canónicas. |
| `tsconfig.json` | TypeScript en modo strict (extiende `astro/tsconfigs/strict`). |
| `src/content.config.ts` | Define la colección `blog`: dónde están los posts (`src/content/blog/`) y qué campos lleva su frontmatter. `title`, `description` y `pubDate` son obligatorios; `updatedDate` y `heroImage`, opcionales. Si un post no cumple, Astro muestra un error. |
| `src/pages/blog/[...slug].astro` | Crea una página por cada post (`getStaticPaths`) y convierte su Markdown en HTML (`render`). Los corchetes indican una ruta dinámica: cada post obtiene su URL en `/blog/<id-del-post>/`. |
| `src/pages/rss.xml.js` | Genera el feed en `/rss.xml` a partir de la colección `blog`. |
| `src/consts.ts` | Título y descripción del sitio. Los usan el `<head>`, el header y el RSS. Conserva el archivo y cambia los valores. |
| `src/components/FormattedDate.astro` | Formatea las fechas. Por defecto usa `en-us`; si el blog va en español, se cambia aquí. |

## Mixtos: lógica dentro de archivos de diseño

| Archivo | Conservar | Reemplazar |
| --- | --- | --- |
| `src/components/BaseHead.astro` | Metadatos SEO, URL canónica, Open Graph, enlaces a RSS y sitemap | El import de `global.css`, la fuente y la imagen por defecto para redes sociales (`blog-placeholder-1.jpg`) |
| `src/pages/blog/index.astro` | La obtención de los posts (`getCollection`) y el orden por fecha | La maquetación del listado y su `<style>` |
| `src/components/HeaderLink.astro` | El cálculo del enlace activo | Sus estilos |
| `src/layouts/BlogPost.astro` | Las props que recibe del post y el `<slot />`, donde se inserta el contenido | Toda la presentación del post |

## Diseño: reemplazar

- **`src/styles/global.css`:** colores, tipografía y estilos base. Se basa en Bear Blog, con licencia MIT citada en un comentario del archivo; esa atribución deja de aplicar cuando se reemplace.
- **`src/components/Header.astro` y `Footer.astro`:** navegación, íconos sociales de Astro y el texto "Your name here".
- **`src/pages/index.astro` y `about.astro`:** portada y página "About" con texto de ejemplo. "About" usa el mismo layout que los posts, así que cambia cuando se rediseña `BlogPost.astro`.
- **`src/assets/`:** imágenes de ejemplo y la fuente Atkinson. Astro procesa estos archivos al compilar (a diferencia de `public/`).
  - Varios archivos importan estas imágenes: si borras alguna, actualiza esos imports.
  - La fuente se registra en el bloque `fonts` de `astro.config.mjs`.
- **`public/`:** archivos que se sirven tal cual, sin procesar. En la plantilla solo contiene los favicons.

## Otros

- **`src/content/blog/`:** cinco posts de ejemplo. Son contenido, no diseño. `markdown-style-guide.md` sirve para probar el diseño con todos los elementos de Markdown.
- **`docs/`:** documentación del proyecto, como este archivo. Astro no la publica en el sitio.
- **`.vscode/`:** recomienda las extensiones de Astro y MDX y permite iniciar el servidor desde el editor.
- **`README.md`:** el de la plantilla, en inglés. Incluye la tabla de comandos.
- **Carpetas generadas:** `node_modules/`, `.astro/` (tipos que genera Astro) y `dist/` (resultado de `npm run build`). Se crean solas y no se versionan.
