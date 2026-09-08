/**
 * Textbausteine der Seite „Not- und Sicherheitsfrequenzen“.
 *
 * Die Seite ist eine Lernhilfe. Verbindlich sind ausschließlich die amtlichen
 * Veröffentlichungen: Nachrichten für Seefahrer, das Luftfahrthandbuch AIP,
 * die ITU-Listen sowie die Verfügungen der Bundesnetzagentur.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'die Notfrequenzen von See-, Flug- und Landfunk den jeweiligen Diensten zuordnen',
  'den Aufbau des GMDSS mit DSC-Alarmierung und anschließendem Sprechverkehr beschreiben',
  'erklären, warum 121,5 MHz und 243 MHz zusammengehören',
  'die Rolle der 406-MHz-Baken im Cospas-Sarsat-System einordnen',
  'Jedermannfunk von behördlichem Sicherheitsfunk abgrenzen'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'grundidee',
    title: 'Warum es feste Notfrequenzen gibt',
    eyebrow: 'Systematik',
    blocks: [
      {
        kind: 'p',
        text: 'Ein Notruf nützt nur, wenn jemand zuhört. Deshalb hat die internationale Gemeinschaft Frequenzen festgelegt, auf denen dauerhaft Empfangsbereitschaft besteht und auf denen nichts anderes gesendet werden darf. Diese Frequenzen sind in der Vollzugsordnung für den Funkdienst verankert und weltweit dieselben — ein Schiff kann seinen Notruf absetzen, ohne die nationalen Regeln des Küstenstaates zu kennen.'
      },
      {
        kind: 'p',
        text: 'Historisch begann das mit 500 kHz: Über Jahrzehnte war das die Not- und Anruffrequenz der Seefunktelegrafie, zweimal stündlich galten dreiminütige Funkstillezeiten, in denen alle Stationen nur zuhörten. Heute übernimmt digitale Technik die Wache — der digitale Selektivruf alarmiert gezielt und übermittelt Kennung, Notfallart und Position, der Sprechverkehr folgt erst danach.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keine amtliche Quelle, kein Betriebsdokument',
        text: 'Diese Seite dient dem Lernen und der Einordnung. Für den tatsächlichen Not- und Sicherheitsfunk gelten ausschließlich die amtlichen Veröffentlichungen. Missbräuchliche Aussendungen auf Notfrequenzen sind strafbar.'
      }
    ]
  },
  {
    id: 'see',
    title: 'Seefunk und GMDSS',
    blocks: [
      {
        kind: 'p',
        text: 'Das Weltweite Seenot- und Sicherheitsfunksystem GMDSS verbindet Funk, Satelliten und Ortung zu einem System, in dem jeder Notruf mit hoher Wahrscheinlichkeit eine Rettungsleitstelle erreicht. Die Ausrüstungspflicht richtet sich nach dem Seegebiet A1 bis A4 — also danach, wie weit ein Schiff von der Küste entfernt fährt.'
      },
      {
        kind: 'dl',
        items: [
          { term: 'Kanal 16 (156,8 MHz)', def: 'UKW-Not- und Anrufkanal für den Sprechverkehr in Küstennähe.' },
          { term: 'Kanal 70 (156,525 MHz)', def: 'Ausschließlich digitaler Selektivruf; hier läuft die Alarmierung, nicht das Gespräch.' },
          { term: '2182 kHz', def: 'Not- und Anruffrequenz im Grenzwellenbereich, Reichweite über die Bodenwelle.' },
          { term: '2187,5 kHz und die HF-Kanäle', def: 'Digitale Alarmierung auf Mittel- und Kurzwelle für Fahrt außerhalb der UKW-Reichweite.' },
          { term: 'NAVTEX 518 kHz', def: 'Automatischer Empfang von Warn- und Wettermeldungen als Fernschreiben.' },
          { term: 'AIS 161,975 / 162,025 MHz', def: 'Automatische Meldung von Kennung, Position und Kurs; auch für Seenotbaken genutzt.' }
        ]
      },
      {
        kind: 'p',
        text: 'Zum System gehört die MMSI, eine neunstellige Kennung jeder Seefunkstelle. Ein DSC-Notalarm überträgt sie zusammen mit der Position aus dem Navigationsempfänger — die Leitstelle weiß damit sofort, wer wo in Not ist, noch bevor ein Wort gesprochen wurde.'
      }
    ]
  },
  {
    id: 'luft',
    title: 'Flugfunk: 121,5, 243 und 406 MHz',
    blocks: [
      {
        kind: 'p',
        text: 'Der zivile Flugfunk arbeitet zwischen 118 und 137 MHz mit Amplitudenmodulation. Das ist kein Rückstand, sondern Absicht: Bei AM überlagern sich zwei gleichzeitig sendende Stationen hörbar, während FM durch den Mitnahmeeffekt die schwächere vollständig unterdrücken würde. Der Lotse merkt so, dass zwei Luftfahrzeuge gleichzeitig gesprochen haben.'
      },
      {
        kind: 'p',
        text: 'Die zivile Notfrequenz ist 121,5 MHz, die militärische 243 MHz — genau das Doppelte. Der Zusammenhang ist historisch praktisch: Eine Aussendung auf 121,5 MHz erzeugt eine Oberwelle bei 243 MHz, und viele ältere Baken sendeten bewusst auf beiden Frequenzen. Seit 2009 werden Notrufe der Satellitensysteme jedoch nur noch auf 406 MHz ausgewertet.'
      },
      {
        kind: 'p',
        text: 'Die 406-MHz-Baken des Systems Cospas-Sarsat senden eine kodierte Kennung mit hoher Leistung in kurzen Impulsen. Satelliten empfangen sie, bestimmen die Position über die Dopplerverschiebung oder übernehmen die von der Bake mitgesendete Satellitenposition und leiten die Meldung an die zuständige Rettungsleitstelle weiter. 121,5 MHz dient dabei nur noch als Peilfrequenz für die letzten Kilometer.'
      }
    ]
  },
  {
    id: 'land',
    title: 'Landfunk: BOS und Jedermannfunk',
    blocks: [
      {
        kind: 'p',
        text: 'Behörden und Organisationen mit Sicherheitsaufgaben nutzen in Deutschland ein bundesweites TETRA-Digitalfunknetz um 380 bis 395 MHz. Es kennt den Netzbetrieb über Basisstationen (TMO) und den Direktbetrieb zwischen Geräten (DMO), arbeitet verschlüsselt und ordnet die Teilnehmer in Rufgruppen. Die früheren analogen Bänder um 84 bis 87 MHz und 165 bis 174 MHz sind weitgehend abgelöst.'
      },
      {
        kind: 'p',
        text: 'Für alle nutzbar sind dagegen die Jedermannfunk-Anwendungen: PMR446 mit 0,5 W ERP im 446-MHz-Bereich, CB-Funk mit 40 Kanälen um 27 MHz und Freenet auf sechs Kanälen um 149 MHz. Sie brauchen keine Zuteilung im Einzelfall, unterliegen aber Grenzwerten für Leistung und Antenne — und sie sind ausdrücklich kein Ersatz für einen Notruf.'
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Notruf im Alltag',
        text: 'Im Inland ist der zuverlässigste Weg der Notruf 112 über das Mobilfunknetz. Funkwege sind dort sinnvoll, wo kein Netz verfügbar ist — auf See, in der Luft und im Katastrophenfall.'
      }
    ]
  }
];
