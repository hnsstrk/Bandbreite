/**
 * Zentrale Navigations-Registry — Single Source of Truth.
 *
 * Alle Konsumenten (Header, Mega-Menü, MobileMenu, Breadcrumb, Hub-Kacheln,
 * Sitemap, Command-Palette, Verwandte Themen) leiten ihre Daten aus `NAV_TREE`
 * ab. Es gibt keine zweite, händisch gepflegte Label- oder Kachelliste mehr.
 *
 * Konventionen:
 * - Jeder `href` endet mit einem Schrägstrich (`trailingSlash: 'always'`).
 * - `status: 'geplant'` markiert Seiten, die noch nicht existieren. Sie werden
 *   in der Navigation ausgegraut dargestellt und **nicht** verlinkt.
 * - `icon` ist ein Name, kein Markup — die Icon-Komponente des Design-Systems
 *   löst ihn auf.
 */

import { humanizeSegment } from '$lib/utils/slug';

/** Kanonische Basis-URL für canonical/og:url. */
export const SITE_URL = 'https://bandbreite.online-resources.de';

/** Standard-Titel und -Beschreibung, wenn eine Route nichts liefert. */
export const SITE_NAME = 'Bandbreite';
export const SITE_DESCRIPTION =
  'Interaktive Visualisierung des elektromagnetischen Spektrums, Rechner für die Hochfrequenztechnik und ein Nachschlagewerk zur Funktechnik.';

export type NavStatus = 'live' | 'geplant';

export interface NavNode {
  /** Punktnotierte ID, z. B. 'wissen.funktechnik.mobilfunk'. */
  id: string;
  /** Anzeigename in Navigation, Breadcrumb und Kachel. */
  label: string;
  /** Route mit Trailing Slash. */
  href: string;
  /** Ein Satz für Kacheln, Mega-Menü und Suchergebnisse. */
  description?: string;
  /** Name eines Icons (kein Markup). */
  icon?: string;
  /** Zusätzliche Suchbegriffe. */
  keywords?: string[];
  /** Ob die Seite existiert. */
  status: NavStatus;
  /**
   * Aus Menü, Hub-Kacheln, Kapitelnavigation und Suchindex ausblenden.
   *
   * Für Seiten, die es gibt und die verlinkt werden dürfen, aber keinen Platz
   * in der Navigation haben — etwa die Ergebnisseite `/suche/`. Die Sitemap
   * führt sie weiterhin auf, damit die Übersicht vollständig bleibt.
   */
  hidden?: boolean;
  children?: NavNode[];
}

export const NAV_TREE: NavNode[] = [
  {
    // Portalseite unter „/" — der einzige Knoten ohne Pfadsegment; seine ID
    // lautet deshalb 'start' statt eines aus dem Pfad abgeleiteten Namens.
    id: 'start',
    label: 'Start',
    href: '/',
    icon: 'spectrum',
    status: 'live',
    description:
      'Portalseite: Einstieg in Spektrum, Werkzeuge, Wissen, Datenbanken und Service — mit Suche und interaktiven Kapiteln.',
    keywords: ['Start', 'Startseite', 'Portal', 'Übersicht', 'Bandbreite', 'Einstieg']
  },
  {
    id: 'spektrum',
    label: 'Spektrum',
    href: '/spektrum/',
    icon: 'spectrum',
    status: 'live',
    description:
      'Das elektromagnetische Spektrum interaktiv: Bänder, Frequenz- und Leistungsumrechnung, Reichweite und Bandzuordnung.',
    keywords: [
      'EM-Spektrum',
      'Frequenz',
      'Wellenlänge',
      'Bänder',
      'ITU',
      'IEEE',
      'NATO',
      'Dashboard'
    ],
    children: [
      {
        id: 'spektrum.anwendungen',
        label: 'Anwendungen im Spektrum',
        href: '/spektrum/anwendungen/',
        icon: 'radio',
        status: 'live',
        description:
          'Welcher Dienst nutzt welches Band? Rundfunk, Mobilfunk, Radar, Satellit und WLAN als Überlagerung im Spektrum.',
        keywords: ['Rundfunk', 'Mobilfunk', 'Radar', 'Satellit', 'WLAN', 'Dienste']
      },
      {
        id: 'spektrum.sendeleistungen',
        label: 'Sendeleistungen',
        href: '/spektrum/sendeleistungen/',
        icon: 'power',
        status: 'live',
        description:
          'Typische Sendeleistungen von Rundfunk-, Radar-, Mobilfunk- und Satellitensystemen über der Frequenz aufgetragen.',
        keywords: ['Leistung', 'Watt', 'dBm', 'EIRP', 'Sender']
      }
    ]
  },
  {
    id: 'rechner',
    label: 'Rechner',
    href: '/rechner/',
    icon: 'calculator',
    status: 'live',
    description:
      'Werkzeuge für die Funkplanung: Eingabe, Formel, Ergebnis — von der Freiraumdämpfung bis zur Fresnel-Zone.',
    keywords: ['Rechner', 'Formel', 'Berechnung', 'Werkzeuge'],
    children: [
      {
        id: 'rechner.fspl',
        label: 'Freiraumdämpfung (FSPL)',
        href: '/rechner/fspl/',
        icon: 'trending-down',
        status: 'live',
        description:
          'Signalverlust im freien Raum zwischen Sender und Empfänger, mit Mehrfrequenz-Vergleich.',
        keywords: ['FSPL', 'Freiraumdämpfung', 'Pfadverlust', 'Path Loss', 'Reichweite']
      },
      {
        id: 'rechner.link-budget',
        label: 'Link-Budget',
        href: '/rechner/link-budget/',
        icon: 'bar-chart',
        status: 'live',
        description:
          'Vollständige Signalpfad-Analyse mit Sendeleistung, Antennengewinnen, Verlusten und Schwundreserve.',
        keywords: ['Link Budget', 'EIRP', 'Empfangspegel', 'Schwundreserve', 'Systemgewinn']
      },
      {
        id: 'rechner.radar',
        label: 'Radar-Reichweite',
        href: '/rechner/radar/',
        icon: 'target',
        status: 'live',
        description:
          'Radargleichung: Sendeleistung, Antennengewinn, Rückstreuquerschnitt und Empfindlichkeit ergeben die Reichweite.',
        keywords: ['Radargleichung', 'RCS', 'Rückstreuquerschnitt', 'Radar', 'Reichweite']
      },
      {
        id: 'rechner.kanalkapazitaet',
        label: 'Kanalkapazität',
        href: '/rechner/kanalkapazitaet/',
        icon: 'signal',
        status: 'live',
        description:
          'Shannon-Hartley: maximale Datenrate aus Bandbreite und Signal-Rausch-Verhältnis.',
        keywords: ['Shannon', 'Hartley', 'SNR', 'Bandbreite', 'Datenrate', 'Kanalkapazität']
      },
      {
        id: 'rechner.skin-tiefe',
        label: 'Skin-Tiefe',
        href: '/rechner/skin-tiefe/',
        icon: 'layers',
        status: 'live',
        description:
          'Eindringtiefe elektromagnetischer Wellen in leitfähige Materialien in Abhängigkeit von Frequenz und Material.',
        keywords: ['Skin-Effekt', 'Eindringtiefe', 'Leitfähigkeit', 'Permeabilität', 'Abschirmung']
      },
      {
        id: 'rechner.fresnel',
        label: 'Fresnel-Zone',
        href: '/rechner/fresnel/',
        icon: 'ellipse',
        status: 'live',
        description:
          'Radius der Fresnel-Zonen und die nötige Hindernisfreiheit einer Sichtverbindung.',
        keywords: ['Fresnel', 'Sichtverbindung', 'Line of Sight', 'Hindernisfreiheit', 'Clearance']
      },
      {
        id: 'rechner.antennengewinn',
        label: 'Antennengewinn',
        href: '/rechner/antennengewinn/',
        icon: 'antenna',
        status: 'live',
        description:
          'Gewinn, Halbwertsbreite, Wirkfläche und Fernfeldabstand einer Parabolantenne — samt Umkehrung zum nötigen Durchmesser.',
        keywords: [
          'Antennengewinn',
          'Parabolantenne',
          'dBi',
          'dBd',
          'Öffnungswinkel',
          'Wirkfläche',
          'Fernfeld',
          'Spiegel'
        ]
      },
      {
        id: 'rechner.radiohorizont',
        label: 'Radiohorizont',
        href: '/rechner/radiohorizont/',
        icon: 'globe',
        status: 'live',
        description:
          'Sichtweite über die gekrümmte Erde aus den Antennenhöhen, mit einstellbarem k-Faktor der Refraktion.',
        keywords: [
          'Radiohorizont',
          'Sichtweite',
          'Erdkrümmung',
          'k-Faktor',
          '4/3-Erde',
          'Refraktion',
          'Line of Sight',
          'Antennenhöhe'
        ]
      },
      {
        id: 'rechner.dezibel',
        label: 'Dezibel und Pegel',
        href: '/rechner/dezibel/',
        icon: 'sliders',
        status: 'live',
        description:
          'Leistung, dBm, dBW, Spannung und dBµV ineinander umrechnen, dazu Merkregeln und eine Kettenrechnung.',
        keywords: [
          'Dezibel',
          'dB',
          'dBm',
          'dBW',
          'dBµV',
          'Pegel',
          'Leistung',
          'Spannung',
          'Kettenrechnung',
          'Merkregel'
        ]
      }
    ]
  },
  {
    id: 'konverter',
    label: 'Konverter',
    href: '/konverter/',
    icon: 'exchange',
    status: 'live',
    description: 'Einheitenumrechner für die Funktechnik.',
    keywords: ['Umrechnung', 'Einheiten', 'Konverter'],
    children: [
      {
        id: 'konverter.frequenz',
        label: 'Frequenz ↔ Wellenlänge',
        href: '/konverter/frequenz/',
        icon: 'wave',
        status: 'live',
        description:
          'Umrechnung zwischen Frequenz und Wellenlänge über das gesamte elektromagnetische Spektrum.',
        keywords: ['Frequenz', 'Wellenlänge', 'Lambda', 'Hz', 'MHz', 'GHz', 'Meter']
      }
    ]
  },
  {
    id: 'wissen',
    label: 'Wissen',
    href: '/wissen/',
    icon: 'book',
    status: 'live',
    description:
      'Lehrtexte zur Funk- und Hochfrequenztechnik — von der Wellenausbreitung über Modulation bis zur Radartechnik.',
    keywords: ['Wissen', 'Grundlagen', 'Lehrtext', 'Nachschlagewerk'],
    children: [
      {
        id: 'wissen.lernpfade',
        label: 'Lernpfade',
        href: '/wissen/lernpfade/',
        icon: 'play',
        status: 'live',
        description:
          'Geführte Reihenfolgen durch die Kapitel: vier Pfade mit einem Lernziel je Schritt und einer Fortschrittsanzeige.',
        keywords: [
          'Lernpfad',
          'Kurs',
          'Reihenfolge',
          'Einstieg',
          'Lernziel',
          'Fortschritt',
          'geführt'
        ]
      },
      {
        id: 'wissen.grundlagen',
        label: 'Grundlagen',
        href: '/wissen/grundlagen/',
        icon: 'wave',
        status: 'live',
        description:
          'Einstieg in die Hochfrequenztechnik: elektromagnetische Welle, Dezibel und Pegel, Leistung und Feldstärke.',
        keywords: [
          'Grundlagen',
          'Einstieg',
          'EM-Welle',
          'Dezibel',
          'Pegel',
          'Feldstärke',
          'Polarisation'
        ],
        children: [
          {
            id: 'wissen.grundlagen.em-wellen',
            label: 'Elektromagnetische Wellen',
            href: '/wissen/grundlagen/em-wellen/',
            icon: 'wave',
            status: 'live',
            description:
              'E-Feld und H-Feld, λ = c/f, Nah- und Fernfeld, Polarisation, Feldwellenwiderstand und Photonenenergie.',
            keywords: [
              'EM-Welle',
              'E-Feld',
              'H-Feld',
              'Polarisation',
              'zirkular',
              'RHCP',
              'LHCP',
              'Fernfeld',
              'Nahfeld',
              'Feldwellenwiderstand',
              'Photonenenergie',
              'ionisierend'
            ]
          },
          {
            id: 'wissen.grundlagen.dezibel',
            label: 'Dezibel und Pegel',
            href: '/wissen/grundlagen/dezibel/',
            icon: 'calculator',
            status: 'live',
            description:
              'Warum logarithmisch gerechnet wird: 10·log und 20·log, dBm, dBW, dBµV, dBi, dBd, dBc und die Kettenrechnung.',
            keywords: [
              'Dezibel',
              'dB',
              'dBm',
              'dBW',
              'dBµV',
              'dBi',
              'dBd',
              'dBc',
              'Pegel',
              'Pegelplan',
              'Merkregel'
            ]
          },
          {
            id: 'wissen.grundlagen.leistung-und-pegel',
            label: 'Leistung, EIRP und Feldstärke',
            href: '/wissen/grundlagen/leistung-und-pegel/',
            icon: 'signal',
            status: 'live',
            description:
              'Sendeleistung, Antennengewinn, EIRP und ERP, Leistungsdichte im Abstand d und Feldstärke in V/m und dBµV/m.',
            keywords: [
              'EIRP',
              'ERP',
              'Sendeleistung',
              'Antennengewinn',
              'Leistungsdichte',
              'Feldstärke',
              'dBµV/m',
              'Wirkfläche',
              'Personenschutz'
            ]
          }
        ]
      },
      {
        id: 'wissen.wellenausbreitung',
        label: 'Wellenausbreitung',
        href: '/wissen/wellenausbreitung/',
        icon: 'waves',
        status: 'live',
        description:
          'Bodenwelle, Raumwelle und Sichtverbindung: wie Funkwellen den Weg vom Sender zum Empfänger finden.',
        keywords: [
          'Bodenwelle',
          'Raumwelle',
          'Sichtverbindung',
          'Sporadic E',
          'MUF',
          'LUF',
          'Tote Zone',
          'Beugung'
        ],
        children: [
          {
            id: 'wissen.wellenausbreitung.ionosphaere',
            label: 'Ionosphärische Ausbreitung',
            href: '/wissen/wellenausbreitung/ionosphaere/',
            icon: 'globe',
            status: 'live',
            description:
              'D-, E- und F-Schichten, MUF und LUF, Skip-Zone und Kurzwellenausbreitung über große Entfernungen.',
            keywords: ['Ionosphäre', 'MUF', 'LUF', 'Skip-Zone', 'Raumwelle', 'Kurzwelle', 'F2']
          },
          {
            id: 'wissen.wellenausbreitung.daempfung',
            label: 'Atmosphärische Dämpfung',
            href: '/wissen/wellenausbreitung/daempfung/',
            icon: 'cloud',
            status: 'live',
            description:
              'Dämpfung durch Sauerstoff, Wasserdampf und Niederschlag nach ITU-R P.676, P.838 und P.840.',
            keywords: [
              'Dämpfung',
              'Absorption',
              'Sauerstoff',
              'Wasserdampf',
              'Regen',
              'Nebel',
              '60 GHz',
              '22 GHz',
              'ITU-R P.676'
            ]
          }
        ]
      },
      {
        id: 'wissen.funktechnik',
        label: 'Funk & Fernmeldetechnik',
        href: '/wissen/funktechnik/',
        icon: 'antenna',
        status: 'live',
        description:
          'Kapitel über die Funkdienste: wer welche Frequenzen nutzt und nach welchen Regeln.',
        keywords: ['Funkdienste', 'Fernmeldetechnik', 'Frequenzplan', 'Betriebsarten'],
        children: [
          {
            id: 'wissen.funktechnik.funkdienste',
            label: 'Funkdienste & Frequenzplan',
            href: '/wissen/funktechnik/funkdienste/',
            icon: 'list',
            status: 'live',
            description:
              'Das Ordnungssystem hinter den Frequenzen: ITU-Funkdienste, Regionen, primäre und sekundäre Zuweisung.',
            keywords: ['ITU', 'Funkdienst', 'Frequenzplan', 'Zuweisung', 'Regionen', 'BNetzA']
          },
          {
            id: 'wissen.funktechnik.amateurfunk',
            label: 'Amateurfunk',
            href: '/wissen/funktechnik/amateurfunk/',
            icon: 'radio-tower',
            status: 'live',
            description:
              'Bandplan, Zeugnisklassen, Betriebsarten und Rufzeichensystematik des Amateurfunkdienstes.',
            keywords: ['Amateurfunk', 'Bandplan', 'IARU', 'CW', 'SSB', 'FT8', 'Locator', 'QSL']
          },
          {
            id: 'wissen.funktechnik.mobilfunk',
            label: 'Mobilfunk',
            href: '/wissen/funktechnik/mobilfunk/',
            icon: 'smartphone',
            status: 'live',
            description:
              'Von GSM bis 5G NR: Zellprinzip, Zugriffsverfahren, Duplex und die Bandnummern in Deutschland.',
            keywords: ['GSM', 'LTE', '5G', 'NR', 'n78', 'FDD', 'TDD', 'OFDMA', 'MIMO', 'mmWave']
          },
          {
            id: 'wissen.funktechnik.rundfunk',
            label: 'Rundfunk',
            href: '/wissen/funktechnik/rundfunk/',
            icon: 'broadcast',
            status: 'live',
            description:
              'Rundfunk von Langwelle bis DVB-T2: Kanalraster, Modulation und Gleichwellennetze.',
            keywords: [
              'Langwelle',
              'Mittelwelle',
              'Kurzwelle',
              'UKW',
              'FM',
              'DAB+',
              'DVB-T2',
              'RDS'
            ]
          },
          {
            id: 'wissen.funktechnik.seefunk',
            label: 'Seefunk',
            href: '/wissen/funktechnik/seefunk/',
            icon: 'wave',
            status: 'live',
            description:
              'GMDSS-Seegebiete, UKW-Kanäle nach Appendix 18, digitaler Selektivruf, NAVTEX, AIS und Seenotfunkbaken.',
            keywords: [
              'Seefunk',
              'GMDSS',
              'Kanal 16',
              'Kanal 70',
              'DSC',
              'MMSI',
              'NAVTEX',
              'AIS',
              'EPIRB',
              'ATIS',
              'Grenzwelle',
              '2182 kHz'
            ]
          },
          {
            id: 'wissen.funktechnik.flugfunk',
            label: 'Flugfunk',
            href: '/wissen/funktechnik/flugfunk/',
            icon: 'signal',
            status: 'live',
            description:
              'Sprechfunk 118 bis 137 MHz mit 8,33-kHz-Raster, Notfrequenzen sowie NDB, VOR, ILS, DME, Transponder und ADS-B.',
            keywords: [
              'Flugfunk',
              '8,33 kHz',
              'Kanalbezeichnung',
              '121,5 MHz',
              'VOR',
              'ILS',
              'DME',
              'NDB',
              'Transponder',
              'ADS-B',
              'ACARS',
              'ICAO Annex 10'
            ]
          },
          {
            id: 'wissen.funktechnik.bos',
            label: 'BOS- und Behördenfunk',
            href: '/wissen/funktechnik/bos/',
            icon: 'radio',
            status: 'live',
            description:
              'Vom analogen 4-m- und 2-m-Band zum TETRA-Digitalfunk der Behörden — und der Notruf 112 mit AML und eCall.',
            keywords: [
              'BOS',
              'Behördenfunk',
              'TETRA',
              'Digitalfunk',
              '4-m-Band',
              '2-m-Band',
              'POCSAG',
              'TMO',
              'DMO',
              '112',
              'AML',
              'eCall'
            ]
          },
          {
            id: 'wissen.funktechnik.satellitenfunk',
            label: 'Satellitenfunk',
            href: '/wissen/funktechnik/satellitenfunk/',
            icon: 'satellite',
            status: 'live',
            description:
              'Bahnen von LEO bis GEO, Bandbuchstaben und Up-/Downlink, Transponder, EIRP und G/T sowie die wichtigsten Systeme.',
            keywords: [
              'Satellitenfunk',
              'GEO',
              'MEO',
              'LEO',
              'Transponder',
              'EIRP',
              'G/T',
              'Ku-Band',
              'Ka-Band',
              'Inmarsat',
              'Iridium',
              'Starlink',
              'QO-100',
              'DVB-S'
            ]
          },
          {
            id: 'wissen.funktechnik.notfrequenzen',
            label: 'Not- und Sicherheitsfrequenzen',
            href: '/wissen/funktechnik/notfrequenzen/',
            icon: 'warning',
            status: 'live',
            description:
              'Not-, Anruf- und Sicherheitsfrequenzen von See-, Flug- und Landfunk als filterbare Nachschlagehilfe.',
            keywords: [
              'Notruf',
              'GMDSS',
              'Kanal 16',
              'DSC',
              '121,5 MHz',
              '406 MHz',
              'Cospas-Sarsat',
              'BOS',
              'PMR446',
              'CB-Funk',
              'EPIRB',
              'NAVTEX'
            ]
          }
        ]
      },
      {
        id: 'wissen.modulation',
        label: 'Modulation',
        href: '/wissen/modulation/',
        icon: 'activity',
        status: 'live',
        description: 'Analoge und digitale Modulationsverfahren: AM, FM, SSB, PSK, QAM und OFDM.',
        keywords: ['AM', 'FM', 'SSB', 'ASK', 'FSK', 'PSK', 'QAM', 'OFDM', 'Konstellation']
      },
      {
        id: 'wissen.antennen',
        label: 'Antennen',
        href: '/wissen/antennen/',
        icon: 'antenna',
        status: 'live',
        description:
          'Gewinn, Richtcharakteristik, Wirkfläche und Anpassung — vom Dipol bis zur Gruppenantenne.',
        keywords: ['Dipol', 'Yagi', 'Parabol', 'Patch', 'Phased Array', 'dBi', 'SWR', 'EIRP']
      },
      {
        id: 'wissen.mathematik',
        label: 'HF-Mathematik',
        href: '/wissen/mathematik/',
        icon: 'sigma',
        status: 'live',
        description:
          'Die wichtigsten Formeln der Hochfrequenztechnik mit Herleitung und Rechenbeispielen.',
        keywords: [
          'Formeln',
          'Dezibel',
          'FSPL',
          'Radargleichung',
          'Shannon',
          'Radiohorizont',
          'Logarithmus'
        ]
      },
      {
        id: 'wissen.radar',
        label: 'Radartechnik',
        href: '/wissen/radar/',
        icon: 'radar',
        status: 'live',
        description:
          'Kapitel-Hub: Radarprinzip, Radargleichung, Sende- und Auswerteverfahren sowie das kooperative Sekundärradar.',
        keywords: ['Radar', 'Pulsradar', 'Doppler', 'FMCW', 'RCS', 'SAR', 'Sekundärradar'],
        children: [
          {
            id: 'wissen.radar.grundlagen',
            label: 'Radar-Grundlagen',
            href: '/wissen/radar/grundlagen/',
            icon: 'signal',
            status: 'live',
            description:
              'Laufzeit und Entfernung, Radargleichung, Rückstreuquerschnitt, Auflösung und Mehrdeutigkeit sowie die Radarbänder.',
            keywords: [
              'Radargleichung',
              'RCS',
              'Rückstreuquerschnitt',
              'Laufzeit',
              'Auflösung',
              'Eindeutigkeit',
              'PRF',
              'IEEE-Bänder'
            ]
          },
          {
            id: 'wissen.radar.verfahren',
            label: 'Radarverfahren',
            href: '/wissen/radar/verfahren/',
            icon: 'wave',
            status: 'live',
            description:
              'Puls und Dauerstrich, Doppler mit MTI und MTD, FMCW, Pulskompression, CFAR, Phased Array, SAR und bistatische Systeme.',
            keywords: [
              'Doppler',
              'MTI',
              'MTD',
              'Blindgeschwindigkeit',
              'FMCW',
              'Chirp',
              'Pulskompression',
              'CFAR',
              'Phased Array',
              'SAR',
              'bistatisch',
              'Passivradar'
            ]
          },
          {
            id: 'wissen.radar.sekundaerradar',
            label: 'Sekundärradar',
            href: '/wissen/radar/sekundaerradar/',
            icon: 'radio',
            status: 'live',
            description:
              'Abfrage auf 1030 MHz, Antwort auf 1090 MHz: Modus A und C, Modus S mit 24-Bit-Adresse, ADS-B und TCAS.',
            keywords: [
              'Sekundärradar',
              'SSR',
              'Transponder',
              'Squawk',
              'Mode S',
              'ADS-B',
              'TCAS',
              '1030 MHz',
              '1090 MHz',
              'ICAO'
            ]
          }
        ]
      },
      {
        id: 'wissen.glossar',
        label: 'Glossar',
        href: '/wissen/glossar/',
        icon: 'book',
        status: 'live',
        description:
          'Nachschlagewerk der Funktechnik: Kurzdefinitionen von dB bis Wellenlänge, durchsuchbar und nach Themen filterbar.',
        keywords: [
          'Glossar',
          'Begriffe',
          'Lexikon',
          'Definition',
          'Abkürzungen',
          'dB',
          'EIRP',
          'SNR',
          'Nachschlagen'
        ]
      }
    ]
  },
  {
    id: 'datenbanken',
    label: 'Datenbanken',
    href: '/datenbanken/',
    icon: 'database',
    status: 'live',
    description:
      'Durchsuch- und filterbare Datensätze: Frequenzbänder, Funkdienste, Sender und Fernmeldegeschichte.',
    keywords: ['Datenbank', 'Referenz', 'Tabelle', 'Nachschlagen'],
    children: [
      {
        id: 'datenbanken.frequenzbaender',
        label: 'Frequenzbänder',
        href: '/datenbanken/frequenzbaender/',
        icon: 'table',
        status: 'live',
        description:
          'Alle Bänder nach ITU, IEEE, NATO sowie Amateurfunk- und Rundfunkbänder mit Eigenschaften und Anwendungen.',
        keywords: [
          'ITU-Bänder',
          'IEEE-Bänder',
          'NATO-Bänder',
          'Amateurfunkbänder',
          'Rundfunkbänder',
          'ELF',
          'VHF',
          'UHF',
          'SHF',
          'X-Band',
          'Ku-Band'
        ]
      },
      {
        id: 'datenbanken.funkdienste',
        label: 'Funkdienste',
        href: '/datenbanken/funkdienste/',
        icon: 'list',
        status: 'live',
        description:
          'Frequenzzuweisungen nach Dienst und Kategorie, filterbar nach Frequenzbereich, Region und Standard.',
        keywords: ['Funkdienst', 'Zuweisung', 'Kategorie', 'ISM', 'PMR', 'Seefunk', 'Flugfunk']
      },
      {
        id: 'datenbanken.sender',
        label: 'Senderdatenbank',
        href: '/datenbanken/sender/',
        icon: 'radio-tower',
        status: 'live',
        description:
          'Bekannte Zeitzeichen-, Rundfunk- und Navigationssender mit Frequenz, Leistung und Standort.',
        keywords: ['Sender', 'DCF77', 'Zeitzeichen', 'Langwelle', 'Standort', 'Leistung']
      },
      {
        id: 'datenbanken.historie',
        label: 'Fernmeldegeschichte',
        href: '/datenbanken/historie/',
        icon: 'clock',
        status: 'live',
        description:
          'Zeitleiste der Funk- und Fernmeldetechnik von den ersten Experimenten bis zur Gegenwart.',
        keywords: ['Geschichte', 'Zeitleiste', 'Marconi', 'Hertz', 'Meilensteine']
      }
    ]
  },
  {
    id: 'service',
    label: 'Service',
    href: '/service/',
    icon: 'info',
    status: 'live',
    description: 'Sitemap, Quellenlage und Hinweise zum Projekt.',
    keywords: ['Service', 'Sitemap', 'Quellen', 'Über'],
    children: [
      {
        id: 'service.sitemap',
        label: 'Sitemap',
        href: '/service/sitemap/',
        icon: 'map',
        status: 'live',
        description: 'Alle Seiten der Anwendung auf einen Blick, inklusive der geplanten Inhalte.',
        keywords: ['Sitemap', 'Übersicht', 'Seitenverzeichnis']
      },
      {
        id: 'service.quellen',
        label: 'Quellen & Stand',
        href: '/service/quellen/',
        icon: 'file-text',
        status: 'live',
        description: 'Herkunft und Stand der verwendeten Daten sowie die verwendeten Normen.',
        keywords: ['Quellen', 'ITU-R', 'BNetzA', 'IARU', '3GPP', 'Stand']
      },
      {
        // Die Ergebnisseite der Suche liegt unter „/suche/" — die ID leitet
        // sich wie bei jedem Knoten aus dem Pfad ab und heißt deshalb 'suche',
        // obwohl der Knoten im Baum unter Service hängt. `hidden` hält sie aus
        // Menü, Kacheln und Suchindex heraus; erreichbar ist sie über die
        // Command-Palette und jeden geteilten Link.
        id: 'suche',
        label: 'Suche',
        href: '/suche/',
        icon: 'search',
        status: 'live',
        hidden: true,
        description:
          'Alle Treffer zu einem Suchbegriff auf einer Seite: Seiten, Werkzeuge, Widgets, Bänder, Funkdienste, Sender und Begriffe.',
        keywords: ['Suche', 'Suchergebnisse', 'Volltextsuche', 'finden']
      }
    ]
  }
];

// ============================================================================
// Header-Gruppen (Mega-Menü)
// ============================================================================

export interface NavColumn {
  /** Spaltenüberschrift. */
  label: string;
  /** Optionaler Link der Spaltenüberschrift (Kapitel-Hub). */
  href?: string;
  /** IDs der Einträge in dieser Spalte. */
  itemIds: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  /** Hub der Gruppe — Ziel des Eintrags „Übersicht". */
  href?: string;
  columns: NavColumn[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'spektrum',
    label: 'Spektrum',
    href: '/spektrum/',
    columns: [
      {
        label: 'Visualisierungen',
        href: '/spektrum/',
        itemIds: ['spektrum.anwendungen', 'spektrum.sendeleistungen']
      }
    ]
  },
  {
    id: 'werkzeuge',
    label: 'Werkzeuge',
    href: '/rechner/',
    columns: [
      {
        label: 'Rechner',
        href: '/rechner/',
        itemIds: [
          'rechner.fspl',
          'rechner.link-budget',
          'rechner.radar',
          'rechner.kanalkapazitaet',
          'rechner.skin-tiefe',
          'rechner.fresnel',
          'rechner.antennengewinn',
          'rechner.radiohorizont',
          'rechner.dezibel'
        ]
      },
      {
        label: 'Konverter',
        href: '/konverter/',
        itemIds: ['konverter.frequenz']
      }
    ]
  },
  {
    id: 'wissen',
    label: 'Wissen',
    href: '/wissen/',
    columns: [
      {
        label: 'Funk & Fernmeldetechnik',
        href: '/wissen/funktechnik/',
        itemIds: [
          'wissen.funktechnik.funkdienste',
          'wissen.funktechnik.amateurfunk',
          'wissen.funktechnik.mobilfunk',
          'wissen.funktechnik.rundfunk',
          'wissen.funktechnik.seefunk',
          'wissen.funktechnik.flugfunk',
          'wissen.funktechnik.bos',
          'wissen.funktechnik.satellitenfunk',
          'wissen.funktechnik.notfrequenzen'
        ]
      },
      {
        label: 'Wellenausbreitung',
        href: '/wissen/wellenausbreitung/',
        itemIds: [
          'wissen.wellenausbreitung',
          'wissen.wellenausbreitung.ionosphaere',
          'wissen.wellenausbreitung.daempfung'
        ]
      },
      {
        label: 'Technik & Verfahren',
        itemIds: [
          'wissen.modulation',
          'wissen.antennen',
          'wissen.radar',
          'wissen.radar.grundlagen',
          'wissen.radar.verfahren',
          'wissen.radar.sekundaerradar'
        ]
      },
      {
        label: 'Grundlagen & Mathematik',
        href: '/wissen/grundlagen/',
        itemIds: [
          'wissen.lernpfade',
          'wissen.grundlagen',
          'wissen.grundlagen.em-wellen',
          'wissen.grundlagen.dezibel',
          'wissen.grundlagen.leistung-und-pegel',
          'wissen.mathematik',
          'wissen.glossar'
        ]
      }
    ]
  },
  {
    id: 'datenbanken',
    label: 'Datenbanken',
    href: '/datenbanken/',
    columns: [
      {
        label: 'Datensätze',
        href: '/datenbanken/',
        itemIds: [
          'datenbanken.frequenzbaender',
          'datenbanken.funkdienste',
          'datenbanken.sender',
          'datenbanken.historie'
        ]
      }
    ]
  },
  {
    id: 'service',
    label: 'Service',
    href: '/service/',
    columns: [
      {
        label: 'Service',
        href: '/service/',
        itemIds: ['service.sitemap', 'service.quellen']
      }
    ]
  }
];

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/** Ergänzt einen fehlenden Trailing Slash. */
export function normalizeHref(href: string): string {
  if (!href) return '/';
  const withLeading = href.startsWith('/') ? href : `/${href}`;
  const withoutQuery = withLeading.split(/[?#]/)[0];
  return withoutQuery.endsWith('/') ? withoutQuery : `${withoutQuery}/`;
}

/** Alle Knoten des Baums in Tiefensuche-Reihenfolge. */
export function flattenNav(nodes: NavNode[] = NAV_TREE): NavNode[] {
  const result: NavNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) {
      result.push(...flattenNav(node.children));
    }
  }
  return result;
}

const NODES_BY_HREF = new Map<string, NavNode>(flattenNav().map((node) => [node.href, node]));
const NODES_BY_ID = new Map<string, NavNode>(flattenNav().map((node) => [node.id, node]));

/** Knoten zu einer Route finden (Trailing Slash wird ergänzt). */
export function findNode(href: string): NavNode | undefined {
  return NODES_BY_HREF.get(normalizeHref(href));
}

/** Knoten zu einer ID finden. */
export function findNodeById(id: string): NavNode | undefined {
  return NODES_BY_ID.get(id);
}

/** Mehrere Knoten in der Reihenfolge der übergebenen IDs. */
export function getNodesByIds(ids: readonly string[]): NavNode[] {
  return ids.map((id) => NODES_BY_ID.get(id)).filter((node): node is NavNode => Boolean(node));
}

export interface BreadcrumbEntry {
  label: string;
  href: string;
  /** Existiert die Zielseite? Geplante Ebenen werden nicht verlinkt. */
  status: NavStatus;
  isLast: boolean;
}

/**
 * Label eines dynamischen Segments (`[slug]`-Route) — bekommt das Segment und
 * gibt den Anzeigenamen zurück oder `undefined`, wenn es ihn nicht kennt.
 */
export type SegmentLabelResolver = (segment: string) => string | undefined;

const DYNAMIC_SEGMENT_LABELS = new Map<string, SegmentLabelResolver>();

/**
 * Dynamische Routen (z. B. `/wissen/lernpfade/<id>/`) stehen bewusst nicht im
 * NAV_TREE — sonst quöllen Mega-Menü und Kapitelblättern über. Damit die
 * Brotkrümel dort trotzdem kein rohes Slug-Fragment zeigen, meldet die
 * zuständige Datenquelle einen Resolver für ihren Elternpfad an
 * (`data/learningPaths.ts` für `/wissen/lernpfade/`). Die Abhängigkeit läuft
 * nur in eine Richtung — Datenquelle → Navigation — und erzeugt daher keinen
 * Import-Zyklus.
 */
export function registerDynamicSegmentLabels(
  parentHref: string,
  resolve: SegmentLabelResolver
): void {
  DYNAMIC_SEGMENT_LABELS.set(normalizeHref(parentHref), resolve);
}

/** Label eines dynamischen Segments unterhalb von `parentHref`. */
export function resolveDynamicSegmentLabel(
  parentHref: string,
  segment: string
): string | undefined {
  return DYNAMIC_SEGMENT_LABELS.get(normalizeHref(parentHref))?.(segment);
}

/**
 * Breadcrumb-Kette für eine Route. Labels stammen aus dem Navigationsbaum;
 * dynamische Segmente fragen den angemeldeten Resolver ihres Elternpfads,
 * alles Übrige wird lesbar formatiert.
 */
export function getBreadcrumbs(href: string): BreadcrumbEntry[] {
  const path = normalizeHref(href);
  const segments = path.split('/').filter(Boolean);
  const entries: BreadcrumbEntry[] = [];
  let cumulative = '';

  segments.forEach((segment, index) => {
    const parentHref = `${cumulative}/`;
    cumulative += `/${segment}`;
    const nodeHref = `${cumulative}/`;
    const node = NODES_BY_HREF.get(nodeHref);
    entries.push({
      label:
        node?.label ?? resolveDynamicSegmentLabel(parentHref, segment) ?? humanizeSegment(segment),
      href: nodeHref,
      status: node?.status ?? 'live',
      isLast: index === segments.length - 1
    });
  });

  return entries;
}

/**
 * Geschwisterknoten einer Route (ohne die Route selbst). Ausgeblendete Knoten
 * bleiben außen vor — die Kapitelnavigation soll nicht dorthin blättern.
 */
export function getSiblings(href: string): NavNode[] {
  const target = normalizeHref(href);
  const parent = getParent(target);
  const list = parent ? (parent.children ?? []) : NAV_TREE;
  return list.filter((node) => node.href !== target && !node.hidden);
}

/** Elternknoten einer Route. */
export function getParent(href: string): NavNode | undefined {
  const target = normalizeHref(href);
  return flattenNav().find((node) => node.children?.some((child) => child.href === target));
}

/**
 * Kinder eines Hubs — Grundlage für die Kachelraster der Hub-Seiten.
 * Ausgeblendete Knoten (`hidden`) bekommen keine Kachel.
 */
export function getHubChildren(href: string): NavNode[] {
  return (findNode(href)?.children ?? []).filter((node) => !node.hidden);
}

export interface PageMeta {
  title: string;
  description: string;
}

/**
 * Titel und Beschreibung einer Route für `Metadata.svelte`. Wird von den
 * `+page.ts`-Ladefunktionen genutzt, damit Navigation und `<head>` niemals
 * auseinanderlaufen.
 */
export function pageMeta(href: string, overrides: Partial<PageMeta> = {}): PageMeta {
  const node = findNode(href);
  return {
    title: overrides.title ?? node?.label ?? SITE_NAME,
    description: overrides.description ?? node?.description ?? SITE_DESCRIPTION
  };
}

/** Nur die existierenden, nicht ausgeblendeten Seiten (z. B. für die Suche). */
export function getLiveNodes(): NavNode[] {
  return flattenNav().filter((node) => node.status === 'live' && !node.hidden);
}

/** Ist `href` die aktuelle Route oder ein Vorfahre davon? */
export function isActivePath(href: string, currentPath: string): boolean {
  const target = normalizeHref(href);
  const current = normalizeHref(currentPath);
  return current === target || current.startsWith(target);
}
