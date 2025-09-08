import React from "react";
import { Card } from "./ui/card";

export default function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse">
      <div className="relative flex flex-col h-full">
        {/* Profile Section Skeleton */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[var(--color-accent)]/20 flex-shrink-0"></div>
            <div className="min-w-0 flex-1">
              <div className="h-4 sm:h-5 bg-[var(--color-accent)]/20 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-[var(--color-accent)]/20 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-[var(--color-accent)]/20 rounded w-1/3"></div>
            </div>
          </div>
        </div>

        {/* Service Details Skeleton */}
        <div className="p-4 sm:p-6 flex-1">
          <div className="h-5 sm:h-6 bg-[var(--color-accent)]/20 rounded mb-3 w-full"></div>
          <div className="h-4 bg-[var(--color-accent)]/20 rounded mb-2 w-full"></div>
          <div className="h-4 bg-[var(--color-accent)]/20 rounded mb-4 w-3/4"></div>

          {/* Service Features Skeleton */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 bg-[var(--color-accent)]/20 rounded-full w-16"></div>
            <div className="h-6 bg-[var(--color-accent)]/20 rounded-full w-20"></div>
          </div>
        </div>

        {/* Price Section Skeleton */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-accent)]/5 border-t border-[var(--color-border)] mt-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="h-6 sm:h-8 bg-[var(--color-accent)]/20 rounded w-20"></div>
            <div className="h-10 sm:h-12 bg-[var(--color-accent)]/20 rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
