<script lang="ts">
  /**
   * Bedienleiste des Glossars: Suchfeld mit Live-Filter, Kategorie-Auswahl
   * und alphabetische Sprungleiste.
   *
   * Die Filterlogik selbst steht in `$lib/data/glossary`.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { GLOSSARY_CATEGORIES, type GlossaryCategory } from '$lib/data/glossary';

  interface Props {
    /** Suchtext */
    query: string;
    /** Aktive Kategorie oder null für alle */
    category: GlossaryCategory | null;
    /** Buchstaben, zu denen es Einträge gibt */
    letters: string[];
    /** Buchstaben, die im aktuellen Filter vorkommen */
    availableLetters: string[];
    /** Zahl der angezeigten Einträge */
    count: number;
    /** Zahl aller Einträge */
    total: number;
  }

  let {
    query = $bindable(),
    category = $bindable(),
    letters,
    availableLetters,
    count,
    total
  }: Props = $props();

  const searchId = 'glossar-suche';

  function handleClear() {
    query = '';
    category = null;
  }

  function selectCategory(next: GlossaryCategory | null) {
    category = category === next ? null : next;
  }
</script>

<div class="controls">
  <div class="controls__search" role="search">
    <label class="controls__label" for={searchId}>Begriff suchen</label>
    <div class="controls__field">
      <Icon name="search" size={18} />
      <input
        id={searchId}
        class="controls__input"
        type="search"
        autocomplete="off"
        placeholder="dB, Fresnel, MUF …"
        bind:value={query}
        aria-describedby="glossar-trefferzahl"
      />
    </div>
    <p class="controls__count" id="glossar-trefferzahl" role="status" aria-live="polite">
      {count} von {total} Begriffen
    </p>
  </div>

  <div class="controls__categories" role="group" aria-label="Nach Thema filtern">
    <Button
      size="sm"
      variant={category === null ? 'primary' : 'ghost'}
      pressed={category === null}
      onclick={() => selectCategory(null)}
    >
      Alle
    </Button>
    {#each GLOSSARY_CATEGORIES as item (item.id)}
      <Button
        size="sm"
        variant={category === item.id ? 'primary' : 'ghost'}
        pressed={category === item.id}
        onclick={() => selectCategory(item.id)}
      >
        {item.label}
      </Button>
    {/each}
    {#if query || category}
      <Button size="sm" variant="secondary" icon="reset" onclick={handleClear}>
        Filter zurücksetzen
      </Button>
    {/if}
  </div>

  <nav class="controls__alphabet" aria-label="Zum Anfangsbuchstaben springen">
    <ul>
      {#each letters as letter (letter)}
        {@const active = availableLetters.includes(letter)}
        <li>
          {#if active}
            <a href="#buchstabe-{letter}">{letter}</a>
          {:else}
            <span aria-disabled="true">{letter}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .controls__label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
    margin-bottom: 0.25rem;
  }

  .controls__field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    max-width: 32rem;
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
    margin: 0.375rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .controls__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .controls__alphabet ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .controls__alphabet a,
  .controls__alphabet span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.25rem 0.375rem;
    border-radius: var(--radius-control);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    text-decoration: none;
  }

  .controls__alphabet a {
    color: var(--color-brand-ink);
    background-color: var(--color-elevated);
  }

  .controls__alphabet a:hover {
    background-color: var(--color-hover);
  }

  .controls__alphabet span {
    color: var(--color-ink-faint);
  }
</style>
