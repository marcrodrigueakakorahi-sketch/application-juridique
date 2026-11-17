// Service worker d'ActeFacile : rend l'application installable et utilisable avec une connexion faible.
// - Fichiers statiques (/_next/static, icônes) : cache d'abord (noms versionnés, donc sûrs).
// - Pages : réseau d'abord, puis copie en cache, puis page « hors ligne ».
// - /api (paiement, génération des documents) : jamais mis en cache.

const VERSION = "v3";
const CACHE_STATIQUE = `actefacile-statique-${VERSION}`;
const CACHE_PAGES = `actefacile-pages-${VERSION}`;
const PAGES_DE_BASE = ["/", "/actes", "/orientation", "/mes-documents", "/hors-ligne"];

// À l'installation : mise en cache des pages de base ET des fichiers JS/CSS qu'elles utilisent,
// pour qu'elles s'affichent correctement même si elles n'ont jamais été ouvertes.
async function preCharger() {
  const pages = await caches.open(CACHE_PAGES);
  const statique = await caches.open(CACHE_STATIQUE);
  const fichiers = new Set();
  for (const chemin of PAGES_DE_BASE) {
    const res = await fetch(chemin, { cache: "reload" });
    if (!res.ok) continue;
    const html = await res.clone().text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)]+/g)) fichiers.add(m[0]);
    await pages.put(chemin, res);
  }
  await Promise.all([...fichiers].map((f) => statique.add(f).catch(() => undefined)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCharger().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c.startsWith("actefacile-") && ![CACHE_STATIQUE, CACHE_PAGES].includes(c)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/paiement/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icones/")) {
    event.respondWith(
      caches.match(req).then(
        (enCache) =>
          enCache ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE_STATIQUE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copie = res.clone();
            caches.open(CACHE_PAGES).then((c) => c.put(url.pathname, copie));
          }
          return res;
        })
        .catch(async () => {
          const enCache = await caches.match(url.pathname);
          if (enCache) return enCache;
          // Redirection (et non contenu servi sous une autre adresse) pour que Next.js affiche la bonne page.
          if (url.pathname !== "/hors-ligne") return Response.redirect(new URL("/hors-ligne", self.location.origin), 302);
          return (await caches.match("/hors-ligne")) || Response.error();
        }),
    );
  }
});
