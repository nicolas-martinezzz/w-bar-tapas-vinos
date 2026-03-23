export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 rounded-xl bg-stone-800" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-stone-800 border border-stone-700" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-stone-800 border border-stone-700" />
      <div className="h-72 rounded-2xl bg-stone-800 border border-stone-700" />
    </div>
  );
}
