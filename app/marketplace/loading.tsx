/**
 * Loading skeleton for marketplace page
 * 
 * Shown while the async server component renders.
 * Makes navigation feel instant by showing UI immediately.
 * Grid layout matches the final page for smooth transitions.
 */

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-muted rounded-lg w-48 mb-3 animate-pulse"></div>
          <div className="h-5 bg-muted rounded-lg w-96 animate-pulse"></div>
        </div>

        {/* Grid of skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 flex flex-col animate-pulse"
            >
              {/* Subject badge + purchased badge placeholder */}
              <div className="flex items-start justify-between mb-3">
                <div className="h-6 bg-muted rounded-full w-20"></div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>

              {/* Title */}
              <div className="h-6 bg-muted rounded w-full mb-3"></div>
              <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>

              {/* Description lines */}
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-4/5"></div>
              </div>

              {/* Grade and teacher */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="h-4 bg-muted rounded w-12"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>

              {/* Footer with price and button */}
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-10 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
