import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-16 space-y-8 md:py-24 md:space-y-12">
      {/* Hero Section Skeleton */}
      <div className="text-center space-y-6">
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-14 w-full" />
      </div>

      {/* Category Filters Skeleton */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Skeleton className="h-11 w-16" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-24" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="space-y-8">
        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
