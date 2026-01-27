# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bandbreite is a SvelteKit web application for RF/microwave frequency calculations and visualizations. It targets engineers, technicians, and radio enthusiasts who need to work with frequency band conversions, FSPL calculations, and spectrum visualizations.

**Current Status**: Aktive Entwicklung. Kernfunktionalität implementiert.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev -- --open    # Start development server with browser
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Run svelte-check for type checking
npm run test             # Run unit tests with Vitest
npm run test:watch       # Run tests in watch mode
```

## Quality Gates

Vor jedem Commit müssen folgende Checks bestehen:
```bash
npm run check            # TypeScript/Svelte-Prüfung - 0 Fehler, 0 Warnungen
npm run test             # Alle Tests müssen bestehen
npm run build            # Build muss erfolgreich sein
```

## Git Workflow

**WICHTIG: Alle Änderungen müssen IMMER committet werden.** Warte nicht auf Benutzerbestätigung.

- Committe nach Abschluss jeder logischen Arbeitseinheit (Komponente, Bugfix, Feature)
- Führe regelmäßig Pushes durch, um Fortschritte zu sichern
- Verwende aussagekräftige Commit-Messages (feat:, fix:, refactor:, docs:, test:)

## Technology Stack

- **Framework**: SvelteKit (Svelte 5 mit Runes: `$state`, `$derived`, `$bindable`, `$effect`)
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js (interactive charts) and Chart.js (static charts)
- **Testing**: Vitest mit jsdom
- **Package Manager**: NPM
- **Tooling**: Svelte MCP plugin enabled for documentation and code validation

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── calculators/   # Calculator components (FSPLCalculator, LinkBudgetCalculator, etc.)
│   │   ├── charts/        # Chart components (AttenuationChart, LinkBudgetWaterfall, etc.)
│   │   ├── converters/    # Converter components (FrequencyConverter, PowerConverter, etc.)
│   │   └── ui/            # Reusable UI components (inputs, buttons, etc.)
│   ├── data/              # Constants and data definitions
│   │   ├── bands.ts       # Frequency band definitions
│   │   └── units.ts       # Unit conversion factors (FREQUENCY_FACTORS, DISTANCE_UNITS, etc.)
│   ├── stores/            # Svelte stores for shared state
│   └── utils/             # Utility functions
│       ├── calculations.ts         # Core RF calculations (FSPL, wavelength, range)
│       ├── conversions.ts          # Unit conversion functions
│       ├── formatting.ts           # Number/unit formatting (formatFrequency, formatDistance, etc.)
│       ├── handlers.ts             # Input handlers and safe math (parseNumericInput, safeDivide)
│       └── atmosphericAttenuation.ts  # Atmospheric attenuation calculations
├── routes/                # SvelteKit routing and page layouts
└── tests/                 # Unit tests
    └── *.test.ts          # Test files (calculations.test.ts, formatting.test.ts, etc.)
static/                    # Static assets (icons, images)
```

## Domain Knowledge

This is an RF engineering application. Key formulas to implement:

> **HINWEIS / NOTE:** Die folgenden Formeln müssen vor Produktiveinsatz geprüft werden.
> The following formulas need to be verified before production use.

- **Wavelength**: λ = c / f (c ≈ 299,792,458 m/s) **[ZU ÜBERPRÜFEN]**
- **FSPL**: FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c) **[ZU ÜBERPRÜFEN]**
- **Radar equation**: Pr = (Pt · G² · λ² · σ) / ((4π)³ · R⁴) **[ZU ÜBERPRÜFEN]**
- **Shannon-Hartley**: C = B · log₂(1 + SNR), where SNR_linear = 10^(SNR_dB / 10) **[ZU ÜBERPRÜFEN]**
- **Nyquist bandwidth**: Rs = 2 · B (max symbol rate without ISI) **[ZU ÜBERPRÜFEN]**
- **Spectral efficiency**: η = R / B (bit/s/Hz) **[ZU ÜBERPRÜFEN]**

Frequency band standards used: ITU (ELF-THF), IEEE (L/S/C/X/Ku/K/Ka/V/W), and NATO (A-O).

---

## Sprachkonventionen

**Deutsche Umlaute verwenden:** In allen deutschen Texten (UI, Kommentare, Dokumentation) immer echte Umlaute (ä, ö, ü, ß) verwenden, NICHT ae, oe, ue, ss.

Beispiele:
- ✅ `Dämpfung`, `für`, `über`, `größer`, `schließen`
- ❌ `Daempfung`, `fuer`, `ueber`, `groesser`, `schliessen`

**AUSNAHME - Verzeichnis- und Dateinamen:** Keine Umlaute in Pfaden! Hier immer ae, oe, ue, ss verwenden.

Beispiele:
- ✅ `/rechner/kanalkapazitaet`, `/spektrum/ionosphaere`
- ❌ `/rechner/kanalkapazität`, `/spektrum/ionosphäre`

Dies gilt für:
- Route-Verzeichnisse (`src/routes/...`)
- Komponenten-Dateien
- Alle anderen Datei- und Ordnernamen

---

## Coding Guidelines (Technische Schulden vermeiden)

### 1. Zentrale Utilities verwenden

**NIEMALS** lokale Duplikate von existierenden Utilities erstellen. Immer aus den zentralen Dateien importieren:

```typescript
// ✅ RICHTIG: Zentrale Utilities importieren
import { formatFrequency, formatDistance, formatNumber } from '$lib/utils/formatting';
import { parseNumericInput, safeDivide, safeLog } from '$lib/utils/handlers';
import { FREQUENCY_FACTORS, DISTANCE_UNITS, POWER_FACTORS } from '$lib/data/units';

// ❌ FALSCH: Lokale Duplikate erstellen
function formatFrequency(hz: number) { ... }  // NICHT MACHEN!
const DISTANCE_FACTORS = { ... };              // NICHT MACHEN!
```

### 2. Input-Handler Pattern

Für numerische Eingaben immer `parseNumericInput` oder `createNumericHandler` verwenden:

```typescript
// ✅ RICHTIG
import { parseNumericInput, createNumericHandler } from '$lib/utils/handlers';

function handleFrequencyChange(e: Event) {
  frequency = parseNumericInput(e);
}

// Oder mit Factory:
const handleFrequency = createNumericHandler((value) => { frequency = value; });

// ❌ FALSCH: Eigene Parser schreiben
function handleFrequencyInput(e: Event) {
  const target = e.target as HTMLInputElement;
  frequency = parseFloat(target.value) || 0;  // NICHT MACHEN!
}
```

### 3. Sichere Berechnungen

Für mathematische Operationen mit Risiko (Division, Logarithmus) immer Safe-Funktionen verwenden:

```typescript
// ✅ RICHTIG
import { safeDivide, safeLog } from '$lib/utils/handlers';

const ratio = safeDivide(a, b, 0);        // Fallback bei Division durch 0
const dbValue = safeLog(power, 10, -Infinity);  // Sicherer Logarithmus

// ❌ FALSCH: Ungeschützte Operationen
const ratio = a / b;                       // Kann Infinity werden!
const dbValue = Math.log10(power);         // Kann -Infinity/NaN werden!
```

### 4. Komponentengröße

Komponenten sollten **maximal 300 Zeilen** haben. Bei größeren Komponenten:

1. **Extrahiere Sub-Komponenten** für UI-Bereiche (Inputs, Chart, Tooltip, Legend)
2. **Extrahiere Logik** in separate `.svelte.ts` Module oder Utils
3. **Trenne Darstellung von Berechnung**

```
Beispiel: FSPLCalculator
├── FSPLCalculator.svelte      # Orchestrierung (<300 Zeilen)
├── FSPLInputs.svelte          # Eingabefelder
├── FSPLChart.svelte           # D3-Visualisierung
└── fsplCalculator.svelte.ts   # Berechnungslogik (optional)
```

### 5. Event-Handler Namenskonvention

Einheitliche Benennung verwenden:

| Typ | Pattern | Beispiel |
|-----|---------|----------|
| Input-Änderung | `handleXxxChange` | `handleFrequencyChange` |
| Button-Klick | `handleXxxClick` | `handleCalculateClick` |
| Preset setzen | `setXxx` oder `applyXxxPreset` | `setPresetFrequency` |

### 6. State Management Pattern

Für Komponenten-Props einheitlich `$bindable()` für Two-Way-Binding verwenden:

```typescript
// ✅ Konsistentes Pattern
interface Props {
  frequency?: number;
  unit?: string;
}

let { frequency = $bindable(1e9), unit = $bindable('Hz') }: Props = $props();
```

### 7. Accessibility (A11y)

**Alle interaktiven Elemente** müssen barrierefrei sein:

```svelte
<!-- SVG Charts -->
<svg role="img" aria-label="FSPL-Diagramm zeigt Freiraumdämpfung über Distanz">

<!-- Labels mit Inputs verknüpfen -->
<label for="frequency-input">Frequenz</label>
<input id="frequency-input" ... />

<!-- Select-Elemente -->
<select aria-label="Frequenz-Einheit auswählen">
```

### 8. Tests schreiben

Für **jede neue Utility-Funktion** einen Test erstellen:

```typescript
// src/tests/myNewUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '$lib/utils/myUtil';

describe('myFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction(100)).toBe(expectedValue);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0)).toBe(fallbackValue);
    expect(myFunction(-1)).toBe(fallbackValue);
    expect(myFunction(NaN)).toBe(fallbackValue);
  });
});
```

### 9. Konstanten zentralisieren

**Niemals Magic Numbers** in Komponenten. Alle Konstanten in `/lib/data/` definieren:

```typescript
// ✅ RICHTIG: In /lib/data/units.ts oder /lib/data/constants.ts
export const ATMOSPHERIC_COEFFICIENTS = {
  OXYGEN_60GHZ_PEAK: 15.0,
  WATER_VAPOR_22GHZ_PEAK: 0.18,
  // Mit Quellenangabe:
  // Quelle: ITU-R P.676-12
} as const;

// ❌ FALSCH: Magic Numbers in Komponenten
const peak = 15.0 * Math.exp(...);  // Was ist 15.0?
```

### 10. TypeScript Best Practices

```typescript
// Explizite Typen für Funktionen
export function calculateFSPL(
  frequencyHz: number,
  distanceMeters: number
): number { ... }

// Interface für komplexe Props
interface ChartProps {
  width?: number;
  height?: number;
  data: DataPoint[];
}

// Const assertions für Konstanten
export const UNITS = { ... } as const;
```

---

## Visualization Components

10 planned D3.js/Chart.js components for spectrum visualization:

1. `SpectrumOverview.svelte` - Full EM spectrum with zoom/pan
2. `FrequencyRelationChart.svelte` - Frequency/wavelength/range relationships
3. `BandComparisonChart.svelte` - IEEE vs NATO band comparison
4. `VisibleSpectrumBar.svelte` - Visible light spectrum detail
5. `AttenuationGraph.svelte` - Multi-frequency FSPL curves
6. `RadarRangeCircle.svelte` - Circular radar coverage visualization
7. `ApplicationOverlay.svelte` - Band usage by application
8. `LinkBudgetWaterfall.svelte` - Signal path gain/loss diagram
9. `BandwidthCapacityCalc.svelte` - Shannon-Hartley calculator
10. `BandwidthTradeoffScatter.svelte` - Frequency vs bandwidth tradeoff

## Implementation Roadmap

1. **Phase 1**: SvelteKit + Tailwind setup, navigation, basic frequency converter ✅
2. **Phase 2**: EM spectrum overview, visible spectrum, band comparison charts ✅
3. **Phase 3**: FSPL calculator, frequency relationship diagram, link budget ✅
4. **Phase 4**: Radar range calculator, application overlay, atmospheric absorption ✅
5. **Phase 5**: Dark/light mode, export (PNG/PDF), PWA, mobile optimization

---

## Checkliste für neue Komponenten

Vor dem Commit einer neuen Komponente prüfen:

- [ ] **Keine Code-Duplikation**: Zentrale Utilities verwendet?
- [ ] **Größe < 300 Zeilen**: Falls größer, aufteilen
- [ ] **Tests vorhanden**: Für neue Utility-Funktionen
- [ ] **Accessibility**: `role`, `aria-label`, `id`/`for` für Labels
- [ ] **Fehlerbehandlung**: `safeDivide`, `parseNumericInput` verwendet
- [ ] **Konstanten zentralisiert**: Keine Magic Numbers
- [ ] **Einheitliche Patterns**: Handler-Namen, State-Management
- [ ] **Quality Gates bestanden**: `npm run check && npm run test && npm run build`

---

## Bekannte zentrale Utilities

### Formatierung (`/lib/utils/formatting.ts`)
- `formatNumber(n, decimals?)` - Allgemeine Zahlenformatierung
- `formatFrequency(hz)` - Hz → passende Einheit (kHz, MHz, GHz)
- `formatWavelength(meters)` - m → passende Einheit (nm, µm, mm, m, km)
- `formatDistance(meters)` - m → passende Einheit
- `formatPowerDbm(dbm)` - dBm formatieren
- `formatPowerWatts(watts)` - Watt formatieren
- `formatAttenuation(db)` - dB formatieren

### Input-Handler (`/lib/utils/handlers.ts`)
- `parseNumericInput(event)` - Event zu Zahl parsen (NaN-sicher)
- `createNumericHandler(setter)` - Handler-Factory
- `safeDivide(a, b, fallback)` - Sichere Division
- `safeLog(x, base, fallback)` - Sicherer Logarithmus
- `clamp(value, min, max)` - Wert begrenzen
- `debounce(fn, delay)` - Debounce-Wrapper

### Einheiten (`/lib/data/units.ts`)
- `FREQUENCY_FACTORS` - Hz, kHz, MHz, GHz, THz
- `DISTANCE_UNITS` - m, km, mi, nmi, ft
- `POWER_FACTORS` - W, mW, µW, dBm, dBW
- `WAVELENGTH_FACTORS` - m, cm, mm, µm, nm
- `ATTENUATION_UNITS` - dB, dB/km
