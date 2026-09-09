<script lang="ts">
  /**
   * Zeigerdiagramm: Links rotieren zwei Zeiger, rechts laufen die zugehörigen
   * Sinusschwingungen mit. Der dritte Zeiger ist die Summe — Amplitude und
   * Phase folgen aus der Vektoraddition. Gerechnet wird in PhasorModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { PHASOR_LIMITS, degToRad, phasorPoint, phasorSum, waveSamples } from './PhasorModel';

  const W = 800;
  const H = 258;
  const CX = 130;
  const CY = 120;
  const R = 92;
  /** Zeitachse rechts */
  const TX0 = 258;
  const TX1 = 772;
  const CYCLES = 2;
  const SAMPLES = 161;
  /** Dauer einer vollen Umdrehung (ms) */
  const CYCLE_MS = 4000;

  let amplitude1 = $state<number>(PHASOR_LIMITS.amplitude.default);
  let amplitude2 = $state<number>(0.7);
  let phase2Deg = $state<number>(PHASOR_LIMITS.phaseDeg.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const omegaT = $derived(((loop.elapsedMs % CYCLE_MS) / CYCLE_MS) * 2 * Math.PI);
  const phase2Rad = $derived(degToRad(phase2Deg));
  const sum = $derived(phasorSum(amplitude1, 0, amplitude2, phase2Rad));

  const tip1 = $derived(phasorPoint(amplitude1, 0, omegaT));
  const tip2 = $derived(phasorPoint(amplitude2, phase2Rad, omegaT));
  const tipSum = $derived(phasorPoint(sum.amplitude, sum.phaseRad, omegaT));

  /** Größte darstellbare Amplitude — die Skala bleibt dadurch ruhig. */
  const SCALE = 2;
  function sx(value: number): number {
    return CX + (value / SCALE) * R;
  }
  function sy(value: number): number {
    return CY - (value / SCALE) * R;
  }
  function ty(value: number): number {
    return CY - (value / SCALE) * R;
  }
  function tx(u: number): number {
    return TX0 + u * (TX1 - TX0);
  }
  function wavePath(amplitude: number, phaseRad: number): string {
    return waveSamples(amplitude, phaseRad, omegaT, CYCLES, SAMPLES)
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${tx(s.u).toFixed(1)},${ty(s.value).toFixed(1)}`)
      .join(' ');
  }
  const traces = $derived([
    { path: wavePath(amplitude1, 0), color: 'var(--color-series-1)', label: 'u₁' },
    { path: wavePath(amplitude2, phase2Rad), color: 'var(--color-series-3)', label: 'u₂' },
    { path: wavePath(sum.amplitude, sum.phaseRad), color: 'var(--color-series-2)', label: 'u₁ + u₂' }
  ]);
</script>

<WidgetFrame
  title="Zeigerdiagramm: Sinus, Amplitude, Phase"
  description="Links rotieren zwei Zeiger gleicher Frequenz in einem Kreis; ihre senkrechte Projektion ergibt die Sinuskurven rechts. Der grüne Summenzeiger entsteht durch Vektoraddition — bei 0 Grad Phasendifferenz verstärken sich beide, bei 180 Grad löschen sie sich aus."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Beide Schwingungen haben dieselbe Frequenz — nur dann steht das Zeigerbild still zueinander und die Addition ist eine reine Vektoraddition. Amplituden sind auf 1 normiert."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Zeigerebene -->
    <circle cx={CX} cy={CY} r={R / SCALE} fill="none" class="chart-grid-line" />
    <circle cx={CX} cy={CY} r={R} fill="none" class="chart-grid-line" />
    <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} class="chart-axis-line" />
    <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} class="chart-axis-line" />
    <line x1={CX} y1={CY} x2={sx(tip1.x)} y2={sy(tip1.y)} stroke="var(--color-series-1)" stroke-width="3" />
    <line x1={CX} y1={CY} x2={sx(tip2.x)} y2={sy(tip2.y)} stroke="var(--color-series-3)" stroke-width="3" />
    <line
      x1={sx(tip1.x)}
      y1={sy(tip1.y)}
      x2={sx(tipSum.x)}
      y2={sy(tipSum.y)}
      stroke="var(--color-series-3)"
      stroke-width="1.5"
      stroke-dasharray="4 3"
    />
    <line x1={CX} y1={CY} x2={sx(tipSum.x)} y2={sy(tipSum.y)} stroke="var(--color-series-2)" stroke-width="3.5" />
    <circle cx={sx(tipSum.x)} cy={sy(tipSum.y)} r="4.5" fill="var(--color-series-2)" />
    <text x={CX} y={CY + R + 30} text-anchor="middle" class="chart-axis-text">
      Zeigerebene · ω·t = {formatNumber((omegaT * 180) / Math.PI, 0)}°
    </text>

    <!-- Zeitverlauf -->
    <line x1={TX0} y1={CY} x2={TX1} y2={CY} class="chart-axis-line" />
    {#each [1, -1] as level (level)}
      <line x1={TX0} y1={ty(level)} x2={TX1} y2={ty(level)} class="chart-grid-line" />
      <text x={TX0 - 6} y={ty(level) + 4} text-anchor="end" class="chart-axis-text">{level > 0 ? '+1' : '−1'}</text>
    {/each}
    <line
      x1={TX0}
      y1={CY}
      x2={TX0}
      y2={ty(tipSum.y / 1)}
      stroke="var(--color-series-2)"
      stroke-width="1.5"
      stroke-dasharray="3 3"
    />
    {#each traces as trace (trace.label)}
      <path d={trace.path} fill="none" stroke={trace.color} stroke-width={trace.label === 'u₁ + u₂' ? 3 : 2} />
    {/each}
    <text x={TX1} y={CY + R + 30} text-anchor="end" class="chart-axis-text">Zeit t (zwei Perioden) →</text>

    <g transform="translate({TX0}, 24)">
      {#each traces as trace, i (trace.label)}
        <line x1={i * 130} y1="0" x2={i * 130 + 20} y2="0" stroke={trace.color} stroke-width="3" />
        <text x={i * 130 + 26} y="4" class="chart-legend-text">{trace.label}</text>
      {/each}
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Zeiger und Summe bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Amplitude Û₁</th><td>{formatNumber(amplitude1, 2)} (Phase 0°)</td></tr>
        <tr><th>Amplitude Û₂</th><td>{formatNumber(amplitude2, 2)}</td></tr>
        <tr><th>Phasenverschiebung φ₂</th><td>{formatNumber(phase2Deg, 0)}°</td></tr>
        <tr><th>Summenamplitude</th><td>{formatNumber(sum.amplitude, 3)}</td></tr>
        <tr><th>Summenphase</th><td>{formatNumber(sum.phaseDeg, 1)}°</td></tr>
        <tr><th>Momentanwert der Summe</th><td>{formatNumber(tipSum.y, 3)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Amplitude Û₁"
      bind:value={amplitude1}
      min={PHASOR_LIMITS.amplitude.min}
      max={PHASOR_LIMITS.amplitude.max}
      step={0.05}
      format={(v) => formatNumber(v, 2)}
      unitSymbol="normiert"
    />
    <Slider
      label="Amplitude Û₂"
      bind:value={amplitude2}
      min={PHASOR_LIMITS.amplitude.min}
      max={PHASOR_LIMITS.amplitude.max}
      step={0.05}
      format={(v) => formatNumber(v, 2)}
      unitSymbol="normiert"
    />
    <Slider
      label="Phasenverschiebung φ₂"
      bind:value={phase2Deg}
      min={PHASOR_LIMITS.phaseDeg.min}
      max={PHASOR_LIMITS.phaseDeg.max}
      step={1}
      format={(v) => `${formatNumber(v, 0)}°`}
      unitSymbol="Grad"
      ticks={[
        { at: -180, label: '−180°' },
        { at: 0, label: '0°' },
        { at: 180, label: '180°' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Summenamplitude"
      value={formatNumber(sum.amplitude, 3)}
      emphasis="hero"
      hint="√(Û₁² + Û₂² + 2·Û₁·Û₂·cos φ₂)"
      tone={sum.amplitude > Math.max(amplitude1, amplitude2) ? 'success' : 'warning'}
      copyable={false}
    />
    <ResultCard label="Summenphase" value="{formatNumber(sum.phaseDeg, 1)}°" copyable={false} />
    <ResultCard
      label="Momentanwert u(t)"
      value={formatNumber(tipSum.y, 3)}
      hint="senkrechte Projektion des Summenzeigers"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
