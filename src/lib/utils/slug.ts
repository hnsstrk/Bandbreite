/**
 * Slug-Erzeugung für Anker-IDs, Datei- und Routennamen.
 *
 * Regel des Projekts: In Routen und IDs erscheinen **keine** echten Umlaute.
 * `slugify('Wellenlänge')` liefert daher `wellenlaenge`.
 */

/** Zeichenersetzungen, die vor der Normalisierung greifen müssen. */
const CHAR_MAP: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'ae',
  Ö: 'oe',
  Ü: 'ue',
  ß: 'ss',
  æ: 'ae',
  Æ: 'ae',
  ø: 'oe',
  Ø: 'oe',
  å: 'aa',
  Å: 'aa',
  '&': ' und ',
  '@': ' at ',
  '°': ' grad ',
  µ: 'mikro',
  '₂': '2',
  '₃': '3'
};

/**
 * Ersetzt Umlaute und Sonderzeichen durch ASCII-Entsprechungen.
 * Diakritika (é, à, ç …) werden über die Unicode-Normalform entfernt.
 */
export function transliterate(input: string): string {
  const mapped = input.replace(
    /[äöüÄÖÜßæÆøØåÅ&@°µ₂₃]/g,
    (char) => CHAR_MAP[char] ?? char
  );
  return mapped.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Erzeugt einen URL- und ankertauglichen Slug.
 *
 * @example slugify('Atmosphärische Dämpfung') // 'atmosphaerische-daempfung'
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return '';
  return transliterate(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalisiert Text für Vergleiche in der Suche: transliteriert,
 * klein geschrieben, Mehrfach-Leerzeichen zusammengefasst.
 */
export function normalizeForSearch(input: string | null | undefined): string {
  if (!input) return '';
  return transliterate(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Wandelt ein Pfadsegment in ein lesbares Label um (Fallback, wenn der
 * Navigationsbaum das Segment nicht kennt).
 */
export function humanizeSegment(segment: string): string {
  if (!segment) return '';
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
