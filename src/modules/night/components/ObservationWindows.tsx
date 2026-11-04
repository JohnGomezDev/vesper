import { WarningIcon } from '@/components/ui/WarningIcon';
import { formatLocalTime } from '@/modules/location/utils/datetime';
import {
  CLOUD_CLASS_LABELS_ES,
  CLOUD_CLASS_TEXT_CLASSES,
} from '@/modules/night/constants/cloud.constants';
import {
  BRIGHTNESS_LABELS_ES,
  OBJECT_LABELS_ES,
} from '@/modules/night/constants/object-labels.constants';
import type {
  IMoonInterferenceNotice,
  IObservationWindow,
} from '@/modules/night/types/night.types';
import { formatDegrees } from '@/modules/night/utils/format';

interface IObservationWindowsProps {
  windows: IObservationWindow[];
  notices: IMoonInterferenceNotice[];
  timeZone: string;
}

/** Observation windows of the Moon and planets; the Sun is never a target (SPEC §8.5). */
export function ObservationWindows({
  windows,
  notices,
  timeZone,
}: IObservationWindowsProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="observation-windows-title"
      className="border-border bg-surface flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-col gap-1 border-b pb-2">
        <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
          Objetivos de la noche
        </p>
        <h2 id="observation-windows-title" className="text-foreground text-base font-semibold">
          Ventanas de observación
        </h2>
      </div>

      {windows.length === 0 ? (
        <p className="text-muted text-sm">Sin ventanas de observación esta noche.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {windows.map((window) => (
            <li
              key={`${window.objectId}-${window.startMs}`}
              className="border-border bg-surface-raised flex flex-col gap-2 rounded-[4px] border p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-foreground text-sm font-semibold">
                  {OBJECT_LABELS_ES[window.objectId]}
                </h3>
                <span className="text-primary font-mono text-[9px] tracking-[0.08em] uppercase">
                  {BRIGHTNESS_LABELS_ES[window.brightnessLabel]}
                </span>
              </div>

              {window.moonFree ? (
                <p className="border-primary/50 bg-primary/10 text-primary flex w-fit items-center gap-1.5 rounded-none border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] uppercase">
                  <span aria-hidden="true" className="bg-primary size-1" />
                  Ventana sin Luna
                </p>
              ) : null}

              <p className="text-foreground font-mono text-base">
                {formatLocalTime(window.startMs, timeZone)} a{' '}
                {formatLocalTime(window.endMs, timeZone)}
              </p>
              <p className="text-muted font-mono text-[10px]">
                Máxima {formatDegrees(window.peakAltitudeDeg)} a las{' '}
                {formatLocalTime(window.culminationMs, timeZone)}
                {window.culminationApproximate ? ' (aprox.)' : ''}
              </p>
              <p className="text-muted text-[10px]">
                Peor nubosidad:{' '}
                <span className={CLOUD_CLASS_TEXT_CLASSES[window.worstCloudClass]}>
                  {CLOUD_CLASS_LABELS_ES[window.worstCloudClass]}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {notices.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          <h3 className="text-muted flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
            <WarningIcon className="size-3 shrink-0" />
            Avisos de proximidad lunar
          </h3>
          <ul className="flex flex-col gap-1">
            {notices.map((notice) => (
              <li
                key={notice.objectId}
                role="alert"
                className={`flex items-start gap-2 rounded-none border px-2.5 py-1.5 text-xs ${
                  notice.strong
                    ? 'border-danger/50 bg-danger/5 text-danger'
                    : 'border-primary/40 bg-primary/5 text-primary'
                }`}
              >
                <WarningIcon className="size-4 shrink-0" />
                <span>
                  {notice.strong ? 'Aviso fuerte: ' : 'Aviso: '}
                  <strong>{OBJECT_LABELS_ES[notice.objectId]}</strong> a{' '}
                  {formatDegrees(notice.separationDeg)} de la Luna.
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
