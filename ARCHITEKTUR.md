# Bandbreite — Architektur & Elementreferenz

Gemeinsame Referenz zur eindeutigen Identifikation aller Elemente. Jedes Element hat eine **ID** in eckigen Klammern (z. B. `[C-FSPL]`), die wir zur Kommunikation verwenden. Bestehende IDs bleiben stabil, auch wenn eine Datei umgebaut oder aufgeteilt wurde.

**Stand:** September 2026, nach dem Rework in sechs Wellen (siehe `docs/REWORK-2026-09.md`).

**Keine Zeilenzahlen mehr.** Sie waren nie länger als bis zum nächsten Formatierungslauf gültig. Stattdessen gilt die Regel „**max. 300 Zeilen je Komponente**", und `[T-CONV-RULES]` (`src/tests/conventions.test.ts`) setzt sie maschinell durch — zusammen mit „nur Tokens, keine Hex-Farben" und „Trailing Slash in der Navigations-Registry".

---

## Geschützte Kernelemente

Die folgenden fünf Komponenten sind die **Kernidee der Anwendung**. Sie dürfen **niemals** entfernt, ersetzt oder in ihrer Funktion verändert werden, ohne vorher explizit beim Benutzer nachzufragen.

- **`[C-SPECTRUM]`** — EM-Spektrum-Visualisierung (das Hauptdiagramm)
- **`[C-FREQCONV]`** — Frequenz ↔ Wellenlänge Konverter
- **`[C-POWCONV]`** — Leistungskonverter (W ↔ dBm)
- **`[C-RANGE]`** — Reichweitenrechner (TX/RX)
- **`[C-BANDINFO]`** — Bandzuordnung für Frequenzen

Diese Kombination — Spektrum oben, darunter die Werkzeuge — ist das Herzstück. Erweiterungen sind willkommen, aber der Kern bleibt unangetastet.

> **Der Schutz gilt dem Verhalten und dem Erscheinungsbild, nicht der Dateigrenze.** Nach Freigabe des Besitzers (2026-09-08) sind `[C-SPECTRUM]` und `[C-FREQCONV]` intern in Unterkomponenten und Module aufgeteilt worden — pixelgleich nachgewiesen (0 abweichende Pixel auf `/konverter/frequenz/`, 0,03–0,04 % auf `/spektrum/`, ausschließlich an Ziffern des deutschen Zahlenformats; alle 47 Bandrechtecke mit Δ = 0,00 px). **Die Unterkomponenten und Logikmodule stehen unter demselben Schutz wie ihre Mutterkomponente:** `[C-SPECWAVEAX]`, `[C-SPECFREQAX]`, `[C-SPECROWS]`, `[C-SPECMARK]`, `[C-SPECZOOM]`, `[C-SPECBANDS]`, `[C-SPECCURLOGIC]`, `[C-SPECFMT]`, `[C-FREQPRESETS]`, `[C-FREQFORMULA]`.

> **Entschieden `[C-BANDINFO]` (E0, 2026-09-08):** `converters/BandInfo.svelte` ist auf `[R-KONV-FREQ]` (`/konverter/frequenz/`) eingebunden — gekoppelt an dieselbe `frequencyHz` wie `[C-FREQCONV]`. Der Schutz der Komponente bleibt bestehen (unverändert einbinden, nicht ändern). Auf `[R-SPEK]` übernimmt weiterhin `[C-BANDSIDE]` (`BandDetailSidebar.svelte`) die Rolle beim Klick auf ein Band.

---

## Sitemap

Quelle der Wahrheit ist `NAV_TREE` in `[D-NAV]` (`src/lib/data/navigation.ts`). Alle Routen enden auf `/` (`trailingSlash: 'always'`), alle Seiten sind prerendered (`adapter-static`, `strict: true`).

**52 Navigationsknoten** (davon einer `hidden`) + **4 Lernpfad-Detailseiten** = **56 echte Seiten**, dazu **4 Redirects**. Der Produktions-Build schreibt 60 `index.html`.

```
bandbreite.online-resources.de
│
├── /                              Portalseite (Einstieg, Suche, Kacheln)  [R-HOME]
│
├── /spektrum/                     Spektrum-Dashboard (Kernseite)          [R-SPEK]
│   ├── /anwendungen/              Anwendungen im Spektrum                 [R-SPEK-APP]
│   ├── /sendeleistungen/          Sendeleistungen über der Frequenz       [R-SPEK-POW]
│   ├── /daempfung/                308 → /wissen/wellenausbreitung/…       [R-SPEK-DAEMPF]
│   ├── /ionosphaere/              308 → /wissen/wellenausbreitung/…       [R-SPEK-ION]
│   └── /explorer/                 308 → /spektrum/                        [R-SPEK-EXP]
│
├── /rechner/                      Rechner-Hub (9 Rechner)                 [R-RECH]
│   ├── /fspl/                     Freiraumdämpfung                        [R-FSPL]
│   ├── /link-budget/              Link-Budget-Analyse                     [R-LINK]
│   ├── /radar/                    Radar-Reichweite                        [R-RADAR]
│   ├── /kanalkapazitaet/          Kanalkapazität (Shannon-Hartley)        [R-KANAL]
│   ├── /skin-tiefe/               Skin-Tiefe                              [R-SKIN]
│   ├── /fresnel/                  Fresnel-Zone                            [R-FRESN]
│   ├── /antennengewinn/           Parabolgewinn, Keulenbreite, Fernfeld   [R-ANTGAIN]
│   ├── /radiohorizont/            Radiohorizont und k-Faktor              [R-HORIZ]
│   └── /dezibel/                  Pegel, Verhältnisse, Pegelkette         [R-DEZ]
│
├── /konverter/                    Konverter-Hub                           [R-KONV]
│   └── /frequenz/                 Frequenz ↔ Wellenlänge + Bandzuordnung  [R-KONV-FREQ]
│
├── /wissen/                       Wissens-Hub                             [R-WISS]
│   ├── /lernpfade/                Vier geführte Lernpfade                 [R-WISS-LERN]
│   │   └── /[slug]/               Detailseite je Pfad (4 Seiten)          [R-WISS-LERN-DET]
│   ├── /grundlagen/               Kapitel-Hub Grundlagen                  [R-WISS-GRUND]
│   │   ├── /em-wellen/            E-/H-Feld, λ = c/f, Nah-/Fernfeld       [R-WISS-GRUND-EMW]
│   │   ├── /dezibel/              Logarithmische Pegel, dBm/dBW/dBµV      [R-WISS-GRUND-DB]
│   │   └── /leistung-und-pegel/   EIRP/ERP, Leistungsdichte, Feldstärke   [R-WISS-GRUND-PEG]
│   ├── /wellenausbreitung/        Wellenausbreitung                       [R-WISS-WELL]
│   │   ├── /ionosphaere/          Ionosphärische Ausbreitung              [R-WISS-WELL-ION]
│   │   └── /daempfung/            Atmosphärische Dämpfung                 [R-WISS-WELL-DAEMPF]
│   ├── /funktechnik/              Kapitel-Hub Funk & Fernmeldetechnik     [R-WISS-FUNK]
│   │   ├── /funkdienste/          ITU-Funkdienste und Frequenzplan        [R-WISS-FUNK-DIENST]
│   │   ├── /amateurfunk/          Bandplan, Klassen, Betriebsarten        [R-WISS-FUNK-AFU]
│   │   ├── /mobilfunk/            1G bis 6G, Bänder, Duplex               [R-WISS-FUNK-MOBIL]
│   │   ├── /rundfunk/             LW/MW/KW/UKW/DAB+/DVB-T2                [R-WISS-FUNK-RUND]
│   │   ├── /seefunk/              UKW-Kanäle, GMDSS, Seegebiete           [R-WISS-FUNK-SEE]
│   │   ├── /flugfunk/             8,33-kHz-Raster, Navigationsbänder      [R-WISS-FUNK-FLUG]
│   │   ├── /bos/                  BOS-Funk analog → TETRA                 [R-WISS-FUNK-BOS]
│   │   ├── /satellitenfunk/       Bahnklassen, Bänder, Systeme            [R-WISS-FUNK-SAT]
│   │   └── /notfrequenzen/        Not-, Anruf- und Sicherheitsfrequenzen  [R-WISS-FUNK-NOT]
│   ├── /modulation/               Analoge und digitale Modulation         [R-WISS-MOD]
│   ├── /antennen/                 Antennen-Grundlagen                     [R-WISS-ANT]
│   ├── /mathematik/               HF-Mathematik                           [R-WISS-MATH]
│   ├── /radar/                    Kapitel-Hub Radartechnik                [R-WISS-RAD]
│   │   ├── /grundlagen/           Laufzeit, Radargleichung, RCS, PRF      [R-WISS-RAD-GRUND]
│   │   ├── /verfahren/            Puls/CW/FMCW, MTI, CFAR, Phased Array   [R-WISS-RAD-VERF]
│   │   └── /sekundaerradar/       SSR Modus A/C/S, ADS-B, TCAS            [R-WISS-RAD-SSR]
│   ├── /glossar/                  92 Begriffe in 7 Kategorien             [R-WISS-GLOS]
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
    ├── /quellen/                  Quellen, Stand, Unsicherheiten          [R-SERV-QUELL]
    └── /suche/                    Ergebnisseite (hidden)                  [R-SUCHE]
```

`[R-SUCHE]` trägt im Knoten das Flag `hidden: true`: die Seite existiert, ist verlinkbar und prerendert, bleibt aber aus Mega-Menü, Hub-Kacheln, Kapitelnavigation und Suchindex heraus. In `[R-SERV-MAP]` erscheint sie, damit die Übersicht vollständig bleibt.

`[R-WISS-LERN-DET]` sind bewusst **keine** Navigationsknoten: die vier Detailseiten entstehen über `entries()` aus `LEARNING_PATHS` (`[D-LEARN]`), damit Mega-Menü und Kapitelblättern nicht mit vier weiteren Einträgen überladen werden.

### Redirects

| alt | neu | Mechanismus |
|---|---|---|
| `/spektrum/ionosphaere/` | `/wissen/wellenausbreitung/ionosphaere/` | `redirect(308)` — Umzug unter Wellenausbreitung (E2) |
| `/spektrum/daempfung/` | `/wissen/wellenausbreitung/daempfung/` | `redirect(308)` — Umzug unter Wellenausbreitung (E2) |
| `/spektrum/explorer/` | `/spektrum/` | `redirect(308)` — der Explorer ist im Dashboard aufgegangen |
| `/wissen/frequenzbaender/` | `/datenbanken/frequenzbaender/` | `redirect(308)` — Umzug in den Datenbank-Bereich |

### Was zeigen die Seiten?

**`[R-SPEK]` Spektrum-Dashboard** — Kernseite: `[C-SPECTRUM]`, `[C-FREQCONV]`, `[C-POWCONV]`, `[C-RANGE]`, `[C-BANDSIDE]`, `[C-RELTOP]`. Klick auf ein Band setzt die Frequenz für **alle** Werkzeuge (seit E3 auch für den Frequenzkonverter).

**`[R-HOME]` Portalseite** — Einstieg unter `/` (E1): `[C-HERO]`, Suchfeld (öffnet die Command-Palette über `layout/searchDialog.svelte.ts`), fünf Bereichskacheln aus `NAV_GROUPS`, „Interaktiv lernen" mit Sprungmarken in die Kapitel, die Lernpfad-Kacheln `[C-PORTPATHS]`, Werkzeugkacheln aus `getHubChildren()` und ein Hinweis auf Quellen und Haftungsausschluss. Kein zweites Dashboard — `[R-SPEK]` bleibt unverändert.

**Hub-Seiten** (`[R-RECH]`, `[R-KONV]`, `[R-WISS]`, `[R-DB]`, `[R-SERV]`, `[R-WISS-FUNK]`, `[R-WISS-GRUND]`, `[R-WISS-RAD]`) — Kachelraster aus `getHubChildren()`; die Kacheln stammen direkt aus `[D-NAV]` und laufen nie auseinander. Die beiden Kapitel-Hubs `[R-WISS-GRUND]` und `[R-WISS-RAD]` ergänzen Lernziele und Einordnung.

**Rechnerseiten** — jeweils `[C-HERO]` + Rechnerkomponente + `[C-RELTOP]`. Der Rechner hält seinen Zustand in der URL (`?f=…`), siehe `[U-URL]`.

**Wissen-Kapitel** — Inhalt liegt als Daten in `src/lib/content`. Die meisten Kapitel rendern ihn vollständig über `[C-ARTLAY]` im **Datenbetrieb** (die Routendatei ist zweistellig kurz); `[R-WISS-MOD]`, `[R-WISS-ANT]` und die Funktechnik-Kapitel mit eigenen Fachwidgets nutzen den **Markup-Betrieb**, weil sie ihre Widgets frei zwischen den Abschnitten platzieren. Registrierte Widgets kommen über ihre ID aus `[C-WIDGREG]` und sind per `?w=<id>` direkt verlinkbar.

**Datenbank-Seiten** — Tabelle plus Filter; die Daten kommen unverändert aus `src/lib/data`.

**`[R-SUCHE]` Ergebnisseite** — liest `?q=` clientseitig, gruppiert alle Treffer nach Typ, bietet Filter-Chips mit Zählern, den Frequenz-Modus und Vorschläge für den Nulltrefferfall.

---

## Komponenten

Alle Komponenten liegen unter `src/lib/components/`. Pfadangaben sind relativ dazu.
Regel: **max. 300 Zeilen** je Komponente; Logik wandert in eine gleichnamige `.svelte.ts` bzw. `.ts`.

### Spektrum (12 Komponenten + 6 Logikmodule)

Die Bausteine der Kernseite. Liegen aus historischen Gründen direkt in `components/`.

- **`[C-SPECTRUM]`** — `SpectrumOverview.svelte` — **geschützt**
  Vollständiges EM-Spektrum (ELF–Gamma), logarithmisch, mit Zoom/Pan, Reihen für ITU/IEEE/NATO/Zivil und Marker. Seit dem Kern-Refactor nur noch Bühne und Komposition.
  Props: `frequencyHz?`, `showLabels?`, `onBandClick?`, `selectedBandId?`
- **`[C-SPECWAVEAX]`** — `SpectrumWavelengthAxis.svelte` — obere Wellenlängenachse und vertikale Gitterlinien.
- **`[C-SPECROWS]`** — `SpectrumRows.svelte` — Bandreihen als `rect`-Elemente mit Tooltip-/Klick-Handlern und `aria-label`.
- **`[C-SPECMARK]`** — `SpectrumMarker.svelte` — Markerlinie und Markerpunkte zur aktuellen Frequenz.
- **`[C-SPECFREQAX]`** — `SpectrumFrequencyAxis.svelte` — untere Frequenzachse mit dualer λ-Beschriftung.
- **`[C-SPECSTATE]`** — `spectrumState.svelte.ts` — nur noch `$state`/`$derived` und Handler; ruft die reinen Funktionen der folgenden vier Module auf und re-exportiert deren öffentliche API unverändert.
- **`[C-SPECZOOM]`** — `spectrumZoom.ts` — Log-Domäne, `zoomedDomain`, `panOffsetKeepingCenter/Stepped/CenteredOn`, `frequencyTicks`, `wavelengthTicks`, `MIN_ZOOM`/`MAX_ZOOM`.
- **`[C-SPECBANDS]`** — `spectrumBands.ts` — `EXTENDED_EM_BANDS`, Reihenfolge/Beschriftung der Reihen, `calcBandRect`, `bandRects`, `rowY`, Layoutmaße, Farbverlauf des sichtbaren Lichts.
- **`[C-SPECCURLOGIC]`** — `spectrumCursor.svelte.ts` — `createSpectrumCursor({ xScale, innerWidth })`: Mausposition → Frequenz → Etiketten.
- **`[C-SPECFMT]`** — `spectrumFormat.ts` — Kurzformate der Achsen (Einheitenleitern EHz…fm, deutsche Ziffern über `formatFixed`).
- **`[C-SPECCTRL]`** — `SpectrumControls.svelte` — Bedienleiste (Reihen, Ansicht, Zoom, Sprünge).
- **`[C-SPECCUR]`** — `SpectrumCursor.svelte` — Fadenkreuz mit Frequenz- und Wellenlängenetikett.
- **`[C-SPECLEG]`** — `SpectrumLegend.svelte` — Legende der Bandreihen.
- **`[C-SPECTIP]`** — `SpectrumTooltip.svelte` — Tooltip am Band.
- **`[C-BANDSIDE]`** — `BandDetailSidebar.svelte` · Logik `bandDetail.ts`
  Seitenleiste zum gewählten Band: Grenzen, Wellenlänge, Ausbreitung, Dienste, Anwendungen.
  Props: `frequencyHz?`, `selectedBand?`
- **`[C-BANDSERV]`** — `BandServiceList.svelte` — Dienste- und Anwendungsliste der Seitenleiste.
- **`[C-BANDTAGS]`** — `BandTagGroups.svelte` — Bandbezeichnungen (ITU/IEEE/NATO/Zivil) als Etikettengruppen.
- **`[C-BANDLOGIC]`** — `bandDetail.ts` — Aufbereitung der Banddaten (ohne DOM, getestet in `[T-BANDDET]`).

### Layout (8 Komponenten + 3 Logikmodule)

- **`[C-HEADER]`** — `layout/Header.svelte` — Kopfzeile: Logo, Mega-Menü-Auslöser, `[C-SEARCHTRIG]`, `[C-THEME]`, `[C-MOBILE]`. Props: `onsearch`
- **`[C-MEGA]`** — `layout/MegaMenu.svelte` — Aufklappmenü einer `NavGroup` aus `[D-NAV]`. Props: `group`, `open`, `onclose`
- **`[C-MOBILE]`** — `layout/MobileMenu.svelte` — Schublade für schmale Viewports. Props: `open`, `close`, `onsearch`
- **`[C-MOBILEGRP]`** — `layout/MobileMenuGroup.svelte` — aufklappbare Gruppe innerhalb der Schublade.
- **`[C-PALETTE]`** — `layout/CommandPalette.svelte`
  Command-Palette (Strg/⌘ + K): Volltextsuche über Seiten, Widgets, Bänder, Dienste, Sender und Glossar, dazu ein Frequenz-Modus („2,4 GHz" → passende Bänder, Dienste, Rechner-Deep-Links) und am Ende „Alle Ergebnisse zeigen →" auf `[R-SUCHE]`.
  Props: `open` (`$bindable`)
- **`[C-CMDLOGIC]`** — `layout/commandPalette.svelte.ts` — Trefferaufbereitung, Frequenzaktionen, Deep-Link-Ziele, `allResultsItem()`.
- **`[C-SEARCHDLG]`** — `layout/searchDialog.svelte.ts` — gemeinsamer Öffnungszustand der Palette (Header, Portal-Suchfeld, Tastenkürzel).
- **`[C-SEARCHTRIG]`** — `layout/SearchTrigger.svelte` — Schaltfläche/Feld, das die Palette öffnet. Props: `onopen`, `compact?`
- **`[C-THEME]`** — `layout/ThemeToggle.svelte` — hell / dunkel / System, Präferenz in `localStorage`.
- **`[C-FOOTER]`** — `layout/Footer.svelte` — Fußzeile.
- **`[C-HEADERLOGIC]`** — `layout/header.svelte.ts` — DOM-nahe Helfer des Kopfbereichs: `isActiveGroup()`, `focusLeaves()`, `watchDesktopWidth()`, `columnOf()`, `megaMenuKeydown()` (Pfeil-, Spalten- und Escape-Navigation).

### UI-Bibliothek (26 Komponenten + 3 Module)

Die Bausteine des Design-Systems. Details, Props-Tabellen und Beispiele: **`STYLE_GUIDE.md`**.
Regel: Diese Komponenten verwenden **nur Tokens**, keine festen Farbwerte.

| ID | Datei | Zweck | Wichtigste Props |
|---|---|---|---|
| `[C-ICON]` | `ui/Icon.svelte` | Strich-Icons aus `[C-ICONS]`, `stroke="currentColor"` | `name`, `size?`, `label?` |
| `[C-ICONS]` | `ui/icons.ts` | Icon-Katalog (Pfaddaten), Typ `IconName` | — |
| `[C-BTN]` | `ui/Button.svelte` | Schaltfläche oder Link | `variant?`, `size?`, `href?`, `icon?`, `iconOnly?`, `pressed?`, `loading?` |
| `[C-BADGE]` | `ui/Badge.svelte` | Statusetikett | `tone?`, `variant?`, `dot?`, `icon?` |
| `[C-CARD]` | `ui/Card.svelte` | Karte, optional verlinkt | `title?`, `subtitle?`, `href?`, `icon?`, `tone?`, `muted?` |
| `[C-SECHEAD]` | `ui/SectionHeader.svelte` | Abschnittsüberschrift mit Anker | `title`, `level?`, `id?`, `eyebrow?`, `description?` |
| `[C-CALLOUT]` | `ui/Callout.svelte` | Hinweis-, Warn-, Formelkasten | `tone?`, `title?`, `source?`, `collapsible?` |
| `[C-SELECT]` | `ui/Select.svelte` | Auswahlfeld | `label?`, `value`, `options`, `error?`, `onchange?` |
| `[C-SLIDER]` | `ui/Slider.svelte` | Schieberegler, linear oder logarithmisch | `label`, `value`, `min`, `max`, `scale?`, `format?` |
| `[C-NUMIN]` | `ui/NumberInput.svelte` | Zahlenfeld mit Einheitenwahl, Regler und Presets | `label`, `value`, `unit?`, `units?`, `min?`, `max?`, `slider?`, `presets?` |
| `[C-NUMLOGIC]` | `ui/numberInput.svelte.ts` | Parsen (Komma **und** Punkt), Skalen, `pickBestUnit()`, Grenzwertprüfung | — |
| `[C-NUMPRESET]` | `ui/NumberInputPresets.svelte` | Preset-Chips innerhalb von `[C-NUMIN]` | `presets`, `value`, `onselect` |
| `[C-TABS]` | `ui/Tabs.svelte` | Reiterleiste mit Panel-Snippet | `tabs`, `active`, `panel`, `variant?` |
| `[C-RESULT]` | `ui/ResultCard.svelte` | Ergebnisanzeige mit Kopierfunktion | `label`, `value`, `unit?`, `tone?`, `emphasis?`, `copyable?` |
| `[C-FORMULA]` | `ui/FormulaBlock.svelte` | Formel als Unicode oder MathML, mit Zeichenlegende | `formula?`, `math?`, `alt?`, `variables?` |
| `[C-HERO]` | `ui/PageHero.svelte` | Seitenkopf: Kicker, Titel, Lead, Metadaten, Aktionen | `title`, `lead?`, `kicker?`, `icon?`, `meta?` |
| `[C-TOC]` | `ui/TableOfContents.svelte` | Sticky-Inhaltsverzeichnis mit Scrollspy | `items`, `sticky?`, `compactBelow?` |
| `[C-GOALS]` | `ui/LearningGoals.svelte` | Lernziel-Block eines Kapitels | `goals`, `title?`, `level?` |
| `[C-RELLINK]` | `ui/RelatedLinks.svelte` | Freie Linkliste als Karten oder Liste | `items`, `layout?`, `columns?` |
| `[C-RELTOP]` | `ui/RelatedTopics.svelte` | „Verwandte Themen" aus `[D-REL]` — kein Handpflege-Markup | `href`, `title?`, `max?` |
| `[C-BREAD]` | `ui/Breadcrumb.svelte` | Brotkrümel aus `getBreadcrumbs()`, Startknoten ist `/` | `currentPath` |
| `[C-META]` | `ui/Metadata.svelte` | Einzige Stelle für `<head>`: Titel, Description, canonical, og/twitter, JSON-LD-Breadcrumbs | `title?`, `description?`, `image?` |
| `[C-TOOLTIP]` | `ui/InfoTooltip.svelte` | Begriffserklärung aus `[D-EXPLAIN]` | `title`, `short`, `detailed?` |
| `[C-GLOSSTERM]` | `ui/GlossaryTerm.svelte` | Abbr-artiger Link auf einen Glossarbegriff (`[D-GLOSS]`), Kurzdefinition als Titel — angelegt, bewusst noch nirgends eingebaut | `id`, `label?` |
| `[C-PROPMODE]` | `ui/PropagationModeIndicator.svelte` | Badge „Bodenwelle / Raumwelle / Sichtverbindung" | `frequencyHz`, `showLabel?` |
| `[C-TXDB]` | `ui/TransmitterDatabase.svelte` | Senderdatenbank: Suche, Filter, Sortierung | `onSelectFrequency?` |
| `[C-TXFILT]` | `ui/TransmitterFilters.svelte` | Filterleiste zu `[C-TXDB]` | `query`, `group`, `subtype`, `sortKey`, … |
| `[C-TXDET]` | `ui/TransmitterDetails.svelte` | Detailkarte eines Senders | `transmitter`, `onclose` |
| `[C-TXLOGIC]` | `ui/transmitterDatabase.svelte.ts` | Filter- und Sortierlogik (testbar, ohne DOM) | — |

### Rechner (28 Komponenten + 10 Logikmodule)

Jeder Rechner besteht aus einer schlanken Hauptkomponente, Eingabe-/Ergebnis-Unterkomponenten und einem Logikmodul `<name>.svelte.ts`, das Parameter-Spezifikation (`*_PARAMS`), Presets, Grenzwerte und die reine Rechenkette enthält. Die Logikmodule sind ohne DOM testbar.

- **`[C-FSPL]`** — `calculators/FSPLCalculator.svelte` · Logik `fspl.svelte.ts`
  Freiraumdämpfung; Diagramm `[C-FSPLCHART]` mit Mehrfrequenz-Vergleich.
  Props: `height?` · URL: `?f` (Hz), `?d` (m), `?multi`
- **`[C-LINKBUDGET]`** — `calculators/LinkBudgetCalculator.svelte` · Logik `linkBudget.svelte.ts`
  Sender-, Pfad- und Empfängerabschnitt (`[C-LBTX]`, `[C-LBPATH]`, `[C-LBRX]`), Ergebnis `[C-LBRES]`, Visualisierung `[C-WATERFALL]`. Erde–Raum-Pfad mit Elevationswinkel.
  URL: `?pt,gt,lt,d,f,gr,lr,s,fade,misc,atm,path,el`
- **`[C-RADAR]`** — `calculators/RadarRangeCalculator.svelte` · Logik `radarRange.svelte.ts`
  Radargleichung mit Systemverlusten; Eingaben `[C-RADARIN]`, Ergebnisse `[C-RADAROUT]`, Impulsparameter `[C-RADARPULSE]` (Doppler, Auflösung, eindeutige Entfernung).
  URL: `?f,pt,g,rcs,smin,l`
- **`[C-CHANNEL]`** — `calculators/ChannelCapacityCalculator.svelte` · Logik `channelCapacity.svelte.ts`
  Shannon-Hartley; Ergebnisse `[C-CAPRES]`, Diagramm `[C-SHANNON]`. URL: `?b` (Hz), `?snr` (dB)
- **`[C-SKIN]`** — `calculators/SkinDepthCalculator.svelte` · Logik `skinDepth.svelte.ts`
  Skin-Tiefe mit Gültigkeitsprüfung der Guter-Leiter-Näherung; Ergebnisse `[C-SKINRES]`, Diagramm `[C-SKINCHART]`. URL: `?f,sigma,eps`
- **`[C-FRESNEL]`** — `calculators/FresnelZoneCalculator.svelte` · Logik `fresnelZone.svelte.ts`
  Fresnel-Radius, Hindernisfreiheit und Messerschneiden-Dämpfung; Diagramm `[C-FRESDIAG]`. URL: `?f,d,o`
- **`[C-ANTGAIN]`** — `calculators/AntennaGainCalculator.svelte` · Logik `antennaGain.svelte.ts`
  Parabolgewinn, Halbwertsbreite, Wirkfläche, Fernfeldabstand, dBi ↔ dBd; Ergebnisse `[C-ANTGAINRES]`, Rissdarstellung `[C-ANTGAINDISH]`. URL: `?d,f,eta,g`
- **`[C-HORIZON]`** — `calculators/RadioHorizonCalculator.svelte` · Logik `radioHorizon.svelte.ts`
  Radiohorizont mit k-Faktor (Sub-/Standard-/Superrefraktion); Ergebnisse `[C-HORIZONRES]`, Erdkrümmungsskizze `[C-HORIZONDIAG]`. URL: `?h1,h2,k`
- **`[C-DECIBEL]`** — `calculators/DecibelCalculator.svelte` · Logik `decibelCalculator.svelte.ts`
  Verhältnisse (`[C-DBRATIO]`), Absolutpegel dBm/dBW/dBµV (`[C-DBLEVEL]`), sechsstufige Pegelkette (`[C-DBCHAIN]`) und Merkregeltabelle (`[C-DBMEMO]`). URL: `?c=20,-3,12,…`
- **`[C-CALCACT]`** — `calculators/CalculatorActions.svelte` — „Link kopieren" und „Zurücksetzen". Props: `shareLink`, `canReset?`, `onreset`
- **`[C-PRESETCHIP]`** — `calculators/PresetChips.svelte` · Logik `presetChips.svelte.ts` — Preset-Leiste. Props: `label`, `presets`, `value`, `onselect`

Unterkomponenten: `[C-LBTX]` `LinkBudgetTxSection`, `[C-LBPATH]` `LinkBudgetPathSection`, `[C-LBRX]` `LinkBudgetRxSection`, `[C-LBRES]` `LinkBudgetResults`, `[C-RADARIN]` `RadarRangeInputs`, `[C-RADAROUT]` `RadarRangeResults`, `[C-RADARPULSE]` `RadarPulseParameters`, `[C-CAPRES]` `ChannelCapacityResults`, `[C-SKINRES]` `SkinDepthResults`, `[C-ANTGAINRES]` `AntennaGainResults`, `[C-ANTGAINDISH]` `AntennaGainDish`, `[C-HORIZONRES]` `RadioHorizonResults`, `[C-HORIZONDIAG]` `RadioHorizonDiagram`, `[C-DBLEVEL]` `DecibelLevelSection`, `[C-DBRATIO]` `DecibelRatioSection`, `[C-DBCHAIN]` `DecibelChain`, `[C-DBMEMO]` `DecibelMemoTable`.

### Konverter (9 Komponenten + 1 Logikmodul)

- **`[C-FREQCONV]`** — `converters/FrequencyConverter.svelte` — **geschützt**
  Frequenz ↔ Wellenlänge mit Presets und automatischer Einheitenwahl. Arbeitet seit E3 direkt auf dem `$bindable`-Prop; nur fremde Änderungen (Bandklick, Deep-Link) wechseln die Einheit über `pickBestUnit()`.
  Props: `frequencyHz?` (`$bindable`)
- **`[C-FREQPRESETS]`** — `converters/FrequencyPresets.svelte` — Schnellwahlleiste und Formel-Umschalter (Teil von `[C-FREQCONV]`, mitgeschützt).
- **`[C-FREQFORMULA]`** — `converters/FrequencyFormula.svelte` — aufklappbarer Formelbereich mit c-Umschalter (mitgeschützt).
- **`[C-POWCONV]`** — `converters/PowerConverter.svelte` — **geschützt**
  W ↔ mW ↔ dBm ↔ dBW, gleiche Sync-Regel wie `[C-FREQCONV]`. Props: `powerWatt?` (`$bindable`)
- **`[C-RANGE]`** — `converters/RangeCalculator.svelte` — **geschützt**
  TX-Leistung + RX-Empfindlichkeit → theoretische Reichweite. Props: `frequencyHz`
- **`[C-BANDINFO]`** — `converters/BandInfo.svelte` — **geschützt**, eingebunden auf `[R-KONV-FREQ]` (E0). Props: `frequencyHz?`
- **`[C-ATMINPUT]`** — `converters/AtmosphericInputs.svelte` · Logik `atmosphericInputs.svelte.ts` — Reiter-Rahmen für die Atmosphärenparameter; schreibt `[S-ATMO]`.
- **`[C-ATMTAB]`** — `converters/AtmosphericTab.svelte` — Temperatur, Druck, Wasserdampfdichte.
- **`[C-PRECTAB]`** — `converters/PrecipitationTab.svelte` — Regen, Nebel, Schnee, Polarisation, Elevation.

### Charts & Visualisierungen (26 Komponenten + 8 Datenmodule)

`d3-scale` und `d3-shape` (kein `d3`-Metapaket, kein Chart.js) plus eigenes SVG. Alle Diagramme sitzen in `[C-CHARTFRAME]`, messen ihre Breite selbst und liefern eine `sr-only`-Datentabelle. Serienfarben kommen aus Tokens, nicht aus Hex-Werten. Die Datenaufbereitung liegt jeweils in einem `*Data.ts` neben der Komponente und ist ohne DOM testbar.

- **`[C-CHARTFRAME]`** — `charts/ChartFrame.svelte`
  Rahmen für alle Diagramme: Titel, Legende, horizontales Scrollen unter `minWidth`, Fußnote, Datentabelle für Screenreader.
  Props: `title?`, `level?`, `description` (Pflicht), `width?` (`$bindable`), `minWidth?`, `legend?`, `dataTable?`, `footnote?`, `actions?`
- **`[C-ATTEN]`** — `charts/AttenuationChart.svelte` · `attenuationChartData.ts`
  Atmosphärische Dämpfung nach ITU-R P.676-13 (line-by-line), P.838-3, P.840. Legende `[C-ATTLEG]`, Tabelle `[C-ATTTAB]`, Tooltip `[C-ATTTIP]`.
- **`[C-POWERDB]`** — `charts/PowerDbChart.svelte` · `powerDbData.ts`
  Sendeleistung über Frequenz. Bedienung `[C-POWCTRL]`, Legende `[C-POWLEG]`, Tabelle `[C-POWTAB]`, Tooltip `[C-POWTIP]`.
- **`[C-FSPLCHART]`** — `charts/FSPLChart.svelte` · `fsplChartData.ts` — FSPL über Distanz, optional mehrere Frequenzen.
- **`[C-WATERFALL]`** — `charts/LinkBudgetWaterfall.svelte` · `waterfallData.ts` — Gewinne und Verluste entlang des Signalwegs.
- **`[C-SHANNON]`** — `charts/ShannonLimitChart.svelte` — Shannon-Grenze über SNR.
- **`[C-SKINCHART]`** — `charts/SkinDepthChart.svelte` — Skin-Tiefe über Frequenz je Medium.
- **`[C-FRESDIAG]`** — `charts/FresnelZoneDiagram.svelte` — Schnitt durch die Fresnel-Zone mit Hindernis.
- **`[C-APPOVER]`** — `charts/ApplicationOverlay.svelte` · `applicationOverlayData.ts` — Anwendungsbänder über dem Spektrum; Detailkarte `[C-APPDET]`.
- **`[C-IONO]`** — `charts/IonosphericPropagation.svelte` · `ionosphericData.ts`
  Ionosphärenschichten, MUF/LUF, Skip-Zone; Bühne `[C-IONOSCENE]`. Auch als Widget `ionospheric-propagation` registriert.
- **`[C-WAVEPROP]`** — `charts/WavePropagationDiagram.svelte` · `wavePropagationData.ts`
  Ausbreitungsmodi; Bedienung `[C-WPCTRL]`, Bühne `[C-WPSCENE]`, Pfade `[C-WPPATH]`, Legende `[C-WPLEG]`. Auch als Widget `wave-propagation-diagram` registriert.
- **`[C-TIMELINE]`** — `charts/HistoricalTimeline.svelte` · `timelineData.ts` — Zeitleiste aller Meilensteine aus `[D-HIST]`; Detailpanel `[C-TIMEDET]`.

Unterkomponenten: `[C-ATTLEG]` `AttenuationLegend`, `[C-ATTTAB]` `AttenuationTable`, `[C-ATTTIP]` `AttenuationTooltip`, `[C-POWCTRL]` `PowerDbControls`, `[C-POWLEG]` `PowerDbLegend`, `[C-POWTAB]` `PowerDbTable`, `[C-POWTIP]` `PowerDbTooltip`, `[C-APPDET]` `ApplicationDetails`, `[C-IONOSCENE]` `IonosphericScene`, `[C-WPCTRL]` `WavePropagationControls`, `[C-WPSCENE]` `WavePropagationScene`, `[C-WPPATH]` `WavePropagationPaths`, `[C-WPLEG]` `WavePropagationLegend`, `[C-TIMEDET]` `TimelineEventDetails`.

### Funk & Fernmeldetechnik (25 Komponenten + 8 Logikmodule)

Fachliche Bausteine der Kapitel unter `[R-WISS-FUNK]` und der Funkdienst-Datenbank. Alle Balkendarstellungen sind **HTML/CSS statt SVG**: Die Segmente sind echte `<button>`-Elemente mit `aria-pressed` und vorgelesenem Frequenzbereich. Die Filter- und Skalenlogik liegt in `.svelte.ts`-Modulen und ist ohne DOM getestet.

- **`[C-SERVBAR]`** — `funk/ServiceSpectrumBar.svelte` · `serviceSpectrum.svelte.ts`, `spectrumScale.svelte.ts` — Spektrumleiste der ITU-Funkdienste; Detailpanel `[C-SERVDET]`.
- **`[C-AFUPLAN]`** — `funk/AmateurBandplan.svelte` · `amateurBandplan.svelte.ts` — Bandplan der 22 Amateurfunkbänder mit Betriebsartensegmenten, Klassenfilter, Leistungsgrenzen und Teilbereichen; Legende `[C-MODELEG]`.
- **`[C-MOBGEN]`** — `funk/MobileGenerations.svelte` — 1G bis 6G als Vergleichskarten.
- **`[C-MOBTAB]`** — `funk/MobileBandTable.svelte` · `mobileBands.svelte.ts` — Bandtabelle mit Uplink/Downlink und Duplexart.
- **`[C-DATARATE]`** — `funk/DataRateCalculator.svelte` — Datenrate aus Bandbreite, Modulation, MIMO-Strömen.
- **`[C-CHANCONV]`** — `funk/ChannelConverter.svelte` · `broadcastChannels.svelte.ts` — Kanal ↔ Frequenz für DAB-Blöcke (mit Kennzeichnung „nicht in DE"), DVB-T2-Kanäle und UKW.
- **`[C-SWTAB]`** — `funk/ShortwaveTable.svelte` — Kurzwellen-Rundfunkbänder.
- **`[C-EMTAB]`** — `funk/EmergencyTable.svelte` · `emergencyFilter.svelte.ts` — Not-, Anruf- und Sicherheitsfrequenzen, filterbar nach Bereich und Zweck.
- **`[C-APPDB]`** — `funk/ApplicationDatabase.svelte` · `applicationFilter.svelte.ts` — Datenbank der Frequenzzuweisungen: Volltext, Kategorie, Region, Frequenzbereich; Detailpanel `[C-APPPANEL]`.
- **`[C-MARCONV]`** — `funk/MaritimeChannelConverter.svelte` — Seefunk: Kanal ↔ Frequenzpaar mit Nutzungsfilter.
- **`[C-MARTAB]`** — `funk/MaritimeChannelTable.svelte` — UKW-Kanaltabelle (Verschachtelung 60/01/61/02 …).
- **`[C-MARDIST]`** — `funk/MaritimeDistressTable.svelte` — Not- und Sicherheitsfrequenzen auf Grenz- und Kurzwelle.
- **`[C-MARAREA]`** — `funk/MaritimeSeaAreas.svelte` — schematische Karte der vier GMDSS-Seegebiete.
- **`[C-AVICALC]`** — `funk/AviationChannelCalculator.svelte` — 8,33-kHz-Kanalrechner in beide Richtungen.
- **`[C-AVISCALE]`** — `funk/AviationChannelScale.svelte` — Frequenzlineal zum Kanalraster.
- **`[C-AVITAB]`** — `funk/AviationBandTable.svelte` — filterbare Tabelle der Flugfunk- und Navigationsbereiche.
- **`[C-BOSTIME]`** — `funk/BosTimeline.svelte` · `BosTimelineModel.ts` — interaktiver Zeitstrahl analog → digital.
- **`[C-BOSCOMP]`** — `funk/BosComparisonTable.svelte` — Vergleich Analogfunk / TETRA.
- **`[C-ORBIT]`** — `funk/OrbitCalculator.svelte` — Bahnrechner (Periode, Geschwindigkeit, Footprint, Laufzeit, Doppler); Bühne `[C-ORBITSCENE]`.
- **`[C-SATBAND]`** — `funk/SatelliteBandTable.svelte` — Bänder der Erde–Weltraum-Strecke mit Up-/Downlink.
- **`[C-SATSYS]`** — `funk/SatelliteSystemTable.svelte` — 10 Systeme von Inmarsat bis QO-100.
- **`[C-SERVDET]`** — `funk/ServiceDetailPanel.svelte` — Props: `service`, `groupLabel`
- **`[C-APPPANEL]`** — `funk/ApplicationDetailPanel.svelte` — Props: `application`
- **`[C-MODELEG]`** — `funk/ModeLegend.svelte` — Legende der Betriebsarten.
- **`[C-ORBITSCENE]`** — `funk/OrbitScene.svelte` — Bahnszene zum Orbit-Rechner.

> Die früheren Zweitfassungen `funk/ArticleLayout.svelte` und `funk/ContentSection.svelte` sind entfallen: Die Funktechnik-Kapitel werden von den Kapitelkomponenten unter `knowledge/` gerendert, `content/funktechnik/adapt.ts` übersetzt ihr Blockmodell auf das kanonische Modell aus `content/types.ts`. In `funk/` liegen ausschließlich fachliche Bausteine.

### Portal (4 Komponenten + 1 Modul)

- **`[C-PORTSEARCH]`** — `portal/PortalSearch.svelte` — Suchfeld der Startseite; öffnet über `[C-SEARCHDLG]` dieselbe Palette wie Lupe und Strg + K.
- **`[C-PORTAREAS]`** — `portal/PortalAreas.svelte` — fünf Bereichskacheln mit je drei bis vier Direkteinstiegen.
- **`[C-PORTTILES]`** — `portal/PortalTiles.svelte` — Kachelraster für „Interaktiv lernen" und „Werkzeuge".
- **`[C-PORTPATHS]`** — `portal/PortalLearningPaths.svelte` — Kachelreihe der vier Lernpfade mit Fortschritt.
- **`[C-PORTCONTENT]`** — `portal/portalContent.ts` — leitet Bereichs- und Werkzeugkacheln aus `NAV_GROUPS`/`getHubChildren()` ab; nur die Anker der interaktiven Kapitel stehen als Daten darin.

### Lernpfade (4 Komponenten + 1 Modul)

- **`[C-LEARNBAR]`** — `learning/LearningPathBar.svelte` — Pfad-Leiste unter dem Header (`+layout.svelte`); sichtbar nur, wenn ein Pfad aktiv **und** die aktuelle Route ein Schritt dieses Pfads ist: „Schritt 3 von 7", Lernziel, Balken, Zurück/Weiter/Erledigt/Verlassen.
- **`[C-LEARNCARD]`** — `learning/LearningPathCard.svelte` — Kachel je Pfad (Stufe, Dauer, Fortschritt, Starten/Fortsetzen).
- **`[C-LEARNSTEPS]`** — `learning/LearningPathSteps.svelte` — nummerierte Schrittliste mit Lernziel, Status und Abhaken.
- **`[C-LEARNMETER]`** — `learning/LearningMeter.svelte` — Fortschrittsbalken (`role="progressbar"`, `aria-valuetext`).
- **`[C-LEARNPROG]`** — `learning/learningProgress.svelte.ts` — Runes-Klasse plus Singleton `learningProgress`; versioniertes `localStorage`-Schema `bandbreite:lernpfad`, alle Zugriffe in `try/catch`, Laden erst im `$effect` (sonst wiche das Client-Markup vom prerenderten ab).

### Wissen-Kapitel: Renderer (7 Komponenten + 3 Module)

Generischer Renderer für alle Kapitel. Der Inhalt ist Daten (`src/lib/content`), nicht Markup.

- **`[C-ARTLAY]`** — `knowledge/ArticleLayout.svelte`
  Kapitelrahmen: `[C-HERO]`, `[C-GOALS]`, Sticky-`[C-TOC]`, Abschnitte, Quellen, `[C-ARTPAG]`, `[C-RELTOP]`. Wertet `?w=<widgetId>` aus: scrollt zum Widget (bei `prefers-reduced-motion` ohne Animation) und setzt den Fokus.
  Zwei Betriebsarten: **Datenbetrieb** mit `article` oder **Markup-Betrieb** mit `children` + `toc`.
  Props: `article?`, `children?`, `href?`, `title?`, `kicker?`, `lead?`, `icon?`, `meta?`, `goals?`, `toc?`, `sources?`, `pagination?`
- **`[C-ARTSEC]`** — `knowledge/ArticleSection.svelte` — ein Abschnitt samt Unterabschnitten. Props: `section`, `level?`
- **`[C-ARTBLOCK]`** — `knowledge/ArticleBlock.svelte` — bildet einen Blocktyp auf die UI-Komponente ab (Absatz, Liste, Formel, Callout, Tabelle, Definitionen, Karten, Widget, Frage); rendert Widgets als Sprungziel `#widget-<id>` und hebt sie nach einem Deep-Link kurz hervor. Props: `block`, `level`
- **`[C-ARTTAB]`** — `knowledge/ArticleTable.svelte` — Tabellenblock mit `.table-scroll`. Props: `block`
- **`[C-ARTCARDS]`** — `knowledge/ArticleCards.svelte` — Kartenblock. Props: `block`, `level`
- **`[C-ARTPAG]`** — `knowledge/ArticlePagination.svelte` — Zurück/Weiter aus den Geschwisterknoten in `[D-NAV]`. Props: `href`
- **`[C-WIDGFRAME]`** — `knowledge/WidgetFrame.svelte`
  Einheitlicher Rahmen für alle interaktiven Widgets: Bühne, Reglerspalte, Ergebnisspalte, Play/Pause, Hinweis bei reduzierter Bewegung, `sr-only`-Datentabelle, Fußnote und — bei bekanntem Kontext — „Link zum Widget kopieren".
  Props: `title`, `description`, `playable?`, `playing?`, `reducedMotion?`, `ontoggle?`, `controls?`, `results?`, `dataTable?`, `footnote?`, `stacked?`, `interactive?`
- **`[C-WIDGREG]`** — `knowledge/widgetRegistry.ts` — `WIDGETS: Record<WidgetId, Component>` (14 als Content-Block gerenderte Widgets); re-exportiert den Metadatenkatalog `[D-WIDGETS]`. Inhalte referenzieren nur die ID.
- **`[C-WIDGCTX]`** — `knowledge/widgetContext.ts` — `setWidgetId`/`getWidgetId` über den Svelte-Kontext; dadurch muss für Deep-Links keine Widget-Komponente angefasst werden.
- **`[C-ANIMLOOP]`** — `knowledge/animationLoop.svelte.ts` — Klasse `AnimationLoop`: `requestAnimationFrame`-Schleife, die bei `prefers-reduced-motion`, verborgenem Tab oder Pause anhält.

### Interaktive Widgets (22 Komponenten + 13 Rechenmodelle)

Jedes Widget besteht aus einem reinen Rechenmodell (`*Model.ts` / `*Options.ts`, ohne DOM, getestet) und einer Komponente, die `[C-WIDGFRAME]` füllt.

| ID | Komponente | Modell | Kapitel |
|---|---|---|---|
| `[C-W-EMWAVE]` | `widgets/EmWaveWidget.svelte` | `EmWaveModel.ts` | `[R-WISS-GRUND-EMW]` |
| `[C-W-FIELD]` | `widgets/FieldStrengthWidget.svelte` | `[U-FIELD]` | `[R-WISS-GRUND-PEG]` |
| `[C-W-DB]` | `widgets/DecibelPlayground.svelte` | `DecibelModel.ts` → `[U-DECIBEL]` | `[R-WISS-GRUND-DB]`, `[R-WISS-MATH]` |
| `[C-W-RADAR]` | `widgets/RadarPulseWidget.svelte` | `RadarPulseModel.ts` | `[R-WISS-RAD-GRUND]` |
| `[C-W-RCS]` | `widgets/RcsComparisonWidget.svelte` | `RcsComparisonModel.ts` | `[R-WISS-RAD-GRUND]` |
| `[C-W-DOPPLER]` | `widgets/DopplerWidget.svelte` | `DopplerModel.ts` | `[R-WISS-RAD-VERF]` |
| `[C-W-BLIND]` | `widgets/BlindSpeedWidget.svelte` | `BlindSpeedModel.ts` | `[R-WISS-RAD-VERF]` |
| `[C-W-FMCW]` | `widgets/FmcwWidget.svelte` | `FmcwModel.ts` | `[R-WISS-RAD-VERF]` |
| `[C-W-SSR]` | `widgets/SsrInterrogationWidget.svelte` · `SsrCodePicker.svelte` | `SsrModel.ts` | `[R-WISS-RAD-SSR]` |
| `[C-W-FRESNEL]` | `widgets/FresnelWidget.svelte` | `FresnelModel.ts` | `[R-WISS-WELL]` |
| `[C-W-ATTWIN]` | `widgets/AttenuationWindowsWidget.svelte` | `AttenuationWindowsModel.ts` | `[R-WISS-WELL]` |
| `[C-W-PROP]` | `widgets/PropagationSandbox.svelte` | `PropagationModel.ts` | `[R-WISS-WELL]`, `[R-WISS-MATH]`, `[R-WISS-WELL-ION]` |
| `[C-W-MOD]` | `widgets/ModulationVisualizer.svelte` | `ModulationOptions.ts`, `[U-MODMATH]` | `[R-WISS-MOD]` |
| `[C-W-MODWAVE]` | `widgets/ModulationWaveforms.svelte` | — (Bühne von `[C-W-MOD]`) | `[R-WISS-MOD]` |
| `[C-W-MODSPEC]` | `widgets/ModulationSpectrum.svelte` | — (Bühne von `[C-W-MOD]`) | `[R-WISS-MOD]` |
| `[C-W-CONST]` | `widgets/ConstellationDiagram.svelte` | `[U-MODMATH]` | `[R-WISS-MOD]` |
| `[C-W-CARSON]` | `widgets/CarsonCalculator.svelte` | `[D-MODUL]` | `[R-WISS-MOD]` |
| `[C-W-POLAR]` | `widgets/AntennaPolarPattern.svelte` | `AntennaPatternOptions.ts`, `[U-ANTMATH]` | `[R-WISS-ANT]` |
| `[C-W-POLARPLOT]` | `widgets/AntennaPolarPlot.svelte` | — (Bühne von `[C-W-POLAR]`) | `[R-WISS-ANT]` |
| `[C-W-PARAB]` | `widgets/ParabolicGainCalculator.svelte` | `[U-ANTMATH]`, `[D-ANT]` | `[R-WISS-ANT]` |
| `[C-W-SWR]` | `widgets/SwrWidget.svelte` | `[U-ANTMATH]` | `[R-WISS-ANT]` |

**Der Katalog `[D-WIDGETS]` führt 20 Widgets**, alle mit Deep-Link (`?w=`) und Suchtreffer. Zwei Einbauarten, unterschieden über `embed`:

- **`content` (14 IDs, in `[C-WIDGREG]` registriert)** — stehen als `widget`-Block in den Kapiteldaten und werden von `[C-ARTBLOCK]` gerendert: `radar-pulse`, `doppler`, `rcs-comparison`, `fmcw`, `blind-speed`, `ssr-interrogation`, `fresnel`, `decibel`, `attenuation-windows`, `propagation-sandbox`, `em-wave`, `field-strength`, `wave-propagation-diagram`, `ionospheric-propagation` (die letzten beiden liegen in `charts/`). Typ: `WidgetId`.
- **`markup` (6 IDs, Typ `MarkupWidgetId`)** — stehen direkt in den Seitenkomponenten von `[R-WISS-MOD]` und `[R-WISS-ANT]` und tragen ihre Anker-ID (`widgetAnchorId`) dort von Hand: `modulation-visualizer`, `constellation`, `carson`, `antenna-pattern`, `parabolic-gain`, `swr`.

`CatalogWidgetId = WidgetId | MarkupWidgetId` ist der Schlüssel des Katalogs.

### Seiteneigene Komponenten (`src/routes/`)

- **`[C-SEARCHCTRL]`** — `suche/SearchControls.svelte` — Suchfeld, Filter-Chips je Typ mit Anzahl, Live-Region mit Trefferzahl.
- **`[C-SEARCHRES]`** — `suche/SearchResults.svelte` — gruppierte Trefferliste, Frequenz-Modus, Nulltrefferzustand mit Vorschlägen.
- **`[C-SEARCHPAGE]`** — `suche/searchPage.ts` — reine Logik: `resultGroups`, `filterGroups`, `countEntries`, `frequencyResult`, `SEARCH_SUGGESTIONS`, `MAX_RESULTS`.
- **`[C-GLOSSCTRL]`** — `wissen/glossar/GlossaryControls.svelte` — Suchfeld, Kategorie-Chips, A–Z-Sprungleiste.
- **`[C-GLOSSLIST]`** — `wissen/glossar/GlossaryList.svelte` — `<dl>` mit Anker-IDs, Verwandt-Links und Quellenangabe.
- **`[C-DBBANDTAB]`** — `datenbanken/frequenzbaender/BandTable.svelte` · `[C-DBBANDDET]` `BandDetails.svelte` · `bandCategories.svelte.ts` — Tabelle, Detailkarte und Kategorienlogik der Bänder-Datenbank.

---

## Datenmodule (`src/lib/data/`, 28 Module + 2 JSON)

Statische Daten, Konstanten und Presets. Frequenzen durchgängig als Zahl **in Hertz**. Keine Magic Numbers in Komponenten. Herkunft und Unsicherheiten: `docs/DATENQUELLEN.md` und `[R-SERV-QUELL]`.

| ID | Datei | Wichtigste Exporte | Umfang |
|---|---|---|---|
| `[D-NAV]` | `navigation.ts` | `NAV_TREE`, `NAV_GROUPS`, `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `pageMeta()`, `findNode()`, `getBreadcrumbs()`, `getHubChildren()`, `getSiblings()`, `getLiveNodes()`, `normalizeHref()`, `flattenNav()`, `isActivePath()` | **52 Knoten** (1 `hidden`), 5 Menügruppen mit 9 Spalten |
| `[D-REL]` | `relations.ts` | `RELATIONS`, `getRelatedTopics()` | **51 Quellseiten** mit je 3–6 Verweisen, Rückverweise zur Laufzeit |
| `[D-SEARCH]` | `searchIndex.ts` | `SEARCH_INDEX`, `LIVE_SEARCH_INDEX`, `SEARCH_GROUPS` | **389 Einträge in 7 Gruppen** (41 Seiten, 10 Werkzeuge, 20 Widgets, 72 Bänder, 105 Funkdienste, 37 Sender, 104 Glossareinträge) |
| `[D-WIDGETS]` | `widgets.ts` | `WIDGET_META`, `WIDGET_ENTRIES`, `KNOWN_WIDGET_IDS`, `WIDGET_PARAM`, `widgetAnchorId()`, `widgetHref()`, `parseWidgetParam()`, `widgetLocations()`, `findWidget()` | **20 Widgets** (Schlüssel `CatalogWidgetId`) mit Bezeichnung, Beschreibung, Stichworten und Kapitel — **ohne** Komponentenimporte; `embed: 'markup'` kennzeichnet die sechs Widgets, die direkt in der Seitenkomponente stehen |
| `[D-LEARN]` | `learningPaths.ts` | `LEARNING_PATHS`, `LEVEL_LABELS`, `LEVEL_TONES`, `findLearningPath()`, `learningPathHref()`, `resolvePathSteps()`, `learningPathsForHref()` | **4 Pfade mit 30 Schritten** (8/7/8/7, je einer optional); `durationMin` ist als `Annahme:` gekennzeichnet |
| `[D-GLOSS]` | `glossary.ts` | `GLOSSARY`, `GLOSSARY_SORTED`, `GLOSSARY_CATEGORIES`, `GLOSSARY_LETTERS`, `GLOSSARY_COVERED_TITLES` | **92 Begriffe in 7 Kategorien**, elf Kurztexte aus `[D-EXPLAIN]` eingebunden statt kopiert |
| `[D-BANDS]` | `bands.ts` | `ITU_BANDS` (12), `IEEE_BANDS` (12), `NATO_BANDS` (15), `CIVILIAN_BANDS` (43), `DE_ALT_BANDS` (10), `US_ALT_BANDS` (11), `EU_NATO_BANDS` (13), `EM_BANDS` (7), `ALL_BANDS`, `getBandsForFrequency()`, `formatFrequencyRange()` | **123 Bänder** gesamt |
| `[D-FREQBANDS]` | `frequencyBands.ts` | `ITU_FREQUENCY_BANDS` (12), `IEEE_FREQUENCY_BANDS` (13), `NATO_FREQUENCY_BANDS` (15), `AMATEUR_FREQUENCY_BANDS` (15), `BROADCAST_FREQUENCY_BANDS` (17), `ALL_FREQUENCY_BANDS`, `FREQUENCY_LIMITS`, `getBandByFrequency()`, `searchBands()` | **72 Bänder** mit Eigenschaften und Anwendungen |
| `[D-SPECTRUM]` | `spectrum.ts` | `SPECTRUM_MIN_HZ`, `SPECTRUM_MAX_*`, `VISIBLE_LIGHT`, `CHART_*_RANGES` | Spektrumgrenzen und Chart-Bereiche. Der frühere zweite `EM_BANDS`-Export ist gelöscht (P1-5); verbindlich sind `EM_BANDS` aus `[D-BANDS]` und `EXTENDED_EM_BANDS` aus `[C-SPECBANDS]` |
| `[D-CONST]` | `constants.ts` | `SPEED_OF_LIGHT`, `BOLTZMANN_CONSTANT`, `PLANCK_CONSTANT`, `FREE_SPACE_IMPEDANCE`, `IONIZING_BOUNDARY_WAVELENGTH`, `EARTH_RADIUS_*`, `IONOSPHERIC_LAYERS` (4), `ATMOSPHERIC_ABSORPTION_PEAKS` (5), `SEAWATER_PENETRATION` (6), `RCS_REFERENCE` (12), `NOISE_TEMPERATURES` | physikalische Konstanten mit Quelle |
| `[D-UNITS]` | `units.ts` | `FREQUENCY_UNITS`, `WAVELENGTH_UNITS`, `POWER_UNITS_WATT`, `POWER_UNITS_DB`, `DISTANCE_UNITS`, `ATTENUATION_UNITS`, `*_FACTORS`, `getUnitById()` | einzige Quelle der Umrechnungsfaktoren |
| `[D-PRESETS]` | `presets.ts` | `FREQUENCY_CONVERTER_PRESETS`, `FSPL_FREQUENCY_PRESETS`, `FSPL_CHART_FREQUENCIES`, `DISTANCE_PRESETS_METERS`, `LINK_BUDGET_PRESETS`, `POWER_CHART_CATEGORY_*` | — |
| `[D-EXPLAIN]` | `explanations.ts` | 23 `Explanation`-Objekte plus `fsplExplanations`, `linkBudgetExplanations`, `bandExplanations`, `atmosphericExplanations`, `spectrumExplanations` | Tooltiptexte |
| `[D-PROP]` | `propagation.ts` | `PROPAGATION_MODES` (5), `FREQUENCY_BAND_PROPAGATION` (6), `LAYER_VISUALIZATIONS` (4), `PROPAGATION_SCENARIOS` (5), `horizonFactor()`, `horizonDistanceKm()`, `losDistanceKm()`, `calculateRadioHorizon()`, `calculateSkipDistance()`, `estimateMUF()` | Ausbreitung und Radiohorizont |
| `[D-ITU676]` | `itu676Lines.ts` | `O2_LINES` (44), `H2O_LINES` (35) | Linienkatalog ITU-R P.676-13 Annex 1 |
| `[D-APPS]` | `applications.ts` + `applications.json` | `ALL_APPLICATIONS`, 12 Kategorielisten, `APPLICATIONS_BY_CATEGORY`, `CATEGORY_NAMES`, `getApplicationsForFrequency()` | **105 Frequenzzuweisungen** |
| `[D-TX]` | `transmitters.ts` + `transmitters.json` | `ALL_TRANSMITTERS`, `TIME_SIGNAL_TRANSMITTERS`, `BROADCAST_TRANSMITTERS`, `NAVIGATION_TRANSMITTERS`, `SCIENCE_TRANSMITTERS`, `AMATEUR_TRANSMITTERS`, `UTILITY_TRANSMITTERS`, `searchTransmitters()` | **37 Sender** |
| `[D-SERVICES]` | `radioServices.ts` | `RADIO_SERVICES`, `RADIO_SERVICE_GROUP_LABELS` (9), `getServicesForFrequency()` | **18 Funkdienste mit 93 Zuweisungen** |
| `[D-AFU]` | `amateurBands.ts` | `AMATEUR_BANDS`, `powerLimits`/`powerSubranges`/`licenseNote`/`sourceRef` je Band, `POWER_*`-Konstanten, `getBandsForLicenseClass()` | **22 Bänder** (2200 m – 1,2 cm), verifiziert gegen AFuV Anlage 1 |
| `[D-MOBILE]` | `mobileNetworks.ts` | `MOBILE_GENERATIONS` (6), `MOBILE_BANDS` (13), `getMobileBandsForFrequency()` | 1G–6G, B28/n28 … n260 |
| `[D-BROADCAST]` | `broadcast.ts` | `BROADCAST_RANGES` (3), `SHORTWAVE_BANDS` (15), `DAB_BLOCKS` (**41**), `DAB_BLOCKS_DE` (**32**), `DVBT2_CHANNELS` (28), `SATELLITE_TV_BANDS` (4), `getDabBlockRange()` | Kanalraster und Bandgrenzen |
| `[D-EMERG]` | `emergencyFrequencies.ts` | `EMERGENCY_FREQUENCIES`, `getEmergencyFrequenciesByDomain()`, `findEmergencyFrequenciesNear()` | **27 Einträge** (See, Luft, Land, Satellit, Amateur, Jedermann) |
| `[D-MARITIME]` | `maritimeChannels.ts` | `MARITIME_VHF_CHANNELS` (**59**), `MARITIME_HF_FREQUENCIES` (21), `GMDSS_SEA_AREAS` (4), `MARITIME_USAGE_LABELS` | Appendix 18 / Appendix 15, Duplexablage 4,6 MHz |
| `[D-AVIATION]` | `aviationBands.ts` | `AVIATION_BANDS` (15), `AVIATION_HF_SEGMENTS` (11), `aviationChannelFromDesignator()`, `aviationChannelFromFrequency()`, `VHF_SPACING_833_HZ` | 8,33-kHz-Kanalregel in beide Richtungen |
| `[D-SAT]` | `satelliteSystems.ts` | `ORBIT_CLASSES` (4), `SATELLITE_BANDS` (6, mit `uplinkAbove`-Ausnahme S-Band), `SATELLITE_SYSTEMS` (10), `SATELLITE_CATEGORY_LABELS` | Inmarsat … QO-100 |
| `[D-MODUL]` | `modulation.ts` | `MODULATIONS`, `carsonBandwidthHz()`, `fmModulationIndex()`, `bitsPerSymbol()`, `spreadingGainDb()` | **16 Verfahren** (AM … LoRa/CSS) |
| `[D-ANT]` | `antennas.ts` | `ANTENNA_TYPES`, `GAIN_DIPOLE_DBI`, `parabolicGainDbi()`, `parabolicDiameterM()`, `arrayGainDbi()`, `dbdToDbi()` | **10 Antennentypen** |
| `[D-HIST]` | `history.ts` | `HISTORICAL_EVENTS`, `CATEGORY_CONFIG` (8) | **48 Meilensteine** |

---

## Content-Module (`src/lib/content/`, 31 Dateien)

Die Wissen-Kapitel halten ihren Text **als Daten**, nicht im Markup. Das hält die Routen klein, macht Struktur und Anker testbar und lässt jeden Abschnitt von denselben Komponenten rendern. Kapitel mit mehreren Unterseiten liegen in einem Unterordner; `widgetLocations()` (`[D-WIDGETS]`) globt `'/src/lib/content/**/*.ts'` und findet sie dadurch automatisch.

| ID | Datei | Export | Umfang |
|---|---|---|---|
| `[K-TYPES]` | `types.ts` | `KnowledgeArticle`, `ArticleSection`, `ArticleBlock` (paragraph, list, formula, callout, table, definitions, cards, widget, question), `WidgetId` | kanonisches Kapitelmodell |
| `[K-GRUND]` | `grundlagen/index.ts` | `grundlagenHub` | Hub: 3 Abschnitte, 4 Lernziele |
| `[K-EMW]` | `grundlagen/em-wellen.ts` (+ `.sections.ts`, `.data.ts`) | `emWellenArticle` | 7 Abschnitte, 6 Lernziele, Widget `em-wave` |
| `[K-DEZ]` | `grundlagen/dezibel.ts` | `dezibelArticle` | 6 Abschnitte, 6 Lernziele, Widget `decibel` |
| `[K-PEGEL]` | `grundlagen/leistung-und-pegel.ts` | `leistungUndPegelArticle` | 7 Abschnitte, 6 Lernziele, Widget `field-strength` |
| `[K-WELL]` | `wellenausbreitung.ts` | `wellenausbreitungArticle` | 8 Abschnitte, Widgets `wave-propagation-diagram`, `propagation-sandbox`, `fresnel`, `attenuation-windows` |
| `[K-ION]` | `ionosphaere.ts` | `ionosphaereArticle` | 5 Abschnitte, Widgets `ionospheric-propagation`, `propagation-sandbox` |
| `[K-MATH]` | `mathematik.ts` | `mathematikArticle` | 6 Abschnitte, Widgets `decibel`, `propagation-sandbox` |
| `[K-RADARHUB]` | `radar/index.ts` | `radarHubArticle` | Hub: 3 Abschnitte, 5 Lernziele |
| `[K-RADARGRUND]` | `radar/grundlagen.ts` | `radarGrundlagenArticle` | 5 Abschnitte, Widgets `radar-pulse`, `rcs-comparison` |
| `[K-RADARVERF]` | `radar/verfahren.ts` (+ `verfahrenSignal.ts`) | `radarVerfahrenArticle` | 7 Abschnitte, Widgets `doppler`, `blind-speed`, `fmcw` |
| `[K-RADARSSR]` | `radar/sekundaerradar.ts` | `radarSekundaerArticle` | 5 Abschnitte, Widget `ssr-interrogation` |
| `[K-RADARTAB]` | `radar/tables.ts` | berechnete Tabellen (PRF, Auflösung, Bänder) | keine getippten Zahlen |
| `[K-RADAR]` | `radar.ts` | Sammelmodul: re-exportiert die vier Radar-Artikel, `radarArticle` = Hub | Rückwärtskompatibilität |
| `[K-MOD]` | `modulation.ts` | `MODULATION_GOALS` (6), `MODULATION_TOC` (10), `MODULATION_TEXT`, `MODULATION_FORMULAS`, `MODULATION_CLASS_LABELS` | Text und Formeln für `[R-WISS-MOD]` |
| `[K-ANT]` | `antennen.ts` | `ANTENNA_GOALS` (6), `ANTENNA_TOC` (8), `ANTENNA_TEXT`, `ANTENNA_FORMULAS`, `ANTENNA_CATEGORY_LABELS` | Text und Formeln für `[R-WISS-ANT]` |
| `[K-FUNKTYPES]` | `funktechnik/types.ts` | `ContentBlock` (p, ul, ol, dl, callout, formula, table), `ArticleSection`, `tocItems()`, `findSection()`, `sectionIds()` | knapperes Blockmodell der Funktechnik-Kapitel |
| `[K-FUNKADAPT]` | `funktechnik/adapt.ts` | `toArticleBlock()`, `toArticleSection()`, `articleSections()`, `articleSection()` | Brücke auf `[K-TYPES]` |
| `[K-FUNKDIENST]` | `funktechnik/funkdienste.ts` | `LEARNING_GOALS` (5), `SECTIONS` (6) | `[R-WISS-FUNK-DIENST]` |
| `[K-FUNKAFU]` | `funktechnik/amateurfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (6) | `[R-WISS-FUNK-AFU]` |
| `[K-FUNKMOBIL]` | `funktechnik/mobilfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (5) | `[R-WISS-FUNK-MOBIL]` |
| `[K-FUNKRUND]` | `funktechnik/rundfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (5) | `[R-WISS-FUNK-RUND]` |
| `[K-FUNKSEE]` | `funktechnik/seefunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (7) | `[R-WISS-FUNK-SEE]` |
| `[K-FUNKFLUG]` | `funktechnik/flugfunk.ts` | `LEARNING_GOALS` (5), `SECTIONS` (6) | `[R-WISS-FUNK-FLUG]` |
| `[K-FUNKBOS]` | `funktechnik/bos.ts` | `LEARNING_GOALS` (6), `SECTIONS` (5) | `[R-WISS-FUNK-BOS]` |
| `[K-FUNKSAT]` | `funktechnik/satellitenfunk.ts` | `LEARNING_GOALS` (6), `SECTIONS` (5) | `[R-WISS-FUNK-SAT]` |
| `[K-FUNKNOT]` | `funktechnik/notfrequenzen.ts` | `LEARNING_GOALS` (5), `SECTIONS` (4) | `[R-WISS-FUNK-NOT]` |
| `[K-QUELLEN]` | `funktechnik/quellen.ts` | `SECTIONS` (5) | `[R-SERV-QUELL]`: Haftungshinweis, Regelwerke, Normen, Datensätze, Unsicherheiten |

---

## Utilities (`src/lib/utils/`, 17 Module)

Zentrale Funktionen. **Keine Duplikate in Komponenten** — λ = c/f, Formatierer, Pegelrechnung und Einheitenfaktoren existieren jeweils genau einmal.

- **`[U-CALC]`** — `calculations.ts` — `frequencyToWavelength()`, `wavelengthToFrequency()`, `calculateFSPL()`, `calculateRange()`, `calculateSkinDepth()`, `calculateSkinDepthWithValidity()`, `calculateFresnelRadius()`, `calculateShannonCapacity()`, `calculateThermalNoiseDbm()`, `getFsplConstant()`
- **`[U-CONV]`** — `conversions.ts` — `convertToHz()`, `convertFromHz()`, `convertToMeters()`, `wattToDbm()`, `dbmToWatt()`, `wattToDbW()`, `convertToWatt()` (Faktoren aus `[D-UNITS]`)
- **`[U-FMT]`** — `formatting.ts` — `NUMBER_LOCALE` (`'de-DE'`), `formatLocaleNumber()`, `formatFixed()`, `formatExponential()` als Basis; darauf `formatNumber()`, `formatNumberAuto()`, `formatPrecisionNumber()`, `formatRcs()`, `formatFrequency()`, `formatWavelength()`, `formatDistance()`, `formatPowerDbm()`, `formatAttenuation()`, `formatDataRate()`, `formatPercentage()`, `formatAngle()`, `formatTemperature*()`, `formatPressure()`
- **`[U-HAND]`** — `handlers.ts` — `parseLocaleNumber()` (Komma **und** Punkt), `parseNumericInput()` und Varianten, `createNumericHandler()`, `clamp()`, `isInRange()`, `safeDivide()`, `safeLog()`, `safePow()`, `debounce()`
- **`[U-CONST]`** — `constants.ts` — `SPEED_OF_LIGHT_EXACT`, `SPEED_OF_LIGHT_ROUNDED` und ihre Anzeigeformen
- **`[U-ATMO]`** — `atmosphericAttenuation.ts` — Regen (P.838-3), Nebel (P.840), Schnee (nass/trocken), Pfad- und Erde–Raum-Dämpfung, Kurvengeneratoren
- **`[U-ITU676]`** — `itu676.ts` — ITU-R P.676-13 Annex 1 line-by-line: `oxygenSpecificAttenuation()`, `waterVaporSpecificAttenuation()`, `specificGasAttenuation()`, `equivalentHeights()`, `slantPathGasAttenuation()`
- **`[U-RADAR]`** — `radar.ts` — `calculateRadarMaxRange()`, `calculateRadarReceivedPowerDbm()`, `calculateDopplerShift()`, `calculateRangeResolution()`, `calculateUnambiguousRange()`, `calculateUnambiguousVelocity()`, `calculateBandwidthRangeResolution()`, `calculateBeatFrequency()`, `calculateBlindSpeed()`, `calculateStaggeredBlindSpeed()`, `calculateCompressionGain()`
- **`[U-FRESNEL]`** — `fresnelMath.ts` — `calculateFresnelParameter()`, `calculateKnifeEdgeLoss()`, `evaluateFresnelClearance()`
- **`[U-MODMATH]`** — `modulationMath.ts` — `generateWaveform()`, `amEnvelope()`, `besselJ()`, `spectrumLines()`, `occupiedBandwidthHz()`, `constellationPoints()`, `noisyConstellation()`, `grayEncode()`, `requiredSnrDb()`
- **`[U-ANTMATH]`** — `antennaMath.ts` — `effectiveApertureM2()`, `farFieldDistanceM()`, `patternField()`, `samplePattern()`, `halfPowerBeamwidthDeg()`, `frontToBackRatioDb()`, `vswrFromReflection()`, `mismatchLossDb()`, Re-Exporte `parabolicGainDbi()`, `parabolicDiameterM()`, `dbiToDbd()`, `GAIN_DIPOLE_DBI`
- **`[U-DECIBEL]`** — `decibel.ts` — **einzige Quelle der Pegelrechnung**: `dbToPowerRatio()`, `powerRatioToDb()`, `dbToVoltageRatio()`, `buildDecibelTable()`, `dbmToDbw()`, `dbmToDbuv()` (mit Impedanz), `levelsFromDbm()`, `accumulateChain()`, `chainTotalDbm()`. `widgets/DecibelModel.ts` re-exportiert sie.
- **`[U-FIELD]`** — `fieldStrength.ts` — `eirpWatt()`, `erpWatt()`, `powerDensityWattPerM2()`, `fieldStrengthVPerM()`, `fieldStrengthDbuvPerM()`, `magneticFieldAPerM()`, `receivedPowerWatt()`, `computeFieldStrength()`, `FIELD_STRENGTH_FACTOR = Z₀/4π`
- **`[U-ORBIT]`** — `orbitMath.ts` — `orbitalPeriod()`, `orbitalVelocity()`, `altitudeForPeriod()`, `slantRange()`, `centralAngle()`, `footprintRadius()`, `coverageFraction()`, `propagationDelay()`, `roundTripDelay()`, `visibilityDuration()`, `maxDopplerShift()`, `figureOfMerit()`, `summarizeOrbit()`
- **`[U-SEARCH]`** — `search.ts` — `scoreEntry()`, `searchEntries()`, `searchGrouped()`, `parseFrequencyQuery()`, `entriesForFrequency()`, `TYPE_WEIGHT`/`TYPE_BONUS` (Werkzeug/Seite > Widget > Band/Dienst/Sender > Glossar)
- **`[U-SLUG]`** — `slug.ts` — `transliterate()` (ä → ae), `slugify()`, `normalizeForSearch()`, `humanizeSegment()`
- **`[U-URL]`** — `urlState.svelte.ts` — `ParamSpecs`, `readParams()`, `buildSearch()`, `buildUrl()`, `hasNonDefaults()`, `defaultValues()`, `buildShareLink()`, Klasse `UrlStateSync` (entprellte History-Synchronisierung). Serialisiert maschinenlesbar mit Punkt (`?f=2.4e9`) — die deutsche Schreibweise gilt nur für die Anzeige.

---

## Stores (`src/lib/stores/`)

Anwendungsweiter Zustand mit Svelte-5-Runes.

- **`[S-LIGHT]`** — `speedOfLight.svelte.ts` — exaktes c (299 792 458 m/s) oder gerundetes c (3·10⁸ m/s); wird von allen Umrechnungen gelesen.
- **`[S-ATMO]`** — `atmosphericParameters.svelte.ts` — Temperatur, Druck, Wasserdampfdichte, Regen-/Nebel-/Schneerate, Polarisation, Elevation. Geschrieben von `[C-ATMINPUT]`, gelesen von `[C-ATTEN]`.

Der Lernfortschritt `[C-LEARNPROG]` ist bewusst **kein** Store unter `stores/`, sondern liegt bei seinen Komponenten: er ist gerätelokal (`localStorage`), ohne Konto und ohne Export.

---

## Wie die Teile zusammenspielen

```
Eingabe → [U-HAND] parst → [U-CALC] / [U-CONV] / [U-ATMO] / [U-RADAR] / [U-DECIBEL] rechnet
                                       │
                     ┌─────────────────┼─────────────────┐
                     ▼                 ▼                 ▼
                [U-FMT]           [C-CHARTFRAME]     [S-LIGHT]
                formatiert        + d3-Diagramm      [S-ATMO]
                → de-DE-Text      → SVG              globaler Zustand
                                       │
                                  [U-URL] schreibt ?f=… in die Adresszeile
```

**Navigation:** `[D-NAV]` → `[C-HEADER]`/`[C-MEGA]`/`[C-MOBILE]`, `[C-BREAD]`, `[C-ARTPAG]`, Hub-Kacheln, `[R-SERV-MAP]`, `[C-PORTCONTENT]` · `[D-SEARCH]` → `[C-PALETTE]`, `[R-SUCHE]` · `[D-REL]` → `[C-RELTOP]` · `pageMeta()` → `+page.ts` → `[C-META]`.

**Widgets:** `[D-WIDGETS]` → Suchindex und `?w=`-Deep-Links · `[C-WIDGREG]` → Komponente · `[C-WIDGCTX]` → `[C-WIDGFRAME]` („Link zum Widget kopieren").

**Lernpfade:** `[D-LEARN]` → `[C-LEARNCARD]`/`[C-LEARNSTEPS]`/`[C-PORTPATHS]`, `[C-LEARNPROG]` → `[C-LEARNBAR]` im Wurzel-Layout.

**Store-Verbindungen:** `[S-LIGHT]` → `[C-FREQCONV]`, `[C-RANGE]`, `[C-SPECTRUM]` und alle Rechner mit c. `[S-ATMO]` → `[C-ATTEN]`, `[C-LINKBUDGET]`.

**Datenquellen:** `[D-BANDS]`/`[D-FREQBANDS]` → `[C-SPECTRUM]`, `[C-BANDSIDE]`, `[R-DB-FREQ]` · `[D-SERVICES]` → `[C-SERVBAR]` · `[D-AFU]` → `[C-AFUPLAN]` · `[D-MOBILE]` → `[C-MOBGEN]`, `[C-MOBTAB]` · `[D-BROADCAST]` → `[C-CHANCONV]`, `[C-SWTAB]` · `[D-EMERG]` → `[C-EMTAB]` · `[D-MARITIME]` → `[C-MARCONV]`, `[C-MARTAB]`, `[C-MARDIST]`, `[C-MARAREA]` · `[D-AVIATION]` → `[C-AVICALC]`, `[C-AVITAB]` · `[D-SAT]`/`[U-ORBIT]` → `[C-ORBIT]`, `[C-SATBAND]`, `[C-SATSYS]` · `[D-APPS]` → `[C-APPDB]`, `[C-APPOVER]` · `[D-TX]` → `[C-TXDB]` · `[D-HIST]` → `[C-TIMELINE]` · `[D-GLOSS]` → `[R-WISS-GLOS]`, `[D-SEARCH]`.

---

## Tests (`src/tests/`)

**62 Testdateien** (`npx vitest run`), Umgebung jsdom. `setup.ts` ist die Testumgebung und enthält selbst keine Tests, `helpers/bindableHost.svelte.ts` ist ein Prüfhelfer für `$bindable`-Props. Stand Abschluss Welle 5: **2332 Tests**, beim letzten Lauf für diese Dokumentation 2355. Die Zahl wächst mit jedem neuen Modul — verbindlich ist der Lauf, nicht der Eintrag hier.

| ID | Datei | Prüft |
|---|---|---|
| `[T-CALC]` | `calculations.test.ts` | `[U-CALC]` — FSPL, λ, Reichweite, Skin-Tiefe, Shannon |
| `[T-CONV]` | `conversions.test.ts` | `[U-CONV]` |
| `[T-FMT]` | `formatting.test.ts` | `[U-FMT]` — deutsche Schreibweise, Gruppierung, Sonderfälle |
| `[T-HAND]` | `handlers.test.ts` | `[U-HAND]` — `parseLocaleNumber` mit allen Trennerregeln |
| `[T-ATMO]` | `atmosphericAttenuation.test.ts` | `[U-ATMO]` — Regen, Nebel, Schnee, Pfad |
| `[T-ITU676]` | `itu676.test.ts` | `[U-ITU676]` gegen Referenzwerte |
| `[T-RADAR]` | `radar.test.ts` | `[U-RADAR]` inkl. FMCW, Blindgeschwindigkeit, Pulskompression |
| `[T-FRESNEL]` | `fresnelMath.test.ts` | `[U-FRESNEL]` |
| `[T-MODMATH]` | `modulationMath.test.ts` | `[U-MODMATH]` |
| `[T-ANTMATH]` | `antennaMath.test.ts` | `[U-ANTMATH]` |
| `[T-DECIBEL]` | `decibel.test.ts` | `[U-DECIBEL]` — Verhältnisse, Absolutpegel, Ketten |
| `[T-FIELD]` | `fieldStrength.test.ts` | `[U-FIELD]` — 1/d- und 1/d²-Gesetz, Roundtrips, EIRP/ERP |
| `[T-ORBIT]` | `orbitMath.test.ts` | `[U-ORBIT]` — GEO-Höhe, Sichtbarkeit, Doppler |
| `[T-SEARCH]` | `search.test.ts` | `[U-SEARCH]` — Ranking Werkzeug/Seite > Widget > Glossar |
| `[T-SEARCHIDX]` | `searchIndex.test.ts` | `[D-SEARCH]` — Gruppenreihenfolge, Widget-Ziele, `hidden`-Regel |
| `[T-SUCHE]` | `suche.test.ts` | `[C-SEARCHPAGE]` — Gruppierung, Filter, Zähler, Vorschläge |
| `[T-SLUG]` | `slug.test.ts` | `[U-SLUG]` |
| `[T-URL]` | `urlState.test.ts` | `[U-URL]` |
| `[T-CONSTS]` | `constants.test.ts` | `[D-CONST]`, `[U-CONST]` |
| `[T-UNITS]` | `units.test.ts` | `[D-UNITS]` |
| `[T-BANDS]` | `bands.test.ts` | `[D-BANDS]`, `formatFrequencyRange()` |
| `[T-EMBANDS]` | `spectrum-emBands.test.ts` | `data/spectrum.ts` exportiert keine zweite Bänderliste mehr; lückenlose Abdeckung von `EXTENDED_EM_BANDS` |
| `[T-SPECZOOM]` | `spectrumZoom.test.ts` | `[C-SPECZOOM]` — Bildmitte bleibt beim Zoomen stehen, Randklemmung |
| `[T-SPECFMT]` | `spectrumFormat.test.ts` | `[C-SPECFMT]` — Regression gegen die alte Implementierung über 40 Dekaden |
| `[T-PRESETS]` | `presets.test.ts` | `[D-PRESETS]` |
| `[T-PROP]` | `propagation.test.ts` | `[D-PROP]` |
| `[T-NAV]` | `navigation.test.ts` | `[D-NAV]` — Trailing Slash, eindeutige IDs, Baumkonsistenz, `hidden`-Regel |
| `[T-PORTAL]` | `portal.test.ts` | `[R-HOME]` — Bereichskacheln, Anker, Icons |
| `[T-MEGA]` | `layout-megaMenu.test.ts` | `[C-HEADERLOGIC]` — aktive Gruppe, Fokusaustritt, Tastaturführung im Mega-Menü |
| `[T-LEARN]` | `learningPaths.test.ts` | `[D-LEARN]` — jeder Schritt ist ein lebender Knoten |
| `[T-LEARNPROG]` | `learningProgress.test.ts` | `[C-LEARNPROG]` — Schema, Fremdwerte, Fortschrittsrechnung |
| `[T-GLOSS]` | `glossary.test.ts` | `[D-GLOSS]` — eindeutige IDs, gültige Verweise, Suchkopplung |
| `[T-WIDGREG]` | `widgetRegistry.test.ts` | `[C-WIDGREG]`/`[D-WIDGETS]` — Komponente je Eintrag, Kapitel belegt, `?w=`-Parser |
| `[T-RADIODATA]` | `radioData.test.ts` | Funkdatensätze auf Struktur und Plausibilität (AFuV, DAB) |
| `[T-RADIOCORR]` | `radioDataCorrections.test.ts` | Die Datenkorrekturen aus Welle 1 |
| `[T-CALCLOGIC]` | `calculators-logic.test.ts` | Logikmodule der Rechner |
| `[T-CALCANT]` | `calculators-antennengewinn.test.ts` | `[C-ANTGAIN]` — 1 m, 10 GHz, η = 0,55 → 37,81 dBi |
| `[T-CALCHOR]` | `calculators-radiohorizont.test.ts` | `[C-HORIZON]` — 4,12·√h und 3,57·√h |
| `[T-CALCDB]` | `calculators-dezibel.test.ts` | `[C-DECIBEL]` — 1 W = 30 dBm = 0 dBW = 136,99 dBµV |
| `[T-FREQCONV]` | `components-FrequencyConverter.test.ts` | `[C-FREQCONV]` — Sollverhalten des `$bindable`-Syncs |
| `[T-POWCONV]` | `components-PowerConverter.test.ts` | `[C-POWCONV]` — dito |
| `[T-FUNKINH]` | `funk-inhalte.test.ts` | Struktur und Anker der Funktechnik-Kapitel |
| `[T-FUNKNAV]` | `funk-navigation.test.ts` | Kapitel sind in `[D-NAV]` und `[D-REL]` verdrahtet |
| `[T-FUNKAFU]` | `funk-amateurfunk.test.ts` | Bandplan-Logik, Leistungsgrenzen je Klasse |
| `[T-FUNKMOBIL]` | `funk-mobilfunk.test.ts` | Mobilfunk-Bandlogik |
| `[T-FUNKKANAL]` | `funk-kanaele.test.ts` | DAB-/DVB-T2-/UKW-Kanalumrechnung |
| `[T-FUNKFILT]` | `funk-filter.test.ts` | Filterlogik von `[C-APPDB]` und `[C-EMTAB]` |
| `[T-FUNKSPEK]` | `funk-spektrum.test.ts` | Skalen- und Segmentgeometrie der Spektrumleisten |
| `[T-FUNKSEE]` | `funk-seefunk.test.ts` | `[D-MARITIME]` — Verschachtelung, Duplexablage, Leistungsgrenzen |
| `[T-FUNKFLUG]` | `funk-flugfunk.test.ts` | `[D-AVIATION]` — 8,33-kHz-Regel als Rundlauf |
| `[T-FUNKBOS]` | `funk-bos.test.ts` | BOS-Bänder, Raster, TETRA gegen `[D-EMERG]` |
| `[T-FUNKSAT]` | `funk-satellit.test.ts` | `[D-SAT]` — Up-/Downlink-Regel und S-Band-Ausnahme |
| `[T-WMOUNT]` | `widgets-mount.test.ts` | SSR-Rendering der Widgets und `[C-ARTLAY]` |
| `[T-WRADAR]` | `widgets-radar.test.ts` | Radar-Widget-Modelle |
| `[T-WRADAR2]` | `widgets-radar2.test.ts` | FMCW, Blindgeschwindigkeiten, SSR-Impulslagen, Squawk-Bitmuster |
| `[T-WGRUND]` | `widgets-grundlagen.test.ts` | `EmWaveModel`, Feldstärke-Widget, Kapiteldaten der Grundlagen |
| `[T-WPROP]` | `widgets-propagation.test.ts` | Ausbreitungs-Widget-Modelle |
| `[T-UIICON]` | `ui-icons.test.ts` | Icon-Katalog vollständig und konsistent |
| `[T-UINUM]` | `ui-numberInput.test.ts` | `[C-NUMLOGIC]` — Parsen, `pickBestUnit`, Feldformat |
| `[T-BANDDET]` | `bandDetail.test.ts` | `[C-BANDLOGIC]` |
| `[T-ADAPT]` | `contentAdapter.test.ts` | `[K-FUNKADAPT]` |
| `[T-CONV-RULES]` | `conventions.test.ts` | **Hausordnung**: Komponentengröße ≤ 300 Zeilen, Tokens statt Hex-Farben, Trailing Slash in der Navigations-Registry — jeweils mit begründeter Ausnahmeliste |

---

## Konventionen

### 1. `navigation.ts` ist die einzige Quelle für Seiten

Jede neue Seite braucht **zuerst** einen Knoten in `NAV_TREE` (`[D-NAV]`): `id`, `label`, `href` **mit** Trailing Slash, `description`, `icon`, `keywords`, `status`. Daraus ziehen automatisch: Mega-Menü, Mobile-Menü, Breadcrumb, Hub-Kacheln, Sitemap-Seite, Suchindex, Kapitel-Blättern und Seitentitel. Es gibt **keine** zweite Label- oder Kachelliste.

`status: 'geplant'` markiert angekündigte Seiten: sie erscheinen ausgegraut und werden nicht verlinkt. `hidden: true` markiert Seiten, die es gibt, die aber keinen Platz in der Navigation haben (`[R-SUCHE]`): kein Menüeintrag, keine Hub-Kachel, kein Suchindexeintrag, aber weiterhin in der Sitemap.

### 2. `pageMeta()` statt `<svelte:head>`

```ts
// src/routes/wissen/antennen/+page.ts
import { pageMeta } from '$lib/data/navigation';
export const load = () => pageMeta('/wissen/antennen/');
```

Titel und Beschreibung kommen aus dem Navigationsknoten; `[C-META]` im Root-Layout erzeugt daraus als **einzige** Stelle `<title>`, `description`, `canonical`, `og:*`, `twitter:*` und die JSON-LD-Breadcrumbs. Abweichungen als Overrides: `pageMeta('/…/', { title: '…' })`. Kein `<svelte:head>` in Seiten.

### 3. Trailing Slash

`trailingSlash: 'always'` im Root-Layout. **Jeder** interne Link endet auf `/` — sonst entsteht beim statischen Hosting ein Redirect oder ein 404. `normalizeHref()` ergänzt ihn, wo Pfade programmatisch entstehen. Anker hängen **hinter** dem Schrägstrich: `/wissen/radar/grundlagen/#rcs`.

### 4. `relations.ts` statt handgeschriebener Linkblöcke

Jede Seite nennt in `RELATIONS` (`[D-REL]`) 3–6 Ziele mit einem knappen Grund, davon mindestens eines aus einem anderen Bereich. Rückverweise ergänzt `getRelatedTopics()` zur Laufzeit. Auf der Seite steht nur `<RelatedTopics href="/…/" />`. Ausgenommen sind `hidden`-Knoten.

### 5. Content-Architektur

Kapiteltexte sind Daten in `src/lib/content`, kein Markup. Ein `KnowledgeArticle` besteht aus `ArticleSection`s aus typisierten Blöcken; `[C-ARTBLOCK]` bildet jeden Blocktyp auf eine UI-Komponente ab. Anker-IDs stehen in den Daten, ohne Umlaute, und landen im Inhaltsverzeichnis **und** in der URL. Zahlenbeispiele im Text werden aus den zentralen Utilities berechnet, nicht hartkodiert. Mehrteilige Kapitel liegen in einem Unterordner mit `index.ts` als Hub.

### 6. Widget-Muster

```
widgets/XyzModel.ts          reine Rechenfunktionen, ohne DOM, mit Test
widgets/XyzWidget.svelte     Regler + Bühne, gerahmt von [C-WIDGFRAME]
knowledge/widgetRegistry.ts  ID → Komponente
data/widgets.ts              Bezeichnung, Beschreibung, Stichworte, Kapitel
content/…                    referenziert nur { type: 'widget', id: 'xyz' }
```

Animierte Widgets nutzen `[C-ANIMLOOP]`:

```ts
const loop = new AnimationLoop();
$effect(() => loop.attach());   // stoppt bei prefers-reduced-motion und verborgenem Tab
```

`[C-WIDGFRAME]` verlangt eine `description` (wird `aria-label` der Bühne) und erwartet eine `sr-only`-Datentabelle mit den aktuellen Werten — jede Grafik ist damit auch ohne Sicht auswertbar.

### 7. Widget-Deep-Links (`?w=`)

Jede Kapitelseite nimmt `?w=<widgetId>`: `[C-ARTLAY]` scrollt zum Anker `#widget-<id>` und setzt den Fokus, `[C-ARTBLOCK]` hebt den Rahmen kurz hervor, `[C-WIDGFRAME]` bietet „Link zum Widget kopieren". `parseWidgetParam()` nimmt **nur bekannte Kennungen** an, damit kein Fremdwert in eine Anker-ID gerät. Der Suchindex führt jedes Widget mit `href = <kapitel>/?w=<id>`; Widgets ohne lebenden Kapitelknoten bleiben automatisch draußen.

**Neues Widget = zwei Zeilen:** Komponente in `[C-WIDGREG]`, Metadaten in `[D-WIDGETS]`.

### 8. Chart-Muster

Jedes Diagramm sitzt in `[C-CHARTFRAME]`, misst seine Breite selbst (`bind:width`) und bringt `description`, `dataTable` und — wo sinnvoll — `footnote` mit. Aufrufer geben `width` **nicht** vor. Die Datenaufbereitung liegt in `<name>Data.ts` neben der Komponente. Skalen und Pfade kommen aus `d3-scale`/`d3-shape`; Tick-Beschriftungen laufen über `[U-FMT]`, nicht über `d3-format`.

### 9. Rechner-Muster

Zustand in der URL über `[U-URL]`: `*_PARAMS` deklariert Standardwerte und Grenzen, `UrlStateSync` schreibt entprellt in die History, `[C-CALCACT]` bietet „Link kopieren" und „Zurücksetzen". Eingaben über `[C-NUMIN]`/`[C-SLIDER]`, Ergebnisse über `[C-RESULT]`, Formeln über `[C-FORMULA]`.

### 10. Lernpfad-Muster

Ein Pfad in `[D-LEARN]` ist eine Liste von Schritten mit `href`, Lernziel und optionalem `optional: true`. **Jeder Schritt muss ein lebender Knoten aus `[D-NAV]` sein** — `[T-LEARN]` prüft das streng, und `resolvePathSteps()` blendet zur Laufzeit jeden Schritt aus, dessen Knoten fehlt oder `geplant` ist (sonst bricht `adapter-static` mit `strict: true` beim Prerendern über tote Links ab). Der Fortschritt ist gerätelokal und wird erst im `$effect` gelesen, damit prerendertes und hydriertes Markup übereinstimmen.

### 11. UI und Styling

Nur Tokens aus `[S-CSS]`, keine Hex-Farben in Komponenten; Icons über `[C-ICON]`, keine Emoji; Fokusring und Kontraste kommen aus dem Design-System. Details: `STYLE_GUIDE.md`.

`[T-CONV-RULES]` prüft diese Regeln maschinell: Komponentengröße, Hex-Farben und Trailing Slash. Nach dem Kern-Refactor ist die Größenausnahmeliste **leer**; die fünf verbliebenen Hex-Ausnahmen liegen bei `SpectrumRows`, `SpectrumMarker`, `SpectrumCursor` (theme-invariante Markerfarben) sowie `SpectrumTooltip` und `SpectrumLegend` (Farbverlauf des sichtbaren Lichts).

### 12. Zahlenformat und Sprache

Anzeige durchgängig **de-DE**: Dezimalkomma, Tausenderpunkt („220,352 MHz", „30.000 km"). Alles läuft über `formatLocaleNumber()`/`formatFixed()` aus `[U-FMT]`; Eingaben akzeptieren Komma **und** Punkt (`parseLocaleNumber()`). Ausgenommen bleiben URL-Parameter (maschinenlesbar mit Punkt) und `value`-Attribute von `<input type="number">`.

Echte Umlaute (`ä ö ü ß`) in UI, Kommentaren und Doku — **außer** in Verzeichnis- und Dateinamen, die in URLs landen (`kanalkapazitaet`, `daempfung`, `frequenzbaender`, `sekundaerradar`).

---

## Styling & Konfiguration

- **`[S-CSS]`** — `src/app.css` — Design-System: `@theme static`-Tokens, Light/Dark über `@custom-variant`, Layout- und Tabellenklassen, Fokusring
- **`[CFG-HTML]`** — `src/app.html` — Grundgerüst, Anti-FOUC-Skript für das Theme
- **`[CFG-SVELTE]`** — `svelte.config.js` — SvelteKit mit `adapter-static` (`fallback: 404.html`, `precompress`, `strict`)
- **`[CFG-VITE]`** — `vite.config.ts` — Vite + Tailwind
- **`[CFG-TEST]`** — `vitest.config.ts` — jsdom, `src/tests/setup.ts`, `resolve.conditions: ['browser']` unter Vitest (für Komponententests), kein manueller `$lib`-Alias
- **`[CFG-TS]`** — `tsconfig.json` — TypeScript strict
- **`[CFG-PKG]`** — `package.json` — Abhängigkeiten (`d3-scale`, `d3-shape`) und npm-Scripts
- **`[L-ROOT]`** — `src/routes/+layout.svelte` / `+layout.ts` — Prerender, Trailing Slash, Header/Breadcrumb/`[C-LEARNBAR]`/Footer/Palette, `[C-META]`

---

## ID-Schnellreferenz

| Prefix | Bedeutung | Beispiel |
|--------|-----------|----------|
| `R-` | Route / Seite | `[R-FSPL]` = FSPL-Rechnerseite |
| `C-` | Komponente | `[C-ATTEN]` = Dämpfungsdiagramm |
| `C-W-` | Interaktives Widget | `[C-W-DOPPLER]` = Doppler-Widget |
| `U-` | Utility-Modul | `[U-CALC]` = Berechnungsfunktionen |
| `D-` | Daten-Modul | `[D-BANDS]` = Banddefinitionen |
| `K-` | Content-Modul (Kapiteltext) | `[K-RADARGRUND]` = Radar-Grundlagen |
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
