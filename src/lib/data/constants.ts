/**
 * Physical Constants and Reference Data for RF Engineering
 *
 * This file contains fundamental physical constants, ionospheric parameters,
 * and atmospheric absorption data used in RF calculations.
 *
 * IMPORTANT: All values are given in SI base units unless otherwise noted.
 * Sources are documented for each constant.
 */

// ============================================================================
// Fundamental Physical Constants
// Source: CODATA 2018 (NIST)
// https://physics.nist.gov/cuu/Constants/
// ============================================================================

/**
 * Speed of light in vacuum (exact)
 * Unit: m/s
 * Source: CODATA 2018 (exact by definition since 2019)
 */
export const SPEED_OF_LIGHT = 299_792_458 as const;

/**
 * Boltzmann constant (exact)
 * Unit: J/K
 * Source: CODATA 2018 (exact by definition since 2019)
 */
export const BOLTZMANN_CONSTANT = 1.380649e-23 as const;

/**
 * Planck constant (exact)
 * Unit: J·s
 * Source: CODATA 2018 (exact by definition since 2019)
 */
export const PLANCK_CONSTANT = 6.62607015e-34 as const;

/**
 * Elementary charge (exact)
 * Unit: C (Coulomb)
 * Source: CODATA 2018 (exact by definition since 2019)
 */
export const ELEMENTARY_CHARGE = 1.602176634e-19 as const;

/**
 * Vacuum permittivity (electric constant)
 * Unit: F/m (Farad per meter)
 * Source: CODATA 2018
 */
export const VACUUM_PERMITTIVITY = 8.8541878128e-12 as const;

/**
 * Vacuum permeability (magnetic constant)
 * Unit: H/m (Henry per meter)
 * Source: CODATA 2018
 */
export const VACUUM_PERMEABILITY = 1.25663706212e-6 as const;

/**
 * Characteristic impedance of vacuum Z₀ = √(µ₀/ε₀) — the ratio of electric to
 * magnetic field strength of a plane wave in free space.
 * Unit: Ω (Ohm)
 * Source: CODATA 2018 (376.730 313 668(57) Ω)
 */
export const FREE_SPACE_IMPEDANCE = 376.730313668 as const;

/**
 * Upper wavelength boundary of ionizing radiation: shorter waves carry enough
 * photon energy (≈ 12,4 eV) to ionize atoms. Radio, microwave, infrared,
 * visible light and the near ultraviolet stay below it.
 * Unit: m
 * Source: ICNIRP guidelines (non-ionizing radiation covers 100 nm … 1 mm);
 *         ICRU Report 85 uses the same optical/ionizing boundary.
 */
export const IONIZING_BOUNDARY_WAVELENGTH = 100e-9 as const;

/**
 * Standard atmospheric pressure
 * Unit: Pa (Pascal)
 * Source: ISO 2533:1975
 */
export const STANDARD_PRESSURE = 101_325 as const;

/**
 * Standard atmospheric pressure in hPa (= STANDARD_PRESSURE / 100)
 * Unit: hPa
 * Source: ISO 2533:1975 / ITU-R P.835
 */
export const STANDARD_PRESSURE_HPA = 1013.25 as const;

/**
 * Standard temperature (reference)
 * Unit: K (Kelvin)
 * Source: ISO 2533:1975
 */
export const STANDARD_TEMPERATURE = 288.15 as const;

/**
 * Reference surface water vapour density used by ITU-R P.676 (Fig. 1 "standard" curve)
 * Unit: g/m³
 * Source: ITU-R P.676-13, ITU-R P.835 (mean annual global reference atmosphere)
 */
export const STANDARD_WATER_VAPOR_DENSITY = 7.5 as const;

/**
 * Temperature threshold between dry snow (below) and wet/melting snow (at or above)
 * Unit: K
 * Source: ITU-R P.530-18 §2.4.2; Oguchi, Proc. IEEE 71(9), 1983
 */
export const WET_SNOW_THRESHOLD_K = 273.15 as const;

/**
 * Minimum loss tangent σ/(ωε) for which the good-conductor skin-depth formula
 * δ = √(2/(ωμσ)) is considered valid (σ ≫ ωε).
 * Source: Pozar, Microwave Engineering, §1.4
 */
export const GOOD_CONDUCTOR_LOSS_TANGENT_MIN = 10 as const;

/**
 * Reference temperature for noise calculations (IEEE standard)
 * Unit: K (Kelvin)
 * Source: IEEE Std 100
 */
export const REFERENCE_TEMPERATURE = 290 as const;

// ============================================================================
// Earth and Propagation Constants
// ============================================================================

/**
 * Earth radius (mean)
 * Unit: m
 * Source: IUGG (International Union of Geodesy and Geophysics)
 */
export const EARTH_RADIUS_MEAN = 6_371_000 as const;

/**
 * Earth radius at equator
 * Unit: m
 * Source: WGS84
 */
export const EARTH_RADIUS_EQUATORIAL = 6_378_137 as const;

/**
 * Earth radius at poles
 * Unit: m
 * Source: WGS84
 */
export const EARTH_RADIUS_POLAR = 6_356_752 as const;

/**
 * Effective Earth radius factor for radio propagation
 * Accounts for atmospheric refraction (4/3 Earth model)
 * Source: ITU-R P.834
 */
export const EFFECTIVE_EARTH_RADIUS_FACTOR = 4 / 3;

/**
 * Effective Earth radius for radio calculations
 * Unit: m
 * Source: ITU-R P.834
 */
export const EFFECTIVE_EARTH_RADIUS = EARTH_RADIUS_MEAN * EFFECTIVE_EARTH_RADIUS_FACTOR;

// ============================================================================
// Ionosphere Parameters
// Source: ITU-R P.1239, NASA GSFC
// ============================================================================

/**
 * Ionospheric layer definitions
 * Each layer has altitude range and typical behavior
 */
export interface IonosphericLayer {
  id: string;
  name: string;
  nameDE: string;
  altitudeMinKm: number;
  altitudeMaxKm: number;
  typicalPeakKm: number;
  description: string;
  descriptionDE: string;
  daytimePresent: boolean;
  nighttimePresent: boolean;
  affectsHF: boolean;
  notes?: string;
}

/**
 * D-Layer: Lowest ionospheric layer, absorbs HF during day
 */
export const IONOSPHERE_D_LAYER: IonosphericLayer = {
  id: 'd-layer',
  name: 'D Layer',
  nameDE: 'D-Schicht',
  altitudeMinKm: 60,
  altitudeMaxKm: 90,
  typicalPeakKm: 75,
  description: 'Absorbs HF during day, disappears at night',
  descriptionDE: 'Absorbiert HF am Tag, verschwindet nachts',
  daytimePresent: true,
  nighttimePresent: false,
  affectsHF: true,
  notes: 'Main cause of daytime MF/HF absorption. Ionized by solar X-rays.'
};

/**
 * E-Layer: Sporadic E can cause unusual VHF propagation
 */
export const IONOSPHERE_E_LAYER: IonosphericLayer = {
  id: 'e-layer',
  name: 'E Layer',
  nameDE: 'E-Schicht',
  altitudeMinKm: 90,
  altitudeMaxKm: 150,
  typicalPeakKm: 110,
  description: 'Reflects MF/lower HF, sporadic E allows VHF',
  descriptionDE: 'Reflektiert MF/unteres HF, Sporadische E ermöglicht VHF',
  daytimePresent: true,
  nighttimePresent: false, // Weakens but may persist
  affectsHF: true,
  notes: 'Sporadic E (Es) patches can reflect up to 150 MHz.'
};

/**
 * F1-Layer: Daytime only, merges with F2 at night
 */
export const IONOSPHERE_F1_LAYER: IonosphericLayer = {
  id: 'f1-layer',
  name: 'F1 Layer',
  nameDE: 'F1-Schicht',
  altitudeMinKm: 150,
  altitudeMaxKm: 250,
  typicalPeakKm: 200,
  description: 'Daytime layer, merges with F2 at night',
  descriptionDE: 'Tagesschicht, verschmilzt nachts mit F2',
  daytimePresent: true,
  nighttimePresent: false,
  affectsHF: true,
  notes: 'Most prominent during summer at mid-latitudes.'
};

/**
 * F2-Layer: Primary layer for HF long-distance communication
 */
export const IONOSPHERE_F2_LAYER: IonosphericLayer = {
  id: 'f2-layer',
  name: 'F2 Layer',
  nameDE: 'F2-Schicht',
  altitudeMinKm: 250,
  altitudeMaxKm: 400,
  typicalPeakKm: 300,
  description: 'Primary HF reflection layer, present day and night',
  descriptionDE: 'Hauptreflexionsschicht für HF, tag und nacht vorhanden',
  daytimePresent: true,
  nighttimePresent: true,
  affectsHF: true,
  notes: 'Most important for HF DX. Height and density vary with solar cycle.'
};

/**
 * All ionospheric layers
 */
export const IONOSPHERIC_LAYERS: IonosphericLayer[] = [
  IONOSPHERE_D_LAYER,
  IONOSPHERE_E_LAYER,
  IONOSPHERE_F1_LAYER,
  IONOSPHERE_F2_LAYER,
];

/**
 * Critical frequencies and MUF estimation parameters
 * Source: ITU-R P.373
 */
export const IONOSPHERE_PARAMETERS = {
  /** Typical daytime critical frequency for F2 layer (MHz) - varies with solar activity */
  typicalF2CriticalFrequencyMHz: { low: 4, high: 14 },
  /** Typical F2 reflection height used for MUF/skip estimates (km), ITU-R P.1239 */
  typicalF2HeightKm: 300,
  /** Reference distance for the classical MUF factor M(3000)F2 (km) */
  mufReferenceDistanceKm: 3000,
  /** Upper bound of the MUF factor M(3000)F2 (ITU-R P.1239: typ. 2.5-3.5) */
  mufFactorMax: 3.5,
  /**
   * Night-time reduction of foF2 relative to the daytime value (typ. 0.4-0.6)
   * Source: ITU-R P.1239 median maps, mid-latitudes
   */
  nightF2ReductionFactor: 0.5,
  /**
   * Didactic LUF estimate as a fraction of the MUF. The real LUF depends on D-layer
   * absorption (∝ 1/f², solar zenith angle), transmitter power, antennas and noise -
   * it has no fixed relation to the MUF. Used ONLY for schematic visualisation.
   */
  lufEstimateFactor: { day: 0.5, night: 0.2 },
  /** Solar flux index range (10.7cm flux) */
  solarFluxRange: { min: 65, max: 300 },
} as const;

// ============================================================================
// Atmospheric Absorption
// Source: ITU-R P.676-13 (Attenuation by atmospheric gases)
// Peak values: line-by-line model (Annex 1) at 1013.25 hPa, 288.15 K, 7.5 g/m³,
// see $lib/utils/itu676.ts - consistent with ABSORPTION_PEAKS in atmosphericAttenuation.ts
// ============================================================================

/**
 * Atmospheric absorption peak definition
 */
export interface AtmosphericAbsorptionPeak {
  id: string;
  name: string;
  nameDE: string;
  molecule: string;
  peakFrequencyGHz: number;
  peakAttenuationDbKm: number;
  bandwidthGHz: number;
  description: string;
  descriptionDE: string;
  notes?: string;
}

/**
 * Water vapor absorption at 22 GHz
 */
export const ABSORPTION_WATER_22GHZ: AtmosphericAbsorptionPeak = {
  id: 'h2o-22ghz',
  name: 'Water Vapor 22 GHz',
  nameDE: 'Wasserdampf 22 GHz',
  molecule: 'H2O',
  peakFrequencyGHz: 22.235,
  peakAttenuationDbKm: 0.19,
  bandwidthGHz: 4,
  description: 'Water vapor rotational transition',
  descriptionDE: 'Wasserdampf-RotationsÜbergang',
  notes: 'Attenuation varies with humidity. Value for 7.5 g/m³ water vapor.'
};

/**
 * Oxygen absorption at 60 GHz (primary peak)
 */
export const ABSORPTION_OXYGEN_60GHZ: AtmosphericAbsorptionPeak = {
  id: 'o2-60ghz',
  name: 'Oxygen 60 GHz',
  nameDE: 'Sauerstoff 60 GHz',
  molecule: 'O2',
  peakFrequencyGHz: 60,
  peakAttenuationDbKm: 14.7,
  bandwidthGHz: 10,
  description: 'Oxygen magnetic spin resonance complex',
  descriptionDE: 'Sauerstoff-Spinresonanz-Komplex',
  notes: 'Complex of lines 50-70 GHz. Used for secure short-range communications.'
};

/**
 * Oxygen absorption at 118 GHz (secondary peak)
 */
export const ABSORPTION_OXYGEN_118GHZ: AtmosphericAbsorptionPeak = {
  id: 'o2-118ghz',
  name: 'Oxygen 118 GHz',
  nameDE: 'Sauerstoff 118 GHz',
  molecule: 'O2',
  peakFrequencyGHz: 118.75,
  peakAttenuationDbKm: 1.9,
  bandwidthGHz: 2,
  description: 'Oxygen absorption line',
  descriptionDE: 'Sauerstoff-Absorptionslinie',
  notes: 'Single isolated line.'
};

/**
 * Water vapor absorption at 183 GHz
 */
export const ABSORPTION_WATER_183GHZ: AtmosphericAbsorptionPeak = {
  id: 'h2o-183ghz',
  name: 'Water Vapor 183 GHz',
  nameDE: 'Wasserdampf 183 GHz',
  molecule: 'H2O',
  peakFrequencyGHz: 183.31,
  peakAttenuationDbKm: 28,
  bandwidthGHz: 8,
  description: 'Strong water vapor line',
  descriptionDE: 'Starke Wasserdampf-Linie',
  notes: 'Very strong absorption, used for atmospheric sensing. Value for 7.5 g/m³ water vapor.'
};

/**
 * Water vapor absorption at 325 GHz
 */
export const ABSORPTION_WATER_325GHZ: AtmosphericAbsorptionPeak = {
  id: 'h2o-325ghz',
  name: 'Water Vapor 325 GHz',
  nameDE: 'Wasserdampf 325 GHz',
  molecule: 'H2O',
  peakFrequencyGHz: 325.15,
  peakAttenuationDbKm: 38,
  bandwidthGHz: 10,
  description: 'Water vapor absorption in sub-THz',
  descriptionDE: 'Wasserdampf-Absorption im Sub-THz-Bereich',
  notes: 'Limits THz communication range. Value for 7.5 g/m³ water vapor.'
};

/**
 * All atmospheric absorption peaks
 */
export const ATMOSPHERIC_ABSORPTION_PEAKS: AtmosphericAbsorptionPeak[] = [
  ABSORPTION_WATER_22GHZ,
  ABSORPTION_OXYGEN_60GHZ,
  ABSORPTION_OXYGEN_118GHZ,
  ABSORPTION_WATER_183GHZ,
  ABSORPTION_WATER_325GHZ,
];

/**
 * Atmospheric windows (low absorption bands)
 * These frequency ranges have relatively low atmospheric attenuation
 */
export const ATMOSPHERIC_WINDOWS = {
  /** Below 10 GHz: Minimal atmospheric absorption */
  vhfUhf: { minGHz: 0, maxGHz: 10, attenuationDbKm: 0.01 },
  /** 30-50 GHz: Window between water vapor and oxygen peaks */
  kaVBand: { minGHz: 30, maxGHz: 50, attenuationDbKm: 0.1 },
  /** 70-100 GHz: Window above oxygen complex */
  wBand: { minGHz: 70, maxGHz: 100, attenuationDbKm: 0.4 },
  /** 130-170 GHz: Window between oxygen and water peaks */
  dBand: { minGHz: 130, maxGHz: 170, attenuationDbKm: 0.5 },
  /** 200-320 GHz: Window with some usability */
  subThz1: { minGHz: 200, maxGHz: 320, attenuationDbKm: 2 },
} as const;

// ============================================================================
// VLF/ELF Seawater Penetration
// Source: ITU-R P.684-7
// ============================================================================

/**
 * Seawater conductivity and penetration parameters
 */
export interface SeawaterPenetration {
  frequencyHz: number;
  skinDepthM: number;
  practicalDepthM: number;
  notes: string;
}

/**
 * Seawater electrical conductivity
 * Unit: S/m (Siemens per meter)
 * Source: Average ocean water
 */
export const SEAWATER_CONDUCTIVITY = 4 as const;

/**
 * VLF/ELF penetration depths in seawater
 * Skin depth formula: delta = sqrt(2 / (omega * mu * sigma))
 * Practical communication depth is typically 2-3 skin depths
 *
 * Source: ITU-R P.684-7, Navy research publications
 */
export const SEAWATER_PENETRATION: SeawaterPenetration[] = [
  {
    frequencyHz: 3,
    skinDepthM: 145,
    practicalDepthM: 200,
    notes: 'ELF band, extremely low data rate (<1 bit/min)'
  },
  {
    frequencyHz: 30,
    skinDepthM: 46,
    practicalDepthM: 100,
    notes: 'Upper ELF, Project Sanguine/ELF (US Navy)'
  },
  {
    frequencyHz: 300,
    skinDepthM: 14.5,
    practicalDepthM: 40,
    notes: 'ULF band'
  },
  {
    frequencyHz: 3000,
    skinDepthM: 4.6,
    practicalDepthM: 15,
    notes: 'Lower VLF'
  },
  {
    frequencyHz: 10000,
    skinDepthM: 2.5,
    practicalDepthM: 8,
    notes: 'VLF, typical submarine broadcast frequency'
  },
  {
    frequencyHz: 30000,
    skinDepthM: 1.5,
    practicalDepthM: 5,
    notes: 'Upper VLF'
  },
];

// calculateSkinDepth() wurde nach $lib/utils/calculations.ts verschoben
// (Datenmodul ohne Berechnungslogik; siehe Tech-Debt P1-6).

// ============================================================================
// Rain Attenuation Parameters
// Source: ITU-R P.838-3
// ============================================================================

/**
 * Rain rate classifications (ITU-R P.837)
 */
export const RAIN_RATES = {
  /** Light rain */
  light: { mmPerHour: 2.5, description: 'Light rain', descriptionDE: 'Leichter Regen' },
  /** Moderate rain */
  moderate: { mmPerHour: 12.5, description: 'Moderate rain', descriptionDE: 'Mäßiger Regen' },
  /** Heavy rain */
  heavy: { mmPerHour: 25, description: 'Heavy rain', descriptionDE: 'Starker Regen' },
  /** Very heavy rain */
  veryHeavy: { mmPerHour: 50, description: 'Very heavy rain', descriptionDE: 'Sehr starker Regen' },
  /** Tropical/Monsoon */
  tropical: { mmPerHour: 100, description: 'Tropical/Monsoon', descriptionDE: 'Tropisch/Monsun' },
} as const;

/**
 * Rain attenuation at key frequencies for 25 mm/h (heavy rain), horizontal polarization
 * Values computed with ITU-R P.838-3 (k, α from Tables 1-4), see calculateRainAttenuation().
 * A unit test keeps this table in sync with the model (±2 %).
 * Source: ITU-R P.838-3
 */
export const RAIN_ATTENUATION_HEAVY = {
  '10GHz': { frequencyGHz: 10, attenuationDbKm: 0.70 },
  '20GHz': { frequencyGHz: 20, attenuationDbKm: 2.75 },
  '30GHz': { frequencyGHz: 30, attenuationDbKm: 5.09 },
  '40GHz': { frequencyGHz: 40, attenuationDbKm: 7.23 },
  '50GHz': { frequencyGHz: 50, attenuationDbKm: 8.90 },
  '80GHz': { frequencyGHz: 80, attenuationDbKm: 11.56 },
} as const;

/**
 * Typical rain height (0 °C isotherm + 0.36 km) for slant-path precipitation estimates
 * in mid-latitudes. Used to limit the precipitation path length on Earth-space links:
 * L_s ≈ h_R / sin θ (no horizontal reduction factor - simplification of ITU-R P.618).
 * Unit: km
 * Source: ITU-R P.839-4 (h_R ≈ 3-4 km for Europe)
 */
export const RAIN_HEIGHT_KM = 3 as const;

/**
 * Path length above which a link-budget preset is treated as an Earth-space path
 * (no terrestrial line-of-sight link is that long; LEO ≥ ~400 km).
 * Unit: km
 */
export const EARTH_SPACE_PATH_THRESHOLD_KM = 500 as const;

/**
 * Default elevation angle for Earth-space link budgets (ITU-R P.676 Annex 2 valid 5°-90°)
 * Unit: degrees
 */
export const DEFAULT_EARTH_SPACE_ELEVATION_DEG = 30 as const;

// ============================================================================
// Link Budget Constants
// ============================================================================

/**
 * Typical system noise temperatures
 * Unit: Kelvin
 */
export const NOISE_TEMPERATURES = {
  /** Cosmic background (sky noise at high elevation, low frequency) */
  cosmicBackground: 2.7,
  /** Clear sky zenith at 10 GHz */
  clearSky10GHz: 15,
  /** Clear sky zenith at 30 GHz */
  clearSky30GHz: 40,
  /** Ground temperature (Earth surface looking down) */
  earthSurface: 290,
  /** Typical LNA noise temperature */
  typicalLna: 50,
  /** Quiet rural area at VHF */
  ruralVhf: 1000,
  /** Urban area at VHF */
  urbanVhf: 10000,
} as const;

/**
 * Common thermal noise calculations
 */
export const THERMAL_NOISE = {
  /** Noise power density at T0 = 290K: -174 dBm/Hz */
  noiseDensityDbmHz: -174,
  /** Noise floor in 1 Hz bandwidth at 290K (watts) */
  noiseFloor1Hz: BOLTZMANN_CONSTANT * REFERENCE_TEMPERATURE,
} as const;

// ============================================================================
// FSPL Reference Points
// Useful for validation and quick calculations
// ============================================================================

/**
 * Reference FSPL values for common scenarios
 * FSPL(dB) = 20*log10(d) + 20*log10(f) + 20*log10(4*pi/c)
 * Simplified: FSPL(dB) = 20*log10(d_m) + 20*log10(f_Hz) - 147.55
 */
export const FSPL_REFERENCES = {
  /** 1 GHz, 1 km */
  '1GHz_1km': { frequencyHz: 1e9, distanceM: 1000, fsplDb: 92.45 },
  /** 2.4 GHz, 100 m (typical WiFi) */
  '2.4GHz_100m': { frequencyHz: 2.4e9, distanceM: 100, fsplDb: 80.0 },
  /** 5 GHz, 100 m (5 GHz WiFi) */
  '5GHz_100m': { frequencyHz: 5e9, distanceM: 100, fsplDb: 86.4 },
  /** 28 GHz, 100 m (5G mmWave) */
  '28GHz_100m': { frequencyHz: 28e9, distanceM: 100, fsplDb: 101.4 },
  /** 77 GHz, 100 m (automotive radar) */
  '77GHz_100m': { frequencyHz: 77e9, distanceM: 100, fsplDb: 110.2 },
} as const;

// ============================================================================
// Radar Cross Section Reference Values
// Source: Skolnik, Introduction to Radar Systems, 3rd ed., Table 2.2 (X-band, typical);
// Stealth values are public-domain estimates. Single source of truth for all RCS tables.
// ============================================================================

export interface RcsReference {
  id: string;
  /** Deutsche Bezeichnung */
  nameDE: string;
  /** Typischer Radarquerschnitt in m² */
  rcsM2: number;
  /** Kurzbeschreibung / typischer Bereich */
  descriptionDE: string;
}

/**
 * Typical monostatic radar cross sections in m² (microwave frequencies)
 */
export const RCS_REFERENCE: readonly RcsReference[] = [
  { id: 'insect', nameDE: 'Insekt', rcsM2: 1e-5, descriptionDE: 'ca. 10⁻⁵ m²' },
  { id: 'bird', nameDE: 'Vogel', rcsM2: 0.01, descriptionDE: 'Möwe, Taube: 0,001–0,01 m²' },
  { id: 'stealth-jet', nameDE: 'Stealth-Jet', rcsM2: 0.005, descriptionDE: 'Öffentliche Schätzungen 0,001–0,01 m²' },
  { id: 'drone', nameDE: 'Drohne (klein)', rcsM2: 0.1, descriptionDE: 'Quadrocopter: 0,01–0,1 m²' },
  { id: 'human', nameDE: 'Mensch', rcsM2: 1, descriptionDE: 'Typisch 0,5–1 m²' },
  { id: 'small-aircraft', nameDE: 'Kleinflugzeug', rcsM2: 2, descriptionDE: 'Cessna-Klasse: 1–2 m²' },
  { id: 'fighter', nameDE: 'Kampfjet (konventionell)', rcsM2: 5, descriptionDE: '2–6 m²' },
  { id: 'car', nameDE: 'PKW', rcsM2: 100, descriptionDE: 'Mittelklasse: ca. 100 m²' },
  { id: 'airliner', nameDE: 'Verkehrsflugzeug', rcsM2: 100, descriptionDE: 'Boeing 737: 20–100 m²' },
  { id: 'truck', nameDE: 'LKW', rcsM2: 200, descriptionDE: 'ca. 200 m²' },
  { id: 'boat', nameDE: 'Schiff (klein)', rcsM2: 1000, descriptionDE: 'Kutter, Segelboot mit Reflektor' },
  { id: 'ship', nameDE: 'Schiff (groß)', rcsM2: 1e4, descriptionDE: 'Containerschiff: ≥ 10⁴ m²' },
] as const;

// ============================================================================
// Digital Modulation Reference Data
// Source: Proakis, Digital Communications, 5th ed., Ch. 4 - approximate SNR per bit
// requirements for BER ≈ 1e-5 (uncoded, AWGN). Values are engineering rules of thumb.
// ============================================================================

export interface ModulationScheme {
  name: string;
  bitsPerSymbol: number;
  /** Erforderliches SNR in dB für BER ≈ 10⁻⁵ (uncodiert, AWGN) */
  requiredSnrDb: number;
  color: string;
}

export const MODULATION_SCHEMES: readonly ModulationScheme[] = [
  { name: 'BPSK', bitsPerSymbol: 1, requiredSnrDb: 6.8, color: '#22c55e' },
  { name: 'QPSK', bitsPerSymbol: 2, requiredSnrDb: 9.8, color: '#3b82f6' },
  { name: '8-PSK', bitsPerSymbol: 3, requiredSnrDb: 14, color: '#8b5cf6' },
  { name: '16-QAM', bitsPerSymbol: 4, requiredSnrDb: 16.5, color: '#f97316' },
  { name: '64-QAM', bitsPerSymbol: 6, requiredSnrDb: 22.5, color: '#ef4444' },
  { name: '256-QAM', bitsPerSymbol: 8, requiredSnrDb: 28.5, color: '#ec4899' },
  { name: '1024-QAM', bitsPerSymbol: 10, requiredSnrDb: 34.5, color: '#6366f1' },
] as const;

/**
 * Practical throughput factors for the "praktische Datenrate" estimate:
 * R_b ≈ B / (1 + α) · bits/Symbol · η
 * - rollOffFactor α: Nyquist-Filter roll-off (typ. 0.2-0.35; LTE/5G ≈ 0.22, DVB-S2 0.2-0.35)
 * - protocolEfficiency η: overhead for coding, pilots, guard intervals (typ. 0.7-0.85)
 * Source: Sklar, Digital Communications, §3.3 (Nyquist bandwidth); 3GPP TS 36.104
 */
export const PRACTICAL_THROUGHPUT = {
  rollOffFactor: 0.25,
  protocolEfficiency: 0.8,
} as const;
