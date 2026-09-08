/**
 * Inhalt des Kapitel-Hubs „Grundlagen" (/wissen/grundlagen/).
 *
 * Die Kacheln der Unterkapitel erzeugt die Route aus `getHubChildren()` —
 * hier stehen nur Lernziele, Einstiegshinweise und die Formelübersicht.
 */
import type { KnowledgeArticle } from '../types';

/** Anker der Kachelliste, die die Route selbst rendert. */
export const GRUNDLAGEN_TILES_ID = 'kapitel';

export const grundlagenHub: KnowledgeArticle = {
  href: '/wissen/grundlagen/',
  kicker: 'Wissen · Kapitel',
  title: 'Grundlagen',
  icon: 'wave',
  lead: 'Drei Kapitel, die alles Weitere tragen: die elektromagnetische Welle selbst, das Dezibel als Rechensprache der Funktechnik und der Weg von der Sendeleistung zur Feldstärke. Wer hier durch ist, versteht jede Formel auf dieser Website — und die meisten Datenblätter dazu.',
  meta: [
    { label: 'Kapitel', value: '3' },
    { label: 'Voraussetzung', value: 'Schulmathematik' }
  ],
  goals: [
    'die elektromagnetische Welle mit E-Feld, H-Feld, Wellenlänge und Polarisation beschreiben',
    'in Dezibel rechnen, statt mit Zehnerpotenzen zu hantieren',
    'Sendeleistung, EIRP, Leistungsdichte und Feldstärke ineinander umrechnen',
    'die Größen wiedererkennen, die in Rechnern, Datenblättern und Vorschriften auftauchen'
  ],
  sections: [
    {
      id: 'wo-anfangen',
      title: 'Wo anfangen?',
      description:
        'Die drei Kapitel bauen aufeinander auf — je nachdem, was dich hergeführt hat, lohnt sich aber ein anderer Einstieg.',
      blocks: [
        {
          type: 'cards',
          columns: 3,
          items: [
            {
              title: 'Ganz von vorn',
              subtitle: 'Empfohlene Reihenfolge',
              html: 'Elektromagnetische Wellen → Dezibel und Pegel → Leistung, EIRP und Feldstärke. Jedes Kapitel braucht nur das vorherige.',
              facts: [{ label: 'Dauer', value: 'rund 45 Minuten' }]
            },
            {
              title: 'Mir fehlt nur das dB',
              subtitle: 'Kurzer Weg',
              html: 'Wer weiß, was eine Welle ist, aber bei dBm, dBi und dBµV ins Grübeln kommt, fängt direkt bei <a href="/wissen/grundlagen/dezibel/">Dezibel und Pegel</a> an.',
              facts: [{ label: 'Dauer', value: 'rund 15 Minuten' }]
            },
            {
              title: 'Ich plane eine Anlage',
              subtitle: 'Praxisweg',
              html: '<a href="/wissen/grundlagen/leistung-und-pegel/">Leistung, EIRP und Feldstärke</a> liefert die Größen, die in Standortbescheinigung und <a href="/rechner/link-budget/">Link-Budget</a> stehen.',
              facts: [{ label: 'Dauer', value: 'rund 20 Minuten' }]
            }
          ]
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Erst spielen, dann lesen',
          html: 'Jedes Kapitel enthält ein interaktives Widget. Wer die Regler zuerst bewegt und dann liest, behält mehr — die Texte erklären genau das, was das Widget zeigt.'
        }
      ]
    },
    {
      id: 'was-du-mitbringst',
      title: 'Was du mitbringen solltest',
      blocks: [
        {
          type: 'list',
          items: [
            'Dreisatz, Potenzen und den dekadischen Logarithmus — mehr Mathematik kommt nicht vor.',
            'Eine Vorstellung von Frequenz und Schwingung; alles Weitere wird hier entwickelt.',
            'Kein Vorwissen zu Antennen, Modulation oder Funkdiensten: Diese Kapitel setzen auf den Grundlagen auf, nicht umgekehrt.'
          ]
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Und danach?',
          html: 'Von hier führen zwei Wege weiter: <a href="/wissen/wellenausbreitung/">Wellenausbreitung</a> (was mit der Welle unterwegs passiert) und <a href="/wissen/antennen/">Antennen</a> (wie sie erzeugt und wieder aufgefangen wird). Die kompakte Formelsammlung steht in der <a href="/wissen/mathematik/">HF-Mathematik</a>.'
        }
      ]
    },
    {
      id: 'formeln',
      title: 'Die Formeln dieses Kapitels auf einen Blick',
      blocks: [
        {
          type: 'table',
          caption: 'Kernformeln der drei Grundlagenkapitel',
          columns: ['Formel', 'Bedeutung', 'Kapitel'],
          monoColumns: [0],
          rows: [
            ['λ = c / f', 'Wellenlänge aus der Frequenz', 'Elektromagnetische Wellen'],
            ['T = 1 / f', 'Periodendauer', 'Elektromagnetische Wellen'],
            ['Z₀ = E / H ≈ 377 Ω', 'Feldwellenwiderstand des freien Raums', 'Elektromagnetische Wellen'],
            ['d_ff = 2·D² / λ', 'Beginn des Fernfelds', 'Elektromagnetische Wellen'],
            ['a = 10·log₁₀(P₂/P₁)', 'Leistungsverhältnis in Dezibel', 'Dezibel und Pegel'],
            ['a = 20·log₁₀(U₂/U₁)', 'Spannungs- und Feldstärkeverhältnis', 'Dezibel und Pegel'],
            ['EIRP = P · G', 'Äquivalente isotrope Strahlungsleistung', 'Leistung, EIRP und Feldstärke'],
            ['S = EIRP / (4π·d²)', 'Leistungsdichte im Abstand d', 'Leistung, EIRP und Feldstärke'],
            ['E = √(S · Z₀)', 'Feldstärke aus der Leistungsdichte', 'Leistung, EIRP und Feldstärke']
          ]
        }
      ]
    }
  ],
  sources: [
    'Meinke, H.; Gundlach, F. W.: <em>Taschenbuch der Hochfrequenztechnik</em>.',
    'Pozar, D. M.: <em>Microwave Engineering</em>.',
    'ITU-R V.574-5, IEC 60027-3, IEEE Std 100 und IEEE Std 145.',
    'CODATA 2018 (NIST) für c, h, ε₀, µ₀ und Z₀.'
  ]
};
