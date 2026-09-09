<script lang="ts">
  /**
   * Signalweg des gewählten Ausbreitungsmodus.
   * Aus `WavePropagationScene.svelte` ausgelagert, damit beide Dateien
   * unter 300 Zeilen bleiben.
   */
  import { altitudeToY } from './wavePropagationData';

  interface Props {
    selectedModeId: string;
    /** Farbe des Modus aus `data/propagation.ts` */
    color: string;
    chartWidth: number;
    chartHeight: number;
    txX: number;
    rxX: number;
    groundY: number;
    reflectionHeightKm: number;
  }

  let { selectedModeId, color, chartWidth, chartHeight, txX, rxX, groundY, reflectionHeightKm }: Props = $props();

  /** Breite der toten Zone im Raumwellenbild. */
  const DEAD_ZONE_WIDTH = 80;
  /** Höhe der sporadischen E-Schicht in Kilometern. */
  const SPORADIC_E_ALTITUDE_KM = 110;
  /** Antennenspitze über dem Boden (Mast plus Spitze in `WavePropagationScene`). */
  const ANTENNA_TIP = 55;

  function y(altitudeKm: number): number {
    return altitudeToY(altitudeKm, chartHeight);
  }

  /**
   * Kontrollpunkt einer quadratischen Bézierkurve, deren Scheitel genau auf
   * `apexY` liegt: Der Scheitel liegt bei ¼·y₀ + ½·y_c + ¼·y₁.
   */
  function controlY(apexY: number, y0: number, y1: number): number {
    return 2 * apexY - (y0 + y1) / 2;
  }
</script>

<!-- Signalweg je Modus -->
{#if selectedModeId === 'ground-wave'}
  <path
    class="wave-path"
    d="M {txX} {groundY - ANTENNA_TIP} Q {chartWidth / 2} {controlY(
      groundY - 4,
      groundY - ANTENNA_TIP,
      groundY - ANTENNA_TIP
    )} {rxX} {groundY - ANTENNA_TIP}"
    fill="none"
    stroke={color}
    stroke-width="3"
    stroke-dasharray="8,4"
  />
  <text x={chartWidth / 2} y={groundY + 5} fill={color} font-size="10" text-anchor="middle">
    Bodenwelle folgt der Erdoberfläche
  </text>
{:else if selectedModeId === 'sky-wave'}
  {@const reflectionY = y(reflectionHeightKm)}
  {@const hop1X = txX + (rxX - txX) / 3}
  {@const hop2X = txX + ((rxX - txX) * 2) / 3}
  <!-- Jeder Sprung: Antennenspitze bzw. Bodenreflexion → Scheitel in Reflexionshöhe → Boden -->
  {#each [[txX, hop1X], [hop1X, hop2X], [hop2X, rxX]] as [from, to], index (index)}
    {@const y0 = index === 0 ? groundY - ANTENNA_TIP : groundY}
    {@const y1 = index === 2 ? groundY - ANTENNA_TIP : groundY}
    <path
      class="wave-path"
      d="M {from} {y0} Q {(from + to) / 2} {controlY(reflectionY, y0, y1)} {to} {y1}"
      fill="none"
      stroke={color}
      stroke-width="2.5"
      stroke-dasharray="6,3"
    />
    <circle cx={(from + to) / 2} cy={reflectionY} r="5" fill={color} opacity="0.8" />
  {/each}

  {#if true}
    <rect
      x={txX + 30}
      y={groundY - 60}
      width={DEAD_ZONE_WIDTH}
      height="50"
      fill="var(--color-series-6)"
      fill-opacity="0.2"
      stroke="var(--color-series-6)"
      stroke-dasharray="3,3"
    />
    <text
      x={txX + 30 + DEAD_ZONE_WIDTH / 2}
      y={groundY - 35}
      fill="var(--color-series-6)"
      font-size="9"
      text-anchor="middle">Tote Zone</text
    >
  {/if}
{:else if selectedModeId === 'line-of-sight'}
  <line
    class="wave-path"
    x1={txX}
    y1={groundY - ANTENNA_TIP}
    x2={rxX}
    y2={groundY - ANTENNA_TIP}
    stroke={color}
    stroke-width="3"
    stroke-dasharray="10,5"
  />
  <text class="chart-axis-text" x={chartWidth / 2} y={groundY - ANTENNA_TIP - 10} text-anchor="middle">
    direkter Weg von Antenne zu Antenne — Reichweite bis zum Radiohorizont d ≈ 4,12·√h
  </text>
{:else if selectedModeId === 'sporadic-e'}
  {@const eLayerY = y(SPORADIC_E_ALTITUDE_KM)}
  <ellipse
    cx={chartWidth * 0.35}
    cy={eLayerY}
    rx="40"
    ry="12"
    fill="var(--color-series-4)"
    fill-opacity="0.4"
    stroke="var(--color-series-4)"
    stroke-width="1"
  />
  <ellipse
    cx={chartWidth * 0.65}
    cy={eLayerY}
    rx="35"
    ry="10"
    fill="var(--color-series-4)"
    fill-opacity="0.4"
    stroke="var(--color-series-4)"
    stroke-width="1"
  />
  <path
    class="wave-path"
    d="M {txX} {groundY - ANTENNA_TIP} Q {chartWidth * 0.35} {controlY(
      eLayerY,
      groundY - ANTENNA_TIP,
      groundY
    )} {chartWidth * 0.5} {groundY} Q {chartWidth * 0.65} {controlY(
      eLayerY,
      groundY,
      groundY - ANTENNA_TIP
    )} {rxX} {groundY - ANTENNA_TIP}"
    fill="none"
    stroke={color}
    stroke-width="2.5"
    stroke-dasharray="6,3"
  />
  <text x={chartWidth * 0.35} y={eLayerY - 18} fill="var(--color-series-4)" font-size="9" text-anchor="middle"
    >Es-Wolke</text
  >
{/if}

<style>
  /* Der wandernde Strich zeigt die Ausbreitungsrichtung. */
  .wave-path {
    animation: wave-dash 1.2s linear infinite;
  }

  @keyframes wave-dash {
    from {
      stroke-dashoffset: 18;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wave-path {
      animation: none;
    }
  }
</style>
