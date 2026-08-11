export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-56 w-full animate-pulse bg-muted sm:h-72" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="-mt-16 flex flex-col items-center gap-4 sm:-mt-20 sm:flex-row sm:items-end">
          <div className="h-32 w-32 animate-pulse rounded-full border-4 border-background bg-muted sm:h-40 sm:w-40" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-4 sm:col-span-2">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-4">
            <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
