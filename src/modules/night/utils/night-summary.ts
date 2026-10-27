import { RAIN_LIKELY_THRESHOLD_PCT } from '@/modules/night/constants/score.constants';
import type { IHourlyScore, INightSummary } from '@/modules/night/types/night.types';
import { computeCloudCover } from '@/modules/night/utils/cloud';
import { computeHourlyScore, computeNightScore } from '@/modules/night/utils/score';
import { parseLocalDateTime } from '@/modules/location/utils/datetime';
import type { IHourlyRow } from '@/modules/weather/types/weather.types';

/** Only hours with the Sun below −18° enter the score (SPEC §8.6). */
const ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG = -18;

/**
 * Summary of one night for the selector (SPEC §8.2, §8.6).
 *
 * `sunAltitudes` is keyed by the instant of each hourly row, which is how the
 * caller supplies the Sun altitude of the same hours. A row without an entry is
 * unknown and stays out of the valid hours. Without any valid hour the summary
 * has no score and does not flag rain.
 */
export function getNightSummary(input: {
  date: string;
  hourly: IHourlyRow[];
  timeZone: string;
  sunAltitudes: Map<number, number>;
  moonAboveHorizonByInstant: (instantMs: number) => boolean;
  moonIlluminationPct: number;
}): INightSummary {
  const { date, hourly, timeZone, sunAltitudes, moonAboveHorizonByInstant, moonIlluminationPct } =
    input;

  const rows = hourly.map((row) => ({
    row,
    instantMs: parseLocalDateTime(row.time, timeZone),
  }));

  const validRows = rows.filter(({ instantMs }) => {
    const sunAltitudeDeg = sunAltitudes.get(instantMs);

    return sunAltitudeDeg !== undefined && sunAltitudeDeg < ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG;
  });

  if (validRows.length === 0) {
    return {
      date,
      score: null,
      label: null,
      cloudAverage: null,
      rainLikely: false,
    };
  }

  const hourlyScores: IHourlyScore[] = [];
  const cloudValues: number[] = [];
  let maxPrecipitationProbability: number | null = null;

  for (const { row, instantMs } of validRows) {
    const cloud = computeCloudCover(row.cloudCoverLow, row.cloudCoverMid, row.cloudCoverHigh);

    if (cloud !== null) {
      cloudValues.push(cloud);
    }

    if (
      row.precipitationProbability !== null &&
      (maxPrecipitationProbability === null ||
        row.precipitationProbability > maxPrecipitationProbability)
    ) {
      maxPrecipitationProbability = row.precipitationProbability;
    }

    hourlyScores.push({
      instantMs,
      score: computeHourlyScore({
        cloud,
        windKmh: row.windSpeed,
        humidityPct: row.relativeHumidity,
        precipitationProbabilityPct: row.precipitationProbability,
      }),
    });
  }

  const cloudAverage =
    cloudValues.length === 0
      ? null
      : cloudValues.reduce((total, value) => total + value, 0) / cloudValues.length;

  const rainLikely =
    maxPrecipitationProbability !== null &&
    maxPrecipitationProbability >= RAIN_LIKELY_THRESHOLD_PCT;

  const { score, label } = computeNightScore({
    hourlyScores,
    moonIlluminationPct,
    moonAboveHorizonByInstant,
    validInstantMs: validRows.map(({ instantMs }) => instantMs),
  });

  return {
    date,
    score,
    label,
    cloudAverage,
    rainLikely,
  };
}
