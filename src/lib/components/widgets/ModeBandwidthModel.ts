/**
 * Rechenmodell des Widgets „Betriebsarten und ihre Bandbreiten".
 *
 * Die Bandbreite einer Betriebsart entscheidet darüber, wie viel Rauschleistung
 * der Empfänger aufnimmt: N = k·T·B. Halbe Bandbreite bedeutet 3 dB weniger
 * Rauschen — der Grund, warum Telegrafie und schmalbandige Digimodes weit
 * unterhalb der Sprechfunkgrenze arbeiten.
 *
 * Quellen der Bandbreiten:
 * - IARU Region 1, HF-Bandplan: höchstens 200 Hz im CW-Segment, 2700 Hz für
 *   Sprechfunk (Schmalbandsegmente).
 * - WSJT-X User Guide: FT8 belegt etwa 50 Hz je Signal, 15-s-Zeitschlitze.
 * - PSK31-Beschreibung (G3PLX): 31,25 Bd BPSK, belegte Bandbreite rund 60 Hz.
 * - RTTY im Amateurfunk: 45,45 Bd, Shift 170 Hz → rund 250 Hz.
 * - AFuV Anlage 1 und Bandplan: FM-Relaisbetrieb im 12,5-kHz-Raster.
 * - ATV in 70 cm und 23 cm: mehrere Megahertz Videobandbreite.
 *
 * Rauschleistung aus `$lib/utils/calculations` (k·T·B, 290 K).
 */
import { calculateThermalNoiseDbm } from '$lib/utils/calculations';
import { safeDivide, safeLog } from '$lib/utils/handlers';

export interface OperatingMode {
  id: string;
  label: string;
  /** Belegte Bandbreite in Hz */
  bandwidthHz: number;
  kindDE: string;
  noteDE: string;
}

/** Betriebsarten in aufsteigender Bandbreite. */
export const AMATEUR_MODES: OperatingMode[] = [
  {
    id: 'ft8',
    label: 'FT8',
    bandwidthHz: 50,
    kindDE: 'digital, 15-s-Zeitschlitze',
    noteDE:
      'Feste Nachrichtenlänge und starke Fehlerkorrektur; arbeitet noch weit unter der Rauschgrenze.'
  },
  {
    id: 'psk31',
    label: 'PSK31',
    bandwidthHz: 60,
    kindDE: 'digital, Tastaturbetrieb',
    noteDE: '31,25 Baud Phasenumtastung — Echtzeitbetrieb mit sehr wenig Bandbreite.'
  },
  {
    id: 'cw',
    label: 'CW (Telegrafie)',
    bandwidthHz: 200,
    kindDE: 'analog, Handzeichen',
    noteDE: 'Der Mensch ist der Dekoder. Der Empfänger filtert meist auf 250 bis 500 Hz.'
  },
  {
    id: 'rtty',
    label: 'RTTY',
    bandwidthHz: 250,
    kindDE: 'digital, Frequenzumtastung',
    noteDE: '45,45 Baud mit 170 Hz Shift — das klassische Fernschreibverfahren.'
  },
  {
    id: 'ssb',
    label: 'SSB (Sprechfunk)',
    bandwidthHz: 2700,
    kindDE: 'analog, Einseitenband',
    noteDE: 'Sprechfunk mit unterdrücktem Träger; Bezugsgröße der Schmalbandsegmente.'
  },
  {
    id: 'fm',
    label: 'FM (Relaisbetrieb)',
    bandwidthHz: 12_500,
    kindDE: 'analog, Frequenzmodulation',
    noteDE:
      'Rauschfrei im Nahbereich, aber im Kanalraster von 12,5 kHz — das Vielfache einer SSB-Verbindung.'
  },
  {
    id: 'atv',
    label: 'ATV (Amateurfernsehen)',
    bandwidthHz: 5.5e6,
    kindDE: 'digital oder analog, Bewegtbild',
    noteDE: 'Nur oberhalb 430 MHz möglich: Bewegtbild braucht Megahertz statt Kilohertz.'
  }
];

/** Bezugsbetriebsart des Vergleichs. */
export const REFERENCE_MODE_ID = 'ssb';

/** Wählbare Maßstäbe der Balkendarstellung in Hz. */
export const MODE_SCALES = [
  { id: 'schmal', label: 'Schmalbandfenster 3 kHz', spanHz: 3000 },
  { id: 'fm', label: 'FM-Kanal 20 kHz', spanHz: 20_000 },
  { id: 'atv', label: 'Fernsehkanal 6 MHz', spanHz: 6e6 }
];

/** Rauschleistung in dBm bei 290 K für die Bandbreite einer Betriebsart. */
export function noiseFloorDbm(bandwidthHz: number, temperatureK?: number): number {
  return calculateThermalNoiseDbm(bandwidthHz, temperatureK);
}

/**
 * Störabstandsgewinn gegenüber einer Bezugsbandbreite:
 *   ΔSNR = 10·log₁₀(B_ref / B)
 * Positiv bedeutet: Diese Betriebsart nimmt weniger Rauschen auf.
 */
export function noiseAdvantageDb(bandwidthHz: number, referenceHz: number): number {
  if (!(bandwidthHz > 0) || !(referenceHz > 0)) return 0;
  return 10 * safeLog(safeDivide(referenceHz, bandwidthHz, 1), 10, 0);
}

/** Anteil einer Bandbreite am gewählten Maßstab (0 … 1, oben gekappt). */
export function scaleFraction(bandwidthHz: number, spanHz: number): number {
  if (!(spanHz > 0)) return 0;
  return Math.min(1, safeDivide(bandwidthHz, spanHz, 0));
}

/** Passt die Betriebsart vollständig in den gewählten Maßstab? */
export function fitsScale(bandwidthHz: number, spanHz: number): boolean {
  return bandwidthHz <= spanHz;
}

/** Betriebsart nach Kennung. */
export function findMode(id: string): OperatingMode | undefined {
  return AMATEUR_MODES.find((mode) => mode.id === id);
}

/** Bandbreite der Bezugsbetriebsart (SSB). */
export function referenceBandwidthHz(): number {
  return findMode(REFERENCE_MODE_ID)?.bandwidthHz ?? 2700;
}
