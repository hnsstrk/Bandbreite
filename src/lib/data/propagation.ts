/**
 * Radio Wave Propagation Constants and Data
 *
 * Enthält Daten und Konstanten zur Funkwellenausbreitung:
 * - Ausbreitungsmodi (Bodenwelle, Raumwelle, LOS)
 * - Frequenzband-spezifische Eigenschaften
 * - Formeln für Radiohorizont und Reichweite
 *
 * Quellen:
 * - ITU-R P.368 (Ground-wave propagation curves)
 * - ITU-R P.372 (Radio noise)
 * - ITU-R P.1239 (ITU-R reference ionospheric characteristics)
 * - Wikipedia: Kurzwelle, Mittelwelle, Langwelle, Ultrakurzwelle
 */

import {
  EARTH_RADIUS_MEAN,
  EFFECTIVE_EARTH_RADIUS_FACTOR,
  IONOSPHERE_PARAMETERS
} from './constants';

// ============================================================================
// Physikalische Konstanten für Wellenausbreitung
// ============================================================================

/**
 * Erdradius in km für Ausbreitungsberechnungen
 */
export const EARTH_RADIUS_KM = EARTH_RADIUS_MEAN / 1000;

/**
 * Refraktionsfaktor für Radiowellen (4/3-Erde-Modell)
 * Berücksichtigt die Brechung in der Troposphäre
 * Quelle: ITU-R P.834
 */
export const REFRACTION_FACTOR_K = EFFECTIVE_EARTH_RADIUS_FACTOR;

// ============================================================================
// Ausbreitungsmodi (Propagation Modes)
// ============================================================================

export interface PropagationMode {
  id: string;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  frequencyRangeHz: { min: number; max: number };
  typicalRangeKm: { min: number; max: number };
  characteristics: string[];
  characteristicsDE: string[];
  color: string;
}

/**
 * Bodenwelle (Ground Wave)
 * Breitet sich entlang der Erdoberfläche aus
 */
export const PROPAGATION_GROUND_WAVE: PropagationMode = {
  id: 'ground-wave',
  name: 'Ground Wave',
  nameDE: 'Bodenwelle',
  description: "Follows the Earth's surface, attenuated by terrain and conductivity",
  descriptionDE: 'Folgt der Erdoberfläche, wird durch Gelände und Leitfähigkeit gedämpft',
  frequencyRangeHz: { min: 30e3, max: 3e6 },
  typicalRangeKm: { min: 30, max: 300 },
  characteristics: [
    'Reliable day and night',
    'Range depends on frequency and ground conductivity',
    'Higher attenuation at higher frequencies',
    'Works best over seawater'
  ],
  characteristicsDE: [
    'Zuverlässig bei Tag und Nacht',
    'Reichweite abhängig von Frequenz und Bodenleitfähigkeit',
    'Höhere Dämpfung bei höheren Frequenzen',
    'Funktioniert am besten über Seewasser'
  ],
  color: '#8B4513' // Braun (Erde)
};

/**
 * Raumwelle (Sky Wave)
 * Wird an der Ionosphäre reflektiert
 */
export const PROPAGATION_SKY_WAVE: PropagationMode = {
  id: 'sky-wave',
  name: 'Sky Wave',
  nameDE: 'Raumwelle',
  description: 'Reflected by ionosphere layers, enables long-distance HF communication',
  descriptionDE: 'Wird an Ionosphärenschichten reflektiert, ermöglicht HF-Weitverkehr',
  frequencyRangeHz: { min: 3e6, max: 30e6 },
  typicalRangeKm: { min: 500, max: 20000 },
  characteristics: [
    'Multi-hop propagation possible (worldwide)',
    'Affected by solar activity and time of day',
    'Skip zone (dead zone) between ground wave and first hop',
    'MUF and LUF determine usable frequency window'
  ],
  characteristicsDE: [
    'Multi-Hop-Ausbreitung möglich (weltweit)',
    'Beeinflusst durch Sonnenaktivität und Tageszeit',
    'Tote Zone zwischen Bodenwelle und erstem Hop',
    'MUF und LUF bestimmen nutzbares Frequenzfenster'
  ],
  color: '#FFD700' // Gold (ionosphärische Reflexion)
};

/**
 * Sichtverbindung (Line-of-Sight)
 * Quasi-optische Ausbreitung
 */
export const PROPAGATION_LINE_OF_SIGHT: PropagationMode = {
  id: 'line-of-sight',
  name: 'Line-of-Sight',
  nameDE: 'Sichtverbindung (LOS)',
  description: 'Direct path between transmitter and receiver, limited by horizon',
  descriptionDE: 'Direkte Verbindung zwischen Sender und Empfänger, begrenzt durch Horizont',
  frequencyRangeHz: { min: 30e6, max: 300e9 },
  typicalRangeKm: { min: 10, max: 200 },
  characteristics: [
    'Reliable and predictable',
    'Range limited by radio horizon',
    'Affected by terrain, buildings, vegetation',
    'Fresnel zone clearance important'
  ],
  characteristicsDE: [
    'Zuverlässig und vorhersagbar',
    'Reichweite durch Radiohorizont begrenzt',
    'Beeinflusst durch Gelände, Gebäude, Vegetation',
    'Fresnel-Zonen-Freiheit wichtig'
  ],
  color: '#4169E1' // Königsblau (direkte Verbindung)
};

/**
 * Sporadische E-Schicht
 * Ermöglicht VHF-Überreichweiten
 */
export const PROPAGATION_SPORADIC_E: PropagationMode = {
  id: 'sporadic-e',
  name: 'Sporadic E',
  nameDE: 'Sporadische E-Schicht',
  description: 'Temporary ionized patches enabling VHF/UHF propagation beyond horizon',
  descriptionDE: 'Temporäre ionisierte Bereiche ermöglichen VHF/UHF-Überreichweiten',
  frequencyRangeHz: { min: 30e6, max: 150e6 },
  typicalRangeKm: { min: 500, max: 2300 },
  characteristics: [
    'Unpredictable occurrence',
    'Most common in summer months',
    'Can support frequencies up to 150 MHz',
    'Caused by metallic ion layers from meteors'
  ],
  characteristicsDE: [
    'Unvorhersagbares Auftreten',
    'Am häufigsten in Sommermonaten',
    'Kann Frequenzen bis 150 MHz unterstützen',
    'Verursacht durch Metallionen-Schichten von Meteoren'
  ],
  color: '#9932CC' // Dunkelviolett (sporadisch/ungewöhnlich)
};

/**
 * Troposphärische Brechung
 * Überreichweiten durch Temperaturinversion
 */
export const PROPAGATION_TROPOSCATTER: PropagationMode = {
  id: 'troposcatter',
  name: 'Tropospheric Scatter',
  nameDE: 'Troposphärenstreuung',
  description: 'Scattering by atmospheric turbulence, used for beyond-horizon links',
  descriptionDE: 'Streuung durch atmosphärische Turbulenzen, für Überhorizont-Verbindungen',
  frequencyRangeHz: { min: 300e6, max: 10e9 },
  typicalRangeKm: { min: 100, max: 800 },
  characteristics: [
    'Requires high power and large antennas',
    'Reliable but with high path loss',
    'Not affected by ionospheric conditions',
    'Used for military and remote communications'
  ],
  characteristicsDE: [
    'Erfordert hohe Sendeleistung und große Antennen',
    'Zuverlässig aber mit hoher Pfaddämpfung',
    'Nicht von Ionosphärenbedingungen beeinflusst',
    'Für militärische und entlegene Kommunikation'
  ],
  color: '#87CEEB' // Himmelblau (Troposphäre)
};

/**
 * Alle Ausbreitungsmodi
 */
export const PROPAGATION_MODES: PropagationMode[] = [
  PROPAGATION_GROUND_WAVE,
  PROPAGATION_SKY_WAVE,
  PROPAGATION_LINE_OF_SIGHT,
  PROPAGATION_SPORADIC_E,
  PROPAGATION_TROPOSCATTER
];

// ============================================================================
// Frequenzbänder und ihre Ausbreitungseigenschaften
// ============================================================================

export interface FrequencyBandPropagation {
  id: string;
  name: string;
  nameDE: string;
  frequencyRangeHz: { min: number; max: number };
  wavelengthRange: string;
  primaryModes: string[];
  dayBehavior: string;
  nightBehavior: string;
  typicalApplications: string[];
  typicalApplicationsDE: string[];
}

export const BAND_PROPAGATION_LF: FrequencyBandPropagation = {
  id: 'lf',
  name: 'Low Frequency (LF)',
  nameDE: 'Langwelle (LW)',
  frequencyRangeHz: { min: 30e3, max: 300e3 },
  wavelengthRange: '1-10 km',
  primaryModes: ['ground-wave'],
  dayBehavior: 'Bodenwelle dominiert, D-Schicht absorbiert Raumwelle vollständig',
  nightBehavior: 'Fernempfang möglich durch Raumwelle, Interferenzen (Fading)',
  typicalApplications: ['Navigation (LORAN-C)', 'Time signals (DCF77)', 'Maritime'],
  typicalApplicationsDE: ['Navigation (LORAN-C)', 'Zeitzeichen (DCF77)', 'Seefunk']
};

export const BAND_PROPAGATION_MF: FrequencyBandPropagation = {
  id: 'mf',
  name: 'Medium Frequency (MF)',
  nameDE: 'Mittelwelle (MW)',
  frequencyRangeHz: { min: 300e3, max: 3e6 },
  wavelengthRange: '100-1000 m',
  primaryModes: ['ground-wave', 'sky-wave'],
  dayBehavior: 'Bodenwelle bis ~300 km, D-Schicht dämpft Raumwelle stark',
  nightBehavior: 'Reichweite > 1000 km durch Raumwelle, Nahschwund möglich',
  typicalApplications: ['AM Broadcasting', 'Maritime distress (500 kHz)', 'Amateur radio'],
  typicalApplicationsDE: ['AM-Rundfunk', 'Seenot-Frequenz (500 kHz)', 'Amateurfunk']
};

export const BAND_PROPAGATION_HF: FrequencyBandPropagation = {
  id: 'hf',
  name: 'High Frequency (HF)',
  nameDE: 'Kurzwelle (KW)',
  frequencyRangeHz: { min: 3e6, max: 30e6 },
  wavelengthRange: '10-100 m',
  primaryModes: ['sky-wave', 'ground-wave'],
  dayBehavior: 'Höhere Frequenzen (10-30 MHz) besser, D-Schicht-Absorption bei niedrigen f',
  nightBehavior: 'Niedrigere Frequenzen (3-10 MHz) besser, F-Schichten verschmelzen',
  typicalApplications: ['International broadcasting', 'Amateur radio', 'Aviation HF', 'Military'],
  typicalApplicationsDE: ['Internationaler Rundfunk', 'Amateurfunk', 'Flugfunk HF', 'Militär']
};

export const BAND_PROPAGATION_VHF: FrequencyBandPropagation = {
  id: 'vhf',
  name: 'Very High Frequency (VHF)',
  nameDE: 'Ultrakurzwelle (UKW)',
  frequencyRangeHz: { min: 30e6, max: 300e6 },
  wavelengthRange: '1-10 m',
  primaryModes: ['line-of-sight', 'sporadic-e'],
  dayBehavior: 'Sichtverbindung, begrenzt durch Radiohorizont',
  nightBehavior: 'Gleich wie am Tag, keine ionosphärische Reflexion',
  typicalApplications: ['FM Broadcasting', 'TV', 'Air traffic control', 'Amateur radio'],
  typicalApplicationsDE: ['UKW-Rundfunk', 'Fernsehen', 'Flugverkehrskontrolle', 'Amateurfunk']
};

export const BAND_PROPAGATION_UHF: FrequencyBandPropagation = {
  id: 'uhf',
  name: 'Ultra High Frequency (UHF)',
  nameDE: 'Dezimeterwelle',
  frequencyRangeHz: { min: 300e6, max: 3e9 },
  wavelengthRange: '10 cm - 1 m',
  primaryModes: ['line-of-sight'],
  dayBehavior: 'Quasi-optische Ausbreitung, Beugung an Hindernissen',
  nightBehavior: 'Gleich wie am Tag',
  typicalApplications: ['TV', 'Mobile phones', 'WiFi', 'GPS', 'Radar'],
  typicalApplicationsDE: ['Fernsehen', 'Mobilfunk', 'WLAN', 'GPS', 'Radar']
};

export const BAND_PROPAGATION_SHF: FrequencyBandPropagation = {
  id: 'shf',
  name: 'Super High Frequency (SHF)',
  nameDE: 'Zentimeterwelle',
  frequencyRangeHz: { min: 3e9, max: 30e9 },
  wavelengthRange: '1-10 cm',
  primaryModes: ['line-of-sight'],
  dayBehavior: 'Reine Sichtverbindung, empfindlich auf Regen',
  nightBehavior: 'Gleich wie am Tag',
  typicalApplications: ['Satellite', 'Radar', 'Microwave links', '5G mmWave'],
  typicalApplicationsDE: ['Satellit', 'Radar', 'Richtfunk', '5G mmWave']
};

export const FREQUENCY_BAND_PROPAGATION: FrequencyBandPropagation[] = [
  BAND_PROPAGATION_LF,
  BAND_PROPAGATION_MF,
  BAND_PROPAGATION_HF,
  BAND_PROPAGATION_VHF,
  BAND_PROPAGATION_UHF,
  BAND_PROPAGATION_SHF
];

// ============================================================================
// Ionosphären-bezogene Ausbreitungsparameter
// ============================================================================

export interface SkipZoneParameters {
  /** Minimale Sprungdistanz in km */
  minSkipDistanceKm: number;
  /** Maximale Sprungdistanz in km für Single-Hop */
  maxSingleHopKm: number;
  /** Typische tote Zone in km */
  typicalDeadZoneKm: { min: number; max: number };
  /** Reflexionshöhe in km */
  reflectionHeightKm: { day: number; night: number };
}

/**
 * Sprungdistanz-Parameter für HF-Ausbreitung
 * Quelle: ITU-R P.1239, Rothammel Antennenbuch
 */
export const SKIP_ZONE_PARAMS: SkipZoneParameters = {
  minSkipDistanceKm: 200,
  maxSingleHopKm: 4000,
  typicalDeadZoneKm: { min: 100, max: 2500 },
  reflectionHeightKm: { day: 250, night: 350 }
};

/**
 * Typische MUF-Faktoren M(d) = MUF/foF2 als Orientierung (Sekantengesetz mit h = 300 km).
 * Die Berechnung erfolgt in estimateMUF(); diese Tabelle dient nur der Dokumentation/Anzeige.
 * Quelle: ITU-R P.1239 (M(3000)F2 ≈ 2,5–3,5)
 */
export const MUF_FACTORS: Record<number, number> = {
  0: 1.0, // Senkrechtlotung: MUF = foF2
  500: 1.3,
  1000: 1.9,
  2000: 2.8,
  3000: 3.3 // 3000 km (Standard)
};

// ============================================================================
// Berechnungsfunktionen
// ============================================================================

/**
 * Berechnet den Radiohorizont
 * d = √(2·k·R·h), wobei k ≈ 4/3 (Refraktionsfaktor)
 *
 * @param heightMeters - Antennenhöhe in Metern
 * @param withRefraction - Mit atmosphärischer Refraktion (Standard: true)
 * @returns Distanz zum Horizont in Kilometern
 *
 * Quelle: ITU-R P.834
 */
export function calculateRadioHorizon(
  heightMeters: number,
  withRefraction: boolean = true
): number {
  return horizonDistanceKm(heightMeters, withRefraction ? REFRACTION_FACTOR_K : 1);
}

/**
 * Grenzen des k-Faktors, die in der Praxis vorkommen.
 * k < 1 (Subrefraktion) und k > 1,5 (Superrefraktion, Ducting) treten bei
 * ungewöhnlichen Temperatur- und Feuchteschichtungen auf.
 * Quelle: ITU-R P.834-9, ITU-R P.453
 */
export const K_FACTOR_MIN = 1;
export const K_FACTOR_MAX = 1.5;

/**
 * Vorfaktor der Horizont-Faustformel d[km] = A·√(h[m]) für einen k-Faktor.
 * A = √(2·k·R/1000): k = 4/3 ergibt 4,12, k = 1 ergibt 3,57.
 *
 * @param kFactor Radius-Faktor der effektiven Erde
 * Quelle: ITU-R P.834
 */
export function horizonFactor(kFactor: number = REFRACTION_FACTOR_K): number {
  if (kFactor <= 0) return 0;
  return Math.sqrt((2 * kFactor * EARTH_RADIUS_KM) / 1000);
}

/**
 * Horizontdistanz für einen frei wählbaren k-Faktor: d = √(2·k·R·h).
 *
 * @param heightMeters Antennenhöhe über Grund in Metern
 * @param kFactor Radius-Faktor der effektiven Erde (1 = geometrisch, 4/3 = Standard)
 * @returns Distanz zum Horizont in Kilometern
 *
 * Quelle: ITU-R P.834
 */
export function horizonDistanceKm(
  heightMeters: number,
  kFactor: number = REFRACTION_FACTOR_K
): number {
  if (heightMeters <= 0 || kFactor <= 0) return 0;
  return horizonFactor(kFactor) * Math.sqrt(heightMeters);
}

/**
 * Maximale Sichtverbindung zweier Antennen für einen k-Faktor:
 * die Summe beider Horizontdistanzen.
 *
 * @param height1Meters Höhe der ersten Antenne in Metern
 * @param height2Meters Höhe der zweiten Antenne in Metern
 * @param kFactor Radius-Faktor der effektiven Erde
 * @returns Distanz in Kilometern
 */
export function losDistanceKm(
  height1Meters: number,
  height2Meters: number,
  kFactor: number = REFRACTION_FACTOR_K
): number {
  return horizonDistanceKm(height1Meters, kFactor) + horizonDistanceKm(height2Meters, kFactor);
}

/**
 * Berechnet die maximale Sichtverbindungsdistanz zwischen zwei Punkten
 *
 * @param height1Meters - Höhe Punkt 1 in Metern
 * @param height2Meters - Höhe Punkt 2 in Metern
 * @param withRefraction - Mit atmosphärischer Refraktion
 * @returns Maximale Distanz in Kilometern
 */
export function calculateMaxLOSDistance(
  height1Meters: number,
  height2Meters: number,
  withRefraction: boolean = true
): number {
  return (
    calculateRadioHorizon(height1Meters, withRefraction) +
    calculateRadioHorizon(height2Meters, withRefraction)
  );
}

/**
 * Berechnet die Sprungdistanz für HF-Raumwellen (sphärisches Spiegelmodell)
 * d = 2·R·[arccos((R/(R+h))·cos θ) − θ]
 *
 * Für θ → 0 ergibt sich der geometrische Maximalwert 2·R·arccos(R/(R+h))
 * (≈ 3830 km bei h = 300 km), daher ist keine künstliche Begrenzung nötig.
 *
 * @param reflectionHeightKm - Reflexionshöhe in km
 * @param elevationAngleDeg - Abstrahlwinkel in Grad (0° = horizontal)
 * @returns Sprungdistanz in Kilometern (0 bei ungültigen Eingaben)
 *
 * Quelle: Davies, Ionospheric Radio, §6 (Spiegelmodell mit Kugelerde)
 */
export function calculateSkipDistance(
  reflectionHeightKm: number,
  elevationAngleDeg: number
): number {
  if (elevationAngleDeg <= 0 || elevationAngleDeg >= 90) return 0;
  if (reflectionHeightKm <= 0) return 0;

  const R = EARTH_RADIUS_KM;
  const h = reflectionHeightKm;
  const theta = elevationAngleDeg * (Math.PI / 180);

  return 2 * R * (Math.acos((R / (R + h)) * Math.cos(theta)) - theta);
}

/**
 * Minimale Sprungdistanz, ab der eine Frequenz f an einer Schicht mit kritischer
 * Frequenz foF2 reflektiert wird (Sekantengesetz f = foF2·sec φ, sphärisches Spiegelmodell).
 *
 * @param frequencyMHz - Betriebsfrequenz in MHz
 * @param criticalFrequencyMHz - Kritische Frequenz foF2 in MHz
 * @param reflectionHeightKm - Reflexionshöhe in km (Standard: 300 km)
 * @returns Sprungdistanz in km; 0 wenn f ≤ foF2 (senkrechte Reflexion möglich);
 *          null, wenn f oberhalb der maximalen MUF liegt (keine Reflexion)
 */
export function calculateSkipDistanceForFrequency(
  frequencyMHz: number,
  criticalFrequencyMHz: number,
  reflectionHeightKm: number = IONOSPHERE_PARAMETERS.typicalF2HeightKm
): number | null {
  if (frequencyMHz <= 0 || criticalFrequencyMHz <= 0 || reflectionHeightKm <= 0) return null;
  const M = frequencyMHz / criticalFrequencyMHz;
  if (M <= 1) return 0;

  const R = EARTH_RADIUS_KM;
  const h = reflectionHeightKm;
  // sec φ = M  →  sin φ = √(1 − 1/M²)
  const sinPhi = Math.sqrt(1 - 1 / (M * M));
  const cosTheta = ((R + h) * sinPhi) / R;
  if (cosTheta > 1) return null; // selbst bei streifender Abstrahlung nicht erreichbar

  const phi = Math.asin(sinPhi);
  const theta = Math.acos(cosTheta);
  return 2 * R * (Math.PI / 2 - phi - theta);
}

/**
 * Berechnet die Plasmafrequenz der Ionosphäre
 * fp = 9·√(Ne) [Hz], wobei Ne = Elektronendichte in e⁻/m³
 *
 * @param electronDensity - Elektronendichte in e⁻/m³
 * @returns Plasmafrequenz in Hz
 *
 * Quelle: ITU-R P.1239
 */
export function calculatePlasmaFrequency(electronDensity: number): number {
  if (electronDensity <= 0) return 0;
  return 9 * Math.sqrt(electronDensity);
}

/**
 * Berechnet die kritische Frequenz aus der Elektronendichte
 * Die kritische Frequenz ist die höchste Frequenz, die bei senkrechtem
 * Einfall noch reflektiert wird.
 *
 * @param electronDensity - Maximale Elektronendichte in e⁻/m³
 * @returns Kritische Frequenz in MHz
 */
export function calculateCriticalFrequency(electronDensity: number): number {
  return calculatePlasmaFrequency(electronDensity) / 1e6;
}

/**
 * Schätzt die MUF (Maximum Usable Frequency) für eine gegebene Distanz
 * nach dem Sekantengesetz im sphärischen Spiegelmodell: MUF = foF2 · sec φ,
 * wobei φ der Einfallswinkel an der Schicht ist. Für d = 0 gilt MUF = foF2.
 * Der Faktor wird auf IONOSPHERE_PARAMETERS.mufFactorMax (≈ M(3000)F2) begrenzt.
 *
 * Kontrollwerte (h = 300 km): d = 0 → 1,00; 500 km → 1,30; 1000 km → 1,86;
 * 2000 km → 2,80; 3000 km → 3,28.
 *
 * @param criticalFrequencyMHz - Kritische Frequenz (foF2) in MHz
 * @param distanceKm - Verbindungsdistanz in km
 * @param reflectionHeightKm - Reflexionshöhe in km (Standard: 300 km)
 * @returns MUF in MHz
 *
 * Quelle: Davies, Ionospheric Radio, §6; ITU-R P.1239
 */
export function estimateMUF(
  criticalFrequencyMHz: number,
  distanceKm: number,
  reflectionHeightKm: number = IONOSPHERE_PARAMETERS.typicalF2HeightKm
): number {
  if (criticalFrequencyMHz <= 0 || distanceKm < 0 || reflectionHeightKm <= 0) return 0;

  const R = EARTH_RADIUS_KM;
  const halfAngle = distanceKm / (2 * R);
  // Einfallswinkel φ an der Schicht (Dreieck Erdmittelpunkt – Sender – Reflexionspunkt)
  const phi = Math.atan2(R * Math.sin(halfAngle), R + reflectionHeightKm - R * Math.cos(halfAngle));
  const factor = Math.min(1 / Math.cos(phi), IONOSPHERE_PARAMETERS.mufFactorMax);

  return criticalFrequencyMHz * factor;
}

// ============================================================================
// Diagramm-Daten für Visualisierung
// ============================================================================

/**
 * Koordinaten für SVG-Darstellung der Ionosphärenschichten
 */
export interface LayerVisualization {
  id: string;
  name: string;
  altitudeMinKm: number;
  altitudeMaxKm: number;
  fillColor: string;
  strokeColor: string;
  dayOpacity: number;
  nightOpacity: number;
}

export const LAYER_VISUALIZATIONS: LayerVisualization[] = [
  {
    id: 'd-layer',
    name: 'D-Schicht',
    altitudeMinKm: 60,
    altitudeMaxKm: 90,
    fillColor: 'rgba(239, 68, 68, 0.3)',
    strokeColor: '#ef4444',
    dayOpacity: 1,
    nightOpacity: 0
  },
  {
    id: 'e-layer',
    name: 'E-Schicht',
    altitudeMinKm: 90,
    altitudeMaxKm: 150,
    fillColor: 'rgba(249, 115, 22, 0.25)',
    strokeColor: '#f97316',
    dayOpacity: 1,
    nightOpacity: 0.3
  },
  {
    id: 'f1-layer',
    name: 'F1-Schicht',
    altitudeMinKm: 150,
    altitudeMaxKm: 220,
    fillColor: 'rgba(34, 197, 94, 0.2)',
    strokeColor: '#22c55e',
    dayOpacity: 1,
    nightOpacity: 0
  },
  {
    id: 'f2-layer',
    name: 'F2-Schicht',
    altitudeMinKm: 220,
    altitudeMaxKm: 400,
    fillColor: 'rgba(59, 130, 246, 0.25)',
    strokeColor: '#3b82f6',
    dayOpacity: 1,
    nightOpacity: 0.8
  }
];

/**
 * Voreinstellungen für typische Szenarien
 */
export interface PropagationScenario {
  id: string;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  frequencyMHz: number;
  distanceKm: number;
  antennaHeightM: number;
  modes: string[];
}

export const PROPAGATION_SCENARIOS: PropagationScenario[] = [
  {
    id: 'local-fm',
    name: 'Local FM Radio',
    nameDE: 'Lokaler UKW-Rundfunk',
    description: 'Typical FM broadcast reception',
    descriptionDE: 'Typischer UKW-Rundfunkempfang',
    frequencyMHz: 100,
    distanceKm: 50,
    antennaHeightM: 300,
    modes: ['line-of-sight']
  },
  {
    id: 'amateur-40m',
    name: 'Amateur 40m Band',
    nameDE: 'Amateurfunk 40m-Band',
    description: 'Regional HF communication',
    descriptionDE: 'Regionale HF-Kommunikation',
    frequencyMHz: 7.1,
    distanceKm: 800,
    antennaHeightM: 15,
    modes: ['sky-wave', 'ground-wave']
  },
  {
    id: 'amateur-20m',
    name: 'Amateur 20m Band',
    nameDE: 'Amateurfunk 20m-Band',
    description: 'DX communication worldwide',
    descriptionDE: 'DX-Weitverkehr weltweit',
    frequencyMHz: 14.2,
    distanceKm: 5000,
    antennaHeightM: 15,
    modes: ['sky-wave']
  },
  {
    id: 'maritime-mf',
    name: 'Maritime MF',
    nameDE: 'Seefunk Mittelwelle',
    description: 'Ship-to-shore communication',
    descriptionDE: 'Schiff-Land-Kommunikation',
    frequencyMHz: 0.5,
    distanceKm: 200,
    antennaHeightM: 30,
    modes: ['ground-wave']
  },
  {
    id: 'broadcast-sw',
    name: 'Shortwave Broadcast',
    nameDE: 'Kurzwellenrundfunk',
    description: 'International broadcasting',
    descriptionDE: 'Internationaler Rundfunk',
    frequencyMHz: 11.8,
    distanceKm: 3000,
    antennaHeightM: 100,
    modes: ['sky-wave']
  }
];

// ============================================================================
// Gruppierte Exporte
// ============================================================================

export const propagationModes = {
  groundWave: PROPAGATION_GROUND_WAVE,
  skyWave: PROPAGATION_SKY_WAVE,
  lineOfSight: PROPAGATION_LINE_OF_SIGHT,
  sporadicE: PROPAGATION_SPORADIC_E,
  troposcatter: PROPAGATION_TROPOSCATTER,
  all: PROPAGATION_MODES
} as const;

export const frequencyBands = {
  lf: BAND_PROPAGATION_LF,
  mf: BAND_PROPAGATION_MF,
  hf: BAND_PROPAGATION_HF,
  vhf: BAND_PROPAGATION_VHF,
  uhf: BAND_PROPAGATION_UHF,
  shf: BAND_PROPAGATION_SHF,
  all: FREQUENCY_BAND_PROPAGATION
} as const;

export const calculations = {
  radioHorizon: calculateRadioHorizon,
  maxLOSDistance: calculateMaxLOSDistance,
  skipDistance: calculateSkipDistance,
  skipDistanceForFrequency: calculateSkipDistanceForFrequency,
  plasmaFrequency: calculatePlasmaFrequency,
  criticalFrequency: calculateCriticalFrequency,
  estimateMUF
} as const;
