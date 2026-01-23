<script lang="ts">
  import * as d3 from 'd3';
  import {
    IEEE_BANDS,
    NATO_BANDS,
    ITU_BANDS,
    EM_BANDS,
    CIVILIAN_BANDS,
    formatFrequencyRange,
    type FrequencyBand
  } from '$lib/data/bands';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

  interface Props {
    frequencyHz?: number;
    showLabels?: boolean;
  }

  let { frequencyHz, showLabels = true }: Props = $props();

  // Constants
  const SPECTRUM_MIN = 3;           // 3 Hz
  const SPECTRUM_MAX_FULL = 3e21;   // 3 ZHz (Gamma rays)
  const SPECTRUM_MAX_RF = 3e12;     // 3 THz (RF/Microwave only)

  // Speed of light - reactive to store
  let currentSpeedOfLight = $derived(speedOfLight.value);

  // View mode: 'rf' shows only RF spectrum (3 Hz - 3 THz), 'full' shows entire EM spectrum
  let viewMode = $state<'rf' | 'full'>('rf');

  // Derived spectrum max based on view mode
  let spectrumMax = $derived(viewMode === 'full' ? SPECTRUM_MAX_FULL : SPECTRUM_MAX_RF);

  // Zoom state
  let zoomLevel = $state(1);
  let panOffset = $state(0);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 100;

  // Layout constants
  const rowHeight = 48;
  const margin = { top: 60, right: 100, bottom: 60, left: 80 };
  const gap = 8;

  // Row visibility state
  let visibleRows = $state({
    em: true,
    itu: true,
    ieee: true,
    nato: true,
    civilian: false
  });

  type RowKey = keyof typeof visibleRows;

  // Toggle row visibility
  function toggleRow(row: RowKey) {
    visibleRows[row] = !visibleRows[row];
  }

  // Container state
  let containerWidth = $state(800);
  let containerElement: HTMLDivElement | undefined = $state(undefined);

  // Tooltip state
  let tooltip = $state<{
    visible: boolean;
    x: number;
    y: number;
    band: FrequencyBand | null;
  }>({ visible: false, x: 0, y: 0, band: null });

  // Derived calculations
  let innerWidth = $derived(Math.max(containerWidth - margin.left - margin.right, 100));

  let visibleRowCount = $derived(
    Object.values(visibleRows).filter(Boolean).length
  );

  // Calculate zoomed domain
  let zoomedDomain = $derived.by(() => {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;

    // Calculate visible range based on zoom level
    const visibleLogRange = logRange / zoomLevel;

    // Calculate pan limits
    const maxPan = logRange - visibleLogRange;
    const clampedPan = Math.max(0, Math.min(panOffset, maxPan));

    const newLogMin = logMin + clampedPan;
    const newLogMax = newLogMin + visibleLogRange;

    return [Math.pow(10, newLogMin), Math.pow(10, newLogMax)] as [number, number];
  });

  // ONE shared D3 logarithmic scale with zoom support
  let xScale = $derived(
    d3.scaleLog()
      .domain(zoomedDomain)
      .range([0, innerWidth])
  );

  // Zoom control functions
  function zoomIn() {
    if (zoomLevel < MAX_ZOOM) {
      const newZoom = Math.min(zoomLevel * 1.5, MAX_ZOOM);
      // Adjust pan to keep center in view
      const logMin = Math.log10(SPECTRUM_MIN);
      const logMax = Math.log10(spectrumMax);
      const logRange = logMax - logMin;
      const oldVisibleRange = logRange / zoomLevel;
      const newVisibleRange = logRange / newZoom;
      const centerOffset = panOffset + oldVisibleRange / 2;
      panOffset = Math.max(0, centerOffset - newVisibleRange / 2);
      zoomLevel = newZoom;
    }
  }

  function zoomOut() {
    if (zoomLevel > MIN_ZOOM) {
      const newZoom = Math.max(zoomLevel / 1.5, MIN_ZOOM);
      const logMin = Math.log10(SPECTRUM_MIN);
      const logMax = Math.log10(spectrumMax);
      const logRange = logMax - logMin;
      const oldVisibleRange = logRange / zoomLevel;
      const newVisibleRange = logRange / newZoom;
      const centerOffset = panOffset + oldVisibleRange / 2;
      panOffset = Math.max(0, centerOffset - newVisibleRange / 2);
      zoomLevel = newZoom;
    }
  }

  function resetZoom() {
    zoomLevel = 1;
    panOffset = 0;
  }

  function panLeft() {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const panStep = visibleLogRange * 0.25;
    panOffset = Math.max(0, panOffset - panStep);
  }

  function panRight() {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const maxPan = logRange - visibleLogRange;
    const panStep = visibleLogRange * 0.25;
    panOffset = Math.min(maxPan, panOffset + panStep);
  }

  // Handle mouse wheel zoom
  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }

  // Helper function to calculate band rectangle
  function calcBandRect(band: { minHz: number; maxHz: number }) {
    const clampedMin = Math.max(band.minHz, SPECTRUM_MIN);
    const clampedMax = Math.min(band.maxHz, spectrumMax);
    if (clampedMin >= spectrumMax || clampedMax <= SPECTRUM_MIN) {
      return { x: 0, width: 0, visible: false };
    }
    const x = xScale(clampedMin);
    const width = xScale(clampedMax) - x;
    return { x, width, visible: width > 0 };
  }

  // Calculate band rectangles for each row
  let emBandRects = $derived(
    EM_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let ituBandRects = $derived(
    ITU_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let ieeeBandRects = $derived(
    IEEE_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let natoBandRects = $derived(
    NATO_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let civilianBandRects = $derived(
    CIVILIAN_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  // Single marker position for all rows (check if in visible range)
  let markerX = $derived.by(() => {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) {
      return null;
    }
    const [domainMin, domainMax] = zoomedDomain;
    if (frequencyHz < domainMin || frequencyHz > domainMax) {
      return null; // Marker is outside visible range
    }
    return xScale(frequencyHz);
  });

  // Format frequency for display
  function formatFrequency(hz: number): string {
    if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // Format wavelength for display
  function formatWavelength(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`;
    if (meters >= 1) return `${meters.toFixed(0)} m`;
    if (meters >= 0.01) return `${(meters * 100).toFixed(0)} cm`;
    if (meters >= 0.001) return `${(meters * 1000).toFixed(0)} mm`;
    if (meters >= 1e-6) return `${(meters * 1e6).toFixed(meters >= 1e-5 ? 0 : 1)} µm`;
    return `${(meters * 1e9).toFixed(0)} nm`;
  }

  // Frequency axis ticks - dynamically computed based on zoom domain
  let frequencyTicks = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const logMin = Math.floor(Math.log10(domainMin));
    const logMax = Math.ceil(Math.log10(domainMax));
    const ticks: number[] = [];

    for (let exp = logMin; exp <= logMax; exp++) {
      const value = Math.pow(10, exp);
      if (value >= domainMin && value <= domainMax) {
        ticks.push(value);
      }
      // Add intermediate ticks for better resolution when zoomed
      if (zoomLevel > 3) {
        const midValue = value * 3;
        if (midValue >= domainMin && midValue <= domainMax) {
          ticks.push(midValue);
        }
      }
    }

    return ticks.sort((a, b) => a - b);
  });

  // Wavelength axis ticks (λ = c/f) - reactive to speed of light changes and zoom domain
  let wavelengthTicks = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const allTicks = [
      { wavelength: 100e6, label: '100 Mm' },
      { wavelength: 10e6, label: '10 Mm' },
      { wavelength: 1e6, label: '1 Mm' },
      { wavelength: 100e3, label: '100 km' },
      { wavelength: 10e3, label: '10 km' },
      { wavelength: 1e3, label: '1 km' },
      { wavelength: 100, label: '100 m' },
      { wavelength: 10, label: '10 m' },
      { wavelength: 1, label: '1 m' },
      { wavelength: 0.1, label: '10 cm' },
      { wavelength: 0.01, label: '1 cm' },
      { wavelength: 0.001, label: '1 mm' },
      { wavelength: 0.0001, label: '100 µm' },
      { wavelength: 0.00001, label: '10 µm' },
      { wavelength: 0.000001, label: '1 µm' },
      { wavelength: 1e-7, label: '100 nm' },
      { wavelength: 1e-8, label: '10 nm' },
      { wavelength: 1e-9, label: '1 nm' },
      { wavelength: 1e-10, label: '100 pm' },
      { wavelength: 1e-11, label: '10 pm' },
      { wavelength: 1e-12, label: '1 pm' },
    ];

    return allTicks
      .map(t => ({ freq: currentSpeedOfLight / t.wavelength, label: t.label }))
      .filter(t => t.freq >= domainMin && t.freq <= domainMax);
  });

  // Tooltip handlers
  function showTooltip(event: MouseEvent, band: FrequencyBand) {
    const rect = containerElement?.getBoundingClientRect();
    if (!rect) return;
    tooltip = {
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      band
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false, band: null };
  }

  // ResizeObserver for responsive width
  $effect(() => {
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Calculate row Y positions based on visibility
  function getRowY(rowIndex: number): number {
    let y = margin.top;
    const rowOrder: RowKey[] = ['em', 'itu', 'ieee', 'nato', 'civilian'];
    for (let i = 0; i < rowIndex; i++) {
      if (visibleRows[rowOrder[i]]) {
        y += rowHeight + gap;
      }
    }
    return y;
  }

  // Total SVG height
  let totalHeight = $derived(
    margin.top + (visibleRowCount * rowHeight) + ((visibleRowCount - 1) * gap) + margin.bottom
  );

  // Calculate total band row height for marker line
  let bandRowsHeight = $derived(
    (visibleRowCount * rowHeight) + ((visibleRowCount - 1) * gap)
  );

  // Row configuration
  const rowConfig: { key: RowKey; label: string; bands: typeof emBandRects }[] = $derived([
    { key: 'em', label: 'EM', bands: emBandRects },
    { key: 'itu', label: 'ITU', bands: ituBandRects },
    { key: 'ieee', label: 'IEEE', bands: ieeeBandRects },
    { key: 'nato', label: 'NATO', bands: natoBandRects },
    { key: 'civilian', label: 'Zivil', bands: civilianBandRects }
  ]);

  // Format zoom level for display
  function formatZoom(level: number): string {
    if (level >= 10) return `${Math.round(level)}x`;
    return `${level.toFixed(1)}x`;
  }

  // Center view on marker frequency
  function centerOnMarker() {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) return;

    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const markerLogPos = Math.log10(frequencyHz);

    // Center the marker in the view
    panOffset = Math.max(0, Math.min(logRange - visibleLogRange, markerLogPos - logMin - visibleLogRange / 2));
  }
</script>

<div
  bind:this={containerElement}
  class="w-full min-h-[50vh] bg-slate-900 rounded-lg p-4 relative"
  role="img"
  aria-label="Unified electromagnetic spectrum visualization"
>
  <!-- Control bar: Band row selector and zoom controls -->
  <div class="flex flex-wrap gap-4 mb-4 items-center justify-between">
    <!-- Band row selector -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-slate-400 text-sm mr-1">Baender:</span>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.em ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('em')}
        aria-pressed={visibleRows.em}
      >
        EM-Spektrum
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.itu ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('itu')}
        aria-pressed={visibleRows.itu}
      >
        ITU
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.ieee ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('ieee')}
        aria-pressed={visibleRows.ieee}
      >
        IEEE
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.nato ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('nato')}
        aria-pressed={visibleRows.nato}
      >
        NATO
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.civilian ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('civilian')}
        aria-pressed={visibleRows.civilian}
      >
        Zivil
      </button>
    </div>

    <!-- View mode toggle -->
    <div class="flex items-center gap-2">
      <span class="text-slate-400 text-sm">Ansicht:</span>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'rf' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => { viewMode = 'rf'; resetZoom(); }}
      >
        RF (3 Hz - 3 THz)
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'full' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => { viewMode = 'full'; resetZoom(); }}
      >
        Gesamt (bis Gamma)
      </button>
    </div>

    <!-- Zoom and pan controls -->
    <div class="flex items-center gap-2">
      <span class="text-slate-400 text-sm">Zoom:</span>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={panLeft}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Nach links verschieben"
        title="Nach links verschieben"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={zoomOut}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Herauszoomen"
        title="Herauszoomen"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="text-slate-300 text-sm font-mono min-w-[3.5rem] text-center">{formatZoom(zoomLevel)}</span>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={zoomIn}
        disabled={zoomLevel >= MAX_ZOOM}
        aria-label="Hineinzoomen"
        title="Hineinzoomen"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={panRight}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Nach rechts verschieben"
        title="Nach rechts verschieben"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        class="px-2 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
        onclick={resetZoom}
        aria-label="Zoom zuruecksetzen"
        title="Zoom zuruecksetzen"
      >
        Reset
      </button>
      {#if frequencyHz}
        <button
          class="px-2 py-1 text-sm bg-amber-700 text-amber-100 rounded hover:bg-amber-600"
          onclick={centerOnMarker}
          aria-label="Auf Marker zentrieren"
          title="Auf Marker zentrieren"
        >
          Zentrieren
        </button>
      {/if}
    </div>
  </div>

  <!-- Frequency marker display -->
  {#if frequencyHz}
    <div class="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/50 rounded px-3 py-1.5">
      <span class="text-amber-400 text-sm font-mono">{formatFrequency(frequencyHz)}</span>
      <span class="text-amber-400/70 text-xs ml-2">
        (λ = {formatWavelength(currentSpeedOfLight / frequencyHz)})
      </span>
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    width="100%"
    height={totalHeight}
    onwheel={handleWheel}
    class="cursor-crosshair"
  >
    <defs>
      <!-- Visible light gradient (horizontal for band display) -->
      <linearGradient id="visibleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="20%" stop-color="#f97316" />
        <stop offset="40%" stop-color="#eab308" />
        <stop offset="60%" stop-color="#22c55e" />
        <stop offset="80%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <!-- Visible light gradient (vertical for reference marker) -->
      <linearGradient id="visibleGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="20%" stop-color="#f97316" />
        <stop offset="40%" stop-color="#eab308" />
        <stop offset="60%" stop-color="#22c55e" />
        <stop offset="80%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>

    <g transform="translate({margin.left}, 0)">
      <!-- TOP AXIS: Wavelength -->
      <g transform="translate(0, {margin.top - 10})">
        <line
          x1="0"
          y1="0"
          x2={innerWidth}
          y2="0"
          stroke="#475569"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          class="fill-slate-400 text-xs"
        >
          λ
        </text>
        {#each wavelengthTicks as tick (tick.label)}
          {@const tickX = xScale(tick.freq)}
          {#if tickX >= 0 && tickX <= innerWidth}
            <g transform="translate({tickX}, 0)">
              <line
                y1="-6"
                y2="0"
                stroke="#475569"
                stroke-width="1"
              />
              <text
                y="-12"
                text-anchor="middle"
                class="fill-slate-400 text-xs"
                style="font-size: 10px;"
              >
                {tick.label}
              </text>
            </g>
          {/if}
        {/each}
      </g>

      <!-- Band rows -->
      {#each rowConfig as row, rowIndex (row.key)}
        {#if visibleRows[row.key]}
          {@const rowY = getRowY(rowIndex)}
          <g transform="translate(0, {rowY})">
            <!-- Row label -->
            <text
              x="-10"
              y={rowHeight / 2}
              text-anchor="end"
              dominant-baseline="middle"
              class="fill-slate-400 text-sm font-medium"
            >
              {row.label}
            </text>

            <!-- Background rectangle -->
            <rect
              x="0"
              y="0"
              width={innerWidth}
              height={rowHeight}
              fill="#1e293b"
              stroke="#334155"
              stroke-width="1"
            />

            <!-- Band rectangles -->
            {#each row.bands as band (band.id)}
              <g
                role="graphics-symbol"
                aria-label="{band.name}: {formatFrequencyRange(band.minHz, band.maxHz)}"
                onmouseenter={(e) => showTooltip(e, band)}
                onmouseleave={hideTooltip}
                onmousemove={(e) => showTooltip(e, band)}
                class="cursor-pointer"
              >
                <rect
                  x={band.x}
                  y="2"
                  width={Math.max(band.width, 2)}
                  height={rowHeight - 4}
                  fill={band.id === 'em-visible' ? 'url(#visibleGradient)' : band.color}
                  opacity="0.9"
                  stroke="#0f172a"
                  stroke-width="0.5"
                  class="transition-opacity hover:opacity-70"
                />
                {#if showLabels && band.width > 25}
                  <text
                    x={band.x + band.width / 2}
                    y={rowHeight / 2}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="fill-white text-xs font-medium pointer-events-none"
                    style="text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-size: 11px;"
                  >
                    {band.name}
                  </text>
                {/if}
              </g>
            {/each}
          </g>
        {/if}
      {/each}

      <!-- Single marker line spanning all visible rows -->
      {#if markerX !== null && visibleRowCount > 0}
        <line
          x1={markerX}
          y1={margin.top - 5}
          x2={markerX}
          y2={margin.top + bandRowsHeight + 5}
          stroke="#fbbf24"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <!-- Marker label at top -->
        <circle
          cx={markerX}
          cy={margin.top - 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
        <!-- Marker label at bottom -->
        <circle
          cx={markerX}
          cy={margin.top + bandRowsHeight + 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
      {/if}

      <!-- BOTTOM AXIS: Frequency -->
      <g transform="translate(0, {margin.top + bandRowsHeight + 10})">
        <line
          x1="0"
          y1="0"
          x2={innerWidth}
          y2="0"
          stroke="#475569"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          class="fill-slate-400 text-xs"
        >
          f
        </text>
        {#each frequencyTicks as tick (tick)}
          {@const tickX = xScale(tick)}
          {#if tickX >= 0 && tickX <= innerWidth}
            <g transform="translate({tickX}, 0)">
              <line
                y1="0"
                y2="6"
                stroke="#475569"
                stroke-width="1"
              />
              <text
                y="20"
                text-anchor="middle"
                class="fill-slate-400 text-xs"
                style="font-size: 10px;"
              >
                {formatFrequency(tick)}
              </text>
            </g>
          {/if}
        {/each}
      </g>

      <!-- Visible Light Reference Marker -->
      {#if visibleRowCount > 0}
        <g transform="translate({innerWidth + 20}, {margin.top})">
          <!-- Rainbow stripe -->
          <rect
            x="0"
            y="0"
            width="12"
            height={bandRowsHeight}
            rx="3"
            ry="3"
            fill="url(#visibleGradientVertical)"
            stroke="#475569"
            stroke-width="1"
          />

          <!-- Arrow pointing right -->
          <path
            d="M -8 {bandRowsHeight / 2} L -3 {bandRowsHeight / 2 - 4} L -3 {bandRowsHeight / 2 + 4} Z"
            fill="#94a3b8"
          />

          <!-- Label "Sichtbares Licht" (rotated) -->
          <text
            x="22"
            y={bandRowsHeight / 2}
            text-anchor="middle"
            dominant-baseline="middle"
            transform="rotate(90, 22, {bandRowsHeight / 2})"
            class="fill-slate-300 font-medium"
            style="font-size: 11px;"
          >
            Sichtbares Licht
          </text>

          <!-- Frequency range label at bottom -->
          <text
            x="6"
            y={bandRowsHeight + 16}
            text-anchor="middle"
            class="fill-slate-500"
            style="font-size: 9px;"
          >
            400-800 THz
          </text>
        </g>
      {/if}
    </g>
  </svg>

  <!-- Tooltip -->
  {#if tooltip.visible && tooltip.band}
    <div
      class="absolute pointer-events-none bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 z-50 min-w-[200px]"
      style="left: {Math.min(tooltip.x + 10, containerWidth - 220)}px; top: {Math.max(10, tooltip.y - 100)}px;"
    >
      <div class="flex items-center gap-2 mb-2">
        <div
          class="w-3 h-3 rounded"
          style="background-color: {tooltip.band.color};"
        ></div>
        <div class="text-white font-medium">{tooltip.band.name}</div>
      </div>
      {#if tooltip.band.nameDE && tooltip.band.nameDE !== tooltip.band.name}
        <div class="text-slate-400 text-sm mb-2">{tooltip.band.nameDE}</div>
      {/if}
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-500">Frequenz:</span>
          <span class="text-slate-200 font-mono">{formatFrequencyRange(tooltip.band.minHz, tooltip.band.maxHz)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Wellenlaenge:</span>
          <span class="text-slate-200 font-mono">
            {formatWavelength(currentSpeedOfLight / tooltip.band.maxHz)} - {formatWavelength(currentSpeedOfLight / tooltip.band.minHz)}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Kategorie:</span>
          <span class="text-slate-200 capitalize">{tooltip.band.category}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Zoom hint -->
  {#if zoomLevel > 1}
    <div class="absolute bottom-2 left-2 text-slate-500 text-xs">
      Mausrad zum Zoomen, Pfeiltasten zum Verschieben
    </div>
  {/if}
</div>
