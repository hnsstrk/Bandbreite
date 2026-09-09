# CLAUDE.md

Guidance for Claude Code in this repository.

## Project Overview

**Bandbreite** — SvelteKit-Webanwendung zum elektromagnetischen Spektrum: Visualisierungen, HF-Rechner, Wissenskapitel zur Funktechnik, Frequenzdatenbanken.
**Status**: Rework in elf Wellen abgeschlossen (`docs/REWORK-2026-09.md`); W7 Datenblatt-Stil, W8 Abschluss.

## Task Management

`task project:bandbreite list`

## Build, Test, Quality Gates

```bash
npm install · npm run dev -- --open · npm run build · npm run preview
npm run format    # Prettier (2 Leerzeichen, ' , ; , 100/120)
npm run lint && npm run check && npm run test:run && npm run build   # vor jedem Commit, grün
npm run test:e2e  # Rauchtest aller Seiten (Chromium nötig)
```

`npm run lint` = ESLint + `prettier --check`; Warnungen sind zugelassen, **Fehler
nicht**. Gleiche Kette in `.github/workflows/ci.yml`.

## Technology Stack

- **Framework**: SvelteKit + Svelte 5 Runes (`$state`, `$derived`, `$bindable`), `adapter-static` (`strict`)
- **Styling**: Tailwind CSS 4, Tokens in `src/app.css` (Datenblatt-Stil, volle Breite)
- **Visualisierungen**: `d3-scale` + `d3-shape` + eigenes SVG — **kein Chart.js**, kein jsPDF
- **Testing**: Vitest + jsdom · **MCP**: Svelte MCP plugin

## Project Structure

```
lib/components/ layout/ · ui/ · calculators/ · converters/ · charts/ · funk/ (Panel)
  knowledge/ (ArticleLayout, WidgetFrame, widgetRegistry, animationLoop)
  widgets/ (Widget + *Model.ts) · portal/ (HubList) · learning/
  Spectrum*.svelte + spectrum{State,Zoom,Bands,Cursor,Format}
lib/content/ Kapiteltexte als Daten (+ funktechnik/, radar/, grundlagen/)
lib/data/ navigation, relations, searchIndex, widgets, learningPaths, glossary,
  bands, frequencyBands + ein Funkdatensatz je Funkdienst
lib/stores/ speedOfLight, atmosphericParameters
lib/utils/ calculations, conversions, formatting, handlers, decibel, fieldStrength,
  itu676, radar, orbitMath, fresnel-/modulation-/antennaMath, urlState
routes/ 56 Seiten + 4 Redirects · tests/ · Elementreferenz: ARCHITEKTUR.md
```

## Geschützte Kernelemente (nicht ändern ohne Bestätigung)

Die fünf Komponenten der Kernidee: `SpectrumOverview` (EM-Spektrum), `FrequencyConverter` (f ↔ λ), `PowerConverter` (W ↔ dBm), `RangeCalculator` (TX/RX), `BandInfo` (Bandzuordnung, auf `/konverter/frequenz/` eingebunden — einbinden ja, ändern nein; auf `/spektrum/` übernimmt `BandDetailSidebar`).

Geschützt sind **Verhalten und Erscheinungsbild**, nicht die Dateigrenze: `SpectrumOverview` und `FrequencyConverter` sind pixelgleich aufgeteilt; die Sub-Komponenten (`Spectrum*`, `spectrum*`, `Frequency{Presets,Formula}`) zählen dazu.

Bindable-Sync (E3) behoben: beide Konverter arbeiten direkt auf dem `$bindable`-Prop.

## Coding Guidelines

### Zentrale Utilities (nie duplizieren)

`units.ts` ist die einzige Quelle der Umrechnungsfaktoren (`conversions.ts` nutzt sie), λ = c/f nur in `calculations.ts`, Pegel nur in `decibel.ts`, Formatierer nur in `formatting.ts`. Immer `safeDivide(a, b, 0)`, `safeLog(x, 10, -Infinity)` und `parseNumericInput(event)` statt `a/b`, `Math.log` und `Number(…value)`.

### Neue Seite anlegen

1. Knoten in `NAV_TREE` (`data/navigation.ts`): `href` **mit** Trailing Slash, `description`, `icon`, `keywords`, `status`, ggf. `hidden`. Daraus ziehen Menü, Breadcrumb, Hub-Listen, Sitemap und Suche; eine zweite Liste gibt es nicht.
2. `RELATIONS` (`data/relations.ts`): 3–6 Ziele, eines bereichsfremd; auf der Seite nur `<RelatedTopics href="/…/" />`.
3. `+page.ts` mit `pageMeta('/…/')` statt `<svelte:head>` — `ui/Metadata.svelte` macht daraus Titel, canonical, og/twitter, JSON-LD.
4. **Trailing Slash**: jeder interne Link endet auf `/`, Anker dahinter (`…/grundlagen/#rcs`).

### Komponenten-Regeln

- **Max. 300 Zeilen** — sonst aufteilen (Unterkomponente + `.svelte.ts`)
- **UI-Bibliothek statt eigenem Markup**: `Button`, `Card`, `NumberInput`, `Slider`, `Select`, `Tabs`, `Callout`, `FormulaBlock`, `ResultCard`, `PageHero`, `SectionHeader`, `Badge`
- **Nur Tokens, keine Hex-Farben** (`var(--color-…)`); **`Icon.svelte` statt Emoji** (`ui/icons.ts`)
- **Handler-Namen**: `handleXxxChange`/`handleXxxClick`, `setXxx`/`applyXxxPreset`; `$bindable()` für Two-Way
- **A11y**: `role`, `aria-label`, `id`/`for` an jedem interaktiven Element
- **Keine Magic Numbers** (Konstanten in `lib/data/`); **Test** für jede neue Utility
- **Datenblatt-Stil**: keine Schatten, Radius 2 px, 1-px-Linien statt Flächen, keine verschachtelten Karten, keine Schmuckelemente, die Platz kosten (Icon-Kacheln, Kicker, Chips)
- **Volle Breite**: keine `max-width`, kein `.page-container` — den Rand setzt `main` (`--page-gutter` 0,75 rem); Hub-Einstiege `portal/HubList`, Funk-Abschnitte `funk/Panel` statt `ui/Card`

### Content-Architektur (Wissen-Kapitel)

Kapiteltexte sind **Daten** in `src/lib/content`, kein Markup: `KnowledgeArticle` (`content/types.ts`) aus `ArticleSection`s mit typisierten Blöcken (paragraph, list, formula, callout, table, definitions, cards, widget, question), gerendert von `ArticleLayout.svelte` — volle Breite, keine Lesebreite. Mehrteilige Kapitel: Unterordner mit `index.ts` als Hub. Anker-IDs ohne Umlaute; Zahlen aus den Utilities, nie hartkodieren.

### Chart- und Rechner-Muster

Jedes Diagramm sitzt in `charts/ChartFrame.svelte` (Caption statt Karte), misst seine Breite selbst (`bind:width`) und liefert `description` + `dataTable` (sr-only); Daten in `<name>Data.ts`. Rechner halten ihren Zustand per `utils/urlState.svelte.ts` in der URL (`*_PARAMS`, `UrlStateSync`, `CalculatorActions.svelte` für „Link kopieren"/„Zurücksetzen") — ohne innere Karten.

### Widget-Muster

`XyzModel.ts` = Rechenfunktionen ohne DOM (mit Test); `XyzWidget.svelte` = Regler + Bühne in `WidgetFrame.svelte` (Caption statt Karte; braucht `description` und `sr-only`-Datentabelle). Animation über `knowledge/animationLoop.svelte.ts` (`new AnimationLoop()` + `$effect(() => loop.attach())`) — stoppt bei `prefers-reduced-motion` und verborgenem Tab.

**Deep-Link `?w=<id>`:** `ArticleLayout` springt zum Widget, `WidgetFrame` kopiert den Link. **Neues Widget = zwei Zeilen:** Komponente in `widgetRegistry.ts`, Metadaten in `data/widgets.ts` — dort **ohne** Komponentenimporte, sonst zieht der Suchindex alle Widgets ins Bündel.

### Lernpfad-Muster

Ein Pfad in `data/learningPaths.ts` ist eine Schrittliste mit `href`, Lernziel und `optional?`. **Jeder Schritt muss ein lebender `NAV_TREE`-Knoten sein** (`resolvePathSteps()` blendet fehlende aus). Fortschritt gerätelokal, Lesen im `$effect`.

### Sprachkonventionen

- Echte Umlaute in UI/Kommentaren/Docs: `ä ö ü ß` (nicht ae, oe, ue, ss)
- **Ausnahme**: Verzeichnis- und Dateinamen ohne Umlaute (sie landen in URLs): `/rechner/kanalkapazitaet`
- Anzeigezahlen de-DE über `formatLocaleNumber`/`formatFixed`; Eingaben nehmen Komma **und** Punkt, URL-Parameter Punkt

## Domain Knowledge (Quellen im Code nennen)

- **λ = c / f** (c = 299 792 458 m/s exakt) · **FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)**, ITU-R P.525
- **Shannon-Hartley**: C = B · log₂(1 + SNR_lin)
- ITU-R **P.676-13** (Gas) · **P.838-3** (Regen) · **P.840** (Wolken) · **P.526** (Beugung) · **P.530** (Schwund)
- Radar **Skolnik** · **IEEE Std 521** · SSR **ICAO Annex 10 Vol. IV** · Amateurfunk **AFuV Anlage 1**
- Bandstandards: ITU (ELF–THF), IEEE (L…W), NATO (A–O)

Keine erfundenen Zahlen: jede Angabe braucht eine Quelle; Annahmen als `Annahme:` kennzeichnen und in `docs/DATENQUELLEN.md` bzw. `/service/quellen/` führen.

## Checkliste

- [ ] Zentrale Utilities, keine Magic Numbers, < 300 Zeilen, Logik in `.svelte.ts`
- [ ] UI-Bibliothek, nur Tokens, flach und volle Breite, Icon statt Emoji, role/aria/id/for
- [ ] Tests für Utilities und Modelle; `ChartFrame`/`WidgetFrame` + `data/widgets.ts`
- [ ] Neue Seite: `navigation.ts`, `relations.ts`, `pageMeta()`; Quellen genannt; Gates grün

## Documentation

`ARCHITEKTUR.md` (IDs) · `STYLE_GUIDE.md` (Tokens, Datenblatt) · `docs/DATENQUELLEN.md` · `docs/REWORK-2026-09.md` · `docs/DEPLOYMENT.md` · Vault [[Bandbreite]]
