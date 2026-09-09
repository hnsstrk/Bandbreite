<script lang="ts">
  /**
   * Radargleichung interaktiv: R_max über der Sendeleistung.
   * Die Kurve macht die vierte Wurzel sichtbar — 16-fache Leistung bringt
   * doppelte Reichweite. Rechnung in RadarRangeModel.ts (Formeln aus
   * $lib/utils/radar, Skolnik Gl. 1.7).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import {
    formatDistance,
    formatFrequency,
    formatNumber,
    formatPowerDbm,
    formatPowerWatts,
    formatRcs
  } from '$lib/utils/formatting';
  import {
    computeRadarRange,
    powerFraction,
    radarRangeCurve,
    rangeScaling,
    RADAR_RANGE_DOUBLING_FACTOR,
    RADAR_RANGE_FREQUENCY_HZ,
    RADAR_RANGE_LIMITS,
    RADAR_RANGE_LOSS_DB
  } from './RadarRangeModel';

  const W = 800;
  const H = 280;
  const PAD = { left: 62, right: 20, top: 20, bottom: 40 };
  const PLOT_W = W - PAD.left - PAD.right;
  const PLOT_H = H - PAD.top - PAD.bottom;
  /** Stützstellen der Kurve */
  const POINTS = 61;
  /** Beschriftete Leistungsmarken der x-Achse in W */
  const POWER_TICKS = [1e3, 1e4, 1e5, 1e6, 5e6];

  let txPowerW = $state<number>(RADAR_RANGE_LIMITS.txPowerW.default);
  let antennaGainDbi = $state<number>(RADAR_RANGE_LIMITS.antennaGainDbi.default);
  let rcsM2 = $state<number>(RADAR_RANGE_LIMITS.rcsM2.default);
  let minPowerDbm = $state<number>(RADAR_RANGE_LIMITS.minPowerDbm.default);

  const input = $derived({ txPowerW, antennaGainDbi, rcsM2, minPowerDbm });
  const result = $derived(computeRadarRange(input));
  const curve = $derived(radarRangeCurve(input, POINTS));
  const maxRangeM = $derived(curve.length ? curve[curve.length - 1].rangeM : result.rangeM);

  const x = (fraction: number) => PAD.left + fraction * PLOT_W;
  const y = (rangeM: number) => PAD.top + PLOT_H - (maxRangeM > 0 ? rangeM / maxRangeM : 0) * PLOT_H;

  const path = $derived(
    curve.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(powerFraction(point.txPowerW))},${y(point.rangeM)}`).join(' ')
  );
  const markerX = $derived(x(powerFraction(txPowerW)));
  const markerY = $derived(y(result.rangeM));
  /** Reichweite bei 16-facher Leistung, sofern sie noch auf die Achse passt */
  const doubledInRange = $derived(result.powerForDoubleRangeW <= RADAR_RANGE_LIMITS.txPowerW.max);
  const doubledX = $derived(x(powerFraction(result.powerForDoubleRangeW)));
  const doubledY = $derived(y(result.rangeM * 2));

  const km = (m: number) => formatNumber(m / 1000, 0);
</script>

<WidgetFrame
  title="Radargleichung: Reichweite über Sendeleistung"
  description="Kurve der maximalen Radarreichweite über der Sendeleistung. Sie steigt nur mit der vierten Wurzel: Sechzehnfache Leistung verdoppelt die Reichweite."
  footnote="Gerechnet für {formatFrequency(
    RADAR_RANGE_FREQUENCY_HZ,
    1
  )} (S-Band, IEEE Std 521), Systemverluste L = {formatNumber(
    RADAR_RANGE_LOSS_DB,
    0
  )} dB. R_max = ⁴√(P_t·G²·λ²·σ / ((4π)³·P_min·L)) nach Skolnik, Gl. 1.7."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={W - PAD.right} y2={PAD.top + PLOT_H} class="chart-axis-line" />
    <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} class="chart-axis-line" />

    {#each POWER_TICKS as tick (tick)}
      <line
        x1={x(powerFraction(tick))}
        y1={PAD.top}
        x2={x(powerFraction(tick))}
        y2={PAD.top + PLOT_H}
        class="chart-grid-line"
      />
      <text x={x(powerFraction(tick))} y={PAD.top + PLOT_H + 16} text-anchor="middle" class="chart-axis-text">
        {formatPowerWatts(tick, 0)}
      </text>
    {/each}

    {#each [0.25, 0.5, 0.75, 1] as share (share)}
      <line
        x1={PAD.left}
        y1={y(maxRangeM * share)}
        x2={W - PAD.right}
        y2={y(maxRangeM * share)}
        class="chart-grid-line"
      />
      <text x={PAD.left - 8} y={y(maxRangeM * share) + 4} text-anchor="end" class="chart-axis-text">
        {km(maxRangeM * share)}
      </text>
    {/each}

    <text x={PAD.left + 2} y={PAD.top - 6} class="chart-axis-text">Reichweite in km</text>
    <text x={W - PAD.right} y={H - 8} text-anchor="end" class="chart-axis-text"
      >Sendeleistung P_t (logarithmisch) →</text
    >

    <path d={path} fill="none" stroke="var(--color-series-1)" stroke-width="2.5" />

    <!-- Arbeitspunkt -->
    <line
      x1={markerX}
      y1={markerY}
      x2={markerX}
      y2={PAD.top + PLOT_H}
      stroke="var(--color-marker)"
      stroke-dasharray="4 4"
    />
    <line x1={PAD.left} y1={markerY} x2={markerX} y2={markerY} stroke="var(--color-marker)" stroke-dasharray="4 4" />
    <circle cx={markerX} cy={markerY} r="6" fill="var(--color-marker)" />
    <text x={markerX + 10} y={markerY - 8} class="chart-legend-text">R_max = {formatDistance(result.rangeM, 0)}</text>

    {#if doubledInRange && result.rangeM * 2 <= maxRangeM}
      <circle cx={doubledX} cy={doubledY} r="5" fill="none" stroke="var(--color-series-3)" stroke-width="2.5" />
      <text x={doubledX - 10} y={doubledY - 10} text-anchor="end" class="chart-legend-text">
        ×{formatNumber(RADAR_RANGE_DOUBLING_FACTOR, 0)} Leistung → doppelte Reichweite
      </text>
    {/if}
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte der Radargleichung</caption>
      <tbody>
        <tr><th>Sendeleistung P_t</th><td>{formatPowerWatts(txPowerW, 0)}</td></tr>
        <tr><th>Antennengewinn G</th><td>{formatNumber(antennaGainDbi, 0)} dBi</td></tr>
        <tr><th>Radarquerschnitt σ</th><td>{formatRcs(rcsM2)}</td></tr>
        <tr><th>Empfindlichkeit P_min</th><td>{formatPowerDbm(minPowerDbm, 0)}</td></tr>
        <tr><th>Wellenlänge λ</th><td>{formatNumber(result.wavelengthM * 100, 1)} cm</td></tr>
        <tr><th>Maximale Reichweite R_max</th><td>{formatDistance(result.rangeM, 1)}</td></tr>
        <tr><th>Empfangsleistung bei R_max</th><td>{formatPowerDbm(result.receivedAtMaxDbm, 1)}</td></tr>
        <tr><th>Empfangsleistung bei R_max/2</th><td>{formatPowerDbm(result.receivedAtHalfDbm, 1)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Sendeleistung P_t"
      bind:value={txPowerW}
      min={RADAR_RANGE_LIMITS.txPowerW.min}
      max={RADAR_RANGE_LIMITS.txPowerW.max}
      scale="log"
      format={(v) => formatPowerWatts(v, 0)}
      unitSymbol="W"
    />
    <Slider
      label="Antennengewinn G"
      bind:value={antennaGainDbi}
      min={RADAR_RANGE_LIMITS.antennaGainDbi.min}
      max={RADAR_RANGE_LIMITS.antennaGainDbi.max}
      step={1}
      format={(v) => `${formatNumber(v, 0)} dBi`}
      unitSymbol="dBi"
    />
    <Slider
      label="Radarquerschnitt σ"
      bind:value={rcsM2}
      min={RADAR_RANGE_LIMITS.rcsM2.min}
      max={RADAR_RANGE_LIMITS.rcsM2.max}
      scale="log"
      format={(v) => formatRcs(v)}
      unitSymbol="Quadratmeter"
    />
    <Slider
      label="Empfindlichkeit P_min"
      bind:value={minPowerDbm}
      min={RADAR_RANGE_LIMITS.minPowerDbm.min}
      max={RADAR_RANGE_LIMITS.minPowerDbm.max}
      step={1}
      format={(v) => formatPowerDbm(v, 0)}
      unitSymbol="dBm"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Maximale Reichweite R_max"
      value={formatDistance(result.rangeM, 1)}
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Für doppelte Reichweite nötig"
      value={formatPowerWatts(result.powerForDoubleRangeW, 0)}
      hint="16-fache Leistung (+12 dB)"
      copyable={false}
    />
    <ResultCard
      label="Probe: P_r bei R_max"
      value={formatPowerDbm(result.receivedAtMaxDbm, 1)}
      hint="auf halber Strecke {formatPowerDbm(result.receivedAtHalfDbm, 1)} — 12 dB mehr"
      copyable={false}
    />
    <Callout tone="tip" title="Warum die Kurve so flach ist">
      Alle Zählergrößen wirken nur mit der vierten Wurzel: Zehnfache Leistung bringt den Faktor
      {formatNumber(rangeScaling(10), 2)}, hundertfache erst {formatNumber(rangeScaling(100), 2)}. Der Antennengewinn
      steht dagegen im Quadrat — 3 dB mehr Gewinn wirken wie doppelte Sendeleistung, und die Antenne verbraucht dafür
      keinen einzigen Watt.
    </Callout>
  {/snippet}
</WidgetFrame>
