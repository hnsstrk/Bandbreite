/**
 * Auswahl und Reglergrenzen des Polardiagramm-Widgets.
 *
 * Die Gewinnbereiche stammen aus `ANTENNA_TYPES`, damit Datenbank und
 * Widget nicht auseinanderlaufen.
 */
import { ANTENNA_TYPES, GAIN_DIPOLE_DBI } from '$lib/data/antennas';
import type { PatternType } from '$lib/utils/antennaMath';

export interface PatternChoice {
	id: PatternType;
	label: string;
	/** Erläuterung unter der Auswahlleiste */
	hint: string;
	/** Fester Gewinn in dBi, falls das Muster analytisch bestimmt ist */
	fixedGainDbi?: number;
	/** Einstellbarer Gewinnbereich in dBi für keulenförmige Muster */
	gainMinDbi?: number;
	gainMaxDbi?: number;
	/** Vor-Rück-Verhältnis in dB */
	frontToBackDb?: number;
}

function gainRange(id: string): { min: number; max: number } {
	const entry = ANTENNA_TYPES.find((type) => type.id === id);
	return { min: entry?.gainMinDbi ?? 0, max: entry?.gainMaxDbi ?? 20 };
}

const YAGI = gainRange('yagi');
const PARABOL = gainRange('parabol');

/** Gewinn eines Kurzdipols (Hertzscher Dipol) in dBi. */
export const SHORT_DIPOLE_GAIN_DBI = 1.76;

/** Für die Darstellung sinnvolle Obergrenze des Parabolgewinns. */
export const PARABOLIC_DISPLAY_MAX_DBI = 50;

/** Übliches Vor-Rück-Verhältnis einer Yagi in dB. */
export const YAGI_FRONT_TO_BACK_DB = 20;

/** Übliches Vor-Rück-Verhältnis einer Parabolantenne in dB. */
export const PARABOLIC_FRONT_TO_BACK_DB = 35;

export const PATTERN_CHOICES: PatternChoice[] = [
	{
		id: 'isotrop',
		label: 'Isotrop',
		hint: 'Gedachter Kugelstrahler: in jede Richtung gleich stark — die Bezugsgröße für dBi.',
		fixedGainDbi: 0
	},
	{
		id: 'kurzdipol',
		label: 'Kurzdipol',
		hint: 'Sehr kurzer Strahler: F(θ) = sin θ, ein weicher Achter mit Nullstellen längs der Drahtachse.',
		fixedGainDbi: SHORT_DIPOLE_GAIN_DBI
	},
	{
		id: 'dipol',
		label: 'Halbwellendipol',
		hint: 'F(θ) = cos(π/2 · cos θ) / sin θ — der schlankere Achter, Bezugsgröße für dBd.',
		fixedGainDbi: GAIN_DIPOLE_DBI
	},
	{
		id: 'yagi',
		label: 'Yagi',
		hint: 'Ausgeprägte Hauptkeule mit Rückkeule; Halbwertsbreite folgt aus dem gewählten Gewinn.',
		gainMinDbi: YAGI.min,
		gainMaxDbi: YAGI.max,
		frontToBackDb: YAGI_FRONT_TO_BACK_DB
	},
	{
		id: 'parabol',
		label: 'Parabol',
		hint: 'Sehr schmale Keule; der Gewinn wächst mit Durchmesser und Frequenz.',
		gainMinDbi: PARABOL.min,
		gainMaxDbi: PARABOLIC_DISPLAY_MAX_DBI,
		frontToBackDb: PARABOLIC_FRONT_TO_BACK_DB
	},
	{
		id: 'array',
		label: 'Lineare Gruppe',
		hint: 'N Einzelstrahler auf einer Achse; der Phasenschub schwenkt die Keule elektronisch.'
	}
];

/** Reglergrenzen der linearen Gruppe. */
export const ARRAY_MIN_ELEMENTS = 2;
export const ARRAY_MAX_ELEMENTS = 16;
export const ARRAY_MIN_SPACING = 0.25;
export const ARRAY_MAX_SPACING = 1.5;
export const ARRAY_MIN_STEER_DEG = 0;
export const ARRAY_MAX_STEER_DEG = 180;

/** Schrittweite der Musterabtastung in Grad. */
export const PATTERN_STEP_DEG = 0.5;
