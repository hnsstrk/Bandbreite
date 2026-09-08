<script lang="ts">
  /**
   * Vereinfachtes Linienspektrum des modulierten Signals.
   *
   * Gezeichnet werden der Träger, die Seitenbandlinien und — als
   * halbtransparenter Balken — die nach Carson belegte Bandbreite.
   */
  import type { SpectrumLine } from '$lib/utils/modulationMath';
  import { formatFrequency } from '$lib/utils/formatting';

  interface Props {
    lines: SpectrumLine[];
    /** Trägerfrequenz in Hertz (Mitte der Achse) */
    carrierHz: number;
    /** Belegte Bandbreite in Hertz */
    bandwidthHz: number;
    /** Balken der belegten Bandbreite einzeichnen */
    showBandwidth?: boolean;
  }

  let { lines, carrierHz, bandwidthHz, showBandwidth = true }: Props = $props();

  const VIEW_WIDTH = 720;
  const VIEW_HEIGHT = 240;
  const PAD_LEFT = 44;
  const PAD_RIGHT = 20;
  const BASELINE_Y = 196;
  const TOP_Y = 30;
  /** Reserve am Rand der Frequenzachse. */
  const SPAN_MARGIN = 1.25;

  const plotWidth = VIEW_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = BASELINE_Y - TOP_Y;

  const spanHz = $derived.by(() => {
    const fromLines = lines.reduce((max, line) => Math.max(max, Math.abs(line.offsetHz)), 0);
    const fromBandwidth = showBandwidth ? bandwidthHz / 2 : 0;
    const span = Math.max(fromLines, fromBandwidth, 1) * SPAN_MARGIN;
    return span;
  });

  function xAt(offsetHz: number): number {
    const relative = (offsetHz + spanHz) / (2 * spanHz);
    return PAD_LEFT + relative * plotWidth;
  }

  function yAt(amplitude: number): number {
    return BASELINE_Y - Math.min(1, Math.max(0, amplitude)) * plotHeight;
  }

  const carrierX = $derived(xAt(0));
  const bandLeft = $derived(xAt(-bandwidthHz / 2));
  const bandRight = $derived(xAt(bandwidthHz / 2));

  /** Beschriftungen der Frequenzachse: Träger und beide Bandgrenzen. */
  const ticks = $derived([
    { x: xAt(-spanHz / SPAN_MARGIN), label: formatFrequency(carrierHz - spanHz / SPAN_MARGIN) },
    { x: carrierX, label: formatFrequency(carrierHz) },
    { x: xAt(spanHz / SPAN_MARGIN), label: formatFrequency(carrierHz + spanHz / SPAN_MARGIN) }
  ]);
</script>

<svg viewBox="0 0 {VIEW_WIDTH} {VIEW_HEIGHT}" class="spectrum" aria-hidden="true">
  {#if showBandwidth && bandwidthHz > 0}
    <rect
      x={bandLeft}
      y={TOP_Y - 12}
      width={Math.max(0, bandRight - bandLeft)}
      height={BASELINE_Y - TOP_Y + 12}
      class="band"
    />
    <text x={(bandLeft + bandRight) / 2} y={TOP_Y - 18} class="band-label">
      B = {formatFrequency(bandwidthHz)}
    </text>
  {/if}

  <line x1={PAD_LEFT} y1={BASELINE_Y} x2={VIEW_WIDTH - PAD_RIGHT} y2={BASELINE_Y} class="axis" />
  <line x1={PAD_LEFT} y1={TOP_Y} x2={PAD_LEFT} y2={BASELINE_Y} class="axis" />

  {#each lines as line (line.label)}
    <line
      x1={xAt(line.offsetHz)}
      y1={BASELINE_Y}
      x2={xAt(line.offsetHz)}
      y2={yAt(line.amplitude)}
      class={line.offsetHz === 0 ? 'stem stem--carrier' : 'stem'}
    />
    <circle
      cx={xAt(line.offsetHz)}
      cy={yAt(line.amplitude)}
      r="3"
      class={line.offsetHz === 0 ? 'dot dot--carrier' : 'dot'}
    />
  {/each}

  {#each ticks as tick (tick.label)}
    <line x1={tick.x} y1={BASELINE_Y} x2={tick.x} y2={BASELINE_Y + 5} class="axis" />
    <text x={tick.x} y={BASELINE_Y + 20} class="tick">{tick.label}</text>
  {/each}

  <text x={PAD_LEFT} y={TOP_Y - 18} class="axis-label" text-anchor="end">Amplitude</text>
  <text x={VIEW_WIDTH - PAD_RIGHT} y={VIEW_HEIGHT - 6} class="axis-label" text-anchor="end"> Frequenz → </text>
</svg>

<style>
  .spectrum {
    display: block;
    width: 100%;
    height: auto;
  }

  .axis {
    stroke: var(--color-axis);
    stroke-width: 1;
  }

  .stem {
    stroke: var(--color-series-1);
    stroke-width: 2;
  }

  .stem--carrier {
    stroke: var(--color-series-3);
    stroke-width: 2.6;
  }

  .dot {
    fill: var(--color-series-1);
  }

  .dot--carrier {
    fill: var(--color-series-3);
  }

  .band {
    fill: var(--color-brand);
    opacity: 0.12;
  }

  .band-label {
    fill: var(--color-brand-ink);
    font-size: var(--text-2xs);
    font-weight: var(--font-weight-semibold);
    text-anchor: middle;
  }

  .tick {
    fill: var(--color-ink-subtle);
    font-size: var(--text-2xs);
    text-anchor: middle;
  }

  .axis-label {
    fill: var(--color-ink-subtle);
    font-size: var(--text-2xs);
  }
</style>
