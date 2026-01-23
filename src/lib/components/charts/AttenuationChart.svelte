<script lang="ts">
  import * as d3 from 'd3';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { generateAttenuationCurve, calculatePathAttenuation } from '$lib/utils/atmosphericAttenuation';

  interface Props {
    frequencyGHz?: number;
    width?: number;
    height?: number;
  }

  let { frequencyGHz, width = 1000, height = 500 }: Props = $props();

  // Chart margins
  const margin = { top: 50, right: 200, bottom: 70, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Frequency and attenuation ranges
  const MIN_FREQ = 1; // 1 GHz
  const MAX_FREQ = 100; // 100 GHz
  const MIN_ATTENUATION = 0.001; // 0.001 dB/km
  const MAX_ATTENUATION = 100; // 100 dB/km

  // Logarithmic scales using D3
  let xScale = $derived(
    d3.scaleLog()
      .domain([MIN_FREQ, MAX_FREQ])
      .range([0, chartWidth])
      .clamp(true)
  );

  let yScale = $derived(
    d3.scaleLog()
      .domain([MIN_ATTENUATION, MAX_ATTENUATION])
      .range([chartHeight, 0])
      .clamp(true)
  );

  // Generate curve data - reactive to atmospheric parameters
  let curveData = $derived(
    generateAttenuationCurve(atmosphericParameters.conditions, MIN_FREQ, MAX_FREQ, 200)
  );

  // Line generators for each curve
  let oxygenLineGenerator = $derived(
    d3.line<{ frequencyGHz: number; oxygen: number }>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.oxygen)))
  );

  let waterVaporLineGenerator = $derived(
    d3.line<{ frequencyGHz: number; waterVapor: number }>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.waterVapor)))
  );

  let totalLineGenerator = $derived(
    d3.line<{ frequencyGHz: number; total: number }>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.total)))
  );

  // Marker position for current frequency
  let markerData = $derived.by(() => {
    if (!frequencyGHz || frequencyGHz < MIN_FREQ || frequencyGHz > MAX_FREQ) return null;

    const pathAttenuation = calculatePathAttenuation(frequencyGHz, atmosphericParameters.conditions);

    return {
      x: xScale(frequencyGHz),
      yOxygen: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.oxygenPerKm)),
      yWaterVapor: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.waterVaporPerKm)),
      yTotal: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.totalPerKm)),
      frequency: frequencyGHz,
      oxygen: pathAttenuation.oxygenPerKm,
      waterVapor: pathAttenuation.waterVaporPerKm,
      total: pathAttenuation.totalPerKm
    };
  });

  // X-axis tick values (frequency)
  const xTickValues = [1, 2, 5, 10, 20, 50, 100];

  // Y-axis tick values (attenuation)
  const yTickValues = [0.01, 0.1, 1, 10];

  // Format attenuation value
  function formatAttenuation(dBkm: number): string {
    if (dBkm >= 10) return dBkm.toFixed(1);
    if (dBkm >= 1) return dBkm.toFixed(2);
    if (dBkm >= 0.1) return dBkm.toFixed(3);
    if (dBkm >= 0.01) return dBkm.toFixed(4);
    return dBkm.toExponential(2);
  }
</script>

<div class="attenuation-chart w-full">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-auto"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <!-- Glow filter for marker -->
      <filter id="attenuationMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Drop shadow for tooltip -->
      <filter id="attenuationTooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" />
      </filter>
    </defs>

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
      <!-- Highlight regions -->
      <!-- 22 GHz water vapor region (20-24 GHz) -->
      <rect
        x={xScale(20)}
        y="0"
        width={xScale(24) - xScale(20)}
        height={chartHeight}
        fill="#22c55e"
        opacity="0.1"
      />

      <!-- 60 GHz oxygen region (50-70 GHz) -->
      <rect
        x={xScale(50)}
        y="0"
        width={xScale(70) - xScale(50)}
        height={chartHeight}
        fill="#3b82f6"
        opacity="0.1"
      />

      <!-- Grid lines - vertical (frequency) -->
      {#each xTickValues as tickVal (tickVal)}
        <line
          x1={xScale(tickVal)}
          y1="0"
          x2={xScale(tickVal)}
          y2={chartHeight}
          class="stroke-slate-700"
          stroke-dasharray="4,4"
          stroke-width="0.5"
        />
      {/each}

      <!-- Grid lines - horizontal (attenuation) -->
      {#each yTickValues as tickVal (tickVal)}
        <line
          x1="0"
          y1={yScale(tickVal)}
          x2={chartWidth}
          y2={yScale(tickVal)}
          class="stroke-slate-700"
          stroke-dasharray="4,4"
          stroke-width="0.5"
        />
      {/each}

      <!-- Oxygen attenuation curve (blue) -->
      <path
        d={oxygenLineGenerator(curveData)}
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Water vapor attenuation curve (green) -->
      <path
        d={waterVaporLineGenerator(curveData)}
        fill="none"
        stroke="#22c55e"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Total attenuation curve (red) -->
      <path
        d={totalLineGenerator(curveData)}
        fill="none"
        stroke="#ef4444"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- X-axis (Frequency) -->
      <g transform="translate(0, {chartHeight})">
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2="0"
          class="stroke-slate-500"
          stroke-width="1"
        />
        {#each xTickValues as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="8" class="stroke-slate-500" />
            <text
              y="24"
              class="fill-slate-300"
              text-anchor="middle"
              font-size="11"
            >
              {tickVal}
            </text>
          </g>
        {/each}
        <!-- X-axis label -->
        <text
          x={chartWidth / 2}
          y="52"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
        >
          Frequenz (GHz)
        </text>
      </g>

      <!-- Y-axis (Attenuation) -->
      <g>
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={chartHeight}
          class="stroke-slate-500"
          stroke-width="1"
        />
        {#each yTickValues as tickVal (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-8" class="stroke-slate-500" />
            <text
              x="-12"
              class="fill-slate-300"
              text-anchor="end"
              dominant-baseline="middle"
              font-size="11"
            >
              {tickVal}
            </text>
          </g>
        {/each}
        <!-- Y-axis label -->
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-55"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
        >
          Daempfung (dB/km)
        </text>
      </g>

      <!-- Interactive marker for current frequency -->
      {#if markerData}
        <!-- Crosshair lines -->
        <line
          x1={markerData.x}
          y1="0"
          x2={markerData.x}
          y2={chartHeight}
          class="stroke-amber-400"
          stroke-width="1.5"
          stroke-dasharray="8,4"
          opacity="0.8"
        />
        <line
          x1="0"
          y1={markerData.yTotal}
          x2={chartWidth}
          y2={markerData.yTotal}
          class="stroke-amber-400"
          stroke-width="1.5"
          stroke-dasharray="8,4"
          opacity="0.8"
        />

        <!-- Marker dot with glow effect -->
        <circle
          cx={markerData.x}
          cy={markerData.yTotal}
          r="10"
          class="fill-amber-400"
          filter="url(#attenuationMarkerGlow)"
        />
        <circle
          cx={markerData.x}
          cy={markerData.yTotal}
          r="5"
          class="fill-amber-200"
        />

        <!-- Tooltip with attenuation info -->
        {@const tooltipWidth = 180}
        {@const tooltipHeight = 90}
        {@const tooltipX = markerData.x > chartWidth / 2 ? markerData.x - tooltipWidth - 15 : markerData.x + 15}
        {@const tooltipY = markerData.yTotal > chartHeight / 2 ? markerData.yTotal - tooltipHeight - 10 : markerData.yTotal + 10}
        <g transform="translate({tooltipX}, {tooltipY})" filter="url(#attenuationTooltipShadow)">
          <rect
            x="0"
            y="0"
            width={tooltipWidth}
            height={tooltipHeight}
            rx="6"
            class="fill-slate-800"
            stroke="#475569"
            stroke-width="1"
          />
          <text x="12" y="20" class="fill-slate-200 font-medium" font-size="12">
            f = {markerData.frequency.toFixed(2)} GHz
          </text>
          <text x="12" y="38" font-size="11">
            <tspan class="fill-blue-400">O2:</tspan>
            <tspan class="fill-slate-200"> {formatAttenuation(markerData.oxygen)} dB/km</tspan>
          </text>
          <text x="12" y="54" font-size="11">
            <tspan class="fill-green-400">H2O:</tspan>
            <tspan class="fill-slate-200"> {formatAttenuation(markerData.waterVapor)} dB/km</tspan>
          </text>
          <text x="12" y="72" font-size="11">
            <tspan class="fill-red-400">Total:</tspan>
            <tspan class="fill-slate-200"> {formatAttenuation(markerData.total)} dB/km</tspan>
          </text>
        </g>
      {/if}

      <!-- Chart title -->
      <text
        x={chartWidth / 2}
        y="-25"
        class="fill-slate-100"
        text-anchor="middle"
        font-size="18"
        font-weight="600"
      >
        Atmosphaerische Daempfung (ITU-R P.676)
      </text>
    </g>

    <!-- Legend on the right side -->
    <g transform="translate({width - margin.right + 20}, {margin.top})">
      <!-- Current parameters -->
      <text class="fill-slate-300 font-medium" font-size="12" y="0">
        Parameter
      </text>
      <text class="fill-slate-400" font-size="10" y="18">
        T = {atmosphericParameters.temperatureCelsius.toFixed(1)} C
      </text>
      <text class="fill-slate-400" font-size="10" y="34">
        P = {atmosphericParameters.pressureHpa.toFixed(1)} hPa
      </text>
      <text class="fill-slate-400" font-size="10" y="50">
        rho = {atmosphericParameters.waterVaporDensity.toFixed(1)} g/m3
      </text>
      <text class="fill-slate-400" font-size="10" y="66">
        d = {atmosphericParameters.distanceKm.toFixed(1)} km
      </text>

      <!-- Line legend -->
      <text class="fill-slate-300 font-medium" font-size="12" y="100">
        Kurven
      </text>

      <!-- Oxygen line -->
      <g transform="translate(0, 115)">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#3b82f6" stroke-width="2" />
        <text x="32" y="4" class="fill-slate-400" font-size="10">O2</text>
      </g>

      <!-- Water vapor line -->
      <g transform="translate(0, 135)">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#22c55e" stroke-width="2" />
        <text x="32" y="4" class="fill-slate-400" font-size="10">H2O</text>
      </g>

      <!-- Total line -->
      <g transform="translate(0, 155)">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#ef4444" stroke-width="3" />
        <text x="32" y="4" class="fill-slate-400" font-size="10">Total</text>
      </g>

      <!-- Highlight regions legend -->
      <text class="fill-slate-300 font-medium" font-size="12" y="190">
        Regionen
      </text>

      <g transform="translate(0, 205)">
        <rect x="0" y="-6" width="14" height="14" fill="#22c55e" opacity="0.3" rx="2" />
        <text x="20" y="4" class="fill-slate-400" font-size="9">22 GHz (H2O)</text>
      </g>

      <g transform="translate(0, 225)">
        <rect x="0" y="-6" width="14" height="14" fill="#3b82f6" opacity="0.3" rx="2" />
        <text x="20" y="4" class="fill-slate-400" font-size="9">60 GHz (O2)</text>
      </g>
    </g>
  </svg>
</div>

<style>
  .attenuation-chart {
    container-type: inline-size;
  }
</style>
