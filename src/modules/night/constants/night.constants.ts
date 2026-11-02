/** Client clock sampling interval; also recalculates the night at midnight. */
export const NOW_TICK_MS = 15 * 60_000;

/**
 * Temporary default until T022 mounts `AltitudeThresholdProvider` in the root
 * layout (T022 owns that provider). Keeping it here avoids a second source of
 * truth and makes the dependency explicit.
 */
export const TEMPORARY_ALTITUDE_THRESHOLD = 15;

export const MS_PER_HOUR = 3_600_000;

/** Only hours with the Sun below −18° enter the score (SPEC §8.6). */
export const ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG = -18;
