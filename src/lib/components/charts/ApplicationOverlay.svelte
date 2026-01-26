<script lang="ts">
  import * as d3 from 'd3';
  import {
    ALL_APPLICATIONS,
    APPLICATIONS_BY_CATEGORY,
    CATEGORY_NAMES,
    type ApplicationCategory,
    type RFApplication
  } from '$lib/data/applications';
  import { formatFrequencyRange } from '$lib/data/bands';
  import { formatFrequency } from '$lib/utils/formatting';

  interface Props {
    width?: number;
    height?: number;
    minFrequencyHz?: number;
    maxFrequencyHz?: number;
  }

  let {
    width = 1100,
    height = 700,
    minFrequencyHz = 100e3,
    maxFrequencyHz = 100e9
  }: Props = $props();

  // State
  let selectedCategories = $state<Set<ApplicationCategory>>(new Set(['mobile', 'wlan', 'broadcast', 'satellite']));
  let selectedApplication = $state<RFApplication | null>(null);
  let hoveredApplication = $state<RFApplication | null>(null);

  // Chart margins
  const margin = { top: 60, right: 20, bottom: 80, left: 60 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom - 150); // Reserve space for legend

  // Category colors
  const categoryColors: Record<ApplicationCategory, string> = {
    broadcast: '#ef4444',
    mobile: '#3b82f6',
    wlan: '#22c55e',
    satellite: '#8b5cf6',
    radar: '#f97316',
    amateur: '#ec4899',
    navigation: '#06b6d4',
    military: '#6b7280',
    ism: '#84cc16',
    pmr: '#14b8a6',
    maritime: '#0ea5e9',
    aviation: '#f59e0b'
  };

  // Filter applications by selected categories and frequency range
  let filteredApplications = $derived(
    ALL_APPLICATIONS.filter(app =>
      selectedCategories.has(app.category) &&
      app.maxHz >= minFrequencyHz &&
      app.minHz <= maxFrequencyHz
    )
  );

  // D3 logarithmic scale for frequency
  let xScale = $derived(
    d3.scaleLog()
      .domain([minFrequencyHz, maxFrequencyHz])
      .range([0, chartWidth])
      .clamp(true)
  );

  // Calculate row assignments to minimize overlap
  let applicationRects = $derived.by(() => {
    // Sort by start frequency
    const sorted = [...filteredApplications].sort((a, b) => a.minHz - b.minHz);

    // Track end positions for each row
    const rowEnds: number[] = [];
    const rowHeight = 24;
    const rowGap = 4;

    return sorted.map(app => {
      const x1 = xScale(Math.max(app.minHz, minFrequencyHz));
      const x2 = xScale(Math.min(app.maxHz, maxFrequencyHz));

      // Find first row where this app fits
      let rowIndex = rowEnds.findIndex(endX => x1 >= endX + 5);
      if (rowIndex === -1) {
        rowIndex = rowEnds.length;
      }

      // Update row end position
      rowEnds[rowIndex] = x2;

      return {
        app,
        x: x1,
        y: rowIndex * (rowHeight + rowGap),
        width: Math.max(x2 - x1, 4),
        height: rowHeight,
        color: categoryColors[app.category]
      };
    });
  });

  // Calculate total height needed
  let contentHeight = $derived.by(() => {
    if (applicationRects.length === 0) return chartHeight;
    const maxY = Math.max(...applicationRects.map(r => r.y + r.height));
    return Math.min(maxY + 20, chartHeight);
  });

  // X-axis tick values
  let xTickValues = $derived.by(() => {
    const ticks: number[] = [];
    let current = 1e3; // Start at 1 kHz
    while (current <= maxFrequencyHz) {
      if (current >= minFrequencyHz) {
        ticks.push(current);
      }
      current *= 10;
    }
    return ticks;
  });

  // Toggle category
  function toggleCategory(category: ApplicationCategory) {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    selectedCategories = newSet;
    selectedApplication = null;
  }

  // Select all / none
  function selectAllCategories() {
    selectedCategories = new Set(Object.keys(CATEGORY_NAMES) as ApplicationCategory[]);
  }

  function selectNoCategories() {
    selectedCategories = new Set();
  }

  // Application click handler
  function handleApplicationClick(app: RFApplication) {
    selectedApplication = selectedApplication?.id === app.id ? null : app;
  }

  // Hover handlers
  function handleApplicationHover(app: RFApplication | null) {
    hoveredApplication = app;
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Frequenz-Anwendungen (Application Overlay)</h3>

  <!-- Category Filter -->
  <div class="mb-4">
    <div class="flex items-center justify-between mb-2">
      <span class="text-label">Kategorien filtern</span>
      <div class="flex gap-2">
        <button
          type="button"
          onclick={selectAllCategories}
          class="text-xs text-blue-500 hover:underline"
        >
          Alle
        </button>
        <span class="text-muted">|</span>
        <button
          type="button"
          onclick={selectNoCategories}
          class="text-xs text-blue-500 hover:underline"
        >
          Keine
        </button>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each Object.entries(CATEGORY_NAMES) as [key, names] (key)}
        {@const category = key as ApplicationCategory}
        {@const isActive = selectedCategories.has(category)}
        {@const count = APPLICATIONS_BY_CATEGORY[category].filter(a =>
          a.maxHz >= minFrequencyHz && a.minHz <= maxFrequencyHz
        ).length}
        <button
          type="button"
          onclick={() => toggleCategory(category)}
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 {isActive ? 'text-white' : 'bg-surface-secondary text-secondary hover:bg-surface-tertiary'}"
          style={isActive ? `background-color: ${categoryColors[category]}` : ''}
        >
          <span
            class="w-3 h-3 rounded-full"
            style="background-color: {categoryColors[category]}; opacity: {isActive ? 1 : 0.5}"
          ></span>
          {names.nameDE}
          <span class="text-xs opacity-70">({count})</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Application Visualization -->
  <div class="w-full overflow-x-auto mb-4">
    <svg
      viewBox="0 0 {width} {contentHeight + margin.top + margin.bottom}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Frequenznutzung Diagramm: Zeigt verschiedene Anwendungen über dem Frequenzspektrum"
    >
      <!-- Background -->
      <rect
        x="0"
        y="0"
        width={width}
        height={contentHeight + margin.top + margin.bottom}
        style="fill: var(--color-chart-bg)"
      />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Grid lines -->
        {#each xTickValues as tickVal (tickVal)}
          <line
            x1={xScale(tickVal)}
            y1="0"
            x2={xScale(tickVal)}
            y2={contentHeight}
            style="stroke: var(--color-chart-grid)"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/each}

        <!-- Application rectangles -->
        {#each applicationRects as rect (rect.app.id)}
          {@const isSelected = selectedApplication?.id === rect.app.id}
          {@const isHovered = hoveredApplication?.id === rect.app.id}
          <g
            transform="translate({rect.x}, {rect.y})"
            role="button"
            tabindex="0"
            aria-label="{rect.app.nameDE}: {formatFrequencyRange(rect.app.minHz, rect.app.maxHz)}"
            onclick={() => handleApplicationClick(rect.app)}
            onkeydown={(e) => e.key === 'Enter' && handleApplicationClick(rect.app)}
            onmouseenter={() => handleApplicationHover(rect.app)}
            onmouseleave={() => handleApplicationHover(null)}
            class="cursor-pointer"
          >
            <rect
              x="0"
              y="0"
              width={rect.width}
              height={rect.height}
              fill={rect.color}
              stroke={isSelected ? '#fbbf24' : isHovered ? '#ffffff' : 'transparent'}
              stroke-width={isSelected ? 2 : isHovered ? 1 : 0}
              rx="3"
              opacity={isSelected || isHovered ? 1 : 0.85}
            />
            <!-- Label (if wide enough) -->
            {#if rect.width > 40}
              <text
                x={rect.width / 2}
                y={rect.height / 2}
                fill="white"
                font-size={rect.width > 80 ? '10' : '8'}
                font-weight="500"
                text-anchor="middle"
                dominant-baseline="middle"
                class="pointer-events-none"
              >
                {rect.app.name.length > (rect.width / 7) ? rect.app.name.substring(0, Math.floor(rect.width / 7)) + '..' : rect.app.name}
              </text>
            {/if}
          </g>
        {/each}

        <!-- X-axis -->
        <g transform="translate(0, {contentHeight})">
          <line
            x1="0"
            y1="0"
            x2={chartWidth}
            y2="0"
            style="stroke: var(--color-chart-axis)"
            stroke-width="1"
          />
          {#each xTickValues as tickVal (tickVal)}
            <g transform="translate({xScale(tickVal)}, 0)">
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
      {#if hoveredApplication && !selectedApplication}
        {@const hoveredApp = hoveredApplication}
        {@const rect = applicationRects.find(r => r.app.id === hoveredApp.id)}
        {#if rect}
          {@const tooltipX = rect.x + rect.width / 2 + margin.left}
          {@const tooltipY = rect.y + margin.top - 5}
          <g transform="translate({Math.min(Math.max(tooltipX, 100), width - 100)}, {tooltipY})">
            <rect
              x="-90"
              y="-50"
              width="180"
              height="45"
              rx="4"
              style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
            />
            <text x="0" y="-32" fill="var(--color-chart-text)" font-size="11" font-weight="500" text-anchor="middle">
              {hoveredApp.nameDE}
            </text>
            <text x="0" y="-16" fill="var(--color-chart-text-secondary)" font-size="10" text-anchor="middle">
              {formatFrequencyRange(hoveredApp.minHz, hoveredApp.maxHz)}
            </text>
          </g>
        {/if}
      {/if}
    </svg>
  </div>

  <!-- Selected Application Details -->
  {#if selectedApplication}
    <div class="p-4 bg-surface-secondary rounded-lg">
      <div class="flex items-start justify-between mb-3">
        <div>
          <h4 class="text-heading-4 flex items-center gap-2">
            <span
              class="w-4 h-4 rounded"
              style="background-color: {categoryColors[selectedApplication.category]}"
            ></span>
            {selectedApplication.nameDE}
            <span class="text-muted font-normal">({selectedApplication.name})</span>
          </h4>
          <p class="text-secondary text-sm mt-1">
            {formatFrequencyRange(selectedApplication.minHz, selectedApplication.maxHz)}
          </p>
        </div>
        <button
          type="button"
          onclick={() => { selectedApplication = null; }}
          class="text-muted hover:text-primary"
          aria-label="Auswahl aufheben"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-label mb-1">Beschreibung</div>
          <p class="text-sm text-secondary">{selectedApplication.descriptionDE}</p>
        </div>
        <div>
          <div class="text-label mb-1">Details</div>
          <div class="text-sm space-y-1">
            <div>
              <span class="text-muted">Kategorie:</span>
              <span class="text-secondary ml-1">{CATEGORY_NAMES[selectedApplication.category].nameDE}</span>
            </div>
            {#if selectedApplication.region}
              <div>
                <span class="text-muted">Region:</span>
                <span class="text-secondary ml-1">{selectedApplication.region}</span>
              </div>
            {/if}
            {#if selectedApplication.standard}
              <div>
                <span class="text-muted">Standard:</span>
                <span class="text-secondary ml-1">{selectedApplication.standard}</span>
              </div>
            {/if}
            {#if selectedApplication.notes}
              <div>
                <span class="text-muted">Hinweis:</span>
                <span class="text-secondary ml-1">{selectedApplication.notes}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="p-4 bg-surface-secondary rounded-lg text-center text-muted">
      {filteredApplications.length > 0
        ? `${filteredApplications.length} Anwendungen angezeigt. Klicken Sie auf eine Anwendung für Details.`
        : 'Keine Anwendungen in den ausgewaehlten Kategorien.'}
    </div>
  {/if}

  <!-- Statistics -->
  <div class="mt-4 text-xs text-muted">
    <strong>Hinweis:</strong> Die Darstellung zeigt die Frequenzbelegung durch verschiedene Dienste.
    Überlappungen sind möglich (z.B. primäre/sekundäre Zuweisung oder regionale Unterschiede).
    Insgesamt {ALL_APPLICATIONS.length} Anwendungen in der Datenbank.
  </div>
</div>
