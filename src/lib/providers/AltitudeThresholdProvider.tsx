'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { IAltitudeThresholdContextValue } from '@/lib/types/altitude-threshold.types';
import { DEFAULT_ALTITUDE_THRESHOLD } from '@/modules/night/constants/altitude-threshold.constants';

const AltitudeThresholdContext = createContext<IAltitudeThresholdContextValue | null>(null);

interface IAltitudeThresholdProviderProps {
  children: ReactNode;
}

/**
 * Session state of the minimum-altitude threshold (SPEC §8.5.1). It lives in the
 * root layout so navigating between places keeps the chosen value; closing the
 * tab resets it to 15°. It is never written to `localStorage` or the URL.
 */
export function AltitudeThresholdProvider({
  children,
}: IAltitudeThresholdProviderProps): React.JSX.Element {
  const [value, setValue] = useState<number>(DEFAULT_ALTITUDE_THRESHOLD);
  const contextValue = useMemo<IAltitudeThresholdContextValue>(
    () => ({ value, setValue }),
    [value],
  );

  return (
    <AltitudeThresholdContext.Provider value={contextValue}>
      {children}
    </AltitudeThresholdContext.Provider>
  );
}

export function useAltitudeThreshold(): IAltitudeThresholdContextValue {
  const context = useContext(AltitudeThresholdContext);

  if (context === null) {
    throw new Error('useAltitudeThreshold must be used inside AltitudeThresholdProvider.');
  }

  return context;
}
