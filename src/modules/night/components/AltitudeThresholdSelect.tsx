import type { ChangeEvent } from 'react';
import { ALTITUDE_THRESHOLD_VALUES } from '@/modules/night/constants/altitude-threshold.constants';

interface IAltitudeThresholdSelectProps {
  value: number;
  onChange: (value: number) => void;
}

/** Session-only minimum-altitude selector (SPEC §8.5.1). */
export function AltitudeThresholdSelect({
  value,
  onChange,
}: IAltitudeThresholdSelectProps): React.JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="altitude-threshold" className="text-muted text-xs font-medium">
        Altitud mínima de observación
      </label>
      <select
        id="altitude-threshold"
        value={value}
        onChange={handleChange}
        className="border-border bg-surface text-foreground focus-visible:border-primary focus-visible:ring-primary/40 min-h-11 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {ALTITUDE_THRESHOLD_VALUES.map((threshold) => (
          <option key={threshold} value={threshold}>
            {threshold}°
          </option>
        ))}
      </select>
      <span className="text-muted text-[11px]">Se recalcula en local, sin nuevas peticiones.</span>
    </div>
  );
}
