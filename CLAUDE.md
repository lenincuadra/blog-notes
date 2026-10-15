# Reglas del proyecto

## El contenido del blog va siempre en `src/content/blog/`

Todo el contenido que se cree para el blog va en `src/content/blog/`: los posts y también sus imágenes y demás archivos. Dentro del post, las imágenes se enlazan con rutas relativas, por ejemplo `./mi-foto.jpg`.

**Por qué:** el archivo `LICENSE` reserva todos los derechos solo sobre esa carpeta. Lo que quede fuera de ella cuenta como código y queda bajo la licencia MIT, que permite que cualquiera lo reutilice. Por ejemplo, una foto de un post guardada en `src/assets/` quedaría bajo MIT.

Esta regla es solo para el contenido. El código sigue en sus carpetas de siempre: páginas en `src/pages/` (Astro solo crea rutas desde ahí), componentes en `src/components/` y estilos en `src/styles/`.

## Fechas de los posts: formato `'Oct 15 2026'`

En `pubDate` y `updatedDate`, la fecha se escribe como `'Oct 15 2026'`, nunca como `'2026-10-15'`.

**Por qué:** el formato `2026-10-15` se interpreta como medianoche en hora universal (UTC). En la zona horaria del autor (UTC−3), ese momento todavía es el día anterior, así que el post mostraría un día menos.
