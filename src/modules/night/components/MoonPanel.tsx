import type { IMoonInfo } from '@/modules/astronomy/types/astronomy.types';
import { formatLocalTime } from '@/modules/location/utils/datetime';
import { MOON_PHASE_LABELS_ES } from '@/modules/night/constants/moon-phase.constants';
import type { TMoonIconKey, TMoonPhase } from '@/modules/night/types/night.types';
import { formatDegrees } from '@/modules/night/utils/format';
import { getMoonIconPath } from '@/modules/night/utils/moon-icon';
import { formatPercent } from '@/modules/weather/utils/format';

interface IMoonPanelProps {
  moon: IMoonInfo | null;
  phase: TMoonPhase;
  iconKey: TMoonIconKey;
  illuminationPct: number;
  timeZone: string;
  nightStartMs: number | null;
  nightEndMs: number | null;
  peakAltitudeDeg: number | null;
  peakMs: number | null;
}

/** Moon panel of the selected night (SPEC §8.2, §8.4). */
export function MoonPanel({
  moon,
  phase,
  iconKey,
  illuminationPct,
  timeZone,
  nightStartMs,
  nightEndMs,
  peakAltitudeDeg,
  peakMs,
}: IMoonPanelProps): React.JSX.Element {
  const phaseLabel = MOON_PHASE_LABELS_ES[phase];

  if (moon === null) {
    return (
      <section
        aria-labelledby="moon-panel-title"
        className="border-border bg-surface-raised rounded-[4px] border p-4"
      >
        <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
          Información lunar
        </p>
        <h2 id="moon-panel-title" className="text-foreground mt-1 text-sm font-semibold">
          Luna
        </h2>
        <p className="text-muted mt-2 text-sm">Sin datos de Luna.</p>
      </section>
    );
  }

  const iconPath = getMoonIconPath(iconKey, illuminationPct);
  const riseLabel =
    moon.riseMs === null ? 'No ocurre este día' : formatLocalTime(moon.riseMs, timeZone);
  const setLabel =
    moon.setMs === null ? 'No ocurre este día' : formatLocalTime(moon.setMs, timeZone);
  const peakLabel =
    peakMs === null
      ? formatDegrees(peakAltitudeDeg)
      : `${formatDegrees(peakAltitudeDeg)} a las ${formatLocalTime(peakMs, timeZone)}`;
  const hasNightWindow = nightStartMs !== null && nightEndMs !== null;

  return (
    <section
      aria-labelledby="moon-panel-title"
      className="border-border bg-surface-raised flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-wrap items-start justify-between gap-2 border-b pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Información lunar
          </p>
          <h2 id="moon-panel-title" className="text-foreground text-base font-semibold">
            Luna de esta noche
          </h2>
        </div>
        <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
          {hasNightWindow
            ? `Noche de ${formatLocalTime(nightStartMs, timeZone)} a ${formatLocalTime(nightEndMs, timeZone)}`
            : 'Sin noche astronómica este día'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label={`Icono de ${phaseLabel}`}
          className="size-16 shrink-0"
        >
          <circle cx="32" cy="32" r="28" className="fill-surface stroke-border" strokeWidth="1" />
          {iconPath === '' ? null : <path d={iconPath} className="fill-moon" />}
        </svg>
        <div className="min-w-0">
          <p className="text-foreground text-base font-semibold">{phaseLabel}</p>
          <p className="text-primary font-mono text-xs">
            {formatPercent(illuminationPct)} iluminación
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">Salida</dt>
          <dd className="text-foreground font-mono">{riseLabel}</dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">Puesta</dt>
          <dd className="text-foreground font-mono">{setLabel}</dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Altura máxima
          </dt>
          <dd className="text-foreground font-mono">{peakLabel}</dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Altura a medianoche
          </dt>
          <dd className="text-foreground font-mono">{formatDegrees(moon.position.altitudeDeg)}</dd>
        </div>
      </dl>

      <p className="text-muted text-[10px]">
        La altura máxima se estima con el muestreo de 10 minutos dentro de la noche.
      </p>
    </section>
  );
}
