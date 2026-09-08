/**
 * Zweite Hälfte des Kapitels „Elektromagnetische Wellen": Polarisation,
 * Feldwellenwiderstand, Photonenenergie und die Einordnung im Spektrum.
 *
 * Ausgelagert, damit `em-wellen.ts` unter 300 Zeilen bleibt; die Zahlenwerte
 * stammen wie dort aus `em-wellen.data.ts`.
 */
import type { ArticleSection } from '../types';
import { formatFrequency, formatNumber } from '$lib/utils/formatting';
import { photonEnergyEv } from '$lib/components/widgets/EmWaveModel';
import {
  DENSITY_EXAMPLE_W,
  REFERENCE_HZ,
  circularLoss,
  crossPolLoss,
  densityField,
  ev,
  impedance,
  ionizingEnergy,
  ionizingFrequency,
  ionizingWavelength,
  linearToCircular,
  tilt45
} from './em-wellen.data';

/** Abschnitte 4 bis 7 des Kapitels. */
export const EM_WELLEN_SECTIONS_TAIL: ArticleSection[] = [
  {
    id: 'polarisation',
    title: 'Polarisation',
    description:
      'Die Polarisation beschreibt, in welche Richtung der E-Vektor zeigt — und entscheidet mit darüber, wie viel Leistung am Empfänger ankommt.',
    blocks: [
      {
        type: 'cards',
        columns: 2,
        items: [
          {
            title: 'Linear vertikal',
            subtitle: 'V · senkrechter E-Vektor',
            html: 'Übliche Wahl bei Bodenwellenausbreitung, Mobilfunk und Rundstrahlantennen; der leitende Boden würde ein horizontales Feld kurzschließen.',
            facts: [{ label: 'Typisch', value: 'MW/LW, PMR, Mobilfunk' }]
          },
          {
            title: 'Linear horizontal',
            subtitle: 'H · waagerechter E-Vektor',
            html: 'Übliche Wahl bei UKW- und Fernsehantennen sowie bei Yagi-Antennen auf Richtfunkstrecken.',
            facts: [{ label: 'Typisch', value: 'UKW-Rundfunk, TV, Yagi' }]
          },
          {
            title: 'Zirkular rechtsdrehend',
            subtitle: 'RHCP',
            html: 'Der E-Vektor rotiert im Uhrzeigersinn, von der Antenne aus gesehen. Die Ausrichtung der Empfangsantenne spielt keine Rolle mehr.',
            facts: [{ label: 'Typisch', value: 'GNSS, Satellitenfunk' }]
          },
          {
            title: 'Zirkular linksdrehend',
            subtitle: 'LHCP',
            html: 'Gegensinnige Drehrichtung. Zwei Satelliten können damit dieselbe Frequenz nutzen, ohne sich zu stören.',
            facts: [{ label: 'Typisch', value: 'Transponder-Doppelbelegung' }]
          }
        ]
      },
      {
        type: 'table',
        caption: 'Polarisationsverlust zwischen Sende- und Empfangsantenne (Richtwerte)',
        columns: ['Sendeantenne', 'Empfangsantenne', 'Verlust'],
        monoColumns: [2],
        rows: [
          ['linear vertikal', 'linear vertikal', '0 dB'],
          ['linear vertikal', 'linear um 45° verdreht', `${tilt45} dB`],
          ['linear vertikal', 'linear horizontal', `> ${crossPolLoss} dB`],
          ['linear (beliebig)', 'zirkular (beliebig)', `${linearToCircular} dB`],
          ['RHCP', 'RHCP', '0 dB'],
          ['RHCP', 'LHCP', `> ${crossPolLoss} dB`]
        ]
      },
      {
        type: 'paragraph',
        html: `Zwei linear polarisierte Antennen verlieren bei einer Verdrehung um den Winkel α den Faktor cos²α an Leistung, also −20·log₁₀(cos α) in Dezibel. Bei 90° ist der Verlust theoretisch unendlich; reale Antennen erreichen eine Kreuzpolarisationsentkopplung von ${crossPolLoss} bis 30 dB. Der Übergang linear ↔ zirkular kostet dagegen immer ${circularLoss} dB — die Hälfte der Leistung steckt in der falschen Komponente und lässt sich nicht zurückholen.`
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Warum Satelliten zirkular senden',
        html: `Ein Satellit weiß nicht, wie die Empfangsantenne gedreht ist, und die Ionosphäre dreht die Polarisationsebene ohnehin (Faraday-Drehung). Zirkulare Polarisation kostet gegenüber einer perfekt ausgerichteten linearen Antenne ${circularLoss} dB, ist dafür aber unempfindlich gegen jede Verdrehung — und diese ${circularLoss} dB sind deutlich billiger als ein gelegentlicher Totalausfall.`
      }
    ]
  },
  {
    id: 'feldwellenwiderstand',
    title: 'Feldwellenwiderstand und Leistungsdichte',
    description:
      'Im freien Raum stehen E-Feld und H-Feld in einem festen Verhältnis — dem Feldwellenwiderstand Z₀.',
    blocks: [
      {
        type: 'formula',
        formula: 'Z₀ = E / H = √(µ₀ / ε₀) ≈ 377 Ω',
        alt: 'Z null gleich E durch H gleich Wurzel aus my null durch epsilon null, rund 377 Ohm',
        label: 'Feldwellenwiderstand des freien Raums',
        number: '(4)',
        variables: [
          { symbol: 'Z₀', meaning: 'Feldwellenwiderstand des Vakuums', unit: 'Ω' },
          { symbol: 'E', meaning: 'Elektrische Feldstärke', unit: 'V/m' },
          { symbol: 'H', meaning: 'Magnetische Feldstärke', unit: 'A/m' }
        ]
      },
      {
        type: 'paragraph',
        html: `Der genaue Wert beträgt ${impedance} Ω (CODATA 2018); in der Praxis rechnet man mit 377 Ω oder 120π Ω. Weil E und H fest gekoppelt sind, genügt eine der beiden Größen, um das Feld zu beschreiben — Feldstärkemessgeräte geben deshalb fast immer nur E in V/m oder dBµV/m an.`
      },
      {
        type: 'formula',
        formula: 'S = E² / Z₀ = E · H',
        alt: 'S gleich E Quadrat durch Z null gleich E mal H',
        label: 'Leistungsdichte der ebenen Welle',
        number: '(5)',
        variables: [
          { symbol: 'S', meaning: 'Leistungsdichte', unit: 'W/m²' },
          { symbol: 'E', meaning: 'Elektrische Feldstärke (Effektivwert)', unit: 'V/m' },
          { symbol: 'Z₀', meaning: 'Feldwellenwiderstand', unit: 'Ω' }
        ]
      },
      {
        type: 'callout',
        tone: 'formula',
        title: 'Zahlenbeispiel',
        html: `Einer Leistungsdichte von ${formatNumber(DENSITY_EXAMPLE_W, 0)} W/m² entspricht eine Feldstärke von E = √(S·Z₀) = ${densityField} V/m. Umgekehrt lässt sich aus jeder gemessenen Feldstärke sofort die Leistungsdichte bestimmen. Wie beides mit Sendeleistung und Antennengewinn zusammenhängt, zeigt das Kapitel <a href="/wissen/grundlagen/leistung-und-pegel/">Leistung, EIRP und Feldstärke</a>.`
      }
    ]
  },
  {
    id: 'photonenenergie',
    title: 'Photonenenergie: ionisierend oder nicht?',
    description:
      'Dieselbe Welle lässt sich als Strom von Photonen beschreiben; ihre Energie entscheidet über die biologische Wirkung.',
    blocks: [
      {
        type: 'formula',
        formula: 'E = h · f',
        alt: 'E gleich h mal f',
        label: 'Photonenenergie',
        number: '(6)',
        variables: [
          { symbol: 'E', meaning: 'Energie eines Photons', unit: 'J bzw. eV' },
          { symbol: 'h', meaning: 'Plancksches Wirkungsquantum (6,626·10⁻³⁴ J·s)', unit: 'J·s' },
          { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
        ]
      },
      {
        type: 'paragraph',
        html: `Um ein Atom zu ionisieren, muss ein einzelnes Photon ein Elektron aus seiner Bindung lösen. Die Grenze liegt konventionell bei ${ionizingWavelength} Wellenlänge, also ${ionizingFrequency} beziehungsweise ${ionizingEnergy} — im fernen Ultraviolett. Alles darunter, vom Längstwellensender bis zum sichtbaren Licht, ist <strong>nichtionisierende Strahlung</strong>. Ein Photon bei ${formatFrequency(REFERENCE_HZ, 0)} trägt ${ev(photonEnergyEv(REFERENCE_HZ))} — rund sieben Größenordnungen zu wenig.`
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Nicht ionisierend heißt nicht wirkungslos',
        html: 'Hochfrequenz wirkt thermisch: Absorbierte Leistung erwärmt Gewebe. Deshalb gibt es Grenzwerte für die Leistungsdichte, nicht für die Photonenenergie. Die Einordnung dieser Grenzwerte steht im Kapitel <a href="/wissen/grundlagen/leistung-und-pegel/">Leistung, EIRP und Feldstärke</a>.',
        source: 'ICNIRP-Leitlinien (nichtionisierende Strahlung: 100 nm bis 1 mm)'
      }
    ]
  },
  {
    id: 'einordnung',
    title: 'Einordnung im Spektrum',
    blocks: [
      {
        type: 'paragraph',
        html: 'Funkwellen, Wärmestrahlung, sichtbares Licht und Röntgenstrahlung unterscheiden sich physikalisch nur in der Frequenz — es sind dieselben Wellen. Die Bandnamen (ELF bis THF nach ITU, L bis W nach IEEE, A bis O nach NATO) sind reine Verabredungen über Frequenzbereiche.'
      },
      {
        type: 'list',
        items: [
          'Das gesamte Spektrum interaktiv: <a href="/spektrum/">Spektrum-Dashboard</a>.',
          'Alle Bandgrenzen im Detail: <a href="/datenbanken/frequenzbaender/">Datenbank der Frequenzbänder</a>.',
          'Wer welches Band nutzt: <a href="/spektrum/anwendungen/">Anwendungen im Spektrum</a>.'
        ]
      }
    ]
  }
];
