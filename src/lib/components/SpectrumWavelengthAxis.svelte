<script lang="ts">
  /**
   * Obere Achse des Spektrums (Wellenlänge) samt vertikaler Gitterlinien.
   * Reines Markup — Ticks und Skala kommen aus `spectrumState`.
   */
  import { formatFrequencyLocal } from './spectrumFormat';
  import type { WavelengthTick } from './spectrumZoom';
  import { DESKTOP_METRICS, tickTextAnchor, type SpectrumMetrics } from './spectrumLayout';

  interface Props {
    ticks: WavelengthTick[];
    xScale: (hz: number) => number;
    innerWidth: number;
    /** y der Achsenlinie */
    axisY: number;
    /** unteres Ende der Gitterlinien */
    gridBottomY: number;
    /** breitenabhängige Maße (Schrift, Abstände, Zweitangabe) */
    metrics?: SpectrumMetrics;
  }

  let { ticks, xScale, innerWidth, axisY, gridBottomY, metrics = DESKTOP_METRICS }: Props = $props();
</script>

<!-- TOP AXIS: Wavelength -->
<g transform="translate(0, {axisY})">
  <line x1="0" y1="0" x2={innerWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
  <text
    x={-metrics.rowLabelOffset}
    y="5"
    text-anchor="end"
    style="fill: var(--color-text-tertiary); font-size: {metrics.axisLabelFontSize};"
  >
    {metrics.wavelengthAxisLabel}
  </text>
  {#each ticks as tick (tick.label)}
    {@const tickX = xScale(tick.freq)}
    {#if tickX >= 0 && tickX <= innerWidth}
      <g transform="translate({tickX}, 0)">
        <line y1="-6" y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        <text
          y={metrics.tickLabelTop}
          text-anchor={tickTextAnchor(tickX, tick.label, innerWidth, metrics)}
          style="fill: var(--color-text-tertiary); font-size: {metrics.tickFontSize};"
        >
          {tick.label}
        </text>
        <!-- Duale Beschriftung: korrespondierende Frequenz (nur in voller Breite) -->
        {#if metrics.dualTickLabels}
          <text y="-23" text-anchor="middle" style="fill: var(--color-text-tertiary); font-size: 8px; opacity: 0.7;">
            ({formatFrequencyLocal(tick.freq)})
          </text>
        {/if}
      </g>
    {/if}
  {/each}
</g>

<!-- Vertikale Gitterlinien von Wellenlängen-Ticks -->
<g aria-hidden="true">
  {#each ticks as tick (tick.label)}
    {@const tickX = xScale(tick.freq)}
    {#if tickX >= 0 && tickX <= innerWidth}
      <line
        x1={tickX}
        y1={axisY}
        x2={tickX}
        y2={gridBottomY}
        style="stroke: var(--color-chart-grid)"
        stroke-width="0.5"
        stroke-dasharray="4 3"
        opacity="0.3"
      />
    {/if}
  {/each}
</g>
