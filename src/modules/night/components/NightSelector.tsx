import { SCORE_LABEL_TEXT } from '@/modules/night/constants/score.constants';
import type { INightSummary } from '@/modules/night/types/night.types';
import { formatNightDateLabel } from '@/modules/night/utils/format';
import { describeNightOption } from '@/modules/night/utils/night-selector';
import { formatPercent } from '@/modules/weather/utils/format';

interface INightSelectorProps {
  options: INightSummary[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

/** Horizontal selector of the 18 available nights (SPEC §8.2, §8.6). */
export function NightSelector({
  options,
  selectedDate,
  onSelect,
}: INightSelectorProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="night-selector-title"
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="night-selector-title" className="text-base font-semibold">
          Elegir noche
        </h2>
        <p className="text-muted text-xs">De −3 a +14 noches</p>
      </div>

      {options.length === 0 ? (
        <p className="text-muted text-sm">Sin noches disponibles.</p>
      ) : (
        <div
          role="region"
          aria-label="Selector de noches desplazable"
          tabIndex={0}
          className="focus-visible:ring-primary focus-visible:ring-offset-background overflow-x-auto pb-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ul className="flex min-w-full gap-2">
            {options.map((option) => {
              const isSelected = option.date === selectedDate;
              const score = option.score;
              const label = option.label;

              return (
                <li key={option.date} className="flex">
                  <button
                    type="button"
                    onClick={() => onSelect(option.date)}
                    aria-pressed={isSelected}
                    aria-label={describeNightOption(option)}
                    className={`focus-visible:ring-primary focus-visible:ring-offset-background flex min-h-24 min-w-[8.5rem] flex-col gap-1 rounded-md border p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface hover:bg-surface-muted'
                    }`}
                  >
                    <span className="text-muted text-[11px] capitalize">
                      {formatNightDateLabel(option.date)}
                    </span>
                    {score !== null && label !== null ? (
                      <>
                        <span className="text-foreground text-sm font-semibold">
                          {SCORE_LABEL_TEXT[label]}
                        </span>
                        <span className="text-foreground font-mono text-xs">
                          {Math.round(score)} pts
                        </span>
                      </>
                    ) : (
                      <span className="text-muted text-xs">Sin noche astronómica</span>
                    )}
                    <span className="text-muted text-[11px]">
                      Nubes {formatPercent(option.cloudAverage)}
                    </span>
                    {option.rainLikely ? (
                      <span className="bg-warning/15 text-warning w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold">
                        Lluvia probable
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
