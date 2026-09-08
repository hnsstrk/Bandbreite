/**
 * Inhalt des Kapitels „HF-Mathematik" (/wissen/mathematik/).
 * Behebt F-07/F-12/F-20: Die Seite rechnet nichts mehr selbst – jedes Zahlenbeispiel
 * stammt aus $lib/utils (calculateFSPL, frequencyToWavelength, calculateShannonCapacity,
 * calculateRadioHorizon) bzw. aus RCS_REFERENCE und der dB-Tabelle des Widgets.
 */
import type { KnowledgeArticle } from './types';
import {
  frequencyToWavelength,
  calculateFSPL,
  getFsplConstant,
  calculateShannonCapacity,
  calculateSpectralEfficiency,
  snrDbToLinear
} from '$lib/utils/calculations';
import { calculateRadioHorizon } from '$lib/data/propagation';
import {
  RCS_REFERENCE,
  EARTH_RADIUS_MEAN,
  EFFECTIVE_EARTH_RADIUS_FACTOR
} from '$lib/data/constants';
import { SPEED_OF_LIGHT_EXACT_DISPLAY } from '$lib/utils/constants';
import {
  formatWavelength,
  formatNumber,
  formatDataRate,
  formatRcs,
  formatFrequency
} from '$lib/utils/formatting';
import { buildDecibelTable } from '$lib/components/widgets/DecibelModel';

const WAVELENGTH_EXAMPLES = [
  { frequencyHz: 100e6, application: 'UKW-Rundfunk' },
  { frequencyHz: 2.4e9, application: 'WLAN, Mikrowellenherd' },
  { frequencyHz: 5e9, application: 'WLAN 5 GHz' },
  { frequencyHz: 28e9, application: '5G mmWave' },
  { frequencyHz: 77e9, application: 'Automotive-Radar' }
];

const FSPL_EXAMPLES = [
  { distanceM: 100, frequencyHz: 2.4e9 },
  { distanceM: 1000, frequencyHz: 2.4e9 },
  { distanceM: 1000, frequencyHz: 5e9 },
  { distanceM: 10_000, frequencyHz: 2.4e9 },
  { distanceM: 36_000_000, frequencyHz: 12e9 }
];

const SHANNON_EXAMPLES = [
  { standard: 'WLAN 802.11n', bandwidthHz: 40e6, snrDb: 25 },
  { standard: 'LTE (20 MHz)', bandwidthHz: 20e6, snrDb: 20 },
  { standard: '5G NR (100 MHz)', bandwidthHz: 100e6, snrDb: 20 }
];

const HORIZON_EXAMPLES = [
  { heightM: 2, label: 'Handfunkgerät' },
  { heightM: 10, label: 'Dachantenne' },
  { heightM: 30, label: 'Hausdach' },
  { heightM: 100, label: 'Funkturm' },
  { heightM: 300, label: 'Fernsehturm' }
];

const SNR_EXAMPLE_DB = 20;
const EARTH_RADIUS_KM_DISPLAY = formatNumber(EARTH_RADIUS_MEAN / 1000, 0);

const wavelengthRows = WAVELENGTH_EXAMPLES.map((e) => [
  formatFrequency(e.frequencyHz, e.frequencyHz % 1e9 === 0 || e.frequencyHz < 1e9 ? 0 : 1),
  formatWavelength(frequencyToWavelength(e.frequencyHz), 1),
  e.application
]);

const fsplRows = FSPL_EXAMPLES.map((e) => [
  formatFrequency(e.frequencyHz, 1),
  e.distanceM >= 1000
    ? `${formatNumber(e.distanceM / 1000, 0)} km`
    : `${formatNumber(e.distanceM, 0)} m`,
  `${formatNumber(calculateFSPL(e.distanceM, e.frequencyHz), 1)} dB`
]);

const shannonRows = SHANNON_EXAMPLES.map((e) => [
  e.standard,
  formatFrequency(e.bandwidthHz, 0),
  `${e.snrDb} dB`,
  formatDataRate(calculateShannonCapacity(e.bandwidthHz, e.snrDb), 0),
  `${formatNumber(calculateSpectralEfficiency(e.snrDb), 2)} bit/s/Hz`
]);

const decibelRows = buildDecibelTable().map((row) => [
  `${row.db > 0 ? '+' : ''}${row.db} dB`,
  `× ${formatNumber(row.powerRatio, row.powerRatio >= 100 ? 0 : 2)}`,
  `× ${formatNumber(row.voltageRatio, row.voltageRatio >= 100 ? 0 : 2)}`
]);

const horizonRows = HORIZON_EXAMPLES.map((e) => [
  `${e.heightM} m (${e.label})`,
  `${formatNumber(calculateRadioHorizon(e.heightM, false), 1)} km`,
  `${formatNumber(calculateRadioHorizon(e.heightM, true), 1)} km`
]);

const rcsRows = RCS_REFERENCE.map((entry) => [entry.nameDE, formatRcs(entry.rcsM2)]);

export const mathematikArticle: KnowledgeArticle = {
  href: '/wissen/mathematik/',
  kicker: 'Wissen · Grundlagen',
  title: 'HF-Mathematik',
  icon: 'calculator',
  lead: 'Die sechs Formeln, ohne die in der Hochfrequenztechnik nichts geht: Wellenlänge, Freiraumdämpfung, Radargleichung, Shannon-Kapazität, Dezibel und Radiohorizont – mit Herleitung, berechneten Beispielen und Reglern zum Ausprobieren.',
  meta: [{ label: 'Lichtgeschwindigkeit', value: `${SPEED_OF_LIGHT_EXACT_DISPLAY} m/s` }],
  goals: [
    'Frequenz und Wellenlänge über λ = c/f ineinander umrechnen und Größenordnungen (m, cm, mm) sicher zuordnen',
    'die Freiraumdämpfung aus Distanz und Frequenz berechnen und die 6-dB-Regel bei Verdopplung anwenden',
    'das R⁴-Gesetz der Radargleichung aus zwei Kugelwellen herleiten',
    'die Shannon-Kapazität aus Bandbreite und SNR bestimmen und SNR zwischen dB und linear umrechnen',
    'mit dB rechnen: Faktor 10 vs. 20, dBm/dBW, Kettenrechnung durch Addition',
    'den Radiohorizont mit dem 4/3-Erde-Modell abschätzen'
  ],
  sections: [
    {
      id: 'wellenlaenge',
      title: 'Wellenlänge und Frequenz',
      description:
        'Wellenlänge und Frequenz einer elektromagnetischen Welle sind über die Lichtgeschwindigkeit verknüpft – die Basis fast jeder HF-Rechnung.',
      blocks: [
        {
          type: 'formula',
          formula: 'λ = c / f',
          alt: 'Lambda gleich c geteilt durch f',
          label: 'Wellenlänge',
          number: '(1)',
          variables: [
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            {
              symbol: 'c',
              meaning: `Lichtgeschwindigkeit im Vakuum, ${SPEED_OF_LIGHT_EXACT_DISPLAY} m/s`
            },
            { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
          ]
        },
        {
          type: 'paragraph',
          html: '<strong>Herleitung:</strong> Eine ebene Welle hat die Phase φ = ω·t − k·x mit der Kreisfrequenz ω = 2π·f und der Wellenzahl k = 2π/λ. Ihre Phasengeschwindigkeit ist v = ω/k = f·λ. Im Vakuum ist v = c, also c = f·λ und damit λ = c/f.'
        },
        {
          type: 'table',
          caption: 'Berechnet mit frequencyToWavelength()',
          columns: ['Frequenz', 'Wellenlänge', 'Anwendung'],
          rows: wavelengthRows,
          monoColumns: [1]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Faustregel',
          html: '300 geteilt durch die Frequenz in MHz ergibt die Wellenlänge in Metern: 300/100 MHz = 3 m, 300/2400 MHz = 12,5 cm. Zum Umrechnen: <a href="/konverter/frequenz/">Frequenz-Konverter</a>.'
        }
      ]
    },
    {
      id: 'fspl',
      title: 'Freiraumdämpfung (FSPL)',
      description:
        'Die Freiraumdämpfung beschreibt den Signalverlust einer Welle im freien Raum ohne Hindernisse oder Atmosphäre – rein durch die geometrische Ausbreitung.',
      blocks: [
        {
          type: 'formula',
          formula: 'FSPL = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)',
          alt: 'FSPL gleich 20 log d plus 20 log f plus 20 log 4 Pi durch c',
          label: `Freiraumdämpfung in dB; die Konstante 20·log₁₀(4π/c) beträgt ${formatNumber(getFsplConstant(), 3)} dB`,
          number: '(2)',
          variables: [
            { symbol: 'd', meaning: 'Distanz', unit: 'm' },
            { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' },
            { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' }
          ]
        },
        {
          type: 'paragraph',
          html: '<strong>Herleitung aus der Friis-Gleichung:</strong> Ein isotroper Strahler verteilt P_t auf die Kugelfläche 4π·d², die Leistungsdichte ist S = P_t/(4π·d²). Eine isotrope Empfangsantenne hat die Wirkfläche A_e = λ²/(4π), empfängt also P_r = S·A_e = P_t·λ²/(4π·d)². Das Verhältnis P_t/P_r in dB ist die FSPL: 20·log₁₀(4π·d/λ) = 20·log₁₀(4π·d·f/c).'
        },
        {
          type: 'table',
          caption: 'Berechnet mit calculateFSPL()',
          columns: ['Frequenz', 'Distanz', 'FSPL'],
          rows: fsplRows,
          monoColumns: [1, 2]
        },
        {
          type: 'list',
          items: [
            '<strong>Verdopplung der Distanz</strong> → +6 dB Dämpfung (20·log₁₀ 2 ≈ 6,02 dB).',
            '<strong>Verdopplung der Frequenz</strong> → +6 dB Dämpfung; die Wirkfläche der Antenne schrumpft mit λ².',
            'Die FSPL enthält keine Absorption – Regen, Gase und Hindernisse kommen zusätzlich dazu.'
          ]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Zum Rechner',
          html: 'Der <a href="/rechner/fspl/">FSPL-Rechner</a> zeigt die Dämpfung als Kurve über Frequenz und Distanz, der <a href="/rechner/link-budget/">Link-Budget-Rechner</a> setzt sie in eine vollständige Leistungsbilanz ein.'
        }
      ]
    },
    {
      id: 'radargleichung',
      title: 'Radargleichung',
      description:
        'Die Radargleichung beschreibt die empfangene Leistung nach Reflexion an einem Ziel – Hin- und Rückweg plus Rückstreuquerschnitt.',
      blocks: [
        {
          type: 'formula',
          formula: 'P_r = P_t · G² · λ² · σ / ((4π)³ · R⁴)',
          alt: 'P r gleich P t mal G Quadrat mal Lambda Quadrat mal Sigma, geteilt durch 4 Pi hoch 3 mal R hoch 4',
          label: 'Radargleichung (ohne Verluste)',
          number: '(3)',
          variables: [
            { symbol: 'P_r', meaning: 'Empfangene Leistung', unit: 'W' },
            { symbol: 'P_t', meaning: 'Sendeleistung', unit: 'W' },
            {
              symbol: 'G',
              meaning: 'Antennengewinn (linear, gleiche Antenne für Senden und Empfangen)'
            },
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            { symbol: 'σ', meaning: 'Radarquerschnitt des Ziels', unit: 'm²' },
            { symbol: 'R', meaning: 'Entfernung zum Ziel', unit: 'm' }
          ]
        },
        {
          type: 'paragraph',
          html: '<strong>Herleitung:</strong> Leistungsdichte am Ziel S₁ = P_t·G/(4π·R²); das Ziel streut P_refl = S₁·σ isotrop zurück; am Empfänger herrscht S₂ = P_refl/(4π·R²); die Antenne fängt mit A_e = G·λ²/(4π) die Leistung P_r = S₂·A_e ein. Zweimal 1/R² ergibt 1/R⁴.'
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'R⁴-Gesetz',
          html: 'Die Empfangsleistung nimmt mit der <strong>vierten Potenz</strong> der Entfernung ab. Für die doppelte Reichweite braucht ein Radar die 16-fache Sendeleistung (+12 dB).'
        },
        {
          type: 'table',
          caption: 'Typische Radarquerschnitte (Skolnik, Tab. 2.2; Quelle: RCS_REFERENCE)',
          columns: ['Objekt', 'σ'],
          rows: rcsRows,
          monoColumns: [1]
        },
        {
          type: 'paragraph',
          html: 'Impulsradar, Doppler-Effekt und Radarquerschnitt mit interaktiven Widgets: Kapitel <a href="/wissen/radar/">Radar-Grundlagen</a>. Zahlen einsetzen: <a href="/rechner/radar/">Radar-Reichweitenrechner</a>.'
        }
      ]
    },
    {
      id: 'shannon',
      title: 'Shannon-Hartley-Theorem',
      description:
        'Die theoretische Obergrenze der fehlerfreien Datenrate über einen gestörten Kanal – das Fundament der digitalen Nachrichtentechnik.',
      blocks: [
        {
          type: 'formula',
          formula: 'C = B · log₂(1 + SNR)',
          alt: 'C gleich B mal Logarithmus zur Basis 2 von 1 plus SNR',
          label: 'Kanalkapazität',
          number: '(4)',
          variables: [
            {
              symbol: 'C',
              meaning: 'Kanalkapazität (maximale fehlerfreie Datenrate)',
              unit: 'bit/s'
            },
            { symbol: 'B', meaning: 'Bandbreite des Kanals', unit: 'Hz' },
            { symbol: 'SNR', meaning: 'Signal-Rausch-Verhältnis – linear, nicht in dB' }
          ]
        },
        {
          type: 'formula',
          formula: 'SNR = 10^(SNR_dB / 10)',
          alt: 'SNR linear gleich 10 hoch SNR in dB geteilt durch 10',
          label: `SNR-Umrechnung: ${SNR_EXAMPLE_DB} dB entsprechen SNR = ${formatNumber(snrDbToLinear(SNR_EXAMPLE_DB), 0)}`,
          number: '(5)'
        },
        {
          type: 'paragraph',
          html: 'Die <strong>spektrale Effizienz</strong> η = C/B = log₂(1 + SNR) gibt an, wie viele Bit pro Sekunde und Hertz Bandbreite maximal möglich sind. Reale Systeme bleiben wegen Codierung, Roll-off und Signalisierung darunter.'
        },
        {
          type: 'table',
          caption: 'Berechnet mit calculateShannonCapacity() und calculateSpectralEfficiency()',
          columns: ['Standard', 'Bandbreite', 'Typ. SNR', 'Shannon-Grenze', 'η'],
          rows: shannonRows,
          monoColumns: [1, 2, 3, 4]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Zum Rechner',
          html: 'Der <a href="/rechner/kanalkapazitaet/">Kanalkapazitäts-Rechner</a> vergleicht die Shannon-Grenze mit realen Modulationsverfahren.'
        }
      ]
    },
    {
      id: 'dezibel',
      title: 'Dezibel-Rechnung',
      description:
        'Das Dezibel ist ein logarithmisches Verhältnismaß: Verstärkungen und Dämpfungen werden addiert statt multipliziert.',
      blocks: [
        {
          type: 'formula',
          formula: 'dB = 10·log₁₀(P₂/P₁)   |   dB = 20·log₁₀(U₂/U₁)',
          alt: 'dB gleich 10 log P2 durch P1 für Leistungen, beziehungsweise 20 log U2 durch U1 für Spannungen',
          label: 'Leistungs- und Spannungsverhältnis in dB',
          number: '(6)'
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Warum 10 und 20?',
          html: 'Leistung ist proportional zum Quadrat der Spannung, P ∝ U². Deshalb ist 10·log₁₀(P₂/P₁) = 10·log₁₀((U₂/U₁)²) = 20·log₁₀(U₂/U₁) – derselbe dB-Wert, zwei Faktoren.'
        },
        { type: 'widget', id: 'decibel' },
        {
          type: 'definitions',
          items: [
            {
              term: 'dBm',
              description:
                'Leistung bezogen auf 1 mW: P_dBm = 10·log₁₀(P/1 mW). 0 dBm = 1 mW, 30 dBm = 1 W.'
            },
            {
              term: 'dBW',
              description:
                'Leistung bezogen auf 1 W: P_dBW = 10·log₁₀(P/1 W). Umrechnung: dBm = dBW + 30.'
            },
            {
              term: 'dBµV',
              description:
                'Spannung bezogen auf 1 µV: U_dBµV = 20·log₁₀(U/1 µV) – üblich in EMV und Antennenmesstechnik.'
            },
            { term: 'dBi', description: 'Antennengewinn bezogen auf den isotropen Kugelstrahler.' }
          ]
        },
        {
          type: 'table',
          caption: 'Umrechnungstabelle, berechnet mit 10^(dB/10) und 10^(dB/20)',
          columns: ['dB', 'Leistungsfaktor', 'Spannungsfaktor'],
          rows: decibelRows,
          monoColumns: [1, 2]
        },
        {
          type: 'list',
          items: [
            '<strong>+3 dB</strong> ≈ doppelte Leistung, <strong>−3 dB</strong> ≈ halbe Leistung (Bandbreitengrenze).',
            '<strong>+10 dB</strong> = zehnfache Leistung, <strong>+20 dB</strong> = hundertfache Leistung.',
            '<strong>+6 dB</strong> = doppelte Spannung = vierfache Leistung.'
          ]
        }
      ]
    },
    {
      id: 'radiohorizont',
      title: 'Radiohorizont',
      description:
        'Die maximale Entfernung einer direkten Sichtverbindung, begrenzt durch Erdkrümmung und atmosphärische Refraktion.',
      blocks: [
        {
          type: 'formula',
          formula: 'd = √(2 · k · R · h)',
          alt: 'd gleich Wurzel aus 2 mal k mal R mal h',
          label: 'Radiohorizont einer Antenne',
          number: '(7)',
          variables: [
            { symbol: 'd', meaning: 'Distanz zum Horizont', unit: 'km' },
            {
              symbol: 'k',
              meaning: `Refraktionsfaktor, typisch 4/3 ≈ ${formatNumber(EFFECTIVE_EARTH_RADIUS_FACTOR, 3)}`
            },
            { symbol: 'R', meaning: `Erdradius, ${EARTH_RADIUS_KM_DISPLAY} km` },
            { symbol: 'h', meaning: 'Antennenhöhe', unit: 'km' }
          ]
        },
        {
          type: 'callout',
          tone: 'info',
          title: '4/3-Erde-Modell',
          html: 'Die Troposphäre bricht Funkwellen leicht zur Erde hin. Rechnerisch vergrößert man dafür den Erdradius um den Faktor k = 4/3 – die Welle läuft dann wieder geradlinig über einer „flacheren" Erde.'
        },
        {
          type: 'formula',
          formula: 'd_max = √(2·k·R·h₁) + √(2·k·R·h₂)',
          alt: 'd max gleich Wurzel aus 2 k R h1 plus Wurzel aus 2 k R h2',
          label: 'Maximale Sichtverbindung zwischen zwei Antennen',
          number: '(8)'
        },
        {
          type: 'table',
          caption: 'Berechnet mit calculateRadioHorizon()',
          columns: ['Antennenhöhe', 'Ohne Refraktion (k = 1)', 'Mit Refraktion (k = 4/3)'],
          rows: horizonRows,
          monoColumns: [1, 2]
        },
        { type: 'widget', id: 'propagation-sandbox' }
      ]
    }
  ],
  sources: [
    'H. T. Friis, „A Note on a Simple Transmission Formula", Proc. IRE 34 (1946) – Freiraumdämpfung.',
    'C. E. Shannon, „A Mathematical Theory of Communication", Bell System Technical Journal 27 (1948).',
    'ITU-R P.525 (Freiraumdämpfung), ITU-R P.834 (Refraktion, 4/3-Erde).',
    'M. I. Skolnik, <em>Introduction to Radar Systems</em>, 3. Aufl. – Radargleichung und RCS-Tabelle.'
  ]
};
