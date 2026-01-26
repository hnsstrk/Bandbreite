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
 * Standard atmospheric pressure
 * Unit: Pa (Pascal)
 * Source: ISO 2533:1975
 */
export const STANDARD_PRESSURE = 101_325 as const;

/**
 * Standard temperature (reference)
 * Unit: K (Kelvin)
 * Source: ISO 2533:1975
 */
export const STANDARD_TEMPERATURE = 288.15 as const;

/**
 * Reference temperature for noise calculations (IEEE standard)
 * Unit: K (Kelvin)
 * Source: IEEE Std 100
 */
export const REFERENCE_TEMPERATURE = 290 as const;

/**
 * All physical constants grouped
 */
export const PHYSICAL_CONSTANTS = {
  c: SPEED_OF_LIGHT,
  k: BOLTZMANN_CONSTANT,
  h: PLANCK_CONSTANT,
  e: ELEMENTARY_CHARGE,
  epsilon0: VACUUM_PERMITTIVITY,
  mu0: VACUUM_PERMEABILITY,
} as const;

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
export const EFFECTIVE_EARTH_RADIUS_FACTOR = 1.333333333333333;

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
  descriptionDE: 'Reflektiert MF/unteres HF, Sporadische E ermoeglicht VHF',
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
  descriptionDE: 'Hauptreflexionsschicht fuer HF, tag und nacht vorhanden',
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
  /** Maximum Usable Frequency is approximately 3x critical frequency at 3000km distance */
  mufFactor3000km: 3.0,
  /** Lowest Usable Frequency factor (accounts for absorption) */
  lufFactorTypical: 0.5,
  /** Solar flux index range (10.7cm flux) */
  solarFluxRange: { min: 65, max: 300 },
} as const;

// ============================================================================
// Atmospheric Absorption
// Source: ITU-R P.676-12 (Attenuation by atmospheric gases)
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
  peakAttenuationDbKm: 0.18,
  bandwidthGHz: 4,
  description: 'Water vapor rotational transition',
  descriptionDE: 'Wasserdampf-Rotationsuebergang',
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
  peakAttenuationDbKm: 15.0,
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
  peakAttenuationDbKm: 1.5,
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
  notes: 'Very strong absorption, used for atmospheric sensing.'
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
  peakAttenuationDbKm: 30,
  bandwidthGHz: 10,
  description: 'Water vapor absorption in sub-THz',
  descriptionDE: 'Wasserdampf-Absorption im Sub-THz-Bereich',
  notes: 'Limits THz communication range.'
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

/**
 * Calculate skin depth in seawater
 * @param frequencyHz - Frequency in Hertz
 * @param conductivity - Conductivity in S/m (default: seawater 4 S/m)
 * @returns Skin depth in meters
 */
export function calculateSkinDepth(frequencyHz: number, conductivity: number = SEAWATER_CONDUCTIVITY): number {
  if (frequencyHz <= 0 || conductivity <= 0) {
    return 0;
  }
  const omega = 2 * Math.PI * frequencyHz;
  return Math.sqrt(2 / (omega * VACUUM_PERMEABILITY * conductivity));
}

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
  moderate: { mmPerHour: 12.5, description: 'Moderate rain', descriptionDE: 'Maessiger Regen' },
  /** Heavy rain */
  heavy: { mmPerHour: 25, description: 'Heavy rain', descriptionDE: 'Starker Regen' },
  /** Very heavy rain */
  veryHeavy: { mmPerHour: 50, description: 'Very heavy rain', descriptionDE: 'Sehr starker Regen' },
  /** Tropical/Monsoon */
  tropical: { mmPerHour: 100, description: 'Tropical/Monsoon', descriptionDE: 'Tropisch/Monsun' },
} as const;

/**
 * Approximate rain attenuation at key frequencies
 * Values are for 25 mm/h rain rate (heavy rain)
 * Source: ITU-R P.838-3
 */
export const RAIN_ATTENUATION_HEAVY = {
  '10GHz': { frequencyGHz: 10, attenuationDbKm: 1.5 },
  '20GHz': { frequencyGHz: 20, attenuationDbKm: 5.5 },
  '30GHz': { frequencyGHz: 30, attenuationDbKm: 9.0 },
  '40GHz': { frequencyGHz: 40, attenuationDbKm: 12.0 },
  '50GHz': { frequencyGHz: 50, attenuationDbKm: 13.5 },
  '80GHz': { frequencyGHz: 80, attenuationDbKm: 15.0 },
} as const;

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

/**
 * FSPL formula constant: 20*log10(4*pi/c)
 * This equals approximately -147.55 dB when using meters and Hz
 */
export const FSPL_CONSTANT_DB = 20 * Math.log10(4 * Math.PI / SPEED_OF_LIGHT);

// ============================================================================
// Grouped Exports
// ============================================================================

export const physicsConstants = {
  speedOfLight: SPEED_OF_LIGHT,
  boltzmannConstant: BOLTZMANN_CONSTANT,
  planckConstant: PLANCK_CONSTANT,
  elementaryCharge: ELEMENTARY_CHARGE,
  vacuumPermittivity: VACUUM_PERMITTIVITY,
  vacuumPermeability: VACUUM_PERMEABILITY,
  standardPressure: STANDARD_PRESSURE,
  standardTemperature: STANDARD_TEMPERATURE,
  referenceTemperature: REFERENCE_TEMPERATURE,
} as const;

export const earthConstants = {
  radiusMean: EARTH_RADIUS_MEAN,
  radiusEquatorial: EARTH_RADIUS_EQUATORIAL,
  radiusPolar: EARTH_RADIUS_POLAR,
  effectiveRadiusFactor: EFFECTIVE_EARTH_RADIUS_FACTOR,
  effectiveRadius: EFFECTIVE_EARTH_RADIUS,
} as const;

export const ionosphereConstants = {
  layers: IONOSPHERIC_LAYERS,
  dLayer: IONOSPHERE_D_LAYER,
  eLayer: IONOSPHERE_E_LAYER,
  f1Layer: IONOSPHERE_F1_LAYER,
  f2Layer: IONOSPHERE_F2_LAYER,
  parameters: IONOSPHERE_PARAMETERS,
} as const;

export const atmosphereConstants = {
  absorptionPeaks: ATMOSPHERIC_ABSORPTION_PEAKS,
  windows: ATMOSPHERIC_WINDOWS,
  rainRates: RAIN_RATES,
  rainAttenuation: RAIN_ATTENUATION_HEAVY,
} as const;

export const submarineConstants = {
  seawaterConductivity: SEAWATER_CONDUCTIVITY,
  penetrationDepths: SEAWATER_PENETRATION,
  calculateSkinDepth,
} as const;
