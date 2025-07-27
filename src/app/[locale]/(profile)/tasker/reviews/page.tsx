"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  Filter,
} from "lucide-react";

interface Review {
  id: number;
  client: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  helpful?: number;
  response?: string;
}

type FilterType =
  | "all"
  | "positive"
  | "negative"
  | "with-response"
  | "no-response";

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Mock data - replace with real data fetching
  const reviews: Review[] = [
    {
      id: 1,
      client: "Robert S.",
      rating: 5,
      comment: "Excellent work! Very thorough and professional.",
      date: "2024-01-12",
      service: "Kitchen Deep Clean",
      helpful: 3,
    },
    {
      id: 2,
      client: "Anna L.",
      rating: 4,
      comment: "Good service, arrived on time.",
      date: "2024-01-10",
      service: "Plumbing Fix",
      helpful: 1,
      response: "Thank you for your feedback! I'm glad I could help.",
    },
    {
      id: 3,
      client: "Mike T.",
      rating: 5,
      comment: "Highly recommend! Will book again.",
      date: "2024-01-08",
      service: "Garden Work",
      helpful: 4,
      response: "Looking forward to helping you again!",
    },
    {
      id: 4,
      client: "Sarah K.",
      rating: 3,
      comment: "Service was okay, but could be more detailed.",
      date: "2024-01-05",
      service: "House Cleaning",
      helpful: 1,
    },
  ];

  const stats = {
    avgRating: Number(
      (
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      ).toFixed(1)
    ),
    totalReviews: reviews.length,
    responseRate: Math.round(
      (reviews.filter((r) => r.response).length / reviews.length) * 100
    ),
    fiveStarCount: reviews.filter((r) => r.rating === 5).length,
  };

  const filteredReviews = reviews.filter((review) => {
    switch (activeFilter) {
      case "positive":
        return review.rating >= 4;
      case "negative":
        return review.rating <= 3;
      case "with-response":
        return !!review.response;
      case "no-response":
        return !review.response;
      default:
        return true;
    }
  });

  const FilterButton = ({
    filter,
    label,
    count,
  }: {
    filter: FilterType;
    label: string;
    count: number;
  }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`touch-target flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out mobile-focus ${
        activeFilter === filter
          ? "bg-[var(--color-primary)] text-white shadow-md"
          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-light)] border border-[var(--color-border)]"
      }`}
    >
      <span className="mobile-text-sm font-medium">{label}</span>
      <span
        className={`text-xs rounded-full px-2 py-1 font-medium ${
          activeFilter === filter
            ? "bg-white/20 text-white"
            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <div className="mobile-spacing container mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="mobile-text-xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Reviews
        </h1>
        <p className="mobile-text-sm md:text-base text-[var(--color-text-secondary)] mobile-leading">
          Monitor and manage your client feedback
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="mobile-text-sm font-medium text-[var(--color-text-primary)]">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-[var(--color-secondary)]" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="mobile-text-lg md:text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.avgRating}
              </div>
              <div className="flex -space-x-0.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-3 w-3 md:h-4 md:w-4 ${
                      rating <= Math.round(stats.avgRating)
                        ? "fill-[var(--color-warning)] text-[var(--color-warning)]"
                        : "text-[var(--color-accent)]"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mobile-text-xs text-[var(--color-text-secondary)]">
              Based on {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="mobile-text-sm font-medium text-[var(--color-text-primary)]">
              5-Star Reviews
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-[var(--color-success)]" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mobile-text-lg md:text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.fiveStarCount}
            </div>
            <p className="mobile-text-xs text-[var(--color-text-secondary)]">
              {Math.round((stats.fiveStarCount / stats.totalReviews) * 100)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="mobile-text-sm font-medium text-[var(--color-text-primary)]">
              Response Rate
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-[var(--color-info)]" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mobile-text-lg md:text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.responseRate}%
            </div>
            <p className="mobile-text-xs text-[var(--color-text-secondary)]">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="mobile-text-sm font-medium text-[var(--color-text-primary)]">
              Total Reviews
            </CardTitle>
            <Filter className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mobile-text-lg md:text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.totalReviews}
            </div>
            <p className="mobile-text-xs text-[var(--color-text-secondary)]">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle className="mobile-text-lg md:text-xl text-[var(--color-text-primary)]">
                Client Reviews
              </CardTitle>
              <CardDescription className="mobile-text-sm text-[var(--color-text-secondary)]">
                {filteredReviews.length} review
                {filteredReviews.length !== 1 && "s"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 scrollbar-hide overflow-x-auto pb-2 md:pb-0">
              <FilterButton
                filter="all"
                label="All Reviews"
                count={reviews.length}
              />
              <FilterButton
                filter="positive"
                label="4★ & Above"
                count={reviews.filter((r) => r.rating >= 4).length}
              />
              <FilterButton
                filter="negative"
                label="3★ & Below"
                count={reviews.filter((r) => r.rating <= 3).length}
              />
              <FilterButton
                filter="no-response"
                label="Needs Response"
                count={reviews.filter((r) => !r.response).length}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <Star className="h-12 w-12 text-[var(--color-text-secondary)]" />
                </div>
                <h3 className="mobile-text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  No reviews found
                </h3>
                <p className="mobile-text-sm text-[var(--color-text-secondary)] mobile-leading">
                  {activeFilter === "no-response"
                    ? "You've responded to all reviews!"
                    : "No reviews match the selected filter."}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="space-y-4 pb-6 border-b border-[var(--color-border)] last:border-b-0"
                >
                  <div className="flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="mobile-text-base font-semibold text-[var(--color-text-primary)]">
                            {review.client}
                          </h3>
                          <div className="flex items-center gap-2 mobile-text-sm text-[var(--color-text-secondary)]">
                            <Calendar className="h-3 w-3" />
                            {review.date}
                          </div>
                        </div>
                      </div>
                      <p className="mobile-text-sm text-[var(--color-text-secondary)] mobile-leading">
                        Service: {review.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            star <= review.rating
                              ? "fill-[var(--color-warning)] text-[var(--color-warning)]"
                              : "text-[var(--color-accent)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pl-13 md:pl-14 space-y-3">
                    <p className="mobile-text-sm mobile-leading text-[var(--color-text-primary)]">
                      {review.comment}
                    </p>
                    {review.helpful && (
                      <div className="flex items-center gap-2 mobile-text-sm text-[var(--color-text-secondary)]">
                        <ThumbsUp className="h-3 w-3" />
                        {review.helpful} found this helpful
                      </div>
                    )}
                    {review.response ? (
                      <div className="bg-[var(--color-accent-light)] rounded-lg p-4 mt-3 border border-[var(--color-border)]">
                        <p className="mobile-text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                          Your Response:
                        </p>
                        <p className="mobile-text-sm mobile-leading text-[var(--color-text-secondary)]">
                          {review.response}
                        </p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="touch-target border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200"
                      >
                        Reply to Review
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
