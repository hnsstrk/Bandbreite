/**
 * Unterkapitel „Radar-Grundlagen" (/wissen/radar/grundlagen/).
 * Reine Daten: Texte, Formeln, Tabellen und Widget-Slots — kein Markup.
 * Alle Zahlenbeispiele werden in `tables.ts` aus $lib/utils berechnet.
 */
import type { KnowledgeArticle } from '../types';
import {
  exampleRoundTripUs,
  exampleResolution,
  exampleUnambiguous,
  prfRows,
  radarBandRows,
  rcsRows
} from './tables';

export const radarGrundlagenArticle: KnowledgeArticle = {
  href: '/wissen/radar/grundlagen/',
  kicker: 'Wissen · Radartechnik',
  title: 'Radar-Grundlagen',
  icon: 'signal',
  lead: 'Ein Radar sendet elektromagnetische Energie aus und wertet aus, was zurückkommt. Dieses Unterkapitel klärt die vier Größen, die alles Weitere tragen: Laufzeit, Leistungsbilanz, Rückstreuquerschnitt und die Grenzen von Auflösung und Eindeutigkeit.',
  meta: [
    { label: 'Quelle', value: 'Skolnik, Introduction to Radar Systems' },
    { label: 'Rechner', value: 'Radar-Reichweite' }
  ],
  goals: [
    'aus der Laufzeit eines Echos die Zielentfernung bestimmen',
    'die Radargleichung lesen und begründen, warum die Reichweite nur mit der vierten Wurzel der Sendeleistung wächst',
    'den Radarquerschnitt σ einordnen – vom Insekt bis zum Containerschiff – und seine Wirkung auf die Reichweite abschätzen',
    'Auflösung (c·τ/2) und Eindeutigkeit (c/(2·PRF), λ·PRF/4) auseinanderhalten und das PRF-Dilemma erklären',
    'ein Radarband nach IEEE Std 521 benennen und seiner typischen Aufgabe zuordnen'
  ],
  sections: [
    {
      id: 'grundprinzip',
      title: 'Grundprinzip: Impuls, Echo, Laufzeit',
      description:
        'Ein Radar sendet elektromagnetische Impulse aus; Ziele reflektieren sie, und aus der Laufzeit des Echos folgt die Entfernung.',
      blocks: [
        {
          type: 'paragraph',
          html:
            'Weil die Welle den Weg zum Ziel <strong>zweimal</strong> zurücklegt, gilt für die Laufzeit t = 2R/c. Für ein Ziel in 150 km Entfernung sind das gerade einmal ' +
            exampleRoundTripUs +
            ' µs – Radarelektronik arbeitet daher im Mikrosekundenbereich.'
        },
        {
          type: 'formula',
          formula: 'R = c · t / 2',
          alt: 'R gleich c mal t geteilt durch 2',
          label: 'Entfernung aus der Echolaufzeit',
          number: '(1)',
          variables: [
            { symbol: 'R', meaning: 'Entfernung zum Ziel', unit: 'm' },
            { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' },
            { symbol: 't', meaning: 'Laufzeit hin und zurück', unit: 's' }
          ]
        },
        {
          type: 'cards',
          items: [
            {
              title: 'Pulsradar',
              html: 'Sendet kurze Impulse der Dauer τ und misst die Laufzeit des Echos. Die Pause zwischen zwei Impulsen (PRI = 1/PRF) legt fest, bis zu welcher Entfernung ein Echo eindeutig zugeordnet werden kann.',
              facts: [
                { label: 'Auflösung', value: 'ΔR = c·τ/2' },
                { label: 'Eindeutig bis', value: 'R_u = c/(2·PRF)' }
              ]
            },
            {
              title: 'Dauerstrichradar (CW)',
              html: 'Sendet kontinuierlich und nutzt den Doppler-Effekt zur Geschwindigkeitsmessung. Ohne Modulation ist keine Entfernungsmessung möglich – die Verfahren dazu stehen im Unterkapitel <a href="/wissen/radar/verfahren/">Radarverfahren</a>.',
              facts: [{ label: 'Messgröße', value: 'f_d = 2·v·f/c' }]
            }
          ]
        },
        { type: 'widget', id: 'radar-pulse' },
        {
          type: 'question',
          question:
            'Ein Radar sieht ein Ziel 400 µs nach dem Sendeimpuls. Wie weit ist es entfernt?',
          answer:
            'Rund 60 km. Aus R = c·t/2 folgt R = 299 792 458 m/s · 400 µs / 2 ≈ 59,96 km. Als Faustformel: <strong>150 m je Mikrosekunde</strong> Laufzeit – oder umgekehrt 6,67 µs je Kilometer.'
        }
      ]
    },
    {
      id: 'radargleichung',
      title: 'Radargleichung',
      description:
        'Die Radargleichung ist die Leistungsbilanz zwischen Sender, Ziel und Empfänger und bestimmt die maximale Reichweite.',
      blocks: [
        {
          type: 'formula',
          formula: 'P_r = P_t · G² · λ² · σ / ((4π)³ · R⁴ · L)',
          alt: 'P r gleich P t mal G Quadrat mal Lambda Quadrat mal Sigma, geteilt durch 4 Pi hoch 3 mal R hoch 4 mal L',
          label: 'Empfangsleistung eines monostatischen Radars',
          number: '(2)',
          variables: [
            { symbol: 'P_r', meaning: 'Empfangsleistung', unit: 'W' },
            { symbol: 'P_t', meaning: 'Sendeleistung', unit: 'W' },
            { symbol: 'G', meaning: 'Antennengewinn (linear, Sende- = Empfangsantenne)' },
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            { symbol: 'σ', meaning: 'Radarquerschnitt (RCS)', unit: 'm²' },
            { symbol: 'R', meaning: 'Entfernung zum Ziel', unit: 'm' },
            { symbol: 'L', meaning: 'Systemverluste (linear, ≥ 1)' }
          ]
        },
        {
          type: 'paragraph',
          html: 'Die Herleitung ist eine Kette aus Kugelwellen: Die Leistungsdichte am Ziel beträgt S₁ = P_t·G/(4π·R²). Das Ziel streut die Leistung S₁·σ zurück, am Radar kommt die Dichte S₂ = S₁·σ/(4π·R²) an, und die Antenne fängt davon die effektive Fläche A_e = G·λ²/(4π) ein. Zweimal 1/R² ergibt das berühmte <strong>R⁴-Gesetz</strong>.'
        },
        {
          type: 'formula',
          formula: 'R_max = ⁴√( P_t · G² · λ² · σ / ((4π)³ · P_min · L) )',
          alt: 'R max gleich vierte Wurzel aus P t mal G Quadrat mal Lambda Quadrat mal Sigma, geteilt durch 4 Pi hoch 3 mal P min mal L',
          label: 'Maximale Reichweite für die minimal detektierbare Leistung P_min',
          number: '(3)'
        },
        {
          type: 'list',
          items: [
            'Die Empfangsleistung sinkt mit der <strong>vierten Potenz</strong> der Entfernung.',
            'Doppelte Reichweite erfordert <strong>16-fache</strong> Sendeleistung (+12 dB) – oder 16-fachen Radarquerschnitt.',
            'Der Antennengewinn wirkt quadratisch, weil dieselbe Antenne sendet und empfängt.',
            'Systemverluste L (typisch 3–10 dB) stehen im Nenner und verkürzen die Reichweite spürbar.',
            'Beim Sekundärradar gilt das nicht: dort läuft jede Richtung nur einmal, also mit 1/R² – siehe <a href="/wissen/radar/sekundaerradar/">Sekundärradar</a>.'
          ]
        },
        {
          type: 'paragraph',
          html: 'Wie flach die vierte Wurzel wirklich ist, zeigt die Kurve: Verschiebe die Sendeleistung über drei Zehnerpotenzen und beobachte, wie wenig sich die Reichweite bewegt – und wie viel stärker Antennengewinn und Radarquerschnitt durchschlagen.'
        },
        { type: 'widget', id: 'radar-range' },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Zum Rechner',
          html: 'Der <a href="/rechner/radar/">Radar-Reichweitenrechner</a> löst Gleichung (3) mit Sendeleistung, Gewinn, Frequenz, RCS und Empfindlichkeit – inklusive Doppler, Auflösung und Eindeutigkeit.'
        }
      ]
    },
    {
      id: 'radarquerschnitt',
      title: 'Radarquerschnitt (RCS)',
      description:
        'Der Radarquerschnitt σ beschreibt, wie stark ein Objekt Radarwellen zum Sender zurückstreut. Er hat die Einheit m², ist aber keine geometrische Fläche.',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Größe:</strong> Größere Objekte haben tendenziell einen höheren RCS.',
            '<strong>Form:</strong> Ebene Flächen senkrecht zum Radar reflektieren stark, runde und schräge Formen streuen die Energie weg.',
            '<strong>Material:</strong> Metall reflektiert stark, Verbundwerkstoffe und absorbierende Beschichtungen weniger.',
            '<strong>Aspektwinkel:</strong> Der RCS ändert sich mit der Blickrichtung oft um Größenordnungen.',
            '<strong>Frequenz:</strong> Ob ein Objekt groß oder klein gegenüber λ ist, entscheidet über den Streumechanismus (Rayleigh-, Resonanz-, optischer Bereich).',
            '<strong>Stealth:</strong> Formgebung und Absorber drücken den RCS eines Kampfflugzeugs von einigen m² auf wenige hundertstel m².'
          ]
        },
        { type: 'widget', id: 'rcs-comparison' },
        {
          type: 'table',
          caption: 'Typische Radarquerschnitte nach Skolnik, Tab. 2.2 (Quelle: RCS_REFERENCE)',
          columns: ['Objekt', 'σ', 'Größenordnung', 'Hinweis'],
          rows: rcsRows,
          monoColumns: [1, 2]
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'dBsm',
          html: 'In der Praxis wird σ oft logarithmisch als dBsm (dB bezogen auf 1 m²) angegeben: 1 m² = 0 dBsm, 100 m² = 20 dBsm, 0,01 m² = −20 dBsm.'
        }
      ]
    },
    {
      id: 'aufloesung-mehrdeutigkeit',
      title: 'Auflösung und Mehrdeutigkeit',
      description:
        'Zwei verschiedene Fragen: Wie nah dürfen sich zwei Ziele kommen, bevor sie verschmelzen (Auflösung)? Und ab wann ordnet das Radar einen Messwert der falschen Periode zu (Mehrdeutigkeit)?',
      blocks: [
        {
          type: 'definitions',
          variant: 'term',
          items: [
            {
              term: 'Entfernungsauflösung ΔR = c·τ/2',
              description:
                'Zwei Ziele werden getrennt, wenn ihre Echos einander nicht überlappen. Ein Impuls von 1 µs liefert ' +
                exampleResolution +
                '. Mit Pulskompression tritt an die Stelle der Sendedauer die Bandbreite: ΔR = c/(2·B).'
            },
            {
              term: 'Winkelauflösung',
              description:
                'Sie folgt der Halbwertsbreite der Antenne: Zwei Ziele in gleicher Entfernung trennen sich erst, wenn sie weiter als eine Keulenbreite auseinanderliegen. Quer zur Blickrichtung wächst der Fehler linear mit der Entfernung.'
            },
            {
              term: 'Eindeutige Entfernung R_u = c/(2·PRF)',
              description:
                'Trifft ein Echo erst nach dem nächsten Sendeimpuls ein, ordnet der Empfänger es diesem zu und zeigt eine zu kleine Entfernung. Bei 1 kHz endet die Eindeutigkeit bei ' +
                exampleUnambiguous +
                '.'
            },
            {
              term: 'Eindeutige Geschwindigkeit ±v_u = λ·PRF/4',
              description:
                'Die Doppler-Frequenz wird nur einmal je Impuls abgetastet. Über ±v_u hinaus faltet sich die Messung zurück – die erste Blindgeschwindigkeit liegt bei λ·PRF/2.'
            },
            {
              term: 'Blindbereich',
              description:
                'Während der Sendedauer ist der Empfänger abgeschaltet. Ziele näher als c·τ/2 bleiben unsichtbar; bei langen Impulsen deckt ein zusätzlicher kurzer Impuls den Nahbereich ab.'
            }
          ]
        },
        {
          type: 'table',
          caption:
            'Das PRF-Dilemma: Eindeutigkeitsgrenzen über der Pulswiederholfrequenz (gerechnet für 10 GHz, λ = 3 cm)',
          columns: [
            'PRF',
            'Eindeutige Entfernung R_u',
            'Eindeutige Geschwindigkeit',
            'Typische Verwendung'
          ],
          rows: prfRows,
          monoColumns: [0, 1, 2]
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Beides zugleich geht nicht',
          html: 'R_u·v_u = c·λ/8 ist eine Konstante des Systems: Wer die Entfernung weiter eindeutig messen will, muss die PRF senken und verliert dabei Doppler-Eindeutigkeit. Radare lösen das durch Wechsel der PRF von Verarbeitungsintervall zu Verarbeitungsintervall und rechnen die wahre Lage über den chinesischen Restsatz zurück.'
        },
        {
          type: 'question',
          question:
            'Warum kann ein Radar mit hoher PRF zwar Geschwindigkeiten gut messen, aber weit entfernte Ziele falsch einordnen?',
          answer:
            'Eine hohe PRF verkürzt das Pulswiederholintervall. Trifft das Echo eines fernen Ziels erst nach dem nächsten Sendeimpuls ein, ordnet der Empfänger es diesem zu und zeigt eine zu kleine Entfernung („Entfernungsmehrdeutigkeit"). Gleichzeitig steigt mit der PRF die eindeutig messbare Doppler-Frequenz – Radare wählen daher je nach Aufgabe eine niedrige, mittlere oder hohe PRF.'
        }
      ]
    },
    {
      id: 'radarbaender',
      title: 'Radarbänder (IEEE)',
      description:
        'Die IEEE-Bandbezeichnungen sind der internationale Standard für Radarfrequenzbänder; jedes Band hat charakteristische Eigenschaften und typische Anwendungen.',
      blocks: [
        {
          type: 'table',
          caption: 'Radarbänder nach IEEE Std 521 (Frequenzgrenzen aus IEEE_BANDS)',
          columns: ['Band', 'Frequenz', 'Typische Anwendungen'],
          rows: radarBandRows,
          monoColumns: [1]
        },
        {
          type: 'paragraph',
          html: 'Tiefe Bänder reichen weit und durchdringen Niederschlag, hohe Bänder liefern kleine Antennen, schmale Keulen und viel Bandbreite – und damit feine Auflösung. Die vollständige Übersicht aller Bandsysteme (ITU, IEEE, NATO) steht in der <a href="/datenbanken/frequenzbaender/">Frequenzband-Datenbank</a>.'
        }
      ]
    }
  ],
  sources: [
    'M. I. Skolnik, <em>Introduction to Radar Systems</em>, 3. Aufl., McGraw-Hill 2001 – Radargleichung (Gl. 1.7), RCS-Tabelle 2.2, Auflösung und Eindeutigkeit (Kap. 1 und 2).',
    'IEEE Std 521-2002, <em>Standard Letter Designations for Radar-Frequency Bands</em>.'
  ]
};
