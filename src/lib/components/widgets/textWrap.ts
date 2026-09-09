/**
 * Zeilenumbruch für Fließtext in SVG-Bühnen.
 *
 * SVG kennt keinen automatischen Umbruch: Ein `<text>`-Element läuft über den
 * Rand hinaus, bis es abgeschnitten wird. Wo ein Widget einen Erklärsatz in
 * die Grafik setzt, muss der Text deshalb vorher in Zeilen zerlegt und als
 * Folge von `<tspan>` ausgegeben werden.
 *
 * Die Zeilenbreite wird in Zeichen angegeben, nicht in Pixeln — für die
 * Proportionalschrift der Bühnen ist das eine Näherung, die für Beschriftungen
 * genügt. Umbrochen wird nur an Leerzeichen; ein Wort, das allein länger ist
 * als die Zeile, bleibt ungeteilt stehen.
 */

/**
 * Zerlegt `text` in höchstens `maxLines` Zeilen von je rund `maxChars`
 * Zeichen. Passt der Text nicht, endet die letzte Zeile mit einem Auslassungs-
 * zeichen.
 */
export function wrapLines(text: string, maxChars: number, maxLines: number = 3): string[] {
  const limit = Math.max(1, Math.round(maxChars));
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= limit || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s.,;:]+$/, '')} …`;
  return kept;
}
