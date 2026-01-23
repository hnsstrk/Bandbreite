# 📡 Bandbreite - Frequenzband-Rechner & Visualisierung

Eine umfassende Web-Applikation zur Berechnung, Konvertierung und Visualisierung von Hochfrequenz-Parametern (HF), Radar-Bändern und Wellenlängen. Entwickelt für Ingenieure, Techniker und Funkbegeisterte.

---

## ✨ Funktionen

- **Frequenz- & Wellenlängen-Konverter**: Schnelle Umrechnung zwischen Frequenz und Wellenlänge unter Berücksichtigung der Lichtgeschwindigkeit.
- **FSPL-Rechner**: Berechnung der Freiraumdämpfung (Free Space Path Loss) basierend auf Distanz und Frequenz.
- **Band-Visualisierung**: Interaktive grafische Darstellung der Frequenzbänder und deren Position im Spektrum.
- **Referenz-Katalog**: Schneller Zugriff auf zivile und militärische Bandbezeichnungen (IEEE, NATO, ITU).
- **Radar-Berechnungen**: Grundlegende Tools für Reichweiten- und Leistungsberechnungen im Radarbereich.

## 🛠 Technologie-Stack

- **Frontend Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualisierungen**: [D3.js](https://d3js.org/) & [Chart.js](https://www.chartjs.org/)
- **Package Manager**: NPM

## 📂 Projektstruktur

```text
bandbreite/
├── src/
│   ├── lib/
│   │   ├── components/     # Wiederverwendbare UI-Komponenten (Rechner, Diagramme)
│   │   ├── utils/          # Mathematische Formeln und Konvertierungslogik
│   │   └── data/           # Definitionen der Frequenzbänder (JSON/TS)
│   └── routes/             # Applikations-Routing und Seiten-Layouts
├── static/                 # Statische Ressourcen (Icons, Bilder)
├── package.json            # Projektabhängigkeiten
└── README.md               # Projektdokumentation
```

## 🚀 Installation und Setup

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd bandbreite
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev -- --open
   ```

4. **Produktions-Build erstellen:**
   ```bash
   npm run build
   ```

## 📖 Bedienungsanleitung

### Frequenz-Konverter
Geben Sie einen Wert in das Feld "Frequenz" (z.B. in MHz oder GHz) ein. Die Applikation berechnet automatisch die entsprechende Wellenlänge in Metern, Zentimetern oder Millimetern.

### Dämpfungsrechner (FSPL)
Wählen Sie die Distanz (km) und die Betriebsfrequenz (GHz). Das Tool gibt den Pfadverlust in Dezibel (dB) aus.

### Band-Explorer
Nutzen Sie die grafische Übersicht, um durch die verschiedenen Spektren zu navigieren. Klicken Sie auf ein Band (z.B. "X-Band"), um Details zu Anwendungen und Unterbändern zu erhalten.

---

## 📊 Frequenzband-Referenztabellen

### ITU Radio-Bänder
| Bezeichnung | Abkürzung | Frequenzbereich | Wellenlänge |
| :--- | :--- | :--- | :--- |
| Very Low Frequency | VLF | 3 – 30 kHz | 100 – 10 km |
| Low Frequency | LF | 30 – 300 kHz | 10 – 1 km |
| Medium Frequency | MF | 300 kHz – 3 MHz | 1 km – 100 m |
| High Frequency | HF | 3 – 30 MHz | 100 – 10 m |
| Very High Frequency | VHF | 30 – 300 MHz | 10 – 1 m |
| Ultra High Frequency | UHF | 300 MHz – 3 GHz | 1 m – 10 cm |

### Mikrowellen-Bänder (IEEE)
| Band | Frequenzbereich | Typische Anwendungen |
| :---: | :--- | :--- |
| **L** | 1 – 2 GHz | GPS, Mobilfunk, L-Band Radar |
| **S** | 2 – 4 GHz | WLAN, Bluetooth, Wetterradar |
| **C** | 4 – 8 GHz | Satellitenkommunikation, WLAN (5GHz) |
| **X** | 8 – 12 GHz | Militär-Radar, Präzisionsmessung |
| **Ku** | 12 – 18 GHz | Satelliten-TV (Direct Broadcast) |
| **K** | 18 – 27 GHz | Astronomie, Kurzstreckenradar |
| **Ka** | 27 – 40 GHz | Hochgeschwindigkeits-Satelliteninternet |

### NATO / Militärische Bänder
| Band | Frequenzbereich |
| :---: | :--- |
| **A** | 0 – 250 MHz |
| **B** | 250 – 500 MHz |
| **C** | 500 MHz – 1 GHz |
| **D** | 1 – 2 GHz |
| **E** | 2 – 3 GHz |
| **F** | 3 – 4 GHz |
| **G** | 4 – 6 GHz |
| **H** | 6 – 8 GHz |
| **I** | 8 – 10 GHz |
| **J** | 10 – 20 GHz |
| **K** | 20 – 40 GHz |
| **L** | 40 – 60 GHz |
| **M** | 60 – 100 GHz |

---

## 📐 Verwendete Formeln

### Wellenlänge-Frequenz-Beziehung
Die Basis jeder HF-Berechnung:
```text
λ = c / f
```
*   `λ` = Wellenlänge (m)
*   `c` = Lichtgeschwindigkeit (≈ 299.792.458 m/s)
*   `f` = Frequenz (Hz)

### Freiraumdämpfung (FSPL)
Berechnung des Signalverlusts in einer idealen Umgebung:
```text
FSPL (dB) = 20·log10(d) + 20·log10(f) + 20·log10(4π/c)
```
*   `d` = Distanz
*   `f` = Frequenz

### Radargleichung (Basis)
Bestimmung der empfangenen Leistung am Radar-Empfänger:
```text
Pr = (Pt · G² · λ² · σ) / ((4π)³ · R⁴)
```
*   `Pt` = Sendeleistung (W)
*   `G` = Antennengewinn
*   `λ` = Wellenlänge (m)
*   `σ` = Radar-Querschnitt / RCS (m²)
*   `R` = Reichweite (m)

### Bandbreite und Kanalkapazität (Shannon-Hartley)
Maximale Datenrate eines Kanals:
```text
C = B · log₂(1 + SNR)
```
*   `C` = Kanalkapazität (bit/s)
*   `B` = Bandbreite (Hz)
*   `SNR` = Signal-Rausch-Verhältnis (linear, nicht dB!)

**Umrechnung SNR:**
```text
SNR_linear = 10^(SNR_dB / 10)
```

### Nyquist-Bandbreite
Maximale symbolrate ohne Intersymbol-Interferenz:
```text
Rs = 2 · B
```
*   `Rs` = Symbolrate (Baud)
*   `B` = Bandbreite (Hz)

### Spektrale Effizienz
Datenrate pro Bandbreite:
```text
η = R / B    [bit/s/Hz]
```

| Modulation | Spektrale Effizienz |
|------------|---------------------|
| BPSK | 1 bit/s/Hz |
| QPSK | 2 bit/s/Hz |
| 16-QAM | 4 bit/s/Hz |
| 64-QAM | 6 bit/s/Hz |
| 256-QAM | 8 bit/s/Hz |

---

## 📶 Bandbreiten-Referenz

### Typische Kanalbandbreiten nach Anwendung

| Anwendung | Bandbreite | Frequenzbereich | Max. Datenrate (theoretisch) |
|-----------|------------|-----------------|------------------------------|
| **AM Radio** | 10 kHz | 530–1700 kHz | ~20 kbit/s |
| **FM Radio** | 200 kHz | 87.5–108 MHz | ~400 kbit/s |
| **DAB+** | 1.5 MHz | 174–240 MHz | ~2.4 Mbit/s |
| **GSM (2G)** | 200 kHz | 900/1800 MHz | ~270 kbit/s |
| **UMTS (3G)** | 5 MHz | 2100 MHz | ~42 Mbit/s |
| **LTE (4G)** | 20 MHz | 700–2600 MHz | ~300 Mbit/s |
| **5G Sub-6** | 100 MHz | 3.5 GHz | ~1 Gbit/s |
| **5G mmWave** | 400 MHz | 26–28 GHz | ~4 Gbit/s |
| **WLAN 802.11n** | 40 MHz | 2.4/5 GHz | ~600 Mbit/s |
| **WLAN 802.11ac** | 160 MHz | 5 GHz | ~6.9 Gbit/s |
| **WLAN 802.11ax** | 160 MHz | 2.4/5/6 GHz | ~9.6 Gbit/s |
| **Bluetooth** | 1 MHz | 2.4 GHz | ~3 Mbit/s |
| **Radar (Puls)** | 1–100 MHz | X-Band | — |
| **Satellit (DVB-S2)** | 36 MHz | Ku-Band | ~45 Mbit/s |

### Bandbreite vs. Frequenz — Der Zusammenhang

```
    Verfügbare Bandbreite
         │
    10 GHz ─┤                                    ████████████████
            │                              ██████
     1 GHz ─┤                        ██████
            │                  ██████
   100 MHz ─┤            ██████
            │      ██████
    10 MHz ─┤██████
            │
         0 ─┼────────────────────────────────────────────▶ Trägerfrequenz
            100 MHz   1 GHz    10 GHz   100 GHz
            
    Faustregel: Nutzbare Bandbreite ≈ 5-20% der Trägerfrequenz
```

**Warum höhere Frequenzen = mehr Bandbreite?**
- Bei 1 GHz: 10% = 100 MHz nutzbar
- Bei 28 GHz: 10% = 2.8 GHz nutzbar
- Daher 5G mmWave für hohe Datenraten

---

## 🛰 Anwendungskatalog

- **Radar**: Wetterüberwachung, Flugsicherung, militärische Aufklärung.
- **Funk**: UKW-Radio, Amateurfunk (HF/VHF).
- **Mobilfunk**: 4G (LTE), 5G Sub-6GHz und mmWave.
- **WLAN**: 2.4 GHz, 5 GHz und 6 GHz (Wi-Fi 6E/7).
- **Satellit**: Starlink (Ku/Ka-Band), TV-Übertragungen.
- **GPS**: L1, L2 und L5 Signale.

---

## 📈 Visualisierungen (Kernfeature)

Die grafische Darstellung ist das Herzstück dieser Anwendung. Alle Zusammenhänge werden visuell aufbereitet.

### 1. Elektromagnetisches Spektrum — Gesamtübersicht

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  ELEKTROMAGNETISCHES SPEKTRUM                                                            │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────┬─────────┬──────────┬──────────┤
│ ELF  │ VLF  │  LF  │  MF  │  HF  │ VHF  │ UHF  │  SHF   │   EHF   │ Infrarot │ Sichtbar │
│ 3Hz  │ 3kHz │30kHz │300kHz│ 3MHz │30MHz │300MHz│  3GHz  │  30GHz  │  300GHz  │  ~400THz │
├──────┴──────┴──────┴──────┴──────┴──────┴──────┴────────┴─────────┴──────────┴──────────┤
│ ◀─────────── RADIO ───────────▶◀────── MIKROWELLE ──────▶◀─ IR ─▶◀─ LICHT ─▶           │
│                                                                    380-780nm            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Logarithmische Frequenzskala von 3 Hz bis 10 PHz (Petahertz)
- Farbcodierung nach Wellenlängenbereich
- Zoom-Funktion für Detailansicht einzelner Bereiche
- Klickbare Segmente mit Popup-Informationen
- Parallele Wellenlängen-Skala (km → nm)

---

### 2. Frequenz ↔ Wellenlänge ↔ Reichweite — Zusammenhangsdiagramm

```
                    FREQUENZ (logarithmisch)
         1 kHz    1 MHz    1 GHz    1 THz    1 PHz
           │        │        │        │        │
           ▼        ▼        ▼        ▼        ▼
    ┌──────┴────────┴────────┴────────┴────────┴──────┐
    │  ════════════════════════════════════════════   │  ← Wellenlänge (300km → 300nm)
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░   │  ← Reichweite (exponentiell)
    │  ████████████████████▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░   │  ← Durchdringung (Wände, Wasser)
    │  ░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓████████████████   │  ← Bandbreite/Datenrate
    └─────────────────────────────────────────────────┘

    Legende:
    ████ = Hoch    ▓▓▓▓ = Mittel    ░░░░ = Niedrig
```

**Interaktive Elemente:**
- Slider zur Frequenzwahl → alle anderen Werte aktualisieren sich live
- Vier parallele Balken zeigen Zusammenhänge:
  - **Wellenlänge**: Invers zur Frequenz
  - **Freiraumreichweite**: Nimmt mit Frequenz ab (FSPL)
  - **Durchdringung**: Niedrige Frequenzen durchdringen besser
  - **Bandbreite**: Höhere Frequenzen = mehr verfügbare Bandbreite

---

### 3. Frequenzband-Vergleichsdiagramm (Zivil vs. Militär)

```
Frequenz:  1 GHz        5 GHz        10 GHz       20 GHz       40 GHz
              │            │            │            │            │
IEEE:      ┌──┴──┐    ┌────┴────┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
           │  L  │    │    C    │   │   X   │   │   K   │   │   Ka  │
           └─────┘    └─────────┘   └───────┘   └───────┘   └───────┘
              │            │            │            │            │
NATO:      ┌──┴──┐    ┌────┴────┐   ┌───┴───┐   ┌───────┴───────────┐
           │  D  │    │  F │ G  │   │   I   │   │         J         │
           └─────┘    └─────────┘   └───────┘   └───────────────────┘
```

**Features:**
- Zwei parallele Balkendiagramme (IEEE oben, NATO unten)
- Farbcodierte Überlappungszonen
- Hover zeigt: Frequenzbereich, typische Anwendungen, Wellenlänge
- Toggle zwischen verschiedenen Nomenklaturen (IEEE, NATO, ITU, Waveguide)

---

### 4. Sichtbares Spektrum — Detailansicht

```
    ◀────────────────── SICHTBARES LICHT ──────────────────▶
    
    380nm   450nm   495nm   570nm   590nm   620nm   750nm   780nm
      │       │       │       │       │       │       │       │
      ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼
    ┌───────────────────────────────────────────────────────────┐
    │ VIOLETT │ BLAU  │ CYAN  │ GRÜN  │ GELB │ORANGE │   ROT   │
    │  789THz │ 668THz│ 606THz│ 526THz│508THz│ 484THz│  400THz │
    └───────────────────────────────────────────────────────────┘
              │                               │
              ▼                               ▼
         UV-Strahlung                   IR-Strahlung
         (< 380nm)                      (> 780nm)
```

**Features:**
- Echter Farbverlauf basierend auf Wellenlänge
- Frequenz- UND Wellenlängen-Skala
- Angrenzende Bereiche (UV, IR) mit Anwendungen
- Klick auf Farbe zeigt exakte Werte

---

### 5. Dämpfungskurven — Multi-Frequenz-Vergleich

```
    Dämpfung (dB)
         │
    200 ─┤                                          ╱ 60 GHz
         │                                       ╱
    150 ─┤                                    ╱    ╱ 28 GHz
         │                                 ╱    ╱
    100 ─┤                              ╱    ╱     ╱ 5.8 GHz
         │                           ╱    ╱    ╱
     50 ─┤                        ╱    ╱    ╱       ╱ 2.4 GHz
         │                     ╱    ╱    ╱      ╱
      0 ─┼────────────────────────────────────────────▶ Distanz (km)
         0     1     5     10    20    50   100
```

**Features:**
- Logarithmische Distanzachse
- Mehrere Frequenzen gleichzeitig vergleichbar
- Interaktiv: Frequenzen ein-/ausblenden
- Marker für typische Szenarien (WLAN-Reichweite, 5G-Zelle, Satellitenlink)
- Zusätzliche Kurven für atmosphärische Absorption (Regen, Nebel)

---

### 6. Radar-Reichweiten-Visualisierung

```
                         ┌─────────────────┐
                         │   RADAR (Tx)    │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
         ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
         │ R = 50km│         │R = 100km│         │R = 200km│
         │  Pt: 1kW│         │ Pt: 10kW│         │Pt: 100kW│
         └─────────┘         └─────────┘         └─────────┘
              │                   │                   │
    ──────────┴───────────────────┴───────────────────┴──────────
              ◀─── Reichweite skaliert mit ⁴√Pt ───▶
```

**Features:**
- Kreisförmige Reichweitendarstellung
- Slider für Sendeleistung, Antennengewinn, RCS
- Live-Berechnung der Radar-Reichweite
- Vergleich verschiedener Radar-Typen

---

### 7. Anwendungs-Overlay — Wer nutzt was?

```
    Frequenz:   100MHz    1GHz     10GHz    100GHz
                   │        │         │         │
    ┌──────────────┴────────┴─────────┴─────────┴──────────────┐
    │ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ UKW-Radio
    │ ░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ Mobilfunk (4G/5G)
    │ ░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ WLAN 2.4/5/6 GHz
    │ ░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░ │ Satellit (Ku/Ka)
    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░ │ Radar (X/Ku/K)
    │ ░░░░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ GPS (L-Band)
    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ 5G mmWave
    └──────────────────────────────────────────────────────────┘
```

**Features:**
- Horizontale Balken für jede Anwendung
- Filter nach Kategorie (Zivil, Militär, Wissenschaft)
- Überlappungen hervorgehoben
- Klick öffnet Detail-Panel mit Spezifikationen

---

### 8. Link-Budget-Visualisierung

```
    Sendeleistung                                    Empfangsleistung
    ┌─────────┐                                      ┌─────────┐
    │  +30 dBm│ ──▶ Tx-Antenne ──▶ FSPL ──▶ Rx-Antenne ──▶ │  -80 dBm│
    └─────────┘      +15 dBi      -120 dB    +15 dBi      └─────────┘
                                    │
                          Kabel: -3 dB
                     Atmosphäre: -2 dB
                                    │
    ════════════════════════════════════════════════════════════════
    +30 dBm ───▶ +45 dBm ───▶ -75 dBm ───▶ -80 dBm ───▶ -60 dBm
    ════════════════════════════════════════════════════════════════
         │         │           │           │           │
         ▼         ▼           ▼           ▼           ▼
    ┌─────────────────────────────────────────────────────────────┐
    │████████████████████████░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────────────────────────────┘
      Gewinn                  Verlust                    Marge
```

**Features:**
- Wasserfall-Diagramm von Tx nach Rx
- Alle Gewinne/Verluste visuell addiert
- Farbcodierung: Grün = Gewinn, Rot = Verlust
- Interaktive Slider für jeden Parameter

---

### 9. Bandbreiten-Kanalkapazitäts-Rechner

```
    ┌─────────────────────────────────────────────────────────────────┐
    │  BANDBREITE → DATENRATE (Shannon-Hartley)                       │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                  │
    │   Bandbreite: ════════════════════○═══════════════  100 MHz     │
    │                                                                  │
    │   SNR:        ════════════○═══════════════════════   20 dB      │
    │                                                                  │
    │   ─────────────────────────────────────────────────────────────  │
    │                                                                  │
    │   Theoretische Kapazität:     ┌──────────────────┐              │
    │                               │    664 Mbit/s    │              │
    │                               └──────────────────┘              │
    │                                                                  │
    └─────────────────────────────────────────────────────────────────┘

    Vergleich bei 100 MHz Bandbreite:
    ┌──────────────────────────────────────────────────────────────────┐
    │ SNR    │ 10 dB │ 15 dB │ 20 dB │ 25 dB │ 30 dB │ 40 dB │        │
    ├────────┼───────┼───────┼───────┼───────┼───────┼───────┤        │
    │ C      │ 346 M │ 503 M │ 664 M │ 830 M │ 996 M │ 1.3 G │ bit/s  │
    │ ▓▓▓▓▓▓ │ ▓▓▓▓▓▓│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│        │
    └──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Zwei Slider: Bandbreite (1 kHz – 1 GHz) und SNR (0 – 50 dB)
- Live-Berechnung der Shannon-Kapazität
- Balkendiagramm: Kapazität bei verschiedenen SNR-Werten
- Vergleich mit realen Systemen (LTE erreicht ~70% der Shannon-Grenze)

---

### 10. Bandbreite-Frequenz-Tradeoff-Diagramm

```
    Trägerfrequenz
    100 GHz ─┐                              ┌─────────────────────────┐
             │                              │ mmWave (5G NR FR2)      │
             │                              │ BW: 400 MHz – 2 GHz     │
    28 GHz ──┤                         █████│ Reichweite: < 1 km      │
             │                    █████     └─────────────────────────┘
    10 GHz ──┤               █████
             │          █████           ┌─────────────────────────────┐
     5 GHz ──┤     █████                │ WLAN 5/6 GHz                │
             │█████                     │ BW: 20–160 MHz              │
     2 GHz ──┤                          │ Reichweite: ~100 m          │
             │                          └─────────────────────────────┘
   700 MHz ──┤
             │  ┌───────────────────────────────────────────────────┐
   100 MHz ──┤  │ UHF/VHF (Radio, TV)                               │
             │  │ BW: 200 kHz – 8 MHz │ Reichweite: 10–100 km       │
             └──┴───────────────────────────────────────────────────┘
                1 kHz   1 MHz   10 MHz  100 MHz   1 GHz
                           Nutzbare Bandbreite
                           
    ══════════════════════════════════════════════════════════════════
    TRADEOFF:  ◀── Reichweite ────────────── Datenrate ──▶
    ══════════════════════════════════════════════════════════════════
```

**Features:**
- Scatter-Plot: Trägerfrequenz vs. verfügbare Bandbreite
- Cluster für Technologien (Mobilfunk, WLAN, Satellit, Radar)
- Farbcodierung nach Reichweite
- Interaktive Punkte mit Details zu Standards

---

### Geplante Diagramm-Komponenten

| # | Komponente | Bibliothek | Interaktivität |
|---|------------|------------|----------------|
| 1 | `SpectrumOverview.svelte` | D3.js | Zoom, Pan, Klick |
| 2 | `FrequencyRelationChart.svelte` | D3.js | Slider, Live-Update |
| 3 | `BandComparisonChart.svelte` | D3.js | Toggle, Hover |
| 4 | `VisibleSpectrumBar.svelte` | CSS/SVG | Hover, Farbpicker |
| 5 | `AttenuationGraph.svelte` | Chart.js | Multi-Line, Toggle |
| 6 | `RadarRangeCircle.svelte` | D3.js | Slider, Animation |
| 7 | `ApplicationOverlay.svelte` | D3.js | Filter, Klick |
| 8 | `LinkBudgetWaterfall.svelte` | D3.js | Slider, Drag |
| 9 | `BandwidthCapacityCalc.svelte` | D3.js | Dual-Slider, Live-Calc |
| 10 | `BandwidthTradeoffScatter.svelte` | D3.js | Hover, Cluster-Filter |

---

## 🗺 Roadmap

### Phase 1: Fundament
- [ ] SvelteKit + Tailwind Setup
- [ ] Basis-Layout mit Navigation
- [ ] Frequenz ↔ Wellenlänge Konverter (Logik)

### Phase 2: Kern-Visualisierungen
- [ ] Elektromagnetisches Spektrum (Gesamtübersicht)
- [ ] Sichtbares Spektrum (Detailansicht)
- [ ] Frequenzband-Vergleich (IEEE/NATO)

### Phase 3: Interaktive Rechner
- [ ] FSPL-Rechner mit Dämpfungskurven
- [ ] Frequenz-Wellenlänge-Reichweite Zusammenhangsdiagramm
- [ ] Link-Budget-Visualisierung

### Phase 4: Spezial-Tools
- [ ] Radar-Reichweiten-Rechner
- [ ] Anwendungs-Overlay
- [ ] Atmosphärische Absorption

### Phase 5: Polish
- [ ] Dark/Light Mode
- [ ] Export (PNG, PDF)
- [ ] PWA-Support
- [ ] Mobile-Optimierung

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT License](LICENSE) lizenziert.
