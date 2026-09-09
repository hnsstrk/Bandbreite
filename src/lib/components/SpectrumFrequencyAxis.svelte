<script lang="ts">
  /**
   * Untere Achse des Spektrums (Frequenz) mit dualer Wellenlängenbeschriftung.
   * Die Wellenlänge nutzt bewusst c ≈ 3·10⁸ m/s, damit die Ticks „rund" bleiben.
   */
  import { formatFrequencyLocal, formatWavelengthLocal } from './spectrumFormat';
  import { ROUNDED_SPEED_OF_LIGHT } from './spectrumCursor.svelte';
  import { safeDivide } from '$lib/utils/handlers';
  import { DESKTOP_METRICS, tickTextAnchor, type SpectrumMetrics } from './spectrumLayout';

  interface Props {
    ticks: number[];
    xScale: (hz: number) => number;
    innerWidth: number;
    /** y der Achsenlinie */
    axisY: number;
    /** breitenabhängige Maße (Schrift, Abstände, Zweitangabe) */
    metrics?: SpectrumMetrics;
  }

  let { ticks, xScale, innerWidth, axisY, metrics = DESKTOP_METRICS }: Props = $props();
</script>

<!-- BOTTOM AXIS: Frequency -->
<g transform="translate(0, {axisY})">
  <line x1="0" y1="0" x2={innerWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
  <text
    x={-metrics.rowLabelOffset}
    y="5"
    text-anchor="end"
    style="fill: var(--color-text-tertiary); font-size: {metrics.axisLabelFontSize};"
  >
    f
  </text>
  {#each ticks as tick (tick)}
    {@const tickX = xScale(tick)}
    {#if tickX >= 0 && tickX <= innerWidth}
      <g transform="translate({tickX}, 0)">
        <line y1="0" y2="6" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        <text
          y={metrics.tickLabelBottom}
          text-anchor={tickTextAnchor(tickX, formatFrequencyLocal(tick), innerWidth, metrics)}
          style="fill: var(--color-text-tertiary); font-size: {metrics.tickFontSize};"
        >
          {formatFrequencyLocal(tick)}
        </text>
        <!-- Duale Beschriftung: korrespondierende Wellenlänge (nur in voller Breite) -->
        {#if metrics.dualTickLabels}
          <text y="31" text-anchor="middle" style="fill: var(--color-text-tertiary); font-size: 8px; opacity: 0.7;">
            ({formatWavelengthLocal(safeDivide(ROUNDED_SPEED_OF_LIGHT, tick, 0))})
          </text>
        {/if}
      </g>
    {/if}
  {/each}
</g>
