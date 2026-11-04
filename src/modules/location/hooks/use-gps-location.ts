'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';
import {
  GPS_ERROR_MESSAGES,
  GPS_NAME,
  GPS_TIMEOUT_MS,
  GPS_UNKNOWN_ERROR_MESSAGE,
} from '@/modules/location/constants/location.constants';
import type { IUseGpsLocationResult } from '@/modules/location/types/location.types';
import { buildCoordinatesSlug } from '@/modules/location/utils/slug';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { rememberLocationName } from '@/modules/location/utils/name-cache';

/**
 * Explicit-GPS flow (SPEC §8.1): permission is requested only when
 * `requestLocation` runs, never on load. On success it rounds the coordinates,
 * remembers the interface name and navigates to the coordinate slug.
 */
export function useGpsLocation(): IUseGpsLocationResult {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (typeof navigator === 'undefined' || navigator.geolocation === undefined) {
      setError(GPS_UNKNOWN_ERROR_MESSAGE);

      return;
    }

    setIsRequesting(true);
    setError(null);

    await new Promise<void>((resolve) => {
      const finishWithError = (message: string): void => {
        setError(message);
        setIsRequesting(false);
        resolve();
      };

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coordinates = roundCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });

            rememberLocationName(coordinates, GPS_NAME);
            setIsRequesting(false);
            router.push(ROUTES.clima.detail(buildCoordinatesSlug(null, coordinates)));
            resolve();
          },
          (geolocationError) => {
            finishWithError(GPS_ERROR_MESSAGES[geolocationError.code] ?? GPS_UNKNOWN_ERROR_MESSAGE);
          },
          { timeout: GPS_TIMEOUT_MS },
        );
      } catch {
        finishWithError(GPS_UNKNOWN_ERROR_MESSAGE);
      }
    });
  }, [router]);

  return { requestLocation, isRequesting, error };
}
