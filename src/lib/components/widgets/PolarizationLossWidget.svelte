<script lang="ts">
  /**
   * Polarisationsverlust: Zwei lineare Antennen, um den Winkel α verdreht,
   * übertragen nur cos²α der Leistung. Links die Projektion des E-Vektors,
   * rechts die Verlustkurve. Gerechnet wird in PolarizationLossModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber, formatPowerDb } from '$lib/utils/formatting';
  import {
    TILT_LIMITS,
    circularLossDb,
    lossCurve,
    projectedFieldFactor,
    tiltResult,
    toRadians
  } from './PolarizationLossModel';

  const W = 800;
  const H = 240;
  /** Linke Bühne: gekreuzte Antennen */
  const CX = 170;
  const CY = 120;
  const R = 82;
  /** Rechte Bühne: Verlustkurve */
  const PX0 = 400;
  const PX1 = 770;
  const PY0 = 44;
  const PY1 = 196;
  /** Höchster dargestellter Verlust in dB */
  const MAX_DB = 20;

  let angleDeg = $state<number>(TILT_LIMITS.angleDeg.default);
  /** Auswahlfeld liefert einen String; die Umsetzung steht hier. */
  let receiverKind = $state<string>('linear');

  const circular = $derived(receiverKind === 'zirkular');
  const result = $derived(tiltResult(angleDeg));
  const lossDb = $derived(circular ? circularLossDb() : result.lossDb);
  const projection = $derived(projectedFieldFactor(angleDeg));
  const curve = $derived(lossCurve());

  /** Endpunkt der Empfangsantenne, um α gegen die Senkrechte gedreht. */
  const tilt = $derived({
    x: CX + Math.sin(toRadians(angleDeg)) * R,
    y: CY - Math.cos(toRadians(angleDeg)) * R
  });
  /** Fußpunkt der Projektion des empfangenen Feldanteils auf die Senkrechte. */
  const projectedY = $derived(CY - projection * R);

  function px(deg: number): number {
    return PX0 + (deg / TILT_LIMITS.angleDeg.max) * (PX1 - PX0);
  }
  function py(db: number): number {
    return PY1 - (Math.min(db, MAX_DB) / MAX_DB) * (PY1 - PY0);
  }
  const curvePath = $derived(
    curve
      .map((point, i) => `${i === 0 ? 'M' : 'L'}${px(point.angleDeg).toFixed(1)},${py(point.lossDb).toFixed(1)}`)
      .join(' ')
  );
</script>

<WidgetFrame
  title="Polarisationsverlust bei Verdrehung"
  description="Links stehen Sende- und Empfangsantenne übereinander; die Empfangsantenne ist um den Winkel Alpha verdreht, der nutzbare Feldanteil ist ihre Projektion auf die Senderichtung. Rechts steigt die Verlustkurve von 0 dB bei 0 Grad über 3 dB bei 45 Grad steil an, bis sie bei 90 Grad die praktische Entkopplungsgrenze erreicht."
  footnote="Bei 90° ist der Verlust theoretisch unendlich; reale Antennen erreichen 20 bis 30 dB Kreuzpolarisationsentkopplung — die Kurve ist deshalb bei 20 dB gedeckelt (IEEE Std 145)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Gekreuzte Antennen -->
    <circle cx={CX} cy={CY} r={R} fill="none" class="chart-grid-line" />
    <line x1={CX - R - 14} y1={CY} x2={CX + R + 14} y2={CY} class="chart-grid-line" />
    <line x1={CX} y1={CY - R - 14} x2={CX} y2={CY + R + 14} class="chart-axis-line" />
    <line x1={CX} y1={CY + R} x2={CX} y2={CY - R} stroke="var(--color-series-6)" stroke-width="5" />
    <text x={CX + 8} y={CY - R - 4} class="chart-legend-text">Sendeantenne (E-Vektor)</text>

    {#if circular}
      <circle
        cx={CX}
        cy={CY}
        r={R * 0.72}
        fill="none"
        stroke="var(--color-series-4)"
        stroke-width="4"
        stroke-dasharray="8 6"
      />
      <text x={CX} y={CY + R + 30} text-anchor="middle" class="chart-axis-text">
        zirkulare Empfangsantenne — Verlust unabhängig vom Winkel
      </text>
    {:else}
      <line
        x1={CX - (tilt.x - CX)}
        y1={CY - (tilt.y - CY)}
        x2={tilt.x}
        y2={tilt.y}
        stroke="var(--color-series-1)"
        stroke-width="5"
      />
      <line
        x1={CX}
        y1={projectedY}
        x2={tilt.x}
        y2={tilt.y}
        stroke="var(--color-ink-muted)"
        stroke-width="1.5"
        stroke-dasharray="4 3"
      />
      <line x1={CX} y1={CY} x2={CX} y2={projectedY} stroke="var(--color-series-2)" stroke-width="4" />
      <text x={CX + 8} y={CY + R + 30} text-anchor="middle" class="chart-axis-text">
        α = {formatNumber(angleDeg, 0)}° · nutzbarer Anteil cos α = {formatNumber(projection, 3)}
      </text>
    {/if}

    <g transform="translate(30, 214)">
      <line x1="0" y1="0" x2="20" y2="0" stroke="var(--color-series-6)" stroke-width="4" />
      <text x="26" y="4" class="chart-legend-text">Sendepolarisation</text>
      <line x1="150" y1="0" x2="170" y2="0" stroke="var(--color-series-1)" stroke-width="4" />
      <text x="176" y="4" class="chart-legend-text">Empfangspolarisation</text>
    </g>

    <!-- Verlustkurve -->
    <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} class="chart-axis-line" />
    <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} class="chart-axis-line" />
    {#each [0, 3, 6, 10, 20] as db (db)}
      <line x1={PX0} y1={py(db)} x2={PX1} y2={py(db)} class="chart-grid-line" />
      <text x={PX0 - 6} y={py(db) + 4} text-anchor="end" class="chart-axis-text">{db} dB</text>
    {/each}
    {#each [0, 30, 45, 60, 90] as deg (deg)}
      <line x1={px(deg)} y1={PY1} x2={px(deg)} y2={PY1 + 5} class="chart-axis-line" />
      <text x={px(deg)} y={PY1 + 19} text-anchor="middle" class="chart-axis-text">{deg}°</text>
    {/each}
    <path d={curvePath} fill="none" stroke="var(--color-series-3)" stroke-width="2.5" />
    <line x1={px(angleDeg)} y1={PY0} x2={px(angleDeg)} y2={PY1} stroke="var(--color-marker)" stroke-width="1.5" />
    <circle cx={px(angleDeg)} cy={py(result.lossDb)} r="5" fill="var(--color-marker)" />
    <text x={PX1} y={PY0 - 10} text-anchor="end" class="chart-axis-text">Verlust L = −20·log₁₀(cos α)</text>
    <text x={PX1} y={PY1 + 34} text-anchor="end" class="chart-axis-text">Verdrehungswinkel α</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Polarisationsverlust bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Empfangsantenne</th><td>{circular ? 'zirkular' : 'linear, verdreht'}</td></tr>
        <tr><th>Verdrehungswinkel α</th><td>{formatNumber(angleDeg, 0)}°</td></tr>
        <tr><th>Feldanteil cos α</th><td>{formatNumber(projection, 3)}</td></tr>
        <tr><th>Leistungsanteil cos²α</th><td>{formatNumber(result.percent, 1)} %</td></tr>
        <tr><th>Verlust</th><td>{formatPowerDb(lossDb, 2)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select
      label="Empfangsantenne"
      bind:value={receiverKind}
      options={[
        { value: 'linear', label: 'linear (verdrehbar)' },
        { value: 'zirkular', label: 'zirkular (RHCP/LHCP)' }
      ]}
    />
    <Slider
      label="Verdrehungswinkel α"
      bind:value={angleDeg}
      min={TILT_LIMITS.angleDeg.min}
      max={TILT_LIMITS.angleDeg.max}
      step={1}
      disabled={circular}
      format={(v) => `${formatNumber(v, 0)}°`}
      unitSymbol="Grad"
      ticks={[
        { at: 0, label: '0°' },
        { at: 45, label: '45°' },
        { at: 90, label: '90°' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Polarisationsverlust"
      value={formatPowerDb(lossDb, 2)}
      emphasis="hero"
      tone={lossDb < 1 ? 'success' : lossDb < 6 ? 'warning' : 'danger'}
      hint={circular
        ? 'linear ↔ zirkular: immer 3,01 dB'
        : result.capped
          ? 'nur durch die Entkopplung realer Antennen begrenzt'
          : 'L = −10·log₁₀(cos²α)'}
      copyable={false}
    />
    <ResultCard
      label="Ankommende Leistung"
      value={formatNumber(circular ? 50 : result.percent, 1)}
      unit="%"
      hint="Rest steckt in der falschen Komponente"
      copyable={false}
    />
    <ResultCard
      label="Feldanteil cos α"
      value={formatNumber(circular ? Math.SQRT1_2 : projection, 3)}
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
