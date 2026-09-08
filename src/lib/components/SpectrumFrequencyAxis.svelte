<script lang="ts">
  /**
   * Untere Achse des Spektrums (Frequenz) mit dualer Wellenlängenbeschriftung.
   * Die Wellenlänge nutzt bewusst c ≈ 3·10⁸ m/s, damit die Ticks „rund" bleiben.
   */
  import { formatFrequencyLocal, formatWavelengthLocal } from "./spectrumFormat";
  import { ROUNDED_SPEED_OF_LIGHT } from "./spectrumCursor.svelte";
  import { safeDivide } from "$lib/utils/handlers";

  interface Props {
    ticks: number[];
    xScale: (hz: number) => number;
    innerWidth: number;
    /** y der Achsenlinie */
    axisY: number;
  }

  let { ticks, xScale, innerWidth, axisY }: Props = $props();
</script>

<!-- BOTTOM AXIS: Frequency -->
<g transform="translate(0, {axisY})">
  <line
    x1="0"
    y1="0"
    x2={innerWidth}
    y2="0"
    style="stroke: var(--color-chart-axis)"
    stroke-width="1"
  />
  <text
    x="-10"
    y="5"
    text-anchor="end"
    style="fill: var(--color-text-tertiary)"
    class="text-xs"
  >
    f
  </text>
  {#each ticks as tick (tick)}
    {@const tickX = xScale(tick)}
    {#if tickX >= 0 && tickX <= innerWidth}
      <g transform="translate({tickX}, 0)">
        <line
          y1="0"
          y2="6"
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        <text
          y="20"
          text-anchor="middle"
          style="fill: var(--color-text-tertiary); font-size: 10px;"
        >
          {formatFrequencyLocal(tick)}
        </text>
        <!-- Duale Beschriftung: korrespondierende Wellenlänge -->
        <text
          y="31"
          text-anchor="middle"
          style="fill: var(--color-text-tertiary); font-size: 8px; opacity: 0.7;"
        >
          ({formatWavelengthLocal(safeDivide(ROUNDED_SPEED_OF_LIGHT, tick, 0))})
        </text>
      </g>
    {/if}
  {/each}
</g>
