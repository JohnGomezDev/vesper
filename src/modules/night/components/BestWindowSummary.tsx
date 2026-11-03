import { formatLocalTime } from '@/modules/location/utils/datetime';
import {
  CLOUD_CLASS_LABELS_ES,
  CLOUD_CLASS_TEXT_CLASSES,
} from '@/modules/night/constants/cloud.constants';
import {
  BRIGHTNESS_LABELS_ES,
  OBJECT_LABELS_ES,
} from '@/modules/night/constants/object-labels.constants';
import type { IObservationWindow } from '@/modules/night/types/night.types';
import { formatDegrees, formatDuration } from '@/modules/night/utils/format';

interface IBestWindowSummaryProps {
  window: IObservationWindow | null;
  timeZone: string;
}

/** «Mejor ventana» summary, chosen by cloud → peak altitude → duration (SPEC §8.2). */
export function BestWindowSummary({
  window: bestWindow,
  timeZone,
}: IBestWindowSummaryProps): React.JSX.Element {
  if (bestWindow === null) {
    return (
      <section
        aria-labelledby="best-window-title"
        className="border-border bg-surface rounded-[4px] border p-4"
      >
        <div className="flex flex-col gap-1">
          <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Recomendación primaria
          </p>
          <h2 id="best-window-title" className="text-foreground text-base font-semibold">
            Mejor ventana
          </h2>
        </div>
        <p className="text-muted mt-2 text-sm">Sin ventana esta noche.</p>
      </section>
    );
  }

  const objectLabel = OBJECT_LABELS_ES[bestWindow.objectId];
  const cloudLabel = CLOUD_CLASS_LABELS_ES[bestWindow.worstCloudClass];
  const startLabel = formatLocalTime(bestWindow.startMs, timeZone);
  const endLabel = formatLocalTime(bestWindow.endMs, timeZone);
  const culminationLabel = formatLocalTime(bestWindow.culminationMs, timeZone);

  return (
    <section
      aria-labelledby="best-window-title"
      className="border-primary/50 bg-primary/[0.04] flex flex-col gap-3 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-wrap items-start justify-between gap-2 border-b pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Recomendación primaria
          </p>
          <h2 id="best-window-title" className="text-foreground text-base font-semibold">
            Mejor ventana
          </h2>
        </div>
        <p className="text-primary font-mono text-sm font-semibold">{objectLabel}</p>
      </div>

      <p className="text-foreground font-mono text-2xl font-semibold tracking-tight">
        {startLabel} – {endLabel}
      </p>
      <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
        Duración {formatDuration(bestWindow.endMs - bestWindow.startMs)}
      </p>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Altitud máxima
          </dt>
          <dd className="text-foreground font-mono">{formatDegrees(bestWindow.peakAltitudeDeg)}</dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Culminación
          </dt>
          <dd className="text-foreground font-mono">
            {culminationLabel}
            {bestWindow.culminationApproximate ? ' aprox.' : ''}
          </dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Peor nubosidad
          </dt>
          <dd
            className={`font-mono text-sm ${CLOUD_CLASS_TEXT_CLASSES[bestWindow.worstCloudClass]}`}
          >
            {cloudLabel}
          </dd>
        </div>
        <div className="border-border-subtle border-t pt-2">
          <dt className="text-muted font-mono text-[9px] tracking-[0.12em] uppercase">
            Visibilidad
          </dt>
          <dd className="text-foreground font-mono">
            {BRIGHTNESS_LABELS_ES[bestWindow.brightnessLabel]}
          </dd>
        </div>
      </dl>
    </section>
  );
}
