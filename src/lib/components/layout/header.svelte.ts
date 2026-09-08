/**
 * DOM-nahe Helfer des Kopfbereichs.
 *
 * Ausgelagert, damit `Header.svelte` unter der 300-Zeilen-Grenze bleibt und
 * die Entscheidungen ohne Komponente prüfbar sind.
 */

import { getNodesByIds, isActivePath, type NavGroup } from '$lib/data/navigation';

/** Breite, ab der die Desktop-Navigation gilt — wie im Media-Query der Styles. */
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

/** Gehört die aktuelle Seite zu dieser Menügruppe? */
export function isActiveGroup(group: NavGroup, pathname: string): boolean {
  if (group.href && isActivePath(group.href, pathname)) return true;
  return group.columns
    .flatMap((column) => getNodesByIds(column.itemIds))
    .some((node) => isActivePath(node.href, pathname));
}

/**
 * Verlässt der Fokus den Bereich? Ein leeres `relatedTarget` — etwa ein
 * Mausklick ins Leere — zählt nicht; darum kümmert sich der Klick-Handler.
 */
export function focusLeaves(container: HTMLElement | null, related: EventTarget | null): boolean {
  if (!container) return false;
  const next = related as Node | null;
  return next !== null && !container.contains(next);
}

/**
 * Meldet den Wechsel in die Desktop-Breite: dort gibt es die mobile
 * Schublade nicht mehr, ein offener Zustand würde den Seiten-Scroll gesperrt
 * lassen. Liefert die Abmeldung für den `$effect`.
 */
export function watchDesktopWidth(onDesktop: () => void): () => void {
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
  if (media.matches) onDesktop();
  const handleChange = (event: MediaQueryListEvent) => {
    if (event.matches) onDesktop();
  };
  media.addEventListener('change', handleChange);
  return () => media.removeEventListener('change', handleChange);
}

/** Spaltenindex eines Menüeintrags (`data-column` am Spaltencontainer). */
export function columnOf(element: Element): number {
  const column = element.closest('[data-column]');
  return column ? Number(column.getAttribute('data-column')) : 0;
}

/**
 * Tastaturführung im Mega-Menü: Pfeile wandern durch die Einträge, links und
 * rechts wechseln die Spalte, Pos1/Ende springen an die Ränder, Escape
 * schließt. Gibt `true` zurück, wenn die Taste verarbeitet wurde.
 */
export function megaMenuKeydown(
  event: KeyboardEvent,
  items: HTMLAnchorElement[],
  columnCount: number,
  onclose: (returnFocus?: boolean) => void
): boolean {
  if (items.length === 0) return false;
  const current = document.activeElement as HTMLAnchorElement | null;
  const index = current ? items.indexOf(current) : -1;

  switch (event.key) {
    case 'Escape':
      onclose(true);
      break;
    case 'ArrowDown':
      items[(index + 1) % items.length]?.focus();
      break;
    case 'ArrowUp':
      items[index <= 0 ? items.length - 1 : index - 1]?.focus();
      break;
    case 'ArrowRight':
    case 'ArrowLeft': {
      if (columnCount < 2 || index < 0 || !current) return false;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const target = (columnOf(current) + direction + columnCount) % columnCount;
      items.find((item) => columnOf(item) === target)?.focus();
      break;
    }
    case 'Home':
      items[0]?.focus();
      break;
    case 'End':
      items.at(-1)?.focus();
      break;
    default:
      return false;
  }
  event.preventDefault();
  return true;
}
