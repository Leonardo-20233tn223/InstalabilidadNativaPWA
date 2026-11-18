# AGENTS.md

## Estado del repo

- PWA estática en JavaScript vanilla: sin `package.json`, build, tests, lint ni CI. Los archivos se sirven tal cual.
- Repo git en `main` con remoto `https://github.com/Leonardo-20233tn223/InstalabilidadNativaPWA`; GitHub Pages activo en `https://leonardo-20233tn223.github.io/InstalabilidadNativaPWA/`. No hacer commit ni push salvo que se pida.
- La app activa está en la raíz de `pwa-practica-5.1/`: `index.html`, `app.js`, `sw.js`, `style.css`, `manifest.json` e `icons/`. No crear una subcarpeta para la app.
- `pwa-practica-4.2/` es solo guía de la práctica anterior (PokéAPI + estrategias de caché). No es la app activa, no se debe modificar y está ignorada por `.gitignore` (no se publica en Pages).
- El hermano `../app` es otra PWA (FakeStore, ruta relativa del SW, UI de actualización/online) útil como referencia de estilo.
- Alcance actual: instalabilidad (manifest + SW) y cámara con pre-permiso. No hay IndexedDB, outbox ni Background Sync en esta práctica.

## Ejecutar / verificar

- Sirve por HTTP con Live Server de VS Code desde la raíz (`http://127.0.0.1:5500`). `file://` bloquea service workers y cámara (`getUserMedia`).
- Tras editar JS: `node --check app.js && node --check sw.js`.
- Manifest: `node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))"`.
- Iconos: comprobar dimensiones reales (192x192, 512x512, 180x180) con PowerShell/System.Drawing.
- Instalabilidad: DevTools > Application > Manifest sin errores; Chrome/Edge deben ofrecer instalar.
- Offline: DevTools > Network > Offline + recarga; debe cargar el shell desde la caché `camara-static-*`.
- Un SW modificado tarda en activarse; este usa `skipWaiting()` + `clients.claim()`, pero la página actual puede seguir con el JS viejo hasta recargar. En desarrollo usa DevTools > Application > Service Workers > Update / "Update on reload".

## Errores de la guía 4.2 a no repetir

- `pwa-practica-4.2/app.js:9` registra `/sw.js`, y `sw.js` precachea rutas absolutas (`'/'`, `/index.html`, `/style.css`, `/app.js`). Las rutas absolutas fallan en GitHub Pages de proyecto (`https://<usuario>.github.io/<repo>/`). Usa `./sw.js` y precache relativo.
- `cache.addAll()` es todo o nada: un solo 404 (p. ej. `styles.css` vs `style.css`) aborta la instalación. Mantén la lista de precache igual a los nombres reales.
- En esta app sube `CACHE_NAME` (y en la guía 4.2, `CACHE_STATIC_NAME` / `CACHE_DYNAMIC_NAME`) cuando cambien assets precacheados o la lógica del SW; `activate` borra solo las cachés con el prefijo `camara-static-` (GitHub Pages comparte origen entre repos).
- `TTL_MAX_SECONDS = 30` y `DYNAMIC_LIMIT = 5` de la guía son valores de prueba, no defaults de producción. No aplican a la app actual.

## Cámara e iOS

- Mostrar el aviso de pre-permiso y no llamar a `getUserMedia` hasta que el usuario pulse el botón.
- `getUserMedia({ video: { facingMode: { ideal: "environment" } } })` para la trasera; `"user"` para la frontal. Detén los tracks con `track.stop()` al cambiar de lente, al detener y al ocultar/cerrar la página.
- `beforeinstallprompt` no existe en iOS: detecta iOS + `!window.navigator.standalone` y muestra instrucciones manuales (Compartir > Agregar a inicio). Para detectar instalada usa también `matchMedia('(display-mode: standalone)')`.
- En iOS el `<video>` necesita `playsinline` y `webkit-playsinline` (además de `muted`/`autoplay`) para evitar la pantalla completa automática.
- `apple-touch-icon` con ruta relativa: `./icons/apple-touch-icon-180.png`.
- La cámara solo funciona en contexto seguro: `localhost` o HTTPS. `http://<IP-LAN>` no sirve; para iPhone usa GitHub Pages o un túnel HTTPS.

## GitHub Pages

- Pages ya está configurado: branch `main`, folder `/ (root)`, build_type `legacy`; `.nojekyll` evita el procesado de Jekyll.
- Publicar con la app en la raíz del repo (o abrir la URL de su subcarpeta). Source: Deploy from a branch, branch `main`, folder `/ (root)`.
- URL de proyecto: `https://<usuario>.github.io/<repo>/`. Todas las rutas deben ser relativas (`./`).
- `manifest.json` con `start_url: "./"`, `scope: "./"` e `id: "./"`; usar `.json` (no `.webmanifest`) por el MIME de GitHub Pages.
- `sw.js` debe estar en la misma carpeta que `index.html`; GitHub Pages no permite la cabecera `Service-Worker-Allowed`.
- El repo debe ser público si la cuenta es GitHub Free.
- Tras desplegar, sube `CACHE_NAME` y espera la publicación; en el teléfono cierra y reabre la app para tomar el nuevo SW.
- `gh` está autenticado como `LeonardoMV03`, que solo tiene lectura en este repo; el push funciona con la credencial git almacenada del dueño `Leonardo-20233tn223`. Para operar la API de Pages usa la UI del dueño o su credencial, sin imprimir tokens.

## Estilo

- ES2017+ vanilla, sin frameworks ni build. Mantén `app.js` + `sw.js` pequeños; no añadas dependencias.
- UI en español (`lang="es"`); mantén el texto nuevo en español.
