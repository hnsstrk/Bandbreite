/**
 * Inhalt des Kapitels „Radar-Grundlagen" (/wissen/radar/).
 * Reine Daten: Texte, Formeln, Tabellen und Widget-Slots — kein Markup-Layout.
 * Alle Zahlenbeispiele werden aus $lib/utils berechnet, nie hartcodiert.
 */
import type { KnowledgeArticle } from './types';
import { IEEE_BANDS } from '$lib/data/bands';
import { RCS_REFERENCE } from '$lib/data/constants';
import { formatFrequency, formatNumber, formatRcs, formatDistance } from '$lib/utils/formatting';
import { formatPowerOfTen } from '$lib/components/widgets/RcsComparisonModel';
import {
  calculateRoundTripTime,
  calculateRangeResolution,
  calculateUnambiguousRange,
  calculateDopplerShift
} from '$lib/utils/radar';

const RADAR_BAND_IDS = ['l', 's', 'c', 'x', 'ku', 'k', 'ka', 'v', 'w'] as const;

const RADAR_BAND_APPLICATIONS: Record<string, string> = {
  l: 'Flugsicherung (ATC), Langstrecken-Überwachung, Wetterradar',
  s: 'Flughafenradar, Wetterradar, Schiffsradar',
  c: 'Wetterradar, Satellitenradar, Schiffsnavigation',
  x: 'Marine-Radar, Feuerleitung, Wetterradar',
  ku: 'Hochauflösende Kartierung, Satelliten-TV',
  k: 'Polizei-Radar, Verkehrsüberwachung',
  ka: 'Polizei-Radar, Flughafen-Oberflächenradar',
  v: 'Millimeterwellen-Radar, Forschung',
  w: 'Automotive-Radar (77 GHz), Objekterkennung'
};

/** Beispielwerte für den Fließtext – berechnet, nicht getippt */
const EXAMPLE_RANGE_M = 150_000;
const EXAMPLE_PULSE_S = 1e-6;
const EXAMPLE_PRF_HZ = 1000;
const EXAMPLE_VELOCITY_MS = 100;
const EXAMPLE_CARRIER_HZ = 10e9;

const exampleRoundTripUs = formatNumber(calculateRoundTripTime(EXAMPLE_RANGE_M) * 1e6, 0);
const exampleResolution = formatDistance(calculateRangeResolution(EXAMPLE_PULSE_S), 0);
const exampleUnambiguous = formatDistance(calculateUnambiguousRange(EXAMPLE_PRF_HZ), 1);
const exampleDopplerKHz = formatNumber(calculateDopplerShift(EXAMPLE_VELOCITY_MS, EXAMPLE_CARRIER_HZ) / 1000, 2);

const radarBandRows = IEEE_BANDS.filter((band) => (RADAR_BAND_IDS as readonly string[]).includes(band.id)).map(
  (band) => [
    band.nameDE,
    `${formatFrequency(band.minHz, 0)} – ${formatFrequency(band.maxHz, 0)}`,
    RADAR_BAND_APPLICATIONS[band.id] ?? '—'
  ]
);

const rcsRows = RCS_REFERENCE.map((entry) => [
  entry.nameDE,
  `${formatPowerOfTen(entry.rcsM2)} m²`,
  formatRcs(entry.rcsM2),
  entry.descriptionDE
]);

export const radarArticle: KnowledgeArticle = {
  href: '/wissen/radar/',
  kicker: 'Wissen · Radartechnik',
  title: 'Radar-Grundlagen',
  icon: 'radio',
  lead:
    'RADAR (Radio Detection and Ranging) ortet Objekte und misst ihre Entfernung und Geschwindigkeit mit elektromagnetischen Wellen. Dieses Kapitel erklärt Impulsradar, Radargleichung, Rückstreuquerschnitt, Doppler-Effekt und die gängigen Radarverfahren – mit Reglern zum Ausprobieren.',
  meta: [
    { label: 'Quelle', value: 'Skolnik, Introduction to Radar Systems' },
    { label: 'Rechner', value: 'Radar-Reichweite' }
  ],
  goals: [
    'aus der Laufzeit eines Echos die Zielentfernung bestimmen und die Grenzen Auflösung (c·τ/2) und Eindeutigkeit (c/(2·PRF)) erklären',
    'die Radargleichung lesen und begründen, warum die Reichweite nur mit der vierten Wurzel der Sendeleistung wächst',
    'den Radarquerschnitt σ einordnen – vom Insekt bis zum Containerschiff – und seine Wirkung auf die Reichweite abschätzen',
    'die Doppler-Verschiebung f_d = 2·v·f/c berechnen und ihr Vorzeichen deuten',
    'Puls-, CW-, FMCW-, Primär-/Sekundärradar, SAR und Phased Array voneinander abgrenzen'
  ],
  sections: [
    {
      id: 'grundprinzip',
      title: 'Grundprinzip: Impuls, Echo, Laufzeit',
      description: 'Ein Radar sendet elektromagnetische Impulse aus; Ziele reflektieren sie, und aus der Laufzeit des Echos folgt die Entfernung.',
      blocks: [
        {
          type: 'paragraph',
          html: 'Weil die Welle den Weg zum Ziel <strong>zweimal</strong> zurücklegt, gilt für die Laufzeit t = 2R/c. Für ein Ziel in 150 km Entfernung sind das gerade einmal ' + exampleRoundTripUs + ' µs – Radarelektronik arbeitet daher im Mikrosekundenbereich.'
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
              html: 'Sendet kontinuierlich und nutzt den Doppler-Effekt zur Geschwindigkeitsmessung. Ohne Modulation ist keine Entfernungsmessung möglich – dafür gibt es FMCW.',
              facts: [{ label: 'Messgröße', value: 'f_d = 2·v·f/c' }]
            }
          ]
        },
        {
          type: 'paragraph',
          html: 'Zwei Zahlen sollte man sich merken: Ein Impuls von <strong>1 µs</strong> Dauer erlaubt eine Entfernungsauflösung von ' + exampleResolution + ' (zwei Ziele näher beieinander verschmelzen zu einem Echo), und eine Pulswiederholfrequenz von <strong>1 kHz</strong> liefert eindeutige Entfernungen bis ' + exampleUnambiguous + '. Beides lässt sich im Widget direkt nachvollziehen.'
        },
        { type: 'widget', id: 'radar-pulse' },
        {
          type: 'question',
          question: 'Warum kann ein Radar mit hoher PRF zwar Geschwindigkeiten gut messen, aber weit entfernte Ziele falsch einordnen?',
          answer: 'Eine hohe PRF verkürzt das Pulswiederholintervall. Trifft das Echo eines fernen Ziels erst nach dem nächsten Sendeimpuls ein, ordnet der Empfänger es diesem zu und zeigt eine zu kleine Entfernung („Entfernungsmehrdeutigkeit"). Gleichzeitig steigt mit der PRF aber die eindeutig messbare Doppler-Frequenz – Radare wählen daher je nach Aufgabe eine niedrige, mittlere oder hohe PRF.'
        }
      ]
    },
    {
      id: 'radargleichung',
      title: 'Radargleichung',
      description: 'Die Radargleichung ist die Leistungsbilanz zwischen Sender, Ziel und Empfänger und bestimmt die maximale Reichweite.',
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
            'Systemverluste L (typisch 3–10 dB) stehen im Nenner und verkürzen die Reichweite spürbar.'
          ]
        },
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
      description: 'Der Radarquerschnitt σ beschreibt, wie stark ein Objekt Radarwellen zum Sender zurückstreut. Er hat die Einheit m², ist aber keine geometrische Fläche.',
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
      id: 'doppler',
      title: 'Doppler-Radar',
      description: 'Bewegt sich ein Ziel relativ zum Radar, ist das Echo in der Frequenz verschoben. Doppler-Radar misst daraus die Radialgeschwindigkeit.',
      blocks: [
        {
          type: 'formula',
          formula: 'f_d = 2 · v_r · f / c',
          alt: 'f d gleich 2 mal v r mal f geteilt durch c',
          label: 'Doppler-Verschiebung eines Radarechos',
          number: '(4)',
          variables: [
            { symbol: 'f_d', meaning: 'Doppler-Frequenz', unit: 'Hz' },
            { symbol: 'v_r', meaning: 'Radialgeschwindigkeit (positiv = Annäherung)', unit: 'm/s' },
            { symbol: 'f', meaning: 'Sendefrequenz', unit: 'Hz' },
            { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' }
          ]
        },
        {
          type: 'paragraph',
          html: 'Der Faktor 2 entsteht, weil das Ziel die Welle zunächst als bewegter Empfänger sieht und sie dann als bewegter Sender zurückstrahlt. Bei 10 GHz und 100 m/s (360 km/h) beträgt die Verschiebung ' + exampleDopplerKHz + ' kHz – gut messbar, obwohl f_d/f nur etwa 10⁻⁶ ist.'
        },
        { type: 'widget', id: 'doppler' },
        {
          type: 'cards',
          columns: 2,
          items: [
            { title: 'Verkehrsüberwachung', html: 'Polizei-Radar misst Fahrzeuggeschwindigkeiten im K- und Ka-Band.' },
            { title: 'Wetterradar', html: 'Windgeschwindigkeiten und Niederschlagsbewegung aus der Doppler-Verschiebung der Tropfenechos.' },
            { title: 'Flugsicherung', html: 'MTI (Moving Target Indication) unterdrückt stehende Echos vom Boden (Clutter) und lässt nur bewegte Ziele durch.' },
            { title: 'Sportanalyse', html: 'Ballgeschwindigkeiten in Tennis, Baseball und Golf.' }
          ]
        },
        {
          type: 'question',
          question: 'Ein Ziel fliegt mit 200 m/s exakt tangential am Radar vorbei. Welche Doppler-Frequenz misst das Radar?',
          answer: 'Null. Der Doppler-Effekt reagiert nur auf die <strong>radiale</strong> Geschwindigkeitskomponente, also die Änderung des Abstands. Bewegt sich das Ziel quer zur Blickrichtung, bleibt der Abstand im Moment der Messung konstant – MTI-Radare können solche Ziele kurzzeitig verlieren.'
        }
      ]
    },
    {
      id: 'fmcw',
      title: 'FMCW-Radar',
      description: 'Frequency Modulated Continuous Wave: ein Dauerstrichradar mit linear ansteigender Frequenz (Chirp), das Entfernung und Geschwindigkeit gleichzeitig misst.',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Der Sender erzeugt einen <strong>Chirp</strong>: Die Frequenz steigt linear über die Bandbreite B an.',
            'Das Echo kommt um die Laufzeit t = 2R/c verzögert zurück – und damit mit einer anderen Momentanfrequenz.',
            'Das Mischen von Sende- und Empfangssignal liefert die <strong>Beat-Frequenz</strong> f_b, die proportional zur Entfernung ist.',
            'Eine zusätzliche Doppler-Verschiebung über mehrere Chirps hinweg ergibt die <strong>Geschwindigkeit</strong>.'
          ]
        },
        {
          type: 'formula',
          formula: 'ΔR = c / (2 · B)',
          alt: 'Delta R gleich c geteilt durch 2 B',
          label: 'Entfernungsauflösung eines FMCW-Radars mit Chirp-Bandbreite B',
          number: '(5)',
          variables: [{ symbol: 'B', meaning: 'Chirp-Bandbreite', unit: 'Hz' }]
        },
        {
          type: 'table',
          caption: 'Automotive-Radar im W-Band',
          columns: ['Kenngröße', 'Wert'],
          rows: [
            ['Frequenzband', '76–81 GHz (W-Band)'],
            ['Reichweite', 'bis ca. 250 m (Long Range)'],
            ['Auflösung', `≈ ${formatDistance(calculateRangeResolution(1 / 4e9), 1)} bei 4 GHz Bandbreite (Gl. 5)`],
            ['Anwendungen', 'ACC, Notbremsassistent, Spurwechselassistent']
          ],
          monoColumns: [1]
        }
      ]
    },
    {
      id: 'radarbaender',
      title: 'Radarbänder (IEEE)',
      description: 'Die IEEE-Bandbezeichnungen sind der internationale Standard für Radarfrequenzbänder; jedes Band hat charakteristische Eigenschaften und typische Anwendungen.',
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
          html: 'Die vollständige Übersicht aller Bandsysteme (ITU, IEEE, NATO) steht in der <a href="/datenbanken/frequenzbaender/">Frequenzband-Datenbank</a>.'
        }
      ]
    },
    {
      id: 'radartypen',
      title: 'Radartypen',
      description: 'Vier Bauarten, die man auseinanderhalten sollte.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Primärradar',
              html: 'Klassisches Radar, das nur auf reflektierte Echos angewiesen ist – erkennt alle Objekte unabhängig von deren Ausrüstung.',
              points: ['Keine Kooperation des Ziels erforderlich', 'Erkennt auch unbekannte Objekte', 'Höherer Leistungsbedarf (R⁴-Gesetz)']
            },
            {
              title: 'Sekundärradar (SSR)',
              html: 'Das Ziel trägt einen Transponder, der aktiv auf Abfragen antwortet – Standard in der Flugsicherung.',
              points: ['Größere Reichweite bei geringerer Leistung (nur R² je Richtung)', 'Übermittelt zusätzliche Daten (Kennung, Höhe)', 'Mode S und ADS-B in der modernen Luftfahrt']
            },
            {
              title: 'SAR (Synthetic Aperture Radar)',
              html: 'Nutzt die Bewegung des Trägers (Flugzeug, Satellit), um eine große synthetische Apertur zu bilden – hochauflösende Bildgebung.',
              points: ['Auflösung unabhängig von der Entfernung', 'Funktioniert bei Tag, Nacht und durch Wolken', 'Erdbeobachtung, Kartographie']
            },
            {
              title: 'Phased-Array-Radar',
              html: 'Viele Antennenelemente mit elektronisch gesteuerter Phase schwenken den Strahl ohne mechanische Bewegung.',
              points: ['Strahlschwenkung in Mikrosekunden', 'Mehrere Ziele gleichzeitig verfolgbar', 'AESA: jedes Element mit eigenem Sende-/Empfangsmodul']
            }
          ]
        }
      ]
    }
  ],
  sources: [
    'M. I. Skolnik, <em>Introduction to Radar Systems</em>, 3. Aufl., McGraw-Hill 2001 – Radargleichung (Gl. 1.7), RCS-Tabelle 2.2, Doppler und Eindeutigkeit.',
    'IEEE Std 521-2002, <em>Standard Letter Designations for Radar-Frequency Bands</em>.'
  ]
};
