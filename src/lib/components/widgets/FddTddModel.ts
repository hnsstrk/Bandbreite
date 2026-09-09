/**
 * Rechenmodell des Widgets „FDD und TDD im Zeit-Frequenz-Bild".
 *
 * Beim Frequenzduplex (FDD) liegen Uplink und Downlink in getrennten Blöcken
 * mit festem Duplexabstand; beide Richtungen senden gleichzeitig. Beim
 * Zeitduplex (TDD) teilen sich beide Richtungen einen Träger und wechseln sich
 * im Slot-Raster ab — dazwischen braucht es eine Schutzzeit, in der niemand
 * sendet, damit sich Aussendungen aus verschiedenen Zellen nicht überholen.
 *
 * Bandgrenzen kommen aus `$lib/data/mobileNetworks` (MOBILE_BANDS), nicht aus
 * eigenen Zahlen.
 *
 * Formeln:
 *   Duplexabstand   = |f_DL,unten − f_UL,unten|
 *   Slotdauer       = 1 ms / (Δf / 15 kHz)         (NR-Numerologie)
 *   Symboldauer     = Slotdauer / 14               (normales zyklisches Präfix)
 *   Schutzzeit      = n_Symbole · Symboldauer
 *   Zellgrenze      = c · Schutzzeit / 2           (Hin- und Rückweg)
 *
 * Quellen:
 * - 3GPP TS 36.101, Tabelle 5.5-1 — E-UTRA-Bänder (Band 20: Uplink
 *   832–862 MHz, Downlink 791–821 MHz)
 * - 3GPP TS 38.101-1 — NR-Bänder FR1 (n78: 3300–3800 MHz, TDD)
 * - 3GPP TS 38.211 §4.3 — Numerologie, 14 Symbole je Slot
 * - 3GPP TS 38.213 §11.1 — Slot-Formate und Sonderslot
 */

import { MOBILE_BANDS, type MobileBand } from '$lib/data/mobileNetworks';
import { SPEED_OF_LIGHT } from '$lib/data/constants';
import { safeDivide } from '$lib/utils/handlers';

// ============================================================================
// FDD: gepaartes Spektrum
// ============================================================================

/** Gepaarte Bänder aus den Projektdaten, in der Reihenfolge des Katalogs. */
export const FDD_BANDS: MobileBand[] = MOBILE_BANDS.filter((band) => band.duplex === 'FDD');

/** Ungepaarte Bänder mit Zeitduplex. */
export const TDD_BANDS: MobileBand[] = MOBILE_BANDS.filter((band) => band.duplex === 'TDD');

/** Band zu einer Kennung; fällt auf das erste Band der Liste zurück. */
export function findBand(list: MobileBand[], id: string): MobileBand {
  return list.find((band) => band.id === id) ?? list[0];
}

/** Breite eines Frequenzblocks in Hz. */
export function blockWidthHz(minHz: number, maxHz: number): number {
  return Math.max(0, maxHz - minHz);
}

/**
 * Duplexabstand in Hz: der Abstand zwischen den unteren Kanten beider Blöcke.
 * Band 20 (Uplink 832 MHz, Downlink 791 MHz) ergibt 41 MHz.
 */
export function duplexSpacingHz(band: MobileBand): number {
  if (band.duplex !== 'FDD') return 0;
  return Math.abs(band.downlinkMinHz - band.uplinkMinHz);
}

/**
 * Liegt der Downlink unterhalb des Uplinks? Das ist die Ausnahme — Band 20
 * ist der bekannteste Fall.
 */
export function isReversedDuplex(band: MobileBand): boolean {
  return band.duplex === 'FDD' && band.downlinkMinHz < band.uplinkMinHz;
}

/** Lücke zwischen den beiden Blöcken in Hz (das „Duplexloch"). */
export function duplexGapHz(band: MobileBand): number {
  if (band.duplex !== 'FDD') return 0;
  return isReversedDuplex(band)
    ? Math.max(0, band.uplinkMinHz - band.downlinkMaxHz)
    : Math.max(0, band.downlinkMinHz - band.uplinkMaxHz);
}

// ============================================================================
// TDD: Slot-Muster
// ============================================================================

/** Symbole je Slot bei normalem zyklischem Präfix (TS 38.211). */
export const SYMBOLS_PER_SLOT = 14;
/** Slotdauer bei 15 kHz Unterträgerabstand in s. */
export const REFERENCE_SLOT_S = 1e-3;
/** Bezugsunterträgerabstand der Numerologie in Hz. */
export const REFERENCE_SCS_HZ = 15e3;

/** Ein Slot ist Downlink (D), Sonderslot (S) oder Uplink (U). */
export type SlotKind = 'D' | 'S' | 'U';

/**
 * Baut das Slot-Muster einer Periode: `dlSlots` Downlink-Slots, ein
 * Sonderslot, `ulSlots` Uplink-Slots. Drei und eins ergeben das im 3,5-GHz-Band
 * verbreitete Muster DDDSU.
 */
export function slotPattern(dlSlots: number, ulSlots: number): SlotKind[] {
  const dl = Math.max(0, Math.round(dlSlots));
  const ul = Math.max(0, Math.round(ulSlots));
  return [
    ...(Array.from({ length: dl }, () => 'D') as SlotKind[]),
    'S',
    ...(Array.from({ length: ul }, () => 'U') as SlotKind[])
  ];
}

/** Muster als Zeichenkette, z. B. „DDDSU". */
export function patternString(pattern: SlotKind[]): string {
  return pattern.join('');
}

/** Muster aus einer Zeichenkette lesen; unbekannte Zeichen entfallen. */
export function parsePattern(text: string): SlotKind[] {
  return text
    .toUpperCase()
    .split('')
    .filter((c): c is SlotKind => c === 'D' || c === 'S' || c === 'U');
}

/** Anteile der drei Slot-Arten an der Periode, jeweils 0 … 1. */
export function slotShares(pattern: SlotKind[]): { dl: number; special: number; ul: number } {
  const total = pattern.length;
  const count = (kind: SlotKind) => pattern.filter((slot) => slot === kind).length;
  return {
    dl: safeDivide(count('D'), total, 0),
    special: safeDivide(count('S'), total, 0),
    ul: safeDivide(count('U'), total, 0)
  };
}

/** Slotdauer in s für einen Unterträgerabstand in Hz. */
export function slotDurationS(subcarrierSpacingHz: number): number {
  return safeDivide(REFERENCE_SLOT_S * REFERENCE_SCS_HZ, subcarrierSpacingHz, 0);
}

/** Symboldauer in s (Slot geteilt durch 14). */
export function symbolDurationS(subcarrierSpacingHz: number): number {
  return safeDivide(slotDurationS(subcarrierSpacingHz), SYMBOLS_PER_SLOT, 0);
}

/** Dauer einer Periode aus `pattern` in s. */
export function periodDurationS(pattern: SlotKind[], subcarrierSpacingHz: number): number {
  return pattern.length * slotDurationS(subcarrierSpacingHz);
}

/** Schutzzeit in s: `symbols` Symbole des Sonderslots bleiben leer. */
export function guardTimeS(symbols: number, subcarrierSpacingHz: number): number {
  return Math.max(0, Math.round(symbols)) * symbolDurationS(subcarrierSpacingHz);
}

/**
 * Größte Zellentfernung, die eine Schutzzeit erlaubt: In der Lücke muss das
 * letzte Downlink-Symbol den entferntesten Teilnehmer erreicht haben und
 * dessen Antwort zurücklaufen können — deshalb der Faktor ½.
 */
export function guardRangeM(guardSeconds: number): number {
  return Math.max(0, (guardSeconds * SPEED_OF_LIGHT) / 2);
}

/** Unterträgerabstände der NR-Numerologie in FR1, in Hz. */
export const SCS_OPTIONS_HZ = [15e3, 30e3, 60e3] as const;

/** Voreinstellung des Widgets: DDDSU bei 30 kHz mit zwei Schutzsymbolen. */
export const FDD_TDD_DEFAULTS = {
  fddBandId: 'band-n20',
  tddBandId: 'band-n78',
  dlSlots: 3,
  ulSlots: 1,
  guardSymbols: 2,
  subcarrierSpacingHz: 30e3
} as const;

/** Reglergrenzen. */
export const FDD_TDD_LIMITS = {
  dlSlots: { min: 1, max: 8 },
  ulSlots: { min: 1, max: 4 },
  guardSymbols: { min: 1, max: 6 }
} as const;
