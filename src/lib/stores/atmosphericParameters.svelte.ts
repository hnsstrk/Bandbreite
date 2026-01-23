/**
 * Store for atmospheric parameters used in ITU-R P.676 calculations.
 * Standard values based on ISA (International Standard Atmosphere).
 */

// Default values (ISA: International Standard Atmosphere at sea level)
export const DEFAULT_TEMPERATURE_K = 288.15; // 15°C
export const DEFAULT_PRESSURE_HPA = 1013.25; // Sea level
export const DEFAULT_WATER_VAPOR_DENSITY = 7.5; // g/m³ (moderate humidity)
export const DEFAULT_DISTANCE_KM = 1; // 1 km

export interface AtmosphericConditions {
  temperatureK: number;
  pressureHpa: number;
  waterVaporDensity: number;
  distanceKm: number;
}

/**
 * Creates a reactive store for atmospheric parameters.
 * Used for ITU-R P.676 atmospheric attenuation calculations.
 */
function createAtmosphericParametersStore() {
  let temperatureK = $state(DEFAULT_TEMPERATURE_K);
  let pressureHpa = $state(DEFAULT_PRESSURE_HPA);
  let waterVaporDensity = $state(DEFAULT_WATER_VAPOR_DENSITY);
  let distanceKm = $state(DEFAULT_DISTANCE_KM);

  return {
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

    /** All conditions as an object */
    get conditions(): AtmosphericConditions {
      return {
        temperatureK,
        pressureHpa,
        waterVaporDensity,
        distanceKm
      };
    },

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

    /** Reset all parameters to ISA defaults */
    reset() {
      temperatureK = DEFAULT_TEMPERATURE_K;
      pressureHpa = DEFAULT_PRESSURE_HPA;
      waterVaporDensity = DEFAULT_WATER_VAPOR_DENSITY;
      distanceKm = DEFAULT_DISTANCE_KM;
    }
  };
}

export const atmosphericParameters = createAtmosphericParametersStore();
