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
      className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4"
    >
      <h2 id="observation-windows-title" className="text-base font-semibold">
        Ventanas de observación
      </h2>

      {windows.length === 0 ? (
        <p className="text-muted text-sm">Sin ventanas de observación esta noche.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {windows.map((window) => (
            <li
              key={`${window.objectId}-${window.startMs}`}
              className="border-border bg-surface-muted/40 flex flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-foreground text-sm font-semibold">
                  {OBJECT_LABELS_ES[window.objectId]}
                </h3>
                <span className="text-muted text-[11px]">
                  {BRIGHTNESS_LABELS_ES[window.brightnessLabel]}
                </span>
              </div>

              {window.moonFree ? (
                <p className="border-warning/40 bg-warning/10 text-warning w-fit rounded border px-1.5 py-0.5 text-[11px] font-semibold">
                  Ventana sin Luna
                </p>
              ) : null}

              <p className="text-foreground font-mono text-xs">
                {formatLocalTime(window.startMs, timeZone)} a{' '}
                {formatLocalTime(window.endMs, timeZone)}
              </p>
              <p className="text-muted text-xs">
                Máxima {formatDegrees(window.peakAltitudeDeg)} a las{' '}
                {formatLocalTime(window.culminationMs, timeZone)}
                {window.culminationApproximate ? ' (aprox.)' : ''}
              </p>
              <p className="text-muted text-xs">
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
          <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">
            Avisos de proximidad lunar
          </h3>
          <ul className="flex flex-col gap-1">
            {notices.map((notice) => (
              <li
                key={notice.objectId}
                role="alert"
                className={`rounded-md border px-2 py-1 text-xs ${
                  notice.strong
                    ? 'border-danger/40 bg-danger/5 text-danger'
                    : 'border-warning/40 bg-warning/10 text-warning'
                }`}
              >
                {notice.strong ? 'Aviso fuerte: ' : 'Aviso: '}
                {OBJECT_LABELS_ES[notice.objectId]} a {formatDegrees(notice.separationDeg)} de la
                Luna.
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
