<script lang="ts">
  /**
   * Bühne des Orbit-Rechners: Erde, Bahnkreis, Satellit, Bodenstation und
   * Ausleuchtzone — maßstäblich.
   *
   * Erde und Bahnradius stehen im selben linearen Maßstab (Bildpunkte je
   * Kilometer), deshalb sind Sichtlinie, Horizont und Elevationswinkel
   * geometrisch richtig. Weil zwischen der Raumstation (420 km) und der
   * geostationären Bahn (35 786 km) fast zwei Zehnerpotenzen liegen, gibt es
   * drei Maßstäbe; der kleinste passende wird selbst gewählt.
   *
   * Alle Winkel und Entfernungen kommen aus `utils/orbitMath.ts`.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import { EARTH_RADIUS_EQUATORIAL } from '$lib/data/constants';
  import { formatNumber } from '$lib/utils/formatting';
  import { elevationFromCentralAngle, orbitRadius, slantRangeFromCentralAngle } from '$lib/utils/orbitMath';

  interface Props {
    altitudeM: number;
    /** Halber Zentriwinkel der Ausleuchtzone in Grad. */
    centralAngleDeg: number;
    /** Beschriftung der Bahn, z. B. „geostationär". */
    labelDE: string;
  }

  let { altitudeM, centralAngleDeg, labelDE }: Props = $props();

  const W = 460;
  const H = 420;
  const CX = W / 2;
  /** Der Erdmittelpunkt liegt tief im Bild, der Satellit steht oben. */
  const CY = 350;
  /** Abstand des Satelliten vom oberen Bildrand in px. */
  const TOP_MARGIN = 52;
  /** Größter zeichenbarer Bahnradius in px. */
  const MAX_PX = CY - TOP_MARGIN;

  const M_PER_KM = 1000;
  const EARTH_RADIUS_KM = EARTH_RADIUS_EQUATORIAL / M_PER_KM;
  const DEG = Math.PI / 180;

  /** Maßstäbe: größte Bahnhöhe und Länge des Maßstabbalkens in km. */
  const SCALES = [
    { id: 'leo', label: 'LEO', maxAltitudeKm: 2000, barKm: 2000 },
    { id: 'meo', label: 'MEO', maxAltitudeKm: 25_000, barKm: 10_000 },
    { id: 'geo', label: 'GEO', maxAltitudeKm: 40_000, barKm: 10_000 }
  ] as const;
  type ScaleId = (typeof SCALES)[number]['id'];

  let chosenScaleId = $state<ScaleId | null>(null);

  const altitudeKm = $derived(altitudeM / M_PER_KM);
  /** Kleinster Maßstab, der die eingestellte Bahnhöhe noch fasst. */
  const autoScale = $derived(SCALES.find((entry) => altitudeKm <= entry.maxAltitudeKm) ?? SCALES[2]);
  const scale = $derived(
    SCALES.find((entry) => entry.id === chosenScaleId && altitudeKm <= entry.maxAltitudeKm) ?? autoScale
  );

  /** Bildpunkte je Kilometer — derselbe Wert für Erde, Bahn und Sichtlinien. */
  const pxPerKm = $derived(MAX_PX / (EARTH_RADIUS_KM + scale.maxAltitudeKm));
  const earthPx = $derived(EARTH_RADIUS_KM * pxPerKm);
  const orbitPx = $derived((orbitRadius(altitudeM) / M_PER_KM) * pxPerKm);

  /** Halber Zentriwinkel, auf zeichenbare Werte begrenzt. */
  const gammaDeg = $derived(Math.min(Math.max(centralAngleDeg || 0, 0), 89.9));
  const gamma = $derived(gammaDeg * DEG);

  const elevationDeg = $derived(elevationFromCentralAngle(altitudeM, gammaDeg));
  const slantKm = $derived(slantRangeFromCentralAngle(altitudeM, gammaDeg) / M_PER_KM);

  const sat = $derived({ x: CX, y: CY - orbitPx });
  /** Bodenstation am Rand der Ausleuchtzone: dort gilt der Mindestelevationswinkel. */
  const station = $derived({
    x: CX + earthPx * Math.sin(gamma),
    y: CY - earthPx * Math.cos(gamma)
  });
  /** Gegenüberliegender Rand der Ausleuchtzone. */
  const opposite = $derived({ x: CX - earthPx * Math.sin(gamma), y: station.y });

  /** Einheitsvektor entlang der Erdoberfläche, vom Satelliten weg. */
  const tangent = $derived({ x: Math.cos(gamma), y: Math.sin(gamma) });
  /** Einheitsvektor der Sichtlinie Bodenstation → Satellit. */
  const sight = $derived.by(() => {
    const dx = sat.x - station.x;
    const dy = sat.y - station.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length, length };
  });

  const HORIZON_BACK_PX = 22;
  const HORIZON_FORWARD_PX = 104;
  const horizon = $derived({
    x1: station.x + HORIZON_BACK_PX * tangent.x,
    y1: station.y + HORIZON_BACK_PX * tangent.y,
    x2: station.x - HORIZON_FORWARD_PX * tangent.x,
    y2: station.y - HORIZON_FORWARD_PX * tangent.y
  });

  /** Bogen des Elevationswinkels zwischen Horizont und Sichtlinie (SVG-Pfad). */
  const elevationArc = $derived.by(() => {
    const radius = Math.min(30, sight.length * 0.5);
    const from = Math.atan2(-tangent.y, -tangent.x);
    const to = Math.atan2(sight.y, sight.x);
    // Kürzester Weg zwischen beiden Richtungen — sonst wird der Gegenwinkel gezeichnet.
    const span = Math.atan2(Math.sin(to - from), Math.cos(to - from));
    const steps = 16;
    const points = Array.from({ length: steps + 1 }, (_, index) => {
      const angle = from + (span * index) / steps;
      const x = station.x + radius * Math.cos(angle);
      const y = station.y + radius * Math.sin(angle);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return points.join(' ');
  });

  /** Ausleuchtzone als Bogen auf der Erdoberfläche. */
  const footprintPath = $derived(
    `M${opposite.x.toFixed(1)},${opposite.y.toFixed(1)} A${earthPx.toFixed(1)},${earthPx.toFixed(1)} 0 0 1 ` +
      `${station.x.toFixed(1)},${station.y.toFixed(1)}`
  );

  const barPx = $derived(scale.barKm * pxPerKm);

  function handleScaleClick(id: ScaleId) {
    chosenScaleId = id;
  }
</script>

<div class="orbit-scene">
  <div class="orbit-scene__scales" role="group" aria-label="Maßstab wählen">
    <span class="orbit-scene__hint">Maßstab</span>
    {#each SCALES as entry (entry.id)}
      <Button
        size="sm"
        variant={scale.id === entry.id ? 'primary' : 'ghost'}
        pressed={scale.id === entry.id}
        title={`bis ${formatNumber(entry.maxAltitudeKm, 0)} km Bahnhöhe`}
        onclick={() => handleScaleClick(entry.id)}
      >
        {entry.label}
      </Button>
    {/each}
  </div>

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

    <!-- Erde -->
    <circle cx={CX} cy={CY} r={earthPx} fill="var(--color-series-1)" opacity="0.35" />
    <circle cx={CX} cy={CY} r={earthPx} fill="none" stroke="var(--color-series-1-solid)" stroke-width="2" />

    <!-- Ausleuchtzone -->
    <path d={footprintPath} fill="none" stroke="var(--color-series-3-solid)" stroke-width="4" stroke-linecap="round" />

    <!-- Sichtlinien zu beiden Rändern der Ausleuchtzone -->
    {#each [station, opposite] as edge, index (index)}
      <line
        x1={sat.x}
        y1={sat.y}
        x2={edge.x}
        y2={edge.y}
        stroke="var(--color-series-3-solid)"
        stroke-width="1.2"
        opacity="0.75"
      />
    {/each}

    <!-- Horizont der Bodenstation und Elevationswinkel -->
    <line
      x1={horizon.x1}
      y1={horizon.y1}
      x2={horizon.x2}
      y2={horizon.y2}
      stroke="var(--color-ink-subtle)"
      stroke-width="1"
      stroke-dasharray="4,3"
    />
    <path d={elevationArc} fill="none" stroke="var(--color-series-2-solid)" stroke-width="1.2" />

    <!-- Bodenstation -->
    <circle cx={station.x} cy={station.y} r="3.5" fill="var(--color-series-2-solid)" />
    <text x={station.x + 8} y={station.y + 14} class="label">Bodenstation</text>

    <!-- Satellit -->
    <g transform="translate({sat.x},{sat.y})">
      <rect x="-9" y="-6" width="18" height="12" rx="2" fill="var(--color-series-3-solid)" />
      <rect x="-20" y="-3" width="9" height="6" fill="var(--color-series-3-solid)" opacity="0.7" />
      <rect x="11" y="-3" width="9" height="6" fill="var(--color-series-3-solid)" opacity="0.7" />
    </g>
    <text x={sat.x} y={sat.y - 16} text-anchor="middle" class="label">
      {labelDE} · {formatNumber(altitudeKm, 0)} km
    </text>

    <!-- Maßstabbalken -->
    <g transform="translate(24,30)">
      <line x1="0" y1="0" x2={barPx} y2="0" stroke="var(--color-ink-muted)" stroke-width="1.5" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--color-ink-muted)" stroke-width="1.5" />
      <line x1={barPx} y1="-4" x2={barPx} y2="4" stroke="var(--color-ink-muted)" stroke-width="1.5" />
      <text x={barPx / 2} y="-8" text-anchor="middle" class="value">{formatNumber(scale.barKm, 0)} km</text>
    </g>
  </svg>

  <p class="orbit-scene__readout">
    Sichtlinie zur Bodenstation: Elevation ε = {formatNumber(elevationDeg, 0)}°, Schrägentfernung
    {formatNumber(slantKm, 0)} km · Erde R = {formatNumber(EARTH_RADIUS_KM, 0)} km, Bahnradius
    {formatNumber(EARTH_RADIUS_KM + altitudeKm, 0)} km
  </p>
</div>

<style>
  .orbit-scene {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .orbit-scene__scales {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
  }

  .orbit-scene__readout {
    margin: 0;
    font-size: var(--text-2xs);
    color: var(--color-ink-muted);
  }

  .orbit-scene__hint {
    font-size: var(--text-2xs);
    color: var(--color-ink-subtle);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .label {
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    fill: var(--color-ink);
  }

  .value {
    font-size: 0.75rem;
    fill: var(--color-ink-muted);
  }
</style>
