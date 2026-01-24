<script lang="ts">
  import * as d3 from 'd3';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import {
    generateExtendedAttenuationCurve,
    calculateExtendedPathAttenuation,
    type ExtendedCurveDataPoint
  } from '$lib/utils/atmosphericAttenuation';

  interface Props {
    frequencyGHz?: number;
    width?: number;
    height?: number;
    showPrecipitation?: boolean;
  }

  let {
    frequencyGHz,
    width = 1100,
    height = 600,
    showPrecipitation = true
  }: Props = $props();

  // Chart margins
  const margin = { top: 50, right: 220, bottom: 70, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Frequency and attenuation ranges
  const MIN_FREQ = 1; // 1 GHz
  const MAX_FREQ = 350; // 350 GHz (extended range to show 183 GHz peak)
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

  // Generate extended curve data including precipitation - reactive to all parameters
  let curveData = $derived(
    generateExtendedAttenuationCurve(atmosphericParameters.allConditions, MIN_FREQ, MAX_FREQ, 600)
  );

  // Line generators for each curve
  let oxygenLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.oxygen)))
  );

  let waterVaporLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.waterVapor)))
  );

  let totalGasLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.total)))
  );

  let rainLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.rain || MIN_ATTENUATION)))
  );

  let fogLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.fog || MIN_ATTENUATION)))
  );

  let snowLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.snow || MIN_ATTENUATION)))
  );

  let totalAllLineGenerator = $derived(
    d3.line<ExtendedCurveDataPoint>()
      .x(d => xScale(d.frequencyGHz))
      .y(d => yScale(Math.max(MIN_ATTENUATION, d.totalAll)))
  );

  // Check if precipitation is active
  let hasPrecipitation = $derived(
    atmosphericParameters.rainRateMmH > 0 ||
    atmosphericParameters.fogDensityGM3 > 0 ||
    atmosphericParameters.snowRateMmH > 0
  );

  // Marker position for current frequency
  let markerData = $derived.by(() => {
    if (!frequencyGHz || frequencyGHz < MIN_FREQ || frequencyGHz > MAX_FREQ) return null;

    const pathAttenuation = calculateExtendedPathAttenuation(
      frequencyGHz,
      atmosphericParameters.allConditions
    );

    return {
      x: xScale(frequencyGHz),
      yOxygen: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.oxygenPerKm)),
      yWaterVapor: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.waterVaporPerKm)),
      yTotal: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.totalPerKm)),
      yRain: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.rainPerKm || MIN_ATTENUATION)),
      yFog: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.fogPerKm || MIN_ATTENUATION)),
      ySnow: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.snowPerKm || MIN_ATTENUATION)),
      yTotalAll: yScale(Math.max(MIN_ATTENUATION, pathAttenuation.totalAllPerKm)),
      frequency: frequencyGHz,
      oxygen: pathAttenuation.oxygenPerKm,
      waterVapor: pathAttenuation.waterVaporPerKm,
      total: pathAttenuation.totalPerKm,
      rain: pathAttenuation.rainPerKm,
      fog: pathAttenuation.fogPerKm,
      snow: pathAttenuation.snowPerKm,
      totalAll: pathAttenuation.totalAllPerKm
    };
  });

  // X-axis tick values (frequency)
  const xTickValues = [1, 2, 5, 10, 20, 50, 100, 200];

  // Y-axis tick values (attenuation)
  const yTickValues = [0.001, 0.01, 0.1, 1, 10, 100];

  // Format attenuation value
  function formatAttenuation(dBkm: number): string {
    if (dBkm >= 10) return dBkm.toFixed(1);
    if (dBkm >= 1) return dBkm.toFixed(2);
    if (dBkm >= 0.1) return dBkm.toFixed(3);
    if (dBkm >= 0.01) return dBkm.toFixed(4);
    return dBkm.toExponential(2);
  }

  // Absorption peak markers for the chart
  const absorptionPeakMarkers = [
    { freq: 22.235, label: 'H2O 22 GHz', color: '#22c55e' },
    { freq: 60, label: 'O2 60 GHz', color: '#3b82f6' },
    { freq: 118.75, label: 'O2 119 GHz', color: '#3b82f6' },
    { freq: 183.31, label: 'H2O 183 GHz', color: '#22c55e' }
  ];

  // Legend Y positions (computed to avoid @const issues)
  let legendY = $derived(hasPrecipitation ? 140 : 75);
  let peakLegendY = $derived(showPrecipitation ? legendY + 155 : legendY + 85);
  let refY = $derived(peakLegendY + 60);
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
      style="fill: var(--color-chart-bg)"
    />

    <!-- Chart area -->
    <g transform="translate({margin.left}, {margin.top})">
      <!-- Highlight regions for absorption peaks -->

      <!-- 22 GHz water vapor region (20-24 GHz) -->
      <rect
        x={xScale(20)}
        y="0"
        width={xScale(24) - xScale(20)}
        height={chartHeight}
        fill="#22c55e"
        opacity="0.08"
      />

      <!-- 60 GHz oxygen region (50-70 GHz) -->
      <rect
        x={xScale(50)}
        y="0"
        width={xScale(70) - xScale(50)}
        height={chartHeight}
        fill="#3b82f6"
        opacity="0.08"
      />

      <!-- 118.75 GHz oxygen region (115-122 GHz) -->
      <rect
        x={xScale(115)}
        y="0"
        width={xScale(122) - xScale(115)}
        height={chartHeight}
        fill="#3b82f6"
        opacity="0.08"
      />

      <!-- 183 GHz water vapor region (178-188 GHz) -->
      <rect
        x={xScale(178)}
        y="0"
        width={xScale(188) - xScale(178)}
        height={chartHeight}
        fill="#22c55e"
        opacity="0.08"
      />

      <!-- Grid lines - vertical (frequency) -->
      {#each xTickValues as tickVal (tickVal)}
        <line
          x1={xScale(tickVal)}
          y1="0"
          x2={xScale(tickVal)}
          y2={chartHeight}
          style="stroke: var(--color-chart-grid)"
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
          style="stroke: var(--color-chart-grid)"
          stroke-dasharray="4,4"
          stroke-width="0.5"
        />
      {/each}

      <!-- Absorption peak vertical markers -->
      {#each absorptionPeakMarkers as peak (peak.freq)}
        {#if peak.freq >= MIN_FREQ && peak.freq <= MAX_FREQ}
          <line
            x1={xScale(peak.freq)}
            y1="0"
            x2={xScale(peak.freq)}
            y2={chartHeight}
            stroke={peak.color}
            stroke-width="1"
            stroke-dasharray="2,4"
            opacity="0.5"
          />
          <text
            x={xScale(peak.freq)}
            y="-8"
            fill={peak.color}
            font-size="9"
            text-anchor="middle"
            opacity="0.8"
          >
            {peak.label}
          </text>
        {/if}
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

      <!-- Rain attenuation curve (cyan) - only if rain is active -->
      {#if showPrecipitation && atmosphericParameters.rainRateMmH > 0}
        <path
          d={rainLineGenerator(curveData)}
          fill="none"
          stroke="#06b6d4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="6,3"
        />
      {/if}

      <!-- Fog attenuation curve (purple) - only if fog is active -->
      {#if showPrecipitation && atmosphericParameters.fogDensityGM3 > 0}
        <path
          d={fogLineGenerator(curveData)}
          fill="none"
          stroke="#a855f7"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="4,4"
        />
      {/if}

      <!-- Snow attenuation curve (white/gray) - only if snow is active -->
      {#if showPrecipitation && atmosphericParameters.snowRateMmH > 0}
        <path
          d={snowLineGenerator(curveData)}
          fill="none"
          stroke="#94a3b8"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="2,4"
        />
      {/if}

      <!-- Total gas attenuation curve (orange) -->
      <path
        d={totalGasLineGenerator(curveData)}
        fill="none"
        stroke="#f97316"
        stroke-width="2.5"
        stroke-linecap="round"
      />

      <!-- Total all attenuation curve (red) - only if precipitation is active -->
      {#if showPrecipitation && hasPrecipitation}
        <path
          d={totalAllLineGenerator(curveData)}
          fill="none"
          stroke="#ef4444"
          stroke-width="3"
          stroke-linecap="round"
        />
      {/if}

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
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="8" style="stroke: var(--color-chart-axis)" />
            <text
              y="24"
              style="fill: var(--color-chart-text-secondary)"
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
          style="fill: var(--color-chart-text)"
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
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        {#each yTickValues as tickVal (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-8" style="stroke: var(--color-chart-axis)" />
            <text
              x="-12"
              style="fill: var(--color-chart-text-secondary)"
              text-anchor="end"
              dominant-baseline="middle"
              font-size="11"
            >
              {tickVal >= 1 ? tickVal : tickVal.toString()}
            </text>
          </g>
        {/each}
        <!-- Y-axis label -->
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-55"
          style="fill: var(--color-chart-text)"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
        >
          Spezifische Dämpfung (dB/km)
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
          y1={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          x2={chartWidth}
          y2={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          class="stroke-amber-400"
          stroke-width="1.5"
          stroke-dasharray="8,4"
          opacity="0.8"
        />

        <!-- Marker dot with glow effect -->
        <circle
          cx={markerData.x}
          cy={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          r="10"
          class="fill-amber-400"
          filter="url(#attenuationMarkerGlow)"
        />
        <circle
          cx={markerData.x}
          cy={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          r="5"
          class="fill-amber-200"
        />

        <!-- Tooltip with attenuation info -->
        {@const tooltipWidth = hasPrecipitation ? 200 : 180}
        {@const tooltipHeight = hasPrecipitation ? 150 : 90}
        {@const tooltipX = markerData.x > chartWidth / 2 ? markerData.x - tooltipWidth - 15 : markerData.x + 15}
        {@const tooltipY = markerData.yTotal > chartHeight / 2 ? markerData.yTotal - tooltipHeight - 10 : markerData.yTotal + 10}
        <g transform="translate({tooltipX}, {tooltipY})" filter="url(#attenuationTooltipShadow)">
          <rect
            x="0"
            y="0"
            width={tooltipWidth}
            height={tooltipHeight}
            rx="6"
            style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
            stroke-width="1"
          />
          <text x="12" y="20" style="fill: var(--color-chart-text)" font-weight="500" font-size="12">
            f = {markerData.frequency.toFixed(2)} GHz
          </text>
          <text x="12" y="38" font-size="11">
            <tspan class="fill-blue-400">O2:</tspan>
            <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.oxygen)} dB/km</tspan>
          </text>
          <text x="12" y="54" font-size="11">
            <tspan class="fill-green-400">H2O:</tspan>
            <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.waterVapor)} dB/km</tspan>
          </text>
          <text x="12" y="72" font-size="11">
            <tspan class="fill-orange-400">Gas Total:</tspan>
            <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.total)} dB/km</tspan>
          </text>
          {#if hasPrecipitation}
            {#if atmosphericParameters.rainRateMmH > 0}
              <text x="12" y="90" font-size="11">
                <tspan class="fill-cyan-400">Regen:</tspan>
                <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.rain)} dB/km</tspan>
              </text>
            {/if}
            {#if atmosphericParameters.fogDensityGM3 > 0}
              <text x="12" y={atmosphericParameters.rainRateMmH > 0 ? 106 : 90} font-size="11">
                <tspan class="fill-purple-400">Nebel:</tspan>
                <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.fog)} dB/km</tspan>
              </text>
            {/if}
            {#if atmosphericParameters.snowRateMmH > 0}
              <text x="12" y={90 + (atmosphericParameters.rainRateMmH > 0 ? 16 : 0) + (atmosphericParameters.fogDensityGM3 > 0 ? 16 : 0)} font-size="11">
                <tspan style="fill: var(--color-text-tertiary)">Schnee:</tspan>
                <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.snow)} dB/km</tspan>
              </text>
            {/if}
            <text x="12" y={tooltipHeight - 12} font-size="11">
              <tspan class="fill-red-400">Gesamt:</tspan>
              <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.totalAll)} dB/km</tspan>
            </text>
          {/if}
        </g>
      {/if}

      <!-- Chart title -->
      <text
        x={chartWidth / 2}
        y="-25"
        style="fill: var(--color-chart-text)"
        text-anchor="middle"
        font-size="18"
        font-weight="600"
      >
        Atmosphärische Dämpfung (ITU-R P.676 / P.838 / P.840)
      </text>
    </g>

    <!-- Legend on the right side -->
    <g transform="translate({width - margin.right + 20}, {margin.top})">
      <!-- Current parameters -->
      <text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y="0">
        Atmosphäre
      </text>
      <text style="fill: var(--color-text-tertiary)" font-size="10" y="16">
        T = {atmosphericParameters.temperatureCelsius.toFixed(1)} C
      </text>
      <text style="fill: var(--color-text-tertiary)" font-size="10" y="30">
        P = {atmosphericParameters.pressureHpa.toFixed(1)} hPa
      </text>
      <text style="fill: var(--color-text-tertiary)" font-size="10" y="44">
        rho = {atmosphericParameters.waterVaporDensity.toFixed(1)} g/m3
      </text>

      <!-- Precipitation parameters if active -->
      {#if hasPrecipitation}
        <text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y="68">
          Niederschlag
        </text>
        {#if atmosphericParameters.rainRateMmH > 0}
          <text style="fill: var(--color-text-tertiary)" font-size="10" y="84">
            Regen = {atmosphericParameters.rainRateMmH.toFixed(1)} mm/h
          </text>
        {/if}
        {#if atmosphericParameters.fogDensityGM3 > 0}
          <text style="fill: var(--color-text-tertiary)" font-size="10" y={atmosphericParameters.rainRateMmH > 0 ? 98 : 84}>
            Nebel = {atmosphericParameters.fogDensityGM3.toFixed(2)} g/m3
          </text>
        {/if}
        {#if atmosphericParameters.snowRateMmH > 0}
          <text style="fill: var(--color-text-tertiary)" font-size="10" y={84 + (atmosphericParameters.rainRateMmH > 0 ? 14 : 0) + (atmosphericParameters.fogDensityGM3 > 0 ? 14 : 0)}>
            Schnee = {atmosphericParameters.snowRateMmH.toFixed(1)} mm/h
          </text>
        {/if}
      {/if}

      <!-- Line legend -->
      <text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y={legendY}>
        Kurven
      </text>

      <!-- Oxygen line -->
      <g transform="translate(0, {legendY + 15})">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#3b82f6" stroke-width="2" />
        <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">O2 (Sauerstoff)</text>
      </g>

      <!-- Water vapor line -->
      <g transform="translate(0, {legendY + 33})">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#22c55e" stroke-width="2" />
        <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">H2O (Wasserdampf)</text>
      </g>

      <!-- Total gas line -->
      <g transform="translate(0, {legendY + 51})">
        <line x1="0" y1="0" x2="24" y2="0" stroke="#f97316" stroke-width="2.5" />
        <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Gas Total</text>
      </g>

      {#if showPrecipitation}
        <!-- Rain line -->
        <g transform="translate(0, {legendY + 69})">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#06b6d4" stroke-width="2" stroke-dasharray="6,3" />
          <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Regen (P.838)</text>
        </g>

        <!-- Fog line -->
        <g transform="translate(0, {legendY + 87})">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
          <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Nebel (P.840)</text>
        </g>

        <!-- Snow line -->
        <g transform="translate(0, {legendY + 105})">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#94a3b8" stroke-width="2" stroke-dasharray="2,4" />
          <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Schnee</text>
        </g>

        <!-- Total all line -->
        <g transform="translate(0, {legendY + 123})">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#ef4444" stroke-width="3" />
          <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Gesamt</text>
        </g>
      {/if}

      <!-- Absorption peak regions legend -->
      <text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y={peakLegendY}>
        Absorptionspeaks
      </text>

      <g transform="translate(0, {peakLegendY + 15})">
        <rect x="0" y="-6" width="14" height="14" fill="#22c55e" opacity="0.3" rx="2" />
        <text x="20" y="4" style="fill: var(--color-text-tertiary)" font-size="9">22/183 GHz (H2O)</text>
      </g>

      <g transform="translate(0, {peakLegendY + 33})">
        <rect x="0" y="-6" width="14" height="14" fill="#3b82f6" opacity="0.3" rx="2" />
        <text x="20" y="4" style="fill: var(--color-text-tertiary)" font-size="9">60/119 GHz (O2)</text>
      </g>

      <!-- ITU Reference -->
      <text style="fill: var(--color-text-disabled)" font-size="9" y={refY}>
        Referenzen:
      </text>
      <text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 12}>
        ITU-R P.676-13 (Gas)
      </text>
      <text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 22}>
        ITU-R P.838-3 (Regen)
      </text>
      <text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 32}>
        ITU-R P.840-9 (Nebel)
      </text>
    </g>
  </svg>
</div>

<style>
  .attenuation-chart {
    container-type: inline-size;
  }
</style>
