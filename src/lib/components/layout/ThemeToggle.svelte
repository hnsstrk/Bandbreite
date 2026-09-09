<script lang="ts">
  /**
   * Theme-Umschalter — eine einzige Icon-Schaltfläche.
   *
   * Ein Klick schaltet reihum weiter: hell → dunkel → System → hell.
   * Das Icon zeigt den aktuellen Zustand, `aria-label` und `title` nennen
   * ihn im Klartext samt dem, was der nächste Klick bewirkt.
   *
   * Die Klasse `.dark` wird bereits vom Inline-Skript in `app.html`
   * gesetzt, bevor die Seite gerendert wird — diese Komponente liest
   * den gespeicherten Wert nur noch aus und schreibt Änderungen zurück.
   */
  import { browser } from '$app/environment';
  import Icon from '../ui/Icon.svelte';
  import type { IconName } from '../ui/icons';

  type ThemeChoice = 'light' | 'dark' | 'system';

  /** Reihenfolge des Durchschaltens. */
  const ORDER: ThemeChoice[] = ['light', 'dark', 'system'];

  const LABELS: Record<ThemeChoice, string> = {
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System'
  };

  const ICONS: Record<ThemeChoice, IconName> = {
    light: 'sun',
    dark: 'moon',
    system: 'monitor'
  };

  const STORAGE_KEY = 'theme';

  function readStoredChoice(): ThemeChoice {
    if (!browser) return 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {
      /* localStorage kann blockiert sein */
    }
    return 'system';
  }

  function prefersDark(): boolean {
    return browser && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  let choice = $state<ThemeChoice>('system');

  const next = $derived(ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]);
  const label = $derived(`Farbschema: ${LABELS[choice]} — weiter zu ${LABELS[next]}`);

  /** Wendet die Wahl auf das Dokument an und aktualisiert die Statusleisten-Farbe. */
  function applyChoice(value: ThemeChoice) {
    if (!browser) return;
    const dark = value === 'dark' || (value === 'system' && prefersDark());
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';

    // Statusleisten-Farbe aus dem Token übernehmen — kein fester Farbwert.
    const meta = document.querySelector('meta[name="theme-color"]');
    const background = getComputedStyle(root).getPropertyValue('--color-base').trim();
    if (meta && background) meta.setAttribute('content', background);
  }

  function setChoice(value: ThemeChoice) {
    choice = value;
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* Ohne Speicher bleibt die Wahl nur für diese Sitzung bestehen */
    }
    applyChoice(value);
  }

  function handleToggleClick() {
    setChoice(next);
  }

  $effect(() => {
    // Einmalige Initialisierung nach der Hydration und Nachführen der
    // Systemeinstellung, solange „System" gewählt ist.
    const initial = readStoredChoice();
    choice = initial;
    applyChoice(initial);

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (choice === 'system') applyChoice('system');
    };
    query.addEventListener('change', onSystemChange);
    return () => query.removeEventListener('change', onSystemChange);
  });
</script>

<button type="button" class="theme-toggle" aria-label={label} title={label} onclick={handleToggleClick}>
  <Icon name={ICONS[choice]} size={16} />
</button>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--color-ink-subtle);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast);
  }

  .theme-toggle:hover {
    border-color: var(--color-line-strong);
    color: var(--color-ink);
  }
</style>
