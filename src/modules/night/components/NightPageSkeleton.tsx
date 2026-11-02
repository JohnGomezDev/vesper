import { Skeleton } from '@/components/ui/Skeleton';

export function NightPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    </main>
  );
}
