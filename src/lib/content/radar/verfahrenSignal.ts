/**
 * Signalverarbeitungs- und Systemabschnitte des Kapitels „Radarverfahren".
 * Ausgelagert, damit keine Datei über 300 Zeilen wächst.
 */
import type { ArticleSection } from '../types';

export const RADAR_SIGNAL_SECTIONS: ArticleSection[] = [
  {
    id: 'cfar',
    title: 'CFAR — Schwelle mit konstanter Fehlalarmrate',
    description:
      'Eine feste Entscheidungsschwelle funktioniert nur bei gleichbleibendem Störhintergrund. CFAR zieht die Schwelle aus der Umgebung jeder Zelle.',
    blocks: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Die geprüfte Entfernungszelle heißt <strong>Prüfzelle</strong> (Cell Under Test).',
          'Unmittelbar daneben liegen <strong>Schutzzellen</strong>: Sie werden ausgelassen, damit das Ziel nicht die eigene Schwelle anhebt.',
          'Weiter außen mitteln <strong>Referenzzellen</strong> den Störpegel (CA-CFAR: arithmetisches Mittel).',
          'Die Schwelle ist dieser Mittelwert mal einem Faktor α, der aus der gewünschten Fehlalarmrate folgt.',
          'Überschreitet die Prüfzelle die Schwelle, gilt sie als Ziel.'
        ]
      },
      {
        type: 'paragraph',
        html: 'Der Nutzen: Ob das Radar über ruhige See, über eine Stadt oder in eine Regenwand blickt, die Zahl der Fehlalarme bleibt etwa gleich. Varianten begegnen typischen Schwächen – GO-CFAR (größerer der beiden Halbfenster) an Störkanten, OS-CFAR (Ordnungsstatistik) bei mehreren Zielen dicht beieinander, die sonst gegenseitig ihre Schwelle anheben würden.'
      }
    ]
  },
  {
    id: 'phased-array',
    title: 'Phased Array und Strahlschwenkung',
    description:
      'Viele kleine Strahler statt einer drehenden Schüssel: Die Phase entscheidet, wohin die Keule zeigt.',
    blocks: [
      {
        type: 'formula',
        formula: 'Δφ = 2π · d · sin θ / λ',
        alt: 'Delta phi gleich 2 Pi mal d mal Sinus Theta geteilt durch Lambda',
        label: 'Phasenversatz zwischen benachbarten Elementen für den Schwenkwinkel θ',
        number: '(8)',
        variables: [
          { symbol: 'd', meaning: 'Elementabstand', unit: 'm' },
          { symbol: 'θ', meaning: 'Schwenkwinkel gegen die Flächennormale', unit: '°' }
        ]
      },
      {
        type: 'list',
        items: [
          'Die Keule schwenkt in Mikrosekunden – ohne bewegte Masse.',
          'Mehrere Ziele lassen sich quasi gleichzeitig verfolgen, weil der Strahl zwischen Aufgaben springt.',
          'Bei d > λ/2 entstehen <strong>Gitterkeulen</strong> (grating lobes) in unerwünschten Richtungen.',
          'Der Gewinn sinkt mit cos θ, weil die wirksame Apertur beim Schwenken kleiner wird; jenseits von etwa 60° lohnt sich eine weitere Antennenfläche.',
          'AESA gibt jedem Element ein eigenes Sende-/Empfangsmodul – ausfallsicher und frequenzagil.'
        ]
      }
    ]
  },
  {
    id: 'sar-und-bistatisch',
    title: 'SAR, bistatische und passive Systeme',
    description:
      'Zwei Wege, die Bindung an eine große Antenne oder an einen eigenen Sender aufzugeben.',
    blocks: [
      {
        type: 'paragraph',
        html: '<strong>SAR</strong> (Synthetic Aperture Radar) nutzt die Bewegung des Trägers: Ein Flugzeug oder Satellit nimmt entlang seiner Bahn viele Echos auf und rechnet sie phasenrichtig zusammen, als stammten sie aus einer sehr langen Antenne. Verblüffend ist das Ergebnis: Die Azimutauflösung wird etwa D/2 – die halbe reale Antennenlänge – und ist damit <strong>unabhängig von der Entfernung</strong>. Eine kürzere Antenne liefert sogar feinere Auflösung, weil ihre breitere Keule jedes Ziel länger beleuchtet.'
      },
      {
        type: 'cards',
        columns: 2,
        items: [
          {
            title: 'Bistatisches Radar',
            html: 'Sender und Empfänger stehen an verschiedenen Orten. Gemessen wird die Summe beider Wege, Ortslinien sind Ellipsen mit Sender und Empfänger als Brennpunkten.',
            points: [
              'Der Empfänger strahlt nichts ab und ist schwer zu orten',
              'Vorwärtsstreuung macht auch schwer sichtbare Ziele auffällig',
              'Beide Stationen brauchen eine gemeinsame Zeit- und Phasenreferenz'
            ]
          },
          {
            title: 'Passivradar',
            html: 'Kein eigener Sender: Ausgewertet werden fremde Aussendungen wie UKW-Rundfunk, DAB+ oder DVB-T2, die am Ziel gestreut werden.',
            points: [
              'Keine Frequenzzuteilung und keine eigene Abstrahlung nötig',
              'Auflösung folgt der Bandbreite des Fremdsenders',
              'Der Direktweg muss vor der Auswertung unterdrückt werden'
            ]
          }
        ]
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Kohärenz als gemeinsame Voraussetzung',
        html: 'Doppler-Auswertung, MTI, Pulskompression und SAR setzen voraus, dass die Phase von Impuls zu Impuls bekannt bleibt. Ein kohärentes Radar leitet Sende- und Empfangsoszillator aus derselben Referenz ab; „coherent on receive"-Anlagen merken sich stattdessen die Phase jedes Sendeimpulses.'
      }
    ]
  }
];
