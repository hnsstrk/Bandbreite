/**
 * Frequenz- und Link-Budget-Presets
 *
 * Zentralisierte Preset-Definitionen für Calculator- und Converter-Komponenten.
 * Diese Presets ermöglichen schnellen Zugriff auf häufig verwendete Werte.
 */

// ============================================================================
// Typen
// ============================================================================

/**
 * Frequenz-Preset für Quick-Buttons in Calculatorn/Convertern
 */
export interface FrequencyPreset {
  /** Anzeigelabel (z.B. "2.4 GHz") */
  label: string;
  /** Frequenz in Hertz */
  hz: number;
  /** Kurzbeschreibung der Anwendung */
  description: string;
  /** Deutsche Beschreibung */
  descriptionDE?: string;
}

/**
 * Chart-Frequenz für Multi-Linien-Darstellung
 */
export interface ChartFrequency {
  /** Frequenz in Hertz */
  hz: number;
  /** Anzeigelabel */
  label: string;
  /** Linienfarbe (CSS-Farbe) */
  color: string;
}

/**
 * Link-Budget-Preset für komplette Szenarien
 */
export interface LinkBudgetPreset {
  /** Preset-Name */
  name: string;
  /** Sendeleistung in dBm */
  txPower: number;
  /** Senderantennengewinn in dBi */
  txGain: number;
  /** Senderkabelverlust in dB */
  txLoss: number;
  /** Distanz */
  distance: number;
  /** Distanzeinheit */
  distUnit: 'm' | 'km' | 'mi';
  /** Frequenz */
  freq: number;
  /** Frequenzeinheit */
  freqUnit: 'MHz' | 'GHz';
  /** Empfängerantennengewinn in dBi */
  rxGain: number;
  /** Empfängerkabelverlust in dB */
  rxLoss: number;
  /** Empfängerempfindlichkeit in dBm */
  rxSens: number;
  /** Fading-Reserve in dB */
  fade: number;
}

// ============================================================================
// Frequenz-Presets für FrequencyConverter
// ============================================================================

/**
 * Quick-Frequenzen für den FrequencyConverter
 * Ausgewählt für häufige Anwendungsfälle
 */
export const FREQUENCY_CONVERTER_PRESETS: FrequencyPreset[] = [
  { label: '2.4 GHz', hz: 2.4e9, description: 'WLAN/Bluetooth', descriptionDE: 'WLAN/Bluetooth' },
  { label: '5 GHz', hz: 5e9, description: 'WiFi 5', descriptionDE: 'WLAN 5' },
  { label: '28 GHz', hz: 28e9, description: '5G mmWave', descriptionDE: '5G mmWave' },
  { label: '77 GHz', hz: 77e9, description: 'Automotive Radar', descriptionDE: 'Kfz-Radar' },
];

// ============================================================================
// Frequenz-Presets für FSPL-Calculator
// ============================================================================

/**
 * Quick-Frequenzen für den FSPL-Calculator
 * Breites Spektrum von IoT bis mmWave
 */
export const FSPL_FREQUENCY_PRESETS: FrequencyPreset[] = [
  { label: '433 MHz', hz: 433e6, description: 'ISM/LoRa', descriptionDE: 'ISM/LoRa' },
  { label: '868 MHz', hz: 868e6, description: 'LoRa EU', descriptionDE: 'LoRa EU' },
  { label: '915 MHz', hz: 915e6, description: 'LoRa US', descriptionDE: 'LoRa US' },
  { label: '2.4 GHz', hz: 2.4e9, description: 'WLAN/BT', descriptionDE: 'WLAN/BT' },
  { label: '5 GHz', hz: 5e9, description: 'WiFi 5', descriptionDE: 'WLAN 5' },
  { label: '5.8 GHz', hz: 5.8e9, description: 'FPV/ISM', descriptionDE: 'FPV/ISM' },
  { label: '28 GHz', hz: 28e9, description: '5G mmWave', descriptionDE: '5G mmWave' },
  { label: '60 GHz', hz: 60e9, description: 'WiGig', descriptionDE: 'WiGig' },
  { label: '77 GHz', hz: 77e9, description: 'Automotive Radar', descriptionDE: 'Kfz-Radar' },
];

/**
 * Referenzfrequenzen für FSPL-Chart mit mehreren Linien
 */
export const FSPL_CHART_FREQUENCIES: ChartFrequency[] = [
  { hz: 433e6, label: '433 MHz', color: '#22c55e' },
  { hz: 868e6, label: '868 MHz', color: '#84cc16' },
  { hz: 2.4e9, label: '2.4 GHz', color: '#3b82f6' },
  { hz: 5e9, label: '5 GHz', color: '#8b5cf6' },
  { hz: 28e9, label: '28 GHz', color: '#f97316' },
  { hz: 60e9, label: '60 GHz', color: '#ef4444' },
];

// ============================================================================
// Distanz-Presets
// ============================================================================

/**
 * Standard-Distanzwerte für Quick-Buttons (in Metern)
 */
export const DISTANCE_PRESETS_METERS = [10, 50, 100, 500, 1000, 5000, 10000] as const;

// ============================================================================
// Link-Budget-Presets
// ============================================================================

/**
 * Vordefinierte Link-Budget-Szenarien
 */
export const LINK_BUDGET_PRESETS: LinkBudgetPreset[] = [
  {
    name: 'WLAN Indoor',
    txPower: 20,
    txGain: 2,
    txLoss: 0.5,
    distance: 30,
    distUnit: 'm',
    freq: 2.4,
    freqUnit: 'GHz',
    rxGain: 2,
    rxLoss: 0.5,
    rxSens: -80,
    fade: 10,
  },
  {
    name: 'LoRa Outdoor',
    txPower: 14,
    txGain: 3,
    txLoss: 1,
    distance: 5,
    distUnit: 'km',
    freq: 868,
    freqUnit: 'MHz',
    rxGain: 3,
    rxLoss: 1,
    rxSens: -137,
    fade: 15,
  },
  {
    name: 'Point-to-Point 5G',
    txPower: 20,
    txGain: 15,
    txLoss: 2,
    distance: 500,
    distUnit: 'm',
    freq: 28,
    freqUnit: 'GHz',
    rxGain: 15,
    rxLoss: 2,
    rxSens: -85,
    fade: 20,
  },
  {
    name: 'Satellitenlink',
    txPower: 30,
    txGain: 35,
    txLoss: 3,
    distance: 36000,
    distUnit: 'km',
    freq: 12,
    freqUnit: 'GHz',
    rxGain: 40,
    rxLoss: 2,
    rxSens: -120,
    fade: 6,
  },
  {
    name: 'Amateurfunk VHF',
    txPower: 37,
    txGain: 6,
    txLoss: 2,
    distance: 50,
    distUnit: 'km',
    freq: 145,
    freqUnit: 'MHz',
    rxGain: 6,
    rxLoss: 2,
    rxSens: -110,
    fade: 12,
  },
  {
    name: 'Bluetooth Low Energy',
    txPower: 0,
    txGain: 0,
    txLoss: 0,
    distance: 10,
    distUnit: 'm',
    freq: 2.4,
    freqUnit: 'GHz',
    rxGain: 0,
    rxLoss: 0,
    rxSens: -97,
    fade: 5,
  },
];

// ============================================================================
// Power-Frequency-Chart Datenpunkte
// ============================================================================

/**
 * Kategorie-Farben für Power-Frequency-Chart
 */
export const POWER_CHART_CATEGORY_COLORS = {
  communication: '#3b82f6',
  radar: '#f97316',
  satellite: '#22c55e',
  iot: '#8b5cf6',
  industrial: '#ec4899',
} as const;

/**
 * Kategorie-Labels (Deutsch)
 */
export const POWER_CHART_CATEGORY_LABELS = {
  communication: 'Kommunikation',
  radar: 'RADAR',
  satellite: 'Satellit',
  iot: 'IoT/RFID',
  industrial: 'Industrie',
} as const;

// ============================================================================
// Gruppierte Exporte
// ============================================================================

export const frequencyPresets = {
  converter: FREQUENCY_CONVERTER_PRESETS,
  fspl: FSPL_FREQUENCY_PRESETS,
  fsplChart: FSPL_CHART_FREQUENCIES,
};

export const distancePresets = {
  meters: DISTANCE_PRESETS_METERS,
};

export const linkBudgetPresets = LINK_BUDGET_PRESETS;
