/**
 * Textbausteine und Formeln der Wissensseite „Modulation".
 *
 * Die Inhalte stehen bewusst als typisierte Daten und nicht im Markup: so
 * bleibt die Route unter der 300-Zeilen-Grenze, die Texte sind für die Suche
 * indizierbar und lassen sich an einer Stelle pflegen. Alle Texte sind
 * eigenständig formuliert; die Zahlenwerte stammen aus den in
 * `$lib/data/modulation.ts` genannten Quellen.
 */

import type { TocItem } from '$lib/components/ui/TableOfContents.svelte';

/** Lernziele am Seitenanfang. */
export const MODULATION_GOALS: string[] = [
  'erklären, warum ein Nutzsignal überhaupt auf einen Träger aufgebracht wird',
  'Amplituden-, Frequenz- und Phasenmodulation an Zeitverlauf und Spektrum unterscheiden',
  'den Modulationsgrad, den Frequenzhub und die Carson-Bandbreite berechnen',
  'ein Konstellationsdiagramm lesen und Symbolrate von Bitrate trennen',
  'einschätzen, warum höherwertige Verfahren mehr Störabstand brauchen',
  'OFDM und die Spreizverfahren in das Gesamtbild einordnen'
];

/** Gliederung für das Inhaltsverzeichnis. */
export const MODULATION_TOC: TocItem[] = [
  { id: 'warum-modulieren', label: 'Warum überhaupt modulieren?', level: 2 },
  { id: 'traeger-und-basisband', label: 'Träger, Basisband, Seitenbänder', level: 2 },
  { id: 'analoge-verfahren', label: 'Analoge Verfahren', level: 2 },
  { id: 'amplitudenmodulation', label: 'Amplitudenmodulation, DSB und SSB', level: 3 },
  { id: 'frequenz-und-phasenmodulation', label: 'Frequenz- und Phasenmodulation', level: 3 },
  { id: 'digitale-verfahren', label: 'Digitale Verfahren', level: 2 },
  { id: 'konstellation', label: 'Das Konstellationsdiagramm', level: 3 },
  { id: 'symbolrate-und-bitrate', label: 'Symbolrate, Bitrate, spektrale Effizienz', level: 3 },
  { id: 'mehrtraeger-und-spreizung', label: 'Mehrträger- und Spreizverfahren', level: 2 },
  { id: 'vergleich', label: 'Verfahren im Vergleich', level: 2 }
];

/** Fließtext je Abschnitt. */
export const MODULATION_TEXT: Record<string, string[]> = {
  warum: [
    'Ein Mikrofon liefert Frequenzen von etwa 300 Hz bis 15 kHz, ein Datenstrom aus einem ' +
      'Rechner sogar Anteile bis herab zu 0 Hz. Solche Basisbandsignale lassen sich nicht ' +
      'sinnvoll abstrahlen: Eine Antenne arbeitet erst dann brauchbar, wenn ihre Abmessungen ' +
      'in der Größenordnung der Wellenlänge liegen. Für 3 kHz wären das 100 Kilometer — ' +
      'unbezahlbar und unbaubar.',
    'Modulation verschiebt das Nutzsignal deshalb in einen hohen Frequenzbereich, in dem ' +
      'Antennen handlich, Bauteile klein und Bandbreiten reichlich vorhanden sind. Gleichzeitig ' +
      'löst sie drei weitere Aufgaben: Sie erlaubt es, viele Teilnehmer auf getrennten ' +
      'Frequenzen nebeneinander zu betreiben (Frequenzmultiplex), sie passt das Signal an die ' +
      'Eigenschaften des Übertragungswegs an, und sie erlaubt den Tausch von Bandbreite gegen ' +
      'Störfestigkeit — wer mehr Bandbreite ausgibt, kommt mit weniger Sendeleistung aus.',
    'Der letzte Punkt ist der eigentliche Schlüssel. Fast jede Entscheidung in der ' +
      'Nachrichtentechnik ist ein Handel zwischen Bandbreite, Leistung und Komplexität. Die ' +
      'Modulationsart bestimmt, welchen Kurs man dabei fährt.'
  ],
  traeger: [
    'Der Träger ist eine reine Sinusschwingung. Er hat genau drei Eigenschaften, an denen sich ' +
      'etwas verändern lässt: Amplitude, Frequenz und Phase. Damit sind auch schon alle ' +
      'Grundverfahren benannt — jede reale Modulation ist eine dieser drei oder eine ' +
      'Kombination daraus.',
    'Sobald eine dieser Größen im Takt der Nachricht verändert wird, ist der Träger nicht mehr ' +
      'monofrequent. Um ihn herum entstehen Seitenbänder, die die eigentliche Information ' +
      'tragen. Ihre Lage und Breite bestimmen, wie viel Platz das Signal im Spektrum belegt — ' +
      'und damit, wie viele Teilnehmer in ein Band passen.',
    'Ein unmodulierter Träger überträgt keine Information. Er ist im Spektrum eine einzelne ' +
      'Linie und verbraucht trotzdem Leistung. Bei der klassischen Amplitudenmodulation steckt ' +
      'deshalb im günstigsten Fall nur ein Drittel der Sendeleistung im Nutzsignal.'
  ],
  analog: [
    'Analoge Verfahren bilden den Momentanwert des Nutzsignals unmittelbar auf eine ' +
      'Trägereigenschaft ab. Sie sind einfach, alt und keineswegs überholt: Flugfunk und ' +
      'Seenotfunk arbeiten aus guten Gründen bis heute mit Amplitudenmodulation, der ' +
      'Betriebsfunk mit Schmalband-FM.'
  ],
  am: [
    'Bei der Amplitudenmodulation folgt die Hüllkurve des Trägers dem Nutzsignal. Der ' +
      'Modulationsgrad m gibt an, wie stark: Bei m = 1 schwankt die Amplitude zwischen null und ' +
      'dem doppelten Ruhewert. Wird m größer als 1, klappt die Hüllkurve durch die Nulllinie ' +
      'hindurch, ein Hüllkurvendemodulator liefert dann Verzerrungen, und im Spektrum ' +
      'entstehen zusätzliche Linien weit außerhalb des zugewiesenen Kanals. Diese ' +
      'Übermodulation ist der klassische Bedienfehler.',
    'Im Spektrum erscheinen der Träger und zwei spiegelbildliche Seitenbänder. Beide enthalten ' +
      'dieselbe Information — hier lässt sich sparen. Verzichtet man auf den Träger, entsteht ' +
      'die Zweiseitenbandmodulation ohne Träger (DSB-SC); verzichtet man zusätzlich auf ein ' +
      'Seitenband, die Einseitenbandmodulation (SSB). SSB halbiert die Bandbreite und steckt ' +
      'die gesamte Leistung ins Nutzsignal. Der Preis ist ein aufwendigerer Empfänger: Weil der ' +
      'Träger im Empfänger neu erzeugt wird, macht sich jede Frequenzabweichung sofort als ' +
      'Tonhöhenverschiebung bemerkbar — der bekannte „Donald-Duck-Effekt" beim Abstimmen.'
  ],
  fm: [
    'Bei der Frequenzmodulation bleibt die Amplitude konstant, die Augenblicksfrequenz folgt ' +
      'dem Nutzsignal. Das hat zwei Folgen von großer praktischer Bedeutung. Erstens lassen ' +
      'sich Amplitudenstörungen — Zündfunken, Blitze, Übersprechen — im Empfänger schlicht ' +
      'abschneiden, weshalb FM deutlich rauschärmer klingt als AM. Zweitens dürfen die ' +
      'Endstufen im Sättigungsbereich arbeiten, was den Wirkungsgrad erheblich verbessert.',
    'Der Frequenzhub Δf gibt an, wie weit die Augenblicksfrequenz maximal von der Ruhelage ' +
      'abweicht. Zusammen mit der höchsten Modulationsfrequenz ergibt er den Modulationsindex ' +
      'β = Δf / f_max. Anders als bei AM ist das Spektrum eines frequenzmodulierten Signals ' +
      'streng genommen unendlich breit: Die Amplituden der Seitenbandpaare folgen ' +
      'Besselfunktionen und klingen erst allmählich ab. Die Carson-Regel liefert die praktisch ' +
      'brauchbare Abschätzung — sie erfasst rund 98 Prozent der Leistung.',
    'Die Phasenmodulation ist die nahe Verwandte: Hier folgt die Phasenlage dem Nutzsignal. Ein ' +
      'PM-Sender mit vorgeschaltetem Integrator verhält sich wie ein FM-Sender und umgekehrt; ' +
      'in der Praxis ist PM vor allem ein bequemer Erzeugungsweg für FM.'
  ],
  digital: [
    'Digitale Verfahren übertragen keine kontinuierlichen Werte mehr, sondern eine endliche ' +
      'Zahl unterscheidbarer Zustände — Symbole. Der Empfänger muss nur noch entscheiden, ' +
      'welches Symbol gesendet wurde. Solange er sich dabei nicht irrt, ist das Signal exakt ' +
      'wiederhergestellt; kleine Störungen verschwinden vollständig. Genau das macht ' +
      'Digitalübertragung so mächtig.',
    'Die drei Grundformen entsprechen den drei Trägereigenschaften: Bei der Amplitudenumtastung ' +
      '(ASK) wird der Träger ein- und ausgeschaltet, bei der Frequenzumtastung (FSK) zwischen ' +
      'zwei Frequenzen umgeschaltet, bei der Phasenumtastung (PSK) die Phase gesprungen. ASK ' +
      'ist am einfachsten und am störanfälligsten, FSK hat eine konstante Hüllkurve und ist ' +
      'deshalb im Sender sparsam, PSK nutzt den Signalraum am besten aus.',
    'Werden Amplitude und Phase gleichzeitig ausgewertet, entsteht die ' +
      'Quadraturamplitudenmodulation (QAM). 16-QAM überträgt vier Bit je Symbol, 64-QAM sechs, ' +
      '256-QAM acht. Jede weitere Stufe verlangt einen saubereren Kanal, einen linearen ' +
      'Sendeverstärker und einen stabileren Oszillator.'
  ],
  konstellation: [
    'Ein Konstellationsdiagramm trägt die Symbole in der komplexen Ebene auf: waagerecht die ' +
      'Inphase-Komponente I, senkrecht die um 90 Grad versetzte Quadratur-Komponente Q. Jeder ' +
      'Punkt ist ein Symbol, sein Abstand vom Ursprung die Amplitude, sein Winkel die Phase.',
    'Rauschen verwandelt jeden Punkt in eine Wolke. Solange die Wolken getrennt bleiben, ' +
      'entscheidet der Empfänger richtig; überlappen sie, entstehen Symbolfehler. Der Abstand ' +
      'benachbarter Punkte ist deshalb das entscheidende Maß — und er wird kleiner, je mehr ' +
      'Punkte man in dieselbe Fläche packt.',
    'Die Bitmuster werden nach dem Gray-Code vergeben: Benachbarte Punkte unterscheiden sich in ' +
      'genau einem Bit. Verwechselt der Empfänger zwei Nachbarn — der weitaus häufigste Fall — ' +
      'ist auch nur ein einziges Bit falsch statt mehrerer. Das senkt die Bitfehlerrate ohne ' +
      'jeden Zusatzaufwand.'
  ],
  raten: [
    'Die Symbolrate R_s zählt die Symbole je Sekunde und wird in Baud angegeben. Die Bitrate ' +
      'R_b zählt die Bits. Beide sind nur bei zweiwertigen Verfahren gleich; sonst gilt ' +
      'R_b = R_s · log₂(M). Ein 64-QAM-Signal mit einer Million Symbolen je Sekunde trägt sechs ' +
      'Megabit je Sekunde — bei unveränderter Bandbreite, denn die Bandbreite hängt an der ' +
      'Symbolrate, nicht an der Bitrate.',
    'Das Verhältnis von Bitrate zu belegter Bandbreite ist die spektrale Effizienz in Bit/s/Hz. ' +
      'Sie lässt sich nicht beliebig steigern: Die Shannon-Grenze verknüpft sie mit dem ' +
      'Störabstand. Grob gilt, dass jedes zusätzliche Bit je Symbol rund 6 dB mehr Störabstand ' +
      'verlangt. Genau deshalb schaltet ein Mobilfunkgerät am Zellenrand auf QPSK herunter, ' +
      'während es in Zellmitte 256-QAM fährt.'
  ],
  mehrtraeger: [
    'Ein einzelner breitbandiger Träger hat ein Problem: Echos aus Mehrwegeausbreitung ' +
      'verschmieren die kurzen Symbole ineinander. OFDM löst das, indem es den Datenstrom auf ' +
      'hunderte bis tausende schmale Unterträger verteilt. Jedes Symbol wird dadurch sehr lang, ' +
      'und ein vorangestelltes Schutzintervall fängt die restliche Verzögerung auf. Die ' +
      'Unterträger stehen orthogonal zueinander: Im Maximum jedes Unterträgers haben alle ' +
      'anderen eine Nullstelle, sodass sie sich trotz Überlappung nicht stören.',
    'Erkauft wird das mit einem hohen Verhältnis von Spitzen- zu Mittelwertleistung. Addieren ' +
      'sich viele Unterträger zufällig in Phase, entstehen kurze, hohe Spitzen, die eine ' +
      'lineare und damit ineffiziente Endstufe erzwingen. OFDM ist die Grundlage von DAB+, ' +
      'DVB-T2, WLAN, LTE und 5G NR.',
    'Die Spreizverfahren gehen den umgekehrten Weg: Sie verteilen ein schmalbandiges Signal ' +
      'absichtlich über eine große Bandbreite. Beim Direktsequenzverfahren (DSSS) geschieht das ' +
      'durch Multiplikation mit einer schnellen Codefolge; der Empfänger gewinnt beim ' +
      'Zurückrechnen den Prozessgewinn. Beim Frequenzsprungverfahren (FHSS) wechseln Sender und ' +
      'Empfänger nach einem gemeinsamen Muster laufend die Frequenz, sodass ein schmalbandiger ' +
      'Störer immer nur einen Bruchteil trifft. LoRa nutzt Chirps — lineare Frequenzdurchläufe ' +
      'über den ganzen Kanal —, deren Startpunkt die Information trägt; damit ist Empfang ' +
      'deutlich unterhalb des Rauschpegels möglich.'
  ],
  vergleich: [
    'Die Tabelle stellt die Verfahren aus der Projektdatenbank gegenüber. Die spektrale ' +
      'Effizienz ist ein Richtwert realer Systeme einschließlich Kanalcodierung und ' +
      'Schutzintervallen, nicht der theoretische Grenzwert.'
  ]
};

/** Formelzeichen einer Formel. */
export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

/** Vollständige Angaben für einen `FormulaBlock`. */
export interface FormulaEntry {
  formula: string;
  alt: string;
  label: string;
  number: string;
  variables: FormulaVariable[];
}

export const MODULATION_FORMULAS: Record<string, FormulaEntry> = {
  am: {
    formula: 's(t) = A · [1 + m · n(t)] · sin(2π · f_c · t)',
    alt: 'Sendesignal gleich Amplitude mal Klammer auf eins plus Modulationsgrad mal Nachricht Klammer zu mal Sinus von zwei Pi mal Trägerfrequenz mal Zeit',
    label: 'Amplitudenmodulation im Zeitbereich',
    number: '(1)',
    variables: [
      { symbol: 'A', meaning: 'Amplitude des unmodulierten Trägers', unit: 'V' },
      { symbol: 'm', meaning: 'Modulationsgrad, 0 bis 1 ohne Übermodulation' },
      { symbol: 'n(t)', meaning: 'Nachrichtensignal, auf ±1 normiert' },
      { symbol: 'f_c', meaning: 'Trägerfrequenz', unit: 'Hz' }
    ]
  },
  amBandwidth: {
    formula: 'B = 2 · f_max',
    alt: 'Bandbreite gleich zwei mal höchste Modulationsfrequenz',
    label: 'Bandbreite von AM und DSB; bei SSB entfällt der Faktor 2',
    number: '(2)',
    variables: [
      { symbol: 'B', meaning: 'belegte Bandbreite', unit: 'Hz' },
      { symbol: 'f_max', meaning: 'höchste im Nutzsignal enthaltene Frequenz', unit: 'Hz' }
    ]
  },
  carson: {
    formula: 'B = 2 · (Δf + f_max)   mit   β = Δf / f_max',
    alt: 'Bandbreite gleich zwei mal Klammer auf Frequenzhub plus höchste Modulationsfrequenz Klammer zu, Modulationsindex gleich Frequenzhub durch höchste Modulationsfrequenz',
    label: 'Carson-Regel für FM und PM',
    number: '(3)',
    variables: [
      { symbol: 'B', meaning: 'belegte Bandbreite, rund 98 % der Leistung', unit: 'Hz' },
      { symbol: 'Δf', meaning: 'Frequenzhub', unit: 'Hz' },
      { symbol: 'f_max', meaning: 'höchste Modulationsfrequenz', unit: 'Hz' },
      { symbol: 'β', meaning: 'Modulationsindex; β ≤ 1 heißt Schmalband-FM' }
    ]
  },
  bitrate: {
    formula: 'R_b = R_s · log₂(M)   und   η = R_b / B',
    alt: 'Bitrate gleich Symbolrate mal Logarithmus zur Basis zwei von M, spektrale Effizienz gleich Bitrate durch Bandbreite',
    label: 'Symbolrate, Bitrate und spektrale Effizienz',
    number: '(4)',
    variables: [
      { symbol: 'R_b', meaning: 'Bitrate', unit: 'Bit/s' },
      { symbol: 'R_s', meaning: 'Symbolrate', unit: 'Baud' },
      { symbol: 'M', meaning: 'Zahl der Symbolzustände' },
      { symbol: 'η', meaning: 'spektrale Effizienz', unit: 'Bit/s/Hz' }
    ]
  },
  spreading: {
    formula: 'G_p = 10 · log₁₀(R_c / R_b)',
    alt: 'Prozessgewinn gleich zehn mal Logarithmus zur Basis zehn von Chiprate durch Datenrate',
    label: 'Prozessgewinn eines Direktsequenz-Spreizverfahrens',
    number: '(5)',
    variables: [
      { symbol: 'G_p', meaning: 'Prozessgewinn', unit: 'dB' },
      { symbol: 'R_c', meaning: 'Chiprate der Spreizfolge', unit: 'Chip/s' },
      { symbol: 'R_b', meaning: 'Nutzdatenrate', unit: 'Bit/s' }
    ]
  }
};

/** Beschriftungen der Verfahrensklassen für die Vergleichstabelle. */
export const MODULATION_CLASS_LABELS: Record<string, string> = {
  analog: 'analog',
  'digital-einzeltraeger': 'digital, Einzelträger',
  'digital-mehrtraeger': 'digital, Mehrträger',
  spreizband: 'Spreizband'
};
