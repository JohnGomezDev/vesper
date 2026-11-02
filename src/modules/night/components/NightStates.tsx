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
    <div className={`flex flex-col gap-2 rounded-lg border p-4 text-sm ${toneClass}`} role={role}>
      <p>{message}</p>
      {children}
    </div>
  );
}
