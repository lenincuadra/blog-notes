# Reglas del proyecto

## El contenido del blog va siempre en `src/content/blog/`

Todo el contenido que se cree para el blog va en `src/content/blog/`: los posts y también sus imágenes y demás archivos. Dentro del post, las imágenes se enlazan con rutas relativas, por ejemplo `./mi-foto.jpg`.

**Por qué:** el archivo `LICENSE` reserva todos los derechos solo sobre esa carpeta. Lo que quede fuera de ella cuenta como código y queda bajo la licencia MIT, que permite que cualquiera lo reutilice. Por ejemplo, una foto de un post guardada en `src/assets/` quedaría bajo MIT.

Esta regla es solo para el contenido. El código sigue en sus carpetas de siempre: páginas en `src/pages/` (Astro solo crea rutas desde ahí), componentes en `src/components/` y estilos en `src/styles/`.

## Nombres reservados para los posts

Un post no puede llamarse igual que una página del sitio. Hoy están reservados `about` y `practice`, y cada página nueva que se cree en `src/pages/` suma su nombre a la lista. Si un post va a usar un nombre reservado, avisa y propone otro.

**Por qué:** los posts se publican en la raíz (`/mi-post/`). Un post `about.md` tendría la misma dirección que la página `/about/`. Astro publica la página, no el post, y solo muestra un aviso: el post aparece en la portada, pero su enlace abre la página About.

## El diseño depende del sistema de diseño del portafolio

Los colores (en claro y en oscuro), la fuente monoespaciada, los espacios, los radios y las animaciones vienen de `https://lenincuadra.com/styles/tokens.css`, que `src/components/BaseHead.astro` carga en cada página. No copies sus valores en el blog: usa sus variables (`--ink`, `--bg`, `--accent`, `--sp-4`…). Si el blog necesita un color propio, derívalo de esos tokens con `color-mix()`, como los `--notes-*` de `src/styles/global.css`, y comprueba que el texto tenga un contraste de 4.5:1 o más en claro y en oscuro. Si el portafolio renombra un token, hay que actualizarlo también aquí.

Además carga `https://lenincuadra.com/styles/header.css` para usar el componente de tema del portafolio (`.theme-toggle`, con su marcado de sol y luna). Por eso el blog no debe usar otras clases del portafolio (`site-header`, `nav-toggle`, `lang-switch`…) salvo que quiera sus estilos. El header y el footer del blog llevan el prefijo `notes-` para no coincidir con los del portafolio.

La lista completa de lo que el blog toma del portafolio, incluido lo poco que está copiado, está en `docs/portafolio.md`. Si agregas, quitas o cambias un vínculo con el portafolio, actualízala.

El modo oscuro usa la misma clase que el portafolio: `theme-dark` en `<html>`. A diferencia del portafolio, el blog empieza siempre en claro y solo pasa a oscuro si el lector lo elige.

**Por qué:** así el blog es de la familia del portafolio sin duplicar nada: si cambia un token del portafolio, el blog lo sigue. La única excepción es el favicon (`public/favicon.svg` y sus versiones PNG e ICO): un ícono no puede cargar archivos externos, así que lleva sus colores escritos.

## Fechas de los posts: formato `'Oct 15 2026'`

En `pubDate` y `updatedDate`, la fecha se escribe como `'Oct 15 2026'`, nunca como `'2026-10-15'`.

**Por qué:** el formato `2026-10-15` se interpreta como medianoche en hora universal (UTC). En la zona horaria del autor (UTC−3), ese momento todavía es el día anterior, así que el post mostraría un día menos.
