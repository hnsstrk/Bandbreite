/**
 * Rechenmodell des Widgets „VOR: Radial aus dem Phasenvergleich".
 *
 * Ein Drehfunkfeuer sendet zwei 30-Hz-Signale: ein rundstrahlendes
 * Referenzsignal (frequenzmoduliert auf einem Hilfsträger von 9960 Hz) und ein
 * veränderliches Signal, das durch das mit 30 Umdrehungen je Sekunde rotierende
 * Richtdiagramm entsteht. Die Phasendifferenz beider Signale ist der Radial —
 * die missweisende Richtung, in der das Luftfahrzeug vom Funkfeuer aus liegt.
 *
 * Quelle: ICAO Annex 10, Vol. I, §3.3 „VHF omnidirectional radio range (VOR)"
 * — Frequenzbereich 108 bis 117,975 MHz, Hilfsträger 9960 Hz, Drehzahl 30 Hz,
 * Phasengleichheit in Richtung magnetisch Nord; Vollausschlag der
 * Kursablageanzeige ±10° (EUROCAE/RTCA-Empfängernormen).
 */

/** Hilfsträger des Referenzsignals in Hz. */
export const VOR_SUBCARRIER_HZ = 9960;

/** Drehfrequenz des Richtdiagramms und Frequenz beider Nutzsignale in Hz. */
export const VOR_ROTATION_HZ = 30;

/** Frequenzbereich der VOR-Aussendungen in Hz. */
export const VOR_MIN_HZ = 108e6;
export const VOR_MAX_HZ = 117.975e6;

/** Kanalraster in Hz. */
export const VOR_CHANNEL_SPACING_HZ = 50e3;

/** Vollausschlag der Kursablageanzeige in Grad. */
export const VOR_FULL_SCALE_DEG = 10;

/** Ein Punkt der Anzeige entspricht 2 Grad Ablage. */
export const VOR_DEGREES_PER_DOT = 2;

/** Winkel auf 0 … 360 Grad bringen. */
export function normalizeBearing(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return ((deg % 360) + 360) % 360;
}

/** Kürzeste Winkeldifferenz von `to` nach `from`, −180 … +180 Grad. */
export function shortestDifference(from: number, to: number): number {
  const diff = normalizeBearing(from) - normalizeBearing(to);
  return ((diff + 540) % 360) - 180;
}

/**
 * Phasendifferenz zwischen veränderlichem und Referenzsignal in Grad.
 * Sie ist definitionsgemäß gleich dem Radial: Nach Norden fallen beide
 * Signale zusammen, nach Osten liegt das veränderliche Signal 90 Grad zurück.
 */
export function phaseDifferenceDeg(radialDeg: number): number {
  return normalizeBearing(radialDeg);
}

/** Missweisende Richtung vom Luftfahrzeug zum Funkfeuer. */
export function bearingToStation(radialDeg: number): number {
  return normalizeBearing(radialDeg + 180);
}

export interface VorIndication {
  /** Radial, auf dem das Luftfahrzeug steht */
  radialDeg: number;
  /** Anzeige TO oder FROM */
  flag: 'TO' | 'FROM';
  /** Kursablage in Grad (positiv: Luftfahrzeug rechts des gewählten Kurses) */
  deviationDeg: number;
  /** Ausschlag der Anzeige, −1 … +1 */
  deflection: number;
  /** Ablage in Punkten der Skala */
  dots: number;
  /** Vollausschlag erreicht? */
  fullScale: boolean;
}

/**
 * Anzeige eines VOR-Empfängers für einen eingestellten Kurs (OBS).
 * Innerhalb von ±90 Grad um den eingestellten Kurs zeigt das Gerät FROM,
 * sonst TO — dann bezieht sich die Ablage auf den Gegenkurs.
 */
export function vorIndication(
  radialDeg: number,
  obsDeg: number,
  fullScaleDeg: number = VOR_FULL_SCALE_DEG
): VorIndication {
  const radial = normalizeBearing(radialDeg);
  const fromDiff = shortestDifference(radial, obsDeg);
  const isFrom = Math.abs(fromDiff) <= 90;
  const deviationDeg = isFrom ? fromDiff : -shortestDifference(radial, obsDeg + 180);
  const deflection = Math.max(-1, Math.min(1, deviationDeg / fullScaleDeg));
  return {
    radialDeg: radial,
    flag: isFrom ? 'FROM' : 'TO',
    deviationDeg,
    deflection,
    dots: deviationDeg / VOR_DEGREES_PER_DOT,
    fullScale: Math.abs(deviationDeg) >= fullScaleDeg
  };
}

/**
 * Momentanwert eines der beiden 30-Hz-Signale.
 * `turnFraction` ist der Anteil einer Umdrehung (0 … 1), `phaseDeg` die
 * Phasenlage gegenüber dem Referenzsignal.
 */
export function signalSample(turnFraction: number, phaseDeg: number = 0): number {
  return Math.sin(2 * Math.PI * turnFraction - (phaseDeg * Math.PI) / 180);
}

/**
 * Zahl der VOR-Kanäle im Frequenzbereich (Probe des Rasters): Der letzte
 * Kanal liegt auf 117,950 MHz, die 117,975 MHz sind die obere Bandgrenze.
 */
export function vorChannelCount(): number {
  return Math.floor((VOR_MAX_HZ - VOR_MIN_HZ) / VOR_CHANNEL_SPACING_HZ) + 1;
}
