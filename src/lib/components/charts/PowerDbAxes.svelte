<script lang="ts">
  /**
   * Achsen des Leistungs-Frequenz-Diagramms: Frequenz unten, Wellenlänge oben,
   * Leistung links in Watt und rechts in dBm.
   *
   * Ausgelagert aus `PowerDbChart.svelte`, damit die Komponente unter der
   * 300-Zeilen-Grenze bleibt (CLAUDE.md). Reine Darstellung — sämtliche Skalen
   * und Maße kommen als Eigenschaften herein.
   */
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { formatWavelength } from '$lib/utils/formatting';
  import { X_TICK_VALUES, X_TICK_LABELS, Y_TICK_VALUES, Y_TICK_LABELS, Y_DBM_LABELS } from './powerDbData';

  interface Props {
    chartWidth: number;
    chartHeight: number;
    /** Frequenzskala (logarithmisch) */
    xScale: (value: number) => number;
    /** Leistungsskala (logarithmisch) */
    yScale: (value: number) => number;
  }

  let { chartWidth, chartHeight, xScale, yScale }: Props = $props();
</script>

<!-- X-axis bottom (Frequency) -->
<g transform="translate(0, {chartHeight})">
  <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
  {#each X_TICK_VALUES as tickVal, i (tickVal)}
    <g transform="translate({xScale(tickVal)}, 0)">
      <line y2="8" style="stroke: var(--color-chart-axis)" />
      <text y="24" text-anchor="middle" style="fill: var(--color-chart-text-secondary)" font-size="11"
        >{X_TICK_LABELS[i]}</text
      >
    </g>
  {/each}
  <text
    x={chartWidth / 2}
    y="48"
    text-anchor="middle"
    style="fill: var(--color-chart-text)"
    font-size="14"
    font-weight="500">Frequenz (Hz)</text
  >
</g>

<!-- X-axis top (Wavelength) -->
<g>
  <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
  {#each X_TICK_VALUES as tickVal (tickVal)}
    {@const wavelength = frequencyToWavelength(tickVal)}
    <g transform="translate({xScale(tickVal)}, 0)">
      <line y2="-8" style="stroke: var(--color-chart-axis)" />
      <text y="-14" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="10"
        >{formatWavelength(wavelength, 0)}</text
      >
    </g>
  {/each}
  <text x={chartWidth / 2} y="-36" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="12"
    >Wellenlänge (m)</text
  >
</g>

<!-- Y-axis left (Power in Watt) -->
<g>
  <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
  {#each Y_TICK_VALUES as tickVal, i (tickVal)}
    <g transform="translate(0, {yScale(tickVal)})">
      <line x2="-8" style="stroke: var(--color-chart-axis)" />
      <text
        x="-12"
        text-anchor="end"
        dominant-baseline="middle"
        style="fill: var(--color-chart-text-secondary)"
        font-size="10">{Y_TICK_LABELS[i]}</text
      >
    </g>
  {/each}
  <text
    transform="rotate(-90)"
    x={-chartHeight / 2}
    y="-70"
    text-anchor="middle"
    style="fill: var(--color-chart-text)"
    font-size="14"
    font-weight="500">Leistung (Watt)</text
  >
</g>

<!-- Y-axis right (Power in dBm) -->
<g transform="translate({chartWidth}, 0)">
  <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
  {#each Y_TICK_VALUES as tickVal, i (tickVal)}
    <g transform="translate(0, {yScale(tickVal)})">
      <line x2="8" style="stroke: var(--color-chart-axis)" />
      <text
        x="12"
        text-anchor="start"
        dominant-baseline="middle"
        style="fill: var(--color-text-tertiary)"
        font-size="10">{Y_DBM_LABELS[i]}</text
      >
    </g>
  {/each}
  <text
    transform="rotate(90)"
    x={chartHeight / 2}
    y="-70"
    text-anchor="middle"
    style="fill: var(--color-text-tertiary)"
    font-size="12">Leistung (dBm)</text
  >
</g>
