# Implementierungsplan: RF-Features Phase 6 Teil 2

**Status**: In Arbeit
**Erstellt**: 2026-01-26
**Letzte Aktualisierung**: 2026-01-26

---

## Uebersicht

Dieser Plan dokumentiert die Implementierung von 11 neuen RF-Features fuer die Bandbreite-Anwendung.

### Voraussetzungen (bereits abgeschlossen)
- [x] bands.ts erweitert (ITU mit Propagation, IEEE, NATO komplett)
- [x] applications.ts erstellt (12 Kategorien, 100+ Anwendungen)
- [x] constants.ts erstellt (Ionosphaere, Absorption, Skin-Depth)

---

## Phase 1: Prioritaet 1 - Kernfeatures

### 1.1 PropagationModeIndicator.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/ui/PropagationModeIndicator.svelte`

**Beschreibung**:
Zeigt die Ausbreitungsart basierend auf der eingegebenen Frequenz an:
- Bodenwelle (Ground Wave) - VLF bis MF
- Raumwelle (Sky Wave) - HF
- Sichtlinie (Line of Sight) - VHF und hoeher
- Gemischt (Mixed) - Uebergangsbereiche

**Datenquelle**: `PropagationMode` aus `/lib/data/bands.ts`

**Akzeptanzkriterien**:
- [ ] Zeigt korrekte Ausbreitungsart fuer alle ITU-Baender
- [ ] Visuelle Darstellung mit Icon/Farbe
- [ ] Tooltip mit Erklaerung
- [ ] Reaktiv auf Frequenzaenderungen

---

### 1.2 FrequencyBandExplorer.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/charts/FrequencyBandExplorer.svelte`

**Beschreibung**:
Interaktive Visualisierung aller Frequenzbaender mit:
- Umschaltbare Ansichten: ITU / IEEE / NATO / Dienste
- Logarithmische Frequenzskala
- Klick auf Band zeigt Details und zugehoerige Anwendungen
- Zoom und Pan fuer Detailansicht

**Datenquellen**:
- ITU_BANDS, IEEE_BANDS, NATO_BANDS aus `/lib/data/bands.ts`
- ALL_APPLICATIONS aus `/lib/data/applications.ts`

**Akzeptanzkriterien**:
- [ ] Alle vier Bandkategorien darstellbar
- [ ] Interaktive Bandauswahl mit Details-Panel
- [ ] Responsive Design
- [ ] Accessibility (ARIA-Labels)

---

### 1.3 RadarRangeCalculator.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/calculators/RadarRangeCalculator.svelte`

**Beschreibung**:
Implementiert die Radargleichung:
```
Pr = (Pt * G^2 * lambda^2 * sigma) / ((4*pi)^3 * R^4)
```

**Eingaben**:
- Sendeleistung (Pt) in Watt/dBm
- Antennengewinn (G) in dBi
- Radarquerschnitt (RCS/sigma) in m^2
- Frequenz in Hz/MHz/GHz

**Berechnungen**:
- Maximale Reichweite bei gegebener Empfindlichkeit
- Empfangsleistung bei gegebener Reichweite
- Wellenlaenge aus Frequenz

**Akzeptanzkriterien**:
- [ ] Korrekte Radargleichungsberechnung
- [ ] RCS-Presets (Mensch, Auto, Flugzeug, etc.)
- [ ] Visualisierung der Reichweite
- [ ] Formel-Anzeige

---

### 1.4 IonosphericPropagation.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/charts/IonosphericPropagation.svelte`

**Beschreibung**:
Visualisiert ionosphaerische Ausbreitung mit:
- D/E/F1/F2-Schichten in korrekten Hoehen
- Reflexionspfade fuer verschiedene Frequenzen
- MUF/LUF Rechner basierend auf Sonnenaktivitaet
- Tag/Nacht-Unterschiede

**Datenquelle**: `IONOSPHERIC_LAYERS`, `IONOSPHERE_PARAMETERS` aus `/lib/data/constants.ts`

**Akzeptanzkriterien**:
- [ ] Korrekte Schichtendarstellung (D: 60-90km, E: 90-150km, F1: 150-250km, F2: 250-400km)
- [ ] MUF-Berechnung (ca. 3x kritische Frequenz bei 3000km)
- [ ] Tag/Nacht-Modus
- [ ] Interaktive Frequenzauswahl

---

## Phase 2: Prioritaet 2 - Erweiterte Features

### 2.1 AttenuationChart.svelte Erweiterung
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/charts/AttenuationChart.svelte` (existiert bereits)

**Beschreibung**:
Erweiterung des existierenden Charts um:
- 60 GHz Sauerstoff-Peak prominent hervorheben
- 22 GHz Wasserdampf-Peak hervorheben
- 183 GHz Wasserdampf-Peak (bereits vorhanden)
- Regen- und Nebeldaempfung Integration
- Atmosphaerische Fenster markieren

**Datenquelle**: `ATMOSPHERIC_ABSORPTION_PEAKS`, `ATMOSPHERIC_WINDOWS` aus `/lib/data/constants.ts`

**Akzeptanzkriterien**:
- [ ] Peaks klar markiert mit Labels
- [ ] Atmosphaerische Fenster als Bereiche
- [ ] Legende aktualisiert
- [ ] Tooltip mit Peak-Informationen

---

### 2.2 ApplicationOverlay.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/charts/ApplicationOverlay.svelte`

**Beschreibung**:
Zeigt Frequenznutzung nach Diensten:
- Filterbare Kategorien: Rundfunk, Mobilfunk, Radar, Amateurfunk, Satellit, etc.
- Frequenzbereiche als farbige Balken
- Ueberlappende Nutzungen erkennbar
- Klick zeigt Details

**Datenquelle**: `ALL_APPLICATIONS`, `APPLICATIONS_BY_CATEGORY` aus `/lib/data/applications.ts`

**Akzeptanzkriterien**:
- [ ] Alle 12 Kategorien darstellbar
- [ ] Filter-Checkboxen
- [ ] Interaktive Auswahl
- [ ] Responsive Design

---

### 2.3 ChannelCapacityCalculator.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/calculators/ChannelCapacityCalculator.svelte`

**Beschreibung**:
Shannon-Hartley Kanalkapazitaet:
```
C = B * log2(1 + SNR)
SNR_linear = 10^(SNR_dB / 10)
```

**Eingaben**:
- Bandbreite (B) in Hz/kHz/MHz
- Signal-Rausch-Verhaeltnis (SNR) in dB

**Ausgaben**:
- Maximale Kanalkapazitaet in bit/s
- Spektrale Effizienz in bit/s/Hz

**Akzeptanzkriterien**:
- [ ] Korrekte Shannon-Berechnung
- [ ] Modulationsvergleich (BPSK, QPSK, 16-QAM, etc.)
- [ ] Grafische Darstellung C vs. SNR
- [ ] Presets fuer typische Systeme

---

### 2.4 SkinDepthCalculator.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/calculators/SkinDepthCalculator.svelte`

**Beschreibung**:
Berechnet Eindringtiefe in leitende Medien:
```
delta = sqrt(2 / (omega * mu * sigma))
```

**Eingaben**:
- Frequenz in Hz
- Leitfaehigkeit des Mediums (Presets: Seewasser, Suesswasser, Erde)

**Datenquelle**: `calculateSkinDepth()`, `SEAWATER_PENETRATION` aus `/lib/data/constants.ts`

**Akzeptanzkriterien**:
- [ ] Korrekte Skin-Depth-Berechnung
- [ ] Presets fuer verschiedene Medien
- [ ] Praktische Kommunikationstiefe anzeigen
- [ ] U-Boot-Kommunikationsrelevanz erklaeren

---

## Phase 3: Prioritaet 3 - Zusatzfeatures

### 3.1 HistoricalTimeline.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/charts/HistoricalTimeline.svelte`

**Beschreibung**:
Zeigt die historische Entwicklung der Funknutzung:
- Zeitstrahl von 1888 (Hertz) bis heute
- Wichtige Meilensteine markiert
- Frequenzbereiche und ihre Erschliessung

**Akzeptanzkriterien**:
- [ ] Mindestens 15 historische Ereignisse
- [ ] Interaktive Timeline
- [ ] Verknuepfung mit Frequenzbaendern

---

### 3.2 TransmitterDatabase.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/ui/TransmitterDatabase.svelte`

**Beschreibung**:
Datenbank bekannter Sender:
- DCF77 (77.5 kHz)
- Deutschlandfunk
- Bekannte Amateurfunk-Relais
- Navigationssender

**Akzeptanzkriterien**:
- [ ] Mindestens 20 Sender
- [ ] Suchfunktion
- [ ] Frequenz, Standort, Leistung
- [ ] Verlinkung zum FrequencyBandExplorer

---

### 3.3 FresnelZoneCalculator.svelte
**Status**: [ ] Ausstehend
**Pfad**: `/src/lib/components/calculators/FresnelZoneCalculator.svelte`

**Beschreibung**:
Berechnet Fresnel-Zonen fuer Richtfunkstrecken:
```
r_n = sqrt(n * lambda * d1 * d2 / (d1 + d2))
```

**Eingaben**:
- Frequenz
- Gesamtdistanz
- Position entlang der Strecke

**Ausgaben**:
- Radius der 1. Fresnel-Zone
- Erforderliche Freiheit (60% der 1. Zone)
- Visualisierung der Ellipse

**Akzeptanzkriterien**:
- [ ] Korrekte Fresnel-Berechnung
- [ ] 2D-Visualisierung der Zone
- [ ] Mindesthoehen-Berechnung
- [ ] Presets fuer typische Links

---

## Technische Anforderungen

### Allgemeine Regeln
1. **Svelte 5 mit Runes**: `$state`, `$derived`, `$effect`, `$bindable`
2. **Zentrale Utilities**: Import aus `/lib/utils/` und `/lib/data/`
3. **Komponenten < 300 Zeilen**: Bei Bedarf aufteilen
4. **TypeScript**: Explizite Typen
5. **Tailwind CSS**: Fuer Styling
6. **Accessibility**: `role`, `aria-label`, `id`/`for` fuer Labels
7. **Fehlerbehandlung**: `safeDivide`, `parseNumericInput` verwenden

### Quality Gates pro Komponente
```bash
npm run check    # TypeScript/Svelte-Pruefung - 0 Fehler
npm run test     # Alle Tests muessen bestehen
npm run build    # Build muss erfolgreich sein
```

### Commit-Strategie
- Ein Commit pro fertige Komponente
- Commit-Message-Format: `feat: add [ComponentName] - [kurze Beschreibung]`
- Quality Gates vor jedem Commit

---

## Fortschrittsprotokoll

| Komponente | Status | Commit | Datum |
|------------|--------|--------|-------|
| PropagationModeIndicator | [ ] | - | - |
| FrequencyBandExplorer | [ ] | - | - |
| RadarRangeCalculator | [ ] | - | - |
| IonosphericPropagation | [ ] | - | - |
| AttenuationChart Erweiterung | [ ] | - | - |
| ApplicationOverlay | [ ] | - | - |
| ChannelCapacityCalculator | [ ] | - | - |
| SkinDepthCalculator | [ ] | - | - |
| HistoricalTimeline | [ ] | - | - |
| TransmitterDatabase | [ ] | - | - |
| FresnelZoneCalculator | [ ] | - | - |

---

## Abhaengigkeiten zwischen Komponenten

```
PropagationModeIndicator
    |
    v
FrequencyBandExplorer <-- ApplicationOverlay
    |
    v
IonosphericPropagation

RadarRangeCalculator (unabhaengig)
ChannelCapacityCalculator (unabhaengig)
SkinDepthCalculator (unabhaengig)
FresnelZoneCalculator (unabhaengig)
AttenuationChart Erweiterung (unabhaengig)
HistoricalTimeline (unabhaengig)
TransmitterDatabase <-- FrequencyBandExplorer
```

---

## Naechste Schritte

1. [x] Implementierungsplan erstellen
2. [ ] PropagationModeIndicator implementieren
3. [ ] FrequencyBandExplorer implementieren
4. [ ] RadarRangeCalculator implementieren
5. [ ] IonosphericPropagation implementieren
6. [ ] AttenuationChart erweitern
7. [ ] ApplicationOverlay implementieren
8. [ ] ChannelCapacityCalculator implementieren
9. [ ] SkinDepthCalculator implementieren
10. [ ] HistoricalTimeline implementieren
11. [ ] TransmitterDatabase implementieren
12. [ ] FresnelZoneCalculator implementieren
