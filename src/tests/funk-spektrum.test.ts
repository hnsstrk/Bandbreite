/**
 * Tests für die logarithmische Frequenzachse und die Aufbereitung der
 * ITU-Funkdienste für die Spektrumsleiste.
 */

import { describe, it, expect } from 'vitest';
import {
  decadeLabel,
  decadeTicks,
  frequencyAtPercent,
  logPositionPercent,
  segmentGeometry
} from '$lib/components/funk/spectrumScale.svelte';
import {
  ALLOCATION_STATUS_LABELS,
  SERVICE_SCALE_MAX_HZ,
  SERVICE_SCALE_MIN_HZ,
  allocationsAtFrequency,
  buildServiceRows,
  filterServices,
  serviceCoversFrequency,
  serviceGroups
} from '$lib/components/funk/serviceSpectrum.svelte';
import { RADIO_SERVICES } from '$lib/data/radioServices';

describe('logPositionPercent', () => {
  it('bildet die Grenzen auf 0 und 100 Prozent ab', () => {
    expect(logPositionPercent(1e3, 1e3, 1e9)).toBe(0);
    expect(logPositionPercent(1e9, 1e3, 1e9)).toBe(100);
  });

  it('legt die geometrische Mitte auf 50 Prozent', () => {
    // 1 MHz ist die geometrische Mitte zwischen 1 kHz und 1 GHz.
    expect(logPositionPercent(1e6, 1e3, 1e9)).toBeCloseTo(50, 10);
  });

  it('begrenzt Werte außerhalb der Achse', () => {
    expect(logPositionPercent(1e12, 1e3, 1e9)).toBe(100);
    expect(logPositionPercent(1, 1e3, 1e9)).toBe(0);
  });

  it('liefert 0 für unbrauchbare Eingaben', () => {
    expect(logPositionPercent(Number.NaN, 1e3, 1e9)).toBe(0);
    expect(logPositionPercent(-5, 1e3, 1e9)).toBe(0);
    expect(logPositionPercent(1e6, 0, 1e9)).toBe(0);
  });
});

describe('frequencyAtPercent', () => {
  it('ist die Umkehrung von logPositionPercent', () => {
    const hz = 2.4e9;
    const percent = logPositionPercent(hz, SERVICE_SCALE_MIN_HZ, SERVICE_SCALE_MAX_HZ);
    expect(frequencyAtPercent(percent, SERVICE_SCALE_MIN_HZ, SERVICE_SCALE_MAX_HZ)).toBeCloseTo(
      hz,
      -3
    );
  });
});

describe('segmentGeometry', () => {
  it('berechnet Position und Breite eines Bereichs', () => {
    const geometry = segmentGeometry(1e3, 1e6, 1e3, 1e9);
    expect(geometry.leftPercent).toBe(0);
    expect(geometry.widthPercent).toBeCloseTo(50, 10);
  });

  it('gibt sehr schmalen Bereichen eine Mindestbreite', () => {
    const geometry = segmentGeometry(100e6, 100.001e6, SERVICE_SCALE_MIN_HZ, SERVICE_SCALE_MAX_HZ);
    expect(geometry.widthPercent).toBeGreaterThan(0);
  });

  it('läuft nie über die rechte Kante hinaus', () => {
    const geometry = segmentGeometry(1e9, 1e9, 1e3, 1e9);
    expect(geometry.leftPercent + geometry.widthPercent).toBeLessThanOrEqual(100);
  });
});

describe('decadeTicks', () => {
  it('liefert je eine Marke pro Zehnerpotenz', () => {
    const ticks = decadeTicks(1e3, 1e6);
    expect(ticks.map((tick) => tick.hz)).toEqual([1e3, 1e4, 1e5, 1e6]);
  });

  it('beschriftet mit passender Einheit', () => {
    expect(decadeLabel(1e6)).toBe('1 MHz');
    expect(decadeLabel(1e9)).toBe('1 GHz');
    expect(decadeLabel(100e3)).toBe('100 kHz');
  });

  it('liefert nichts bei ungültigen Grenzen', () => {
    expect(decadeTicks(0, 1e9)).toEqual([]);
    expect(decadeTicks(1e9, 1e3)).toEqual([]);
  });
});

describe('Funkdienste für die Leiste', () => {
  it('kennt jede Gruppe des Datensatzes', () => {
    const groups = serviceGroups();
    expect(groups.length).toBeGreaterThan(0);
    const total = groups.reduce((sum, group) => sum + group.count, 0);
    expect(total).toBe(RADIO_SERVICES.length);
  });

  it('filtert nach Gruppe', () => {
    const rundfunk = filterServices('rundfunk');
    expect(rundfunk.length).toBeGreaterThan(0);
    expect(rundfunk.every((service) => service.group === 'rundfunk')).toBe(true);
    expect(filterServices('alle')).toHaveLength(RADIO_SERVICES.length);
  });

  it('sortiert die Zeilen nach der tiefsten Zuweisung', () => {
    const rows = buildServiceRows(filterServices('alle'));
    const mins = rows.map((row) => row.minHz);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
  });

  it('erzeugt zu jeder Zuweisung ein Segment innerhalb der Achse', () => {
    for (const row of buildServiceRows(filterServices('alle'))) {
      expect(row.segments).toHaveLength(row.service.allocations.length);
      for (const segment of row.segments) {
        expect(segment.leftPercent).toBeGreaterThanOrEqual(0);
        expect(segment.leftPercent + segment.widthPercent).toBeLessThanOrEqual(100.001);
      }
    }
  });

  it('findet den Amateurfunkdienst bei 145 MHz', () => {
    const amateur = RADIO_SERVICES.find((service) => service.id === 'amateurfunkdienst');
    expect(amateur).toBeDefined();
    expect(serviceCoversFrequency(amateur!, 145e6)).toBe(true);
    expect(allocationsAtFrequency(amateur!, 145e6).length).toBeGreaterThan(0);
    expect(serviceCoversFrequency(amateur!, 150e6)).toBe(false);
  });

  it('beschriftet alle Zuweisungsstatus', () => {
    expect(ALLOCATION_STATUS_LABELS.primaer).toBe('primär');
    expect(ALLOCATION_STATUS_LABELS.sekundaer).toBe('sekundär');
  });
});
