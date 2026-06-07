'use client';

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-charcoal/10 bg-white p-5 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-charcoal/10 rounded-lg w-1/3" />
              <div className="h-4 bg-charcoal/10 rounded-lg w-1/2" />
              <div className="h-4 bg-charcoal/10 rounded-lg w-2/3" />
            </div>
            <div className="h-16 w-16 bg-charcoal/10 rounded-lg shrink-0" />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 3, cols = 4 }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-charcoal/6 last:border-b-0">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-5 bg-charcoal/10 rounded-lg flex-1 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-charcoal/10 rounded-lg animate-pulse"
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  );
}
