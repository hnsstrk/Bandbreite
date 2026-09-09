<script lang="ts">
  /**
   * Signalweg des gewählten Ausbreitungsmodus — maßstäblich zur
   * Entfernungsachse der Szene.
   *
   * Alle Entfernungen (Bodenwelle, Sprungdistanz, tote Zone, Radiohorizont,
   * Einfachsprung an der sporadischen E-Schicht) stammen aus
   * `sceneDistances()` und damit aus `$lib/data/propagation`.
   * Aus `WavePropagationScene.svelte` ausgelagert, damit beide Dateien unter
   * 300 Zeilen bleiben.
   */
  import { formatNumber } from '$lib/utils/formatting';
  import { SPORADIC_E_ALTITUDE_KM, altitudeToY, distanceToX, type WaveDistances } from './wavePropagationData';

  interface Props {
    selectedModeId: string;
    /** Farbe des Modus aus `data/propagation.ts` */
    color: string;
    chartWidth: number;
    chartHeight: number;
    groundY: number;
    /** Entfernungen aus dem Ausbreitungsmodell */
    distances: WaveDistances;
  }

  let { selectedModeId, color, chartWidth, chartHeight, groundY, distances }: Props = $props();

  /** Antennenspitze über dem Boden (Mast plus Spitze in `WavePropagationScene`). */
  const ANTENNA_TIP = 55;
  /** Höhe des Bandes, mit dem die tote Zone hinterlegt wird. */
  const DEAD_ZONE_HEIGHT = 46;

  function y(altitudeKm: number): number {
    return altitudeToY(altitudeKm, chartHeight);
  }

  function x(distanceKm: number): number {
    return distanceToX(distanceKm, distances.spanKm, chartWidth);
  }

  /**
   * Kontrollpunkt einer quadratischen Bézierkurve, deren Scheitel genau auf
   * `apexY` liegt: Der Scheitel liegt bei ¼·y₀ + ½·y_c + ¼·y₁.
   */
  function controlY(apexY: number, y0: number, y1: number): number {
    return 2 * apexY - (y0 + y1) / 2;
  }

  /** Sprungbogen vom Sender zum Aufsetzpunkt mit Scheitel in Reflexionshöhe. */
  function hopPath(toKm: number, apexKm: number): string {
    const y0 = groundY - ANTENNA_TIP;
    const y1 = groundY - ANTENNA_TIP;
    return `M ${x(0)} ${y0} Q ${x(toKm / 2)} ${controlY(y(apexKm), y0, y1)} ${x(toKm)} ${y1}`;
  }

  const groundWaveX = $derived(x(distances.groundWaveKm));
  const skipKm = $derived(distances.skipKm);
  /** Tote Zone nur, wenn der erste Aufsetzpunkt hinter der Bodenwelle liegt. */
  const deadZone = $derived(
    skipKm !== null && skipKm > distances.groundWaveKm ? { fromKm: distances.groundWaveKm, toKm: skipKm } : null
  );
</script>

<!-- Signalweg je Modus -->
{#if selectedModeId === 'ground-wave'}
  <path
    class="wave-path"
    d="M {x(0)} {groundY - ANTENNA_TIP} Q {x(distances.groundWaveKm / 2)} {controlY(
      groundY - 4,
      groundY - ANTENNA_TIP,
      groundY - ANTENNA_TIP
    )} {groundWaveX} {groundY - ANTENNA_TIP}"
    fill="none"
    stroke={color}
    stroke-width="3"
    stroke-dasharray="8,4"
  />
  <text x={groundWaveX / 2} y={groundY - ANTENNA_TIP - 12} fill={color} font-size="10" text-anchor="middle">
    Bodenwelle folgt der Erdoberfläche bis {formatNumber(distances.groundWaveKm, 0)} km
  </text>
{:else if selectedModeId === 'sky-wave'}
  <!-- Bodenwelle bis zu ihrer Reichweite -->
  <line
    x1={x(0)}
    y1={groundY - 6}
    x2={groundWaveX}
    y2={groundY - 6}
    stroke="var(--color-series-6)"
    stroke-width="2.5"
    stroke-dasharray="6,3"
  />

  {#if skipKm === null}
    <text x={chartWidth / 2} y={y(distances.reflectionHeightKm) - 14} fill={color} font-size="11" text-anchor="middle">
      {formatNumber(distances.foF2MHz, 1)} MHz foF2: Die Frequenz liegt über der MUF — keine Reflexion.
    </text>
  {:else}
    <!-- Erster Sprung: Scheitel in der Reflexionshöhe, Aufsetzpunkt bei der Sprungdistanz -->
    <path
      class="wave-path"
      d={hopPath(distances.rxKm, distances.reflectionHeightKm)}
      fill="none"
      stroke={color}
      stroke-width="2.5"
      stroke-dasharray="6,3"
    />
    <circle cx={x(distances.rxKm / 2)} cy={y(distances.reflectionHeightKm)} r="5" fill={color} opacity="0.8" />
    <text
      x={x(distances.rxKm / 2)}
      y={y(distances.reflectionHeightKm) - 12}
      fill={color}
      font-size="10"
      text-anchor="middle"
    >
      Reflexion in {formatNumber(distances.reflectionHeightKm, 0)} km, foF2 {formatNumber(distances.foF2MHz, 1)} MHz
    </text>
  {/if}

  {#if deadZone}
    <rect
      x={groundWaveX}
      y={groundY - DEAD_ZONE_HEIGHT}
      width={Math.max(x(deadZone.toKm) - groundWaveX, 0)}
      height={DEAD_ZONE_HEIGHT}
      fill="var(--color-series-6)"
      fill-opacity="0.2"
      stroke="var(--color-series-6)"
      stroke-dasharray="3,3"
    />
    <text
      x={(groundWaveX + x(deadZone.toKm)) / 2}
      y={groundY - DEAD_ZONE_HEIGHT / 2 + 4}
      fill="var(--color-series-6)"
      font-size="10"
      text-anchor="middle"
    >
      Tote Zone {formatNumber(deadZone.fromKm, 0)}–{formatNumber(deadZone.toKm, 0)} km
    </text>
  {:else if skipKm === 0}
    <text x={groundWaveX + 8} y={groundY - 18} fill="var(--color-series-6)" font-size="10">
      f ≤ foF2: Reflexion auch bei Steilstrahlung, keine tote Zone
    </text>
  {/if}
{:else if selectedModeId === 'line-of-sight'}
  <line
    class="wave-path"
    x1={x(0)}
    y1={groundY - ANTENNA_TIP}
    x2={x(distances.losKm)}
    y2={groundY - ANTENNA_TIP}
    stroke={color}
    stroke-width="3"
    stroke-dasharray="10,5"
  />
  <text class="chart-axis-text" x={x(distances.losKm / 2)} y={groundY - ANTENNA_TIP - 10} text-anchor="middle">
    direkter Weg bis zum Radiohorizont: {formatNumber(distances.losKm, 1)} km bei 30 m und 10 m Antennenhöhe
  </text>
{:else if selectedModeId === 'sporadic-e'}
  {@const eLayerY = y(SPORADIC_E_ALTITUDE_KM)}
  <ellipse
    cx={x(distances.rxKm / 2)}
    cy={eLayerY}
    rx="42"
    ry="12"
    fill="var(--color-series-4)"
    fill-opacity="0.4"
    stroke="var(--color-series-4)"
    stroke-width="1"
  />
  <path
    class="wave-path"
    d={hopPath(distances.rxKm, SPORADIC_E_ALTITUDE_KM)}
    fill="none"
    stroke={color}
    stroke-width="2.5"
    stroke-dasharray="6,3"
  />
  <text x={x(distances.rxKm / 2)} y={eLayerY - 18} fill="var(--color-series-4)" font-size="10" text-anchor="middle">
    Es-Wolke in {SPORADIC_E_ALTITUDE_KM} km — größter Einfachsprung {formatNumber(distances.rxKm, 0)} km
  </text>
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
