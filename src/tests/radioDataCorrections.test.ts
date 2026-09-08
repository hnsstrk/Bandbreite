/**
 * Regressionstests für die in Bericht 04 (Abschnitt A) korrigierten Bestandsdaten.
 *
 * Jeder Test sichert einen konkreten Befund ab, damit die Korrektur nicht
 * versehentlich zurückgedreht wird. Die Nummern in Klammern verweisen auf die
 * Befundnummern des Berichts.
 */

import { describe, it, expect } from 'vitest';

import {
  CIVILIAN_BANDS,
  ITU_BANDS,
  NATO_BANDS,
  US_ALT_BANDS,
  formatFrequencyRange
} from '$lib/data/bands';
import { FREQUENCY_LIMITS } from '$lib/data/frequencyBands';
import { ALL_APPLICATIONS, getApplicationsForFrequency } from '$lib/data/applications';
import { HISTORICAL_EVENTS, CATEGORY_CONFIG, getEventsByCategory } from '$lib/data/history';
import { ALL_TRANSMITTERS, getTransmittersBySubtype } from '$lib/data/transmitters';

function band(id: string) {
  const found = CIVILIAN_BANDS.find((b) => b.id === id);
  expect(found, `Band ${id} fehlt`).toBeDefined();
  return found!;
}

function app(id: string) {
  const found = ALL_APPLICATIONS.find((a) => a.id === id);
  expect(found, `Anwendung ${id} fehlt`).toBeDefined();
  return found!;
}

function transmitter(id: string) {
  const found = ALL_TRANSMITTERS.find((t) => t.id === id);
  expect(found, `Sender ${id} fehlt`).toBeDefined();
  return found!;
}

// ============================================================================
// bands.ts
// ============================================================================

describe('bands.ts — korrigierte Bandgrenzen', () => {
  // Befund 1/2/16: DCF77 (77,5 kHz) und LORAN-C (100 kHz) liegen im LF-Band
  it('nennt DCF77 im LF-Band und nicht mehr im VLF-Band', () => {
    const vlf = ITU_BANDS.find((b) => b.id === 'itu-vlf')!;
    const lf = ITU_BANDS.find((b) => b.id === 'itu-lf')!;
    expect(vlf.applications.join(' ')).not.toContain('DCF77');
    expect(lf.applications.join(' ')).toContain('DCF77');
    // 77,5 kHz liegt tatsächlich im LF-Bereich 30-300 kHz
    expect(77.5e3).toBeGreaterThan(lf.minHz);
    expect(77.5e3).toBeLessThan(lf.maxHz);
  });

  it('nennt LORAN-C im LF-Band; 100 kHz liegt dort', () => {
    const lf = ITU_BANDS.find((b) => b.id === 'itu-lf')!;
    const vlf = ITU_BANDS.find((b) => b.id === 'itu-vlf')!;
    expect(lf.applications.join(' ')).toContain('LORAN-C');
    expect(vlf.applications.join(' ')).not.toContain('LORAN');
    expect(100e3).toBeGreaterThan(lf.minHz);
  });

  // Befund 3: Mittelwelle Region 1 = 526,5-1606,5 kHz (nicht die US-Grenzen)
  it('verwendet für den AM-Rundfunk die Region-1-Grenzen', () => {
    const am = band('am-radio');
    expect(am.minHz).toBe(526.5e3);
    expect(am.maxHz).toBe(1606.5e3);
    // Die US-Grenzen stehen jetzt in einem eigenen Eintrag
    const us = band('am-radio-us');
    expect(us.minHz).toBe(535e3);
    expect(us.maxHz).toBe(1705e3);
  });

  // Befund 4: DAB+ nutzt in DE/Europa nur 174-230 MHz
  it('begrenzt DAB+ auf 174-230 MHz', () => {
    expect(band('dab').maxHz).toBe(230e6);
  });

  // Befund 5: nach der 700-MHz-Umwidmung endet DVB-T2 bei 694 MHz
  it('begrenzt DVB-T/T2 auf 470-694 MHz', () => {
    const dvb = band('dvb-t');
    expect(dvb.minHz).toBe(470e6);
    expect(dvb.maxHz).toBe(694e6);
  });

  // Befund 6/7: reale 3GPP-Bänder statt erfundener 700/800-MHz-Blöcke
  it('bildet Band 28 (703-803 MHz) und Band 20 (791-862 MHz) ab', () => {
    const b28 = band('lte-700');
    expect(b28.minHz).toBe(703e6);
    expect(b28.maxHz).toBe(803e6);
    const b20 = band('lte-800');
    expect(b20.minHz).toBe(791e6);
    expect(b20.maxHz).toBe(862e6);
    // Band 20 überschneidet den GSM-900-Uplink (ab 880 MHz) nicht mehr
    expect(b20.maxHz).toBeLessThanOrEqual(band('gsm-900').minHz);
  });

  // Befund 8: in der EU ist nur das 6-GHz-Low-Band freigegeben
  it('begrenzt WLAN 6 GHz auf die EU-Allokation 5945-6425 MHz', () => {
    const wifi6e = band('wifi-6e');
    expect(wifi6e.minHz).toBe(5.945e9);
    expect(wifi6e.maxHz).toBe(6.425e9);
  });

  // Befund 12: ICAO Annex 10 nennt 108,000-117,975 MHz
  it('setzt die VOR-Obergrenze auf 117,975 MHz', () => {
    expect(band('vor').maxHz).toBe(117.975e6);
  });

  // Befund 13: geschützte Zuteilung 74,8-75,2 MHz
  it('setzt den Marker-Beacon-Bereich auf 74,8-75,2 MHz', () => {
    const marker = band('marker-beacon');
    expect(marker.minHz).toBe(74.8e6);
    expect(marker.maxHz).toBe(75.2e6);
    expect(75e6).toBeGreaterThan(marker.minHz);
    expect(75e6).toBeLessThan(marker.maxHz);
  });

  // Befund 35: Funkortungszuteilung 5250-5725 MHz, konsistent mit applications.json
  it('vereinheitlicht das C-Band-Wetterradar auf 5250-5725 MHz', () => {
    const weather = band('weather-c');
    expect(weather.minHz).toBe(5.25e9);
    expect(weather.maxHz).toBe(5.725e9);
    expect(weather.minHz).toBe(app('radar-weather').minHz);
    expect(weather.maxHz).toBe(app('radar-weather').maxHz);
  });

  // Befund 10: die alte US-Reihe ist keine Mischung aus US- und IEEE-Grenzen mehr
  it('bildet die alte US-Radarreihe mit ihren historischen Grenzen ab', () => {
    const us = (id: string) => US_ALT_BANDS.find((b) => b.id === id)!;
    expect(us('us-p').minHz).toBe(225e6);
    expect(us('us-l').minHz).toBe(390e6);
    expect(us('us-s').maxHz).toBe(3.9e9);
    expect(us('us-c').minHz).toBe(3.9e9);
    expect(us('us-c').maxHz).toBe(6.2e9);
    expect(us('us-x').maxHz).toBe(10.9e9);
    expect(us('us-k').maxHz).toBe(36e9);
    // lückenlose und überschneidungsfreie Reihe
    const sorted = [...US_ALT_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBe(sorted[i + 1].minHz);
    }
  });

  // Befund 9: NATO N und O sind keine offiziellen NATO-Bezeichnungen
  it('behält die NATO-Bänder A bis M als offizielles Schema bei', () => {
    const namen = NATO_BANDS.map((b) => b.name);
    for (const n of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']) {
      expect(namen).toContain(n);
    }
    // Das harmonisierte Schema endet bei M = 60-100 GHz
    expect(NATO_BANDS.find((b) => b.name === 'M')!.maxHz).toBe(100e9);
  });
});

describe('formatFrequencyRange — Gleitkomma und Infinity (Befund 15)', () => {
  it('rundet Gleitkomma-Artefakte bei gleicher Einheit weg', () => {
    // 3.3e9 / 1e9 ergibt in IEEE 754 sonst 3.3000000000000003
    expect(formatFrequencyRange(3.3e9, 3.8e9)).toBe('3,3–3,8 GHz');
  });

  it('behält signifikante Nachkommastellen bei gleicher Einheit', () => {
    expect(formatFrequencyRange(526.5e3, 999e3)).toBe('526,5–999 kHz');
    expect(formatFrequencyRange(74.8e6, 75.2e6)).toBe('74,8–75,2 MHz');
  });

  it('fängt Infinity ab', () => {
    expect(formatFrequencyRange(30e18, Infinity)).toBe('ab 30.000.000 THz');
    expect(formatFrequencyRange(Infinity, Infinity)).toBe('unbegrenzt');
  });
});

// ============================================================================
// frequencyBands.ts
// ============================================================================

describe('frequencyBands.ts — korrigierte Grenzwerte', () => {
  // Befund 17: das 11-m-Rundfunkband beginnt bei 25 670 kHz
  it('setzt BROADCAST_11M_MIN auf 25,67 MHz', () => {
    expect(FREQUENCY_LIMITS.BROADCAST_11M_MIN).toBe(25.67e6);
  });

  // Befund 18: 4995-5005 kHz ist Normalfrequenzbereich, kein Rundfunk
  it('kennt die Lücke im 60-m-Tropenband', () => {
    expect(FREQUENCY_LIMITS.BROADCAST_60M_GAP_MIN).toBe(4.995e6);
    expect(FREQUENCY_LIMITS.BROADCAST_60M_GAP_MAX).toBe(5.005e6);
    expect(FREQUENCY_LIMITS.BROADCAST_60M_GAP_MIN).toBeGreaterThan(
      FREQUENCY_LIMITS.BROADCAST_60M_MIN
    );
    expect(FREQUENCY_LIMITS.BROADCAST_60M_GAP_MAX).toBeLessThan(FREQUENCY_LIMITS.BROADCAST_60M_MAX);
  });

  // Befund 21: in Region 1 endet das 6-m-Band bei 52 MHz
  it('setzt AMATEUR_6M_MAX auf 52 MHz (Region 1)', () => {
    expect(FREQUENCY_LIMITS.AMATEUR_6M_MAX).toBe(52e6);
  });
});

// ============================================================================
// applications.json / applications.ts
// ============================================================================

describe('applications — korrigierte Einträge', () => {
  it('hat durchgängig eindeutige IDs und minHz <= maxHz', () => {
    const ids = ALL_APPLICATIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ALL_APPLICATIONS) {
      expect(a.minHz).toBeGreaterThan(0);
      expect(a.minHz).toBeLessThanOrEqual(a.maxHz);
    }
  });

  // Befund 24: ein Bereich der Breite 0 wurde praktisch nie getroffen
  it('gibt ADS-B einen nutzbaren Bereich um 1090 MHz', () => {
    const adsb = app('nav-ads-b');
    expect(adsb.maxHz).toBeGreaterThan(adsb.minHz);
    expect(getApplicationsForFrequency(1090e6).map((a) => a.id)).toContain('nav-ads-b');
    // Die Abfragefrequenz 1030 MHz ist ein eigener Eintrag
    expect(getApplicationsForFrequency(1030e6).map((a) => a.id)).toContain('nav-ssr-interrogation');
  });

  // Befund 25: der alte ELT-Eintrag markierte 284 MHz Spektrum als "ELT"
  it('teilt ELT in drei diskrete Einträge auf', () => {
    expect(ALL_APPLICATIONS.find((a) => a.id === 'elt')).toBeUndefined();
    for (const id of ['elt-121', 'elt-243', 'elt-406']) {
      const e = app(id);
      // Kein Eintrag spannt mehr als 1 MHz auf
      expect(e.maxHz - e.minHz).toBeLessThanOrEqual(1e6);
    }
    expect(getApplicationsForFrequency(121.5e6).map((a) => a.id)).toContain('elt-121');
    // 200 MHz wird nicht mehr fälschlich als ELT gemeldet
    expect(getApplicationsForFrequency(200e6).map((a) => a.id)).not.toContain('elt-121');
  });

  // Befund 26/21: 50-54 MHz gilt nur in Region 2/3
  it('begrenzt ham-6m auf 50-52 MHz', () => {
    const ham6 = app('ham-6m');
    expect(ham6.minHz).toBe(50e6);
    expect(ham6.maxHz).toBe(52e6);
  });

  // Befund 27: WARC- und LF/MF-Bänder fehlten komplett
  it('ergänzt die fehlenden Amateurbänder', () => {
    for (const id of ['ham-2200m', 'ham-630m', 'ham-60m', 'ham-30m', 'ham-17m', 'ham-12m']) {
      expect(app(id).minHz).toBeGreaterThan(0);
    }
    expect(app('ham-30m').minHz).toBe(10100000);
    expect(app('ham-17m').minHz).toBe(18068000);
    expect(app('ham-12m').maxHz).toBe(24990000);
  });

  // Befund 29: nur der UWB-Bereich lief 2022 aus, nicht das Schmalbandsegment
  it('setzt das 24-GHz-Kfz-Radar auf 24,05-24,25 GHz', () => {
    expect(app('radar-automotive-24').minHz).toBe(24.05e9);
  });

  // Befund 33: die Tropenbänder gehören zum Kurzwellenrundfunk
  it('lässt den Kurzwellenrundfunk bei 2,3 MHz beginnen', () => {
    expect(app('sw-broadcast').minHz).toBe(2.3e6);
  });

  // Befund 34: 1559-1610 MHz ist die gesamte RNSS-Zuweisung
  it('benennt den RNSS-Bereich nicht mehr allein als GPS L1', () => {
    const rnss = app('gps-l1');
    expect(rnss.nameDE).toContain('RNSS');
    expect(rnss.minHz).toBe(1559000000);
    expect(rnss.maxHz).toBe(1610000000);
  });

  // Befund 42: echte Umlaute statt ae/oe/ue/ss
  it('verwendet in deutschen Feldern echte Umlaute', () => {
    const verboten = /(Kanaele|Bloecke|Fruechwarnradar|Sonnenaktivitaet|Staedten|grosse)/;
    for (const a of ALL_APPLICATIONS) {
      expect(a.nameDE).not.toMatch(verboten);
      expect(a.descriptionDE).not.toMatch(verboten);
      expect(a.notes ?? '').not.toMatch(verboten);
    }
  });
});

// ============================================================================
// history.ts
// ============================================================================

describe('history.ts — Korrekturen und Ergänzungen', () => {
  it('hat eindeutige IDs und plausible Jahreszahlen', () => {
    const ids = HISTORICAL_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of HISTORICAL_EVENTS) {
      expect(e.year).toBeGreaterThan(1800);
      expect(e.year).toBeLessThanOrEqual(2030);
      if (e.yearEnd !== undefined) expect(e.yearEnd).toBeGreaterThanOrEqual(e.year);
      if (e.frequencyHzMax !== undefined && e.frequencyHz !== undefined) {
        expect(e.frequencyHzMax).toBeGreaterThan(e.frequencyHz);
      }
      expect(e.titleDE).toBeTruthy();
      expect(e.descriptionDE).toBeTruthy();
      expect(CATEGORY_CONFIG[e.category]).toBeTruthy();
    }
  });

  // Befund 36: 1998 wurde die SIG gegründet, die Spezifikation kam 1999
  it('datiert die Bluetooth-Spezifikation auf 1999', () => {
    const bt = HISTORICAL_EVENTS.find((e) => e.id === 'bluetooth')!;
    expect(bt.year).toBe(1999);
    expect(bt.descriptionDE).toContain('1998');
  });

  // Befund 37: Versuche ab 1886, Publikationen 1887/1888
  it('gibt für die Hertzschen Versuche 1886 bis 1888 an', () => {
    const hertz = HISTORICAL_EVENTS.find((e) => e.id === 'hertz-experiments')!;
    expect(hertz.year).toBe(1886);
    expect(hertz.yearEnd).toBe(1888);
  });

  // Befund 38: Marconis erste Übertragung 1895 fehlte
  it('ergänzt Marconis erste Funkübertragung von 1895', () => {
    const e = HISTORICAL_EVENTS.find((x) => x.id === 'marconi-first-transmission')!;
    expect(e.year).toBe(1895);
  });

  // Befund 39: 712 Gerettete, Folge war SOLAS 1914
  it('präzisiert den Titanic-Eintrag', () => {
    const t = HISTORICAL_EVENTS.find((e) => e.id === 'titanic')!;
    expect(t.descriptionDE).toContain('712');
    expect(t.descriptionDE).toContain('SOLAS');
  });

  // Befund 41: fehlende Fernmelde-Meilensteine
  it('enthält die ergänzten Meilensteine', () => {
    const ids = HISTORICAL_EVENTS.map((e) => e.id);
    for (const id of [
      'electric-telegraph',
      'telephone-bell',
      'sos-berlin-conference',
      'first-broadcast-germany',
      'radar-watson-watt',
      'transistor',
      'ukw-germany',
      'arpanet',
      'gsm-germany',
      'umts-germany',
      'lte-germany',
      'umts-shutdown-germany'
    ]) {
      expect(ids, `Meilenstein ${id} fehlt`).toContain(id);
    }
    expect(HISTORICAL_EVENTS.length).toBeGreaterThanOrEqual(48);
  });

  it('kennt die neuen Kategorien telegraphy und navigation', () => {
    expect(CATEGORY_CONFIG.telegraphy).toBeTruthy();
    expect(CATEGORY_CONFIG.navigation).toBeTruthy();
    expect(getEventsByCategory('telegraphy').length).toBeGreaterThan(0);
    expect(getEventsByCategory('navigation').length).toBeGreaterThan(0);
  });

  // Befund 42: echte Umlaute
  it('verwendet in deutschen Feldern echte Umlaute', () => {
    const verboten = /(veroeffentlicht|regelmaessig|roehre|kuenstlich|erklaert|Sonnenaktivitaet)/i;
    for (const e of HISTORICAL_EVENTS) {
      expect(e.titleDE).not.toMatch(verboten);
      expect(e.descriptionDE).not.toMatch(verboten);
    }
  });
});

// ============================================================================
// transmitters.json / transmitters.ts
// ============================================================================

describe('transmitters — Korrekturen und Ergänzungen', () => {
  it('hat eindeutige IDs, positive Frequenzen und gültige Koordinaten', () => {
    const ids = ALL_TRANSMITTERS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of ALL_TRANSMITTERS) {
      expect(t.frequencyHz).toBeGreaterThan(0);
      if (t.powerWatts !== undefined) expect(t.powerWatts).toBeGreaterThan(0);
      if (t.location.latitude !== undefined) {
        expect(Math.abs(t.location.latitude)).toBeLessThanOrEqual(90);
      }
      if (t.location.longitude !== undefined) {
        expect(Math.abs(t.location.longitude)).toBeLessThanOrEqual(180);
      }
      expect(['active', 'inactive', 'unknown']).toContain(t.status);
      expect(t.nameDE).toBeTruthy();
      expect(t.descriptionDE).toBeTruthy();
    }
  });

  // Befund 43: DCF77 ist der Referenzdatensatz
  it('führt DCF77 mit 77 500 Hz in Mainflingen', () => {
    const dcf = transmitter('dcf77');
    expect(dcf.frequencyHz).toBe(77500);
    expect(dcf.location.name).toBe('Mainflingen');
  });

  // Befund 45: powerWatts war semantisch mehrdeutig
  it('gibt bei jeder Leistungsangabe die Leistungsart an', () => {
    for (const t of ALL_TRANSMITTERS) {
      if (t.powerWatts !== undefined) {
        expect(['tx', 'erp', 'eirp'], `powerType fehlt bei ${t.id}`).toContain(t.powerType);
      }
    }
  });

  // Befund 47: Europe 1 wurde am 31.12.2019 abgeschaltet
  it('markiert Europe 1 (183 kHz) als abgeschaltet', () => {
    const e1 = transmitter('europe1-183');
    expect(e1.status).toBe('inactive');
    expect(e1.notes).toContain('2019');
  });

  // Befund 48: BBC Radio 4 LW wurde 2024/2025 weitgehend eingestellt
  it('markiert BBC Radio 4 LW nicht mehr als aktiv', () => {
    expect(transmitter('bbc-radio4-198').status).not.toBe('active');
  });

  // Befund 49: Junglinster ab 1933, Beidweiler ab 1972
  it('trennt beim RTL-Langwellensender die Standorthistorie', () => {
    const rtl = transmitter('rtl-234');
    expect(rtl.notes).toContain('Junglinster');
    expect(rtl.notes).toContain('1972');
  });

  // Befund 53: Relaisdaten brauchen einen Datumsstempel
  it('versieht die Amateurfunk-Relais mit lastVerified', () => {
    for (const id of ['db0fs', 'db0wa', 'db0zu']) {
      expect(transmitter(id).lastVerified).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  // Befund 54 / Abschnitt B.9: neue Anlagen mit Feinkategorie
  it('ergänzt Längstwellen-, GNSS-, Radar- und Forschungsanlagen', () => {
    expect(getTransmittersBySubtype('military_vlf').map((t) => t.id)).toContain('dho38');
    expect(getTransmittersBySubtype('gnss').map((t) => t.id)).toContain('gps-l1ca');
    expect(getTransmittersBySubtype('radar').map((t) => t.id)).toContain('dwd-radar-c');
    expect(getTransmittersBySubtype('research').map((t) => t.id)).toContain('effelsberg');
    expect(getTransmittersBySubtype('deep_space').map((t) => t.id)).toContain('dsn-x-downlink');
  });

  it('führt GPS L1 C/A mit 1575,42 MHz (154 · 10,23 MHz)', () => {
    const gps = transmitter('gps-l1ca');
    expect(gps.frequencyHz).toBe(1_575_420_000);
    expect(gps.frequencyHz).toBe(154 * 10.23e6);
  });

  it('führt DHO38 mit 23,4 kHz und die Wasserstofflinie mit 1420,4 MHz', () => {
    expect(transmitter('dho38').frequencyHz).toBe(23_400);
    expect(transmitter('effelsberg').frequencyHz).toBe(1_420_400_000);
  });
});
