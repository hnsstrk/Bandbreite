<script lang="ts">
  import * as d3 from 'd3';
  import { IEEE_BANDS, NATO_BANDS, formatFrequencyRange, type FrequencyBand } from '$lib/data/bands';

  interface Props {
    frequencyHz?: number;
    width?: number;
    height?: number;
  }

  let { frequencyHz, width = 1200, height = 400 }: Props = $props();

  // Chart margins
  const margin = { top: 50, right: 30, bottom: 60, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Row heights for IEEE and NATO bands
  const bandRowHeight = 35;
  const rowGap = 20;
  const ieeeY = 30;
  const natoY = ieeeY + bandRowHeight + rowGap + 30;

  // Filter bands to show (those within our frequency range)
  const minFreq = 1e6;   // 1 MHz
  const maxFreq = 120e9; // 120 GHz

  let visibleIEEE = $derived(
    IEEE_BANDS.filter(b => b.maxHz >= minFreq && b.minHz <= maxFreq)
  );

  let visibleNATO = $derived(
    NATO_BANDS.filter(b => b.maxHz >= minFreq && b.minHz <= maxFreq)
  );

  // D3 logarithmic scale
  let xScale = $derived(
    d3.scaleLog()
      .domain([minFreq, maxFreq])
      .range([0, chartWidth])
  );

  // Calculate band rectangles
  function getBandRect(band: FrequencyBand, scale: d3.ScaleLogarithmic<number, number, never>) {
    const clampedMin = Math.max(band.minHz, minFreq);
    const clampedMax = Math.min(band.maxHz, maxFreq);
    const x = scale(clampedMin);
    const rectWidth = scale(clampedMax) - scale(clampedMin);
    return { x, width: rectWidth };
  }

  let ieeeBandRects = $derived(
    visibleIEEE.map(band => ({
      ...band,
      ...getBandRect(band, xScale)
    }))
  );

  let natoBandRects = $derived(
    visibleNATO.map(band => ({
      ...band,
      ...getBandRect(band, xScale)
    }))
  );

  // Marker position
  let markerPosition = $derived(
    frequencyHz && frequencyHz >= minFreq && frequencyHz <= maxFreq
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

  // Tick values for the x-axis
  const xTickValues = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11];
  const xTickLabels = ['1 MHz', '10 MHz', '100 MHz', '1 GHz', '10 GHz', '100 GHz'];

  // Check if band contains current frequency
  function bandContainsFrequency(band: FrequencyBand): boolean {
    return frequencyHz !== undefined &&
           frequencyHz >= band.minHz &&
           frequencyHz <= band.maxHz;
  }
</script>

<div class="band-comparison-chart w-full">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-auto"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Vergleich der IEEE- und NATO-Frequenzbaender"
  >
    <!-- Background -->
    <rect
      x="0"
      y="0"
      width={width}
      height={height}
      class="fill-slate-900"
    />

    <!-- Chart area -->
    <g transform="translate({margin.left}, {margin.top})">
      <!-- Chart title -->
      <text
        x={chartWidth / 2}
        y="-25"
        class="fill-slate-100"
        text-anchor="middle"
        font-size="18"
        font-weight="600"
      >
        Frequenzbaender: IEEE vs NATO
      </text>

      <!-- IEEE Section Label -->
      <text
        x="-10"
        y={ieeeY + bandRowHeight / 2}
        class="fill-slate-200"
        text-anchor="end"
        dominant-baseline="middle"
        font-size="14"
        font-weight="500"
      >
        IEEE
      </text>

      <!-- IEEE Band rectangles -->
      {#each ieeeBandRects as band (band.id)}
        {@const isActive = bandContainsFrequency(band)}
        <g class="band-group">
          <rect
            x={band.x}
            y={ieeeY}
            width={band.width}
            height={bandRowHeight}
            fill={band.color}
            opacity={isActive ? 1 : 0.7}
            stroke={isActive ? '#ffffff' : '#1e293b'}
            stroke-width={isActive ? 2 : 1}
            rx="3"
          />
          <!-- Band label -->
          {#if band.width > 25}
            <text
              x={band.x + band.width / 2}
              y={ieeeY + bandRowHeight / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="fill-white text-xs font-semibold pointer-events-none"
              style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
            >
              {band.name}
            </text>
          {/if}
        </g>
      {/each}

      <!-- NATO Section Label -->
      <text
        x="-10"
        y={natoY + bandRowHeight / 2}
        class="fill-slate-200"
        text-anchor="end"
        dominant-baseline="middle"
        font-size="14"
        font-weight="500"
      >
        NATO
      </text>

      <!-- NATO Band rectangles -->
      {#each natoBandRects as band (band.id)}
        {@const isActive = bandContainsFrequency(band)}
        <g class="band-group">
          <rect
            x={band.x}
            y={natoY}
            width={band.width}
            height={bandRowHeight}
            fill={band.color}
            opacity={isActive ? 1 : 0.7}
            stroke={isActive ? '#ffffff' : '#1e293b'}
            stroke-width={isActive ? 2 : 1}
            rx="3"
          />
          <!-- Band label -->
          {#if band.width > 20}
            <text
              x={band.x + band.width / 2}
              y={natoY + bandRowHeight / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="fill-white text-xs font-semibold pointer-events-none"
              style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
            >
              {band.name}
            </text>
          {/if}
        </g>
      {/each}

      <!-- Frequency marker line -->
      {#if markerPosition !== null && frequencyHz}
        <line
          x1={markerPosition}
          y1={ieeeY - 10}
          x2={markerPosition}
          y2={natoY + bandRowHeight + 10}
          stroke="#ffffff"
          stroke-width="2"
          stroke-dasharray="6,3"
        />
        <circle
          cx={markerPosition}
          cy={ieeeY - 10}
          r="5"
          fill="#fbbf24"
          stroke="#ffffff"
          stroke-width="2"
        />
        <circle
          cx={markerPosition}
          cy={natoY + bandRowHeight + 10}
          r="5"
          fill="#fbbf24"
          stroke="#ffffff"
          stroke-width="2"
        />
        <!-- Marker label at top -->
        <text
          x={markerPosition}
          y={ieeeY - 25}
          text-anchor="middle"
          class="fill-amber-400 text-sm font-mono font-semibold"
        >
          {formatFrequency(frequencyHz)}
        </text>
      {/if}

      <!-- X-axis -->
      <g transform="translate(0, {natoY + bandRowHeight + 40})">
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2="0"
          class="stroke-slate-500"
          stroke-width="1"
        />
        {#each xTickValues as tickVal, i (tickVal)}
          {@const tickX = xScale(tickVal)}
          <g transform="translate({tickX}, 0)">
            <line y2="8" class="stroke-slate-500" />
            <text
              y="24"
              class="fill-slate-300"
              text-anchor="middle"
              font-size="12"
            >
              {xTickLabels[i]}
            </text>
          </g>
        {/each}
        <!-- X-axis label -->
        <text
          x={chartWidth / 2}
          y="50"
          class="fill-slate-400"
          text-anchor="middle"
          font-size="13"
        >
          Frequenz (logarithmische Skala)
        </text>
      </g>

      <!-- Grid lines (vertical, very subtle) -->
      {#each xTickValues as tickVal (tickVal)}
        <line
          x1={xScale(tickVal)}
          y1={ieeeY - 5}
          x2={xScale(tickVal)}
          y2={natoY + bandRowHeight + 5}
          class="stroke-slate-700"
          stroke-dasharray="2,4"
          stroke-width="1"
          opacity="0.5"
        />
      {/each}
    </g>
  </svg>

  <!-- Legend -->
  <div class="mt-4 flex flex-wrap gap-4 justify-center text-sm text-slate-400">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <span>IEEE: Radar- und Mikrowellenbaender</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-pink-500"></div>
      <span>NATO: Militaerische Bandbezeichnungen</span>
    </div>
  </div>
</div>

<style>
  .band-comparison-chart {
    container-type: inline-size;
  }

  .band-group rect {
    transition: opacity 0.2s ease, stroke-width 0.2s ease;
  }

  .band-group:hover rect {
    opacity: 1;
  }
</style>
