"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const BookingLoadingSkeleton = React.memo(() => (
  <div className="min-h-screen bg-color-bg smooth-scroll">
    <div className="container mx-auto px-4 py-6 space-y-6 mobile-spacing">
      {/* Page Header Skeleton */}
      <div className="bg-color-surface border-b border-color-border pb-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Desktop Navigation Tabs Skeleton */}
      <div className="hidden sm:flex gap-1 bg-color-accent-light p-2 rounded-xl">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24 rounded-lg" />
        ))}
      </div>

      {/* Mobile Navigation Skeleton */}
      <div className="sm:hidden">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Booking Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="border-color-border bg-color-surface shadow-sm"
          >
            <CardContent className="p-4 mobile-spacing">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex justify-end gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
));

BookingLoadingSkeleton.displayName = "BookingLoadingSkeleton";
