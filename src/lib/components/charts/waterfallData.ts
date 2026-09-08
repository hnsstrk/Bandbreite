/**
 * Balkenberechnung für {@link LinkBudgetWaterfall}.
 *
 * Aus einer Streckenbilanz wird eine Folge von Stufen: Startpegel, Gewinne,
 * Verluste und das Ergebnis. Die Farben sind Serien-Tokens.
 */

import type { LinkBudgetData } from '$lib/components/calculators/linkBudget.svelte';
import { formatFixed } from '$lib/utils/formatting';

/** Art einer Stufe im Wasserfall. */
export type StepType = 'start' | 'gain' | 'loss' | 'total';

/** Eine Stufe des Wasserfalls. */
export interface WaterfallStep {
  label: string;
  shortLabel: string;
  /** Betrag der Stufe in dB bzw. dBm */
  value: number;
  type: StepType;
  /** Pegel vor der Stufe */
  barStart: number;
  /** Pegel nach der Stufe */
  barEnd: number;
}

/** Farbe je Stufenart — ausschließlich Tokens. */
export const STEP_COLORS: Record<StepType, string> = {
  start: 'var(--color-series-1)',
  gain: 'var(--color-series-2)',
  loss: 'var(--color-series-6)',
  total: 'var(--color-series-4)'
};

/** Farbe der Empfindlichkeitslinie. */
export const SENSITIVITY_COLOR = 'var(--color-series-3)';

/** Beiträge unter dieser Schwelle bekommen keinen eigenen Balken. */
const NEGLIGIBLE_DB = 0.1;

/** Anteil des Wertebereichs, der oben und unten frei bleibt. */
const Y_PADDING_FRACTION = 0.1;

/** Baut die Stufenfolge aus einer Streckenbilanz. */
export function buildWaterfallSteps(data: LinkBudgetData | null): WaterfallStep[] {
  if (!data) return [];

  const steps: WaterfallStep[] = [];
  let level = data.txPowerDbm;

  steps.push({
    label: 'Sendeleistung',
    shortLabel: 'TX',
    value: data.txPowerDbm,
    type: 'start',
    barStart: 0,
    barEnd: level
  });

  const push = (label: string, shortLabel: string, value: number, type: StepType) => {
    const barEnd = type === 'gain' ? level + value : level - value;
    steps.push({ label, shortLabel, value, type, barStart: level, barEnd });
    level = barEnd;
  };

  push('Antennengewinn Sender', '+G_TX', data.txAntennaGainDbi, 'gain');
  push('Kabelverlust Sender', '−L_TX', data.txCableLossDb, 'loss');
  push('Freiraumdämpfung', 'FSPL', data.fsplDb, 'loss');

  if (data.atmosphericLossDb > NEGLIGIBLE_DB) {
    push('Atmosphärische Dämpfung', 'Atm.', data.atmosphericLossDb, 'loss');
  }
  if (data.miscLossDb > NEGLIGIBLE_DB) {
    push('Sonstige Verluste', 'Sonst.', data.miscLossDb, 'loss');
  }

  push('Antennengewinn Empfänger', '+G_RX', data.rxAntennaGainDbi, 'gain');
  push('Kabelverlust Empfänger', '−L_RX', data.rxCableLossDb, 'loss');

  steps.push({
    label: 'Empfangsleistung',
    shortLabel: 'P_RX',
    value: data.receivedPowerDbm,
    type: 'total',
    barStart: 0,
    barEnd: data.receivedPowerDbm
  });

  return steps;
}

/** Wertebereich der Y-Achse inklusive Rand und Empfindlichkeitslinie. */
export function waterfallDomain(
  steps: WaterfallStep[],
  sensitivityDbm: number
): [number, number] {
  if (steps.length === 0) return [-150, 50];

  const values = steps.flatMap((step) => [step.barStart, step.barEnd]);
  values.push(sensitivityDbm);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * Y_PADDING_FRACTION;

  return [Math.floor(min - padding), Math.ceil(max + padding)];
}

/** Rund gewählte Achsenmarken über dem Wertebereich. */
export function waterfallTicks([min, max]: [number, number]): number[] {
  const step = Math.max(10, Math.ceil((max - min) / 10 / 10) * 10);
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) {
    ticks.push(value);
  }
  return ticks;
}

/** Vorzeichenbehaftete Beschriftung einer Stufe. */
export function stepLabel(step: WaterfallStep): string {
  if (step.type === 'start' || step.type === 'total') return formatFixed(step.value, 1);
  return `${step.type === 'gain' ? '+' : '−'}${formatFixed(step.value, 1)}`;
}
