/**
 * Bereiche, Presets und Geometrie des Antennengewinn-Rechners.
 *
 * Gerechnet wird nicht hier: Gewinn, Öffnungswinkel, Wirkfläche, Fernfeld und
 * die Umkehrung stehen in `$lib/utils/antennaMath` bzw. `$lib/data/antennas`.
 */

import { DISTANCE_UNITS, FREQUENCY_UNITS } from '$lib/data/units';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';
import type { PresetChip } from './presetChips.svelte';

/** Spiegeldurchmesser: 5 cm bis 100 m, logarithmisch. */
export const DIAMETER_MIN_M = 0.05;
export const DIAMETER_MAX_M = 100;

/** Frequenzbereich: 100 MHz bis 100 GHz, logarithmisch. */
export const GAIN_FREQUENCY_MIN_HZ = 100e6;
export const GAIN_FREQUENCY_MAX_HZ = 100e9;

/**
 * Flächenwirkungsgrad: unter 30 % liegen nur sehr schlecht ausgeleuchtete
 * Spiegel, über 80 % kommt kein realer Erreger.
 * Quelle: Balanis, Antenna Theory, Kap. 15 (Aperturwirkungsgrad)
 */
export const EFFICIENCY_MIN = 0.3;
export const EFFICIENCY_MAX = 0.8;

/** Gewinnbereich der Umkehrrechnung in dBi. */
export const TARGET_GAIN_MIN_DBI = 10;
export const TARGET_GAIN_MAX_DBI = 80;

/** Einheiten der Durchmessereingabe (Meter und Zentimeter). */
export const DIAMETER_UNITS = [
  { id: 'm', symbol: 'm', factor: 1 },
  { id: 'cm', symbol: 'cm', factor: 0.01 }
];

/** Frequenzeinheiten ohne Hz und THz — dazwischen liegt der Nutzbereich. */
export const GAIN_FREQUENCY_UNITS = FREQUENCY_UNITS.filter(
  (unit) => unit.id !== 'Hz' && unit.id !== 'THz'
);

/** Einheiten der Fernfeldangabe. */
export const FAR_FIELD_UNITS = DISTANCE_UNITS.filter(
  (unit) => unit.id === 'm' || unit.id === 'km'
);

export const ANTENNA_GAIN_PARAMS = {
  d: { default: 0.6, min: DIAMETER_MIN_M, max: DIAMETER_MAX_M },
  f: { default: 11e9, min: GAIN_FREQUENCY_MIN_HZ, max: GAIN_FREQUENCY_MAX_HZ },
  eta: { default: 0.6, min: EFFICIENCY_MIN, max: EFFICIENCY_MAX },
  g: { default: 40, min: TARGET_GAIN_MIN_DBI, max: TARGET_GAIN_MAX_DBI }
} satisfies ParamSpecs;

/** Eine vollständige Antennenkonfiguration als Preset. */
export interface AntennaPreset extends PresetChip {
  /** Spiegeldurchmesser in Metern */
  diameterM: number;
  /** Betriebsfrequenz in Hertz */
  frequencyHz: number;
  /** Flächenwirkungsgrad (0 bis 1) */
  efficiency: number;
}

/**
 * Vier reale Spiegel vom Fernsehempfang bis zur Raumfahrt.
 *
 * Wirkungsgrade sind typische Werte der Bauart:
 * - Offset-Sat-Spiegel und Cassegrain-Anlagen 0,6 … 0,7
 * - Gitterreflektoren büßen durch das Gitter Fläche ein (≈ 0,5)
 * Quellen: Balanis, Antenna Theory, Kap. 15; MPIfR Effelsberg (technische
 * Daten des 100-m-Teleskops); NASA DSN Telecommunications Link Design
 * Handbook 810-005, Modul 104 (70-m-Antennen, X-Band).
 */
export const ANTENNA_PRESETS: AntennaPreset[] = [
  {
    id: 'sat',
    label: 'Sat-Schüssel 60 cm',
    value: 0.6,
    hint: '11 GHz, Offset-Spiegel für den Fernsehempfang',
    diameterM: 0.6,
    frequencyHz: 11e9,
    efficiency: 0.6
  },
  {
    id: 'wlan-gitter',
    label: 'WLAN-Gitter 60 cm',
    value: 0.6,
    hint: '2,4 GHz, Gitterreflektor mit geringerem Wirkungsgrad',
    diameterM: 0.6,
    frequencyHz: 2.4e9,
    efficiency: 0.5
  },
  {
    id: 'effelsberg',
    label: 'Effelsberg 100 m',
    value: 100,
    hint: '1,4 GHz, Radioteleskop des MPIfR',
    diameterM: 100,
    frequencyHz: 1.4e9,
    efficiency: 0.5
  },
  {
    id: 'dsn',
    label: 'DSN 70 m',
    value: 70,
    hint: '8,4 GHz, Deep Space Network der NASA',
    diameterM: 70,
    frequencyHz: 8.4e9,
    efficiency: 0.7
  }
];

/** Frequenz-Presets der Eingabe (Werte in Hertz). */
export const GAIN_FREQUENCY_PRESETS = [
  { label: '1,4 GHz', value: 1.4e9, hint: 'Wasserstofflinie, Radioastronomie' },
  { label: '2,4 GHz', value: 2.4e9, hint: 'WLAN und ISM' },
  { label: '5,8 GHz', value: 5.8e9, hint: 'WLAN 5 und Richtfunk' },
  { label: '8,4 GHz', value: 8.4e9, hint: 'X-Band, Raumfahrt' },
  { label: '11 GHz', value: 11e9, hint: 'Ku-Band, Satellitenfernsehen' },
  { label: '24 GHz', value: 24e9, hint: 'K-Band, Richtfunk' }
];

/**
 * Zeichenmaße des Schüssel-Risses. Der Riss ist schematisch: die Keulenbreite
 * wird auf einen sichtbaren Bereich abgebildet, der Zahlenwert steht daneben.
 */
export const DISH_VIEW_WIDTH = 420;
export const DISH_VIEW_HEIGHT = 210;

/** Kleinster und größter gezeichneter halber Öffnungswinkel in Grad. */
export const DISH_MIN_DRAWN_HALF_ANGLE_DEG = 2;
export const DISH_MAX_DRAWN_HALF_ANGLE_DEG = 32;

/**
 * Bildet den halben Öffnungswinkel auf den zeichenbaren Bereich ab.
 * Sehr schmale Keulen (Bruchteile eines Grades) wären sonst unsichtbar.
 *
 * @param halfAngleDeg tatsächlicher halber Öffnungswinkel in Grad
 * @returns gezeichneter halber Winkel in Grad und ob überzeichnet wurde
 */
export function drawnHalfAngleDeg(halfAngleDeg: number): {
  deg: number;
  exaggerated: boolean;
} {
  if (!Number.isFinite(halfAngleDeg) || halfAngleDeg <= 0) {
    return { deg: DISH_MIN_DRAWN_HALF_ANGLE_DEG, exaggerated: true };
  }
  const clamped = Math.min(
    DISH_MAX_DRAWN_HALF_ANGLE_DEG,
    Math.max(DISH_MIN_DRAWN_HALF_ANGLE_DEG, halfAngleDeg)
  );
  return { deg: clamped, exaggerated: Math.abs(clamped - halfAngleDeg) > 0.05 };
}
