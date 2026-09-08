/**
 * Textbausteine der Seite „Funkdienste & Frequenzplan“.
 *
 * Alle Texte sind eigenständig formuliert. Regulatorische Angaben sind
 * Tatsachenangaben aus der VO Funk, dem TKG und dem Frequenzplan der
 * Bundesnetzagentur; die Quellenlage steht auf `/service/quellen/`.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'erklären, was die ITU unter einem Funkdienst versteht und wie er sich von einer Anwendung unterscheidet',
  'den Unterschied zwischen primärer und sekundärer Zuweisung benennen und die Folgen für den Betrieb ableiten',
  'die drei ITU-Regionen einordnen und erklären, warum dieselbe Frequenz weltweit unterschiedlich genutzt wird',
  'den Weg von der Vollzugsordnung für den Funkdienst bis zur einzelnen Frequenzzuteilung nachzeichnen',
  'zu einer beliebigen Frequenz nachschlagen, welche Dienste dort zugewiesen sind'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'begriff',
    title: 'Was ein Funkdienst ist',
    eyebrow: 'Grundbegriffe',
    blocks: [
      {
        kind: 'p',
        text: 'Funkfrequenzen sind eine endliche, weltweit gemeinsam genutzte Ressource. Damit sich Aussendungen nicht gegenseitig unbrauchbar machen, ordnet die Internationale Fernmeldeunion (ITU) jeden Frequenzbereich einem oder mehreren Funkdiensten zu. Ein Funkdienst ist dabei keine Technik und kein Gerät, sondern ein Nutzungszweck: die Übertragung von Nachrichten zwischen definierten Arten von Funkstellen zu einem definierten Zweck.'
      },
      {
        kind: 'p',
        text: 'Die Vollzugsordnung für den Funkdienst (VO Funk, englisch Radio Regulations) definiert diese Dienste in Artikel 1. Der bewegliche Landfunkdienst etwa umfasst den Funkverkehr zwischen ortsfesten Basisstationen und beweglichen Landfunkstellen — ob darin GSM, LTE, 5G oder ein Betriebsfunknetz betrieben wird, ist aus Sicht der Zuweisung zweitrangig. Diese Trennung ist der Grund, warum Frequenzzuweisungen Jahrzehnte überdauern, während die Technik darin mehrfach ausgetauscht wird.'
      },
      {
        kind: 'dl',
        items: [
          {
            term: 'Funkdienst',
            def: 'Nutzungszweck nach VO Funk Artikel 1, zum Beispiel Rundfunkdienst, Amateurfunkdienst oder Funknavigationsdienst.'
          },
          {
            term: 'Anwendung',
            def: 'Konkrete Nutzung innerhalb eines Dienstes, zum Beispiel DAB+ innerhalb des Rundfunkdienstes.'
          },
          {
            term: 'Funkanwendung im Frequenzplan',
            def: 'Die im nationalen Plan benannte Nutzung eines Bereichs samt Nutzungsbestimmungen.'
          },
          {
            term: 'Funkstelle',
            def: 'Ein oder mehrere Sender oder Empfänger an einem Ort, die zusammen einen Funkdienst betreiben.'
          }
        ]
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Satellitendienste zählen getrennt',
        text: 'Zu vielen terrestrischen Diensten gibt es einen eigenständigen Satellitendienst, etwa den Amateurfunkdienst und den Amateurfunkdienst über Satelliten. Beide haben eigene Zuweisungen, die sich häufig nur auf Teilbereiche des terrestrischen Bandes erstrecken.'
      }
    ]
  },
  {
    id: 'regionen',
    title: 'Die drei ITU-Regionen',
    blocks: [
      {
        kind: 'p',
        text: 'Die Zuweisungstabelle in Artikel 5 der VO Funk ist dreispaltig, weil die Welt in drei Regionen geteilt ist. Historisch gewachsene Nutzungen, unterschiedliche Ausbreitungsbedingungen und regionale Interessen führten dazu, dass sich die Tabellen nicht vereinheitlichen ließen. Deutschland liegt in Region 1.'
      },
      {
        kind: 'table',
        caption: 'ITU-Regionen und Beispiele für abweichende Nutzung',
        head: ['Region', 'Gebiet', 'Beispiel für eine Abweichung'],
        rows: [
          [
            'Region 1',
            'Europa, Afrika, Naher Osten, Nordasien',
            'Mittelwellenrundfunk 526,5–1606,5 kHz im 9-kHz-Raster'
          ],
          [
            'Region 2',
            'Nord- und Südamerika, Grönland',
            'Mittelwelle bis 1705 kHz im 10-kHz-Raster'
          ],
          [
            'Region 3',
            'Süd- und Ostasien, Australien, Ozeanien',
            'Teilweise abweichende Kurzwellen-Rundfunkbänder'
          ]
        ]
      },
      {
        kind: 'p',
        text: 'Auch innerhalb einer Region gibt es Unterschiede: Fußnoten der Zuweisungstabelle nennen einzelne Länder, für die abweichende Regeln gelten. Das 6-m-Amateurfunkband ist ein bekanntes Beispiel — in Region 1 stehen in Deutschland 50 bis 52 MHz zur Verfügung, in Region 2 reicht das Band bis 54 MHz.'
      }
    ]
  },
  {
    id: 'primaer-sekundaer',
    title: 'Primär, sekundär und was daraus folgt',
    blocks: [
      {
        kind: 'p',
        text: 'Ein Frequenzbereich kann mehreren Diensten gleichzeitig zugewiesen sein. Damit die Rangfolge klar ist, unterscheidet die VO Funk zwischen primärer und sekundärer Zuweisung. In der Zuweisungstabelle stehen primäre Dienste in Großbuchstaben, sekundäre in Kleinbuchstaben.'
      },
      {
        kind: 'ul',
        items: [
          'Ein sekundärer Dienst darf einen primären Dienst nicht stören — weder den bestehenden noch einen später hinzukommenden.',
          'Ein sekundärer Dienst kann keinen Schutz vor Störungen durch einen primären Dienst verlangen.',
          'Untereinander sind sekundäre Dienste gleichrangig; es gilt dieselbe Störfreiheitspflicht.',
          'Zwei primäre Dienste im selben Bereich werden durch Nutzungsbestimmungen, Koordinierungsverfahren oder geografische Trennung entflochten.'
        ]
      },
      {
        kind: 'p',
        text: 'Für die Praxis heißt das: Wer auf einem sekundär zugewiesenen Band arbeitet, muss mit Störungen leben und im Zweifel den Betrieb einstellen. Der Amateurfunkdienst kennt beide Fälle — 144 bis 146 MHz sind primär zugewiesen, das 23-cm-Band dagegen sekundär gegenüber der Satellitennavigation.'
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Woran man den Status erkennt',
        text: 'In der Leiste unten sind sekundäre Zuweisungen blasser dargestellt als primäre. In der Detailtafel steht der Status je Teilbereich ausgeschrieben.'
      }
    ]
  },
  {
    id: 'vom-vertrag-zur-zuteilung',
    title: 'Vom Vertrag zur einzelnen Zuteilung',
    description: 'Vier Ebenen liegen zwischen dem völkerrechtlichen Vertrag und der Frequenz im Gerät.',
    blocks: [
      {
        kind: 'ol',
        items: [
          'Allokation (allocation): Die VO Funk weist einen Frequenzbereich einem oder mehreren Funkdiensten zu. Sie ist ein völkerrechtlicher Vertrag und wird auf den Weltfunkkonferenzen (WRC) fortgeschrieben.',
          'Harmonisierung: In Europa konkretisieren CEPT und ECC die Nutzung, die EU-Kommission kann Entscheidungen für verbindlich erklären. So entstehen europaweit einheitliche Bänder, etwa für Mobilfunk oder PMR446.',
          'Nationaler Frequenzplan: Die Bundesnetzagentur legt nach § 90 TKG fest, welche Funkanwendungen in Deutschland in welchem Bereich zulässig sind und welche Nutzungsbestimmungen gelten.',
          'Frequenzzuteilung: Erst sie erlaubt einer konkreten Person oder Firma den Betrieb — entweder als Allgemeinzuteilung für alle oder als Einzelzuteilung mit Standort, Leistung und Kanal.'
        ]
      },
      {
        kind: 'table',
        caption: 'Allgemein- und Einzelzuteilung im Vergleich',
        head: ['Merkmal', 'Allgemeinzuteilung', 'Einzelzuteilung'],
        rows: [
          ['Antragsteller', 'nicht erforderlich', 'benannte Person oder Firma'],
          ['Beispiele', 'PMR446, CB-Funk, WLAN, Freenet', 'Rundfunksender, Mobilfunknetz, Richtfunkstrecke'],
          ['Schutz vor Störungen', 'kein Anspruch', 'im zugeteilten Umfang geschützt'],
          ['Bindung an Gerätetechnik', 'Grenzwerte für Leistung und Betriebsart', 'Standort, Frequenz, Leistung, Antenne']
        ]
      },
      {
        kind: 'p',
        text: 'Der Amateurfunkdienst ist ein Sonderfall: Die Zuteilung ergibt sich aus dem Amateurfunkgesetz und der Amateurfunkverordnung und ist an das Rufzeichen und die Zeugnisklasse geknüpft, nicht an einen Standort.'
      }
    ]
  },
  {
    id: 'frequenzplan',
    title: 'Der deutsche Frequenzplan',
    blocks: [
      {
        kind: 'p',
        text: 'Der Frequenzplan der Bundesnetzagentur bildet die Zuweisungen der VO Funk auf deutsche Verhältnisse ab. Er besteht aus Frequenzteilplänen, die jeweils einen Bereich beschreiben: welche Funkdienste zugewiesen sind, welche Funkanwendungen darin zulässig sind und welche Nutzungsbestimmungen zu beachten sind.'
      },
      {
        kind: 'ul',
        items: [
          'Frequenzbereich und zugewiesene Funkdienste mit Status (primär oder sekundär)',
          'Zugelassene Funkanwendungen, etwa „Mobilfunk“, „Rundfunk“ oder „Funkanlagen geringer Leistung“',
          'Nutzungsbestimmungen mit Grenzwerten für Sendeleistung, Bandbreite, Tastverhältnis oder Antennenhöhe',
          'Verweise auf internationale Beschlüsse und auf Verwaltungsvorschriften'
        ]
      },
      {
        kind: 'p',
        text: 'Weil der Plan fortlaufend geändert wird — nach jeder Weltfunkkonferenz, nach EU-Entscheidungen und nach nationalen Vergabeverfahren — ist der Stand entscheidend. Die Daten dieser Anwendung geben die Systematik wieder, ersetzen aber keine Recherche im amtlichen Plan.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keine amtliche Quelle',
        text: 'Diese Seite ist Lehrmaterial. Für Antragstellung, Betrieb und rechtliche Bewertung gelten ausschließlich die Veröffentlichungen der Bundesnetzagentur, die Vollzugsordnung für den Funkdienst und die einschlägigen Verordnungen.'
      }
    ]
  },
  {
    id: 'lesen',
    title: 'Eine Zuweisung lesen — Beispiel 145 MHz',
    blocks: [
      {
        kind: 'p',
        text: 'Der Bereich 144 bis 146 MHz ist in Region 1 dem Amateurfunkdienst und dem Amateurfunkdienst über Satelliten primär zugewiesen. Damit ist der Bereich international geschützt; andere Nutzungen sind nur zulässig, wenn eine Fußnote sie ausdrücklich erlaubt. In Deutschland öffnet die Amateurfunkverordnung den Bereich für alle Zeugnisklassen, der IARU-Bandplan ordnet die Betriebsarten innerhalb des Bandes.'
      },
      {
        kind: 'p',
        text: 'Direkt darunter, bei 137 bis 138 MHz, liegen der Wetter- und Erderkundungssatellitendienst sowie der mobile Satellitendienst; darüber, ab 146 MHz, beginnt in Region 1 wieder der bewegliche Landfunkdienst. Die Leiste unten macht solche Nachbarschaften sichtbar: der Frequenzzeiger zeigt, welche Dienste eine Frequenz belegen.'
      }
    ]
  }
];
