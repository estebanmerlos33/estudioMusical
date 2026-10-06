// Nombre de caché versionado: al cambiar CACHE_NAME se invalida la caché vieja en "activate"
const CACHE_NAME = "guitarra-pwa-v3";

// Todo el "app shell": lo necesario para que la app funcione 100% sin conexión
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./ejercicio1.html",
  "./ejercicio2.html",
  "./ejercicio3.html",
  "./ejercicio4.html",
  "./ejercicio5.html",
  "./ejercicio6.html",
  "./style.css",
  "./sw-register.js",
  "./menu.js",
  "./diapason.js",
  "./diapasonVisual.js",
  "./acordes.js",
  "./script1.js",
  "./script2.js",
  "./script3.js",
  "./script4.js",
  "./script5.js",
  "./script6.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

// Al instalar: precachea todo el app shell y activa la nueva versión sin esperar a que se cierren pestañas viejas
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Al activar: borra cachés de versiones anteriores y toma control de las pestañas abiertas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres.filter((nombre) => nombre !== CACHE_NAME).map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Estrategia "cache primero, actualizar en segundo plano": responde rápido (y offline) desde caché
// si existe, y de paso pide la versión de red para refrescar la caché para la próxima vez.
// ignoreSearch evita que los "?v=N" de cache-busting rompan el match contra el app shell precacheado.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((respuestaCacheada) => {
      const peticionRed = fetch(event.request)
        .then((respuestaRed) => {
          if (respuestaRed && respuestaRed.status === 200 && respuestaRed.type === "basic") {
            const copia = respuestaRed.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          }
          return respuestaRed;
        })
        .catch(() => respuestaCacheada);

      return respuestaCacheada || peticionRed;
    })
  );
});