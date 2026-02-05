<script lang="ts">
  import * as d3 from 'd3';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import {
    generateExtendedAttenuationCurve,
    calculateAllAttenuation,
    type ExtendedCurveDataPoint
  } from '$lib/utils/atmosphericAttenuation';
  import {
    MIN_FREQ,
    MAX_FREQ,
    MIN_ATTENUATION,
    MAX_ATTENUATION,
    CHART_MARGIN,
    X_TICK_VALUES,
    Y_TICK_VALUES,
    ABSORPTION_PEAK_MARKERS,
    ABSORPTION_REGIONS
  } from './attenuationChartData';
  import AttenuationTooltip from './AttenuationTooltip.svelte';
  import AttenuationLegend from './AttenuationLegend.svelte';

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

  // Computed dimensions
  let chartWidth = $derived(width - CHART_MARGIN.left - CHART_MARGIN.right);
  let chartHeight = $derived(height - CHART_MARGIN.top - CHART_MARGIN.bottom);

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

    const attenuation = calculateAllAttenuation(
      frequencyGHz,
      atmosphericParameters.allConditions
    );

    return {
      x: xScale(frequencyGHz),
      yOxygen: yScale(Math.max(MIN_ATTENUATION, attenuation.oxygen)),
      yWaterVapor: yScale(Math.max(MIN_ATTENUATION, attenuation.waterVapor)),
      yTotal: yScale(Math.max(MIN_ATTENUATION, attenuation.total)),
      yRain: yScale(Math.max(MIN_ATTENUATION, attenuation.rain || MIN_ATTENUATION)),
      yFog: yScale(Math.max(MIN_ATTENUATION, attenuation.fog || MIN_ATTENUATION)),
      ySnow: yScale(Math.max(MIN_ATTENUATION, attenuation.snow || MIN_ATTENUATION)),
      yTotalAll: yScale(Math.max(MIN_ATTENUATION, attenuation.totalAll)),
      frequency: frequencyGHz,
      oxygen: attenuation.oxygen,
      waterVapor: attenuation.waterVapor,
      total: attenuation.total,
      rain: attenuation.rain,
      fog: attenuation.fog,
      snow: attenuation.snow,
      totalAll: attenuation.totalAll
    };
  });
</script>

<div class="attenuation-chart w-full">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-auto"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Atmosphärische Dämpfung Diagramm: Zeigt die spezifische Dämpfung in dB/km über der Frequenz von 1 bis 350 GHz für Sauerstoff, Wasserdampf und Niederschlag"
  >
    <defs>
      <filter id="attenuationMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="attenuationTooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Background -->
    <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

    <!-- Chart area -->
    <g transform="translate({CHART_MARGIN.left}, {CHART_MARGIN.top})">
      <!-- Absorption peak highlight regions -->
      {#each ABSORPTION_REGIONS as region (region.minFreq)}
        <rect
          x={xScale(region.minFreq)}
          y="0"
          width={xScale(region.maxFreq) - xScale(region.minFreq)}
          height={chartHeight}
          fill={region.color}
          opacity="0.08"
        />
      {/each}

      <!-- Grid lines - vertical (frequency) -->
      {#each X_TICK_VALUES as tickVal (tickVal)}
        <line
          x1={xScale(tickVal)} y1="0" x2={xScale(tickVal)} y2={chartHeight}
          style="stroke: var(--color-chart-grid)" stroke-dasharray="4,4" stroke-width="0.5"
        />
      {/each}

      <!-- Grid lines - horizontal (attenuation) -->
      {#each Y_TICK_VALUES as tickVal (tickVal)}
        <line
          x1="0" y1={yScale(tickVal)} x2={chartWidth} y2={yScale(tickVal)}
          style="stroke: var(--color-chart-grid)" stroke-dasharray="4,4" stroke-width="0.5"
        />
      {/each}

      <!-- Absorption peak vertical markers -->
      {#each ABSORPTION_PEAK_MARKERS as peak (peak.freq)}
        {#if peak.freq >= MIN_FREQ && peak.freq <= MAX_FREQ}
          <line
            x1={xScale(peak.freq)} y1="0" x2={xScale(peak.freq)} y2={chartHeight}
            stroke={peak.color} stroke-width="1" stroke-dasharray="2,4" opacity="0.5"
          />
          <text
            x={xScale(peak.freq)} y="-8" fill={peak.color}
            font-size="9" text-anchor="middle" opacity="0.8"
          >
            {peak.label}
          </text>
        {/if}
      {/each}

      <!-- Attenuation curves -->
      <path d={oxygenLineGenerator(curveData)} fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      <path d={waterVaporLineGenerator(curveData)} fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" />

      {#if showPrecipitation && atmosphericParameters.rainRateMmH > 0}
        <path d={rainLineGenerator(curveData)} fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-dasharray="6,3" />
      {/if}
      {#if showPrecipitation && atmosphericParameters.fogDensityGM3 > 0}
        <path d={fogLineGenerator(curveData)} fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,4" />
      {/if}
      {#if showPrecipitation && atmosphericParameters.snowRateMmH > 0}
        <path d={snowLineGenerator(curveData)} fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,4" />
      {/if}

      <path d={totalGasLineGenerator(curveData)} fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" />

      {#if showPrecipitation && hasPrecipitation}
        <path d={totalAllLineGenerator(curveData)} fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
      {/if}

      <!-- X-axis (Frequency) -->
      <g transform="translate(0, {chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each X_TICK_VALUES as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="8" style="stroke: var(--color-chart-axis)" />
            <text y="24" style="fill: var(--color-chart-text-secondary)" text-anchor="middle" font-size="11">
              {tickVal}
            </text>
          </g>
        {/each}
        <text
          x={chartWidth / 2} y="52" style="fill: var(--color-chart-text)"
          text-anchor="middle" font-size="14" font-weight="500"
        >
          Frequenz (GHz)
        </text>
      </g>

      <!-- Y-axis (Attenuation) -->
      <g>
        <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each Y_TICK_VALUES as tickVal (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-8" style="stroke: var(--color-chart-axis)" />
            <text
              x="-12" style="fill: var(--color-chart-text-secondary)"
              text-anchor="end" dominant-baseline="middle" font-size="11"
            >
              {tickVal >= 1 ? tickVal : tickVal.toString()}
            </text>
          </g>
        {/each}
        <text
          transform="rotate(-90)" x={-chartHeight / 2} y="-55"
          style="fill: var(--color-chart-text)" text-anchor="middle" font-size="14" font-weight="500"
        >
          Spezifische Dämpfung (dB/km)
        </text>
      </g>

      <!-- Interactive marker for current frequency -->
      {#if markerData}
        <line
          x1={markerData.x} y1="0" x2={markerData.x} y2={chartHeight}
          class="stroke-amber-400" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.8"
        />
        <line
          x1="0" y1={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          x2={chartWidth} y2={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          class="stroke-amber-400" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.8"
        />
        <circle
          cx={markerData.x} cy={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          r="10" class="fill-amber-400" filter="url(#attenuationMarkerGlow)"
        />
        <circle
          cx={markerData.x} cy={hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
          r="5" class="fill-amber-200"
        />

        <AttenuationTooltip {markerData} {hasPrecipitation} {chartWidth} {chartHeight} />
      {/if}
    </g>

    <!-- Legend on the right side -->
    <g transform="translate({width - CHART_MARGIN.right + 20}, {CHART_MARGIN.top})">
      <AttenuationLegend {showPrecipitation} {hasPrecipitation} />
    </g>
  </svg>
</div>

<style>
  .attenuation-chart {
    container-type: inline-size;
  }
</style>
