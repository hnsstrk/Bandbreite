/**
 * Glossar der Funk- und Fernmeldetechnik.
 *
 * Jeder Eintrag ist ein Datensatz, kein Markup: `id` ist der Anker der
 * Glossarseite (ohne Umlaute, wie `slugify` ihn erzeugt), `short` die
 * Kurzdefinition für Trefferlisten und Tooltips, `long` die Vertiefung.
 *
 * Wo `explanations.ts` denselben Begriff bereits beschreibt, wird dessen
 * Kurztext übernommen statt neu formuliert — beide Quellen bleiben so in
 * Deckung. `GLOSSARY_COVERED_TITLES` nennt die dort abgedeckten Titel, damit
 * der Suchindex sie nicht doppelt führt.
 *
 * Quellen der Fachbegriffe sind im Feld `source` genannt; sie stehen
 * gesammelt unter `/service/quellen/`.
 */

import { normalizeForSearch } from '$lib/utils/slug';
import {
  BAND_IEEE,
  BAND_ITU,
  BAND_NATO,
  EIRP as EIRP_EXPLANATION,
  EM_SPECTRUM,
  FADING_MARGIN,
  FREQUENCY,
  FSPL as FSPL_EXPLANATION,
  RAIN_ATTENUATION,
  RX_SENSITIVITY,
  WAVELENGTH
} from './explanations';

/** Themenschublade eines Begriffs. */
export type GlossaryCategory =
  | 'grundlagen'
  | 'pegel'
  | 'antennen'
  | 'ausbreitung'
  | 'modulation'
  | 'radar'
  | 'dienste';

export interface GlossaryEntry {
  /** Anker-ID ohne Umlaute, eindeutig im gesamten Glossar. */
  id: string;
  /** Begriff, wie er angezeigt wird. */
  term: string;
  /** Kurzdefinition in ein bis zwei Sätzen. */
  short: string;
  /** Vertiefung: Herkunft, Größenordnungen, typische Missverständnisse. */
  long?: string;
  /** Einheit der Größe, sofern es eine gibt. */
  unit?: string;
  /** Kernformel als Unicode-Klartext. */
  formula?: string;
  /** Weiterführende Ziele: interne Routen mit Schrägstrich oder `#anker`. */
  related: string[];
  category: GlossaryCategory;
  /** Norm oder Werk, auf das sich die Definition stützt. */
  source?: string;
  /** Zusätzliche Schreibweisen und Abkürzungen für die Suche. */
  synonyms?: string[];
}

/** Anzeigenamen und Reihenfolge der Kategorien. */
export const GLOSSARY_CATEGORIES: { id: GlossaryCategory; label: string }[] = [
  { id: 'grundlagen', label: 'Grundgrößen' },
  { id: 'pegel', label: 'Pegel und Rauschen' },
  { id: 'antennen', label: 'Antennen' },
  { id: 'ausbreitung', label: 'Ausbreitung' },
  { id: 'modulation', label: 'Modulation und Übertragung' },
  { id: 'radar', label: 'Radar' },
  { id: 'dienste', label: 'Funkdienste und Regulierung' }
];

export const GLOSSARY: GlossaryEntry[] = [
  // ==========================================================================
  // Grundgrößen
  // ==========================================================================
  {
    id: 'frequenz',
    term: 'Frequenz',
    short: 'Zahl der Schwingungen pro Sekunde. Sie bestimmt Wellenlänge, Bauform der Antenne und das Ausbreitungsverhalten.',
    long: 'Gemessen in Hertz: 1 Hz ist eine Schwingung je Sekunde. Der Funkbereich reicht von einigen Hertz (ELF) bis in den Terahertzbereich. Frequenz und Wellenlänge sind über die Lichtgeschwindigkeit fest verkoppelt — wer eine Größe nennt, nennt implizit auch die andere.',
    unit: 'Hz',
    formula: 'f = c / λ',
    related: ['/konverter/frequenz/', '#wellenlaenge', '/spektrum/'],
    category: 'grundlagen',
    source: 'SI-Basisdefinition, ITU-R V.431'
  },
  {
    id: 'wellenlaenge',
    term: 'Wellenlänge',
    short: WAVELENGTH.short,
    long: 'Die Wellenlänge ist der räumliche Abstand zweier gleicher Phasenlagen. Antennen werden in Bruchteilen davon gebaut — λ/2 für den Dipol, λ/4 für den Monopol —, deshalb schrumpfen Antennen mit steigender Frequenz. Im Vakuum gilt λ = c/f mit c = 299 792 458 m/s.',
    unit: 'm',
    formula: 'λ = c / f',
    related: ['/konverter/frequenz/', '#frequenz', '/wissen/antennen/'],
    category: 'grundlagen',
    source: 'CODATA 2018 (c exakt)'
  },
  {
    id: 'bandbreite',
    term: 'Bandbreite',
    short: 'Breite des belegten Frequenzbereichs. Sie begrenzt die übertragbare Datenrate und bestimmt, wie viel Rauschen der Empfänger aufnimmt.',
    long: 'Bandbreite wird je nach Zusammenhang unterschiedlich gemessen: als −3-dB-Breite eines Filters, als belegte Bandbreite eines Sendesignals (99 % der Leistung) oder als Kanalraster einer Zuweisung. Mehr Bandbreite bedeutet mehr mögliche Datenrate, aber auch einen höheren Rauschflur.',
    unit: 'Hz',
    formula: 'C = B · log₂(1 + SNR)',
    related: ['/rechner/kanalkapazitaet/', '#kanalkapazitaet', '#rauschflur'],
    category: 'grundlagen',
    source: 'ITU-R SM.328 (belegte Bandbreite)'
  },
  {
    id: 'polarisation',
    term: 'Polarisation',
    short: 'Richtung, in der das elektrische Feld einer Welle schwingt — linear (horizontal oder vertikal), zirkular oder elliptisch.',
    long: 'Sender und Empfänger müssen zueinander passen: zwischen gekreuzten linearen Antennen gehen theoretisch alle, praktisch etwa 20 bis 30 dB verloren. Zirkulare Polarisation ist unempfindlich gegen Verdrehung und deshalb bei Satelliten üblich; die Bodenwelle verlangt vertikale Polarisation, weil der leitende Boden horizontale Felder kurzschließt.',
    related: ['/wissen/antennen/', '#bodenwelle', '#mimo'],
    category: 'grundlagen',
    source: 'IEEE Std 145'
  },
  {
    id: 'impedanz',
    term: 'Impedanz',
    short: 'Komplexer Widerstand, den eine Leitung oder Antenne dem Hochfrequenzstrom entgegensetzt. In der Funktechnik meist 50 Ω, in der Antennentechnik des Rundfunks 75 Ω.',
    long: 'Nur wenn Quelle, Leitung und Last dieselbe Impedanz haben, fließt die Leistung vollständig weiter. Abweichungen erzeugen eine rücklaufende Welle; ihr Maß sind Reflexionsfaktor, Rückflussdämpfung und Stehwellenverhältnis.',
    unit: 'Ω',
    formula: 'Γ = (Z_L − Z₀) / (Z_L + Z₀)',
    related: ['#swr', '#rueckflussdaempfung', '/wissen/antennen/'],
    category: 'grundlagen',
    source: 'IEEE Std 1785'
  },
  {
    id: 'swr',
    term: 'SWR (Stehwellenverhältnis)',
    short: 'Verhältnis von Spannungsmaximum zu Spannungsminimum auf einer fehlangepassten Leitung. 1,0 bedeutet perfekte Anpassung.',
    long: 'Ein SWR von 2,0 bedeutet, dass rund 11 % der Leistung zurücklaufen — das sind nur 0,5 dB Verlust, weshalb die Zahl oft überbewertet wird. Kritisch wird ein hohes SWR vor allem für die Endstufe und wegen der Verluste auf langen Leitungen. Die englische Abkürzung VSWR meint dieselbe Größe.',
    formula: 's = (1 + |Γ|) / (1 − |Γ|)',
    related: ['#impedanz', '#rueckflussdaempfung', '/wissen/antennen/'],
    category: 'grundlagen',
    source: 'IEEE Std 1785',
    synonyms: ['VSWR', 'Stehwellenverhältnis']
  },
  {
    id: 'rueckflussdaempfung',
    term: 'Rückflussdämpfung (Return Loss)',
    short: 'Abstand zwischen hinlaufender und reflektierter Welle in dB. Je größer der Wert, desto besser die Anpassung.',
    formula: 'RL = −20 · log₁₀ |Γ|',
    unit: 'dB',
    related: ['#swr', '#impedanz', '/rechner/dezibel/'],
    category: 'grundlagen',
    source: 'IEEE Std 1785'
  },
  {
    id: 'skin-effekt',
    term: 'Skin-Effekt',
    short: 'Hochfrequente Ströme fließen nur in einer dünnen Randschicht des Leiters; die Skin-Tiefe δ gibt an, wo die Amplitude auf 1/e gefallen ist.',
    long: 'Weil die Skin-Tiefe mit der Wurzel der Frequenz abnimmt, steigt der Leitungswiderstand mit der Frequenz. Derselbe Effekt begrenzt, wie tief eine Welle in Seewasser oder Erdreich eindringt — die Grundlage der U-Boot-Kommunikation im VLF- und ELF-Bereich.',
    unit: 'm',
    formula: 'δ = √(2 / (ω · μ · σ))',
    related: ['/rechner/skin-tiefe/', '#daempfung'],
    category: 'grundlagen',
    source: 'Pozar, Microwave Engineering, §1.4'
  },
  {
    id: 'em-spektrum',
    term: 'Elektromagnetisches Spektrum',
    short: 'Gesamtheit aller elektromagnetischen Wellen, geordnet nach Frequenz — von den ELF-Wellen über Funk, Licht und Röntgen bis zur Gammastrahlung.',
    related: ['/spektrum/', '/datenbanken/frequenzbaender/', '#itu-band'],
    category: 'grundlagen'
  },

  // ==========================================================================
  // Pegel und Rauschen
  // ==========================================================================
  {
    id: 'dezibel',
    term: 'Dezibel (dB)',
    short: 'Logarithmisches Maß für ein Verhältnis. Leistungen werden mit 10·log₁₀ gezählt, Spannungen und Feldstärken mit 20·log₁₀.',
    long: 'Das Dezibel macht aus Multiplikation Addition: Gewinne und Verluste einer Kette werden schlicht summiert. Merkregeln: +3 dB verdoppeln die Leistung, +6 dB verdoppeln die Spannung, +10 dB verzehnfachen die Leistung. Ein reines dB ist einheitenlos — ein Absolutpegel braucht immer einen Bezug im Namen.',
    unit: 'dB',
    formula: 'L = 10 · log₁₀(P₂ / P₁)',
    related: ['/rechner/dezibel/', '/wissen/mathematik/', '#dbm'],
    category: 'pegel',
    source: 'ITU-R V.574-5, IEC 60027-3'
  },
  {
    id: 'dbm',
    term: 'dBm',
    short: 'Leistungspegel bezogen auf 1 Milliwatt. 0 dBm sind 1 mW, 30 dBm sind 1 W.',
    long: 'dBm ist der Standardpegel der Funktechnik, weil sich Sendeleistung, Gewinne und Dämpfungen darin einfach addieren lassen. Typische Werte: Bluetooth LE 0 dBm, WLAN 20 dBm, Mobiltelefon 23 dBm, UKW-Großsender 80 dBm.',
    unit: 'dBm',
    formula: 'P[dBm] = 10 · log₁₀(P / 1 mW)',
    related: ['/rechner/dezibel/', '#dbw', '#dbuv'],
    category: 'pegel',
    source: 'IEEE Std 100'
  },
  {
    id: 'dbw',
    term: 'dBW',
    short: 'Leistungspegel bezogen auf 1 Watt; er liegt stets 30 dB unter dem Wert in dBm.',
    unit: 'dBW',
    formula: 'P[dBW] = P[dBm] − 30',
    related: ['#dbm', '/rechner/dezibel/'],
    category: 'pegel',
    source: 'IEEE Std 100'
  },
  {
    id: 'dbuv',
    term: 'dBµV',
    short: 'Spannungspegel bezogen auf 1 Mikrovolt. Üblich in der Messtechnik, im Rundfunkempfang und bei EMV-Grenzwerten.',
    long: 'Die Umrechnung in dBm hängt an der Bezugsimpedanz: an 50 Ω entsprechen 0 dBm rund 107 dBµV, an 75 Ω rund 108,75 dBµV. Ohne Angabe der Impedanz ist ein dBµV-Wert nicht in eine Leistung umzurechnen.',
    unit: 'dBµV',
    formula: 'U[dBµV] = P[dBm] + 10 · log₁₀(Z / Ω) + 90',
    related: ['/rechner/dezibel/', '#dbm', '#impedanz'],
    category: 'pegel',
    source: 'CISPR 16-1-1, IEEE Std 100'
  },
  {
    id: 'dbi',
    term: 'dBi',
    short: 'Antennengewinn gegenüber dem isotropen Kugelstrahler — der übliche Bezug in Datenblättern und Regulierung.',
    unit: 'dBi',
    related: ['/rechner/antennengewinn/', '#dbd', '#isotroper-strahler'],
    category: 'pegel',
    source: 'IEEE Std 145'
  },
  {
    id: 'dbd',
    term: 'dBd',
    short: 'Antennengewinn gegenüber dem Halbwellendipol. Er liegt immer 2,15 dB unter derselben Angabe in dBi.',
    long: 'Wer Datenblätter vergleicht, muss den Bezug prüfen: 9 dBd sind 11,15 dBi. Im Amateurfunk und im Rundfunk ist dBd verbreitet, in der Satelliten- und Radartechnik dBi.',
    unit: 'dBd',
    formula: 'G[dBi] = G[dBd] + 2,15',
    related: ['/rechner/antennengewinn/', '#dbi', '#dipol'],
    category: 'pegel',
    source: 'IEEE Std 145'
  },
  {
    id: 'eirp',
    term: 'EIRP',
    short: EIRP_EXPLANATION.short,
    long: 'EIRP (Equivalent Isotropically Radiated Power) ist die Leistung, die ein Kugelstrahler abgeben müsste, um in Hauptstrahlrichtung dieselbe Feldstärke zu erzeugen. Regulierungsgrenzen sind meist als EIRP formuliert — im 2,4-GHz-ISM-Band etwa 20 dBm.',
    unit: 'dBm',
    formula: 'EIRP = P_TX + G_TX − L_Kabel',
    related: ['/rechner/link-budget/', '#erp', '#dbi'],
    category: 'pegel',
    source: 'ITU-R V.573, ETSI EN 300 328'
  },
  {
    id: 'erp',
    term: 'ERP',
    short: 'Abgestrahlte Leistung bezogen auf den Halbwellendipol statt auf den Kugelstrahler; sie liegt 2,15 dB unter der EIRP.',
    long: 'Im Rundfunk und bei Betriebsfunkgeräten wird ERP angegeben (PMR446 etwa 500 mW ERP), in ISM- und Satellitenzulassungen dagegen EIRP. Der Unterschied ist genau der Dipolgewinn.',
    formula: 'EIRP = ERP + 2,15 dB',
    related: ['#eirp', '/wissen/funktechnik/rundfunk/', '#pmr446'],
    category: 'pegel',
    source: 'ITU-R V.573'
  },
  {
    id: 'fspl',
    term: 'Freiraumdämpfung (FSPL)',
    short: FSPL_EXPLANATION.short,
    long: 'Die Freiraumdämpfung ist kein Verlust im physikalischen Sinn, sondern die Verdünnung der Leistung auf einer wachsenden Kugelfläche. Sie steigt mit dem Quadrat von Entfernung und Frequenz: doppelte Distanz oder doppelte Frequenz kosten je 6 dB.',
    unit: 'dB',
    formula: 'FSPL = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)',
    related: ['/rechner/fspl/', '/rechner/link-budget/', '#link-budget'],
    category: 'pegel',
    source: 'ITU-R P.525-4'
  },
  {
    id: 'daempfung',
    term: 'Dämpfung',
    short: 'Verringerung der Signalleistung entlang eines Weges — durch Ausbreitung, Kabel, Bauteile, Regen oder atmosphärische Gase.',
    long: 'Dämpfungen werden in dB angegeben und addiert. Die Freiraumdämpfung ist meist der größte Posten; hinzu kommen Kabeldämpfung (in dB je 100 m und frequenzabhängig), Gasdämpfung nach ITU-R P.676, Regendämpfung nach P.838 und Zusatzverluste durch Hindernisse.',
    unit: 'dB',
    related: ['#fspl', '#regendaempfung', '/rechner/link-budget/'],
    category: 'pegel'
  },
  {
    id: 'link-budget',
    term: 'Link-Budget',
    short: 'Bilanz aller Gewinne und Verluste einer Funkstrecke vom Sender bis zum Empfänger. Am Ende steht der Empfangspegel gegen die Empfindlichkeit.',
    long: 'Das Link-Budget addiert Sendeleistung, Antennengewinne und Verluste in dB und vergleicht den Empfangspegel mit der Empfindlichkeit. Die Differenz ist die Systemreserve; von ihr muss die Schwundreserve abgedeckt werden.',
    unit: 'dB',
    formula: 'P_RX = P_TX + G_TX + G_RX − L_ges',
    related: ['/rechner/link-budget/', '#schwundreserve', '#empfindlichkeit'],
    category: 'pegel',
    source: 'ITU-R P.530-18'
  },
  {
    id: 'empfindlichkeit',
    term: 'Empfängerempfindlichkeit',
    short: RX_SENSITIVITY.short,
    long: 'Die Empfindlichkeit folgt aus Rauschflur, Rauschzahl und dem für die Modulation nötigen SNR. Schmalbandige und robuste Verfahren sind empfindlicher: LoRa erreicht mit SF12 bis −137 dBm, WLAN je nach Datenrate −75 bis −90 dBm.',
    unit: 'dBm',
    related: ['#rauschflur', '#rauschzahl', '/rechner/link-budget/'],
    category: 'pegel'
  },
  {
    id: 'rauschflur',
    term: 'Rauschflur',
    short: 'Thermische Rauschleistung im betrachteten Kanal. Bei 290 K sind es −174 dBm je Hertz Bandbreite.',
    long: 'Aus N = k·T·B folgt: je Verzehnfachung der Bandbreite steigt der Rauschflur um 10 dB. In 1 MHz Bandbreite liegt er bei −114 dBm, in 20 MHz bei −101 dBm. Der Rauschflur ist die physikalische Untergrenze jedes Empfangs.',
    unit: 'dBm',
    formula: 'N = k · T · B',
    related: ['#rauschzahl', '#snr', '/rechner/kanalkapazitaet/'],
    category: 'pegel',
    source: 'IEEE Std 100, k nach CODATA 2018'
  },
  {
    id: 'rauschzahl',
    term: 'Rauschzahl (Noise Figure)',
    short: 'Wie viel schlechter das Signal-Rausch-Verhältnis hinter einer Stufe ist als davor. Ein rauschfreier Verstärker hätte 0 dB.',
    long: 'Nach der Friis-Formel dominiert die erste Stufe: ein rauscharmer Vorverstärker direkt an der Antenne bestimmt die Rauschzahl der ganzen Kette. Typische Werte sind 0,5 bis 2 dB für LNAs, 4 bis 8 dB für einfache Empfänger.',
    unit: 'dB',
    formula: 'F = SNR_ein / SNR_aus',
    related: ['#rauschtemperatur', '#snr', '#empfindlichkeit'],
    category: 'pegel',
    source: 'IEEE Std 100 (Friis, 1944)'
  },
  {
    id: 'rauschtemperatur',
    term: 'Rauschtemperatur',
    short: 'Rauschen ausgedrückt als äquivalente Temperatur in Kelvin. In der Satelliten- und Radioastronomie üblicher als die Rauschzahl.',
    unit: 'K',
    formula: 'T = T₀ · (10^(F/10) − 1), T₀ = 290 K',
    related: ['#rauschzahl', '#rauschflur', '/wissen/mathematik/'],
    category: 'pegel',
    source: 'IEEE Std 100'
  },
  {
    id: 'snr',
    term: 'SNR (Signal-Rausch-Verhältnis)',
    short: 'Abstand des Nutzsignals vom Rauschen. Er entscheidet, welche Modulation und welche Datenrate möglich sind.',
    long: 'Shannon verknüpft SNR und Bandbreite mit der Kanalkapazität. Praktisch braucht BPSK rund 7 dB, 64-QAM rund 22 dB für eine Bitfehlerrate von 10⁻⁵ — jede Verdopplung der Symbolstufen kostet etwa 6 dB.',
    unit: 'dB',
    formula: 'C = B · log₂(1 + SNR)',
    related: ['/rechner/kanalkapazitaet/', '#kanalkapazitaet', '#qam'],
    category: 'pegel',
    source: 'Proakis, Digital Communications'
  },
  {
    id: 'schwundreserve',
    term: 'Schwundreserve (Fading Margin)',
    short: FADING_MARGIN.short,
    long: 'Die Reserve wird auf das Link-Budget aufgeschlagen, damit die Strecke auch bei ungünstigen Bedingungen steht. Übliche Größenordnungen sind 10 bis 15 dB im Gebäude, 15 bis 25 dB mobil im Freien und 3 bis 10 dB bei Satellitenstrecken.',
    unit: 'dB',
    related: ['#schwund', '/rechner/link-budget/', '#link-budget'],
    category: 'pegel',
    source: 'ITU-R P.530-18'
  },

  // ==========================================================================
  // Antennen
  // ==========================================================================
  {
    id: 'isotroper-strahler',
    term: 'Isotroper Strahler',
    short: 'Gedachte Antenne, die in alle Richtungen gleich stark strahlt. Sie ist der Bezugspunkt für Gewinnangaben in dBi.',
    long: 'Ein isotroper Strahler lässt sich physikalisch nicht bauen, ist aber als Rechenbezug unentbehrlich: sein Gewinn ist definitionsgemäß 0 dBi.',
    related: ['#dbi', '#antennengewinn', '/wissen/antennen/'],
    category: 'antennen',
    source: 'IEEE Std 145'
  },
  {
    id: 'antennengewinn',
    term: 'Antennengewinn',
    short: 'Wie stark eine Antenne die Leistung in ihre Vorzugsrichtung bündelt — verglichen mit dem Kugelstrahler (dBi) oder dem Dipol (dBd).',
    long: 'Gewinn entsteht nicht durch Verstärkung, sondern durch Bündelung: was in einer Richtung dazukommt, fehlt in anderen. Deshalb hängen Gewinn und Öffnungswinkel zusammen — als Näherung gilt G ≈ 41253 / (θ_E · θ_H) mit den Winkeln in Grad.',
    unit: 'dBi',
    formula: 'G = η · (π · D / λ)² (Kreisapertur)',
    related: ['/rechner/antennengewinn/', '#halbwertsbreite', '#dbi'],
    category: 'antennen',
    source: 'IEEE Std 145, Balanis, Antenna Theory'
  },
  {
    id: 'dipol',
    term: 'Dipol',
    short: 'Der Halbwellendipol ist die Referenzantenne der Funktechnik: 2,15 dBi Gewinn, rund 73 Ω Fußpunktwiderstand.',
    long: 'Sein Richtdiagramm ist eine liegende Acht quer zum Draht. Halbiert man ihn und stellt ihn über eine Massefläche, entsteht der Viertelwellenstrahler (Monopol) mit rund 36 Ω.',
    related: ['#dbd', '/wissen/antennen/', '#wellenlaenge'],
    category: 'antennen',
    source: 'Balanis, Antenna Theory'
  },
  {
    id: 'yagi',
    term: 'Yagi-Uda-Antenne',
    short: 'Richtantenne aus einem gespeisten Element, einem Reflektor und mehreren Direktoren. Typisch 8 bis 16 dBi.',
    long: 'Nur ein Element wird gespeist, die übrigen wirken passiv über die Verkopplung. Mehr Direktoren bringen mehr Gewinn und eine schmalere Keule, aber weniger Bandbreite. Die klassische Fernsehantenne auf dem Dach ist eine Yagi.',
    related: ['/wissen/antennen/', '#antennengewinn', '#halbwertsbreite'],
    category: 'antennen',
    source: 'Balanis, Antenna Theory'
  },
  {
    id: 'parabolantenne',
    term: 'Parabolantenne',
    short: 'Reflektorantenne, die eine ebene Welle im Brennpunkt bündelt. Ihr Gewinn wächst mit der Fläche und mit dem Quadrat der Frequenz.',
    long: 'Der Flächenwirkungsgrad liegt je nach Bauart bei 0,5 bis 0,7 — Erregerabschattung, Randüberstrahlung und Oberflächenfehler kosten Fläche. Verdoppelter Durchmesser bedeutet +6 dB und die halbe Keulenbreite.',
    formula: 'G = η · (π · D / λ)²',
    related: ['/rechner/antennengewinn/', '#wirkflaeche', '#fernfeld'],
    category: 'antennen',
    source: 'Balanis, Antenna Theory, Kap. 15'
  },
  {
    id: 'wirkflaeche',
    term: 'Wirkfläche',
    short: 'Fläche, aus der eine Empfangsantenne die Leistung der einfallenden Welle aufnimmt. Sie hängt direkt am Gewinn.',
    unit: 'm²',
    formula: 'A_eff = G · λ² / (4π)',
    related: ['/rechner/antennengewinn/', '#antennengewinn', '#fspl'],
    category: 'antennen',
    source: 'IEEE Std 145'
  },
  {
    id: 'halbwertsbreite',
    term: 'Halbwertsbreite',
    short: 'Winkel, innerhalb dessen die abgestrahlte Leistungsdichte auf die Hälfte (−3 dB) des Maximums fällt.',
    long: 'Für eine Kreisapertur gilt näherungsweise θ ≈ 70° · λ/D. Je schmaler die Keule, desto höher der Gewinn — und desto genauer muss ausgerichtet werden.',
    unit: 'Grad',
    formula: 'θ ≈ 70° · λ / D',
    related: ['/rechner/antennengewinn/', '#antennengewinn', '#parabolantenne'],
    category: 'antennen',
    source: 'Balanis, Antenna Theory'
  },
  {
    id: 'fernfeld',
    term: 'Fernfeld',
    short: 'Bereich ab r = 2D²/λ, in dem sich die Wellenfront als eben beschreiben lässt und die Gewinnangabe gilt.',
    long: 'Davor liegen Nahfeld und Übergangszone; dort ist das Richtdiagramm noch nicht ausgebildet. Für eine 3-m-Antenne bei 10 GHz beginnt das Fernfeld erst in 600 m Entfernung — ein praktisches Problem bei der Vermessung großer Antennen.',
    unit: 'm',
    formula: 'r = 2 · D² / λ',
    related: ['/rechner/antennengewinn/', '#parabolantenne'],
    category: 'antennen',
    source: 'IEEE Std 145'
  },
  {
    id: 'gruppenantenne',
    term: 'Gruppenantenne (Phased Array)',
    short: 'Viele Einzelstrahler, deren Phasenlage die Keule elektronisch schwenkt — ohne bewegliche Teile.',
    long: 'N gleichartige Strahler bringen idealisiert 10·log₁₀(N) dB zusätzlichen Gewinn. Moderne Radargeräte und 5G-Basisstationen im Millimeterwellenbereich arbeiten so; der Schwenkbereich ist durch das Gitterlappen-Kriterium (Elementabstand ≤ λ/2) begrenzt.',
    related: ['/wissen/antennen/', '#mimo', '/wissen/radar/'],
    category: 'antennen',
    source: 'Balanis, Antenna Theory'
  },
  {
    id: 'mimo',
    term: 'MIMO',
    short: 'Mehrere Sende- und Empfangsantennen übertragen gleichzeitig getrennte Datenströme über denselben Kanal.',
    long: 'MIMO nutzt die Mehrwegausbreitung als Ressource: in einer streureichen Umgebung wachsen die Datenraten annähernd mit der Zahl der Antennenpaare. LTE und 5G NR verwenden 2×2 bis 8×8, Massive MIMO in der Basisstation deutlich mehr.',
    related: ['/wissen/funktechnik/mobilfunk/', '#mehrwegausbreitung', '#ofdm'],
    category: 'antennen',
    source: '3GPP TS 36.211, TS 38.211'
  },

  // ==========================================================================
  // Ausbreitung
  // ==========================================================================
  {
    id: 'bodenwelle',
    term: 'Bodenwelle',
    short: 'Welle, die der Erdoberfläche folgt. Sie trägt Lang- und Mittelwelle über hunderte Kilometer, verlangt aber vertikale Polarisation.',
    long: 'Die Reichweite hängt an der Leitfähigkeit des Bodens: über Seewasser deutlich weiter als über trockenem Land. Mit steigender Frequenz nimmt die Dämpfung stark zu, oberhalb weniger Megahertz spielt die Bodenwelle kaum noch eine Rolle.',
    related: ['/wissen/wellenausbreitung/', '#raumwelle', '#polarisation'],
    category: 'ausbreitung',
    source: 'ITU-R P.368'
  },
  {
    id: 'raumwelle',
    term: 'Raumwelle',
    short: 'Welle, die an der Ionosphäre reflektiert wird und dadurch weit über den Horizont hinaus reicht. Grundlage des Kurzwellenverkehrs.',
    related: ['/wissen/wellenausbreitung/', '#muf', '#skip-zone'],
    category: 'ausbreitung',
    source: 'ITU-R P.533'
  },
  {
    id: 'sichtverbindung',
    term: 'Sichtverbindung (LOS)',
    short: 'Direkter Weg zwischen zwei Antennen ohne Hindernis. Ab VHF der übliche Ausbreitungsweg, begrenzt durch den Radiohorizont.',
    related: ['#radiohorizont', '#fresnel-zone', '/rechner/fresnel/'],
    category: 'ausbreitung',
    synonyms: ['Line of Sight', 'LOS']
  },
  {
    id: 'radiohorizont',
    term: 'Radiohorizont',
    short: 'Entfernung, bis zu der eine Sichtverbindung über die gekrümmte Erde reicht. Wegen der Refraktion rund 15 % weiter als der optische Horizont.',
    long: 'Mit dem 4/3-Erde-Modell gilt die Faustformel d[km] ≈ 4,12·√(h[m]); rein geometrisch wären es 3,57·√h. Zwei Antennen addieren ihre Horizonte: 10 m und 100 m ergeben zusammen rund 54 km.',
    unit: 'km',
    formula: 'd = √(2 · k · R · h), k = 4/3',
    related: ['/rechner/radiohorizont/', '#refraktion', '#sichtverbindung'],
    category: 'ausbreitung',
    source: 'ITU-R P.834-9'
  },
  {
    id: 'refraktion',
    term: 'Refraktion und k-Faktor',
    short: 'Krümmung des Strahls durch die mit der Höhe abnehmende Luftdichte. Sie wird als vergrößerter Erdradius k·R gerechnet, im Mittel mit k = 4/3.',
    long: 'Bei Subrefraktion (k < 1) rückt der Horizont näher, bei Superrefraktion weiter; im Extremfall führt ein Duct die Welle über hunderte Kilometer. Der k-Faktor ist damit die wichtigste Wetterabhängigkeit von Richtfunkstrecken.',
    related: ['/rechner/radiohorizont/', '#ducting', '/wissen/wellenausbreitung/'],
    category: 'ausbreitung',
    source: 'ITU-R P.834-9, ITU-R P.453'
  },
  {
    id: 'fresnel-zone',
    term: 'Fresnel-Zone',
    short: 'Ellipsoid um die Sichtlinie, in dem sich die Wellen phasenrichtig überlagern. Mindestens 60 % der ersten Zone sollten frei bleiben.',
    long: 'Der Radius wächst mit der Wurzel aus Wellenlänge und Streckenlänge und ist in der Mitte am größten. Ragt ein Hindernis in die Zone, entsteht Zusatzdämpfung durch Beugung, obwohl die Sichtlinie noch frei ist.',
    unit: 'm',
    formula: 'rₙ = √(n · λ · d₁ · d₂ / D)',
    related: ['/rechner/fresnel/', '#beugung', '#sichtverbindung'],
    category: 'ausbreitung',
    source: 'ITU-R P.530-18'
  },
  {
    id: 'beugung',
    term: 'Beugung',
    short: 'Umlenkung der Welle an Kanten und Hindernissen. Sie versorgt Bereiche im Funkschatten, kostet aber Pegel.',
    long: 'An einer scharfen Kante beträgt der Verlust im Grenzfall der gerade gestreiften Sichtlinie etwa 6 dB und wächst mit der Eindringtiefe in den Schatten. Je niedriger die Frequenz, desto wirksamer die Beugung — ein Grund, warum UKW hinter Hügeln noch zu empfangen ist.',
    related: ['#fresnel-zone', '/wissen/wellenausbreitung/', '/rechner/fresnel/'],
    category: 'ausbreitung',
    source: 'ITU-R P.526-15'
  },
  {
    id: 'mehrwegausbreitung',
    term: 'Mehrwegausbreitung',
    short: 'Das Signal erreicht den Empfänger über mehrere Wege gleichzeitig. Je nach Phasenlage verstärken oder löschen sich die Anteile.',
    long: 'Folgen sind Schwund, Verzerrungen und Intersymbolinterferenz; die Laufzeitspreizung begrenzt die nutzbare Symbolrate. OFDM mit Schutzintervall und MIMO machen aus dem Problem einen Vorteil.',
    related: ['#schwund', '#ofdm', '#mimo'],
    category: 'ausbreitung',
    source: 'ITU-R P.1407'
  },
  {
    id: 'schwund',
    term: 'Schwund (Fading)',
    short: 'Zeitliche Schwankung der Empfangsfeldstärke durch Mehrwegausbreitung, Bewegung oder Wetter.',
    long: 'Schneller Schwund entsteht durch Interferenz auf kurzen Wegstrecken (Rayleigh- oder Rice-verteilt), langsamer Schwund durch Abschattung. Dagegen helfen Diversity, Fehlerkorrektur und eine ausreichende Schwundreserve.',
    related: ['#schwundreserve', '#mehrwegausbreitung', '/rechner/link-budget/'],
    category: 'ausbreitung',
    source: 'ITU-R P.530-18'
  },
  {
    id: 'ionosphaere',
    term: 'Ionosphäre',
    short: 'Von der Sonnenstrahlung ionisierte Hochatmosphäre in etwa 60 bis 400 km Höhe. Ihre D-, E- und F-Schichten prägen die Kurzwellenausbreitung.',
    long: 'Die D-Schicht dämpft am Tag, die F2-Schicht reflektiert Tag und Nacht. Ionisierungsgrad und damit die nutzbaren Frequenzen folgen dem Tages-, Jahres- und dem elfjährigen Sonnenfleckenzyklus.',
    related: ['#muf', '#raumwelle', '/wissen/wellenausbreitung/'],
    category: 'ausbreitung',
    source: 'ITU-R P.1239'
  },
  {
    id: 'muf',
    term: 'MUF',
    short: 'Maximum Usable Frequency: die höchste Frequenz, die für eine bestimmte Strecke noch von der Ionosphäre zurückkommt.',
    long: 'Die MUF steigt mit flacherem Abstrahlwinkel (Sekantengesetz) und mit der Ionisierung. Oberhalb der MUF durchdringt die Welle die Schicht und ist verloren; in der Praxis arbeitet man einige Prozent darunter.',
    unit: 'MHz',
    formula: 'MUF = foF2 / cos φ',
    related: ['#luf', '#ionosphaere', '/wissen/wellenausbreitung/'],
    category: 'ausbreitung',
    source: 'ITU-R P.1240'
  },
  {
    id: 'luf',
    term: 'LUF',
    short: 'Lowest Usable Frequency: die niedrigste Frequenz, die trotz Absorption in der D-Schicht noch mit brauchbarem Pegel ankommt.',
    long: 'Die Absorption nimmt mit 1/f² ab, deshalb gibt es am Tag eine untere Grenze. Zwischen LUF und MUF liegt das nutzbare Fenster; nachts verschwindet die D-Schicht und die LUF sinkt.',
    unit: 'MHz',
    related: ['#muf', '#ionosphaere', '/wissen/wellenausbreitung/'],
    category: 'ausbreitung',
    source: 'ITU-R P.533'
  },
  {
    id: 'skip-zone',
    term: 'Skip-Zone (Tote Zone)',
    short: 'Ring zwischen der Reichweite der Bodenwelle und dem ersten Auftreffpunkt der Raumwelle — dort ist kein Empfang möglich.',
    related: ['#raumwelle', '#bodenwelle', '/wissen/wellenausbreitung/'],
    category: 'ausbreitung',
    source: 'Davies, Ionospheric Radio'
  },
  {
    id: 'sporadic-e',
    term: 'Sporadic E',
    short: 'Unregelmäßig auftretende, stark ionisierte Wolken in der E-Schicht. Sie ermöglichen im Sommer VHF-Verbindungen über 1000 bis 2000 km.',
    related: ['#ionosphaere', '/wissen/wellenausbreitung/', '/wissen/funktechnik/amateurfunk/'],
    category: 'ausbreitung',
    source: 'ITU-R P.534'
  },
  {
    id: 'troposcatter',
    term: 'Troposcatter',
    short: 'Streuung an Inhomogenitäten der Troposphäre. Sie erlaubt Verbindungen über einige hundert Kilometer weit jenseits des Horizonts.',
    long: 'Troposcatter-Strecken brauchen große Antennen und hohe Sendeleistung, weil nur ein winziger Bruchteil der Leistung in Richtung Empfänger gestreut wird. Militärische Richtfunknetze nutzten das Verfahren im Bereich 1 bis 5 GHz.',
    related: ['/wissen/wellenausbreitung/', '#ducting'],
    category: 'ausbreitung',
    source: 'ITU-R P.617'
  },
  {
    id: 'ducting',
    term: 'Ducting',
    short: 'Führung der Welle in einer atmosphärischen Schicht wie in einem Hohlleiter. Über See sind dadurch Überreichweiten von vielen hundert Kilometern möglich.',
    related: ['#refraktion', '/wissen/wellenausbreitung/', '/rechner/radiohorizont/'],
    category: 'ausbreitung',
    source: 'ITU-R P.452'
  },
  {
    id: 'regendaempfung',
    term: 'Regendämpfung',
    short: RAIN_ATTENUATION.short,
    long: 'Die Dämpfung wächst mit Regenrate und Frequenz und hängt von der Polarisation ab — horizontal polarisierte Wellen werden von den abgeplatteten Tropfen stärker gedämpft. Bei Satellitenstrecken im Ka-Band bestimmt sie die Verfügbarkeit.',
    unit: 'dB/km',
    formula: 'γ = k · R^α',
    related: ['#daempfung', '/rechner/link-budget/', '#gasdaempfung'],
    category: 'ausbreitung',
    source: 'ITU-R P.838-3'
  },
  {
    id: 'gasdaempfung',
    term: 'Gasdämpfung',
    short: 'Absorption durch Sauerstoff und Wasserdampf. Sie erzeugt die bekannten Spitzen bei 22 GHz, 60 GHz und 183 GHz.',
    long: 'Der Sauerstoffkomplex um 60 GHz dämpft in Bodennähe rund 15 dB je Kilometer — zu viel für Weitverkehr, ideal für abhörsichere Kurzstrecken. Zwischen den Linien liegen die atmosphärischen Fenster, in denen Richtfunk und Satellitenverkehr arbeiten.',
    unit: 'dB/km',
    related: ['#regendaempfung', '#daempfung', '/spektrum/'],
    category: 'ausbreitung',
    source: 'ITU-R P.676-13'
  },

  // ==========================================================================
  // Modulation und Übertragung
  // ==========================================================================
  {
    id: 'modulation',
    term: 'Modulation',
    short: 'Aufprägen einer Nachricht auf eine Trägerschwingung durch Änderung von Amplitude, Frequenz oder Phase.',
    related: ['/wissen/modulation/', '#am', '#qam'],
    category: 'modulation'
  },
  {
    id: 'am',
    term: 'AM (Amplitudenmodulation)',
    short: 'Die Amplitude des Trägers folgt dem Nutzsignal. Einfach zu demodulieren, aber empfindlich gegen Störungen und wenig leistungseffizient.',
    long: 'Beim klassischen AM-Rundfunk steckt der größte Teil der Leistung im informationslosen Träger. Die belegte Bandbreite ist doppelt so groß wie die höchste Modulationsfrequenz.',
    related: ['/wissen/modulation/', '#ssb', '/wissen/funktechnik/rundfunk/'],
    category: 'modulation'
  },
  {
    id: 'fm',
    term: 'FM (Frequenzmodulation)',
    short: 'Die Momentanfrequenz folgt dem Nutzsignal. Unempfindlich gegen Amplitudenstörungen, dafür breitbandiger als AM.',
    long: 'Die belegte Bandbreite schätzt die Carson-Formel: B ≈ 2·(Δf + f_max). Beim UKW-Rundfunk mit ±75 kHz Hub und 15 kHz Audiobandbreite ergibt das rund 180 kHz — das Kanalraster beträgt 300 kHz.',
    formula: 'B ≈ 2 · (Δf + f_max)',
    related: ['/wissen/modulation/', '#am', '/wissen/funktechnik/rundfunk/'],
    category: 'modulation',
    source: 'Carson, 1922'
  },
  {
    id: 'ssb',
    term: 'SSB (Einseitenbandmodulation)',
    short: 'AM ohne Träger und ohne ein Seitenband. Halbe Bandbreite, deutlich bessere Leistungsausnutzung — Standard im Kurzwellen-Sprechfunk.',
    related: ['/wissen/modulation/', '#am', '/wissen/funktechnik/amateurfunk/'],
    category: 'modulation'
  },
  {
    id: 'fsk',
    term: 'FSK',
    short: 'Frequenzumtastung: jedes Symbol entspricht einer festen Frequenz. Robust und einfach, deshalb bei Telemetrie und Funkfernsteuerungen verbreitet.',
    related: ['/wissen/modulation/', '#psk', '#symbolrate'],
    category: 'modulation'
  },
  {
    id: 'psk',
    term: 'PSK',
    short: 'Phasenumtastung: die Information steckt in der Phasenlage des Trägers. BPSK überträgt ein Bit je Symbol, QPSK zwei.',
    long: 'PSK ist bei gegebenem SNR effizienter als FSK und die Grundlage der meisten Satelliten- und Mobilfunkstandards. Mit steigender Stufenzahl rücken die Punkte im Konstellationsdiagramm zusammen und der SNR-Bedarf wächst.',
    related: ['/wissen/modulation/', '#qam', '#snr'],
    category: 'modulation'
  },
  {
    id: 'qam',
    term: 'QAM',
    short: 'Quadraturamplitudenmodulation: Amplitude und Phase tragen gemeinsam die Information. 64-QAM überträgt 6 Bit je Symbol.',
    long: 'Jede Vervierfachung der Konstellationspunkte bringt 2 Bit mehr je Symbol, kostet aber rund 6 dB SNR. Deshalb schalten Mobilfunk und WLAN adaptiv zwischen QPSK und 1024-QAM um.',
    related: ['/wissen/modulation/', '#snr', '/rechner/kanalkapazitaet/'],
    category: 'modulation',
    source: 'Proakis, Digital Communications'
  },
  {
    id: 'ofdm',
    term: 'OFDM',
    short: 'Aufteilung des Datenstroms auf viele orthogonale Unterträger. Robust gegen Mehrwegausbreitung, deshalb Basis von WLAN, LTE, 5G, DAB+ und DVB-T2.',
    long: 'Weil jeder Unterträger schmalbandig ist, wird das Symbol lang gegenüber der Laufzeitspreizung; ein zyklisches Schutzintervall fängt Echos ab. Nachteil ist der hohe Spitzen-Mittelwert-Faktor, der lineare Endstufen verlangt.',
    related: ['/wissen/modulation/', '#mehrwegausbreitung', '/wissen/funktechnik/mobilfunk/'],
    category: 'modulation',
    source: '3GPP TS 36.211, ETSI EN 302 755'
  },
  {
    id: 'spreizspektrum',
    term: 'Spreizspektrum',
    short: 'Das Signal wird absichtlich über eine viel größere Bandbreite verteilt, als die Datenrate erfordert — durch Codespreizung oder Frequenzsprünge.',
    long: 'Der Gewinn steckt im Spreizfaktor: das Signal darf unter dem Rauschen liegen und bleibt dekodierbar. GPS, Bluetooth (Frequenzsprung) und UMTS (CDMA) arbeiten so.',
    related: ['#vielfachzugriff', '/wissen/modulation/', '#snr'],
    category: 'modulation'
  },
  {
    id: 'symbolrate',
    term: 'Symbolrate',
    short: 'Zahl der übertragenen Symbole je Sekunde, gemessen in Baud. Mit der Zahl der Bit je Symbol ergibt sich daraus die Bitrate.',
    unit: 'Bd',
    formula: 'R_b = R_s · log₂(M)',
    related: ['#qam', '#bandbreite', '/rechner/kanalkapazitaet/'],
    category: 'modulation'
  },
  {
    id: 'bitfehlerrate',
    term: 'Bitfehlerrate (BER)',
    short: 'Anteil falsch empfangener Bits. Sie ist das Qualitätsmaß digitaler Übertragung und hängt unmittelbar am SNR.',
    long: 'Als Referenz dient häufig eine BER von 10⁻⁵ ohne Fehlerkorrektur. Vorwärtsfehlerkorrektur senkt die nötige SNR-Schwelle um mehrere Dezibel (Codierungsgewinn).',
    related: ['#snr', '/wissen/modulation/', '#kanalkapazitaet'],
    category: 'modulation'
  },
  {
    id: 'kanalkapazitaet',
    term: 'Kanalkapazität',
    short: 'Obergrenze der fehlerfrei übertragbaren Datenrate nach Shannon-Hartley — bestimmt durch Bandbreite und Signal-Rausch-Verhältnis.',
    long: 'Die Grenze gilt unabhängig vom Verfahren: Mehr Datenrate erfordert mehr Bandbreite oder mehr SNR. Reale Systeme bleiben wegen Filterung, Pilotsymbolen und Schutzintervallen deutlich darunter.',
    unit: 'bit/s',
    formula: 'C = B · log₂(1 + SNR)',
    related: ['/rechner/kanalkapazitaet/', '#snr', '#bandbreite'],
    category: 'modulation',
    source: 'Shannon, 1948'
  },
  {
    id: 'duplex',
    term: 'Duplex',
    short: 'Art, wie Hin- und Rückrichtung getrennt werden: FDD über getrennte Frequenzen, TDD über getrennte Zeitschlitze.',
    long: 'FDD braucht ein Frequenzpaar mit Duplexabstand und ein Filter im Gerät, erlaubt aber echten Gleichzeitbetrieb. TDD kommt mit einem Band aus und kann das Verhältnis von Auf- und Abwärtsstrecke anpassen — deshalb ist n78 in 5G ein TDD-Band. Simplex meint Wechselsprechen auf einer Frequenz.',
    related: ['/wissen/funktechnik/mobilfunk/', '#vielfachzugriff', '#tetra'],
    category: 'modulation',
    source: '3GPP TS 38.104'
  },
  {
    id: 'vielfachzugriff',
    term: 'Vielfachzugriff',
    short: 'Wie sich mehrere Teilnehmer einen Kanal teilen: nach Frequenz (FDMA), Zeit (TDMA), Code (CDMA) oder Unterträgern (OFDMA).',
    related: ['/wissen/funktechnik/mobilfunk/', '#ofdm', '#duplex'],
    category: 'modulation',
    source: '3GPP TS 36.300'
  },

  // ==========================================================================
  // Radar
  // ==========================================================================
  {
    id: 'radar',
    term: 'Radar',
    short: 'Ortung durch Aussenden eines Signals und Auswerten der Rückstreuung. Aus Laufzeit, Richtung und Frequenzverschiebung folgen Entfernung, Winkel und Geschwindigkeit.',
    long: 'Weil die Welle den Weg zweimal zurücklegt, sinkt die Empfangsleistung mit der vierten Potenz der Entfernung. Doppelte Reichweite verlangt daher die sechzehnfache Sendeleistung.',
    formula: 'R_max = ⁴√(P·G²·λ²·σ / ((4π)³·P_min))',
    related: ['/rechner/radar/', '/wissen/radar/', '#rcs'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems'
  },
  {
    id: 'rcs',
    term: 'RCS (Radarquerschnitt)',
    short: 'Fläche, die ein Ziel dem Radar scheinbar entgegenstellt. Sie hängt von Form, Material, Frequenz und Blickwinkel ab, nicht nur von der Größe.',
    long: 'Die Spanne ist enorm: ein Vogel liegt bei etwa 0,01 m², ein Mensch bei 1 m², ein Verkehrsflugzeug bei 20 bis 100 m². Stealth-Konstruktionen lenken die Energie weg vom Sender und erreichen Werte um 0,001 bis 0,01 m².',
    unit: 'm²',
    related: ['/rechner/radar/', '/wissen/radar/', '#radar'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems, Tab. 2.2'
  },
  {
    id: 'prf',
    term: 'PRF (Pulswiederholfrequenz)',
    short: 'Zahl der Sendeimpulse je Sekunde. Sie legt die eindeutige Maximalreichweite fest: R = c / (2 · PRF).',
    long: 'Eine hohe PRF liefert viele Messungen je Sekunde und einen großen eindeutigen Geschwindigkeitsbereich, verkürzt aber die eindeutige Entfernung. Echos von jenseits dieser Grenze erscheinen als Geisterziele in geringerer Entfernung.',
    unit: 'Hz',
    formula: 'R_eindeutig = c / (2 · PRF)',
    related: ['/rechner/radar/', '/wissen/radar/', '#doppler'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems'
  },
  {
    id: 'doppler',
    term: 'Doppler-Effekt',
    short: 'Frequenzverschiebung durch Relativbewegung. Sie macht die Radialgeschwindigkeit eines Ziels messbar.',
    long: 'Beim Radar tritt die Verschiebung doppelt auf, weil das Signal hin und zurück läuft: f_D = 2·v·f/c. Bei 24,125 GHz entsprechen 100 km/h rund 4,5 kHz.',
    unit: 'Hz',
    formula: 'f_D = 2 · v · f / c',
    related: ['/wissen/radar/', '/rechner/radar/', '#fmcw'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems'
  },
  {
    id: 'fmcw',
    term: 'FMCW-Radar',
    short: 'Dauerstrichradar mit frequenzmoduliertem Träger. Aus der Differenzfrequenz zwischen gesendetem und empfangenem Signal folgt die Entfernung.',
    long: 'FMCW braucht keine hohe Pulsleistung und misst auch sehr kurze Entfernungen — deshalb arbeiten Abstandsradare im Auto (77 GHz) und Füllstandsmesser nach diesem Prinzip.',
    related: ['/wissen/radar/', '#radar', '#doppler'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems'
  },
  {
    id: 'sekundaerradar',
    term: 'Sekundärradar',
    short: 'Das Ziel antwortet aktiv auf eine Abfrage. In der Luftfahrt fragt der Bodenradar auf 1030 MHz, der Transponder antwortet auf 1090 MHz.',
    related: ['#ads-b', '/wissen/radar/', '/wissen/funktechnik/funkdienste/'],
    category: 'radar',
    source: 'ICAO Annex 10'
  },
  {
    id: 'pulskompression',
    term: 'Pulskompression',
    short: 'Ein langer, modulierter Sendepuls wird im Empfänger zusammengeschoben. Das bringt Reichweite eines langen und Auflösung eines kurzen Pulses.',
    related: ['/wissen/radar/', '#radar', '#prf'],
    category: 'radar',
    source: 'Skolnik, Introduction to Radar Systems'
  },

  // ==========================================================================
  // Funkdienste und Regulierung
  // ==========================================================================
  {
    id: 'itu-band',
    term: 'ITU-Bänder',
    short: BAND_ITU.short,
    long: 'Die Einteilung folgt Dekaden: VLF 3–30 kHz, LF 30–300 kHz, MF 0,3–3 MHz, HF 3–30 MHz, VHF 30–300 MHz, UHF 0,3–3 GHz, SHF 3–30 GHz, EHF 30–300 GHz. Jedes Band trägt eine Bandnummer.',
    related: ['/datenbanken/frequenzbaender/', '#ieee-band', '/spektrum/'],
    category: 'dienste',
    source: 'ITU Radio Regulations, Art. 2'
  },
  {
    id: 'ieee-band',
    term: 'IEEE-Bänder',
    short: BAND_IEEE.short,
    long: 'Die Buchstaben stammen aus der Geheimhaltung der Radarentwicklung im Zweiten Weltkrieg: L, S, C, X, Ku, K, Ka, V, W. Sie sind bis heute in Radar-, Satelliten- und Richtfunktechnik gebräuchlich.',
    related: ['/datenbanken/frequenzbaender/', '#itu-band', '#nato-band'],
    category: 'dienste',
    source: 'IEEE Std 521'
  },
  {
    id: 'nato-band',
    term: 'NATO-Bänder',
    short: BAND_NATO.short,
    long: 'Die militärische Einteilung reicht von A bis O und deckt sich nicht mit den IEEE-Buchstaben — das I-Band der NATO liegt etwa dort, wo IEEE X sagt. Beim Lesen von Quellen ist die Zuordnung deshalb immer zu prüfen.',
    related: ['/datenbanken/frequenzbaender/', '#ieee-band'],
    category: 'dienste'
  },
  {
    id: 'frequenzplan',
    term: 'Frequenzplan',
    short: 'Verzeichnis, welcher Funkdienst welchen Bereich nutzen darf. International legt die ITU den Rahmen fest, national die Bundesnetzagentur.',
    long: 'Die Vollzugsordnung für den Funkdienst teilt die Welt in drei Regionen und weist jedem Dienst Bereiche primär oder sekundär zu. Sekundäre Nutzer dürfen primäre nicht stören und genießen keinen Schutz.',
    related: ['/wissen/funktechnik/funkdienste/', '/datenbanken/funkdienste/', '#itu-band'],
    category: 'dienste',
    source: 'ITU Radio Regulations; BNetzA Frequenzplan'
  },
  {
    id: 'ism',
    term: 'ISM-Band',
    short: 'Bereiche für industrielle, wissenschaftliche und medizinische Anwendungen — genehmigungsfrei nutzbar, aber ohne Störungsschutz.',
    long: 'Bekannt sind 433,05–434,79 MHz, 863–870 MHz, 2400–2483,5 MHz und 5725–5875 MHz. WLAN, Bluetooth, LoRa und Mikrowellenherde teilen sich diese Bereiche; wer dort funkt, muss Störungen hinnehmen.',
    related: ['/datenbanken/funkdienste/', '#srd', '#lpd433'],
    category: 'dienste',
    source: 'ITU Radio Regulations Nr. 5.138/5.150; ETSI EN 300 220'
  },
  {
    id: 'srd',
    term: 'SRD (Short Range Devices)',
    short: 'Funkanwendungen geringer Reichweite und Leistung, die allgemein zugeteilt sind — Fernbedienungen, Sensoren, Reifendrucküberwachung.',
    related: ['#ism', '/datenbanken/funkdienste/', '#lpd433'],
    category: 'dienste',
    source: 'ETSI EN 300 220, CEPT ERC/REC 70-03'
  },
  {
    id: 'pmr446',
    term: 'PMR446',
    short: 'Genehmigungsfreier Betriebsfunk auf 446 MHz mit 500 mW ERP und fest eingebauter Antenne.',
    related: ['/wissen/funktechnik/funkdienste/', '#erp', '#lpd433'],
    category: 'dienste',
    source: 'CEPT ERC/DEC/(98)25, ETSI EN 300 296'
  },
  {
    id: 'lpd433',
    term: 'LPD433',
    short: 'Kurzstreckenfunk im 433-MHz-ISM-Band mit 10 mW ERP — genutzt von Fernbedienungen, Wetterstationen und einfachen Sprechfunkgeräten.',
    related: ['#ism', '#srd', '#pmr446'],
    category: 'dienste',
    source: 'CEPT ERC/REC 70-03'
  },
  {
    id: 'amateurfunk',
    term: 'Amateurfunkdienst',
    short: 'Funkdienst zur Selbstbildung, für technische Experimente und den internationalen Verkehr — mit eigenen Bändern, Prüfung und Rufzeichen.',
    related: ['/wissen/funktechnik/amateurfunk/', '/datenbanken/frequenzbaender/', '#muf'],
    category: 'dienste',
    source: 'ITU Radio Regulations Art. 25; AFuV'
  },
  {
    id: 'gmdss',
    term: 'GMDSS',
    short: 'Weltweites Seenotfunksystem: automatische Alarmierung über UKW, Grenz- und Kurzwelle sowie Satellit statt Dauerhörwache.',
    long: 'Zum System gehören DSC-Alarmierung, NAVTEX für Sicherheitsmeldungen, EPIRB-Notfunkbaken auf 406 MHz und Satellitenkommunikation. Es gilt für Schiffe nach dem SOLAS-Übereinkommen.',
    related: ['/wissen/funktechnik/notfrequenzen/', '#dsc', '#epirb'],
    category: 'dienste',
    source: 'IMO SOLAS Kap. IV'
  },
  {
    id: 'dsc',
    term: 'DSC (Digitaler Selektivruf)',
    short: 'Digitales Rufverfahren im Seefunk. Kanal 70 im UKW-Bereich ist ausschließlich für DSC-Alarmierung reserviert.',
    related: ['#gmdss', '/wissen/funktechnik/notfrequenzen/'],
    category: 'dienste',
    source: 'ITU-R M.493'
  },
  {
    id: 'epirb',
    term: 'EPIRB und 406 MHz',
    short: 'Satellitengestützte Notfunkbaken senden auf 406 MHz an das Cospas-Sarsat-System; 121,5 MHz dient nur noch der Nahfeldpeilung.',
    related: ['#gmdss', '/wissen/funktechnik/notfrequenzen/'],
    category: 'dienste',
    source: 'Cospas-Sarsat C/S T.001; ITU-R M.633'
  },
  {
    id: 'ads-b',
    term: 'ADS-B',
    short: 'Flugzeuge senden ihre per Satellitennavigation bestimmte Position selbsttätig auf 1090 MHz aus — ohne Abfrage durch ein Radar.',
    long: 'Die Aussendung nutzt das erweiterte Antwortformat des Mode-S-Transponders (Extended Squitter). Weil sie unverschlüsselt ist, lässt sie sich mit einfachen Empfängern mitlesen.',
    related: ['#sekundaerradar', '/wissen/funktechnik/funkdienste/', '/wissen/radar/'],
    category: 'dienste',
    source: 'ICAO Annex 10, RTCA DO-260B'
  },
  {
    id: 'tetra',
    term: 'TETRA',
    short: 'Digitaler Bündelfunkstandard für Behörden und Betriebe. In Deutschland trägt er den BOS-Digitalfunk im 380-bis-395-MHz-Bereich.',
    long: 'TETRA arbeitet mit TDMA in 25-kHz-Kanälen und vier Zeitschlitzen. Neben dem Netzbetrieb gibt es den Direktmodus zwischen Geräten sowie Gruppenrufe mit sehr kurzem Rufaufbau.',
    related: ['/wissen/funktechnik/funkdienste/', '#duplex', '#vielfachzugriff'],
    category: 'dienste',
    source: 'ETSI EN 300 392'
  },
  {
    id: 'dab-plus',
    term: 'DAB+',
    short: 'Digitaler terrestrischer Hörfunk im VHF-Band III. Mehrere Programme teilen sich einen Multiplex von 1,536 MHz Bandbreite.',
    long: 'DAB+ nutzt OFDM und arbeitet in Gleichwellennetzen: alle Sender eines Netzes strahlen dasselbe Signal auf derselben Frequenz ab, Echos innerhalb des Schutzintervalls stören nicht, sondern tragen bei.',
    related: ['/wissen/funktechnik/rundfunk/', '#ofdm', '/datenbanken/sender/'],
    category: 'dienste',
    source: 'ETSI EN 300 401, TS 102 563'
  },
  {
    id: 'gleichwellennetz',
    term: 'Gleichwellennetz (SFN)',
    short: 'Mehrere Sender strahlen dasselbe Signal zeitgleich auf derselben Frequenz ab. Möglich wird das durch OFDM mit Schutzintervall.',
    related: ['#dab-plus', '#ofdm', '/wissen/funktechnik/rundfunk/'],
    category: 'dienste',
    source: 'ETSI EN 300 401'
  },
  {
    id: 'zeitzeichensender',
    term: 'Zeitzeichensender',
    short: 'Langwellensender, die eine Atomzeit verbreiten — DCF77 auf 77,5 kHz für Mitteleuropa.',
    related: ['/datenbanken/sender/', '#bodenwelle'],
    category: 'dienste',
    source: 'PTB, Sendeparameter DCF77'
  }
];

/** Titel aus `explanations.ts`, die das Glossar bereits abdeckt. */
export const GLOSSARY_COVERED_TITLES: ReadonlySet<string> = new Set([
  FSPL_EXPLANATION.title,
  EIRP_EXPLANATION.title,
  RX_SENSITIVITY.title,
  FADING_MARGIN.title,
  BAND_IEEE.title,
  BAND_ITU.title,
  BAND_NATO.title,
  RAIN_ATTENUATION.title,
  WAVELENGTH.title,
  FREQUENCY.title,
  EM_SPECTRUM.title
]);

/** Anfangsbuchstabe eines Begriffs für die Sprungleiste (Umlaute aufgelöst). */
export function glossaryLetter(entry: GlossaryEntry): string {
  const normalized = normalizeForSearch(entry.term);
  const first = normalized.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

/** Alphabetisch sortierte Einträge (deutsche Sortierung, Umlaute eingereiht). */
export const GLOSSARY_SORTED: GlossaryEntry[] = [...GLOSSARY].sort((a, b) =>
  a.term.localeCompare(b.term, 'de')
);

/** Alle vorkommenden Anfangsbuchstaben, alphabetisch. */
export const GLOSSARY_LETTERS: string[] = [
  ...new Set(GLOSSARY_SORTED.map(glossaryLetter))
].sort((a, b) => a.localeCompare(b, 'de'));

/** Filterkriterien der Glossarseite. */
export interface GlossaryFilter {
  /** Freitext; umlauttolerant, jedes Wort muss vorkommen. */
  query?: string;
  /** Kategorie oder `null` für alle. */
  category?: GlossaryCategory | null;
}

/** Durchsuchbarer Text eines Eintrags. */
function searchableText(entry: GlossaryEntry): string {
  return normalizeForSearch(
    [entry.term, entry.short, entry.long ?? '', ...(entry.synonyms ?? []), entry.id].join(' ')
  );
}

/**
 * Filtert das Glossar nach Suchtext und Kategorie.
 * Die Reihenfolge bleibt alphabetisch — die Seite zeigt eine Liste, keine
 * Trefferrangfolge.
 */
export function filterGlossary(
  filter: GlossaryFilter,
  entries: readonly GlossaryEntry[] = GLOSSARY_SORTED
): GlossaryEntry[] {
  const tokens = normalizeForSearch(filter.query ?? '')
    .split(' ')
    .filter(Boolean);
  return entries.filter((entry) => {
    if (filter.category && entry.category !== filter.category) return false;
    if (tokens.length === 0) return true;
    const haystack = searchableText(entry);
    return tokens.every((token) => haystack.includes(token));
  });
}

/** Einträge nach Anfangsbuchstaben gruppiert, in alphabetischer Reihenfolge. */
export function groupByLetter(
  entries: readonly GlossaryEntry[]
): { letter: string; entries: GlossaryEntry[] }[] {
  const groups = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const letter = glossaryLetter(entry);
    const list = groups.get(letter) ?? [];
    list.push(entry);
    groups.set(letter, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'de'))
    .map(([letter, list]) => ({ letter, entries: list }));
}

/** Einen Begriff über seine Anker-ID finden. */
export function findGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.id === id);
}

/** Anzeigename einer Kategorie. */
export function categoryLabel(category: GlossaryCategory): string {
  return GLOSSARY_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
