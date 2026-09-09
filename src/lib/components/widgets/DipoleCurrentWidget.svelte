<script lang="ts">
  /**
   * Strom und Spannung auf einem mittengespeisten Dipol: die stehende Welle
   * schwingt, Strom und Spannung sind um 90° versetzt. Der Regler ändert die
   * Drahtlänge in Wellenlängen. Gerechnet wird in DipoleCurrentModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber, formatPercentage } from '$lib/utils/formatting';
  import {
    DIPOLE_LIMITS,
    HALF_WAVE_RESISTANCE_OHM,
    dipoleSamples,
    feedCurrentFraction,
    feedImpedanceNote,
    shortDipoleResistanceOhm
  } from './DipoleCurrentModel';

  const W = 800;
  const H = 250;
  const CX = 400;
  const WIRE_Y = 132;
  /** Bildbreite je Wellenlänge Drahtlänge */
  const PX_PER_LAMBDA = 420;
  const AMP = 62;
  /** Dauer einer vollen Schwingung (ms) */
  const CYCLE_MS = 2800;

  let lengthWavelengths = $state<number>(DIPOLE_LIMITS.lengthWavelengths.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const omegaT = $derived(((loop.elapsedMs % CYCLE_MS) / CYCLE_MS) * 2 * Math.PI);
  const samples = $derived(dipoleSamples(lengthWavelengths));
  const feedFraction = $derived(feedCurrentFraction(lengthWavelengths));
  const shortResistance = $derived(shortDipoleResistanceOhm(lengthWavelengths));
  const note = $derived(feedImpedanceNote(lengthWavelengths));
  /** Momentanfaktoren der stehenden Welle: Strom cos(ωt), Spannung sin(ωt). */
  const currentPhase = $derived(Math.cos(omegaT));
  const voltagePhase = $derived(Math.sin(omegaT));

  function wx(zWavelengths: number): number {
    return CX + zWavelengths * PX_PER_LAMBDA;
  }
  function envelope(select: (s: (typeof samples)[number]) => number, scale: number): string {
    return samples
      .map(
        (s, i) =>
          `${i === 0 ? 'M' : 'L'}${wx(s.zWavelengths).toFixed(1)},${(WIRE_Y - select(s) * AMP * scale).toFixed(1)}`
      )
      .join(' ');
  }
  const halfLength = $derived(lengthWavelengths / 2);
</script>

<WidgetFrame
  title="Dipol: Strom und Spannung auf dem Draht"
  description="Ein mittengespeister Dipol mit der stehenden Welle darauf: Der Strom wird an den Drahtenden immer null, die Spannung hat dort ihren Bauch. Beide sind um 90 Grad versetzt und schwingen im Takt der Trägerfrequenz. Beim Halbwellendipol liegt im Speisepunkt ein Strombauch, beim Ganzwellendipol ein Stromknoten."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  stacked
  footnote="Sinusförmige Stromnäherung des dünnen Dipols (Balanis, Kap. 4.5); Strom auf sein Maximum normiert, Spannung schematisch. Der reale Fußpunktwiderstand hängt zusätzlich von Drahtdurchmesser und Umgebung ab."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1="40" y1={WIRE_Y} x2={W - 40} y2={WIRE_Y} class="chart-grid-line" />

    <!-- Hüllkurven -->
    <path
      d={envelope((s) => s.voltage, 0.8)}
      fill="none"
      stroke="var(--color-series-4)"
      stroke-width="1.5"
      stroke-dasharray="5 4"
    />
    <path
      d={envelope((s) => -s.voltage, 0.8)}
      fill="none"
      stroke="var(--color-series-4)"
      stroke-width="1.5"
      stroke-dasharray="5 4"
    />
    <path
      d={envelope((s) => s.current, 1)}
      fill="none"
      stroke="var(--color-series-1)"
      stroke-width="1.5"
      stroke-dasharray="3 3"
    />
    <path
      d={envelope((s) => -s.current, 1)}
      fill="none"
      stroke="var(--color-series-1)"
      stroke-width="1.5"
      stroke-dasharray="3 3"
    />

    <!-- Momentanwerte -->
    <path
      d={envelope((s) => s.voltage * voltagePhase, 0.8)}
      fill="none"
      stroke="var(--color-series-4)"
      stroke-width="2.5"
    />
    <path
      d={envelope((s) => s.current * currentPhase, 1)}
      fill="none"
      stroke="var(--color-series-1)"
      stroke-width="3"
    />

    <!-- Draht und Speisepunkt -->
    <line x1={wx(-halfLength)} y1={WIRE_Y} x2={wx(-0.006)} y2={WIRE_Y} stroke="var(--color-ink)" stroke-width="5" />
    <line x1={wx(0.006)} y1={WIRE_Y} x2={wx(halfLength)} y2={WIRE_Y} stroke="var(--color-ink)" stroke-width="5" />
    <circle cx={CX} cy={WIRE_Y} r="5" fill="var(--color-series-6)" />
    <line x1={CX - 10} y1={WIRE_Y + 8} x2={CX - 10} y2={WIRE_Y + 34} stroke="var(--color-ink-muted)" stroke-width="2" />
    <line x1={CX + 10} y1={WIRE_Y + 8} x2={CX + 10} y2={WIRE_Y + 34} stroke="var(--color-ink-muted)" stroke-width="2" />
    <text x={CX} y={WIRE_Y + 50} text-anchor="middle" class="chart-axis-text">Speisepunkt</text>
    <text x={wx(-halfLength)} y={WIRE_Y - 8} text-anchor="middle" class="chart-legend-text">Ende</text>
    <text x={wx(halfLength)} y={WIRE_Y - 8} text-anchor="middle" class="chart-legend-text">Ende</text>
    <text x={CX} y={H - 10} text-anchor="middle" class="chart-axis-text">
      Drahtlänge L = {formatNumber(lengthWavelengths, 2)}·λ
    </text>

    <g transform="translate(50, 26)">
      <line x1="0" y1="0" x2="20" y2="0" stroke="var(--color-series-1)" stroke-width="3" />
      <text x="26" y="4" class="chart-legend-text">Strom I(z)</text>
      <line x1="130" y1="0" x2="150" y2="0" stroke="var(--color-series-4)" stroke-width="3" />
      <text x="156" y="4" class="chart-legend-text">Spannung U(z) — um 90° versetzt</text>
      <line x1="400" y1="0" x2="420" y2="0" stroke="var(--color-series-1)" stroke-width="2" stroke-dasharray="3 3" />
      <text x="426" y="4" class="chart-legend-text">Hüllkurve der stehenden Welle</text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Strom- und Spannungsverteilung des Dipols</caption>
      <tbody>
        <tr><th>Drahtlänge</th><td>{formatNumber(lengthWavelengths, 2)}·λ</td></tr>
        <tr><th>Halbe Länge (je Schenkel)</th><td>{formatNumber(halfLength, 3)}·λ</td></tr>
        <tr><th>Strom im Speisepunkt</th><td>{formatPercentage(feedFraction * 100, 1)} des Maximums</td></tr>
        <tr><th>Fußpunkt</th><td>{note}</td></tr>
        <tr>
          <th>Strahlungswiderstand</th>
          <td>
            {lengthWavelengths <= 0.1
              ? `${formatNumber(shortResistance, 2)} Ω (kurzer Dipol, 20·π²·(L/λ)²)`
              : `beim λ/2-Dipol ${formatNumber(HALF_WAVE_RESISTANCE_OHM, 1)} Ω`}
          </td>
        </tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Drahtlänge L in Wellenlängen"
      bind:value={lengthWavelengths}
      min={DIPOLE_LIMITS.lengthWavelengths.min}
      max={DIPOLE_LIMITS.lengthWavelengths.max}
      step={0.01}
      format={(v) => `${formatNumber(v, 2)}·λ`}
      unitSymbol="Wellenlängen"
      ticks={[
        { at: 0.25, label: 'λ/4' },
        { at: 0.5, label: 'λ/2' },
        { at: 1, label: 'λ' },
        { at: 1.5, label: '3λ/2' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Strom im Speisepunkt"
      value={formatPercentage(feedFraction * 100, 1)}
      emphasis="hero"
      tone={feedFraction > 0.9 ? 'success' : feedFraction > 0.4 ? 'warning' : 'danger'}
      hint="bezogen auf das Strommaximum"
      copyable={false}
    />
    <ResultCard
      label="Fußpunktimpedanz"
      value={feedFraction > 0.9 ? 'niedrig' : feedFraction > 0.4 ? 'mittel' : 'sehr hoch'}
      hint={note}
      copyable={false}
    />
    <ResultCard
      label="Strahlungswiderstand λ/2-Dipol"
      value={formatNumber(HALF_WAVE_RESISTANCE_OHM, 1)}
      unit="Ω"
      hint="kurzer Dipol: 20·π²·(L/λ)² = {formatNumber(shortResistance, 2)} Ω"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
