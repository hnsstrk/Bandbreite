# Bandbreite

Eine Web-Applikation zur Berechnung und Visualisierung von Hochfrequenz-Parametern. Entwickelt für Ingenieure, Techniker und Funkbegeisterte, die mit Frequenzband-Konvertierungen, FSPL-Berechnungen und Spektrum-Visualisierungen arbeiten.

## Features

- **Frequenz-Konverter** - Umrechnung zwischen Frequenz und Wellenlänge
- **Leistungs-Konverter** - Umrechnung zwischen Watt, mW, dBm und dBW
- **FSPL-Rechner** - Freiraumdämpfung mit interaktivem Diagramm
- **Link-Budget-Rechner** - Signalpfad-Berechnung mit Wasserfall-Visualisierung
- **Reichweiten-Rechner** - Berechnung der Funkreichweite
- **Spektrum-Übersicht** - Interaktive Darstellung des elektromagnetischen Spektrums
- **Dämpfungskurven** - Multi-Frequenz-Vergleich mit atmosphärischer Absorption
- **Bandinfo-Anzeige** - IEEE, NATO und ITU Bandbezeichnungen
- **Dark/Light Mode** - Anpassbares Farbschema
- **Info-Tooltips** - Erklärungen zu allen Berechnungen

## Installation

```bash
git clone https://github.com/hnsstrk/bandbreite.git
cd bandbreite
npm install
npm run dev -- --open
```

## Tech Stack

- **Framework**: SvelteKit (Svelte 5)
- **Styling**: Tailwind CSS
- **Visualisierungen**: D3.js, Chart.js
- **Testing**: Vitest
- **Package Manager**: NPM

## Entwicklung

```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build
npm run preview      # Build-Vorschau
npm run check        # TypeScript/Svelte-Prüfung
npm run test         # Unit-Tests ausführen
```

## Projektstruktur

```
src/
├── lib/
│   ├── components/    # UI-Komponenten (Rechner, Charts, Konverter)
│   ├── data/          # Konstanten und Band-Definitionen
│   ├── stores/        # Svelte Stores
│   └── utils/         # Berechnungen und Hilfsfunktionen
├── routes/            # SvelteKit Seiten
└── tests/             # Unit-Tests
```

## Datenstruktur

Die Anwendung verwendet mehrere getrennte Datensätze, die unterschiedliche Abstraktionsebenen abbilden:

### Senderdatenbank (`transmitters.json`)

Enthält **physische Einzelsender** an konkreten Standorten:

| Feld | Beschreibung |
|------|--------------|
| `id` | Eindeutige ID (z.B. "dcf77") |
| `frequencyHz` | Exakte Sendefrequenz in Hz |
| `location` | Standort mit Koordinaten |
| `powerWatts` | Sendeleistung |
| `operator` | Betreiber |
| `status` | aktiv/inaktiv |

**Beispiele:** DCF77 (77.5 kHz, Mainflingen), MSF (60 kHz, Anthorn), WWVB (60 kHz, Fort Collins)

**Wichtig:** Zeitzeichensender wie DCF77, MSF und WWVB sind ausschließlich hier definiert, da sie Einzelsender mit festem Standort sind - keine Frequenzbänder.

### Anwendungsdatenbank (`applications.json`)

Enthält **Frequenzbänder und -zuweisungen** für verschiedene Dienste:

| Feld | Beschreibung |
|------|--------------|
| `id` | Eindeutige ID (z.B. "wifi-2.4ghz") |
| `minHz` / `maxHz` | Frequenzbereich |
| `category` | Dienst-Kategorie |
| `region` | Gültigkeitsregion |
| `standard` | Technischer Standard (optional) |

**Beispiele:** WiFi 2.4 GHz Band (2400-2483.5 MHz), LTE Band 20, GPS L1 Band

**Wichtig:** Hier werden nur echte Frequenzbänder mit `minHz !== maxHz` definiert. Einzelfrequenzen gehören in transmitters.json.

### Abgrenzung

```
transmitters.json         applications.json
─────────────────         ──────────────────
Physischer Sender    vs.  Frequenzzuweisung
Einzelfrequenz       vs.  Frequenzbereich
Konkreter Standort   vs.  Regionale Allokation
Betreiber bekannt    vs.  Nutzungsart definiert
```

### Zentrale Konstanten (`/lib/data/`)

Die Anwendung verwendet zentralisierte Konstanten-Dateien:

| Datei | Inhalt |
|-------|--------|
| `constants.ts` | Physikalische Konstanten (Lichtgeschwindigkeit, etc.) |
| `spectrum.ts` | EM-Spektrum-Bereiche, Bandgrenzen |
| `presets.ts` | Frequenz-/Link-Budget-Presets für Rechner |
| `units.ts` | Einheitendefinitionen und Umrechnungsfaktoren |
| `bands.ts` | IEEE, NATO, ITU Bandbezeichnungen |

## Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).
