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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeFilter === filter
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-xs rounded-full px-2 py-0.5 ${
          activeFilter === filter
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-muted-foreground/20"
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Monitor and manage your client feedback
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-4 w-4 ${
                      rating <= Math.round(stats.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              5-Star Reviews
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fiveStarCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.fiveStarCount / stats.totalReviews) * 100)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>
                {filteredReviews.length} review
                {filteredReviews.length !== 1 && "s"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
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
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No reviews found</h3>
                <p className="text-sm text-muted-foreground">
                  {activeFilter === "no-response"
                    ? "You've responded to all reviews!"
                    : "No reviews match the selected filter."}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="space-y-4 pb-6 border-b last:border-b-0"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.client}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {review.date}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Service: {review.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pl-10 md:pl-12 space-y-3">
                    <p className="text-sm">{review.comment}</p>
                    {review.helpful && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {review.helpful} found this helpful
                      </div>
                    )}
                    {review.response ? (
                      <div className="bg-muted rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium mb-1">
                          Your Response:
                        </p>
                        <p className="text-sm">{review.response}</p>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline">
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
