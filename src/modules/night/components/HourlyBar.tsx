import {
  CLOUD_CLASS_BACKGROUND_CLASSES,
  CLOUD_CLASS_LABELS_ES,
  CLOUD_CLASS_TEXT_CLASSES,
} from '@/modules/night/constants/cloud.constants';
import type { TCloudClass } from '@/modules/night/types/night.types';
import { formatHourLabel } from '@/modules/night/utils/format';
import type { IHourlyRow } from '@/modules/weather/types/weather.types';
import {
  formatDewPointSpread,
  formatHumidity,
  formatPercent,
  formatPrecipitation,
  formatVisibility,
  formatWindSpeed,
} from '@/modules/weather/utils/format';

interface IHourlyBarProps {
  row: IHourlyRow;
  cloud: number | null;
  cloudClass: TCloudClass | 'unknown';
  timeZone: string;
  isMargin: boolean;
}

/** One column of the night strip, with the weighted cloud bar and its layer breakdown. */
export function HourlyBar({
  row,
  cloud,
  cloudClass,
  timeZone,
  isMargin,
}: IHourlyBarProps): React.JSX.Element {
  const hourLabel = formatHourLabel(row.time);
  const classLabel = CLOUD_CLASS_LABELS_ES[cloudClass];
  const marginLabel = isMargin ? ' · hora de margen' : '';

  return (
    <article
      aria-label={`Hora ${hourLabel}${marginLabel}`}
      className={`flex w-[10.5rem] shrink-0 flex-col gap-3 rounded-[4px] border p-2.5 ${
        isMargin
          ? 'border-border-subtle bg-surface-muted/30 border-dashed'
          : 'border-border bg-surface-raised'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-foreground font-mono text-xs font-semibold tracking-wide">
          {hourLabel}
        </h3>
        {isMargin ? (
          <span className="border-primary/40 bg-primary/10 text-primary rounded-none border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase">
            Margen
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-muted font-mono text-[9px] font-medium tracking-[0.12em] uppercase">
            Nubosidad
          </span>
          <span
            className={`font-mono text-[10px] font-semibold tracking-[0.08em] uppercase ${CLOUD_CLASS_TEXT_CLASSES[cloudClass]}`}
          >
            {classLabel}
          </span>
        </div>
        <div aria-hidden="true" className="bg-surface-muted h-1.5 w-full overflow-hidden">
          <div
            className={`h-full ${CLOUD_CLASS_BACKGROUND_CLASSES[cloudClass]}`}
            style={{ width: `${Math.min(100, Math.max(0, cloud ?? 0))}%` }}
          />
        </div>
        <p className="text-foreground font-mono text-[11px]">
          {formatPercent(cloud, 1)} <span className="text-muted font-sans">ponderada</span>
        </p>
        <p className="text-muted font-mono text-[10px]">
          Baja {formatPercent(row.cloudCoverLow)} · Media {formatPercent(row.cloudCoverMid)} · Alta{' '}
          {formatPercent(row.cloudCoverHigh)}
        </p>
      </div>

      <dl className="flex flex-col text-[10px]">
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">
            Visibilidad
          </dt>
          <dd className="text-foreground font-mono">{formatVisibility(row.visibility)}</dd>
        </div>
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">Humedad</dt>
          <dd className="text-foreground font-mono">{formatHumidity(row.relativeHumidity)}</dd>
        </div>
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">
            Temp/rocío
          </dt>
          <dd className="text-foreground font-mono">
            {formatDewPointSpread(row.temperature, row.dewPoint)}
          </dd>
        </div>
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">Viento</dt>
          <dd className="text-foreground font-mono">{formatWindSpeed(row.windSpeed)}</dd>
        </div>
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">Ráfagas</dt>
          <dd className="text-foreground font-mono">{formatWindSpeed(row.windGusts)}</dd>
        </div>
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t py-1">
          <dt className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">Lluvia</dt>
          <dd className="text-foreground font-mono">
            {formatPercent(row.precipitationProbability)} · {formatPrecipitation(row.precipitation)}
          </dd>
        </div>
      </dl>

      <span className="sr-only">Horas locales de la zona {timeZone}</span>
    </article>
  );
}
