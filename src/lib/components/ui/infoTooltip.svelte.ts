/**
 * Zustand und Listener hinter {@link InfoTooltip}.
 *
 * Das Popup liegt `position: fixed` im Viewport, damit es weder von der
 * scrollenden Band-Sidebar (`overflow-y: auto`) noch von Karten mit Overflow
 * abgeschnitten wird. Die Position wird aus dem i-Button gemessen und per
 * `computeTooltipPlacement` in den Viewport geklemmt; bei Scrollen, Größen-
 * änderung und Auf-/Zuklappen der Details wird neu gemessen.
 */

import { computeTooltipPlacement, type TooltipPlacement } from './tooltipPosition';

export class InfoTooltipState {
  isOpen = $state(false);
  showDetails = $state(false);
  placement: TooltipPlacement | null = $state(null);

  /** Umschließendes Element (für Klick-außerhalb) */
  containerRef: HTMLElement | null = $state(null);
  /** Anker: der i-Button */
  buttonRef: HTMLButtonElement | null = $state(null);
  /** Das schwebende Popup */
  popupRef: HTMLElement | null = $state(null);

  toggle(e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.showDetails = false;
    }
  }

  close(): void {
    this.isOpen = false;
    this.showDetails = false;
  }

  toggleDetails(e: MouseEvent): void {
    e.stopPropagation();
    this.showDetails = !this.showDetails;
  }

  updatePlacement = (): void => {
    if (!this.buttonRef || !this.popupRef) return;
    const anchor = this.buttonRef.getBoundingClientRect();
    const popup = this.popupRef.getBoundingClientRect();
    this.placement = computeTooltipPlacement(
      { top: anchor.top, left: anchor.left, width: anchor.width, height: anchor.height },
      { width: popup.width, height: popup.height },
      { width: window.innerWidth, height: window.innerHeight }
    );
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };

  private handleGlobalClick = (e: MouseEvent): void => {
    if (this.containerRef && !this.containerRef.contains(e.target as Node)) {
      this.close();
    }
  };

  /**
   * Innerhalb eines `$effect` aufrufen. Registriert bei geöffnetem Popup die
   * globalen Listener (Klick außerhalb, Escape, Scrollen, Resize) und gibt die
   * Aufräumfunktion zurück.
   */
  attach(): () => void {
    if (!this.isOpen) return () => {};
    // Capture-Phase: Klick-außerhalb zuverlässig, Scrollen in verschachtelten
    // Containern (Sidebar) kommt nur so an.
    document.addEventListener('click', this.handleGlobalClick, true);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('scroll', this.updatePlacement, true);
    window.addEventListener('resize', this.updatePlacement);
    return () => {
      document.removeEventListener('click', this.handleGlobalClick, true);
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('scroll', this.updatePlacement, true);
      window.removeEventListener('resize', this.updatePlacement);
    };
  }

  /**
   * Innerhalb eines `$effect` aufrufen: misst neu, sobald das Popup im DOM
   * ist oder seine Höhe ändert (Details auf/zu); setzt die Position sonst zurück.
   */
  measure(): void {
    if (!this.isOpen || !this.popupRef) {
      this.placement = null;
      return;
    }
    void this.showDetails;
    this.updatePlacement();
  }
}
