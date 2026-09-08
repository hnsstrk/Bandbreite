/**
 * Berechnete Tabellen der Radar-Unterkapitel.
 *
 * Zahlenwerte entstehen aus den zentralen Datenmodulen und Utilities —
 * im Kapiteltext steht nie eine getippte Zahl.
 */
import { IEEE_BANDS } from '$lib/data/bands';
import { RCS_REFERENCE } from '$lib/data/constants';
import { formatFrequency, formatNumber, formatRcs, formatDistance } from '$lib/utils/formatting';
import { formatPowerOfTen } from '$lib/components/widgets/RcsComparisonModel';
import {
  calculateRoundTripTime,
  calculateRangeResolution,
  calculateUnambiguousRange,
  calculateUnambiguousVelocity
} from '$lib/utils/radar';
import { frequencyToWavelength } from '$lib/utils/calculations';

export const RADAR_BAND_IDS = ['l', 's', 'c', 'x', 'ku', 'k', 'ka', 'v', 'w'] as const;

const RADAR_BAND_APPLICATIONS: Record<string, string> = {
  l: 'Flugsicherung (ATC), Langstrecken-Überwachung, Wetterradar',
  s: 'Flughafenradar, Wetterradar, Schiffsradar',
  c: 'Wetterradar, Satellitenradar, Schiffsnavigation',
  x: 'Marine-Radar, Feuerleitung, Wetterradar',
  ku: 'Hochauflösende Kartierung, Satelliten-TV',
  k: 'Polizei-Radar, Verkehrsüberwachung',
  ka: 'Polizei-Radar, Flughafen-Oberflächenradar',
  v: 'Millimeterwellen-Radar, Forschung',
  w: 'Automotive-Radar (77 GHz), Objekterkennung'
};

/** Beispielwerte für den Fließtext – berechnet, nicht getippt */
const EXAMPLE_RANGE_M = 150_000;
const EXAMPLE_PULSE_S = 1e-6;
const EXAMPLE_PRF_HZ = 1000;
const EXAMPLE_CARRIER_HZ = 10e9;
/** PRF-Stufen für die Gegenüberstellung im Abschnitt „Eindeutigkeit" */
const PRF_STEPS_HZ = [250, 1000, 4000, 12_000] as const;

export const exampleRoundTripUs = formatNumber(calculateRoundTripTime(EXAMPLE_RANGE_M) * 1e6, 0);
export const exampleResolution = formatDistance(calculateRangeResolution(EXAMPLE_PULSE_S), 0);
export const exampleUnambiguous = formatDistance(calculateUnambiguousRange(EXAMPLE_PRF_HZ), 1);
export const exampleWavelengthM = frequencyToWavelength(EXAMPLE_CARRIER_HZ);

export const radarBandRows = IEEE_BANDS.filter((band) =>
  (RADAR_BAND_IDS as readonly string[]).includes(band.id)
).map((band) => [
  band.nameDE,
  `${formatFrequency(band.minHz, 0)} – ${formatFrequency(band.maxHz, 0)}`,
  RADAR_BAND_APPLICATIONS[band.id] ?? '—'
]);

export const rcsRows = RCS_REFERENCE.map((entry) => [
  entry.nameDE,
  `${formatPowerOfTen(entry.rcsM2)} m²`,
  formatRcs(entry.rcsM2),
  entry.descriptionDE
]);

/** Eindeutigkeitsgrenzen über der PRF — bei 10 GHz gerechnet. */
export const prfRows = PRF_STEPS_HZ.map((prf) => [
  `${formatNumber(prf, 0)} Hz`,
  formatDistance(calculateUnambiguousRange(prf), 0),
  `± ${formatNumber(calculateUnambiguousVelocity(prf, exampleWavelengthM), 1)} m/s`,
  prf <= 250
    ? 'Weitreichende Überwachung, Geschwindigkeit stark mehrdeutig'
    : prf <= 1000
      ? 'Flugsicherung: Entfernung eindeutig, Doppler begrenzt'
      : prf <= 4000
        ? 'Mittlere PRF: beides mehrdeutig, beides auflösbar'
        : 'Hohe PRF: Doppler eindeutig, Entfernung stark mehrdeutig'
]);
