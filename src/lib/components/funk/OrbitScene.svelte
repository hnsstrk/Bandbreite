<script lang="ts">
  /**
   * Bühne des Orbit-Rechners: Erde, Bahnkreis, Satellit und die Ausleuchtzone.
   *
   * Der Bahnradius ist logarithmisch aufgetragen — sonst verschwände die
   * Raumstation im Erdrand, während die geostationäre Bahn aus dem Bild liefe.
   */
  import { EARTH_RADIUS_EQUATORIAL } from '$lib/data/constants';
  import { orbitRadius } from '$lib/utils/orbitMath';

  interface Props {
    altitudeM: number;
    /** Halber Zentriwinkel der Ausleuchtzone in Grad. */
    centralAngleDeg: number;
    /** Beschriftung der Bahn, z. B. „geostationär". */
    labelDE: string;
  }

  let { altitudeM, centralAngleDeg, labelDE }: Props = $props();

  const W = 460;
  const H = 340;
  const CX = W / 2;
  const CY = H / 2;
  /** Bildradius der Erde in px. */
  const EARTH_PX = 54;
  /** Größter darstellbarer Bahnradius in px. */
  const MAX_PX = 150;
  /** Obergrenze der Skala als Vielfaches des Erdradius (etwas über GEO). */
  const MAX_RATIO = 7;

  const ratio = $derived(orbitRadius(altitudeM) / EARTH_RADIUS_EQUATORIAL);

  /** Logarithmische Abbildung des Radienverhältnisses auf Bildpunkte. */
  const orbitPx = $derived(EARTH_PX + (MAX_PX - EARTH_PX) * Math.min(Math.log(ratio) / Math.log(MAX_RATIO), 1));

  /** Der Satellit steht rechts oben auf der Bahn. */
  const SAT_ANGLE_DEG = -35;
  const satX = $derived(CX + orbitPx * Math.cos((SAT_ANGLE_DEG * Math.PI) / 180));
  const satY = $derived(CY + orbitPx * Math.sin((SAT_ANGLE_DEG * Math.PI) / 180));

  /** Kreisbogen der Ausleuchtzone auf der Erdoberfläche. */
  const footprintPath = $derived.by(() => {
    const half = Math.min(centralAngleDeg, 89.9);
    const a = ((SAT_ANGLE_DEG - half) * Math.PI) / 180;
    const b = ((SAT_ANGLE_DEG + half) * Math.PI) / 180;
    const x1 = CX + EARTH_PX * Math.cos(a);
    const y1 = CY + EARTH_PX * Math.sin(a);
    const x2 = CX + EARTH_PX * Math.cos(b);
    const y2 = CY + EARTH_PX * Math.sin(b);
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${EARTH_PX},${EARTH_PX} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  });

  /** Endpunkte der Sichtlinien zum Rand der Ausleuchtzone. */
  const edges = $derived(
    [-1, 1].map((sign) => {
      const angle = ((SAT_ANGLE_DEG + sign * Math.min(centralAngleDeg, 89.9)) * Math.PI) / 180;
      return { x: CX + EARTH_PX * Math.cos(angle), y: CY + EARTH_PX * Math.sin(angle) };
    })
  );
</script>

<svg viewBox="0 0 {W} {H}" aria-hidden="true">
  <!-- Bahnkreis -->
  <circle
    cx={CX}
    cy={CY}
    r={orbitPx}
    fill="none"
    stroke="var(--color-line-strong)"
    stroke-width="1.5"
    stroke-dasharray="5,5"
  />

  <!-- Sichtkegel -->
  {#each edges as edge, i (i)}
    <line
      x1={satX}
      y1={satY}
      x2={edge.x}
      y2={edge.y}
      stroke="var(--color-series-3-solid)"
      stroke-width="1"
      opacity="0.7"
    />
  {/each}

  <!-- Erde -->
  <circle cx={CX} cy={CY} r={EARTH_PX} fill="var(--color-series-1)" opacity="0.35" />
  <circle cx={CX} cy={CY} r={EARTH_PX} fill="none" stroke="var(--color-series-1-solid)" stroke-width="2" />
  <text x={CX} y={CY + 5} text-anchor="middle" class="label">Erde</text>

  <!-- Ausleuchtzone -->
  <path d={footprintPath} fill="none" stroke="var(--color-series-3-solid)" stroke-width="4" stroke-linecap="round" />

  <!-- Satellit -->
  <g transform="translate({satX},{satY})">
    <rect x="-9" y="-6" width="18" height="12" rx="2" fill="var(--color-series-3-solid)" />
    <rect x="-20" y="-3" width="9" height="6" fill="var(--color-series-3-solid)" opacity="0.7" />
    <rect x="11" y="-3" width="9" height="6" fill="var(--color-series-3-solid)" opacity="0.7" />
  </g>
  <text x={satX} y={satY - 16} text-anchor="middle" class="label">{labelDE}</text>

  <text x={CX} y={H - 12} text-anchor="middle" class="hint">
    Bahnradius logarithmisch aufgetragen — nicht maßstäblich
  </text>
</svg>

<style>
  .label {
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    fill: var(--color-ink);
  }

  .hint {
    font-size: 0.75rem;
    fill: var(--color-ink-subtle);
  }
</style>
