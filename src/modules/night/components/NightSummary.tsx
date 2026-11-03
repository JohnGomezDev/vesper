import type { INightAnalysis } from '@/modules/night/types/night.types';
import { formatNightScore } from '@/modules/night/utils/night-summary';

interface INightSummaryProps {
  analysis: INightAnalysis;
}

export function NightSummary({ analysis }: INightSummaryProps): React.JSX.Element {
  const scoreText = formatNightScore(analysis.summary);
  const hasAstronomicalNight = analysis.window.kind === 'available';

  return (
    <section
      aria-labelledby="night-summary-title"
      className="border-border bg-surface flex flex-col gap-2 rounded-[4px] border p-4"
    >
      <h2 id="night-summary-title" className="text-base font-semibold">
        Noche del {analysis.nightDate}
      </h2>
      {analysis.isArchived ? (
        <p className="text-muted font-mono text-xs font-medium tracking-wide uppercase">
          Pronóstico archivado
        </p>
      ) : null}
      {hasAstronomicalNight ? (
        <p className="text-muted text-sm">
          {analysis.rows.length} horas en la tira · {analysis.windows.length} ventanas de
          observación · {scoreText ?? 'sin nota'}
        </p>
      ) : (
        <p className="text-muted text-sm">Sin noche astronómica este día.</p>
      )}
      {analysis.bestWindow === null ? null : (
        <p className="text-muted text-sm">
          Mejor ventana: {analysis.bestWindow.objectId} · máxima{' '}
          {Math.round(analysis.bestWindow.peakAltitudeDeg)}°
        </p>
      )}
      <p className="text-muted text-xs">
        Los bloques visuales de «Ahora», la tira horaria y la Luna llegan en T021 y T022.
      </p>
    </section>
  );
}
