/**
 * Store for atmospheric parameters used in ITU-R P.676/P.838/P.840 calculations.
 * Standard values based on ISA (International Standard Atmosphere).
 *
 * References:
 * - ITU-R P.676-13: Attenuation by atmospheric gases
 * - ITU-R P.838-3: Specific attenuation model for rain
 * - ITU-R P.840-9: Attenuation due to clouds and fog
 */

// Default values (ISA: International Standard Atmosphere at sea level)
export const DEFAULT_TEMPERATURE_K = 288.15; // 15°C
export const DEFAULT_PRESSURE_HPA = 1013.25; // Sea level
export const DEFAULT_WATER_VAPOR_DENSITY = 7.5; // g/m³ (moderate humidity)
export const DEFAULT_DISTANCE_KM = 1; // 1 km

// Rain rate defaults
export const DEFAULT_RAIN_RATE = 0; // mm/h (no rain)
export const RAIN_RATE_LIGHT = 2.5; // mm/h (light rain)
export const RAIN_RATE_MODERATE = 12.5; // mm/h (moderate rain)
export const RAIN_RATE_HEAVY = 25; // mm/h (heavy rain)
export const RAIN_RATE_VERY_HEAVY = 50; // mm/h (very heavy rain)
export const RAIN_RATE_EXTREME = 100; // mm/h (extreme rain/cloudburst)

// Fog/cloud liquid water content defaults (ITU-R P.840)
export const DEFAULT_FOG_DENSITY = 0; // g/m³ (no fog)
export const FOG_DENSITY_LIGHT = 0.02; // g/m³ (light fog, visibility ~1000m)
export const FOG_DENSITY_MEDIUM = 0.05; // g/m³ (medium fog, visibility ~300m)
export const FOG_DENSITY_THICK = 0.5; // g/m³ (thick fog, visibility ~50m)

// Snow rate defaults
export const DEFAULT_SNOW_RATE = 0; // mm/h water equivalent (no snow)
export const SNOW_RATE_LIGHT = 1; // mm/h water equivalent
export const SNOW_RATE_MODERATE = 2.5; // mm/h water equivalent
export const SNOW_RATE_HEAVY = 5; // mm/h water equivalent

// Polarization types
export type Polarization = 'horizontal' | 'vertical' | 'circular';
export const DEFAULT_POLARIZATION: Polarization = 'horizontal';

// Elevation angle (degrees from horizon)
export const DEFAULT_ELEVATION_ANGLE = 0; // Horizontal path

export interface AtmosphericConditions {
  temperatureK: number;
  pressureHpa: number;
  waterVaporDensity: number;
  distanceKm: number;
}

export interface PrecipitationConditions {
  rainRateMmH: number;
  fogDensityGM3: number;
  snowRateMmH: number;
  polarization: Polarization;
  elevationAngleDeg: number;
}

export interface AllConditions extends AtmosphericConditions, PrecipitationConditions {}

/**
 * Creates a reactive store for atmospheric and precipitation parameters.
 * Used for ITU-R P.676, P.838, and P.840 attenuation calculations.
 */
function createAtmosphericParametersStore() {
  // Atmospheric parameters (ITU-R P.676)
  let temperatureK = $state(DEFAULT_TEMPERATURE_K);
  let pressureHpa = $state(DEFAULT_PRESSURE_HPA);
  let waterVaporDensity = $state(DEFAULT_WATER_VAPOR_DENSITY);
  let distanceKm = $state(DEFAULT_DISTANCE_KM);

  // Precipitation parameters (ITU-R P.838, P.840)
  let rainRateMmH = $state(DEFAULT_RAIN_RATE);
  let fogDensityGM3 = $state(DEFAULT_FOG_DENSITY);
  let snowRateMmH = $state(DEFAULT_SNOW_RATE);
  let polarization = $state<Polarization>(DEFAULT_POLARIZATION);
  let elevationAngleDeg = $state(DEFAULT_ELEVATION_ANGLE);

  return {
    // ========== Atmospheric Parameters (P.676) ==========

    /** Temperature in Kelvin */
    get temperatureK() {
      return temperatureK;
    },

    /** Temperature in Celsius (derived) */
    get temperatureCelsius() {
      return temperatureK - 273.15;
    },

    /** Atmospheric pressure in hPa */
    get pressureHpa() {
      return pressureHpa;
    },

    /** Water vapor density in g/m³ */
    get waterVaporDensity() {
      return waterVaporDensity;
    },

    /** Path distance in km */
    get distanceKm() {
      return distanceKm;
    },

    // ========== Precipitation Parameters (P.838, P.840) ==========

    /** Rain rate in mm/h */
    get rainRateMmH() {
      return rainRateMmH;
    },

    /** Fog/cloud liquid water density in g/m³ */
    get fogDensityGM3() {
      return fogDensityGM3;
    },

    /** Snow rate in mm/h (water equivalent) */
    get snowRateMmH() {
      return snowRateMmH;
    },

    /** Polarization type */
    get polarization() {
      return polarization;
    },

    /** Elevation angle in degrees */
    get elevationAngleDeg() {
      return elevationAngleDeg;
    },

    // ========== Condition Objects ==========

    /** Atmospheric conditions as an object */
    get conditions(): AtmosphericConditions {
      return {
        temperatureK,
        pressureHpa,
        waterVaporDensity,
        distanceKm
      };
    },

    /** Precipitation conditions as an object */
    get precipitationConditions(): PrecipitationConditions {
      return {
        rainRateMmH,
        fogDensityGM3,
        snowRateMmH,
        polarization,
        elevationAngleDeg
      };
    },

    /** All conditions combined */
    get allConditions(): AllConditions {
      return {
        temperatureK,
        pressureHpa,
        waterVaporDensity,
        distanceKm,
        rainRateMmH,
        fogDensityGM3,
        snowRateMmH,
        polarization,
        elevationAngleDeg
      };
    },

    // ========== Setters for Atmospheric Parameters ==========

    /** Set temperature in Kelvin */
    setTemperatureK(value: number) {
      if (value > 0) {
        temperatureK = value;
      }
    },

    /** Set temperature in Celsius */
    setTemperatureCelsius(value: number) {
      const kelvin = value + 273.15;
      if (kelvin > 0) {
        temperatureK = kelvin;
      }
    },

    /** Set pressure in hPa */
    setPressureHpa(value: number) {
      if (value > 0) {
        pressureHpa = value;
      }
    },

    /** Set water vapor density in g/m³ */
    setWaterVaporDensity(value: number) {
      if (value >= 0) {
        waterVaporDensity = value;
      }
    },

    /** Set path distance in km */
    setDistanceKm(value: number) {
      if (value > 0) {
        distanceKm = value;
      }
    },

    // ========== Setters for Precipitation Parameters ==========

    /** Set rain rate in mm/h */
    setRainRateMmH(value: number) {
      if (value >= 0) {
        rainRateMmH = value;
      }
    },

    /** Set fog density in g/m³ */
    setFogDensityGM3(value: number) {
      if (value >= 0) {
        fogDensityGM3 = value;
      }
    },

    /** Set snow rate in mm/h (water equivalent) */
    setSnowRateMmH(value: number) {
      if (value >= 0) {
        snowRateMmH = value;
      }
    },

    /** Set polarization type */
    setPolarization(value: Polarization) {
      polarization = value;
    },

    /** Set elevation angle in degrees */
    setElevationAngleDeg(value: number) {
      if (value >= 0 && value <= 90) {
        elevationAngleDeg = value;
      }
    },

    // ========== Reset Functions ==========

    /** Reset all parameters to ISA defaults */
    reset() {
      temperatureK = DEFAULT_TEMPERATURE_K;
      pressureHpa = DEFAULT_PRESSURE_HPA;
      waterVaporDensity = DEFAULT_WATER_VAPOR_DENSITY;
      distanceKm = DEFAULT_DISTANCE_KM;
      rainRateMmH = DEFAULT_RAIN_RATE;
      fogDensityGM3 = DEFAULT_FOG_DENSITY;
      snowRateMmH = DEFAULT_SNOW_RATE;
      polarization = DEFAULT_POLARIZATION;
      elevationAngleDeg = DEFAULT_ELEVATION_ANGLE;
    },

    /** Reset only atmospheric parameters */
    resetAtmospheric() {
      temperatureK = DEFAULT_TEMPERATURE_K;
      pressureHpa = DEFAULT_PRESSURE_HPA;
      waterVaporDensity = DEFAULT_WATER_VAPOR_DENSITY;
      distanceKm = DEFAULT_DISTANCE_KM;
    },

    /** Reset only precipitation parameters */
    resetPrecipitation() {
      rainRateMmH = DEFAULT_RAIN_RATE;
      fogDensityGM3 = DEFAULT_FOG_DENSITY;
      snowRateMmH = DEFAULT_SNOW_RATE;
      polarization = DEFAULT_POLARIZATION;
      elevationAngleDeg = DEFAULT_ELEVATION_ANGLE;
    }
  };
}

export const atmosphericParameters = createAtmosphericParametersStore();
