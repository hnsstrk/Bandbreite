/**
 * Inhalt des Kapitels „Dezibel und Pegel" (/wissen/grundlagen/dezibel/).
 *
 * Die Merkregel- und Pegeltabellen entstehen aus `utils/decibel.ts`
 * (`buildDecibelTable`, `accumulateChain`, `levelsFromDbm`) — kein Wert im
 * Text ist getippt.
 */
import type { KnowledgeArticle } from '../types';
import {
  DBM_PER_DBW,
  IMPEDANCE_RF_OHM,
  accumulateChain,
  buildDecibelTable,
  chainTotalDbm,
  dbmToDbuvOffset,
  levelsFromDbm,
  type ChainStage
} from '$lib/utils/decibel';
import { GAIN_DIPOLE_DBI } from '$lib/data/antennas';
import { formatNumber, formatPowerWatts } from '$lib/utils/formatting';

/** Stützstellen der Merkregel-Tabelle. */
const TABLE_STEPS = [0, 1, 3, 6, 10, 20, 30, -3, -10, -20];

/** Beispiel-Pegelplan einer kleinen Richtfunkstrecke. */
const PLAN: ChainStage[] = [
  { id: 'tx', label: 'Sender (1 W)', db: 30 },
  { id: 'kabel-tx', label: 'Speisekabel Sender', db: -2.5 },
  { id: 'ant-tx', label: 'Sendeantenne', db: 18 },
  { id: 'fspl', label: 'Freiraumdämpfung', db: -110 },
  { id: 'ant-rx', label: 'Empfangsantenne', db: 18 },
  { id: 'kabel-rx', label: 'Speisekabel Empfänger', db: -2.5 }
];

const ratio = (value: number) =>
  value >= 1 ? `${formatNumber(value, 3)} ×` : `1 / ${formatNumber(1 / value, 3)}`;

const tableRows = buildDecibelTable(TABLE_STEPS).map((row) => [
  `${row.db > 0 ? '+' : ''}${formatNumber(row.db, 0)} dB`,
  ratio(row.powerRatio),
  ratio(row.voltageRatio)
]);

const planRows = accumulateChain(PLAN).map((point) => [
  point.stage.label,
  `${point.stage.db > 0 ? '+' : ''}${formatNumber(point.stage.db, 1)} dB`,
  `${formatNumber(point.levelDbm, 1)} dBm`
]);

const planTotal = formatNumber(chainTotalDbm(PLAN), 1);
const planLevels = levelsFromDbm(chainTotalDbm(PLAN));
const planWatt = formatPowerWatts(planLevels.watt, 2);
const planDbuv = formatNumber(planLevels.dbuv, 1);
const dbuvOffset = formatNumber(dbmToDbuvOffset(IMPEDANCE_RF_OHM), 2);
const oneWattDbm = formatNumber(DBM_PER_DBW, 0);
const dipoleOffset = formatNumber(GAIN_DIPOLE_DBI, 2);

export const dezibelArticle: KnowledgeArticle = {
  href: '/wissen/grundlagen/dezibel/',
  kicker: 'Wissen · Grundlagen',
  title: 'Dezibel und Pegel',
  icon: 'calculator',
  lead: 'Die Funktechnik rechnet nicht in Watt, sondern in Dezibel. Der Grund ist praktisch: Über eine Funkstrecke fällt die Leistung um zwölf Größenordnungen und mehr, und in der logarithmischen Darstellung wird aus jeder Multiplikation eine Addition. Dieses Kapitel erklärt 10·log und 20·log, die gebräuchlichen Bezugspegel und die Fallstricke.',
  meta: [{ label: 'Quellen', value: 'ITU-R V.574-5, IEC 60027-3, IEEE Std 100' }],
  goals: [
    'begründen, warum Pegel logarithmisch angegeben werden',
    '10·log₁₀ für Leistungen und 20·log₁₀ für Spannungen und Feldstärken richtig einsetzen',
    'dB, dBm, dBW, dBµV, dBi, dBd und dBc auseinanderhalten',
    'die 3-dB- und 10-dB-Merkregeln im Kopf anwenden',
    'einen Pegelplan als Kettenrechnung aufstellen',
    'die typischen Fehler erkennen — allen voran die Addition zweier dBm-Werte'
  ],
  sections: [
    {
      id: 'warum-logarithmisch',
      title: 'Warum logarithmisch?',
      blocks: [
        {
          type: 'paragraph',
          html: 'Ein Sender liefert vielleicht 10 W, am Empfänger kommen 0,000 000 000 001 W an. Zwischen beiden liegen zwölf Zehnerpotenzen. Solche Zahlen sind weder les- noch rechenbar. Das Dezibel löst gleich drei Probleme auf einmal: Es macht den Zahlenbereich handhabbar, es verwandelt Multiplikationen in Additionen, und es entspricht der Empfindung — das Ohr wie das Auge bewerten Reize annähernd logarithmisch.'
        },
        {
          type: 'formula',
          formula: 'a = 10 · log₁₀(P₂ / P₁)',
          alt: 'a gleich zehn mal Logarithmus zur Basis zehn von P zwei durch P eins',
          label: 'Leistungsverhältnis in Dezibel',
          number: '(1)',
          variables: [
            { symbol: 'a', meaning: 'Pegelmaß (Gewinn positiv, Dämpfung negativ)', unit: 'dB' },
            { symbol: 'P₂/P₁', meaning: 'Verhältnis zweier Leistungen', unit: '—' }
          ]
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Bel und Dezibel',
          html: 'Die Grundeinheit ist das <strong>Bel</strong> — der dekadische Logarithmus des Leistungsverhältnisses. Weil das für die Praxis zu grob ist, rechnet man mit dem zehnten Teil davon, dem Dezibel. Daher der Faktor 10.',
          source: 'IEC 60027-3, ITU-R V.574-5'
        },
        {
          type: 'paragraph',
          html: 'Was das in der Darstellung ausmacht, zeigen die beiden Achsen im folgenden Widget: Derselbe Marker macht zweimal denselben Schritt — auf der linearen Achse einmal unsichtbar klein und einmal über die ganze Breite, auf der Dezibel-Achse zweimal als gerade Strecke.'
        },
        { type: 'widget', id: 'log-linear' }
      ]
    },
    {
      id: 'zehn-und-zwanzig',
      title: '10·log oder 20·log?',
      description:
        'Der Faktor hängt davon ab, ob eine Leistungsgröße oder eine Feldgröße im Spiel ist — nicht davon, was man gerade erreichen will.',
      blocks: [
        {
          type: 'paragraph',
          html: 'Leistung, Energie und Leistungsdichte sind <strong>Leistungsgrößen</strong>; sie werden mit 10·log₁₀ gerechnet. Spannung, Strom, elektrische und magnetische Feldstärke sind <strong>Feldgrößen</strong>; weil die Leistung mit ihrem Quadrat geht (P = U²/Z), erscheint der Faktor 2 aus dem Logarithmus des Quadrats — also 20·log₁₀.'
        },
        {
          type: 'formula',
          formula: 'a = 20 · log₁₀(U₂ / U₁) = 10 · log₁₀(U₂² / U₁²)',
          alt: 'a gleich zwanzig mal Logarithmus von U zwei durch U eins gleich zehn mal Logarithmus des Quadrats',
          label: 'Spannungs- und Feldstärkeverhältnis',
          number: '(2)'
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Nur an gleicher Impedanz',
          html: 'Beide Formeln beschreiben denselben Pegel — aber nur, wenn Ein- und Ausgang dieselbe Impedanz haben. Bei einem Übertrager mit unterschiedlichen Impedanzen führt die Spannungsformel in die Irre; dann ist die Leistungsformel maßgeblich.'
        },
        {
          type: 'table',
          caption: 'Merkregeln: Dezibel, Leistungsfaktor und Spannungsfaktor',
          columns: ['Pegel', 'Leistung ändert sich um', 'Spannung/Feldstärke ändert sich um'],
          monoColumns: [0, 1, 2],
          rows: tableRows
        },
        {
          type: 'list',
          items: [
            '<strong>3 dB</strong> = doppelte Leistung. Zweimal 3 dB (also 6 dB) = vierfache Leistung.',
            '<strong>10 dB</strong> = zehnfache Leistung. Dreimal 10 dB (also 30 dB) = tausendfache Leistung.',
            '<strong>6 dB</strong> = doppelte Feldstärke oder Spannung — deshalb kostet die doppelte Entfernung im Freiraum genau 6 dB.',
            'Alles dazwischen setzt man zusammen: 13 dB = 10 dB + 3 dB = Faktor 20 in der Leistung.'
          ]
        }
      ]
    },
    {
      id: 'absolute-pegel',
      title: 'Absolute Pegel: dBm, dBW, dBµV und die Antennenmaße',
      description:
        'Ein reines dB ist ein Verhältnis. Erst der angehängte Buchstabe nennt die Bezugsgröße und macht daraus einen absoluten Wert.',
      blocks: [
        {
          type: 'definitions',
          variant: 'term',
          items: [
            {
              term: 'dB',
              description:
                'Reines Verhältnis, etwa ein Gewinn oder eine Dämpfung. Kein absoluter Wert.'
            },
            {
              term: 'dBm',
              description: `Leistungspegel bezogen auf 1 mW. 1 W = ${oneWattDbm} dBm, 1 mW = 0 dBm, 1 µW = −30 dBm.`
            },
            {
              term: 'dBW',
              description: `Leistungspegel bezogen auf 1 W. Immer ${oneWattDbm} dB kleiner als der dBm-Wert.`
            },
            {
              term: 'dBµV',
              description: `Spannungspegel bezogen auf 1 µV. An ${formatNumber(IMPEDANCE_RF_OHM, 0)} Ω gilt dBµV = dBm + ${dbuvOffset}.`
            },
            {
              term: 'dBµV/m',
              description:
                'Feldstärkepegel bezogen auf 1 µV/m — die übliche Einheit in Feldstärkemessungen und Rundfunkversorgungsplänen.'
            },
            {
              term: 'dBi',
              description:
                'Antennengewinn bezogen auf den isotropen Kugelstrahler. Der Bezugswert der Funkplanung.'
            },
            {
              term: 'dBd',
              description: `Antennengewinn bezogen auf den Halbwellendipol. dBi = dBd + ${dipoleOffset}, weil der Dipol selbst schon ${dipoleOffset} dBi hat.`
            },
            {
              term: 'dBc',
              description:
                'Pegel bezogen auf den Träger (carrier) — üblich für Nebenaussendungen, Oberwellen und Phasenrauschen.'
            }
          ]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Die Einheit verrät den Bezug',
          html: `Wer „Gewinn 12 dB" schreibt, sagt nicht, worauf. In Antennendatenblättern sind 12 dBd und 12 dBi um ${dipoleOffset} dB verschieden — bei einer Reichweitenrechnung ein spürbarer Unterschied. Umrechnen lässt sich das im <a href="/rechner/dezibel/">Pegelrechner</a> und im <a href="/rechner/antennengewinn/">Antennengewinn-Rechner</a>.`
        }
      ]
    },
    {
      id: 'kettenrechnung',
      title: 'Kettenrechnung und Pegelplan',
      description:
        'In der logarithmischen Welt ist eine Übertragungsstrecke eine einfache Summe: Startpegel plus alle Gewinne minus alle Verluste.',
      blocks: [
        { type: 'widget', id: 'decibel' },
        {
          type: 'formula',
          formula: 'P_rx = P_tx + G_tx − L_ges + G_rx',
          alt: 'P Empfang gleich P Sender plus G Sender minus L gesamt plus G Empfänger',
          label: 'Pegelplan als Summe',
          number: '(3)',
          variables: [
            { symbol: 'P_rx', meaning: 'Empfangspegel', unit: 'dBm' },
            { symbol: 'P_tx', meaning: 'Sendeleistung', unit: 'dBm' },
            { symbol: 'G', meaning: 'Antennengewinne', unit: 'dBi' },
            {
              symbol: 'L_ges',
              meaning: 'Summe aller Verluste (Kabel, Strecke, Stecker)',
              unit: 'dB'
            }
          ]
        },
        {
          type: 'table',
          caption: 'Beispiel-Pegelplan einer kurzen Richtfunkstrecke',
          columns: ['Stufe', 'Beitrag', 'Pegel danach'],
          monoColumns: [1, 2],
          rows: planRows
        },
        {
          type: 'paragraph',
          html: `Am Ende der Kette stehen ${planTotal} dBm, also ${planWatt} oder ${planDbuv} dBµV an ${formatNumber(IMPEDANCE_RF_OHM, 0)} Ω. Aus einer Multiplikation über zwölf Zehnerpotenzen ist eine Addition von sechs Zahlen geworden — und man sieht auf einen Blick, welche Stufe den größten Beitrag liefert. Genau so arbeitet der <a href="/rechner/link-budget/">Link-Budget-Rechner</a>.`
        }
      ]
    },
    {
      id: 'fehler',
      title: 'Typische Fehler',
      blocks: [
        {
          type: 'callout',
          tone: 'warning',
          title: 'dBm plus dBm ergibt kein dBm',
          html: `Zwei Sender mit je 0 dBm liefern zusammen nicht 0 dBm + 0 dBm = 0 dBm² und auch keine 0 dBm, sondern 1 mW + 1 mW = 2 mW = +3 dBm. <strong>Absolutpegel werden nie addiert.</strong> Addiert werden nur Verhältnisse (dB) zu einem Absolutpegel — oder man rechnet die Leistungen in Watt zurück, summiert dort und wandelt wieder um.`
        },
        {
          type: 'list',
          items: [
            '<strong>Falscher Faktor:</strong> 20·log auf eine Leistung angewandt verdoppelt den Pegel. Faustregel: Watt → 10·log, Volt und V/m → 20·log.',
            '<strong>Bezug vergessen:</strong> „−100 dB Empfindlichkeit" ist keine Angabe; gemeint sind fast immer −100 dBm.',
            '<strong>dBi und dBd verwechselt:</strong> kostet oder schenkt pauschal ' +
              dipoleOffset +
              ' dB.',
            '<strong>Vorzeichen der Dämpfung:</strong> Eine Kabeldämpfung von 3 dB ist ein Beitrag von −3 dB in der Kette. Beides doppelt abgezogen ergibt 6 dB Fehler.',
            '<strong>Effektivwert und Spitzenwert:</strong> dBµV bezieht sich auf den Effektivwert; Spitzenwerte liegen bei sinusförmigen Signalen 3 dB höher.'
          ]
        },
        {
          type: 'question',
          question:
            'Ein Verstärker hat 20 dB Gewinn, das nachfolgende Kabel 6 dB Dämpfung. Wie viel Leistung kommt hinten an, wenn vorne 1 mW anliegt?',
          answer:
            '0 dBm + 20 dB − 6 dB = +14 dBm. Das entspricht dem Faktor 10^(14/10) ≈ 25, also rund 25 mW. In Watt gerechnet: 1 mW · 100 / 4 = 25 mW — dieselbe Zahl, nur mühsamer.'
        }
      ]
    },
    {
      id: 'weiterrechnen',
      title: 'Selbst nachrechnen',
      blocks: [
        {
          type: 'list',
          items: [
            '<a href="/rechner/dezibel/">Dezibel-Rechner</a>: Faktor ↔ dB, dBm ↔ W ↔ dBµV und Kettenrechnung.',
            '<a href="/spektrum/">Spektrum-Dashboard</a>: Leistungskonverter W ↔ dBm direkt an der Frequenzskala.',
            '<a href="/wissen/grundlagen/leistung-und-pegel/">Leistung, EIRP und Feldstärke</a>: Pegel auf eine reale Sendeanlage angewandt.',
            '<a href="/wissen/mathematik/">HF-Mathematik</a>: Herleitungen und die übrigen Formeln der Funkplanung.'
          ]
        }
      ]
    }
  ],
  sources: [
    'ITU-R V.574-5 — Gebrauch des Dezibels und des Nepers in der Fernmeldetechnik.',
    'IEC 60027-3 — Logarithmische Größen und Einheiten, Leistungs- und Feldgrößen.',
    'IEEE Std 100 — Definitionen zu dBm, dBW, dBµV, dBi, dBd und dBc.',
    'Meinke, H.; Gundlach, F. W.: <em>Taschenbuch der Hochfrequenztechnik</em> — Pegelrechnung und Pegelpläne.'
  ]
};
