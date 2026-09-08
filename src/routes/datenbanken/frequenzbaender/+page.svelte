<script lang="ts">
  /**
   * Frequenzbänder aller fünf Systeme mit Frequenzsuche und Detailtafel.
   * Tabelle, Detailtafel und Kategoriedaten liegen in eigenen Dateien daneben.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import {
    getAllBandsForFrequency,
    getPropagationModeDescriptionDE,
    type FrequencyBandCategory,
    type PropagationModeType
  } from '$lib/data/frequencyBands';
  import { formatFrequency } from '$lib/utils/formatting';
  import { clamp } from '$lib/utils/handlers';
  import { pickBestUnit } from '$lib/components/ui/numberInput.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import BandDetails from './BandDetails.svelte';
  import BandTable from './BandTable.svelte';
  import {
    BAND_TABS,
    PROPAGATION_CONFIG,
    SEARCH_MAX_HZ,
    SEARCH_MIN_HZ,
    SEARCH_UNITS
  } from './bandCategories.svelte';

  /** Standardfrequenz der Suche, wenn die URL nichts vorgibt. */
  const DEFAULT_SEARCH_HZ = 100e6;

  /**
   * `?f=<Hertz>` aus Befehlspalette und Suchindex. Beim Prerendern sind
   * Suchparameter gesperrt, deshalb der `browser`-Zweig; unlesbare Werte
   * werden verworfen, zu große auf den Suchbereich begrenzt.
   */
  function frequencyFromSearch(search: string): number | null {
    const raw = new URLSearchParams(search).get('f');
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return null;
    return clamp(value, SEARCH_MIN_HZ, SEARCH_MAX_HZ);
  }

  /** Passende Anzeigeeinheit zu einer Frequenz. */
  function unitFor(hz: number): string {
    return pickBestUnit(hz, SEARCH_UNITS)?.id ?? 'MHz';
  }

  const initialSearchHz = (browser ? frequencyFromSearch(page.url.search) : null) ?? DEFAULT_SEARCH_HZ;

  let activeTab = $state<string>('ieee');
  let searchFrequencyHz = $state(initialSearchHz);
  let searchUnit = $state(unitFor(initialSearchHz));
  let selectedId = $state<string | null>(null);

  /**
   * Auch bei einer Navigation auf dieselbe Route (Palette, interne Links,
   * Vor/Zurück) die Suchfrequenz nachziehen — sonst zeigt die Adresszeile
   * etwas anderes als das Feld.
   */
  let appliedSearch = browser ? page.url.search : '';
  $effect(() => {
    const search = page.url.search;
    if (search === appliedSearch) return;
    appliedSearch = search;
    const next = frequencyFromSearch(search);
    if (next === null) return;
    searchFrequencyHz = next;
    searchUnit = unitFor(next);
  });

  let tabItems = $derived(
    BAND_TABS.map((tab) => ({ id: tab.id, label: tab.label, badge: String(tab.bands.length) }))
  );

  let activeBands = $derived(
    BAND_TABS.find((tab) => tab.id === (activeTab as FrequencyBandCategory))?.bands ?? []
  );

  let searchResults = $derived(
    searchFrequencyHz > 0 ? getAllBandsForFrequency(searchFrequencyHz) : []
  );

  let allBands = $derived(BAND_TABS.flatMap((tab) => tab.bands));
  let selectedBand = $derived(allBands.find((band) => band.id === selectedId) ?? null);

  let totalBands = $derived(BAND_TABS.reduce((sum, tab) => sum + tab.bands.length, 0));

  function handleResultClick(id: string) {
    selectedId = selectedId === id ? null : id;
  }
</script>

<div class="page-content">
  <PageHero
    kicker="Datenbanken"
    title="Frequenzbänder"
    icon="spectrum"
    lead="Von ELF bis THF: die Bänder der ITU, die Radarbänder nach IEEE, die NATO-Einteilung sowie Amateurfunk- und Rundfunkbänder — mit Ausbreitungsverhalten und typischen Anwendungen."
    meta={[
      { label: 'Systeme', value: '5' },
      { label: 'Bänder', value: String(totalBands) }
    ]}
  />

  <Card title="Frequenzsuche" subtitle="Welche Bänder decken eine Frequenz ab?" icon="search">
    <div class="search">
      <NumberInput
        label="Frequenz"
        bind:value={searchFrequencyHz}
        bind:unit={searchUnit}
        units={SEARCH_UNITS}
        min={SEARCH_MIN_HZ}
        max={SEARCH_MAX_HZ}
        slider
        sliderScale="log"
        hint="3 Hz bis 300 GHz"
      />

      <div class="search__results" role="status" aria-live="polite">
        {#if searchResults.length > 0}
          <p class="search__label">
            {searchResults.length} Bänder enthalten {formatFrequency(searchFrequencyHz)}:
          </p>
          <ul class="search__list">
            {#each searchResults as band (band.id)}
              <li>
                <Button
                  size="sm"
                  variant={selectedId === band.id ? 'primary' : 'ghost'}
                  pressed={selectedId === band.id}
                  onclick={() => handleResultClick(band.id)}
                >
                  {band.nameDE} ({band.category.toUpperCase()})
                </Button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="search__label">
            Kein Band enthält {formatFrequency(searchFrequencyHz)}.
          </p>
        {/if}
      </div>
    </div>
  </Card>

  <Tabs tabs={tabItems} bind:active={activeTab} label="Bandsysteme">
    {#snippet panel()}
      <BandTable
        bands={activeBands}
        {selectedId}
        onselect={(id) => (selectedId = id)}
      />
    {/snippet}
  </Tabs>

  {#if selectedBand}
    <BandDetails band={selectedBand} onclose={() => (selectedId = null)} />
  {/if}

  <section class="legend" aria-labelledby="ausbreitungsmodi">
    <SectionHeader
      title="Ausbreitungsmodi"
      level={2}
      id="ausbreitungsmodi"
      description="Wie sich Wellen des jeweiligen Bandes hauptsächlich fortpflanzen."
    />
    <ul class="legend__list">
      {#each Object.entries(PROPAGATION_CONFIG) as [mode, config] (mode)}
        <li class="legend__item" style="--mode-color: {config.token}">
          <Icon name={config.icon} size={18} />
          <span>{getPropagationModeDescriptionDE(mode as PropagationModeType)}</span>
          <Badge tone="neutral">{config.short}</Badge>
        </li>
      {/each}
    </ul>
  </section>

  <RelatedTopics href="/datenbanken/frequenzbaender/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .search {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1.25rem;
    align-items: start;
  }

  .search__results {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search__label {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .search__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .legend {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .legend__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .legend__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-sunken);
    border-inline-start: 3px solid var(--mode-color);
    border-radius: var(--radius-control);
    color: var(--color-ink-muted);
  }
</style>
