// Prerendering für alle Seiten (Voraussetzung für adapter-static).
export const prerender = true;

// Trailing Slash für alle Routen: Seiten mit Unterseiten werden als
// verzeichnis/index.html erzeugt statt als verzeichnis.html. Das vermeidet
// 403-Fehler auf statischen Hostern, wenn ein gleichnamiges Verzeichnis
// existiert. Alle internen Links müssen deshalb mit „/" enden.
export const trailingSlash = 'always';

/**
 * Grundwerte für die Metadaten. Jede Route überschreibt `title` und
 * `description` in ihrer eigenen `+page.ts`; `Metadata.svelte` ist die
 * einzige Stelle, die daraus `<head>`-Tags erzeugt.
 */
export const load = () => ({
  title: 'Bandbreite',
  description:
    'Interaktive Visualisierung des elektromagnetischen Spektrums, Rechner für die Hochfrequenztechnik und ein Nachschlagewerk zur Funktechnik.'
});
