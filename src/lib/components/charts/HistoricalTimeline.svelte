<script lang="ts">
  import * as d3 from 'd3';
  import {
    HISTORICAL_EVENTS,
    CATEGORY_CONFIG,
    type HistoricalEvent,
    type HistoryCategory
  } from '$lib/data/history';
  import { formatFrequency } from '$lib/utils/formatting';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 1100, height = 600 }: Props = $props();

  // State
  let selectedCategories = $state<Set<HistoryCategory>>(
    new Set(['theory', 'invention', 'broadcast', 'mobile', 'satellite', 'digital'])
  );
  let selectedEvent = $state<HistoricalEvent | null>(null);
  let hoveredEvent = $state<HistoricalEvent | null>(null);
  let showOnlyMajor = $state(false);

  // Chart margins
  const margin = { top: 80, right: 40, bottom: 80, left: 60 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom - 150);

  // Year range
  const MIN_YEAR = 1860;
  const MAX_YEAR = 2030;

  // Filtered events
  let filteredEvents = $derived.by(() => {
    let events = HISTORICAL_EVENTS.filter(e =>
      selectedCategories.has(e.category)
    );

    if (showOnlyMajor) {
      events = events.filter(e => e.significance === 'major');
    }

    return events.sort((a, b) => a.year - b.year);
  });

  // D3 time scale
  let xScale = $derived(
    d3.scaleLinear()
      .domain([MIN_YEAR, MAX_YEAR])
      .range([0, chartWidth])
  );

  // Calculate event positions with collision avoidance
  let eventPositions = $derived.by(() => {
    const positions: { event: HistoricalEvent; x: number; y: number; row: number }[] = [];
    const rowEnds: number[] = [];
    const eventWidth = 120;
    const rowHeight = 50;
    const maxRows = Math.floor(chartHeight / rowHeight);

    for (const event of filteredEvents) {
      const x = xScale(event.year);

      // Find row with space
      let row = rowEnds.findIndex(endX => x > endX + 10);
      if (row === -1) {
        row = rowEnds.length < maxRows ? rowEnds.length : row % maxRows;
      }

      rowEnds[row] = x + eventWidth;

      const y = row * rowHeight;
      positions.push({ event, x, y, row });
    }

    return positions;
  });

  // X-axis decade ticks
  let decadeTicks = $derived.by(() => {
    const ticks: number[] = [];
    for (let year = 1860; year <= 2030; year += 10) {
      ticks.push(year);
    }
    return ticks;
  });

  // Era markers
  const eras = [
    { startYear: 1860, endYear: 1900, label: 'Entdeckung', color: 'rgba(139, 92, 246, 0.1)' },
    { startYear: 1900, endYear: 1950, label: 'Fruehe Funk-Aera', color: 'rgba(59, 130, 246, 0.1)' },
    { startYear: 1950, endYear: 1990, label: 'Analog-Aera', color: 'rgba(34, 197, 94, 0.1)' },
    { startYear: 1990, endYear: 2030, label: 'Digital-Aera', color: 'rgba(249, 115, 22, 0.1)' }
  ];

  // Toggle category
  function toggleCategory(category: HistoryCategory) {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    selectedCategories = newSet;
    selectedEvent = null;
  }

  // Event handlers
  function handleEventClick(event: HistoricalEvent) {
    selectedEvent = selectedEvent?.id === event.id ? null : event;
  }

  function handleEventHover(event: HistoricalEvent | null) {
    hoveredEvent = event;
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Historische Timeline der Funktechnik</h3>

  <!-- Category Filter -->
  <div class="mb-4">
    <div class="flex items-center justify-between mb-2">
      <span class="text-label">Kategorien</span>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={showOnlyMajor} class="checkbox" />
        <span class="text-secondary">Nur wichtige Ereignisse</span>
      </label>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each Object.entries(CATEGORY_CONFIG) as [key, config] (key)}
        {@const category = key as HistoryCategory}
        {@const isActive = selectedCategories.has(category)}
        {@const count = HISTORICAL_EVENTS.filter(e => e.category === category).length}
        <button
          type="button"
          onclick={() => toggleCategory(category)}
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 {isActive ? 'text-white' : 'bg-surface-secondary text-secondary hover:bg-surface-tertiary'}"
          style={isActive ? `background-color: ${config.color}` : ''}
        >
          <span
            class="w-3 h-3 rounded-full"
            style="background-color: {config.color}; opacity: {isActive ? 1 : 0.5}"
          ></span>
          {config.nameDE}
          <span class="text-xs opacity-70">({count})</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Timeline Visualization -->
  <div class="w-full overflow-x-auto mb-4">
    <svg
      viewBox="0 0 {width} {chartHeight + margin.top + margin.bottom}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Historische Timeline der Funktechnik von 1860 bis heute"
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
        <!-- Era backgrounds -->
        {#each eras as era (era.label)}
          {@const x1 = xScale(era.startYear)}
          {@const x2 = xScale(era.endYear)}
          <rect
            x={x1}
            y="0"
            width={x2 - x1}
            height={chartHeight}
            fill={era.color}
          />
          <text
            x={(x1 + x2) / 2}
            y="-10"
            fill="var(--color-chart-text-secondary)"
            font-size="10"
            text-anchor="middle"
            opacity="0.7"
          >
            {era.label}
          </text>
        {/each}

        <!-- Timeline axis -->
        <line
          x1="0"
          y1={chartHeight + 20}
          x2={chartWidth}
          y2={chartHeight + 20}
          stroke="var(--color-chart-axis)"
          stroke-width="2"
        />

        <!-- Decade markers -->
        {#each decadeTicks as year (year)}
          {@const x = xScale(year)}
          <line
            x1={x}
            y1={chartHeight + 15}
            x2={x}
            y2={chartHeight + 25}
            stroke="var(--color-chart-axis)"
            stroke-width="1"
          />
          <text
            x={x}
            y={chartHeight + 40}
            fill="var(--color-chart-text-secondary)"
            font-size="10"
            text-anchor="middle"
          >
            {year}
          </text>
        {/each}

        <!-- Event markers -->
        {#each eventPositions as pos (pos.event.id)}
          {@const isSelected = selectedEvent?.id === pos.event.id}
          {@const isHovered = hoveredEvent?.id === pos.event.id}
          {@const config = CATEGORY_CONFIG[pos.event.category]}

          <g
            transform="translate({pos.x}, {pos.y})"
            role="button"
            tabindex="0"
            aria-label="{pos.event.year}: {pos.event.titleDE}"
            onclick={() => handleEventClick(pos.event)}
            onkeydown={(e) => e.key === 'Enter' && handleEventClick(pos.event)}
            onmouseenter={() => handleEventHover(pos.event)}
            onmouseleave={() => handleEventHover(null)}
            class="cursor-pointer"
          >
            <!-- Connector line to timeline -->
            <line
              x1="0"
              y1={20}
              x2="0"
              y2={chartHeight + 20 - pos.y}
              stroke={config.color}
              stroke-width="1"
              stroke-dasharray={pos.event.significance === 'major' ? '0' : '4,2'}
              opacity="0.6"
            />

            <!-- Event marker -->
            <circle
              cx="0"
              cy="15"
              r={pos.event.significance === 'major' ? 8 : 5}
              fill={config.color}
              stroke={isSelected ? '#fbbf24' : isHovered ? '#ffffff' : 'transparent'}
              stroke-width={isSelected ? 3 : isHovered ? 2 : 0}
            />

            <!-- Year label -->
            <text
              x="0"
              y="0"
              fill={config.color}
              font-size="9"
              font-weight="500"
              text-anchor="middle"
            >
              {pos.event.year}
            </text>

            <!-- Event title (if major or hovered) -->
            {#if pos.event.significance === 'major' || isHovered || isSelected}
              <text
                x="12"
                y="18"
                fill="var(--color-chart-text)"
                font-size="10"
                font-weight={isSelected ? '600' : '400'}
              >
                {pos.event.titleDE.length > 20 ? pos.event.titleDE.substring(0, 18) + '...' : pos.event.titleDE}
              </text>
            {/if}
          </g>
        {/each}

        <!-- Hover tooltip -->
        {#if hoveredEvent && !selectedEvent}
          {@const hovered = hoveredEvent}
          {@const pos = eventPositions.find(p => p.event.id === hovered.id)}
          {#if pos}
            {@const tooltipX = Math.min(Math.max(pos.x, 120), chartWidth - 120)}
            <g transform="translate({tooltipX}, {pos.y - 60})">
              <rect
                x="-110"
                y="0"
                width="220"
                height="55"
                rx="4"
                style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
              />
              <text x="0" y="18" fill="var(--color-chart-text)" font-size="11" font-weight="500" text-anchor="middle">
                {hovered.year}: {hovered.titleDE}
              </text>
              <text x="0" y="35" fill="var(--color-chart-text-secondary)" font-size="9" text-anchor="middle">
                {CATEGORY_CONFIG[hovered.category].nameDE}
                {#if hovered.frequencyHz}
                  | {formatFrequency(hovered.frequencyHz)}
                {/if}
              </text>
              {#if hovered.person}
                <text x="0" y="48" fill="var(--color-text-tertiary)" font-size="8" text-anchor="middle">
                  {hovered.person}
                </text>
              {/if}
            </g>
          {/if}
        {/if}
      </g>

      <!-- Legend -->
      <g transform="translate({margin.left}, {chartHeight + margin.top + 55})">
        {#each Object.entries(CATEGORY_CONFIG) as [key, config], i (key)}
          <g transform="translate({i * 120}, 0)">
            <circle cx="6" cy="6" r="5" fill={config.color} />
            <text x="16" y="10" fill="var(--color-chart-text-secondary)" font-size="10">
              {config.nameDE}
            </text>
          </g>
        {/each}
      </g>
    </svg>
  </div>

  <!-- Selected Event Details -->
  {#if selectedEvent}
    <div class="p-4 bg-surface-secondary rounded-lg">
      <div class="flex items-start justify-between mb-3">
        <div>
          <h4 class="text-heading-4 flex items-center gap-2">
            <span
              class="w-4 h-4 rounded-full"
              style="background-color: {CATEGORY_CONFIG[selectedEvent.category].color}"
            ></span>
            <span class="text-lg font-bold">{selectedEvent.year}</span>
            {selectedEvent.titleDE}
          </h4>
          <p class="text-secondary text-sm mt-1">
            {CATEGORY_CONFIG[selectedEvent.category].nameDE}
          </p>
        </div>
        <button
          type="button"
          onclick={() => { selectedEvent = null; }}
          class="text-muted hover:text-primary"
          aria-label="Auswahl aufheben"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p class="text-secondary mb-4">{selectedEvent.descriptionDE}</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {#if selectedEvent.person}
          <div>
            <span class="text-muted">Person:</span>
            <span class="text-primary ml-1">{selectedEvent.person}</span>
          </div>
        {/if}
        {#if selectedEvent.location}
          <div>
            <span class="text-muted">Ort:</span>
            <span class="text-primary ml-1">{selectedEvent.location}</span>
          </div>
        {/if}
        {#if selectedEvent.frequencyHz}
          <div>
            <span class="text-muted">Frequenz:</span>
            <span class="text-primary ml-1">
              {formatFrequency(selectedEvent.frequencyHz)}
              {#if selectedEvent.frequencyHzMax}
                - {formatFrequency(selectedEvent.frequencyHzMax)}
              {/if}
            </span>
          </div>
        {/if}
        <div>
          <span class="text-muted">Bedeutung:</span>
          <span class="text-primary ml-1">
            {selectedEvent.significance === 'major' ? 'Hoch' : selectedEvent.significance === 'moderate' ? 'Mittel' : 'Gering'}
          </span>
        </div>
      </div>
    </div>
  {:else}
    <div class="p-4 bg-surface-secondary rounded-lg text-center text-muted">
      {filteredEvents.length > 0
        ? `${filteredEvents.length} Ereignisse angezeigt. Klicken Sie auf ein Ereignis für Details.`
        : 'Keine Ereignisse in den ausgewaehlten Kategorien.'}
    </div>
  {/if}
</div>
