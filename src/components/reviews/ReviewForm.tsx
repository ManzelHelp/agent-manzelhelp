"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createReview } from "@/actions/reviews";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ReviewFormProps {
  jobId?: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  jobId,
  bookingId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [communicationRating, setCommunicationRating] = useState<number>(0);
  const [timelinessRating, setTimelinessRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("reviews");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      toast.error(t("errors.overallRatingRequired", { default: "Please provide an overall rating" }));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        jobId,
        bookingId,
        overallRating,
        qualityRating: qualityRating > 0 ? qualityRating : undefined,
        communicationRating:
          communicationRating > 0 ? communicationRating : undefined,
        timelinessRating:
          timelinessRating > 0 ? timelinessRating : undefined,
        comment: comment.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error || t("errors.submitFailed", { default: "Failed to submit review" }));
        return;
      }

      toast.success(t("success.submitted", { default: "Review submitted successfully!" }));
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(t("errors.unexpected", { default: "An unexpected error occurred" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    rating: number,
    setRating: (rating: number) => void,
    label: string
  ) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
              {rating}/5
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating - Required */}
      <div className="space-y-2">
        <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setOverallRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || overallRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
          {overallRating > 0 && (
            <span className="ml-2 text-lg font-medium text-slate-700 dark:text-slate-300">
              {overallRating}/5
            </span>
          )}
        </div>
      </div>

      {/* Detailed Ratings - Optional */}
      <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Detailed Ratings (Optional)
        </p>
        {renderStarRating(
          qualityRating,
          setQualityRating,
          "Quality"
        )}
        {renderStarRating(
          communicationRating,
          setCommunicationRating,
          "Communication"
        )}
        {renderStarRating(
          timelinessRating,
          setTimelinessRating,
          "Timeliness"
        )}
      </div>

      {/* Comment - Optional */}
      <div className="space-y-2">
        <label
          htmlFor="comment"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Comment (Optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          maxLength={2000}
          className="resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {comment.length}/2000 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || overallRating === 0}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}

