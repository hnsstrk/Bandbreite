/**
 * Inhalt des Kapitels „Leistung, EIRP und Feldstärke"
 * (/wissen/grundlagen/leistung-und-pegel/).
 *
 * Sämtliche Zahlenwerte stammen aus `utils/fieldStrength.ts`; im Text steht
 * keine gerechnete Zahl, die nicht aus einer Funktion kommt.
 */
import type { KnowledgeArticle } from '../types';
import {
  DIPOLE_GAIN_LINEAR,
  FIELD_STRENGTH_FACTOR,
  computeFieldStrength,
  eirpWatt,
  erpWatt,
  fieldStrengthDbuvPerM,
  fieldStrengthVPerM
} from '$lib/utils/fieldStrength';
import { GAIN_DIPOLE_DBI } from '$lib/data/antennas';
import { FREE_SPACE_IMPEDANCE } from '$lib/data/constants';
import { formatDistance, formatNumber, formatPowerWatts } from '$lib/utils/formatting';

/** Referenzfall der Lehrbücher: 1 W an einer isotropen Antenne, 1 m Abstand. */
const REFERENCE = { txPowerW: 1, gainDbi: 0, distanceM: 1 };
/** Beispielanlage: 10 W an einer Rundstrahlantenne mit 8 dBi. */
const EXAMPLE = { txPowerW: 10, gainDbi: 8, distanceM: 100, frequencyHz: 900e6, rxGainDbi: 0 };
const DISTANCES_M = [1, 10, 100, 1000, 10_000];

const reference = computeFieldStrength(REFERENCE);
const example = computeFieldStrength(EXAMPLE);

const referenceField = formatNumber(reference.fieldVPerM, 2);
const factor = formatNumber(FIELD_STRENGTH_FACTOR, 2);
const impedance = formatNumber(FREE_SPACE_IMPEDANCE, 2);
const dipoleFactor = formatNumber(DIPOLE_GAIN_LINEAR, 2);
const dipoleDb = formatNumber(GAIN_DIPOLE_DBI, 2);
const erpOfOneWatt = formatNumber(erpWatt(eirpWatt(1, 0)), 2);
/** Typischer UKW-Rundfunksender: die ERP-Angabe der Vorschrift in EIRP umgerechnet. */
const BROADCAST_ERP_W = 100e3;
const broadcastEirp = formatPowerWatts(BROADCAST_ERP_W * DIPOLE_GAIN_LINEAR, 0);
const broadcastErp = formatPowerWatts(BROADCAST_ERP_W, 0);

const exampleEirp = formatPowerWatts(example.eirpW, 1);
const exampleErp = formatPowerWatts(example.erpW, 1);
const exampleDensity = formatNumber(example.powerDensityW * 1000, 3);
const exampleField = formatNumber(example.fieldVPerM * 1000, 1);
const exampleDbuv = formatNumber(example.fieldDbuvPerM, 1);
const exampleAperture = formatNumber(example.apertureM2 * 1e4, 1);
const exampleReceived = formatPowerWatts(example.receivedW, 2);

const distanceRows = DISTANCES_M.map((d) => {
  const field = fieldStrengthVPerM(example.eirpW, d);
  return [
    formatDistance(d, 0),
    field >= 0.01 ? `${formatNumber(field, 3)} V/m` : `${formatNumber(field * 1000, 1)} mV/m`,
    `${formatNumber(fieldStrengthDbuvPerM(field), 1)} dBµV/m`
  ];
});

export const leistungUndPegelArticle: KnowledgeArticle = {
  href: '/wissen/grundlagen/leistung-und-pegel/',
  kicker: 'Wissen · Grundlagen',
  title: 'Leistung, EIRP und Feldstärke',
  icon: 'signal',
  lead: 'Zwischen der Angabe auf dem Typenschild eines Senders und dem, was ein Messgerät in 100 m Entfernung anzeigt, liegen mehrere Rechenschritte: Antennengewinn, Bezugsgröße, Abstandsgesetz und die Umrechnung zwischen Leistungsdichte und Feldstärke. Dieses Kapitel geht den Weg von der Sendeleistung bis zur Empfangsleistung durch.',
  meta: [{ label: 'Quellen', value: 'Meinke/Gundlach, Pozar, IEEE Std 100, ITU-R V.574-5' }],
  goals: [
    'EIRP und ERP berechnen und den Unterschied von 2,15 dB begründen',
    'die Leistungsdichte im Abstand d aus dem EIRP bestimmen',
    'aus der Leistungsdichte die Feldstärke in V/m und in dBµV/m ableiten',
    'die Empfangsleistung über die Wirkfläche der Antenne bestimmen',
    'einordnen, wozu die Grenzwerte des Personenschutzes dienen',
    'die Größen im Link-Budget wiedererkennen'
  ],
  sections: [
    {
      id: 'sendeleistung',
      title: 'Sendeleistung — welche eigentlich?',
      blocks: [
        {
          type: 'paragraph',
          html: 'Die Angabe „10 Watt" ist mehrdeutig. Gemeint sein kann die Leistungsaufnahme aus dem Netz, die Ausgangsleistung der Endstufe oder die tatsächlich am Antennenfußpunkt ankommende Leistung. Für alles Weitere zählt nur die letzte: die <strong>Speiseleistung an der Antenne</strong>, also die Senderausgangsleistung abzüglich Kabel-, Stecker- und Weichenverlusten.'
        },
        {
          type: 'list',
          items: [
            'Bei Schmalbandsystemen ist die Trägerleistung gemeint, bei Impulssystemen unterscheidet man Impuls- und mittlere Leistung.',
            'Bei SSB nennt man die Spitzenleistung der Hüllkurve (PEP), nicht den Mittelwert.',
            'Reflexionen an einer fehlangepassten Antenne verringern die abgestrahlte Leistung zusätzlich — sichtbar am Stehwellenverhältnis.'
          ]
        }
      ]
    },
    {
      id: 'eirp-und-erp',
      title: 'EIRP und ERP',
      description:
        'Eine Richtantenne strahlt nicht mehr Leistung ab, sondern verteilt dieselbe Leistung ungleich. Das Ergebnis beschreibt man als äquivalente Strahlungsleistung.',
      blocks: [
        {
          type: 'formula',
          formula: 'EIRP = P · G  bzw.  EIRP[dBm] = P[dBm] + G[dBi]',
          alt: 'EIRP gleich P mal G, in Dezibel P in dBm plus G in dBi',
          label: 'Äquivalente isotrope Strahlungsleistung',
          number: '(1)',
          variables: [
            { symbol: 'EIRP', meaning: 'Strahlungsleistung bezogen auf den Kugelstrahler', unit: 'W bzw. dBm' },
            { symbol: 'P', meaning: 'Speiseleistung an der Antenne', unit: 'W' },
            { symbol: 'G', meaning: 'Antennengewinn (isotroper Bezug)', unit: 'dBi' }
          ]
        },
        {
          type: 'paragraph',
          html: `Das EIRP beantwortet die Frage: Wie viel Leistung müsste ein <strong>Kugelstrahler</strong> abgeben, um in der Hauptstrahlrichtung dieselbe Leistungsdichte zu erzeugen? Das ERP stellt dieselbe Frage mit dem <strong>Halbwellendipol</strong> als Bezug. Weil der Dipol selbst schon ${dipoleDb} dBi Gewinn hat, ist der ERP-Wert stets ${dipoleDb} dB kleiner — ein Faktor ${dipoleFactor} in der Leistung.`
        },
        {
          type: 'formula',
          formula: 'ERP = EIRP / 1,64  bzw.  ERP[dBm] = EIRP[dBm] − 2,15 dB',
          alt: 'ERP gleich EIRP geteilt durch eins Komma sechs vier, in Dezibel EIRP minus zwei Komma eins fünf Dezibel',
          label: 'Effektive Strahlungsleistung',
          number: '(2)'
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Verwechslung kostet 2,15 dB',
          html: `Ein EIRP von ${formatPowerWatts(1, 0)} entspricht einem ERP von ${erpOfOneWatt} W — und umgekehrt bedeutet eine ERP-Angabe von ${broadcastErp} (üblich bei UKW-Rundfunksendern) ein EIRP von ${broadcastEirp}. Europäische Rundfunk- und Amateurfunkvorschriften nennen meist ERP, Mobilfunk- und Satellitenunterlagen meist EIRP.`
        }
      ]
    },
    {
      id: 'leistungsdichte',
      title: 'Leistungsdichte im Abstand d',
      description:
        'Im freien Raum verteilt sich die Leistung über eine Kugelfläche — das erklärt das Abstandsgesetz.',
      blocks: [
        {
          type: 'formula',
          formula: 'S = EIRP / (4π · d²)',
          alt: 'S gleich EIRP geteilt durch vier Pi mal d Quadrat',
          label: 'Leistungsdichte im Freiraum',
          number: '(3)',
          variables: [
            { symbol: 'S', meaning: 'Leistungsdichte', unit: 'W/m²' },
            { symbol: 'EIRP', meaning: 'Äquivalente isotrope Strahlungsleistung', unit: 'W' },
            { symbol: 'd', meaning: 'Abstand zur Antenne (Fernfeld)', unit: 'm' }
          ]
        },
        {
          type: 'paragraph',
          html: 'Die Oberfläche einer Kugel wächst mit d², also sinkt die Leistungsdichte mit 1/d². Doppelter Abstand bedeutet ein Viertel der Leistungsdichte, also −6 dB; zehnfacher Abstand ein Hundertstel, also −20 dB. Genau dieser Term steckt auch in der Freiraumdämpfung.'
        },
        { type: 'widget', id: 'field-strength' }
      ]
    },
    {
      id: 'feldstaerke',
      title: 'Von der Leistungsdichte zur Feldstärke',
      description:
        'Messgeräte zeigen Feldstärken an, nicht Leistungsdichten. Der Feldwellenwiderstand verbindet beides.',
      blocks: [
        {
          type: 'formula',
          formula: 'E = √(S · Z₀) = √(30 · P · G) / d',
          alt: 'E gleich Wurzel aus S mal Z null gleich Wurzel aus dreißig mal P mal G geteilt durch d',
          label: 'Elektrische Feldstärke im Fernfeld',
          number: '(4)',
          variables: [
            { symbol: 'E', meaning: 'Elektrische Feldstärke (Effektivwert)', unit: 'V/m' },
            { symbol: 'S', meaning: 'Leistungsdichte', unit: 'W/m²' },
            { symbol: 'Z₀', meaning: `Feldwellenwiderstand des freien Raums (${impedance} Ω)`, unit: 'Ω' },
            { symbol: 'P · G', meaning: 'EIRP', unit: 'W' },
            { symbol: 'd', meaning: 'Abstand', unit: 'm' }
          ]
        },
        {
          type: 'callout',
          tone: 'formula',
          title: 'Woher die 30 kommt',
          html: `Setzt man S = EIRP/(4π·d²) in E = √(S·Z₀) ein, bleibt der Zahlenwert Z₀/(4π) = ${factor} übrig — in der Literatur auf 30 gerundet. Der Referenzfall: ${formatPowerWatts(REFERENCE.txPowerW, 0)} an einer isotropen Antenne erzeugt in ${formatDistance(REFERENCE.distanceM, 0)} Abstand eine Feldstärke von <strong>${referenceField} V/m</strong> — diese Zahl lohnt sich zu merken.`
        },
        {
          type: 'formula',
          formula: 'E[dBµV/m] = 20 · log₁₀(E / 1 V/m) + 120',
          alt: 'E in dBmikrovolt pro Meter gleich zwanzig mal Logarithmus von E in Volt pro Meter plus einhundertzwanzig',
          label: 'Feldstärkepegel',
          number: '(5)'
        },
        {
          type: 'paragraph',
          html: `Beispiel: ${formatPowerWatts(EXAMPLE.txPowerW, 0)} Speiseleistung an einer Antenne mit ${formatNumber(EXAMPLE.gainDbi, 0)} dBi ergeben ein EIRP von ${exampleEirp} (ERP ${exampleErp}). In ${formatDistance(EXAMPLE.distanceM, 0)} Abstand sind das ${exampleDensity} mW/m² Leistungsdichte, ${exampleField} mV/m Feldstärke oder ${exampleDbuv} dBµV/m.`
        },
        {
          type: 'table',
          caption: `Feldstärke der Beispielanlage (EIRP ${exampleEirp}) über die Entfernung`,
          columns: ['Abstand', 'Feldstärke E', 'Pegel'],
          monoColumns: [0, 1, 2],
          rows: distanceRows
        },
        {
          type: 'paragraph',
          html: 'Jede Verzehnfachung des Abstands kostet genau 20 dB — die Feldstärke fällt mit 1/d, die Leistungsdichte mit 1/d². Wer das im Kopf hat, kann jede Feldstärkeangabe auf einen anderen Abstand umrechnen, ohne die Formel zu bemühen.'
        }
      ]
    },
    {
      id: 'empfangsleistung',
      title: 'Empfangsleistung und Wirkfläche',
      description:
        'Eine Empfangsantenne „erntet" die Leistungsdichte über ihre Wirkfläche — daraus folgt unmittelbar die Freiraumdämpfung.',
      blocks: [
        {
          type: 'formula',
          formula: 'A_w = G · λ² / (4π)   und   P_rx = S · A_w',
          alt: 'A Wirkfläche gleich G mal Lambda Quadrat durch vier Pi, P Empfang gleich S mal A Wirkfläche',
          label: 'Wirkfläche und Empfangsleistung',
          number: '(6)',
          variables: [
            { symbol: 'A_w', meaning: 'Wirkfläche (effektive Apertur) der Empfangsantenne', unit: 'm²' },
            { symbol: 'G', meaning: 'Gewinn der Empfangsantenne (Faktor)', unit: '—' },
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            { symbol: 'P_rx', meaning: 'Verfügbare Empfangsleistung', unit: 'W' }
          ]
        },
        {
          type: 'paragraph',
          html: `Bemerkenswert ist das λ² in der Wirkfläche: Bei gleichem Gewinn sammelt eine Antenne bei niedriger Frequenz mehr Leistung ein. Im Beispiel oben hat eine isotrope Empfangsantenne bei ${formatNumber(EXAMPLE.frequencyHz / 1e6, 0)} MHz eine Wirkfläche von ${exampleAperture} cm² und nimmt damit ${exampleReceived} auf. Setzt man beide Gleichungen zusammen, entsteht die Friis-Übertragungsgleichung und mit ihr die <a href="/rechner/fspl/">Freiraumdämpfung</a>.`
        },
        {
          type: 'question',
          question: 'Warum steht in der Freiraumdämpfung ein Frequenzterm, obwohl der Raum die Welle doch gar nicht dämpft?',
          answer: 'Weil nicht der Raum dämpft, sondern die Empfangsantenne kleiner wird: Ihre Wirkfläche geht mit λ². Bei gleichem Gewinn fängt sie bei doppelter Frequenz nur ein Viertel der Leistung auf — das sind die 20·log₁₀(f) in der FSPL-Formel.'
        }
      ]
    },
    {
      id: 'personenschutz',
      title: 'Einordnung: Grenzwerte und Personenschutz',
      blocks: [
        {
          type: 'paragraph',
          html: 'Weil Hochfrequenz Gewebe erwärmt, sind Leistungsdichte und Feldstärke in der Umgebung von Sendeanlagen begrenzt. Die Grenzwerte sind frequenzabhängig und unterscheiden zwischen beruflich exponierten Personen und der Allgemeinbevölkerung.'
        },
        {
          type: 'list',
          items: [
            '<strong>ICNIRP-Leitlinien</strong> — international maßgebliche Empfehlung für elektromagnetische Felder von 100 kHz bis 300 GHz.',
            '<strong>26. BImSchV</strong> — die deutsche Verordnung über elektromagnetische Felder; setzt die ICNIRP-Referenzwerte in nationales Recht um.',
            '<strong>Standortbescheinigung</strong> der Bundesnetzagentur — legt für ortsfeste Funkanlagen den einzuhaltenden Sicherheitsabstand fest.'
          ]
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Keine Zahlen aus zweiter Hand',
          html: 'Diese Website führt bewusst keine Grenzwerttabelle: Die Werte sind frequenzabhängig, werden fortgeschrieben und dürfen nur aus der jeweils geltenden Fassung entnommen werden. Für eine Beurteilung sind der Originaltext der 26. BImSchV und die aktuellen ICNIRP-Leitlinien heranzuziehen. Die Rechnungen dieses Kapitels liefern die Eingangsgrößen dafür, nicht die Bewertung.'
        }
      ]
    },
    {
      id: 'link-budget',
      title: 'Zusammenhang zum Link-Budget',
      blocks: [
        {
          type: 'paragraph',
          html: 'Alle Größen dieses Kapitels tauchen im Link-Budget wieder auf — dort allerdings durchgehend in Dezibel, weil sich die Kette dann addieren lässt.'
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Sendeleistung in dBm, vermindert um die Speiseverluste.',
            'Plus Antennengewinn in dBi — die Summe ist das EIRP.',
            'Minus Freiraumdämpfung und atmosphärische Zusatzdämpfung (das Abstandsgesetz in Dezibel).',
            'Plus Gewinn der Empfangsantenne (die Wirkfläche in Dezibel).',
            'Ergibt den Empfangspegel, der mit der Empfindlichkeit des Empfängers verglichen wird.'
          ]
        },
        {
          type: 'list',
          items: [
            '<a href="/rechner/link-budget/">Link-Budget-Rechner</a>: die vollständige Kette mit Schwundreserve.',
            '<a href="/rechner/fspl/">FSPL-Rechner</a>: der Abstands- und Frequenzterm allein.',
            '<a href="/rechner/antennengewinn/">Antennengewinn-Rechner</a>: Gewinn, Wirkfläche und Öffnungswinkel ineinander umrechnen.',
            '<a href="/spektrum/sendeleistungen/">Sendeleistungen im Spektrum</a>: reale Anlagen zum Vergleich.'
          ]
        }
      ]
    }
  ],
  sources: [
    'Meinke, H.; Gundlach, F. W.: <em>Taschenbuch der Hochfrequenztechnik</em> — Strahlungsleistung, Leistungsdichte, Feldstärke.',
    'Pozar, D. M.: <em>Microwave Engineering</em> — Friis-Gleichung, Wirkfläche, Antennengewinn.',
    'IEEE Std 100 — Definitionen von EIRP, ERP und dBµV/m.',
    'ITU-R V.574-5 — Gebrauch des Dezibels.',
    'ICNIRP-Leitlinien und 26. BImSchV — Grenzwerte des Personenschutzes (nur als Verweis, keine Werte übernommen).'
  ]
};
