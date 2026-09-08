<script lang="ts">
  /**
   * Erdkrümmungs-Skizze des Radiohorizonts: zwei Antennen, deren Sichtlinie
   * die Kugeloberfläche im Horizontpunkt streift.
   *
   * Die Geometrie der Kugelerde stammt aus `widgets/PropagationModel.ts` —
   * dieselbe Skizzenlogik wie im Ausbreitungs-Sandkasten, keine zweite
   * Implementierung. Höhen sind stark überhöht, die Krümmung schematisch.
   */
  import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
  import {
    SKETCH_HEIGHT,
    SKETCH_WIDTH,
    sketchArcPath,
    sketchGeometry,
    sketchPoint
  } from '$lib/components/widgets/PropagationModel';
  import { formatNumber } from '$lib/utils/formatting';
  import { sketchAltitudeKm } from './radioHorizon.svelte';

  interface Props {
    /** Höhe der ersten Antenne in Metern */
    height1M: number;
    /** Höhe der zweiten Antenne in Metern */
    height2M: number;
    /** Horizontdistanz der ersten Antenne in km */
    horizon1Km: number;
    /** Horizontdistanz der zweiten Antenne in km */
    horizon2Km: number;
    /** k-Faktor der effektiven Erde */
    kFactor: number;
  }

  let { height1M, height2M, horizon1Km, horizon2Km, kFactor }: Props = $props();

  /** Rand links und rechts der Antennen, damit Beschriftungen Platz haben. */
  const SPAN_MARGIN = 1.25;
  /** Kleinste dargestellte Streckenlänge in km. */
  const MIN_SPAN_KM = 2;

  let totalKm = $derived(Math.max(horizon1Km + horizon2Km, MIN_SPAN_KM));
  let geometry = $derived(sketchGeometry(totalKm * SPAN_MARGIN, sketchAltitudeKm(height1M, height2M)));

  /** Der Horizontpunkt liegt in der Bildmitte, die Antennen beiderseits. */
  let txFootKm = $derived(-horizon1Km);
  let rxFootKm = $derived(horizon2Km);

  let txFoot = $derived(sketchPoint(geometry, txFootKm, 0));
  let rxFoot = $derived(sketchPoint(geometry, rxFootKm, 0));
  let txTop = $derived(sketchPoint(geometry, txFootKm, height1M / 1000));
  let rxTop = $derived(sketchPoint(geometry, rxFootKm, height2M / 1000));
  let horizonPoint = $derived(sketchPoint(geometry, 0, 0));

  let groundPath = $derived(sketchArcPath(geometry, -totalKm * SPAN_MARGIN * 0.5, totalKm * SPAN_MARGIN * 0.5, 0, 64));
</script>

<ChartFrame
  title="Sichtlinie über die Erdkrümmung"
  level={3}
  minWidth={420}
  description="Schematische Kugelerde mit zwei Antennen; die Sichtlinie streift die Oberfläche im Horizontpunkt zwischen beiden Standorten."
  footnote="Höhen stark überhöht, Krümmung schematisch. Gerechnet wird mit d = √(2·k·R·h), k = {formatNumber(
    kFactor,
    2
  )}."
>
  <svg viewBox="0 0 {SKETCH_WIDTH} {SKETCH_HEIGHT}" aria-hidden="true">
    <!-- Erdoberfläche -->
    <path d={groundPath} fill="none" stroke="var(--color-ink-muted)" stroke-width="2.5" />

    <!-- Sichtlinie über den Horizontpunkt -->
    <line
      x1={txTop.x}
      y1={txTop.y}
      x2={horizonPoint.x}
      y2={horizonPoint.y}
      stroke="var(--color-series-1)"
      stroke-width="2"
    />
    <line
      x1={horizonPoint.x}
      y1={horizonPoint.y}
      x2={rxTop.x}
      y2={rxTop.y}
      stroke="var(--color-series-2)"
      stroke-width="2"
    />
    <circle cx={horizonPoint.x} cy={horizonPoint.y} r="5" fill="var(--color-marker)" />
    <text x={horizonPoint.x} y={horizonPoint.y + 22} text-anchor="middle" class="chart-axis-text"> Horizontpunkt </text>

    <!-- Antennenmasten -->
    <line x1={txFoot.x} y1={txFoot.y} x2={txTop.x} y2={txTop.y} stroke="var(--color-series-1)" stroke-width="3" />
    <line x1={rxFoot.x} y1={rxFoot.y} x2={rxTop.x} y2={rxTop.y} stroke="var(--color-series-2)" stroke-width="3" />
    <text x={txTop.x} y={txTop.y - 12} text-anchor="middle" class="chart-axis-text">
      h₁ = {formatNumber(height1M, 1)} m
    </text>
    <text x={rxTop.x} y={rxTop.y - 12} text-anchor="middle" class="chart-axis-text">
      h₂ = {formatNumber(height2M, 1)} m
    </text>
    <text x={txTop.x} y={txTop.y - 28} text-anchor="middle" class="chart-legend-text">
      {formatNumber(horizon1Km, 1)} km
    </text>
    <text x={rxTop.x} y={rxTop.y - 28} text-anchor="middle" class="chart-legend-text">
      {formatNumber(horizon2Km, 1)} km
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Horizontdistanzen der gezeichneten Skizze</caption>
      <thead>
        <tr><th>Standort</th><th>Höhe</th><th>Horizont</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Antenne 1</td>
          <td>{formatNumber(height1M, 1)} m</td>
          <td>{formatNumber(horizon1Km, 1)} km</td>
        </tr>
        <tr>
          <td>Antenne 2</td>
          <td>{formatNumber(height2M, 1)} m</td>
          <td>{formatNumber(horizon2Km, 1)} km</td>
        </tr>
        <tr>
          <td>Summe</td>
          <td>—</td>
          <td>{formatNumber(horizon1Km + horizon2Km, 1)} km</td>
        </tr>
      </tbody>
    </table>
  {/snippet}
</ChartFrame>
