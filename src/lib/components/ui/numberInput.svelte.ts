/**
 * Logik hinter {@link NumberInput} und {@link Slider}.
 *
 * Hier liegt alles, was ohne DOM testbar ist: die Abbildung zwischen
 * Schiebereglerposition und physikalischem Wert (linear oder logarithmisch),
 * das Begrenzen auf den gültigen Bereich, die Einheitenumrechnung und
 * die Validierung.
 */

import { clamp, safeDivide, safeLog } from '../../utils/handlers';

/** Abbildungsart zwischen Reglerposition und Wert. */
export type ScaleMode = 'linear' | 'log';

/** Auflösung des Schiebereglers in Schritten. */
export const SLIDER_RESOLUTION = 1000;

/** Einheit für die Wertumrechnung: Basiswert = Anzeigewert × factor. */
export interface UnitOption {
	id: string;
	/** Sichtbares Symbol, z. B. „GHz" */
	symbol: string;
	/** Umrechnungsfaktor in die Basiseinheit */
	factor: number;
	/** Optionale Gruppe für das Auswahlfeld */
	group?: string;
}

/**
 * Prüft, ob eine logarithmische Abbildung überhaupt möglich ist.
 * Sie verlangt einen echt positiven, aufsteigenden Bereich.
 */
export function canUseLogScale(min: number, max: number): boolean {
	return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > min;
}

/**
 * Wandelt einen Wert in eine Reglerposition (0 … SLIDER_RESOLUTION).
 * Werte außerhalb des Bereichs werden auf die Enden begrenzt.
 */
export function valueToPosition(
	value: number,
	min: number,
	max: number,
	scale: ScaleMode = 'linear'
): number {
	if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
		return 0;
	}
	const bounded = clamp(value, min, max);
	const ratio =
		scale === 'log' && canUseLogScale(min, max)
			? safeDivide(safeLog(bounded) - safeLog(min), safeLog(max) - safeLog(min), 0)
			: safeDivide(bounded - min, max - min, 0);
	return Math.round(clamp(ratio, 0, 1) * SLIDER_RESOLUTION);
}

/**
 * Wandelt eine Reglerposition (0 … SLIDER_RESOLUTION) zurück in einen Wert.
 */
export function positionToValue(
	position: number,
	min: number,
	max: number,
	scale: ScaleMode = 'linear'
): number {
	if (!Number.isFinite(position) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
		return min;
	}
	const ratio = clamp(safeDivide(position, SLIDER_RESOLUTION, 0), 0, 1);
	if (scale === 'log' && canUseLogScale(min, max)) {
		const exponent = safeLog(min) + ratio * (safeLog(max) - safeLog(min));
		return 10 ** exponent;
	}
	return min + ratio * (max - min);
}

/**
 * Rundet einen Wert auf ein Vielfaches von `step`, ausgehend von `min`.
 * `step = 'any'` lässt den Wert unverändert.
 */
export function roundToStep(value: number, step: number | 'any', min = 0): number {
	if (step === 'any' || !Number.isFinite(value)) return value;
	if (!Number.isFinite(step) || step <= 0) return value;
	const base = Number.isFinite(min) ? min : 0;
	return base + Math.round(safeDivide(value - base, step, 0)) * step;
}

/**
 * Begrenzt einen Wert auf den optionalen Bereich [min, max].
 * Fehlende Grenzen bleiben offen.
 */
export function clampToRange(value: number, min?: number, max?: number): number {
	if (!Number.isFinite(value)) return Number.isFinite(min as number) ? (min as number) : 0;
	let result = value;
	if (Number.isFinite(min as number) && result < (min as number)) result = min as number;
	if (Number.isFinite(max as number) && result > (max as number)) result = max as number;
	return result;
}

/** Rechnet einen Anzeigewert in die Basiseinheit um. */
export function toBaseValue(displayValue: number, factor: number): number {
	if (!Number.isFinite(displayValue) || !Number.isFinite(factor)) return 0;
	return displayValue * factor;
}

/** Rechnet einen Basiswert in die gewählte Anzeigeeinheit um. */
export function fromBaseValue(baseValue: number, factor: number): number {
	return safeDivide(baseValue, factor, 0);
}

/** Ergebnis der Eingabeprüfung. */
export interface ValidationResult {
	valid: boolean;
	/** Deutschsprachige Fehlermeldung, sonst `null` */
	message: string | null;
}

/**
 * Prüft eine Zahleneingabe gegen Bereich und Endlichkeit.
 * Die Meldung ist bereits für die Anzeige formuliert.
 */
export function validateValue(
	value: number,
	options: { min?: number; max?: number; unitSymbol?: string } = {}
): ValidationResult {
	const { min, max, unitSymbol } = options;
	const suffix = unitSymbol ? ` ${unitSymbol}` : '';

	if (!Number.isFinite(value)) {
		return { valid: false, message: 'Bitte eine gültige Zahl eingeben.' };
	}
	if (Number.isFinite(min as number) && value < (min as number)) {
		return { valid: false, message: `Wert muss mindestens ${min}${suffix} betragen.` };
	}
	if (Number.isFinite(max as number) && value > (max as number)) {
		return { valid: false, message: `Wert darf höchstens ${max}${suffix} betragen.` };
	}
	return { valid: true, message: null };
}

/**
 * Formatiert einen Wert für das Zahlenfeld: ohne Exponentialschreibweise,
 * ohne überflüssige Nullen, mit höchstens `maxDecimals` Nachkommastellen.
 */
export function formatFieldValue(value: number, maxDecimals = 6): string {
	if (!Number.isFinite(value)) return '';
	if (value === 0) return '0';
	const magnitude = Math.abs(value);
	if (magnitude >= 1e15 || magnitude < 1e-9) {
		return value.toExponential(3);
	}
	const decimals = magnitude >= 100 ? 2 : magnitude >= 1 ? 3 : maxDecimals;
	return String(Number(value.toFixed(Math.min(decimals, maxDecimals))));
}

/**
 * Wählt die passendste Einheit für einen Basiswert: die größte Einheit,
 * bei der der Anzeigewert noch >= 1 bleibt.
 */
export function pickBestUnit(baseValue: number, units: UnitOption[]): UnitOption | undefined {
	if (units.length === 0) return undefined;
	const magnitude = Math.abs(baseValue);
	const sorted = [...units].sort((a, b) => b.factor - a.factor);
	if (magnitude === 0 || !Number.isFinite(magnitude)) {
		return sorted[sorted.length - 1];
	}
	return sorted.find((unit) => magnitude / unit.factor >= 1) ?? sorted[sorted.length - 1];
}
