/**
 * Tests für die Filterlogik der Notfrequenz-Tabelle und der
 * Funkdienst-Datenbank.
 */

import { describe, it, expect } from 'vitest';
import {
  DOMAIN_LABELS,
  EMPTY_EMERGENCY_FILTER,
  PURPOSE_LABELS,
  domainCounts,
  filterEmergency,
  frequencyLabel,
  matchesQuery as matchesEmergencyQuery,
  sortKeyHz
} from '$lib/components/funk/emergencyFilter.svelte';
import {
  EMPTY_APPLICATION_FILTER,
  applicationDetail,
  categoryCounts,
  filterApplications,
  matchesQuery,
  matchesRange,
  queryApplications,
  sortApplications,
  widthHz
} from '$lib/components/funk/applicationFilter.svelte';
import { EMERGENCY_FREQUENCIES } from '$lib/data/emergencyFrequencies';
import { ALL_APPLICATIONS } from '$lib/data/applications';

const emergency = (id: string) => {
  const found = EMERGENCY_FREQUENCIES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Eintrag ${id} fehlt im Datensatz`);
  return found;
};

describe('Notfrequenzen filtern', () => {
  it('zeigt ohne Filter alle Einträge', () => {
    expect(filterEmergency(EMPTY_EMERGENCY_FILTER)).toHaveLength(EMERGENCY_FREQUENCIES.length);
  });

  it('sortiert nach Frequenz aufsteigend', () => {
    const rows = filterEmergency(EMPTY_EMERGENCY_FILTER);
    const keys = rows.map(sortKeyHz);
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);
  });

  it('filtert nach Bereich', () => {
    const see = filterEmergency({ ...EMPTY_EMERGENCY_FILTER, domain: 'see' });
    expect(see.length).toBeGreaterThan(0);
    expect(see.every((entry) => entry.domain === 'see')).toBe(true);
  });

  it('filtert nach Zweck', () => {
    const historisch = filterEmergency({ ...EMPTY_EMERGENCY_FILTER, purpose: 'historisch' });
    expect(historisch.map((entry) => entry.id)).toContain('mf-500khz');
  });

  it('findet Kanal 16 über die Volltextsuche', () => {
    const treffer = filterEmergency({ ...EMPTY_EMERGENCY_FILTER, query: 'Kanal 16' });
    expect(treffer.map((entry) => entry.id)).toContain('vhf-ch16');
  });

  it('ignoriert Groß- und Kleinschreibung', () => {
    expect(matchesEmergencyQuery(emergency('vhf-ch70'), 'dsc')).toBe(true);
    expect(matchesEmergencyQuery(emergency('vhf-ch70'), 'völlig anderes')).toBe(false);
    expect(matchesEmergencyQuery(emergency('vhf-ch70'), '  ')).toBe(true);
  });

  it('kombiniert Bereich und Suchbegriff', () => {
    const treffer = filterEmergency({ domain: 'luft', purpose: 'alle', query: '121' });
    expect(treffer.map((entry) => entry.id)).toContain('air-121_5');
    expect(treffer.every((entry) => entry.domain === 'luft')).toBe(true);
  });

  it('beschriftet Einzelfrequenz, Kanalliste und Bereich unterschiedlich', () => {
    expect(frequencyLabel(emergency('vhf-ch16'))).toContain('156');
    expect(frequencyLabel(emergency('hf-dsc-set'))).toContain('·');
    expect(frequencyLabel(emergency('sarsat-406'))).toContain('MHz');
  });

  it('zählt die Bereiche vollständig', () => {
    const total = domainCounts().reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(EMERGENCY_FREQUENCIES.length);
    expect(DOMAIN_LABELS.see).toBe('Seefunk');
    expect(PURPOSE_LABELS.notruf).toBe('Notruf');
  });
});

describe('Funkdienst-Datenbank filtern', () => {
  it('zeigt ohne Filter alle Einträge', () => {
    expect(filterApplications(EMPTY_APPLICATION_FILTER)).toHaveLength(ALL_APPLICATIONS.length);
  });

  it('filtert nach Kategorie', () => {
    const radar = filterApplications({ ...EMPTY_APPLICATION_FILTER, category: 'radar' });
    expect(radar.length).toBeGreaterThan(0);
    expect(radar.every((app) => app.category === 'radar')).toBe(true);
  });

  it('trifft überlappende Frequenzfenster', () => {
    const app = ALL_APPLICATIONS.find((entry) => entry.id === 'wifi-2g');
    expect(app).toBeDefined();
    expect(matchesRange(app!, 2.4e9, 2.5e9)).toBe(true);
    expect(matchesRange(app!, 0, 0)).toBe(true);
    expect(matchesRange(app!, 5e9, 6e9)).toBe(false);
    expect(matchesRange(app!, 3e9, 1e9)).toBe(false);
  });

  it('begrenzt die Ergebnisse auf das Frequenzfenster', () => {
    const rows = filterApplications({
      ...EMPTY_APPLICATION_FILTER,
      minHz: 87.5e6,
      maxHz: 108e6
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((app) => app.maxHz >= 87.5e6 && app.minHz <= 108e6)).toBe(true);
  });

  it('durchsucht deutsche und englische Felder', () => {
    const app = ALL_APPLICATIONS.find((entry) => entry.category === 'broadcast');
    expect(app).toBeDefined();
    expect(matchesQuery(app!, app!.nameDE.slice(0, 5).toLowerCase())).toBe(true);
    expect(matchesQuery(app!, 'zzzzz')).toBe(false);
  });

  it('sortiert nach Frequenz, Name und Bandbreite', () => {
    const nachFrequenz = sortApplications(ALL_APPLICATIONS, 'frequenz');
    expect(nachFrequenz[0].minHz).toBeLessThanOrEqual(nachFrequenz[1].minHz);

    const absteigend = sortApplications(ALL_APPLICATIONS, 'frequenz', 'desc');
    expect(absteigend[0].minHz).toBeGreaterThanOrEqual(absteigend[1].minHz);

    const nachBreite = sortApplications(ALL_APPLICATIONS, 'breite');
    expect(widthHz(nachBreite[0])).toBeLessThanOrEqual(widthHz(nachBreite[1]));

    const nachName = sortApplications(ALL_APPLICATIONS, 'name');
    expect(nachName[0].nameDE.localeCompare(nachName[1].nameDE, 'de')).toBeLessThanOrEqual(0);
  });

  it('lässt die Ausgangsliste unverändert', () => {
    const kopie = [...ALL_APPLICATIONS];
    sortApplications(ALL_APPLICATIONS, 'name', 'desc');
    expect(ALL_APPLICATIONS).toEqual(kopie);
  });

  it('filtert und sortiert in einem Schritt', () => {
    const rows = queryApplications(
      { query: '', category: 'amateur', minHz: 0, maxHz: 0 },
      'frequenz'
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((app) => app.category === 'amateur')).toBe(true);
    expect(rows[0].minHz).toBeLessThanOrEqual(rows[rows.length - 1].minHz);
  });

  it('zählt alle Kategorien', () => {
    const total = categoryCounts().reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(ALL_APPLICATIONS.length);
  });
});

describe('applicationDetail', () => {
  it('ordnet WLAN 2,4 GHz dem ITU-Band UHF und dem IEEE-Band S zu', () => {
    const app = ALL_APPLICATIONS.find((entry) => entry.id === 'wifi-2g');
    expect(app).toBeDefined();
    const detail = applicationDetail(app!);
    expect(detail.ituBands).toContain('UHF');
    expect(detail.ieeeBands).toContain('S');
    // λ = c / f ≈ 12,3 cm in der Bandmitte
    expect(detail.wavelengthM).toBeCloseTo(0.1228, 3);
    expect(detail.categoryLabel.length).toBeGreaterThan(0);
  });
});
