/**
 * Textbausteine der Seite „Rundfunk“.
 *
 * Grundlage sind die Genfer Wellenpläne GE75, GE84 und GE06, die VO Funk sowie
 * die ETSI-Normen für DAB und DVB-T2.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'die Rundfunkbereiche von Langwelle bis UHF nach Ausbreitung und Reichweite einordnen',
  'erklären, warum Mittelwelle nachts weiter reicht als am Tag',
  'das UKW-Signal in Mono, Stereo-Differenzsignal, Pilotton und RDS zerlegen',
  'DAB-Blöcke und DVB-T2-Kanäle in Frequenzen umrechnen und umgekehrt',
  'den Nutzen eines Gleichwellennetzes gegenüber Einzelfrequenzen begründen'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'am-bereiche',
    title: 'Langwelle, Mittelwelle, Kurzwelle',
    eyebrow: 'Amplitudenmodulierter Rundfunk',
    blocks: [
      {
        kind: 'p',
        text: 'Der amplitudenmodulierte Rundfunk nutzt drei Bereiche mit sehr unterschiedlichem Verhalten. Auf Langwelle folgt die Bodenwelle der Erdkrümmung und trägt bei ausreichender Sendeleistung mehrere hundert Kilometer weit, nahezu unabhängig von der Tageszeit. Auf Mittelwelle reicht die Bodenwelle tagsüber etwa hundert Kilometer; nachts verschwindet die absorbierende D-Schicht der Ionosphäre, die Raumwelle kehrt zurück und bringt Fernempfang — zusammen mit Schwund und gegenseitigen Störungen.'
      },
      {
        kind: 'p',
        text: 'Die Kurzwelle lebt vollständig von der Raumwelle. Zwischen 2,3 und 26,1 MHz liegen die Rundfunkbänder, die traditionell nach ihrer Wellenlänge benannt sind. Welches Band trägt, hängt von Tageszeit, Jahreszeit und Sonnenaktivität ab; deshalb senden Auslandsdienste dieselbe Sendung oft parallel in mehreren Bändern.'
      },
      {
        kind: 'table',
        caption: 'Kanalraster und Reichweite der AM-Bereiche in Region 1',
        head: ['Bereich', 'Frequenzen', 'Raster', 'Typische Reichweite'],
        rows: [
          ['Langwelle', '148,5–283,5 kHz', '9 kHz', 'einige hundert Kilometer über die Bodenwelle'],
          ['Mittelwelle', '526,5–1606,5 kHz', '9 kHz', 'etwa 100 km am Tag, nachts über 1000 km'],
          ['Kurzwelle', '2,3–26,1 MHz', '5 kHz', 'interkontinental über die Ionosphäre']
        ]
      },
      {
        kind: 'p',
        text: 'In Deutschland sind Lang- und Mittelwellensender abgeschaltet. Ausschlaggebend waren der hohe Energiebedarf großer Antennenanlagen, die geringe Tonqualität und der Rückgang der Hörerzahlen gegenüber UKW, DAB+ und Internetradio.'
      }
    ]
  },
  {
    id: 'ukw',
    title: 'UKW: Frequenzmodulation und Multiplex',
    blocks: [
      {
        kind: 'p',
        text: 'UKW-Hörfunk arbeitet zwischen 87,5 und 108 MHz mit Frequenzmodulation. Der Frequenzhub beträgt höchstens 75 kHz. Frequenzmodulation ist gegenüber Amplitudenstörungen unempfindlich, weil der Empfänger die Amplitude begrenzt und nur die Frequenzabweichung auswertet — das erklärt den deutlich saubereren Klang gegenüber AM.'
      },
      {
        kind: 'ol',
        items: [
          'Bis 15 kHz liegt das Summensignal aus linkem und rechtem Kanal — es allein genügt für Monoempfang.',
          'Bei 19 kHz steht der Pilotton, an dem der Empfänger erkennt, dass ein Stereosignal vorliegt.',
          'Zwischen 23 und 53 kHz liegt das Differenzsignal, aufmoduliert auf einen unterdrückten Hilfsträger bei 38 kHz.',
          'Bei 57 kHz — dem dritten Vielfachen des Pilottons — folgt RDS mit Sendername, Verkehrsfunkkennung und alternativen Frequenzen.'
        ]
      },
      {
        kind: 'formula',
        formula: 'B ≈ 2 · (Δf + f_max)',
        alt: 'B ungefähr gleich zwei mal Klammer auf Delta f plus f max Klammer zu',
        label: 'Carson-Regel für die belegte Bandbreite',
        variables: [
          { symbol: 'Δf', meaning: 'Frequenzhub', unit: 'Hz' },
          { symbol: 'f_max', meaning: 'höchste Modulationsfrequenz', unit: 'Hz' },
          { symbol: 'B', meaning: 'belegte Bandbreite', unit: 'Hz' }
        ]
      },
      {
        kind: 'p',
        text: 'Mit 75 kHz Hub und 15 kHz Modulationsfrequenz ergeben sich rund 180 kHz belegte Bandbreite. Das Kanalraster beträgt zwar nur 100 kHz, doch am selben Standort halten Sender mehrere Rasterplätze Abstand, damit sich die Spektren nicht überlappen.'
      }
    ]
  },
  {
    id: 'dab',
    title: 'DAB+ und das Gleichwellennetz',
    blocks: [
      {
        kind: 'p',
        text: 'DAB+ überträgt ein Ensemble aus mehreren Programmen gemeinsam in einem Block von 1,536 MHz Breite. Innerhalb des Blocks arbeitet das System mit COFDM: hunderte Unterträger tragen jeweils einen kleinen Teil des Datenstroms, eine Fehlerschutzkodierung verteilt die Bits über Zeit und Frequenz. Fällt ein Teil des Spektrums durch Mehrwegeauslöschung aus, rekonstruiert der Dekoder den Rest.'
      },
      {
        kind: 'p',
        text: 'Der eigentliche Gewinn liegt im Gleichwellennetz: Alle Sender einer Region strahlen denselben Block mit demselben Inhalt zeitsynchron ab. Solange die Laufzeitunterschiede innerhalb des Schutzintervalls bleiben, addieren sich die Signale konstruktiv, statt sich zu stören. Ein analoger UKW-Sender bräuchte dagegen für jeden Standort eine eigene Frequenz.'
      },
      {
        kind: 'dl',
        items: [
          {
            term: 'Ensemble',
            def: 'Alle Programme und Datendienste eines Blocks, gemeinsam moduliert.'
          },
          {
            term: 'Block',
            def: 'Kanalraster in Band III, je 1,536 MHz breit. Deutschland nutzt 5A bis 12D zwischen 174 und 230 MHz; die Zwischenblöcke 10N, 11N und 12N sowie der Kanal 13 mit 13A bis 13F bis 240 MHz sind hier nicht belegt.'
          },
          {
            term: 'Schutzintervall',
            def: 'Pause zwischen den Symbolen, in der Echos abklingen dürfen.'
          },
          {
            term: 'DAB+',
            def: 'Erweiterung mit dem effizienteren Audiocodec HE-AAC v2 und stärkerem Fehlerschutz.'
          }
        ]
      }
    ]
  },
  {
    id: 'dvbt2',
    title: 'DVB-T2 und Satellitenfernsehen',
    blocks: [
      {
        kind: 'p',
        text: 'Das terrestrische Fernsehen belegt in Deutschland die UHF-Kanäle 21 bis 48, jeder 8 MHz breit. Die Kanalmitte folgt einer einfachen Regel: 306 MHz plus 8 MHz mal Kanalnummer. Nach der Umwidmung des Bereichs oberhalb 694 MHz für den Mobilfunk endet der Fernsehbereich mit Kanal 48. Auch DVB-T2 nutzt COFDM und Gleichwellennetze; die höhere Effizienz gegenüber DVB-T stammt vor allem aus der Fehlerschutzkodierung mit LDPC.'
      },
      {
        kind: 'p',
        text: 'Satellitenfernsehen arbeitet im Ku-Band. Der Downlink zwischen 10,7 und 12,75 GHz wird direkt an der Antenne durch den LNB auf die Satelliten-Zwischenfrequenz zwischen 950 und 2150 MHz umgesetzt, weil nur diese sich über gewöhnliches Koaxialkabel führen lässt. Zwei Oszillatorfrequenzen — 9,75 und 10,6 GHz — teilen den Bereich in ein unteres und ein oberes Band; umgeschaltet wird mit einem 22-kHz-Ton auf der Antennenleitung.'
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Warum Umsetzen statt direkt Verkabeln',
        text: 'Bei 12 GHz dämpft ein handelsübliches Koaxialkabel etwa eine Größenordnung stärker als bei 1 GHz. Die Umsetzung direkt am Speisepunkt hält die Verluste klein und ermöglicht lange Leitungen im Haus.'
      }
    ]
  },
  {
    id: 'wandel',
    title: 'Warum sich die Verbreitungswege ändern',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Energie: Ein Mittelwellensender mit hunderten Kilowatt versorgt weniger Hörer als ein Bündel UKW- oder DAB-Sender mit einem Bruchteil der Leistung.',
          'Effizienz: In einem DAB-Block liegen mehr als ein Dutzend Programme; auf einer UKW-Frequenz nur eines.',
          'Frequenzdruck: Die Bereiche 700 und 800 MHz wurden vom Fernsehen an den Mobilfunk übergeben, weil sich damit Fläche günstig versorgen lässt.',
          'Nutzung: Zeitversetztes Hören, Podcasts und Streaming verlagern einen Teil der Nutzung ins Netz — der terrestrische Rundfunk bleibt aber die einzige Verbreitung ohne Rückkanal und ohne Netzabhängigkeit.'
        ]
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Rundfunk im Krisenfall',
        text: 'Weil eine Rundfunkaussendung beliebig viele Empfänger gleichzeitig erreicht und keine Anmeldung braucht, bleibt sie für Warnmeldungen unersetzlich. DAB+ überträgt dafür zusätzlich einen Notfallwarndienst.'
      }
    ]
  }
];
