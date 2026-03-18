# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bandbreite** — SvelteKit-Webanwendung für HF/Mikrowellen-Frequenzberechnungen und Spektrum-Visualisierungen.

**Status**: Aktive Entwicklung. Kernfunktionalität implementiert (Phasen 1-4 abgeschlossen).

## Task Management

```bash
task project:bandbreite list
```

## Build & Development Commands

```bash
npm install              # Abhängigkeiten installieren
npm run dev -- --open    # Entwicklungsserver mit Browser
npm run build            # Produktions-Build
npm run preview          # Build-Vorschau
npm run check            # TypeScript/Svelte-Prüfung
npm run test             # Unit-Tests (Vitest)
npm run test:watch       # Tests im Watch-Modus
```

## Quality Gates (vor jedem Commit)

```bash
npm run check && npm run test && npm run build   # 0 Fehler, alle Tests grün
```

## Technology Stack

- **Framework**: SvelteKit + Svelte 5 Runes (`$state`, `$derived`, `$bindable`, `$effect`)
- **Styling**: Tailwind CSS
- **Visualisierungen**: D3.js (interaktiv) und Chart.js (statisch)
- **Testing**: Vitest mit jsdom
- **MCP**: Svelte MCP plugin für Dokumentation und Code-Validierung

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── calculators/   # FSPLCalculator, LinkBudgetCalculator, etc.
│   │   ├── charts/        # AttenuationChart, LinkBudgetWaterfall, etc.
│   │   ├── converters/    # FrequencyConverter, PowerConverter, etc.
│   │   └── ui/            # Wiederverwendbare UI-Komponenten
│   ├── data/              # Konstanten: bands.ts, units.ts, spectrum.ts, presets.ts
│   ├── stores/            # Svelte Stores für geteilten State
│   └── utils/
│       ├── calculations.ts           # FSPL, Wellenlänge, Reichweite
│       ├── conversions.ts            # Einheitsumrechnungen
│       ├── formatting.ts             # formatFrequency, formatDistance, etc.
│       ├── handlers.ts               # parseNumericInput, safeDivide, safeLog
│       └── atmosphericAttenuation.ts # Atmosphärische Dämpfung
├── routes/                # SvelteKit Seiten
└── tests/                 # Unit-Tests (*.test.ts)
static/                    # Statische Assets
```

## Geschützte Kernelemente (NICHT ÄNDERN ohne explizite Bestätigung)

Die 5 Komponenten auf der Startseite (`/`) sind das Herzstück:

1. `SpectrumOverview.svelte` — EM-Spektrum-Visualisierung
2. `FrequencyConverter.svelte` — Frequenz ↔ Wellenlänge
3. `PowerConverter.svelte` — Leistungskonverter (W ↔ dBm)
4. `RangeCalculator.svelte` — Reichweitenrechner (TX/RX)
5. `BandInfo.svelte` — Bandzuordnung für Frequenzen

## Coding Guidelines

### Zentrale Utilities immer importieren (nie duplizieren)

```typescript
import { formatFrequency, formatDistance, formatNumber } from '$lib/utils/formatting';
import { parseNumericInput, safeDivide, safeLog } from '$lib/utils/handlers';
import { FREQUENCY_FACTORS, DISTANCE_UNITS, POWER_FACTORS } from '$lib/data/units';
```

### Sichere Berechnungen

```typescript
const ratio = safeDivide(a, b, 0);         // Nie a/b direkt
const db = safeLog(power, 10, -Infinity);  // Nie Math.log direkt
```

### Input-Handler Pattern

```typescript
import { parseNumericInput } from '$lib/utils/handlers';
function handleChange(e: Event) { value = parseNumericInput(e); }
```

### Komponenten-Regeln

- **Max. 300 Zeilen** pro Komponente — sonst aufteilen (Sub-Komponenten + `.svelte.ts` für Logik)
- **Handler-Namen**: `handleXxxChange`, `handleXxxClick`, `setXxx`/`applyXxxPreset`
- **State**: `$bindable()` für Two-Way-Binding
- **Accessibility**: `role`, `aria-label`, `id`/`for` für alle interaktiven Elemente
- **Keine Magic Numbers** — Konstanten in `/lib/data/`
- **Tests** für jede neue Utility-Funktion

### Sprachkonventionen

- Echte Umlaute in UI/Kommentaren/Docs: `ä ö ü ß` (NICHT ae, oe, ue, ss)
- **Ausnahme**: Verzeichnis- und Dateinamen immer ohne Umlaute (Route-URLs)
  - ✅ `/rechner/kanalkapazitaet` — ❌ `/rechner/kanalkapazität`

### TypeScript

```typescript
export function calculateFSPL(frequencyHz: number, distanceMeters: number): number { ... }
export const UNITS = { ... } as const;
```

## Domain Knowledge (Formeln — vor Produktiveinsatz prüfen)

- **Wellenlänge**: λ = c / f (c ≈ 299,792,458 m/s)
- **FSPL**: FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)
- **Shannon-Hartley**: C = B · log₂(1 + SNR_linear), SNR_linear = 10^(SNR_dB/10)

Frequenzband-Standards: ITU (ELF-THF), IEEE (L/S/C/X/Ku/K/Ka/V/W), NATO (A-O)

## New Component Checklist

- [ ] Zentrale Utilities verwendet (keine Duplikate)
- [ ] Größe < 300 Zeilen
- [ ] Tests für neue Utility-Funktionen
- [ ] Accessibility: role, aria-label, id/for
- [ ] safeDivide/safeLog verwendet
- [ ] Keine Magic Numbers
- [ ] Quality Gates bestanden

## Documentation

Projektdokumentation: Siehe Obsidian Vault [[Bandbreite]]
