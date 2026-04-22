export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="bg-gray-50 px-4 py-3 flex gap-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-t border-gray-100 flex gap-8">
          <div className="h-3 bg-gray-100 rounded w-14" />
          <div className="h-3 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-10" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-28" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
        <div className="flex gap-3 mb-2">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-12" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded-full mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex gap-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
