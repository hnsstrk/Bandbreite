/// <reference lib="webworker" />

/**
 * Kill-Switch statt Cache (Entscheidung des Besitzers, Bericht 74).
 *
 * Der frühere Service Worker hat Seiten und Assets zwischengespeichert und
 * damit veraltete Stände ausgeliefert. Diese Fassung speichert nichts mehr:
 * Sie meldet sich beim Aktivieren selbst ab, löscht **alle** Caches und lädt
 * alle offenen Fenster neu, damit sie sofort wieder direkt vom Server lesen.
 * `fetch` wird bewusst **nicht** abgefangen — der Worker steht in keinem
 * Netzwerkpfad.
 *
 * Die Registrierung in `src/app.html` bleibt vorerst bestehen, sonst erreicht
 * der Kill-Switch die Altinstallationen nie. Sobald davon auszugehen ist, dass
 * alle Besucher einmal geladen haben (Faustregel: einige Monate nach dem
 * Rollout), können Registrierung **und** diese Datei ersatzlos entfallen.
 */

// Sofort übernehmen, ohne auf das Schließen alter Tabs zu warten.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Alle Caches löschen — auch die der früheren Versionen.
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));

      // 2. Selbst abmelden: danach kontrolliert kein Worker mehr die Seite.
      await self.registration.unregister();

      // 3. Offene Fenster neu laden, damit sie ohne Worker weiterarbeiten.
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
