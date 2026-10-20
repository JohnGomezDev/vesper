import type { ReactNode } from 'react';

interface IEmptyStateProps {
  message: string;
  children?: ReactNode;
}

export function EmptyState({ message, children }: IEmptyStateProps): React.JSX.Element {
  return (
    <div className="border-border bg-surface flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 text-center">
      <p className="text-muted text-sm">{message}</p>
      {children}
    </div>
  );
}
