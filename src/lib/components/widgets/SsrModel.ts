/**
 * Reines Rechenmodell des Sekundärradar-Widgets: Abfrage auf 1030 MHz,
 * Antwort auf 1090 MHz, Impulslagen der Modi A, C und S sowie die Umsetzung
 * eines Squawk-Codes in das Impulsbild des Antwortrahmens.
 *
 * Quellen der Zahlenwerte:
 * - ICAO Annex 10, Vol. IV (Surveillance and Collision Avoidance Systems),
 *   Kap. 3.1: Impulsabstände P1/P3, Antwortrahmen, Modus-S-Abfrageformat
 * - EUROCONTROL, Principles of Mode S Operation and Interrogator Codes
 *
 * Kein DOM, keine Svelte-Abhängigkeit — vollständig testbar.
 */
import { calculateRoundTripTime } from '$lib/utils/radar';
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { safeDivide } from '$lib/utils/handlers';

/** Abfragefrequenz der Bodenstation (Uplink) in Hz. */
export const SSR_INTERROGATION_HZ = 1030e6;
/** Antwortfrequenz des Transponders (Downlink) in Hz. */
export const SSR_REPLY_HZ = 1090e6;

/** Impulsdauer der Abfrageimpulse P1, P2, P3 in µs. */
export const INTERROGATION_PULSE_WIDTH_US = 0.8;
/** Abstand P1 → P2 (Nebenkeulenunterdrückung) in µs. */
export const P1_P2_SPACING_US = 2.0;
/** Abstand P1 → P3: 8 µs im Modus A (Kennung). */
export const MODE_A_P1_P3_US = 8;
/** Abstand P1 → P3: 21 µs im Modus C (Flughöhe). */
export const MODE_C_P1_P3_US = 21;

/** Beginn des Datenimpulses P6 nach P2 in µs (Modus S). */
export const MODE_S_P6_OFFSET_US = 2.75;
/** Dauer von P6 bei kurzer Modus-S-Abfrage (56 Datenbits) in µs. */
export const MODE_S_P6_SHORT_US = 16.25;
/** Lage der Synchronisations-Phasenumkehr innerhalb von P6 in µs. */
export const MODE_S_SYNC_REVERSAL_US = 1.25;

/** Abstand der Rahmenimpulse F1 und F2 des Antwortrahmens in µs. */
export const REPLY_FRAME_US = 20.3;
/** Rasterabstand der Informationsimpulse im Antwortrahmen in µs. */
export const REPLY_SLOT_US = 1.45;
/** Impulsdauer im Antwortrahmen in µs. */
export const REPLY_PULSE_WIDTH_US = 0.45;
/** Lage des Kennungsimpulses SPI nach F2 in µs. */
export const REPLY_SPI_OFFSET_US = 4.35;
/** Anzahl der Informationsimpulse (12 Datenbits + ungenutzter X-Impuls). */
export const REPLY_SLOT_COUNT = 13;

/** Verzögerung im Transponder zwischen P3 und F1 in µs (ICAO: 3 ± 0,5 µs). */
export const TRANSPONDER_DELAY_US = 3;

/** Länge der weltweit eindeutigen Modus-S-Adresse in Bit. */
export const MODE_S_ADDRESS_BITS = 24;
/** Preambel der Modus-S-Antwort: Impulslagen in µs. */
export const MODE_S_PREAMBLE_US = [0, 1.0, 3.5, 4.5] as const;
/** Dauer eines Datenbits der Modus-S-Antwort (Pulspositionsmodulation) in µs. */
export const MODE_S_BIT_US = 1;
/** Beginn des Datenblocks nach dem ersten Preambelimpuls in µs. */
export const MODE_S_DATA_BLOCK_START_US = 8;
/** Datenbits der kurzen bzw. langen Modus-S-Antwort. */
export const MODE_S_REPLY_BITS = { kurz: 56, lang: 112 } as const;

/** Anzahl der möglichen Squawk-Codes: 4 Oktalziffern = 8⁴. */
export const SQUAWK_CODE_COUNT = 8 ** 4;

/** Reihenfolge der Informationsimpulse zwischen F1 und F2 (ICAO Annex 10 Vol. IV). */
export const REPLY_SLOTS = [
  'C1',
  'A1',
  'C2',
  'A2',
  'C4',
  'A4',
  'X',
  'B1',
  'D1',
  'B2',
  'D2',
  'B4',
  'D4'
] as const;
export type ReplySlot = (typeof REPLY_SLOTS)[number];

/** Vorbelegte Codes mit fester Bedeutung (ICAO Doc 4444). */
export const SQUAWK_PRESETS = [
  { code: '7700', meaningDE: 'Luftnotfall' },
  { code: '7600', meaningDE: 'Funkausfall' },
  { code: '7500', meaningDE: 'widerrechtliche Einmischung' },
  { code: '1000', meaningDE: 'Modus-S-Betrieb, Kennung über die Adresse' },
  { code: '7000', meaningDE: 'Sichtflug ohne besondere Zuweisung (Europa)' }
] as const;

export const DEFAULT_SQUAWK = '7700';

export type SsrMode = 'a' | 'c' | 's';

export const SSR_MODES: { id: SsrMode; label: string; purposeDE: string }[] = [
  { id: 'a', label: 'Modus A (Kennung)', purposeDE: 'fragt den vierstelligen Squawk-Code ab' },
  { id: 'c', label: 'Modus C (Flughöhe)', purposeDE: 'fragt die barometrische Höhe ab' },
  {
    id: 's',
    label: 'Modus S (selektiv)',
    purposeDE: 'spricht ein Luftfahrzeug über seine 24-Bit-Adresse an'
  }
];

/** Ein Impuls im Zeitdiagramm. */
export interface SsrPulse {
  id: string;
  label: string;
  /** Beginn relativ zum Bezugspunkt der Gruppe in µs */
  startUs: number;
  widthUs: number;
  /** Gesetzte Datenimpulse werden ausgefüllt, ungesetzte nur angedeutet. */
  active: boolean;
  kind: 'frame' | 'control' | 'data' | 'block';
}

/** Abstand P1 → P3 des jeweiligen Modus in µs (Modus S kennt kein P3). */
export function interrogationSpacingUs(mode: SsrMode): number {
  if (mode === 'a') return MODE_A_P1_P3_US;
  if (mode === 'c') return MODE_C_P1_P3_US;
  return MODE_S_P6_OFFSET_US + P1_P2_SPACING_US;
}

/** Impulsfolge der Abfrage auf 1030 MHz. */
export function interrogationPulses(mode: SsrMode): SsrPulse[] {
  const p1: SsrPulse = {
    id: 'p1',
    label: 'P1',
    startUs: 0,
    widthUs: INTERROGATION_PULSE_WIDTH_US,
    active: true,
    kind: 'frame'
  };
  const p2: SsrPulse = {
    id: 'p2',
    label: 'P2',
    startUs: P1_P2_SPACING_US,
    widthUs: INTERROGATION_PULSE_WIDTH_US,
    active: true,
    kind: 'control'
  };
  if (mode === 's') {
    return [
      p1,
      p2,
      {
        id: 'p6',
        label: 'P6 (DPSK-Daten)',
        startUs: P1_P2_SPACING_US + MODE_S_P6_OFFSET_US,
        widthUs: MODE_S_P6_SHORT_US,
        active: true,
        kind: 'block'
      }
    ];
  }
  return [
    p1,
    p2,
    {
      id: 'p3',
      label: 'P3',
      startUs: interrogationSpacingUs(mode),
      widthUs: INTERROGATION_PULSE_WIDTH_US,
      active: true,
      kind: 'frame'
    }
  ];
}

/** Gesamtdauer der Abfrage in µs (Beginn P1 bis Ende des letzten Impulses). */
export function interrogationDurationUs(mode: SsrMode): number {
  const last = interrogationPulses(mode).at(-1);
  return last ? last.startUs + last.widthUs : 0;
}

/** Prüft einen Squawk-Code: genau vier Oktalziffern 0000 … 7777. */
export function parseSquawk(raw: string): string | null {
  const text = raw.trim();
  return /^[0-7]{4}$/.test(text) ? text : null;
}

/** Die vier Oktalziffern A, B, C, D eines Squawk-Codes. */
export function squawkDigits(code: string): Record<'A' | 'B' | 'C' | 'D', number> {
  const valid = parseSquawk(code) ?? '0000';
  return {
    A: Number(valid[0]),
    B: Number(valid[1]),
    C: Number(valid[2]),
    D: Number(valid[3])
  };
}

/**
 * Zustand der 13 Informationsimpulse eines Antwortrahmens.
 * Jede Oktalziffer wird von drei Impulsen mit den Wertigkeiten 1, 2 und 4
 * getragen; der Impuls X bleibt in der Zivilluftfahrt ungenutzt.
 */
export function squawkPulseStates(code: string): Record<ReplySlot, boolean> {
  const digits = squawkDigits(code);
  const states = {} as Record<ReplySlot, boolean>;
  for (const slot of REPLY_SLOTS) {
    if (slot === 'X') {
      states[slot] = false;
      continue;
    }
    const digit = digits[slot[0] as 'A' | 'B' | 'C' | 'D'];
    const weight = Number(slot[1]);
    states[slot] = (digit & weight) !== 0;
  }
  return states;
}

/** Antwortrahmen auf 1090 MHz: F1, 13 Informationsimpulse, F2, optional SPI. */
export function replyPulses(code: string, withSpi = false): SsrPulse[] {
  const states = squawkPulseStates(code);
  const pulses: SsrPulse[] = [
    {
      id: 'f1',
      label: 'F1',
      startUs: 0,
      widthUs: REPLY_PULSE_WIDTH_US,
      active: true,
      kind: 'frame'
    }
  ];
  REPLY_SLOTS.forEach((slot, index) => {
    pulses.push({
      id: slot.toLowerCase(),
      label: slot,
      startUs: (index + 1) * REPLY_SLOT_US,
      widthUs: REPLY_PULSE_WIDTH_US,
      active: states[slot],
      kind: 'data'
    });
  });
  pulses.push({
    id: 'f2',
    label: 'F2',
    startUs: REPLY_FRAME_US,
    widthUs: REPLY_PULSE_WIDTH_US,
    active: true,
    kind: 'frame'
  });
  if (withSpi) {
    pulses.push({
      id: 'spi',
      label: 'SPI',
      startUs: REPLY_FRAME_US + REPLY_SPI_OFFSET_US,
      widthUs: REPLY_PULSE_WIDTH_US,
      active: true,
      kind: 'control'
    });
  }
  return pulses;
}

/** Modus-S-Antwort: vier Preambelimpulse und der Datenblock (56 oder 112 bit). */
export function modeSReplyPulses(long = false): SsrPulse[] {
  const bits = long ? MODE_S_REPLY_BITS.lang : MODE_S_REPLY_BITS.kurz;
  return [
    ...MODE_S_PREAMBLE_US.map((startUs, index) => ({
      id: `pre${index + 1}`,
      label: `Preambel ${index + 1}`,
      startUs,
      widthUs: 0.5,
      active: true,
      kind: 'frame' as const
    })),
    {
      id: 'block',
      label: `${bits} Datenbits (PPM)`,
      startUs: MODE_S_DATA_BLOCK_START_US,
      widthUs: bits * MODE_S_BIT_US,
      active: true,
      kind: 'block'
    }
  ];
}

/** Gesamtdauer der Antwort in µs. */
export function replyDurationUs(mode: SsrMode, withSpi = false): number {
  const pulses = mode === 's' ? modeSReplyPulses() : replyPulses(DEFAULT_SQUAWK, withSpi);
  const last = pulses.at(-1);
  return last ? last.startUs + last.widthUs : 0;
}

export interface SsrTiming {
  /** Einweg-Laufzeit in µs */
  onewayUs: number;
  /** Laufzeit hin und zurück in µs */
  roundTripUs: number;
  /** Feste Verzögerung im Transponder in µs */
  transponderDelayUs: number;
  /** Abfrage → erster Antwortimpuls am Boden in µs */
  totalUs: number;
  /** Höchste Abfragerate, bevor sich Antworten überlappen, in Hz */
  maxInterrogationRateHz: number;
}

/**
 * Zeitbilanz einer Abfrage: Weil Abfrage und Antwort auf verschiedenen
 * Frequenzen laufen, kommt zur reinen Laufzeit die feste Transponder-
 * verzögerung von 3 µs hinzu (ICAO Annex 10 Vol. IV).
 */
export function computeSsrTiming(
  rangeM: number,
  mode: SsrMode = 'a',
  c: number = speedOfLight.value
): SsrTiming {
  const roundTripS = calculateRoundTripTime(rangeM, c);
  const roundTripUs = roundTripS * 1e6;
  const totalUs = roundTripUs + TRANSPONDER_DELAY_US;
  // Belegte Zeit je Abfrage: Laufzeit, Transponderverzögerung und Antwortdauer.
  const occupancyUs = totalUs + replyDurationUs(mode);
  return {
    onewayUs: roundTripUs / 2,
    roundTripUs,
    transponderDelayUs: TRANSPONDER_DELAY_US,
    totalUs,
    maxInterrogationRateHz: safeDivide(1e6, occupancyUs, 0)
  };
}
