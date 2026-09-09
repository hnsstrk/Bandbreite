<script lang="ts">
  /**
   * Kugelausbreitung: Die Sendeleistung verteilt sich auf die Kugelfläche
   * 4π·d². Links laufen die Wellenfronten nach außen, rechts fällt die
   * Leistungsdichte im doppelt-logarithmischen Diagramm als Gerade mit der
   * Steigung −2. Gerechnet wird in InverseSquareModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import {
    formatDistance,
    formatExponential,
    formatNumber,
    formatPowerDb,
    formatPowerWatts
  } from '$lib/utils/formatting';
  import { clamp, safeLog } from '$lib/utils/handlers';
  import { DOUBLING_LOSS_DB, SPREADING_LIMITS, densityCurve, spreadingAt } from './InverseSquareModel';

  const W = 800;
  const H = 282;
  /** Linke Bühne: Quelle mit auslaufenden Wellenfronten */
  const SRC_X = 140;
  const SRC_Y = 128;
  const MAX_R = 108;
  /** Zahl der gleichzeitig sichtbaren Wellenfronten */
  const FRONTS = 4;
  /** Dauer eines Fronten-Durchlaufs (ms) */
  const CYCLE_MS = 2600;
  /** Rechte Bühne: doppelt-logarithmisches Diagramm */
  const PX0 = 400;
  const PX1 = 768;
  const PY0 = 40;
  const PY1 = 200;

  let txPowerW = $state<number>(SPREADING_LIMITS.txPowerW.default);
  let gainDbi = $state<number>(SPREADING_LIMITS.gainDbi.default);
  let distanceM = $state<number>(SPREADING_LIMITS.distanceM.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const result = $derived(spreadingAt(txPowerW, gainDbi, distanceM));
  const near = $derived(spreadingAt(txPowerW, gainDbi, distanceM / 2));
  const curve = $derived(
    densityCurve(txPowerW, gainDbi, SPREADING_LIMITS.distanceM.min, SPREADING_LIMITS.distanceM.max)
  );

  const phase = $derived((loop.elapsedMs % CYCLE_MS) / CYCLE_MS);
  const fronts = $derived(Array.from({ length: FRONTS }, (_, index) => ((phase + index / FRONTS) % 1) * MAX_R));

  /** Kugelradius im Bild: logarithmisch, damit der ganze Reglerbereich passt. */
  const markerR = $derived(
    18 +
      clamp(
        safeLog(distanceM / SPREADING_LIMITS.distanceM.min, 10, 0) /
          safeLog(SPREADING_LIMITS.distanceM.max / SPREADING_LIMITS.distanceM.min, 10, 1),
        0,
        1
      ) *
        (MAX_R - 18)
  );

  const densityRange = $derived({
    max: curve.length ? curve[0].densityWPerM2 : 1,
    min: curve.length ? curve[curve.length - 1].densityWPerM2 : 1e-9
  });
  function px(d: number): number {
    const span = safeLog(SPREADING_LIMITS.distanceM.max / SPREADING_LIMITS.distanceM.min, 10, 1);
    return PX0 + clamp(safeLog(d / SPREADING_LIMITS.distanceM.min, 10, 0) / span, 0, 1) * (PX1 - PX0);
  }
  function py(density: number): number {
    const span = safeLog(densityRange.max / densityRange.min, 10, 1);
    const offset = safeLog(densityRange.max / Math.max(density, densityRange.min), 10, 0);
    return PY0 + clamp(offset / span, 0, 1) * (PY1 - PY0);
  }
  const curvePath = $derived(
    curve
      .map(
        (point, i) => `${i === 0 ? 'M' : 'L'}${px(point.distanceM).toFixed(1)},${py(point.densityWPerM2).toFixed(1)}`
      )
      .join(' ')
  );
  const decades = [1, 10, 100, 1000, 10_000];
  /** Leistungsdichte lesbar: kleine Werte exponentiell. */
  function formatDensity(value: number): string {
    return value >= 0.001 ? `${formatNumber(value, 4)} W/m²` : `${formatExponential(value, 2)} W/m²`;
  }
</script>

<WidgetFrame
  title="Kugelausbreitung: warum 1/d²"
  description="Links laufen Wellenfronten von einer punktförmigen Quelle nach außen; der markierte Kreis steht für die Kugelfläche im eingestellten Abstand. Rechts fällt die Leistungsdichte im doppelt-logarithmischen Diagramm als Gerade mit der Steigung minus zwei: je Abstandsverdopplung sechs Dezibel."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Der Kugelradius im Bild wächst logarithmisch — schematisch, nicht maßstäblich. Es geht keine Leistung verloren, sie verteilt sich nur auf eine größere Fläche (ITU-R P.525)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Auslaufende Wellenfronten -->
    {#each fronts as radius, i (i)}
      <circle
        cx={SRC_X}
        cy={SRC_Y}
        r={Math.max(1, radius)}
        fill="none"
        stroke="var(--color-series-1)"
        stroke-width="2"
        opacity={Math.max(0, 1 - radius / MAX_R) * 0.8}
      />
    {/each}
    <circle
      cx={SRC_X}
      cy={SRC_Y}
      r={markerR}
      fill="var(--color-series-3)"
      fill-opacity="0.12"
      stroke="var(--color-series-3)"
      stroke-width="2"
    />
    <circle cx={SRC_X} cy={SRC_Y} r="6" fill="var(--color-series-6)" />
    <line
      x1={SRC_X}
      y1={SRC_Y}
      x2={SRC_X + markerR}
      y2={SRC_Y}
      stroke="var(--color-series-3)"
      stroke-width="1.5"
      stroke-dasharray="4 3"
    />
    <text x={SRC_X} y={SRC_Y + MAX_R + 26} text-anchor="middle" class="chart-axis-text">
      d = {formatDistance(distanceM, 1)} · A = 4π·d² = {formatExponential(result.areaM2, 2)} m²
    </text>
    <text x={SRC_X} y={SRC_Y - MAX_R - 12} text-anchor="middle" class="chart-legend-text">
      EIRP = {formatPowerWatts(result.eirpW, 2)}
    </text>

    <!-- Doppelt-logarithmisches Diagramm -->
    <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} class="chart-axis-line" />
    <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} class="chart-axis-line" />
    {#each decades as value (value)}
      <line x1={px(value)} y1={PY0} x2={px(value)} y2={PY1} class="chart-grid-line" />
      <text x={px(value)} y={PY1 + 18} text-anchor="middle" class="chart-axis-text">{formatDistance(value, 0)}</text>
    {/each}
    <path d={curvePath} fill="none" stroke="var(--color-series-2)" stroke-width="2.5" />
    <line x1={px(distanceM)} y1={PY0} x2={px(distanceM)} y2={PY1} stroke="var(--color-marker)" stroke-width="1.5" />
    <circle cx={px(distanceM)} cy={py(result.densityWPerM2)} r="5" fill="var(--color-marker)" />
    <text x={PX0 - 6} y={PY0 + 4} text-anchor="end" class="chart-axis-text">
      {formatExponential(densityRange.max, 1)}
    </text>
    <text x={PX0 - 6} y={PY1 + 4} text-anchor="end" class="chart-axis-text">
      {formatExponential(densityRange.min, 1)}
    </text>
    <text x={PX0} y={PY0 - 14} class="chart-axis-text">Leistungsdichte S in W/m² (logarithmisch)</text>
    <text x={PX1} y={PY1 + 36} text-anchor="end" class="chart-axis-text">Abstand d in m (logarithmisch)</text>
    <text x={px(distanceM) + 8} y={py(result.densityWPerM2) - 10} class="chart-legend-text">
      S = {formatDensity(result.densityWPerM2)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Kugelausbreitung bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Sendeleistung</th><td>{formatPowerWatts(txPowerW, 3)}</td></tr>
        <tr><th>Antennengewinn</th><td>{formatNumber(gainDbi, 1)} dBi</td></tr>
        <tr><th>EIRP</th><td>{formatPowerWatts(result.eirpW, 2)}</td></tr>
        <tr><th>Abstand d</th><td>{formatDistance(distanceM, 1)}</td></tr>
        <tr><th>Kugelfläche 4π·d²</th><td>{formatExponential(result.areaM2, 2)} m²</td></tr>
        <tr><th>Leistungsdichte S</th><td>{formatDensity(result.densityWPerM2)}</td></tr>
        <tr><th>Feldstärke E</th><td>{formatNumber(result.fieldVPerM, 3)} V/m</td></tr>
        <tr><th>Dichte bei halbem Abstand</th><td>{formatDensity(near.densityWPerM2)}</td></tr>
        <tr><th>Verlust je Abstandsverdopplung</th><td>{formatPowerDb(DOUBLING_LOSS_DB, 2)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Sendeleistung P"
      bind:value={txPowerW}
      min={SPREADING_LIMITS.txPowerW.min}
      max={SPREADING_LIMITS.txPowerW.max}
      scale="log"
      format={(v) => formatPowerWatts(v, 2)}
      unitSymbol="W"
    />
    <Slider
      label="Antennengewinn G"
      bind:value={gainDbi}
      min={SPREADING_LIMITS.gainDbi.min}
      max={SPREADING_LIMITS.gainDbi.max}
      step={0.5}
      format={(v) => `${formatNumber(v, 1)} dBi`}
      unitSymbol="dBi"
    />
    <Slider
      label="Abstand d"
      bind:value={distanceM}
      min={SPREADING_LIMITS.distanceM.min}
      max={SPREADING_LIMITS.distanceM.max}
      scale="log"
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Leistungsdichte S = EIRP/(4π·d²)"
      value={formatDensity(result.densityWPerM2)}
      emphasis="hero"
      copyable={false}
    />
    <ResultCard label="Feldstärke E = √(S·Z₀)" value={formatNumber(result.fieldVPerM, 3)} unit="V/m" copyable={false} />
    <ResultCard label="Kugelfläche 4π·d²" value="{formatExponential(result.areaM2, 2)} m²" copyable={false} />
    <ResultCard
      label="Abstand verdoppeln"
      value={formatPowerDb(-DOUBLING_LOSS_DB, 2)}
      hint="Fläche mal vier, Dichte durch vier"
      tone="warning"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
