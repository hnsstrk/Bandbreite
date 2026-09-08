/**
 * Logik des RCS-Vergleichs (W12): logarithmische Balken der Referenzobjekte
 * und die Reichweitenänderung nach der Radargleichung (R ∝ σ^¼).
 */
import { RCS_REFERENCE, type RcsReference } from '$lib/data/constants';
import { safeDivide, safeLog, safePow } from '$lib/utils/handlers';

/** Exponent der Radargleichung: R_max ∝ σ^(1/4) */
export const RCS_RANGE_EXPONENT = 0.25;

/** Referenzobjekt für die Reichweitenrelation (σ = 1 m²) */
export const DEFAULT_RCS_REFERENCE_ID = 'human';

/** Nach RCS aufsteigend sortierte Referenzobjekte */
export const RCS_OBJECTS: readonly RcsReference[] = [...RCS_REFERENCE].sort(
  (a, b) => a.rcsM2 - b.rcsM2
);

/** Untere/obere Grenze der logarithmischen Skala (eine Dekade Reserve) */
export const RCS_SCALE_MIN_M2 = RCS_OBJECTS[0].rcsM2 / 10;
export const RCS_SCALE_MAX_M2 = RCS_OBJECTS[RCS_OBJECTS.length - 1].rcsM2 * 10;

/** Anteil (0 … 1) auf der logarithmischen Skala */
export function rcsScaleFraction(
  rcsM2: number,
  minM2: number = RCS_SCALE_MIN_M2,
  maxM2: number = RCS_SCALE_MAX_M2
): number {
  if (rcsM2 <= 0 || maxM2 <= minM2) return 0;
  const fraction = safeDivide(
    safeLog(rcsM2, 10, 0) - safeLog(minM2, 10, 0),
    safeLog(maxM2, 10, 0) - safeLog(minM2, 10, 0),
    0
  );
  return Math.max(0, Math.min(1, fraction));
}

/** Verhältnis der Reichweiten zweier Ziele bei sonst gleichem Radar: (σ/σ_ref)^¼ */
export function relativeRadarRange(rcsM2: number, referenceRcsM2: number): number {
  if (rcsM2 <= 0 || referenceRcsM2 <= 0) return 0;
  return safePow(safeDivide(rcsM2, referenceRcsM2, 0), RCS_RANGE_EXPONENT, 0);
}

/** RCS in dBsm (dB bezogen auf 1 m²) */
export function rcsToDbsm(rcsM2: number): number {
  return 10 * safeLog(rcsM2, 10, -Infinity);
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
};

/**
 * Zehnerpotenz als Unicode-Hochzahl, z. B. 1e-5 → „10⁻⁵", 100 → „10²", 5e3 → „5·10³".
 */
export function formatPowerOfTen(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / Math.pow(10, exponent);
  const superscript = String(exponent).split('').map((ch) => SUPERSCRIPT_DIGITS[ch] ?? ch).join('');
  const roundedMantissa = Math.round(mantissa * 10) / 10;
  return roundedMantissa === 1 ? `10${superscript}` : `${roundedMantissa}·10${superscript}`;
}

export function findRcsObject(id: string): RcsReference | undefined {
  return RCS_OBJECTS.find((entry) => entry.id === id);
}
