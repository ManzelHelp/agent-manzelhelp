import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function NotificationSkeleton() {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon skeleton */}
          <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Metadata skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* Date header skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
            <Skeleton className="h-8 w-24 rounded-full" />
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
          </div>

          {/* Notifications skeleton */}
          <div className="space-y-3">
            {Array.from({ length: Math.min(count, 3) }).map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationStatsSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 space-y-4">
      {/* Statistics Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}
