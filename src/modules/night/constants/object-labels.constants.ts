import type { TBrightnessLabel, TWindowObjectId } from '@/modules/night/types/night.types';

/** Spanish display names for every observation target; the Sun is intentionally absent. */
export const OBJECT_LABELS_ES: Record<TWindowObjectId, string> = {
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
};

/** Spanish label of the visibility requirement (SPEC §8.5.3). */
export const BRIGHTNESS_LABELS_ES: Record<TBrightnessLabel, string> = {
  'naked-eye': 'A simple vista',
  binoculars: 'Con binoculares',
  telescope: 'Requiere óptica',
};
