/**
 * Service Worker: Kill-Switch statt Cache (Entscheidung des Besitzers,
 * Bericht 74).
 *
 * `static/service-worker.js` darf nichts mehr zwischenspeichern. Der Test
 * fixiert das Sollverhalten am Quelltext: abmelden, alle Caches löschen,
 * offene Fenster neu laden — und kein `fetch`-Handler. Die Registrierung in
 * `src/app.html` bleibt bestehen, sonst erreicht der Kill-Switch die
 * Altinstallationen nie.
 */
import { describe, it, expect } from 'vitest';

const RAW = import.meta.glob('/static/service-worker.js', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const HTML = import.meta.glob('/src/app.html', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const worker = RAW['/static/service-worker.js'];
const appHtml = HTML['/src/app.html'];

describe('static/service-worker.js', () => {
  it('ist vorhanden und klein', () => {
    expect(worker).toBeTypeOf('string');
    expect(worker.length).toBeGreaterThan(0);
  });

  it('meldet sich beim Aktivieren selbst ab', () => {
    expect(worker).toContain("addEventListener('activate'");
    expect(worker).toContain('self.registration.unregister()');
  });

  it('löscht alle Caches', () => {
    expect(worker).toContain('caches.keys()');
    expect(worker).toContain('caches.delete');
  });

  it('lädt offene Fenster neu', () => {
    expect(worker).toContain("matchAll({ type: 'window' })");
    expect(worker).toContain('client.navigate(client.url)');
  });

  it('fängt keine Anfragen mehr ab und legt nichts an', () => {
    expect(worker).not.toContain("addEventListener('fetch'");
    expect(worker).not.toContain('caches.open');
    expect(worker).not.toContain('cache.put');
  });
});

describe('src/app.html', () => {
  it('registriert den Worker weiterhin einmal', () => {
    expect(appHtml).toContain("navigator.serviceWorker.register('/service-worker.js')");
  });
});
