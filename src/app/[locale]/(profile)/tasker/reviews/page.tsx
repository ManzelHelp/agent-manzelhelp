"use client";

import React, { useState, useEffect } from "react";
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
  Send,
  X,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import {
  getTaskerReviews,
  replyToReview,
  getReviewStats,
} from "@/actions/reviews";
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
}

type FilterType =
  | "all"
  | "positive"
  | "negative"
  | "with-response"
  | "no-response";

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    responseRate: 0,
    fiveStarCount: 0,
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch reviews using server action
      const { data: reviewsData, error: reviewsError } = await getTaskerReviews(
        user.id
      );

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        toast.error("Failed to load reviews");
        return;
      }

      // Transform the data to handle the nested structure properly
      const transformedReviews = (reviewsData || []).map(
        (review: ReviewWithDetails) => ({
          ...review,
          // Ensure the nested structure is properly handled
          service_booking: review.service_booking || null,
          reviewer: review.reviewer || null,
        })
      );

      setReviews(transformedReviews);

      // Get stats using server action
      const { data: statsData, error: statsError } = await getReviewStats(
        user.id
      );

      if (statsError) {
        console.error("Error fetching stats:", statsError);
        toast.error("Failed to load review statistics");
        return;
      }

      setStats(
        statsData || {
          avgRating: 0,
          totalReviews: 0,
          responseRate: 0,
          fiveStarCount: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("An unexpected error occurred while loading reviews");
    } finally {
      setLoading(false);
    }
  };

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

      // Reset form
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
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
      aria-pressed={activeFilter === filter}
      aria-label={`Filter reviews by ${label.toLowerCase()}`}
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
        aria-label={`${count} reviews`}
      >
        {count}
      </span>
    </button>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mobile-spacing container mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="mobile-text-xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Reviews
          </h1>
          <p className="mobile-text-sm md:text-base text-[var(--color-text-secondary)] mobile-leading">
            Loading your reviews...
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

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
              {stats.totalReviews > 0
                ? Math.round((stats.fiveStarCount / stats.totalReviews) * 100)
                : 0}
              % of total
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
              Reviews responded to
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
                count={reviews.filter((r) => r.overall_rating >= 4).length}
              />
              <FilterButton
                filter="negative"
                label="3★ & Below"
                count={reviews.filter((r) => r.overall_rating <= 3).length}
              />
              <FilterButton
                filter="no-response"
                label="Needs Response"
                count={reviews.filter((r) => !r.reply_comment).length}
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
                          {review.reviewer?.avatar_url ? (
                            <img
                              src={review.reviewer.avatar_url}
                              alt={review.reviewer.first_name || "Client"}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-[var(--color-primary)]" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="mobile-text-base font-semibold text-[var(--color-text-primary)]">
                            {review.reviewer?.first_name &&
                            review.reviewer?.last_name
                              ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                              : review.reviewer?.first_name || "Anonymous"}
                          </h3>
                          <div className="flex items-center gap-2 mobile-text-sm text-[var(--color-text-secondary)]">
                            <Calendar className="h-3 w-3" />
                            {formatDate(review.created_at || "")}
                          </div>
                        </div>
                      </div>
                      {review.service_booking?.tasker_service && (
                        <p className="mobile-text-sm text-[var(--color-text-secondary)] mobile-leading">
                          Service: {review.service_booking.tasker_service.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            star <= review.overall_rating
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

                    {/* Detailed Ratings */}
                    {review.quality_rating &&
                      review.communication_rating &&
                      review.timeliness_rating && (
                        <div className="grid grid-cols-3 gap-4 mobile-text-xs text-[var(--color-text-secondary)]">
                          <div>
                            <div className="font-medium">Quality</div>
                            <div className="flex items-center gap-1">
                              {review.quality_rating}/5
                              <Star className="h-3 w-3 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Communication</div>
                            <div className="flex items-center gap-1">
                              {review.communication_rating}/5
                              <Star className="h-3 w-3 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Timeliness</div>
                            <div className="flex items-center gap-1">
                              {review.timeliness_rating}/5
                              <Star className="h-3 w-3 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                            </div>
                          </div>
                        </div>
                      )}

                    {review.reply_comment ? (
                      <div className="bg-[var(--color-accent-light)] rounded-lg p-4 mt-3 border border-[var(--color-border)]">
                        <p className="mobile-text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                          Your Response:
                        </p>
                        <p className="mobile-text-sm mobile-leading text-[var(--color-text-secondary)]">
                          {review.reply_comment}
                        </p>
                        {review.replied_at && (
                          <p className="mobile-text-xs text-[var(--color-text-secondary)] mt-2">
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
                              placeholder="Write your response..."
                              aria-label="Reply to review"
                              maxLength={1000}
                              className="w-full p-3 border border-[var(--color-border)] rounded-lg resize-none mobile-text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                              rows={3}
                            />
                            <div className="text-xs text-[var(--color-text-secondary)] text-right">
                              {replyText.length}/1000 characters
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(review.id)}
                                disabled={submittingReply || !replyText.trim()}
                                aria-label="Send reply to review"
                                className="touch-target bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors duration-200"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {submittingReply ? "Sending..." : "Send Reply"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="touch-target border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] transition-colors duration-200"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReplyingTo(review.id)}
                            className="touch-target border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Reply to Review
                          </Button>
                        )}
                      </div>
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
