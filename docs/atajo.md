# El atajo "Publicar en el blog"

Publica una nota de Notas (Apple Notes) como post del blog, desde el iPhone o la Mac. Es un atajo de la app Atajos: arma el archivo del post en `src/content/blog/` y lo sube a GitHub, y Cloudflare lo publica en un minuto.

## Cómo se usa

1. En Notas, abre la nota que quieres publicar.
2. Toca **Compartir** y elige **Publicar en el blog**.
3. Si la nota es una sola frase, el atajo te pide un título.
4. Elige la fecha del post. Viene marcada la de hoy; para una nota vieja, elige la fecha en que la escribiste.
5. Revisa el resumen (título, vista, fecha, idioma y dirección) y toca **Publicar**.
6. El atajo te avisa si se publicó o por qué no.

## Cómo se escribe la nota

- **El primer párrafo es el título**, como en Notas. Lo demás es el texto del post, tal cual: el atajo no corrige nada.
- **Si la nota es una sola frase**, por ejemplo una cita escrita entera en el título, esa frase es el texto del post y el atajo te pide un título.
- **Los párrafos y las listas** de la nota se mantienen.
- **`#practice`**, en cualquier parte de la nota, manda el post a Practice. Sin ese hashtag va a Personal, con la etiqueta `personal`.
- **Los hashtags no se publican.** El atajo quita las líneas que solo tienen hashtags y los que quedan al final del texto.
- **El idioma se detecta solo**: español o inglés.
- **La dirección sale del título**, en minúsculas, sin tildes y con guiones: "Si estás perdido" se publica en `/si-estas-perdido/`.
- **La descripción**, la que muestran Google y los enlaces compartidos, es la primera oración del texto.
- Por ahora no publica imágenes.

## Cuándo no publica

- Si ya hay un post con esa dirección. El atajo nunca reemplaza un post: cambia el título de la nota, o edita ese post desde la Mac. Cada post tiene un solo original: si lo editas en su `.md`, no vuelvas a publicarlo desde Notas.
- Si la dirección es la de una página del blog: `404`, `about`, `personal` o `practice` (ver `CLAUDE.md`).
- Si GitHub no acepta el token, por ejemplo porque venció.

## El token

El atajo sube los posts con un token de GitHub, "Atajo de Notes", de la cuenta personal. Solo puede tocar los archivos de este repositorio (permiso Contents). Vence el 6 de agosto de 2027.

Para renovarlo, genera uno nuevo con los mismos datos en https://github.com/settings/personal-access-tokens y pégalo en el atajo, en la primera acción de texto, debajo del comentario sobre el token.

No compartas el atajo: lleva el token adentro.

## Cómo se cambia

El atajo no se edita a mano en la app: lo arma `tools/atajo/generar.mjs`, así el repositorio guarda cómo funciona.

Un detalle que conviene saber: Atajos pasa la nota a Markdown con su propia versión de html2text, que corta en dos cualquier línea de más de unos 100 caracteres. El atajo vuelve a unir esas líneas antes de separar el título del texto. Si algún día un post sale con un párrafo partido, o con dos párrafos pegados, el problema está en ese paso.

1. Cambia `tools/atajo/generar.mjs`. Las reglas de texto (títulos, párrafos, listas, hashtags, dirección) están arriba, en `RULES`.
2. Prueba las reglas con el mismo motor que usa Atajos:
   ```sh
   node tools/atajo/generar.mjs --reglas > /tmp/reglas.json
   osascript -l JavaScript tools/atajo/probar.js /tmp/reglas.json
   ```
3. Arma el atajo con `npm run atajo`. Queda firmado en `tools/atajo/salida/Publicar en el blog.shortcut`. Esa carpeta no se sube al repositorio.
4. Ábrelo en la Mac, elige reemplazar el atajo anterior y pega el token cuando lo pida. Por iCloud llega también al iPhone.

Si se agrega una página en `src/pages/`, su nombre también va en `RESERVED`, dentro de `generar.mjs`.
