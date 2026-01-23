import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

/**
 * Convert frequency (Hz) to wavelength (m)
 * Formula: λ = c / f
 */
export function frequencyToWavelength(frequencyHz: number): number {
  if (frequencyHz <= 0) return 0;
  return speedOfLight.value / frequencyHz;
}

/**
 * Convert wavelength (m) to frequency (Hz)
 * Formula: f = c / λ
 */
export function wavelengthToFrequency(wavelengthM: number): number {
  if (wavelengthM <= 0) return 0;
  return speedOfLight.value / wavelengthM;
}

/**
 * Calculate the FSPL constant based on current speed of light setting.
 * FSPL constant: 20·log₁₀(4π/c)
 * This is the constant term in the FSPL formula when using Hz and meters
 */
function getFsplConstant(): number {
  return 20 * Math.log10((4 * Math.PI) / speedOfLight.value);
}

/**
 * Calculate Free Space Path Loss in dB
 * FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)
 * Simplified: FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) - 147.55
 *
 * @param distanceM - Distance in meters
 * @param frequencyHz - Frequency in Hz
 * @returns FSPL in dB
 */
export function calculateFSPL(distanceM: number, frequencyHz: number): number {
  if (distanceM <= 0 || frequencyHz <= 0) return 0;
  return 20 * Math.log10(distanceM) + 20 * Math.log10(frequencyHz) + getFsplConstant();
}

/**
 * Calculate theoretical free-space range given TX power and RX sensitivity
 * Rearranged FSPL formula: d = 10^((txPower - rxSensitivity - 20·log₁₀(f) + 147.55) / 20)
 *
 * @param frequencyHz - Frequency in Hz
 * @param txPowerDbm - Transmit power in dBm
 * @param rxSensitivityDbm - Receiver sensitivity in dBm (typically negative)
 * @returns Range in meters
 */
export function calculateRange(frequencyHz: number, txPowerDbm: number, rxSensitivityDbm: number): number {
  if (frequencyHz <= 0) return 0;
  // Maximum allowable path loss = TX power - RX sensitivity
  const maxPathLoss = txPowerDbm - rxSensitivityDbm;
  // Rearrange FSPL formula to solve for distance
  // FSPL = 20·log₁₀(d) + 20·log₁₀(f) + FSPL_CONSTANT
  // d = 10^((FSPL - 20·log₁₀(f) - FSPL_CONSTANT) / 20)
  const fsplConstant = getFsplConstant();
  const exponent = (maxPathLoss - 20 * Math.log10(frequencyHz) - fsplConstant) / 20;
  return Math.pow(10, exponent);
}
