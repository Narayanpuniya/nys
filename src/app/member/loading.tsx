export default function MemberLoading() {
  return (
    <div className="flex min-h-screen bg-stone-100 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-60 bg-saffron-200 fixed inset-y-0 left-0" />

      {/* Content skeleton */}
      <div className="flex-1 lg:ml-60 p-8 space-y-6">
        <div className="h-8 w-56 rounded-xl bg-stone-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-stone-200" />)}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-stone-200" />)}
        </div>
        <div className="h-64 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}
