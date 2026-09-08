<script lang="ts">
  /**
   * Szene des Ionosphären-Diagramms: Himmel, Schichten, Reflexionspfad.
   * Die illustrativen Himmels- und Bodentöne liegen als lokale CSS-Variablen
   * mit eigener Dunkelvariante vor.
   */
  import { formatNumber } from '$lib/utils/formatting';
  import { ALTITUDE_TICKS_KM, LAYER_COLORS, altitudeToY, visibleLayers } from './ionosphericData';

  interface Props {
    frequencyMHz: number;
    isNighttime: boolean;
    canPropagate: boolean;
    belowLuf: boolean;
    reflection: { altitude: number; skipDistance: number | null };
    width: number;
    height: number;
  }

  let {
    frequencyMHz,
    isNighttime,
    canPropagate,
    belowLuf,
    reflection,
    width,
    height
  }: Props = $props();

  const margin = { top: 40, right: 40, bottom: 60, left: 80 } as const;

  /** Dicke der Bodenschicht und Antennenabstände in Pixeln. */
  const GROUND_HEIGHT = 20;
  const ANTENNA_INSET = 50;
  const MAST_HEIGHT = 30;

  const uid = $props.id();

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));
  let layers = $derived(visibleLayers(isNighttime));

  function y(altitudeKm: number): number {
    return altitudeToY(altitudeKm, chartHeight);
  }

  let txX = $derived(ANTENNA_INSET);
  let rxX = $derived(chartWidth - ANTENNA_INSET);
  let midX = $derived(chartWidth / 2);
  let groundY = $derived(chartHeight - GROUND_HEIGHT);

  let skipText = $derived.by(() => {
    if (reflection.skipDistance === null) return 'Keine Reflexion — Frequenz über der MUF';
    if (reflection.skipDistance === 0) return 'Sprungdistanz 0 km — senkrechte Reflexion möglich';
    return `Kleinste Sprungdistanz etwa ${formatNumber(reflection.skipDistance, 0)} km`;
  });
</script>

<svg
  class="iono-scene"
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
    <linearGradient id="{uid}-ground" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--ground-top)" />
      <stop offset="100%" stop-color="var(--ground-bottom)" />
    </linearGradient>
  </defs>

  <rect
    x={margin.left}
    y={margin.top}
    width={chartWidth}
    height={chartHeight}
    fill="url(#{uid}-sky)"
  />
  <rect
    x={margin.left}
    y={margin.top + chartHeight - GROUND_HEIGHT}
    width={chartWidth}
    height={GROUND_HEIGHT}
    fill="url(#{uid}-ground)"
  />

  <g transform="translate({margin.left}, {margin.top})">
    {#each layers as layer (layer.id)}
      {@const yTop = y(layer.altitudeMaxKm)}
      {@const yBottom = y(layer.altitudeMinKm)}
      {@const colors = LAYER_COLORS[layer.id]}
      <rect
        x="0"
        y={yTop}
        width={chartWidth}
        height={yBottom - yTop}
        fill={colors.fill}
        fill-opacity={colors.fillOpacity}
        stroke={colors.stroke}
        stroke-width="1"
        stroke-dasharray="4,4"
      />
      <text
        x={chartWidth - 10}
        y={yTop + (yBottom - yTop) / 2}
        fill={colors.stroke}
        font-size="12"
        font-weight="500"
        text-anchor="end"
        dominant-baseline="middle"
      >
        {layer.name} ({layer.altitudeMinKm}–{layer.altitudeMaxKm} km)
      </text>
    {/each}

    {#each ALTITUDE_TICKS_KM as alt (alt)}
      <line
        class="chart-grid-line"
        x1="0"
        y1={y(alt)}
        x2={chartWidth}
        y2={y(alt)}
        stroke-dasharray="2,4"
      />
      <text class="chart-axis-text" x="-10" y={y(alt)} text-anchor="end" dominant-baseline="middle">
        {alt} km
      </text>
    {/each}

    {#if canPropagate}
      {@const reflectionY = y(reflection.altitude)}
      <line
        x1={txX}
        y1={groundY}
        x2={txX}
        y2={groundY - MAST_HEIGHT}
        stroke="var(--color-series-6)"
        stroke-width="3"
      />
      <circle cx={txX} cy={groundY - MAST_HEIGHT - 5} r="5" fill="var(--color-series-6)" />
      <text class="chart-axis-label" x={txX} y={groundY + 15} text-anchor="middle">TX</text>

      <line
        x1={rxX}
        y1={groundY}
        x2={rxX}
        y2={groundY - MAST_HEIGHT}
        stroke="var(--color-series-2)"
        stroke-width="3"
      />
      <circle cx={rxX} cy={groundY - MAST_HEIGHT - 5} r="5" fill="var(--color-series-2)" />
      <text class="chart-axis-label" x={rxX} y={groundY + 15} text-anchor="middle">RX</text>

      <path
        class="iono-path"
        d="M {txX} {groundY - MAST_HEIGHT - 5} Q {midX} {reflectionY - 20} {rxX} {groundY -
          MAST_HEIGHT - 5}"
        fill="none"
        stroke="var(--color-marker)"
        stroke-width="2"
        stroke-dasharray="6,3"
      />
      <circle cx={midX} cy={reflectionY} r="6" fill="var(--color-marker)" opacity="0.8" />
      <text class="chart-axis-label" x={midX} y={groundY + 35} text-anchor="middle">
        {skipText}
      </text>
    {:else}
      <text
        x={chartWidth / 2}
        y={chartHeight / 2}
        fill="var(--color-series-6)"
        font-size="16"
        font-weight="500"
        text-anchor="middle"
      >
        {belowLuf
          ? 'Frequenz unter der LUF — die D-Schicht absorbiert zu stark'
          : 'Frequenz über der MUF — keine Reflexion'}
      </text>
    {/if}

    <text
      class="chart-axis-label"
      transform="rotate(-90)"
      x={-chartHeight / 2}
      y="-55"
      text-anchor="middle">Höhe (km)</text
    >
  </g>
</svg>

<style>
  /*
   * Illustrative Himmels- und Bodentöne — keine Datenfarben, deshalb lokal
   * statt im globalen Token-Satz, aber mit eigener Fassung für Dunkel.
   */
  .iono-scene {
    --sky-day-top: #87ceeb;
    --sky-day-bottom: #4a90c2;
    --sky-night-top: #1e3a5f;
    --sky-night-bottom: #0a1929;
    --ground-top: #8b4513;
    --ground-bottom: #654321;
    display: block;
    width: 100%;
    height: auto;
  }

  :global(.dark) .iono-scene {
    --sky-day-top: #3b6a94;
    --sky-day-bottom: #24486b;
    --sky-night-top: #0f1f36;
    --sky-night-bottom: #05101c;
    --ground-top: #5c2f0d;
    --ground-bottom: #3d2113;
  }

  .iono-path {
    animation: iono-dash 1s linear infinite;
  }

  @keyframes iono-dash {
    from {
      stroke-dashoffset: 18;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .iono-path {
      animation: none;
    }
  }
</style>
