interface ISkeletonProps {
  className?: string;
}

export function Skeleton({ className }: ISkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface-muted h-4 w-full animate-pulse rounded-md motion-reduce:animate-none ${className ?? ''}`}
    />
  );
}
