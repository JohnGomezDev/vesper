import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
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
      className="border-border bg-surface flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-wrap items-start justify-between gap-2 border-b pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Tira horaria detallada
          </p>
          <h2 id="night-strip-title" className="text-foreground text-base font-semibold">
            Nubosidad, viento y lluvia hora a hora
          </h2>
          {hasWindow ? (
            <p className="text-muted font-mono text-[11px]">
              Puesta {formatLocalTime(window.startMs + MS_PER_HOUR, timeZone)} · Amanecer{' '}
              {formatLocalTime(window.endMs - MS_PER_HOUR, timeZone)} · horas locales
            </p>
          ) : null}
        </div>
        {isArchived ? (
          <p className="border-warning/50 bg-warning/10 text-warning rounded-none border px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase">
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
        <HorizontalScroller ariaLabel="Tira horaria" trackClassName="pb-1">
          <ul className="flex w-max min-w-full gap-2">
            {rows.map((row) => {
              const instantMs = parseLocalDateTime(row.time, timeZone);
              const isMargin =
                nightStartMs !== null &&
                nightEndMs !== null &&
                (instantMs < nightStartMs || instantMs >= nightEndMs);

              return (
                <li key={row.time} className="flex shrink-0">
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
        </HorizontalScroller>
      )}
    </section>
  );
}
