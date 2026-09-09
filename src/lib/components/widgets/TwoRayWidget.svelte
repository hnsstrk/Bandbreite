<script lang="ts">
  /**
   * Zweiwege-Ausbreitung: direkte und bodenreflektierte Welle überlagern sich.
   * Oben der Seitenriss der Strecke, darunter die Dämpfung über dem Abstand
   * mit Einbrüchen, Bruchdistanz und dem Übergang zum d⁴-Gesetz.
   * Gerechnet wird in TwoRayModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import {
    formatDistance,
    formatFrequency,
    formatNumber,
    formatPowerDb,
    formatWavelength
  } from '$lib/utils/formatting';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { clamp, safeLog } from '$lib/utils/handlers';
  import { TWO_RAY_LIMITS, breakpointDistanceM, twoRayAt, twoRayCurve, twoRayPathLossDb } from './TwoRayModel';

  const W = 800;
  const H = 300;
  /** Seitenriss oben */
  const SCENE_X0 = 60;
  const SCENE_X1 = 760;
  const GROUND_Y = 96;
  const SCENE_SCALE = 0.55;
  /** Diagramm unten */
  const PX0 = 60;
  const PX1 = 760;
  const PY0 = 140;
  const PY1 = 264;

  let txHeightM = $state<number>(TWO_RAY_LIMITS.txHeightM.default);
  let rxHeightM = $state<number>(TWO_RAY_LIMITS.rxHeightM.default);
  let frequencyHz = $state<number>(TWO_RAY_LIMITS.frequencyHz.default);
  let distanceM = $state<number>(TWO_RAY_LIMITS.distanceM.default);

  const wavelengthM = $derived(frequencyToWavelength(frequencyHz));
  const point = $derived(twoRayAt(distanceM, frequencyHz, txHeightM, rxHeightM));
  const breakpoint = $derived(breakpointDistanceM(txHeightM, rxHeightM, wavelengthM));
  const curve = $derived(
    twoRayCurve(frequencyHz, txHeightM, rxHeightM, TWO_RAY_LIMITS.distanceM.min, TWO_RAY_LIMITS.distanceM.max)
  );
  const lossRange = $derived({
    min: Math.min(...curve.map((p) => p.fsplDb)) - 8,
    max: Math.max(...curve.map((p) => Math.min(p.totalLossDb, p.fsplDb + 60)))
  });

  function px(d: number): number {
    const span = safeLog(TWO_RAY_LIMITS.distanceM.max / TWO_RAY_LIMITS.distanceM.min, 10, 1);
    return PX0 + clamp(safeLog(d / TWO_RAY_LIMITS.distanceM.min, 10, 0) / span, 0, 1) * (PX1 - PX0);
  }
  function py(lossDb: number): number {
    const span = Math.max(1, lossRange.max - lossRange.min);
    return PY0 + clamp((lossDb - lossRange.min) / span, 0, 1) * (PY1 - PY0);
  }
  const totalPath = $derived(
    curve
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'}${px(p.distanceM).toFixed(1)},${py(Math.min(p.totalLossDb, lossRange.max)).toFixed(1)}`
      )
      .join(' ')
  );
  const fsplPath = $derived(
    curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.distanceM).toFixed(1)},${py(p.fsplDb).toFixed(1)}`).join(' ')
  );
  const asymptotePath = $derived(
    curve
      .filter((p) => p.distanceM >= breakpoint)
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'}${px(p.distanceM).toFixed(1)},${py(twoRayPathLossDb(p.distanceM, txHeightM, rxHeightM)).toFixed(1)}`
      )
      .join(' ')
  );

  /** Seitenriss: Höhen überhöht, Abstand fest — schematisch. */
  const txY = $derived(GROUND_Y - txHeightM * SCENE_SCALE);
  const rxY = $derived(GROUND_Y - rxHeightM * SCENE_SCALE);
  const reflectX = $derived(SCENE_X0 + ((SCENE_X1 - SCENE_X0) * txHeightM) / Math.max(1, txHeightM + rxHeightM));
  /** Beschriftung des Reflexionspunkts innerhalb der Bühne halten. */
  const labelX = $derived(clamp(reflectX, SCENE_X0 + 130, SCENE_X1 - 130));
  const decades = [10, 100, 1000, 10_000];
</script>

<WidgetFrame
  title="Zweiwege-Ausbreitung und Mehrwegeschwund"
  description="Oben der Seitenriss: eine direkte und eine am Boden reflektierte Welle erreichen den Empfänger. Unten die Dämpfung über dem Abstand — vor der Bruchdistanz wechseln sich Gipfel und tiefe Einbrüche ab, dahinter fällt der Pegel doppelt so steil wie im Freiraum."
  stacked
  footnote="Seitenriss schematisch, Höhen stark überhöht. Reflexionsfaktor Γ = −1 (streifender Einfall, gut leitender Boden); Modell nach Rappaport, Wireless Communications, Abschnitt 4.6."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Seitenriss -->
    <line
      x1={SCENE_X0 - 20}
      y1={GROUND_Y}
      x2={SCENE_X1 + 20}
      y2={GROUND_Y}
      stroke="var(--color-ink-muted)"
      stroke-width="2"
    />
    <line x1={SCENE_X0} y1={GROUND_Y} x2={SCENE_X0} y2={txY} stroke="var(--color-ink)" stroke-width="3" />
    <line x1={SCENE_X1} y1={GROUND_Y} x2={SCENE_X1} y2={rxY} stroke="var(--color-ink)" stroke-width="3" />
    <line x1={SCENE_X0} y1={txY} x2={SCENE_X1} y2={rxY} stroke="var(--color-series-1)" stroke-width="2.5" />
    <line x1={SCENE_X0} y1={txY} x2={reflectX} y2={GROUND_Y} stroke="var(--color-series-3)" stroke-width="2" />
    <line x1={reflectX} y1={GROUND_Y} x2={SCENE_X1} y2={rxY} stroke="var(--color-series-3)" stroke-width="2" />
    <circle cx={reflectX} cy={GROUND_Y} r="4" fill="var(--color-series-3)" />
    <text x={SCENE_X0 + 6} y={txY - 8} class="chart-axis-text">Sender h_t = {formatDistance(txHeightM, 0)}</text>
    <text x={SCENE_X1 - 6} y={rxY - 10} text-anchor="end" class="chart-axis-text"
      >Empfänger h_r = {formatDistance(rxHeightM, 0)}</text
    >
    <text x={labelX} y={GROUND_Y + 18} text-anchor="middle" class="chart-legend-text">
      Reflexion · Δ = {formatWavelength(point.paths.deltaM, 3)} · Δφ = {formatNumber(
        (point.phaseRad * 180) / Math.PI,
        0
      )}°
    </text>

    <!-- Dämpfungskurve -->
    <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} class="chart-axis-line" />
    <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} class="chart-axis-line" />
    {#each decades as value (value)}
      <line x1={px(value)} y1={PY0} x2={px(value)} y2={PY1} class="chart-grid-line" />
      <text x={px(value)} y={PY1 + 16} text-anchor="middle" class="chart-axis-text">{formatDistance(value, 0)}</text>
    {/each}
    <path d={fsplPath} fill="none" stroke="var(--color-ink-subtle)" stroke-width="1.5" stroke-dasharray="5 4" />
    <path d={asymptotePath} fill="none" stroke="var(--color-series-4)" stroke-width="1.5" stroke-dasharray="2 4" />
    <path d={totalPath} fill="none" stroke="var(--color-series-2)" stroke-width="2" />
    {#if breakpoint > TWO_RAY_LIMITS.distanceM.min && breakpoint < TWO_RAY_LIMITS.distanceM.max}
      <line
        x1={px(breakpoint)}
        y1={PY0}
        x2={px(breakpoint)}
        y2={PY1}
        stroke="var(--color-series-6)"
        stroke-width="1.5"
      />
      <text x={px(breakpoint) + 6} y={PY0 + 14} class="chart-legend-text">d_b = {formatDistance(breakpoint, 0)}</text>
    {/if}
    <line x1={px(distanceM)} y1={PY0} x2={px(distanceM)} y2={PY1} stroke="var(--color-marker)" stroke-width="1.5" />
    <text x={PX0} y={PY0 - 8} class="chart-axis-text">Pfaddämpfung in dB</text>
    <text x={PX1} y={PY1 + 32} text-anchor="end" class="chart-axis-text">Abstand d (logarithmisch)</text>
    <g transform="translate({PX0 + 170}, {PY0 - 8})">
      <line x1="0" y1="-4" x2="18" y2="-4" stroke="var(--color-series-2)" stroke-width="2" />
      <text x="24" y="0" class="chart-legend-text">Zweiwege</text>
      <line
        x1="100"
        y1="-4"
        x2="118"
        y2="-4"
        stroke="var(--color-ink-subtle)"
        stroke-width="2"
        stroke-dasharray="5 4"
      />
      <text x="124" y="0" class="chart-legend-text">Freiraum (20 dB/Dekade)</text>
      <line x1="280" y1="-4" x2="298" y2="-4" stroke="var(--color-series-4)" stroke-width="2" stroke-dasharray="2 4" />
      <text x="304" y="0" class="chart-legend-text">d⁴-Näherung (40 dB/Dekade)</text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Zweiwege-Ausbreitung bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)} (λ = {formatWavelength(wavelengthM, 3)})</td></tr>
        <tr><th>Antennenhöhen</th><td>{formatDistance(txHeightM, 0)} / {formatDistance(rxHeightM, 0)}</td></tr>
        <tr><th>Abstand d</th><td>{formatDistance(distanceM, 0)}</td></tr>
        <tr><th>Direkter Weg</th><td>{formatDistance(point.paths.directM, 2)}</td></tr>
        <tr><th>Reflektierter Weg</th><td>{formatDistance(point.paths.reflectedM, 2)}</td></tr>
        <tr><th>Laufwegunterschied Δ</th><td>{formatWavelength(point.paths.deltaM, 3)}</td></tr>
        <tr><th>Phasendifferenz Δφ</th><td>{formatNumber((point.phaseRad * 180) / Math.PI, 1)}°</td></tr>
        <tr><th>Freiraumdämpfung</th><td>{formatPowerDb(point.fsplDb, 1)}</td></tr>
        <tr><th>Gesamtdämpfung</th><td>{formatPowerDb(point.totalLossDb, 1)}</td></tr>
        <tr><th>Abweichung vom Freiraum</th><td>{formatPowerDb(point.relativeDb, 1, true)}</td></tr>
        <tr><th>Bruchdistanz d_b</th><td>{formatDistance(breakpoint, 0)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Sendeantennenhöhe h_t"
      bind:value={txHeightM}
      min={TWO_RAY_LIMITS.txHeightM.min}
      max={TWO_RAY_LIMITS.txHeightM.max}
      step={1}
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
    <Slider
      label="Empfangsantennenhöhe h_r"
      bind:value={rxHeightM}
      min={TWO_RAY_LIMITS.rxHeightM.min}
      max={TWO_RAY_LIMITS.rxHeightM.max}
      step={0.5}
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
    <Slider
      label="Frequenz f"
      bind:value={frequencyHz}
      min={TWO_RAY_LIMITS.frequencyHz.min}
      max={TWO_RAY_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Abstand d"
      bind:value={distanceM}
      min={TWO_RAY_LIMITS.distanceM.min}
      max={TWO_RAY_LIMITS.distanceM.max}
      scale="log"
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Abweichung vom Freiraum"
      value={formatPowerDb(point.relativeDb, 1, true)}
      emphasis="hero"
      tone={point.relativeDb > 0 ? 'success' : point.relativeDb > -10 ? 'warning' : 'danger'}
      hint="20·log₁₀|1 + Γ·e^(−jΔφ)|"
      copyable={false}
    />
    <ResultCard label="Gesamtdämpfung" value={formatPowerDb(point.totalLossDb, 1)} copyable={false} />
    <ResultCard
      label="Bruchdistanz d_b = 4·h_t·h_r/λ"
      value={formatDistance(breakpoint, 0)}
      hint={distanceM > breakpoint ? 'dahinter: 40 dB je Dekade' : 'davor: Gipfel und Einbrüche'}
      copyable={false}
    />
    <ResultCard label="Laufwegunterschied Δ" value={formatWavelength(point.paths.deltaM, 3)} copyable={false} />
  {/snippet}
</WidgetFrame>
