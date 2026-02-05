/**
 * Unit tests for src/lib/utils/handlers.ts
 */

import { describe, it, expect, vi } from 'vitest';
import {
  parseNumericInput,
  parseNullableNumericInput,
  parsePositiveInput,
  parseNonNegativeInput,
  parseSelectValue,
  parseCheckboxValue,
  createNumericHandler,
  createSelectHandler,
  createCheckboxHandler,
  isInRange,
  isPositive,
  isNonNegative,
  clamp,
  safeDivide,
  safeLog,
  safePow,
  debounce
} from '$lib/utils/handlers';

// Helper to create mock events
function createInputEvent(value: string): Event {
  const event = new Event('input');
  Object.defineProperty(event, 'target', {
    value: { value }
  });
  return event;
}

function createSelectEvent(value: string): Event {
  const event = new Event('change');
  Object.defineProperty(event, 'target', {
    value: { value }
  });
  return event;
}

function createCheckboxEvent(checked: boolean): Event {
  const event = new Event('change');
  Object.defineProperty(event, 'target', {
    value: { checked }
  });
  return event;
}

describe('parseNumericInput', () => {
  it('should parse valid numbers', () => {
    expect(parseNumericInput(createInputEvent('123'))).toBe(123);
    expect(parseNumericInput(createInputEvent('123.45'))).toBe(123.45);
    expect(parseNumericInput(createInputEvent('-50'))).toBe(-50);
  });

  it('should return fallback for empty string', () => {
    expect(parseNumericInput(createInputEvent(''))).toBe(0);
    expect(parseNumericInput(createInputEvent(''), 10)).toBe(10);
  });

  it('should return fallback for invalid input', () => {
    expect(parseNumericInput(createInputEvent('abc'))).toBe(0);
    expect(parseNumericInput(createInputEvent('12abc'))).toBe(12);
  });

  it('should handle whitespace', () => {
    expect(parseNumericInput(createInputEvent('  123  '))).toBe(123);
  });

  it('should handle just minus sign', () => {
    expect(parseNumericInput(createInputEvent('-'))).toBe(0);
  });
});

describe('parsePositiveInput', () => {
  it('should return positive values', () => {
    expect(parsePositiveInput(createInputEvent('10'))).toBe(10);
  });

  it('should return fallback for non-positive values', () => {
    expect(parsePositiveInput(createInputEvent('0'))).toBe(0);
    expect(parsePositiveInput(createInputEvent('-5'))).toBe(0);
    expect(parsePositiveInput(createInputEvent('-5'), 1)).toBe(1);
  });
});

describe('parseNonNegativeInput', () => {
  it('should return non-negative values', () => {
    expect(parseNonNegativeInput(createInputEvent('0'))).toBe(0);
    expect(parseNonNegativeInput(createInputEvent('10'))).toBe(10);
  });

  it('should return fallback for negative values', () => {
    expect(parseNonNegativeInput(createInputEvent('-5'))).toBe(0);
    expect(parseNonNegativeInput(createInputEvent('-5'), 1)).toBe(1);
  });
});

describe('parseSelectValue', () => {
  it('should return selected value', () => {
    expect(parseSelectValue(createSelectEvent('GHz'))).toBe('GHz');
    expect(parseSelectValue(createSelectEvent('km'))).toBe('km');
  });
});

describe('parseCheckboxValue', () => {
  it('should return checked state', () => {
    expect(parseCheckboxValue(createCheckboxEvent(true))).toBe(true);
    expect(parseCheckboxValue(createCheckboxEvent(false))).toBe(false);
  });
});

describe('createNumericHandler', () => {
  it('should call setter with parsed value', () => {
    const setter = vi.fn();
    const handler = createNumericHandler(setter);
    handler(createInputEvent('42'));
    expect(setter).toHaveBeenCalledWith(42);
  });

  it('should respect min option', () => {
    const setter = vi.fn();
    const handler = createNumericHandler(setter, { min: 10 });
    handler(createInputEvent('5'));
    expect(setter).toHaveBeenCalledWith(10);
  });

  it('should respect max option', () => {
    const setter = vi.fn();
    const handler = createNumericHandler(setter, { max: 100 });
    handler(createInputEvent('150'));
    expect(setter).toHaveBeenCalledWith(100);
  });

  it('should apply transform', () => {
    const setter = vi.fn();
    const handler = createNumericHandler(setter, { transform: v => v * 2 });
    handler(createInputEvent('10'));
    expect(setter).toHaveBeenCalledWith(20);
  });
});

describe('createSelectHandler', () => {
  it('should call setter with selected value', () => {
    const setter = vi.fn();
    const handler = createSelectHandler(setter);
    handler(createSelectEvent('MHz'));
    expect(setter).toHaveBeenCalledWith('MHz');
  });
});

describe('createCheckboxHandler', () => {
  it('should call setter with checked state', () => {
    const setter = vi.fn();
    const handler = createCheckboxHandler(setter);
    handler(createCheckboxEvent(true));
    expect(setter).toHaveBeenCalledWith(true);
  });
});

describe('isInRange', () => {
  it('should return true for values in range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(0, 0, 10)).toBe(true);
    expect(isInRange(10, 0, 10)).toBe(true);
  });

  it('should return false for values out of range', () => {
    expect(isInRange(-1, 0, 10)).toBe(false);
    expect(isInRange(11, 0, 10)).toBe(false);
  });

  it('should return false for non-finite values', () => {
    expect(isInRange(NaN, 0, 10)).toBe(false);
    expect(isInRange(Infinity, 0, 10)).toBe(false);
  });
});

describe('isPositive', () => {
  it('should return true for positive values', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0.001)).toBe(true);
  });

  it('should return false for zero or negative', () => {
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
  });
});

describe('isNonNegative', () => {
  it('should return true for non-negative values', () => {
    expect(isNonNegative(0)).toBe(true);
    expect(isNonNegative(1)).toBe(true);
  });

  it('should return false for negative values', () => {
    expect(isNonNegative(-1)).toBe(false);
  });
});

describe('clamp', () => {
  it('should clamp values to range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should return min for non-finite values', () => {
    expect(clamp(NaN, 0, 10)).toBe(0);
    expect(clamp(Infinity, 0, 10)).toBe(0);
  });
});

describe('safeDivide', () => {
  it('should divide correctly', () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(1, 3)).toBeCloseTo(0.333, 2);
  });

  it('should return fallback for division by zero', () => {
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(10, 0, -1)).toBe(-1);
  });

  it('should return fallback for non-finite inputs', () => {
    expect(safeDivide(NaN, 2)).toBe(0);
    expect(safeDivide(10, NaN)).toBe(0);
    expect(safeDivide(Infinity, 2)).toBe(0);
  });
});

describe('safeLog', () => {
  it('should calculate log correctly', () => {
    expect(safeLog(100)).toBe(2);
    expect(safeLog(1000)).toBe(3);
  });

  it('should handle different bases', () => {
    expect(safeLog(8, 2)).toBeCloseTo(3, 5);
  });

  it('should return fallback for non-positive values', () => {
    expect(safeLog(0)).toBe(0);
    expect(safeLog(-1)).toBe(0);
  });

  it('should return fallback for non-finite values', () => {
    expect(safeLog(NaN)).toBe(0);
  });
});

describe('safePow', () => {
  it('should calculate power correctly', () => {
    expect(safePow(2, 3)).toBe(8);
    expect(safePow(10, 2)).toBe(100);
  });

  it('should return fallback for non-finite inputs', () => {
    expect(safePow(NaN, 2)).toBe(0);
    expect(safePow(2, NaN)).toBe(0);
  });

  it('should handle negative exponents', () => {
    expect(safePow(2, -1)).toBe(0.5);
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should pass arguments to debounced function', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');

    vi.useRealTimers();
  });
});

// ============================================================================
// parseNullableNumericInput
// ============================================================================

describe('parseNullableNumericInput', () => {
  it('should return null for empty input', () => {
    expect(parseNullableNumericInput(createInputEvent(''))).toBeNull();
  });

  it('should return null for whitespace-only input', () => {
    expect(parseNullableNumericInput(createInputEvent('   '))).toBeNull();
  });

  it('should return null for minus sign only', () => {
    expect(parseNullableNumericInput(createInputEvent('-'))).toBeNull();
  });

  it('should parse valid numbers', () => {
    expect(parseNullableNumericInput(createInputEvent('42'))).toBe(42);
    expect(parseNullableNumericInput(createInputEvent('3.14'))).toBe(3.14);
    expect(parseNullableNumericInput(createInputEvent('-7.5'))).toBe(-7.5);
  });

  it('should return null for non-numeric input', () => {
    expect(parseNullableNumericInput(createInputEvent('abc'))).toBeNull();
  });

  it('should return 0 for zero input', () => {
    expect(parseNullableNumericInput(createInputEvent('0'))).toBe(0);
  });

  it('should return null for NaN-producing input', () => {
    expect(parseNullableNumericInput(createInputEvent('NaN'))).toBeNull();
  });

  it('should return null for Infinity', () => {
    expect(parseNullableNumericInput(createInputEvent('Infinity'))).toBeNull();
  });
});
