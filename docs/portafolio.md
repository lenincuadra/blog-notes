# Lo que el blog toma del portafolio

El blog no copia el diseño del portafolio (`lenincuadra.com`): lo carga desde allá cada vez que alguien abre una página. Por eso, si cambias un color en el portafolio, el blog cambia también. Y si cambias o borras algo de esta lista, el blog puede verse mal.

Aquí está cada vínculo y qué revisar cuando cambias el portafolio. Actualiza este documento cada vez que agregues o quites uno.

## Archivos que carga

`src/components/BaseHead.astro` los carga en cada página:

| Archivo | Qué trae |
| --- | --- |
| `https://lenincuadra.com/styles/tokens.css` | Los tokens: colores en claro y en oscuro, la fuente monoespaciada, los tamaños de texto, los espacios, los radios y las animaciones. Con su `@import` llega también la fuente DM Mono. |
| `https://lenincuadra.com/styles/header.css` | Los estilos del botón de tema (ver más abajo). |

- **Cuándo llegan los cambios:** en cuanto publicas el portafolio. Un navegador que ya tenía guardados estos archivos puede tardar hasta 4 horas en ver la versión nueva.
- **Si el portafolio no responde:** el blog se sigue leyendo, pero sin sus colores, sus espacios ni la fuente monoespaciada.
- El `@import` de `tokens.css` también declara Cormorant Garamond e Instrument Sans. El blog no las usa, así que el navegador no las descarga.

## Tokens que usa

Todos se usan en `src/styles/global.css`:

| Grupo | Tokens |
| --- | --- |
| Colores | `--bg`, `--bg-alt`, `--border`, `--ink`, `--ink-2`, `--ink-3`, `--accent`, `--accent-ink`, `--accent-3` |
| Texto | `--font-mono`, `--text-xs` |
| Espacios | `--sp-1`, `--sp-2`, `--sp-3`, `--sp-4`, `--sp-5`, `--sp-6`, `--sp-8`, `--sp-12`, `--sp-16` |
| Radios | `--r-sm`, `--r-md` |
| Animación | `--ease-out`, `--dur-fast`, `--dur-mid` |

El botón de tema usa además `--surface` (el fondo al pasar el cursor), pero eso lo resuelve el propio `header.css`.

### Colores propios, derivados de los tokens

Están al inicio de `global.css`. Se calculan con `color-mix()` a partir de los tokens, así que cambian solos cuando cambia el portafolio:

| Token | Se calcula con | Dónde se ve |
| --- | --- | --- |
| `--notes-dot` | 13% de `--ink` sobre `--bg` | Los puntos de la hoja |
| `--notes-mark` | 24% de `--accent` sobre `--bg` | El resaltador: `<mark>` y el título de un post al pasar el cursor |
| `--notes-mark-strong` | 45% de `--accent` sobre `--bg` | El trazo de la "n" del header y el borde de las citas |
| `--notes-green` | 70% de `--accent-3` con `--ink` | Las etiquetas y las notas al margen |
| `--notes-chip` | 14% de `--accent-3` sobre `--bg` | El fondo de las etiquetas |

Con estos colores, el texto tiene un contraste de 4.5:1 o más en claro y en oscuro. Si cambias `--ink`, `--bg`, `--accent` o `--accent-3` en el portafolio, vuelve a comprobarlo.

## El botón de tema

Es el componente de sol y luna del portafolio. Tiene tres partes:

| Parte | Dónde está | De dónde viene |
| --- | --- | --- |
| Los estilos: tamaño, colores, hover, foco y qué ícono se ve en cada tema | `header.css` del portafolio | Se cargan: si cambian allá, cambian aquí |
| El HTML y los dos íconos (`.theme-toggle`, `.icon-moon` e `.icon-sun`) | `src/components/Header.astro` | **Copiados** del portafolio, porque el HTML no se puede cargar como un CSS |
| El script que cambia el tema | `Header.astro` y `BaseHead.astro` | Propio del blog, porque el blog empieza en claro y el portafolio sigue la preferencia del sistema |

El script sigue las convenciones del portafolio:

- La clase `theme-dark` en `<html>` activa el modo oscuro. Es la que esperan `tokens.css` y `header.css`.
- La elección se guarda con la misma clave, `theme`, y los mismos valores, `dark` o `light`.
- Aun así, la elección no se comparte entre los dos sitios: el navegador guarda por separado los datos de `lenincuadra.com` y los de `notes.lenincuadra.com`.

## Lo que está copiado

Casi todo se carga, pero esto se copió porque no hay otra forma. Hay que mantenerlo a mano:

- **El HTML del botón de tema**, en `Header.astro` (ver arriba).
- **El reset de `button`**, al inicio de `global.css`. Es el mismo de `base.css` del portafolio, que el blog no carga. El botón de tema lo necesita: sin borde ni fondo, con la fuente y el color heredados.
- **Los colores del favicon**, en `public/favicon.svg`. Un ícono no puede cargar archivos externos, así que lleva los valores escritos. Son los de `--bg`, `--ink` y `--notes-mark-strong` en cada tema:

  | | Claro | Oscuro |
  | --- | --- | --- |
  | Fondo (`--bg`) | `#f5f3ef` | `#141311` |
  | Letra (`--ink`) | `#1a1916` | `#f0ede8` |
  | Trazo (`--notes-mark-strong`) | `#bfa7d9` | `#432c5f` |

  `favicon-96.png`, `favicon.ico` y `apple-touch-icon.png` son exportaciones del favicon en claro. Si cambias los colores, hay que exportarlas de nuevo.
- **Los colores de la imagen para redes**, en `src/assets/og-default.png`: es la imagen que se ve al compartir un enlace del blog. Por ser una imagen, también lleva los colores escritos: los del tema claro (`--bg`, `--ink`, `--ink-3`, el trazo y los puntos). Si cambias los colores o la marca, hay que generarla de nuevo.

## Nombres de clases

El blog carga `header.css`, así que cualquier elemento con una de sus clases recibe los estilos del portafolio:

- El blog usa a propósito `theme-toggle`, `icon-moon` e `icon-sun`.
- No uses `site-header…`, `nav-toggle`, `lang-switch…` ni `skip-link`, salvo que quieras sus estilos.
- Por eso el header y el footer del blog se llaman `notes-header` y `notes-footer`. El portafolio usa `site-header` y `site-footer`.
- Para la fase 11 (idiomas) está disponible el selector de idioma del portafolio, `lang-switch`. Funcionaría igual que el botón de tema: sus estilos se cargarían y su HTML habría que copiarlo.

## Otros vínculos

- El footer del blog enlaza al portafolio (`https://lenincuadra.com`).
- En la fase 8, el portafolio enlazará a `https://notes.lenincuadra.com/practice/`. Si esa dirección cambia, el enlace del portafolio se rompe.

## Si cambias algo en el portafolio

| Si en el portafolio… | Revisa en el blog |
| --- | --- |
| Renombras o borras un token | Corre la comprobación de abajo y actualiza `global.css` |
| Cambias un color | El contraste de los `--notes-*` en los dos temas, el favicon y la imagen para redes |
| Quitas DM Mono del `@import` de `tokens.css` | Agrégala a las fuentes de `BaseHead.astro` |
| Cambias el HTML o los íconos del botón de tema | Cópialos de nuevo en `Header.astro` |
| Cambias el reset de `button` en `base.css` | Cópialo en `global.css` |
| Mueves o renombras `tokens.css` o `header.css` | Las direcciones en `BaseHead.astro` |
| Cambias la clase `theme-dark` o la clave `theme` | Los scripts de `BaseHead.astro` y `Header.astro` |

### Comprobar que el blog no usa tokens que ya no existen

Desde la raíz del repo:

```sh
comm -23 \
  <(grep -rhoE 'var\(--[a-z0-9-]+' src | sed 's/var(//' | grep -vE -- '^--(notes|shiki)-' | sort -u) \
  <(curl -s https://lenincuadra.com/styles/tokens.css | grep -oE -- '--[a-z0-9-]+:' | tr -d ':' | sort -u)
```

Si no imprime nada, todos los tokens existen. Si imprime alguno, ese token ya no está en el portafolio.
