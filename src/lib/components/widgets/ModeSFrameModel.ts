/**
 * Rechenmodell des Widgets „Modus-S-Antwort im Bitfeld" (DF17).
 *
 * Die Zeitkonstanten des Antwortrahmens stammen aus `SsrModel.ts`
 * (Preambel, Bitdauer, Rahmenlängen) — hier kommt nur die Feldaufteilung des
 * langen Formats hinzu.
 *
 * Quellen:
 * - ICAO Annex 10, Vol. IV, §3.1.2.3: Antwortrahmen des Modus S — Preambel aus
 *   vier Impulsen bei 0; 1,0; 3,5 und 4,5 µs, Impulsbreite 0,5 µs, Datenblock
 *   ab 8 µs mit 1 Mbit/s in Pulslagemodulation, 56 oder 112 Bit.
 * - ICAO Annex 10, Vol. IV, §3.1.2.3.2: Feldaufteilung DF, CA, AA, ME, PI.
 * - RTCA DO-260B / EUROCAE ED-102A: ADS-B über DF17 (Extended Squitter).
 */
import {
  MODE_S_ADDRESS_BITS,
  MODE_S_BIT_US,
  MODE_S_DATA_BLOCK_START_US,
  MODE_S_PREAMBLE_US,
  MODE_S_REPLY_BITS
} from './SsrModel';

/** Datenrate des Antwortdatenblocks in bit/s (1 Bit je Mikrosekunde). */
export const MODE_S_BIT_RATE_BPS = 1e6;

/** Impulsbreite der Preambel und der Datenimpulse in µs (ICAO Annex 10). */
export const MODE_S_PULSE_WIDTH_US = 0.5;

/** Formatkennung der ADS-B-Aussendung (Extended Squitter). */
export const DF17_FORMAT_NUMBER = 17;

/** Bitlänge des langen Formats (DF17). */
export const DF17_TOTAL_BITS = MODE_S_REPLY_BITS.lang;

export interface ModeSField {
  id: string;
  /** Kurzbezeichnung wie in ICAO Annex 10 */
  label: string;
  nameDE: string;
  /** Erstes Bit, 1-basiert wie in der Norm */
  startBit: number;
  bits: number;
  purposeDE: string;
}

/** Feldaufteilung der 112 Bit einer DF17-Antwort. */
export const DF17_FIELDS: ModeSField[] = [
  {
    id: 'df',
    label: 'DF',
    nameDE: 'Downlink-Format',
    startBit: 1,
    bits: 5,
    purposeDE:
      'Formatkennung der Antwort. DF17 (binär 10001) kennzeichnet die unaufgefordert ausgesendete ADS-B-Nachricht; DF11 ist die Allrufantwort.'
  },
  {
    id: 'ca',
    label: 'CA',
    nameDE: 'Fähigkeitskennung',
    startBit: 6,
    bits: 3,
    purposeDE:
      'Sagt der Bodenstation, welche Modus-S-Fähigkeiten das Luftfahrzeug hat und ob es sich am Boden oder in der Luft befindet.'
  },
  {
    id: 'aa',
    label: 'AA',
    nameDE: 'ICAO-Adresse',
    startBit: 9,
    bits: MODE_S_ADDRESS_BITS,
    purposeDE:
      'Weltweit eindeutige Kennung des Luftfahrzeugs, vergeben über den Eintragungsstaat. 24 Bit ergeben rund 16,8 Millionen Adressen.'
  },
  {
    id: 'me',
    label: 'ME',
    nameDE: 'Nachrichtenfeld',
    startBit: 33,
    bits: 56,
    purposeDE:
      'Der eigentliche Inhalt. Die ersten 5 Bit sind der Typencode und bestimmen, ob Kennung, Position, Höhe oder Geschwindigkeit folgen.'
  },
  {
    id: 'pi',
    label: 'PI',
    nameDE: 'Prüffeld',
    startBit: 89,
    bits: 24,
    purposeDE:
      'Prüfsumme über die Nachricht, in die bei adressierten Formaten die ICAO-Adresse eingerechnet ist. Wer nicht gemeint ist, bekommt beim Prüfen Unsinn heraus.'
  }
];

/** Summe der Feldlängen — muss die Rahmenlänge ergeben. */
export function totalFieldBits(fields: readonly ModeSField[] = DF17_FIELDS): number {
  return fields.reduce((sum, field) => sum + field.bits, 0);
}

/** Feld, in dem ein 1-basiertes Bit liegt. */
export function fieldForBit(
  bit: number,
  fields: readonly ModeSField[] = DF17_FIELDS
): ModeSField | undefined {
  return fields.find((field) => bit >= field.startBit && bit < field.startBit + field.bits);
}

export interface ModeSFieldTiming {
  /** Beginn des Feldes im Rahmen in µs (Preambel eingerechnet) */
  startUs: number;
  /** Dauer des Feldes in µs */
  durationUs: number;
}

/** Zeitlage eines Feldes im Antwortrahmen. */
export function fieldTiming(field: ModeSField): ModeSFieldTiming {
  return {
    startUs: MODE_S_DATA_BLOCK_START_US + (field.startBit - 1) * MODE_S_BIT_US,
    durationUs: field.bits * MODE_S_BIT_US
  };
}

/** Gesamtdauer eines Antwortrahmens in µs (Preambel plus Datenblock). */
export function frameDurationUs(bits: number = DF17_TOTAL_BITS): number {
  return MODE_S_DATA_BLOCK_START_US + bits * MODE_S_BIT_US;
}

/** Preambelimpulse als Zeitpunkt und Breite in µs. */
export function preamblePulses(): { startUs: number; widthUs: number }[] {
  return MODE_S_PREAMBLE_US.map((startUs) => ({ startUs, widthUs: MODE_S_PULSE_WIDTH_US }));
}

/**
 * Pulslagemodulation: Eine Eins liegt in der ersten Hälfte des Bitintervalls,
 * eine Null in der zweiten. Das Ergebnis ist der Impulsbeginn relativ zum
 * Bitanfang in µs.
 */
export function ppmPulseOffsetUs(bit: 0 | 1): number {
  return bit === 1 ? 0 : MODE_S_BIT_US / 2;
}

/** Binärdarstellung eines Feldwertes mit fester Bitzahl (für die Anzeige). */
export function toBinary(value: number, bits: number): string {
  if (!Number.isFinite(value) || value < 0 || bits <= 0) return '';
  return (value >>> 0).toString(2).padStart(bits, '0').slice(-bits);
}

/** Anzahl der Adressen, die 24 Bit hergeben. */
export function addressSpace(bits: number = MODE_S_ADDRESS_BITS): number {
  return 2 ** bits;
}
