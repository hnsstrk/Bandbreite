/**
 * ITU-Funkdienste (Radiocommunication Services)
 *
 * Zuordnung der in der Vollzugsordnung für den Funkdienst (VO Funk / ITU Radio
 * Regulations, Artikel 1) definierten Funkdienste zu den in Deutschland bzw.
 * ITU-Region 1 tatsächlich genutzten Frequenzbereichen.
 *
 * Die Frequenzbereiche sind bewusst als repräsentative Hauptbereiche modelliert,
 * nicht als vollständige Abbildung des Frequenznutzungsplans: ein Funkdienst hat
 * in der VO Funk typischerweise mehrere Dutzend getrennte Zuweisungen.
 *
 * Quellen:
 * - ITU Radio Regulations (VO Funk), Artikel 1 (Definitionen) und Artikel 5
 *   (Frequenzbereichszuweisungstabelle), Ausgabe 2020 inkl. WRC-23-Beschlüssen
 * - Bundesnetzagentur, Frequenzplan gemäß § 90 TKG
 * - CEPT/ECC European Common Allocation Table (ECA)
 *
 * Hinweis: Alle Beschreibungen sind eigenständig formuliert. Regulatorische
 * Grenzwerte sind Tatsachenangaben aus den genannten Regelwerken.
 */

/** Status einer Frequenzzuweisung an einen Funkdienst (VO Funk Art. 5). */
export type AllocationStatus = 'primaer' | 'sekundaer' | 'gemischt';

/** Gruppierung der Funkdienste für Filter und Legenden. */
export type RadioServiceGroup =
  | 'rundfunk'
  | 'mobil'
  | 'fest'
  | 'navigation'
  | 'ortung'
  | 'satellit'
  | 'wissenschaft'
  | 'sicherheit'
  | 'amateur';

/** Ein einzelner, zusammenhängender Frequenzbereich eines Funkdienstes. */
export interface ServiceAllocation {
  /** Untere Bandgrenze in Hz */
  minHz: number;
  /** Obere Bandgrenze in Hz */
  maxHz: number;
  /** Kurzbezeichnung des Teilbereichs */
  label: string;
  /** Zuweisungsstatus in Region 1 */
  status: AllocationStatus;
}

/** Ein ITU-Funkdienst mit deutschen/Region-1-Frequenzbereichen. */
export interface RadioService {
  /** Eindeutige ID (kebab-case) */
  id: string;
  /** Deutsche Bezeichnung gemäß VO Funk */
  nameDE: string;
  /** Englische Bezeichnung gemäß ITU RR */
  nameEN: string;
  /** Gruppierung für UI-Filter */
  group: RadioServiceGroup;
  /** Eigenständig formulierte Kurzbeschreibung */
  descriptionDE: string;
  /** Repräsentative Frequenzbereiche in Deutschland / Region 1 */
  allocations: ServiceAllocation[];
  /** Konkrete Beispielsysteme */
  examplesDE: string[];
  /** Regulatorische Grundlage / Quelle */
  source: string;
}

export const RADIO_SERVICES: RadioService[] = [
  // --------------------------------------------------------------------------
  // Rundfunk
  // Quelle: VO Funk Art. 5; GE75 (LW/MW), GE84 (UKW), GE06 (DAB/DVB-T)
  // --------------------------------------------------------------------------
  {
    id: 'rundfunkdienst',
    nameDE: 'Rundfunkdienst',
    nameEN: 'Broadcasting service',
    group: 'rundfunk',
    descriptionDE:
      'Einseitig gerichtete Aussendung an die Allgemeinheit. Umfasst analogen Hörfunk auf ' +
      'Lang-, Mittel- und Kurzwelle sowie UKW und die digitalen Nachfolger DAB+ und DVB-T2.',
    allocations: [
      { minHz: 148.5e3, maxHz: 283.5e3, label: 'Langwelle', status: 'primaer' },
      { minHz: 526.5e3, maxHz: 1606.5e3, label: 'Mittelwelle', status: 'primaer' },
      { minHz: 3.95e6, maxHz: 26.1e6, label: 'Kurzwelle (Teilbänder)', status: 'primaer' },
      { minHz: 87.5e6, maxHz: 108e6, label: 'UKW/FM (Band II)', status: 'primaer' },
      { minHz: 174e6, maxHz: 230e6, label: 'DAB+ (Band III)', status: 'primaer' },
      { minHz: 470e6, maxHz: 694e6, label: 'DVB-T2 (UHF-Kanäle 21–48)', status: 'primaer' },
    ],
    examplesDE: ['UKW-Hörfunk', 'DAB+ Bundesmux', 'DVB-T2 HD', 'Kurzwellen-Auslandsdienste'],
    source: 'VO Funk Art. 5; Genfer Pläne GE75/GE84/GE06; BNetzA-Frequenzplan',
  },
  {
    id: 'rundfunkdienst-satellit',
    nameDE: 'Rundfunkdienst über Satelliten',
    nameEN: 'Broadcasting-satellite service (BSS)',
    group: 'satellit',
    descriptionDE:
      'Direktempfang von Rundfunk aus dem Weltraum. In Europa dominiert der Ku-Band-Downlink ' +
      'geostationärer Satelliten; die Empfangsanlage setzt das Signal per LNB auf die ' +
      'Satelliten-ZF um.',
    allocations: [
      { minHz: 10.7e9, maxHz: 12.75e9, label: 'Ku-Band Downlink', status: 'primaer' },
      { minHz: 13.75e9, maxHz: 14.5e9, label: 'Ku-Band Uplink', status: 'primaer' },
      { minHz: 21.4e9, maxHz: 22e9, label: 'Ka-Band BSS (Region 1)', status: 'primaer' },
    ],
    examplesDE: ['Astra 19,2° Ost', 'Eutelsat Hotbird 13° Ost'],
    source: 'VO Funk Art. 5 und Anhang 30/30A',
  },

  // --------------------------------------------------------------------------
  // Mobile Dienste
  // --------------------------------------------------------------------------
  {
    id: 'mobilfunkdienst-land',
    nameDE: 'Beweglicher Landfunkdienst',
    nameEN: 'Land mobile service',
    group: 'mobil',
    descriptionDE:
      'Funkverkehr zwischen ortsfesten Basisstationen und beweglichen Landfunkstellen. ' +
      'Umfasst den öffentlichen zellularen Mobilfunk ebenso wie Betriebsfunk und Bündelfunk.',
    allocations: [
      { minHz: 703e6, maxHz: 803e6, label: '700-MHz-Band (n28/B28)', status: 'primaer' },
      { minHz: 791e6, maxHz: 862e6, label: '800-MHz-Band (n20/B20)', status: 'primaer' },
      { minHz: 880e6, maxHz: 960e6, label: '900-MHz-Band (n8/B8)', status: 'primaer' },
      { minHz: 1710e6, maxHz: 1880e6, label: '1800-MHz-Band (n3/B3)', status: 'primaer' },
      { minHz: 1920e6, maxHz: 2170e6, label: '2100-MHz-Band (n1/B1)', status: 'primaer' },
      { minHz: 2500e6, maxHz: 2690e6, label: '2600-MHz-Band (n7/n38)', status: 'primaer' },
      { minHz: 3400e6, maxHz: 3800e6, label: '3,6-GHz-Band (n78)', status: 'primaer' },
    ],
    examplesDE: ['GSM', 'UMTS', 'LTE', '5G NR', 'Betriebsfunk', 'Bündelfunk'],
    source: 'BNetzA-Frequenzplan; 3GPP TS 36.101 / TS 38.101-1',
  },
  {
    id: 'seefunkdienst',
    nameDE: 'Seefunkdienst',
    nameEN: 'Maritime mobile service',
    group: 'mobil',
    descriptionDE:
      'Funkverkehr zwischen Küsten- und Schiffsfunkstellen sowie zwischen Schiffen. ' +
      'Trägt die Not- und Sicherheitskommunikation des GMDSS.',
    allocations: [
      { minHz: 415e3, maxHz: 526.5e3, label: 'MF-Seefunk / NAVTEX', status: 'primaer' },
      { minHz: 1605e3, maxHz: 4000e3, label: 'MF-Seefunk (u. a. 2182 kHz)', status: 'primaer' },
      { minHz: 4e6, maxHz: 27.5e6, label: 'HF-Seefunkbänder (4–25 MHz)', status: 'primaer' },
      { minHz: 156e6, maxHz: 162.05e6, label: 'UKW-Seefunk (Kanäle 1–88, AIS)', status: 'primaer' },
    ],
    examplesDE: ['UKW-Kanal 16', 'DSC-Kanal 70', 'NAVTEX 518 kHz', 'AIS 161,975/162,025 MHz'],
    source: 'VO Funk Art. 5, 31–34 und Anhang 18; IMO GMDSS',
  },
  {
    id: 'flugfunkdienst',
    nameDE: 'Flugfunkdienst',
    nameEN: 'Aeronautical mobile service',
    group: 'mobil',
    descriptionDE:
      'Sprech- und Datenfunk zwischen Luftfahrzeugen und Bodenfunkstellen. Der VHF-Bereich ' +
      'arbeitet bis heute amplitudenmoduliert, damit sich gleichzeitig sendende Stationen ' +
      'als hörbare Schwebung überlagern statt sich gegenseitig zu unterdrücken.',
    allocations: [
      { minHz: 2850e3, maxHz: 22e6, label: 'HF-Flugfunk (Ozeanstrecken)', status: 'primaer' },
      { minHz: 117.975e6, maxHz: 137e6, label: 'VHF-Flugfunk', status: 'primaer' },
      { minHz: 225e6, maxHz: 400e6, label: 'UHF-Militärflugfunk', status: 'primaer' },
    ],
    examplesDE: ['Towerfrequenzen', 'ATIS', 'ACARS', 'HF-Ozeanfunk (SELCAL)'],
    source: 'ICAO Annex 10; VO Funk Art. 5 und Anhang 27',
  },

  // --------------------------------------------------------------------------
  // Fester Funkdienst
  // --------------------------------------------------------------------------
  {
    id: 'fester-funkdienst',
    nameDE: 'Fester Funkdienst',
    nameEN: 'Fixed service',
    group: 'fest',
    descriptionDE:
      'Punkt-zu-Punkt-Verbindungen zwischen ortsfesten Stationen. Praktisch bedeutet das ' +
      'Richtfunk: gebündelte Strecken zur Anbindung von Mobilfunkstandorten und als ' +
      'Ersatz für Glasfaser dort, wo Tiefbau unwirtschaftlich ist.',
    allocations: [
      { minHz: 6e9, maxHz: 8.5e9, label: 'Richtfunk 6/7/8 GHz', status: 'primaer' },
      { minHz: 10.7e9, maxHz: 13.25e9, label: 'Richtfunk 11/13 GHz', status: 'primaer' },
      { minHz: 17.7e9, maxHz: 19.7e9, label: 'Richtfunk 18 GHz', status: 'primaer' },
      { minHz: 24.25e9, maxHz: 26.5e9, label: 'Richtfunk 26 GHz', status: 'primaer' },
      { minHz: 71e9, maxHz: 86e9, label: 'E-Band-Richtfunk (71–76/81–86 GHz)', status: 'primaer' },
    ],
    examplesDE: ['Mobilfunk-Backhaul', 'E-Band-Gigabit-Richtfunk', 'Behördenrichtfunknetze'],
    source: 'VO Funk Art. 5; ECC/REC über Richtfunkkanalraster',
  },

  // --------------------------------------------------------------------------
  // Navigation und Ortung
  // --------------------------------------------------------------------------
  {
    id: 'funknavigation-luft',
    nameDE: 'Flugnavigationsfunkdienst',
    nameEN: 'Aeronautical radionavigation service',
    group: 'navigation',
    descriptionDE:
      'Bodengebundene Navigationshilfen der Luftfahrt: Funkfeuer, Landekurs- und ' +
      'Gleitwegsender sowie Entfernungsmessung. Wird schrittweise durch satellitengestützte ' +
      'Verfahren ergänzt, bleibt aber als Rückfallebene erhalten.',
    allocations: [
      { minHz: 190e3, maxHz: 1750e3, label: 'NDB (ungerichtete Funkfeuer)', status: 'primaer' },
      { minHz: 74.8e6, maxHz: 75.2e6, label: 'ILS Marker Beacon (75 MHz)', status: 'primaer' },
      { minHz: 108e6, maxHz: 117.975e6, label: 'VOR / ILS-Landekurs', status: 'primaer' },
      { minHz: 328.6e6, maxHz: 335.4e6, label: 'ILS-Gleitweg', status: 'primaer' },
      { minHz: 960e6, maxHz: 1215e6, label: 'DME / TACAN', status: 'primaer' },
      { minHz: 4.2e9, maxHz: 4.4e9, label: 'Radarhöhenmesser', status: 'primaer' },
    ],
    examplesDE: ['VOR/DME', 'ILS CAT III', 'DME-Kanalpaare', 'Radioaltimeter'],
    source: 'ICAO Annex 10 Vol. I; VO Funk Art. 5',
  },
  {
    id: 'funknavigation-satellit',
    nameDE: 'Funknavigationsdienst über Satelliten',
    nameEN: 'Radionavigation-satellite service (RNSS)',
    group: 'satellit',
    descriptionDE:
      'Globale Satellitennavigation. Die Systeme teilen sich weitgehend dieselben Bänder und ' +
      'trennen sich durch Codemultiplex; GLONASS nutzt zusätzlich Frequenzmultiplex.',
    allocations: [
      { minHz: 1164e6, maxHz: 1215e6, label: 'L5/E5/B2', status: 'primaer' },
      { minHz: 1215e6, maxHz: 1300e6, label: 'L2/E6/B3', status: 'primaer' },
      { minHz: 1559e6, maxHz: 1610e6, label: 'L1/E1/B1', status: 'primaer' },
    ],
    examplesDE: ['GPS', 'Galileo', 'GLONASS', 'BeiDou', 'EGNOS (SBAS)'],
    source: 'VO Funk Art. 5; IS-GPS-200/705; Galileo OS SIS ICD',
  },
  {
    id: 'funkortung',
    nameDE: 'Funkortungsdienst (Radiolokalisierung)',
    nameEN: 'Radiolocation service',
    group: 'ortung',
    descriptionDE:
      'Ortsbestimmung durch Auswertung reflektierter Funkwellen, ohne dass das Ziel ' +
      'mitwirkt. Umfasst Flugsicherungs-, Wetter-, Schiffs-, Militär- und Kfz-Radar.',
    allocations: [
      { minHz: 1215e6, maxHz: 1400e6, label: 'Streckenradar (L-Band)', status: 'primaer' },
      { minHz: 2700e6, maxHz: 3100e6, label: 'Anflug-, Wetter- und Schiffsradar (S-Band)', status: 'primaer' },
      { minHz: 5250e6, maxHz: 5725e6, label: 'Wetterradar (C-Band)', status: 'primaer' },
      { minHz: 8.5e9, maxHz: 10.68e9, label: 'X-Band-Radar', status: 'primaer' },
      { minHz: 24.05e9, maxHz: 24.25e9, label: 'Bewegungsmelder, Verkehrsradar', status: 'primaer' },
      { minHz: 76e9, maxHz: 81e9, label: 'Kfz-Radar', status: 'primaer' },
    ],
    examplesDE: ['DWD-Wetterradarverbund (C-Band)', 'ASR/ARSR', 'Marineradar', 'ADAS-Radar'],
    source: 'VO Funk Art. 5; ETSI EN 301 091 (Kfz-Radar)',
  },

  // --------------------------------------------------------------------------
  // Amateurfunk
  // --------------------------------------------------------------------------
  {
    id: 'amateurfunkdienst',
    nameDE: 'Amateurfunkdienst',
    nameEN: 'Amateur service',
    group: 'amateur',
    descriptionDE:
      'Nichtkommerzieller Funkdienst zur eigenen technischen Weiterbildung und zum ' +
      'internationalen Verkehr zwischen Funkamateuren. Zulassung erfolgt über eine Prüfung; ' +
      'die Bandgrenzen sind in der Amateurfunkverordnung festgelegt.',
    allocations: [
      { minHz: 135.7e3, maxHz: 137.8e3, label: '2200 m', status: 'sekundaer' },
      { minHz: 472e3, maxHz: 479e3, label: '630 m', status: 'sekundaer' },
      { minHz: 1810e3, maxHz: 2000e3, label: '160 m', status: 'gemischt' },
      { minHz: 3500e3, maxHz: 3800e3, label: '80 m', status: 'gemischt' },
      { minHz: 7000e3, maxHz: 7200e3, label: '40 m', status: 'primaer' },
      { minHz: 14e6, maxHz: 14.35e6, label: '20 m', status: 'primaer' },
      { minHz: 28e6, maxHz: 29.7e6, label: '10 m', status: 'primaer' },
      { minHz: 144e6, maxHz: 146e6, label: '2 m', status: 'primaer' },
      { minHz: 430e6, maxHz: 440e6, label: '70 cm', status: 'gemischt' },
      { minHz: 10e9, maxHz: 10.5e9, label: '3 cm', status: 'gemischt' },
    ],
    examplesDE: ['CW/SSB-DX-Verkehr', 'FM-Relaisfunk', 'FT8', 'EME (Erde-Mond-Erde)', 'ATV'],
    source: 'AFuV Anlage 1; IARU-Region-1-Bandpläne — Details siehe amateurBands.ts',
  },
  {
    id: 'amateurfunk-satellit',
    nameDE: 'Amateurfunkdienst über Satelliten',
    nameEN: 'Amateur-satellite service',
    group: 'satellit',
    descriptionDE:
      'Amateurfunkbetrieb über eigens gebaute Kleinsatelliten. Die Zuweisungen sind ' +
      'Teilmengen der terrestrischen Amateurbänder.',
    allocations: [
      { minHz: 145.8e6, maxHz: 146e6, label: '2-m-Satellitensegment', status: 'primaer' },
      { minHz: 435e6, maxHz: 438e6, label: '70-cm-Satellitensegment', status: 'sekundaer' },
      { minHz: 1260e6, maxHz: 1270e6, label: '23-cm-Uplink', status: 'sekundaer' },
    ],
    examplesDE: ['AMSAT-Transponder', 'ISS-Packet-Digipeater', 'QO-100 (geostationär)'],
    source: 'AFuV Anlage 1; VO Funk Art. 5',
  },

  // --------------------------------------------------------------------------
  // Behördenfunk und Kurzstreckenfunk
  // --------------------------------------------------------------------------
  {
    id: 'bos-funk',
    nameDE: 'Funk der Behörden und Organisationen mit Sicherheitsaufgaben (BOS)',
    nameEN: 'Public protection and disaster relief (PPDR)',
    group: 'sicherheit',
    descriptionDE:
      'Bundesweit einheitliches Sprech- und Datenfunknetz für Polizei, Feuerwehr, ' +
      'Rettungsdienste, THW und Zoll. Seit 2007 wird der analoge 2-m-/4-m-Betrieb durch ' +
      'ein TETRA-Bündelfunknetz abgelöst.',
    allocations: [
      { minHz: 74.215e6, maxHz: 87.255e6, label: 'Analoges 4-m-Band (Auslauf)', status: 'primaer' },
      { minHz: 165.21e6, maxHz: 169.38e6, label: 'Analoges 2-m-Band (Auslauf)', status: 'primaer' },
      { minHz: 380e6, maxHz: 385e6, label: 'TETRA Uplink (Endgerät → Basis)', status: 'primaer' },
      { minHz: 390e6, maxHz: 395e6, label: 'TETRA Downlink (Basis → Endgerät)', status: 'primaer' },
      { minHz: 406.1e6, maxHz: 410e6, label: 'TETRA Direktbetrieb (DMO)', status: 'primaer' },
    ],
    examplesDE: ['BOS-Digitalfunk (BDBOS)', 'Alarmierung über POCSAG/TETRA'],
    source: 'BDBOS; BNetzA-Frequenzplan; ETSI EN 300 392 (TETRA)',
  },
  {
    id: 'pmr-jedermannfunk',
    nameDE: 'Betriebsfunk und Jedermannfunk (PMR/SRD)',
    nameEN: 'Private mobile radio / short range devices',
    group: 'mobil',
    descriptionDE:
      'Anmeldefreie oder allgemeinzugeteilte Kurzstreckenfunkanwendungen. Betrieb ist ohne ' +
      'individuelle Frequenzzuteilung möglich, dafür gelten enge Leistungs- und ' +
      'Antennenauflagen.',
    allocations: [
      { minHz: 26.565e6, maxHz: 27.405e6, label: 'CB-Funk (80 Kanäle, DE)', status: 'primaer' },
      { minHz: 149.025e6, maxHz: 149.1125e6, label: 'Freenet (nur DE)', status: 'primaer' },
      { minHz: 433.05e6, maxHz: 434.79e6, label: 'SRD 433 MHz (ISM)', status: 'sekundaer' },
      { minHz: 446e6, maxHz: 446.2e6, label: 'PMR446 (analog und digital)', status: 'primaer' },
      { minHz: 863e6, maxHz: 870e6, label: 'SRD 868 MHz (LoRa, Wireless M-Bus)', status: 'sekundaer' },
    ],
    examplesDE: ['PMR446-Handfunkgeräte', 'CB-Funk Kanal 9/19', 'LoRaWAN', 'Funkfernsteuerungen'],
    source: 'BNetzA Vfg. 21/2021 (CB); ETSI EN 300 220, EN 303 406; ECC/DEC/(15)05',
  },

  // --------------------------------------------------------------------------
  // Wissenschaft
  // --------------------------------------------------------------------------
  {
    id: 'radioastronomie',
    nameDE: 'Radioastronomiedienst',
    nameEN: 'Radio astronomy service',
    group: 'wissenschaft',
    descriptionDE:
      'Rein passiver Empfangsdienst. Die Schutzbedürftigkeit ist extrem hoch, weil ' +
      'astronomische Signale um viele Größenordnungen schwächer sind als terrestrische ' +
      'Aussendungen; einzelne Bänder sind daher vollständig sendefrei gehalten.',
    allocations: [
      { minHz: 1400e6, maxHz: 1427e6, label: 'HI-Linie (21 cm, 1420,406 MHz)', status: 'primaer' },
      { minHz: 1610.6e6, maxHz: 1613.8e6, label: 'OH-Linie', status: 'primaer' },
      { minHz: 4990e6, maxHz: 5000e6, label: 'Kontinuum C-Band', status: 'primaer' },
      { minHz: 22.21e9, maxHz: 22.5e9, label: 'H2O-Maser', status: 'primaer' },
      { minHz: 42.5e9, maxHz: 43.5e9, label: 'SiO-Maser', status: 'primaer' },
    ],
    examplesDE: ['Radioteleskop Effelsberg (100 m)', 'LOFAR-Stationen', 'ALMA'],
    source: 'VO Funk Art. 5 und Res. 739; ITU-R RA.769',
  },
  {
    id: 'weltraumforschung',
    nameDE: 'Weltraumforschungsfunkdienst',
    nameEN: 'Space research service (SRS)',
    group: 'wissenschaft',
    descriptionDE:
      'Kommunikation mit wissenschaftlichen Raumfahrzeugen einschließlich der ' +
      'Tiefraumkommunikation. Für den Deep-Space-Betrieb sind eigene, besonders ' +
      'geschützte Teilbänder reserviert.',
    allocations: [
      { minHz: 2110e6, maxHz: 2120e6, label: 'Deep Space Uplink (S-Band)', status: 'primaer' },
      { minHz: 2290e6, maxHz: 2300e6, label: 'Deep Space Downlink (S-Band)', status: 'primaer' },
      { minHz: 7145e6, maxHz: 7235e6, label: 'Deep Space Uplink (X-Band)', status: 'primaer' },
      { minHz: 8400e6, maxHz: 8450e6, label: 'Deep Space Downlink (X-Band)', status: 'primaer' },
      { minHz: 31.8e9, maxHz: 32.3e9, label: 'Deep Space Downlink (Ka-Band)', status: 'primaer' },
      { minHz: 34.2e9, maxHz: 34.7e9, label: 'Deep Space Uplink (Ka-Band)', status: 'primaer' },
    ],
    examplesDE: ['NASA Deep Space Network', 'ESA Estrack (Cebreros, New Norcia, Malargüe)'],
    source: 'VO Funk Art. 5; CCSDS/SFCG-Empfehlungen',
  },
  {
    id: 'erderkundung-satellit',
    nameDE: 'Erderkundungsfunkdienst über Satelliten',
    nameEN: 'Earth exploration-satellite service (EESS)',
    group: 'wissenschaft',
    descriptionDE:
      'Aktive und passive Fernerkundung der Erde aus dem Orbit: Radarsatelliten, ' +
      'Radiometer und die Rückführung der Messdaten zur Bodenstation.',
    allocations: [
      { minHz: 1215e6, maxHz: 1300e6, label: 'SAR L-Band (aktiv)', status: 'primaer' },
      { minHz: 5250e6, maxHz: 5570e6, label: 'SAR C-Band (aktiv)', status: 'primaer' },
      { minHz: 9.3e9, maxHz: 9.9e9, label: 'SAR X-Band (aktiv)', status: 'primaer' },
      { minHz: 23.6e9, maxHz: 24e9, label: 'Wasserdampfradiometrie (passiv)', status: 'primaer' },
      { minHz: 50.2e9, maxHz: 50.4e9, label: 'Temperatursondierung (passiv)', status: 'primaer' },
    ],
    examplesDE: ['Sentinel-1 (C-Band-SAR)', 'TerraSAR-X', 'MetOp-Radiometer'],
    source: 'VO Funk Art. 5; EUMETSAT/ESA-Missionsdaten',
  },
  {
    id: 'normalfrequenz-zeitzeichen',
    nameDE: 'Normalfrequenz- und Zeitzeichenfunkdienst',
    nameEN: 'Standard frequency and time signal service',
    group: 'wissenschaft',
    descriptionDE:
      'Aussendung hochgenauer Referenzfrequenzen und codierter Zeitinformation. Die ' +
      'Langwellensender nutzen die sehr stabile Bodenwellenausbreitung, die HF-Sender ' +
      'erreichen über die Ionosphäre größere Entfernungen bei geringerer Genauigkeit.',
    // Die Zuweisungen sind schmale Bänder um die Normalfrequenzen, keine Einzelwerte:
    // ±5 kHz bei 2,5/5/10 MHz, ±10 kHz bei 15/20/25 MHz (VO Funk Art. 5).
    allocations: [
      { minHz: 19.95e3, maxHz: 20.05e3, label: 'Normalfrequenz 20 kHz', status: 'primaer' },
      { minHz: 2.495e6, maxHz: 2.505e6, label: 'Normalfrequenz 2,5 MHz', status: 'primaer' },
      { minHz: 4.995e6, maxHz: 5.005e6, label: 'Normalfrequenz 5 MHz', status: 'primaer' },
      { minHz: 9.995e6, maxHz: 10.005e6, label: 'Normalfrequenz 10 MHz', status: 'primaer' },
      { minHz: 14.99e6, maxHz: 15.01e6, label: 'Normalfrequenz 15 MHz', status: 'primaer' },
      { minHz: 19.99e6, maxHz: 20.01e6, label: 'Normalfrequenz 20 MHz', status: 'primaer' },
      { minHz: 24.99e6, maxHz: 25.01e6, label: 'Normalfrequenz 25 MHz', status: 'primaer' },
    ],
    examplesDE: ['DCF77 (77,5 kHz, LF-Zuweisung)', 'WWV/WWVH', 'RWM', 'CHU'],
    source: 'VO Funk Art. 5 (Bänder um 2,5/5/10/15/20/25 MHz)',
  },
  {
    id: 'meteorologie',
    nameDE: 'Meteorologische Hilfsmittel und Wettersatellitenfunk',
    nameEN: 'Meteorological aids / meteorological-satellite service',
    group: 'wissenschaft',
    descriptionDE:
      'Übertragung von Messwerten aufsteigender Radiosonden sowie Bild- und Datenempfang ' +
      'von Wettersatelliten.',
    allocations: [
      { minHz: 137e6, maxHz: 138e6, label: 'Polarumlaufende Wettersatelliten (APT/LRPT)', status: 'primaer' },
      { minHz: 400.15e6, maxHz: 406e6, label: 'Radiosonden (403-MHz-Band)', status: 'primaer' },
      { minHz: 1668.4e6, maxHz: 1700e6, label: 'Radiosonden 1680 MHz / Satellitendaten', status: 'primaer' },
      { minHz: 1690e6, maxHz: 1710e6, label: 'Wettersatelliten-Downlink', status: 'primaer' },
    ],
    examplesDE: ['Radiosondenaufstiege des DWD', 'Meteosat', 'NOAA-APT'],
    source: 'VO Funk Art. 5; WMO/EUMETSAT',
  },
];

/** Gruppenbezeichnungen für UI-Filter. */
export const RADIO_SERVICE_GROUP_LABELS: Record<RadioServiceGroup, string> = {
  rundfunk: 'Rundfunk',
  mobil: 'Beweglicher Funkdienst',
  fest: 'Fester Funkdienst',
  navigation: 'Funknavigation',
  ortung: 'Funkortung',
  satellit: 'Satellitenfunk',
  wissenschaft: 'Wissenschaft und Zeitzeichen',
  sicherheit: 'Sicherheitsbehörden',
  amateur: 'Amateurfunk',
} as const;

/**
 * Liefert alle Funkdienste, die der angegebenen Frequenz einen Bereich zuweisen.
 * @param frequencyHz Frequenz in Hertz
 */
export function getServicesForFrequency(frequencyHz: number): RadioService[] {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return [];
  return RADIO_SERVICES.filter((service) =>
    service.allocations.some((a) => frequencyHz >= a.minHz && frequencyHz <= a.maxHz)
  );
}
