<script lang="ts">
  /**
   * Fourier-Synthese: Rechteck, Dreieck oder Sägezahn aus n Harmonischen.
   * Links die Teilsumme über der idealen Kurve, rechts das Linienspektrum.
   * Gerechnet wird in FourierSynthesisModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber, formatPercentage } from '$lib/utils/formatting';
  import {
    SHAPE_LABELS,
    SYNTHESIS_LIMITS,
    activeHarmonics,
    harmonics,
    overshootFraction,
    peakValue,
    synthesisCurve,
    type SynthesisShape
  } from './FourierSynthesisModel';

  const W = 800;
  const H = 250;
  /** Linke Bühne: Zeitverlauf */
  const TX0 = 56;
  const TX1 = 470;
  const TY = 118;
  const TAMP = 78;
  /** Rechte Bühne: Linienspektrum */
  const SX0 = 528;
  const SX1 = 772;
  const SY0 = 44;
  const SY1 = 196;
  const CYCLES = 2;

  let shapeValue = $state<string>('rechteck');
  let harmonicCount = $state<number>(SYNTHESIS_LIMITS.harmonics.default);

  const shape = $derived(shapeValue as SynthesisShape);
  const curve = $derived(synthesisCurve(shape, harmonicCount, CYCLES));
  const lines = $derived(harmonics(shape, SYNTHESIS_LIMITS.harmonics.max));
  const active = $derived(activeHarmonics(shape, harmonicCount));
  const peak = $derived(peakValue(shape, harmonicCount));
  /** Überschwingen an der Sprungstelle, bezogen auf die Sprunghöhe (Gibbs). */
  const overshoot = $derived(overshootFraction(shape, harmonicCount));
  const maxAmplitude = $derived(Math.max(...lines.map((line) => Math.abs(line.amplitude)), 0.1));

  function tx(u: number): number {
    return TX0 + u * (TX1 - TX0);
  }
  function ty(value: number): number {
    return TY - (value / 1.4) * TAMP;
  }
  function path(select: (point: (typeof curve)[number]) => number): string {
    return curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.u).toFixed(1)},${ty(select(p)).toFixed(1)}`).join(' ');
  }
  function lineX(order: number): number {
    return SX0 + ((order - 0.5) / SYNTHESIS_LIMITS.harmonics.max) * (SX1 - SX0);
  }
  function lineHeight(amplitude: number): number {
    return (Math.abs(amplitude) / maxAmplitude) * (SY1 - SY0);
  }
</script>

<WidgetFrame
  title="Fourier-Synthese: Signal aus Harmonischen"
  description="Links liegt die Teilsumme aus n Sinusschwingungen über der gestrichelten Idealkurve; mit jeder weiteren Harmonischen werden die Flanken steiler, an den Sprüngen bleibt der Gibbssche Überschwinger. Rechts zeigt das Linienspektrum die Amplituden der einzelnen Harmonischen, ausgefüllt die mitgerechneten."
  footnote="Amplituden auf die Grundwelle bezogen und auf ±1 normiert. Reihenkoeffizienten nach Bronstein/Semendjajew; Rechteck und Dreieck enthalten nur ungerade Harmonische."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Zeitverlauf -->
    <line x1={TX0} y1={TY} x2={TX1} y2={TY} class="chart-axis-line" />
    {#each [1, -1] as level (level)}
      <line x1={TX0} y1={ty(level)} x2={TX1} y2={ty(level)} class="chart-grid-line" />
      <text x={TX0 - 6} y={ty(level) + 4} text-anchor="end" class="chart-axis-text">{level > 0 ? '+1' : '−1'}</text>
    {/each}
    <path
      d={path((p) => p.ideal)}
      fill="none"
      stroke="var(--color-ink-subtle)"
      stroke-width="1.5"
      stroke-dasharray="5 4"
    />
    <path d={path((p) => p.sum)} fill="none" stroke="var(--color-series-1)" stroke-width="2.5" />
    <text x={TX0} y={TY + TAMP + 44} class="chart-axis-text">Zeit t · {CYCLES} Perioden</text>
    <g transform="translate({TX0}, 24)">
      <line x1="0" y1="0" x2="20" y2="0" stroke="var(--color-series-1)" stroke-width="3" />
      <text x="26" y="4" class="chart-legend-text">Teilsumme aus {active.length} Harmonischen</text>
      <line x1="230" y1="0" x2="250" y2="0" stroke="var(--color-ink-subtle)" stroke-width="2" stroke-dasharray="5 4" />
      <text x="256" y="4" class="chart-legend-text">Ideal</text>
    </g>

    <!-- Linienspektrum -->
    <line x1={SX0} y1={SY1} x2={SX1} y2={SY1} class="chart-axis-line" />
    <line x1={SX0} y1={SY0} x2={SX0} y2={SY1} class="chart-axis-line" />
    {#each lines as line (line.order)}
      {#if line.amplitude !== 0}
        <line
          x1={lineX(line.order)}
          y1={SY1}
          x2={lineX(line.order)}
          y2={SY1 - lineHeight(line.amplitude)}
          stroke={line.order <= harmonicCount ? 'var(--color-series-2)' : 'var(--color-line)'}
          stroke-width="4"
        />
      {/if}
    {/each}
    {#each [1, 3, 5, 9, 15, 25] as order (order)}
      <text x={lineX(order)} y={SY1 + 18} text-anchor="middle" class="chart-axis-text">{order}</text>
    {/each}
    <text x={SX0} y={SY0 - 14} class="chart-axis-text">Amplitude der Harmonischen</text>
    <text x={SX1} y={SY1 + 36} text-anchor="end" class="chart-axis-text">Ordnung n (n·f₀)</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Harmonische der {SHAPE_LABELS[shape]}schwingung</caption>
      <thead>
        <tr><th scope="col">Ordnung n</th><th scope="col">Frequenz</th><th scope="col">Amplitude</th></tr>
      </thead>
      <tbody>
        {#each active as harmonic (harmonic.order)}
          <tr>
            <td>{harmonic.order}</td>
            <td>{harmonic.order}·f₀</td>
            <td>{formatNumber(harmonic.amplitude, 4)}</td>
          </tr>
        {/each}
        <tr><th scope="row">Spitzenwert der Teilsumme</th><td>—</td><td>{formatNumber(peak, 4)}</td></tr>
        <tr><th scope="row">Überschwingen (Sprunghöhe)</th><td>—</td><td>{formatPercentage(overshoot * 100, 2)}</td></tr
        >
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select
      label="Signalform"
      bind:value={shapeValue}
      options={Object.entries(SHAPE_LABELS).map(([value, label]) => ({ value, label }))}
    />
    <Slider
      label="Zahl der Harmonischen n"
      bind:value={harmonicCount}
      min={SYNTHESIS_LIMITS.harmonics.min}
      max={SYNTHESIS_LIMITS.harmonics.max}
      step={1}
      format={(v) => `bis n = ${formatNumber(v, 0)}`}
      unitSymbol="Harmonische"
      ticks={[
        { at: 1, label: '1' },
        { at: 9, label: '9' },
        { at: 25, label: '25' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Mitgerechnete Harmonische"
      value={formatNumber(active.length, 0)}
      emphasis="hero"
      hint="höchste Ordnung n = {formatNumber(active.at(-1)?.order ?? 0, 0)}"
      copyable={false}
    />
    <ResultCard
      label="Amplitude der Grundwelle"
      value={formatNumber(Math.abs(active[0]?.amplitude ?? 0), 4)}
      hint={shape === 'rechteck'
        ? '4/π beim Rechteck'
        : shape === 'dreieck'
          ? '8/π² beim Dreieck'
          : '2/π beim Sägezahn'}
      copyable={false}
    />
    <ResultCard
      label="Überschwingen (Gibbs)"
      value={formatPercentage(overshoot * 100, 1)}
      hint={shape === 'dreieck'
        ? 'stetiger Verlauf — kein Überschwingen'
        : 'bezogen auf die Sprunghöhe; bleibt bei rund 9 %'}
      tone={overshoot > 0.05 ? 'warning' : 'neutral'}
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
