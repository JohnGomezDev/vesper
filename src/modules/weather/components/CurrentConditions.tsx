import { DARKNESS_LEVEL_LABELS_ES } from '@/modules/night/constants/darkness.constants';
import { getDarknessLevel } from '@/modules/night/utils/darkness';
import { formatDegrees } from '@/modules/night/utils/format';
import type { ICurrentResponse } from '@/modules/weather/types/weather.types';
import {
  formatDataTime,
  formatHumidity,
  formatPercent,
  formatTemperature,
  formatWindSpeed,
} from '@/modules/weather/utils/format';
import { formatLocalTime } from '@/modules/location/utils/datetime';

interface ICurrentConditionsProps {
  current: ICurrentResponse;
  sunAltitudeDeg: number;
  fetchedAt: number;
  timeZone: string;
}

/**
 * «Ahora» block (SPEC §8.2): measurements, data time and two independent
 * indicators. `is_day` comes from Open-Meteo; darkness comes from the Sun
 * altitude computed locally.
 */
export function CurrentConditions({
  current,
  sunAltitudeDeg,
  fetchedAt,
  timeZone,
}: ICurrentConditionsProps): React.JSX.Element {
  const dayNightLabel =
    current.is_day === null ? 'Sin datos' : current.is_day === 1 ? 'Día' : 'Noche';
  const darknessLabel = DARKNESS_LEVEL_LABELS_ES[getDarknessLevel(sunAltitudeDeg)];
  const metrics = [
    { label: 'Temperatura', value: formatTemperature(current.temperature_2m) },
    { label: 'Humedad relativa', value: formatHumidity(current.relative_humidity_2m) },
    { label: 'Punto de rocío', value: formatTemperature(current.dew_point_2m) },
    { label: 'Nubosidad', value: formatPercent(current.cloud_cover) },
    { label: 'Viento sostenido', value: formatWindSpeed(current.wind_speed_10m) },
    { label: 'Ráfagas', value: formatWindSpeed(current.wind_gusts_10m) },
  ];
  const updatedAtLabel = `recibido a las ${formatLocalTime(fetchedAt, timeZone)}`;

  return (
    <section
      aria-labelledby="current-conditions-title"
      className="border-border bg-surface flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-wrap items-end justify-between gap-2 border-b pb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-primary font-mono text-[10px] font-semibold">*</span>
          <h2 id="current-conditions-title" className="text-foreground text-lg font-semibold">
            Ahora <span className="text-muted font-normal">· Condiciones actuales</span>
          </h2>
        </div>
        <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
          Datos de las {formatDataTime(current.time)} · {updatedAtLabel}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border-border bg-surface-raised flex flex-col gap-1 rounded-[4px] border p-3"
          >
            <dt className="text-muted flex items-center gap-1.5 font-mono text-[9px] font-medium tracking-[0.12em] uppercase">
              <span aria-hidden="true" className="bg-primary size-1" />
              {metric.label}
            </dt>
            <dd className="text-foreground font-mono text-xl font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-2 sm:grid-cols-2">
        <div
          role="group"
          aria-label="Indicador día o noche"
          className="border-border bg-surface-raised flex items-center justify-between gap-3 rounded-[4px] border px-3 py-2"
        >
          <span className="text-muted font-mono text-[9px] font-medium tracking-[0.12em] uppercase">
            Día o noche (Open-Meteo)
          </span>
          <span className="text-primary text-xs font-semibold">{dayNightLabel}</span>
        </div>
        <div
          role="group"
          aria-label="Indicador de oscuridad por altitud del Sol"
          className="border-border bg-surface-raised flex items-center justify-between gap-3 rounded-[4px] border px-3 py-2"
        >
          <span className="text-muted font-mono text-[9px] font-medium tracking-[0.12em] uppercase">
            Oscuridad · Sol a {formatDegrees(sunAltitudeDeg)}
          </span>
          <span className="text-primary text-xs font-semibold">{darknessLabel}</span>
        </div>
      </div>
    </section>
  );
}
