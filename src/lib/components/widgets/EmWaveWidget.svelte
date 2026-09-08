<script lang="ts">
  /**
   * Elektromagnetische Welle: E-Feld und H-Feld stehen senkrecht aufeinander
   * und senkrecht zur Ausbreitungsrichtung. Links die Seitenansicht der
   * laufenden Welle, rechts die Frontansicht mit dem E-Vektor in der Querebene.
   * Gerechnet wird in EmWaveModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatFrequency, formatNumber, formatWavelength, formatDistance } from '$lib/utils/formatting';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import {
    EM_WAVE_LIMITS,
    POLARIZATION_LABELS,
    fieldSamples,
    frontVector,
    fraunhoferDistanceM,
    isIonizing,
    periodS,
    photonEnergyEv,
    reactiveNearFieldM,
    visibleCycles,
    stageLengthM,
    type Polarization
  } from './EmWaveModel';

  /** Dauer einer vollen Schwingung in Echtzeit-Millisekunden (stark verlangsamt) */
  const CYCLE_MS = 3200;
  const SAMPLES = 121;
  const W = 800;
  const H = 260;
  const AXIS_X0 = 60;
  const AXIS_X1 = 560;
  const AXIS_Y = 130;
  const AMP = 62;
  /** Projektion der Tiefenachse z auf den Bildschirm (schräg nach rechts oben) */
  const DEPTH_X = 0.62;
  const DEPTH_Y = 0.42;
  /** Frontansicht rechts */
  const FRONT_CX = 690;
  const FRONT_R = 66;
  /** Jeder wievielte Abtastpunkt bekommt einen Feldpfeil */
  const ARROW_EVERY = 6;
  const SECOND_PREFIXES = [
    { factor: 1, unit: 's' },
    { factor: 1e-3, unit: 'ms' },
    { factor: 1e-6, unit: 'µs' },
    { factor: 1e-9, unit: 'ns' },
    { factor: 1e-12, unit: 'ps' },
    { factor: 1e-15, unit: 'fs' }
  ];

  let frequencyHz = $state<number>(EM_WAVE_LIMITS.frequencyHz.default);
  let apertureM = $state<number>(EM_WAVE_LIMITS.apertureM.default);
  /** Auswahlfeld liefert einen String; die Umsetzung auf den Typ steht hier. */
  let polarizationValue = $state<string>('linear-v');
  const polarization = $derived(polarizationValue as Polarization);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const phaseRad = $derived(((loop.elapsedMs % CYCLE_MS) / CYCLE_MS) * 2 * Math.PI);
  const cycles = $derived(visibleCycles(frequencyHz));
  const samples = $derived(fieldSamples({ cycles, samples: SAMPLES, phaseRad, polarization }));
  const front = $derived(frontVector(phaseRad, polarization));

  const wavelength = $derived(frequencyToWavelength(frequencyHz));
  const period = $derived(periodS(frequencyHz));
  const photonEv = $derived(photonEnergyEv(frequencyHz));
  const ionizing = $derived(isIonizing(frequencyHz));
  const nearFieldM = $derived(reactiveNearFieldM(wavelength));
  const farFieldM = $derived(fraunhoferDistanceM(apertureM, wavelength));

  function px(x: number, depth: number): number {
    return AXIS_X0 + x * (AXIS_X1 - AXIS_X0) + depth * AMP * DEPTH_X;
  }
  function py(vertical: number, depth: number): number {
    return AXIS_Y - vertical * AMP - depth * AMP * DEPTH_Y;
  }
  function path(
    vertical: (s: (typeof samples)[number]) => number,
    depth: (s: (typeof samples)[number]) => number
  ): string {
    return samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${px(s.x, depth(s)).toFixed(1)},${py(vertical(s), depth(s)).toFixed(1)}`)
      .join(' ');
  }
  const arrows = $derived(samples.filter((_, i) => i % ARROW_EVERY === 0));

  /** Zeitdauer mit passender Vorsilbe, z. B. „10 ns". */
  function formatSeconds(seconds: number): string {
    const last = SECOND_PREFIXES[SECOND_PREFIXES.length - 1];
    const scale = SECOND_PREFIXES.find((entry) => seconds >= entry.factor) ?? last;
    return `${formatNumber(seconds / scale.factor, 2)} ${scale.unit}`;
  }
  /** Photonenenergie in eV — über viele Dekaden nur exponentiell lesbar. */
  const photonLabel = $derived(
    photonEv >= 0.001 ? `${formatNumber(photonEv, 3)} eV` : `${photonEv.toExponential(2)} eV`
  );
</script>

<WidgetFrame
  title="E-Feld, H-Feld und Polarisation"
  description="Eine ebene Welle läuft nach rechts: das elektrische Feld schwingt senkrecht, das magnetische Feld senkrecht dazu in die Tiefe. Rechts zeigt die Frontansicht den E-Vektor in der Querebene."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Animation stark verlangsamt; die Feldamplituden sind normiert (H = E / Z₀). Die Zahl der gezeigten Wellenzüge wächst logarithmisch mit der Frequenz — den wahren Maßstab nennt die Länge des Ausschnitts."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Ausbreitungsachse -->
    <line x1={AXIS_X0 - 20} y1={AXIS_Y} x2={AXIS_X1 + 24} y2={AXIS_Y} class="chart-axis-line" />
    <path d="M{AXIS_X1 + 24},{AXIS_Y} l-9,-5 l0,10 Z" fill="var(--color-axis)" />
    <text x={AXIS_X1 + 20} y={AXIS_Y + 22} text-anchor="end" class="chart-axis-text">
      Ausbreitung · Ausschnitt {formatDistance(stageLengthM(frequencyHz), 2)}
    </text>

    <!-- H-Feld (blau, in die Tiefe) -->
    {#each arrows as s, i (i)}
      <line
        x1={px(s.x, 0)}
        y1={py(0, 0)}
        x2={px(s.x, s.hz)}
        y2={py(s.hy, s.hz)}
        stroke="var(--color-chart-blue)"
        stroke-width="1.5"
        opacity="0.75"
      />
    {/each}
    <path
      d={path(
        (s) => s.hy,
        (s) => s.hz
      )}
      fill="none"
      stroke="var(--color-chart-blue)"
      stroke-width="2.5"
    />

    <!-- E-Feld (rot, senkrecht) -->
    {#each arrows as s, i (i)}
      <line
        x1={px(s.x, 0)}
        y1={py(0, 0)}
        x2={px(s.x, s.ez)}
        y2={py(s.ey, s.ez)}
        stroke="var(--color-chart-red)"
        stroke-width="1.5"
        opacity="0.75"
      />
    {/each}
    <path
      d={path(
        (s) => s.ey,
        (s) => s.ez
      )}
      fill="none"
      stroke="var(--color-chart-red)"
      stroke-width="2.5"
    />

    <g transform="translate({AXIS_X0}, 22)">
      <line x1="0" y1="0" x2="22" y2="0" stroke="var(--color-chart-red)" stroke-width="3" />
      <text x="28" y="4" class="chart-legend-text">E-Feld (V/m)</text>
      <line x1="140" y1="0" x2="162" y2="0" stroke="var(--color-chart-blue)" stroke-width="3" />
      <text x="168" y="4" class="chart-legend-text">H-Feld (A/m)</text>
    </g>

    <!-- Frontansicht: Blick entgegen der Ausbreitungsrichtung -->
    <circle cx={FRONT_CX} cy={AXIS_Y} r={FRONT_R} fill="none" class="chart-grid-line" />
    <line x1={FRONT_CX - FRONT_R} y1={AXIS_Y} x2={FRONT_CX + FRONT_R} y2={AXIS_Y} class="chart-grid-line" />
    <line x1={FRONT_CX} y1={AXIS_Y - FRONT_R} x2={FRONT_CX} y2={AXIS_Y + FRONT_R} class="chart-grid-line" />
    <line
      x1={FRONT_CX}
      y1={AXIS_Y}
      x2={FRONT_CX + front.ez * FRONT_R}
      y2={AXIS_Y - front.ey * FRONT_R}
      stroke="var(--color-chart-red)"
      stroke-width="3"
    />
    <circle cx={FRONT_CX + front.ez * FRONT_R} cy={AXIS_Y - front.ey * FRONT_R} r="4" fill="var(--color-chart-red)" />
    <text x={FRONT_CX} y={AXIS_Y + FRONT_R + 22} text-anchor="middle" class="chart-axis-text">
      Frontansicht · {POLARIZATION_LABELS[polarization]}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Wellen-Widgets</caption>
      <tbody>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)}</td></tr>
        <tr><th>Wellenlänge</th><td>{formatWavelength(wavelength, 3)}</td></tr>
        <tr><th>Periodendauer</th><td>{formatSeconds(period)}</td></tr>
        <tr><th>Photonenenergie</th><td>{photonLabel}</td></tr>
        <tr><th>Strahlungsart</th><td>{ionizing ? 'ionisierend' : 'nicht ionisierend'}</td></tr>
        <tr><th>Polarisation</th><td>{POLARIZATION_LABELS[polarization]}</td></tr>
        <tr><th>Reaktives Nahfeld bis</th><td>{formatDistance(nearFieldM, 3)}</td></tr>
        <tr><th>Fernfeld ab (2·D²/λ)</th><td>{formatDistance(farFieldM, 2)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Frequenz f"
      bind:value={frequencyHz}
      min={EM_WAVE_LIMITS.frequencyHz.min}
      max={EM_WAVE_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Antennendurchmesser D"
      bind:value={apertureM}
      min={EM_WAVE_LIMITS.apertureM.min}
      max={EM_WAVE_LIMITS.apertureM.max}
      scale="log"
      format={(v) => formatDistance(v, 2)}
      unitSymbol="m"
    />
    <Select
      label="Polarisation"
      bind:value={polarizationValue}
      options={Object.entries(POLARIZATION_LABELS).map(([value, label]) => ({ value, label }))}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard label="Wellenlänge λ = c/f" value={formatWavelength(wavelength, 3)} copyable={false} />
    <ResultCard label="Periodendauer T = 1/f" value={formatSeconds(period)} copyable={false} />
    <ResultCard
      label="Photonenenergie E = h·f"
      value={photonLabel}
      hint={ionizing ? 'ionisierend (λ < 100 nm)' : 'nicht ionisierend'}
      tone={ionizing ? 'warning' : 'success'}
      copyable={false}
    />
    <ResultCard
      label="Fernfeld ab 2·D²/λ"
      value={formatDistance(farFieldM, 2)}
      hint="Nahfeld bis λ/2π = {formatDistance(nearFieldM, 3)}"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
