/** Speed of light in vacuum - exact value (m/s) */
export const SPEED_OF_LIGHT_EXACT = 299_792_458;

/** Speed of light - rounded value (m/s) */
export const SPEED_OF_LIGHT_ROUNDED = 300_000_000;

/** Speed of light display string - exact value */
export const SPEED_OF_LIGHT_EXACT_DISPLAY = '299.792.458';

/** Speed of light display string - rounded value */
export const SPEED_OF_LIGHT_ROUNDED_DISPLAY = '300.000.000';

/**
 * @deprecated Use speedOfLightStore instead for dynamic value
 * Legacy constant for backwards compatibility
 */
export const SPEED_OF_LIGHT = SPEED_OF_LIGHT_EXACT;

/**
 * @deprecated Use speedOfLightStore.display instead
 * Legacy display constant for backwards compatibility
 */
export const SPEED_OF_LIGHT_DISPLAY = SPEED_OF_LIGHT_EXACT_DISPLAY;
