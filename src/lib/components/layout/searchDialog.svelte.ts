/**
 * Globaler Schalter der Command-Palette.
 *
 * Das Layout hält die Palette und bindet sie an diesen Zustand; Header und
 * Portalseite lösen sie über dieselbe Stelle aus, statt den Rückruf durch
 * mehrere Ebenen zu reichen.
 */
function createSearchDialog() {
  let open = $state(false);

  return {
    /** Ist die Palette geöffnet? */
    get open() {
      return open;
    },
    set open(value: boolean) {
      open = value;
    },

    /** Palette öffnen — z. B. aus dem Suchfeld der Portalseite. */
    show() {
      open = true;
    },

    /** Palette schließen. */
    hide() {
      open = false;
    }
  };
}

export const searchDialog = createSearchDialog();
