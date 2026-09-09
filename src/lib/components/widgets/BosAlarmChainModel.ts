/**
 * Rechenmodell des Widgets „Alarmierungskette der BOS".
 *
 * Die Kette vom Notruf bis zur Rückmeldung ist ein organisatorischer Ablauf.
 * **Für die Dauer der einzelnen Glieder gibt es keine allgemeingültige,
 * zitierbare Zahl** — sie hängt von Leitstelle, Einsatzstichwort und Einheit
 * ab. Die Anteile in `CHAIN_STEPS[].weight` sind deshalb ausdrücklich *schematisch*
 * und tragen keine Zeitachse; sie steuern nur, wie lang ein Glied in der
 * Animation dargestellt wird.
 *
 * Berechnet wird nur, was aus veröffentlichten Normen folgt: die reine
 * Aussendedauer des Alarmierungstelegramms.
 *
 * - **POCSAG** (ITU-R M.584-2): Präambel 576 Bit, danach Stapel („batch") aus
 *   einem Synchronisationswort und acht Rahmen zu je zwei Codewörtern —
 *   17 Codewörter zu 32 Bit = 544 Bit. Übertragungsraten 512, 1200 und
 *   2400 bit/s.
 * - **ZVEI-Tonfolgeruf** (TR BOS): fünf Töne zu je 70 ms.
 * - **TETRA** (ETSI EN 300 392-2): Träger 25 kHz, vier Zeitschlitze je
 *   TDMA-Rahmen, 18 Rahmen bilden einen Multirahmen von 1,02 s.
 *
 * Quellen:
 * - ITU-R M.584-2 — Codes and formats for radio paging (POCSAG)
 * - ETSI EN 300 392-2 — TETRA Voice plus Data, Luftschnittstelle
 * - ETSI EN 300 396 — TETRA Direktbetrieb (DMO)
 * - Technische Richtlinie BOS (TR BOS) für Tonfolge- und Funkmeldesystem;
 *   Bandgrenzen aus `$lib/data/emergencyFrequencies`
 * - Notruf 112: Richtlinie 2002/22/EG; Advanced Mobile Location seit 2019
 */

import { safeDivide } from '$lib/utils/handlers';

// ============================================================================
// Alarmierungswege
// ============================================================================

/** Alarmierungsweg: analoger Tonfolgeruf, digitaler Funkruf oder Digitalfunk. */
export type AlertVariant = 'zvei' | 'pocsag' | 'tetra';

/** POCSAG-Präambel in Bit (ITU-R M.584-2). */
export const POCSAG_PREAMBLE_BITS = 576;
/** Länge eines Codeworts in Bit. */
export const POCSAG_CODEWORD_BITS = 32;
/** Rahmen je Stapel (jeder Rahmen trägt zwei Codewörter). */
export const POCSAG_FRAMES_PER_BATCH = 8;
/** Codewörter je Stapel: ein Synchronisationswort plus 8 × 2 Datenwörter. */
export const POCSAG_BATCH_CODEWORDS = 1 + 2 * POCSAG_FRAMES_PER_BATCH;
/** Übertragungsraten des Funkrufs in bit/s. */
export const POCSAG_RATES_BPS = [512, 1200, 2400] as const;

/** Zahl der Töne einer ZVEI-Tonfolge. */
export const ZVEI_TONE_COUNT = 5;
/** Dauer eines Tones der ZVEI-Folge in s. */
export const ZVEI_TONE_S = 0.07;

/** Dauer eines TETRA-Multirahmens in s (18 TDMA-Rahmen). */
export const TETRA_MULTIFRAME_S = 1.02;
/** TDMA-Rahmen je Multirahmen. */
export const TETRA_FRAMES_PER_MULTIFRAME = 18;
/** Zeitschlitze je TDMA-Rahmen. */
export const TETRA_SLOTS_PER_FRAME = 4;
/** Trägerabstand des TETRA-Netzes in Hz. */
export const TETRA_CARRIER_HZ = 25e3;

/** Dauer eines TETRA-TDMA-Rahmens in s. */
export function tetraFrameDurationS(): number {
  return safeDivide(TETRA_MULTIFRAME_S, TETRA_FRAMES_PER_MULTIFRAME, 0);
}

/** Dauer eines TETRA-Zeitschlitzes in s. */
export function tetraSlotDurationS(): number {
  return safeDivide(tetraFrameDurationS(), TETRA_SLOTS_PER_FRAME, 0);
}

/** Dauer der POCSAG-Präambel in s. */
export function pocsagPreambleDurationS(rateBps: number): number {
  return safeDivide(POCSAG_PREAMBLE_BITS, rateBps, 0);
}

/** Dauer eines POCSAG-Stapels in s (17 Codewörter zu 32 Bit). */
export function pocsagBatchDurationS(rateBps: number): number {
  return safeDivide(POCSAG_BATCH_CODEWORDS * POCSAG_CODEWORD_BITS, rateBps, 0);
}

/** Dauer einer POCSAG-Aussendung aus Präambel und `batches` Stapeln in s. */
export function pocsagAlertDurationS(rateBps: number, batches: number = 1): number {
  const count = Math.max(1, Math.round(batches));
  return pocsagPreambleDurationS(rateBps) + count * pocsagBatchDurationS(rateBps);
}

/** Dauer einer vollständigen ZVEI-Tonfolge in s. */
export function zveiAlertDurationS(): number {
  return ZVEI_TONE_COUNT * ZVEI_TONE_S;
}

/**
 * Reine Aussendedauer des Alarmierungstelegramms in s.
 *
 * Für TETRA wird ein Multirahmen als kleinste sinnvolle Einheit der
 * Signalisierung angesetzt (**Annahme**, in der Fußnote der Grafik benannt);
 * die Rufaufbauzeit im Netz gehört nicht dazu und ist netzabhängig.
 */
export function alertSignalDurationS(
  variant: AlertVariant,
  rateBps: number = 1200,
  batches: number = 1
): number {
  if (variant === 'zvei') return zveiAlertDurationS();
  if (variant === 'pocsag') return pocsagAlertDurationS(rateBps, batches);
  return TETRA_MULTIFRAME_S;
}

/** Beschreibung eines Alarmierungswegs. */
export interface AlertPath {
  id: AlertVariant;
  label: string;
  /** Frequenzbereich beziehungsweise Netz */
  carrierDE: string;
  /** Was übertragen wird */
  payloadDE: string;
  /** Einordnung für den Hinweiskasten */
  noteDE: string;
  source: string;
}

/** Die drei Alarmierungswege im Vergleich. */
export const ALERT_PATHS: Record<AlertVariant, AlertPath> = {
  zvei: {
    id: 'zvei',
    label: 'Analog: ZVEI-Tonfolge (2-m-Band)',
    carrierDE: '2-m-Band 167–174 MHz, 20-kHz-Raster, FM',
    payloadDE: 'Fünf Töne zu je 70 ms — sie sprechen genau eine Schleife an, mehr nicht.',
    noteDE:
      'Der Melder weiß danach nur, dass er gemeint ist. Das Einsatzstichwort kommt über den ' +
      'Sprechfunk oder die Alarmdepesche hinterher — und der Ruf ist für jeden mithörbar.',
    source: 'TR BOS; Bandgrenzen nach BNetzA-Frequenzplan'
  },
  pocsag: {
    id: 'pocsag',
    label: 'Digital: POCSAG-Funkruf (2-m-Band)',
    carrierDE: '2-m-Band, FSK mit ±4,5 kHz Hub, 512/1200/2400 bit/s',
    payloadDE: 'Präambel 576 Bit, danach Stapel zu 544 Bit mit Adresse und Textmeldung.',
    noteDE:
      'POCSAG überträgt Stichwort und Adresse als Text. Es ist außerordentlich robust und ' +
      'wird vielerorts weiter parallel zum Digitalfunk betrieben, weil ein zweiter, ' +
      'unabhängiger Weg im Ernstfall zählt.',
    source: 'ITU-R M.584-2'
  },
  tetra: {
    id: 'tetra',
    label: 'Digitalfunk: TETRA-Gruppenruf',
    carrierDE: 'TETRA 380–395 MHz, Träger 25 kHz mit vier Zeitschlitzen',
    payloadDE: 'Rufgruppe statt fester Kanal; Alarmierung und Sprechverkehr im selben Netz.',
    noteDE:
      'Der Gruppenruf erreicht alle Teilnehmer einer Rufgruppe gleichzeitig, verschlüsselt und ' +
      'mit Rückkanal. Dafür hängt er am Netz — fällt es aus, bleibt der Direktbetrieb (DMO) ' +
      'oder eben der unabhängige Funkrufweg.',
    source: 'ETSI EN 300 392-2; ETSI EN 300 396 (DMO)'
  }
};

// ============================================================================
// Kette
// ============================================================================

/** Ein Glied der Alarmierungskette. */
export interface ChainStep {
  id: string;
  label: string;
  actorDE: string;
  detailDE: string;
  /** Schematischer Anteil an der Gesamtdarstellung (ohne Zeitmaßstab) */
  weight: number;
}

/**
 * Die fünf Glieder der Kette. `weight` ist **kein Zeitwert**, sondern nur der
 * Anteil an der Bildbreite und an einem Durchlauf der Animation.
 */
export const CHAIN_STEPS: ChainStep[] = [
  {
    id: 'notruf',
    label: 'Notruf 112',
    actorDE: 'Anrufer',
    detailDE:
      'Der Anruf landet in der zuständigen Leitstelle. Advanced Mobile Location schickt seit ' +
      'Oktober 2019 die Position des Mobiltelefons automatisch mit.',
    weight: 1
  },
  {
    id: 'leitstelle',
    label: 'Leitstelle',
    actorDE: 'Disponent',
    detailDE:
      'Abfrage nach festem Schema, Einsatzstichwort setzen, Ausrückeordnung anwenden: Welche ' +
      'Einheiten, welche Fahrzeuge, welche Schleifen?',
    weight: 2
  },
  {
    id: 'alarmierung',
    label: 'Alarmierung',
    actorDE: 'Alarmierungsnetz',
    detailDE:
      'Aussendung des Alarmierungstelegramms — je nach Weg als Tonfolge, als Funkruf oder als ' +
      'Gruppenruf im Digitalfunk. Nur dieses Glied hat eine berechenbare Dauer.',
    weight: 1
  },
  {
    id: 'einsatzkraefte',
    label: 'Einsatzkräfte',
    actorDE: 'Melder und Wache',
    detailDE:
      'Der Melder gibt den Alarm aus, die Einsatzkräfte lesen Stichwort und Adresse und rücken ' +
      'aus. Die Zeit bis zum Ausrücken hängt von Tageszeit und Einheit ab.',
    weight: 2
  },
  {
    id: 'rueckmeldung',
    label: 'Rückmeldung',
    actorDE: 'an die Leitstelle',
    detailDE:
      'Statusmeldungen schließen den Kreis: analog über das Funkmeldesystem FMS, digital über ' +
      'den Statusdienst des Digitalfunks. Erst damit weiß die Leitstelle, dass der Auftrag läuft.',
    weight: 1
  }
];

/** Summe aller schematischen Anteile. */
export function totalWeight(steps: ChainStep[] = CHAIN_STEPS): number {
  return steps.reduce((sum, step) => sum + step.weight, 0);
}

/** Anteil 0 … 1, an dem ein Glied beginnt. */
export function stepStartFraction(index: number, steps: ChainStep[] = CHAIN_STEPS): number {
  const total = totalWeight(steps);
  const before = steps.slice(0, Math.max(0, index)).reduce((sum, step) => sum + step.weight, 0);
  return safeDivide(before, total, 0);
}

/** Anteil 0 … 1 der Breite eines Glieds. */
export function stepFraction(index: number, steps: ChainStep[] = CHAIN_STEPS): number {
  const step = steps[index];
  return step ? safeDivide(step.weight, totalWeight(steps), 0) : 0;
}

/**
 * Welches Glied ist bei einem Fortschritt 0 … 1 aktiv?
 * Werte außerhalb werden auf den gültigen Bereich gezogen.
 */
export function stepAtProgress(
  progress: number,
  steps: ChainStep[] = CHAIN_STEPS
): { index: number; localProgress: number } {
  if (!steps.length) return { index: 0, localProgress: 0 };
  const p = Math.min(0.999999, Math.max(0, progress));
  for (let index = 0; index < steps.length; index++) {
    const start = stepStartFraction(index, steps);
    const width = stepFraction(index, steps);
    if (p < start + width) {
      return { index, localProgress: width > 0 ? (p - start) / width : 0 };
    }
  }
  return { index: steps.length - 1, localProgress: 1 };
}
