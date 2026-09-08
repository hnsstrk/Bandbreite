/**
 * Berechnete Zahlenwerte des Kapitels „Elektromagnetische Wellen".
 *
 * Hier steht keine getippte Zahl: λ und T kommen aus `utils/calculations`,
 * Feldgrößen und Photonenenergie aus `widgets/EmWaveModel`, die Konstanten
 * aus `data/constants`. Der Kapiteltext (`em-wellen.ts`) liest nur noch
 * fertige Zeichenketten.
 */
import { frequencyToWavelength } from '$lib/utils/calculations';
import { FREE_SPACE_IMPEDANCE, IONIZING_BOUNDARY_WAVELENGTH } from '$lib/data/constants';
import { fieldStrengthFromDensity } from '$lib/utils/fieldStrength';
import {
  CIRCULAR_TO_LINEAR_LOSS_DB,
  CROSS_POLARIZATION_LOSS_DB,
  IONIZING_BOUNDARY_FREQUENCY,
  fraunhoferDistanceM,
  periodS,
  photonEnergyEv,
  polarizationLossDb,
  reactiveNearFieldM,
  tiltLossDb
} from '$lib/components/widgets/EmWaveModel';
import {
  formatDistance,
  formatFrequency,
  formatNumber,
  formatWavelength
} from '$lib/utils/formatting';

/** Beispielfrequenzen — die Zahlenwerte im Text folgen daraus. */
export const EXAMPLES_HZ = [153e3, 100e6, 900e6, 2.4e9, 10e9, 5e14];
export const REFERENCE_HZ = 100e6;
export const DISH_DIAMETER_M = 1.2;
export const DISH_FREQUENCY_HZ = 10e9;
export const DENSITY_EXAMPLE_W = 1;

export const seconds = (value: number) =>
  value >= 1e-3
    ? `${formatNumber(value * 1e3, 2)} ms`
    : value >= 1e-6
      ? `${formatNumber(value * 1e6, 2)} µs`
      : value >= 1e-9
        ? `${formatNumber(value * 1e9, 2)} ns`
        : value >= 1e-12
          ? `${formatNumber(value * 1e12, 2)} ps`
          : `${formatNumber(value * 1e15, 2)} fs`;

export const ev = (value: number) =>
  value >= 0.001 ? `${formatNumber(value, 3)} eV` : `${value.toExponential(2)} eV`;

export const exampleRows = EXAMPLES_HZ.map((hz) => [
  formatFrequency(hz, hz >= 1e6 ? 1 : 0),
  formatWavelength(frequencyToWavelength(hz), 3),
  seconds(periodS(hz)),
  ev(photonEnergyEv(hz))
]);

export const lambdaReference = formatWavelength(frequencyToWavelength(REFERENCE_HZ), 0);
export const periodReference = seconds(periodS(REFERENCE_HZ));
export const nearFieldReference = formatDistance(
  reactiveNearFieldM(frequencyToWavelength(REFERENCE_HZ)),
  2
);
export const dishFarField = formatDistance(
  fraunhoferDistanceM(DISH_DIAMETER_M, frequencyToWavelength(DISH_FREQUENCY_HZ)),
  0
);
export const impedance = formatNumber(FREE_SPACE_IMPEDANCE, 2);
export const densityField = formatNumber(fieldStrengthFromDensity(DENSITY_EXAMPLE_W), 2);
export const circularLoss = formatNumber(CIRCULAR_TO_LINEAR_LOSS_DB, 2);
export const tilt45 = formatNumber(tiltLossDb(45), 1);
export const ionizingFrequency = formatFrequency(IONIZING_BOUNDARY_FREQUENCY, 2);
export const ionizingWavelength = formatWavelength(IONIZING_BOUNDARY_WAVELENGTH, 0);
export const ionizingEnergy = ev(photonEnergyEv(IONIZING_BOUNDARY_FREQUENCY));
export const crossPolLoss = formatNumber(CROSS_POLARIZATION_LOSS_DB, 0);
export const linearToCircular = formatNumber(polarizationLossDb('linear-v', 'rhcp'), 2);
