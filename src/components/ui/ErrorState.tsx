'use client';

interface IErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: IErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger/5 flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center"
    >
      <p className="text-foreground text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
