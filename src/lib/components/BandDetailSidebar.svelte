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
  import {
    getApplicationsForFrequency,
    ALL_APPLICATIONS,
    CATEGORY_NAMES,
    type RFApplication
  } from '$lib/data/applications';
  import PropagationModeIndicator from '$lib/components/ui/PropagationModeIndicator.svelte';
  import { formatWavelength } from '$lib/utils/formatting';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

  interface Props {
    frequencyHz?: number | null;
    selectedBand?: FrequencyBand | null;
  }

  let { frequencyHz = null, selectedBand = null }: Props = $props();

  let c = $derived(speedOfLight.value);

  function isItuBand(band: FrequencyBand): band is ITUBand {
    return band.category === 'itu';
  }

  // If selected band no longer matches frequency, ignore it
  let effectiveSelectedBand = $derived.by(() => {
    if (!selectedBand) return null;
    if (frequencyHz && (frequencyHz < selectedBand.minHz || frequencyHz > selectedBand.maxHz)) {
      return null;
    }
    return selectedBand;
  });

  let lookupFrequencyHz = $derived.by(() => {
    if (effectiveSelectedBand) return Math.sqrt(effectiveSelectedBand.minHz * effectiveSelectedBand.maxHz);
    return frequencyHz;
  });

  // Find bands at the current frequency
  let ituBands = $derived(
    lookupFrequencyHz && lookupFrequencyHz > 0
      ? ITU_BANDS.filter(b => lookupFrequencyHz! >= b.minHz && lookupFrequencyHz! <= b.maxHz)
      : []
  );

  let ieeeBands = $derived(
    lookupFrequencyHz && lookupFrequencyHz > 0
      ? IEEE_BANDS.filter(b => lookupFrequencyHz! >= b.minHz && lookupFrequencyHz! <= b.maxHz)
      : []
  );

  let natoBands = $derived(
    lookupFrequencyHz && lookupFrequencyHz > 0
      ? NATO_BANDS.filter(b => lookupFrequencyHz! >= b.minHz && lookupFrequencyHz! <= b.maxHz)
      : []
  );

  let civilianBands = $derived(
    lookupFrequencyHz && lookupFrequencyHz > 0
      ? CIVILIAN_BANDS.filter(b => lookupFrequencyHz! >= b.minHz && lookupFrequencyHz! <= b.maxHz)
      : []
  );

  // Primary ITU band for header
  let primaryItuBand = $derived(ituBands.length > 0 ? ituBands[0] : null);

  // Primary display band
  let primaryBand = $derived.by(() => {
    if (effectiveSelectedBand) return effectiveSelectedBand;
    if (primaryItuBand) return primaryItuBand as FrequencyBand;
    if (ieeeBands.length > 0) return ieeeBands[0];
    if (natoBands.length > 0) return natoBands[0];
    if (civilianBands.length > 0) return civilianBands[0];
    return null;
  });

  // Applications — range-based for selected band, point-based for frequency
  let applications = $derived.by(() => {
    if (effectiveSelectedBand) {
      return ALL_APPLICATIONS.filter(
        app => app.minHz < effectiveSelectedBand!.maxHz && app.maxHz > effectiveSelectedBand!.minHz
      );
    }
    if (!lookupFrequencyHz || lookupFrequencyHz <= 0) return [] as RFApplication[];
    return getApplicationsForFrequency(lookupFrequencyHz);
  });

  const MAX_APPS = 15;
  let hasMoreApps = $derived(applications.length > MAX_APPS);
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
    <!-- Header -->
    {#if primaryBand}
      <div class="sidebar-header">
        <span class="color-dot" style="background-color: {primaryBand.color === 'visible' ? '#22c55e' : primaryBand.color}"></span>
        <div class="header-text">
          <h3 class="band-name">{primaryBand.nameDE}</h3>
          <span class="band-freq">{formatFrequencyRange(primaryBand.minHz, primaryBand.maxHz)}</span>
        </div>
      </div>

      <!-- Wavelength -->
      <div class="info-row">
        <span class="info-label">Wellenlänge</span>
        <span class="info-value font-mono">
          {formatWavelength(c / primaryBand.maxHz)} – {formatWavelength(c / primaryBand.minHz)}
        </span>
      </div>
    {/if}

    <!-- Propagation -->
    {#if lookupFrequencyHz}
      <div class="sidebar-section">
        <span class="section-label">Ausbreitung</span>
        <PropagationModeIndicator frequencyHz={lookupFrequencyHz} size="sm" />
      </div>
    {/if}

    <!-- Band Tags -->
    {#if ituBands.length > 0 || ieeeBands.length > 0 || natoBands.length > 0 || civilianBands.length > 0}
      <div class="sidebar-section">
        <span class="section-label">Bänder</span>
        <div class="band-tags-container">
          {#if ituBands.length > 0}
            <div class="tag-group">
              <span class="tag-label">ITU</span>
              {#each ituBands as band (band.id)}
                <span class="band-tag" style="background-color: {band.color}">{band.name}</span>
              {/each}
            </div>
          {/if}
          {#if ieeeBands.length > 0}
            <div class="tag-group">
              <span class="tag-label">IEEE</span>
              {#each ieeeBands as band (band.id)}
                <span class="band-tag" style="background-color: {band.color}">{band.name}</span>
              {/each}
            </div>
          {/if}
          {#if natoBands.length > 0}
            <div class="tag-group">
              <span class="tag-label">NATO</span>
              {#each natoBands as band (band.id)}
                <span class="band-tag" style="background-color: {band.color}">{band.name}</span>
              {/each}
            </div>
          {/if}
          {#if civilianBands.length > 0}
            <div class="tag-group">
              <span class="tag-label">Zivil</span>
              {#each civilianBands as band (band.id)}
                <span class="band-tag" style="background-color: {band.color}">{band.nameDE}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- ITU-specific: Typical applications -->
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

    <!-- RF Applications from database -->
    {#if applications.length > 0}
      <div class="sidebar-section">
        <span class="section-label">Dienste ({applications.length})</span>
        <div class="services-list">
          {#each applications.slice(0, MAX_APPS) as app (app.id)}
            <div class="service-item">
              <span class="service-name">{app.nameDE}</span>
              <span class="service-freq">{formatFrequencyRange(app.minHz, app.maxHz)}</span>
            </div>
          {/each}
        </div>
        {#if hasMoreApps}
          <span class="more-count">+ {applications.length - MAX_APPS} weitere Dienste</span>
        {/if}
      </div>
    {/if}

    <!-- Notes -->
    {#if primaryItuBand && isItuBand(primaryItuBand) && primaryItuBand.notes}
      <div class="sidebar-section notes-section">
        <span class="section-label">Hinweis</span>
        <p class="notes-text">{primaryItuBand.notes}</p>
      </div>
    {/if}
  {/if}

  <!-- Grundlagen - always visible -->
  <div class="basics-divider"></div>
  <div class="basics-section">
    <span class="section-label">Grundlagen</span>
    <div class="basics-cards">
      <div class="basics-card">
        <span class="basics-card-title">Frequenz und Wellenlänge</span>
        <p class="basics-card-text">
          Elektromagnetische Wellen breiten sich mit Lichtgeschwindigkeit aus. Frequenz und Wellenlänge sind über die Beziehung <span class="formula">λ = c / f</span> verknüpft. Höhere Frequenzen bedeuten kürzere Wellenlängen.
        </p>
      </div>
      <div class="basics-card">
        <span class="basics-card-title">Ausbreitungseigenschaften</span>
        <p class="basics-card-text">
          Niedrige Frequenzen folgen der Erdkrümmung und durchdringen Hindernisse. Hohe Frequenzen breiten sich geradlinig aus, werden aber von Gebäuden und Vegetation stark gedämpft.
        </p>
      </div>
      <div class="basics-card">
        <span class="basics-card-title">Bandbreite und Datenrate</span>
        <p class="basics-card-text">
          Höhere Frequenzbänder bieten mehr Bandbreite für schnellere Datenübertragung. Nach Shannon-Hartley steigt die Kanalkapazität mit der verfügbaren Bandbreite.
        </p>
      </div>
      <div class="basics-card">
        <span class="basics-card-title">Atmosphärische Dämpfung</span>
        <p class="basics-card-text">
          Die Atmosphäre absorbiert bestimmte Frequenzen stark. Besonders bei 22 GHz (Wasserdampf) und 60 GHz (Sauerstoff) treten Absorptionspeaks auf.
        </p>
      </div>
    </div>
  </div>
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

  .band-tags-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .tag-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-disabled);
    min-width: 2.5rem;
  }

  .band-tag {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: white;
    box-shadow: var(--shadow-sm);
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

  .services-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    gap: 0.5rem;
  }

  .service-name {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .service-freq {
    font-size: 0.65rem;
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .more-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    padding-left: 0.5rem;
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

  .basics-divider {
    border-top: 1px solid var(--color-border-subtle);
    margin-top: 0.25rem;
  }

  .basics-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .basics-cards {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .basics-card {
    padding: 0.5rem 0.625rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-subtle);
  }

  .basics-card-title {
    display: block;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .basics-card-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }

  .formula {
    font-family: var(--font-mono);
    color: var(--color-accent, #3b82f6);
    font-weight: var(--font-weight-semibold);
  }

  @media (max-width: 1023px) {
    .sidebar {
      position: static;
      max-height: none;
    }
  }
</style>
