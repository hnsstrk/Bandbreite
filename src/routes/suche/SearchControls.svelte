<script lang="ts">
  /**
   * Kopf der Suchseite: Suchfeld, Filter-Chips je Ergebnistyp und Trefferzahl.
   *
   * Das Feld ist die einzige Stelle, an der `?q=` verändert wird; die Seite
   * schreibt den Wert entprellt in die Adresszeile.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { formatLocaleNumber } from '$lib/utils/formatting';
  import type { SearchEntryType } from '$lib/data/searchIndex';
  import type { SearchPageGroup } from './searchPage';

  interface Props {
    /** Suchtext (zweiweg gebunden) */
    query: string;
    /** Aktiver Typfilter oder null für alle */
    type: SearchEntryType | null;
    /** Alle Gruppen mit Treffern — liefert die Chips und ihre Zähler */
    groups: SearchPageGroup[];
    /** Zahl der angezeigten Treffer */
    count: number;
    /** Zahl aller Treffer vor dem Typfilter */
    total: number;
  }

  let { query = $bindable(), type = $bindable(), groups, count, total }: Props = $props();

  const searchId = 'suche-eingabe';
  const countId = 'suche-trefferzahl';

  function selectType(next: SearchEntryType | null) {
    type = type === next ? null : next;
  }

  function handleClearClick() {
    query = '';
    type = null;
  }

  function handleSubmit(event: SubmitEvent) {
    // Ergebnisse stehen bereits live in der Liste — abschicken lädt nur neu.
    event.preventDefault();
  }
</script>

<form class="controls" role="search" aria-label="Suche in Bandbreite" onsubmit={handleSubmit}>
  <div class="controls__search">
    <label class="controls__label" for={searchId}>Suchbegriff oder Frequenz</label>
    <div class="controls__field">
      <Icon name="search" size={18} />
      <input
        id={searchId}
        class="controls__input"
        type="search"
        autocomplete="off"
        placeholder="Seite, Widget, Band, Dienst oder 2,4 GHz …"
        bind:value={query}
        aria-describedby={countId}
      />
      {#if query}
        <Button size="sm" variant="ghost" icon="close" iconOnly label="Suche leeren" onclick={handleClearClick} />
      {/if}
    </div>
  </div>

  <p class="controls__count" id={countId} role="status" aria-live="polite">
    {#if !query.trim()}
      Noch kein Suchbegriff eingegeben.
    {:else if total === 0}
      Keine Treffer für „{query}“.
    {:else if type}
      {formatLocaleNumber(count)} von {formatLocaleNumber(total)} Treffern für „{query}“
    {:else}
      {formatLocaleNumber(total)} Treffer für „{query}“
    {/if}
  </p>

  {#if groups.length > 0}
    <div class="controls__chips" role="group" aria-label="Nach Ergebnistyp filtern">
      <Button
        size="sm"
        variant={type === null ? 'primary' : 'ghost'}
        pressed={type === null}
        onclick={() => selectType(null)}
      >
        Alle ({formatLocaleNumber(total)})
      </Button>
      {#each groups as group (group.type)}
        <Button
          size="sm"
          variant={type === group.type ? 'primary' : 'ghost'}
          pressed={type === group.type}
          onclick={() => selectType(group.type)}
        >
          {group.label} ({formatLocaleNumber(group.entries.length)})
        </Button>
      {/each}
    </div>
  {/if}
</form>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .controls__label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .controls__field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 36rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-input);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-control);
    color: var(--color-ink-subtle);
  }

  .controls__field:focus-within {
    border-color: var(--color-focus-ring);
  }

  .controls__input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--color-ink);
    font-size: var(--font-size-base);
  }

  .controls__input::placeholder {
    color: var(--color-ink-faint);
  }

  .controls__count {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    min-height: 1.25em;
  }

  .controls__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
</style>
