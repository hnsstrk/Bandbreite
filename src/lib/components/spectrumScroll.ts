/**
 * Sprung zur Banddetail-Spalte nach einem Tipp ins Spektrum — reine Regeln.
 *
 * Ab 1024 px stehen Diagramm und Seitenleiste nebeneinander (`dashboard-layout`
 * in `/spektrum/`), die Details sind also ohne Scrollen sichtbar. Darunter
 * liegen sie unter den Werkzeugen; dort holt die Seite sie in den Blick.
 */

/** Ab dieser Fensterbreite steht die Seitenleiste neben dem Diagramm (64 rem). */
export const SIDEBAR_SIDE_BY_SIDE_WIDTH_PX = 1024;

/** Muss nach einem Bandklick zur Detailspalte gescrollt werden? */
export function shouldScrollToBandDetail(viewportWidth: number): boolean {
  return viewportWidth < SIDEBAR_SIDE_BY_SIDE_WIDTH_PX;
}

/** Weiches Scrollen nur ohne `prefers-reduced-motion`. */
export function scrollBehaviorFor(prefersReducedMotion: boolean): ScrollBehavior {
  return prefersReducedMotion ? 'auto' : 'smooth';
}
