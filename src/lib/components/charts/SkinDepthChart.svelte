<script lang="ts">
  /** Skin-Tiefe über der Frequenz für die gängigen Ausbreitungsmedien. */
  import { line, scaleLog } from 'd3';
  import { clamp } from '$lib/utils/handlers';
  import { formatDistance, formatFrequency, formatLocaleNumber } from '$lib/utils/formatting';
  import {
    CHART_DEPTH_MAX_M,
    CHART_DEPTH_MIN_M,
    CHART_FREQ_MAX_HZ,
    CHART_FREQ_MIN_HZ,
    CHART_X_TICKS,
    CHART_Y_TICKS,
    generateAllCurves,
    type DepthPoint
  } from '$lib/components/calculators/skinDepth.svelte';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    frequencyHz: number;
    skinDepthM: number;
    width?: number;
    height?: number;
  }

  let { frequencyHz, skinDepthM, width = $bindable(900), height = 400 }: Props = $props();

  const margin = { top: 40, right: 40, bottom: 60, left: 80 } as const;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let xScale = $derived(
    scaleLog().domain([CHART_FREQ_MIN_HZ, CHART_FREQ_MAX_HZ]).range([0, chartWidth])
  );
  let yScale = $derived(
    scaleLog().domain([CHART_DEPTH_MIN_M, CHART_DEPTH_MAX_M]).range([chartHeight, 0])
  );

  let lineGenerator = $derived(
    line<DepthPoint>()
      .x((d) => xScale(d.frequency))
      .y((d) => yScale(clamp(d.depth, CHART_DEPTH_MIN_M, CHART_DEPTH_MAX_M)))
  );

  const curves = generateAllCurves();

  let paths = $derived(
    curves.map((curve) => ({
      id: curve.medium.id,
      label: curve.medium.label,
      color: curve.medium.color,
      path: lineGenerator(curve.points)
    }))
  );

  let markerPos = $derived({
    x: xScale(clamp(frequencyHz, CHART_FREQ_MIN_HZ, CHART_FREQ_MAX_HZ)),
    y: yScale(clamp(skinDepthM, CHART_DEPTH_MIN_M, CHART_DEPTH_MAX_M))
  });
</script>

<ChartFrame
  bind:width
  description="Skin-Tiefe in Metern über der Frequenz, beide Achsen logarithmisch, für Seewasser, Süßwasser sowie feuchte und trockene Erde"
  minWidth={520}
>
  {#snippet legend()}
    <ul class="skin-legend">
      {#each paths as entry (entry.id)}
        <li class="skin-legend__item">
          <span class="skin-legend__swatch" style="background: {entry.color}" aria-hidden="true"
          ></span>
          <span>{entry.label}</span>
        </li>
      {/each}
    </ul>
  {/snippet}

  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <filter id="skinMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <rect class="chart-background" x="0" y="0" {width} {height} />

    <g transform="translate({margin.left}, {margin.top})">
      {#each CHART_X_TICKS as tickVal (tickVal)}
        <line
          class="chart-grid-line"
          x1={xScale(tickVal)}
          y1="0"
          x2={xScale(tickVal)}
          y2={chartHeight}
          stroke-dasharray="4,4"
        />
      {/each}
      {#each CHART_Y_TICKS as tickVal (tickVal)}
        <line
          class="chart-grid-line"
          x1="0"
          y1={yScale(tickVal)}
          x2={chartWidth}
          y2={yScale(tickVal)}
          stroke-dasharray="4,4"
        />
      {/each}

      {#each paths as entry (entry.id)}
        <path d={entry.path} fill="none" stroke={entry.color} stroke-width="2" />
      {/each}

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
      <circle
        class="chart-marker-primary"
        cx={markerPos.x}
        cy={markerPos.y}
        r="10"
        filter="url(#skinMarkerGlow)"
      />
      <circle cx={markerPos.x} cy={markerPos.y} r="5" fill="var(--color-on-solid)" />

      <!-- X-Achse -->
      <g transform="translate(0, {chartHeight})">
        <line class="chart-axis-line" x1="0" y1="0" x2={chartWidth} y2="0" />
        {#each CHART_X_TICKS as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line class="chart-axis-line" y2="8" />
            <text class="chart-axis-text" y="24" text-anchor="middle">
              {formatFrequency(tickVal, 0)}
            </text>
          </g>
        {/each}
        <text class="chart-axis-label" x={chartWidth / 2} y="48" text-anchor="middle">
          Frequenz (logarithmisch)
        </text>
      </g>

      <!-- Y-Achse -->
      <g>
        <line class="chart-axis-line" x1="0" y1="0" x2="0" y2={chartHeight} />
        {#each CHART_Y_TICKS as tickVal (tickVal)}
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
          text-anchor="middle">Skin-Tiefe (m, logarithmisch)</text
        >
      </g>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Skin-Tiefe je Medium</caption>
      <thead>
        <tr>
          <th scope="col">Frequenz</th>
          {#each curves as curve (curve.medium.id)}
            <th scope="col">{curve.medium.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each CHART_X_TICKS as tick (tick)}
          <tr>
            <th scope="row">{formatFrequency(tick, 0)}</th>
            {#each curves as curve (curve.medium.id)}
              {@const point = curve.points.find((p) => p.frequency >= tick)}
              <td>{point ? formatDistance(point.depth) : '—'}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .skin-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .skin-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .skin-legend__swatch {
    width: 1rem;
    height: 0.1875rem;
    border-radius: var(--radius-pill);
    display: inline-block;
  }
</style>
