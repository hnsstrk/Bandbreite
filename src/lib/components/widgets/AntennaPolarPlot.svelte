<script lang="ts">
  /**
   * Polardiagramm einer Richtcharakteristik.
   *
   * Erwartet fertige Abtastwerte aus `antennaMath.ts`. 0° zeigt nach rechts,
   * die Winkel laufen mathematisch positiv gegen den Uhrzeigersinn.
   */
  import { DEG_PER_RAD, type PatternSample } from '$lib/utils/antennaMath';
  import { formatNumber } from '$lib/utils/formatting';

  interface Props {
    samples: PatternSample[];
    /** Skala der radialen Achse */
    scale?: 'db' | 'linear';
    /** Unterste Ringbeschriftung der dB-Skala */
    floorDb?: number;
    /** Hauptstrahlrichtung in Grad, wird als Strahl eingezeichnet */
    mainLobeDeg?: number;
    /** Halbwertsbreite in Grad, wird als Kreissektor angedeutet */
    beamwidthDeg?: number;
  }

  let { samples, scale = 'db', floorDb = -40, mainLobeDeg, beamwidthDeg }: Props = $props();

  const VIEW_SIZE = 420;
  const CENTER = VIEW_SIZE / 2;
  const RADIUS = 168;
  /** Ringe der dB-Skala. */
  const DB_RINGS = [0, -10, -20, -30, -40];
  /** Ringe der linearen Skala. */
  const LINEAR_RINGS = [1, 0.75, 0.5, 0.25];
  /** Winkelabstand der Speichen in Grad. */
  const SPOKE_STEP_DEG = 30;

  const spokes = Array.from({ length: 360 / SPOKE_STEP_DEG }, (_value, index) => index * SPOKE_STEP_DEG);

  function radiusFor(sample: PatternSample): number {
    if (scale === 'linear') return sample.field * RADIUS;
    const clamped = Math.max(sample.db, floorDb);
    return ((clamped - floorDb) / -floorDb) * RADIUS;
  }

  function ringRadius(value: number): number {
    if (scale === 'linear') return value * RADIUS;
    return ((value - floorDb) / -floorDb) * RADIUS;
  }

  function pointAt(angleDeg: number, radius: number): { x: number; y: number } {
    const angleRad = angleDeg / DEG_PER_RAD;
    return {
      x: CENTER + radius * Math.cos(angleRad),
      y: CENTER - radius * Math.sin(angleRad)
    };
  }

  const path = $derived.by(() => {
    let d = '';
    for (let index = 0; index < samples.length; index += 1) {
      const { x, y } = pointAt(samples[index].angleDeg, radiusFor(samples[index]));
      d += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return `${d}Z`;
  });

  const rings = $derived(scale === 'linear' ? LINEAR_RINGS : DB_RINGS);
  const beamSector = $derived.by(() => {
    if (mainLobeDeg === undefined || beamwidthDeg === undefined || beamwidthDeg >= 360) return '';
    const half = beamwidthDeg / 2;
    const start = pointAt(mainLobeDeg - half, RADIUS);
    const end = pointAt(mainLobeDeg + half, RADIUS);
    const largeArc = beamwidthDeg > 180 ? 1 : 0;
    return `M${CENTER} ${CENTER}L${start.x.toFixed(2)} ${start.y.toFixed(2)}A${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}Z`;
  });
</script>

<svg viewBox="0 0 {VIEW_SIZE} {VIEW_SIZE}" class="polar" aria-hidden="true">
  {#if beamSector}
    <path d={beamSector} class="sector" />
  {/if}

  {#each rings as ring (ring)}
    <circle cx={CENTER} cy={CENTER} r={ringRadius(ring)} class="ring" />
    <text x={CENTER + 3} y={CENTER - ringRadius(ring) - 3} class="ring-label">
      {scale === 'linear' ? formatNumber(ring, 2) : `${formatNumber(ring, 0)} dB`}
    </text>
  {/each}

  {#each spokes as spoke (spoke)}
    {@const end = pointAt(spoke, RADIUS)}
    {@const label = pointAt(spoke, RADIUS + 16)}
    <line x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} class="spoke" />
    <text x={label.x} y={label.y + 4} class="spoke-label">{spoke}°</text>
  {/each}

  <path d={path} class="pattern" />

  {#if mainLobeDeg !== undefined}
    {@const tip = pointAt(mainLobeDeg, RADIUS)}
    <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y} class="main-lobe" />
  {/if}
</svg>

<style>
  .polar {
    display: block;
    width: 100%;
    max-width: 28rem;
    height: auto;
    margin-inline: auto;
  }

  .ring,
  .spoke {
    fill: none;
    stroke: var(--color-grid);
    stroke-width: 1;
  }

  .ring-label,
  .spoke-label {
    fill: var(--color-ink-subtle);
    font-size: var(--text-2xs);
    text-anchor: middle;
  }

  .ring-label {
    text-anchor: start;
  }

  .pattern {
    fill: var(--color-series-1);
    fill-opacity: 0.18;
    stroke: var(--color-series-1);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .sector {
    fill: var(--color-marker);
    opacity: 0.16;
  }

  .main-lobe {
    stroke: var(--color-series-3);
    stroke-width: 1.6;
    stroke-dasharray: 5 4;
  }
</style>
