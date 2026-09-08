/**
 * Textbausteine der Seite „Satellitenfunk".
 *
 * Grundlage sind die Vollzugsordnung für den Funkdienst (Artikel 5 und 22),
 * die Empfehlungen ITU-R P.618, P.838 und P.840 zur Erde-Weltraum-Strecke,
 * IEEE Std 521 für die Bandbuchstaben sowie die öffentlichen System-
 * beschreibungen der Betreiber. Alle Zahlenwerte stehen als Daten in
 * `data/satelliteSystems.ts`; gerechnet wird in `utils/orbitMath.ts`.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'die Bahnklassen LEO, MEO, GEO und HEO nach Höhe, Umlaufzeit und Latenz einordnen',
  'die geostationäre Bahn aus der Forderung „Umlaufzeit gleich siderischer Tag" herleiten',
  'begründen, warum die Aufwärtsstrecke stets höher liegt als die Abwärtsstrecke',
  'abschätzen, wie stark Regen eine Ku- und eine Ka-Band-Strecke dämpft',
  'die Kennzahlen EIRP und G/T richtig zuordnen',
  'erklären, warum ein LEO-Satellit nachgeführt und dopplerkorrigiert werden muss'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'bahnen',
    title: 'Bahnen: LEO, MEO, GEO und HEO',
    eyebrow: 'Bahnmechanik',
    description: 'Alles Weitere folgt aus einer einzigen Größe — der Bahnhöhe.',
    blocks: [
      {
        kind: 'p',
        text: 'Ein Satellit fällt ständig auf die Erde zu und verfehlt sie ständig. Damit das gelingt, muss die Bahngeschwindigkeit zur Höhe passen: je höher, desto langsamer. Aus dieser einen Bedingung folgen Umlaufzeit, Sichtbarkeitsdauer, Signallaufzeit und Dopplerverschiebung — die gesamte Funkplanung hängt an der Bahnhöhe.'
      },
      {
        kind: 'formula',
        formula: 'T = 2π · √(r³ / µ)',
        alt: 'T gleich zwei pi mal Wurzel aus r hoch drei durch mü',
        label: 'Umlaufzeit einer Kreisbahn (drittes Keplersches Gesetz)',
        number: '(1)',
        variables: [
          { symbol: 'T', meaning: 'Umlaufzeit', unit: 's' },
          { symbol: 'r', meaning: 'Bahnradius vom Erdmittelpunkt, also Erdradius plus Höhe', unit: 'm' },
          { symbol: 'µ', meaning: 'geozentrische Gravitationskonstante, 3,986 004 418 · 10¹⁴', unit: 'm³/s²' }
        ]
      },
      {
        kind: 'p',
        text: 'Setzt man für T einen siderischen Tag ein — 23 Stunden 56 Minuten 4 Sekunden, also die Zeit einer vollen Erddrehung gegenüber dem Fixsternhimmel —, ergibt sich ein Bahnradius von rund 42 164 km und damit eine Höhe von 35 786 km über dem Äquator. Ein Satellit auf dieser Kreisbahn läuft synchron zur Erde mit und steht vom Boden aus gesehen still. Genau darauf beruht die feste Ausrichtung jeder Satellitenschüssel.'
      },
      {
        kind: 'table',
        caption: 'Die vier Bahnklassen im Vergleich',
        head: ['Bahn', 'Typische Höhe', 'Umlaufzeit', 'Charakteristik'],
        rows: [
          ['LEO', '300 bis 2000 km', '90 bis 120 min', 'kurze Laufzeit, starker Doppler, wenige Minuten sichtbar'],
          ['MEO', '2000 bis 35 000 km', '4 bis 12 h', 'Bahn der Navigationssysteme, große Ausleuchtzone'],
          ['GEO', '35 786 km', '23 h 56 min', 'steht still, deckt fast ein Drittel der Erde ab, rund 240 ms Laufzeit hin und zurück'],
          ['HEO', 'stark elliptisch', '12 bis 24 h', 'lange Verweildauer über hohen Breiten, Polargebiete']
        ]
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Warum 23 h 56 min und nicht 24 h',
        text: 'Der Sonnentag von 24 Stunden enthält die Bewegung der Erde um die Sonne. Für die Bahn zählt aber nur die Drehung gegenüber den Fixsternen — sie dauert knapp vier Minuten weniger. Rechnet man mit 24 Stunden, liegt die geostationäre Höhe um rund 80 km daneben.'
      }
    ]
  },
  {
    id: 'strecke',
    title: 'Die Erde-Weltraum-Strecke',
    blocks: [
      {
        kind: 'p',
        text: 'Die entscheidende Größe für die Verbindung ist nicht die Bahnhöhe, sondern die Schrägentfernung: die tatsächliche Weglänge von der Erdfunkstelle zum Satelliten. Steht der Satellit im Zenit, sind beide gleich. Steht er dicht über dem Horizont, wächst der Weg erheblich — bei einem geostationären Satelliten von 35 786 km auf über 40 000 km, und das Signal durchquert zusätzlich ein Vielfaches an Atmosphäre.'
      },
      {
        kind: 'formula',
        formula: 'd = R · [ √( ((R+h)/R)² − cos²ε ) − sin ε ]',
        alt: 'd gleich R mal Klammer auf Wurzel aus Klammer R plus h durch R Klammer zu quadriert minus Kosinus quadrat epsilon minus Sinus epsilon Klammer zu',
        label: 'Schrägentfernung zum Satelliten',
        number: '(2)',
        variables: [
          { symbol: 'd', meaning: 'Schrägentfernung', unit: 'm' },
          { symbol: 'R', meaning: 'Erdradius', unit: 'm' },
          { symbol: 'h', meaning: 'Bahnhöhe', unit: 'm' },
          { symbol: 'ε', meaning: 'Elevationswinkel über dem Horizont', unit: '°' }
        ]
      },
      {
        kind: 'p',
        text: 'Aus der Schrägentfernung folgt die Freiraumdämpfung nach derselben Formel wie bei jeder terrestrischen Strecke — nur mit sehr großen Zahlen: Eine geostationäre Verbindung im Ku-Band kommt auf rund 205 dB. Das klingt hoffnungslos und ist es nicht, weil beide Seiten mit hoch bündelnden Antennen arbeiten. Ein Parabolspiegel von 60 cm Durchmesser bringt bei 12 GHz bereits rund 35 dBi Gewinn.'
      },
      {
        kind: 'p',
        text: 'Die zweite Folge der Entfernung ist die Signallaufzeit. Zum geostationären Satelliten und zurück vergehen rund 240 Millisekunden; für ein Frage-Antwort-Spiel im Internet verdoppelt sich das auf fast eine halbe Sekunde. Bei einem Satelliten in 550 km Höhe sind es dagegen nur wenige Millisekunden — der eigentliche Grund, warum die neuen Breitbandkonstellationen in niedrige Bahnen gegangen sind.'
      }
    ]
  },
  {
    id: 'baender',
    title: 'Frequenzbänder und die Richtung der Strecke',
    blocks: [
      {
        kind: 'p',
        text: 'Satellitenverbindungen nutzen die Bandbuchstaben L, S, C, X, Ku und Ka. In den Bändern der festen und mobilen Satellitendienste gilt dieselbe Konvention: Die Aufwärtsstrecke von der Erde zum Satelliten liegt höher als die Abwärtsstrecke vom Satelliten zur Erde. Das ist keine Willkür, sondern eine Leistungsbilanz — der Satellit hat begrenzte Solarleistung und begrenzte Kühlung und bekommt deshalb die günstigere, schwächer gedämpfte Frequenz. Die Erdfunkstelle kann mit großer Antenne und viel Sendeleistung arbeiten und übernimmt den schwierigeren Weg nach oben. Die bekannteste Ausnahme ist das S-Band für Telemetrie und Steuerung von Raumfahrzeugen: Dort liegt die Aufwärtsstrecke bei 2025 bis 2110 MHz und damit unter der Abwärtsstrecke bei 2200 bis 2290 MHz.'
      },
      {
        kind: 'p',
        text: 'Mit der Frequenz wächst die nutzbare Bandbreite — und die Empfindlichkeit gegen Wetter. Im L- und S-Band spielt Regen praktisch keine Rolle; deshalb arbeiten mobile Dienste mit kleinen Rundstrahlantennen dort. Im C-Band bleibt die Regendämpfung gering, was es in den Tropen zur ersten Wahl macht. Ab dem Ku-Band wird Regen zum bestimmenden Faktor, im Ka-Band kostet ein kräftiger Schauer zweistellige Dezibelwerte.'
      },
      {
        kind: 'p',
        text: 'Der übliche Ausweg heißt Leistungsreserve und adaptive Übertragung: Die Anlage rechnet einen Zuschlag für seltene Regenereignisse ein und schaltet bei Bedarf auf robustere Modulation und stärkere Fehlerkorrektur um. Die Datenrate sinkt dann, die Verbindung bleibt. Wie stark der Zuschlag ausfallen muss, ergibt sich aus der Regenstatistik des Standorts nach ITU-R P.618 und P.838.'
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Regen und Elevationswinkel hängen zusammen',
        text: 'Je flacher der Satellit steht, desto länger ist der Weg durch die Regenschicht. Ein Standort in Norddeutschland sieht einen geostationären Satelliten unter einem deutlich kleineren Winkel als einer in Spanien — und braucht bei gleicher Frequenz mehr Reserve.'
      }
    ]
  },
  {
    id: 'transponder',
    title: 'Transponder, EIRP und G/T',
    blocks: [
      {
        kind: 'p',
        text: 'Ein klassischer Transponder ist ein Umsetzer: Er empfängt einen Abschnitt der Aufwärtsstrecke, verschiebt ihn im Frequenzbereich, verstärkt ihn und strahlt ihn im Abwärtsband wieder ab. Er versteht den Inhalt nicht und muss es auch nicht — deshalb kann derselbe Transponder Fernsehen, Datenverkehr oder Telefonie tragen. Übliche Transponderbandbreiten liegen bei 27 bis 72 MHz. Moderne Satelliten arbeiten zunehmend regenerativ: Sie demodulieren, verarbeiten und modulieren neu, was Rauschen unterdrückt und Verkehr zwischen Strahlen umleiten lässt.'
      },
      {
        kind: 'p',
        text: 'Zwei Kennzahlen beschreiben die Enden der Strecke. Auf der Sendeseite ist es die äquivalente isotrope Strahlungsleistung EIRP: Sendeleistung plus Antennengewinn abzüglich Leitungsverlusten. Auf der Empfangsseite ist es die Antennengüte G/T — der Antennengewinn abzüglich zehnmal dem Logarithmus der Systemrauschtemperatur.'
      },
      {
        kind: 'formula',
        formula: 'G/T = G_dBi − 10 · log₁₀(T_sys / 1 K)',
        alt: 'G durch T gleich G in dBi minus zehn mal Logarithmus zur Basis zehn von T system durch ein Kelvin',
        label: 'Antennengüte einer Empfangsstation',
        number: '(3)',
        variables: [
          { symbol: 'G/T', meaning: 'Antennengüte', unit: 'dB/K' },
          { symbol: 'G_dBi', meaning: 'Antennengewinn gegenüber dem isotropen Strahler', unit: 'dBi' },
          { symbol: 'T_sys', meaning: 'Systemrauschtemperatur aus Antenne, Speiseleitung und Empfänger', unit: 'K' }
        ]
      },
      {
        kind: 'p',
        text: 'G/T fasst zusammen, was zählt: Ein größerer Spiegel hilft, ein rauschärmerer Vorverstärker hilft, und eine Antenne, die am Erdboden vorbeischaut, verschlechtert die Sache — denn die warme Erde erhöht die Rauschtemperatur. Deshalb sinkt die Güte, wenn der Satellit tief steht, gleich doppelt: mehr Atmosphäre im Weg und mehr Erdrauschen in der Keule.'
      }
    ]
  },
  {
    id: 'systeme',
    title: 'Systeme in der Praxis',
    blocks: [
      {
        kind: 'p',
        text: 'Die geostationären Systeme sind die ältesten. Inmarsat entstand aus dem Seefunk und trägt bis heute das GMDSS im Seegebiet A3; das Satellitenfernsehen füllt in Europa das Ku-Band zwischen 10,7 und 12,75 GHz, wo ein einziger Transponder einen Multiplex aus mehreren Programmen überträgt und die beiden Polarisationsebenen doppelt belegt werden. Der Universal-LNB an der Schüssel setzt das Band auf 950 bis 2150 MHz herunter, damit es über ein gewöhnliches Koaxialkabel ins Haus passt.'
      },
      {
        kind: 'p',
        text: 'In niedrigen Bahnen arbeiten Iridium mit 66 Satelliten in sechs polaren Bahnebenen und die Breitbandkonstellationen, die inzwischen tausende Satelliten in rund 550 km Höhe betreiben. Beide teilen dieselbe Herausforderung: Ein einzelner Satellit ist nur wenige Minuten sichtbar, also muss die Nutzerantenne ihm folgen und die Verbindung rechtzeitig an den nächsten übergeben. Elektronisch schwenkbare Gruppenantennen machen das ohne bewegte Teile.'
      },
      {
        kind: 'p',
        text: 'Für den Amateurfunk ist QO-100 ein Sonderfall: der erste geostationäre Amateurfunk-Transponder, aufwärts bei 2400 MHz, abwärts bei 10 489 MHz. Weil der Satellit stillsteht, entfallen Nachführung und Doppler vollständig — die Verbindung von Brasilien bis Thailand steht rund um die Uhr. Der Gegenpol ist die Raumstation in 420 km Höhe: rund 93 Minuten Umlaufzeit, wenige Minuten Sichtbarkeit je Überflug und mehrere Kilohertz Dopplerverschiebung im 2-m- und 70-cm-Band, die nachgeführt werden müssen.'
      },
      {
        kind: 'p',
        text: 'Auch der einfachste Einstieg liegt in der niedrigen Bahn. Die polumlaufenden Wettersatelliten der NOAA-Reihe senden ihre Bilder unverschlüsselt und analog moduliert um 137 MHz; eine selbstgebaute Antenne mit zirkularer Polarisation und ein SDR-Empfänger genügen, um beim Überflug ein Wolkenbild aufzuzeichnen. Die russischen Meteor-M-Satelliten senden im selben Bereich digital und liefern deutlich bessere Bilder.'
      },
      {
        kind: 'formula',
        formula: 'Δf = f · v / c',
        alt: 'Delta f gleich f mal v durch c',
        label: 'Dopplerverschiebung bei radialer Bewegung',
        number: '(4)',
        variables: [
          { symbol: 'Δf', meaning: 'Frequenzverschiebung', unit: 'Hz' },
          { symbol: 'f', meaning: 'Sendefrequenz', unit: 'Hz' },
          { symbol: 'v', meaning: 'radiale Geschwindigkeit zwischen Sender und Empfänger', unit: 'm/s' },
          { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' }
        ]
      },
      {
        kind: 'p',
        text: 'Setzt man die Bahngeschwindigkeit der Raumstation von rund 7,7 km/s als obere Schranke ein, ergibt das im 2-m-Band knapp 4 kHz und im 70-cm-Band über 11 kHz Verschiebung zwischen Aufgang und Untergang. Ohne Nachführung wandert das Signal aus dem Empfangsfilter — beim Aufgang zu hoch, beim Untergang zu tief.'
      }
    ]
  }
];
