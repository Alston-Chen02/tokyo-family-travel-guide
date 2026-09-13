const CACHE_NAME = "tokyo-family-guide-v9-20260913-inline-shell";
const APP_ROOT = "/tokyo-family-travel-guide/";
const APP_SHELL = [APP_ROOT, `${APP_ROOT}manifest.webmanifest`, `${APP_ROOT}icon-192.png`, `${APP_ROOT}icon-512.png`];

async function cacheShell(response, cache) {
  if (!response.ok) return;
  const html = await response.clone().text();
  const assets = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)]
    .map(match => new URL(match[1], self.location.origin))
    .filter(url => url.origin === self.location.origin && url.pathname.startsWith(APP_ROOT))
    .map(url => url.href);
  await cache.addAll([...new Set(assets)]);
  await cache.put(APP_ROOT, response);
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const shell = await fetch(APP_ROOT, { cache: "reload" });
    await cacheShell(shell, cache);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_ROOT)) return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        await cacheShell(response.clone(), await caches.open(CACHE_NAME));
        return response;
      } catch {
        return caches.match(APP_ROOT);
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) await (await caches.open(CACHE_NAME)).put(event.request, response.clone());
    return response;
  })());
});
