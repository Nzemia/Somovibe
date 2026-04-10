export default function DownloadsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-gray-200 animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#d1e8dc] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
              <div className="h-7 w-14 rounded-lg bg-gray-300 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e8f5ee]">
          <div className="h-6 w-36 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="divide-y divide-[#f0faf5]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="h-9 w-28 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
