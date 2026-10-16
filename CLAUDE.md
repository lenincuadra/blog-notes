# Reglas del proyecto

## El contenido del blog va siempre en `src/content/blog/`

Todo el contenido que se cree para el blog va en `src/content/blog/`: los posts y también sus imágenes y demás archivos. Dentro del post, las imágenes se enlazan con rutas relativas, por ejemplo `./mi-foto.jpg`.

**Por qué:** el archivo `LICENSE` reserva todos los derechos solo sobre esa carpeta. Lo que quede fuera de ella cuenta como código y queda bajo la licencia MIT, que permite que cualquiera lo reutilice. Por ejemplo, una foto de un post guardada en `src/assets/` quedaría bajo MIT.

Esta regla es solo para el contenido. El código sigue en sus carpetas de siempre: páginas en `src/pages/` (Astro solo crea rutas desde ahí), componentes en `src/components/` y estilos en `src/styles/`.

## Nombres reservados para los posts

Un post no puede llamarse igual que una página del sitio. Hoy están reservados `about`, `personal` y `practice`, y cada página nueva que se cree en `src/pages/` suma su nombre a la lista. Si un post va a usar un nombre reservado, avisa y propone otro.

**Por qué:** los posts se publican en la raíz (`/mi-post/`). Un post `about.md` tendría la misma dirección que la página `/about/`. Astro publica la página, no el post, y solo muestra un aviso: el post aparece en la portada, pero su enlace abre la página About.

## Los textos del autor: solo se corrigen errores

Al pasar una nota a un post, corrige solo los errores evidentes de ortografía, tipeo o gramática que se arreglan con un cambio mínimo, por ejemplo `apply` → `applies`, `unos momento` → `unos momentos` o un punto final que falta. No cambies palabras por otras que suenen mejor, no reordenes ni completes frases, no toques la puntuación que marca el ritmo y no unifiques el estilo. Si arreglar algo obliga a reescribir o a elegir entre varias formas de decirlo, o si no es seguro que sea un error, déjalo como está. Al terminar, dile al autor qué cambiaste y qué dejaste igual.

**Por qué:** el autor prefiere que un texto quede mal escrito antes que alterado. Lo que se publica tiene que conservar su voz.

## El diseño depende del sistema de diseño del portafolio

Los colores (en claro y en oscuro), la fuente monoespaciada, los espacios, los radios y las animaciones vienen de `https://lenincuadra.com/styles/tokens.css`, que `src/components/BaseHead.astro` carga en cada página. No copies sus valores en el blog: usa sus variables (`--ink`, `--bg`, `--accent`, `--sp-4`…). Si el blog necesita un color propio, derívalo de esos tokens con `color-mix()`, como los `--notes-*` de `src/styles/global.css`, y comprueba que el texto tenga un contraste de 4.5:1 o más en claro y en oscuro. Si el portafolio renombra un token, hay que actualizarlo también aquí.

Además carga `https://lenincuadra.com/styles/header.css` para usar el componente de tema del portafolio (`.theme-toggle`, con su marcado de sol y luna). Por eso el blog no debe usar otras clases del portafolio (`site-header`, `nav-toggle`, `lang-switch`…) salvo que quiera sus estilos. El header y el footer del blog llevan el prefijo `notes-` para no coincidir con los del portafolio.

La lista completa de lo que el blog toma del portafolio, incluido lo poco que está copiado, está en `docs/portafolio.md`. Si agregas, quitas o cambias un vínculo con el portafolio, actualízala.

El modo oscuro usa la misma clase que el portafolio: `theme-dark` en `<html>`. A diferencia del portafolio, el blog empieza siempre en claro y solo pasa a oscuro si el lector lo elige.

**Por qué:** así el blog es de la familia del portafolio sin duplicar nada: si cambia un token del portafolio, el blog lo sigue. Las únicas excepciones son dos imágenes, que llevan sus colores escritos porque una imagen no puede cargar archivos externos: el favicon (`public/favicon.svg` y sus versiones PNG e ICO) y la imagen para redes sociales (`src/assets/og-default.png`).

## Los textos no se usan para entrenar IA

`public/robots.txt` pide que el contenido no se use para entrenar modelos de IA. Lo hace de dos formas: con la señal `ai-train=no` y bloqueando a los rastreadores que recolectan para entrenar (`GPTBot`, `ClaudeBot`, `Google-Extended`…). Si aparece un rastreador de entrenamiento nuevo, agrégalo ahí. No bloquees a los buscadores (`Googlebot`, `Bingbot`…) ni a los asistentes que leen una página para una persona (`ChatGPT-User`, `Claude-User`…): el blog quiere que lo encuentren.

**Por qué:** el autor decidió que sus textos no entrenen IA, de acuerdo con el `LICENSE`, que reserva todos los derechos sobre el contenido. Ese bloqueo no se hace desde Cloudflare: allá se aplica a todo `lenincuadra.com`, portafolio incluido, y también bloquea a los rastreadores mixtos, los que buscan y entrenan a la vez.

## Fechas de los posts: formato `'Oct 15 2026'`

En `pubDate` y `updatedDate`, la fecha se escribe como `'Oct 15 2026'`, nunca como `'2026-10-15'`.

**Por qué:** el formato `2026-10-15` se interpreta como medianoche en hora universal (UTC). En la zona horaria del autor (UTC−3), ese momento todavía es el día anterior, así que el post mostraría un día menos.
