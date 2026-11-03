import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { SCORE_LABEL_CLASSES, SCORE_LABEL_TEXT } from '@/modules/night/constants/score.constants';
import type { INightSummary } from '@/modules/night/types/night.types';
import { formatNightDateLabel } from '@/modules/night/utils/format';
import { describeNightOption, formatNightOffset } from '@/modules/night/utils/night-selector';
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
      className="border-border bg-surface flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="border-border-subtle flex flex-wrap items-end justify-between gap-2 border-b pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Matriz de previsión nocturna · 18 noches
          </p>
          <h2 id="night-selector-title" className="text-foreground text-base font-semibold">
            Histórico −3d a pronóstico +14d
          </h2>
        </div>
        <p className="text-muted font-mono text-[10px] tracking-[0.1em] uppercase">
          Noche seleccionada: {formatNightDateLabel(selectedDate)}
        </p>
      </div>

      {options.length === 0 ? (
        <p className="text-muted text-sm">Sin noches disponibles.</p>
      ) : (
        <HorizontalScroller ariaLabel="Selector de noches" trackClassName="pb-1">
          <ul className="flex w-max min-w-full gap-2">
            {options.map((option, index) => {
              const isSelected = option.date === selectedDate;
              const score = option.score;
              const label = option.label;
              const hasScore = score !== null && label !== null;

              return (
                <li key={option.date} className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(option.date)}
                    aria-pressed={isSelected}
                    aria-label={describeNightOption(option)}
                    className={`focus-visible:ring-primary focus-visible:ring-offset-background flex min-h-32 w-[9.5rem] shrink-0 flex-col gap-2 rounded-[4px] border p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none ${
                      isSelected
                        ? 'border-primary bg-surface-raised'
                        : 'border-border bg-surface-raised hover:border-border/80 hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-muted font-mono text-[10px] capitalize">
                        {formatNightDateLabel(option.date)}
                      </span>
                      <span
                        className={`font-mono text-[9px] font-semibold tracking-[0.1em] uppercase ${
                          isSelected ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        {formatNightOffset(index)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 text-[10px]">
                      <span className="text-foreground font-mono">
                        Nubes: {formatPercent(option.cloudAverage)}
                      </span>
                      <span className="text-muted font-mono">
                        Lluvia: {option.rainLikely ? 'Sí' : 'No'}
                      </span>
                    </div>

                    <div
                      className={`mt-auto flex items-center gap-2 rounded-none px-1.5 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase ${
                        hasScore && label !== null
                          ? `justify-between ${SCORE_LABEL_CLASSES[label]}`
                          : 'bg-surface-muted text-muted justify-center text-center text-[8px]'
                      }`}
                    >
                      {hasScore && label !== null && score !== null ? (
                        <>
                          <span>{SCORE_LABEL_TEXT[label]}</span>
                          <span>{Math.round(score)} pts</span>
                        </>
                      ) : (
                        <span>Sin noche astronómica</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </HorizontalScroller>
      )}
    </section>
  );
}
