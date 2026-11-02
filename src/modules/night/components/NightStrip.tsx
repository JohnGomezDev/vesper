import { MS_PER_HOUR } from '@/modules/night/constants/night.constants';
import { CloudLegend } from '@/modules/night/components/CloudLegend';
import { HourlyBar } from '@/modules/night/components/HourlyBar';
import type { TCloudClass, TNightWindow } from '@/modules/night/types/night.types';
import { formatLocalTime, parseLocalDateTime } from '@/modules/location/utils/datetime';
import type { IHourlyRow } from '@/modules/weather/types/weather.types';

interface INightStripProps {
  rows: IHourlyRow[];
  window: TNightWindow;
  timeZone: string;
  cloudByTime: ReadonlyMap<string, number | null>;
  classByTime: ReadonlyMap<string, TCloudClass | 'unknown'>;
  isArchived: boolean;
}

/**
 * Visible strip of the selected night (SPEC §8.2, §8.3): one hour before
 * sunset to one hour after sunrise. Rows outside sunset→sunrise are marked as
 * margin and never presented as part of the night.
 */
export function NightStrip({
  rows,
  window,
  timeZone,
  cloudByTime,
  classByTime,
  isArchived,
}: INightStripProps): React.JSX.Element {
  const hasWindow = window.kind === 'available';
  const nightStartMs = hasWindow ? window.startMs + MS_PER_HOUR : null;
  const nightEndMs = hasWindow ? window.endMs - MS_PER_HOUR : null;

  return (
    <section
      aria-labelledby="night-strip-title"
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 id="night-strip-title" className="text-base font-semibold">
            Tira horaria de la noche
          </h2>
          {hasWindow ? (
            <p className="text-muted text-xs">
              Puesta {formatLocalTime(window.startMs + MS_PER_HOUR, timeZone)} · Amanecer{' '}
              {formatLocalTime(window.endMs - MS_PER_HOUR, timeZone)} · horas locales
            </p>
          ) : null}
        </div>
        {isArchived ? (
          <p className="border-warning/40 bg-warning/10 text-warning rounded-md border px-2 py-1 text-xs font-semibold">
            Pronóstico archivado
          </p>
        ) : null}
      </div>

      <CloudLegend />

      {rows.length === 0 ? (
        <p className="text-muted text-sm">
          Sin horas disponibles en la tira visible de esta noche.
        </p>
      ) : (
        <div
          role="region"
          aria-label="Tira horaria desplazable"
          tabIndex={0}
          className="focus-visible:ring-primary focus-visible:ring-offset-background overflow-x-auto pb-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ul className="flex min-w-full gap-2">
            {rows.map((row) => {
              const instantMs = parseLocalDateTime(row.time, timeZone);
              const isMargin =
                nightStartMs !== null &&
                nightEndMs !== null &&
                (instantMs < nightStartMs || instantMs >= nightEndMs);

              return (
                <li key={row.time} className="flex">
                  <HourlyBar
                    row={row}
                    cloud={cloudByTime.get(row.time) ?? null}
                    cloudClass={classByTime.get(row.time) ?? 'unknown'}
                    timeZone={timeZone}
                    isMargin={isMargin}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
