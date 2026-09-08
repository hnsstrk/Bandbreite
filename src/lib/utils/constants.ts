/**
 * Lichtgeschwindigkeit für den umschaltbaren c-Store ($lib/stores/speedOfLight.svelte.ts).
 *
 * Einzige Quelle des exakten Werts ist `SPEED_OF_LIGHT` in `$lib/data/constants.ts`
 * (CODATA 2018). Diese Datei ergänzt nur den gerundeten Lehrbuchwert und die
 * Anzeigestrings – keine weiteren Kopien der Konstante anlegen.
 */
import { SPEED_OF_LIGHT } from '$lib/data/constants';

/** Lichtgeschwindigkeit im Vakuum – exakter Wert (m/s) */
export const SPEED_OF_LIGHT_EXACT: number = SPEED_OF_LIGHT;

/** Lichtgeschwindigkeit – gerundeter Wert 3·10⁸ m/s (didaktisch) */
export const SPEED_OF_LIGHT_ROUNDED = 300_000_000;

/** Anzeigestring – exakter Wert (deutsches Zahlenformat) */
export const SPEED_OF_LIGHT_EXACT_DISPLAY = '299.792.458';

/** Anzeigestring – gerundeter Wert (deutsches Zahlenformat) */
export const SPEED_OF_LIGHT_ROUNDED_DISPLAY = '300.000.000';
