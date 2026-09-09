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
| Amateurfunkgesetz und Amateurfunkverordnung (AFuV), **Anlage 1, Fundstelle BGBl. 2024 I Nr. 175, S. 1–4**, in Kraft seit 24.06.2024 | Bundesrepublik Deutschland | Zeugnisklassen, Bandgrenzen, Leistungs- und Statusangaben je Band (lfd. Nrn. 1–44, verifiziert 2026-09-09) |
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
| ICAO Annex 10 Vol. IV | Sekundärradar: Modi A, C und S, Impulsabstände, Antwortrahmen | `widgets/SsrModel.ts` |
| ICAO Doc 4444 (PANS-ATM) | Squawk-Codes mit fester Bedeutung (7500, 7600, 7700) | `widgets/SsrModel.ts`, `widgets/SsrCodePicker.svelte` |
| EUROCONTROL, *Principles of Mode S Operation and Interrogator Codes* | Mode-S-Abfragebetrieb, Interrogator-Kennungen | `widgets/SsrModel.ts` |
| RTCA DO-260B / EUROCAE ED-102A | ADS-B auf 1090 MHz (Extended Squitter) | `widgets/SsrModel.ts`, `data/aviationBands.ts` |
| ETSI EN 301 091 | Kfz-Radar im 76–77-GHz-Band | `widgets/FmcwModel.ts` |
| NATO STANAG 4193 | NATO-Bandsystematik | `data/frequencyBands.ts` |
| Skolnik, *Introduction to Radar Systems* (3. Aufl.) und *Radar Handbook* | Radargleichung, RCS, Doppler, Eindeutigkeit | `utils/radar.ts`, `data/constants.ts` |
| Balanis, *Antenna Theory*; ITU-R BS.1195, F.699 | Antennendiagramme und Kennwerte | `data/antennas.ts`, `utils/antennaMath.ts` |
| Gunn & East (1954), Oguchi (Proc. IEEE 71/9, 1983), Ippolito (NASA Propagation Effects Handbook) | Schneedämpfung | `utils/atmosphericAttenuation.ts` |
| Semtech AN1200.22 | LoRa/CSS | `data/modulation.ts` |
| ICNIRP-Leitlinien (1998/2020), 26. BImSchV | **Nur zur Einordnung** genannt — keine Grenzwerttabellen hinterlegt | `content/grundlagen/leistung-und-pegel.ts` |
| CODATA 2018 (NIST), SI-Definitionen | Naturkonstanten: c, k_B, Planck-Konstante h, Feldwellenwiderstand Z₀ = 376,730 313 668 Ω | `data/constants.ts`, `utils/constants.ts` |
| ITU-Rpy (BSD, inigodelportillo/ITU-Rpy) | Gegenprüfung der P.676-Implementierung und Herkunft der Linientabellen | `utils/itu676.ts` |

Die Lichtgeschwindigkeit ist seit der Neudefinition des Meters (1983) keine Messgröße, sondern exakt 299 792 458 m/s. Alle Umrechnungen zwischen Frequenz und Wellenlänge nutzen diesen Wert; ein gerundeter Wert (3·10⁸ m/s) ist über den Store `speedOfLight` umschaltbar.

---

## Datensätze im Einzelnen

### `data/radioServices.ts` — ITU-Funkdienste (18 Dienste, 79 Zuweisungen)

- **Quelle:** VO Funk Art. 1 (Definitionen) und Art. 5 (Zuweisungstabelle), Ausgabe 2020 inkl. WRC-23; BNetzA-Frequenzplan.
- **Stand:** WRC-23.
- **Unsicherheiten:** Die Frequenzbereiche sind bewusst **repräsentative Hauptbereiche**, keine vollständige Abbildung des Frequenznutzungsplans — ein Funkdienst hat in der VO Funk typischerweise mehrere Dutzend getrennte Zuweisungen. Der Normalfrequenz- und Zeitzeichendienst wurde gegenüber der ursprünglichen Vorlage korrigiert (Zuweisungen der Breite 0 durch die tatsächlichen ITU-Bänder ersetzt).

### `data/amateurBands.ts` — Amateurfunk (27 Bänder, 101 Segmente)

- **Quelle:** **AFuV Anlage 1, Buchstabe A (Tabellarische Übersicht) und B (Zusätzliche Nutzungsbestimmungen), Fundstelle BGBl. 2024 I Nr. 175, S. 1–4**, in Kraft seit 24.06.2024 — <https://www.gesetze-im-internet.de/afuv_2005/anlage_1.html>, abgerufen **2026-09-09**. Segmente aus den IARU-R1-Bandplänen HF, VHF/UHF/Mikrowellen und µWave (Novi Sad 2023); 4-m-Band aus den BNetzA-Amtsblattmitteilungen zur Duldungsregelung 70 MHz.
- **Stand:** AFuV in der Fassung vom 24.06.2024; Duldungsregelungen mit Stand 2026-09-08. **Alle 44 Frequenzbereiche der Anlage 1 mit Status- und Leistungsangabe sind abgebildet** (135,7 kHz bis 250 GHz).
- **Verifiziert am 2026-09-08** (Primärquelle, gegengeprüft an der englischen BNetzA-Fassung von Anlage 1 sowie an 12db.de, alsor.de und dd1go.de):
  - Zulässige Zeugnisklassen und Leistungsgrenzen **je Band und Klasse** (Felder `powerLimits`, `licenseClasses`), einschließlich der Staffelung der Klasse E (100 W PEP auf Kurzwelle, 75 W PEP auf 2 m bis 23 cm, 5 W PEP ab 13 cm) und der Klasse N (10 W ERP auf 10 m, 6,1 W ERP ≙ 10 W EIRP auf 2 m und 70 cm).
  - Der **Status** (Spalte 3 der Anlage 1) für jedes Band. Er gibt die **nationale** Zuweisung wieder und kann vom ITU-Status abweichen — 430–440 MHz führt die AFuV als primär, die VO Funk weist dem Amateurfunkdienst dort sekundären Status zu.
  - Die **160-m-Sonderregelungen** sind jetzt modelliert: 1810–1850 kHz 750/100 W PEP, 1850–1890 kHz je 75 W PEP, 1890–2000 kHz je 10 W PEP, an Wochenenden durchgehend 750/100 W PEP (Nutzungsbestimmung 15). Ebenso 6 m oberhalb 50,4 MHz (25 W PEP) und 1247–1263 MHz (3,05 W ERP, Schutz von Galileo E6).
  - **9-cm-Obergrenze 3475 MHz:** belegt (lfd. Nr. 24), keine Annahme mehr. Der IARU-R1-Plan behandelt nur 3400–3410 MHz — das betrifft die Segmente, nicht die Bandgrenze.
- **Ergänzt und verifiziert am 2026-09-09** (Primärquelle Anlage 1 Buchstabe A, lfd. Nrn. 35 bis 44; gegengeprüft an der Synopse der Änderung vom 24.06.2024 auf buzer.de, an umwelt-online.de und an der englischen BNetzA-Fassung): die fünf Millimeterbänder oberhalb 24,25 GHz.

  | Band | Bereich | lfd. Nr. | Status | Klasse A | Klasse E | Nutzungsbestimmungen |
  |---|---|---|---|---|---|---|
  | 6 mm | 47–47,2 GHz | 35 | primär | 75 W PEP | 5 W PEP | 13, 17 |
  | 4 mm | 76–81 GHz | 36–39 | sekundär | 75 W PEP | 5 W PEP | 9, 13, 17 |
  | 2,5 mm | 122,25–123 GHz | 40 | sekundär | 75 W PEP | 5 W PEP | 9, 17 |
  | 2 mm | 134–141 GHz | 41, 42 | 134–136 GHz primär, 136–141 GHz sekundär | 75 W PEP | 5 W PEP | 9, 13, 17 |
  | 1,2 mm | 241–250 GHz | 43, 44 | 241–248 GHz sekundär, 248–250 GHz primär | 75 W PEP | 5 W PEP | 13, 17 |

  Die Klasse N hat in keinem dieser Bereiche Zugang. **Nutzungsbestimmung 13** weist den Amateurfunkdienst über Satelliten in 47–47,2 GHz, 134–136 GHz und 248–250 GHz als **primären**, in 76–81 GHz, 136–141 GHz und 241–248 GHz als **sekundären** Funkdienst aus; 122,25–123 GHz ist dort nicht genannt und kennt daher keinen Satellitenbetrieb. Die vier Zeilen 36 bis 39 (76–77,5, 77,5–78, 78–79, 79–81 GHz) tragen denselben Status und dieselben Grenzen und sind deshalb zu einem Band zusammengefasst; ebenso die Zeilenpaare 41/42 und 43/44 mit `status: 'gemischt'`.
- **Unsicherheiten / bewusste Auslassungen:**
  - **4-m-Band:** kein Band der AFuV, sondern eine jahrweise verlängerte Duldungsregelung (zuletzt 70,150–70,210 MHz, 25 W ERP, 12 kHz, horizontale Polarisation, nur Klasse A) — befristet bis **31.12.2025**. Eine Fortführung war am 2026-09-08 nicht veröffentlicht; im Datensatz als `Annahme:` gekennzeichnet, `status: 'duldung'`.
  - **6-m-Band, Klasse E:** Die Duldungsregelung (BNetzA-Verfügung 105/2024, gültig bis 31.12.2025) wurde nicht verlängert; der Datensatz führt 6 m deshalb nur für die Klasse A.
  - **Nicht aufgenommen:** allein die lfd. Nr. 45 („> 275 GHz“). Die Anlage 1 weist dort weder Status noch Leistungsgrenze aus; Nutzungsbestimmung 14 nennt die Teilbereiche 444–453 GHz, 510–546 GHz, 711–730 GHz, 909–926 GHz, 945–951 GHz und Frequenzen oberhalb von 956 GHz, in denen der Amateurfunkdienst keinen Störungsschutz beanspruchen kann. Der Dateikopf nennt diese Auslassung.
  - **Segmente der Millimeterbänder:** Der IARU-R1-µWave-Bandplan war über den Proxy nur in Ausschnitten zu beschaffen. Belegt übernommen sind das Schmalband-Aktivitätszentrum 47 088,000 MHz (6 mm) und das Schmalbandsegment 134,928–134,930 GHz mit höchstens 2,7 kHz Bandbreite (2 mm); für 4 mm, 2,5 mm und 1,2 mm führt der Datensatz je ein Sammelsegment „alle Betriebsarten“ statt erfundener Anruffrequenzen.
  - **Nutzungsbestimmungen Buchstabe B:** Im Feld `sourceRef` stehen nur die Nummern, nicht der Wortlaut. Wer den Wortlaut braucht, liest ihn in der Primärquelle nach.
  - **Segmentgrenzen** innerhalb der Bänder stammen aus den IARU-Bandplänen; sie sind eine Empfehlung und rechtlich nicht bindend.

### `data/mobileNetworks.ts` — Mobilfunk (6 Generationen, 13 Bänder)

- **Quelle:** 3GPP TS 36.101 (Tabelle 5.5-1), TS 38.101-1/-2, ETSI TS 145 005, BNetzA-Frequenzplan und Auktionsergebnisse 2010/2015/2019, ITU-R M.2150/M.2160.
- **Stand:** 5G NR FR1/FR2; 6G nur als Ausblick nach IMT-2030-Rahmen.
- **Unsicherheiten:** `typicalDownlinkBps` sind **Größenordnungen der Technikstufe**, keine garantierten oder gemessenen Werte einzelner Netze.

### `data/broadcast.ts` — Rundfunk (3 Bereiche, 15 KW-Bänder, 41 DAB-Blöcke, 28 DVB-T2-Kanäle, 4 Sat-Bänder)

- **Quelle:** VO Funk Art. 5, GE75, GE84, GE06, ETSI EN 300 401 (DAB), EN 302 755 (DVB-T2), HFCC-Saisonpläne.
- **Quellen der Kanal-13- und Zwischenblöcke** (alle abgerufen **2026-09-08**):
  - EBU Technology & Innovation, Factsheet *The use of Band III in Europe* — <https://tech.ebu.ch/docs/factsheets/ebu_fs_use_of_bandIII_v1.pdf>: Band III reicht von 174 bis 230 MHz; Kanal 13 umfasst zusätzlich 230–240 MHz und ist in sechs Blöcke 13A–13F geteilt, geplant nur von wenigen Ländern (u. a. Norwegen, Dänemark).
  - Hoeg/Lauterbach, *Digital Audio Broadcasting*, Anhang A2: die Blöcke **10N, 11N, 12N** wurden von CENELEC nachgetragen und liegen in den breiteren Schutzabständen der Kanaltabelle.
  - Übereinstimmende Sekundärquellen der Blockmitten: OpenDigitalRadio *Band 3 Channels*, Wikipedia *Band III* und *T-DAB-Frequenz*, wohnort.org sowie mehrere Empfängerhandbücher.
- **Stand:** DAB-Blöcke 5A–13F (41 Einträge), davon **32 in Deutschland genutzt** (`DAB_BLOCKS_DE`, 5A–12D zwischen 174 und 230 MHz); DVB-T2-Kanäle 21–48.
- **Kennzeichnung:** Jeder Block trägt `usedInGermany`; die neun national ungenutzten Blöcke tragen zusätzlich eine `noteDE`. Der Kanalumrechner markiert sie in der Auswahlliste mit „(nicht in DE)" und zeigt die Notiz an.
- **Unsicherheiten:** Die Umkehrsuche `dabBlockForFrequency` durchsucht **nur** `DAB_BLOCKS_DE` — 10N/11N/12N überlappen ihre Nachbarblöcke, eine Zuordnung wäre sonst mehrdeutig. Welche Länder Kanal 13 aktuell tatsächlich belegen, ist nicht im Datensatz abgebildet.

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

---

## Nachtrag: See-, Flug-, Behörden- und Satellitenfunk

Ergänzt am 08.09.2026 zusammen mit den Kapiteln `/wissen/funktechnik/seefunk/`,
`/wissen/funktechnik/flugfunk/`, `/wissen/funktechnik/bos/` und
`/wissen/funktechnik/satellitenfunk/`.

### `data/maritimeChannels.ts` — Seefunk (59 UKW-Kanäle, 21 MF/HF-Frequenzen, 4 Seegebiete)

- **Quelle:** ITU Radio Regulations Appendix 18 (Rev. WRC-19) für die UKW-Kanaltabelle,
  Appendix 15 für die Not- und Sicherheitsfrequenzen auf Grenz- und Kurzwelle;
  SOLAS Kapitel IV und IMO Res. A.801(19) für die Seegebiete A1–A4;
  ITU-R M.493/M.541 (DSC), ITU-R M.1371 (AIS); BSH-Veröffentlichungen;
  RAINWAT (Basel 2000, Fassung Bukarest 2012) für die ATIS-Pflicht auf Binnenwasserstraßen.
- **Modellierung:** Schiffs- und Küstensendefrequenz je Kanal, Duplexabstand fest 4,6 MHz,
  Leistungsgrenze nur dort gesetzt, wo Appendix 18 sie abweichend festlegt (Kanäle 15, 17, 75, 76).
- **Unsicherheiten:** Das Feld `usage` gibt **eine** Hauptnutzung an, während Appendix 18 mehrere
  Spalten führt (Schiff–Schiff, Hafenfunk, Schiffsbewegungsdienst, öffentlicher Verkehr) und die
  Belegung regional abweicht — bewusst vereinfacht (`Annahme:` im Dateikopf der Rohtabelle).
  Die Küstenfrequenzen der Kanäle 27 und 28 sind seit WRC-15 dem Nachrichtendienst ASM 1/ASM 2
  zugewiesen; das steht als Hinweistext am Kanal, die Kanäle bleiben in der Tabelle.
  Die Reichweitenangaben der Seegebiete sind Richtwerte — maßgeblich ist die tatsächliche
  Funkabdeckung, die jede Verwaltung selbst festlegt.

### `data/aviationBands.ts` — Flugfunk (15 Bereiche, 11 HF-Segmente, 8,33-kHz-Kanalregel)

- **Quelle:** ICAO Annex 10 Volume I (Funknavigation), Volume III (Kommunikation),
  Volume IV (Überwachung) und Volume V (Frequenznutzung, Kanalbezeichnungstabelle);
  VO Funk Artikel 5 und Appendix 27 (HF-Flugfunkbänder);
  Durchführungsverordnung (EU) Nr. 1079/2012 (8,33 kHz im europäischen Luftraum);
  RTCA DO-260 / EUROCAE ED-102 (ADS-B), ARINC 618/620 (ACARS).
- **Modellierung:** Die Umrechnung Kanalbezeichnung ↔ Frequenz ist als Rechenregel abgebildet,
  nicht als Tabelle: Rest des kHz-Anteils modulo 25 bestimmt den Platz im 25-kHz-Raster
  (0 = 25-kHz-Kanal; 5/10/15 = die drei 8,33-kHz-Kanäle). Die Endungen 20, 45, 70 und 95 sind
  ungültig und werden abgewiesen. Geprüft in `src/tests/funk-flugfunk.test.ts`.
- **Unsicherheiten:** Die Bereichsgrenzen sind Nennwerte des Frequenzplans. Welche Frequenz an
  einem Ort tatsächlich belegt ist, steht ausschließlich im Luftfahrthandbuch AIP.

### `components/funk/BosTimelineModel.ts` — BOS-Funk (2 analoge Bänder, 8 Meilensteine, 8 Vergleichszeilen)

- **Quelle:** BNetzA-Frequenzplan für die analogen Bereiche; BDBOS für Gründung (2. April 2007)
  und Abschluss des Netzaufbaus (2016, letzter Netzabschnitt Schwaben Süd-West);
  ETSI EN 300 392 (TETRA) und EN 300 396 (Direktbetrieb);
  Verordnung (EU) 2015/758 und Durchführungsverordnung (EU) 2017/79 (eCall, Pflicht ab 31.03.2018);
  Advanced Mobile Location im deutschen Notruf seit Oktober 2019.
  Rechtslage zum Abhörverbot: § 5 und § 27 TDDDG (bis 05/2024 TTDSG, davor § 89 TKG).
- **Modellierung:** 4-m-Band 74,215–77,475 / 84,015–87,255 MHz, Duplexabstand 9,8 MHz,
  Kanäle 347–510; 2-m-Band 167,560–169,380 / 172,160–173,980 MHz, Duplexabstand 4,6 MHz,
  Kanäle 201–292; Raster 20 kHz. Kanalfrequenz aus Bandanfang und Kanalnummer gerechnet.
- **Unsicherheiten:** Das 4-m-Oberband endet bei 87,255 MHz und damit einen Rasterschritt vor dem
  rechnerischen Wert, weil der Kanal 510 nur im Unterband vorgesehen ist (im Feld `noteDE`
  festgehalten, im Test geprüft). Die Einträge „1950er", „1970er", „1980er" und „1990er" des
  Zeitstrahls fassen schrittweise Entwicklungen zusammen und sind **keine Stichtage**
  (`Annahme:` im Dateikopf). Rufgruppen-, Kanal- und Betriebsdaten der Behörden sind nicht
  öffentlich und deshalb bewusst nicht Teil des Datensatzes.

### `data/satelliteSystems.ts` und `utils/orbitMath.ts` — Satellitenfunk (4 Bahnklassen, 6 Bänder, 10 Systeme)

- **Quelle:** VO Funk Artikel 5 und 22; IEEE Std 521-2019 (Bandbuchstaben);
  ITU-R P.618-13 (Erde-Weltraum-Strecke), P.838-3 (Regen), P.840-8 (Wolken);
  WGS 84 / IERS Conventions 2010 für µ = 3,986 004 418 · 10¹⁴ m³/s²;
  ETSI EN 300 421 / EN 302 307 (DVB-S/S2); AMSAT-DL (QO-100); NOAA/NESDIS (APT).
- **Modellierung:** Kreisbahn im Zweikörperproblem — Umlaufzeit T = 2π·√(r³/µ),
  Bahngeschwindigkeit v = √(µ/r), Schrägentfernung über die Kosinusbeziehung,
  Ausleuchtzone über den Zentriwinkel, Freiraumdämpfung aus `utils/calculations.ts` (P.525).
  Prüfwerte im Test: GEO 35 786 km → 23 h 56 min und 239 ms Umlauflaufzeit im Zenit;
  ISS 420 km → 93 min.
- **Unsicherheiten:** Abplattung der Erde, Luftwiderstand und Störungen durch Sonne und Mond
  bleiben unberücksichtigt. Die **Sichtbarkeitsdauer** gilt für einen zentralen Überflug durch den
  Zenit ohne Erddrehung und ist damit ein Bestwert (`Annahme:` an der Funktion). Die
  **Dopplerverschiebung** wird als obere Schranke aus der vollen Bahngeschwindigkeit gerechnet;
  die tatsächliche radiale Geschwindigkeit ist kleiner. Die Satellitenzahlen der
  Breitbandkonstellationen ändern sich laufend und sind deshalb mit `null` hinterlegt.
  Das S-Band ist als dokumentierte Ausnahme von der Regel „Aufwärtsstrecke über Abwärtsstrecke"
  gekennzeichnet (`uplinkAbove: false`).

### `utils/fieldStrength.ts`, `widgets/EmWaveModel.ts` — Grundlagenkapitel (EIRP/ERP, Feldstärke, EM-Welle)

- **Quelle:** Meinke/Gundlach, *Taschenbuch der Hochfrequenztechnik* (ebene Welle,
  Feldwellenwiderstand, Strahlungsleistung, Nah- und Fernfeld); Pozar, *Microwave Engineering*
  (Friis-Gleichung, Wirkfläche, Polarisationsverlustfaktor); IEEE Std 100 (EIRP, ERP, dBµV/m);
  IEEE Std 145 (Polarisation, RHCP/LHCP, Kreuzpolarisation); ITU-R V.574-5 und IEC 60027-3
  (Dezibel); CODATA 2018 (NIST) für h, c und Z₀ = 376,730 313 668 Ω
  (`FREE_SPACE_IMPEDANCE` in `data/constants.ts`); ICNIRP-Leitlinien für die Grenze der
  nichtionisierenden Strahlung bei 100 nm (`IONIZING_BOUNDARY_WAVELENGTH`).
- **Modellierung:** Freiraum im Fernfeld — EIRP = P·G, ERP = EIRP/1,64 (2,15 dB Dipolgewinn
  aus `data/antennas.ts`), S = EIRP/(4π·d²), E = √(S·Z₀). Der Zahlenwert 30 der Schulformel
  E = √(30·P·G)/d wird als Z₀/(4π) = 29,98 exakt gerechnet, nicht gerundet. Prüfwerte im Test:
  1 W an 0 dBi in 1 m → 5,48 V/m; EIRP 1 W → ERP 0,61 W; 20 dB Abfall je Abstandsdekade.
- **Unsicherheiten / Annahmen:** Bodenreflexion, Bewuchs und Mehrwegeausbreitung sind **nicht**
  enthalten; die Werte gelten erst jenseits der Fernfeldgrenze 2·D²/λ. Die
  Kreuzpolarisationsentkopplung ist mit 20 dB als konservativer Richtwert angesetzt
  (`Annahme:` an `CROSS_POLARIZATION_LOSS_DB`) — theoretisch ist der Verlust unendlich, reale
  Antennen erreichen 20 bis 30 dB. **Grenzwerte des Personenschutzes** (26. BImSchV, ICNIRP)
  werden im Kapitel nur genannt und verlinkt; es sind bewusst **keine Grenzwerttabellen**
  hinterlegt, weil die Werte frequenzabhängig sind und fortgeschrieben werden.

---

## Nachtrag: Datensätze aus Welle 5 (Glossar, Lernpfade, Widget-Katalog)

Diese drei Datensätze enthalten **keine neuen Messwerte** — sie ordnen vorhandene Inhalte. Trotzdem gehören sie hierher, damit die Übersicht vollständig bleibt.

### `data/glossary.ts` — Glossar (92 Begriffe, 7 Kategorien)

- **Quelle:** Die Definitionen sind eigenständig formuliert und stützen sich auf die bereits in diesem Dokument geführten Regelwerke und Normen (VO Funk, ITU-R P-Serie, IEEE Std 145/521, 3GPP, ICAO Annex 10). Elf Kurztexte (u. a. FSPL, EIRP, Empfindlichkeit, Schwundreserve, ITU-/IEEE-/NATO-Bänder, Regendämpfung) werden aus `data/explanations.ts` **eingebunden**, nicht kopiert — es gibt für sie weiterhin nur eine Fassung.
- **Modellierung:** je Eintrag `id`, `term`, Kurz- und optionaler Langtext, Einheit, Formel, `related`-Verweise, Kategorie und optionale Quelle. `GLOSSARY_COVERED_TITLES` verhindert Doppeleinträge im Suchindex.
- **Unsicherheiten:** Die `related`-Ziele werden im Test gegen `NAV_TREE` und die Ankerlisten geprüft; fachliche Abgrenzungen (etwa „Bandbreite" im Signal- und im Kanalkontext) sind bewusst knapp gehalten und verweisen auf das jeweilige Kapitel.

### `data/learningPaths.ts` — Lernpfade (4 Pfade, 30 Schritte)

- **Quelle:** didaktische Setzung des Projekts, keine externe Vorlage. Jeder Schritt zeigt auf eine bestehende Seite; die Reihenfolge folgt der fachlichen Abhängigkeit (Spektrum → EM-Wellen → Dezibel → Ausbreitung → Streckenrechnung).
- **Unsicherheiten / Annahme:** `durationMin` (70–80 min je Pfad) ist ausdrücklich als **Annahme** gekennzeichnet — gerechnet mit rund 10 min je Kapitel und 5 min je Rechner. Der Wert ist eine Orientierung, keine Messung.
- **Konsistenz:** `src/tests/learningPaths.test.ts` verlangt, dass jeder Schritt ein lebender Knoten aus `NAV_TREE` ist; `resolvePathSteps()` blendet fehlende Ziele zur Laufzeit aus.

### `data/widgets.ts` — Widget-Katalog (20 Einträge)

- **Quelle:** Metadaten zu den interaktiven Widgets (Bezeichnung, Beschreibung, Stichworte, Kapitel). Die fachlichen Grundlagen der Widgets stehen bei den jeweiligen Rechenmodellen und sind oben in diesem Dokument belegt.
- **Modellierung:** `embed: 'content'` für Widgets, die als Block in den Kapiteldaten stehen (von `widgetLocations()` auffindbar), `embed: 'markup'` für die sechs Widgets, die direkt in den Seitenkomponenten von `/wissen/modulation/` und `/wissen/antennen/` sitzen und ihre Anker-ID dort tragen.
- **Unsicherheiten:** keine — `src/tests/widgetRegistry.test.ts` prüft für jeden Eintrag Komponente, Kapitelknoten und Fundstelle.
