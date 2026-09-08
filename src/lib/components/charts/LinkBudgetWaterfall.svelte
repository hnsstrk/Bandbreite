<script lang="ts">
  /**
   * Wasserfalldiagramm der Streckenbilanz: vom Sendepegel über alle Gewinne
   * und Verluste bis zur Empfangsleistung, mit der Empfindlichkeit als Linie.
   *
   * Die Stufenberechnung liegt in `waterfallData.ts`.
   */
  import { scaleBand, scaleLinear } from 'd3-scale';
  import type { LinkBudgetData } from '$lib/components/calculators/linkBudget.svelte';
  import { formatLocaleNumber, formatPowerDb, formatPowerDbm } from '$lib/utils/formatting';
  import ChartFrame from './ChartFrame.svelte';
  import {
    SENSITIVITY_COLOR,
    STEP_COLORS,
    buildWaterfallSteps,
    stepLabel,
    waterfallDomain,
    waterfallTicks,
    type WaterfallStep
  } from './waterfallData';

  interface Props {
    data: LinkBudgetData | null;
    width?: number;
    height?: number;
  }

  let { data, width = $bindable(900), height = 400 }: Props = $props();

  const margin = { top: 30, right: 70, bottom: 80, left: 60 } as const;

  /** Ab dieser Balkenhöhe passt die Beschriftung hinein. */
  const LABEL_MIN_HEIGHT = 20;
  /** Mindesthöhe, damit auch ein Beitrag von 0 dB sichtbar bleibt. */
  const MIN_BAR_HEIGHT = 2;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let steps = $derived(buildWaterfallSteps(data));
  let yDomain = $derived(waterfallDomain(steps, data?.rxSensitivityDbm ?? -90));
  let yTicks = $derived(waterfallTicks(yDomain));

  let xScale = $derived(
    scaleBand<number>()
      .domain(steps.map((_, i) => i))
      .range([0, chartWidth])
      .padding(0.3)
  );

  let yScale = $derived(scaleLinear().domain(yDomain).range([chartHeight, 0]));

  let cumulativePath = $derived(
    steps
      .map((step, i) => {
        const x = (xScale(i) ?? 0) + xScale.bandwidth() / 2;
        return `${i === 0 ? 'M' : 'L'} ${x} ${yScale(step.barEnd)}`;
      })
      .join(' ')
  );

  const LEGEND_ENTRIES = [
    { id: 'start', label: 'Startpegel', color: STEP_COLORS.start },
    { id: 'gain', label: 'Gewinn', color: STEP_COLORS.gain },
    { id: 'loss', label: 'Verlust', color: STEP_COLORS.loss },
    { id: 'total', label: 'Ergebnis', color: STEP_COLORS.total },
    { id: 'sens', label: 'Empfindlichkeit', color: SENSITIVITY_COLOR }
  ];

  function ariaLabelFor(step: WaterfallStep): string {
    return `${step.label}: ${stepLabel(step)} dB`;
  }
</script>

{#if data}
  <ChartFrame
    bind:width
    title="Wasserfall der Streckenbilanz"
    description="Signalpegel in dBm von der Sendeleistung bis zur Empfangsleistung, mit allen Gewinnen und Verlusten als Stufen"
    minWidth={560}
    footnote="Grün steht für Gewinne, Rot für Verluste; die orangefarbene Linie markiert die Empfängerempfindlichkeit."
  >
    {#snippet legend()}
      <ul class="wf-legend">
        {#each LEGEND_ENTRIES as entry (entry.id)}
          <li class="wf-legend__item">
            <span class="wf-legend__swatch" style="background: {entry.color}" aria-hidden="true"
            ></span>
            <span>{entry.label}</span>
          </li>
        {/each}
      </ul>
    {/snippet}

    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect class="chart-background" x="0" y="0" {width} {height} />

      <g transform="translate({margin.left}, {margin.top})">
        {#each yTicks as tick (tick)}
          <line
            class="chart-grid-line"
            x1="0"
            y1={yScale(tick)}
            x2={chartWidth}
            y2={yScale(tick)}
            stroke-dasharray="4,4"
          />
        {/each}

        <line class="chart-axis-line" x1="0" y1={yScale(0)} x2={chartWidth} y2={yScale(0)} />

        <!-- Empfindlichkeitslinie -->
        <line
          x1="0"
          y1={yScale(data.rxSensitivityDbm)}
          x2={chartWidth}
          y2={yScale(data.rxSensitivityDbm)}
          stroke={SENSITIVITY_COLOR}
          stroke-width="2"
          stroke-dasharray="8,4"
        />
        <text
          class="chart-axis-text"
          x={chartWidth + 5}
          y={yScale(data.rxSensitivityDbm)}
          dominant-baseline="middle"
          fill={SENSITIVITY_COLOR}
        >
          S_RX
        </text>

        <path
          d={cumulativePath}
          fill="none"
          stroke="var(--color-series-8)"
          stroke-width="1.5"
          stroke-dasharray="4,2"
          opacity="0.6"
        />

        {#each steps as step, i (step.shortLabel)}
          {@const x = xScale(i) ?? 0}
          {@const barWidth = xScale.bandwidth()}
          {@const barY1 = yScale(Math.max(step.barStart, step.barEnd))}
          {@const barY2 = yScale(Math.min(step.barStart, step.barEnd))}
          {@const barHeight = Math.abs(barY2 - barY1)}

          <g>
            <title>{ariaLabelFor(step)}</title>
            <rect
              x={x}
              y={barY1}
              width={barWidth}
              height={Math.max(barHeight, MIN_BAR_HEIGHT)}
              fill={STEP_COLORS[step.type]}
              opacity="0.9"
              rx="2"
            />

            {#if i < steps.length - 1 && step.type !== 'total'}
              <line
                class="chart-axis-line"
                x1={x + barWidth}
                y1={yScale(step.barEnd)}
                x2={xScale(i + 1) ?? 0}
                y2={yScale(step.barEnd)}
                stroke-dasharray="2,2"
              />
            {/if}

            {#if barHeight > LABEL_MIN_HEIGHT}
              <text
                x={x + barWidth / 2}
                y={barY1 + barHeight / 2}
                fill="var(--color-on-solid)"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="10"
                font-weight="500"
              >
                {stepLabel(step)}
              </text>
            {/if}
          </g>
        {/each}

        <!-- Beschriftung der X-Achse -->
        <g transform="translate(0, {chartHeight + 10})">
          {#each steps as step, i (step.shortLabel)}
            {@const x = (xScale(i) ?? 0) + xScale.bandwidth() / 2}
            <text
              class="chart-axis-text"
              x={x}
              y="0"
              text-anchor="middle"
              transform="rotate(-45 {x} 0)">{step.shortLabel}</text
            >
          {/each}
        </g>

        <!-- Y-Achse -->
        <g>
          <line class="chart-axis-line" x1="0" y1="0" x2="0" y2={chartHeight} />
          {#each yTicks as tick (tick)}
            <g transform="translate(0, {yScale(tick)})">
              <line class="chart-axis-line" x2="-6" />
              <text class="chart-axis-text" x="-10" text-anchor="end" dominant-baseline="middle">
                {formatLocaleNumber(tick, { maxFrac: 3 })}
              </text>
            </g>
          {/each}
          <text
            class="chart-axis-label"
            transform="rotate(-90)"
            x={-chartHeight / 2}
            y="-45"
            text-anchor="middle">Pegel (dBm)</text
          >
        </g>
      </g>
    </svg>

    {#snippet dataTable()}
      <table>
        <caption>Stufen der Streckenbilanz</caption>
        <thead>
          <tr>
            <th scope="col">Stufe</th>
            <th scope="col">Beitrag</th>
            <th scope="col">Pegel danach</th>
          </tr>
        </thead>
        <tbody>
          {#each steps as step (step.shortLabel)}
            <tr>
              <th scope="row">{step.label}</th>
              <td>{stepLabel(step)} dB</td>
              <td>{formatPowerDbm(step.barEnd)}</td>
            </tr>
          {/each}
          <tr>
            <th scope="row">Empfindlichkeit</th>
            <td>—</td>
            <td>{formatPowerDbm(data.rxSensitivityDbm)}</td>
          </tr>
          <tr>
            <th scope="row">Streckenreserve</th>
            <td>{formatPowerDb(data.linkMarginDb, 1, true)}</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    {/snippet}
  </ChartFrame>
{:else}
  <p class="wf-empty">Keine Daten für die Streckenbilanz verfügbar.</p>
{/if}

<style>
  .wf-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .wf-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .wf-legend__swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
    display: inline-block;
  }

  .wf-empty {
    padding: 2rem;
    text-align: center;
    color: var(--color-ink-subtle);
    background: var(--color-sunken);
    border-radius: var(--radius-card);
  }
</style>
