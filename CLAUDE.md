# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

## Project Overview

**Bandbreite** — SvelteKit-Webanwendung rund um das elektromagnetische Spektrum: Visualisierungen, HF-Rechner, Wissenskapitel zur Funk- und Fernmeldetechnik, Frequenzdatenbanken.
**Status**: Aktive Entwicklung; Rework in zwei Wellen abgeschlossen (`docs/REWORK-2026-09.md`).

## Task Management

`task project:bandbreite list`

## Build, Test, Quality Gates

```bash
npm install · npm run dev -- --open · npm run build · npm run preview
npm run check && npm run test:run && npm run build   # vor jedem Commit, alles grün
```

## Technology Stack

- **Framework**: SvelteKit + Svelte 5 Runes (`$state`, `$derived`, `$bindable`, `$effect`), `adapter-static`, alles prerendered
- **Styling**: Tailwind CSS 4, Token-System in `src/app.css`
- **Visualisierungen**: D3 (Skalen, Pfadgeneratoren) + eigenes SVG — **kein Chart.js**, kein jsPDF/html2canvas
- **Testing**: Vitest mit jsdom (37 Dateien, 1597 Tests) · **MCP**: Svelte MCP plugin

## Project Structure

```
lib/components/  layout/ · ui/ (Design-System) · calculators/ · converters/ · charts/
                 funk/ (Bandpläne, Kanalumrechner, Datenbank)
                 knowledge/ (ArticleLayout, WidgetFrame, widgetRegistry, animationLoop)
                 widgets/ (Widget + reines Rechenmodell *Model.ts)
lib/content/     Kapiteltexte als Daten (+ funktechnik/)
lib/data/        navigation.ts, relations.ts, searchIndex.ts, Frequenz- und Banddaten
lib/stores/      speedOfLight, atmosphericParameters
lib/utils/       calculations, conversions, formatting, handlers, itu676, radar,
                 fresnelMath, modulationMath, antennaMath, search, slug, urlState
routes/          34 Seiten + 3 Redirects · tests/  Unit-Tests
```

## Geschützte Kernelemente (NICHT ÄNDERN ohne explizite Bestätigung)

Die 5 Komponenten der Kernidee:

1. `SpectrumOverview.svelte` — EM-Spektrum-Visualisierung
2. `FrequencyConverter.svelte` — Frequenz ↔ Wellenlänge
3. `PowerConverter.svelte` — Leistungskonverter (W ↔ dBm)
4. `RangeCalculator.svelte` — Reichweitenrechner (TX/RX)
5. `BandInfo.svelte` — Bandzuordnung für Frequenzen

> **Entscheidung des Besitzers steht aus:** `BandInfo.svelte` ist derzeit in **keiner** Route eingebunden; die Rolle auf `/spektrum/` übernimmt faktisch `BandDetailSidebar.svelte`. Bewusst nicht gelöscht — weder eigenmächtig entfernen noch wieder einbinden.

## Coding Guidelines

### Zentrale Utilities immer importieren (nie duplizieren)

```typescript
import { formatFrequency, formatDistance, formatNumber } from '$lib/utils/formatting';
import { parseNumericInput, safeDivide, safeLog } from '$lib/utils/handlers';
import { frequencyToWavelength, calculateFSPL } from '$lib/utils/calculations';
import { FREQUENCY_FACTORS, DISTANCE_UNITS, POWER_FACTORS } from '$lib/data/units';
```

`units.ts` ist die einzige Quelle der Umrechnungsfaktoren, `conversions.ts` nutzt sie (`convertToHz`, `wattToDbm`, …), λ = c/f steht nur in `calculations.ts`. Immer `safeDivide(a, b, 0)` statt `a/b`, `safeLog(x, 10, -Infinity)` statt `Math.log`, `parseNumericInput(event)` statt `Number(event.target.value)`.

### Neue Seite anlegen

1. Knoten in `NAV_TREE` (`data/navigation.ts`) — `href` **mit** Trailing Slash, dazu `description`, `icon`, `keywords`, `status`. Daraus ziehen Menü, Breadcrumb, Hub-Kacheln, Sitemap, Suche und Kapitel-Blättern automatisch; eine zweite Liste gibt es nicht.
2. Verweise in `RELATIONS` (`data/relations.ts`): 3–6 Ziele mit Begründung, mindestens eines aus einem anderen Bereich. Auf der Seite nur `<RelatedTopics href="/…/" />`.
3. `+page.ts` mit `pageMeta()` statt `<svelte:head>`; `ui/Metadata.svelte` erzeugt daraus als einzige Stelle Titel, canonical, og/twitter, JSON-LD:
   ```typescript
   import { pageMeta } from '$lib/data/navigation';
   export const load = () => pageMeta('/wissen/antennen/');
   ```
4. **Trailing Slash**: jeder interne Link endet auf `/`.

### Komponenten-Regeln

- **Max. 300 Zeilen** — sonst aufteilen (Unterkomponenten + `.svelte.ts` für Logik)
- **UI-Bibliothek statt eigenem Markup**: `Button`, `Card`, `NumberInput`, `Slider`, `Select`, `Tabs`, `Callout`, `FormulaBlock`, `ResultCard`, `PageHero`, `SectionHeader`, `Badge`
- **Nur Tokens, keine Hex-Farben** (`var(--color-…)`); **`Icon.svelte` statt Emoji** (Namen aus `ui/icons.ts`)
- **Handler-Namen**: `handleXxxChange`, `handleXxxClick`, `setXxx`/`applyXxxPreset`; `$bindable()` für Two-Way-Binding
- **Accessibility**: `role`, `aria-label`, `id`/`for` für alle interaktiven Elemente
- **Keine Magic Numbers** (Konstanten in `lib/data/`); **Test** für jede neue Utility-Funktion

### Content-Architektur (Wissen-Kapitel)

Kapiteltexte sind **Daten** in `src/lib/content`, kein Markup: ein `KnowledgeArticle` (`content/types.ts`) aus `ArticleSection`s mit typisierten Blöcken (`paragraph`, `list`, `formula`, `callout`, `table`, `definitions`, `cards`, `widget`, `question`), gerendert von `knowledge/ArticleLayout.svelte`. Anker-IDs stehen ohne Umlaute in den Daten. Zahlenbeispiele aus den Utilities berechnen, nie hartkodieren.

### Chart- und Rechner-Muster

Jedes Diagramm sitzt in `charts/ChartFrame.svelte`, misst seine Breite selbst (`bind:width` — Aufrufer geben `width` nicht vor) und liefert `description` + `dataTable` (sr-only); Datenaufbereitung in `<name>Data.ts` daneben. Rechner halten ihren Zustand über `utils/urlState.svelte.ts` in der URL: `*_PARAMS` deklariert Vorgaben und Grenzen, `UrlStateSync` schreibt entprellt, `CalculatorActions.svelte` liefert „Link kopieren"/„Zurücksetzen".

### Widget-Muster

`XyzModel.ts` = reine Rechenfunktionen ohne DOM (mit Test); `XyzWidget.svelte` = Regler + Bühne in `WidgetFrame.svelte`; `knowledge/widgetRegistry.ts` bildet ID → Komponente ab, Inhalte referenzieren nur die ID. `WidgetFrame` verlangt `description` (wird `aria-label`) und eine `sr-only`-Datentabelle. Animation über `knowledge/animationLoop.svelte.ts`:

```typescript
const loop = new AnimationLoop();
$effect(() => loop.attach());   // stoppt bei prefers-reduced-motion und verborgenem Tab
```

### Sprachkonventionen

- Echte Umlaute in UI/Kommentaren/Docs: `ä ö ü ß` (NICHT ae, oe, ue, ss)
- **Ausnahme**: Verzeichnis- und Dateinamen ohne Umlaute, weil sie in URLs landen
  - ✅ `/rechner/kanalkapazitaet` — ❌ `/rechner/kanalkapazität`

## Domain Knowledge (Quellen im Code angeben)

- **λ = c / f** (c = 299 792 458 m/s exakt) · **FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)**, ITU-R P.525
- **Shannon-Hartley**: C = B · log₂(1 + SNR_lin), SNR_lin = 10^(SNR_dB/10)
- Gasdämpfung ITU-R **P.676-13** Annex 1 (line-by-line, `utils/itu676.ts`) · Regen **P.838-3** · Wolken/Nebel **P.840**
- Beugung **P.526** · Schwund **P.530** · Radar: **Skolnik**, *Introduction to Radar Systems* · Bandbuchstaben **IEEE Std 521**

Bandstandards: ITU (ELF–THF), IEEE (L/S/C/X/Ku/K/Ka/V/W), NATO (A–O).
Keine erfundenen Zahlen: jede Angabe braucht eine Quelle; Annahmen im Code als `Annahme:` kennzeichnen und in `docs/DATENQUELLEN.md` bzw. `/service/quellen/` aufführen.

## New Component Checklist

- [ ] Zentrale Utilities verwendet (keine Duplikate), `safeDivide`/`safeLog`, keine Magic Numbers
- [ ] < 300 Zeilen, Logik in `.svelte.ts`
- [ ] UI-Bibliothek statt eigenem Markup; nur Tokens, keine Hex-Farben; Icon statt Emoji
- [ ] Accessibility: role, aria-label, id/for, Fokusring
- [ ] Tests für neue Utility-Funktionen und Rechenmodelle
- [ ] Diagramm in `ChartFrame` (`description`+`dataTable`); Widget in `WidgetFrame` + `AnimationLoop`
- [ ] Neue Seite: `navigation.ts`, `relations.ts`, `+page.ts` mit `pageMeta()`, Links mit Trailing Slash
- [ ] Datenangaben mit Quelle; Annahmen gekennzeichnet
- [ ] Quality Gates grün (`conventions.test.ts` prüft Größe, Tokens, Trailing Slash)

## Documentation

`ARCHITEKTUR.md` (Elementreferenz mit IDs) · `STYLE_GUIDE.md` (Tokens, Props) · `docs/DATENQUELLEN.md` (Herkunft, Stand, Unsicherheiten) · `docs/REWORK-2026-09.md` (offene Entscheidungen) · `docs/DEPLOYMENT.md` · Obsidian Vault [[Bandbreite]]
