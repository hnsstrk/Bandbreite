<script lang="ts">
  /**
   * Ergebnisseite der globalen Suche.
   *
   * Sie zeigt dieselben Treffer wie die Command-Palette (`Strg+K`), aber
   * vollständig: alle Gruppen mit Zähler, Filter-Chips je Ergebnistyp und den
   * Frequenz-Modus. Die Seite wird prerendert und ist ohne Daten sinnvoll —
   * die Anfrage steht in `?q=` und wird erst im Browser ausgewertet.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import type { SearchEntryType } from '$lib/data/searchIndex';
  import {
    UrlStateSync,
    defaultValues,
    readParams,
    syncParamsOnNavigate,
    type ParamSpecs
  } from '$lib/utils/urlState.svelte';
  import SearchControls from './SearchControls.svelte';
  import SearchResults from './SearchResults.svelte';
  import {
    SEARCH_SUGGESTIONS,
    countEntries,
    filterGroups,
    frequencyResult,
    resultGroups,
    searchPageHref
  } from './searchPage';

  /** Nur die Anfrage steht in der Adresszeile; der Typfilter bleibt lokal. */
  const SEARCH_PARAMS = { q: { default: '' } } satisfies ParamSpecs;

  const initial = browser ? readParams(page.url.searchParams, SEARCH_PARAMS) : defaultValues(SEARCH_PARAMS);

  let query = $state(initial.q);
  let type = $state<SearchEntryType | null>(null);

  const sync = new UrlStateSync(SEARCH_PARAMS);
  if (browser) sync.adopt(page.url.search);

  // Ein Sprung aus der Palette auf dieselbe Route ändert nur `?q=`.
  syncParamsOnNavigate(SEARCH_PARAMS, sync, (next) => {
    query = next.q;
    type = null;
  });

  $effect(() => {
    sync.push({ q: query });
    return () => sync.cancel();
  });

  const allGroups = $derived(resultGroups(query));
  const shownGroups = $derived(filterGroups(allGroups, type));
  const total = $derived(countEntries(allGroups));
  const shown = $derived(countEntries(shownGroups));
  const frequency = $derived(frequencyResult(query));
  const empty = $derived(query.trim().length > 0 && total === 0 && !frequency);

  // Ein Filter, dessen Gruppe verschwindet, würde eine leere Liste zeigen.
  $effect(() => {
    if (type && !allGroups.some((group) => group.type === type)) type = null;
  });
</script>

<div class="page">
  <PageHero
    title="Suche"
    icon="search"
    lead="Alle Treffer auf einen Blick: Seiten und Werkzeuge, interaktive Widgets, Frequenzbänder, Funkdienste, Sender und Begriffe. Eine Frequenzeingabe wie „2,4 GHz“ öffnet zusätzlich die passenden Sprünge."
  />

  <SearchControls bind:query bind:type groups={allGroups} count={shown} {total} />

  <div class="page__results">
    <SearchResults groups={shownGroups} {frequency} />

    {#if empty}
      <Callout tone="info" title="Keine Treffer">
        Zu „{query}“ gibt es keinen Eintrag. Andere Schreibweise versuchen, einen kürzeren Begriff eingeben oder eine
        Frequenz wie <strong>2,4 GHz</strong> eintippen — dann führt die Suche direkt in Spektrum, Bänderdatenbank und Rechner.
      </Callout>
    {/if}

    {#if empty || !query.trim()}
      <section class="suggestions" aria-labelledby="vorschlaege-heading">
        <h2 class="suggestions__title" id="vorschlaege-heading">Vorschläge</h2>
        <ul class="suggestions__list">
          {#each SEARCH_SUGGESTIONS as suggestion (suggestion.query)}
            <li>
              <Button size="sm" variant="secondary" href={searchPageHref(suggestion.query)}>
                {suggestion.query}
              </Button>
              <span class="suggestions__hint">{suggestion.hint}</span>
            </li>
          {/each}
        </ul>
        <p class="suggestions__hint suggestions__hint--block">
          Die Suche lässt sich überall mit <kbd>Strg</kbd>+<kbd>K</kbd> oder <kbd>/</kbd> öffnen. Vollständig
          aufgelistet sind alle Seiten in der
          <a href="/service/sitemap/">Sitemap</a>.
        </p>
      </section>
    {/if}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page__results {
    min-width: 0;
  }

  .suggestions {
    margin-top: 1.5rem;
  }

  .suggestions__title {
    margin: 0 0 0.5rem;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .suggestions__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .suggestions__list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .suggestions__hint {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .suggestions__hint--block {
    display: block;
    margin: 1rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .suggestions__hint--block a {
    color: var(--color-brand);
  }

  kbd {
    padding: 0.0625rem 0.3125rem;
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    color: var(--color-ink);
    background-color: var(--color-elevated);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
  }
</style>
