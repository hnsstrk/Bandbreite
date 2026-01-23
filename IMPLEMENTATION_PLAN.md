# Implementierungsplan - Bandbreite App

Basierend auf den Anforderungen vom 23.01.2026.

---

## Uebersicht der Aenderungen

| Nr. | Anforderung | Status |
|-----|-------------|--------|
| 1 | Gesamtes EM-Spektrum (3 Hz - Gamma) in Kernkomponente | Offen |
| 2 | FrequencyBandOverview + SpectrumBar zusammenfuehren | Offen |
| 3 | ITU + IEEE + NATO Baender vollstaendig (aus PDF) | Offen |
| 4 | FrequencyConverter kompakter, Layout optimieren | Offen |
| 5 | CLAUDE.md Formeln als "zu ueberpruefen" markieren | Offen |

---

## Phase 1: Datengrundlage erweitern

### Schritt 1.1: ITU-Baender hinzufuegen

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/data/bands.ts`

**Aenderungen:**
- Neue Kategorie `'itu'` zum `FrequencyBand` Interface hinzufuegen
- Vollstaendige ITU-Baender aus dem PDF implementieren:

```typescript
export const ITU_BANDS: FrequencyBand[] = [
  { id: 'itu-elf', name: 'ELF', nameDE: 'Niederfrequenz (ELF)', minHz: 3, maxHz: 30, color: '#...', category: 'itu' },
  { id: 'itu-slf', name: 'SLF', nameDE: 'Niederfrequenz (SLF)', minHz: 30, maxHz: 300, color: '#...', category: 'itu' },
  { id: 'itu-ulf', name: 'ULF', nameDE: 'Niederfrequenz (ULF)', minHz: 300, maxHz: 3e3, color: '#...', category: 'itu' },
  { id: 'itu-vlf', name: 'VLF', nameDE: 'Laengstwellen', minHz: 3e3, maxHz: 30e3, color: '#...', category: 'itu' },
  { id: 'itu-lf', name: 'LF', nameDE: 'Langwellen', minHz: 30e3, maxHz: 300e3, color: '#...', category: 'itu' },
  { id: 'itu-mf', name: 'MF', nameDE: 'Mittelwellen', minHz: 300e3, maxHz: 3e6, color: '#...', category: 'itu' },
  { id: 'itu-hf', name: 'HF', nameDE: 'Kurzwellen', minHz: 3e6, maxHz: 30e6, color: '#...', category: 'itu' },
  { id: 'itu-vhf', name: 'VHF', nameDE: 'Ultrakurzwellen', minHz: 30e6, maxHz: 300e6, color: '#...', category: 'itu' },
  { id: 'itu-uhf', name: 'UHF', nameDE: 'Dezimeterwellen', minHz: 300e6, maxHz: 3e9, color: '#...', category: 'itu' },
  { id: 'itu-shf', name: 'SHF', nameDE: 'Zentimeterwellen', minHz: 3e9, maxHz: 30e9, color: '#...', category: 'itu' },
  { id: 'itu-ehf', name: 'EHF', nameDE: 'Millimeterwellen', minHz: 30e9, maxHz: 300e9, color: '#...', category: 'itu' },
  { id: 'itu-thf', name: 'THF', nameDE: 'Submillimeterwellen', minHz: 300e9, maxHz: 3e12, color: '#...', category: 'itu' },
];
```

### Schritt 1.2: Erweitertes EM-Spektrum definieren

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/data/bands.ts`

**Neue Datenstruktur fuer gesamtes EM-Spektrum:**

```typescript
export interface EMSpectrumBand {
  id: string;
  name: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  color: string;
  type: 'radio' | 'microwave' | 'infrared' | 'visible' | 'uv' | 'xray' | 'gamma';
}

export const EM_SPECTRUM_FULL: EMSpectrumBand[] = [
  // Radio (3 Hz - 3 GHz)
  { id: 'em-elf', name: 'ELF', nameDE: 'Extrem niedrige Frequenz', minHz: 3, maxHz: 30, color: '#1e3a5f', type: 'radio' },
  { id: 'em-slf', name: 'SLF', nameDE: 'Super niedrige Frequenz', minHz: 30, maxHz: 300, color: '#1e4a6f', type: 'radio' },
  { id: 'em-ulf', name: 'ULF', nameDE: 'Ultra niedrige Frequenz', minHz: 300, maxHz: 3e3, color: '#1e5a7f', type: 'radio' },
  { id: 'em-vlf', name: 'VLF', nameDE: 'Sehr niedrige Frequenz', minHz: 3e3, maxHz: 30e3, color: '#2563eb', type: 'radio' },
  { id: 'em-lf', name: 'LF', nameDE: 'Niedrige Frequenz', minHz: 30e3, maxHz: 300e3, color: '#3b82f6', type: 'radio' },
  { id: 'em-mf', name: 'MF', nameDE: 'Mittlere Frequenz', minHz: 300e3, maxHz: 3e6, color: '#60a5fa', type: 'radio' },
  { id: 'em-hf', name: 'HF', nameDE: 'Hohe Frequenz', minHz: 3e6, maxHz: 30e6, color: '#06b6d4', type: 'radio' },
  { id: 'em-vhf', name: 'VHF', nameDE: 'Sehr hohe Frequenz', minHz: 30e6, maxHz: 300e6, color: '#22c55e', type: 'radio' },
  { id: 'em-uhf', name: 'UHF', nameDE: 'Ultra hohe Frequenz', minHz: 300e6, maxHz: 3e9, color: '#84cc16', type: 'radio' },

  // Microwave (3 GHz - 300 GHz)
  { id: 'em-shf', name: 'SHF', nameDE: 'Super hohe Frequenz', minHz: 3e9, maxHz: 30e9, color: '#eab308', type: 'microwave' },
  { id: 'em-ehf', name: 'EHF', nameDE: 'Extrem hohe Frequenz', minHz: 30e9, maxHz: 300e9, color: '#f59e0b', type: 'microwave' },

  // Infrared (300 GHz - 400 THz)
  { id: 'em-fir', name: 'FIR', nameDE: 'Fernes Infrarot', minHz: 300e9, maxHz: 20e12, color: '#dc2626', type: 'infrared' },
  { id: 'em-mir', name: 'MIR', nameDE: 'Mittleres Infrarot', minHz: 20e12, maxHz: 100e12, color: '#b91c1c', type: 'infrared' },
  { id: 'em-nir', name: 'NIR', nameDE: 'Nahes Infrarot', minHz: 100e12, maxHz: 385e12, color: '#7f1d1d', type: 'infrared' },

  // Visible Light (385 THz - 750 THz, 780nm - 400nm)
  { id: 'em-red', name: 'Rot', nameDE: 'Rot', minHz: 385e12, maxHz: 484e12, color: '#ef4444', type: 'visible' },
  { id: 'em-orange', name: 'Orange', nameDE: 'Orange', minHz: 484e12, maxHz: 508e12, color: '#f97316', type: 'visible' },
  { id: 'em-yellow', name: 'Gelb', nameDE: 'Gelb', minHz: 508e12, maxHz: 526e12, color: '#eab308', type: 'visible' },
  { id: 'em-green', name: 'Gruen', nameDE: 'Gruen', minHz: 526e12, maxHz: 606e12, color: '#22c55e', type: 'visible' },
  { id: 'em-cyan', name: 'Cyan', nameDE: 'Cyan', minHz: 606e12, maxHz: 668e12, color: '#06b6d4', type: 'visible' },
  { id: 'em-blue', name: 'Blau', nameDE: 'Blau', minHz: 668e12, maxHz: 714e12, color: '#3b82f6', type: 'visible' },
  { id: 'em-violet', name: 'Violett', nameDE: 'Violett', minHz: 714e12, maxHz: 750e12, color: '#8b5cf6', type: 'visible' },

  // UV (750 THz - 30 PHz)
  { id: 'em-uva', name: 'UV-A', nameDE: 'UV-A', minHz: 750e12, maxHz: 952e12, color: '#a855f7', type: 'uv' },
  { id: 'em-uvb', name: 'UV-B', nameDE: 'UV-B', minHz: 952e12, maxHz: 1.07e15, color: '#9333ea', type: 'uv' },
  { id: 'em-uvc', name: 'UV-C', nameDE: 'UV-C', minHz: 1.07e15, maxHz: 30e15, color: '#7c3aed', type: 'uv' },

  // X-Ray (30 PHz - 30 EHz)
  { id: 'em-xray-soft', name: 'Soft X-Ray', nameDE: 'Weiche Roentgenstrahlung', minHz: 30e15, maxHz: 3e18, color: '#ec4899', type: 'xray' },
  { id: 'em-xray-hard', name: 'Hard X-Ray', nameDE: 'Harte Roentgenstrahlung', minHz: 3e18, maxHz: 30e18, color: '#db2777', type: 'xray' },

  // Gamma (> 30 EHz)
  { id: 'em-gamma', name: 'Gamma', nameDE: 'Gammastrahlung', minHz: 30e18, maxHz: 3e21, color: '#be185d', type: 'gamma' },
];
```

### Schritt 1.3: NATO-Baender erweitern (N und O hinzufuegen)

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/data/bands.ts`

Entsprechend PDF (Seite 7):
```typescript
{ id: 'nato-n', name: 'N', nameDE: 'NATO N', minHz: 100e9, maxHz: 200e9, color: '#f472b6', category: 'nato' },
{ id: 'nato-o', name: 'O', nameDE: 'NATO O', minHz: 200e9, maxHz: 300e9, color: '#f9a8d4', category: 'nato' },
```

---

## Phase 2: Komponenten zusammenfuehren

### Schritt 2.1: Neue vereinheitlichte Spektrum-Komponente erstellen

**Neue Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/UnifiedSpectrum.svelte`

**Konzept:**
- Kombiniert `FrequencyBandOverview.svelte` und `SpectrumBar.svelte`
- Zeigt gesamtes EM-Spektrum von 3 Hz bis Gamma
- Logarithmische Skala mit Zoom/Pan-Funktion
- Toggle zwischen verschiedenen Band-Nomenklaturen (ITU, IEEE, NATO)
- Marker fuer aktuelle Frequenz
- Responsive Design

**Struktur:**
```
+------------------------------------------------------------------+
|  [ITU] [IEEE] [NATO] [Zivil]        Zoom: [-] [=] [+]  Reset     |
+------------------------------------------------------------------+
|                                                                    |
|  EM-SPEKTRUM (Gesamtuebersicht)                                   |
|  |ELF|SLF|ULF|VLF|LF|MF|HF|VHF|UHF|SHF|EHF|IR|VIS|UV|X|Gamma|    |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  BAND-DETAIL (gewaehlte Nomenklatur)                              |
|  |A |B |C |D |E |F |G |H |I |    J    |  K  | L | M |N|O|        |
|                                                                    |
+------------------------------------------------------------------+
|  Frequenz: 3 Hz ─────────────────────────────────────────── 3 ZHz |
|  Wellenlaenge: 100 Mm ─────────────────────────────────── 0.1 pm  |
+------------------------------------------------------------------+
```

**Features:**
- Obere Leiste: EM-Spektrum Gesamtuebersicht (immer sichtbar)
- Untere Leiste: Detailansicht mit waehlbarer Nomenklatur
- Frequenzmarker synchronisiert mit FrequencyConverter
- Tooltip bei Hover zeigt Banddetails
- Klick auf Band zeigt erweiterte Informationen

### Schritt 2.2: Alte Komponenten als deprecated markieren

**Dateien:**
- `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/FrequencyBandOverview.svelte`
- `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/SpectrumBar.svelte`

**Aenderung:** Kommentar am Anfang hinzufuegen:
```typescript
/**
 * @deprecated Diese Komponente wird durch UnifiedSpectrum.svelte ersetzt.
 * Bitte UnifiedSpectrum.svelte fuer neue Implementierungen verwenden.
 */
```

---

## Phase 3: FrequencyConverter optimieren

### Schritt 3.1: Kompakteres Layout

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/converters/FrequencyConverter.svelte`

**Aenderungen:**
1. Horizontale Anordnung der Inputs (Frequenz und Wellenlaenge nebeneinander)
2. Kleinere Padding-Werte
3. Formel-Anzeige optional/kollapierbar
4. Quick-Buttons fuer haeufige Frequenzen (z.B. 2.4 GHz, 5 GHz, 28 GHz)
5. Responsive: Auf kleinen Bildschirmen vertikal stapeln

**Neues Layout (Desktop):**
```
+------------------------------------------------------------------+
| Frequenz ↔ Wellenlaenge                                           |
+------------------------------------------------------------------+
| [Frequenz-Input] [Einheit ▼] ⟷ [Wellenlaenge-Input] [Einheit ▼]  |
+------------------------------------------------------------------+
| Quick: [2.4 GHz] [5 GHz] [28 GHz] [77 GHz]                       |
+------------------------------------------------------------------+
| ▼ Formel anzeigen                                                 |
+------------------------------------------------------------------+
```

### Schritt 3.2: RangeCalculator in separaten Tab/Bereich verschieben

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/converters/FrequencyConverter.svelte`

**Aenderung:**
- RangeCalculator nicht mehr direkt unterhalb einbetten
- Stattdessen als separater Bereich auf der Seite

---

## Phase 4: Seitenintegration

### Schritt 4.1: Hauptseite aktualisieren

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/routes/+page.svelte`

**Neues Layout:**
```
+------------------------------------------------------------------+
|                        HEADER / NAVIGATION                        |
+------------------------------------------------------------------+
|                                                                    |
|  [FrequencyConverter - kompakt]                                    |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  [UnifiedSpectrum - Vollbreite]                                   |
|  - EM-Spektrum Gesamtuebersicht                                   |
|  - Band-Detail mit ITU/IEEE/NATO Toggle                           |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  [BandInfo] | [RangeCalculator]                                   |
|  (2-spaltig auf Desktop)                                          |
|                                                                    |
+------------------------------------------------------------------+
```

### Schritt 4.2: Konverter-Seite aktualisieren

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/src/routes/konverter/+page.svelte`

**Aenderungen:**
- Neue UnifiedSpectrum Komponente einbinden
- Alte Komponenten ersetzen

---

## Phase 5: Dokumentation aktualisieren

### Schritt 5.1: CLAUDE.md Formeln markieren

**Datei:** `/Users/hnsstrk/Repositories/bandbreite/CLAUDE.md`

**Aenderung:** Formeln als "zu ueberpruefen" markieren:

```markdown
## Domain Knowledge

This is an RF engineering application. Key formulas to implement:

> **HINWEIS:** Die folgenden Formeln muessen vor Produktiveinsatz geprueft werden.

- **Wavelength**: λ = c / f (c ≈ 299,792,458 m/s) [ZU UEBERPRUEFEN]
- **FSPL**: FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c) [ZU UEBERPRUEFEN]
- **Radar equation**: Pr = (Pt · G² · λ² · σ) / ((4π)³ · R⁴) [ZU UEBERPRUEFEN]
- **Shannon-Hartley**: C = B · log₂(1 + SNR), where SNR_linear = 10^(SNR_dB / 10) [ZU UEBERPRUEFEN]
- **Nyquist bandwidth**: Rs = 2 · B (max symbol rate without ISI) [ZU UEBERPRUEFEN]
- **Spectral efficiency**: η = R / B (bit/s/Hz) [ZU UEBERPRUEFEN]
```

---

## Implementierungsreihenfolge

| Schritt | Beschreibung | Abhaengigkeiten | Geschaetzte Dauer |
|---------|--------------|-----------------|-------------------|
| 1.1 | ITU-Baender hinzufuegen | - | 30 min |
| 1.2 | EM-Spektrum Datenstruktur | - | 45 min |
| 1.3 | NATO N+O hinzufuegen | - | 15 min |
| 2.1 | UnifiedSpectrum Komponente | 1.1, 1.2, 1.3 | 3-4 h |
| 2.2 | Alte Komponenten deprecated | 2.1 | 10 min |
| 3.1 | FrequencyConverter optimieren | - | 1-2 h |
| 3.2 | RangeCalculator separieren | 3.1 | 30 min |
| 4.1 | Hauptseite aktualisieren | 2.1, 3.1 | 1 h |
| 4.2 | Konverter-Seite aktualisieren | 2.1, 3.1 | 30 min |
| 5.1 | CLAUDE.md aktualisieren | - | 10 min |

**Gesamtgeschaetzte Dauer:** 7-9 Stunden

---

## Dateien die geaendert werden

### Neue Dateien
- `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/UnifiedSpectrum.svelte`

### Zu aendernde Dateien
1. `/Users/hnsstrk/Repositories/bandbreite/src/lib/data/bands.ts` - ITU-Baender, EM-Spektrum, NATO N+O
2. `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/FrequencyBandOverview.svelte` - Deprecated Markierung
3. `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/charts/SpectrumBar.svelte` - Deprecated Markierung
4. `/Users/hnsstrk/Repositories/bandbreite/src/lib/components/converters/FrequencyConverter.svelte` - Kompakteres Layout
5. `/Users/hnsstrk/Repositories/bandbreite/src/routes/+page.svelte` - Neues Layout
6. `/Users/hnsstrk/Repositories/bandbreite/src/routes/konverter/+page.svelte` - Komponenten aktualisieren
7. `/Users/hnsstrk/Repositories/bandbreite/CLAUDE.md` - Formeln als zu ueberpruefen markieren

---

## Frequenzband-Referenz (aus PDF)

### ITU Radiobaender (vollstaendig)

| Abk. | Bezeichnung | Frequenzbereich | Wellenlaenge |
|------|-------------|-----------------|--------------|
| ELF | Extremely Low Frequency | 3-30 Hz | 100-10 Mm |
| SLF | Super Low Frequency | 30-300 Hz | 10-1 Mm |
| ULF | Ultra Low Frequency | 0.3-3 kHz | 1000-100 km |
| VLF | Very Low Frequency | 3-30 kHz | 100-10 km |
| LF | Low Frequency | 30-300 kHz | 10-1 km |
| MF | Medium Frequency | 0.3-3 MHz | 1000-100 m |
| HF | High Frequency | 3-30 MHz | 100-10 m |
| VHF | Very High Frequency | 30-300 MHz | 10-1 m |
| UHF | Ultra High Frequency | 0.3-3 GHz | 10-1 dm |
| SHF | Super High Frequency | 3-30 GHz | 10-1 cm |
| EHF | Extremely High Frequency | 30-300 GHz | 10-1 mm |
| THF | Tremendously High Frequency | 300 GHz-3 THz | 1-0.1 mm |

### IEEE Mikrowellenbaender

| Band | Frequenzbereich (ITU) |
|------|----------------------|
| L | 1-2 GHz |
| S | 2-4 GHz |
| C | 4-8 GHz |
| X | 8-12 GHz |
| Ku | 12-18 GHz |
| K | 18-27 GHz |
| Ka | 27-40 GHz |
| V | 40-75 GHz |
| W | 75-110 GHz |

### NATO/Militaerische Baender (A-O)

| Band | Frequenzbereich |
|------|-----------------|
| A | 0-250 MHz |
| B | 250-500 MHz |
| C | 0.5-1 GHz |
| D | 1-2 GHz |
| E | 2-3 GHz |
| F | 3-4 GHz |
| G | 4-6 GHz |
| H | 6-8 GHz |
| I | 8-10 GHz |
| J | 10-20 GHz |
| K | 20-40 GHz |
| L | 40-60 GHz |
| M | 60-100 GHz |
| N | 100-200 GHz |
| O | 200-300 GHz |

---

## Hinweise zur Implementierung

1. **Svelte 5 Syntax:** Alle Komponenten muessen Svelte 5 Runes ($state, $derived, $effect, $props) verwenden
2. **D3.js:** Fuer logarithmische Skalen und interaktive Charts
3. **Tailwind CSS:** Fuer konsistentes Styling
4. **TypeScript:** Typisierung fuer alle Datenstrukturen
5. **Barrierefreiheit:** ARIA-Labels fuer SVG-Elemente, Keyboard-Navigation
6. **Performance:** ResizeObserver fuer responsive Charts, Debouncing fuer Inputs

---

*Plan erstellt am: 23.01.2026*
