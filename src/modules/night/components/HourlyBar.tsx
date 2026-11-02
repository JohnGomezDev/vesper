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
      className={`flex min-w-[9.5rem] flex-1 flex-col gap-3 rounded-md border p-3 ${
        isMargin ? 'border-border/70 bg-surface-muted/40 border-dashed' : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-foreground font-mono text-sm font-semibold">{hourLabel}</h3>
        {isMargin ? (
          <span className="border-border text-muted rounded border px-1.5 py-0.5 text-[10px] font-medium">
            Margen
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-muted text-[11px]">Nubosidad</span>
          <span className={`text-xs font-semibold ${CLOUD_CLASS_TEXT_CLASSES[cloudClass]}`}>
            {classLabel}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="bg-surface-muted h-2 w-full overflow-hidden rounded-full"
        >
          <div
            className={`h-full rounded-full ${CLOUD_CLASS_BACKGROUND_CLASSES[cloudClass]}`}
            style={{ width: `${Math.min(100, Math.max(0, cloud ?? 0))}%` }}
          />
        </div>
        <p className="text-foreground font-mono text-xs">
          {formatPercent(cloud, 1)} <span className="text-muted font-sans">ponderada</span>
        </p>
        <p className="text-muted text-[11px]">
          Baja {formatPercent(row.cloudCoverLow)} · Media {formatPercent(row.cloudCoverMid)} · Alta{' '}
          {formatPercent(row.cloudCoverHigh)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        <div>
          <dt className="text-muted">Visibilidad</dt>
          <dd className="text-foreground font-mono">{formatVisibility(row.visibility)}</dd>
        </div>
        <div>
          <dt className="text-muted">Humedad</dt>
          <dd className="text-foreground font-mono">{formatHumidity(row.relativeHumidity)}</dd>
        </div>
        <div>
          <dt className="text-muted">Temp/rocío</dt>
          <dd className="text-foreground font-mono">
            {formatDewPointSpread(row.temperature, row.dewPoint)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Viento</dt>
          <dd className="text-foreground font-mono">{formatWindSpeed(row.windSpeed)}</dd>
        </div>
        <div>
          <dt className="text-muted">Ráfagas</dt>
          <dd className="text-foreground font-mono">{formatWindSpeed(row.windGusts)}</dd>
        </div>
        <div>
          <dt className="text-muted">Lluvia</dt>
          <dd className="text-foreground font-mono">
            {formatPercent(row.precipitationProbability)} · {formatPrecipitation(row.precipitation)}
          </dd>
        </div>
      </dl>

      <span className="sr-only">Horas locales de la zona {timeZone}</span>
    </article>
  );
}
