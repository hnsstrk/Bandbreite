/**
 * Textbausteine der Seite „Mobilfunk“.
 *
 * Technische Angaben folgen den 3GPP-Spezifikationen und den Festlegungen der
 * Bundesnetzagentur; Datenraten sind Größenordnungen der Technikstufe.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'das zellulare Prinzip mit Frequenzwiederverwendung und Handover erklären',
  'die Generationen 1G bis 5G anhand ihrer Zugriffsverfahren unterscheiden',
  'FDD und TDD gegenüberstellen und erkennen, welches Band welches Verfahren nutzt',
  'begründen, warum ein 700-MHz-Band weit trägt und ein 26-GHz-Band nur wenige hundert Meter',
  'aus Bandbreite und spektraler Effizienz die theoretische Datenrate abschätzen'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'zellprinzip',
    title: 'Das zellulare Prinzip',
    eyebrow: 'Grundidee',
    blocks: [
      {
        kind: 'p',
        text: 'Ein einzelner großer Sender kann ein ganzes Land versorgen, aber nur wenige Gespräche gleichzeitig führen. Der Mobilfunk kehrt das um: Er teilt die Fläche in Zellen mit begrenzter Reichweite. Dieselbe Frequenz lässt sich in ausreichend weit entfernten Zellen erneut verwenden, weil das Signal mit der Entfernung abnimmt. Die Zahl der gleichzeitig möglichen Verbindungen steigt damit nicht mit der Bandbreite allein, sondern mit der Anzahl der Zellen.'
      },
      {
        kind: 'dl',
        items: [
          {
            term: 'Frequenzwiederverwendung',
            def: 'Gleiche Frequenz in nicht benachbarten Zellen; der Wiederholabstand bestimmt das verbleibende Störverhältnis.'
          },
          {
            term: 'Handover',
            def: 'Übergabe einer laufenden Verbindung an die Nachbarzelle, ausgelöst durch Messberichte des Endgeräts.'
          },
          {
            term: 'Zellatmung',
            def: 'Bei stark belasteten Zellen schrumpft der versorgte Radius, weil die Störleistung im eigenen Netz steigt.'
          },
          {
            term: 'Sektorisierung',
            def: 'Drei Antennen mit je etwa 120 Grad Öffnung machen aus einem Standort drei Zellen.'
          }
        ]
      },
      {
        kind: 'p',
        text: 'Je kleiner die Zelle, desto höher die Kapazität pro Fläche — und desto mehr Standorte sind nötig. Genau darin liegt der Kompromiss, der die Bandwahl bestimmt: tiefe Frequenzen für die Fläche, hohe Frequenzen für die Kapazität in Ballungsräumen.'
      },
      {
        kind: 'p',
        text: 'Wie weit zwei Zellen auseinanderliegen müssen, die dieselbe Frequenz nutzen, bestimmt die Größe des Clusters. Im Sechseckraster lässt sich das genau angeben — und mit dem Störabstand verrechnen, der dabei übrig bleibt.'
      },
      { kind: 'widget', id: 'cell-reuse' }
    ]
  },
  {
    id: 'zugriffsverfahren',
    title: 'Zugriffsverfahren der Generationen',
    blocks: [
      {
        kind: 'p',
        text: 'Der rote Faden durch die Generationen ist die Frage, wie sich viele Teilnehmer eine Ressource teilen. Jede Generation hat darauf eine andere Antwort gefunden.'
      },
      {
        kind: 'ul',
        items: [
          'FDMA (1G): Jeder Teilnehmer bekommt einen eigenen Frequenzkanal für die Dauer des Gesprächs.',
          'TDMA (2G): Acht Zeitschlitze teilen sich einen 200-kHz-Kanal; jeder Teilnehmer sendet nur in seinem Schlitz.',
          'CDMA (3G): Alle senden gleichzeitig auf denselben 5 MHz und werden durch orthogonale Spreizcodes getrennt.',
          'OFDMA (4G und 5G): Der Kanal zerfällt in tausende schmale Unterträger, die im Millisekundentakt einzelnen Teilnehmern zugeteilt werden.'
        ]
      },
      {
        kind: 'p',
        text: 'OFDMA ist deshalb so erfolgreich, weil schmale Unterträger einen frequenzselektiven Kanal in viele fast ebene Teilkanäle zerlegen. Der Empfänger muss dann keinen aufwendigen Entzerrer betreiben, sondern nur je Unterträger einen Faktor korrigieren. Im Uplink von LTE nutzt man SC-FDMA, weil es geringere Leistungsspitzen erzeugt und damit den Senderverstärker im Endgerät schont.'
      }
    ]
  },
  {
    id: 'duplex',
    title: 'FDD und TDD',
    blocks: [
      {
        kind: 'p',
        text: 'Hin- und Rückrichtung müssen getrennt werden. Beim Frequenzduplex (FDD) liegen Uplink und Downlink in verschiedenen Bändern mit festem Duplexabstand; beide Richtungen können gleichzeitig senden. Beim Zeitduplex (TDD) nutzen beide Richtungen dasselbe Band und wechseln sich im Millisekundenraster ab.'
      },
      {
        kind: 'table',
        caption: 'Duplexverfahren im Vergleich',
        head: ['Merkmal', 'FDD', 'TDD'],
        rows: [
          ['Spektrum', 'gepaart, zwei Blöcke', 'ungepaart, ein Block'],
          ['Aufteilung', 'fest 50 zu 50', 'einstellbar, meist mehr Downlink'],
          ['Filteraufwand', 'Duplexweiche im Gerät nötig', 'Umschalter statt Weiche'],
          ['Synchronisation', 'unkritisch', 'benachbarte Netze müssen synchron laufen'],
          ['Typische Bänder', 'n28, n20, n8, n3, n1', 'n38, n78, n79, n257']
        ]
      },
      {
        kind: 'p',
        text: 'Ein Kuriosum zeigt Band 20: Dort liegt der Downlink mit 791 bis 821 MHz unterhalb des Uplinks mit 832 bis 862 MHz — umgekehrt zur sonst üblichen Anordnung. Der Grund liegt in der Umwidmung ehemaliger Fernsehfrequenzen und der Rücksicht auf benachbarte Nutzungen.'
      }
    ]
  },
  {
    id: 'baender-de',
    title: 'Bänder in Deutschland',
    blocks: [
      {
        kind: 'p',
        text: 'Die deutschen Mobilfunkbänder stammen aus mehreren Vergabeverfahren. 900 und 1800 MHz kommen aus der GSM-Zeit, 2100 MHz aus der UMTS-Versteigerung 2000, 800 MHz aus der ersten digitalen Dividende 2010, 700 MHz aus der zweiten 2015 und 3,6 GHz aus der 5G-Auktion 2019. Millimeterwellen um 26 GHz sind bislang vor allem für lokale Netze und Industrieanwendungen vorgesehen.'
      },
      {
        kind: 'ul',
        items: [
          'Unter 1 GHz: große Zellen, gute Gebäudedurchdringung, wenig Bandbreite — die Grundversorgung.',
          '1 bis 2,6 GHz: der Kapazitätsteppich in Städten, mit ausgewogener Reichweite.',
          '3,4 bis 3,8 GHz: 100 MHz je Netzbetreiber, massives MIMO, Zellradien von einigen hundert Metern.',
          'Ab 24 GHz: sehr viel Bandbreite, aber Reichweiten im Bereich weniger hundert Meter und kaum Durchdringung von Wänden.'
        ]
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Warum tiefe Bänder weiter tragen',
        text: 'Die Freiraumdämpfung wächst mit dem Quadrat der Frequenz: von 700 MHz auf 3,5 GHz sind das rund 14 dB zusätzlicher Verlust bei gleicher Entfernung — vor jeder Dämpfung durch Wände, Regen oder Bewuchs.'
      },
      {
        kind: 'formula',
        formula: 'FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)',
        alt: 'Freiraumdämpfung in Dezibel gleich zwanzig mal Logarithmus der Entfernung plus zwanzig mal Logarithmus der Frequenz plus zwanzig mal Logarithmus von vier Pi durch c',
        label: 'Freiraumdämpfung',
        variables: [
          { symbol: 'd', meaning: 'Entfernung', unit: 'm' },
          { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' },
          { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' }
        ]
      }
    ]
  },
  {
    id: 'mimo',
    title: 'MIMO, Beamforming und der Weg zu 6G',
    blocks: [
      {
        kind: 'p',
        text: 'Mehr Bandbreite ist teuer, mehr Antennen sind billiger. MIMO nutzt mehrere Sende- und Empfangsantennen, um über denselben Kanal mehrere Datenströme parallel zu übertragen. Voraussetzung ist ein hinreichend „reicher“ Kanal mit Streuung und Mehrwegeausbreitung — auf freier Sichtstrecke ohne Streuer bringt MIMO wenig.'
      },
      {
        kind: 'p',
        text: 'Beamforming bündelt die Energie stattdessen in eine Richtung: Eine Antennengruppe steuert die Phasenlage jedes Elements so, dass sich die Wellen beim Empfänger addieren. Bei 3,5 GHz mit 64 Elementen und erst recht im Millimeterwellenbereich ist das die Voraussetzung dafür, überhaupt eine brauchbare Reichweite zu erzielen.'
      },
      {
        kind: 'p',
        text: 'Für 6G nennt der ITU-Rahmen IMT-2030 als Ziele die Verschmelzung von Kommunikation und Ortung, die Einbindung von Satelliten für lückenlose Abdeckung sowie deutlich höhere Energieeffizienz. Als Kandidatenbereiche gelten das obere Mittelband zwischen etwa 7 und 15 GHz und Sub-Terahertz-Frequenzen. Standardisiert ist davon noch nichts.'
      }
    ]
  }
];
