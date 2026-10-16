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
| `/` | `src/pages/index.astro` | Todos los posts (View All). Es adonde llega quien entra por su cuenta. Arriba está el filtro `View All · Personal · Practice` |
| `/personal/` | `src/pages/personal.astro` | Solo los posts personales, es decir, los que no tienen la etiqueta `practice` |
| `/practice/` | `src/pages/practice.astro` | Solo los posts con la etiqueta `practice`. Es la dirección que enlaza el portafolio |
| `/<id-del-post>/` | `src/pages/[...slug].astro` | Un post. Cada post tiene una sola dirección |
| `/about/` | `src/pages/about.astro` | La página "About" |
| `/rss.xml` | `src/pages/rss.xml.js` | El feed RSS con todos los posts |

Como los posts van en la raíz, un post no puede llamarse igual que una página (ver `CLAUDE.md`).

## El sistema de diseño

La lista completa de lo que el blog toma del portafolio, y qué revisar cuando este cambia, está en `docs/portafolio.md`.

- **Tokens del portafolio:** `BaseHead.astro` carga `https://lenincuadra.com/styles/tokens.css`. De ahí salen los colores en claro y en oscuro, la fuente monoespaciada (DM Mono), los espacios, los radios y las animaciones. El blog no copia esos valores: usa sus variables, así que sigue al portafolio cuando este cambia.
- **Componentes del portafolio:** también carga `https://lenincuadra.com/styles/header.css`, de donde sale el botón de tema (sol y luna). El blog escribe el HTML del componente y el portafolio pone los estilos. El selector de idioma del portafolio (`.lang-switch`) queda disponible para cuando se agregue el cambio de idioma.
- **Tokens propios (`--notes-*`):** están al inicio de `src/styles/global.css` y se derivan de los del portafolio con `color-mix()`: los puntos de la hoja, el resaltador y la etiqueta verde. Funcionan en los dos temas con un contraste de 4.5:1 o más.
- **Tipografías propias:** Instrument Serif para la marca ("Notes" y, al lado, "by Lenin Cuadra" en cursiva y más pequeño), Shantell Sans para los títulos y las notas al margen, y Literata para el texto.
- **Modo claro y oscuro:** el claro es el predeterminado. El botón de tema agrega o quita la clase `theme-dark` (la misma del portafolio) y el navegador del lector recuerda su elección.
- **Favicon:** una n minúscula de Newsreader Bold cruzada por un trazo de resaltador, en `public/`. Pesa más que el nombre del header a propósito. Es lo único con colores escritos, porque un ícono no puede cargar archivos externos.
- **Dentro de un post:** `<mark>` resalta una frase como con un marcador y `<aside>` se muestra como una nota al margen escrita a mano.

## Lógica técnica

| Archivo | Para qué sirve |
| --- | --- |
| `package.json`, `package-lock.json` | Dependencias y comandos (`dev`, `build`, `preview`). El lock fija las versiones exactas. Wrangler, la herramienta de Cloudflare para publicar, solo se usa en desarrollo y al publicar. |
| `wrangler.jsonc` | La configuración de Cloudflare Workers, que publica el sitio. Le dice que sirva tal cual los archivos de `dist/`, sin código propio en el servidor. El `name` tiene que coincidir con el nombre del proyecto en Cloudflare. |
| `astro.config.mjs` | Configuración: URL del sitio (`site`, hoy `https://notes.lenincuadra.com`), integraciones (MDX y sitemap) y los bloques de código: sus temas claro y oscuro, y que las líneas largas salten de línea en vez de cortarse en el celular. De `site` salen las URLs del RSS, del sitemap y las canónicas. |
| `tsconfig.json` | TypeScript en modo strict (extiende `astro/tsconfigs/strict`). |
| `src/content.config.ts` | Define la colección `blog`: dónde están los posts (`src/content/blog/`) y qué campos lleva su frontmatter. `title`, `description` y `pubDate` son obligatorios; `updatedDate`, `heroImage`, `tags` y `lang`, opcionales. `lang` es el idioma en que se escribió el post: `en` (inglés, si se omite) o `es` (español). Si se omite `tags`, queda como lista vacía. Si un post no cumple, Astro muestra un error. |
| `src/pages/[...slug].astro` | Crea una página por cada post (`getStaticPaths`) y convierte su Markdown en HTML (`render`). Los corchetes indican una ruta dinámica: cada post obtiene su URL en `/<id-del-post>/`. |
| `src/pages/rss.xml.js` | Genera el feed en `/rss.xml` a partir de la colección `blog`. |
| `src/consts.ts` | El nombre del blog (`SITE_NAME`), el autor (`SITE_AUTHOR`), el título completo y las descripciones: la del sitio y las de `/personal/` y `/practice/` (`PERSONAL_DESCRIPTION` y `PRACTICE_DESCRIPTION`). La de `/practice/` es la que se ve al compartir el enlace del portafolio. Los usan el `<head>`, la marca, el footer y el RSS. |
| `src/components/FormattedDate.astro` | Formatea las fechas. Por defecto usa `en-us`; si el blog va en español, se cambia aquí. |

## Lógica dentro de archivos de diseño

| Archivo | Lógica | Diseño |
| --- | --- | --- |
| `src/components/BaseHead.astro` | Metadatos SEO, URL canónica, Open Graph, RSS, sitemap, la carga de los tokens del portafolio y el script que aplica el tema guardado | Las fuentes, los favicons y la imagen por defecto para redes sociales (`og-default.png`) |
| `src/components/Header.astro` | El script del botón de tema, que cambia el tema y guarda la elección | La marca, el favicon dibujado en línea y el menú. Los estilos del botón vienen del portafolio |
| `src/pages/index.astro` | La obtención de todos los posts (`getCollection`) y el orden por fecha | La estructura de la página |
| `src/pages/personal.astro` | El filtro (los posts sin la etiqueta `practice`) y el orden por fecha | La estructura de la página |
| `src/pages/practice.astro` | El filtro por la etiqueta `practice` y el orden por fecha | La estructura de la página |
| `src/components/PostList.astro` | El enlace de cada post a `/<id-del-post>/` y el idioma de cada título, para que uno en español se lea en español | La maquetación del listado |
| `src/components/PostFilter.astro` | La lista de filtros (View All, Personal y Practice) y cuál está activo | Su apariencia |
| `src/components/HeaderLink.astro` | El cálculo del enlace activo | Su apariencia |
| `src/layouts/BlogPost.astro` | Las props que recibe del post y el `<slot />`, donde se inserta el contenido. La fecha, las etiquetas y el idioma son opcionales para páginas como About, que no muestran fecha. La página se declara en el idioma del post (`lang`), en inglés si no lo indica. El título de la pestaña y de los buscadores suma el nombre del blog: "About \| Notes by Lenin Cuadra" | La presentación del post |

## Diseño

- **`src/styles/global.css`:** todo el diseño Cuaderno: la hoja con puntos, el header, el listado, el filtro, la lectura del post y el footer. Al inicio están los tokens propios.
- **`src/components/Header.astro` y `Footer.astro`:** la marca con su firma, el menú y el botón de tema; el footer con el aviso de copyright y los enlaces al portafolio y al RSS.
- **`src/pages/about.astro`:** página "About", por ahora con un texto provisional. Usa el mismo layout que los posts, sin fecha. El texto definitivo es contenido, así que irá en `src/content/blog/` (ver `CLAUDE.md`).
- **`public/`:** los favicons (`favicon.svg`, `favicon-96.png`, `favicon.ico` y `apple-touch-icon.png`) y `robots.txt`. Este último pide que los textos no se usen para entrenar IA, sin cerrarle el paso a los buscadores ni a los asistentes que leen un post para alguien. También indica dónde está el sitemap.
- **`src/assets/`:** `og-default.png`, la imagen que se ve al compartir un enlace del blog (1200×630). `BaseHead.astro` la importa. Las imágenes de los posts no van aquí, sino junto a los posts (ver `CLAUDE.md`).

## Otros

- **`src/content/blog/`:** los posts y sus imágenes. El nombre de cada archivo es la dirección del post: `confidence.md` se publica en `/confidence/`. Es la única carpeta con todos los derechos reservados (ver `LICENSE`).
- **`CLAUDE.md`:** reglas que Claude Code lee al empezar cada sesión: dónde va el contenido, qué nombres no pueden usar los posts, que los textos del autor solo se corrigen en sus errores, cómo depende el diseño del portafolio, que los textos no se usan para entrenar IA y cómo se escriben las fechas.
- **`LICENSE`:** el código está bajo la licencia MIT; el contenido de `src/content/blog/` tiene todos los derechos reservados.
- **`docs/`:** documentación del proyecto: este archivo y `portafolio.md`, con todo lo que el blog toma del portafolio. Astro no la publica en el sitio.
- **`.vscode/`:** recomienda las extensiones de Astro y MDX y permite iniciar el servidor desde el editor.
- **`README.md`:** el de la plantilla, en inglés. Incluye la tabla de comandos.
- **Carpetas generadas:** `node_modules/`, `.astro/` (tipos que genera Astro), `dist/` (resultado de `npm run build`) y `.wrangler/` (lo que guarda Wrangler al probar el sitio en local). Se crean solas y no se versionan.
