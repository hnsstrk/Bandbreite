/**
 * Not-, Anruf- und Sicherheitsfrequenzen sowie die zugehörigen Kanalraster.
 *
 * Quellen:
 * - ITU Radio Regulations, Artikel 30 bis 34 und Anhang 13/18 (Seefunk)
 * - IMO GMDSS-Regelwerk (SOLAS Kapitel IV)
 * - ICAO Annex 10 (Flugfunk, Notfrequenzen)
 * - COSPAS-SARSAT C/S T.001 (406-MHz-Notfunkbaken)
 * - Bundesnetzagentur, Allgemeinzuteilungen (PMR446, Freenet, CB-Funk)
 * - BDBOS (TETRA-Digitalfunk der Behörden und Organisationen mit
 *   Sicherheitsaufgaben)
 * - IARU Region 1, Emergency Centre of Activity Frequencies
 *
 * WARNUNG FÜR DIE ANWENDUNG: Diese Daten dienen der Information und Lehre.
 * Für den realen Not- und Sicherheitsfunk gelten ausschließlich die amtlichen
 * Veröffentlichungen (NfS, AIP, ITU List IV/V).
 */

/** Einsatzzweck einer Frequenz. */
export type EmergencyPurpose =
  | 'notruf' // Absetzen eines Notrufs
  | 'anruf' // Anruf- und Verkehrsaufnahme
  | 'sicherheit' // Sicherheits- und Warnmeldungen
  | 'ortung' // Ortung, Peilung, Homing
  | 'ueberwachung' // Verkehrsüberwachung, Lagebild
  | 'historisch'; // nicht mehr in Betrieb

/** Fachbereich. */
export type EmergencyDomain = 'see' | 'luft' | 'land' | 'satellit' | 'amateur' | 'jedermann';

/** Eine Not-, Anruf- oder Sicherheitsfrequenz. */
export interface EmergencyFrequency {
  id: string;
  nameDE: string;
  /** Trägerfrequenz in Hz; bei Bereichen der untere Wert */
  frequencyHz: number;
  /** Obergrenze in Hz, falls es sich um einen Bereich handelt */
  frequencyMaxHz?: number;
  /**
   * Diskrete Einzelfrequenzen in Hz, falls der Eintrag mehrere getrennte Kanäle
   * zusammenfasst. frequencyHz/frequencyMaxHz spannen dann nur die Hüllkurve auf;
   * maßgeblich für Treffer sind die hier gelisteten Kanäle.
   */
  channelsHz?: number[];
  domain: EmergencyDomain;
  purpose: EmergencyPurpose;
  /** Betriebsart bzw. Modulation */
  modulationDE: string;
  descriptionDE: string;
  source: string;
}

export const EMERGENCY_FREQUENCIES: EmergencyFrequency[] = [
  // --------------------------------------------------------------------------
  // Seefunk
  // --------------------------------------------------------------------------
  {
    id: 'mf-500khz',
    nameDE: '500 kHz — historische Seenot-Telegrafiefrequenz',
    frequencyHz: 500e3,
    domain: 'see',
    purpose: 'historisch',
    modulationDE: 'Tastung eines gedämpften bzw. später ungedämpften Trägers (A1A/A2A)',
    descriptionDE:
      'Über Jahrzehnte die weltweite Not- und Anruffrequenz der Seefunktelegrafie; ' +
      'hier wurde das Notzeichen SOS gesendet. Zweimal stündlich galten dreiminütige ' +
      'Funkstillezeiten, in denen alle Stationen nur zuhörten. Mit der vollständigen ' +
      'Einführung des GMDSS zum 1. Februar 1999 endete die Wachpflicht.',
    source: 'ITU RR (historisch); SOLAS Kapitel IV'
  },
  {
    id: 'mf-2182khz',
    nameDE: '2182 kHz — MF-Not- und Anruffrequenz (Sprechfunk)',
    frequencyHz: 2182e3,
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Einseitenband, oberes Seitenband (J3E)',
    descriptionDE:
      'Sprechfunk-Notfrequenz für die Küstenschifffahrt mit Reichweiten von etwa ' +
      '150 Seemeilen über die Bodenwelle. Auch nach Einführung der digitalen ' +
      'Notalarmierung weiterhin für den anschließenden Sprechverkehr vorgesehen.',
    source: 'ITU RR Art. 31; IMO GMDSS'
  },
  {
    id: 'mf-2187_5khz',
    nameDE: '2187,5 kHz — DSC-Notalarmierung MF',
    frequencyHz: 2187.5e3,
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Digitaler Selektivruf (F1B), Frequenzumtastung',
    descriptionDE:
      'Digitaler Notruf im Mittelwellenbereich. Die Aussendung enthält die Kennung ' +
      'des Schiffes, die Notfallart und, sofern angeschlossen, die aus dem ' +
      'Navigationsempfänger übernommene Position.',
    source: 'ITU RR Art. 31 und Anhang 15; ITU-R M.493'
  },
  {
    id: 'hf-dsc-set',
    nameDE: 'HF-DSC-Notfrequenzen 4207,5 / 6312 / 8414,5 / 12577 / 16804,5 kHz',
    frequencyHz: 4207.5e3,
    frequencyMaxHz: 16804.5e3,
    channelsHz: [4207.5e3, 6312e3, 8414.5e3, 12577e3, 16804.5e3],
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Digitaler Selektivruf (F1B)',
    descriptionDE:
      'Fünf über die Kurzwellenbänder verteilte Kanäle für die digitale ' +
      'Notalarmierung auf großer Fahrt. Da die nutzbare Frequenz von Tageszeit und ' +
      'Ionosphäre abhängt, wird ein Notruf üblicherweise auf mehreren dieser Kanäle ' +
      'nacheinander abgesetzt.',
    source: 'ITU RR Anhang 15; IMO GMDSS'
  },
  {
    id: 'hf-voice-set',
    nameDE: 'HF-Sprechfunk-Notfrequenzen 4125 / 6215 / 8291 / 12290 / 16420 kHz',
    frequencyHz: 4125e3,
    frequencyMaxHz: 16420e3,
    channelsHz: [4125e3, 6215e3, 8291e3, 12290e3, 16420e3],
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Einseitenband, oberes Seitenband (J3E)',
    descriptionDE:
      'Sprechfunkkanäle für den Not- und Sicherheitsverkehr nach erfolgter ' +
      'Alarmierung. 4125 kHz wird zusätzlich als Ergänzung zu 2182 kHz genutzt und ' +
      'auch von Luftfahrzeugen in Seenotfällen mitgehört.',
    source: 'ITU RR Art. 31 und Anhang 15'
  },
  {
    id: 'vhf-ch16',
    nameDE: 'UKW-Kanal 16 (156,800 MHz) — Not-, Dringlichkeits- und Anrufkanal',
    frequencyHz: 156.8e6,
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Schmalband-Frequenzmodulation (G3E)',
    descriptionDE:
      'Der wichtigste Sprechfunkkanal der Seeschifffahrt: hier werden Notrufe ' +
      'abgesetzt und Verbindungen aufgebaut, die anschließend auf einen Arbeitskanal ' +
      'wechseln. Küstenfunkstellen und viele Schiffe halten dauerhaft Hörbereitschaft.',
    source: 'ITU RR Anhang 18; IMO GMDSS'
  },
  {
    id: 'vhf-ch70',
    nameDE: 'UKW-Kanal 70 (156,525 MHz) — DSC-Notalarmierung',
    frequencyHz: 156.525e6,
    domain: 'see',
    purpose: 'notruf',
    modulationDE: 'Digitaler Selektivruf (G2B)',
    descriptionDE:
      'Ausschließlich für den digitalen Selektivruf reserviert; Sprechfunk ist hier ' +
      'nicht zulässig. Ein Tastendruck löst einen codierten Notruf an alle Stationen ' +
      'in Reichweite aus.',
    source: 'ITU RR Anhang 18; ITU-R M.493'
  },
  {
    id: 'vhf-ch06',
    nameDE: 'UKW-Kanal 6 (156,300 MHz) — Verkehr mit Rettungsmitteln',
    frequencyHz: 156.3e6,
    domain: 'see',
    purpose: 'sicherheit',
    modulationDE: 'Schmalband-Frequenzmodulation (G3E)',
    descriptionDE:
      'Vorrangig für die Verständigung zwischen Schiffen, Seenotrettungseinheiten ' +
      'und Luftfahrzeugen bei Suchaktionen.',
    source: 'ITU RR Anhang 18'
  },
  {
    id: 'vhf-ch13',
    nameDE: 'UKW-Kanal 13 (156,650 MHz) — Schiffssicherheitsverkehr',
    frequencyHz: 156.65e6,
    domain: 'see',
    purpose: 'sicherheit',
    modulationDE: 'Schmalband-Frequenzmodulation (G3E)',
    descriptionDE:
      'Direkte Absprachen zwischen Schiffsführungen zur Vermeidung von ' +
      'Nahbereichskollisionen, insbesondere in engen Fahrwassern.',
    source: 'ITU RR Anhang 18'
  },
  {
    id: 'ais-1',
    nameDE: 'AIS 1 (161,975 MHz)',
    frequencyHz: 161.975e6,
    domain: 'see',
    purpose: 'ueberwachung',
    modulationDE: 'GMSK, Zeitschlitzverfahren (SOTDMA), 9600 Bit/s',
    descriptionDE:
      'Erster Kanal des automatischen Schiffsidentifizierungssystems. Schiffe senden ' +
      'zyklisch Kennung, Position, Kurs und Geschwindigkeit; die Sendezeitpunkte ' +
      'werden über eine gemeinsame Zeitbasis koordiniert, sodass sich die Stationen ' +
      'nicht gegenseitig überschreiben.',
    source: 'ITU-R M.1371; ITU RR Anhang 18'
  },
  {
    id: 'ais-2',
    nameDE: 'AIS 2 (162,025 MHz)',
    frequencyHz: 162.025e6,
    domain: 'see',
    purpose: 'ueberwachung',
    modulationDE: 'GMSK, Zeitschlitzverfahren (SOTDMA), 9600 Bit/s',
    descriptionDE:
      'Zweiter AIS-Kanal. Die Nutzung zweier Kanäle erhöht die Kapazität und ' +
      'erlaubt regional unterschiedliche Zuweisungen.',
    source: 'ITU-R M.1371'
  },
  {
    id: 'navtex-518',
    nameDE: 'NAVTEX 518 kHz — internationale Sicherheitsmeldungen',
    frequencyHz: 518e3,
    domain: 'see',
    purpose: 'sicherheit',
    modulationDE: 'Schmalband-Direktdruckverfahren (F1B), 100 Baud',
    descriptionDE:
      'Automatischer Empfang von Navigations- und Wetterwarnungen in englischer ' +
      'Sprache. Ergänzend dienen 490 kHz für landessprachliche und 4209,5 kHz für ' +
      'zusätzliche Aussendungen.',
    source: 'IMO NAVTEX-Handbuch; ITU-R M.540'
  },

  // --------------------------------------------------------------------------
  // Luftfahrt
  // --------------------------------------------------------------------------
  {
    id: 'air-121_5',
    nameDE: '121,500 MHz — internationale Luftfahrt-Notfrequenz',
    frequencyHz: 121.5e6,
    domain: 'luft',
    purpose: 'notruf',
    modulationDE: 'Amplitudenmodulation (A3E)',
    descriptionDE:
      'Weltweite Not- und Anruffrequenz des zivilen Flugfunks, oft als ' +
      'Wachfrequenz mitgehört. Ältere Notsender strahlten hier einen auf- und ' +
      'abschwellenden Ton ab; seit Februar 2009 wertet das Satellitensystem diese ' +
      'analogen Signale nicht mehr aus, für die Nahbereichspeilung bleibt die ' +
      'Frequenz aber in Gebrauch.',
    source: 'ICAO Annex 10; COSPAS-SARSAT'
  },
  {
    id: 'air-243',
    nameDE: '243,000 MHz — militärische Notfrequenz',
    frequencyHz: 243e6,
    domain: 'luft',
    purpose: 'notruf',
    modulationDE: 'Amplitudenmodulation (A3E)',
    descriptionDE:
      'Genau die doppelte Frequenz von 121,5 MHz, wodurch sich ältere Sender mit ' +
      'geringem Aufwand für beide Bereiche auslegen ließen. Wachfrequenz des ' +
      'militärischen UHF-Flugfunks.',
    source: 'ICAO Annex 10; NATO-Verfahren'
  },
  {
    id: 'sarsat-406',
    nameDE: '406,0 bis 406,1 MHz — COSPAS-SARSAT-Notfunkbaken',
    frequencyHz: 406e6,
    frequencyMaxHz: 406.1e6,
    domain: 'satellit',
    purpose: 'notruf',
    modulationDE: 'Phasenmodulierte Datenaussendung, Burst alle 50 Sekunden',
    descriptionDE:
      'Digitale Notfunkbaken für Luftfahrt, Seefahrt und Personen senden hier eine ' +
      'eindeutige Kennung, die über eine Datenbank dem Fahrzeug oder der Person ' +
      'zugeordnet ist. Satelliten im niedrigen und geostationären Orbit sowie ' +
      'Nutzlasten auf Navigationssatelliten empfangen die Bursts und leiten sie an ' +
      'die Rettungsleitstellen weiter.',
    source: 'COSPAS-SARSAT C/S T.001; ITU RR Art. 5'
  },
  {
    id: 'air-vhf-band',
    nameDE: 'VHF-Flugfunkband 117,975 bis 137,000 MHz',
    frequencyHz: 117.975e6,
    frequencyMaxHz: 137e6,
    domain: 'luft',
    purpose: 'anruf',
    modulationDE: 'Amplitudenmodulation (A3E)',
    descriptionDE:
      'Sprechfunkband der zivilen Luftfahrt. Das ursprüngliche Raster von 25 kHz ' +
      'wurde in Europa wegen Kanalknappheit auf 8,33 kHz verdichtet; die ' +
      'Amplitudenmodulation bleibt erhalten, weil sich gleichzeitig sendende ' +
      'Stationen dabei als hörbare Störung bemerkbar machen statt sich zu verdecken.',
    source: 'ICAO Annex 10; EU-Verordnung 1079/2012 (8,33-kHz-Raster)'
  },
  {
    id: 'ssr-1030',
    nameDE: '1030 MHz — Abfrage von Transpondern (Mode A/C/S)',
    frequencyHz: 1030e6,
    domain: 'luft',
    purpose: 'ueberwachung',
    modulationDE: 'Pulsmodulation, Pulspaare bzw. Mode-S-Abfragen',
    descriptionDE:
      'Auf dieser Frequenz senden Sekundärradaranlagen und Kollisionswarnsysteme ' +
      'ihre Abfragen. Der Bordtransponder antwortet auf einer anderen Frequenz, ' +
      'wodurch die Antwort deutlich stärker ist als ein passives Radarecho.',
    source: 'ICAO Annex 10 Vol. IV'
  },
  {
    id: 'ssr-1090',
    nameDE: '1090 MHz — Transponderantwort und ADS-B',
    frequencyHz: 1090e6,
    domain: 'luft',
    purpose: 'ueberwachung',
    modulationDE: 'Pulspositionsmodulation, 1 Mbit/s (Extended Squitter)',
    descriptionDE:
      'Antwortfrequenz der Bordtransponder. Beim automatischen Positionsbericht ' +
      'sendet das Luftfahrzeug seine aus der Satellitennavigation gewonnene Position ' +
      'auch unaufgefordert aus, sodass sie von Bodenstationen und anderen Flugzeugen ' +
      'empfangen werden kann.',
    source: 'ICAO Annex 10 Vol. IV; RTCA DO-260B'
  },

  // --------------------------------------------------------------------------
  // Landfunk: Behörden und Jedermannfunk
  // --------------------------------------------------------------------------
  {
    id: 'bos-tetra-ul',
    nameDE: 'BOS-Digitalfunk TETRA, Uplink 380 bis 385 MHz',
    frequencyHz: 380e6,
    frequencyMaxHz: 385e6,
    domain: 'land',
    purpose: 'sicherheit',
    modulationDE: 'π/4-DQPSK, vier Zeitschlitze je 25-kHz-Träger',
    descriptionDE:
      'Senderichtung der Handsprech- und Fahrzeugfunkgeräte im bundesweiten ' +
      'Digitalfunknetz der Sicherheitsbehörden.',
    source: 'BDBOS; ETSI EN 300 392'
  },
  {
    id: 'bos-tetra-dl',
    nameDE: 'BOS-Digitalfunk TETRA, Downlink 390 bis 395 MHz',
    frequencyHz: 390e6,
    frequencyMaxHz: 395e6,
    domain: 'land',
    purpose: 'sicherheit',
    modulationDE: 'π/4-DQPSK',
    descriptionDE:
      'Senderichtung der Basisstationen. Der Duplexabstand von 10 MHz erlaubt ' +
      'gleichzeitiges Senden und Empfangen im Endgerät.',
    source: 'BDBOS; ETSI EN 300 392'
  },
  {
    id: 'bos-tetra-dmo',
    nameDE: 'BOS-Digitalfunk, Direktbetrieb 406,1 bis 410 MHz',
    frequencyHz: 406.1e6,
    frequencyMaxHz: 410e6,
    domain: 'land',
    purpose: 'sicherheit',
    modulationDE: 'π/4-DQPSK',
    descriptionDE:
      'Betrieb ohne Netzinfrastruktur, direkt von Gerät zu Gerät. Dient als ' +
      'Rückfallebene bei Netzausfall sowie für den Nahbereich an der Einsatzstelle.',
    source: 'BDBOS; ETSI EN 300 396'
  },
  {
    id: 'bos-4m',
    nameDE: 'Analoges BOS-4-m-Band 74,215 bis 87,255 MHz',
    frequencyHz: 74.215e6,
    frequencyMaxHz: 87.255e6,
    domain: 'land',
    purpose: 'historisch',
    modulationDE: 'Schmalband-Frequenzmodulation',
    descriptionDE:
      'Historischer Fahrzeugfunkbereich der Behörden und Organisationen mit ' +
      'Sicherheitsaufgaben. Wird durch den Digitalfunk abgelöst, war aber in ' +
      'einzelnen Ländern und für Sonderanwendungen lange parallel in Betrieb.',
    source: 'BNetzA-Frequenzplan'
  },
  {
    id: 'pmr446',
    nameDE: 'PMR446: 446,00625 bis 446,19375 MHz',
    frequencyHz: 446.00625e6,
    frequencyMaxHz: 446.19375e6,
    domain: 'jedermann',
    purpose: 'anruf',
    modulationDE: 'Schmalband-FM (analog) bzw. 4-FSK (digital), 12,5 kHz Raster',
    descriptionDE:
      'Anmeldefreier Jedermannfunk mit 16 Kanälen und höchstens 500 mW ' +
      'Strahlungsleistung; feste Antennen sind nicht zulässig. Praktische ' +
      'Reichweiten liegen im offenen Gelände bei wenigen Kilometern.',
    source: 'ETSI EN 300 296 / EN 303 406; ECC/DEC/(15)05; BNetzA-Allgemeinzuteilung'
  },
  {
    id: 'freenet',
    nameDE: 'Freenet (nur Deutschland): 6 Kanäle zwischen 149,025 und 149,1125 MHz',
    frequencyHz: 149.025e6,
    frequencyMaxHz: 149.1125e6,
    // Sechs nicht zusammenhängende Kanäle im 12,5-kHz-Raster; zwischen 149,0500
    // und 149,0875 MHz liegt eine Lücke.
    channelsHz: [149.025e6, 149.0375e6, 149.05e6, 149.0875e6, 149.1e6, 149.1125e6],
    domain: 'jedermann',
    purpose: 'anruf',
    modulationDE: 'Schmalband-Frequenzmodulation, 12,5 kHz Raster',
    descriptionDE:
      'Nationale Besonderheit im VHF-Bereich mit sechs nicht zusammenhängenden ' +
      'Kanälen: 149,0250 / 149,0375 / 149,0500 / 149,0875 / 149,1000 / 149,1125 MHz. ' +
      'Höchstens 500 mW Strahlungsleistung, keine Nutzung außerhalb Deutschlands.',
    source: 'BNetzA-Allgemeinzuteilung Freenet'
  },
  {
    id: 'cb-funk',
    nameDE: 'CB-Funk Deutschland: 26,565 bis 27,405 MHz (80 Kanäle)',
    frequencyHz: 26.565e6,
    frequencyMaxHz: 27.405e6,
    domain: 'jedermann',
    purpose: 'anruf',
    modulationDE: 'FM, AM und SSB je nach Kanal, 10 kHz Raster',
    descriptionDE:
      'Die Kanäle 1 bis 40 zwischen 26,965 und 27,405 MHz sind europaweit ' +
      'harmonisiert; Deutschland stellt darunter zusätzlich die Kanäle 41 bis 80 ' +
      'zwischen 26,565 und 26,955 MHz bereit, dort ist nur FM erlaubt. Kanal 9 gilt ' +
      'als Notrufkanal, Kanal 19 als Fernfahrerkanal.',
    source: 'BNetzA Vfg. 21/2021; ECC/DEC/(11)03'
  },

  // --------------------------------------------------------------------------
  // Amateurfunk
  // --------------------------------------------------------------------------
  {
    id: 'ham-coa',
    nameDE: 'Notfunk-Anruffrequenzen im Amateurfunk (Region 1)',
    frequencyHz: 3760e3,
    frequencyMaxHz: 21360e3,
    channelsHz: [3760e3, 7110e3, 14300e3, 18160e3, 21360e3],
    domain: 'amateur',
    purpose: 'anruf',
    modulationDE: 'Einseitenband (J3E)',
    descriptionDE:
      'Die IARU hat je Band eine Frequenz als Schwerpunkt für Not- und ' +
      'Katastrophenfunk benannt: 3760, 7110, 14300, 18160 und 21360 kHz. Sie sind ' +
      'nicht gesperrt, sollen im Ereignisfall aber freigehalten werden.',
    source: 'IARU Region 1, Emergency Centre of Activity Frequencies'
  },
  {
    id: 'ham-sstv-aprs',
    nameDE: 'APRS-Baken 144,800 MHz (Region 1)',
    frequencyHz: 144.8e6,
    domain: 'amateur',
    purpose: 'ueberwachung',
    modulationDE: 'AFSK 1200 Bit/s auf FM (AX.25)',
    descriptionDE:
      'Gemeinsame Frequenz für Positions-, Wetter- und Kurznachrichtenbaken. In ' +
      'Übungslagen und bei Katastrophenfunk dient sie der Lagedarstellung.',
    source: 'IARU R1 VHF-Bandplan'
  }
];

/**
 * Kanalraster des VHF-Flugfunks in Hz.
 * Historisch 25 kHz, in Europa seit 2018 überwiegend 8,33 kHz.
 */
export const AIRBAND_CHANNEL_SPACING_HZ = {
  klassisch: 25e3,
  verdichtet: 8.333333e3
} as const;

/** Erster Kanal des harmonisierten CB-Funks in Hz. */
export const CB_CHANNEL_1_HZ = 26.965e6;

/** Letzter Kanal des harmonisierten CB-Funks in Hz. */
export const CB_CHANNEL_40_HZ = 27.405e6;

/** Kanalraster im UKW-Seefunk in Hz. */
export const MARINE_VHF_CHANNEL_SPACING_HZ = 25e3;

/**
 * Liefert alle Not- und Sicherheitsfrequenzen eines Fachbereichs.
 * @param domain Fachbereich
 */
export function getEmergencyFrequenciesByDomain(domain: EmergencyDomain): EmergencyFrequency[] {
  return EMERGENCY_FREQUENCIES.filter((f) => f.domain === domain);
}

/**
 * Findet Not- und Sicherheitsfrequenzen in der Nähe einer Frequenz.
 * @param frequencyHz Frequenz in Hertz
 * @param toleranceHz Zulässige Abweichung in Hertz
 */
export function findEmergencyFrequenciesNear(
  frequencyHz: number,
  toleranceHz: number
): EmergencyFrequency[] {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return [];
  return EMERGENCY_FREQUENCIES.filter((f) => {
    // Einträge mit Kanalliste treffen nur nahe eines ihrer Kanäle, nicht über
    // den gesamten aufgespannten Bereich.
    if (f.channelsHz) {
      return f.channelsHz.some((c) => Math.abs(frequencyHz - c) <= toleranceHz);
    }
    const max = f.frequencyMaxHz ?? f.frequencyHz;
    return frequencyHz >= f.frequencyHz - toleranceHz && frequencyHz <= max + toleranceHz;
  });
}
