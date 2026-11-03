'use client';

interface IErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: IErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger/5 flex min-h-48 flex-col items-center justify-center gap-4 rounded-[4px] border p-6 text-center"
    >
      <p className="text-foreground text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary-foreground min-h-11 rounded-none px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
