/**
 * Inhalt des Kapitels „Elektromagnetische Wellen"
 * (/wissen/grundlagen/em-wellen/).
 *
 * Die Zahlenwerte werden in `em-wellen.data.ts` aus den Utilities berechnet.
 */
import type { KnowledgeArticle } from '../types';
import { formatDistance, formatFrequency } from '$lib/utils/formatting';
import {
  DISH_DIAMETER_M,
  DISH_FREQUENCY_HZ,
  REFERENCE_HZ,
  dishFarField,
  exampleRows,
  lambdaReference,
  nearFieldReference,
  periodReference
} from './em-wellen.data';
import { EM_WELLEN_SECTIONS_TAIL } from './em-wellen.sections';

export const emWellenArticle: KnowledgeArticle = {
  href: '/wissen/grundlagen/em-wellen/',
  kicker: 'Wissen · Grundlagen',
  title: 'Elektromagnetische Wellen',
  icon: 'wave',
  lead: 'Jede Funkübertragung beginnt mit einer elektromagnetischen Welle: einem elektrischen und einem magnetischen Feld, die einander erzeugen und gemeinsam durch den Raum laufen. Dieses Kapitel klärt Wellenlänge und Periodendauer, den Unterschied zwischen Nah- und Fernfeld, die Polarisation und die Frage, warum Funkwellen nicht ionisierend sind.',
  meta: [{ label: 'Quellen', value: 'Meinke/Gundlach, Pozar, IEEE Std 145, CODATA 2018' }],
  goals: [
    'beschreiben, wie E-Feld, H-Feld und Ausbreitungsrichtung zueinander stehen',
    'Wellenlänge und Periodendauer aus der Frequenz berechnen',
    'reaktives Nahfeld, Übergangszone und Fernfeld voneinander abgrenzen',
    'lineare und zirkulare Polarisation unterscheiden und Polarisationsverluste abschätzen',
    'Leistungsdichte und Feldstärke über den Feldwellenwiderstand ineinander umrechnen',
    'begründen, warum Funkwellen zur nichtionisierenden Strahlung zählen'
  ],
  sections: [
    {
      id: 'welle',
      title: 'Was eine elektromagnetische Welle ist',
      description:
        'Ein sich änderndes elektrisches Feld erzeugt ein magnetisches und umgekehrt — dieses Wechselspiel löst sich von der Antenne und läuft als Welle davon.',
      blocks: [
        {
          type: 'paragraph',
          html: 'Ein Wechselstrom in einem Leiter baut um sich ein <strong>elektrisches Feld</strong> (Formelzeichen E, Einheit V/m) und ein <strong>magnetisches Feld</strong> (H, Einheit A/m) auf. Weil beide Felder sich zeitlich ändern, erzeugen sie einander gegenseitig immer wieder neu. In hinreichendem Abstand von der Antenne braucht dieser Vorgang den Leiter nicht mehr: Die Felder haben sich abgelöst und laufen mit Lichtgeschwindigkeit als freie Welle davon.'
        },
        {
          type: 'list',
          items: [
            'E-Feld und H-Feld stehen <strong>senkrecht aufeinander</strong>.',
            'Beide stehen senkrecht auf der <strong>Ausbreitungsrichtung</strong> — die Welle ist transversal.',
            'E, H und die Ausbreitungsrichtung bilden in dieser Reihenfolge ein <strong>Rechtssystem</strong>.',
            'Im freien Raum sind beide Felder <strong>in Phase</strong>; ihre Amplituden hängen über den Feldwellenwiderstand zusammen.'
          ]
        },
        { type: 'widget', id: 'em-wave' },
        {
          type: 'callout',
          tone: 'info',
          title: 'Warum sich das nicht abschalten lässt',
          html: 'Die vier Maxwell-Gleichungen verlangen es: Ein zeitlich veränderliches E-Feld ist von einem H-Feld umgeben und umgekehrt. Eine Welle ohne magnetischen Anteil kann es deshalb ebenso wenig geben wie eine Antenne, die nur „ein bisschen" strahlt.',
          source: 'Meinke/Gundlach, Taschenbuch der Hochfrequenztechnik'
        }
      ]
    },
    {
      id: 'wellenlaenge',
      title: 'Wellenlänge, Periodendauer und Ausbreitungsgeschwindigkeit',
      description:
        'Frequenz und Wellenlänge sind zwei Namen für dieselbe Eigenschaft — verknüpft über die Lichtgeschwindigkeit.',
      blocks: [
        {
          type: 'formula',
          formula: 'λ = c / f',
          alt: 'Lambda gleich c geteilt durch f',
          label: 'Wellenlänge im Vakuum',
          number: '(1)',
          variables: [
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
            {
              symbol: 'c',
              meaning: 'Lichtgeschwindigkeit im Vakuum (exakt 299 792 458 m/s)',
              unit: 'm/s'
            },
            { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
          ]
        },
        {
          type: 'formula',
          formula: 'T = 1 / f',
          alt: 'T gleich eins geteilt durch f',
          label: 'Periodendauer',
          number: '(2)',
          variables: [
            { symbol: 'T', meaning: 'Dauer einer vollen Schwingung', unit: 's' },
            { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
          ]
        },
        {
          type: 'paragraph',
          html: `Bei ${formatFrequency(REFERENCE_HZ, 0)} — mitten im UKW-Rundfunkband — sind das ${lambdaReference} Wellenlänge und ${periodReference} Periodendauer. In der Zeit einer Schwingung legt die Welle also genau eine Wellenlänge zurück. In Materie sinkt die Ausbreitungsgeschwindigkeit um den Faktor √εᵣ, und mit ihr die Wellenlänge; die Frequenz bleibt dieselbe.`
        },
        {
          type: 'table',
          caption: 'Wellenlänge, Periodendauer und Photonenenergie ausgewählter Frequenzen',
          columns: ['Frequenz', 'Wellenlänge λ', 'Periodendauer T', 'Photonenenergie E = h·f'],
          monoColumns: [0, 1, 2, 3],
          rows: exampleRows
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Umrechnen ohne Taschenrechner',
          html: 'λ in Metern ≈ 300 geteilt durch die Frequenz in MHz. 100 MHz → 3 m, 300 MHz → 1 m, 2400 MHz → 12,5 cm. Genau nachrechnen lässt sich das im <a href="/konverter/frequenz/">Frequenzkonverter</a>.'
        }
      ]
    },
    {
      id: 'nahfeld-fernfeld',
      title: 'Nahfeld und Fernfeld',
      description:
        'Erst in einigem Abstand von der Antenne verhält sich das Feld wie eine saubere ebene Welle — vorher gelten andere Regeln.',
      blocks: [
        {
          type: 'definitions',
          variant: 'term',
          items: [
            {
              term: 'Reaktives Nahfeld',
              description: `bis etwa λ/2π (bei ${formatFrequency(REFERENCE_HZ, 0)} also ${nearFieldReference}). Energie pendelt zwischen Antenne und Feld hin und her, statt abgestrahlt zu werden. Ein Messgerät verändert hier das Feld, das es messen soll.`
            },
            {
              term: 'Übergangszone (Fresnel-Zone)',
              description:
                'dazwischen. Die Feldverteilung hängt noch vom Abstand ab, das Richtdiagramm ist noch nicht ausgebildet.'
            },
            {
              term: 'Fernfeld (Fraunhofer-Zone)',
              description:
                'ab 2·D²/λ, wobei D die größte Abmessung der Antenne ist. Erst hier fällt die Leistungsdichte sauber mit 1/d² und das Richtdiagramm ist unabhängig vom Abstand.'
            }
          ]
        },
        {
          type: 'formula',
          formula: 'd_ff = 2 · D² / λ',
          alt: 'd Fernfeld gleich zwei mal D Quadrat geteilt durch Lambda',
          label: 'Fernfeldgrenze einer Apertur',
          number: '(3)',
          variables: [
            { symbol: 'd_ff', meaning: 'Beginn des Fernfelds', unit: 'm' },
            { symbol: 'D', meaning: 'Größte Abmessung der Antenne', unit: 'm' },
            { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' }
          ]
        },
        {
          type: 'paragraph',
          html: 'Wo die Grenzen im Einzelfall liegen, hängt allein von Frequenz und Antennengröße ab. Das folgende Diagramm trägt die drei Zonen auf einer logarithmischen Abstandsachse auf — der Marker sagt, in welcher Zone ein Beobachtungspunkt liegt.'
        },
        { type: 'widget', id: 'near-far-field' },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Das trifft die Messtechnik hart',
          html: `Ein Parabolspiegel von ${formatDistance(DISH_DIAMETER_M, 1)} Durchmesser bei ${formatFrequency(DISH_FREQUENCY_HZ, 0)} hat seine Fernfeldgrenze erst bei rund ${dishFarField}. Wer sein Richtdiagramm näher misst, misst etwas anderes. Alle Reichweiten- und Link-Budget-Formeln dieser Website setzen Fernfeld voraus.`
        }
      ]
    },
    ...EM_WELLEN_SECTIONS_TAIL
  ],
  sources: [
    'Meinke, H.; Gundlach, F. W.: <em>Taschenbuch der Hochfrequenztechnik</em> — ebene Welle, Feldwellenwiderstand, Nah- und Fernfeld.',
    'Pozar, D. M.: <em>Microwave Engineering</em> — Wellengleichung, Polarisation, Polarisationsverlustfaktor.',
    'IEEE Std 145 / IEEE Std 100 — Definitionen zu Polarisation, RHCP/LHCP und Kreuzpolarisation.',
    'CODATA 2018 (NIST) — c, h, ε₀, µ₀ und Z₀ = 376,730 313 668 Ω.',
    'ICNIRP-Leitlinien — Abgrenzung der nichtionisierenden Strahlung bei 100 nm.'
  ]
};
