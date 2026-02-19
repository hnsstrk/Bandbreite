<script lang="ts">
  import * as d3 from 'd3';
  import {
    ITU_BANDS,
    IEEE_BANDS,
    NATO_BANDS,
    CIVILIAN_BANDS,
    type FrequencyBand,
    type ITUBand,
    formatFrequencyRange
  } from '$lib/data/bands';
  import { getApplicationsForFrequency, type RFApplication } from '$lib/data/applications';
  import { formatFrequency } from '$lib/utils/formatting';
  import PropagationModeIndicator from '$lib/components/ui/PropagationModeIndicator.svelte';

  interface Props {
    width?: number;
    height?: number;
    initialFrequencyHz?: number;
  }

  let { width = 1100, height = 600, initialFrequencyHz = 1e9 }: Props = $props();

  // State
  type BandCategory = 'itu' | 'ieee' | 'nato' | 'civilian';
  let selectedCategory = $state<BandCategory>('ieee');
  let selectedBand = $state<FrequencyBand | null>(null);
  let hoveredBand = $state<FrequencyBand | null>(null);

  // Chart margins
  const margin = { top: 40, right: 20, bottom: 80, left: 20 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom - 200); // Reserve space for details

  // Band data based on category
  let currentBands = $derived<FrequencyBand[]>({
    itu: ITU_BANDS,
    ieee: IEEE_BANDS,
    nato: NATO_BANDS,
    civilian: CIVILIAN_BANDS
  }[selectedCategory]);

  // Frequency range (logarithmic)
  let frequencyRange = $derived.by(() => {
    if (currentBands.length === 0) return { min: 1, max: 1e12 };
    const allMin = Math.min(...currentBands.map(b => b.minHz));
    const allMax = Math.max(...currentBands.map(b => b.maxHz));
    // Add padding
    return {
      min: Math.max(1, allMin / 10),
      max: allMax * 10
    };
  });

  // D3 logarithmic scale
  let xScale = $derived(
    d3.scaleLog()
      .domain([frequencyRange.min, frequencyRange.max])
      .range([0, chartWidth])
      .clamp(true)
  );

  // Calculate band positions
  let bandRects = $derived(
    currentBands.map((band, index) => {
      const x1 = xScale(Math.max(band.minHz, frequencyRange.min));
      const x2 = xScale(Math.min(band.maxHz, frequencyRange.max));
      const rowHeight = 40;
      const y = 10 + (index % 3) * (rowHeight + 5); // Stack in 3 rows
      return {
        band,
        x: x1,
        y,
        width: Math.max(x2 - x1, 2), // Minimum width of 2px
        height: rowHeight
      };
    })
  );

  // Applications for selected band
  let selectedBandApplications = $derived.by(() => {
    if (!selectedBand) return [] as RFApplication[];
    const midFreq = (selectedBand.minHz + selectedBand.maxHz) / 2;
    return getApplicationsForFrequency(midFreq);
  });

  // X-axis tick values (logarithmic)
  let xTickValues = $derived.by(() => {
    const ticks: number[] = [];
    let current = 1;
    while (current <= frequencyRange.max) {
      if (current >= frequencyRange.min) {
        ticks.push(current);
      }
      current *= 10;
    }
    return ticks;
  });

  // Category labels
  const categoryLabels: Record<BandCategory, { name: string; nameDE: string }> = {
    itu: { name: 'ITU Radio Bands', nameDE: 'ITU-Funkbänder' },
    ieee: { name: 'IEEE Radar Bands', nameDE: 'IEEE-Radarbänder' },
    nato: { name: 'NATO Bands', nameDE: 'NATO-Bänder' },
    civilian: { name: 'Civilian/Commercial', nameDE: 'Zivil/Kommerziell' }
  };

  // Event handlers
  function handleBandClick(band: FrequencyBand) {
    selectedBand = selectedBand?.id === band.id ? null : band;
  }

  function handleBandHover(band: FrequencyBand | null) {
    hoveredBand = band;
  }

  function handleCategoryChange(category: BandCategory) {
    selectedCategory = category;
    selectedBand = null;
  }

  // Check if band is ITU band (has propagation info)
  function isItuBand(band: FrequencyBand): band is ITUBand {
    return band.category === 'itu';
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Frequenzband-Explorer</h3>

  <!-- Category Selection -->
  <div class="flex flex-wrap gap-2 mb-6">
    {#each Object.entries(categoryLabels) as [key, label] (key)}
      <button
        type="button"
        onclick={() => handleCategoryChange(key as BandCategory)}
        class="px-4 py-2 rounded-lg font-medium transition-colors
               {selectedCategory === key
                 ? 'bg-blue-600 text-white'
                 : 'bg-surface-secondary text-secondary hover:bg-surface-tertiary'}"
      >
        {label.nameDE}
      </button>
    {/each}
  </div>

  <!-- Band Visualization -->
  <div class="w-full overflow-x-auto mb-4">
    <svg
      viewBox="0 0 {width} {chartHeight + margin.top + margin.bottom}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Frequenzband-Diagramm: {categoryLabels[selectedCategory].nameDE}"
    >
      <!-- Background -->
      <rect
        x="0"
        y="0"
        width={width}
        height={chartHeight + margin.top + margin.bottom}
        style="fill: var(--color-chart-bg)"
      />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Band rectangles -->
        {#each bandRects as rect (rect.band.id)}
          {@const isSelected = selectedBand?.id === rect.band.id}
          {@const isHovered = hoveredBand?.id === rect.band.id}
          <g
            transform="translate({rect.x}, {rect.y})"
            role="button"
            tabindex="0"
            aria-label="{rect.band.nameDE}: {formatFrequencyRange(rect.band.minHz, rect.band.maxHz)}"
            onclick={() => handleBandClick(rect.band)}
            onkeydown={(e) => e.key === 'Enter' && handleBandClick(rect.band)}
            onmouseenter={() => handleBandHover(rect.band)}
            onmouseleave={() => handleBandHover(null)}
            class="cursor-pointer"
          >
            <rect
              x="0"
              y="0"
              width={rect.width}
              height={rect.height}
              fill={rect.band.color}
              stroke={isSelected ? '#fbbf24' : isHovered ? '#ffffff' : 'transparent'}
              stroke-width={isSelected ? 3 : isHovered ? 2 : 0}
              rx="4"
              opacity={isSelected || isHovered ? 1 : 0.8}
            />
            <!-- Band label (if wide enough) -->
            {#if rect.width > 30}
              <text
                x={rect.width / 2}
                y={rect.height / 2}
                fill="white"
                font-size={rect.width > 60 ? '11' : '9'}
                font-weight="500"
                text-anchor="middle"
                dominant-baseline="middle"
                class="pointer-events-none"
              >
                {rect.band.name}
              </text>
            {/if}
          </g>
        {/each}

        <!-- X-axis (Frequency) -->
        <g transform="translate(0, {chartHeight})">
          <line
            x1="0"
            y1="0"
            x2={chartWidth}
            y2="0"
            style="stroke: var(--color-chart-axis)"
            stroke-width="1"
          />
          {#each xTickValues as tickVal (tickVal)}
            {@const tickX = xScale(tickVal)}
            {#if tickX >= 0 && tickX <= chartWidth}
              <g transform="translate({tickX}, 0)">
                <line y2="8" style="stroke: var(--color-chart-axis)" />
                <text
                  y="24"
                  style="fill: var(--color-chart-text-secondary)"
                  text-anchor="middle"
                  font-size="10"
                >
                  {formatFrequency(tickVal, 0)}
                </text>
              </g>
            {/if}
          {/each}
          <text
            x={chartWidth / 2}
            y="50"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="13"
            font-weight="500"
          >
            Frequenz (logarithmisch)
          </text>
        </g>
      </g>

      <!-- Hover tooltip -->
      {#if hoveredBand && !selectedBand}
        {@const hovered = hoveredBand}
        {@const rect = bandRects.find(r => r.band.id === hovered.id)}
        {#if rect}
          <g transform="translate({margin.left + rect.x + rect.width / 2}, {margin.top + rect.y - 10})">
            <rect
              x="-80"
              y="-45"
              width="160"
              height="40"
              rx="4"
              style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
            />
            <text x="0" y="-30" fill="var(--color-chart-text)" font-size="11" font-weight="500" text-anchor="middle">
              {hovered.nameDE}
            </text>
            <text x="0" y="-14" fill="var(--color-chart-text-secondary)" font-size="10" text-anchor="middle">
              {formatFrequencyRange(hovered.minHz, hovered.maxHz)}
            </text>
          </g>
        {/if}
      {/if}
    </svg>
  </div>

  <!-- Selected Band Details -->
  {#if selectedBand}
    <div class="p-4 bg-surface-secondary rounded-lg">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h4 class="text-heading-4 flex items-center gap-2">
            <span
              class="w-4 h-4 rounded"
              style="background-color: {selectedBand.color}"
            ></span>
            {selectedBand.nameDE}
            <span class="text-muted font-normal">({selectedBand.name})</span>
          </h4>
          <p class="text-secondary text-sm mt-1">
            {formatFrequencyRange(selectedBand.minHz, selectedBand.maxHz)}
          </p>
        </div>
        <button
          type="button"
          onclick={() => { selectedBand = null; }}
          class="text-muted hover:text-primary"
          aria-label="Auswahl aufheben"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- ITU-specific info -->
      {#if isItuBand(selectedBand)}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-label mb-2">Ausbreitungsart</div>
            <PropagationModeIndicator
              frequencyHz={(selectedBand.minHz + selectedBand.maxHz) / 2}
              size="md"
            />
          </div>
          <div>
            <div class="text-label mb-2">Typische Anwendungen</div>
            <div class="flex flex-wrap gap-1">
              {#each selectedBand.applications as app (app)}
                <span class="px-2 py-1 bg-surface-tertiary rounded text-xs text-secondary">
                  {app}
                </span>
              {/each}
            </div>
          </div>
        </div>
        {#if selectedBand.notes}
          <div class="text-sm text-muted mt-2">
            <strong>Hinweis:</strong> {selectedBand.notes}
          </div>
        {/if}
      {/if}

      <!-- Applications in this band -->
      {#if selectedBandApplications.length > 0}
        <div class="mt-4">
          <div class="text-label mb-2">Dienste in diesem Frequenzbereich</div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {#each selectedBandApplications.slice(0, 9) as app (app.id)}
              <div class="p-2 bg-surface-tertiary rounded text-sm">
                <div class="font-medium text-primary">{app.nameDE}</div>
                <div class="text-xs text-muted">
                  {formatFrequencyRange(app.minHz, app.maxHz)}
                </div>
              </div>
            {/each}
          </div>
          {#if selectedBandApplications.length > 9}
            <div class="text-xs text-muted mt-2">
              + {selectedBandApplications.length - 9} weitere Dienste
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="p-4 bg-surface-secondary rounded-lg text-center text-muted">
      Klicken Sie auf ein Band, um Details anzuzeigen
    </div>
  {/if}

  <!-- Legend -->
  <div class="mt-4 text-xs text-muted">
    <strong>Hinweis:</strong> Die Darstellung ist logarithmisch skaliert.
    {#if selectedCategory === 'itu'}
      ITU-Bänder zeigen die internationale Klassifikation von ELF (3 Hz) bis THF (3 THz).
    {:else if selectedCategory === 'ieee'}
      IEEE-Bänder sind in der Radar- und Mikrowellentechnik gängig.
    {:else if selectedCategory === 'nato'}
      NATO-Bänder (A-O) werden in militärischen Anwendungen verwendet.
    {:else}
      Zivile Bänder zeigen gängige kommerzielle Anwendungen.
    {/if}
  </div>
</div>
