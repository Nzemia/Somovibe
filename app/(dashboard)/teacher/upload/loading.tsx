export default function UploadLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse mb-2" />
      <div className="h-4 w-64 rounded bg-gray-100 animate-pulse mb-8" />
      <div className="bg-white rounded-2xl border border-[#d1e8dc] p-8 space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-gray-100 animate-pulse" />
          </div>
        ))}
        <div className="h-12 w-full rounded-xl bg-[#008c43]/20 animate-pulse" />
      </div>
    </div>
  );
}
