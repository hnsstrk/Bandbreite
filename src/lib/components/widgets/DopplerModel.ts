/**
 * Logik des Doppler-Widgets (W2): Frequenzverschiebung f_d = 2·v·f/c,
 * Vorzeichen-Deutung und ein übertriebener Stauchungsfaktor für die Skizze.
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { calculateDopplerShift } from '$lib/utils/radar';
import { frequencyToWavelength } from '$lib/utils/calculations';
import { safeDivide } from '$lib/utils/handlers';

/** Reglerbereich der Radialgeschwindigkeit in m/s */
export const DOPPLER_VELOCITY_LIMITS = { min: -300, max: 300, default: 30 } as const;

/** Auswahl typischer Trägerfrequenzen */
export const DOPPLER_CARRIERS = [
  { id: 's', label: 'S-Band 3 GHz (Flugsicherung)', frequencyHz: 3e9 },
  { id: 'x', label: 'X-Band 10 GHz (Schiffsradar)', frequencyHz: 10e9 },
  { id: 'k', label: 'K-Band 24,125 GHz (Verkehrsradar)', frequencyHz: 24.125e9 },
  { id: 'ka', label: 'Ka-Band 34,3 GHz (Verkehrsradar)', frequencyHz: 34.3e9 },
  { id: 'w', label: 'W-Band 77 GHz (Automotive)', frequencyHz: 77e9 }
] as const;

export const DEFAULT_DOPPLER_CARRIER_ID = 'x';

/** Wie stark die Skizze die Stauchung übertreibt (0 … 1 bei v = v_max) */
export const DOPPLER_VISUAL_STRENGTH = 0.45;

export type DopplerDirection = 'naehert' | 'entfernt' | 'ruht';

export interface DopplerResult {
  dopplerHz: number;
  wavelengthM: number;
  direction: DopplerDirection;
  /** Empfangene Frequenz f + f_d in Hz */
  receivedHz: number;
}

export function computeDoppler(
  radialVelocityMs: number,
  carrierHz: number,
  c: number = speedOfLight.value
): DopplerResult {
  const dopplerHz = calculateDopplerShift(radialVelocityMs, carrierHz, c);
  let direction: DopplerDirection = 'ruht';
  if (radialVelocityMs > 0) direction = 'naehert';
  else if (radialVelocityMs < 0) direction = 'entfernt';
  return {
    dopplerHz,
    wavelengthM: frequencyToWavelength(carrierHz, c),
    direction,
    receivedHz: carrierHz + dopplerHz
  };
}

/**
 * Übertriebener Faktor für den Abstand der gezeichneten Wellenfronten:
 * 1 bei Stillstand, < 1 bei Annäherung (gestaucht), > 1 beim Entfernen (gedehnt).
 */
export function visualWavelengthFactor(
  radialVelocityMs: number,
  maxVelocityMs: number = DOPPLER_VELOCITY_LIMITS.max,
  strength: number = DOPPLER_VISUAL_STRENGTH
): number {
  const normalized = Math.max(-1, Math.min(1, safeDivide(radialVelocityMs, maxVelocityMs, 0)));
  return 1 - strength * normalized;
}

/** Geschwindigkeit in km/h für die Anzeige */
export function msToKmh(velocityMs: number): number {
  return velocityMs * 3.6;
}
