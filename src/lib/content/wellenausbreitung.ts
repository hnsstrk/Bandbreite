/**
 * Inhalt des Kapitels „Wellenausbreitung" (/wissen/wellenausbreitung/).
 * Zahlenbeispiele aus $lib/utils und $lib/data/propagation; Skin-Tiefe (F-15)
 * wird aus calculateSkinDepth berechnet statt getippt.
 */
import type { KnowledgeArticle } from './types';
import {
  FREQUENCY_BAND_PROPAGATION,
  calculateRadioHorizon,
  calculatePlasmaFrequency,
  estimateMUF,
  SKIP_ZONE_PARAMS
} from '$lib/data/propagation';
import { IONOSPHERE_PARAMETERS, EARTH_RADIUS_MEAN } from '$lib/data/constants';
import { calculateSkinDepth, FRESNEL_CLEARANCE_FRACTION } from '$lib/utils/calculations';
import { formatNumber, formatFrequency, formatPercentage } from '$lib/utils/formatting';

const MODE_LABELS: Record<string, string> = {
  'ground-wave': 'Bodenwelle',
  'sky-wave': 'Raumwelle',
  'line-of-sight': 'Sichtverbindung',
  'sporadic-e': 'Sporadic E',
  troposcatter: 'Troposcatter'
};

/** Beispiele – berechnet, nicht getippt */
const ELF_FREQUENCY_HZ = 76;
const ELF_LOW_FREQUENCY_HZ = 30;
const HORIZON_EXAMPLE_HEIGHT_M = 100;
const PLASMA_EXAMPLE_DENSITY = 1e12;
const MUF_EXAMPLE_FOF2_MHZ = 5;

const skinDepth76 = formatNumber(calculateSkinDepth(ELF_FREQUENCY_HZ), 0);
const skinDepth30 = formatNumber(calculateSkinDepth(ELF_LOW_FREQUENCY_HZ), 0);
const horizon100 = formatNumber(calculateRadioHorizon(HORIZON_EXAMPLE_HEIGHT_M), 0);
const plasmaExample = formatFrequency(calculatePlasmaFrequency(PLASMA_EXAMPLE_DENSITY), 0);
const mufExample = formatNumber(
  estimateMUF(MUF_EXAMPLE_FOF2_MHZ, IONOSPHERE_PARAMETERS.mufReferenceDistanceKm),
  1
);
const mufFactorExample = formatNumber(
  estimateMUF(1, IONOSPHERE_PARAMETERS.mufReferenceDistanceKm),
  2
);

const bandRows = FREQUENCY_BAND_PROPAGATION.map((band) => [
  `<strong>${band.nameDE}</strong><br><span class="text-ink-subtle">${band.name}</span>`,
  `${formatFrequency(band.frequencyRangeHz.min, 0)} – ${formatFrequency(band.frequencyRangeHz.max, 0)}`,
  band.wavelengthRange,
  band.primaryModes.map((mode) => MODE_LABELS[mode] ?? mode).join(', '),
  band.dayBehavior,
  band.nightBehavior
]);

export const wellenausbreitungArticle: KnowledgeArticle = {
  href: '/wissen/wellenausbreitung/',
  kicker: 'Wissen · Ausbreitung',
  title: 'Wellenausbreitung',
  icon: 'wave',
  lead: 'Funkwellen finden je nach Frequenz auf sehr unterschiedliche Weise vom Sender zum Empfänger: als Bodenwelle entlang der Erdoberfläche, als Raumwelle über die Ionosphäre oder auf Sichtverbindung bis zum Radiohorizont. Dieses Kapitel zeigt die Mechanismen – mit Reglern für Frequenz, Antennenhöhe, Fresnel-Zone und Atmosphäre.',
  meta: [{ label: 'Quellen', value: 'ITU-R P.526, P.530, P.676, P.834, P.1239' }],
  goals: [
    'Bodenwelle, Raumwelle und Sichtverbindung dem jeweils passenden Frequenzbereich zuordnen',
    'den Radiohorizont aus der Antennenhöhe berechnen und die Wirkung des 4/3-Erde-Modells erklären',
    'die erste Fresnel-Zone berechnen und die 60-%-Regel für Richtfunkstrecken anwenden',
    'MUF, LUF, kritische Frequenz und tote Zone der Kurzwellenausbreitung erklären',
    'die atmosphärischen Fenster und Resonanzen im Mikrowellenbereich benennen'
  ],
  sections: [
    {
      id: 'ueberblick',
      title: 'Ausbreitungsmodi im Überblick',
      description:
        'Das interaktive Diagramm zeigt, wie Ionosphäre, Tageszeit und Frequenz die Ausbreitung bestimmen.',
      blocks: [
        { type: 'widget', id: 'wave-propagation-diagram' },
        {
          type: 'cards',
          columns: 3,
          items: [
            {
              title: 'Bodenwelle',
              subtitle: 'Ground Wave · 30 kHz – 3 MHz',
              html: 'Folgt der gekrümmten Erdoberfläche durch Beugung. Zuverlässig bei Tag und Nacht, Reichweite abhängig von Frequenz und Bodenleitfähigkeit.',
              facts: [{ label: 'Reichweite', value: '30 – 300 km' }]
            },
            {
              title: 'Raumwelle',
              subtitle: 'Sky Wave · 3 – 30 MHz',
              html: 'Wird an den ionosphärischen Schichten reflektiert und erlaubt über Mehrfachsprünge weltweite Verbindungen.',
              facts: [
                {
                  label: 'Sprung',
                  value: `bis ${formatNumber(SKIP_ZONE_PARAMS.maxSingleHopKm, 0)} km`
                }
              ]
            },
            {
              title: 'Sichtverbindung',
              subtitle: 'Line-of-Sight · > 30 MHz',
              html: 'Die Welle durchdringt die Ionosphäre; die Reichweite ist durch den Radiohorizont begrenzt – ähnlich wie beim Licht.',
              facts: [{ label: 'Formel', value: 'd = √(2·k·R·h)' }]
            }
          ]
        }
      ]
    },
    {
      id: 'bodenwelle',
      title: 'Bodenwelle',
      description:
        'Bei Lang- und Mittelwelle kriecht die Welle an der Erdoberfläche entlang; der Boden ist Teil des Wellenleiters.',
      blocks: [
        {
          type: 'list',
          items: [
            'Die Dämpfung steigt mit der Frequenz und sinkt mit der Bodenleitfähigkeit – <strong>Seewasser</strong> (4 S/m) ist der beste, trockener Fels der schlechteste Untergrund.',
            'Vertikale Polarisation ist Pflicht: Horizontal polarisierte Felder werden vom leitenden Boden kurzgeschlossen.',
            'Typische Reichweiten: einige hundert Kilometer bei Langwelle, unter 100 km bei oberer Mittelwelle.'
          ]
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Eindringtiefe ins Seewasser',
          html: `Die Skin-Tiefe δ = √(2/(ω·μ·σ)) beschreibt, wie tief eine Welle in einen Leiter eindringt. Für Seewasser ergibt sich bei ${ELF_FREQUENCY_HZ} Hz (US-Navy-ELF) δ ≈ ${skinDepth76} m, bei ${ELF_LOW_FREQUENCY_HZ} Hz etwa ${skinDepth30} m – deshalb erreichen nur ELF-Signale getauchte U-Boote. Nachrechnen im <a href="/rechner/skin-tiefe/">Skin-Tiefe-Rechner</a>.`
        }
      ]
    },
    {
      id: 'raumwelle',
      title: 'Raumwelle und Ionosphäre',
      description:
        'Kurzwellen werden in 100–400 km Höhe an ionisierten Schichten „reflektiert" – tatsächlich kontinuierlich gebrochen, bis sie zur Erde zurückkehren.',
      blocks: [
        {
          type: 'formula',
          formula: 'f_p = 9 · √(N_e)',
          alt: 'f p gleich 9 mal Wurzel aus N e',
          label: `Plasmafrequenz; für N_e = 10¹² e⁻/m³ ergibt sich f_p ≈ ${plasmaExample}`,
          number: '(1)',
          variables: [
            { symbol: 'f_p', meaning: 'Plasmafrequenz', unit: 'Hz' },
            { symbol: 'N_e', meaning: 'Elektronendichte', unit: 'e⁻/m³' }
          ]
        },
        {
          type: 'formula',
          formula: 'MUF = foF2 · sec φ',
          alt: 'MUF gleich foF2 mal Sekans phi',
          label: `Sekantengesetz; für ${formatNumber(IONOSPHERE_PARAMETERS.mufReferenceDistanceKm, 0)} km ist der Faktor ≈ ${mufFactorExample}, also foF2 = ${MUF_EXAMPLE_FOF2_MHZ} MHz → MUF ≈ ${mufExample} MHz`,
          number: '(2)',
          variables: [
            {
              symbol: 'foF2',
              meaning: 'Kritische Frequenz der F2-Schicht (senkrechter Einfall)',
              unit: 'MHz'
            },
            { symbol: 'φ', meaning: 'Einfallswinkel an der Schicht' }
          ]
        },
        {
          type: 'definitions',
          items: [
            {
              term: 'MUF',
              description:
                'Maximum Usable Frequency – die höchste Frequenz, die für eine gegebene Strecke noch reflektiert wird. Steigt mit Sonnenaktivität und Streckenlänge.'
            },
            {
              term: 'LUF',
              description:
                'Lowest Usable Frequency – darunter frisst die D-Schicht-Absorption das Signal. Hängt von Sendeleistung und Tageszeit ab.'
            },
            {
              term: 'Tote Zone',
              description:
                'Bereich zwischen dem Ende der Bodenwelle und dem Auftreffpunkt der ersten Raumwelle, in dem kein Empfang möglich ist.'
            },
            {
              term: 'Sonnenzyklus',
              description:
                'Der 11-jährige Sonnenfleckenzyklus verschiebt die MUF um den Faktor zwei bis drei.'
            }
          ]
        },
        { type: 'widget', id: 'propagation-sandbox' },
        {
          type: 'paragraph',
          html: 'Die Schichten D, E, F1 und F2, ihr Tag-Nacht-Verhalten und die Sonnenaktivität sind im Kapitel <a href="/wissen/wellenausbreitung/ionosphaere/">Ionosphärische Ausbreitung</a> im Detail beschrieben.'
        }
      ]
    },
    {
      id: 'sichtverbindung',
      title: 'Sichtverbindung und Radiohorizont',
      description:
        'Ab VHF durchdringen Wellen die Ionosphäre; es zählt die quasi-optische Sicht zwischen den Antennen.',
      blocks: [
        {
          type: 'formula',
          formula: 'd = √(2 · k · R · h)',
          alt: 'd gleich Wurzel aus 2 mal k mal R mal h',
          label: `Radiohorizont; Beispiel h = ${HORIZON_EXAMPLE_HEIGHT_M} m → d ≈ ${horizon100} km`,
          number: '(3)',
          variables: [
            { symbol: 'd', meaning: 'Distanz zum Horizont', unit: 'km' },
            { symbol: 'k', meaning: 'Refraktionsfaktor ≈ 4/3' },
            { symbol: 'R', meaning: `Erdradius ≈ ${formatNumber(EARTH_RADIUS_MEAN / 1000, 0)} km` },
            { symbol: 'h', meaning: 'Antennenhöhe', unit: 'km' }
          ]
        },
        {
          type: 'paragraph',
          html:
            'Freie Sicht allein reicht nicht: Die Welle braucht Platz um die Sichtlinie herum. Die <strong>erste Fresnel-Zone</strong> ist das Ellipsoid, innerhalb dessen Umwege höchstens λ/2 länger sind als der direkte Weg. Nach ITU-R P.530 sollten mindestens ' +
            formatPercentage(FRESNEL_CLEARANCE_FRACTION * 100, 0) +
            ' ihres Radius frei bleiben, sonst dämpft Beugung am Hindernis die Verbindung.'
        },
        {
          type: 'formula',
          formula: 'r₁ = √(λ · d₁ · d₂ / (d₁ + d₂))',
          alt: 'r 1 gleich Wurzel aus Lambda mal d1 mal d2 geteilt durch d1 plus d2',
          label: 'Radius der ersten Fresnel-Zone im Abstand d₁ vom Sender und d₂ vom Empfänger',
          number: '(4)'
        },
        { type: 'widget', id: 'fresnel' },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Zum Rechner',
          html: 'Der <a href="/rechner/fresnel/">Fresnel-Zonen-Rechner</a> rechnet mit Erdkrümmung und beliebigen Antennenhöhen.'
        }
      ],
      children: [
        {
          id: 'mehrwege',
          title: 'Mehrwegeausbreitung: der Boden strahlt zurück',
          description:
            'Über ebenem Gelände erreicht den Empfänger nicht nur die direkte Welle, sondern auch die am Boden reflektierte — beide addieren sich mit ihrer Phase.',
          blocks: [
            {
              type: 'paragraph',
              html: 'Die reflektierte Welle legt einen längeren Weg zurück; der Unterschied Δ erzeugt eine Phasendifferenz Δφ = 2π·Δ/λ. Bei streifendem Einfall dreht die Reflexion die Phase zusätzlich um 180°, sodass sich beide Wellen in Bodennähe fast auslöschen. Mit wachsendem Abstand wechseln sich deshalb Pegelgipfel (bis zu 6 dB über dem Freiraumwert) und tiefe Einbrüche ab — der klassische <strong>Mehrwegeschwund</strong>.'
            },
            {
              type: 'formula',
              formula: 'L(d) = 40·log₁₀(d) − 20·log₁₀(h_t · h_r)',
              alt: 'L von d gleich 40 mal Logarithmus von d minus 20 mal Logarithmus von h t mal h r',
              label: 'Zweiwege-Dämpfung jenseits der Bruchdistanz d_b = 4·h_t·h_r/λ',
              number: '(5)',
              variables: [
                { symbol: 'L', meaning: 'Pfaddämpfung', unit: 'dB' },
                { symbol: 'd', meaning: 'Abstand der Antennen', unit: 'm' },
                { symbol: 'h_t', meaning: 'Höhe der Sendeantenne', unit: 'm' },
                { symbol: 'h_r', meaning: 'Höhe der Empfangsantenne', unit: 'm' }
              ]
            },
            {
              type: 'paragraph',
              html: 'Jenseits der Bruchdistanz d_b = 4·h_t·h_r/λ gibt es keinen Einbruch mehr, und der Pegel fällt mit d⁴ statt mit d² — statt 20 dB je Abstandsdekade sind es 40 dB. Genau dieser Knick begrenzt die Zellgröße im Mobilfunk. Das folgende Widget zeigt beides: den Seitenriss der beiden Wege und die Dämpfungskurve mit Gipfeln, Einbrüchen und Bruchdistanz.'
            },
            { type: 'widget', id: 'two-ray' },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Warum ein halber Meter hilft',
              html: 'Weil die Einbrüche nur wenige Zentimeter breit sind, genügt oft ein kleiner Versatz der Antenne, um aus einem Loch herauszukommen. Aus demselben Grund arbeiten Mobilfunkbasisstationen mit zwei räumlich getrennten Antennen (Raumdiversität): Beide sind nie gleichzeitig im Einbruch.',
              source: 'Rappaport, Wireless Communications, Abschnitt 4.6; ITU-R P.530'
            }
          ]
        }
      ]
    },
    {
      id: 'atmosphaere',
      title: 'Atmosphärische Dämpfung im Mikrowellenbereich',
      description:
        'Oberhalb von etwa 10 GHz absorbieren Wasserdampf und Sauerstoff Funkwellen bei bestimmten Resonanzfrequenzen – dazwischen liegen die „Fenster".',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>22 GHz</strong>: Rotationsübergang des Wasserdampfs – schwach, aber feuchteabhängig.',
            '<strong>60 GHz</strong>: Sauerstoff-Absorptionsband (50–70 GHz) mit über 10 dB/km – ideal für kurze, abhörsichere Links (WiGig).',
            '<strong>118 GHz</strong> und <strong>183 GHz</strong>: weitere O₂- bzw. H₂O-Resonanzen.',
            'Fenster um <strong>35 GHz</strong> (Ka-Band) und <strong>94 GHz</strong> (W-Band) werden für Radar, Satellitenfunk und Radioastronomie genutzt.'
          ]
        },
        { type: 'widget', id: 'attenuation-windows' },
        {
          type: 'paragraph',
          html: 'Regen, Nebel und Schnee kommen als eigene Beiträge dazu – siehe <a href="/wissen/wellenausbreitung/daempfung/">Atmosphärische Dämpfung</a>.'
        }
      ]
    },
    {
      id: 'sporadic-e',
      title: 'Sporadische E-Schicht',
      description:
        'Temporäre, stark ionisierte Wolken in etwa 100 km Höhe reflektieren VHF-Signale und sorgen für unerwartete Überreichweiten.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Sporadic E (Es)',
              subtitle: '30 – 150 MHz · 500 – 2300 km',
              points: [
                'Saison Mai bis August auf der Nordhalbkugel',
                'Metallionen aus verglühenden Meteoren und Windscherungen',
                'Nicht vorhersagbar, aber statistisch gut erfasst'
              ]
            },
            {
              title: 'Troposcatter',
              subtitle: 'UHF/SHF · 100 – 500 km',
              points: [
                'Streuung an Brechungsindex-Inhomogenitäten der Troposphäre',
                'Hohe Leistung und große Antennen nötig',
                'Historisch für Richtfunk über den Horizont'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'frequenzbaender',
      title: 'Frequenzbänder und Ausbreitung',
      description:
        'Jedes Band hat charakteristische Ausbreitungseigenschaften, die sich zwischen Tag und Nacht deutlich unterscheiden.',
      blocks: [
        {
          type: 'table',
          caption: 'Quelle: FREQUENCY_BAND_PROPAGATION',
          columns: ['Band', 'Frequenz', 'Wellenlänge', 'Primäre Modi', 'Tag', 'Nacht'],
          rows: bandRows,
          monoColumns: [1, 2]
        }
      ]
    },
    {
      id: 'tag-nacht',
      title: 'Tag- und Nachtverhalten',
      description: 'Die Ionisation folgt der Sonne – und mit ihr das gesamte Kurzwellenverhalten.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Tag',
              points: [
                '<strong>D-Schicht aktiv:</strong> absorbiert niedrige HF-Frequenzen',
                '<strong>E-Schicht stark:</strong> reflektiert MF und untere HF',
                '<strong>F1-Schicht vorhanden:</strong> separate Reflexionsschicht',
                '<strong>F2-Schicht hoch:</strong> beste Reflexion für obere HF',
                '<strong>Höhere MUF</strong> durch stärkere Ionisation'
              ]
            },
            {
              title: 'Nacht',
              points: [
                '<strong>D-Schicht verschwindet:</strong> weniger Absorption',
                '<strong>E-Schicht schwächer:</strong> löst sich teilweise auf',
                '<strong>F1 und F2 verschmelzen</strong> zur F-Region',
                '<strong>Niedrigere MUF</strong> durch schwächere Ionisation',
                '<strong>Besserer MW/LW-Fernempfang</strong>'
              ]
            }
          ]
        },
        {
          type: 'question',
          question:
            'Warum ist ein Mittelwellensender aus 800 km Entfernung nachts hörbar, tagsüber aber nicht?',
          answer:
            'Tagsüber absorbiert die D-Schicht die Raumwelle der Mittelwelle nahezu vollständig – es bleibt nur die Bodenwelle mit wenigen hundert Kilometern Reichweite. Nachts verschwindet die D-Schicht, die Raumwelle erreicht die E-/F-Schicht und wird reflektiert: Fernempfang wird möglich, allerdings mit Schwund (Fading), wenn Boden- und Raumwelle interferieren.'
        }
      ]
    }
  ],
  sources: [
    'ITU-R P.526 (Beugung), P.530 (Richtfunk, Fresnel-Freihaltung), P.676 (Gasdämpfung), P.834 (Refraktion), P.1239 (Ionosphäre).',
    'K. Davies, <em>Ionospheric Radio</em>, IET 1990 – Sekantengesetz und Sprungdistanz.',
    'K. Rothammel, <em>Antennenbuch</em> – Ausbreitungsmodi und Bodenwelle.'
  ]
};
