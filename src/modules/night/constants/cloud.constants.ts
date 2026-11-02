import type { TCloudClass } from '@/modules/night/types/night.types';

/** Spanish label for every cloud class; `unknown` keeps missing data explicit. */
export const CLOUD_CLASS_LABELS_ES: Record<TCloudClass | 'unknown', string> = {
  ideal: 'Ideal',
  good: 'Buena',
  acceptable: 'Aceptable',
  fair: 'Regular',
  poor: 'No óptima',
  unknown: 'Sin datos',
};

/** Background token of each cloud class (never the only signal: the label is shown too). */
export const CLOUD_CLASS_BACKGROUND_CLASSES: Record<TCloudClass | 'unknown', string> = {
  ideal: 'bg-cloud-ideal',
  good: 'bg-cloud-good',
  acceptable: 'bg-cloud-acceptable',
  fair: 'bg-cloud-fair',
  poor: 'bg-cloud-poor',
  unknown: 'bg-cloud-unknown',
};

/** Text token of each cloud class. */
export const CLOUD_CLASS_TEXT_CLASSES: Record<TCloudClass | 'unknown', string> = {
  ideal: 'text-cloud-ideal',
  good: 'text-cloud-good',
  acceptable: 'text-cloud-acceptable',
  fair: 'text-cloud-fair',
  poor: 'text-cloud-poor',
  unknown: 'text-cloud-unknown',
};

/** Order used by the legend and by window summaries, from best to worst. */
export const CLOUD_CLASS_ORDER: readonly (TCloudClass | 'unknown')[] = [
  'ideal',
  'good',
  'acceptable',
  'fair',
  'poor',
  'unknown',
];
