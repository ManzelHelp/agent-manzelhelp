"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
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
  MessageSquare,
  Calendar,
  User,
  Send,
  X,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { getTaskerReviewsWithStats, replyToReview } from "@/actions/reviews";
import { toast } from "sonner";
import type {
  Review,
  User as UserType,
  ServiceBooking,
  TaskerService,
} from "@/types/supabase";

interface ReviewWithDetails extends Review {
  reviewer: UserType | null;
  service_booking?:
    | (ServiceBooking & {
        tasker_service?: TaskerService;
      })
    | null;
  job?: {
    id: string;
    title: string;
  } | null;
  serviceTitle?: string | null;
}

type FilterType =
  | "all"
  | "positive"
  | "negative"
  | "with-response"
  | "no-response";

interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  responseRate: number;
  fiveStarCount: number;
}

export default function ReviewsPage() {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    avgRating: 0,
    totalReviews: 0,
    responseRate: 0,
    fiveStarCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await getTaskerReviewsWithStats(user.id);

      if (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
        return;
      }

      if (data) {
        setReviews(data.reviews as ReviewWithDetails[]);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("An unexpected error occurred while loading reviews");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, fetchReviews]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      setSubmittingReply(true);
      const { success, error } = await replyToReview(
        reviewId,
        replyText.trim(),
        user.id
      );

      if (!success) {
        toast.error(error || "Failed to submit reply");
        return;
      }

      // Optimistic update
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                reply_comment: replyText.trim(),
                replied_at: new Date().toISOString(),
              }
            : review
        )
      );

      // Update stats optimistically
      setStats((prev) => ({
        ...prev,
        responseRate: Math.round(
          ((prev.totalReviews - 1) / prev.totalReviews) * 100
        ),
      }));

      toast.success("Reply submitted successfully!");
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      switch (activeFilter) {
        case "positive":
          return review.overall_rating >= 4;
        case "negative":
          return review.overall_rating <= 3;
        case "with-response":
          return !!review.reply_comment;
        case "no-response":
          return !review.reply_comment;
        default:
          return true;
      }
    });
  }, [reviews, activeFilter]);

  const filterCounts = useMemo(
    () => ({
      all: reviews.length,
      positive: reviews.filter((r) => r.overall_rating >= 4).length,
      negative: reviews.filter((r) => r.overall_rating <= 3).length,
      noResponse: reviews.filter((r) => !r.reply_comment).length,
    }),
    [reviews]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"
                ></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Reviews & Feedback
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Monitor your performance and build trust with clients through
            meaningful interactions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.avgRating}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(stats.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Average Rating
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Based on {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.fiveStarCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stats.totalReviews > 0
                      ? Math.round(
                          (stats.fiveStarCount / stats.totalReviews) * 100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                5-Star Reviews
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Excellence rate
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${getResponseRateColor(
                      stats.responseRate
                    )}`}
                  >
                    {stats.responseRate}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Response rate
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Response Rate
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Client engagement
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total reviews
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Total Reviews
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All time feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Client Reviews
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {filteredReviews.length} review
                  {filteredReviews.length !== 1 && "s"}
                  {activeFilter !== "all" &&
                    ` (${activeFilter} filter applied)`}
                </CardDescription>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All", count: filterCounts.all },
                  {
                    key: "positive",
                    label: "4★+",
                    count: filterCounts.positive,
                  },
                  {
                    key: "negative",
                    label: "3★-",
                    count: filterCounts.negative,
                  },
                  {
                    key: "no-response",
                    label: "Needs Reply",
                    count: filterCounts.noResponse,
                  },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as FilterType)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === filter.key
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeFilter === filter.key
                          ? "bg-white/20"
                          : "bg-slate-200 dark:bg-slate-600"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                  <Star className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No reviews found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {activeFilter === "no-response"
                    ? "Great job! You've responded to all reviews."
                    : "No reviews match the selected filter. Try adjusting your filter criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          {review.reviewer?.avatar_url && !avatarErrors.has(review.id) ? (
                            <Image
                              src={review.reviewer.avatar_url}
                              alt={review.reviewer.first_name || "Client"}
                              width={48}
                              height={48}
                              unoptimized
                              onError={() => {
                                console.error(`Failed to load avatar for review ${review.id}`);
                                setAvatarErrors((prev) => new Set(prev).add(review.id));
                              }}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                              <span className="text-white font-semibold text-sm">
                                {review.reviewer?.first_name?.[0]?.toUpperCase() || 
                                 review.reviewer?.last_name?.[0]?.toUpperCase() || 
                                 "U"}
                              </span>
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              review.overall_rating >= 4
                                ? "bg-green-500"
                                : review.overall_rating >= 3
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          >
                            {review.overall_rating}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {review.reviewer?.first_name &&
                              review.reviewer?.last_name
                                ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                                : review.reviewer?.first_name || "Anonymous"}
                            </h3>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.overall_rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(review.created_at || "")}
                          </div>
                          {(review.service_booking?.tasker_service || (review as any).job || (review as any).serviceTitle) && (
                            <div className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400">
                              {(review as any).job?.title || 
                               review.service_booking?.tasker_service?.title || 
                               (review as any).serviceTitle || 
                               "Service"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Detailed Ratings */}
                      {review.quality_rating &&
                        review.communication_rating &&
                        review.timeliness_rating && (
                          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            {[
                              {
                                label: "Quality",
                                rating: review.quality_rating,
                              },
                              {
                                label: "Communication",
                                rating: review.communication_rating,
                              },
                              {
                                label: "Timeliness",
                                rating: review.timeliness_rating,
                              },
                            ].map((item) => (
                              <div key={item.label} className="text-center">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  {item.label}
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <span
                                    className={`text-lg font-bold ${getRatingColor(
                                      item.rating
                                    )}`}
                                  >
                                    {item.rating}
                                  </span>
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {review.reply_comment ? (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                              Your Response
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {review.reply_comment}
                          </p>
                          {review.replied_at && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              Replied on {formatDate(review.replied_at)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {replyingTo === review.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a thoughtful response to this review..."
                                maxLength={1000}
                                className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                rows={4}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {replyText.length}/1000 characters
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleReply(review.id)}
                                    disabled={
                                      submittingReply || !replyText.trim()
                                    }
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {submittingReply
                                      ? "Sending..."
                                      : "Send Reply"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                    className="border-slate-300 dark:border-slate-600"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(review.id)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Reply to Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
