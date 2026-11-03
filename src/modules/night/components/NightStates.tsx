import type { ReactNode } from 'react';

interface INightStatesProps {
  message: string;
  variant?: 'info' | 'warning' | 'error';
  children?: ReactNode;
}

/** Shared message block for empty, offline, invalid-date and polar-night states. */
export function NightStates({
  message,
  variant = 'info',
  children,
}: INightStatesProps): React.JSX.Element {
  const toneClass =
    variant === 'error'
      ? 'border-danger/40 bg-danger/5 text-danger'
      : variant === 'warning'
        ? 'border-warning/40 bg-warning/10 text-warning'
        : 'border-border bg-surface text-muted';
  const role = variant === 'info' ? 'status' : 'alert';

  return (
    <div
      className={`flex flex-col gap-2 rounded-[4px] border p-3 text-xs ${toneClass}`}
      role={role}
    >
      <p className="flex items-start gap-2">
        <span aria-hidden="true" className="font-mono text-[10px]">
          {variant === 'info' ? 'i' : '!'}
        </span>
        <span>{message}</span>
      </p>
      {children}
    </div>
  );
}
