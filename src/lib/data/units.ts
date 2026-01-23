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
