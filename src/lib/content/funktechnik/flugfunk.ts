/**
 * Textbausteine der Seite „Flugfunk und Flugnavigation".
 *
 * Grundlage sind ICAO Annex 10 (Bände I, III, IV und V), die Vollzugsordnung
 * für den Funkdienst (Artikel 5 und Appendix 27) sowie die Durchführungs-
 * verordnung (EU) Nr. 1079/2012 zum 8,33-kHz-Kanalabstand. Zahlenwerte stehen
 * als Daten in `data/aviationBands.ts`.
 *
 * Die Seite ist eine Lernhilfe, kein Betriebsdokument.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'begründen, warum der Flugfunk amplitudenmoduliert arbeitet und nicht frequenzmoduliert',
  'eine 8,33-kHz-Kanalbezeichnung in die tatsächlich gesendete Frequenz umrechnen',
  'die Funknavigationsanlagen NDB, VOR, ILS und DME nach Messgröße und Frequenzbereich unterscheiden',
  'den Unterschied zwischen Primärradar, Sekundärradar und ADS-B erklären',
  'einordnen, welche Funkwege ein Verkehrsflugzeug über dem Nordatlantik nutzt'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'sprechfunk',
    title: 'Sprechfunk zwischen 118 und 137 MHz',
    eyebrow: 'Grundlagen',
    description: 'Warum ausgerechnet Amplitudenmodulation — und warum das kein Rückstand ist.',
    blocks: [
      {
        kind: 'p',
        text: 'Der zivile Flugfunk arbeitet zwischen 118 und 137 MHz mit Amplitudenmodulation und Doppelseitenband. Das wirkt altertümlich, ist aber eine bewusste Entscheidung. Sprechen zwei Stationen gleichzeitig, überlagern sich bei Amplitudenmodulation beide Signale hörbar — es entsteht ein charakteristisches Heulen, und der Lotse weiß, dass er nachfragen muss. Bei Frequenzmodulation würde der Mitnahmeeffekt dazu führen, dass der stärkere Sender den schwächeren vollständig unterdrückt; die zweite Freigabe wäre spurlos verschwunden.'
      },
      {
        kind: 'p',
        text: 'Ein zweiter Grund ist die Empfangsstruktur: Alle Luftfahrzeuge auf einer Frequenz hören einander mit. Diese „Party Line" ist ein wesentlicher Teil des Lagebildes im Cockpit — man weiß, wer sonst noch im Sektor ist und was ihm aufgetragen wurde. Ein selektives Verfahren würde diesen Nebeneffekt zerstören.'
      },
      {
        kind: 'p',
        text: 'Der Bereich ist nach Aufgaben gegliedert: Um die Notfrequenz 121,500 MHz bleibt ein Schutzabstand frei, im unteren Teil des Bandes liegen überwiegend die Frequenzen der Flugverkehrskontrolle und der Flugplatzdienste, im oberen die Betriebsfrequenzen der Luftfahrtunternehmen und die Datenverbindungen. Die militärische Notfrequenz 243,000 MHz ist genau die doppelte zivile — historisch praktisch, weil eine Aussendung auf 121,5 MHz eine Oberwelle bei 243 MHz erzeugt.'
      }
    ]
  },
  {
    id: 'kanalabstand',
    title: 'Vom 25-kHz- zum 8,33-kHz-Raster',
    blocks: [
      {
        kind: 'p',
        text: 'Der europäische Luftraum ging die Frequenzen aus. Statt das Band zu erweitern — die Nachbarbereiche sind belegt — wurde der Kanalabstand gedrittelt: Aus jedem 25-kHz-Rasterplatz wurden drei Kanäle im Abstand von exakt 8⅓ kHz. Rechnerisch verdreifacht das die Kanalzahl von 760 auf 2280.'
      },
      {
        kind: 'p',
        text: 'Damit entstand ein Problem, das bis heute für Verwirrung sorgt: Die neuen Frequenzen sind krumm. 118,008 333 MHz lässt sich weder im Sprechfunk sauber ansagen noch auf ein Fünfstellendisplay bringen. ICAO hat deshalb Bezeichnung und Frequenz getrennt. Was im Cockpit eingestellt und über Funk genannt wird, ist eine Kanalnummer — sie sieht wie eine Frequenz aus, ist aber keine.'
      },
      {
        kind: 'table',
        caption: 'Kanalbezeichnung und tatsächliche Frequenz im ersten 25-kHz-Rasterplatz',
        head: ['Bezeichnung', 'Tatsächliche Frequenz', 'Kanalabstand'],
        rows: [
          ['118.000', '118,000 000 MHz', '25 kHz'],
          ['118.005', '118,000 000 MHz', '8,33 kHz'],
          ['118.010', '118,008 333 MHz', '8,33 kHz'],
          ['118.015', '118,016 667 MHz', '8,33 kHz'],
          ['118.030', '118,025 000 MHz', '8,33 kHz']
        ]
      },
      {
        kind: 'p',
        text: 'Die Systematik ist einfach, sobald man sie einmal gesehen hat: Innerhalb jedes 25-kHz-Platzes tragen die drei Kanäle die Endungen 05, 10 und 15 — dann folgt der nächste Platz mit 30, 35, 40, danach 55, 60, 65 und schließlich 80, 85, 90. Die Endungen 20, 45, 70 und 95 sind nicht vergeben; sie wären im Sprechfunk zu leicht mit den benachbarten zu verwechseln. Endungen auf 00, 25, 50 und 75 bezeichnen weiterhin klassische 25-kHz-Kanäle.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Bezeichnung ist nicht Frequenz',
        text: 'Wer eine 8,33-kHz-Bezeichnung in ein älteres 25-kHz-Gerät eingibt, landet im Zweifel auf der falschen Frequenz. Deshalb dürfen Luftfahrzeuge ohne 8,33-kHz-Ausrüstung in weiten Teilen des europäischen Luftraums nicht mehr fliegen.',
        source: 'Durchführungsverordnung (EU) Nr. 1079/2012; ICAO Annex 10 Vol. V'
      }
    ]
  },
  {
    id: 'notfrequenzen',
    title: 'Not- und Peilfrequenzen',
    blocks: [
      {
        kind: 'dl',
        items: [
          {
            term: '121,500 MHz',
            def: 'Zivile Notfrequenz, weltweit einheitlich. Sie wird von Flugsicherungsstellen und vielen Luftfahrzeugen mitgehört und dient auch der Verständigung, wenn die zugewiesene Frequenz verloren geht.'
          },
          {
            term: '243,000 MHz',
            def: 'Militärische Notfrequenz im UHF-Bereich — genau das Doppelte der zivilen.'
          },
          {
            term: '406,0 bis 406,1 MHz',
            def: 'Notsender ELT im System Cospas-Sarsat. Die Aussendung trägt eine weltweit eindeutige Kennung und bei modernen Geräten die eigene Position.'
          },
          {
            term: '75 MHz',
            def: 'Markierungsfunkfeuer. Alle senden auf derselben Frequenz und strahlen senkrecht nach oben; unterschieden werden sie über den Modulationston.'
          }
        ]
      },
      {
        kind: 'p',
        text: 'Seit 2009 werten die Satelliten des Systems Cospas-Sarsat nur noch die 406-MHz-Aussendungen aus. Der frühere Empfang von 121,5 MHz wurde eingestellt, weil das analoge Signal keine Kennung trug: Neun von zehn Alarmen waren Fehlauslösungen, und ohne Kennung ließ sich das nicht vorab klären. Auf 121,5 MHz sendet die Bake heute nur noch ein schwaches Peilsignal für die letzten Kilometer.'
      }
    ]
  },
  {
    id: 'navigation',
    title: 'Funknavigation: NDB, VOR, ILS und DME',
    description: 'Vier Verfahren, vier Messgrößen — Richtung zum Sender, Richtung vom Sender, Ablage und Entfernung.',
    blocks: [
      {
        kind: 'p',
        text: 'Das ungerichtete Funkfeuer NDB ist das älteste Verfahren. Es sendet zwischen 190 und 1750 kHz einen getasteten Träger; die ganze Arbeit macht der Empfänger, der mit einer Rahmenantenne die Richtung zum Sender bestimmt. Das ist einfach und billig, aber empfindlich: Gewitter, Küstenlinien und die nächtliche Raumwelle verziehen die Peilung.'
      },
      {
        kind: 'p',
        text: 'Das UKW-Drehfunkfeuer VOR dreht das Prinzip um. Es sendet zwischen 108 und 118 MHz zwei Signale: ein rundum phasengleiches Referenzsignal und ein zweites, dessen Phase sich mit der Peilung ändert. Der Empfänger vergleicht beide Phasen und erhält daraus unmittelbar die Radiale — also die Richtung vom Sender aus, unabhängig von der Ausrichtung des Luftfahrzeugs.'
      },
      {
        kind: 'p',
        text: 'Das Instrumentenlandesystem ILS besteht aus zwei Sendern, die beide dasselbe Verfahren nutzen: Zwei Modulationstöne von 90 und 150 Hz werden so abgestrahlt, dass sie nur auf der Sollinie gleich stark ankommen. Der Landekurssender zwischen 108,1 und 111,975 MHz spannt die Anfluggrundlinie auf, der Gleitwegsender zwischen 328,6 und 335,4 MHz den Anflugwinkel von meist 3°. Beide Frequenzen sind fest gepaart, sodass im Cockpit nur eine eingestellt wird.'
      },
      {
        kind: 'p',
        text: 'Das Entfernungsmessgerät DME misst als einziges dieser Verfahren eine Strecke. Das Bordgerät sendet Impulspaare zwischen 962 und 1213 MHz, die Bodenstation antwortet nach einer festen Verzögerung auf einer 63 MHz entfernten Frequenz. Aus der Laufzeit folgt die Schrägentfernung — genau senkrecht über der Station zeigt das Gerät deshalb die Flughöhe an, nicht null.'
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Warum ILS ungerade Zehntel belegt',
        text: 'Landekurssender arbeiten auf den ungeraden Zehntel-Megahertz zwischen 108,1 und 111,975 MHz, VOR-Anlagen im selben Abschnitt auf den geraden. So kann ein Empfänger aus der eingestellten Frequenz allein ableiten, welches Verfahren ihn erwartet.'
      }
    ]
  },
  {
    id: 'ueberwachung',
    title: 'Transponder, Sekundärradar und ADS-B',
    blocks: [
      {
        kind: 'p',
        text: 'Das Primärradar sieht ein Echo, aber es weiß nicht, wessen Echo. Das Sekundärradar löst dieses Problem, indem es nicht auf ein Echo wartet, sondern fragt: Es sendet auf 1030 MHz eine Abfrage, der Transponder an Bord antwortet auf 1090 MHz. In Modus A überträgt er einen vierstelligen Code, in Modus C zusätzlich die Flughöhe aus dem barometrischen Höhenmesser.'
      },
      {
        kind: 'p',
        text: 'Modus S geht einen Schritt weiter: Jedes Luftfahrzeug trägt eine weltweit eindeutige 24-Bit-Adresse und wird einzeln angesprochen. Das entlastet die Frequenz erheblich, denn nicht mehr jede Abfrage löst bei jedem Transponder in Reichweite eine Antwort aus. Auf dieser Grundlage arbeitet auch die Kollisionswarnung TCAS, bei der zwei Luftfahrzeuge ihre Ausweichmanöver untereinander abstimmen.'
      },
      {
        kind: 'p',
        text: 'ADS-B kehrt die Richtung schließlich ganz um. Das Luftfahrzeug wartet nicht auf eine Abfrage, sondern sendet auf 1090 MHz unaufgefordert Position, Höhe, Geschwindigkeit und Kennung aus der eigenen Navigationsanlage. Jeder Empfänger in Reichweite kann mithören — daraus sind die öffentlichen Flugverfolgungsdienste entstanden, die inzwischen von tausenden privaten Bodenstationen gespeist werden.'
      },
      {
        kind: 'ul',
        items: [
          'Primärradar misst selbst und braucht keine Mitwirkung — es sieht auch, was nicht antworten will.',
          'Sekundärradar fragt und bekommt Kennung und Höhe, hängt aber von einem funktionierenden Transponder ab.',
          'ADS-B ist am genauesten und am billigsten zu empfangen, verlässt sich aber vollständig auf die Angaben des Senders.'
        ]
      }
    ]
  },
  {
    id: 'daten-und-hf',
    title: 'Datenverbindungen, Kurzwelle und Satcom',
    blocks: [
      {
        kind: 'p',
        text: 'Nicht alles muss gesprochen werden. ACARS überträgt seit den 1970er Jahren kurze Textnachrichten zwischen Cockpit und Betrieb: Abflug- und Ankunftszeiten, Wetteranforderungen, Störungsmeldungen der Bordsysteme. In Europa läuft der Hauptkanal auf 131,725 MHz, weltweit dient 131,550 MHz als Grundkanal. Die Datenrate von 2400 bit/s wirkt lächerlich klein — für ein paar Zeilen Text genügt sie.'
      },
      {
        kind: 'p',
        text: 'Über Ozeanen und Polargebieten endet die VHF-Abdeckung. Dort übernimmt die Kurzwelle mit Einseitenbandmodulation im oberen Seitenband. Der Flugfunkdienst hat dafür schmale Segmente zwischen 2,85 und 22 MHz zugewiesen bekommen; welche Familie gerade trägt, entscheidet die Ionosphäre. Verständlichkeit und Zuverlässigkeit sind deutlich schlechter als im VHF-Bereich — deshalb wird der Kurzwellenverkehr zunehmend durch Satellitenverbindungen im L-Band ersetzt.'
      },
      {
        kind: 'p',
        text: 'CPDLC schließlich verlagert die Freigaben selbst auf den Datenweg: Der Lotse schickt eine formalisierte Anweisung, die Besatzung bestätigt sie mit einem Tastendruck. Das vermeidet Hörfehler und entlastet die Sprechfunkfrequenz — gerade über dem Nordatlantik, wo eine Rückfrage sonst Minuten kostet.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keine amtliche Quelle',
        text: 'Diese Seite dient dem Lernen und der Einordnung. Verbindlich sind das Luftfahrthandbuch AIP, die Veröffentlichungen der Flugsicherung und die einschlägigen ICAO-Dokumente. Aussendungen im Flugfunkband ohne Zulassung und Berechtigung sind unzulässig.'
      }
    ]
  }
];
