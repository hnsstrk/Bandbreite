# Bandbreite - Architektur & Elementreferenz

Gemeinsame Referenz zur eindeutigen Identifikation aller Elemente. Jedes Element hat eine **ID** in eckigen Klammern (z.B. `[C-FSPL]`), die wir zur Kommunikation verwenden.

---

## Geschützte Kernelemente

Die folgenden fünf Komponenten auf der Spektrum-Hauptseite `[R-SPEK]` bilden die **Kernidee der Anwendung**. Sie dürfen **niemals** entfernt, ersetzt oder in ihrer Funktion verändert werden, ohne vorher explizit beim Benutzer nachzufragen.

- **`[C-SPECTRUM]`** — EM-Spektrum-Visualisierung (das Hauptdiagramm)
- **`[C-FREQCONV]`** — Frequenz ↔ Wellenlänge Konverter
- **`[C-POWCONV]`** — Leistungskonverter (W ↔ dBm)
- **`[C-RANGE]`** — Reichweitenrechner (TX/RX)
- **`[C-BANDINFO]`** — Bandzuordnung für Frequenzen

Diese Kombination — Spektrum oben, darunter die vier Werkzeuge — ist das Herzstück. Erweiterungen sind willkommen, aber der Kern bleibt unangetastet.

---

## Seitenübersicht

Die App ist in fünf Hauptbereiche gegliedert, erreichbar über die Navigation `[C-HEADER]`:

```
bandbreite.app
│
├── /                          Redirect → /spektrum [R-HOME]
│
├── /konverter/                Konverter-Hub [R-KONV]
│   └── /frequenz              Frequenz ↔ Wellenlänge [R-KONV-FREQ]
│
├── /rechner/                  Rechner-Hub [R-RECH]
│   ├── /fspl                  Freiraumdämpfung [R-FSPL]
│   ├── /link-budget           Link-Budget-Analyse [R-LINK]
│   ├── /radar                 Radar-Reichweite [R-RADAR]
│   ├── /kanalkapazitaet       Kanalkapazität (Shannon) [R-KANAL]
│   ├── /skin-tiefe            Skin-Tiefe [R-SKIN]
│   └── /fresnel               Fresnel-Zone [R-FRESN]
│
├── /spektrum/                 Hauptseite (ehem. Startseite) [R-SPEK]
│   ├── /explorer              Frequenzband-Explorer [R-SPEK-EXP]
│   ├── /ionosphaere           Ionosphärische Ausbreitung [R-SPEK-ION]
│   └── /anwendungen           Anwendungsübersicht [R-SPEK-APP]
│
├── /wissen/                   Wissens-Hub [R-WISS]
│   ├── /wellenausbreitung     Wellenausbreitung [R-WISS-WELL]
│   ├── /frequenzbaender       Frequenzbänder-Referenz [R-WISS-FREQ]
│   ├── /mathematik            HF-Mathematik [R-WISS-MATH]
│   └── /radar                 Radar-Grundlagen [R-WISS-RAD]
│
└── /datenbanken/              Datenbank-Hub [R-DB]
    ├── /historie              Funk-Geschichte [R-DB-HIST]
    └── /sender                Senderdatenbank [R-DB-SEND]
```

### Was zeigen die Seiten?

**Startseite `[R-HOME]`** — Permanenter Redirect (308) auf `/spektrum`.

**Spektrum-Hauptseite `[R-SPEK]`** — Neue Hauptseite mit allen Kernelementen: EM-Spektrum, Frequenz-/Leistungskonverter, Reichweitenrechner, Bandinfo, Sendeleistungen-Chart, Atmosphärische Dämpfung, Grundlagen-Karten und Links zu Unterseiten.

**Hub-Seiten** (`[R-KONV]`, `[R-RECH]`, `[R-WISS]`, `[R-DB]`) — Übersichtsseiten, die als Einstiegspunkte zu den jeweiligen Unterseiten dienen. Enthalten Kurzbeschreibungen und Verlinkungen.

**Wissens-Seiten** — Die umfangreichsten Seiten der App. `[R-WISS-MATH]` (1407 Zeilen) und `[R-WISS-RAD]` (1361 Zeilen) sind reine Inhaltsseiten ohne interaktive Komponenten.

---

## Komponenten

Alle Komponenten liegen unter `src/lib/components/`. Pfadangaben sind relativ dazu.

### Layout (3 Komponenten)

- **`[C-HEADER]`** — `layout/Header.svelte` (563 Z.)
  Hauptnavigation mit Dropdown-Menüs, Mobile-Hamburger-Menü, enthält `[C-THEME]`

- **`[C-FOOTER]`** — `layout/Footer.svelte` (47 Z.)
  Fußzeile mit Copyright und GitHub-Link

- **`[C-THEME]`** — `layout/ThemeToggle.svelte` (131 Z.)
  Dark/Light-Umschalter, speichert Präferenz in localStorage

### Rechner (6 Komponenten)

Jeder Rechner ist eine eigenständige Komponente mit Eingabefeldern, Berechnung und Ergebnisanzeige.

- **`[C-FSPL]`** — `calculators/FSPLCalculator.svelte` (572 Z.)
  Freiraumdämpfung. D3-Diagramm mit Mehrfrequenz-Vergleich.
  Props: `frequencyHz?`, `width?`, `height?`

- **`[C-LINKBUDGET]`** — `calculators/LinkBudgetCalculator.svelte` (575 Z.)
  Link-Budget-Analyse. TX-Leistung, Antennengewinne, Verluste → Empfangsleistung.
  Gibt Daten an `[C-WATERFALL]` weiter.

- **`[C-RADAR]`** — `calculators/RadarRangeCalculator.svelte` (437 Z.)
  Radargleichung. Sendeleistung, Gewinn, RCS, Empfindlichkeit → Reichweite.

- **`[C-CHANNEL]`** — `calculators/ChannelCapacityCalculator.svelte` (494 Z.)
  Shannon-Hartley. Bandbreite + SNR → maximale Kanalkapazität.

- **`[C-SKIN]`** — `calculators/SkinDepthCalculator.svelte` (505 Z.)
  Skin-Tiefe. Frequenz + Materialeigenschaften → Eindringtiefe.

- **`[C-FRESNEL]`** — `calculators/FresnelZoneCalculator.svelte` (557 Z.)
  Fresnel-Zone. Distanz + Frequenz → Zonenradius für Sichtlinien-Clearance.

### Konverter (5 Komponenten)

Einfachere Werkzeuge für Einheitenumrechnung und Schnellinfo.

- **`[C-FREQCONV]`** — `converters/FrequencyConverter.svelte` (371 Z.)
  Bidirektional: Frequenz ↔ Wellenlänge mit Presets und automatischer Einheitenwahl.
  Props: `frequencyHz = $bindable()`

- **`[C-POWCONV]`** — `converters/PowerConverter.svelte` (182 Z.)
  Leistungsumrechnung: W ↔ mW ↔ dBm ↔ dBW

- **`[C-RANGE]`** — `converters/RangeCalculator.svelte` (206 Z.)
  TX-Leistung + RX-Empfindlichkeit → theoretische Reichweite

- **`[C-BANDINFO]`** — `converters/BandInfo.svelte` (206 Z.)
  Zeigt ITU/IEEE/NATO-Band für eine eingegebene Frequenz.
  Props: `frequencyHz?`

- **`[C-ATMINPUT]`** — `converters/AtmosphericInputs.svelte` (570 Z.)
  Eingabefelder für atmosphärische Bedingungen (Temperatur, Druck, Feuchte, Regen, Nebel, Schnee). Steuert den Store `[S-ATMO]`.

### Charts & Visualisierungen (10 Komponenten)

Interaktive D3.js- und Chart.js-Diagramme. Die größten Komponenten der App.

- **`[C-SPECTRUM]`** — `SpectrumOverview.svelte` (965 Z.)
  Das Hauptdiagramm: Vollständiges EM-Spektrum (ELF–Gamma), logarithmisch, mit Zoom/Pan und ITU/IEEE/NATO-Reihen.
  Props: `frequencyHz?`, `showLabels?`

- **`[C-ATTEN]`** — `charts/AttenuationChart.svelte` (663 Z.)
  Atmosphärische Dämpfungskurven (O₂-Peak bei 60 GHz, H₂O bei 22 GHz, Regen, Nebel, Schnee).
  Props: `frequencyGHz?`, `width?`, `height?`, `showPrecipitation?`

- **`[C-POWERDB]`** — `charts/PowerDbChart.svelte` (739 Z.)
  Scatter-Plot: Sendeleistung vs. Frequenz verschiedener HF-Systeme (Chart.js).

- **`[C-WATERFALL]`** — `charts/LinkBudgetWaterfall.svelte` (491 Z.)
  Wasserfall-Diagramm: Signalweg mit Gewinnen (grün) und Verlusten (rot).
  Props: `data?` — wird von `[C-LINKBUDGET]` befüllt.

- **`[C-BANDEXP]`** — `charts/FrequencyBandExplorer.svelte` (376 Z.)
  Interaktiver Bandexplorer mit Zoom/Pan und Bandstandard-Umschaltung.

- **`[C-APPOVER]`** — `charts/ApplicationOverlay.svelte` (426 Z.)
  Frequenzbänder nach Anwendungsbereich (Rundfunk, Mobilfunk, Radar, Satcom).

- **`[C-IONO]`** — `charts/IonosphericPropagation.svelte` (495 Z.)
  SVG-Visualisierung der Ionosphärenschichten (D/E/F1/F2) und Skip-Zonen.

- **`[C-WAVEPROP]`** — `charts/WavePropagationDiagram.svelte` (585 Z.)
  SVG-Diagramm der Ausbreitungsmodi (Bodenwelle, Raumwelle, Sichtwelle).

- **`[C-TIMELINE]`** — `charts/HistoricalTimeline.svelte` (416 Z.)
  Zeitleiste der Funktechnik (Marconi 1895 – 5G 2020).

### UI-Bausteine (5 Komponenten)

Wiederverwendbare Elemente, die an mehreren Stellen eingesetzt werden.

- **`[C-BREAD]`** — `ui/Breadcrumb.svelte` (159 Z.)
  Brotkrümel-Navigation. Props: `currentPath`

- **`[C-EXPORT]`** — `ui/ExportMenu.svelte` (331 Z.)
  Export-Menü: Charts als PNG oder PDF speichern (html2canvas + jsPDF).

- **`[C-TOOLTIP]`** — `ui/InfoTooltip.svelte` (288 Z.)
  Hover-Tooltip für technische Begriffserklärungen.

- **`[C-PROPMODE]`** — `ui/PropagationModeIndicator.svelte` (168 Z.)
  Badge, das den Ausbreitungsmodus einer Frequenz anzeigt.

- **`[C-TXDB]`** — `ui/TransmitterDatabase.svelte` (312 Z.)
  Such- und filterbare Sendertabelle.

---

## Logik & Daten

### Utility-Module (`src/lib/utils/`)

Zentrale Funktionen, die von allen Komponenten genutzt werden. Keine Duplikate in Komponenten erlaubt.

- **`[U-CALC]`** — `calculations.ts` — Kernberechnungen: FSPL, Wellenlänge, Reichweite
- **`[U-CONV]`** — `conversions.ts` — Einheitenumrechnung: Hz, Meter, dBm, Watt
- **`[U-FMT]`** — `formatting.ts` — Anzeigeformatierung: Frequenz, Distanz, Leistung, Dämpfung
- **`[U-HAND]`** — `handlers.ts` — Input-Parsing (`parseNumericInput`), sichere Mathematik (`safeDivide`, `safeLog`), `debounce`
- **`[U-ATMO]`** — `atmosphericAttenuation.ts` — ITU-R P.676/P.838/P.840: O₂, H₂O, Regen, Nebel, Schnee
- **`[U-CONST]`** — `constants.ts` — Lichtgeschwindigkeit (exakt und gerundet)

### Datendefinitionen (`src/lib/data/`)

Statische Daten, Konstanten und Presets. Keine Magic Numbers in Komponenten.

- **`[D-BANDS]`** — `bands.ts` — Banddefinitionen: IEEE, NATO, ITU, Zivil, deutsche Altbänder
- **`[D-UNITS]`** — `units.ts` — Einheiten-Definitionen für Frequenz, Distanz, Leistung, Wellenlänge
- **`[D-FREQBANDS]`** — `frequencyBands.ts` — Umfassende ITU-R Banddatenbank (1504 Z.) mit Eigenschaften und Anwendungen
- **`[D-SPECTRUM]`** — `spectrum.ts` — Spektrum-Grenzen, sichtbares Licht, Chart-Bereiche
- **`[D-CONST]`** — `constants.ts` — Physikalische Konstanten, Koeffizienten, Grenzwerte
- **`[D-PRESETS]`** — `presets.ts` — Voreinstellungen für FSPL, Link-Budget, Frequenzen
- **`[D-EXPLAIN]`** — `explanations.ts` — Deutsche Tooltiptexte und Formelerklärungen
- **`[D-PROP]`** — `propagation.ts` — Ausbreitungsmodi und ihre Charakteristiken
- **`[D-HIST]`** — `history.ts` — Meilensteine der Funktechnik
- **`[D-APPS]`** — `applications.ts` — Zuordnung Frequenz → Anwendung
- **`[D-TX]`** — `transmitters.ts` — Beispiel-Senderdaten

### Globale Stores (`src/lib/stores/`)

Anwendungsweiter Zustand mit Svelte 5 `$state` Runes.

- **`[S-LIGHT]`** — `speedOfLight.svelte.ts` — Umschaltbar: exaktes c (299.792.458 m/s) vs. gerundetes c (3 x 10⁸ m/s). Wird von allen Berechnungen gelesen.
- **`[S-ATMO]`** — `atmosphericParameters.svelte.ts` — Atmosphärische Bedingungen (Temperatur, Druck, Feuchte, Niederschlag). Wird von `[C-ATMINPUT]` geschrieben und von `[C-ATTEN]` gelesen.

---

## Wie die Teile zusammenspielen

### Datenfluss

```
Eingabe → [U-HAND] parst → [U-CALC]/[U-CONV]/[U-ATMO] berechnet
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                   [U-FMT]      [C-*CHART]     [S-LIGHT]
                   formatiert   visualisiert   [S-ATMO]
                   → Text       → SVG/Canvas   globaler Zustand
```

### Wer nutzt wen?

**Spektrum-Hauptseite `[R-SPEK]`** bindet 8 Komponenten ein:
`[C-FREQCONV]`, `[C-POWCONV]`, `[C-RANGE]`, `[C-BANDINFO]`, `[C-POWERDB]`, `[C-SPECTRUM]`, `[C-ATMINPUT]`, `[C-ATTEN]`

**Link-Budget-Seite `[R-LINK]`** koppelt zwei Komponenten:
`[C-LINKBUDGET]` berechnet → übergibt Daten an → `[C-WATERFALL]` visualisiert

**Store-Verbindungen:**
- `[S-LIGHT]` → wird gelesen von `[C-FSPL]`, `[C-FREQCONV]`, `[C-RANGE]` und allen Berechnungen, die `c` nutzen
- `[S-ATMO]` → geschrieben von `[C-ATMINPUT]`, gelesen von `[C-ATTEN]`

**Datenquellen:**
- `[D-BANDS]` → `[C-BANDINFO]`, `[C-SPECTRUM]`, `[C-BANDEXP]`
- `[D-PRESETS]` → `[C-FSPL]`, `[C-LINKBUDGET]`, `[C-FREQCONV]`
- `[D-CONST]` → alle Rechner
- `[D-UNITS]` → alle Konverter

---

## Tests (`src/tests/`)

Jedes Utility-Modul hat eine zugehörige Testdatei:

- **`[T-CALC]`** → testet `[U-CALC]` — FSPL, Wellenlänge, Reichweite
- **`[T-CONV]`** → testet `[U-CONV]` — Einheitenumrechnungen
- **`[T-FMT]`** → testet `[U-FMT]` — Formatierungsfunktionen
- **`[T-HAND]`** → testet `[U-HAND]` — Input-Parsing, safeDivide, safeLog
- **`[T-ATMO]`** → testet `[U-ATMO]` — Atmosphärische Dämpfungsmodelle

---

## Styling & Konfiguration

- **`[S-CSS]`** — `src/app.css` — Design-System mit CSS Custom Properties (Light/Dark-Theme, Farben, Typografie, Komponentenklassen)
- **`[CFG-SVELTE]`** — `svelte.config.js` — SvelteKit mit adapter-static
- **`[CFG-VITE]`** — `vite.config.ts` — Vite + Tailwind CSS
- **`[CFG-TEST]`** — `vitest.config.ts` — Testumgebung (jsdom)
- **`[CFG-TS]`** — `tsconfig.json` — TypeScript strict mode
- **`[CFG-PKG]`** — `package.json` — Abhängigkeiten und npm-Scripts

---

## ID-Schnellreferenz

| Prefix | Bedeutung | Beispiel |
|--------|-----------|----------|
| `R-` | Route / Seite | `[R-FSPL]` = FSPL-Rechnerseite |
| `C-` | Komponente | `[C-ATTEN]` = Dämpfungsdiagramm |
| `U-` | Utility-Modul | `[U-CALC]` = Berechnungsfunktionen |
| `D-` | Daten-Modul | `[D-BANDS]` = Banddefinitionen |
| `S-` | Store | `[S-ATMO]` = Atmosphären-Parameter |
| `T-` | Test | `[T-CALC]` = Tests für Berechnungen |
| `L-` | Layout | `[L-ROOT]` = Wurzel-Layout |
| `CFG-` | Konfiguration | `[CFG-PKG]` = package.json |
| `S-CSS` | Stylesheet | `[S-CSS]` = app.css Design-System |
