/**
 * Rechenmodell des Widgets „Bandöffnungen im Tagesgang".
 *
 * Die Frage „welches Band ist gerade offen?" hat zwei Schranken: Nach oben
 * begrenzt die höchste nutzbare Frequenz (MUF) — oberhalb davon durchstößt die
 * Welle die F2-Schicht und kommt nicht zurück. Nach unten begrenzt die
 * D-Schicht, die am Tag die unteren Kurzwellenbänder schluckt (LUF).
 *
 * **Nichts davon wird hier neu gerechnet.** Der Tagesgang der Ionosphäre und
 * die MUF kommen aus `IonosphereDayNightModel.ts` (`mufMHz`,
 * `absorptionIndex`, `illumination`), das seinerseits
 * `calculateCriticalFrequency` und `estimateMUF` aus `$lib/data/propagation`
 * nutzt (Sekantengesetz im sphärischen Spiegelmodell). Die Bandgrenzen stammen
 * aus `$lib/data/amateurBands`.
 *
 * Kontrollwerte: foF2 = 9 MHz um 12 Uhr; MUF über 2000 km = 25,3 MHz
 * (Faktor 2,816), über 3000 km = 29,5 MHz (Faktor 3,28).
 *
 * **Annahme (nicht aus einer Quelle abgeleitet):** Die LUF wird als
 * geradliniger Übergang zwischen einem Nacht- und einem Tageswert
 * angesetzt, gesteuert vom selben Absorptionsmaß wie die D-Schicht im
 * Ionosphären-Widget. Die echte LUF hängt zusätzlich von Sendeleistung,
 * Antennen, Störpegel und Sonnenaktivität ab und hat keine feste Beziehung zur
 * MUF. Alle Zahlen sind Richtwerte mittlerer Breiten bei mittlerer
 * Sonnenaktivität.
 *
 * Quellen:
 * - Davies, K.: *Ionospheric Radio*, §6 (MUF, LUF, Absorption)
 * - ITU-R P.1239 — Referenzwerte der Ionosphäre im Tagesgang
 * - ITU-R P.373 — Definition von MUF und LUF
 * - AFuV Anlage 1 und IARU-R1-Bandplan für die Bandgrenzen
 */

import { AMATEUR_BANDS, type AmateurBand } from '$lib/data/amateurBands';
import { clamp, safeDivide } from '$lib/utils/handlers';
import { absorptionIndex, mufMHz } from './IonosphereDayNightModel';

/** Reglergrenzen des Widgets. */
export const BAND_OPENING_LIMITS = {
  hourOfDay: { min: 0, max: 24, default: 12 },
  distanceKm: { min: 500, max: 4000, default: 2000 }
} as const;

/**
 * Verhältnis der günstigsten Arbeitsfrequenz zur MUF. Der Wert 0,85 ist die
 * klassische Faustregel für die FOT (frequency of optimum traffic).
 * Quelle: Davies, *Ionospheric Radio*, §6.
 */
export const OWF_FACTOR = 0.85;

/**
 * Schranken der geschätzten LUF in MHz — **Annahme**, siehe Modulkopf.
 * Nachts ist die D-Schicht weg, am Mittag schluckt sie alles darunter.
 */
export const LUF_NIGHT_MHZ = 1.8;
export const LUF_DAY_MHZ = 5;

/** Kennungen der acht klassischen Kurzwellenbänder, von unten nach oben. */
export const OPENING_BAND_IDS = [
  'band-80m',
  'band-40m',
  'band-30m',
  'band-20m',
  'band-17m',
  'band-15m',
  'band-12m',
  'band-10m'
] as const;

/** Die acht Bänder in aufsteigender Frequenz. */
export const OPENING_BANDS: AmateurBand[] = OPENING_BAND_IDS.map(
  (id) => AMATEUR_BANDS.find((band) => band.id === id) as AmateurBand
).filter(Boolean);

/** Bandmitte in MHz — die Frequenz, mit der das Band bewertet wird. */
export function bandCenterMHz(band: AmateurBand): number {
  return (band.minHz + band.maxHz) / 2 / 1e6;
}

/**
 * Geschätzte niedrigste nutzbare Frequenz in MHz.
 * Annahme: geradliniger Übergang zwischen Nacht- und Tageswert, gesteuert vom
 * Absorptionsmaß der D-Schicht.
 */
export function lufMHz(hourOfDay: number): number {
  const t = clamp(absorptionIndex(hourOfDay), 0, 1);
  return LUF_NIGHT_MHZ + (LUF_DAY_MHZ - LUF_NIGHT_MHZ) * t;
}

/** Günstigste Arbeitsfrequenz (FOT) in MHz: 85 % der MUF. */
export function owfMHz(hourOfDay: number, distanceKm: number): number {
  return OWF_FACTOR * mufMHz(hourOfDay, distanceKm);
}

/** Zustand eines Bandes zur gewählten Stunde. */
export type BandStatus = 'offen' | 'gedaempft' | 'geschlossen';

/** Klartext je Zustand. */
export const STATUS_LABEL: Record<BandStatus, string> = {
  offen: 'offen',
  gedaempft: 'gedämpft (D-Schicht)',
  geschlossen: 'geschlossen (über der MUF)'
};

/**
 * Zustand einer Frequenz: über der MUF geschlossen, unter der LUF von der
 * D-Schicht gedämpft, dazwischen offen.
 */
export function frequencyStatus(
  frequencyMHz: number,
  hourOfDay: number,
  distanceKm: number
): BandStatus {
  if (frequencyMHz > mufMHz(hourOfDay, distanceKm)) return 'geschlossen';
  if (frequencyMHz < lufMHz(hourOfDay)) return 'gedaempft';
  return 'offen';
}

/** Bewertung eines Bandes zur gewählten Stunde. */
export interface BandOpening {
  id: string;
  nameDE: string;
  centerMHz: number;
  minHz: number;
  maxHz: number;
  status: BandStatus;
  /** Abstand zur MUF in dB-freier Form: f / MUF, 0 … ∞ */
  mufRatio: number;
}

/** Zustand aller acht Bänder zur gewählten Stunde. */
export function bandOpenings(hourOfDay: number, distanceKm: number): BandOpening[] {
  const muf = mufMHz(hourOfDay, distanceKm);
  return OPENING_BANDS.map((band) => {
    const centerMHz = bandCenterMHz(band);
    return {
      id: band.id,
      nameDE: band.nameDE,
      centerMHz,
      minHz: band.minHz,
      maxHz: band.maxHz,
      status: frequencyStatus(centerMHz, hourOfDay, distanceKm),
      mufRatio: safeDivide(centerMHz, muf, 0)
    };
  });
}

/** Ein Punkt der Tageskurve. */
export interface DayCurvePoint {
  hourOfDay: number;
  mufMHz: number;
  owfMHz: number;
  lufMHz: number;
}

/**
 * MUF, FOT und LUF über 24 Stunden.
 *
 * @param distanceKm Sprungdistanz in km
 * @param samples Stützstellen über den Tag (einschließlich 0 und 24 Uhr)
 */
export function dayCurve(distanceKm: number, samples: number = 145): DayCurvePoint[] {
  const count = Math.max(2, Math.round(samples));
  return Array.from({ length: count }, (_, index) => {
    const hourOfDay = (index / (count - 1)) * 24;
    return {
      hourOfDay,
      mufMHz: mufMHz(hourOfDay, distanceKm),
      owfMHz: owfMHz(hourOfDay, distanceKm),
      lufMHz: lufMHz(hourOfDay)
    };
  });
}

/** Größter Wert der MUF über den Tag, für die Achsenskalierung. */
export function peakMufMHz(distanceKm: number): number {
  return dayCurve(distanceKm, 49).reduce((max, point) => Math.max(max, point.mufMHz), 0);
}
