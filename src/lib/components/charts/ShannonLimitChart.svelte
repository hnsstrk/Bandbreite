<script lang="ts">
  /**
   * Spektrale Effizienz über dem Störabstand mit dem Shannon-Limit als
   * Kennlinie und den Modulationsarten als hinterlegte Bereiche.
   */
  import { line } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { clamp } from '$lib/utils/handlers';
  import { formatLocaleNumber, formatNumber } from '$lib/utils/formatting';
  import {
    CHART_EFFICIENCY_MAX,
    CHART_SNR_MAX_DB,
    CHART_SNR_MIN_DB,
    CHART_X_TICKS,
    CHART_Y_TICKS,
    MODULATION_ENTRIES,
    SHANNON_CURVE,
    type ShannonPoint
  } from '$lib/components/calculators/channelCapacity.svelte';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    snrDb: number;
    spectralEfficiency: number;
    width?: number;
    height?: number;
  }

  let { snrDb, spectralEfficiency, width = $bindable(900), height = 400 }: Props = $props();

  const margin = { top: 40, right: 40, bottom: 60, left: 80 } as const;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let xScale = $derived(scaleLinear().domain([CHART_SNR_MIN_DB, CHART_SNR_MAX_DB]).range([0, chartWidth]));
  let yScale = $derived(scaleLinear().domain([0, CHART_EFFICIENCY_MAX]).range([chartHeight, 0]));

  let lineGenerator = $derived(
    line<ShannonPoint>()
      .x((d) => xScale(d.snr))
      .y((d) => yScale(d.capacity))
  );

  let shannonPath = $derived(lineGenerator(SHANNON_CURVE));

  let markerPos = $derived({
    x: xScale(clamp(snrDb, CHART_SNR_MIN_DB, CHART_SNR_MAX_DB)),
    y: yScale(clamp(spectralEfficiency, 0, CHART_EFFICIENCY_MAX))
  });
</script>

<ChartFrame
  bind:width
  description="Spektrale Effizienz in Bit pro Sekunde und Hertz über dem Störabstand in Dezibel, mit dem Shannon-Limit als Kennlinie"
  minWidth={520}
>
  {#snippet legend()}
    <span class="shannon-legend">
      <span class="shannon-legend__line" aria-hidden="true"></span>
      Shannon-Limit: C/B = log₂(1 + SNR)
    </span>
  {/snippet}

  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <filter id="capacityMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
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

      <!-- Modulationsbereiche -->
      {#each MODULATION_ENTRIES as mod, i (mod.name)}
        {@const nextMod = MODULATION_ENTRIES[i + 1]}
        {@const x1 = xScale(mod.requiredSnrDb)}
        {@const x2 = nextMod ? xScale(nextMod.requiredSnrDb) : chartWidth}
        <rect x={x1} y="0" width={Math.max(0, x2 - x1)} height={chartHeight} fill={mod.token} opacity="0.1" />
        <text x={(x1 + x2) / 2} y={chartHeight - 10} fill={mod.token} font-size="9" text-anchor="middle" opacity="0.9"
          >{mod.name}</text
        >
      {/each}

      <path d={shannonPath} fill="none" stroke="var(--color-series-1)" stroke-width="3" />

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
      <circle class="chart-marker-primary" cx={markerPos.x} cy={markerPos.y} r="10" filter="url(#capacityMarkerGlow)" />
      <circle cx={markerPos.x} cy={markerPos.y} r="5" fill="var(--color-on-solid)" />

      <!-- X-Achse -->
      <g transform="translate(0, {chartHeight})">
        <line class="chart-axis-line" x1="0" y1="0" x2={chartWidth} y2="0" />
        {#each CHART_X_TICKS as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line class="chart-axis-line" y2="8" />
            <text class="chart-axis-text" y="24" text-anchor="middle"
              >{formatLocaleNumber(tickVal, { maxFrac: 3 })}</text
            >
          </g>
        {/each}
        <text class="chart-axis-label" x={chartWidth / 2} y="48" text-anchor="middle"> Störabstand (dB) </text>
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
        <text class="chart-axis-label" transform="rotate(-90)" x={-chartHeight / 2} y="-55" text-anchor="middle"
          >Spektrale Effizienz (bit/s/Hz)</text
        >
      </g>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Spektrale Effizienz nach Shannon</caption>
      <thead>
        <tr>
          <th scope="col">Störabstand</th>
          <th scope="col">Spektrale Effizienz</th>
        </tr>
      </thead>
      <tbody>
        {#each CHART_X_TICKS as tick (tick)}
          {@const point = SHANNON_CURVE.find((p) => p.snr >= tick)}
          <tr>
            <th scope="row">{formatLocaleNumber(tick)} dB</th>
            <td>{point ? formatNumber(point.capacity, 2) : '—'} bit/s/Hz</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .shannon-legend {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .shannon-legend__line {
    width: 1.5rem;
    height: 0.1875rem;
    border-radius: var(--radius-pill);
    background: var(--color-series-1);
  }
</style>
