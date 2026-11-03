import { Skeleton } from '@/components/ui/Skeleton';

export function NightContentSkeleton(): React.JSX.Element {
  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-[4px] border p-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}
