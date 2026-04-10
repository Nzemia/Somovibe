export default function WalletLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-40 rounded-lg bg-gray-200 animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#d1e8dc] p-6 space-y-3">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-9 w-32 rounded-lg bg-gray-300 animate-pulse" />
            <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6 space-y-4">
        <div className="h-6 w-36 rounded-lg bg-gray-200 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
