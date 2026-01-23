import {
  SPEED_OF_LIGHT_EXACT,
  SPEED_OF_LIGHT_ROUNDED,
  SPEED_OF_LIGHT_EXACT_DISPLAY,
  SPEED_OF_LIGHT_ROUNDED_DISPLAY
} from '$lib/utils/constants';

export type SpeedOfLightMode = 'exact' | 'rounded';

/**
 * Global store for speed of light configuration.
 * Allows switching between exact (299.792.458 m/s) and rounded (300.000.000 m/s) values.
 */
function createSpeedOfLightStore() {
  let mode = $state<SpeedOfLightMode>('exact');

  return {
    /** Current mode: 'exact' or 'rounded' */
    get mode() {
      return mode;
    },

    /** Current speed of light value in m/s */
    get value() {
      return mode === 'exact' ? SPEED_OF_LIGHT_EXACT : SPEED_OF_LIGHT_ROUNDED;
    },

    /** Display string for current value (German format) */
    get display() {
      return mode === 'exact' ? SPEED_OF_LIGHT_EXACT_DISPLAY : SPEED_OF_LIGHT_ROUNDED_DISPLAY;
    },

    /** Whether exact mode is active */
    get isExact() {
      return mode === 'exact';
    },

    /** Set to exact mode */
    setExact() {
      mode = 'exact';
    },

    /** Set to rounded mode */
    setRounded() {
      mode = 'rounded';
    },

    /** Toggle between exact and rounded mode */
    toggle() {
      mode = mode === 'exact' ? 'rounded' : 'exact';
    },

    /** Set mode directly */
    setMode(newMode: SpeedOfLightMode) {
      mode = newMode;
    }
  };
}

export const speedOfLight = createSpeedOfLightStore();
