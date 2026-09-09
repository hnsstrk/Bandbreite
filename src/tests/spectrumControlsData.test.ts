/**
 * Tests der Bedienleisten-Daten (`components/spectrumControlsData.ts`):
 * volle und schmale Leiste müssen dieselben Reihen und Ansichten anbieten.
 */
import { describe, it, expect } from 'vitest';
import { ROW_CHIPS, VIEW_MODES, toViewMode } from '$lib/components/spectrumControlsData';
import { ROW_ORDER, ROW_LABELS } from '$lib/components/spectrumBands';

describe('ROW_CHIPS', () => {
  it('deckt jede Bandreihe in der Reihenfolge des Diagramms ab', () => {
    expect(ROW_CHIPS.map((chip) => chip.key)).toEqual([...ROW_ORDER]);
  });

  it('trägt für jede Reihe eine Kurzform und zwei Farbtokens', () => {
    for (const chip of ROW_CHIPS) {
      expect(chip.shortLabel.length).toBeGreaterThan(0);
      expect(chip.shortLabel.length).toBeLessThanOrEqual(chip.label.length);
      expect(chip.dot).toMatch(/^var\(--color-/);
      expect(chip.ink).toMatch(/^var\(--color-/);
    }
  });

  it('nutzt die Kurzform der Reihenbeschriftung im Diagramm', () => {
    for (const chip of ROW_CHIPS) {
      expect(chip.shortLabel).toBe(ROW_LABELS[chip.key]);
    }
  });
});

describe('VIEW_MODES', () => {
  it('bietet alle vier Ansichten', () => {
    expect(VIEW_MODES.map((mode) => mode.value)).toEqual(['rf', 'visible', 'full', 'ieee']);
  });

  it('hält die Kurzformen fürs Auswahlfeld knapp', () => {
    for (const mode of VIEW_MODES) {
      expect(mode.shortLabel.length).toBeLessThanOrEqual(10);
    }
  });
});

describe('toViewMode', () => {
  it('erkennt gültige Werte', () => {
    expect(toViewMode('full')).toBe('full');
    expect(toViewMode('ieee')).toBe('ieee');
  });

  it('fällt bei Unsinn auf die erste Ansicht zurück', () => {
    expect(toViewMode('unbekannt')).toBe('rf');
  });
});
