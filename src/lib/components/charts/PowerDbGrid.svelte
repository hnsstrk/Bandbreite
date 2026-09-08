<script lang="ts">
  /**
   * Gitternetz des Leistungs-Frequenz-Diagramms — senkrecht je Frequenzdekade,
   * waagerecht je Leistungsdekade. Wird vor den Datenpunkten gezeichnet.
   *
   * Ausgelagert aus `PowerDbChart.svelte` (300-Zeilen-Grenze, CLAUDE.md).
   */
  import { X_TICK_VALUES, Y_TICK_VALUES } from './powerDbData';

  interface Props {
    chartWidth: number;
    chartHeight: number;
    xScale: (value: number) => number;
    yScale: (value: number) => number;
  }

  let { chartWidth, chartHeight, xScale, yScale }: Props = $props();
</script>

<!-- Grid lines - vertical (frequency) -->
{#each X_TICK_VALUES as tickVal (tickVal)}
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

<!-- Grid lines - horizontal (power) -->
{#each Y_TICK_VALUES as tickVal (tickVal)}
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
