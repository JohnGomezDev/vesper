'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';

/**
 * Night selector navigation (SPEC §8.2): the selected date lives only in the
 * `date` query parameter and never reloads the page or adds a history entry.
 */
export function useNightNavigation(slug: string): (nextNightDate: string) => void {
  const router = useRouter();

  return useCallback(
    (nextNightDate: string): void => {
      router.replace(`${ROUTES.clima.detail(slug)}?date=${nextNightDate}`, { scroll: false });
    },
    [router, slug],
  );
}
