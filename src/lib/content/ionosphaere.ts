/**
 * Inhalt des Kapitels „Ionosphärische Ausbreitung" (/wissen/wellenausbreitung/ionosphaere/).
 * Schichtdaten aus IONOSPHERIC_LAYERS, MUF/Sprungdistanz aus $lib/data/propagation.
 */
import type { KnowledgeArticle, CardItem } from './types';
import { IONOSPHERIC_LAYERS, IONOSPHERE_PARAMETERS } from '$lib/data/constants';
import {
  estimateMUF,
  calculateSkipDistanceForFrequency,
  calculatePlasmaFrequency,
  SKIP_ZONE_PARAMS
} from '$lib/data/propagation';
import { formatNumber, formatFrequency } from '$lib/utils/formatting';

const LAYER_NOTES: Record<string, { html: string; points: string[] }> = {
  'd-layer': {
    html: 'Die unterste Schicht entsteht durch Röntgenstrahlung der Sonne und verschwindet nach Sonnenuntergang wegen der hohen Luftdichte sehr schnell.',
    points: ['<strong>Tag:</strong> absorbiert niedrige HF-Frequenzen stark', '<strong>Nacht:</strong> löst sich vollständig auf', 'Hauptursache der Tagesdämpfung bei MF und HF']
  },
  'e-layer': {
    html: 'Reflektiert Mittelwelle und untere Kurzwelle; verschwindet einige Stunden nach Sonnenuntergang. Die sporadische E-Schicht (Es) ermöglicht VHF-Überreichweiten.',
    points: ['Reflektiert Frequenzen bis etwa 10 MHz', '<strong>Sporadic E:</strong> dünne, stark ionisierte Wolken', 'Metallionen aus Meteoren als Ursache']
  },
  'f1-layer': {
    html: 'Nur tagsüber als eigene Schicht vorhanden, am ausgeprägtesten im Sommer mittlerer Breiten. Verschmilzt nachts mit der F2-Schicht zur F-Region.',
    points: ['Tagsüber eigenständige Reflexionsschicht', 'Beeinflusst mittlere HF-Frequenzen', '<strong>Nachts:</strong> Teil der einheitlichen F-Region']
  },
  'f2-layer': {
    html: 'Die wichtigste Schicht für HF-Weitverkehr. Tag und Nacht vorhanden; die Ionisation nimmt nachts ab, verschwindet aber nicht.',
    points: ['Bestimmt die MUF', 'Höhe und Dichte variieren mit dem Sonnenzyklus', 'Ermöglicht weltweite Kurzwellenverbindungen']
  }
};

const layerCards: CardItem[] = IONOSPHERIC_LAYERS.map((layer) => ({
  title: layer.nameDE,
  subtitle: `${layer.altitudeMinKm}–${layer.altitudeMaxKm} km · Maximum bei ${layer.typicalPeakKm} km`,
  html: LAYER_NOTES[layer.id]?.html ?? layer.descriptionDE,
  points: LAYER_NOTES[layer.id]?.points,
  facts: [
    { label: 'Tag / Nacht', value: `${layer.daytimePresent ? 'ja' : 'nein'} / ${layer.nighttimePresent ? 'ja' : 'nein'}` }
  ]
}));

/** Beispiele – berechnet, nicht getippt */
const FOF2_EXAMPLE_MHZ = 5;
const SKIP_EXAMPLE_FREQUENCY_MHZ = 14;
const PLASMA_EXAMPLE_DENSITY = 1e12;
const referenceKm = IONOSPHERE_PARAMETERS.mufReferenceDistanceKm;

const mufExample = formatNumber(estimateMUF(FOF2_EXAMPLE_MHZ, referenceKm), 1);
const mufFactor = formatNumber(estimateMUF(1, referenceKm), 2);
const skipExample = calculateSkipDistanceForFrequency(SKIP_EXAMPLE_FREQUENCY_MHZ, FOF2_EXAMPLE_MHZ);
const skipExampleText = skipExample === null ? 'keine Reflexion' : `${formatNumber(skipExample, 0)} km`;
const plasmaExample = formatFrequency(calculatePlasmaFrequency(PLASMA_EXAMPLE_DENSITY), 0);
const fof2Range = `${IONOSPHERE_PARAMETERS.typicalF2CriticalFrequencyMHz.low}–${IONOSPHERE_PARAMETERS.typicalF2CriticalFrequencyMHz.high} MHz`;

export const ionosphaereArticle: KnowledgeArticle = {
  href: '/wissen/wellenausbreitung/ionosphaere/',
  kicker: 'Spektrum · Ausbreitung',
  title: 'Ionosphärische Ausbreitung',
  icon: 'globe',
  lead:
    'Zwischen 60 und 400 km Höhe ionisiert die Sonne die dünne Luft zu leitfähigen Schichten. Sie spiegeln Kurzwellen um die Erde – abhängig von Tageszeit, Jahreszeit und Sonnenaktivität. Dieses Kapitel erklärt die Schichten, die Kenngrößen MUF, LUF und foF2 sowie die tote Zone.',
  meta: [{ label: 'Quellen', value: 'ITU-R P.1239, Davies: Ionospheric Radio' }],
  goals: [
    'die Schichten D, E, F1 und F2 nach Höhe, Entstehung und Tag-Nacht-Verhalten unterscheiden',
    'die kritische Frequenz foF2 aus der Elektronendichte ableiten',
    'MUF und LUF definieren und die MUF für eine Strecke aus foF2 abschätzen',
    'die tote Zone (Skip Zone) erklären und ihre Abhängigkeit von Frequenz und Abstrahlwinkel beschreiben',
    'den Einfluss des Sonnenfleckenzyklus und plötzlicher Störungen (Mögel-Dellinger-Effekt) einordnen'
  ],
  sections: [
    {
      id: 'visualisierung',
      title: 'Schichten und Reflexion im Diagramm',
      description: 'Das interaktive Diagramm zeigt die Schichten, den Strahlverlauf und die Kenngrößen für Tag und Nacht.',
      blocks: [{ type: 'widget', id: 'ionospheric-propagation' }]
    },
    {
      id: 'schichten',
      title: 'Ionosphärische Schichten',
      description: 'Vier Schichten mit unterschiedlicher Höhe, Ionisation und Wirkung auf die Funkwellen (Daten: IONOSPHERIC_LAYERS).',
      blocks: [{ type: 'cards', columns: 2, items: layerCards }]
    },
    {
      id: 'kenngroessen',
      title: 'Kenngrößen: foF2, MUF, LUF',
      description: 'Drei Frequenzen beschreiben, was die Ionosphäre gerade kann.',
      blocks: [
        {
          type: 'formula',
          formula: 'foF2 = 9 · √(N_e,max)',
          alt: 'foF2 gleich 9 mal Wurzel aus N e max',
          label: `Kritische Frequenz der F2-Schicht; typisch ${fof2Range}. Beispiel: N_e = 10¹² e⁻/m³ → ${plasmaExample}`,
          number: '(1)',
          variables: [
            { symbol: 'foF2', meaning: 'Höchste bei senkrechtem Einfall reflektierte Frequenz', unit: 'Hz' },
            { symbol: 'N_e,max', meaning: 'Maximale Elektronendichte', unit: 'e⁻/m³' }
          ]
        },
        {
          type: 'formula',
          formula: 'MUF = foF2 · sec φ',
          alt: 'MUF gleich foF2 mal Sekans phi',
          label: `Sekantengesetz: Bei schrägem Einfall wird auch eine höhere Frequenz zurückgebogen. Für ${formatNumber(referenceKm, 0)} km ist sec φ ≈ ${mufFactor}, also foF2 = ${FOF2_EXAMPLE_MHZ} MHz → MUF ≈ ${mufExample} MHz`,
          number: '(2)'
        },
        {
          type: 'definitions',
          items: [
            { term: 'foF2', description: 'Kritische Frequenz der F2-Schicht, weltweit von Ionosonden gemessen. Sie steigt mit der Sonnenaktivität.' },
            { term: 'MUF', description: 'Maximum Usable Frequency – die höchste Frequenz, die für eine bestimmte Strecke noch reflektiert wird. Der klassische Faktor M(3000)F2 liegt bei 2,5–3,5.' },
            { term: 'LUF', description: 'Lowest Usable Frequency – darunter reicht das Signal wegen der D-Schicht-Absorption nicht mehr. Mehr Sendeleistung senkt die LUF; nachts liegt sie deutlich tiefer.' },
            { term: 'FOT', description: 'Frequency of Optimum Traffic – etwa 85 % der MUF, ein Sicherheitsabstand gegen Schwankungen.' }
          ]
        }
      ]
    },
    {
      id: 'tote-zone',
      title: 'Sprungdistanz und tote Zone',
      description: 'Zwischen dem Ende der Bodenwelle und dem ersten Auftreffpunkt der Raumwelle herrscht Funkstille.',
      blocks: [
        {
          type: 'paragraph',
          html: `Liegt die Betriebsfrequenz über foF2, kehrt nur ein hinreichend flach abgestrahlter Strahl zur Erde zurück. Die kürzeste Entfernung, in der das gelingt, ist die <strong>Sprungdistanz</strong>. Beispiel: ${SKIP_EXAMPLE_FREQUENCY_MHZ} MHz bei foF2 = ${FOF2_EXAMPLE_MHZ} MHz und ${IONOSPHERE_PARAMETERS.typicalF2HeightKm} km Reflexionshöhe → ${skipExampleText}. Typische tote Zonen reichen von ${SKIP_ZONE_PARAMS.typicalDeadZoneKm.min} bis ${formatNumber(SKIP_ZONE_PARAMS.typicalDeadZoneKm.max, 0)} km; höhere Frequenzen und flachere Winkel vergrößern sie.`
        },
        { type: 'widget', id: 'propagation-sandbox' },
        {
          type: 'question',
          question: 'Ein Sender auf 21 MHz wird in 3000 km Entfernung laut gehört, in 300 km Entfernung aber gar nicht. Warum?',
          answer: 'Die Bodenwelle reicht bei 21 MHz nur wenige Dutzend Kilometer, und für 300 km müsste der Strahl so steil abgestrahlt werden, dass die Frequenz über der dortigen MUF liegt – er durchdringt die Ionosphäre. Erst bei flacherem Einfall (größere Entfernung) reicht das Sekantengesetz aus, um ihn zurückzubiegen: 300 km liegt in der toten Zone.'
        }
      ]
    },
    {
      id: 'sonnenaktivitaet',
      title: 'Sonnenaktivität und Funkausbreitung',
      description: 'Die Ionisation wird primär durch solare UV- und Röntgenstrahlung erzeugt; der etwa 11-jährige Sonnenfleckenzyklus prägt die Kurzwelle.',
      blocks: [
        {
          type: 'cards',
          columns: 2,
          items: [
            {
              title: 'Sonnenfleckenminimum',
              subtitle: 'Solarer Flux SFI 65–80',
              points: ['Niedrigere MUF (typisch 8–12 MHz)', 'Bessere Ausbreitung auf den niedrigen Bändern', '40-m- und 80-m-Band optimal', 'Obere HF-Bänder oft geschlossen']
            },
            {
              title: 'Sonnenfleckenmaximum',
              subtitle: 'Solarer Flux SFI 150–300',
              points: ['Höhere MUF (typisch 15–35 MHz)', 'Bessere Ausbreitung auf den hohen Bändern', '10-m- und 15-m-Band optimal', 'Gelegentlich Öffnungen im 6-m-Band']
            }
          ]
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Mögel-Dellinger-Effekt (SID)',
          html: 'Eine Sonneneruption ionisiert die D-Schicht schlagartig: Auf der Tagseite der Erde werden alle HF-Signale für 15–60 Minuten nahezu vollständig absorbiert – die „tote Viertelstunde".'
        }
      ]
    }
  ],
  sources: [
    'ITU-R P.1239 – Referenz-Ionosphärenparameter (foF2, M(3000)F2).',
    'K. Davies, <em>Ionospheric Radio</em>, IET 1990 – Sekantengesetz, Sprungdistanz im Spiegelmodell.',
    'NASA GSFC / NOAA SWPC – Sonnenaktivität und ionosphärische Störungen.'
  ]
};
