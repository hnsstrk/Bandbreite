<script lang="ts">
  /**
   * Zeitbereich des Modulations-Visualisierers: drei übereinanderliegende
   * Spuren für Nachricht, Träger und moduliertes Signal.
   *
   * Die Komponente rechnet nicht, sie zeichnet nur — alle Werte kommen aus
   * `modulationMath.ts`.
   */
  import type { Waveform } from '$lib/utils/modulationMath';
  import { amEnvelope } from '$lib/utils/modulationMath';

  interface Props {
    waveform: Waveform;
    /** Hüllkurve zusätzlich einzeichnen (Amplitudenmodulation) */
    showEnvelope?: boolean;
    /** Modulationsgrad für die Hüllkurve */
    amDepth?: number;
    /** Beschriftung der dritten Spur */
    modulatedLabel?: string;
  }

  let { waveform, showEnvelope = false, amDepth = 0, modulatedLabel = 'moduliert' }: Props = $props();

  /** Zeichenfläche in Benutzereinheiten des viewBox. */
  const VIEW_WIDTH = 720;
  const VIEW_HEIGHT = 320;
  const PAD_LEFT = 92;
  const PAD_RIGHT = 12;
  const LANE_CENTERS = [52, 150, 252];
  const LANE_AMPLITUDE = 38;
  /** Maßstab der modulierten Spur, damit die AM-Hüllkurve hineinpasst. */
  const MODULATED_SCALE = 0.55;

  const plotWidth = VIEW_WIDTH - PAD_LEFT - PAD_RIGHT;

  function xAt(index: number, count: number): number {
    if (count < 2) return PAD_LEFT;
    return PAD_LEFT + (index / (count - 1)) * plotWidth;
  }

  function toPath(values: number[], centerY: number, scale: number): string {
    const count = values.length;
    let path = '';
    for (let index = 0; index < count; index += 1) {
      const x = xAt(index, count);
      const y = centerY - values[index] * LANE_AMPLITUDE * scale;
      path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return path;
  }

  const messagePath = $derived(toPath(waveform.message, LANE_CENTERS[0], 1));
  const carrierPath = $derived(toPath(waveform.carrier, LANE_CENTERS[1], 1));
  const modulatedPath = $derived(toPath(waveform.modulated, LANE_CENTERS[2], MODULATED_SCALE));

  const envelopeUpper = $derived(
    showEnvelope
      ? toPath(
          waveform.message.map((value) => amEnvelope(amDepth, value)),
          LANE_CENTERS[2],
          MODULATED_SCALE
        )
      : ''
  );
  const envelopeLower = $derived(
    showEnvelope
      ? toPath(
          waveform.message.map((value) => -amEnvelope(amDepth, value)),
          LANE_CENTERS[2],
          MODULATED_SCALE
        )
      : ''
  );
</script>

<svg viewBox="0 0 {VIEW_WIDTH} {VIEW_HEIGHT}" class="waveforms" aria-hidden="true">
  {#each LANE_CENTERS as center, lane (lane)}
    <line x1={PAD_LEFT} y1={center} x2={VIEW_WIDTH - PAD_RIGHT} y2={center} class="axis" />
  {/each}

  <text x="0" y={LANE_CENTERS[0] - 4} class="lane-label">Nachricht</text>
  <text x="0" y={LANE_CENTERS[0] + 12} class="lane-sub">Basisband</text>
  <text x="0" y={LANE_CENTERS[1] - 4} class="lane-label">Träger</text>
  <text x="0" y={LANE_CENTERS[1] + 12} class="lane-sub">unmoduliert</text>
  <text x="0" y={LANE_CENTERS[2] - 4} class="lane-label">Sendesignal</text>
  <text x="0" y={LANE_CENTERS[2] + 12} class="lane-sub">{modulatedLabel}</text>

  {#if showEnvelope}
    <path d={envelopeUpper} class="trace envelope" />
    <path d={envelopeLower} class="trace envelope" />
  {/if}

  <path d={messagePath} class="trace message" />
  <path d={carrierPath} class="trace carrier" />
  <path d={modulatedPath} class="trace modulated" />

  <text x={PAD_LEFT} y={VIEW_HEIGHT - 6} class="axis-label">Zeit →</text>
</svg>

<style>
  .waveforms {
    display: block;
    width: 100%;
    height: auto;
  }

  .axis {
    stroke: var(--color-grid);
    stroke-width: 1;
  }

  .trace {
    fill: none;
    stroke-width: 1.6;
    stroke-linejoin: round;
  }

  .message {
    stroke: var(--color-series-1);
  }

  .carrier {
    stroke: var(--color-series-8);
  }

  .modulated {
    stroke: var(--color-series-3);
  }

  .envelope {
    stroke: var(--color-series-6);
    stroke-width: 1.2;
    stroke-dasharray: 4 3;
    opacity: 0.85;
  }

  .lane-label {
    fill: var(--color-ink);
    font-size: var(--text-2xs);
    font-weight: var(--font-weight-semibold);
  }

  .lane-sub,
  .axis-label {
    fill: var(--color-ink-subtle);
    font-size: var(--text-2xs);
  }
</style>
