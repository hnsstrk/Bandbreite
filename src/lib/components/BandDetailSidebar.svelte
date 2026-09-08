<script lang="ts">
  import {
    ITU_BANDS,
    IEEE_BANDS,
    NATO_BANDS,
    CIVILIAN_BANDS,
    formatFrequencyRange,
    type FrequencyBand,
    type ITUBand
  } from '$lib/data/bands';
  import PropagationModeIndicator from '$lib/components/ui/PropagationModeIndicator.svelte';
  import BandTagGroups from '$lib/components/BandTagGroups.svelte';
  import BandServiceList from '$lib/components/BandServiceList.svelte';
  import { formatWavelength } from '$lib/utils/formatting';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
  import {
    MAX_SIDEBAR_APPLICATIONS,
    applicationsFor,
    bandsAt,
    lookupFrequency,
    pickPrimaryBand,
    resolveSelectedBand
  } from '$lib/components/bandDetail';

  interface Props {
    frequencyHz?: number | null;
    selectedBand?: FrequencyBand | null;
  }

  let { frequencyHz = null, selectedBand = null }: Props = $props();

  let c = $derived(speedOfLight.value);

  function isItuBand(band: FrequencyBand): band is ITUBand {
    return band.category === 'itu';
  }

  let effectiveSelectedBand = $derived(resolveSelectedBand(selectedBand, frequencyHz));
  let lookupFrequencyHz = $derived(lookupFrequency(effectiveSelectedBand, frequencyHz));

  let ituBands = $derived(bandsAt(ITU_BANDS, lookupFrequencyHz));
  let ieeeBands = $derived(bandsAt(IEEE_BANDS, lookupFrequencyHz));
  let natoBands = $derived(bandsAt(NATO_BANDS, lookupFrequencyHz));
  let civilianBands = $derived(bandsAt(CIVILIAN_BANDS, lookupFrequencyHz));

  let primaryItuBand = $derived(ituBands.length > 0 ? ituBands[0] : null);
  let primaryBand = $derived(
    pickPrimaryBand({
      selected: effectiveSelectedBand,
      ieee: ieeeBands,
      itu: ituBands,
      nato: natoBands,
      civilian: civilianBands
    })
  );

  let applications = $derived(applicationsFor(effectiveSelectedBand, lookupFrequencyHz));
  let hasBandTags = $derived(
    ituBands.length > 0 || ieeeBands.length > 0 || natoBands.length > 0 || civilianBands.length > 0
  );
</script>

<aside class="sidebar" aria-label="Bandinformationen">
  {#if !lookupFrequencyHz || lookupFrequencyHz <= 0}
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <p>Band im Spektrum anklicken oder Frequenz eingeben</p>
    </div>
  {:else}
    {#if primaryBand}
      <div class="sidebar-header">
        <span
          class="color-dot"
          style="background-color: {primaryBand.color === 'visible' ? 'var(--color-series-2)' : primaryBand.color}"
        ></span>
        <div class="header-text">
          <h3 class="band-name">{primaryBand.nameDE}</h3>
          <span class="band-freq">{formatFrequencyRange(primaryBand.minHz, primaryBand.maxHz)}</span>
        </div>
      </div>

      <div class="info-row">
        <span class="info-label">Wellenlänge</span>
        <span class="info-value font-mono">
          {formatWavelength(c / primaryBand.maxHz)} – {formatWavelength(c / primaryBand.minHz)}
        </span>
      </div>
    {/if}

    <div class="sidebar-section">
      <span class="section-label">Ausbreitung</span>
      <PropagationModeIndicator frequencyHz={lookupFrequencyHz} size="sm" />
    </div>

    {#if hasBandTags}
      <div class="sidebar-section">
        <span class="section-label">Bänder</span>
        <BandTagGroups itu={ituBands} ieee={ieeeBands} nato={natoBands} civilian={civilianBands} />
      </div>
    {/if}

    {#if primaryItuBand && isItuBand(primaryItuBand) && primaryItuBand.applications.length > 0}
      <div class="sidebar-section">
        <span class="section-label">Typische Nutzung</span>
        <div class="app-tags">
          {#each primaryItuBand.applications as app (app)}
            <span class="app-tag">{app}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if applications.length > 0}
      <div class="sidebar-section">
        <span class="section-label">Dienste ({applications.length})</span>
        <BandServiceList {applications} max={MAX_SIDEBAR_APPLICATIONS} />
      </div>
    {/if}

    {#if primaryItuBand && isItuBand(primaryItuBand) && primaryItuBand.notes}
      <div class="sidebar-section notes-section">
        <span class="section-label">Hinweis</span>
        <p class="notes-text">{primaryItuBand.notes}</p>
      </div>
    {/if}
  {/if}
</aside>

<style>
  .sidebar {
    position: sticky;
    top: 1rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    color: var(--color-text-disabled);
    text-align: center;
    font-size: var(--font-size-sm);
  }

  .empty-icon {
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.5;
  }

  .sidebar-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .color-dot {
    width: 1rem;
    height: 1rem;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    margin-top: 0.2rem;
  }

  .header-text {
    min-width: 0;
  }

  .band-name {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.3;
  }

  .band-freq {
    font-size: var(--font-size-xs);
    font-family: var(--font-mono);
    color: var(--color-text-tertiary);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
  }

  .info-label {
    color: var(--color-text-tertiary);
  }

  .info-value {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .section-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .app-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .app-tag {
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .notes-section {
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 0.75rem;
  }

  .notes-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }

  @media (max-width: 1023px) {
    .sidebar {
      position: static;
      max-height: none;
    }
  }
</style>
