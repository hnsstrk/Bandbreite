/**
 * Unterkapitel „Radarverfahren" (/wissen/radar/verfahren/).
 * Reine Daten; alle Zahlenbeispiele werden aus $lib/utils/radar berechnet.
 */
import type { KnowledgeArticle } from '../types';
import {
  formatDistance,
  formatFrequency,
  formatNumber,
  formatWavelength
} from '$lib/utils/formatting';
import {
  calculateBandwidthRangeResolution,
  calculateBeatFrequency,
  calculateBlindSpeed,
  calculateCompressionGain,
  calculateDopplerShift,
  calculateRangeResolution,
  calculateStaggeredBlindSpeed
} from '$lib/utils/radar';
import { frequencyToWavelength } from '$lib/utils/calculations';
import { RADAR_SIGNAL_SECTIONS } from './verfahrenSignal';

/** Rechenbeispiele des Kapitels — Eingaben mit Quelle im Text, Ergebnis berechnet. */
const EX_VELOCITY_MS = 100;
const EX_CARRIER_HZ = 10e9;
const EX_LONG_PULSE_S = 100e-6;
const EX_CHIRP_BW_HZ = 1e6;
const EX_AUTOMOTIVE_BW_HZ = 4e9;
const EX_FMCW_RANGE_M = 100;
const EX_FMCW_RAMP_S = 50e-6;
const EX_PRF_1_HZ = 1000;
const EX_PRF_2_HZ = 1200;

const wavelengthX = frequencyToWavelength(EX_CARRIER_HZ);
const exDopplerKHz = formatNumber(calculateDopplerShift(EX_VELOCITY_MS, EX_CARRIER_HZ) / 1000, 2);
const exCompressionGain = calculateCompressionGain(EX_CHIRP_BW_HZ, EX_LONG_PULSE_S);
const exBlind1 = formatNumber(calculateBlindSpeed(1, wavelengthX, EX_PRF_1_HZ), 1);
const exStagger = formatNumber(
  calculateStaggeredBlindSpeed(EX_PRF_1_HZ, EX_PRF_2_HZ, wavelengthX),
  1
);
const exBeat = formatFrequency(
  calculateBeatFrequency(EX_FMCW_RANGE_M, EX_AUTOMOTIVE_BW_HZ, EX_FMCW_RAMP_S),
  2
);

export const radarVerfahrenArticle: KnowledgeArticle = {
  href: '/wissen/radar/verfahren/',
  kicker: 'Wissen · Radartechnik',
  title: 'Radarverfahren',
  icon: 'wave',
  lead: 'Wie ein Radar sendet, entscheidet darüber, was es messen kann. Dieses Unterkapitel stellt Puls- und Dauerstrichverfahren gegenüber und erklärt Doppler-Auswertung, MTI und MTD, FMCW, Pulskompression, CFAR, elektronische Strahlschwenkung, SAR sowie bistatische und passive Systeme.',
  meta: [
    { label: 'Quelle', value: 'Skolnik, Introduction to Radar Systems' },
    { label: 'Rechner', value: 'Radar-Reichweite' }
  ],
  goals: [
    'Puls-, CW- und FMCW-Radar nach Messgröße, Bandbreite und Aufwand unterscheiden',
    'die Doppler-Verschiebung f_d = 2·v·f/c berechnen und ihr Vorzeichen deuten',
    'erklären, warum ein MTI-Radar Blindgeschwindigkeiten hat und wie eine gestaffelte PRF sie entschärft',
    'aus Chirp-Bandbreite und Rampendauer Beat-Frequenz und Entfernungsauflösung eines FMCW-Radars bestimmen',
    'den Kompressionsgewinn B·τ eines Chirp-Radars einordnen und den Zweck einer CFAR-Schwelle nennen',
    'Phased Array, SAR und bistatische Anordnungen ihrer jeweiligen Aufgabe zuordnen'
  ],
  sections: [
    {
      id: 'puls-und-cw',
      title: 'Puls oder Dauerstrich?',
      description:
        'Die erste Weichenstellung: unterbrochen senden und die Laufzeit messen — oder ununterbrochen senden und die Frequenz auswerten.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Pulsradar',
              html: 'Sender und Empfänger teilen sich die Antenne im Zeitmultiplex. Die Laufzeit ist direkt messbar, der Nahbereich bleibt während der Sendezeit blind.',
              facts: [
                { label: 'Misst', value: 'Entfernung, mit Doppler auch Geschwindigkeit' },
                { label: 'Grenze', value: 'Blindbereich c·τ/2' }
              ]
            },
            {
              title: 'Dauerstrichradar (CW)',
              html: 'Sendet ununterbrochen mit kleiner Leistung; Sende- und Empfangszweig sind getrennt. Ohne Modulation gibt es keine Zeitmarke – also keine Entfernung.',
              facts: [
                { label: 'Misst', value: 'nur Radialgeschwindigkeit' },
                { label: 'Vorteil', value: 'kein Blindbereich, einfache Technik' }
              ]
            },
            {
              title: 'FMCW',
              html: 'Dauerstrich mit aufgeprägter Frequenzrampe. Die Rampe liefert die fehlende Zeitmarke, die Beat-Frequenz die Entfernung.',
              facts: [{ label: 'Misst', value: 'Entfernung und Geschwindigkeit' }]
            },
            {
              title: 'Impulskompression',
              html: 'Langer, modulierter Impuls mit der Energie eines langen und der Auflösung eines kurzen Impulses.',
              facts: [{ label: 'Auflösung', value: 'ΔR = c/(2·B)' }]
            }
          ]
        }
      ]
    },
    {
      id: 'doppler-mti-mtd',
      title: 'Doppler, MTI und MTD',
      description:
        'Bewegte Ziele verschieben die Echofrequenz. Daraus wird sowohl die Geschwindigkeitsmessung als auch die Unterdrückung von Festzeichen.',
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
          html:
            'Der Faktor 2 entsteht, weil das Ziel die Welle zunächst als bewegter Empfänger sieht und sie dann als bewegter Sender zurückstrahlt. Bei 10 GHz und 100 m/s (360 km/h) beträgt die Verschiebung ' +
            exDopplerKHz +
            ' kHz – gut messbar, obwohl f_d/f nur etwa 10⁻⁶ ist.'
        },
        { type: 'widget', id: 'doppler' },
        {
          type: 'paragraph',
          html: '<strong>MTI</strong> (Moving Target Indication) subtrahiert aufeinanderfolgende Echos voneinander: Was sich nicht ändert – Boden, Gebäude, Berge –, hebt sich auf; nur bewegte Ziele bleiben übrig. <strong>MTD</strong> (Moving Target Detector) geht einen Schritt weiter und zerlegt die Echos einer Antennenumdrehung mit einer Filterbank (in der Praxis einer FFT) in Doppler-Kanäle. Jeder Kanal bekommt seine eigene Schwelle, und Wetter- oder Vogelechos lassen sich an ihrer Geschwindigkeit erkennen statt nur unterdrücken.'
        },
        {
          type: 'formula',
          formula: 'v_b = n · λ · PRF / 2',
          alt: 'v b gleich n mal Lambda mal PRF geteilt durch 2',
          label: 'Blindgeschwindigkeiten eines MTI-Radars',
          number: '(5)',
          variables: [
            { symbol: 'v_b', meaning: 'Blindgeschwindigkeit', unit: 'm/s' },
            { symbol: 'n', meaning: 'Ordnung (1, 2, 3 …)' },
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            { symbol: 'PRF', meaning: 'Pulswiederholfrequenz', unit: 'Hz' }
          ]
        },
        {
          type: 'paragraph',
          html:
            'Bei diesen Geschwindigkeiten dreht sich die Echophase von Impuls zu Impuls um genau 2π – das Ziel sieht für den Filter aus wie ein stehendes und verschwindet. Bei 10 GHz und 1 kHz PRF liegt die erste Blindgeschwindigkeit schon bei ' +
            exBlind1 +
            ' m/s. Wechselt das Radar von Impuls zu Impuls zwischen ' +
            formatNumber(EX_PRF_1_HZ, 0) +
            ' Hz und ' +
            formatNumber(EX_PRF_2_HZ, 0) +
            ' Hz (<strong>staggered PRF</strong>), fallen die Lücken beider Folgen erst bei ' +
            exStagger +
            ' m/s zusammen.'
        },
        { type: 'widget', id: 'blind-speed' },
        {
          type: 'question',
          question:
            'Ein Ziel fliegt mit 200 m/s exakt tangential am Radar vorbei. Welche Doppler-Frequenz misst das Radar?',
          answer:
            'Null. Der Doppler-Effekt reagiert nur auf die <strong>radiale</strong> Geschwindigkeitskomponente, also die Änderung des Abstands. Bewegt sich das Ziel quer zur Blickrichtung, bleibt der Abstand im Moment der Messung konstant – MTI-Radare können solche Ziele kurzzeitig verlieren.'
        }
      ]
    },
    {
      id: 'fmcw',
      title: 'FMCW-Radar',
      description:
        'Frequency Modulated Continuous Wave: ein Dauerstrichradar mit linear ansteigender Frequenz (Chirp), das Entfernung und Geschwindigkeit gleichzeitig misst.',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Der Sender erzeugt einen <strong>Chirp</strong>: Die Frequenz steigt linear über die Bandbreite B an.',
            'Das Echo kommt um die Laufzeit τ = 2R/c verzögert zurück – und damit mit einer anderen Momentanfrequenz.',
            'Das Mischen von Sende- und Empfangssignal liefert die <strong>Beat-Frequenz</strong> f_b, die proportional zur Entfernung ist.',
            'Eine zusätzliche Doppler-Verschiebung über mehrere Chirps hinweg ergibt die <strong>Geschwindigkeit</strong>.'
          ]
        },
        {
          type: 'formula',
          formula: 'f_b = 2 · R · B / (c · T)     ·     ΔR = c / (2 · B)',
          alt: 'f b gleich 2 R B geteilt durch c T, und Delta R gleich c geteilt durch 2 B',
          label: 'Beat-Frequenz und Entfernungsauflösung eines FMCW-Radars',
          number: '(6)',
          variables: [
            { symbol: 'B', meaning: 'Hub der Frequenzrampe', unit: 'Hz' },
            { symbol: 'T', meaning: 'Dauer der Rampe', unit: 's' },
            { symbol: 'R', meaning: 'Zielentfernung', unit: 'm' }
          ]
        },
        { type: 'widget', id: 'fmcw' },
        {
          type: 'table',
          caption: 'Automotive-Radar im W-Band (ETSI EN 301 091, Bandgrenzen 76–81 GHz)',
          columns: ['Kenngröße', 'Wert'],
          rows: [
            ['Frequenzband', '76–81 GHz (W-Band)'],
            ['Reichweite', 'bis ca. 250 m (Long Range)'],
            [
              'Auflösung',
              `${formatWavelength(calculateBandwidthRangeResolution(EX_AUTOMOTIVE_BW_HZ), 1)} bei ${formatFrequency(EX_AUTOMOTIVE_BW_HZ, 0)} Bandbreite (Gl. 6)`
            ],
            [
              'Beat-Frequenz',
              `${exBeat} für ein Ziel in ${formatDistance(EX_FMCW_RANGE_M, 0)} bei ${formatNumber(EX_FMCW_RAMP_S * 1e6, 0)} µs Rampe`
            ],
            ['Anwendungen', 'ACC, Notbremsassistent, Spurwechselassistent']
          ],
          monoColumns: [1]
        }
      ]
    },
    {
      id: 'pulskompression',
      title: 'Pulskompression',
      description:
        'Der Ausweg aus dem Zielkonflikt zwischen Energie und Auflösung: lang senden, kurz auswerten.',
      blocks: [
        {
          type: 'paragraph',
          html: 'Ein kurzer Impuls löst fein auf, trägt aber wenig Energie; ein langer Impuls trägt viel Energie, löst aber grob auf. Bekommt der lange Impuls eine innere Struktur – meist ein linearer Frequenzanstieg (<strong>Chirp</strong>), seltener eine Phasencodierung wie der Barker-Code –, kann ein angepasstes Filter im Empfänger ihn wieder zusammenschieben.'
        },
        {
          type: 'formula',
          formula: 'G_c = B · τ     ·     τ_komprimiert ≈ 1 / B',
          alt: 'G c gleich B mal tau; komprimierte Impulsdauer etwa 1 geteilt durch B',
          label: 'Kompressionsgewinn (Zeit-Bandbreite-Produkt)',
          number: '(7)'
        },
        {
          type: 'paragraph',
          html:
            'Beispiel: Ein Impuls von ' +
            formatNumber(EX_LONG_PULSE_S * 1e6, 0) +
            ' µs Dauer hätte unkomprimiert eine Auflösung von ' +
            formatDistance(calculateRangeResolution(EX_LONG_PULSE_S), 0) +
            '. Mit einem Chirp über ' +
            formatFrequency(EX_CHIRP_BW_HZ, 0) +
            ' ergibt sich ein Kompressionsgewinn von ' +
            formatNumber(exCompressionGain, 0) +
            ' (' +
            formatNumber(10 * Math.log10(exCompressionGain), 0) +
            ' dB) und eine Auflösung von ' +
            formatDistance(calculateBandwidthRangeResolution(EX_CHIRP_BW_HZ), 0) +
            ' – bei unveränderter Sendeenergie.'
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Der Preis: Nebenzipfel',
          html: 'Das komprimierte Echo hat Nebenmaxima vor und hinter dem Hauptmaximum. Ein starkes Ziel kann darüber ein schwaches Nachbarziel verdecken; Fenstergewichtung drückt die Nebenzipfel, verbreitert aber das Hauptmaximum.'
        }
      ]
    },
    ...RADAR_SIGNAL_SECTIONS
  ],
  sources: [
    'M. I. Skolnik, <em>Introduction to Radar Systems</em>, 3. Aufl., McGraw-Hill 2001 – MTI und Blindgeschwindigkeiten (Kap. 3), FM-CW (§3.3), Pulskompression (§6.5), CFAR (Kap. 5), Phased Array (Kap. 9), SAR (Kap. 14).',
    'ETSI EN 301 091, <em>Short Range Devices; Radar equipment operating in the 76 GHz to 81 GHz range</em> – Bandgrenzen des Automotive-Radars.'
  ]
};
