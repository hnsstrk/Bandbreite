/**
 * Rauchtest über alle gebauten Seiten.
 *
 * Lädt jede prerenderte Route aus `build/` in Chromium — Desktop und Mobil,
 * helles und dunkles Erscheinungsbild — und prüft:
 *
 * - HTTP-Status 200
 * - genau eine `h1` je Seite
 * - kein waagerechtes Überlaufen (`scrollWidth > clientWidth`)
 * - keine Konsolen- oder Seitenfehler
 * - die Befehlspalette öffnet mit Strg+K (auf einer Stichprobe)
 *
 * Aufruf: `npm run build && npm run test:e2e`
 * Der Prozess endet mit Code 1, sobald eine Prüfung anschlägt.
 *
 * Browser: standardmäßig das Chromium aus `npx playwright install chromium`.
 * Ein vorhandener Browser lässt sich über `PLAYWRIGHT_CHROMIUM=/pfad/zu/chromium`
 * vorgeben, eine fremde Playwright-Installation über `PLAYWRIGHT_PATH`.
 */

import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(rootDir, 'build');

/** Viewports: Desktop und ein schmales Telefon. */
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobil', width: 390, height: 800 }
];

const THEMES = ['light', 'dark'];

/** Wartezeit, bis eine Seite als geladen gilt. */
const NAV_TIMEOUT_MS = 20_000;

/** Konsolenmeldungen, die nichts über die Seite aussagen. */
const IGNORIERTE_MELDUNGEN = [/favicon/i, /Failed to load resource: net::ERR_ABORTED/i];

/** Chromium-Pfad: Umgebungsvariable, sonst der vorinstallierte Browser, sonst Playwright-Standard. */
function chromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const vorinstalliert = '/opt/pw-browsers/chromium';
  return existsSync(vorinstalliert) ? vorinstalliert : undefined;
}

/** Playwright laden — aus dem Projekt oder aus `PLAYWRIGHT_PATH`. */
async function ladePlaywright() {
  const pfad = process.env.PLAYWRIGHT_PATH;
  try {
    return await import(pfad ?? 'playwright');
  } catch (fehler) {
    console.error(
      'Playwright ist nicht verfügbar. `npm install` ausführen oder PLAYWRIGHT_PATH setzen.\n' +
        String(fehler)
    );
    process.exit(1);
  }
}

/** Alle prerenderten Routen aus dem Build (`.../index.html` → `/.../`). */
function routen(verzeichnis = buildDir, praefix = '/') {
  const gefunden = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, eintrag);
    if (statSync(pfad).isDirectory()) {
      if (eintrag === '_app') continue;
      gefunden.push(...routen(pfad, `${praefix}${eintrag}/`));
    } else if (eintrag === 'index.html') {
      gefunden.push(praefix);
    }
  }
  return gefunden.sort();
}

/** Freien Port vom Betriebssystem geben lassen. */
function freierPort() {
  return new Promise((erfuellen, ablehnen) => {
    const server = createServer();
    server.on('error', ablehnen);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => erfuellen(port));
    });
  });
}

/** `vite preview` starten und auf Antwortbereitschaft warten. */
async function starteVorschau(port) {
  const prozess = spawn(
    process.execPath,
    [
      join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js'),
      'preview',
      '--host',
      '127.0.0.1', // explizit IPv4: auf GitHub-Runnern löst `localhost` zu ::1 auf
      '--port',
      String(port),
      '--strictPort'
    ],
    { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  prozess.stdout.on('data', () => {});
  let letzterFehler = '';
  prozess.stderr.on('data', (daten) => (letzterFehler = String(daten)));

  const bis = Date.now() + 30_000;
  while (Date.now() < bis) {
    try {
      const antwort = await fetch(`http://127.0.0.1:${port}/`);
      if (antwort.ok) return prozess;
    } catch {
      // noch nicht bereit
    }
    await new Promise((erfuellen) => setTimeout(erfuellen, 250));
  }
  prozess.kill();
  throw new Error(`Vorschau-Server startete nicht auf Port ${port}. ${letzterFehler}`);
}

async function main() {
  if (!existsSync(buildDir)) {
    console.error('Kein `build/`-Verzeichnis. Zuerst `npm run build` ausführen.');
    process.exit(1);
  }

  const { chromium } = await ladePlaywright();
  const alleRouten = routen();
  if (alleRouten.length === 0) {
    console.error('Keine prerenderten Seiten in `build/` gefunden.');
    process.exit(1);
  }

  const port = await freierPort();
  const vorschau = await starteVorschau(port);
  const basis = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({
    executablePath: chromiumExecutable()
  });

  /** Ein Befund je Zeile; am Ende die Zusammenfassung. */
  const befunde = [];
  let geprueft = 0;

  try {
    for (const viewport of VIEWPORTS) {
      for (const thema of THEMES) {
        const kontext = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: thema
        });
        const seite = await kontext.newPage();
        const lauf = `${viewport.name}/${thema}`;

        let aktuelleRoute = '';
        const melde = (text) => befunde.push(`${lauf} ${aktuelleRoute}: ${text}`);
        seite.on('pageerror', (fehler) => melde(`Seitenfehler — ${fehler.message}`));
        seite.on('console', (meldung) => {
          if (meldung.type() !== 'error') return;
          const text = meldung.text();
          if (IGNORIERTE_MELDUNGEN.some((muster) => muster.test(text))) return;
          melde(`Konsolenfehler — ${text.slice(0, 160)}`);
        });

        for (const route of alleRouten) {
          aktuelleRoute = route;
          geprueft += 1;
          const antwort = await seite.goto(basis + route, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT_MS
          });

          if (!antwort || antwort.status() !== 200) melde(`Status ${antwort?.status() ?? '—'}`);

          const messung = await seite.evaluate(() => ({
            h1: document.querySelectorAll('h1').length,
            ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth
          }));
          if (messung.h1 !== 1) melde(`${messung.h1} h1-Überschriften (erwartet: 1)`);
          if (messung.ueberlauf > 0) melde(`waagerechter Überlauf ${messung.ueberlauf} px`);
        }

        // Befehlspalette: Stichprobe auf der Startseite
        aktuelleRoute = '/ (Strg+K)';
        await seite.goto(basis + '/', { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
        await seite.keyboard.press('Control+k');
        await seite.waitForTimeout(400);
        const paletteOffen = await seite.evaluate(
          () => document.querySelectorAll('[role="dialog"], dialog[open]').length > 0
        );
        if (!paletteOffen) melde('Befehlspalette öffnet nicht mit Strg+K');

        await kontext.close();
      }
    }
  } finally {
    await browser.close();
    vorschau.kill();
  }

  console.log(
    `${alleRouten.length} Routen × ${VIEWPORTS.length} Viewports × ${THEMES.length} Themes ` +
      `= ${geprueft} Seitenaufrufe.`
  );
  if (befunde.length === 0) {
    console.log('Keine Befunde.');
    return;
  }
  console.log(`\n${befunde.length} Befunde:`);
  for (const befund of [...new Set(befunde)]) console.log(`  ${befund}`);
  process.exit(1);
}

await main();
