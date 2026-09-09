<script lang="ts">
  /**
   * W8 – Dämpfungsfenster: Gasdämpfung 1–350 GHz (ITU-R P.676-13) mit Markierung der
   * Resonanzen (22, 60, 118, 183 GHz) und der Fenster (Ka/W-Band); Hover oder Regler
   * lesen γ ab, Wasserdampfdichte einstellbar. Rechnung in AttenuationWindowsModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatAttenuation, formatNumber } from '$lib/utils/formatting';
  import {
    generateWindowCurve,
    frequencyToFraction,
    fractionToFrequency,
    attenuationToFraction,
    findNearestPoint,
    WINDOW_MARKERS,
    WATER_VAPOR_LIMITS,
    WINDOW_CURVE_MIN_GHZ,
    WINDOW_CURVE_MAX_GHZ
  } from './AttenuationWindowsModel';

  const W = 800;
  const H = 320;
  const M = { top: 28, right: 20, bottom: 40, left: 60 };
  const PLOT_W = W - M.left - M.right;
  const PLOT_H = H - M.top - M.bottom;
  const X_TICKS = [1, 2, 5, 10, 20, 50, 100, 200, 350];
  const Y_TICKS = [0.001, 0.01, 0.1, 1, 10, 100];
  const DEFAULT_PROBE_GHZ = 60;

  let waterVaporDensity = $state<number>(WATER_VAPOR_LIMITS.default);
  let probeGHz = $state<number>(DEFAULT_PROBE_GHZ);
  let svgElement = $state<SVGSVGElement | null>(null);

  const curve = $derived(generateWindowCurve(waterVaporDensity));
  const probe = $derived(findNearestPoint(curve, probeGHz));
  const xOf = (ghz: number) => M.left + frequencyToFraction(ghz) * PLOT_W;
  const yOf = (dbKm: number) => M.top + (1 - attenuationToFraction(dbKm)) * PLOT_H;
  const path = (key: 'total' | 'oxygen' | 'waterVapor') =>
    curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.frequencyGHz).toFixed(1)},${yOf(p[key]).toFixed(1)}`).join(' ');
  const totalPath = $derived(path('total'));
  const oxygenPath = $derived(path('oxygen'));
  const waterPath = $derived(path('waterVapor'));

  function handlePointer(event: PointerEvent) {
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const fraction = ((event.clientX - rect.left) / rect.width) * W;
    probeGHz = fractionToFrequency((fraction - M.left) / PLOT_W);
  }

  const formatGHz = (ghz: number) => `${formatNumber(ghz, ghz < 10 ? 2 : 1)} GHz`;
</script>

<WidgetFrame
  title="Atmosphärische Fenster"
  description="Dämpfungskurve der Atmosphäre zwischen 1 und 350 Gigahertz auf doppelt-logarithmischen Achsen mit markierten Resonanzen von Wasserdampf und Sauerstoff sowie den Fenstern im Ka- und W-Band."
  footnote="Gasdämpfung nach ITU-R P.676-13 bei 1013,25 hPa und 15 °C. Regen, Nebel und Schnee sind hier nicht enthalten."
>
  <svg
    viewBox="0 0 {W} {H}"
    bind:this={svgElement}
    onpointermove={handlePointer}
    onpointerdown={handlePointer}
    aria-hidden="true"
  >
    <rect x={M.left} y={M.top} width={PLOT_W} height={PLOT_H} class="chart-background" />
    {#each Y_TICKS as tick (tick)}
      <line x1={M.left} y1={yOf(tick)} x2={M.left + PLOT_W} y2={yOf(tick)} class="chart-grid-line" />
      <text x={M.left - 6} y={yOf(tick) + 4} text-anchor="end" class="chart-axis-text">{tick}</text>
    {/each}
    {#each X_TICKS as tick (tick)}
      <line x1={xOf(tick)} y1={M.top} x2={xOf(tick)} y2={M.top + PLOT_H} class="chart-grid-line" />
      <text x={xOf(tick)} y={M.top + PLOT_H + 16} text-anchor="middle" class="chart-axis-text">{tick}</text>
    {/each}
    <text x={M.left + PLOT_W / 2} y={H - 6} text-anchor="middle" class="chart-axis-label">Frequenz in GHz</text>
    <text
      x="14"
      y={M.top + PLOT_H / 2}
      text-anchor="middle"
      class="chart-axis-label"
      transform="rotate(-90, 14, {M.top + PLOT_H / 2})">dB/km</text
    >
    {#each WINDOW_MARKERS as marker, index (marker.id)}
      <line
        x1={xOf(marker.frequencyGHz)}
        y1={M.top}
        x2={xOf(marker.frequencyGHz)}
        y2={M.top + PLOT_H}
        stroke={marker.kind === 'peak' ? 'var(--color-series-6)' : 'var(--color-series-2)'}
        stroke-width="1"
        stroke-dasharray={marker.kind === 'peak' ? '3,3' : '6,3'}
        opacity="0.6"
      />
      <!-- Beschriftungen versetzt in zwei Zeilen, damit sie sich auf der Log-Achse nicht überdecken -->
      <text
        x={xOf(marker.frequencyGHz)}
        y={marker.kind === 'peak' ? M.top - 8 - (index % 2) * 12 : M.top + 12 + (index % 2) * 12}
        text-anchor="middle"
        class="chart-legend-text"
        fill={marker.kind === 'peak' ? 'var(--color-danger-ink)' : 'var(--color-success-ink)'}>{marker.label}</text
      >
    {/each}
    <path d={oxygenPath} fill="none" stroke="var(--color-series-1)" stroke-width="1.25" opacity="0.7" />
    <path d={waterPath} fill="none" stroke="var(--color-series-2)" stroke-width="1.25" opacity="0.7" />
    <path d={totalPath} fill="none" stroke="var(--color-series-3)" stroke-width="2.5" />
    {#if probe}
      <line
        x1={xOf(probe.frequencyGHz)}
        y1={M.top}
        x2={xOf(probe.frequencyGHz)}
        y2={M.top + PLOT_H}
        class="chart-marker-crosshair"
      />
      <circle
        cx={xOf(probe.frequencyGHz)}
        cy={yOf(probe.total)}
        r="6"
        class="chart-marker-primary"
        stroke="var(--color-ink)"
        stroke-width="1.5"
      />
    {/if}
    <g transform="translate({M.left + 10}, {M.top + 40})">
      <line x1="0" y1="0" x2="18" y2="0" stroke="var(--color-series-3)" stroke-width="2.5" /><text
        x="24"
        y="4"
        class="chart-legend-text">gesamt</text
      >
      <line x1="0" y1="14" x2="18" y2="14" stroke="var(--color-series-1)" stroke-width="1.5" /><text
        x="24"
        y="18"
        class="chart-legend-text">Sauerstoff</text
      >
      <line x1="0" y1="28" x2="18" y2="28" stroke="var(--color-series-2)" stroke-width="1.5" /><text
        x="24"
        y="32"
        class="chart-legend-text">Wasserdampf</text
      >
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Dämpfung an den markierten Frequenzen bei {formatNumber(waterVaporDensity, 1)} g/m³ Wasserdampf</caption>
      <thead><tr><th>Frequenz</th><th>Art</th><th>Dämpfung</th></tr></thead>
      <tbody>
        {#each WINDOW_MARKERS as marker (marker.id)}
          <tr
            ><td>{marker.label}</td><td>{marker.kind === 'peak' ? 'Resonanz' : 'Fenster'}</td><td
              >{formatAttenuation(findNearestPoint(curve, marker.frequencyGHz)?.total)}</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Abgelesene Frequenz"
      bind:value={probeGHz}
      min={WINDOW_CURVE_MIN_GHZ}
      max={WINDOW_CURVE_MAX_GHZ}
      scale="log"
      format={formatGHz}
      unitSymbol="GHz"
      hint="Auch per Zeiger direkt im Diagramm"
    />
    <Slider
      label="Wasserdampfdichte"
      bind:value={waterVaporDensity}
      min={WATER_VAPOR_LIMITS.min}
      max={WATER_VAPOR_LIMITS.max}
      step={0.5}
      format={(v) => `${formatNumber(v, 1)} g/m³`}
      unitSymbol="g/m³"
      ticks={[
        { at: 0, label: 'trocken' },
        { at: 7.5, label: 'Standard' },
        { at: 30, label: 'tropisch' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    {#if probe}
      <ResultCard
        label="γ bei {formatGHz(probe.frequencyGHz)}"
        value={formatAttenuation(probe.total)}
        emphasis="hero"
        copyable={false}
      />
      <ResultCard label="Sauerstoff" value={formatAttenuation(probe.oxygen)} copyable={false} />
      <ResultCard label="Wasserdampf" value={formatAttenuation(probe.waterVapor)} copyable={false} />
      <ResultCard label="auf 10 km Strecke" value={formatNumber(probe.total * 10, 2)} unit="dB" copyable={false} />
    {/if}
  {/snippet}
</WidgetFrame>
