export const CardSkeleton = () => (
  <div className="glass-card space-y-3 p-5">
    <div className="skeleton h-4 w-1/3" />
    <div className="skeleton h-6 w-2/3" />
    <div className="skeleton h-4 w-1/2" />
  </div>
);

export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="glass-card flex items-center justify-between p-5">
    <div className="space-y-2">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-6 w-16" />
    </div>
    <div className="skeleton h-12 w-12 rounded-xl" />
  </div>
);
