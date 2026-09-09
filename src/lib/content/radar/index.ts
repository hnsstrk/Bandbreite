/**
 * Kapitel-Hub „Radartechnik" (/wissen/radar/).
 *
 * Der Hub trägt die Lernziele des Gesamtkapitels, ordnet das Thema ein und
 * führt in die drei Unterkapitel. Die Kacheln entstehen aus der Navigations-
 * Registry (`getHubChildren`) — es gibt keine zweite Liste.
 */
import type { KnowledgeArticle } from '../types';
import { getHubChildren } from '$lib/data/navigation';
import { formatFrequency, formatNumber } from '$lib/utils/formatting';
import { calculateRoundTripTime } from '$lib/utils/radar';
import { SSR_INTERROGATION_HZ, SSR_REPLY_HZ } from '$lib/components/widgets/SsrModel';

/** Ein Kilometer Zielentfernung als Merkgröße für die Laufzeit. */
const ONE_KILOMETRE_M = 1000;
const microsecondsPerKm = formatNumber(calculateRoundTripTime(ONE_KILOMETRE_M) * 1e6, 2);

/** Die Unterkapitel als Definitionsliste — Name als Link, Kurztext daneben. */
const chapterItems = getHubChildren('/wissen/radar/').map((node) => ({
  term: `<a href="${node.href}">${node.label}</a>`,
  description: node.keywords?.length
    ? `${node.description ?? ''} Themen: ${node.keywords.slice(0, 4).join(' · ')}`
    : (node.description ?? '')
}));

export const radarHubArticle: KnowledgeArticle = {
  href: '/wissen/radar/',
  kicker: 'Wissen · Kapitel',
  title: 'Radartechnik',
  icon: 'signal',
  lead: 'RADAR — Radio Detection and Ranging — ortet Objekte mit elektromagnetischen Wellen und misst dabei Entfernung, Richtung und Geschwindigkeit. Dieses Kapitel führt in drei Schritten durch das Thema: von der Laufzeitmessung und der Radargleichung über die Sende- und Auswerteverfahren bis zum kooperativen Sekundärradar der Luftfahrt.',
  meta: [
    { label: 'Unterkapitel', value: '3' },
    { label: 'Quelle', value: 'Skolnik · IEEE Std 521 · ICAO Annex 10' }
  ],
  goals: [
    'das Radarprinzip erklären und aus einer Echolaufzeit die Entfernung berechnen',
    'die Radargleichung und den Radarquerschnitt zur Abschätzung einer Reichweite nutzen',
    'Auflösung und Mehrdeutigkeit unterscheiden und das PRF-Dilemma begründen',
    'die gängigen Verfahren — Puls, CW, FMCW, Pulskompression, MTI/MTD, CFAR, Phased Array, SAR — voneinander abgrenzen',
    'Primär- und Sekundärradar gegenüberstellen und die Rolle von Mode S und ADS-B benennen'
  ],
  sections: [
    {
      id: 'einordnung',
      title: 'Worum es geht',
      description:
        'Ein Radar erzeugt seine Beleuchtung selbst. Genau das unterscheidet es von Kamera, Fernrohr und dem passiven Mithören eines Funkempfängers.',
      blocks: [
        {
          type: 'paragraph',
          html:
            'Jede Radarmessung beginnt mit einer Zeitmessung. Weil elektromagnetische Wellen den Weg zum Ziel und zurück legen, entspricht jeder Kilometer Entfernung einer Laufzeit von ' +
            microsecondsPerKm +
            ' µs. Aus dieser einen Beziehung folgt fast alles Weitere: die Zeitskala der Elektronik, die Grenzen der Eindeutigkeit und der Zusammenhang zwischen Impulsdauer und Auflösung.'
        },
        {
          type: 'list',
          items: [
            '<strong>Entfernung</strong> aus der Laufzeit des Echos.',
            '<strong>Richtung</strong> aus der Blickrichtung der Antenne — mechanisch gedreht oder elektronisch geschwenkt.',
            '<strong>Geschwindigkeit</strong> aus der Doppler-Verschiebung des Echos.',
            '<strong>Eigenschaften des Ziels</strong> aus Stärke, Polarisation und Zeitverlauf der Rückstreuung.'
          ]
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Zwei Familien',
          html:
            'Ein <strong>Primärradar</strong> wertet das passive Echo aus und braucht dafür Leistung nach dem R⁴-Gesetz. Ein <strong>Sekundärradar</strong> fragt einen Transponder an Bord: Abfrage auf ' +
            formatFrequency(SSR_INTERROGATION_HZ, 0) +
            ', Antwort auf ' +
            formatFrequency(SSR_REPLY_HZ, 0) +
            ' — mit Daten statt bloßer Ortsmarke.'
        }
      ]
    },
    {
      id: 'unterkapitel',
      title: 'Die drei Unterkapitel',
      description: 'Aufeinander aufbauend zu lesen, einzeln aber verständlich.',
      blocks: [{ type: 'definitions', variant: 'term', items: chapterItems }]
    },
    {
      id: 'werkzeuge',
      title: 'Selbst rechnen und ausprobieren',
      description: 'Zu jedem Abschnitt gehört ein Regler oder ein Rechner.',
      blocks: [
        {
          type: 'list',
          items: [
            '<a href="/rechner/radar/">Radar-Reichweitenrechner</a> — Radargleichung mit Sendeleistung, Gewinn, Frequenz, RCS und Empfindlichkeit, dazu Doppler, Auflösung und Eindeutigkeit.',
            '<a href="/wissen/radar/grundlagen/#grundprinzip">Impuls, Laufzeit und Eindeutigkeit</a> sowie <a href="/wissen/radar/grundlagen/#radarquerschnitt">Radarquerschnitt im Vergleich</a> im Grundlagenteil.',
            '<a href="/wissen/radar/verfahren/#doppler-mti-mtd">Doppler-Verschiebung</a>, <a href="/wissen/radar/verfahren/#doppler-mti-mtd">Blindgeschwindigkeiten</a> und <a href="/wissen/radar/verfahren/#fmcw">FMCW-Rampe</a> im Verfahrensteil.',
            '<a href="/wissen/radar/sekundaerradar/#mode-a-c">Abfrage und Antwort des Sekundärradars</a> mit Squawk-Eingabe.'
          ]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Verwandte Kapitel',
          html: 'Die Antennenseite des Radars steht in <a href="/wissen/antennen/">Antennen</a>, die Formeln in <a href="/wissen/mathematik/">HF-Mathematik</a>, die Frequenzzuweisungen in der <a href="/datenbanken/frequenzbaender/">Frequenzband-Datenbank</a>.'
        }
      ]
    }
  ],
  sources: [
    'M. I. Skolnik, <em>Introduction to Radar Systems</em>, 3. Aufl., McGraw-Hill 2001.',
    'IEEE Std 521-2002, <em>Standard Letter Designations for Radar-Frequency Bands</em>.',
    'ICAO Annex 10, <em>Aeronautical Telecommunications</em>, Vol. IV.'
  ]
};

export { radarGrundlagenArticle } from './grundlagen';
export { radarVerfahrenArticle } from './verfahren';
export { radarSekundaerArticle } from './sekundaerradar';
