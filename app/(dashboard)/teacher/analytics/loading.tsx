import { TableSkeleton, DashboardHeaderSkeleton } from "@/components/DashboardSkeleton";

export default function AnalyticsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse mb-2" />
      <div className="h-4 w-64 rounded bg-gray-100 animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#d1e8dc] p-5 space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-300 animate-pulse" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}
