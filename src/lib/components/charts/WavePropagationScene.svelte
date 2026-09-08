<script lang="ts">
  /**
   * Szene des Wellenausbreitungs-Diagramms: Himmel, Ionosphärenschichten,
   * Antennen und der Signalweg des gewählten Modus.
   *
   * Alle Farben stammen aus Tokens; die illustrativen Himmels- und Erdtöne
   * liegen als lokale CSS-Variablen mit eigener Dunkelvariante vor.
   */
  import { LAYER_VISUALIZATIONS, SKIP_ZONE_PARAMS } from '$lib/data/propagation';
  import WavePropagationPaths from './WavePropagationPaths.svelte';
  import {
    ALTITUDE_TICKS_KM,
    NIGHT_F_LAYER,
    STAR_COUNT,
    altitudeToY,
    modeById,
    visibleLayers
  } from './wavePropagationData';

  interface Props {
    selectedModeId: string;
    isNighttime: boolean;
    width: number;
    height: number;
  }

  let { selectedModeId, isNighttime, width, height }: Props = $props();

  const margin = { top: 40, right: 40, bottom: 40, left: 60 } as const;

  /** Abstände der Antennen vom Rand und ihre Masthöhe. */
  const ANTENNA_INSET = 60;
  const MAST_HEIGHT = 40;
  const GROUND_OFFSET = 10;
  /** Breite der toten Zone im Raumwellenbild. */
  const DEAD_ZONE_WIDTH = 80;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let mode = $derived(modeById(selectedModeId));
  let layers = $derived(visibleLayers(isNighttime));

  let skipZone = $derived(
    selectedModeId === 'sky-wave'
      ? {
          reflectionHeight: isNighttime
            ? SKIP_ZONE_PARAMS.reflectionHeightKm.night
            : SKIP_ZONE_PARAMS.reflectionHeightKm.day
        }
      : null
  );

  /** Feste Sternpositionen — sonst springen sie bei jeder Neuberechnung. */
  const stars = Array.from({ length: STAR_COUNT }, (_, index) => ({
    id: index,
    fx: ((index * 37) % 100) / 100,
    fy: ((index * 61) % 60) / 100,
    r: 0.5 + ((index * 13) % 10) / 10,
    opacity: 0.3 + ((index * 7) % 5) / 10
  }));

  const uid = $props.id();

  let txX = $derived(ANTENNA_INSET);
  let rxX = $derived(chartWidth - ANTENNA_INSET);
  let groundY = $derived(chartHeight - GROUND_OFFSET);

  function y(altitudeKm: number): number {
    return altitudeToY(altitudeKm, chartHeight);
  }
</script>

<svg
  class="wave-scene"
  viewBox="0 0 {width} {height}"
  preserveAspectRatio="xMidYMid meet"
  aria-hidden="true"
>
  <defs>
    <linearGradient id="{uid}-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color={isNighttime ? 'var(--sky-night-top)' : 'var(--sky-day-top)'} />
      <stop
        offset="100%"
        stop-color={isNighttime ? 'var(--sky-night-bottom)' : 'var(--sky-day-bottom)'}
      />
    </linearGradient>
    <linearGradient id="{uid}-earth" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--earth-top)" />
      <stop offset="100%" stop-color="var(--earth-bottom)" />
    </linearGradient>
  </defs>

  <rect
    x={margin.left}
    y={margin.top}
    width={chartWidth}
    height={chartHeight}
    fill="url(#{uid}-sky)"
  />

  {#if isNighttime}
    {#each stars as star (star.id)}
      <circle
        cx={margin.left + star.fx * chartWidth}
        cy={margin.top + star.fy * chartHeight}
        r={star.r}
        fill="var(--color-on-solid)"
        opacity={star.opacity}
      />
    {/each}
  {/if}

  <g transform="translate({margin.left}, {margin.top})">
    <!-- Erdkrümmung -->
    <path
      d="M 0 {chartHeight} Q {chartWidth / 2} {chartHeight + 40} {chartWidth} {chartHeight}"
      fill="url(#{uid}-earth)"
      stroke="var(--earth-edge)"
      stroke-width="2"
    />

    <!-- Ionosphärenschichten -->
    {#if isNighttime}
      {@const yTop = y(NIGHT_F_LAYER.altitudeMaxKm)}
      {@const yBottom = y(NIGHT_F_LAYER.altitudeMinKm)}
      <rect
        x="0"
        y={yTop}
        width={chartWidth}
        height={yBottom - yTop}
        fill={NIGHT_F_LAYER.fillColor}
        fill-opacity={NIGHT_F_LAYER.fillOpacity}
        stroke={NIGHT_F_LAYER.strokeColor}
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity={NIGHT_F_LAYER.opacity}
      />
      <text
        x={chartWidth - 10}
        y={(yTop + yBottom) / 2}
        fill={NIGHT_F_LAYER.strokeColor}
        font-size="11"
        text-anchor="end"
        dominant-baseline="middle"
      >
        F-Schicht (150–400 km)
      </text>
      {@const eLayer = LAYER_VISUALIZATIONS.find((l) => l.id === 'e-layer')}
      {#if eLayer}
        {@const eTop = y(eLayer.altitudeMaxKm)}
        {@const eBottom = y(eLayer.altitudeMinKm)}
        <rect
          x="0"
          y={eTop}
          width={chartWidth}
          height={eBottom - eTop}
          fill={eLayer.fillColor}
          stroke={eLayer.strokeColor}
          stroke-width="1"
          stroke-dasharray="4,4"
          opacity={eLayer.nightOpacity}
        />
      {/if}
    {:else}
      {#each layers as layer (layer.id)}
        {@const yTop = y(layer.altitudeMaxKm)}
        {@const yBottom = y(layer.altitudeMinKm)}
        <rect
          x="0"
          y={yTop}
          width={chartWidth}
          height={yBottom - yTop}
          fill={layer.fillColor}
          stroke={layer.strokeColor}
          stroke-width="1"
          stroke-dasharray="4,4"
          opacity={layer.dayOpacity}
        />
        <text
          x={chartWidth - 10}
          y={(yTop + yBottom) / 2}
          fill={layer.strokeColor}
          font-size="10"
          text-anchor="end"
          dominant-baseline="middle"
        >
          {layer.name} ({layer.altitudeMinKm}–{layer.altitudeMaxKm} km)
        </text>
      {/each}
    {/if}

    <!-- Antennen -->
    <line
      x1={txX}
      y1={groundY}
      x2={txX}
      y2={groundY - MAST_HEIGHT}
      stroke="var(--color-series-6)"
      stroke-width="3"
    />
    <polygon
      points="{txX - 8},{groundY - MAST_HEIGHT} {txX},{groundY - MAST_HEIGHT - 15} {txX +
        8},{groundY - MAST_HEIGHT}"
      fill="var(--color-series-6)"
    />
    <text class="chart-axis-label" x={txX} y={groundY + 15} text-anchor="middle">TX</text>

    <line
      x1={rxX}
      y1={groundY}
      x2={rxX}
      y2={groundY - MAST_HEIGHT}
      stroke="var(--color-series-2)"
      stroke-width="3"
    />
    <polygon
      points="{rxX - 8},{groundY - MAST_HEIGHT} {rxX},{groundY - MAST_HEIGHT - 15} {rxX +
        8},{groundY - MAST_HEIGHT}"
      fill="var(--color-series-2)"
    />
    <text class="chart-axis-label" x={rxX} y={groundY + 15} text-anchor="middle">RX</text>

    <WavePropagationPaths
      {selectedModeId}
      color={mode.color}
      {chartWidth}
      {chartHeight}
      {txX}
      {rxX}
      {groundY}
      reflectionHeightKm={skipZone?.reflectionHeight ?? 300}
    />

    <!-- Höhenachse -->
    {#each ALTITUDE_TICKS_KM as alt (alt)}
      <line class="chart-axis-line" x1="0" y1={y(alt)} x2="-5" y2={y(alt)} />
      <text
        class="chart-axis-text"
        x="-10"
        y={y(alt)}
        text-anchor="end"
        dominant-baseline="middle">{alt} km</text
      >
    {/each}
    <text
      class="chart-axis-label"
      transform="rotate(-90)"
      x={-(chartHeight / 2)}
      y="-45"
      text-anchor="middle">Höhe (km)</text
    >
  </g>

</svg>

<style>
  /*
   * Illustrative Himmels- und Erdtöne. Die Werte stehen als Szenen-Tokens in
   * app.css (mit eigener Fassung für das dunkle Theme); hier werden sie nur
   * auf die kurzen Namen der Verläufe abgebildet.
   */
  .wave-scene {
    --sky-day-top: var(--color-scene-horizon-top);
    --sky-day-bottom: var(--color-scene-horizon-bottom);
    --sky-night-top: var(--color-scene-night-top);
    --sky-night-bottom: var(--color-scene-night-bottom);
    --earth-top: var(--color-scene-earth-top);
    --earth-bottom: var(--color-scene-earth-bottom);
    --earth-edge: var(--color-scene-earth-edge);
    display: block;
    width: 100%;
    height: auto;
  }
</style>
