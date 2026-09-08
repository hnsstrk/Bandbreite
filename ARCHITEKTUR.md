# Bandbreite — Architektur & Elementreferenz

Gemeinsame Referenz zur eindeutigen Identifikation aller Elemente. Jedes Element hat eine **ID** in eckigen Klammern (z. B. `[C-FSPL]`), die wir zur Kommunikation verwenden. Bestehende IDs bleiben stabil, auch wenn eine Datei umgebaut wurde.

**Stand:** September 2026, nach dem Rework in zwei Wellen (siehe `docs/REWORK-2026-09.md`).
Zeilenzahlen sind per `wc -l` ermittelt und nur dort angegeben, wo sie eine Aussage tragen.

---

## Geschützte Kernelemente

Die folgenden fünf Komponenten sind die **Kernidee der Anwendung**. Sie dürfen **niemals** entfernt, ersetzt oder in ihrer Funktion verändert werden, ohne vorher explizit beim Benutzer nachzufragen.

- **`[C-SPECTRUM]`** — EM-Spektrum-Visualisierung (das Hauptdiagramm)
- **`[C-FREQCONV]`** — Frequenz ↔ Wellenlänge Konverter
- **`[C-POWCONV]`** — Leistungskonverter (W ↔ dBm)
- **`[C-RANGE]`** — Reichweitenrechner (TX/RX)
- **`[C-BANDINFO]`** — Bandzuordnung für Frequenzen

Diese Kombination — Spektrum oben, darunter die Werkzeuge — ist das Herzstück. Erweiterungen sind willkommen, aber der Kern bleibt unangetastet.

> **Offener Punkt `[C-BANDINFO]`:** Die Komponente `converters/BandInfo.svelte` existiert unverändert, ist aber derzeit in **keiner** Route eingebunden. Ihre Rolle auf `[R-SPEK]` übernimmt faktisch `[C-BANDSIDE]` (`BandDetailSidebar.svelte`), das dieselbe Information beim Klick auf ein Band anzeigt. Die Datei wurde bewusst **nicht** gelöscht — die Entscheidung (wieder einbinden, durch `[C-BANDSIDE]` ersetzen, oder beides nebeneinander) liegt beim Besitzer.

---

## Sitemap

Quelle der Wahrheit ist `NAV_TREE` in `[D-NAV]` (`src/lib/data/navigation.ts`). Alle Routen enden auf `/` (`trailingSlash: 'always'`), alle Seiten sind prerendered (`adapter-static`).

34 echte Seiten, dazu 3 Redirects.

```
bandbreite.online-resources.de
│
├── /                              308 → /spektrum/                        [R-HOME]
│
├── /spektrum/                     Spektrum-Dashboard (Kernseite)          [R-SPEK]
│   ├── /anwendungen/              Anwendungen im Spektrum                 [R-SPEK-APP]
│   ├── /sendeleistungen/          Sendeleistungen über der Frequenz       [R-SPEK-POW]
│   ├── /daempfung/                Atmosphärische Dämpfung                 [R-SPEK-DAEMPF]
│   ├── /ionosphaere/              Ionosphärische Ausbreitung              [R-SPEK-ION]
│   └── /explorer/                 308 → /spektrum/                        [R-SPEK-EXP]
│
├── /rechner/                      Rechner-Hub                             [R-RECH]
│   ├── /fspl/                     Freiraumdämpfung                        [R-FSPL]
│   ├── /link-budget/              Link-Budget-Analyse                     [R-LINK]
│   ├── /radar/                    Radar-Reichweite                        [R-RADAR]
│   ├── /kanalkapazitaet/          Kanalkapazität (Shannon-Hartley)        [R-KANAL]
│   ├── /skin-tiefe/               Skin-Tiefe                              [R-SKIN]
│   └── /fresnel/                  Fresnel-Zone                            [R-FRESN]
│
├── /konverter/                    Konverter-Hub                           [R-KONV]
│   └── /frequenz/                 Frequenz ↔ Wellenlänge                  [R-KONV-FREQ]
│
├── /wissen/                       Wissens-Hub                             [R-WISS]
│   ├── /wellenausbreitung/        Wellenausbreitung                       [R-WISS-WELL]
│   ├── /funktechnik/              Kapitel-Hub Funk & Fernmeldetechnik     [R-WISS-FUNK]
│   │   ├── /funkdienste/          ITU-Funkdienste und Frequenzplan        [R-WISS-FUNK-DIENST]
│   │   ├── /amateurfunk/          Bandplan, Klassen, Betriebsarten        [R-WISS-FUNK-AFU]
│   │   ├── /mobilfunk/            1G bis 6G, Bänder, Duplex               [R-WISS-FUNK-MOBIL]
│   │   ├── /rundfunk/             LW/MW/KW/UKW/DAB+/DVB-T2                [R-WISS-FUNK-RUND]
│   │   └── /notfrequenzen/        Not-, Anruf- und Sicherheitsfrequenzen  [R-WISS-FUNK-NOT]
│   ├── /modulation/               Analoge und digitale Modulation         [R-WISS-MOD]
│   ├── /antennen/                 Antennen-Grundlagen                     [R-WISS-ANT]
│   ├── /mathematik/               HF-Mathematik                           [R-WISS-MATH]
│   ├── /radar/                    Radar-Grundlagen                        [R-WISS-RAD]
│   └── /frequenzbaender/          308 → /datenbanken/frequenzbaender/     [R-WISS-FREQ]
│
├── /datenbanken/                  Datenbanken-Hub                         [R-DB]
│   ├── /frequenzbaender/          Bänder-Datenbank                        [R-DB-FREQ]
│   ├── /funkdienste/              Frequenzzuweisungen, filterbar          [R-DB-DIENST]
│   ├── /sender/                   Senderdatenbank                         [R-DB-SEND]
│   └── /historie/                 Fernmeldegeschichte                     [R-DB-HIST]
│
└── /service/                      Service-Hub                             [R-SERV]
    ├── /sitemap/                  Vollständige Sitemap                    [R-SERV-MAP]
    └── /quellen/                  Quellen, Stand, Unsicherheiten          [R-SERV-QUELL]
```

### Redirects

| alt | neu | Mechanismus |
|---|---|---|
| `/` | `/spektrum/` | `redirect(308)` in `src/routes/+page.ts` |
| `/spektrum/explorer/` | `/spektrum/` | `redirect(308)` — der Explorer ist im Dashboard aufgegangen |
| `/wissen/frequenzbaender/` | `/datenbanken/frequenzbaender/` | `redirect(308)` — Umzug in den Datenbank-Bereich |

### Was zeigen die Seiten?

**`[R-SPEK]` Spektrum-Dashboard** — Kernseite: `[C-SPECTRUM]`, `[C-FREQCONV]`, `[C-POWCONV]`, `[C-RANGE]`, `[C-BANDSIDE]`, `[C-RELTOP]`. Klick auf ein Band setzt die Frequenz für die Werkzeuge.

**Hub-Seiten** (`[R-RECH]`, `[R-KONV]`, `[R-WISS]`, `[R-DB]`, `[R-SERV]`, `[R-WISS-FUNK]`) — Kachelraster aus `getHubChildren()`; die Kacheln stammen also direkt aus `[D-NAV]` und laufen nie auseinander.

**Rechnerseiten** — jeweils `[C-HERO]` + Rechnerkomponente + `[C-RELTOP]`. Der Rechner hält seinen Zustand in der URL (`?f=…`), siehe `[U-URL]`.

**Wissen-Kapitel** — Inhalt liegt als Daten in `src/lib/content`. `[R-WISS-RAD]`, `[R-WISS-MATH]`, `[R-WISS-WELL]` und `[R-SPEK-ION]` rendern ihn vollständig über `[C-ARTLAY]` (die Routendatei ist zweistellig kurz); `[R-WISS-MOD]` und `[R-WISS-ANT]` setzen dieselben UI-Bausteine direkt zusammen, weil sie ihre Widgets frei zwischen den Abschnitten platzieren. Interaktive Widgets kommen über ihre ID aus `[C-WIDGREG]`.

**Datenbank-Seiten** — Tabelle plus Filter; die Daten kommen unverändert aus `src/lib/data`.

---

## Komponenten

Alle Komponenten liegen unter `src/lib/components/`. Pfadangaben sind relativ dazu.
Regel: **max. 300 Zeilen** je Komponente; Logik wandert in eine gleichnamige `.svelte.ts`.

### Spektrum (8 Komponenten + 2 Logikmodule)

Die Bausteine der Kernseite. Liegen aus historischen Gründen direkt in `components/`.

- **`[C-SPECTRUM]`** — `SpectrumOverview.svelte` (400 Z.) — **geschützt**
  Vollständiges EM-Spektrum (ELF–Gamma), logarithmisch, mit Zoom/Pan, Reihen für ITU/IEEE/NATO/Zivil und Marker.
  Props: `frequencyHz?`, `showLabels?`, `onBandClick?`, `selectedBandId?`
- **`[C-SPECSTATE]`** — `spectrumState.svelte.ts` (608 Z.)
  Zustand und Geometrie des Spektrums: Zoombereich, sichtbare Reihen, Skalenrechnung, Trefferermittlung.
- **`[C-SPECCTRL]`** — `SpectrumControls.svelte` — Bedienleiste (Reihen, Ansicht, Zoom, Sprünge).
- **`[C-SPECCUR]`** — `SpectrumCursor.svelte` — Fadenkreuz mit Frequenz- und Wellenlängenetikett.
- **`[C-SPECLEG]`** — `SpectrumLegend.svelte` — Legende der Bandreihen.
- **`[C-SPECTIP]`** — `SpectrumTooltip.svelte` — Tooltip am Band.
- **`[C-BANDSIDE]`** — `BandDetailSidebar.svelte` (255 Z.) · Logik `bandDetail.ts`
  Seitenleiste zum gewählten Band: Grenzen, Wellenlänge, Ausbreitung, Dienste, Anwendungen.
  Props: `frequencyHz?`, `selectedBand?`
- **`[C-BANDSERV]`** — `BandServiceList.svelte` — Dienste- und Anwendungsliste der Seitenleiste.
- **`[C-BANDTAGS]`** — `BandTagGroups.svelte` — Bandbezeichnungen (ITU/IEEE/NATO/Zivil) als Etikettengruppen.
- **`[C-BANDLOGIC]`** — `bandDetail.ts` — Aufbereitung der Banddaten (ohne DOM, getestet in `[T-BANDDET]`).

### Layout (8 Komponenten + 1 Logikmodul)

- **`[C-HEADER]`** — `layout/Header.svelte` (299 Z.)
  Kopfzeile: Logo, Mega-Menü-Auslöser, `[C-SEARCHTRIG]`, `[C-THEME]`, `[C-MOBILE]`.
  Props: `onsearch`
- **`[C-MEGA]`** — `layout/MegaMenu.svelte` — Aufklappmenü einer `NavGroup` aus `[D-NAV]`.
  Props: `group`, `open`, `onclose`
- **`[C-MOBILE]`** — `layout/MobileMenu.svelte` (177 Z.) — Schublade für schmale Viewports.
  Props: `open`, `close`, `onsearch`
- **`[C-MOBILEGRP]`** — `layout/MobileMenuGroup.svelte` — aufklappbare Gruppe innerhalb der Schublade.
- **`[C-PALETTE]`** — `layout/CommandPalette.svelte` (289 Z.)
  Command-Palette (Strg/⌘ + K): Volltextsuche über Seiten, Bänder, Dienste und Sender, dazu ein Frequenz-Modus („2,4 GHz" → passende Bänder, Dienste, Rechner-Deep-Links).
  Props: `open` (`$bindable`)
- **`[C-CMDLOGIC]`** — `layout/commandPalette.svelte.ts` — Trefferaufbereitung und Deep-Link-Ziele.
- **`[C-SEARCHTRIG]`** — `layout/SearchTrigger.svelte` — Schaltfläche/Feld, das die Palette öffnet. Props: `onopen`, `compact?`
- **`[C-THEME]`** — `layout/ThemeToggle.svelte` (136 Z.) — hell / dunkel / System, Präferenz in `localStorage`.
- **`[C-FOOTER]`** — `layout/Footer.svelte` (47 Z.) — Fußzeile.

### UI-Bibliothek (24 Komponenten + 3 Module)

Die Bausteine des Design-Systems. Details, Props-Tabellen und Beispiele: **`STYLE_GUIDE.md`**.
Regel: Diese Komponenten verwenden **nur Tokens**, keine festen Farbwerte.

| ID | Datei | Zweck | Wichtigste Props |
|---|---|---|---|
| `[C-ICON]` | `ui/Icon.svelte` | Strich-Icons aus `[C-ICONS]` (32 Namen), `stroke="currentColor"` | `name`, `size?`, `label?` |
| `[C-ICONS]` | `ui/icons.ts` | Icon-Katalog (Pfaddaten), Typ `IconName` | — |
| `[C-BTN]` | `ui/Button.svelte` | Schaltfläche oder Link | `variant?`, `size?`, `href?`, `icon?`, `pressed?`, `loading?` |
| `[C-BADGE]` | `ui/Badge.svelte` | Statusetikett | `tone?`, `variant?`, `dot?`, `icon?` |
| `[C-CARD]` | `ui/Card.svelte` | Karte, optional verlinkt | `title?`, `subtitle?`, `href?`, `icon?`, `tone?`, `muted?` |
| `[C-SECHEAD]` | `ui/SectionHeader.svelte` | Abschnittsüberschrift mit Anker | `title`, `level?`, `id?`, `eyebrow?`, `description?` |
| `[C-CALLOUT]` | `ui/Callout.svelte` | Hinweis-, Warn-, Formelkasten | `tone?`, `title?`, `source?`, `collapsible?` |
| `[C-SELECT]` | `ui/Select.svelte` | Auswahlfeld | `label?`, `value`, `options`, `error?`, `onchange?` |
| `[C-SLIDER]` | `ui/Slider.svelte` | Schieberegler, linear oder logarithmisch | `label`, `value`, `min`, `max`, `scale?`, `format?` |
| `[C-NUMIN]` | `ui/NumberInput.svelte` | Zahlenfeld mit Einheitenwahl, Regler und Presets | `label`, `value`, `unit?`, `units?`, `min?`, `max?`, `slider?`, `presets?` |
| `[C-NUMLOGIC]` | `ui/numberInput.svelte.ts` | Parsen, Skalen, Grenzwertprüfung für `[C-NUMIN]` | — |
| `[C-TABS]` | `ui/Tabs.svelte` | Reiterleiste mit Panel-Snippet | `tabs`, `active`, `panel`, `variant?` |
| `[C-RESULT]` | `ui/ResultCard.svelte` | Ergebnisanzeige mit Kopierfunktion | `label`, `value`, `unit?`, `tone?`, `emphasis?`, `copyable?` |
| `[C-FORMULA]` | `ui/FormulaBlock.svelte` | Formel als Unicode oder MathML, mit Zeichenlegende | `formula?`, `math?`, `alt?`, `variables?` |
| `[C-HERO]` | `ui/PageHero.svelte` | Seitenkopf: Kicker, Titel, Lead, Metadaten, Aktionen | `title`, `lead?`, `kicker?`, `icon?`, `meta?` |
| `[C-TOC]` | `ui/TableOfContents.svelte` | Sticky-Inhaltsverzeichnis mit Scrollspy | `items`, `sticky?`, `compactBelow?` |
| `[C-GOALS]` | `ui/LearningGoals.svelte` | Lernziel-Block eines Kapitels | `goals`, `title?`, `level?` |
| `[C-RELLINK]` | `ui/RelatedLinks.svelte` | Freie Linkliste als Karten oder Liste | `items`, `layout?`, `columns?` |
| `[C-RELTOP]` | `ui/RelatedTopics.svelte` | „Verwandte Themen" aus `[D-REL]` — kein Handpflege-Markup | `href`, `title?`, `max?` |
| `[C-BREAD]` | `ui/Breadcrumb.svelte` | Brotkrümel aus `getBreadcrumbs()` | `currentPath` |
| `[C-META]` | `ui/Metadata.svelte` | Einzige Stelle für `<head>`: Titel, Description, canonical, og/twitter, JSON-LD-Breadcrumbs | `title?`, `description?`, `image?` |
| `[C-TOOLTIP]` | `ui/InfoTooltip.svelte` | Begriffserklärung aus `[D-EXPLAIN]` | `title`, `short`, `detailed?` |
| `[C-PROPMODE]` | `ui/PropagationModeIndicator.svelte` | Badge „Bodenwelle / Raumwelle / Sichtverbindung" | `frequencyHz`, `showLabel?` |
| `[C-TXDB]` | `ui/TransmitterDatabase.svelte` (224 Z.) | Senderdatenbank: Suche, Filter, Sortierung | `onSelectFrequency?` |
| `[C-TXFILT]` | `ui/TransmitterFilters.svelte` | Filterleiste zu `[C-TXDB]` | `query`, `group`, `subtype`, `sortKey`, … |
| `[C-TXDET]` | `ui/TransmitterDetails.svelte` | Detailkarte eines Senders | `transmitter`, `onclose` |
| `[C-TXLOGIC]` | `ui/transmitterDatabase.svelte.ts` | Filter- und Sortierlogik (testbar, ohne DOM) | — |

### Rechner (17 Komponenten + 7 Logikmodule)

Jeder Rechner besteht aus einer schlanken Hauptkomponente, Eingabe-/Ergebnis-Unterkomponenten und einem Logikmodul `<name>.svelte.ts`, das Parameter-Spezifikation (`*_PARAMS`), Presets, Grenzwerte und die reine Rechenkette enthält. Die Logikmodule sind ohne DOM testbar (`[T-CALCLOGIC]`).

- **`[C-FSPL]`** — `calculators/FSPLCalculator.svelte` (243 Z.) · Logik `fspl.svelte.ts`
  Freiraumdämpfung; Diagramm `[C-FSPLCHART]` mit Mehrfrequenz-Vergleich.
  Props: `height?` · URL: `?f` (Hz), `?d` (m), `?multi`
- **`[C-LINKBUDGET]`** — `calculators/LinkBudgetCalculator.svelte` (285 Z.) · Logik `linkBudget.svelte.ts`
  Sender-, Pfad- und Empfängerabschnitt (`[C-LBTX]`, `[C-LBPATH]`, `[C-LBRX]`), Ergebnis `[C-LBRES]`, Visualisierung `[C-WATERFALL]`. Erde–Raum-Pfad mit Elevationswinkel.
  Props: keine · URL: `?pt,gt,lt,d,f,gr,lr,s,fade,misc,atm,path,el`
- **`[C-RADAR]`** — `calculators/RadarRangeCalculator.svelte` (154 Z.) · Logik `radarRange.svelte.ts`
  Radargleichung mit Systemverlusten; Eingaben `[C-RADARIN]`, Ergebnisse `[C-RADAROUT]`, Impulsparameter `[C-RADARPULSE]` (Doppler, Auflösung, eindeutige Entfernung).
  Props: keine · URL: `?f,pt,g,rcs,smin,l`
- **`[C-CHANNEL]`** — `calculators/ChannelCapacityCalculator.svelte` (155 Z.) · Logik `channelCapacity.svelte.ts`
  Shannon-Hartley; Ergebnisse `[C-CAPRES]`, Diagramm `[C-SHANNON]`.
  Props: `height?` · URL: `?b` (Hz), `?snr` (dB)
- **`[C-SKIN]`** — `calculators/SkinDepthCalculator.svelte` (223 Z.) · Logik `skinDepth.svelte.ts`
  Skin-Tiefe mit Gültigkeitsprüfung der Guter-Leiter-Näherung; Ergebnisse `[C-SKINRES]`, Diagramm `[C-SKINCHART]`.
  Props: `height?` · URL: `?f,sigma,eps`
- **`[C-FRESNEL]`** — `calculators/FresnelZoneCalculator.svelte` (232 Z.) · Logik `fresnelZone.svelte.ts`
  Fresnel-Radius, Hindernisfreiheit und Messerschneiden-Dämpfung; Diagramm `[C-FRESDIAG]`.
  Props: `height?` · URL: `?f,d,o`
- **`[C-CALCACT]`** — `calculators/CalculatorActions.svelte` — „Link kopieren" und „Zurücksetzen".
  Props: `shareLink`, `canReset?`, `onreset`
- **`[C-PRESETCHIP]`** — `calculators/PresetChips.svelte` · Logik `presetChips.svelte.ts` — Preset-Leiste.
  Props: `label`, `presets`, `value`, `onselect`

Unterkomponenten: `[C-LBTX]` `LinkBudgetTxSection`, `[C-LBPATH]` `LinkBudgetPathSection`, `[C-LBRX]` `LinkBudgetRxSection`, `[C-LBRES]` `LinkBudgetResults`, `[C-RADARIN]` `RadarRangeInputs`, `[C-RADAROUT]` `RadarRangeResults`, `[C-RADARPULSE]` `RadarPulseParameters`, `[C-CAPRES]` `ChannelCapacityResults`, `[C-SKINRES]` `SkinDepthResults`.

### Konverter (7 Komponenten + 1 Logikmodul)

- **`[C-FREQCONV]`** — `converters/FrequencyConverter.svelte` (366 Z.) — **geschützt**
  Frequenz ↔ Wellenlänge mit Presets und automatischer Einheitenwahl.
  Props: `frequencyHz?` (`$bindable`)
- **`[C-POWCONV]`** — `converters/PowerConverter.svelte` (178 Z.) — **geschützt**
  W ↔ mW ↔ dBm ↔ dBW. Props: `powerWatt?` (`$bindable`)
- **`[C-RANGE]`** — `converters/RangeCalculator.svelte` (206 Z.) — **geschützt**
  TX-Leistung + RX-Empfindlichkeit → theoretische Reichweite. Props: `frequencyHz`
- **`[C-BANDINFO]`** — `converters/BandInfo.svelte` (206 Z.) — **geschützt**, derzeit nicht eingebunden (siehe oben). Props: `frequencyHz?`
- **`[C-ATMINPUT]`** — `converters/AtmosphericInputs.svelte` (28 Z.) · Logik `atmosphericInputs.svelte.ts`
  Reiter-Rahmen für die Atmosphärenparameter; schreibt `[S-ATMO]`.
- **`[C-ATMTAB]`** — `converters/AtmosphericTab.svelte` — Temperatur, Druck, Wasserdampfdichte.
- **`[C-PRECTAB]`** — `converters/PrecipitationTab.svelte` — Regen, Nebel, Schnee, Polarisation, Elevation.

### Charts & Visualisierungen (26 Komponenten + 8 Datenmodule)

Reines D3 (`scaleLog`, `scaleLinear`, `line`, …) plus eigenes SVG. Alle Diagramme sitzen in `[C-CHARTFRAME]`, messen ihre Breite selbst und liefern eine `sr-only`-Datentabelle. Serienfarben kommen aus Tokens, nicht aus Hex-Werten. Die Datenaufbereitung liegt jeweils in einem `*Data.ts` neben der Komponente und ist ohne DOM testbar.

- **`[C-CHARTFRAME]`** — `charts/ChartFrame.svelte` (174 Z.)
  Rahmen für alle Diagramme: Titel, Legende, horizontales Scrollen unter `minWidth`, Fußnote, Datentabelle für Screenreader.
  Props: `title?`, `level?`, `description` (Pflicht), `width?` (`$bindable`), `minWidth?`, `legend?`, `dataTable?`, `footnote?`, `actions?`
- **`[C-ATTEN]`** — `charts/AttenuationChart.svelte` (295 Z.) · `attenuationChartData.ts`
  Atmosphärische Dämpfung nach ITU-R P.676-13 (line-by-line), P.838-3, P.840. Legende `[C-ATTLEG]`, Tabelle `[C-ATTTAB]`, Tooltip `[C-ATTTIP]`.
  Props: `frequencyGHz?`, `width?`, `height?`, `showPrecipitation?`, `title?`
- **`[C-POWERDB]`** — `charts/PowerDbChart.svelte` (287 Z.) · `powerDbData.ts`
  Sendeleistung über Frequenz (D3, **nicht** Chart.js). Bedienung `[C-POWCTRL]`, Legende `[C-POWLEG]`, Tabelle `[C-POWTAB]`, Tooltip `[C-POWTIP]`.
  Props: `width?`, `height?`
- **`[C-FSPLCHART]`** — `charts/FSPLChart.svelte` (279 Z.) · `fsplChartData.ts`
  FSPL über Distanz, optional mehrere Frequenzen.
  Props: `frequencyHz`, `distanceM`, `fsplDb`, `showMultipleFrequencies?`, `width?`, `height?`
- **`[C-WATERFALL]`** — `charts/LinkBudgetWaterfall.svelte` (289 Z.) · `waterfallData.ts`
  Wasserfall: Gewinne und Verluste entlang des Signalwegs. Props: `data`, `width?`, `height?`
- **`[C-SHANNON]`** — `charts/ShannonLimitChart.svelte` (215 Z.) — Shannon-Grenze über SNR. Props: `snrDb`, `spectralEfficiency`
- **`[C-SKINCHART]`** — `charts/SkinDepthChart.svelte` (229 Z.) — Skin-Tiefe über Frequenz je Medium. Props: `frequencyHz`, `skinDepthM`
- **`[C-FRESDIAG]`** — `charts/FresnelZoneDiagram.svelte` (261 Z.) — Schnitt durch die Fresnel-Zone mit Hindernis. Props: `wavelengthM`, `totalDistanceM`, `obstaclePositionM`, `maxFresnelRadiusM`
- **`[C-APPOVER]`** — `charts/ApplicationOverlay.svelte` (288 Z.) · `applicationOverlayData.ts`
  Anwendungsbänder über dem Spektrum; Detailkarte `[C-APPDET]`. Props: `width?`, `height?`, `minFrequencyHz?`, `maxFrequencyHz?`
- **`[C-IONO]`** — `charts/IonosphericPropagation.svelte` (243 Z.) · `ionosphericData.ts`
  Ionosphärenschichten, MUF/LUF, Skip-Zone; Bühne `[C-IONOSCENE]`. Auch als Widget `ionospheric-propagation` registriert.
- **`[C-WAVEPROP]`** — `charts/WavePropagationDiagram.svelte` (115 Z.) · `wavePropagationData.ts`
  Ausbreitungsmodi; Bedienung `[C-WPCTRL]`, Bühne `[C-WPSCENE]`, Pfade `[C-WPPATH]`, Legende `[C-WPLEG]`. Auch als Widget `wave-propagation-diagram` registriert.
- **`[C-TIMELINE]`** — `charts/HistoricalTimeline.svelte` (277 Z.) · `timelineData.ts`
  Zeitleiste aller Meilensteine aus `[D-HIST]`; Detailpanel `[C-TIMEDET]`.

Unterkomponenten: `[C-ATTLEG]` `AttenuationLegend`, `[C-ATTTAB]` `AttenuationTable`, `[C-ATTTIP]` `AttenuationTooltip`, `[C-POWCTRL]` `PowerDbControls`, `[C-POWLEG]` `PowerDbLegend`, `[C-POWTAB]` `PowerDbTable`, `[C-POWTIP]` `PowerDbTooltip`, `[C-APPDET]` `ApplicationDetails`, `[C-IONOSCENE]` `IonosphericScene`, `[C-WPCTRL]` `WavePropagationControls`, `[C-WPSCENE]` `WavePropagationScene`, `[C-WPPATH]` `WavePropagationPaths`, `[C-WPLEG]` `WavePropagationLegend`, `[C-TIMEDET]` `TimelineEventDetails`.

### Funk & Fernmeldetechnik (12 Komponenten + 7 Logikmodule)

Fachliche Bausteine der Kapitel unter `[R-WISS-FUNK]` und der Funkdienst-Datenbank. Alle Balkendarstellungen sind **HTML/CSS statt SVG**: Die Segmente sind echte `<button>`-Elemente mit `aria-pressed` und vorgelesenem Frequenzbereich. Die Filter- und Skalenlogik liegt in `.svelte.ts`-Modulen und ist ohne DOM getestet.

- **`[C-SERVBAR]`** — `funk/ServiceSpectrumBar.svelte` (264 Z.) · `serviceSpectrum.svelte.ts`, `spectrumScale.svelte.ts`
  Spektrumleiste der ITU-Funkdienste; Detailpanel `[C-SERVDET]`.
- **`[C-AFUPLAN]`** — `funk/AmateurBandplan.svelte` (258 Z.) · `amateurBandplan.svelte.ts`
  Bandplan der 22 Amateurfunkbänder mit Betriebsartensegmenten und Klassenfilter; Legende `[C-MODELEG]`.
- **`[C-MOBGEN]`** — `funk/MobileGenerations.svelte` — 1G bis 6G als Vergleichskarten.
- **`[C-MOBTAB]`** — `funk/MobileBandTable.svelte` · `mobileBands.svelte.ts` — Bandtabelle mit Uplink/Downlink und Duplexart.
- **`[C-DATARATE]`** — `funk/DataRateCalculator.svelte` — Datenrate aus Bandbreite, Modulation, MIMO-Strömen.
- **`[C-CHANCONV]`** — `funk/ChannelConverter.svelte` · `broadcastChannels.svelte.ts` — Kanal ↔ Frequenz für DAB-Blöcke, DVB-T2-Kanäle und UKW.
- **`[C-SWTAB]`** — `funk/ShortwaveTable.svelte` — Kurzwellen-Rundfunkbänder.
- **`[C-EMTAB]`** — `funk/EmergencyTable.svelte` (221 Z.) · `emergencyFilter.svelte.ts` — Not-, Anruf- und Sicherheitsfrequenzen, filterbar nach Bereich und Zweck.
- **`[C-APPDB]`** — `funk/ApplicationDatabase.svelte` (261 Z.) · `applicationFilter.svelte.ts`
  Datenbank der Frequenzzuweisungen: Volltext, Kategorie, Region, Frequenzbereich; Detailpanel `[C-APPPANEL]`.
- **`[C-SERVDET]`** — `funk/ServiceDetailPanel.svelte` — Props: `service`, `groupLabel`
- **`[C-APPPANEL]`** — `funk/ApplicationDetailPanel.svelte` — Props: `application`
- **`[C-MODELEG]`** — `funk/ModeLegend.svelte` — Legende der Betriebsarten.

> Die früheren Zweitfassungen `funk/ArticleLayout.svelte` und `funk/ContentSection.svelte` sind entfallen: Die Funktechnik-Kapitel werden von den Kapitelkomponenten unter `knowledge/` gerendert, `content/funktechnik/adapt.ts` übersetzt ihr Blockmodell auf das kanonische Modell aus `content/types.ts`. In `funk/` liegen ausschließlich fachliche Bausteine.

### Wissen-Kapitel: Renderer (7 Komponenten + 2 Module)

Generischer Renderer für alle Kapitel. Der Inhalt ist Daten (`src/lib/content`), nicht Markup.

- **`[C-ARTLAY]`** — `knowledge/ArticleLayout.svelte` (191 Z.)
  Kapitelrahmen: `[C-HERO]`, `[C-GOALS]`, Sticky-`[C-TOC]`, Abschnitte, Quellen, `[C-ARTPAG]`, `[C-RELTOP]`.
  Zwei Betriebsarten: **Datenbetrieb** mit `article` (Inhaltsverzeichnis wird abgeleitet) oder **Markup-Betrieb** mit `children` + `toc`, wenn Widgets frei zwischen den Abschnitten stehen.
  Props: `article?`, `children?`, `href?`, `title?`, `kicker?`, `lead?`, `icon?`, `meta?`, `goals?`, `toc?`, `sources?`, `pagination?`
- **`[C-ARTSEC]`** — `knowledge/ArticleSection.svelte` — ein Abschnitt samt Unterabschnitten. Props: `section`, `level?`
- **`[C-ARTBLOCK]`** — `knowledge/ArticleBlock.svelte` — bildet einen Blocktyp auf die UI-Komponente ab (Absatz, Liste, Formel, Callout, Tabelle, Definitionen, Karten, Widget, Frage). Props: `block`, `level`
- **`[C-ARTTAB]`** — `knowledge/ArticleTable.svelte` — Tabellenblock mit `.table-scroll`. Props: `block`
- **`[C-ARTCARDS]`** — `knowledge/ArticleCards.svelte` — Kartenblock. Props: `block`, `level`
- **`[C-ARTPAG]`** — `knowledge/ArticlePagination.svelte` — Zurück/Weiter aus den Geschwisterknoten in `[D-NAV]`. Props: `href`
- **`[C-WIDGFRAME]`** — `knowledge/WidgetFrame.svelte` (181 Z.)
  Einheitlicher Rahmen für alle interaktiven Widgets: Bühne, Reglerspalte, Ergebnisspalte, Play/Pause, Hinweis bei reduzierter Bewegung, `sr-only`-Datentabelle, Fußnote.
  Props: `title`, `description`, `playable?`, `playing?`, `reducedMotion?`, `ontoggle?`, `controls?`, `results?`, `dataTable?`, `footnote?`, `stacked?`, `interactive?`
- **`[C-WIDGREG]`** — `knowledge/widgetRegistry.ts` — `WIDGETS: Record<WidgetId, Component>`; Inhalte referenzieren nur die ID.
- **`[C-ANIMLOOP]`** — `knowledge/animationLoop.svelte.ts` — Klasse `AnimationLoop`: `requestAnimationFrame`-Schleife, die bei `prefers-reduced-motion`, verborgenem Tab oder Pause anhält.

### Interaktive Widgets (16 Komponenten + 9 Rechenmodelle)

Jedes Widget besteht aus einem reinen Rechenmodell (`*Model.ts` / `*Options.ts`, ohne DOM, getestet) und einer Komponente, die `[C-WIDGFRAME]` füllt.

| ID | Komponente | Modell | Kapitel |
|---|---|---|---|
| `[C-W-RADAR]` | `widgets/RadarPulseWidget.svelte` | `RadarPulseModel.ts` | `[R-WISS-RAD]` |
| `[C-W-DOPPLER]` | `widgets/DopplerWidget.svelte` | `DopplerModel.ts` | `[R-WISS-RAD]` |
| `[C-W-RCS]` | `widgets/RcsComparisonWidget.svelte` | `RcsComparisonModel.ts` | `[R-WISS-RAD]` |
| `[C-W-FRESNEL]` | `widgets/FresnelWidget.svelte` | `FresnelModel.ts` | `[R-WISS-WELL]` |
| `[C-W-DB]` | `widgets/DecibelPlayground.svelte` | `DecibelModel.ts` | `[R-WISS-MATH]` |
| `[C-W-ATTWIN]` | `widgets/AttenuationWindowsWidget.svelte` | `AttenuationWindowsModel.ts` | `[R-WISS-WELL]` |
| `[C-W-PROP]` | `widgets/PropagationSandbox.svelte` | `PropagationModel.ts` | `[R-WISS-WELL]`, `[R-WISS-MATH]`, `[R-SPEK-ION]` |
| `[C-W-MOD]` | `widgets/ModulationVisualizer.svelte` (298 Z.) | `ModulationOptions.ts`, `[U-MODMATH]` | `[R-WISS-MOD]` |
| `[C-W-MODWAVE]` | `widgets/ModulationWaveforms.svelte` | — (Bühne von `[C-W-MOD]`) | `[R-WISS-MOD]` |
| `[C-W-MODSPEC]` | `widgets/ModulationSpectrum.svelte` | — (Bühne von `[C-W-MOD]`) | `[R-WISS-MOD]` |
| `[C-W-CONST]` | `widgets/ConstellationDiagram.svelte` (237 Z.) | `[U-MODMATH]` | `[R-WISS-MOD]` |
| `[C-W-CARSON]` | `widgets/CarsonCalculator.svelte` | `[D-MODUL]` | `[R-WISS-MOD]` |
| `[C-W-POLAR]` | `widgets/AntennaPolarPattern.svelte` (256 Z.) | `AntennaPatternOptions.ts`, `[U-ANTMATH]` | `[R-WISS-ANT]` |
| `[C-W-POLARPLOT]` | `widgets/AntennaPolarPlot.svelte` | — (Bühne von `[C-W-POLAR]`) | `[R-WISS-ANT]` |
| `[C-W-PARAB]` | `widgets/ParabolicGainCalculator.svelte` | `[U-ANTMATH]`, `[D-ANT]` | `[R-WISS-ANT]` |
| `[C-W-SWR]` | `widgets/SwrWidget.svelte` | `[U-ANTMATH]` | `[R-WISS-ANT]` |

Die sieben in `[C-WIDGREG]` registrierten IDs sind: `radar-pulse`, `doppler`, `rcs-comparison`, `fresnel`, `decibel`, `attenuation-windows`, `propagation-sandbox`, dazu `wave-propagation-diagram` und `ionospheric-propagation` aus `charts/`.

---

## Datenmodule (`src/lib/data/`, 22 Dateien)

Statische Daten, Konstanten und Presets. Frequenzen durchgängig als Zahl **in Hertz**. Keine Magic Numbers in Komponenten. Herkunft und Unsicherheiten: `docs/DATENQUELLEN.md` und `[R-SERV-QUELL]`.

| ID | Datei | Wichtigste Exporte | Umfang |
|---|---|---|---|
| `[D-NAV]` | `navigation.ts` | `NAV_TREE`, `NAV_GROUPS`, `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `pageMeta()`, `findNode()`, `getBreadcrumbs()`, `getHubChildren()`, `getSiblings()`, `getLiveNodes()`, `normalizeHref()`, `flattenNav()`, `isActivePath()` | 34 Knoten, 5 Menügruppen |
| `[D-REL]` | `relations.ts` | `RELATIONS`, `getRelatedTopics()` | 34 Quellseiten mit je 3–6 Verweisen, Rückverweise zur Laufzeit |
| `[D-SEARCH]` | `searchIndex.ts` | `SEARCH_INDEX`, `LIVE_SEARCH_INDEX`, `SEARCH_GROUPS` | 271 Einträge in 6 Gruppen |
| `[D-BANDS]` | `bands.ts` | `ITU_BANDS` (12), `IEEE_BANDS` (12), `NATO_BANDS` (15), `CIVILIAN_BANDS` (43), `DE_ALT_BANDS` (10), `US_ALT_BANDS` (11), `EU_NATO_BANDS` (13), `EM_BANDS` (7), `ALL_BANDS`, `getBandsForFrequency()` | 123 Bänder gesamt |
| `[D-FREQBANDS]` | `frequencyBands.ts` | `ITU_FREQUENCY_BANDS` (12), `IEEE_FREQUENCY_BANDS` (13), `NATO_FREQUENCY_BANDS` (15), `AMATEUR_FREQUENCY_BANDS` (15), `BROADCAST_FREQUENCY_BANDS` (17), `ALL_FREQUENCY_BANDS`, `FREQUENCY_LIMITS`, `getBandByFrequency()`, `searchBands()` | 72 Bänder mit Eigenschaften und Anwendungen (1504 Z.) |
| `[D-SPECTRUM]` | `spectrum.ts` | `SPECTRUM_MIN_HZ`, `SPECTRUM_MAX_*`, `VISIBLE_LIGHT`, `EM_BANDS` (7), `CHART_*_RANGES` | Spektrumgrenzen und Chart-Bereiche |
| `[D-CONST]` | `constants.ts` | `SPEED_OF_LIGHT`, `BOLTZMANN_CONSTANT`, `EARTH_RADIUS_*`, `IONOSPHERIC_LAYERS` (4), `ATMOSPHERIC_ABSORPTION_PEAKS` (5), `ATMOSPHERIC_WINDOWS`, `SEAWATER_PENETRATION` (6), `RAIN_RATES`, `RCS_REFERENCE` (12), `MODULATION_SCHEMES` (7), `NOISE_TEMPERATURES`, `THERMAL_NOISE` | 667 Z. |
| `[D-UNITS]` | `units.ts` | `FREQUENCY_UNITS`, `WAVELENGTH_UNITS`, `POWER_UNITS_WATT`, `POWER_UNITS_DB`, `DISTANCE_UNITS`, `ATTENUATION_UNITS`, `FREQUENCY_FACTORS`, `WAVELENGTH_FACTORS`, `POWER_FACTORS`, `DISTANCE_FACTORS`, `getUnitById()` | einzige Quelle der Umrechnungsfaktoren |
| `[D-PRESETS]` | `presets.ts` | `FREQUENCY_CONVERTER_PRESETS` (4), `FSPL_FREQUENCY_PRESETS` (9), `FSPL_CHART_FREQUENCIES` (6), `DISTANCE_PRESETS_METERS` (7), `LINK_BUDGET_PRESETS` (6), `POWER_CHART_CATEGORY_*` | — |
| `[D-EXPLAIN]` | `explanations.ts` | 23 `Explanation`-Objekte plus die Sammlungen `fsplExplanations`, `linkBudgetExplanations`, `bandExplanations`, `atmosphericExplanations`, `spectrumExplanations` | Tooltiptexte |
| `[D-PROP]` | `propagation.ts` | `PROPAGATION_MODES` (5), `FREQUENCY_BAND_PROPAGATION` (6), `LAYER_VISUALIZATIONS` (4), `PROPAGATION_SCENARIOS` (5), `MUF_FACTORS`, `calculateRadioHorizon()`, `calculateSkipDistance()`, `estimateMUF()`, `calculateCriticalFrequency()` | 668 Z. |
| `[D-ITU676]` | `itu676Lines.ts` | `O2_LINES` (44), `H2O_LINES` (35) | Linienkatalog ITU-R P.676-13 Annex 1 |
| `[D-APPS]` | `applications.ts` + `applications.json` | `ALL_APPLICATIONS`, 12 Kategorielisten, `APPLICATIONS_BY_CATEGORY`, `CATEGORY_NAMES`, `getApplicationsForFrequency()` | 105 Frequenzzuweisungen |
| `[D-TX]` | `transmitters.ts` + `transmitters.json` | `ALL_TRANSMITTERS`, `TIME_SIGNAL_TRANSMITTERS` (12), `BROADCAST_TRANSMITTERS` (8), `NAVIGATION_TRANSMITTERS` (6), `SCIENCE_TRANSMITTERS` (5), `AMATEUR_TRANSMITTERS` (3), `UTILITY_TRANSMITTERS` (3), `searchTransmitters()` | 37 Sender |
| `[D-SERVICES]` | `radioServices.ts` | `RADIO_SERVICES`, `RADIO_SERVICE_GROUP_LABELS` (9), `getServicesForFrequency()` | 18 Funkdienste mit 79 Zuweisungen |
| `[D-AFU]` | `amateurBands.ts` | `AMATEUR_BANDS`, `POWER_CLASS_A_W`, `POWER_CLASS_E_W`, `POWER_CLASS_N_EIRP_W`, `getBandsForLicenseClass()` | 22 Bänder (2200 m – 1,2 cm) mit 86 Segmenten |
| `[D-MOBILE]` | `mobileNetworks.ts` | `MOBILE_GENERATIONS` (6), `MOBILE_BANDS` (13), `getMobileBandsForFrequency()` | 1G–6G, B28/n28 … n260 |
| `[D-BROADCAST]` | `broadcast.ts` | `BROADCAST_RANGES` (3), `SHORTWAVE_BANDS` (15), `DAB_BLOCKS` (32), `DVBT2_CHANNELS` (28), `SATELLITE_TV_BANDS` (4), `getDabBlockRange()`, `getDvbT2ChannelRange()` | Kanalraster und Bandgrenzen |
| `[D-EMERG]` | `emergencyFrequencies.ts` | `EMERGENCY_FREQUENCIES`, `getEmergencyFrequenciesByDomain()`, `findEmergencyFrequenciesNear()` | 27 Einträge (See, Luft, Land, Satellit, Amateur, Jedermann) |
| `[D-MODUL]` | `modulation.ts` | `MODULATIONS`, `carsonBandwidthHz()`, `fmModulationIndex()`, `bitsPerSymbol()`, `spreadingGainDb()` | 16 Verfahren (AM … LoRa/CSS) |
| `[D-ANT]` | `antennas.ts` | `ANTENNA_TYPES`, `GAIN_DIPOLE_DBI`, `parabolicGainDbi()`, `arrayGainDbi()`, `dbdToDbi()` | 10 Antennentypen |
| `[D-HIST]` | `history.ts` | `HISTORICAL_EVENTS`, `CATEGORY_CONFIG` (8) | 48 Meilensteine |

---

## Content-Module (`src/lib/content/`, 15 Dateien)

Die Wissen-Kapitel halten ihren Text **als Daten**, nicht im Markup. Das hält die Routen klein (`/wissen/radar/+page.svelte` sind 11 Zeilen), macht Struktur und Anker testbar (`[T-FUNKINH]`) und lässt jeden Abschnitt von denselben Komponenten rendern.

| ID | Datei | Export | Umfang |
|---|---|---|---|
| `[K-TYPES]` | `types.ts` | `KnowledgeArticle`, `ArticleSection`, `ArticleBlock` (paragraph, list, formula, callout, table, definitions, cards, widget, question), `WidgetId` | kanonisches Kapitelmodell |
| `[K-RADAR]` | `radar.ts` | `radarArticle` | 7 Abschnitte, Widgets `radar-pulse`, `rcs-comparison`, `doppler` |
| `[K-WELL]` | `wellenausbreitung.ts` | `wellenausbreitungArticle` | 8 Abschnitte, Widgets `wave-propagation-diagram`, `propagation-sandbox`, `fresnel`, `attenuation-windows` |
| `[K-MATH]` | `mathematik.ts` | `mathematikArticle` | 6 Abschnitte, Widgets `decibel`, `propagation-sandbox` |
| `[K-ION]` | `ionosphaere.ts` | `ionosphaereArticle` | 5 Abschnitte, Widgets `ionospheric-propagation`, `propagation-sandbox` |
| `[K-MOD]` | `modulation.ts` | `MODULATION_GOALS` (6), `MODULATION_TOC` (10), `MODULATION_TEXT`, `MODULATION_FORMULAS`, `MODULATION_CLASS_LABELS` | Text und Formeln für `[R-WISS-MOD]` |
| `[K-ANT]` | `antennen.ts` | `ANTENNA_GOALS` (6), `ANTENNA_TOC` (8), `ANTENNA_TEXT`, `ANTENNA_FORMULAS`, `ANTENNA_CATEGORY_LABELS` | Text und Formeln für `[R-WISS-ANT]` |
| `[K-FUNKTYPES]` | `funktechnik/types.ts` | `ContentBlock` (p, ul, ol, dl, callout, formula, table), `ArticleSection`, `tocItems()`, `findSection()`, `sectionIds()` | knapperes Blockmodell der Funktechnik-Kapitel |
| `[K-FUNKADAPT]` | `funktechnik/adapt.ts` | `toArticleBlock()`, `toArticleSection()`, `articleSections()`, `articleSection()` | Brücke auf `[K-TYPES]` |
| `[K-FUNKDIENST]` | `funktechnik/funkdienste.ts` | `LEARNING_GOALS` (5), `SECTIONS` (6) | `[R-WISS-FUNK-DIENST]` |
| `[K-FUNKAFU]` | `funktechnik/amateurfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (6) | `[R-WISS-FUNK-AFU]` |
| `[K-FUNKMOBIL]` | `funktechnik/mobilfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (5) | `[R-WISS-FUNK-MOBIL]` |
| `[K-FUNKRUND]` | `funktechnik/rundfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (5) | `[R-WISS-FUNK-RUND]` |
| `[K-FUNKNOT]` | `funktechnik/notfrequenzen.ts` | `LEARNING_GOALS` (5), `SECTIONS` (4) | `[R-WISS-FUNK-NOT]` |
| `[K-QUELLEN]` | `funktechnik/quellen.ts` | `SECTIONS` (5) | `[R-SERV-QUELL]`: Haftungshinweis, Regelwerke, Normen, Datensätze, Unsicherheiten |

---

## Utilities (`src/lib/utils/`, 14 Module)

Zentrale Funktionen. **Keine Duplikate in Komponenten** — λ = c/f, Formatierer und Einheitenfaktoren existieren jeweils genau einmal.

- **`[U-CALC]`** — `calculations.ts` — `frequencyToWavelength()`, `wavelengthToFrequency()`, `calculateFSPL()`, `calculateRange()`, `calculateSkinDepth()`, `calculateSkinDepthWithValidity()`, `calculateFresnelRadius()`, `calculateShannonCapacity()`, `calculateThermalNoiseDbm()`, `getFsplConstant()`
- **`[U-CONV]`** — `conversions.ts` — `convertToHz()`, `convertFromHz()`, `convertToMeters()`, `wattToDbm()`, `dbmToWatt()`, `wattToDbW()`, `convertToWatt()` (Faktoren kommen aus `[D-UNITS]`)
- **`[U-FMT]`** — `formatting.ts` (484 Z.) — `formatNumber()`, `formatNumberAuto()`, `formatPrecisionNumber()`, `formatRcs()`, `formatFrequency()`, `formatWavelength()`, `formatDistance()`, `formatPowerDbm()`, `formatAttenuation()`, `formatDataRate()`, `formatPercentage()`, `formatAngle()`, `formatTemperature*()`, `formatPressure()`
- **`[U-HAND]`** — `handlers.ts` — `parseNumericInput()` und Varianten, `createNumericHandler()`, `clamp()`, `isInRange()`, `safeDivide()`, `safeLog()`, `safePow()`, `debounce()`
- **`[U-CONST]`** — `constants.ts` — `SPEED_OF_LIGHT_EXACT`, `SPEED_OF_LIGHT_ROUNDED` und ihre Anzeigeformen
- **`[U-ATMO]`** — `atmosphericAttenuation.ts` (601 Z.) — Regen (P.838-3), Nebel (P.840), Schnee (nass/trocken), Pfad- und Erde–Raum-Dämpfung, Kurvengeneratoren
- **`[U-ITU676]`** — `itu676.ts` — ITU-R P.676-13 Annex 1 line-by-line: `oxygenSpecificAttenuation()`, `waterVaporSpecificAttenuation()`, `specificGasAttenuation()`, `equivalentHeights()`, `slantPathGasAttenuation()`
- **`[U-RADAR]`** — `radar.ts` — `calculateRadarMaxRange()`, `calculateRadarReceivedPowerDbm()`, `calculateDopplerShift()`, `calculateRangeResolution()`, `calculateUnambiguousRange()`, `calculateUnambiguousVelocity()`
- **`[U-FRESNEL]`** — `fresnelMath.ts` — `calculateFresnelParameter()`, `calculateKnifeEdgeLoss()`, `evaluateFresnelClearance()`
- **`[U-MODMATH]`** — `modulationMath.ts` (497 Z.) — `generateWaveform()`, `amEnvelope()`, `besselJ()`, `spectrumLines()`, `occupiedBandwidthHz()`, `constellationPoints()`, `noisyConstellation()`, `grayEncode()`, `requiredSnrDb()`
- **`[U-ANTMATH]`** — `antennaMath.ts` (389 Z.) — `effectiveApertureM2()`, `farFieldDistanceM()`, `patternField()`, `samplePattern()`, `halfPowerBeamwidthDeg()`, `frontToBackRatioDb()`, `vswrFromReflection()`, `mismatchLossDb()`
- **`[U-SEARCH]`** — `search.ts` — `scoreEntry()`, `searchEntries()`, `searchGrouped()`, `parseFrequencyQuery()`, `entriesForFrequency()` — Grundlage von `[C-PALETTE]`
- **`[U-SLUG]`** — `slug.ts` — `transliterate()` (ä → ae), `slugify()`, `normalizeForSearch()`, `humanizeSegment()`
- **`[U-URL]`** — `urlState.svelte.ts` — `ParamSpecs`, `readParams()`, `buildSearch()`, `buildUrl()`, `hasNonDefaults()`, `defaultValues()`, `buildShareLink()`, Klasse `UrlStateSync` (entprellte History-Synchronisierung)

---

## Stores (`src/lib/stores/`)

Anwendungsweiter Zustand mit Svelte-5-Runes.

- **`[S-LIGHT]`** — `speedOfLight.svelte.ts` — exaktes c (299 792 458 m/s) oder gerundetes c (3·10⁸ m/s); wird von allen Umrechnungen gelesen.
- **`[S-ATMO]`** — `atmosphericParameters.svelte.ts` — Temperatur, Druck, Wasserdampfdichte, Regen-/Nebel-/Schneerate, Polarisation, Elevation. Geschrieben von `[C-ATMINPUT]`, gelesen von `[C-ATTEN]`.

---

## Wie die Teile zusammenspielen

```
Eingabe → [U-HAND] parst → [U-CALC] / [U-CONV] / [U-ATMO] / [U-RADAR] rechnet
                                       │
                     ┌─────────────────┼─────────────────┐
                     ▼                 ▼                 ▼
                [U-FMT]           [C-CHARTFRAME]     [S-LIGHT]
                formatiert        + D3-Diagramm      [S-ATMO]
                → Text            → SVG              globaler Zustand
                                       │
                                  [U-URL] schreibt ?f=… in die Adresszeile
```

**Navigation:** `[D-NAV]` → `[C-HEADER]`/`[C-MEGA]`/`[C-MOBILE]`, `[C-BREAD]`, `[C-ARTPAG]`, Hub-Kacheln, `[R-SERV-MAP]`, `[D-SEARCH]` → `[C-PALETTE]`, `[D-REL]` → `[C-RELTOP]`, `pageMeta()` → `+page.ts` → `[C-META]`.

**Store-Verbindungen:** `[S-LIGHT]` → `[C-FREQCONV]`, `[C-RANGE]`, `[C-SPECTRUM]` und alle Rechner mit c. `[S-ATMO]` → `[C-ATTEN]`, `[C-LINKBUDGET]`.

**Datenquellen:** `[D-BANDS]`/`[D-FREQBANDS]` → `[C-SPECTRUM]`, `[C-BANDSIDE]`, `[R-DB-FREQ]` · `[D-SERVICES]` → `[C-SERVBAR]` · `[D-AFU]` → `[C-AFUPLAN]` · `[D-MOBILE]` → `[C-MOBGEN]`, `[C-MOBTAB]` · `[D-BROADCAST]` → `[C-CHANCONV]`, `[C-SWTAB]` · `[D-EMERG]` → `[C-EMTAB]` · `[D-APPS]` → `[C-APPDB]`, `[C-APPOVER]` · `[D-TX]` → `[C-TXDB]` · `[D-HIST]` → `[C-TIMELINE]`.

---

## Tests (`src/tests/`)

37 Testdateien mit **1597 Tests** (`npx vitest run`), Umgebung jsdom. `setup.ts` ist die Testumgebung und enthält selbst keine Tests.

| ID | Datei | Prüft |
|---|---|---|
| `[T-CALC]` | `calculations.test.ts` | `[U-CALC]` — FSPL, λ, Reichweite, Skin-Tiefe, Shannon |
| `[T-CONV]` | `conversions.test.ts` | `[U-CONV]` |
| `[T-FMT]` | `formatting.test.ts` | `[U-FMT]` |
| `[T-HAND]` | `handlers.test.ts` | `[U-HAND]` |
| `[T-ATMO]` | `atmosphericAttenuation.test.ts` | `[U-ATMO]` — Regen, Nebel, Schnee, Pfad |
| `[T-ITU676]` | `itu676.test.ts` | `[U-ITU676]` gegen Referenzwerte |
| `[T-RADAR]` | `radar.test.ts` | `[U-RADAR]` |
| `[T-FRESNEL]` | `fresnelMath.test.ts` | `[U-FRESNEL]` |
| `[T-MODMATH]` | `modulationMath.test.ts` | `[U-MODMATH]` |
| `[T-ANTMATH]` | `antennaMath.test.ts` | `[U-ANTMATH]` |
| `[T-SEARCH]` | `search.test.ts` | `[U-SEARCH]` |
| `[T-SLUG]` | `slug.test.ts` | `[U-SLUG]` |
| `[T-URL]` | `urlState.test.ts` | `[U-URL]` |
| `[T-CONSTS]` | `constants.test.ts` | `[D-CONST]`, `[U-CONST]` |
| `[T-UNITS]` | `units.test.ts` | `[D-UNITS]` |
| `[T-BANDS]` | `bands.test.ts` | `[D-BANDS]` |
| `[T-PRESETS]` | `presets.test.ts` | `[D-PRESETS]` |
| `[T-PROP]` | `propagation.test.ts` | `[D-PROP]` |
| `[T-NAV]` | `navigation.test.ts` | `[D-NAV]` — Trailing Slash, eindeutige IDs, Baumkonsistenz |
| `[T-RADIODATA]` | `radioData.test.ts` | Neue Funkdatensätze auf Struktur und Plausibilität |
| `[T-RADIOCORR]` | `radioDataCorrections.test.ts` | Die 58 Datenkorrekturen aus Welle 1 |
| `[T-CALCLOGIC]` | `calculators-logic.test.ts` | Logikmodule aller sechs Rechner |
| `[T-FUNKINH]` | `funk-inhalte.test.ts` | Struktur und Anker der Funktechnik-Kapitel |
| `[T-FUNKNAV]` | `funk-navigation.test.ts` | Kapitel sind in `[D-NAV]` und `[D-REL]` verdrahtet |
| `[T-FUNKAFU]` | `funk-amateurfunk.test.ts` | Bandplan-Logik |
| `[T-FUNKMOBIL]` | `funk-mobilfunk.test.ts` | Mobilfunk-Bandlogik |
| `[T-FUNKKANAL]` | `funk-kanaele.test.ts` | DAB-/DVB-T2-/UKW-Kanalumrechnung |
| `[T-FUNKFILT]` | `funk-filter.test.ts` | Filterlogik von `[C-APPDB]` und `[C-EMTAB]` |
| `[T-FUNKSPEK]` | `funk-spektrum.test.ts` | Skalen- und Segmentgeometrie der Spektrumleisten |
| `[T-WMOUNT]` | `widgets-mount.test.ts` | SSR-Rendering der Widgets und `[C-ARTLAY]` |
| `[T-WRADAR]` | `widgets-radar.test.ts` | Radar-Widget-Modelle |
| `[T-WPROP]` | `widgets-propagation.test.ts` | Ausbreitungs-Widget-Modelle |
| `[T-UIICON]` | `ui-icons.test.ts` | Icon-Katalog vollständig und konsistent |
| `[T-UINUM]` | `ui-numberInput.test.ts` | `[C-NUMLOGIC]` |
| `[T-BANDDET]` | `bandDetail.test.ts` | `[C-BANDLOGIC]` — Aufbereitung der Banddaten |
| `[T-ADAPT]` | `contentAdapter.test.ts` | `[K-FUNKADAPT]` — Übersetzung der Funktechnik-Blöcke |
| `[T-CONV-RULES]` | `conventions.test.ts` | **Hausordnung**: Komponentengröße ≤ 300 Zeilen, Tokens statt Hex-Farben, Trailing Slash in der Navigations-Registry — jeweils mit begründeter Ausnahmeliste |

---

## Konventionen

### 1. `navigation.ts` ist die einzige Quelle für Seiten

Jede neue Seite braucht **zuerst** einen Knoten in `NAV_TREE` (`[D-NAV]`): `id`, `label`, `href` **mit** Trailing Slash, `description`, `icon`, `keywords`, `status`. Daraus ziehen automatisch: Mega-Menü, Mobile-Menü, Breadcrumb, Hub-Kacheln, Sitemap-Seite, Suchindex, Kapitel-Blättern und Seitentitel. Es gibt **keine** zweite Label- oder Kachelliste.

`status: 'geplant'` markiert angekündigte Seiten: sie erscheinen ausgegraut und werden nicht verlinkt. Sobald die Route existiert, genügt `status: 'live'`.

### 2. `pageMeta()` statt `<svelte:head>`

```ts
// src/routes/wissen/antennen/+page.ts
import { pageMeta } from '$lib/data/navigation';
export const load = () => pageMeta('/wissen/antennen/');
```

Titel und Beschreibung kommen aus dem Navigationsknoten; `[C-META]` im Root-Layout erzeugt daraus als **einzige** Stelle `<title>`, `description`, `canonical`, `og:*`, `twitter:*` und die JSON-LD-Breadcrumbs. Abweichungen als Overrides: `pageMeta('/…/', { title: '…' })`. Kein `<svelte:head>` in Seiten.

### 3. Trailing Slash

`trailingSlash: 'always'` im Root-Layout. **Jeder** interne Link endet auf `/` — sonst entsteht beim statischen Hosting ein Redirect oder ein 404. `normalizeHref()` ergänzt ihn, wo Pfade programmatisch entstehen.

### 4. `relations.ts` statt handgeschriebener Linkblöcke

Jede Seite nennt in `RELATIONS` (`[D-REL]`) 3–6 Ziele mit einem knappen Grund, davon mindestens eines aus einem anderen Bereich. Rückverweise ergänzt `getRelatedTopics()` zur Laufzeit. Auf der Seite steht nur `<RelatedTopics href="/…/" />`.

### 5. Content-Architektur

Kapiteltexte sind Daten in `src/lib/content`, kein Markup. Ein `KnowledgeArticle` besteht aus `ArticleSection`s aus typisierten Blöcken; `[C-ARTBLOCK]` bildet jeden Blocktyp auf eine UI-Komponente ab. Anker-IDs stehen in den Daten, ohne Umlaute, und landen im Inhaltsverzeichnis **und** in der URL. Zahlenbeispiele im Text werden aus den zentralen Utilities berechnet, nicht hartkodiert.

### 6. Widget-Muster

```
widgets/XyzModel.ts     reine Rechenfunktionen, ohne DOM, mit Test
widgets/XyzWidget.svelte  Regler + Bühne, gerahmt von [C-WIDGFRAME]
knowledge/widgetRegistry.ts  ID → Komponente
content/…                    referenziert nur { type: 'widget', id: 'xyz' }
```

Animierte Widgets nutzen `[C-ANIMLOOP]`:

```ts
const loop = new AnimationLoop();
$effect(() => loop.attach());   // stoppt bei prefers-reduced-motion und verborgenem Tab
```

`[C-WIDGFRAME]` verlangt eine `description` (wird `aria-label` der Bühne) und erwartet eine `sr-only`-Datentabelle mit den aktuellen Werten — jede Grafik ist damit auch ohne Sicht auswertbar.

### 7. Chart-Muster

Jedes Diagramm sitzt in `[C-CHARTFRAME]`, misst seine Breite selbst (`bind:width`) und bringt `description`, `dataTable` und — wo sinnvoll — `footnote` mit. Aufrufer geben `width` **nicht** mehr vor. Die Datenaufbereitung liegt in `<name>Data.ts` neben der Komponente.

### 8. Rechner-Muster

Zustand in der URL über `[U-URL]`: `*_PARAMS` deklariert Standardwerte und Grenzen, `UrlStateSync` schreibt entprellt in die History, `[C-CALCACT]` bietet „Link kopieren" und „Zurücksetzen". Eingaben über `[C-NUMIN]`/`[C-SLIDER]`, Ergebnisse über `[C-RESULT]`, Formeln über `[C-FORMULA]`.

### 9. UI und Styling

Nur Tokens aus `[S-CSS]`, keine Hex-Farben in Komponenten; Icons über `[C-ICON]`, keine Emoji; Fokusring und Kontraste kommen aus dem Design-System. Details: `STYLE_GUIDE.md`.

`[T-CONV-RULES]` prüft diese Regeln maschinell: Komponentengröße, Hex-Farben und Trailing Slash. Ausnahmen stehen dort namentlich mit Begründung — derzeit `[C-SPECTRUM]` und `[C-FREQCONV]` (Größe, geschützt) sowie die Spektrum- und Szenenkomponenten (illustrative Farbverläufe).

### 10. Sprache

Echte Umlaute (`ä ö ü ß`) in UI, Kommentaren und Doku — **außer** in Verzeichnis- und Dateinamen, die in URLs landen (`kanalkapazitaet`, `daempfung`, `frequenzbaender`).

---

## Styling & Konfiguration

- **`[S-CSS]`** — `src/app.css` — Design-System: `@theme static`-Tokens, Light/Dark über `@custom-variant`, Layout- und Tabellenklassen, Fokusring
- **`[CFG-HTML]`** — `src/app.html` — Grundgerüst, Anti-FOUC-Skript für das Theme
- **`[CFG-SVELTE]`** — `svelte.config.js` — SvelteKit mit `adapter-static` (`fallback: 404.html`, `precompress`)
- **`[CFG-VITE]`** — `vite.config.ts` — Vite + Tailwind
- **`[CFG-TEST]`** — `vitest.config.ts` — jsdom, `src/tests/setup.ts`, kein manueller `$lib`-Alias
- **`[CFG-TS]`** — `tsconfig.json` — TypeScript strict
- **`[CFG-PKG]`** — `package.json` — Abhängigkeiten und npm-Scripts
- **`[L-ROOT]`** — `src/routes/+layout.svelte` / `+layout.ts` — Prerender, Trailing Slash, Header/Breadcrumb/Footer/Palette, `[C-META]`

---

## ID-Schnellreferenz

| Prefix | Bedeutung | Beispiel |
|--------|-----------|----------|
| `R-` | Route / Seite | `[R-FSPL]` = FSPL-Rechnerseite |
| `C-` | Komponente | `[C-ATTEN]` = Dämpfungsdiagramm |
| `C-W-` | Interaktives Widget | `[C-W-DOPPLER]` = Doppler-Widget |
| `U-` | Utility-Modul | `[U-CALC]` = Berechnungsfunktionen |
| `D-` | Daten-Modul | `[D-BANDS]` = Banddefinitionen |
| `K-` | Content-Modul (Kapiteltext) | `[K-RADAR]` = Radar-Kapiteldaten |
| `S-` | Store | `[S-ATMO]` = Atmosphären-Parameter |
| `T-` | Test | `[T-CALC]` = Tests für Berechnungen |
| `L-` | Layout | `[L-ROOT]` = Wurzel-Layout |
| `CFG-` | Konfiguration | `[CFG-PKG]` = package.json |
| `S-CSS` | Stylesheet | `[S-CSS]` = app.css Design-System |

### Entfallene IDs

| ID | Bis | Grund |
|---|---|---|
| `[C-EXPORT]` | `ui/ExportMenu.svelte` | PNG-/PDF-Export entfernt; `jspdf` und `html2canvas` sind keine Abhängigkeiten mehr |
| `[C-BANDEXP]` | `charts/FrequencyBandExplorer.svelte` | im Spektrum-Dashboard aufgegangen |
