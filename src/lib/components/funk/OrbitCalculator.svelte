<script lang="ts">
  /**
   * Orbit-Rechner: Bahnhöhe → Umlaufzeit, Bahngeschwindigkeit, Signallaufzeit,
   * Sichtbarkeitsdauer, Ausleuchtzone, Freiraumdämpfung und Doppler.
   *
   * Gerechnet wird in `utils/orbitMath.ts` und `utils/calculations.ts`; hier
   * steht nur die Bedienung.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import OrbitScene from './OrbitScene.svelte';
  import { DISTANCE_UNITS, FREQUENCY_UNITS } from '$lib/data/units';
  import {
    formatDistance,
    formatFrequency,
    formatNumber,
    formatPercentage,
    formatPowerDb
  } from '$lib/utils/formatting';
  import { calculateFSPL } from '$lib/utils/calculations';
  import {
    DEFAULT_MIN_ELEVATION_DEG,
    elevationFromCentralAngle,
    maxDopplerShift,
    summarizeOrbit
  } from '$lib/utils/orbitMath';
  import {
    GEO_ALTITUDE_M,
    GPS_ALTITUDE_M,
    IRIDIUM_ALTITUDE_M,
    ISS_ALTITUDE_M,
    STARLINK_ALTITUDE_M
  } from '$lib/data/satelliteSystems';

  /** Grenzen des Höhenreglers in m. */
  const MIN_ALTITUDE_M = 160_000;
  const MAX_ALTITUDE_M = 40_000_000;

  /** Grenzen des Elevationsreglers in Grad. */
  const MIN_ELEVATION_DEG = 0;
  const MAX_ELEVATION_DEG = 90;

  /** Voreinstellung der Frequenz: das Ku-Band-Fernsehen. */
  const DEFAULT_FREQUENCY_HZ = 11.7e9;

  /** Sekunden je Minute und je Stunde. */
  const MINUTE_S = 60;
  const HOUR_S = 3600;
  const MS_PER_S = 1000;

  const MHZ_UNITS = FREQUENCY_UNITS.filter((unit) => ['MHz', 'GHz'].includes(unit.id));
  const KM_UNITS = DISTANCE_UNITS.filter((unit) => ['m', 'km'].includes(unit.id));

  let altitudeM = $state(GEO_ALTITUDE_M);
  let altitudeUnit = $state('km');
  let frequencyHz = $state(DEFAULT_FREQUENCY_HZ);
  let frequencyUnit = $state('GHz');
  let elevationDeg = $state(DEFAULT_MIN_ELEVATION_DEG);

  const presets = [
    { label: 'ISS', value: ISS_ALTITUDE_M, hint: 'Raumstation, 420 km' },
    { label: 'Starlink', value: STARLINK_ALTITUDE_M, hint: '550 km' },
    { label: 'Iridium', value: IRIDIUM_ALTITUDE_M, hint: '780 km' },
    { label: 'GPS', value: GPS_ALTITUDE_M, hint: 'mittlere Bahn, 20 180 km' },
    { label: 'GEO', value: GEO_ALTITUDE_M, hint: 'geostationär, 35 786 km' }
  ];

  const orbit = $derived(summarizeOrbit(altitudeM, elevationDeg));
  const fsplDb = $derived(calculateFSPL(orbit.slantRangeM, frequencyHz));
  /** Elevation am Rand der Ausleuchtzone — Gegenprobe zum eingestellten Mindestwinkel. */
  const edgeElevationDeg = $derived(elevationFromCentralAngle(altitudeM, orbit.centralAngleDeg));
  const dopplerHz = $derived(maxDopplerShift(frequencyHz, altitudeM));

  /** Umlaufzeit als „23 h 56 min" bzw. „93 min". */
  const periodLabel = $derived.by(() => {
    const total = orbit.periodS;
    if (!Number.isFinite(total)) return '—';
    if (total < HOUR_S) return `${formatNumber(total / MINUTE_S, 1)} min`;
    const hours = Math.floor(total / HOUR_S);
    const minutes = Math.round((total % HOUR_S) / MINUTE_S);
    return `${hours} h ${minutes} min`;
  });

  /** Sichtbarkeitsdauer; bei geostationärer Höhe ist sie unbegrenzt. */
  const visibilityLabel = $derived(
    orbit.periodS > 12 * HOUR_S ? 'dauerhaft' : `${formatNumber(orbit.visibilityDurationS / MINUTE_S, 1)} min`
  );

  /** Kurzname der Bahnklasse für die Beschriftung der Bühne. */
  const orbitLabel = $derived(
    altitudeM >= 30_000_000 ? 'geostationär' : altitudeM >= 2_000_000 ? 'mittlere Bahn' : 'niedrige Bahn'
  );
</script>

<WidgetFrame
  title="Orbit-Rechner"
  description="Maßstäbliches Schnittbild von Erde und Bahnkreis mit Satellit, Bodenstation am Rand der Ausleuchtzone, Horizont und Elevationswinkel; Erde und Bahnradius stehen im selben Maßstab."
  footnote="T = 2π·√(r³/µ) mit µ = 3,986·10¹⁴ m³/s²; Schrägentfernung d = √(R² + r² − 2·R·r·cos γ) und Elevation tan ε = (cos γ − R/r)/sin γ nach ITU-R S.1257; Freiraumdämpfung nach ITU-R P.525. Die Sichtbarkeitsdauer gilt für einen zentralen Überflug ohne Erddrehung."
>
  <OrbitScene {altitudeM} centralAngleDeg={orbit.centralAngleDeg} labelDE={orbitLabel} />

  {#snippet controls()}
    <NumberInput
      label="Bahnhöhe"
      bind:value={altitudeM}
      bind:unit={altitudeUnit}
      units={KM_UNITS}
      min={MIN_ALTITUDE_M}
      max={MAX_ALTITUDE_M}
      slider
      sliderScale="log"
      {presets}
    />
    <Slider
      label="Mindest-Elevationswinkel"
      bind:value={elevationDeg}
      min={MIN_ELEVATION_DEG}
      max={MAX_ELEVATION_DEG}
      step={1}
      unitSymbol="Grad"
      format={(value) => `${formatNumber(value, 0)}°`}
      hint="Unter welchem Winkel über dem Horizont die Verbindung noch zählt."
    />
    <NumberInput
      label="Frequenz"
      bind:value={frequencyHz}
      bind:unit={frequencyUnit}
      units={MHZ_UNITS}
      min={100e6}
      max={40e9}
      slider
      sliderScale="log"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard label="Umlaufzeit" value={periodLabel} emphasis="hero" />
    <ResultCard label="Bahngeschwindigkeit" value={`${formatNumber(orbit.velocityMs / 1000, 2)} km/s`} />
    <ResultCard
      label="Signallaufzeit hin und zurück"
      value={`${formatNumber(orbit.roundTripDelayS * MS_PER_S, 1)} ms`}
      secondary={`einfach ${formatNumber(orbit.oneWayDelayS * MS_PER_S, 1)} ms`}
    />
    <ResultCard label="Sichtbar je Überflug" value={visibilityLabel} />
    <ResultCard
      label="Schrägentfernung"
      value={formatDistance(orbit.slantRangeM, 0)}
      secondary={`Ausleuchtzone ${formatDistance(orbit.footprintRadiusM, 0)} Radius`}
    />
    <ResultCard
      label="Freiraumdämpfung"
      value={formatPowerDb(fsplDb, 1)}
      secondary={`bei ${formatFrequency(frequencyHz, 2)}`}
    />
    <ResultCard
      label="Erdabdeckung"
      value={formatPercentage(orbit.coverageFraction, 1, true)}
      hint="Anteil der Erdoberfläche über dem gewählten Winkel"
    />
    <ResultCard label="Doppler (obere Schranke)" value={formatFrequency(dopplerHz, 1)} hint="Δf = f · v / c" />
  {/snippet}

  {#snippet dataTable()}
    <table>
      <caption>Bahngrößen zur eingestellten Höhe</caption>
      <tbody>
        <tr><th scope="row">Bahnhöhe</th><td>{formatDistance(altitudeM, 0)}</td></tr>
        <tr><th scope="row">Umlaufzeit</th><td>{periodLabel}</td></tr>
        <tr><th scope="row">Bahngeschwindigkeit</th><td>{formatNumber(orbit.velocityMs / 1000, 2)} km/s</td></tr>
        <tr><th scope="row">Halber Zentriwinkel</th><td>{formatNumber(orbit.centralAngleDeg, 1)}°</td></tr>
        <tr><th scope="row">Elevationswinkel der Bodenstation</th><td>{formatNumber(edgeElevationDeg, 1)}°</td></tr>
        <tr><th scope="row">Schrägentfernung</th><td>{formatDistance(orbit.slantRangeM, 0)}</td></tr>
        <tr
          ><th scope="row">Signallaufzeit hin und zurück</th><td
            >{formatNumber(orbit.roundTripDelayS * MS_PER_S, 1)} ms</td
          ></tr
        >
        <tr><th scope="row">Sichtbarkeitsdauer</th><td>{visibilityLabel}</td></tr>
        <tr><th scope="row">Freiraumdämpfung</th><td>{formatPowerDb(fsplDb, 1)}</td></tr>
        <tr><th scope="row">Erdabdeckung</th><td>{formatPercentage(orbit.coverageFraction, 1, true)}</td></tr>
      </tbody>
    </table>
  {/snippet}
</WidgetFrame>
