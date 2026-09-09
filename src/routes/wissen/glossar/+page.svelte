<script lang="ts">
  /**
   * Glossar: alle Fachbegriffe der Anwendung als durchsuchbare Liste.
   *
   * Suchtext und Kategorie stehen in der Adresszeile (`?q=` und `?k=`),
   * jeder Begriff hat eine Anker-ID (`#dbm`) — beides zusammen ergibt einen
   * teilbaren Link auf einen einzelnen Eintrag.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import {
    GLOSSARY_CATEGORIES,
    GLOSSARY_LETTERS,
    GLOSSARY_SORTED,
    filterGlossary,
    glossaryLetter,
    type GlossaryCategory
  } from '$lib/data/glossary';
  import {
    UrlStateSync,
    defaultValues,
    readParams,
    syncParamsOnNavigate,
    type ParamSpecs
  } from '$lib/utils/urlState.svelte';
  import GlossaryControls from './GlossaryControls.svelte';
  import GlossaryList from './GlossaryList.svelte';

  const CATEGORY_IDS = GLOSSARY_CATEGORIES.map((item) => item.id);

  /** Suchtext und Kategorie in der Adresszeile. */
  const GLOSSARY_PARAMS = {
    q: { default: '' },
    k: { default: '', options: ['', ...CATEGORY_IDS] }
  } satisfies ParamSpecs;

  const initial = browser ? readParams(page.url.searchParams, GLOSSARY_PARAMS) : defaultValues(GLOSSARY_PARAMS);

  let query = $state(initial.q);
  let category = $state<GlossaryCategory | null>(initial.k ? (initial.k as GlossaryCategory) : null);

  const sync = new UrlStateSync(GLOSSARY_PARAMS);
  // Den Startzustand übernehmen, damit ein Sprungziel (`#dbm`) beim Laden
  // nicht durch eine überflüssige Aktualisierung der Adresszeile verloren geht.
  if (browser) sync.adopt(page.url.search);

  syncParamsOnNavigate(GLOSSARY_PARAMS, sync, (next) => {
    query = next.q;
    category = next.k ? (next.k as GlossaryCategory) : null;
  });

  let values = $derived({ q: query, k: category ?? '' });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let entries = $derived(filterGlossary({ query, category }));
  let availableLetters = $derived([...new Set(entries.map(glossaryLetter))]);
</script>

<div class="page-content">
  <PageHero
    title="Glossar"
    icon="book"
    lead="Die Fachbegriffe dieser Anwendung in kurzen Definitionen — von Dezibel über Fresnel-Zone bis Zeitzeichensender, mit Formel, Einheit und Weiterverweis."
    meta={[
      { label: 'Begriffe', value: String(GLOSSARY_SORTED.length) },
      { label: 'Themen', value: String(GLOSSARY_CATEGORIES.length) }
    ]}
  />

  <GlossaryControls
    bind:query
    bind:category
    letters={GLOSSARY_LETTERS}
    {availableLetters}
    count={entries.length}
    total={GLOSSARY_SORTED.length}
  />

  <div class="glossary">
    <GlossaryList {entries} />
  </div>

  <RelatedTopics href="/wissen/glossar/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .glossary {
    min-width: 0;
  }
</style>
