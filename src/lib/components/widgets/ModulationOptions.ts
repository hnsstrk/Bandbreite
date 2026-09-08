/**
 * Bedienvorgaben des Modulations-Visualisierers: Auswahlliste der Verfahren
 * und die Grenzen der Schieberegler. Ausgelagert, damit die Komponente unter
 * der 300-Zeilen-Grenze bleibt und die Werte an einer Stelle stehen.
 */
import type { ModulationKind } from '$lib/utils/modulationMath';

export interface ModulationChoice {
  id: ModulationKind;
  label: string;
  /** Einzeiler, der das Verfahren erklärt */
  hint: string;
}

export const MODULATION_CHOICES: ModulationChoice[] = [
  { id: 'am', label: 'AM', hint: 'Die Amplitude des Trägers folgt der Nachricht.' },
  {
    id: 'fm',
    label: 'FM',
    hint: 'Die Augenblicksfrequenz folgt der Nachricht, die Amplitude bleibt konstant.'
  },
  {
    id: 'pm',
    label: 'PM',
    hint: 'Die Phasenlage folgt der Nachricht — nahe verwandt mit der Frequenzmodulation.'
  },
  { id: 'ask', label: 'ASK', hint: 'Der Träger wird im Takt der Bits ein- und ausgeschaltet.' },
  { id: 'fsk', label: 'FSK', hint: 'Null und Eins werden auf zwei Frequenzen abgebildet.' },
  { id: 'bpsk', label: 'BPSK', hint: 'Jeder Bitwechsel dreht die Phase um 180 Grad.' }
];

/** Untere Grenze der Nachrichtenfrequenz in Hertz. */
export const MESSAGE_MIN_HZ = 500;
/** Obere Grenze der Nachrichtenfrequenz in Hertz. */
export const MESSAGE_MAX_HZ = 15_000;
/** Kleinstes zulässiges Verhältnis Träger zu Nachricht. */
export const MIN_CARRIER_RATIO = 3;
/** Größtes darstellbares Verhältnis Träger zu Nachricht. */
export const MAX_CARRIER_RATIO = 24;
/** Höchster einstellbarer Modulationsgrad. */
export const DEPTH_MAX = 1.5;
/** Grenzen des Frequenzhubs in Hertz. */
export const DEVIATION_MIN_HZ = 500;
export const DEVIATION_MAX_HZ = 120_000;
/** Höchster Phasenhub im Bogenmaß. */
export const PHASE_MAX_RAD = 4;
/** Dargestellte Zeitspanne in Nachrichtenperioden. */
export const MESSAGE_PERIODS = 2.5;
/** Stützstellen je Trägerperiode. */
export const SAMPLES_PER_CARRIER_CYCLE = 24;
/** Grenzen der Stützstellenzahl. */
export const MIN_SAMPLES = 600;
export const MAX_SAMPLES = 3600;
/** Fensterverschiebung der Laufanimation in Nachrichtenperioden je Sekunde. */
export const SCROLL_PERIODS_PER_SECOND = 0.35;
