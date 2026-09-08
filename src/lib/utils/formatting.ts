/**
 * Zentrale Formatierung für die Bandbreite-Anwendung.
 *
 * **Alle angezeigten Zahlen stehen im deutschen Format** (Dezimalkomma,
 * Tausenderpunkt): „220,352 MHz", „12,49 cm", „80,05 dB", „1.000 km".
 * Grundlage ist ausschließlich {@link formatLocaleNumber} mit
 * `Intl.NumberFormat('de-DE')` — keine Zeichenersetzung von Hand.
 *
 * Rechenwerte bleiben unberührt: Diese Funktionen erzeugen nur Anzeigetexte.
 * Maschinenlesbare Werte (URL-Parameter, `<time>`, Datenattribute) behalten
 * den Punkt als Dezimaltrenner.
 */

// ============================================================================
// Locale-Grundlagen
// ============================================================================

/** Anzeigesprache aller Zahlen. Tausendertrenner ist der Punkt (de-DE-Standard). */
export const NUMBER_LOCALE = 'de-DE';

export interface LocaleNumberOptions {
  /** Mindestzahl der Nachkommastellen (Vorgabe: 0) */
  minFrac?: number;
  /** Höchstzahl der Nachkommastellen (Vorgabe: `minFrac`) */
  maxFrac?: number;
  /** Tausendertrenner setzen (Vorgabe: true; in Eingabefeldern false) */
  grouping?: boolean;
}

/** `Intl.NumberFormat` ist teuer im Aufbau — je Stellenkombination einmal. */
const FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();

function localeFormatter(minFrac: number, maxFrac: number, grouping: boolean): Intl.NumberFormat {
  const key = `${minFrac}|${maxFrac}|${grouping}`;
  const cached = FORMATTER_CACHE.get(key);
  if (cached) return cached;
  const created = new Intl.NumberFormat(NUMBER_LOCALE, {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
    useGrouping: grouping
  });
  FORMATTER_CACHE.set(key, created);
  return created;
}

/** Obergrenze von `Intl.NumberFormat` bzw. `toFixed` für Nachkommastellen. */
const MAX_FRACTION_DIGITS = 20;

/**
 * Die eine Stelle, an der aus einer Zahl deutscher Anzeigetext wird.
 *
 * Ungültige Werte (null, NaN, ±Infinity) liefern einen leeren String; die
 * aufrufenden Formatter setzen dort ihren eigenen Platzhalter („—").
 * Ein auf null gerundetes Ergebnis erscheint nie als „-0".
 *
 * @example formatLocaleNumber(1234.5, { minFrac: 2 }) // „1.234,50"
 */
export function formatLocaleNumber(
  value: number | null | undefined,
  options: LocaleNumberOptions = {}
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';

  const minFrac = Math.min(Math.max(options.minFrac ?? 0, 0), MAX_FRACTION_DIGITS);
  const maxFrac = Math.min(Math.max(options.maxFrac ?? minFrac, minFrac), MAX_FRACTION_DIGITS);
  const grouping = options.grouping ?? true;

  // „-0,00" ist kein sinnvoller Anzeigewert.
  const rounded = Number(value.toFixed(maxFrac));
  return localeFormatter(minFrac, maxFrac, grouping).format(rounded === 0 ? 0 : value);
}

/**
 * Feste Nachkommastellen im deutschen Format — der Ersatz für `toFixed`.
 *
 * @example formatFixed(80.0512, 2) // „80,05"
 */
export function formatFixed(value: number, decimals: number = 2, grouping: boolean = true): string {
  return formatLocaleNumber(value, { minFrac: decimals, maxFrac: decimals, grouping });
}

/**
 * Exponentialschreibweise mit deutschem Dezimalkomma, z. B. „1,23e-4".
 * Der Exponent bleibt maschinennah (`e-4`, `e+7`), nur die Mantisse wird
 * lokalisiert.
 */
export function formatExponential(value: number, digits: number = 2): string {
  if (!Number.isFinite(value)) return '';
  const [mantissa, exponent] = value.toExponential(digits).split('e');
  const head = formatLocaleNumber(Number(mantissa), {
    minFrac: digits,
    maxFrac: digits,
    grouping: false
  });
  return `${head}e${exponent}`;
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format a number with a specified number of decimal places.
 * Returns '—' for null, undefined, NaN, or Infinity.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback string for invalid values (default: '—')
 * @returns Formatted string
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2,
  fallback: string = '—'
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return formatFixed(value, decimals);
}

/**
 * Format a number with automatic precision based on magnitude.
 * Uses fewer decimals for larger numbers, more for smaller.
 *
 * @param value - The number to format
 * @param fallback - Fallback string for invalid values
 * @returns Formatted string
 */
export function formatNumberAuto(value: number | null | undefined, fallback: string = '—'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const absValue = Math.abs(value);
  if (absValue === 0) return '0';
  if (absValue >= 1000) return formatFixed(value, 0);
  if (absValue >= 100) return formatFixed(value, 1);
  if (absValue >= 10) return formatFixed(value, 2);
  if (absValue >= 1) return formatFixed(value, 3);
  if (absValue >= 0.1) return formatFixed(value, 4);
  if (absValue >= 0.01) return formatFixed(value, 5);
  return formatExponential(value, 2);
}

/**
 * Format a number using significant digits (toPrecision) with exponential notation
 * for very small or large values. Strips trailing zeros.
 * Useful for converter input fields where precision matters.
 *
 * **Einzige Ausnahme vom deutschen Zahlenformat.** Das Ergebnis steht als
 * `value` in den `<input type="number">`-Feldern der geschützten Konverter
 * (`FrequencyConverter`, `PowerConverter`). Ein `type="number"`-Feld nimmt
 * laut HTML-Spezifikation nur den Punkt an und leert sich bei einem Komma —
 * die Zahl ist dort also maschinenlesbarer Feldwert, kein Anzeigetext (wie
 * die Query-Parameter in `utils/urlState.svelte.ts`).
 * Sobald diese Felder auf `type="text"` mit `inputmode="decimal"` umgestellt
 * sind, wird hier auf {@link formatLocaleNumber} bzw.
 * {@link formatExponential} umgestellt — genau wie in `formatFieldValue`
 * von `ui/numberInput.svelte.ts`, das bereits deutsch formatiert.
 *
 * @param value - The number to format
 * @param precision - Number of significant digits (default: 6)
 * @param expThreshold - Magnitude threshold for exponential notation (default: 1e6)
 * @param expDigits - Digits in exponential notation (default: 4)
 * @param fallback - Fallback string for null/invalid values (default: '')
 * @returns Formatted string
 */
export function formatPrecisionNumber(
  value: number | null | undefined,
  precision: number = 6,
  expThreshold: number = 1e6,
  expDigits: number = 4,
  fallback: string = ''
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  if (value === 0) return '0';
  if (Math.abs(value) < 0.001 || Math.abs(value) >= expThreshold) {
    return value.toExponential(expDigits);
  }
  // Number(...) entfernt nachgestellte Nullen der Mantisse, ohne signifikante
  // Nullen ganzer Zahlen zu verstümmeln (100000 → "100000", nicht "1").
  const rounded = Number(value.toPrecision(precision));
  if (Math.abs(rounded) >= 1e21) return rounded.toExponential(expDigits);
  return rounded.toString();
}

/**
 * Format a radar cross section (area!) with an appropriate unit.
 * Uses area conversion factors: 1 km² = 10⁶ m², 1 m² = 10⁴ cm² = 10⁶ mm².
 *
 * @param rcsM2 - Radar cross section in m²
 * @returns Formatted string, e.g. "50,0 cm²", "10.000 m²", "10,0 mm²"
 */
export function formatRcs(rcsM2: number | null | undefined): string {
  if (rcsM2 === null || rcsM2 === undefined || !Number.isFinite(rcsM2) || rcsM2 < 0) {
    return '—';
  }
  if (rcsM2 >= 1e6) return `${formatFixed(rcsM2 / 1e6, 2)} km²`;
  if (rcsM2 >= 1) return `${formatFixed(rcsM2, 0)} m²`;
  if (rcsM2 >= 1e-4) return `${formatFixed(rcsM2 * 1e4, 1)} cm²`;
  return `${formatFixed(rcsM2 * 1e6, 1)} mm²`;
}

/**
 * Format a number with thousands separator (German style: 1.000.000).
 *
 * Dünner Wrapper um {@link formatLocaleNumber} mit „—" als Platzhalter.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string with German locale
 */
export function formatNumberLocale(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return formatFixed(value, decimals);
}

// ============================================================================
// Frequency Formatting
// ============================================================================

/**
 * Format frequency in Hz with automatic unit selection.
 * Selects the most appropriate unit (Hz, kHz, MHz, GHz, THz).
 *
 * @param hz - Frequency in Hertz
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatFrequency(hz: number | null | undefined, decimals: number = 2): string {
  if (hz === null || hz === undefined || !Number.isFinite(hz) || hz < 0) {
    return '—';
  }

  if (hz === 0) return '0 Hz';

  if (hz >= 1e12) return `${formatFixed(hz / 1e12, decimals)} THz`;
  if (hz >= 1e9) return `${formatFixed(hz / 1e9, decimals)} GHz`;
  if (hz >= 1e6) return `${formatFixed(hz / 1e6, decimals)} MHz`;
  if (hz >= 1e3) return `${formatFixed(hz / 1e3, decimals)} kHz`;
  return `${formatFixed(hz, decimals)} Hz`;
}

/**
 * Format frequency in GHz with specified decimals.
 *
 * @param ghz - Frequency in GHz
 * @param decimals - Number of decimal places
 * @returns Formatted string with GHz unit
 */
export function formatFrequencyGHz(ghz: number | null | undefined, decimals: number = 2): string {
  if (ghz === null || ghz === undefined || !Number.isFinite(ghz)) {
    return '—';
  }
  return `${formatFixed(ghz, decimals)} GHz`;
}

// ============================================================================
// Wavelength Formatting
// ============================================================================

/**
 * Format wavelength in meters with automatic unit selection.
 * Selects the most appropriate unit (km, m, cm, mm, um, nm).
 *
 * @param meters - Wavelength in meters
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatWavelength(meters: number | null | undefined, decimals: number = 2): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters) || meters <= 0) {
    return '—';
  }

  if (meters >= 1000) return `${formatFixed(meters / 1000, decimals)} km`;
  if (meters >= 1) return `${formatFixed(meters, decimals)} m`;
  if (meters >= 0.01) return `${formatFixed(meters * 100, decimals)} cm`;
  if (meters >= 0.001) return `${formatFixed(meters * 1000, decimals)} mm`;
  if (meters >= 1e-6) return `${formatFixed(meters * 1e6, decimals)} μm`;
  return `${formatFixed(meters * 1e9, decimals)} nm`;
}

// ============================================================================
// Distance Formatting
// ============================================================================

/**
 * Format distance in meters with automatic unit selection.
 * Selects m or km based on magnitude.
 *
 * @param meters - Distance in meters
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatDistance(meters: number | null | undefined, decimals: number = 1): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters) || meters < 0) {
    return '—';
  }

  if (meters === 0) return '0 m';
  if (meters >= 1000) return `${formatFixed(meters / 1000, decimals)} km`;
  return `${formatFixed(meters, decimals)} m`;
}

/**
 * Format distance with explicit unit control.
 *
 * @param value - Distance value
 * @param unit - Unit symbol (m, km, mi, ft)
 * @param decimals - Number of decimal places
 * @returns Formatted string with unit
 */
export function formatDistanceWithUnit(
  value: number | null | undefined,
  unit: string,
  decimals: number = 1
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return `${formatFixed(value, decimals)} ${unit}`;
}

// ============================================================================
// Power Formatting
// ============================================================================

/**
 * Format power in dBm.
 *
 * @param dbm - Power in dBm
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with dBm unit
 */
export function formatPowerDbm(dbm: number | null | undefined, decimals: number = 1): string {
  if (dbm === null || dbm === undefined || !Number.isFinite(dbm)) {
    return '—';
  }
  return `${formatFixed(dbm, decimals)} dBm`;
}

/**
 * Format power in dB (for gains/losses).
 *
 * @param db - Power in dB
 * @param decimals - Number of decimal places (default: 1)
 * @param showSign - Whether to show + for positive values
 * @returns Formatted string with dB unit
 */
export function formatPowerDb(
  db: number | null | undefined,
  decimals: number = 1,
  showSign: boolean = false
): string {
  if (db === null || db === undefined || !Number.isFinite(db)) {
    return '—';
  }
  const sign = showSign && db > 0 ? '+' : '';
  return `${sign}${formatFixed(db, decimals)} dB`;
}

/**
 * Format power in Watts with automatic unit selection.
 *
 * @param watts - Power in Watts
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatPowerWatts(watts: number | null | undefined, decimals: number = 2): string {
  if (watts === null || watts === undefined || !Number.isFinite(watts) || watts < 0) {
    return '—';
  }

  if (watts === 0) return '0 W';
  if (watts >= 1e9) return `${formatFixed(watts / 1e9, decimals)} GW`;
  if (watts >= 1e6) return `${formatFixed(watts / 1e6, decimals)} MW`;
  if (watts >= 1000) return `${formatFixed(watts / 1000, decimals)} kW`;
  if (watts >= 1) return `${formatFixed(watts, decimals)} W`;
  if (watts >= 0.001) return `${formatFixed(watts * 1000, decimals)} mW`;
  return `${formatFixed(watts * 1e6, decimals)} μW`;
}

// ============================================================================
// Attenuation Formatting
// ============================================================================

/**
 * Format attenuation in dB/km with automatic precision.
 *
 * @param dbPerKm - Attenuation in dB/km
 * @returns Formatted string with unit
 */
export function formatAttenuation(dbPerKm: number | null | undefined): string {
  if (dbPerKm === null || dbPerKm === undefined || !Number.isFinite(dbPerKm)) {
    return '—';
  }

  if (dbPerKm >= 10) return `${formatFixed(dbPerKm, 1)} dB/km`;
  if (dbPerKm >= 1) return `${formatFixed(dbPerKm, 2)} dB/km`;
  if (dbPerKm >= 0.1) return `${formatFixed(dbPerKm, 3)} dB/km`;
  if (dbPerKm >= 0.01) return `${formatFixed(dbPerKm, 4)} dB/km`;
  return `${formatExponential(dbPerKm, 2)} dB/km`;
}

/**
 * Format total attenuation in dB.
 *
 * @param db - Total attenuation in dB
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatAttenuationTotal(
  db: number | null | undefined,
  decimals: number = 2
): string {
  if (db === null || db === undefined || !Number.isFinite(db)) {
    return '—';
  }
  return `${formatFixed(db, decimals)} dB`;
}

// ============================================================================
// Data Rate Formatting
// ============================================================================

/**
 * Format a data rate in bit/s with automatic unit selection.
 * Selects bit/s, kbit/s, Mbit/s, Gbit/s or Tbit/s.
 *
 * Die Schreibweise ist immer deutsch; die frühere Option `{ locale: true }`
 * ist damit entfallen.
 *
 * @param bitsPerSecond - Data rate in bit/s
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatDataRate(
  bitsPerSecond: number | null | undefined,
  decimals: number = 2
): string {
  if (
    bitsPerSecond === null ||
    bitsPerSecond === undefined ||
    !Number.isFinite(bitsPerSecond) ||
    bitsPerSecond <= 0
  ) {
    return '—';
  }

  const units: { factor: number; symbol: string }[] = [
    { factor: 1e12, symbol: 'Tbit/s' },
    { factor: 1e9, symbol: 'Gbit/s' },
    { factor: 1e6, symbol: 'Mbit/s' },
    { factor: 1e3, symbol: 'kbit/s' },
    { factor: 1, symbol: 'bit/s' }
  ];
  const unit =
    units.find((candidate) => bitsPerSecond >= candidate.factor) ?? units[units.length - 1];
  return `${formatFixed(bitsPerSecond / unit.factor, decimals)} ${unit.symbol}`;
}

// ============================================================================
// Percentage Formatting
// ============================================================================

/**
 * Format a value as percentage.
 *
 * @param value - The value (0-1 or 0-100 depending on isDecimal)
 * @param decimals - Number of decimal places
 * @param isDecimal - Whether input is 0-1 (true) or 0-100 (false)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1,
  isDecimal: boolean = false
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  const pct = isDecimal ? value * 100 : value;
  return `${formatFixed(pct, decimals)}%`;
}

// ============================================================================
// Angle Formatting
// ============================================================================

/**
 * Format angle in degrees.
 *
 * @param degrees - Angle in degrees
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with degree symbol
 */
export function formatAngle(degrees: number | null | undefined, decimals: number = 1): string {
  if (degrees === null || degrees === undefined || !Number.isFinite(degrees)) {
    return '—';
  }
  return `${formatFixed(degrees, decimals)}°`;
}

// ============================================================================
// Temperature Formatting
// ============================================================================

/**
 * Format temperature in Celsius.
 *
 * @param celsius - Temperature in Celsius
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatTemperatureCelsius(
  celsius: number | null | undefined,
  decimals: number = 1
): string {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) {
    return '—';
  }
  return `${formatFixed(celsius, decimals)} °C`;
}

/**
 * Format temperature in Kelvin.
 *
 * @param kelvin - Temperature in Kelvin
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatTemperatureKelvin(
  kelvin: number | null | undefined,
  decimals: number = 1
): string {
  if (kelvin === null || kelvin === undefined || !Number.isFinite(kelvin)) {
    return '—';
  }
  return `${formatFixed(kelvin, decimals)} K`;
}

// ============================================================================
// Pressure Formatting
// ============================================================================

/**
 * Format atmospheric pressure in hPa.
 *
 * @param hpa - Pressure in hPa
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatPressure(hpa: number | null | undefined, decimals: number = 1): string {
  if (hpa === null || hpa === undefined || !Number.isFinite(hpa)) {
    return '—';
  }
  return `${formatFixed(hpa, decimals)} hPa`;
}
