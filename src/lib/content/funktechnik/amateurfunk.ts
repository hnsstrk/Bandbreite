/**
 * Textbausteine der Seite „Amateurfunk“.
 *
 * Regulatorische Angaben beziehen sich auf das Amateurfunkgesetz (AFuG), die
 * Amateurfunkverordnung (AFuV) und den Bandplan der IARU-Region 1. Die Klassen-
 * und Leistungsangaben sind gegen AFuV Anlage 1 in der Fassung vom 24.06.2024
 * (BGBl. 2024 I Nr. 175) geprüft; verbliebene Unsicherheiten benennt der Text.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'den Amateurfunkdienst von anderen Funkdiensten abgrenzen und seinen Zweck benennen',
  'die deutschen Zeugnisklassen A, E und N mit ihren Frequenz- und Leistungsgrenzen unterscheiden',
  'einen Bandplan lesen und erklären, warum er keine Verordnung, aber trotzdem verbindlich gelebt wird',
  'die gebräuchlichen Betriebsarten von CW bis FT8 nach Bandbreite und Empfindlichkeit einordnen',
  'für ein Band abschätzen, zu welcher Tageszeit welche Reichweiten realistisch sind'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'dienst',
    title: 'Ein Funkdienst zum Selbermachen',
    eyebrow: 'Einordnung',
    blocks: [
      {
        kind: 'p',
        text: 'Der Amateurfunkdienst ist der einzige Funkdienst, dessen Zweck die eigene technische Ausbildung ist. Die Vollzugsordnung für den Funkdienst beschreibt ihn als Funkdienst zur eigenen Ausbildung, für technische Untersuchungen und zur Völkerverständigung, ausgeübt von Personen, die dazu ordnungsgemäß zugelassen sind und sich ausschließlich aus persönlichem Interesse und ohne wirtschaftliches Interesse damit befassen.'
      },
      {
        kind: 'p',
        text: 'Daraus folgen die Eigenheiten des Dienstes: Funkamateure dürfen ihre Geräte selbst bauen und verändern, sie senden mit Rufzeichen statt mit Gerätekennungen, sie dürfen keine Nachrichten für Dritte gegen Entgelt befördern und keine verschlüsselten Inhalte übertragen. In Deutschland regeln das Amateurfunkgesetz und die Amateurfunkverordnung die Einzelheiten; die Zulassung ist an eine bestandene Prüfung bei der Bundesnetzagentur gebunden.'
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Notfunk',
        text: 'Im Katastrophenfall darf der Amateurfunkdienst Nachrichten für die Gefahrenabwehr übertragen. Die IARU hat dafür Anruffrequenzen („Centre of Activity“) benannt, unter anderem 3760, 7110 und 14 300 kHz.'
      }
    ]
  },
  {
    id: 'klassen',
    title: 'Zeugnisklassen A, E und N',
    blocks: [
      {
        kind: 'p',
        text: 'Deutschland kennt drei Zeugnisklassen. Sie unterscheiden sich im Prüfungsumfang, in den zugänglichen Bändern und in der zulässigen Sendeleistung. Klasse N ist die Einstiegsklasse und wurde im Juni 2024 eingeführt; sie ersetzt keine der bestehenden Klassen, sondern ergänzt sie nach unten.'
      },
      {
        kind: 'table',
        caption: 'Deutsche Zeugnisklassen im Überblick',
        head: ['Klasse', 'Regelleistung', 'Zugang', 'Prüfung'],
        rows: [
          [
            'A',
            '750 W PEP bis 23 cm, 75 W PEP ab 13 cm',
            'alle dem Amateurfunkdienst zugewiesenen Bänder',
            'Technik, Betrieb, Vorschriften im vollen Umfang'
          ],
          [
            'E',
            '100 W PEP auf Kurzwelle, 75 W PEP auf 2 m bis 23 cm, 5 W PEP ab 13 cm',
            '160 m, 80 m, 15 m, 10 m sowie 2 m, 70 cm, 23 cm und die Bänder ab 13 cm',
            'reduzierter Technikteil'
          ],
          [
            'N',
            '10 W ERP auf 10 m, 6,1 W ERP (≙ 10 W EIRP) auf 2 m und 70 cm',
            '10 m, 2 m und 70 cm',
            'Einstiegsprüfung mit stark reduziertem Umfang'
          ]
        ]
      },
      {
        kind: 'p',
        text: 'Die Zuordnung von Bändern und Leistungen zu den Klassen steht Zeile für Zeile in Anlage 1 der Amateurfunkverordnung. Anders als oft angenommen sind 40 m, 20 m, 17 m, 12 m, 30 m, 60 m, 2200 m und 630 m allein der Klasse A vorbehalten; die Klasse E hat auf Kurzwelle nur 160 m, 80 m, 15 m und 10 m.'
      },
      {
        kind: 'p',
        text: 'Einzelne Bänder haben eigene Leistungsgrenzen, die die Klassengrenze unterschreiten: 2200 m und 630 m sind auf 1 W ERP begrenzt, das 60-m-Band auf 9,14 W ERP (das entspricht den 15 W EIRP der WRC-15-Zuweisung), das 30-m-Band auf 150 W PEP. Im 160-m-Band gelten drei gestaffelte Grenzen — 750 W PEP bis 1850 kHz, 75 W PEP bis 1890 kHz, darüber 10 W PEP, an Wochenenden jedoch durchgehend 750 W PEP. Der Bandplan-Visualisierer rechnet diese Sonderfälle mit.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Was offen bleibt',
        text: 'Zwei Punkte sind zeitkritisch statt gesichert: Der 6-m-Zugang der Klasse E beruhte auf einer Duldungsregelung, die zum 31.12.2025 auslief und nicht verlängert wurde. Für das 4-m-Band (70,150 bis 70,210 MHz) gab es zuletzt eine bis 31.12.2025 befristete Duldung für die Klasse A; eine Nachfolgeregelung war zum Stand dieser Prüfung nicht veröffentlicht. Beide Angaben sind vor jeder praktischen Nutzung im Amtsblatt der Bundesnetzagentur zu prüfen.'
      }
    ]
  },
  {
    id: 'rufzeichen',
    title: 'Rufzeichen und Locator',
    blocks: [
      {
        kind: 'p',
        text: 'Ein Rufzeichen besteht aus einem Landeskenner, einer Ziffer und einem Suffix. Deutschland verwendet die Präfixe DA bis DR; die Ziffer trennt Rufzeichenblöcke, das Suffix identifiziert die Station. Zusätze kennzeichnen besondere Betriebszustände, etwa „/p“ für portablen Betrieb oder „/mm“ für Betrieb an Bord eines Schiffes.'
      },
      {
        kind: 'p',
        text: 'Standorte werden im Maidenhead-Locator angegeben: zwei Buchstaben für das Feld, zwei Ziffern für das Quadrat, zwei Buchstaben für das Unterquadrat. Ein Kleinfeld ist etwa 2,5 Bogenminuten hoch und 5 Bogenminuten breit — in Mitteleuropa rund 4,6 mal 5,6 Kilometer. Aus zwei Locatoren lässt sich die Entfernung berechnen, was für Wettbewerbe und Diplome die Grundlage der Punktwertung ist.'
      }
    ]
  },
  {
    id: 'bandplan-prinzip',
    title: 'Wie ein Bandplan funktioniert',
    blocks: [
      {
        kind: 'p',
        text: 'Die Amateurfunkverordnung nennt nur die Bandgrenzen, die höchstzulässige Leistung und die zulässigen Übertragungsarten. Wo innerhalb eines Bandes Telegrafie, Digimodes oder Sprechfunk stattfinden, regelt der Bandplan der IARU. Er ist eine Empfehlung der Funkamateure an sich selbst und rechtlich nicht bindend — praktisch hält sich fast jeder daran, weil sonst schmalbandige Betriebsarten von breitbandigen zugedeckt würden.'
      },
      {
        kind: 'ul',
        items: [
          'Am unteren Bandende liegt Telegrafie: sie braucht kaum Bandbreite und kommt mit dem schlechtesten Signal-Rausch-Verhältnis aus.',
          'Darüber folgen schmalbandige Digimodes wie PSK31 und FT8 mit wenigen hundert Hertz Bandbreite.',
          'Es schließen sich Baken- und Sonderbereiche an, die von anderem Verkehr frei bleiben.',
          'Im oberen Bandteil liegt Einseitenbandtelefonie mit etwa 2,4 bis 2,7 kHz, auf VHF und UHF zusätzlich FM und Relaisbetrieb.'
        ]
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Bandwacht statt Behörde',
        text: 'Über die Einhaltung wacht die Gemeinschaft selbst. Die Bandwacht dokumentiert außerdem fremde Aussendungen in Amateurfunkbändern und meldet sie den Verwaltungen.'
      }
    ]
  },
  {
    id: 'betriebsarten',
    title: 'Betriebsarten und ihre Bandbreiten',
    blocks: [
      {
        kind: 'table',
        caption: 'Gebräuchliche Betriebsarten mit typischer Bandbreite',
        head: ['Betriebsart', 'Bandbreite', 'Einordnung'],
        rows: [
          [
            'CW (Telegrafie)',
            'etwa 100–500 Hz',
            'Kommt mit sehr wenig Leistung aus, wird direkt vom Menschen dekodiert.'
          ],
          [
            'FT8',
            'etwa 50 Hz je Signal',
            'Feste Zeitschlitze von 15 Sekunden, arbeitet noch weit unter der Rauschgrenze.'
          ],
          ['PSK31', 'etwa 60 Hz', 'Tastaturbetrieb in Echtzeit, phasenumgetastet.'],
          ['RTTY', 'etwa 250 Hz', 'Älteres Fernschreibverfahren mit Frequenzumtastung.'],
          [
            'SSB',
            'etwa 2,4–2,7 kHz',
            'Sprechfunk mit unterdrücktem Träger; unterhalb 10 MHz unteres, darüber oberes Seitenband.'
          ],
          [
            'FM',
            'etwa 12,5–16 kHz',
            'Rauschfreier Nahbereichsfunk, Standard im Relaisbetrieb auf 2 m und 70 cm.'
          ]
        ]
      },
      {
        kind: 'p',
        text: 'Die Bandbreite bestimmt, wie viel Rauschleistung der Empfänger aufnimmt: Halbiert man die Bandbreite, sinkt die Rauschleistung um 3 dB. Das erklärt, warum Telegrafie und moderne Digimodes Verbindungen ermöglichen, bei denen Sprechfunk längst versagt.'
      },
      {
        kind: 'formula',
        formula: 'P_Rausch = k · T · B',
        alt: 'Rauschleistung gleich Boltzmann-Konstante mal Temperatur mal Bandbreite',
        label: 'Thermisches Rauschen im Empfänger',
        variables: [
          { symbol: 'k', meaning: 'Boltzmann-Konstante', unit: 'J/K' },
          { symbol: 'T', meaning: 'Rauschtemperatur', unit: 'K' },
          { symbol: 'B', meaning: 'Rauschbandbreite', unit: 'Hz' }
        ]
      },
      {
        kind: 'p',
        text: 'Im Maßstab nebeneinandergelegt wird der Unterschied greifbar: Neben einem FM-Kanal ist eine FT8-Aussendung ein Strich — und genau dieser Faktor steht am Ende als Störabstand zur Verfügung.'
      },
      { kind: 'widget', id: 'mode-bandwidth' }
    ]
  },
  {
    id: 'welches-band',
    title: 'Welches Band ist gerade offen?',
    description:
      'Faustregeln statt Vorhersage — maßgeblich sind Sonnenstand, Jahreszeit und Sonnenaktivität.',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Unter 5 MHz sind Nachtbänder: tagsüber dämpft die D-Schicht die Raumwelle stark, nachts verschwindet sie und 160 m sowie 80 m öffnen über tausende Kilometer.',
          '40 m ist das Allwetterband: tagsüber sichere Verbindungen bis einige hundert Kilometer, nachts weltweit.',
          '20 m ist das klassische Tagband für Fernverbindungen und oft auch nach Sonnenuntergang noch nutzbar.',
          '15 m, 12 m und 10 m leben von der Sonnenaktivität: im Maximum des elfjährigen Zyklus täglich weltweit, im Minimum wochenlang tot.',
          '6 m und 2 m öffnen im Frühsommer sporadisch über Es-Wolken; auf UHF entscheidet die Sichtverbindung, Inversionswetterlagen bringen Überreichweiten.'
        ]
      },
      {
        kind: 'p',
        text: 'Hinter den Faustregeln steht eine einzige Kurve: die höchste nutzbare Frequenz im Tagesverlauf. Sie deckelt die Bänder von oben, während die D-Schicht sie am Tag von unten abschneidet — dazwischen liegt das Fenster.'
      },
      { kind: 'widget', id: 'amateur-band-openings' },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Erst hören, dann senden',
        text: 'Ob ein Band offen ist, verrät ein Blick auf die Baken und die automatisch gemeldeten Empfangsberichte der Digimodes. Wer ein leises Band für tot hält, hat oft nur die falsche Richtung oder die falsche Tageszeit erwischt.'
      }
    ]
  }
];
