# Bandbreite

Eine Web-Applikation zur Berechnung und Visualisierung von Hochfrequenz-Parametern. Entwickelt fuer Ingenieure, Techniker und Funkbegeisterte, die mit Frequenzband-Konvertierungen, FSPL-Berechnungen und Spektrum-Visualisierungen arbeiten.

## Features

- **Frequenz-Konverter** - Umrechnung zwischen Frequenz und Wellenlaenge
- **Leistungs-Konverter** - Umrechnung zwischen Watt, mW, dBm und dBW
- **FSPL-Rechner** - Freiraumdaempfung mit interaktivem Diagramm
- **Link-Budget-Rechner** - Signalpfad-Berechnung mit Wasserfall-Visualisierung
- **Reichweiten-Rechner** - Berechnung der Funkreichweite
- **Spektrum-Uebersicht** - Interaktive Darstellung des elektromagnetischen Spektrums
- **Daempfungskurven** - Multi-Frequenz-Vergleich mit atmosphaerischer Absorption
- **Bandinfo-Anzeige** - IEEE, NATO und ITU Bandbezeichnungen
- **Dark/Light Mode** - Anpassbares Farbschema
- **Info-Tooltips** - Erklaerungen zu allen Berechnungen

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
npm run check        # TypeScript/Svelte-Pruefung
npm run test         # Unit-Tests ausfuehren
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

## Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).
