import { SCORE_LABEL_TEXT } from '@/modules/night/constants/score.constants';
import type { INightSummary } from '@/modules/night/types/night.types';
import { formatNightDateLabel } from '@/modules/night/utils/format';
import { formatPercent } from '@/modules/weather/utils/format';

/** Accessible description of one night-selector option (SPEC §8.2, §8.6). */
export function describeNightOption(option: INightSummary): string {
  const dateLabel = formatNightDateLabel(option.date);
  const cloudLabel =
    option.cloudAverage === null
      ? 'nubosidad desconocida'
      : `nubosidad media ${formatPercent(option.cloudAverage)}`;

  if (option.score === null || option.label === null) {
    return `Noche del ${dateLabel}: sin noche astronómica, ${cloudLabel}`;
  }

  return `Noche del ${dateLabel}: ${SCORE_LABEL_TEXT[option.label]}, ${Math.round(option.score)} puntos, ${cloudLabel}${option.rainLikely ? ', lluvia probable' : ''}`;
}

/** Relative label of a selector position: today is index 3 (−3…+14, SPEC §8.2). */
export function formatNightOffset(index: number): string {
  const offset = index - 3;

  if (offset === 0) {
    return 'Hoy';
  }

  return offset < 0 ? `${offset}d` : `+${offset}d`;
}
