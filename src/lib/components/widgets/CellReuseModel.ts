/**
 * Rechenmodell des Widgets „Zellraster und Frequenzwiederverwendung".
 *
 * Ein Cluster aus N Zellen verteilt die verfügbaren Kanäle; erst außerhalb des
 * Clusters wird eine Frequenz erneut verwendet. Die Geometrie des Sechseckrasters
 * legt Wiederverwendungsabstand und Störabstand fest.
 *
 * Quellen:
 * - T. S. Rappaport, *Wireless Communications — Principles and Practice*,
 *   2. Aufl., §3.3 „Frequency reuse" und §3.5 „Interference and system
 *   capacity": N = i² + i·j + j², Q = D/R = √(3N), S/I = Q^n / i₀.
 * - 3GPP TS 45.005 / TS 38.104 für die Größenordnung der Zellradien.
 */
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Übliche Zahl gleichkanalstörender Nachbarzellen im ersten Ring. */
export const CO_CHANNEL_INTERFERERS = 6;

/** Reglerbereiche des Widgets. */
export const CELL_REUSE_LIMITS = {
  cellRadiusM: { min: 300, max: 10_000, default: 2000 },
  pathLossExponent: { min: 2.5, max: 4.5, default: 3.5 },
  channelCount: { min: 12, max: 600, default: 84 }
} as const;

export interface ClusterOption {
  /** Clustergröße N */
  n: number;
  /** Verschiebungsschritte im Sechseckraster */
  i: number;
  j: number;
  noteDE: string;
}

/**
 * Gültige Clustergrößen: nur Zahlen der Form i² + i·j + j² lassen sich
 * lückenlos zu einem Sechseckraster fügen (Rappaport §3.3).
 */
export const CLUSTER_OPTIONS: ClusterOption[] = [
  {
    n: 1,
    i: 1,
    j: 0,
    noteDE: 'Jede Zelle nutzt alle Kanäle — höchste Kapazität, keine Störreserve.'
  },
  {
    n: 3,
    i: 1,
    j: 1,
    noteDE: 'Sehr enge Wiederverwendung; üblich in Netzen mit Störungsmittelung.'
  },
  { n: 4, i: 2, j: 0, noteDE: 'Kompromiss zwischen Kapazität und Störabstand.' },
  { n: 7, i: 2, j: 1, noteDE: 'Der Klassiker des analogen und frühen digitalen Mobilfunks.' }
];

/** Clustergröße aus den Verschiebungsschritten: N = i² + i·j + j². */
export function clusterSize(i: number, j: number): number {
  return i * i + i * j + j * j;
}

/** Wiederverwendungsverhältnis Q = D/R = √(3N). */
export function reuseRatio(n: number): number {
  if (!(n > 0)) return 0;
  return Math.sqrt(3 * n);
}

/** Wiederverwendungsabstand D = R·√(3N) in m. */
export function reuseDistanceM(cellRadiusM: number, n: number): number {
  if (!(cellRadiusM > 0)) return 0;
  return cellRadiusM * reuseRatio(n);
}

/**
 * Näherung des Gleichkanal-Störabstands:
 *   C/I ≈ Q^n_exp / i₀   →   in dB: 10·log₁₀(Q^n_exp / i₀)
 * mit dem Pfadverlustexponenten n_exp und i₀ Störern im ersten Ring.
 */
export function coChannelCirDb(
  n: number,
  pathLossExponent: number,
  interferers: number = CO_CHANNEL_INTERFERERS
): number {
  const q = reuseRatio(n);
  if (!(q > 0) || !(interferers > 0)) return -Infinity;
  return 10 * safeLog(safeDivide(Math.pow(q, pathLossExponent), interferers, 0), 10, -Infinity);
}

/** Kanäle je Zelle: die Systemkanäle werden auf den Cluster verteilt. */
export function channelsPerCell(totalChannels: number, n: number): number {
  if (!(n > 0)) return 0;
  return Math.floor(safeDivide(totalChannels, n, 0));
}

/** Achsenkoordinaten einer Zelle im Sechseckraster. */
export interface HexCell {
  q: number;
  r: number;
}

/** Alle Zellen bis zum Ring `rings` um den Ursprung. */
export function hexCells(rings: number): HexCell[] {
  const cells: HexCell[] = [];
  for (let q = -rings; q <= rings; q++) {
    for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) {
      cells.push({ q, r });
    }
  }
  return cells;
}

/**
 * Liegen zwei Zellen im selben Kanalcluster-Gitterpunkt?
 * Der Verschiebungsvektor muss sich ganzzahlig aus u = (i, j) und
 * v = (−j, i+j) zusammensetzen; die Determinante beider ist gerade N.
 */
export function sameChannelGroup(dq: number, dr: number, i: number, j: number): boolean {
  const n = clusterSize(i, j);
  if (!(n > 0)) return false;
  const a = (dq * (i + j) + dr * j) / n;
  const b = (i * dr - j * dq) / n;
  return Number.isInteger(a) && Number.isInteger(b);
}

/**
 * Vertreter der N Kanalgruppen in fester Reihenfolge — Grundlage der
 * Einfärbung. Gesucht wird im Raster um den Ursprung.
 */
export function clusterRepresentatives(i: number, j: number): HexCell[] {
  const n = clusterSize(i, j);
  const reps: HexCell[] = [];
  const span = Math.max(2, n);
  for (let q = -span; q <= span && reps.length < n; q++) {
    for (let r = -span; r <= span && reps.length < n; r++) {
      const known = reps.some((rep) => sameChannelGroup(q - rep.q, r - rep.r, i, j));
      if (!known) reps.push({ q, r });
    }
  }
  return reps;
}

/** Kanalgruppe einer Zelle (0 … N−1); −1, wenn keine Zuordnung gelingt. */
export function cellGroup(
  q: number,
  r: number,
  i: number,
  j: number,
  reps: HexCell[] = clusterRepresentatives(i, j)
): number {
  return reps.findIndex((rep) => sameChannelGroup(q - rep.q, r - rep.r, i, j));
}

/** Mittelpunkt einer Zelle im Bild (spitzes Sechseck, Achsenkoordinaten). */
export function hexCenter(q: number, r: number, sizePx: number): { x: number; y: number } {
  return { x: sizePx * Math.sqrt(3) * (q + r / 2), y: sizePx * 1.5 * r };
}

/** Eckpunkte eines spitzen Sechsecks um einen Mittelpunkt. */
export function hexPoints(cx: number, cy: number, sizePx: number): string {
  const points: string[] = [];
  for (let k = 0; k < 6; k++) {
    const angle = ((60 * k - 30) * Math.PI) / 180;
    points.push(
      `${(cx + sizePx * Math.cos(angle)).toFixed(2)},${(cy + sizePx * Math.sin(angle)).toFixed(2)}`
    );
  }
  return points.join(' ');
}
