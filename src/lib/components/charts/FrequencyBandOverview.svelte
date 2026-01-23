<script lang="ts">
  import * as d3 from 'd3';
  import { DE_ALT_BANDS, US_ALT_BANDS, EU_NATO_BANDS, type FrequencyBand } from '$lib/data/bands';

  interface Props {
    frequencyHz?: number;
  }

  let { frequencyHz }: Props = $props();

  // Chart dimensions
  const margin = { top: 20, right: 120, bottom: 60, left: 120 };
  let containerWidth = $state(1000);
  let containerElement: HTMLDivElement;

  // Derived dimensions
  let chartWidth = $derived(Math.max(containerWidth - margin.left - margin.right, 400));

  // Row configuration
  const rowHeight = 40;
  const rowGap = 8;
  const labelGap = 15;

  // Frequency range (log scale): 100 MHz to 100 GHz
  const minFreq = 100e6;   // 100 MHz = 0.1 GHz
  const maxFreq = 100e9;   // 100 GHz

  // D3 logarithmic scale
  let xScale = $derived(
    d3.scaleLog()
      .domain([minFreq, maxFreq])
      .range([0, chartWidth])
  );

  // Band row definitions
  const bandRows = [
    { id: 'de-alt', label: 'D (alt)', flag: '🇩🇪', bands: DE_ALT_BANDS, bgColor: '#6366f1' },
    { id: 'us-alt', label: 'USA (alt)', flag: '🇺🇸', bands: US_ALT_BANDS, bgColor: '#facc15' },
    { id: 'eu-nato', label: 'Europa (neu)', flag: '🇪🇺', bands: EU_NATO_BANDS, bgColor: '#22c55e' },
  ];

  // Calculate band rectangles
  function getBandRects(bands: FrequencyBand[]) {
    return bands
      .filter(b => b.maxHz > minFreq && b.minHz < maxFreq)
      .map(band => {
        const clampedMin = Math.max(band.minHz, minFreq);
        const clampedMax = Math.min(band.maxHz, maxFreq);
        const x = xScale(clampedMin);
        const width = xScale(clampedMax) - x;
        return { ...band, x, width, clampedMin, clampedMax };
      });
  }

  let bandRects = $derived(
    bandRows.map(row => ({
      ...row,
      rects: getBandRects(row.bands)
    }))
  );

  // Frequency ticks for axis
  const freqTicks = [
    { hz: 200e6, label: '0,2' },
    { hz: 250e6, label: '0,25' },
    { hz: 500e6, label: '0,5' },
    { hz: 1e9, label: '1,0' },
    { hz: 2e9, label: '2' },
    { hz: 3e9, label: '3' },
    { hz: 4e9, label: '4' },
    { hz: 6e9, label: '6' },
    { hz: 8e9, label: '8' },
    { hz: 10e9, label: '10' },
    { hz: 20e9, label: '20' },
    { hz: 40e9, label: '40' },
    { hz: 60e9, label: '60' },
    { hz: 100e9, label: '100' },
  ];

  // Wavelength ticks (in cm)
  const wavelengthTicks = [
    { hz: 100e6, label: '300' },
    { hz: 200e6, label: '150' },
    { hz: 500e6, label: '60' },
    { hz: 1e9, label: '30' },
    { hz: 2e9, label: '15' },
    { hz: 4e9, label: '7,5' },
    { hz: 6e9, label: '5' },
    { hz: 10e9, label: '3' },
    { hz: 20e9, label: '1,5' },
    { hz: 40e9, label: '0,75' },
    { hz: 60e9, label: '0,5' },
    { hz: 100e9, label: '0,3' },
  ];

  // EM Spectrum bands for right side display
  const emSpectrumBands = [
    { id: 'ir', label: 'IR', color: '#7f1d1d', minHz: 3e11, maxHz: 4e14 },
    { id: 'visible', label: 'sichtbares\nLicht', color: 'linear-gradient(to bottom, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)', minHz: 4e14, maxHz: 8e14 },
    { id: 'uv', label: 'UV', color: '#4c1d95', minHz: 8e14, maxHz: 3e16 },
  ];

  // Calculate total height
  let totalHeight = $derived(
    margin.top +
    bandRows.length * rowHeight +
    (bandRows.length - 1) * rowGap +
    margin.bottom + 40
  );

  // Marker position for current frequency
  let markerX = $derived(
    frequencyHz && frequencyHz >= minFreq && frequencyHz <= maxFreq
      ? xScale(frequencyHz)
      : null
  );

  // Check if band contains frequency
  function bandContainsFrequency(band: { clampedMin: number; clampedMax: number }): boolean {
    return frequencyHz !== undefined &&
           frequencyHz >= band.clampedMin &&
           frequencyHz <= band.clampedMax;
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

  // Calculate Y position for each row
  function getRowY(index: number): number {
    return margin.top + index * (rowHeight + rowGap);
  }

  // Frequency axis Y position
  let freqAxisY = $derived(margin.top + bandRows.length * (rowHeight + rowGap) - rowGap / 2);

  // Wavelength axis Y position
  let wavelengthAxisY = $derived(freqAxisY + 50);
</script>

<div
  bind:this={containerElement}
  class="frequency-band-overview w-full bg-white rounded-lg"
>
  <svg
    width="100%"
    viewBox="0 0 {containerWidth} {totalHeight}"
    class="select-none"
    role="img"
    aria-label="Frequenzband-Uebersicht: Deutsche, US und NATO Bezeichnungen"
  >
    <!-- Band rows -->
    {#each bandRects as row, rowIndex (row.id)}
      {@const y = getRowY(rowIndex)}

      <!-- Flag/Label area -->
      <g transform="translate(10, {y})">
        <text
          x="0"
          y={rowHeight / 2}
          dominant-baseline="middle"
          class="text-2xl"
        >
          {row.flag}
        </text>
        <text
          x="35"
          y={rowHeight / 2}
          dominant-baseline="middle"
          class="fill-slate-800 text-sm font-medium"
        >
          {row.label}
        </text>
      </g>

      <!-- Band rectangles -->
      <g transform="translate({margin.left}, {y})">
        {#each row.rects as band (band.id)}
          {@const isActive = bandContainsFrequency(band)}
          <rect
            x={band.x}
            y="0"
            width={band.width}
            height={rowHeight}
            fill={band.color}
            stroke="#334155"
            stroke-width="1"
            class="transition-opacity duration-150"
            opacity={isActive ? 1 : 0.85}
          />
          <!-- Band label -->
          {#if band.width > 18}
            <text
              x={band.x + band.width / 2}
              y={rowHeight / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="fill-slate-900 font-semibold pointer-events-none"
              style="font-size: {band.width > 40 ? '14px' : '11px'};"
            >
              {band.name}
            </text>
          {/if}
        {/each}

        <!-- Top/bottom border line for row -->
        <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#334155" stroke-width="1" />
        <line x1="0" y1={rowHeight} x2={chartWidth} y2={rowHeight} stroke="#334155" stroke-width="1" />
      </g>

      <!-- EM Spectrum indicator on right -->
      <g transform="translate({margin.left + chartWidth + 10}, {y})">
        <text
          x="0"
          y={rowHeight / 2}
          dominant-baseline="middle"
          class="fill-slate-600 text-xs"
        >
          IR
        </text>
      </g>
    {/each}

    <!-- Frequency marker line -->
    {#if markerX !== null && frequencyHz}
      <line
        x1={margin.left + markerX}
        y1={margin.top - 5}
        x2={margin.left + markerX}
        y2={freqAxisY - 5}
        stroke="#dc2626"
        stroke-width="2"
        stroke-dasharray="4,2"
      />
      <circle
        cx={margin.left + markerX}
        cy={margin.top - 5}
        r="4"
        fill="#dc2626"
      />
    {/if}

    <!-- Frequency axis -->
    <g transform="translate({margin.left}, {freqAxisY})">
      <!-- Axis label -->
      <text
        x="-15"
        y="5"
        text-anchor="end"
        dominant-baseline="middle"
        class="fill-slate-700 text-sm font-medium"
      >
        Frequenz in GHz
      </text>

      <!-- Tick marks and labels -->
      {#each freqTicks as tick (tick.hz)}
        {@const tickX = xScale(tick.hz)}
        {#if tickX >= 0 && tickX <= chartWidth}
          <line
            x1={tickX}
            y1="-5"
            x2={tickX}
            y2="5"
            stroke="#64748b"
            stroke-width="1"
          />
          <text
            x={tickX}
            y="18"
            text-anchor="middle"
            class="fill-slate-600 text-xs"
          >
            {tick.label}
          </text>
        {/if}
      {/each}

      <!-- Axis line -->
      <line
        x1="0"
        y1="0"
        x2={chartWidth}
        y2="0"
        stroke="#334155"
        stroke-width="1"
      />
    </g>

    <!-- Wavelength axis -->
    <g transform="translate({margin.left}, {wavelengthAxisY})">
      <!-- Axis label -->
      <text
        x="-15"
        y="0"
        text-anchor="end"
        dominant-baseline="middle"
        class="fill-slate-700 text-sm font-medium"
      >
        Wellenlaenge in cm
      </text>

      <!-- Tick labels (wavelength decreases as frequency increases) -->
      {#each wavelengthTicks as tick (tick.hz)}
        {@const tickX = xScale(tick.hz)}
        {#if tickX >= 0 && tickX <= chartWidth}
          <text
            x={tickX}
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-slate-600 text-xs"
          >
            {tick.label}
          </text>
        {/if}
      {/each}
    </g>

    <!-- EM Spectrum visualization on right side -->
    <g transform="translate({margin.left + chartWidth + 25}, {margin.top})">
      <!-- IR band -->
      <rect
        x="0"
        y="0"
        width="25"
        height={rowHeight * 1.5}
        fill="#7f1d1d"
        stroke="#334155"
        stroke-width="1"
      />

      <!-- Visible light spectrum gradient -->
      <defs>
        <linearGradient id="visibleSpectrum" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="20%" stop-color="#f97316" />
          <stop offset="40%" stop-color="#eab308" />
          <stop offset="60%" stop-color="#22c55e" />
          <stop offset="80%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y={rowHeight * 1.5}
        width="25"
        height={rowHeight * 0.8}
        fill="url(#visibleSpectrum)"
        stroke="#334155"
        stroke-width="1"
      />

      <!-- UV band -->
      <rect
        x="0"
        y={rowHeight * 2.3}
        width="25"
        height={rowHeight * 0.7}
        fill="#4c1d95"
        stroke="#334155"
        stroke-width="1"
      />

      <!-- Labels -->
      <text x="35" y={rowHeight * 0.75} dominant-baseline="middle" class="fill-slate-600 text-xs">IR</text>
      <text x="35" y={rowHeight * 1.9} dominant-baseline="middle" class="fill-slate-600 text-xs">sichtbares</text>
      <text x="35" y={rowHeight * 2.1} dominant-baseline="middle" class="fill-slate-600 text-xs">Licht</text>
      <text x="35" y={rowHeight * 2.65} dominant-baseline="middle" class="fill-slate-600 text-xs">UV</text>
    </g>
  </svg>
</div>

<style>
  .frequency-band-overview {
    container-type: inline-size;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
