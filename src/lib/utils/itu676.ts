/**
 * Spezifische Gasdämpfung nach ITU-R P.676-13 (08/2022), Annex 1 – „line-by-line"-Verfahren.
 *
 * Implementiert Gleichungen (1) bis (9) der Recommendation:
 *   γ = 0,1820 · f · [N″_O₂(f) + N″_H₂O(f)]            dB/km
 *   N″(f) = Σᵢ Sᵢ · Fᵢ(f) (+ N″_D(f) nur für Sauerstoff)
 * mit den Linienparametern aus Tabelle 1 (44 O₂-Linien) und Tabelle 2 (35 H₂O-Linien),
 * siehe $lib/data/itu676Lines.ts.
 *
 * Gegenprüfung: Referenzimplementierung ITU-Rpy (itur/models/itu676.py, Klasse _ITU676_13_),
 * numerisch identisch bis auf Fließkomma-Rundung.
 *
 * Gültigkeit: 1 GHz … 1000 GHz (Annex 1), Bodennähe bis ca. 10 km Höhe (Standardatmosphäre).
 *
 * Schrägpfad (Annex 2, Gl. 28): A = (h_o · γ_o + h_w · γ_w) / sin θ mit äquivalenten Höhen h_o, h_w.
 *  - h_w nach P.676-13 Annex 2 Gl. (37) / Tabelle 4 (analytisch).
 *  - h_o nach P.676-12 Annex 2 Gl. (30)–(34) (geschlossene Form). P.676-13 ersetzt diese durch
 *    tabellierte Koeffizienten (Part 1 des Datensatzes, ca. 700 Stützstellen), die hier aus
 *    Platzgründen nicht eingebettet sind; die Abweichung ist für f < 350 GHz klein (< 10 %).
 *
 * Variablenbezeichnungen folgen der Recommendation:
 *   f     Frequenz in GHz
 *   p     Trockenluftdruck in hPa
 *   e     Wasserdampf-Partialdruck in hPa, e = ρ · T / 216,7
 *   θ     300 / T (T in K)
 *   ρ     Wasserdampfdichte in g/m³
 */

import { O2_LINES, H2O_LINES } from '$lib/data/itu676Lines';
import { safeDivide } from '$lib/utils/handlers';

// ============================================================================
// Modellkonstanten (Zahlenwerte aus ITU-R P.676-13 Annex 1)
// ============================================================================

/** Vorfaktor in Gl. (1): γ = 0,1820 · f · N″ */
const GAMMA_PREFACTOR = 0.182;
/** Umrechnung ρ [g/m³] → e [hPa]: e = ρ·T/216,7 (Gl. 4) */
const WATER_VAPOR_PRESSURE_FACTOR = 216.7;
/** Referenztemperatur θ = 300/T */
const THETA_REFERENCE_K = 300;
/** Zeeman-/Doppler-Verbreiterung der O₂-Linien (Gl. 6a): Δf = √(Δf² + 2,25·10⁻⁶) */
const O2_ZEEMAN_BROADENING = 2.25e-6;
/** Doppler-Verbreiterung H₂O (Gl. 6b) */
const H2O_DOPPLER_A = 0.535;
const H2O_DOPPLER_B = 0.217;
const H2O_DOPPLER_C = 2.1316e-12;
/** Debye-Kontinuum trockener Luft (Gl. 8/9) */
const DEBYE_WIDTH_FACTOR = 5.6e-4;
const DEBYE_TERM_1 = 6.14e-5;
const DEBYE_TERM_2 = 1.4e-12;
const DEBYE_TERM_2_FREQ = 1.9e-5;
/** Untere/obere Gültigkeitsgrenze des Modells in GHz */
export const ITU676_MIN_FREQUENCY_GHZ = 1;
export const ITU676_MAX_FREQUENCY_GHZ = 1000;

/** Äquivalente Höhe Wasserdampf h_w (P.676-13 Annex 2 Gl. 37, Tabelle 4) */
const HW_A_KM_PER_GHZ = 5.6585e-5;
const HW_B_KM = 1.8348;
const HW_LINES = [
  { f0: 22.23508, a: 2.6846, b: 2.7649 },
  { f0: 183.310087, a: 5.8905, b: 4.9219 },
  { f0: 325.152888, a: 2.981, b: 3.0748 }
] as const;

/** Äquivalente Höhe Sauerstoff h_o (P.676-12 Annex 2 Gl. 30–34) */
const H0_T2_LINES = [
  { c: 0.1597, f0: 118.750334 },
  { c: 0.1066, f0: 368.498246 },
  { c: 0.1325, f0: 424.76302 },
  { c: 0.1242, f0: 487.249273 },
  { c: 0.0938, f0: 715.392902 },
  { c: 0.1448, f0: 773.83949 },
  { c: 0.1374, f0: 834.145546 }
] as const;
const H0_REFERENCE_PRESSURE_HPA = 1013.25;
const H0_LIMIT_FREQUENCY_GHZ = 70;

// ============================================================================
// Typen
// ============================================================================

export interface GasAttenuationResult {
  /** Spezifische Dämpfung durch Sauerstoff (trockene Luft) in dB/km */
  oxygen: number;
  /** Spezifische Dämpfung durch Wasserdampf in dB/km */
  waterVapor: number;
  /** Summe in dB/km */
  total: number;
}

export interface EquivalentHeights {
  /** Äquivalente Höhe Sauerstoff in km */
  h0Km: number;
  /** Äquivalente Höhe Wasserdampf in km */
  hwKm: number;
}

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/**
 * Wasserdampf-Partialdruck e in hPa (P.676-13 Gl. 4)
 */
export function waterVaporPartialPressure(waterVaporDensityGM3: number, temperatureK: number): number {
  if (!Number.isFinite(waterVaporDensityGM3) || waterVaporDensityGM3 <= 0) return 0;
  return (waterVaporDensityGM3 * temperatureK) / WATER_VAPOR_PRESSURE_FACTOR;
}

/**
 * Linienformfunktion Fᵢ(f) nach Gl. (5) (Van-Vleck/Weisskopf mit Interferenzterm δ)
 */
function lineShape(f: number, f0: number, deltaF: number, delta: number): number {
  const lower = (f0 - f) ** 2 + deltaF * deltaF;
  const upper = (f0 + f) ** 2 + deltaF * deltaF;
  return (f / f0) * (
    safeDivide(deltaF - delta * (f0 - f), lower, 0) +
    safeDivide(deltaF - delta * (f0 + f), upper, 0)
  );
}

function isValidInput(frequencyGHz: number, pressureHpa: number, temperatureK: number): boolean {
  return (
    Number.isFinite(frequencyGHz) && frequencyGHz > 0 &&
    Number.isFinite(pressureHpa) && pressureHpa > 0 &&
    Number.isFinite(temperatureK) && temperatureK > 0
  );
}

// ============================================================================
// Spezifische Dämpfung (Annex 1)
// ============================================================================

/**
 * Spezifische Dämpfung durch Sauerstoff/trockene Luft γ_o in dB/km (P.676-13 Annex 1, Gl. 1–9).
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param dryPressureHpa - Trockenluftdruck p in hPa (Gesamtdruck minus e)
 * @param temperatureK - Temperatur in K
 * @param waterVaporDensityGM3 - Wasserdampfdichte ρ in g/m³ (beeinflusst Linienbreite und Debye-Term)
 */
export function oxygenSpecificAttenuation(
  frequencyGHz: number,
  dryPressureHpa: number,
  temperatureK: number,
  waterVaporDensityGM3: number = 0
): number {
  if (!isValidInput(frequencyGHz, dryPressureHpa, temperatureK)) return 0;

  const f = frequencyGHz;
  const p = dryPressureHpa;
  const theta = THETA_REFERENCE_K / temperatureK;
  const e = waterVaporPartialPressure(waterVaporDensityGM3, temperatureK);

  let nO2 = 0;
  for (const line of O2_LINES) {
    // Linienstärke Sᵢ (Gl. 3)
    const strength = line.a1 * 1e-7 * p * theta ** 3 * Math.exp(line.a2 * (1 - theta));
    // Linienbreite Δf (Gl. 6a) inkl. Zeeman-Verbreiterung
    let width = line.a3 * 1e-4 * (p * theta ** (0.8 - line.a4) + 1.1 * e * theta);
    width = Math.sqrt(width * width + O2_ZEEMAN_BROADENING);
    // Interferenzkorrektur δ (Gl. 7)
    const delta = (line.a5 + line.a6 * theta) * 1e-4 * (p + e) * theta ** 0.8;
    nO2 += strength * lineShape(f, line.f0, width, delta);
  }

  // Debye-Kontinuum trockener Luft N″_D (Gl. 8, 9)
  const d = DEBYE_WIDTH_FACTOR * (p + e) * theta ** 0.8;
  const debye = f * p * theta * theta * (
    safeDivide(DEBYE_TERM_1, d * (1 + (f / d) ** 2), 0) +
    safeDivide(DEBYE_TERM_2 * p * theta ** 1.5, 1 + DEBYE_TERM_2_FREQ * f ** 1.5, 0)
  );

  const gamma = GAMMA_PREFACTOR * f * (nO2 + debye);
  return Number.isFinite(gamma) ? Math.max(0, gamma) : 0;
}

/**
 * Spezifische Dämpfung durch Wasserdampf γ_w in dB/km (P.676-13 Annex 1, Gl. 1–6b).
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param dryPressureHpa - Trockenluftdruck p in hPa
 * @param temperatureK - Temperatur in K
 * @param waterVaporDensityGM3 - Wasserdampfdichte ρ in g/m³
 */
export function waterVaporSpecificAttenuation(
  frequencyGHz: number,
  dryPressureHpa: number,
  temperatureK: number,
  waterVaporDensityGM3: number
): number {
  if (!isValidInput(frequencyGHz, dryPressureHpa, temperatureK)) return 0;
  if (!Number.isFinite(waterVaporDensityGM3) || waterVaporDensityGM3 <= 0) return 0;

  const f = frequencyGHz;
  const p = dryPressureHpa;
  const theta = THETA_REFERENCE_K / temperatureK;
  const e = waterVaporPartialPressure(waterVaporDensityGM3, temperatureK);

  let nH2O = 0;
  for (const line of H2O_LINES) {
    // Linienstärke Sᵢ (Gl. 3)
    const strength = line.b1 * 1e-1 * e * theta ** 3.5 * Math.exp(line.b2 * (1 - theta));
    // Linienbreite Δf (Gl. 6a) inkl. Doppler-Verbreiterung (Gl. 6b)
    let width = line.b3 * 1e-4 * (p * theta ** line.b4 + line.b5 * e * theta ** line.b6);
    width = H2O_DOPPLER_A * width +
      Math.sqrt(H2O_DOPPLER_B * width * width + (H2O_DOPPLER_C * line.f0 * line.f0) / theta);
    // Für Wasserdampf ist δ = 0 (Gl. 7)
    nH2O += strength * lineShape(f, line.f0, width, 0);
  }

  const gamma = GAMMA_PREFACTOR * f * nH2O;
  return Number.isFinite(gamma) ? Math.max(0, gamma) : 0;
}

/**
 * Gesamte spezifische Gasdämpfung für gegebene Bodenbedingungen.
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param totalPressureHpa - Barometrischer Gesamtdruck in hPa (p + e); e wird intern abgezogen
 * @param temperatureK - Temperatur in K
 * @param waterVaporDensityGM3 - Wasserdampfdichte ρ in g/m³
 */
export function specificGasAttenuation(
  frequencyGHz: number,
  totalPressureHpa: number,
  temperatureK: number,
  waterVaporDensityGM3: number
): GasAttenuationResult {
  const e = waterVaporPartialPressure(waterVaporDensityGM3, temperatureK);
  const dryPressure = Math.max(0, totalPressureHpa - e);
  const oxygen = oxygenSpecificAttenuation(frequencyGHz, dryPressure, temperatureK, waterVaporDensityGM3);
  const waterVapor = waterVaporSpecificAttenuation(frequencyGHz, dryPressure, temperatureK, waterVaporDensityGM3);
  return { oxygen, waterVapor, total: oxygen + waterVapor };
}

// ============================================================================
// Schrägpfad (Annex 2)
// ============================================================================

/**
 * Äquivalente Höhen h_o und h_w in km für Erde-Raum-Pfade.
 * h_w: P.676-13 Annex 2 Gl. (37) mit Tabelle 4.
 * h_o: P.676-12 Annex 2 Gl. (30)–(34) (geschlossene Form, s. Header).
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param totalPressureHpa - Gesamtdruck am Boden in hPa
 * @param temperatureK - Bodentemperatur in K
 * @param waterVaporDensityGM3 - Wasserdampfdichte am Boden in g/m³
 */
export function equivalentHeights(
  frequencyGHz: number,
  totalPressureHpa: number,
  temperatureK: number,
  waterVaporDensityGM3: number
): EquivalentHeights {
  if (!isValidInput(frequencyGHz, totalPressureHpa, temperatureK)) return { h0Km: 0, hwKm: 0 };
  const f = frequencyGHz;
  const rp = totalPressureHpa / H0_REFERENCE_PRESSURE_HPA;
  const tCelsius = temperatureK - 273.15;

  // --- h_o (P.676-12 Gl. 30–34) ---
  const t1 = (5.104 / (1 + 0.066 * rp ** -2.3)) *
    Math.exp(-(((f - 59.7) / (2.87 + 12.4 * Math.exp(-7.9 * rp))) ** 2));
  let t2 = 0;
  for (const line of H0_T2_LINES) {
    t2 += (line.c * Math.exp(2.12 * rp)) / ((f - line.f0) ** 2 + 0.025 * Math.exp(2.2 * rp));
  }
  const t3 = ((0.0114 * f) / (1 + 0.14 * rp ** -2.6)) *
    safeDivide(15.02 * f * f - 1353 * f + 5.333e4, f ** 3 - 151.3 * f * f + 9629 * f - 6803, 0);
  const a0 = 0.7832 + 0.00709 * tCelsius;
  let h0 = ((6.1 * a0) / (1 + 0.17 * rp ** -1.1)) * (1 + t1 + t2 + t3);
  if (f < H0_LIMIT_FREQUENCY_GHZ) {
    h0 = Math.min(h0, 10.7 * rp ** 0.3);
  }

  // --- h_w (P.676-13 Gl. 37) ---
  let hw = HW_A_KM_PER_GHZ * f + HW_B_KM;
  for (const line of HW_LINES) {
    hw += line.a / ((f - line.f0) ** 2 + line.b);
  }

  return { h0Km: Math.max(0, h0), hwKm: Math.max(0, hw) };
}

/**
 * Gesamtdämpfung durch Gase auf einem Erde-Raum-Schrägpfad in dB (P.676-13 Annex 2 Gl. 28):
 *   A = (h_o · γ_o + h_w · γ_w) / sin θ
 * Gültig für Elevationswinkel 5° ≤ θ ≤ 90° und Bodenstationen unterhalb ca. 10 km.
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param elevationAngleDeg - Elevationswinkel θ in Grad (> 0)
 * @param totalPressureHpa - Gesamtdruck am Boden in hPa
 * @param temperatureK - Bodentemperatur in K
 * @param waterVaporDensityGM3 - Wasserdampfdichte am Boden in g/m³
 * @returns Dämpfung in dB (0 bei ungültigen Eingaben)
 */
export function slantPathGasAttenuation(
  frequencyGHz: number,
  elevationAngleDeg: number,
  totalPressureHpa: number,
  temperatureK: number,
  waterVaporDensityGM3: number
): GasAttenuationResult {
  if (!Number.isFinite(elevationAngleDeg) || elevationAngleDeg <= 0 || elevationAngleDeg > 90) {
    return { oxygen: 0, waterVapor: 0, total: 0 };
  }
  const gamma = specificGasAttenuation(frequencyGHz, totalPressureHpa, temperatureK, waterVaporDensityGM3);
  const { h0Km, hwKm } = equivalentHeights(frequencyGHz, totalPressureHpa, temperatureK, waterVaporDensityGM3);
  const sinEl = Math.sin((elevationAngleDeg * Math.PI) / 180);
  const oxygen = safeDivide(gamma.oxygen * h0Km, sinEl, 0);
  const waterVapor = safeDivide(gamma.waterVapor * hwKm, sinEl, 0);
  return { oxygen, waterVapor, total: oxygen + waterVapor };
}
