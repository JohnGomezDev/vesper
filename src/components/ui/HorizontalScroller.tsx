'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

interface IHorizontalScrollerProps {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
}

/**
 * Horizontal strip with explicit side navigation and no native scrollbar
 * (design reference). The arrows live in their own columns so they never cover
 * the cards; the track remains keyboard scrollable and swipe friendly.
 */
export function HorizontalScroller({
  ariaLabel,
  children,
  className,
  trackClassName,
}: IHorizontalScrollerProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1): void => {
    const track = trackRef.current;

    if (track === null) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const distance = Math.max(track.clientWidth * 0.85, 240);

    track.scrollBy({
      left: direction * distance,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const controlClassName =
    'border-border bg-surface text-muted hover:border-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background inline-flex size-7 shrink-0 cursor-pointer items-center justify-center self-center rounded-none border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:size-9 motion-reduce:transition-none';

  return (
    <div className={`flex items-stretch gap-1.5 sm:gap-2 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label={`Desplazar ${ariaLabel.toLowerCase()} a la izquierda`}
        className={controlClassName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={`focus-visible:ring-primary focus-visible:ring-offset-background min-w-0 flex-1 scrollbar-none overflow-x-auto focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${trackClassName ?? ''}`}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label={`Desplazar ${ariaLabel.toLowerCase()} a la derecha`}
        className={controlClassName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
