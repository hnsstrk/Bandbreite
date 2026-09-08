/**
 * Centralized input handlers for the Bandbreite application.
 * These handlers provide consistent input handling across components.
 *
 * Zahleneingaben akzeptieren **Komma und Punkt** als Dezimaltrenner
 * ({@link parseLocaleNumber}); die Anzeige erzeugt {@link formatLocaleNumber}
 * aus `utils/formatting.ts`.
 */

// ============================================================================
// Zahleneingabe in deutscher und englischer Schreibweise
// ============================================================================

/**
 * Zeichen, die in Zahleneingaben als Tausendertrenner auftreten: normales,
 * geschütztes und schmales geschütztes Leerzeichen sowie der Apostroph.
 */
const GROUPING_SPACES = /[\s\u00A0\u202F\u2009']/g;

/**
 * Liest eine Zahl in deutscher oder englischer Schreibweise.
 *
 * Regeln:
 * - Kommen **beide** Trennzeichen vor, ist das **hintere** der Dezimaltrenner:
 *   „1.000,5" → 1000.5, „1,000.5" → 1000.5.
 * - Kommt nur eines mehrfach vor, sind es Tausendertrenner:
 *   „1.234.567" → 1234567, „1,234,567" → 1234567.
 * - Kommt nur eines **einmal** vor, ist es der Dezimaltrenner:
 *   „1,5" → 1.5 und „1.5" → 1.5. Damit ist „1.000" **mehrdeutig** und wird
 *   bewusst als 1.0 gelesen — im deutschen Format schreibt man Tausender
 *   sonst mit weiteren Gruppen oder mit Komma dahinter.
 * - Leerzeichen und Apostrophe entfallen: „144 800" → 144800.
 * - Exponentialschreibweise bleibt lesbar: „2,4e9" → 2.4e9.
 *
 * @param raw - Eingegebener Text
 * @returns Zahl oder `NaN`, wenn nichts Lesbares darin steht
 */
export function parseLocaleNumber(raw: string): number {
  if (typeof raw !== 'string') return Number.NaN;

  const cleaned = raw.trim().replace(GROUPING_SPACES, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '+') return Number.NaN;

  const commaCount = (cleaned.match(/,/g) ?? []).length;
  const dotCount = (cleaned.match(/\./g) ?? []).length;

  let normalized: string;
  if (commaCount > 0 && dotCount > 0) {
    // Beide Zeichen: das hintere trennt die Nachkommastellen ab.
    const commaIsDecimal = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.');
    normalized = commaIsDecimal
      ? cleaned.split('.').join('').replace(',', '.')
      : cleaned.split(',').join('');
  } else if (commaCount > 1) {
    normalized = cleaned.split(',').join('');
  } else if (commaCount === 1) {
    normalized = cleaned.replace(',', '.');
  } else if (dotCount > 1) {
    normalized = cleaned.split('.').join('');
  } else {
    normalized = cleaned;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

// ============================================================================
// Type-safe Input Handlers
// ============================================================================

/**
 * Parse a numeric value from an input event.
 * Returns the parsed number, or a fallback value if parsing fails.
 * Komma und Punkt sind beide als Dezimaltrenner erlaubt ({@link parseLocaleNumber}).
 *
 * @param event - The input event
 * @param fallback - Fallback value for invalid input (default: 0)
 * @returns Parsed number
 */
export function parseNumericInput(event: Event, fallback: number = 0): number {
  const target = event.target as HTMLInputElement;
  const parsed = parseLocaleNumber(target.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parse a numeric value from an input event, returning null for empty input.
 * Use this when an empty input field should represent "no value" rather than zero.
 *
 * @param event - The input event
 * @returns Parsed number or null if input is empty/invalid
 */
export function parseNullableNumericInput(event: Event): number | null {
  const target = event.target as HTMLInputElement;
  const parsed = parseLocaleNumber(target.value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parse a positive numeric value from an input event.
 * Returns the parsed number if positive, otherwise a fallback.
 *
 * @param event - The input event
 * @param fallback - Fallback value for invalid input (default: 0)
 * @returns Parsed positive number
 */
export function parsePositiveInput(event: Event, fallback: number = 0): number {
  const value = parseNumericInput(event, fallback);
  return value > 0 ? value : fallback;
}

/**
 * Parse a non-negative numeric value from an input event.
 *
 * @param event - The input event
 * @param fallback - Fallback value for invalid input (default: 0)
 * @returns Parsed non-negative number
 */
export function parseNonNegativeInput(event: Event, fallback: number = 0): number {
  const value = parseNumericInput(event, fallback);
  return value >= 0 ? value : fallback;
}

/**
 * Parse a string value from a select event.
 *
 * @param event - The change event
 * @returns Selected value as string
 */
export function parseSelectValue(event: Event): string {
  const target = event.target as HTMLSelectElement;
  return target.value;
}

/**
 * Parse a boolean value from a checkbox event.
 *
 * @param event - The change event
 * @returns Checked state
 */
export function parseCheckboxValue(event: Event): boolean {
  const target = event.target as HTMLInputElement;
  return target.checked;
}

// ============================================================================
// Handler Factory Functions
// ============================================================================

/**
 * Create a numeric input handler that updates a state variable.
 *
 * @param setter - State setter function
 * @param options - Handler options
 * @returns Event handler function
 */
export function createNumericHandler(
  setter: (value: number) => void,
  options: {
    min?: number;
    max?: number;
    fallback?: number;
    transform?: (value: number) => number;
  } = {}
): (event: Event) => void {
  const { min, max, fallback = 0, transform } = options;

  return (event: Event) => {
    let value = parseNumericInput(event, fallback);

    // Apply bounds
    if (min !== undefined && value < min) value = min;
    if (max !== undefined && value > max) value = max;

    // Apply transform
    if (transform) value = transform(value);

    setter(value);
  };
}

/**
 * Create a select handler that updates a state variable.
 *
 * @param setter - State setter function
 * @returns Event handler function
 */
export function createSelectHandler(setter: (value: string) => void): (event: Event) => void {
  return (event: Event) => {
    setter(parseSelectValue(event));
  };
}

/**
 * Create a checkbox handler that updates a state variable.
 *
 * @param setter - State setter function
 * @returns Event handler function
 */
export function createCheckboxHandler(setter: (value: boolean) => void): (event: Event) => void {
  return (event: Event) => {
    setter(parseCheckboxValue(event));
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that a value is within a range.
 *
 * @param value - The value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if valid
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

/**
 * Validate that a value is positive.
 *
 * @param value - The value to validate
 * @returns True if positive
 */
export function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Validate that a value is non-negative.
 *
 * @param value - The value to validate
 * @returns True if non-negative
 */
export function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Clamp a value to a range.
 *
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// Safe Math Operations
// ============================================================================

/**
 * Safe division that returns a fallback for division by zero or invalid inputs.
 *
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param fallback - Fallback value (default: 0)
 * @returns Division result or fallback
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Safe logarithm that returns a fallback for non-positive inputs.
 *
 * @param value - The value to take log of
 * @param base - Log base (default: 10)
 * @param fallback - Fallback value (default: 0)
 * @returns Logarithm result or fallback
 */
export function safeLog(value: number, base: number = 10, fallback: number = 0): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  const result = base === 10 ? Math.log10(value) : Math.log(value) / Math.log(base);
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Safe power that handles edge cases.
 *
 * @param base - The base
 * @param exponent - The exponent
 * @param fallback - Fallback value (default: 0)
 * @returns Power result or fallback
 */
export function safePow(base: number, exponent: number, fallback: number = 0): number {
  if (!Number.isFinite(base) || !Number.isFinite(exponent)) {
    return fallback;
  }
  const result = Math.pow(base, exponent);
  return Number.isFinite(result) ? result : fallback;
}

// ============================================================================
// Debounce Helper
// ============================================================================

/**
 * Create a debounced version of a function.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}
