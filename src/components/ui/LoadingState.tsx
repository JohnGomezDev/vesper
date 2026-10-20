interface ILoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Cargando…' }: ILoadingStateProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-muted flex min-h-48 flex-col items-center justify-center gap-3 p-6"
    >
      <span
        aria-hidden="true"
        className="border-border border-t-primary size-6 animate-spin rounded-full border-2 motion-reduce:animate-none"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
