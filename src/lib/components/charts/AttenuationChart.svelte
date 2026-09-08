<script lang="ts">
  import { scaleLog } from 'd3';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { formatLocaleNumber } from '$lib/utils/formatting';
  import {
    generateExtendedAttenuationCurve,
    calculateAllAttenuation
  } from '$lib/utils/atmosphericAttenuation';
  import {
    ATTENUATION_SERIES,
    MIN_FREQ,
    MAX_FREQ,
    MIN_ATTENUATION,
    MAX_ATTENUATION,
    CHART_MARGIN,
    X_TICK_VALUES,
    Y_TICK_VALUES,
    ABSORPTION_PEAK_MARKERS,
    ABSORPTION_REGIONS,
    createSeriesLine
  } from './attenuationChartData';
  import AttenuationTable from './AttenuationTable.svelte';
  import AttenuationTooltip from './AttenuationTooltip.svelte';
  import AttenuationLegend from './AttenuationLegend.svelte';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    frequencyGHz?: number;
    width?: number;
    height?: number;
    showPrecipitation?: boolean;
    /** Überschrift des Rahmens; leer lässt den Kopf weg */
    title?: string;
  }

  let {
    frequencyGHz,
    width = $bindable(1100),
    height = 600,
    showPrecipitation = true,
    title = 'Atmosphärische Dämpfung'
  }: Props = $props();

  /** Anzahl der Stützstellen der Kurven */
  const CURVE_RESOLUTION = 600;

  // Computed dimensions
  let chartWidth = $derived(Math.max(1, width - CHART_MARGIN.left - CHART_MARGIN.right));
  let chartHeight = $derived(height - CHART_MARGIN.top - CHART_MARGIN.bottom);

  // Logarithmic scales using D3
  let xScale = $derived(
    scaleLog().domain([MIN_FREQ, MAX_FREQ]).range([0, chartWidth]).clamp(true)
  );

  let yScale = $derived(
    scaleLog().domain([MIN_ATTENUATION, MAX_ATTENUATION]).range([chartHeight, 0]).clamp(true)
  );

  // Generate extended curve data including precipitation - reactive to all parameters
  let curveData = $derived(
    generateExtendedAttenuationCurve(
      atmosphericParameters.allConditions,
      MIN_FREQ,
      MAX_FREQ,
      CURVE_RESOLUTION
    )
  );

  // Check if precipitation is active
  let hasPrecipitation = $derived(
    atmosphericParameters.rainRateMmH > 0 ||
      atmosphericParameters.fogDensityGM3 > 0 ||
      atmosphericParameters.snowRateMmH > 0
  );

  /** Zeigt eine Niederschlagskurve nur, wenn der zugehörige Parameter gesetzt ist. */
  function isSeriesVisible(id: string): boolean {
    if (!showPrecipitation) return !['rain', 'fog', 'snow', 'totalAll'].includes(id);
    if (id === 'rain') return atmosphericParameters.rainRateMmH > 0;
    if (id === 'fog') return atmosphericParameters.fogDensityGM3 > 0;
    if (id === 'snow') return atmosphericParameters.snowRateMmH > 0;
    if (id === 'totalAll') return hasPrecipitation;
    return true;
  }

  let visibleSeries = $derived(ATTENUATION_SERIES.filter((series) => isSeriesVisible(series.id)));

  // Marker position for current frequency
  let markerData = $derived.by(() => {
    if (!frequencyGHz || frequencyGHz < MIN_FREQ || frequencyGHz > MAX_FREQ) return null;

    const attenuation = calculateAllAttenuation(frequencyGHz, atmosphericParameters.allConditions);

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

  /** Stützstellen der Datentabelle für Screenreader */
  const TABLE_FREQUENCIES = [1, 10, 22.235, 35, 60, 94, 118.75, 183.31, 300] as const;

  let tableRows = $derived(
    TABLE_FREQUENCIES.map((f) => ({
      frequency: f,
      ...calculateAllAttenuation(f, atmosphericParameters.allConditions)
    }))
  );
</script>

<ChartFrame
  bind:width
  {title}
  description="Spezifische Dämpfung in Dezibel pro Kilometer über der Frequenz von 1 bis 350 Gigahertz, getrennt nach Sauerstoff, Wasserdampf und Niederschlag"
  minWidth={640}
  footnote="Nach ITU-R P.676-13 (Gase), P.838-3 (Regen) und P.840-9 (Nebel)"
>
  {#snippet legend()}
    <AttenuationLegend series={visibleSeries} />
  {/snippet}

  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
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

    <rect class="chart-background" x="0" y="0" width={width} height={height} />

    <g transform="translate({CHART_MARGIN.left}, {CHART_MARGIN.top})">
      <!-- Absorptionsbereiche -->
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

      <!-- Gitterlinien -->
      {#each X_TICK_VALUES as tickVal (tickVal)}
        <line
          class="chart-grid-line"
          x1={xScale(tickVal)}
          y1="0"
          x2={xScale(tickVal)}
          y2={chartHeight}
          stroke-dasharray="4,4"
        />
      {/each}
      {#each Y_TICK_VALUES as tickVal (tickVal)}
        <line
          class="chart-grid-line"
          x1="0"
          y1={yScale(tickVal)}
          x2={chartWidth}
          y2={yScale(tickVal)}
          stroke-dasharray="4,4"
        />
      {/each}

      <!-- Absorptionsspitzen -->
      {#each ABSORPTION_PEAK_MARKERS as peak (peak.freq)}
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
            opacity="0.8">{peak.label}</text
          >
        {/if}
      {/each}

      <!-- Kurven -->
      {#each visibleSeries as series (series.id)}
        <path
          d={createSeriesLine(series, xScale, yScale)(curveData)}
          fill="none"
          stroke={series.color}
          stroke-width={series.strokeWidth}
          stroke-linecap="round"
          stroke-dasharray={series.dash ?? undefined}
        />
      {/each}

      <!-- X-Achse -->
      <g transform="translate(0, {chartHeight})">
        <line class="chart-axis-line" x1="0" y1="0" x2={chartWidth} y2="0" />
        {#each X_TICK_VALUES as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line class="chart-axis-line" y2="8" />
            <text class="chart-axis-text" y="24" text-anchor="middle"
              >{formatLocaleNumber(tickVal, { maxFrac: 3 })}</text
            >
          </g>
        {/each}
        <text class="chart-axis-label" x={chartWidth / 2} y="52" text-anchor="middle">
          Frequenz (GHz)
        </text>
      </g>

      <!-- Y-Achse -->
      <g>
        <line class="chart-axis-line" x1="0" y1="0" x2="0" y2={chartHeight} />
        {#each Y_TICK_VALUES as tickVal (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line class="chart-axis-line" x2="-8" />
            <text class="chart-axis-text" x="-12" text-anchor="end" dominant-baseline="middle">
              {formatLocaleNumber(tickVal, { maxFrac: 3 })}
            </text>
          </g>
        {/each}
        <text
          class="chart-axis-label"
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-55"
          text-anchor="middle"
        >
          Spezifische Dämpfung (dB/km)
        </text>
      </g>

      <!-- Arbeitspunkt -->
      {#if markerData}
        {@const markerY = hasPrecipitation ? markerData.yTotalAll : markerData.yTotal}
        <line
          class="chart-marker-crosshair"
          x1={markerData.x}
          y1="0"
          x2={markerData.x}
          y2={chartHeight}
          stroke-dasharray="8,4"
        />
        <line
          class="chart-marker-crosshair"
          x1="0"
          y1={markerY}
          x2={chartWidth}
          y2={markerY}
          stroke-dasharray="8,4"
        />
        <circle
          class="chart-marker-primary"
          cx={markerData.x}
          cy={markerY}
          r="10"
          filter="url(#attenuationMarkerGlow)"
        />
        <circle cx={markerData.x} cy={markerY} r="5" fill="var(--color-on-solid)" />

        <AttenuationTooltip {markerData} {hasPrecipitation} {chartWidth} {chartHeight} />
      {/if}
    </g>
  </svg>

  {#snippet dataTable()}
    <AttenuationTable rows={tableRows} />
  {/snippet}
</ChartFrame>
