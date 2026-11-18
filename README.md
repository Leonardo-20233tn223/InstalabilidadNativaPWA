# Instalabilidad Nativa PWA — Cámara

PWA estática en JavaScript vanilla para instalar en la pantalla de inicio y usar la cámara con un flujo de consentimiento previo.

**Demo:** https://leonardo-20233tn223.github.io/InstalabilidadNativaPWA/

## Características

- Manifest instalable (`manifest.json`) con iconos 192x192 y 512x512.
- Instalación nativa en Chrome/Edge/Android mediante `beforeinstallprompt`.
- Instrucciones manuales en iOS (Safari → Compartir → Agregar a inicio).
- Aviso de pre-permiso antes de llamar a `getUserMedia()`.
- Cámara trasera (`environment`) y frontal (`user`) con cambio de lente.
- Captura de fotos, previsualización y descarga.
- Liberación de la cámara con `track.stop()` al cambiar, detener u ocultar la app.
- Service worker con precache y carga offline del shell.
- Rutas relativas para funcionar en GitHub Pages.

## Estructura

```text
index.html
style.css
app.js
sw.js
manifest.json
icons/
  icon-192.png
  icon-512.png
  apple-touch-icon-180.png
```

## Ejecutar en local

Sirve la carpeta por HTTP (no abras `index.html` con `file://`):

```bash
python -m http.server 5500
```

Abre `http://localhost:5500`. La cámara requiere `localhost` o HTTPS.

## Instalar en el teléfono

- **Android/Chrome:** abre la URL de GitHub Pages y usa el botón de instalación o el menú → Instalar aplicación.
- **iPhone/iPad:** abre la URL en Safari → Compartir → Agregar a inicio. Safari no dispara `beforeinstallprompt`, por eso la app muestra instrucciones manuales.
- La cámara solo funciona en HTTPS (GitHub Pages) o localhost. `http://<IP-LAN>` no es un contexto seguro.

## Desplegar en GitHub Pages

1. Sube el proyecto a la rama `main`.
2. GitHub → Settings → Pages → Build and deployment.
3. Source: **Deploy from a branch**; branch `main`; folder `/ (root)`.
4. Espera la publicación y abre `https://<usuario>.github.io/InstalabilidadNativaPWA/`.

Las rutas del proyecto son relativas, así que funciona tanto en la raíz del dominio como en una subcarpeta de proyecto.

## Notas

- Las fotos se guardan solo en memoria durante la sesión; usa **Descargar** para conservarlas.
- No hay backend, IndexedDB, outbox ni Background Sync en esta práctica.
- Al cambiar `sw.js` o los assets precacheados, sube `CACHE_NAME` para invalidar la caché.
