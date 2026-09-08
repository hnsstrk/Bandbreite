/**
 * Textbausteine und Formeln der Wissensseite „Antennen".
 *
 * Wie bei der Modulationsseite stehen die Inhalte als typisierte Daten, damit
 * die Route schlank bleibt und die Texte durchsuchbar sind. Alle Texte sind
 * eigenständig formuliert; Kennwerte und Quellen stammen aus
 * `$lib/data/antennas.ts`.
 */

import type { TocItem } from '$lib/components/ui/TableOfContents.svelte';
import type { FormulaEntry } from './modulation';

/** Lernziele am Seitenanfang. */
export const ANTENNA_GOALS: string[] = [
  'den isotropen Strahler als Bezugsgröße erklären und dBi in dBd umrechnen',
  'Gewinn, Richtwirkung und Wirkungsgrad auseinanderhalten',
  'ein Richtdiagramm lesen: Halbwertsbreite, Nebenkeulen, Vor-Rück-Verhältnis',
  'den Gewinn einer Parabolantenne aus Durchmesser und Frequenz berechnen',
  'Polarisation, Fußpunktimpedanz und Stehwellenverhältnis richtig einordnen',
  'die gängigen Bauformen nach Gewinn, Bandbreite und Einsatzzweck unterscheiden'
];

/** Gliederung für das Inhaltsverzeichnis. */
export const ANTENNA_TOC: TocItem[] = [
  { id: 'isotropstrahler', label: 'Der isotrope Strahler, dBi und dBd', level: 2 },
  { id: 'gewinn-und-richtwirkung', label: 'Gewinn, Richtwirkung, Wirkungsgrad', level: 2 },
  { id: 'reziprozitaet', label: 'Reziprozität: senden gleich empfangen', level: 3 },
  { id: 'richtdiagramm', label: 'Das Richtdiagramm lesen', level: 2 },
  { id: 'polarisation', label: 'Polarisation', level: 2 },
  { id: 'impedanz-und-anpassung', label: 'Impedanz, Anpassung und SWR', level: 2 },
  { id: 'apertur-und-fernfeld', label: 'Apertur, Wirkfläche und Fernfeld', level: 2 },
  { id: 'bauformen', label: 'Bauformen im Überblick', level: 2 }
];

/** Fließtext je Abschnitt. */
export const ANTENNA_TEXT: Record<string, string[]> = {
  isotrop: [
    'Eine Antenne erzeugt keine Leistung. Sie verteilt die zugeführte Leistung nur ungleich über ' +
      'den Raum: Was in eine Richtung mehr geht, fehlt in einer anderen. Damit man diese ' +
      'Ungleichverteilung beziffern kann, braucht es eine Bezugsgröße — den isotropen Strahler, ' +
      'der in jede Raumrichtung gleich stark abstrahlt.',
    'Diesen Strahler gibt es nicht und kann es nicht geben; eine kugelsymmetrische, ' +
      'transversale Abstrahlung ist physikalisch widersprüchlich. Als Rechengröße ist er ' +
      'trotzdem unschlagbar, weil er von jeder Bauform unabhängig ist. Ein Gewinn von 12 dBi ' +
      'bedeutet: In der Hauptstrahlrichtung kommt sechzehnmal so viel Leistungsdichte an wie bei ' +
      'einem isotropen Strahler mit derselben zugeführten Leistung.',
    'Die zweite gebräuchliche Bezugsgröße ist der Halbwellendipol. Er hat selbst 2,15 dBi ' +
      'Gewinn, also gilt: dBi = dBd + 2,15. Wer beide Angaben verwechselt, verschätzt sich um ' +
      'gut zwei Dezibel — bei einer Reichweitenabschätzung durchaus spürbar. Im Zweifel ist die ' +
      'Angabe in dBi die konservativere Wahl, weil sie die größere Zahl liefert.'
  ],
  gewinn: [
    'Streng genommen sind zwei Größen zu unterscheiden. Die Richtwirkung D beschreibt allein die ' +
      'Bündelung: wie stark die abgestrahlte Leistung in der Hauptrichtung gegenüber dem ' +
      'Mittelwert überhöht ist. Der Gewinn G berücksichtigt zusätzlich die Verluste in der ' +
      'Antenne selbst, also G = η · D mit dem Wirkungsgrad η. Bei gut gebauten Antennen im ' +
      'Mikrowellenbereich liegt η nahe 1, bei stark verkürzten Strahlern für lange Wellen kann ' +
      'er in den einstelligen Prozentbereich fallen.',
    'Bündelung und Öffnungswinkel sind zwei Seiten derselben Sache: Wer den Öffnungswinkel ' +
      'halbiert, gewinnt rund 6 dB. Als Faustformel gilt für rotationssymmetrische Keulen ' +
      'θ ≈ √(41253 / G), wobei G der lineare Gewinnfaktor ist. Eine Antenne mit 30 dBi bündelt ' +
      'demnach auf etwa 6,4 Grad.',
    'Für die Funkstrecke zählt schließlich die äquivalente isotrope Strahlungsleistung EIRP: ' +
      'Sendeleistung plus Antennengewinn abzüglich der Kabelverluste, alles in dB. Sie ist die ' +
      'Größe, die in Zulassungsvorschriften begrenzt wird — nicht die Sendeleistung allein.'
  ],
  reziprozitaet: [
    'Eine Antenne verhält sich beim Empfang genauso wie beim Senden: gleiches Richtdiagramm, ' +
      'gleicher Gewinn, gleiche Impedanz. Diese Reziprozität folgt unmittelbar aus den ' +
      'Maxwell-Gleichungen und erspart in der Praxis die halbe Arbeit — eine Messung im ' +
      'Sendebetrieb gilt auch für den Empfang.',
    'Nur eines gilt nicht symmetrisch: das Rauschen. Eine Empfangsantenne nimmt aus der Richtung ' +
      'ihrer Nebenkeulen die Wärmestrahlung des Erdbodens auf. Deshalb kann eine Antenne mit ' +
      'geringerem Gewinn, aber besserer Nebenkeulenunterdrückung in der Empfangspraxis das ' +
      'bessere Signal-Rausch-Verhältnis liefern.'
  ],
  richtdiagramm: [
    'Das Richtdiagramm zeigt die abgestrahlte Leistungsdichte über dem Winkel, üblicherweise als ' +
      'Schnitt durch eine Ebene und auf das Maximum normiert. Vier Kennwerte liest man daraus ab:',
    'Die Halbwertsbreite ist der Winkelbereich, in dem die Leistungsdichte auf mindestens die ' +
      'Hälfte des Maximums fällt — die berühmten −3 dB. Die Nebenkeulen sind die kleineren ' +
      'Maxima seitlich der Hauptkeule; ihr Abstand zum Maximum entscheidet darüber, wie stark ' +
      'eine Antenne aus unerwünschten Richtungen aufnimmt. Das Vor-Rück-Verhältnis vergleicht ' +
      'Hauptstrahlrichtung und Gegenrichtung und ist bei Richtantennen das Maß für die ' +
      'Unterdrückung rückwärtiger Störer. Die Nullstellen schließlich sind Richtungen, in denen ' +
      'praktisch nichts abgestrahlt wird — man kann sie gezielt auf einen Störer legen.',
    'Beim Halbwellendipol ist das Diagramm ein liegender Achter mit 78 Grad Halbwertsbreite und ' +
      'zwei tiefen Nullstellen längs der Drahtachse. Eine Yagi bündelt auf 30 bis 50 Grad, eine ' +
      'Parabolantenne je nach Durchmesser auf Bruchteile eines Grades. Bei der Gruppenantenne ' +
      'entsteht die Bündelung nicht aus der Bauform des Einzelstrahlers, sondern aus der ' +
      'Überlagerung vieler gleicher Elemente — und lässt sich deshalb elektronisch schwenken.'
  ],
  polarisation: [
    'Die Polarisation beschreibt die Richtung, in der das elektrische Feld schwingt. Ein ' +
      'senkrecht montierter Dipol strahlt vertikal polarisiert ab, ein waagerechter horizontal. ' +
      'Sender und Empfänger müssen zueinander passen: Bei 90 Grad Versatz bricht der Pegel ' +
      'theoretisch vollständig, praktisch um 20 bis 30 dB ein. Genau das nutzt der Rundfunk zur ' +
      'Entkopplung benachbarter Sender auf gleicher Frequenz.',
    'Bei zirkularer Polarisation dreht sich der Feldvektor mit jeder Periode einmal um die ' +
      'Ausbreitungsrichtung — rechts- oder linksdrehend. Das ist überall dort wertvoll, wo die ' +
      'Ausrichtung der Gegenstelle unbekannt ist oder sich ändert: bei Satelliten, die ' +
      'taumeln, und auf Wegen durch die Ionosphäre, die die Polarisationsebene dreht ' +
      '(Faraday-Drehung). Zwischen linear und zirkular gehen grundsätzlich 3 dB verloren, ' +
      'zwischen zwei entgegengesetzten Drehsinnen dagegen fast alles.'
  ],
  impedanz: [
    'Am Fußpunkt zeigt jede Antenne eine Impedanz. Beim freistehenden Halbwellendipol sind es ' +
      'rund 73 Ohm, beim Viertelwellenstrahler über idealer Massefläche rund 37 Ohm. Die ' +
      'Hochfrequenztechnik hat sich auf 50 Ohm als Systemimpedanz geeinigt — ein Kompromiss ' +
      'zwischen geringster Dämpfung und höchster Spannungsfestigkeit von Koaxialkabeln.',
    'Passt die Antennenimpedanz nicht zur Leitung, läuft ein Teil der Leistung zurück. Aus der ' +
      'Überlagerung von hin- und rücklaufender Welle entsteht auf der Leitung eine stehende ' +
      'Welle; ihr Verhältnis von Maximum zu Minimum ist das Stehwellenverhältnis SWR. Es ist ' +
      'eine Verhältniszahl, keine Verlustangabe: Ein SWR von 2 bedeutet, dass elf Prozent der ' +
      'Leistung zurücklaufen — ein Verlust von einem halben Dezibel, in der Praxis kaum hörbar.',
    'Kritisch wird ein hohes SWR aus anderen Gründen: Halbleiterendstufen regeln ab oder gehen ' +
      'kaputt, auf der Leitung entstehen Spannungsüberhöhungen, und die zurücklaufende Leistung ' +
      'heizt das Kabel. Sinnvoll ist deshalb ein SWR bis etwa 1,5; ab 3 sollte man die Ursache ' +
      'suchen, statt sie mit einem Anpassgerät zu verstecken — das Anpassgerät macht den Sender ' +
      'zufrieden, ändert an der Fehlanpassung an der Antenne aber nichts.'
  ],
  apertur: [
    'Bei Flächenantennen — Parabol, Horn, Gruppe — folgt der Gewinn unmittelbar aus der Fläche. ' +
      'Je größer die Apertur im Verhältnis zur Wellenlänge, desto schärfer die Bündelung. Für ' +
      'den Parabolspiegel gilt G = η · (π · D / λ)²: Doppelter Durchmesser oder doppelte ' +
      'Frequenz bringen jeweils 6 dB. Der Flächenwirkungsgrad η liegt real bei 0,5 bis 0,7, ' +
      'weil Erregerabschattung, Randüberstrahlung und Oberflächenfehler Fläche kosten.',
    'Umgekehrt lässt sich jeder Antenne eine Wirkfläche zuordnen — auch einem dünnen Draht. ' +
      'A_eff = G · λ² / (4π) ist die Fläche, aus der die Antenne der vorbeilaufenden Welle ' +
      'Leistung entzieht. Diese Beziehung ist der Grund, warum die Freiraumdämpfung mit der ' +
      'Frequenz zunimmt: Nicht der Weg wird verlustreicher, die Empfangsantenne wird bei ' +
      'gleichem Gewinn kleiner.',
    'Alle Gewinnangaben gelten erst im Fernfeld. Es beginnt näherungsweise bei r = 2 · D² / λ. ' +
      'Für eine 3-Meter-Schüssel bei 10 GHz sind das 600 Meter — jede Messung davor liefert ' +
      'falsche Werte, und auch Sicherheitsabstände sind entsprechend zu bewerten.'
  ],
  bauformen: [
    'Die Tabelle fasst die Bauformen aus der Projektdatenbank zusammen. Die Gewinnangaben sind ' +
      'typische Bereiche ausgeführter Antennen, keine Grenzwerte; der Öffnungswinkel bezieht ' +
      'sich auf die Hauptebene, 360 Grad kennzeichnet Rundstrahler.'
  ]
};

export const ANTENNA_FORMULAS: Record<string, FormulaEntry> = {
  dbd: {
    formula: 'G[dBi] = G[dBd] + 2,15 dB',
    alt: 'Gewinn in dBi gleich Gewinn in dBd plus zwei Komma eins fünf Dezibel',
    label: 'Umrechnung der beiden Bezugsgrößen',
    number: '(1)',
    variables: [
      { symbol: 'G[dBi]', meaning: 'Gewinn bezogen auf den isotropen Strahler', unit: 'dBi' },
      { symbol: 'G[dBd]', meaning: 'Gewinn bezogen auf den Halbwellendipol', unit: 'dBd' }
    ]
  },
  beamwidth: {
    formula: 'θ ≈ √(41253 / G)',
    alt: 'Halbwertsbreite ungefähr Wurzel aus einundvierzigtausendzweihundertdreiundfünfzig geteilt durch G',
    label: 'Halbwertsbreite einer rotationssymmetrischen Keule',
    number: '(2)',
    variables: [
      { symbol: 'θ', meaning: 'Halbwertsbreite (−3 dB)', unit: 'Grad' },
      { symbol: 'G', meaning: 'linearer Gewinnfaktor, nicht in dB' },
      { symbol: '41253', meaning: 'Quadratgrad der Kugeloberfläche, 4π sr' }
    ]
  },
  parabolic: {
    formula: 'G = η · (π · D / λ)²      θ ≈ 70° · λ / D',
    alt: 'Gewinn gleich Wirkungsgrad mal Klammer auf Pi mal Durchmesser durch Wellenlänge Klammer zu zum Quadrat; Halbwertsbreite ungefähr siebzig Grad mal Wellenlänge durch Durchmesser',
    label: 'Gewinn und Öffnungswinkel einer Parabolantenne',
    number: '(3)',
    variables: [
      { symbol: 'G', meaning: 'Gewinn als linearer Faktor' },
      { symbol: 'η', meaning: 'Flächenwirkungsgrad, real 0,5 bis 0,7' },
      { symbol: 'D', meaning: 'Spiegeldurchmesser', unit: 'm' },
      { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' }
    ]
  },
  aperture: {
    formula: 'A_eff = G · λ² / (4π)      r_ff = 2 · D² / λ',
    alt: 'Wirkfläche gleich Gewinn mal Wellenlänge zum Quadrat durch vier Pi; Fernfeldabstand gleich zwei mal Durchmesser zum Quadrat durch Wellenlänge',
    label: 'Wirkfläche und Beginn des Fernfelds',
    number: '(4)',
    variables: [
      { symbol: 'A_eff', meaning: 'wirksame Antennenfläche', unit: 'm²' },
      { symbol: 'G', meaning: 'Gewinn als linearer Faktor' },
      { symbol: 'r_ff', meaning: 'Abstand, ab dem das Fernfeld gilt', unit: 'm' },
      { symbol: 'D', meaning: 'größte Abmessung der Apertur', unit: 'm' }
    ]
  },
  swr: {
    formula: 'Γ = (Z_L − Z₀) / (Z_L + Z₀)      s = (1 + |Γ|) / (1 − |Γ|)',
    alt: 'Reflexionsfaktor gleich Lastimpedanz minus Systemimpedanz durch Lastimpedanz plus Systemimpedanz; Stehwellenverhältnis gleich eins plus Betrag Gamma durch eins minus Betrag Gamma',
    label: 'Reflexionsfaktor und Stehwellenverhältnis',
    number: '(5)',
    variables: [
      { symbol: 'Γ', meaning: 'Reflexionsfaktor am Fußpunkt' },
      { symbol: 'Z_L', meaning: 'Fußpunktimpedanz der Antenne', unit: 'Ω' },
      { symbol: 'Z₀', meaning: 'Systemimpedanz, meist 50 Ω', unit: 'Ω' },
      { symbol: 's', meaning: 'Stehwellenverhältnis (SWR)' }
    ]
  }
};

/** Beschriftungen der Bauform-Kategorien für die Übersichtstabelle. */
export const ANTENNA_CATEGORY_LABELS: Record<string, string> = {
  referenz: 'Bezugsgröße',
  draht: 'Drahtantenne',
  richt: 'Richtantenne',
  flaechen: 'Flächenantenne',
  gruppe: 'Gruppenantenne'
};
