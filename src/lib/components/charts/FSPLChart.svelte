<script lang="ts">
  /**
   * Freiraumdämpfung über der Distanz — Vergleichskurven plus Arbeitspunkt.
   * Konstanten und Kurvenberechnung liegen in `fsplChartData.ts`.
   */
  import { line } from 'd3-shape';
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { formatDistance, formatFrequency, formatLocaleNumber, formatPowerDb } from '$lib/utils/formatting';
  import ChartFrame from './ChartFrame.svelte';
  import {
    FSPL_CHART_MARGIN,
    FSPL_SERIES,
    MAX_DISTANCE_M,
    MAX_FSPL_DB,
    MIN_DISTANCE_M,
    MIN_FSPL_DB,
    PRESET_MATCH_TOLERANCE,
    X_TICK_VALUES,
    Y_TICK_VALUES,
    formatDistanceTick,
    generateFsplCurve,
    type FsplPoint
  } from './fsplChartData';

  interface Props {
    width?: number;
    height?: number;
    frequencyHz: number;
    distanceM: number;
    fsplDb: number | null;
    showMultipleFrequencies?: boolean;
  }

  let {
    width = $bindable(900),
    height = 450,
    frequencyHz,
    distanceM,
    fsplDb,
    showMultipleFrequencies = true
  }: Props = $props();

  const margin = FSPL_CHART_MARGIN;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let xScale = $derived(scaleLog().domain([MIN_DISTANCE_M, MAX_DISTANCE_M]).range([0, chartWidth]));
  let yScale = $derived(scaleLinear().domain([MIN_FSPL_DB, MAX_FSPL_DB]).range([0, chartHeight]));

  let lineGenerator = $derived(
    line<FsplPoint>()
      .x((d) => xScale(d.distance))
      .y((d) => yScale(d.fspl))
  );

  let chartLines = $derived(
    FSPL_SERIES.map((series) => ({
      ...series,
      path: lineGenerator(generateFsplCurve(series.hz))
    }))
  );

  /** Die eingestellte Frequenz bekommt eine eigene Kurve, sofern sie kein Preset ist. */
  let currentFreqLine = $derived.by(() => {
    if (!frequencyHz || frequencyHz <= 0) return null;
    const isPreset = FSPL_SERIES.some(
      (series) => Math.abs(series.hz - frequencyHz) / frequencyHz < PRESET_MATCH_TOLERANCE
    );
    if (isPreset) return null;
    return {
      hz: frequencyHz,
      label: formatFrequency(frequencyHz),
      color: 'var(--color-marker)',
      path: lineGenerator(generateFsplCurve(frequencyHz))
    };
  });

  let markerPos = $derived.by(() => {
    if (fsplDb === null || !Number.isFinite(fsplDb) || distanceM <= 0) return null;
    return {
      x: xScale(Math.max(MIN_DISTANCE_M, Math.min(MAX_DISTANCE_M, distanceM))),
      y: yScale(Math.max(MIN_FSPL_DB, Math.min(MAX_FSPL_DB, fsplDb)))
    };
  });

  let legendEntries = $derived([
    ...(showMultipleFrequencies ? FSPL_SERIES : []),
    ...(currentFreqLine ? [{ ...currentFreqLine, label: `${currentFreqLine.label} (aktuell)` }] : [])
  ]);

  /** Stützstellen der Datentabelle für Screenreader */
  const TABLE_DISTANCES = [1, 10, 100, 1000, 10000, 100000] as const;
</script>

<ChartFrame
  bind:width
  description="Freiraumdämpfung in Dezibel über der Distanz, logarithmische Distanzachse von 1 Meter bis 100 Kilometer"
  minWidth={520}
>
  {#snippet legend()}
    <ul class="fspl-legend">
      {#each legendEntries as entry (entry.hz)}
        <li class="fspl-legend__item">
          <span class="fspl-legend__swatch" style="background: {entry.color}" aria-hidden="true"></span>
          <span>{entry.label}</span>
        </li>
      {/each}
    </ul>
  {/snippet}

  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <filter id="fsplMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <rect class="chart-background" x="0" y="0" {width} {height} />

    <g transform="translate({margin.left}, {margin.top})">
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

      {#if showMultipleFrequencies}
        {#each chartLines as series (series.hz)}
          <path d={series.path} fill="none" stroke={series.color} stroke-width="2" opacity="0.7" />
        {/each}
      {/if}

      {#if currentFreqLine}
        <path d={currentFreqLine.path} fill="none" stroke={currentFreqLine.color} stroke-width="3" />
      {/if}

      {#if markerPos}
        <line
          class="chart-marker-crosshair"
          x1={markerPos.x}
          y1="0"
          x2={markerPos.x}
          y2={chartHeight}
          stroke-dasharray="8,4"
        />
        <line
          class="chart-marker-crosshair"
          x1="0"
          y1={markerPos.y}
          x2={chartWidth}
          y2={markerPos.y}
          stroke-dasharray="8,4"
        />
        <circle class="chart-marker-primary" cx={markerPos.x} cy={markerPos.y} r="10" filter="url(#fsplMarkerGlow)" />
        <circle cx={markerPos.x} cy={markerPos.y} r="5" fill="var(--color-on-solid)" />

        <g
          transform="translate({markerPos.x + (markerPos.x > chartWidth / 2 ? -90 : 10)}, {markerPos.y +
            (markerPos.y > chartHeight / 2 ? -40 : 10)})"
        >
          <rect class="chart-tooltip" x="0" y="0" width="82" height="32" rx="4" stroke-width="1" />
          <text class="chart-tooltip-text" x="8" y="14" font-size="10">
            {formatFrequency(frequencyHz)}
          </text>
          <text x="8" y="26" font-size="11" font-weight="700" fill="var(--color-marker)">
            {formatPowerDb(fsplDb)}
          </text>
        </g>
      {/if}

      <!-- X-Achse -->
      <g transform="translate(0, {chartHeight})">
        <line class="chart-axis-line" x1="0" y1="0" x2={chartWidth} y2="0" />
        {#each X_TICK_VALUES as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line class="chart-axis-line" y2="8" />
            <text class="chart-axis-text" y="24" text-anchor="middle">
              {formatDistanceTick(tickVal)}
            </text>
          </g>
        {/each}
        <text class="chart-axis-label" x={chartWidth / 2} y="48" text-anchor="middle"> Distanz (logarithmisch) </text>
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
        <text class="chart-axis-label" transform="rotate(-90)" x={-chartHeight / 2} y="-50" text-anchor="middle"
          >FSPL (dB)</text
        >
      </g>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Freiraumdämpfung bei {formatFrequency(frequencyHz)}</caption>
      <thead>
        <tr>
          <th scope="col">Distanz</th>
          <th scope="col">FSPL</th>
        </tr>
      </thead>
      <tbody>
        {#each TABLE_DISTANCES as distance (distance)}
          {@const point = generateFsplCurve(frequencyHz).find((p) => p.distance >= distance)}
          <tr>
            <th scope="row">{formatDistance(distance)}</th>
            <td>{point ? formatPowerDb(point.fspl) : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .fspl-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .fspl-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .fspl-legend__swatch {
    width: 1rem;
    height: 0.1875rem;
    border-radius: var(--radius-pill);
    display: inline-block;
  }
</style>
