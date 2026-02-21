/* Reusable skeleton building blocks */

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className ?? ""}`} />;
}

/* ── Dashboard header skeleton (green hero) ── */
export function DashboardHeaderSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden mb-8" style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}>
      <div className="px-6 sm:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-white/20 animate-pulse" />
            <div className="h-8 w-52 rounded-lg bg-white/25 animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-white/20 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/10 border border-white/15 rounded-2xl p-4 space-y-2">
              <div className="h-3 w-20 rounded bg-white/20 animate-pulse" />
              <div className="h-7 w-16 rounded-lg bg-white/25 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-white/15 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Quick actions card skeleton ── */
export function QuickActionsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6">
      <div className="h-6 w-36 rounded-lg bg-gray-200 animate-pulse mb-5" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#e8f5ee]">
            <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Table skeleton ── */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#e8f5ee]">
        <div className="h-6 w-40 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="divide-y divide-[#f0faf5]">
        {/* Header row */}
        <div className={`grid gap-4 px-6 py-3 bg-[#f8fdfb]`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className={`grid gap-4 px-6 py-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, j) => (
              <div key={j} className={`h-4 rounded bg-gray-100 animate-pulse ${j === 0 ? "w-full" : "w-3/4"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card pair skeleton ── */
export function CardPairSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6 space-y-4">
      <div className="h-6 w-40 rounded-lg bg-gray-200 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
