# Datenquellen, Stand und Unsicherheiten

Diese Seite dokumentiert für jeden Datensatz und jedes Rechenmodell der Anwendung, **woher die Werte stammen**, **auf welchen Stand sie sich beziehen** und **wo sie unsicher sind**. Sie ist die ausführliche Fassung der Seite `/service/quellen/` (Inhalt in `src/lib/content/funktechnik/quellen.ts`).

---

## Haftungsausschluss

> **Bandbreite ist keine amtliche Quelle und kein Betriebsdokument.**
>
> Frequenzangaben, Bandgrenzen, Leistungsgrenzen und Kanaltabellen sind nach bestem Wissen zusammengetragen, ersetzen aber keine amtliche Veröffentlichung. Für Antragstellung, Funkbetrieb, Navigation, Not- und Sicherheitsfunk sowie jede rechtliche Bewertung gelten ausschließlich die unten genannten Primärquellen in ihrer jeweils gültigen Fassung.
>
> Alle Texte sind eigenständig formuliert. Übernommen sind ausschließlich überprüfbare Tatsachenangaben — Frequenzgrenzen, Kanalraster, Jahreszahlen, Formeln und Normbezeichnungen.
>
> Frequenzregulierung ändert sich fortlaufend — nach jeder Weltfunkkonferenz, nach EU-Entscheidungen und nach nationalen Vergabeverfahren. Wer eine Angabe verwendet, prüft sie gegen die aktuelle Fassung der Primärquelle.

**Regel im Code:** Nicht gesicherte Angaben stehen im Datensatz mit einem `Annahme:`-Kommentar und tauchen unten unter „Unsicherheiten" auf.

---

## Regulatorische Grundlagen

| Quelle | Herausgeber | Verwendet für |
|---|---|---|
| Vollzugsordnung für den Funkdienst (VO Funk / Radio Regulations), Ausgabe 2020 inkl. WRC-23 | ITU-R | Funkdienst-Definitionen (Art. 1), Zuweisungstabelle (Art. 5), Not- und Sicherheitsfunk (Art. 30–34, Anhänge 13/18) |
| Frequenzplan nach § 90 TKG | Bundesnetzagentur | Nationale Zuweisungen und Nutzungsbestimmungen |
| Allgemeinzuteilungen (PMR446, Freenet, CB-Funk, SRD) | Bundesnetzagentur | Leistungsgrenzen und Kanäle des Jedermannfunks |
| ECC-Beschlüsse, European Common Allocation Table | CEPT / ECC | Europaweit harmonisierte Nutzungen |
| Amateurfunkgesetz und Amateurfunkverordnung (AFuV), Anlage 1, Fassung nach der Änderung vom 24.06.2024 | Bundesrepublik Deutschland | Zeugnisklassen, Bandgrenzen, Leistungsgrenzen |
| HF- und VHF/UHF/Mikrowellen-Bandpläne (Stand Generalkonferenz Novi Sad 2023) | IARU Region 1 | Betriebsartensegmente im Amateurfunk |
| Genfer Wellenpläne GE75 (LW/MW), GE84 (UKW), GE06 (T-DAB, DVB-T) | ITU | Raster und Bereiche des Rundfunks |
| SOLAS Kapitel IV, GMDSS-Regelwerk | IMO | Seenot- und Sicherheitsfunk, Seegebiete A1–A4 |
| Annex 10 zum Abkommen über die internationale Zivilluftfahrt | ICAO | Flugfunk, Notfrequenzen, Navigationsverfahren |
| COSPAS-SARSAT C/S T.001 | Cospas-Sarsat | 406-MHz-Notfunkbaken |
| BDBOS-Veröffentlichungen | BDBOS | TETRA-Digitalfunk der BOS |

## Technische Normen und Fachliteratur

| Quelle | Gegenstand | Verwendet in |
|---|---|---|
| ITU-R P.525 | Freiraumausbreitung | `utils/calculations.ts` — FSPL, Reichweite |
| ITU-R P.676-13 (08/2022), Annex 1 und 2 | Gasförmige Dämpfung | `utils/itu676.ts`, `data/itu676Lines.ts` (44 O₂-, 35 H₂O-Linien) |
| ITU-R P.838-3 (03/2005) | Regendämpfung | `utils/atmosphericAttenuation.ts` |
| ITU-R P.840-9 (08/2023) | Wolken und Nebel (Double-Debye) | `utils/atmosphericAttenuation.ts` |
| ITU-R P.839-4 | Regenhöhe für Schrägpfade | `utils/atmosphericAttenuation.ts` |
| ITU-R P.526 | Beugung, Messerschneiden-Modell | `utils/fresnelMath.ts` |
| ITU-R P.530-18 | Richtfunk, Schwund, Nassschnee | `utils/atmosphericAttenuation.ts` |
| ITU-R P.368, P.372, P.1239 | Bodenwelle, Funkrauschen, Ionosphäre | `data/propagation.ts`, `data/constants.ts` |
| ITU-R SM.328, SM.1138 | Spektren, notwendige Bandbreite | `data/modulation.ts` |
| ITU-R M.493, M.541 | Digitaler Selektivruf (DSC) | `data/emergencyFrequencies.ts` |
| ITU-R M.2150, M.2160 | IMT-2020, IMT-2030 | `data/mobileNetworks.ts` |
| 3GPP TS 36.101, TS 38.101-1/-2 | LTE- und NR-Bandtabellen | `data/mobileNetworks.ts` |
| ETSI TS 145 005, EN 300 401, EN 302 755 | GSM, DAB, DVB-T2 | `data/broadcast.ts`, `data/mobileNetworks.ts` |
| IEEE Std 521-2019 | Radarband-Buchstaben | `data/bands.ts`, `data/frequencyBands.ts` |
| IEEE Std 145 | Antennenbegriffe | `data/antennas.ts` |
| NATO STANAG 4193 | NATO-Bandsystematik | `data/frequencyBands.ts` |
| Skolnik, *Introduction to Radar Systems* (3. Aufl.) und *Radar Handbook* | Radargleichung, RCS, Doppler, Eindeutigkeit | `utils/radar.ts`, `data/constants.ts` |
| Balanis, *Antenna Theory*; ITU-R BS.1195, F.699 | Antennendiagramme und Kennwerte | `data/antennas.ts`, `utils/antennaMath.ts` |
| Gunn & East (1954), Oguchi (Proc. IEEE 71/9, 1983), Ippolito (NASA Propagation Effects Handbook) | Schneedämpfung | `utils/atmosphericAttenuation.ts` |
| Semtech AN1200.22 | LoRa/CSS | `data/modulation.ts` |
| CODATA 2018 (NIST), SI-Definitionen | Naturkonstanten | `data/constants.ts`, `utils/constants.ts` |
| ITU-Rpy (BSD, inigodelportillo/ITU-Rpy) | Gegenprüfung der P.676-Implementierung und Herkunft der Linientabellen | `utils/itu676.ts` |

Die Lichtgeschwindigkeit ist seit der Neudefinition des Meters (1983) keine Messgröße, sondern exakt 299 792 458 m/s. Alle Umrechnungen zwischen Frequenz und Wellenlänge nutzen diesen Wert; ein gerundeter Wert (3·10⁸ m/s) ist über den Store `speedOfLight` umschaltbar.

---

## Datensätze im Einzelnen

### `data/radioServices.ts` — ITU-Funkdienste (18 Dienste, 79 Zuweisungen)

- **Quelle:** VO Funk Art. 1 (Definitionen) und Art. 5 (Zuweisungstabelle), Ausgabe 2020 inkl. WRC-23; BNetzA-Frequenzplan.
- **Stand:** WRC-23.
- **Unsicherheiten:** Die Frequenzbereiche sind bewusst **repräsentative Hauptbereiche**, keine vollständige Abbildung des Frequenznutzungsplans — ein Funkdienst hat in der VO Funk typischerweise mehrere Dutzend getrennte Zuweisungen. Der Normalfrequenz- und Zeitzeichendienst wurde gegenüber der ursprünglichen Vorlage korrigiert (Zuweisungen der Breite 0 durch die tatsächlichen ITU-Bänder ersetzt).

### `data/amateurBands.ts` — Amateurfunk (22 Bänder, 86 Segmente)

- **Quelle:** IARU-R1-Bandpläne HF und VHF/UHF/Mikrowellen (Novi Sad 2023), AFuV Anlage 1 (Fassung 24.06.2024), VO Funk Art. 5 für den Zuweisungsstatus.
- **Stand:** 2024 (Einführung der Klasse N).
- **Unsicherheiten** — höchste Priorität vor einer praktischen Verwendung:
  - **Zuordnung der Bänder zu den Zeugnisklassen:** Gesichert ist nur der Zugang der **Klasse N** zu 10 m, 2 m und 70 cm mit 10 W EIRP. Alle **Klasse-E-Zuordnungen** (u. a. 2200 m, 630 m, 60 m, 23 cm, 13 cm) sind **Annahmen** und gegen AFuV Anlage 1 zu prüfen.
  - **160-m-Sonderregelungen** (Zeit- und Leistungsfenster oberhalb 1850 kHz) sind bewusst **nicht modelliert**, nur im Notiztext erwähnt.
  - **4-m-Band:** kein reguläres Band, sondern befristete Allgemeinzuteilung; Grenzen schwankten historisch (70,150–70,180 vs. –70,210 MHz). Als `status: 'duldung'` markiert.
  - **9-cm-Band-Obergrenze 3475 MHz:** angenommen; der IARU-R1-Plan behandelt nur 3400–3410 MHz.

### `data/mobileNetworks.ts` — Mobilfunk (6 Generationen, 13 Bänder)

- **Quelle:** 3GPP TS 36.101 (Tabelle 5.5-1), TS 38.101-1/-2, ETSI TS 145 005, BNetzA-Frequenzplan und Auktionsergebnisse 2010/2015/2019, ITU-R M.2150/M.2160.
- **Stand:** 5G NR FR1/FR2; 6G nur als Ausblick nach IMT-2030-Rahmen.
- **Unsicherheiten:** `typicalDownlinkBps` sind **Größenordnungen der Technikstufe**, keine garantierten oder gemessenen Werte einzelner Netze.

### `data/broadcast.ts` — Rundfunk (3 Bereiche, 15 KW-Bänder, 32 DAB-Blöcke, 28 DVB-T2-Kanäle, 4 Sat-Bänder)

- **Quelle:** VO Funk Art. 5, GE75, GE84, GE06, ETSI EN 300 401 (DAB), EN 302 755 (DVB-T2), HFCC-Saisonpläne.
- **Stand:** DAB-Blöcke 5A–12D, DVB-T2-Kanäle 21–48.
- **Unsicherheiten:** **DAB-Blöcke 13A–13F** (230–240 MHz) sowie die Zwischenblöcke 10N/11N/12N sind **bewusst nicht aufgenommen**, weil sie nicht zweifelsfrei belegt werden konnten. Wer sie braucht, ergänzt sie gegen GE06 bzw. die BNetzA-Blockliste.

### `data/emergencyFrequencies.ts` — Not- und Sicherheitsfrequenzen (27 Einträge)

- **Quelle:** VO Funk Art. 30–34 und Anhänge 13/18, IMO GMDSS (SOLAS Kap. IV), ICAO Annex 10, COSPAS-SARSAT C/S T.001, BNetzA-Allgemeinzuteilungen, BDBOS, IARU-R1 Emergency Centre of Activity.
- **Stand:** aktuelle Fassungen der genannten Regelwerke.
- **Unsicherheiten:** Diskrete Kanallisten (HF-DSC, HF-Sprechfunk, Notfunk-Aktivitätsfrequenzen, Freenet) stehen im Feld `channelsHz` und spannen **keinen** durchgehenden Bereich auf — die Umkreissuche trifft nur nahe eines Kanals. **Für den realen Not- und Sicherheitsfunk gelten ausschließlich die amtlichen Unterlagen.**

### `data/applications.ts` + `applications.json` — Frequenzzuweisungen (105 Einträge, 12 Kategorien)

- **Quelle:** VO Funk, ETSI-Normen, nationale Zuweisungstabellen (BNetzA, FCC).
- **Stand:** Werte gelten für Europa/Deutschland (ITU-Region 1), sofern nicht anders vermerkt.
- **Unsicherheiten:** Zuweisungen unterscheiden sich je Region; hier stehen nur echte Frequenz**bereiche** (`minHz !== maxHz`). Einzelfrequenzen gehören in `transmitters.json`.

### `data/transmitters.json` + `transmitters.ts` — Sender (37 Einträge)

- **Quelle:** Betreiberangaben und Fachveröffentlichungen.
- **Unsicherheiten:**
  - **Sendeleistungen** von DHO38 (800 kW), NAA Cutler (1,8 MW), Nauen (500 kW), DWD-Radar (250 kW Impulsspitze) und HAARP (3,6 MW) sind **Größenordnungen aus Sekundärquellen**, je im `notes`-Feld gekennzeichnet.
  - **GNSS-EIRP** (25–27 W) ist eine Größenordnung; maßgeblich sind die Mindestempfangsleistungen (−158,5 dBW für GPS L1 C/A).
  - **Betriebszustände** von `bbc-radio4-198` und `bbc-r5-909` sind Annahmen — der Rückbau der britischen LW-/MW-Netze läuft.
  - **Koordinaten** sind gerundete Näherungen aus Sekundärquellen, keine Vermessungsdaten.

### `data/bands.ts` und `data/frequencyBands.ts` — Bandschemata

- **Quelle:** VO Funk Art. 2 (ITU-Bänder ELF–THF), IEEE Std 521-2019, NATO STANAG 4193, IARU-R1-Bandpläne.
- **Unsicherheiten / bekannte Altlasten:**
  - **Doppelter `EM_BANDS`-Export** in `bands.ts` und `spectrum.ts` mit abweichenden Grenzen — in beiden Dateien dokumentiert, bewusst nicht zusammengeführt.
  - **NATO-Bänder N und O** sind in der Literatur uneinheitlich belegt; dokumentiert, nicht entfernt.

### `data/modulation.ts` — Modulationsverfahren (16 Einträge)

- **Quelle:** ITU-R SM.328, SM.1138, IEEE 802.11, 3GPP, Semtech AN1200.22 (LoRa).
- **Unsicherheiten:** `spectralEfficiencyBpsPerHz` sind **Richtwerte unter guten Empfangsbedingungen**, keine Normwerte. Exakt sind nur die log₂(M)-Werte.

### `data/antennas.ts` — Antennentypen (10 Einträge)

- **Quelle:** IEEE Std 145, ITU-R BS.1195, ITU-R F.699, Balanis *Antenna Theory*.
- **Unsicherheiten:** `gainMin/MaxDbi` sind konservative Praxisspannen. **Exakt** sind: isotrop 0 dBi, Halbwellendipol 2,15 dBi / 73,1 Ω, Monopol 36,5 Ω, λ/4 über idealer Masse 5,15 dBi.

### `data/history.ts` — Fernmeldegeschichte (48 Meilensteine)

- **Quelle:** Fachliteratur und Betreiberangaben.
- **Unsicherheiten:** Bei frühen Ereignissen (Hülsmeyer, Fessenden, erste Rundfunkaussendungen) weichen Datierungen je nach Quelle ab; angegeben ist jeweils die verbreitetste Zuordnung.

### `data/constants.ts` und `data/propagation.ts` — Konstanten und Ausbreitung

- **Quelle:** CODATA 2018 (NIST) für die Naturkonstanten; ITU-R P.368, P.372, P.1239 für Bodenwelle, Rauschen und Ionosphäre; Skolnik für die RCS-Referenztabelle.
- **Unsicherheiten:** Ionosphärische Kennwerte (Schichthöhen, Elektronendichten, MUF-Faktoren) sind **typische Tages-/Nachtwerte**, keine Vorhersage; die Anwendung kennzeichnet die zugehörigen Darstellungen als „schematisch". Der Radiohorizont nutzt den Standard-k-Faktor 4/3.

### `data/navigation.ts`, `relations.ts`, `searchIndex.ts`

Redaktionelle Strukturdaten ohne externe Quelle: Navigationsbaum (34 Knoten), Themenverweise und Suchindex (271 Einträge). Sie werden aus den übrigen Datensätzen und dem Navigationsbaum abgeleitet und durch Tests konsistent gehalten.

---

## Rechenmodelle: Gültigkeit und Grenzen

| Modell | Gültigkeitsbereich | Anmerkung |
|---|---|---|
| Gasdämpfung P.676-13 Annex 1 | 1 GHz … 1000 GHz, Bodennähe bis ca. 10 km | numerisch gegen ITU-Rpy geprüft |
| Schrägpfad P.676 Annex 2 | wie oben | h_w nach P.676-13, h_o in geschlossener Form nach P.676-12; Abweichung für f < 350 GHz < 10 % |
| Regendämpfung P.838-3 | 1–1000 GHz, horizontale/vertikale/zirkulare Polarisation | zirkular über cos 2τ, abhängig vom Elevationswinkel |
| Nebel/Wolken P.840-9 | Double-Debye | Flüssigwassergehalt als Eingabe |
| Schnee | Nassschnee ≈ Regen gleicher Wasseräquivalent-Rate, Trockenschnee nach Gunn & East | stetiges Modell über die Temperaturschwelle |
| FSPL P.525 | freier Raum, Fernfeld | keine Boden-, Bebauungs- oder Vegetationsverluste |
| Radargleichung (Skolnik) | monostatisches Pulsradar | Systemverluste als Eingabe, Standard 0 dB |
| Fresnel / Messerschneide P.526 | einzelnes ideales Hindernis | keine Mehrfachbeugung |
| Bodenwellenreichweite im Ausbreitungs-Widget | — | dokumentierte Faustregel (log-Interpolation typischer Reichweiten), **kein** Ausbreitungsmodell; im Widget als „schematisch" gekennzeichnet |
| Ionosphären-Widget (MUF, LUF, Skip) | — | Sekantengesetz und typische Tages-/Nachtfaktoren; als „schematisch" gekennzeichnet |
| Modulationsspektren | Linienspektren einer reinen Sinus- bzw. Rechteck-Nachricht, ohne Sendefilter | FM/PM über die Besselreihe; oberhalb Modulationsindex 20 trägt allein der Carson-Balken die Aussage |
| Richtdiagramme | Dipol und Kurzdipol analytisch, Gruppe über den Gruppenfaktor | Yagi und Parabol als Gaußkeule mit θ ≈ √(41253/G) und flacher Rückkeule — Näherung ohne Nebenkeulenstruktur |
| Konstellation mit Rauschen | AWGN bei mittlerer Symbolleistung 1 | `requiredSnrDb` ist ein Richtwert (9,6 dB + 3 dB je zusätzlichem Bit), keine berechnete Fehlerrate |

---

## Wie neue Daten aufgenommen werden

1. Frequenzen als **Zahl in Hz**, keine Strings, keine Magic Numbers — benannte Konstanten im selben Modul.
2. **Quelle im Dateikopf** oder im `source`-Feld des Eintrags; Fassung/Jahr mit angeben.
3. Nicht gesicherte Angaben mit `Annahme:` kommentieren, hier unter „Unsicherheiten" und in `content/funktechnik/quellen.ts` ergänzen.
4. Test in `src/tests/radioData.test.ts` (Struktur, Plausibilität, Überlappungsfreiheit) erweitern.
5. Echte Umlaute in allen Klartextfeldern.
