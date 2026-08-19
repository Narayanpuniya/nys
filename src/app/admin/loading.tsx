// Admin pages के बीच blank नहीं दिखेगा — skeleton loader दिखेगा
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title skeleton */}
      <div className="h-8 w-48 rounded-xl bg-stone-200" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-200" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl bg-stone-200 h-64" />
    </div>
  );
}
