import { getCuratedCity } from '@/modules/location/constants/curated-cities';
import type { ICoordinates, IUseLocationNameInput } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { recallLocationName } from '@/modules/location/utils/name-cache';

const HYPHENS_PATTERN = /-/g;

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 * Turns the slug label back into something readable without inventing data.
 * The label is already lowercase and hyphenated (`villa-de-leyva`).
 */
function formatSlugLabel(label: string): string {
  return capitalize(label.replace(HYPHENS_PATTERN, ' '));
}

function formatApproximateName(coordinates: ICoordinates): string {
  const rounded = roundCoordinates(coordinates);

  return `Ubicación aproximada (${rounded.latitude.toFixed(2)}, ${rounded.longitude.toFixed(2)})`;
}

export function resolveLocationName({ slug, result }: IUseLocationNameInput): string {
  if (result.kind === 'curated') {
    const city = getCuratedCity(result.slug);

    return city === null ? capitalize(slug) : city.name;
  }

  if (result.kind === 'coordinates') {
    const rememberedName = recallLocationName(result.coordinates);

    if (rememberedName !== null) {
      return rememberedName;
    }

    if (result.label !== null) {
      return formatSlugLabel(result.label);
    }

    return formatApproximateName(result.coordinates);
  }

  return capitalize(slug);
}
