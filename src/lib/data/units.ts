export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
}

export const FREQUENCY_UNITS: UnitDefinition[] = [
  { id: 'Hz', label: 'Hertz', symbol: 'Hz' },
  { id: 'kHz', label: 'Kilohertz', symbol: 'kHz' },
  { id: 'MHz', label: 'Megahertz', symbol: 'MHz' },
  { id: 'GHz', label: 'Gigahertz', symbol: 'GHz' },
  { id: 'THz', label: 'Terahertz', symbol: 'THz' }
];

export const WAVELENGTH_UNITS: UnitDefinition[] = [
  { id: 'km', label: 'Kilometer', symbol: 'km' },
  { id: 'm', label: 'Meter', symbol: 'm' },
  { id: 'cm', label: 'Zentimeter', symbol: 'cm' },
  { id: 'mm', label: 'Millimeter', symbol: 'mm' },
  { id: 'μm', label: 'Mikrometer', symbol: 'μm' },
  { id: 'nm', label: 'Nanometer', symbol: 'nm' }
];

export const DEFAULT_FREQUENCY_UNIT = 'MHz';
export const DEFAULT_WAVELENGTH_UNIT = 'm';

// Power unit interfaces
export interface PowerUnitWatt extends UnitDefinition {
  factor: number;
}

export interface PowerUnitDb extends UnitDefinition {
  reference: number;
}

// Power units in Watt scale
export const POWER_UNITS_WATT: PowerUnitWatt[] = [
  { id: 'uw', label: 'Mikrowatt', symbol: 'µW', factor: 1e-6 },
  { id: 'mw', label: 'Milliwatt', symbol: 'mW', factor: 1e-3 },
  { id: 'w', label: 'Watt', symbol: 'W', factor: 1 },
  { id: 'kw', label: 'Kilowatt', symbol: 'kW', factor: 1e3 },
];

// Power units in dB scale
export const POWER_UNITS_DB: PowerUnitDb[] = [
  { id: 'dbm', label: 'dBm', symbol: 'dBm', reference: 1e-3 }, // Ref: 1 mW
  { id: 'dbw', label: 'dBW', symbol: 'dBW', reference: 1 },    // Ref: 1 W
];

export const DEFAULT_POWER_UNIT_WATT = 'w';
export const DEFAULT_POWER_UNIT_DB = 'dbm';

// Distance unit interface
export interface DistanceUnit extends UnitDefinition {
  factor: number; // Factor to convert to meters
}

// Distance units for FSPL and range calculations
export const DISTANCE_UNITS: DistanceUnit[] = [
  { id: 'm', label: 'Meter', symbol: 'm', factor: 1 },
  { id: 'km', label: 'Kilometer', symbol: 'km', factor: 1000 },
  { id: 'mi', label: 'Meile', symbol: 'mi', factor: 1609.344 },
  { id: 'ft', label: 'Fuss', symbol: 'ft', factor: 0.3048 },
  { id: 'yd', label: 'Yard', symbol: 'yd', factor: 0.9144 },
  { id: 'nmi', label: 'Seemeile', symbol: 'nmi', factor: 1852 },
];

export const DEFAULT_DISTANCE_UNIT = 'm';

// Attenuation unit interface
export interface AttenuationUnit extends UnitDefinition {
  perKm: boolean; // True if unit is per km, false if per m
}

// Attenuation units for atmospheric calculations
export const ATTENUATION_UNITS: AttenuationUnit[] = [
  { id: 'dB/km', label: 'Dezibel pro Kilometer', symbol: 'dB/km', perKm: true },
  { id: 'dB/m', label: 'Dezibel pro Meter', symbol: 'dB/m', perKm: false },
];

export const DEFAULT_ATTENUATION_UNIT = 'dB/km';

// Helper function to get unit by ID
export function getUnitById<T extends UnitDefinition>(units: T[], id: string): T | undefined {
  return units.find(u => u.id === id);
}

// Helper function to get distance factor
export function getDistanceFactor(unitId: string): number {
  const unit = getUnitById(DISTANCE_UNITS, unitId);
  return unit?.factor ?? 1;
}
