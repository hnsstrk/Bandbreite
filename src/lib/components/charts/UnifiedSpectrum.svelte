<script lang="ts">
  import * as d3 from 'd3';
  import {
    IEEE_BANDS,
    NATO_BANDS,
    ITU_BANDS,
    EM_BANDS,
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
  // Speed of light - reactive to store
  let currentSpeedOfLight = $derived(speedOfLight.value);

  // Spectrum max (RF mode: 3 THz)
  const spectrumMax = 3e12;

  // Layout constants
  const rowHeight = 48;
  const margin = { top: 60, right: 100, bottom: 60, left: 80 };
  const gap = 8;

  // Row visibility state
  let visibleRows = $state({
    em: true,
    itu: true,
    ieee: true,
    nato: true
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

  // ONE shared D3 logarithmic scale
  let xScale = $derived(
    d3.scaleLog()
      .domain([SPECTRUM_MIN, spectrumMax])
      .range([0, innerWidth])
  );

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

  // Single marker position for all rows
  let markerX = $derived(
    frequencyHz && frequencyHz >= SPECTRUM_MIN && frequencyHz <= spectrumMax
      ? xScale(frequencyHz)
      : null
  );

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

  // Frequency axis ticks
  const frequencyTicks = [10, 100, 1e3, 10e3, 100e3, 1e6, 10e6, 100e6, 1e9, 10e9, 100e9, 1e12];

  // Wavelength axis ticks (λ = c/f) - reactive to speed of light changes
  let wavelengthTicks = $derived([
    { freq: currentSpeedOfLight / 100e3, label: '100 km' },
    { freq: currentSpeedOfLight / 10e3, label: '10 km' },
    { freq: currentSpeedOfLight / 1e3, label: '1 km' },
    { freq: currentSpeedOfLight / 100, label: '100 m' },
    { freq: currentSpeedOfLight / 10, label: '10 m' },
    { freq: currentSpeedOfLight / 1, label: '1 m' },
    { freq: currentSpeedOfLight / 0.1, label: '10 cm' },
    { freq: currentSpeedOfLight / 0.01, label: '1 cm' },
    { freq: currentSpeedOfLight / 0.001, label: '1 mm' },
    { freq: currentSpeedOfLight / 0.0001, label: '100 µm' }
  ]);

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
    const rowOrder: RowKey[] = ['em', 'itu', 'ieee', 'nato'];
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
    { key: 'nato', label: 'NATO', bands: natoBandRects }
  ]);
</script>

<div
  bind:this={containerElement}
  class="w-full min-h-[50vh] bg-slate-900 rounded-lg p-4 relative"
  role="img"
  aria-label="Unified electromagnetic spectrum visualization"
>
  <!-- Control bar: Band row selector -->
  <div class="flex flex-wrap gap-4 mb-4">
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

  <svg width="100%" height={totalHeight}>
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
      class="absolute pointer-events-none bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-3 py-2 z-50"
      style="left: {Math.min(tooltip.x + 10, containerWidth - 200)}px; top: {tooltip.y - 70}px;"
    >
      <div class="text-white font-medium text-sm">{tooltip.band.name}</div>
      {#if tooltip.band.nameDE && tooltip.band.nameDE !== tooltip.band.name}
        <div class="text-slate-400 text-xs">{tooltip.band.nameDE}</div>
      {/if}
      <div class="text-slate-300 text-xs mt-1">
        {formatFrequencyRange(tooltip.band.minHz, tooltip.band.maxHz)}
      </div>
      <div class="text-slate-400 text-xs mt-0.5">
        λ: {formatWavelength(currentSpeedOfLight / tooltip.band.maxHz)} - {formatWavelength(currentSpeedOfLight / tooltip.band.minHz)}
      </div>
    </div>
  {/if}
</div>
