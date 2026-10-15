# Estructura del proyecto

Este blog parte de la plantilla oficial de blog de Astro (Astro 7). De la plantilla se conservó la lógica; el diseño es propio (la dirección "Cuaderno") y depende del sistema de diseño del portafolio.

Este documento describe la estructura del proyecto. Actualízalo cada vez que cambie.

## Dos ideas clave

1. **Las rutas salen de los archivos.** Cada archivo dentro de `src/pages/` se convierte en una URL.
2. **Un archivo `.astro` tiene dos partes.**
   - Entre las líneas `---` va código que se ejecuta al generar la página, nunca en el navegador. Esa es la lógica.
   - Debajo van el HTML y el `<style>`, que son el diseño.

## Las páginas del sitio

| Dirección | Archivo | Qué muestra |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Todos los posts, con el filtro `All · practice` |
| `/practice/` | `src/pages/practice.astro` | Solo los posts con la etiqueta `practice`. Es la dirección que enlaza el portafolio; el ✕ quita el filtro y lleva a la portada |
| `/<id-del-post>/` | `src/pages/[...slug].astro` | Un post. Cada post tiene una sola dirección |
| `/about/` | `src/pages/about.astro` | La página "About" |
| `/rss.xml` | `src/pages/rss.xml.js` | El feed RSS con todos los posts |

Como los posts van en la raíz, un post no puede llamarse igual que una página (ver `CLAUDE.md`).

## El sistema de diseño

- **Tokens del portafolio:** `BaseHead.astro` carga `https://lenincuadra.com/styles/tokens.css`. De ahí salen los colores en claro y en oscuro, la fuente monoespaciada (DM Mono), los espacios, los radios y las animaciones. El blog no copia esos valores: usa sus variables, así que sigue al portafolio cuando este cambia.
- **Tokens propios (`--notes-*`):** están al inicio de `src/styles/global.css` y se derivan de los del portafolio con `color-mix()`: los puntos de la hoja, el resaltador y la etiqueta verde. Funcionan en los dos temas con un contraste de 4.5:1 o más.
- **Tipografías propias:** Newsreader para la marca ("Notes" en negrita y "by Lenin Cuadra" en light), Shantell Sans para los títulos y las notas al margen, y Literata para el texto.
- **Modo claro y oscuro:** el claro es el predeterminado. El botón del header agrega o quita la clase `theme-dark` (la misma del portafolio) y el navegador del lector recuerda su elección.
- **Favicon:** una N de Newsreader cruzada por un trazo de resaltador, en `public/`. Es lo único con colores escritos, porque un ícono no puede cargar archivos externos.
- **Dentro de un post:** `<mark>` resalta una frase como con un marcador y `<aside>` se muestra como una nota al margen escrita a mano.

## Lógica técnica

| Archivo | Para qué sirve |
| --- | --- |
| `package.json`, `package-lock.json` | Dependencias y comandos (`dev`, `build`, `preview`). El lock fija las versiones exactas. |
| `astro.config.mjs` | Configuración: URL del sitio (`site`, hoy `https://notes.lenincuadra.com`), integraciones (MDX y sitemap) y los temas claro y oscuro de los bloques de código. De `site` salen las URLs del RSS, del sitemap y las canónicas. |
| `tsconfig.json` | TypeScript en modo strict (extiende `astro/tsconfigs/strict`). |
| `src/content.config.ts` | Define la colección `blog`: dónde están los posts (`src/content/blog/`) y qué campos lleva su frontmatter. `title`, `description` y `pubDate` son obligatorios; `updatedDate`, `heroImage` y `tags`, opcionales (`tags` queda como lista vacía si se omite). Si un post no cumple, Astro muestra un error. |
| `src/pages/[...slug].astro` | Crea una página por cada post (`getStaticPaths`) y convierte su Markdown en HTML (`render`). Los corchetes indican una ruta dinámica: cada post obtiene su URL en `/<id-del-post>/`. |
| `src/pages/rss.xml.js` | Genera el feed en `/rss.xml` a partir de la colección `blog`. |
| `src/consts.ts` | El nombre del blog (`SITE_NAME`), el autor (`SITE_AUTHOR`), el título completo y la descripción. Los usan el `<head>`, la marca, el footer y el RSS. |
| `src/components/FormattedDate.astro` | Formatea las fechas. Por defecto usa `en-us`; si el blog va en español, se cambia aquí. |

## Lógica dentro de archivos de diseño

| Archivo | Lógica | Diseño |
| --- | --- | --- |
| `src/components/BaseHead.astro` | Metadatos SEO, URL canónica, Open Graph, RSS, sitemap, la carga de los tokens del portafolio y el script que aplica el tema guardado | Las fuentes, los favicons y la imagen por defecto para redes sociales (`blog-placeholder-1.jpg`) |
| `src/components/Header.astro` | El botón que cambia el tema y guarda la elección | La marca, el favicon dibujado en línea y el menú |
| `src/pages/index.astro` | La obtención de todos los posts (`getCollection`) y el orden por fecha | La estructura de la página |
| `src/pages/practice.astro` | El filtro por la etiqueta `practice` y el orden por fecha | La estructura de la página |
| `src/components/PostList.astro` | El enlace de cada post a `/<id-del-post>/` | La maquetación del listado |
| `src/components/PostFilter.astro` | La lista de filtros, cuál está activo y el ✕ que lo quita | Su apariencia |
| `src/components/HeaderLink.astro` | El cálculo del enlace activo | Su apariencia |
| `src/layouts/BlogPost.astro` | Las props que recibe del post (incluidas las etiquetas) y el `<slot />`, donde se inserta el contenido | La presentación del post |

## Diseño

- **`src/styles/global.css`:** todo el diseño Cuaderno: la hoja con puntos, el header, el listado, el filtro, la lectura del post y el footer. Al inicio están los tokens propios.
- **`src/components/Header.astro` y `Footer.astro`:** la marca con su firma, el menú y el botón de tema; el footer con el aviso de copyright y los enlaces al portafolio y al RSS.
- **`src/pages/about.astro`:** página "About" con el texto de ejemplo de la plantilla. Usa el mismo layout que los posts.
- **`public/`:** los favicons (`favicon.svg`, `favicon-96.png`, `favicon.ico` y `apple-touch-icon.png`).
- **`src/assets/`:** imágenes de la plantilla. `BaseHead.astro` y `about.astro` las importan: si borras alguna, actualiza esos imports. Las imágenes de los posts no van aquí, sino junto a los posts (ver `CLAUDE.md`).

## Otros

- **`src/content/blog/`:** los posts y sus imágenes. Por ahora hay dos posts de prueba: uno personal y otro con la etiqueta `practice`. Es la única carpeta con todos los derechos reservados (ver `LICENSE`).
- **`CLAUDE.md`:** reglas que Claude Code lee al empezar cada sesión: dónde va el contenido, cómo depende el diseño del portafolio, cómo se escriben las fechas y qué nombres no pueden usar los posts.
- **`LICENSE`:** el código está bajo la licencia MIT; el contenido de `src/content/blog/` tiene todos los derechos reservados.
- **`docs/`:** documentación del proyecto, como este archivo. Astro no la publica en el sitio.
- **`.vscode/`:** recomienda las extensiones de Astro y MDX y permite iniciar el servidor desde el editor.
- **`README.md`:** el de la plantilla, en inglés. Incluye la tabla de comandos.
- **Carpetas generadas:** `node_modules/`, `.astro/` (tipos que genera Astro) y `dist/` (resultado de `npm run build`). Se crean solas y no se versionan.
