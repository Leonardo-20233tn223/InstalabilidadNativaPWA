const CACHE_NAME = "camara-static-v2";
const CACHE_PREFIX = "camara-static-";
const APP_SHELL = new URL("./index.html", self.location).href;
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon-180.png"
].map((ruta) => new URL(ruta, self.location).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter(
              (nombre) => nombre.startsWith(CACHE_PREFIX) && nombre !== CACHE_NAME
            )
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copia))
              .catch(() => {});
          }
          return respuesta;
        })
        .catch(async () => {
          return (
            (await caches.match(event.request)) ||
            (await caches.match(APP_SHELL)) ||
            new Response("Sin conexión", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            })
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) {
        return respuestaCache;
      }

      return fetch(event.request)
        .then((respuesta) => {
          if (!respuesta || respuesta.status !== 200 || respuesta.type !== "basic") {
            return respuesta;
          }

          const copia = respuesta.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copia))
            .catch(() => {});
          return respuesta;
        })
        .catch(
          () =>
            new Response("Recurso no disponible sin conexión", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            })
        );
    })
  );
});
