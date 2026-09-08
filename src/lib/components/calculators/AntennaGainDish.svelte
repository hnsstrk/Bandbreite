<script lang="ts">
  /**
   * Schematischer Riss einer Parabolantenne: Spiegel, Erreger und die
   * Halbwertskeule. Der Öffnungswinkel wird auf einen sichtbaren Bereich
   * abgebildet — der Zahlenwert steht in der Beschriftung.
   */
  import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
  import { formatDistance, formatNumber } from '$lib/utils/formatting';
  import {
    DISH_VIEW_HEIGHT,
    DISH_VIEW_WIDTH,
    drawnHalfAngleDeg
  } from './antennaGain.svelte';

  interface Props {
    /** Spiegeldurchmesser in Metern */
    diameterM: number;
    /** Halbwertsöffnungswinkel in Grad */
    beamwidthDeg: number;
    /** Gewinn in dBi (für die Datentabelle) */
    gainDbi: number;
    /** Beginn des Fernfelds in Metern */
    farFieldM: number;
  }

  let { diameterM, beamwidthDeg, gainDbi, farFieldM }: Props = $props();

  /** Zeichenmaße des Risses. */
  const AXIS_Y = DISH_VIEW_HEIGHT / 2;
  const DISH_X = 78;
  const DISH_HALF_HEIGHT = 66;
  /** Tiefe des Spiegels in Pixeln (Bauform f/D ≈ 0,4). */
  const DISH_DEPTH = 26;
  /** Länge der gezeichneten Keulenkanten in Pixeln. */
  const BEAM_LENGTH = 300;
  const DEG_TO_RAD = Math.PI / 180;

  let drawn = $derived(drawnHalfAngleDeg(beamwidthDeg / 2));

  /** Endpunkt einer Keulenkante unter dem Winkel `sign · drawn.deg`. */
  function edge(sign: 1 | -1) {
    const rad = sign * drawn.deg * DEG_TO_RAD;
    return {
      x: DISH_X + BEAM_LENGTH * Math.cos(rad),
      y: AXIS_Y - BEAM_LENGTH * Math.sin(rad)
    };
  }

  let upper = $derived(edge(1));
  let lower = $derived(edge(-1));

  /** Spiegelkontur als quadratische Bézierkurve. */
  let dishPath = $derived(
    `M ${DISH_X} ${AXIS_Y - DISH_HALF_HEIGHT} Q ${DISH_X - DISH_DEPTH * 2} ${AXIS_Y} ${DISH_X} ${AXIS_Y + DISH_HALF_HEIGHT}`
  );

  let beamPath = $derived(
    `M ${DISH_X} ${AXIS_Y} L ${upper.x} ${upper.y} L ${lower.x} ${lower.y} Z`
  );
</script>

<ChartFrame
  title="Spiegel und Keule"
  level={3}
  minWidth={340}
  description="Seitenriss einer Parabolantenne mit Spiegeldurchmesser, Erreger im Brennpunkt und der Halbwertskeule in Hauptstrahlrichtung."
  footnote={drawn.exaggerated
    ? 'Der Öffnungswinkel ist schematisch überzeichnet, damit die Keule sichtbar bleibt; es gilt der angegebene Zahlenwert.'
    : 'Maßstabsgetreuer Öffnungswinkel; der Spiegel ist schematisch.'}
>
  <svg viewBox="0 0 {DISH_VIEW_WIDTH} {DISH_VIEW_HEIGHT}" aria-hidden="true">
    <!-- Halbwertskeule -->
    <path d={beamPath} fill="var(--color-series-1)" opacity="0.18" />
    <line
      x1={DISH_X}
      y1={AXIS_Y}
      x2={upper.x}
      y2={upper.y}
      stroke="var(--color-series-1)"
      stroke-width="1.5"
    />
    <line
      x1={DISH_X}
      y1={AXIS_Y}
      x2={lower.x}
      y2={lower.y}
      stroke="var(--color-series-1)"
      stroke-width="1.5"
    />

    <!-- Hauptstrahlrichtung -->
    <line
      x1={DISH_X}
      y1={AXIS_Y}
      x2={DISH_X + BEAM_LENGTH}
      y2={AXIS_Y}
      class="chart-axis-line"
      stroke-dasharray="6,5"
    />

    <!-- Spiegel und Erreger -->
    <path d={dishPath} fill="none" stroke="var(--color-ink-muted)" stroke-width="4" />
    <line
      x1={DISH_X}
      y1={AXIS_Y}
      x2={DISH_X + 34}
      y2={AXIS_Y}
      stroke="var(--color-ink-muted)"
      stroke-width="2"
    />
    <circle cx={DISH_X + 34} cy={AXIS_Y} r="5" fill="var(--color-series-3)" />

    <!-- Durchmesser -->
    <line
      x1={DISH_X - 30}
      y1={AXIS_Y - DISH_HALF_HEIGHT}
      x2={DISH_X - 30}
      y2={AXIS_Y + DISH_HALF_HEIGHT}
      stroke="var(--color-ink-subtle)"
      stroke-width="1"
    />
    <text
      x={DISH_X - 36}
      y={AXIS_Y}
      text-anchor="end"
      dominant-baseline="middle"
      class="chart-axis-text"
    >
      D = {formatDistance(diameterM, 2)}
    </text>

    <text x={upper.x - 6} y={upper.y - 8} text-anchor="end" class="chart-axis-text">
      Halbwertsbreite {formatNumber(beamwidthDeg, 2)}°
    </text>
    <text x={DISH_X + 40} y={AXIS_Y - 12} class="chart-axis-text">Erreger</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Kennwerte der gezeichneten Antenne</caption>
      <thead>
        <tr><th>Größe</th><th>Wert</th></tr>
      </thead>
      <tbody>
        <tr><td>Spiegeldurchmesser</td><td>{formatDistance(diameterM, 2)}</td></tr>
        <tr><td>Gewinn</td><td>{formatNumber(gainDbi, 1)} dBi</td></tr>
        <tr><td>Halbwertsbreite</td><td>{formatNumber(beamwidthDeg, 2)} Grad</td></tr>
        <tr><td>Fernfeld ab</td><td>{formatDistance(farFieldM)}</td></tr>
      </tbody>
    </table>
  {/snippet}
</ChartFrame>
