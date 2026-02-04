<script lang="ts">
  import {
    ITU_FREQUENCY_BANDS,
    IEEE_FREQUENCY_BANDS,
    NATO_FREQUENCY_BANDS,
    AMATEUR_FREQUENCY_BANDS,
    BROADCAST_FREQUENCY_BANDS,
    getAllBandsForFrequency,
    getPropagationModeDescriptionDE,
    type FrequencyBandDetail,
    type FrequencyBandCategory,
    type PropagationModeType
  } from '$lib/data/frequencyBands';
  import { formatFrequency } from '$lib/utils/formatting';
  import { parseNumericInput } from '$lib/utils/handlers';

  // Tab definitions
  interface TabDefinition {
    id: FrequencyBandCategory;
    label: string;
    bands: FrequencyBandDetail[];
  }

  const tabs: TabDefinition[] = [
    { id: 'itu', label: 'ITU-Bänder', bands: ITU_FREQUENCY_BANDS },
    { id: 'ieee', label: 'IEEE-Radar', bands: IEEE_FREQUENCY_BANDS },
    { id: 'nato', label: 'NATO', bands: NATO_FREQUENCY_BANDS },
    { id: 'amateur', label: 'Amateurfunk', bands: AMATEUR_FREQUENCY_BANDS },
    { id: 'broadcast', label: 'Rundfunk', bands: BROADCAST_FREQUENCY_BANDS }
  ];

  // State
  let activeTab = $state<FrequencyBandCategory>('itu');
  let searchFrequency = $state<number>(100);
  let searchUnit = $state<string>('MHz');
  let selectedBand = $state<FrequencyBandDetail | null>(null);
  let showSearch = $state<boolean>(false);

  // Frequency unit factors
  const frequencyFactors: Record<string, number> = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9
  };

  // Derived values
  const activeBands = $derived(tabs.find((t) => t.id === activeTab)?.bands ?? []);

  const searchFrequencyHz = $derived(searchFrequency * (frequencyFactors[searchUnit] ?? 1e6));

  const searchResults = $derived(
    showSearch && searchFrequency > 0 ? getAllBandsForFrequency(searchFrequencyHz) : []
  );

  // Propagation mode colors and icons
  const propagationModeConfig: Record<PropagationModeType, { color: string; icon: string }> = {
    submarine: { color: '#1e3a5f', icon: '🌊' },
    groundWave: { color: '#2e7d32', icon: '🌍' },
    skyWave: { color: '#7c4dff', icon: '☁️' },
    lineOfSight: { color: '#f57c00', icon: '📡' },
    mixed: { color: '#5c6bc0', icon: '🔀' }
  };

  // Handlers
  function handleTabChange(tabId: FrequencyBandCategory) {
    activeTab = tabId;
    selectedBand = null;
  }

  function handleFrequencyChange(e: Event) {
    searchFrequency = parseNumericInput(e, 0);
  }

  function handleUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    searchUnit = target.value;
  }

  function handleBandClick(band: FrequencyBandDetail) {
    selectedBand = selectedBand?.id === band.id ? null : band;
  }

  function toggleSearch() {
    showSearch = !showSearch;
    if (!showSearch) {
      selectedBand = null;
    }
  }

  function closeDetail() {
    selectedBand = null;
  }

  function formatFrequencyRange(band: FrequencyBandDetail): string {
    const min = formatFrequency(band.frequencyHz.min);
    const max = formatFrequency(band.frequencyHz.max);
    return `${min} - ${max}`;
  }
</script>

<svelte:head>
  <title>Frequenzbänder - Bandbreite</title>
  <meta
    name="description"
    content="Detaillierte Übersicht aller Frequenzbänder: ITU, IEEE, NATO, Amateurfunk und Rundfunk. Mit Frequenzsuche und Banddetails."
  />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Frequenzbänder</h1>
    <p class="header-description">
      Detaillierte Übersicht aller Frequenzbänder von ELF bis THF. Entdecken Sie ITU-, IEEE-, NATO-,
      Amateurfunk- und Rundfunkbänder mit ihren Eigenschaften und Anwendungen.
    </p>
  </header>

  <!-- Frequency Search -->
  <section class="card search-section">
    <div class="search-header">
      <h2 class="text-heading-2">Frequenzsuche</h2>
      <button class="toggle-btn" onclick={toggleSearch} type="button">
        {showSearch ? 'Suche ausblenden' : 'Suche anzeigen'}
      </button>
    </div>

    {#if showSearch}
      <div class="search-controls">
        <div class="search-input-group">
          <label for="search-frequency">Frequenz eingeben:</label>
          <div class="input-with-unit">
            <input
              id="search-frequency"
              type="number"
              value={searchFrequency}
              oninput={handleFrequencyChange}
              min="0"
              step="any"
              class="search-input"
            />
            <select
              aria-label="Frequenz-Einheit auswählen"
              value={searchUnit}
              onchange={handleUnitChange}
              class="unit-select"
            >
              <option value="Hz">Hz</option>
              <option value="kHz">kHz</option>
              <option value="MHz">MHz</option>
              <option value="GHz">GHz</option>
            </select>
          </div>
        </div>

        {#if searchResults.length > 0}
          <div class="search-results">
            <h3>Gefundene Bänder für {formatFrequency(searchFrequencyHz)}:</h3>
            <div class="results-grid">
              {#each searchResults as band (band.id)}
                <button
                  class="result-item"
                  class:selected={selectedBand?.id === band.id}
                  onclick={() => handleBandClick(band)}
                  type="button"
                >
                  <span
                    class="result-category"
                    style="background-color: {propagationModeConfig[band.propagationMode].color}"
                  >
                    {band.category.toUpperCase()}
                  </span>
                  <span class="result-name">{band.nameDE}</span>
                </button>
              {/each}
            </div>
          </div>
        {:else if searchFrequency > 0}
          <p class="no-results">
            Keine Bänder für {formatFrequency(searchFrequencyHz)} gefunden.
          </p>
        {/if}
      </div>
    {/if}
  </section>

  <!-- Tab Navigation -->
  <div class="tab-nav" role="tablist" aria-label="Frequenzband-Kategorien">
    {#each tabs as tab (tab.id)}
      <button
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls="panel-{tab.id}"
        class="tab-btn"
        class:active={activeTab === tab.id}
        onclick={() => handleTabChange(tab.id)}
        type="button"
      >
        {tab.label}
        <span class="tab-count">{tab.bands.length}</span>
      </button>
    {/each}
  </div>

  <!-- Band List -->
  <div
    class="card bands-section"
    id="panel-{activeTab}"
    role="tabpanel"
    aria-labelledby="tab-{activeTab}"
  >
    <div class="bands-table-wrapper">
      <table class="bands-table" role="grid">
        <thead>
          <tr>
            <th scope="col">Band</th>
            <th scope="col">Frequenzbereich</th>
            <th scope="col">Wellenlänge</th>
            <th scope="col">Ausbreitung</th>
            <th scope="col" class="applications-col">Anwendungen</th>
          </tr>
        </thead>
        <tbody>
          {#each activeBands as band (band.id)}
            <tr
              class="band-row"
              class:selected={selectedBand?.id === band.id}
              onclick={() => handleBandClick(band)}
              onkeydown={(e) => e.key === 'Enter' && handleBandClick(band)}
              tabindex="0"
            >
              <td class="band-name">
                <span class="color-dot" style="background-color: {band.color}"></span>
                {band.nameDE}
              </td>
              <td class="band-frequency">{formatFrequencyRange(band)}</td>
              <td class="band-wavelength">{band.wavelength}</td>
              <td class="band-propagation">
                <span
                  class="propagation-badge"
                  style="background-color: {propagationModeConfig[band.propagationMode].color}20;
                         color: {propagationModeConfig[band.propagationMode].color};
                         border-color: {propagationModeConfig[band.propagationMode].color}"
                >
                  <span class="propagation-icon"
                    >{propagationModeConfig[band.propagationMode].icon}</span
                  >
                  {getPropagationModeDescriptionDE(band.propagationMode).split(' ')[0]}
                </span>
              </td>
              <td class="band-applications">
                {band.applicationsDE.slice(0, 2).join(', ')}
                {#if band.applicationsDE.length > 2}
                  <span class="more-apps">+{band.applicationsDE.length - 2}</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Band Detail Panel -->
  {#if selectedBand}
    <section class="card detail-panel">
      <div class="detail-header">
        <div class="detail-title">
          <span class="color-dot large" style="background-color: {selectedBand.color}"></span>
          <div>
            <h2>{selectedBand.nameDE}</h2>
            <p class="detail-subtitle">{selectedBand.name}</p>
          </div>
        </div>
        <button class="close-btn" onclick={closeDetail} aria-label="Details schliessen" type="button"
          >X</button
        >
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Frequenzbereich</span>
          <span class="detail-value">{formatFrequencyRange(selectedBand)}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Wellenlänge</span>
          <span class="detail-value">{selectedBand.wavelength}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Kategorie</span>
          <span class="detail-value category-badge">{selectedBand.category.toUpperCase()}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Ausbreitungsmodus</span>
          <span
            class="detail-value propagation-badge large"
            style="background-color: {propagationModeConfig[selectedBand.propagationMode].color}20;
                   color: {propagationModeConfig[selectedBand.propagationMode].color};
                   border-color: {propagationModeConfig[selectedBand.propagationMode].color}"
          >
            {propagationModeConfig[selectedBand.propagationMode].icon}
            {getPropagationModeDescriptionDE(selectedBand.propagationMode)}
          </span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Ausbreitungseigenschaften</h3>
        <p>{selectedBand.propagationDE}</p>
      </div>

      <div class="detail-section">
        <h3>Anwendungen</h3>
        <div class="applications-list">
          {#each selectedBand.applicationsDE as app (app)}
            <span class="application-tag">{app}</span>
          {/each}
        </div>
      </div>

      {#if selectedBand.notes}
        <div class="detail-section notes">
          <h3>Hinweise</h3>
          <p>{selectedBand.notes}</p>
        </div>
      {/if}
    </section>
  {/if}

  <!-- Legend -->
  <section class="card legend-section">
    <h2 class="text-heading-2">Ausbreitungsmodi</h2>
    <div class="legend-grid">
      {#each Object.entries(propagationModeConfig) as [mode, config] (mode)}
        <div class="legend-item">
          <span
            class="legend-badge"
            style="background-color: {config.color}20; color: {config.color}; border-color: {config.color}"
          >
            {config.icon}
          </span>
          <span class="legend-text"
            >{getPropagationModeDescriptionDE(mode as PropagationModeType)}</span
          >
        </div>
      {/each}
    </div>
  </section>

  <!-- Verwandte Themen -->
  <section class="card related-section">
    <h2 class="text-heading-2">Verwandte Themen</h2>
    <p class="related-intro">
      Vertiefen Sie Ihr Wissen über Frequenzbänder mit diesen weiterführenden Themen und Werkzeugen.
    </p>
    <div class="related-grid">
      <a href="/spektrum" class="related-card">
        <h3>EM-Spektrum & Bänder</h3>
        <p>Interaktive Visualisierung und Vergleich der Frequenzbänder</p>
      </a>
      <a href="/spektrum/anwendungen" class="related-card">
        <h3>Anwendungen</h3>
        <p>Typische Anwendungen in verschiedenen Frequenzbereichen</p>
      </a>
      <a href="/wissen/wellenausbreitung" class="related-card">
        <h3>Wellenausbreitung</h3>
        <p>Wie sich Funkwellen je nach Frequenz ausbreiten</p>
      </a>
      <a href="/rechner/fspl" class="related-card">
        <h3>FSPL-Rechner</h3>
        <p>Berechne die Freiraumdämpfung für verschiedene Frequenzen</p>
      </a>
      <a href="/rechner/link-budget" class="related-card">
        <h3>Link Budget</h3>
        <p>Vollständige Signalpfad-Analyse</p>
      </a>
    </div>
  </section>
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
    line-height: var(--line-height-relaxed);
    max-width: 65ch;
  }

  /* Search Section */
  .search-section {
    padding: 1.25rem;
  }

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  .search-header h2 {
    margin: 0;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all var(--transition-fast);
  }

  .toggle-btn:hover {
    background: var(--color-bg-surface);
    border-color: var(--color-accent-primary);
  }

  .search-controls {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input-group label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .input-with-unit {
    display: flex;
    gap: 0.5rem;
    max-width: 300px;
  }

  .search-input {
    flex: 1;
    padding: 0.625rem 0.875rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    font-family: var(--font-mono);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .unit-select {
    padding: 0.625rem 0.875rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }

  .search-results h3 {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 0.75rem 0;
  }

  .results-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .result-item:hover,
  .result-item.selected {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-surface);
  }

  .result-category {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    color: white;
    font-weight: 600;
  }

  .result-name {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .no-results {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  /* Tab Navigation */
  .tab-nav {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .tab-btn:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .tab-btn.active {
    background: var(--color-bg-elevated);
    border-bottom-color: var(--color-bg-elevated);
    color: var(--color-accent-primary);
  }

  .tab-count {
    padding: 0.125rem 0.5rem;
    background: var(--color-bg-surface);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .tab-btn.active .tab-count {
    background: var(--color-accent-primary);
    color: white;
  }

  /* Bands Table */
  .bands-section {
    margin-top: -1px;
    border-radius: 0 var(--radius-lg) var(--radius-lg) var(--radius-lg);
  }

  .bands-table-wrapper {
    overflow-x: auto;
  }

  .bands-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .bands-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-default);
    white-space: nowrap;
  }

  .bands-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border-subtle);
    vertical-align: middle;
  }

  .band-row {
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .band-row:hover {
    background: var(--color-bg-elevated);
  }

  .band-row.selected {
    background: var(--color-accent-primary-alpha);
  }

  .band-row:focus {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: -2px;
  }

  .band-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .color-dot.large {
    width: 16px;
    height: 16px;
  }

  .band-frequency,
  .band-wavelength {
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .band-propagation {
    white-space: nowrap;
  }

  .propagation-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid;
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  .propagation-badge.large {
    padding: 0.375rem 0.75rem;
    font-size: var(--font-size-sm);
  }

  .propagation-icon {
    font-size: 0.875em;
  }

  .band-applications {
    color: var(--color-text-secondary);
    max-width: 250px;
  }

  .more-apps {
    margin-left: 0.25rem;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }

  .applications-col {
    min-width: 200px;
  }

  /* Detail Panel */
  .detail-panel {
    border: 2px solid var(--color-accent-primary);
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .detail-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .detail-title h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
  }

  .detail-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  .close-btn {
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-bg-surface);
    color: var(--color-text-primary);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-value {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .category-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .detail-section {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  .detail-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .detail-section p {
    margin: 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    line-height: var(--line-height-relaxed);
  }

  .applications-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .application-tag {
    padding: 0.375rem 0.75rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .detail-section.notes {
    background: var(--color-bg-elevated);
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    margin-bottom: -1.5rem;
    padding: 1.25rem 1.5rem;
    border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }

  .detail-section.notes p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  /* Legend */
  .legend-section {
    padding: 1.25rem;
  }

  .legend-section h2 {
    margin: 0 0 1rem 0;
  }

  .legend-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    border: 1px solid;
    font-size: 0.875rem;
  }

  .legend-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  /* Related Topics */
  .related-section {
    padding: 1.5rem;
  }

  .related-section h2 {
    margin: 0 0 0.5rem 0;
  }

  .related-intro {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0 0 1.25rem 0;
    line-height: var(--line-height-relaxed);
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: block;
    padding: 1.25rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .related-card:hover {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-surface);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .related-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .related-card:hover h3 {
    color: var(--color-accent-primary);
  }

  .related-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .tab-nav {
      flex-wrap: nowrap;
    }

    .tab-btn {
      padding: 0.625rem 1rem;
      font-size: var(--font-size-xs);
    }

    .bands-table th,
    .bands-table td {
      padding: 0.5rem 0.75rem;
    }

    .applications-col {
      display: none;
    }

    .band-applications {
      display: none;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .input-with-unit {
      max-width: 100%;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
