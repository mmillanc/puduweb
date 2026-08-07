export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="h-32 w-full animate-pulse bg-muted" />
            <div className="p-4">
              <div className="-mt-12 mb-3 h-16 w-16 animate-pulse rounded-full border-4 border-card bg-muted" />
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mb-2 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
