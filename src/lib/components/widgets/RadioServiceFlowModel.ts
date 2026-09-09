/**
 * Rechen- und Datenmodell des Widgets „Von der Zuweisung zur Zuteilung".
 *
 * Der Weg einer Frequenz führt über vier Ebenen: die völkerrechtliche
 * Zuweisung an einen Funkdienst (VO Funk Artikel 5), die europäische
 * Harmonisierung, den nationalen Frequenzplan und schließlich die
 * Frequenzzuteilung an einen konkreten Nutzer. Das Widget zeichnet diese
 * Kette und legt drei Beispielspuren darüber.
 *
 * Es gibt hier wenig zu rechnen — die prüfbaren Größen sind die Breite des
 * Frequenzbereichs je Beispiel, die Vollständigkeit jeder Spur und die
 * Reihenfolge der Ebenen.
 *
 * Quellen:
 * - Vollzugsordnung für den Funkdienst (VO Funk), Artikel 1 (Definitionen)
 *   und Artikel 5 (Frequenzzuweisungstabelle, Region 1)
 * - § 90 TKG — Frequenzplan der Bundesnetzagentur
 * - § 91 TKG — Frequenzzuteilung: Allgemeinzuteilung von Amts wegen,
 *   sonst Einzelzuteilung auf Antrag
 * - Amateurfunkgesetz (AFuG) und Amateurfunkverordnung (AFuV) Anlage 1 für
 *   die Sonderstellung des Amateurfunkdienstes
 * - Frequenzbereiche: ISM 2400–2483,5 MHz (VO Funk Fußnote 5.150),
 *   Amateurfunk 144–146 MHz und Mobilfunkband 20 aus den Projektdaten
 *   (`$lib/data/amateurBands`, `$lib/data/mobileNetworks`)
 */

/** Kennung einer Ebene der Kette. */
export type FlowStageId = 'zuweisung' | 'harmonisierung' | 'frequenzplan' | 'zuteilung';

/** Eine Ebene zwischen völkerrechtlichem Vertrag und Betriebserlaubnis. */
export interface FlowStage {
  id: FlowStageId;
  /** Kurzname der Ebene */
  label: string;
  /** Wer handelt auf dieser Ebene */
  actorDE: string;
  /** Das Rechtsinstrument dieser Ebene */
  instrumentDE: string;
  /** Erklärtext, erscheint bei Auswahl der Stufe */
  explanationDE: string;
}

/** Die vier Ebenen in Lesereihenfolge. */
export const FLOW_STAGES: FlowStage[] = [
  {
    id: 'zuweisung',
    label: 'Zuweisung',
    actorDE: 'ITU · Weltfunkkonferenz',
    instrumentDE: 'VO Funk Art. 5',
    explanationDE:
      'Die Zuweisungstabelle in Artikel 5 der Vollzugsordnung für den Funkdienst ordnet jeden ' +
      'Frequenzbereich einem oder mehreren Funkdiensten zu — getrennt nach den drei ITU-Regionen. ' +
      'Sie ist ein völkerrechtlicher Vertrag und wird auf den Weltfunkkonferenzen fortgeschrieben. ' +
      'Primäre Dienste stehen dort in Großbuchstaben, sekundäre in Kleinbuchstaben.'
  },
  {
    id: 'harmonisierung',
    label: 'Harmonisierung',
    actorDE: 'CEPT/ECC · EU-Kommission',
    instrumentDE: 'ECC-Beschlüsse, EU-Durchführungsbeschlüsse',
    explanationDE:
      'Innerhalb der Zuweisung legt Europa die konkrete Nutzung fest: Kanalraster, Grenzwerte, ' +
      'Betriebsbedingungen. ECC-Beschlüsse und -Empfehlungen sind zunächst freiwillig; die ' +
      'EU-Kommission kann einzelne davon für verbindlich erklären. So entstehen europaweit ' +
      'einheitliche Bänder — die Voraussetzung dafür, dass ein Gerät in allen Mitgliedstaaten ' +
      'betrieben werden darf.'
  },
  {
    id: 'frequenzplan',
    label: 'Frequenzplan',
    actorDE: 'Bundesnetzagentur',
    instrumentDE: '§ 90 TKG, Frequenzteilpläne',
    explanationDE:
      'Der nationale Frequenzplan bildet die Zuweisung auf deutsche Verhältnisse ab. Jeder ' +
      'Frequenzteilplan nennt die zugewiesenen Funkdienste mit ihrem Status, die zulässigen ' +
      'Funkanwendungen und die Nutzungsbestimmungen — Sendeleistung, Bandbreite, Tastverhältnis, ' +
      'Antennenhöhe. Erst hier wird aus dem Funkdienst eine benannte Anwendung.'
  },
  {
    id: 'zuteilung',
    label: 'Zuteilung',
    actorDE: 'Bundesnetzagentur · Nutzer',
    instrumentDE: '§ 91 TKG',
    explanationDE:
      'Die Zuteilung erlaubt den Betrieb. Ist sie für einen unbestimmten Personenkreis möglich, ' +
      'erteilt die Bundesnetzagentur sie von Amts wegen als Allgemeinzuteilung — niemand muss ' +
      'etwas beantragen. Sonst wird einzeln zugeteilt, auf Antrag und mit Standort, Frequenz, ' +
      'Leistung und Antenne. Der Amateurfunkdienst ist der Sonderfall: dort folgt die Zuteilung ' +
      'aus dem Rufzeichen und der Zeugnisklasse, nicht aus einem Standort.'
  }
];

/** Art der Frequenzzuteilung am Ende der Kette. */
export type GrantKind = 'allgemein' | 'einzel' | 'amateur';

/** Klartext der Zuteilungsart. */
export const GRANT_LABEL: Record<GrantKind, string> = {
  allgemein: 'Allgemeinzuteilung',
  einzel: 'Einzelzuteilung',
  amateur: 'Zuteilung über Rufzeichen (AFuG/AFuV)'
};

/** Eine Beispielspur durch alle vier Ebenen. */
export interface FlowExample {
  id: string;
  /** Kurzname für den Auswahlknopf */
  label: string;
  /** Untergrenze des Bereichs in Hz */
  minHz: number;
  /** Obergrenze des Bereichs in Hz */
  maxHz: number;
  /** Zugewiesener Funkdienst nach VO Funk */
  serviceDE: string;
  /** Status der für das Beispiel maßgeblichen Zuweisung */
  status: 'primaer' | 'sekundaer';
  /** Randnotiz zum Status */
  statusNoteDE: string;
  /** Art der Zuteilung am Ende */
  grant: GrantKind;
  /** Eintrag je Ebene, kurz genug für eine Zeile in der Grafik */
  steps: Record<FlowStageId, string>;
  source: string;
}

/**
 * Drei Spuren, die die drei möglichen Enden der Kette zeigen:
 * Allgemeinzuteilung, Einzelzuteilung und die Sonderrolle des Amateurfunks.
 */
export const FLOW_EXAMPLES: FlowExample[] = [
  {
    id: 'ism-2400',
    label: '2,4-GHz-ISM (WLAN, Bluetooth)',
    minHz: 2400e6,
    maxHz: 2483.5e6,
    serviceDE: 'Fester Funkdienst, beweglicher Funkdienst, Funkortung; Amateurfunk sekundär',
    status: 'primaer',
    statusNoteDE:
      'Der Amateurfunkdienst nutzt 2320–2450 MHz sekundär und muss die ISM-Anwendungen dulden.',
    grant: 'allgemein',
    steps: {
      zuweisung:
        'VO Funk Art. 5, Fußnote 5.150: ISM-Bereich 2400–2500 MHz, Störungen sind hinzunehmen',
      harmonisierung: 'ECC/EU: Funknetze (WLAN/RLAN) 2400–2483,5 MHz, 100 mW EIRP',
      frequenzplan: 'Frequenzteilplan „Funkanwendungen geringer Leistung / Funknetze"',
      zuteilung: 'Allgemeinzuteilung: kein Antrag, kein Störungsschutz, feste Leistungsgrenze'
    },
    source: 'VO Funk Fußnote 5.150; BNetzA-Allgemeinzuteilung für Funknetze im 2,4-GHz-Band'
  },
  {
    id: 'mobil-800',
    label: '800-MHz-Mobilfunk (Band 20)',
    minHz: 791e6,
    maxHz: 862e6,
    serviceDE: 'Beweglicher Landfunkdienst (primär)',
    status: 'primaer',
    statusNoteDE:
      'Primäre Zuweisung: Der Netzbetreiber ist im zugeteilten Umfang vor Störungen geschützt.',
    grant: 'einzel',
    steps: {
      zuweisung:
        'VO Funk Art. 5: beweglicher Landfunkdienst in Region 1, nach der WRC-07 neu geordnet',
      harmonisierung:
        'EU-Beschluss zur 800-MHz-Digitalen Dividende, gepaartes Band mit 41 MHz Duplexabstand',
      frequenzplan:
        'Frequenzteilplan „Drahtlose Netzzugänge"; Downlink 791–821, Uplink 832–862 MHz',
      zuteilung: 'Einzelzuteilung nach Versteigerung 2010, befristet und mit Versorgungsauflagen'
    },
    source: '3GPP TS 36.101 (Band 20); BNetzA-Auktion 2010'
  },
  {
    id: 'amateur-2m',
    label: '2-m-Amateurfunk (144–146 MHz)',
    minHz: 144e6,
    maxHz: 146e6,
    serviceDE: 'Amateurfunkdienst und Amateurfunkdienst über Satelliten (primär)',
    status: 'primaer',
    statusNoteDE:
      'In Region 1 primär zugewiesen; oberhalb 146 MHz beginnt wieder der bewegliche Landfunkdienst.',
    grant: 'amateur',
    steps: {
      zuweisung: 'VO Funk Art. 5: AMATEURFUNKDIENST, AMATEURFUNKDIENST ÜBER SATELLITEN (Region 1)',
      harmonisierung:
        'IARU-Region-1-Bandplan ordnet die Betriebsarten — freiwillig, kein Rechtsakt',
      frequenzplan: 'Frequenzteilplan „Amateurfunkdienst", Verweis auf die AFuV',
      zuteilung:
        'AFuV Anlage 1: alle Zeugnisklassen, Zuteilung an das Rufzeichen statt an den Standort'
    },
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 VHF-Bandplan'
  }
];

/** Breite des Frequenzbereichs eines Beispiels in Hz. */
export function exampleBandwidthHz(example: FlowExample): number {
  return Math.max(0, example.maxHz - example.minHz);
}

/** Position einer Ebene in der Kette, beginnend bei 0. */
export function stageIndex(id: FlowStageId): number {
  return FLOW_STAGES.findIndex((stage) => stage.id === id);
}

/** Ebene zu einer Kennung; fällt auf die erste Ebene zurück. */
export function findStage(id: string): FlowStage {
  return FLOW_STAGES.find((stage) => stage.id === id) ?? FLOW_STAGES[0];
}

/** Beispielspur zu einer Kennung; fällt auf das erste Beispiel zurück. */
export function findExample(id: string): FlowExample {
  return FLOW_EXAMPLES.find((example) => example.id === id) ?? FLOW_EXAMPLES[0];
}

/** Hat eine Spur zu jeder Ebene einen Eintrag? */
export function isCompleteTrace(example: FlowExample): boolean {
  return FLOW_STAGES.every((stage) => (example.steps[stage.id] ?? '').trim().length > 0);
}
