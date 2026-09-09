<script lang="ts">
  /**
   * FMCW-Radar: Sende- und Empfangsrampe im Frequenz-Zeit-Diagramm.
   * Die Empfangsrampe ist um die Laufzeit τ = 2R/c verschoben; der senkrechte
   * Abstand beider Rampen ist die Beat-Frequenz f_b = 2·R·B/(c·T).
   * Rechnung in FmcwModel.ts (Formeln aus $lib/utils/radar).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatFrequency, formatNumber, formatWavelength } from '$lib/utils/formatting';
  import { calculateBandwidthRangeResolution } from '$lib/utils/radar';
  import { computeFmcw, resolutionCells, FMCW_LIMITS, FMCW_CENTER_FREQUENCY_HZ } from './FmcwModel';

  const W = 800;
  const H = 260;
  const PAD = { left: 58, right: 18, top: 22, bottom: 34 };
  const PLOT_W = W - PAD.left - PAD.right;
  const PLOT_H = H - PAD.top - PAD.bottom;
  /** Dargestellte Rampen */
  const RAMPS = 2;
  /** Mindestversatz der Empfangsrampe in Bruchteilen einer Rampe (Sichtbarkeit) */
  const MIN_VISUAL_DELAY = 0.06;
  /** Umlaufdauer der Marke in ms */
  const SWEEP_MS = 4000;

  let bandwidthHz = $state<number>(FMCW_LIMITS.bandwidthHz.default);
  let rampDurationS = $state<number>(FMCW_LIMITS.rampDurationS.default);
  let rangeM = $state<number>(FMCW_LIMITS.rangeM.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const result = $derived(computeFmcw(rangeM, bandwidthHz, rampDurationS));
  const cells = $derived(resolutionCells(rangeM, result.rangeResolutionM));
  /** Versatz der Empfangsrampe in Pixeln — übertrieben, damit sichtbar */
  const rampW = PLOT_W / RAMPS;
  const delayPx = $derived(Math.max(result.delayFraction, MIN_VISUAL_DELAY) * rampW);
  /** Laufende Marke: Anteil der Gesamtachse 0 … 1 */
  const sweep = $derived(((loop.elapsedMs % SWEEP_MS) / SWEEP_MS) * RAMPS);

  const x = (fraction: number) => PAD.left + fraction * PLOT_W;
  const y = (fraction: number) => PAD.top + PLOT_H - fraction * PLOT_H;

  /**
   * Sägezahn: `shift` verschiebt die Rampe nach rechts (Empfang). Eine Rampe
   * vor dem sichtbaren Bereich sorgt dafür, dass die verzögerte Empfangsrampe
   * auch links am Rand (Ende der vorigen Rampe) gezeichnet ist.
   */
  function rampPath(shiftPx: number): string {
    const parts: string[] = [];
    for (let i = -1; i < RAMPS + 1; i++) {
      const x0 = PAD.left + i * rampW + shiftPx;
      parts.push(`M${x0},${y(0)} L${x0 + rampW},${y(1)}`);
    }
    return parts.join(' ');
  }

  /** Momentanfrequenz (0 … 1) der Sende- bzw. Empfangsrampe an der Marke */
  const sweepFractionTx = $derived(sweep % 1);
  const sweepShift = $derived(delayPx / rampW);
  const sweepFractionRx = $derived((((sweep - sweepShift) % 1) + 1) % 1);
  const markerX = $derived(x(sweep / RAMPS));
</script>

<WidgetFrame
  title="FMCW: Rampe, Laufzeit, Beat-Frequenz"
  description="Frequenz-Zeit-Diagramm eines FMCW-Radars: Die Sendefrequenz steigt linear über die Bandbreite B an, die Empfangsrampe ist um die Laufzeit verschoben. Der senkrechte Abstand beider Rampen ist die Beat-Frequenz."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Der Zeitversatz der Empfangsrampe ist zur Sichtbarkeit übertrieben: real beträgt er hier {formatNumber(
    result.delayFraction * 100,
    2
  )} % der Rampendauer. Trägermitte {formatFrequency(FMCW_CENTER_FREQUENCY_HZ, 0)} (Automotive-Band)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1={PAD.left} y1={y(0)} x2={W - PAD.right} y2={y(0)} class="chart-axis-line" />
    <line x1={PAD.left} y1={y(0)} x2={PAD.left} y2={y(1)} class="chart-axis-line" />
    <text x={PAD.left - 8} y={y(1) + 4} text-anchor="end" class="chart-axis-text">f₀ + B</text>
    <text x={PAD.left - 8} y={y(0) + 4} text-anchor="end" class="chart-axis-text">f₀</text>
    <text x={W - PAD.right} y={H - 8} text-anchor="end" class="chart-axis-text">Zeit →</text>

    <path d={rampPath(0)} fill="none" stroke="var(--color-series-1)" stroke-width="2.5" />
    <path d={rampPath(delayPx)} fill="none" stroke="var(--color-series-2)" stroke-width="2.5" stroke-dasharray="6 4" />

    <!-- Beat-Frequenz als senkrechter Abstand an der laufenden Marke -->
    <line
      x1={markerX}
      y1={y(sweepFractionTx)}
      x2={markerX}
      y2={y(sweepFractionRx)}
      stroke="var(--color-series-3)"
      stroke-width="3"
    />
    <circle cx={markerX} cy={y(sweepFractionTx)} r="4" fill="var(--color-series-1)" />
    <circle cx={markerX} cy={y(sweepFractionRx)} r="4" fill="var(--color-series-2)" />
    <text x={markerX + 8} y={(y(sweepFractionTx) + y(sweepFractionRx)) / 2} class="chart-legend-text">
      f_b = {formatFrequency(result.beatHz, 2)}
    </text>

    <g transform="translate({PAD.left + 6}, {PAD.top + 12})">
      <line x1="0" y1="0" x2="18" y2="0" stroke="var(--color-series-1)" stroke-width="2.5" />
      <text x="24" y="4" class="chart-legend-text">Sendesignal</text>
      <line x1="120" y1="0" x2="138" y2="0" stroke="var(--color-series-2)" stroke-width="2.5" stroke-dasharray="6 4" />
      <text x="144" y="4" class="chart-legend-text">Echo (um τ verzögert)</text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des FMCW-Widgets</caption>
      <tbody>
        <tr><th>Bandbreite B</th><td>{formatFrequency(bandwidthHz, 2)}</td></tr>
        <tr><th>Rampendauer T</th><td>{formatNumber(rampDurationS * 1e6, 0)} µs</td></tr>
        <tr><th>Entfernung R</th><td>{formatDistance(rangeM, 0)}</td></tr>
        <tr><th>Laufzeit τ = 2R/c</th><td>{formatNumber(result.delayS * 1e9, 0)} ns</td></tr>
        <tr><th>Beat-Frequenz f_b</th><td>{formatFrequency(result.beatHz, 2)}</td></tr>
        <tr><th>Entfernungsauflösung ΔR</th><td>{formatWavelength(result.rangeResolutionM, 1)}</td></tr>
        <tr><th>Auflösbare Zellen bis R</th><td>{formatNumber(cells, 0)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Chirp-Bandbreite B"
      bind:value={bandwidthHz}
      min={FMCW_LIMITS.bandwidthHz.min}
      max={FMCW_LIMITS.bandwidthHz.max}
      step={50e6}
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Rampendauer T"
      bind:value={rampDurationS}
      min={FMCW_LIMITS.rampDurationS.min}
      max={FMCW_LIMITS.rampDurationS.max}
      step={1e-6}
      format={(v) => `${formatNumber(v * 1e6, 0)} µs`}
      unitSymbol="µs"
    />
    <Slider
      label="Zielentfernung R"
      bind:value={rangeM}
      min={FMCW_LIMITS.rangeM.min}
      max={FMCW_LIMITS.rangeM.max}
      step={1}
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Beat-Frequenz f_b = 2·R·B/(c·T)"
      value={formatFrequency(result.beatHz, 2)}
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Auflösung ΔR = c/(2·B)"
      value={formatWavelength(result.rangeResolutionM, 1)}
      hint="{formatNumber(cells, 0)} Zellen bis {formatDistance(rangeM, 0)}"
      copyable={false}
    />
    <ResultCard
      label="Rampensteilheit B/T"
      value={formatNumber(result.slopeHzPerS / 1e12, 2)}
      unit="MHz/µs"
      copyable={false}
    />
    <Callout tone={result.delayCritical ? 'warning' : 'tip'} title="Was die Regler bewirken">
      Die Bandbreite bestimmt allein die Auflösung: {formatFrequency(FMCW_LIMITS.bandwidthHz.max, 0)}
      trennen Ziele bis auf {formatWavelength(calculateBandwidthRangeResolution(FMCW_LIMITS.bandwidthHz.max), 1)}. Eine
      kürzere Rampe erhöht die Beat-Frequenz und verlangt einen schnelleren Analog-Digital-Umsetzer.
      {#if result.delayCritical}
        Hier belegt die Laufzeit bereits über {formatNumber(result.delayFraction * 100, 0)} % der Rampe — der gemeinsam nutzbare
        Teil beider Rampen wird knapp.
      {/if}
    </Callout>
  {/snippet}
</WidgetFrame>
