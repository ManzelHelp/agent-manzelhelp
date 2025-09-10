"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

// Input validation
function validateReplyText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: "Reply cannot be empty" };
  }
  if (text.trim().length > 1000) {
    return { isValid: false, error: "Reply cannot exceed 1000 characters" };
  }
  return { isValid: true };
}

export async function getTaskerReviews(taskerId: string) {
  try {
    if (!taskerId) {
      return { data: null, error: "Tasker ID is required" };
    }

    const supabase = await createClient();

    // Optimized query with better performance
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        overall_rating,
        quality_rating,
        communication_rating,
        timeliness_rating,
        comment,
        created_at,
        reply_comment,
        replied_at,
        reviewer:users!reviews_reviewer_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        service_booking:service_bookings!reviews_booking_id_fkey(
          id,
          tasker_service:tasker_services!service_bookings_tasker_service_id_fkey(
            id,
            title
          )
        )
      `
      )
      .eq("reviewee_id", taskerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getTaskerReviews:", error);
    return { data: null, error: "Failed to fetch reviews" };
  }
}

export async function replyToReview(
  reviewId: string,
  replyText: string,
  taskerId: string
) {
  try {
    // Input validation
    const validation = validateReplyText(replyText);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    if (!reviewId || !taskerId) {
      return { success: false, error: "Review ID and Tasker ID are required" };
    }

    const supabase = await createClient();

    // Verify the review belongs to this tasker and hasn't been replied to
    const { data: reviewCheck, error: checkError } = await supabase
      .from("reviews")
      .select("reviewee_id, reply_comment")
      .eq("id", reviewId)
      .single();

    if (checkError || !reviewCheck) {
      return { success: false, error: "Review not found" };
    }

    if (reviewCheck.reviewee_id !== taskerId) {
      return { success: false, error: "Unauthorized to reply to this review" };
    }

    if (reviewCheck.reply_comment) {
      return { success: false, error: "Already replied to this review" };
    }

    const { error } = await supabase
      .from("reviews")
      .update({
        reply_comment: replyText.trim(),
        replied_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      console.error("Error submitting reply:", error);
      return { success: false, error: error.message };
    }

    // Revalidate the reviews page
    revalidatePath("/[locale]/(profile)/tasker/reviews");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in replyToReview:", error);
    return { success: false, error: "Failed to submit reply" };
  }
}

// Combined function to get both reviews and stats in one optimized call
export async function getTaskerReviewsWithStats(taskerId: string) {
  try {
    if (!taskerId) {
      return {
        data: {
          reviews: [],
          stats: {
            avgRating: 0,
            totalReviews: 0,
            responseRate: 0,
            fiveStarCount: 0,
          },
        },
        error: "Tasker ID is required",
      };
    }

    const supabase = await createClient();

    // Get all reviews with related data
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        overall_rating,
        quality_rating,
        communication_rating,
        timeliness_rating,
        comment,
        created_at,
        reply_comment,
        replied_at,
        reviewer:users!reviews_reviewer_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        service_booking:service_bookings!reviews_booking_id_fkey(
          id,
          tasker_service:tasker_services!service_bookings_tasker_service_id_fkey(
            id,
            title
          )
        )
      `
      )
      .eq("reviewee_id", taskerId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return { data: null, error: reviewsError.message };
    }

    // Calculate stats from the same data
    const reviews = reviewsData || [];
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        data: {
          reviews: [],
          stats: {
            avgRating: 0,
            totalReviews: 0,
            responseRate: 0,
            fiveStarCount: 0,
          },
        },
        error: null,
      };
    }

    const avgRating = Number(
      (
        reviews.reduce((acc, review) => acc + review.overall_rating, 0) /
        totalReviews
      ).toFixed(1)
    );
    const responseRate = Math.round(
      (reviews.filter((r) => r.reply_comment).length / totalReviews) * 100
    );
    const fiveStarCount = reviews.filter((r) => r.overall_rating === 5).length;

    return {
      data: {
        reviews,
        stats: {
          avgRating,
          totalReviews,
          responseRate,
          fiveStarCount,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getTaskerReviewsWithStats:", error);
    return { data: null, error: "Failed to fetch reviews and stats" };
  }
}

export async function getReviewStats(taskerId: string) {
  try {
    if (!taskerId) {
      return {
        data: {
          avgRating: 0,
          totalReviews: 0,
          responseRate: 0,
          fiveStarCount: 0,
        },
        error: null,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("overall_rating, reply_comment")
      .eq("reviewee_id", taskerId);

    if (error) {
      console.error("Error fetching review stats:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          avgRating: 0,
          totalReviews: 0,
          responseRate: 0,
          fiveStarCount: 0,
        },
        error: null,
      };
    }

    const totalReviews = data.length;
    const avgRating = Number(
      (
        data.reduce((acc, review) => acc + review.overall_rating, 0) /
        totalReviews
      ).toFixed(1)
    );
    const responseRate = Math.round(
      (data.filter((r) => r.reply_comment).length / totalReviews) * 100
    );
    const fiveStarCount = data.filter((r) => r.overall_rating === 5).length;

    return {
      data: {
        avgRating,
        totalReviews,
        responseRate,
        fiveStarCount,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getReviewStats:", error);
    return { data: null, error: "Failed to fetch review stats" };
  }
}
