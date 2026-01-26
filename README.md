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

Die Anwendung verwendet zwei getrennte Datensätze für Frequenzinformationen:

### Senderdatenbank (`transmitters.json`)
Enthält **konkrete Sender** mit:
- Standort (Name, Land, Koordinaten)
- Sendeleistung
- Betreiber
- Status (aktiv/inaktiv)

Beispiele: DCF77 (Zeitzeichen), BBC Radio 4 LW, Amateur-Relais

### Anwendungsdatenbank (`applications.json`)
Enthält **Frequenzbänder** für Anwendungskategorien mit:
- Frequenzbereich (min/max Hz)
- Kategorie (Rundfunk, Mobilfunk, WLAN, etc.)
- Standard (z.B. IEEE 802.11, 3GPP)
- Region (weltweit, Europa, USA, Asien)

Beispiele: WiFi 2.4 GHz, LTE Band 20, GPS L1

**Hinweis:** Diese Datensätze sind bewusst getrennt, da sie unterschiedliche Informationsebenen abbilden (konkrete Sender vs. Frequenzzuweisungen).

## Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).
