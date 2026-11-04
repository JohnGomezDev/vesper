interface IAttributionProps {
  className?: string;
}

/**
 * Required attribution to Open-Meteo (SPEC §5.3, §11). The data licence requires
 * a visible link and the CC-BY 4.0 mention.
 */
export function Attribution({ className }: IAttributionProps): React.JSX.Element {
  return (
    <p className={`text-muted font-mono text-[10px] tracking-[0.06em] ${className ?? ''}`}>
      Datos de clima de{' '}
      <a
        href="https://open-meteo.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        Open-Meteo
      </a>{' '}
      (CC-BY 4.0).
    </p>
  );
}
