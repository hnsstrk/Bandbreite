/**
 * Unterkapitel „Sekundärradar" (/wissen/radar/sekundaerradar/).
 * Reine Daten; die Zahlenwerte stammen aus dem Modell des SSR-Widgets,
 * das seinerseits ICAO Annex 10 Vol. IV als Quelle nennt.
 */
import type { KnowledgeArticle } from '../types';
import { formatFrequency, formatNumber } from '$lib/utils/formatting';
import { computeSsrTiming } from '$lib/components/widgets/SsrModel';
import {
  MODE_A_P1_P3_US,
  MODE_C_P1_P3_US,
  MODE_S_ADDRESS_BITS,
  MODE_S_REPLY_BITS,
  P1_P2_SPACING_US,
  REPLY_FRAME_US,
  REPLY_SLOT_US,
  REPLY_SPI_OFFSET_US,
  SQUAWK_CODE_COUNT,
  SQUAWK_PRESETS,
  SSR_INTERROGATION_HZ,
  SSR_REPLY_HZ,
  TRANSPONDER_DELAY_US
} from '$lib/components/widgets/SsrModel';

/** Beispielentfernung für die Zeitbilanz im Text. */
const EXAMPLE_RANGE_M = 100_000;
const exampleTiming = computeSsrTiming(EXAMPLE_RANGE_M);

const squawkRows = SQUAWK_PRESETS.map((preset) => [preset.code, preset.meaningDE]);

export const radarSekundaerArticle: KnowledgeArticle = {
  href: '/wissen/radar/sekundaerradar/',
  kicker: 'Wissen · Radartechnik',
  title: 'Sekundärradar, Mode S und ADS-B',
  icon: 'radio',
  lead: 'Das Sekundärradar wartet nicht auf ein Echo, sondern stellt eine Frage: Die Bodenstation fragt auf 1030 MHz, der Transponder im Luftfahrzeug antwortet auf 1090 MHz. Aus diesem Dialog sind Kennung, Flughöhe, die selektive Modus-S-Abfrage und schließlich ADS-B entstanden.',
  meta: [
    { label: 'Quelle', value: 'ICAO Annex 10 Vol. IV' },
    { label: 'Frequenzen', value: '1030 / 1090 MHz' }
  ],
  goals: [
    'Primär- und Sekundärradar nach Messprinzip, Leistungsbedarf und Informationsgehalt unterscheiden',
    'die Impulsfolge einer Modus-A- und einer Modus-C-Abfrage samt Antwortrahmen beschreiben',
    'einen Squawk-Code in das Impulsbild des Antwortrahmens übersetzen und die Sondercodes nennen',
    'erklären, was die selektive Abfrage über die 24-Bit-Adresse im Modus S besser macht',
    'ADS-B als unaufgeforderte Aussendung einordnen und von der abgefragten Antwort abgrenzen',
    'FRUIT und Garbling als Ursachen der Kanalbelastung auf 1090 MHz benennen'
  ],
  sections: [
    {
      id: 'primaer-vs-sekundaer',
      title: 'Primär- und Sekundärradar',
      description:
        'Das eine misst, was zurückgeworfen wird; das andere fragt ein kooperatives Ziel und bekommt eine Antwort samt Daten.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Primärradar (PSR)',
              html: 'Wertet das passive Echo aus. Es erkennt jedes Objekt, unabhängig von dessen Ausrüstung – auch Wetter, Vogelschwärme und Ziele, die nicht gefunden werden wollen.',
              points: [
                'Keine Mitwirkung des Ziels nötig',
                'Leistungsbilanz folgt dem R⁴-Gesetz',
                'Liefert nur Ort, keine Kennung'
              ]
            },
            {
              title: 'Sekundärradar (SSR)',
              html: 'Fragt einen Transponder ab, der auf einer anderen Frequenz aktiv antwortet. Die Antwort trägt Kennung und Flughöhe.',
              points: [
                'Jede Richtung nur mit 1/R² — deutlich weniger Leistung nötig',
                'Antwort enthält Daten, nicht nur eine Ortsmarke',
                'Ohne funktionierenden Transponder unsichtbar'
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          html: 'Der Leistungsvorteil folgt direkt aus der Geometrie: Die Abfrage breitet sich einmal aus (1/R²), die Antwort ebenfalls einmal (1/R²) – zusammen also 1/R⁴ in der <em>Leistung zweier getrennter Strecken</em> statt des R⁴-Gesetzes einer einzigen Strecke mit Rückstreuung. Praktisch heißt das: Ein Sekundärradar erreicht mit einigen hundert Watt Spitzenleistung Entfernungen, für die ein Primärradar Megawatt braucht. Der Preis ist die Abhängigkeit von der Bordausrüstung – deshalb betreiben Flugsicherungen beide Systeme nebeneinander, oft auf derselben Antennendrehachse.'
        }
      ]
    },
    {
      id: 'mode-a-c',
      title: 'Modus A und C: Impulsabstände und Antwortrahmen',
      description:
        'Die klassische Abfrage kennt keine Adressen. Was gefragt wird, steckt allein im Abstand zweier Impulse.',
      blocks: [
        {
          type: 'definitions',
          variant: 'term',
          items: [
            {
              term: 'P1 und P3 auf ' + formatFrequency(SSR_INTERROGATION_HZ, 0),
              description:
                'Zwei Impulse der Bodenstation. Ihr Abstand ist die Frage: ' +
                formatNumber(MODE_A_P1_P3_US, 0) +
                ' µs bedeutet Modus A (Kennung), ' +
                formatNumber(MODE_C_P1_P3_US, 0) +
                ' µs bedeutet Modus C (barometrische Höhe).'
            },
            {
              term: 'P2 — Nebenkeulenunterdrückung',
              description:
                'Ein Kontrollimpuls ' +
                formatNumber(P1_P2_SPACING_US, 0) +
                ' µs nach P1, abgestrahlt über eine Rundstrahlantenne. Empfängt der Transponder P2 stärker als P1, sitzt er in einer Nebenkeule und schweigt.'
            },
            {
              term: 'Antwortrahmen auf ' + formatFrequency(SSR_REPLY_HZ, 0),
              description:
                'Die Rahmenimpulse F1 und F2 liegen ' +
                formatNumber(REPLY_FRAME_US, 1) +
                ' µs auseinander. Dazwischen liegen 13 Zeitschlitze im Raster von ' +
                formatNumber(REPLY_SLOT_US, 2) +
                ' µs: zwölf Datenimpulse und der ungenutzte Impuls X.'
            },
            {
              term: 'Codeaufbau A, B, C, D',
              description:
                'Jede der vier Oktalziffern wird von drei Impulsen mit den Wertigkeiten 1, 2 und 4 getragen (A1 A2 A4 …). Das ergibt ' +
                formatNumber(SQUAWK_CODE_COUNT, 0) +
                ' mögliche Codes — daher der Name „4096-Code".'
            },
            {
              term: 'SPI',
              description:
                'Ein zusätzlicher Impuls ' +
                formatNumber(REPLY_SPI_OFFSET_US, 2) +
                ' µs nach F2. Die Besatzung löst ihn auf Anweisung aus, damit die Lotsin ihr Ziel eindeutig identifizieren kann.'
            }
          ]
        },
        { type: 'widget', id: 'ssr-interrogation' },
        {
          type: 'paragraph',
          html:
            'Zur Zeitbilanz: Für ein Luftfahrzeug in ' +
            formatNumber(EXAMPLE_RANGE_M / 1000, 0) +
            ' km Entfernung braucht das Signal ' +
            formatNumber(exampleTiming.roundTripUs, 1) +
            ' µs hin und zurück. Dazu kommen ' +
            formatNumber(TRANSPONDER_DELAY_US, 0) +
            ' µs feste Verzögerung im Transponder, bis F1 losgeht — zusammen ' +
            formatNumber(exampleTiming.totalUs, 1) +
            ' µs. Weil diese Verzögerung genormt ist, kann die Bodenstation sie herausrechnen und aus der übrigen Zeit die Entfernung bestimmen.'
        },
        {
          type: 'table',
          caption: 'Codes mit fester Bedeutung (ICAO Doc 4444)',
          columns: ['Code', 'Bedeutung'],
          rows: squawkRows,
          monoColumns: [0]
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Kein Betriebsdokument',
          html: 'Die Angaben dienen dem Verständnis der Technik. Verbindlich sind allein die Vorgaben der zuständigen Flugsicherung und die geltenden Ausgaben der ICAO-Dokumente.'
        }
      ]
    },
    {
      id: 'mode-s',
      title: 'Modus S: selektive Abfrage',
      description:
        'Statt alle zu fragen und alle antworten zu lassen, spricht die Bodenstation genau ein Luftfahrzeug an.',
      blocks: [
        {
          type: 'list',
          items: [
            'Jedes Luftfahrzeug trägt eine weltweit eindeutige Adresse aus <strong>' +
              formatNumber(MODE_S_ADDRESS_BITS, 0) +
              ' Bit</strong>, vergeben über die Luftfahrtbehörde des Eintragungsstaates.',
            'Die Abfrage steckt in einem Datenimpuls P6, dessen Phase differenziell umgetastet wird (DPSK); P1 und P2 dienen davor der Unterscheidung von den alten Modi.',
            'Es gibt kurze und lange Formate mit ' +
              formatNumber(MODE_S_REPLY_BITS.kurz, 0) +
              ' bzw. ' +
              formatNumber(MODE_S_REPLY_BITS.lang, 0) +
              ' Datenbits; die Antwort beginnt mit einer Preambel aus vier Impulsen und überträgt die Bits pulspositionsmoduliert.',
            'Die Formate heißen UF (Uplink Format) und DF (Downlink Format) und sind durchnummeriert — DF11 ist die Allrufantwort, DF17 die ADS-B-Aussendung.',
            'Jede Nachricht trägt eine 24-Bit-Prüfsumme, in die bei vielen Formaten die Adresse eingerechnet ist: Wer nicht gemeint ist, bekommt beim Prüfen Unsinn heraus und verwirft die Nachricht.'
          ]
        },
        {
          type: 'paragraph',
          html: 'Der Ablauf ist zweistufig: Im <strong>Allruf</strong> meldet sich ein neu auftauchendes Luftfahrzeug einmal mit seiner Adresse. Danach fragt die Bodenstation es gezielt und zu einem selbst gewählten Zeitpunkt ab („selective interrogation") und trägt es in eine Sperrliste ein, damit es auf weitere Allrufe schweigt. Das entlastet den Kanal erheblich — genau darum ging es bei der Einführung.'
        },
        {
          type: 'paragraph',
          html: 'Wie eine solche Antwort aufgebaut ist, zeigt das Bitfeld der ADS-B-Aussendung DF17: acht Mikrosekunden Preambel und danach 112 Bit, aufgeteilt in Formatkennung, Fähigkeitskennung, Adresse, Nachricht und Prüfsumme.'
        },
        { type: 'widget', id: 'mode-s-frame' }
      ]
    },
    {
      id: 'ads-b-und-tcas',
      title: 'ADS-B und TCAS',
      description:
        'Zwei Anwendungen, die auf derselben Transpondertechnik aufsetzen — eine sendet von selbst, die andere fragt von Bord aus.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'ADS-B (1090ES)',
              html: 'Der Modus-S-Transponder sendet unaufgefordert („Extended Squitter", Format DF17) Position, Höhe, Geschwindigkeit und Kennung aus der Bordnavigation. Die Position wird kompakt codiert (Compact Position Reporting, CPR), sodass zwei Nachrichten zur eindeutigen Auflösung nötig sind.',
              facts: [
                { label: 'Frequenz', value: formatFrequency(SSR_REPLY_HZ, 0) },
                {
                  label: 'Nachrichtenlänge',
                  value: `${formatNumber(MODE_S_REPLY_BITS.lang, 0)} bit`
                }
              ]
            },
            {
              title: 'TCAS / ACAS II',
              html: 'Ein Bordgerät, das selbst auf 1030 MHz abfragt und die Antworten anderer Luftfahrzeuge auswertet. Aus Entfernung und deren Änderung schätzt es die Zeit bis zur größten Annäherung und gibt Verkehrshinweise (TA) oder Ausweichempfehlungen (RA).',
              facts: [
                { label: 'Abfrage', value: formatFrequency(SSR_INTERROGATION_HZ, 0) },
                { label: 'Grundlage', value: 'ICAO Annex 10 Vol. IV, ACAS' }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          html: 'ADS-B ist unverschlüsselt und ohne Zugangskontrolle. Genau das macht die öffentliche Flugverfolgung möglich — und es ist zugleich der Grund, warum die Meldungen für sicherheitskritische Zwecke plausibilisiert und mit unabhängigen Quellen (Primärradar, Mehrwegortung) verglichen werden.'
        }
      ]
    },
    {
      id: 'kanalbelastung',
      title: 'Kanalbelastung: FRUIT und Garbling',
      description: 'Alle Antworten der Welt teilen sich eine einzige Frequenz. Das hat Folgen.',
      blocks: [
        {
          type: 'definitions',
          variant: 'term',
          items: [
            {
              term: 'FRUIT',
              description:
                'Antworten, die von einer anderen Bodenstation ausgelöst wurden und zufällig beim eigenen Empfänger landen (False Replies Unsynchronised In Time). Sie sind nicht mit der eigenen Abfrage synchron und lassen sich über mehrere Antennenumdrehungen ausfiltern.'
            },
            {
              term: 'Garbling',
              description:
                'Zwei Luftfahrzeuge in ähnlicher Entfernung und Richtung antworten so dicht hintereinander, dass sich ihre Impulsrahmen überlagern. Aus zwei Codes wird ein dritter, falscher — im Modus A/C kaum auflösbar.'
            },
            {
              term: 'Nebenkeulenunterdrückung',
              description:
                'P2 verhindert Antworten auf Abfragen, die nur über eine Nebenkeule ankommen. Ohne sie erschiene ein Ziel mehrfach unter falschen Richtungen.'
            },
            {
              term: 'Abhilfe durch Modus S',
              description:
                'Selektive Abfrage, Sperrlisten und die Prüfsumme mit eingerechneter Adresse begrenzen die Zahl unnötiger Antworten. Trotzdem ist die Belastung von ' +
                formatFrequency(SSR_REPLY_HZ, 0) +
                ' in dicht beflogenen Räumen ein dauerhaftes Planungsthema — auch deshalb wird ADS-B zusätzlich über andere Wege verbreitet.'
            }
          ]
        },
        {
          type: 'question',
          question:
            'Warum antwortet ein Transponder nicht, wenn er den Kontrollimpuls P2 stärker empfängt als P1?',
          answer:
            'Weil P1 und P3 über die schmale Richtkeule abgestrahlt werden, P2 dagegen über eine Rundstrahlantenne mit definiertem Pegel. Ist P2 stärker, kann die Abfrage nicht aus der Hauptkeule stammen — das Luftfahrzeug steht also nicht in der Richtung, die die Bodenstation gerade misst. Eine Antwort würde dort ein Geisterziel erzeugen.'
        }
      ]
    }
  ],
  sources: [
    'ICAO Annex 10, <em>Aeronautical Telecommunications</em>, Vol. IV (Surveillance and Collision Avoidance Systems), Kap. 3 — Impulsabstände P1/P2/P3, Antwortrahmen, Modus-S-Formate, ACAS.',
    'ICAO Doc 4444, <em>Air Traffic Management</em> — Codes 7500, 7600, 7700.',
    'EUROCONTROL, <em>Principles of Mode S Operation and Interrogator Codes</em> — selektive Abfrage, Sperrlisten, Kanalbelastung.',
    'RTCA DO-260B / EUROCAE ED-102A — ADS-B über 1090 MHz Extended Squitter.'
  ]
};
