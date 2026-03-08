

export function SkeletonCard() {
  return (
    <div className="panel rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-secondary rounded" />
          <div className="h-2 w-20 bg-secondary/60 rounded" />
        </div>
        <div className="h-5 w-16 bg-secondary rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-secondary rounded" />
        <div className="h-5 w-20 bg-secondary rounded" />
        <div className="h-5 w-14 bg-secondary rounded" />
      </div>
      <div className="h-8 w-full bg-secondary/40 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 animate-pulse">
      <div className="w-5 h-5 rounded-full bg-secondary" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 bg-secondary rounded" />
        <div className="h-2 w-16 bg-secondary/60 rounded" />
      </div>
      <div className="h-4 w-10 bg-secondary rounded" />
    </div>
  );
}

export function SkeletonStats({ count = 5 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-${Math.min(count, 3)} md:grid-cols-${count} gap-2`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel-inset rounded-md p-2 text-center animate-pulse">
          <div className="h-5 w-5 bg-secondary rounded mx-auto mb-1" />
          <div className="h-4 w-8 bg-secondary rounded mx-auto mb-1" />
          <div className="h-2 w-12 bg-secondary/60 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="panel rounded-lg overflow-hidden animate-pulse">
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <div className="h-5 w-5 bg-secondary rounded" />
        <div className="h-3 w-20 bg-secondary rounded" />
      </div>
      <div className="p-3 h-44 flex items-end gap-2 justify-center">
        {[60, 80, 45, 70, 55].map((h, i) => (
          <div key={i} className="bg-secondary rounded-t" style={{ height: `${h}%`, width: '12%' }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-1 h-8 rounded-full bg-secondary" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-secondary rounded" />
          <div className="h-2 w-24 bg-secondary/60 rounded" />
        </div>
      </div>
      <SkeletonStats count={5} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
