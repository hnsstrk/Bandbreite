/**
 * Rechenmodell des Widgets „DAB-Gleichwellennetz".
 *
 * Im Gleichwellennetz (SFN) senden alle Sender denselben Block mit demselben
 * Inhalt zeitsynchron. Ob ein zweites Signal hilft oder stört, entscheidet
 * allein sein Laufzeitunterschied gegenüber dem Schutzintervall.
 *
 * Quellen:
 * - ETSI EN 300 401, §14.5 (Tab. 38): Übertragungsmodi I bis IV mit
 *   Symboldauer, Schutzintervall, Trägerzahl und Trägerabstand.
 * - ETSI TR 101 496-3: Planung von Gleichwellennetzen, Echos innerhalb des
 *   Schutzintervalls tragen zum Nutzsignal bei.
 */
import { SPEED_OF_LIGHT } from '$lib/data/constants';
import { DAB_BLOCK_BANDWIDTH_HZ } from '$lib/data/broadcast';
import { safeDivide, safeLog } from '$lib/utils/handlers';

export interface DabMode {
  id: string;
  label: string;
  /** Nutzbare Symboldauer T_u in s */
  usefulSymbolS: number;
  /** Schutzintervall Δ in s */
  guardS: number;
  /** Zahl der Unterträger */
  carriers: number;
  /** Trägerabstand in Hz */
  carrierSpacingHz: number;
  noteDE: string;
}

/** Übertragungsmodi nach ETSI EN 300 401, Tab. 38. */
export const DAB_MODES: DabMode[] = [
  {
    id: 'I',
    label: 'Modus I (Band III, Gleichwellennetz)',
    usefulSymbolS: 1000e-6,
    guardS: 246e-6,
    carriers: 1536,
    carrierSpacingHz: 1000,
    noteDE:
      'Der Modus des terrestrischen DAB+ in Band III — das längste Schutzintervall und damit große Senderabstände.'
  },
  {
    id: 'II',
    label: 'Modus II (L-Band, kleine Netze)',
    usefulSymbolS: 250e-6,
    guardS: 62e-6,
    carriers: 384,
    carrierSpacingHz: 4000,
    noteDE: 'Für kleine Netze und höhere Frequenzen; verträgt mehr Doppler, aber nur kurze Echos.'
  },
  {
    id: 'III',
    label: 'Modus III (Satellit, unter 3 GHz)',
    usefulSymbolS: 125e-6,
    guardS: 31e-6,
    carriers: 192,
    carrierSpacingHz: 8000,
    noteDE:
      'Kürzestes Schutzintervall, größter Trägerabstand — gedacht für Wege ohne starke Mehrwegeausbreitung.'
  },
  {
    id: 'IV',
    label: 'Modus IV (L-Band, mittlere Netze)',
    usefulSymbolS: 500e-6,
    guardS: 123e-6,
    carriers: 768,
    carrierSpacingHz: 2000,
    noteDE: 'Mittelweg zwischen Modus I und II.'
  }
];

/** Reglerbereiche: Senderabstand und Lage des Empfängers auf der Verbindung. */
export const DAB_SFN_LIMITS = {
  spacingM: { min: 10_000, max: 150_000, default: 60_000 },
  positionPercent: { min: 0, max: 100, default: 20 }
} as const;

/** Pfadverlustexponent der Pegelabschätzung (Freiraum). */
export const DAB_SFN_PATH_EXPONENT = 2;

/** Kleinster gerechneter Abstand zum Sender in m (Sender stehen nicht im Punkt). */
const MIN_DISTANCE_M = 500;

/** Wegstrecke, die im Schutzintervall zurückgelegt wird: d = c · Δ. */
export function guardDistanceM(guardS: number, c: number = SPEED_OF_LIGHT): number {
  if (!(guardS > 0)) return 0;
  return guardS * c;
}

/** Laufzeitunterschied aus einem Wegunterschied. */
export function delayForPathDifference(
  pathDifferenceM: number,
  c: number = SPEED_OF_LIGHT
): number {
  if (!(pathDifferenceM > 0)) return 0;
  return safeDivide(pathDifferenceM, c, 0);
}

export interface DabSfnResult {
  /** Abstand zum ersten Sender in m */
  distance1M: number;
  /** Abstand zum zweiten Sender in m */
  distance2M: number;
  /** Wegunterschied in m */
  pathDifferenceM: number;
  /** Laufzeitunterschied in s */
  delayS: number;
  /** Länge des Schutzintervalls als Weg in m */
  guardDistanceM: number;
  /** Liegt das zweite Signal im Schutzintervall? */
  withinGuard: boolean;
  /** Pegelunterschied beider Signale in dB (positiv: erstes Signal stärker) */
  levelDifferenceDb: number;
  /** Gewinn durch die Addition beider Signale in dB (0, wenn außerhalb) */
  combinedGainDb: number;
  /** Verbleibender Spielraum bis zum Ende des Schutzintervalls in m */
  marginM: number;
}

/**
 * Empfänger auf der Verbindungslinie zweier Sender.
 * `positionFraction` = 0 steht am ersten Sender, 1 am zweiten.
 */
export function computeDabSfn(
  spacingM: number,
  positionFraction: number,
  guardS: number,
  pathExponent: number = DAB_SFN_PATH_EXPONENT
): DabSfnResult {
  const clamped = Math.min(1, Math.max(0, positionFraction));
  const distance1M = Math.max(MIN_DISTANCE_M, spacingM * clamped);
  const distance2M = Math.max(MIN_DISTANCE_M, spacingM * (1 - clamped));
  const pathDifferenceM = Math.abs(distance2M - distance1M);
  const guardM = guardDistanceM(guardS);
  const near = Math.min(distance1M, distance2M);
  const far = Math.max(distance1M, distance2M);
  const levelDifferenceDb = 10 * pathExponent * safeLog(safeDivide(far, near, 1), 10, 0);
  const withinGuard = pathDifferenceM <= guardM;
  const powerRatio = Math.pow(safeDivide(near, far, 0), pathExponent);
  return {
    distance1M,
    distance2M,
    pathDifferenceM,
    delayS: delayForPathDifference(pathDifferenceM),
    guardDistanceM: guardM,
    withinGuard,
    levelDifferenceDb,
    combinedGainDb: withinGuard ? 10 * safeLog(1 + powerRatio, 10, 0) : 0,
    marginM: guardM - pathDifferenceM
  };
}

/** Größter Senderabstand, bei dem jeder Punkt der Linie im Schutzintervall bleibt. */
export function maxSpacingForGuardM(guardS: number): number {
  return guardDistanceM(guardS);
}

/** Trägerabstand aus der Symboldauer zur Probe: Δf = 1 / T_u. */
export function carrierSpacingFromSymbol(usefulSymbolS: number): number {
  return safeDivide(1, usefulSymbolS, 0);
}

/** Belegte Bandbreite eines Blocks aus Trägerzahl und Abstand (Probe). */
export function blockBandwidthHz(mode: DabMode): number {
  return mode.carriers * mode.carrierSpacingHz;
}

/** Nennbandbreite eines DAB-Blocks aus den Stammdaten. */
export const DAB_NOMINAL_BANDWIDTH_HZ = DAB_BLOCK_BANDWIDTH_HZ;
