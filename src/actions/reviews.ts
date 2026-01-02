"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
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

    // Fetch reviews with both job and booking information
    // First, get all reviews for this tasker
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        job_id,
        booking_id,
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
        )
      `
      )
      .eq("reviewee_id", taskerId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return { data: null, error: reviewsError.message };
    }

    if (!reviewsData || reviewsData.length === 0) {
      return { data: [], error: null };
    }

    // Get unique booking IDs and job IDs
    const bookingIds = reviewsData
      .map((r) => r.booking_id)
      .filter((id): id is string => id !== null && id !== undefined);
    const jobIds = reviewsData
      .map((r) => r.job_id)
      .filter((id): id is string => id !== null && id !== undefined);

    // Fetch bookings with service information
    let bookingsMap = new Map<string, { id: string; serviceTitle: string }>();
    if (bookingIds.length > 0) {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("service_bookings")
        .select(
          `
          id,
          tasker_service_id,
          tasker_services:tasker_services!service_bookings_tasker_service_id_fkey(
            id,
            title
          )
        `
        )
        .in("id", bookingIds);

      if (!bookingsError && bookingsData) {
        bookingsData.forEach((booking: any) => {
          const serviceTitle = Array.isArray(booking.tasker_services)
            ? booking.tasker_services[0]?.title
            : booking.tasker_services?.title || "Service";
          bookingsMap.set(booking.id, {
            id: booking.id,
            serviceTitle: serviceTitle,
          });
        });
      }
    }

    // Fetch jobs with title information
    let jobsMap = new Map<string, { id: string; title: string }>();
    if (jobIds.length > 0) {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .in("id", jobIds);

      if (!jobsError && jobsData) {
        jobsData.forEach((job: any) => {
          jobsMap.set(job.id, {
            id: job.id,
            title: job.title || "Job",
          });
        });
      }
    }

    // Combine reviews with booking/job information
    const data = reviewsData.map((review: any) => {
      let serviceTitle: string | null = null;
      
      if (review.job_id && jobsMap.has(review.job_id)) {
        serviceTitle = jobsMap.get(review.job_id)!.title;
      } else if (review.booking_id && bookingsMap.has(review.booking_id)) {
        serviceTitle = bookingsMap.get(review.booking_id)!.serviceTitle;
      }

      return {
        ...review,
        service_booking: review.booking_id
          ? {
              id: review.booking_id,
              tasker_service: bookingsMap.has(review.booking_id)
                ? {
                    id: bookingsMap.get(review.booking_id)!.id,
                    title: bookingsMap.get(review.booking_id)!.serviceTitle,
                  }
                : null,
            }
          : null,
        job: review.job_id && jobsMap.has(review.job_id)
          ? {
              id: review.job_id,
              title: jobsMap.get(review.job_id)!.title,
            }
          : null,
        serviceTitle: serviceTitle, // For easy access
      };
    });

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

    // Fetch reviews with both job and booking information
    // First, get all reviews for this tasker
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        job_id,
        booking_id,
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
        )
      `
      )
      .eq("reviewee_id", taskerId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return { data: null, error: reviewsError.message };
    }

    if (!reviewsData || reviewsData.length === 0) {
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

    // Get unique booking IDs and job IDs
    const bookingIds = reviewsData
      .map((r) => r.booking_id)
      .filter((id): id is string => id !== null && id !== undefined);
    const jobIds = reviewsData
      .map((r) => r.job_id)
      .filter((id): id is string => id !== null && id !== undefined);

    // Fetch bookings with service information
    let bookingsMap = new Map<string, { id: string; serviceTitle: string }>();
    if (bookingIds.length > 0) {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("service_bookings")
        .select(
          `
          id,
          tasker_service_id,
          tasker_services:tasker_services!service_bookings_tasker_service_id_fkey(
            id,
            title
          )
        `
        )
        .in("id", bookingIds);

      if (!bookingsError && bookingsData) {
        bookingsData.forEach((booking: any) => {
          const serviceTitle = Array.isArray(booking.tasker_services)
            ? booking.tasker_services[0]?.title
            : booking.tasker_services?.title || "Service";
          bookingsMap.set(booking.id, {
            id: booking.id,
            serviceTitle: serviceTitle,
          });
        });
      }
    }

    // Fetch jobs with title information
    let jobsMap = new Map<string, { id: string; title: string }>();
    if (jobIds.length > 0) {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .in("id", jobIds);

      if (!jobsError && jobsData) {
        jobsData.forEach((job: any) => {
          jobsMap.set(job.id, {
            id: job.id,
            title: job.title || "Job",
          });
        });
      }
    }

    // Combine reviews with booking/job information
    const reviews = reviewsData.map((review: any) => {
      let serviceTitle: string | null = null;
      
      if (review.job_id && jobsMap.has(review.job_id)) {
        serviceTitle = jobsMap.get(review.job_id)!.title;
      } else if (review.booking_id && bookingsMap.has(review.booking_id)) {
        serviceTitle = bookingsMap.get(review.booking_id)!.serviceTitle;
      }

      return {
        ...review,
        service_booking: review.booking_id
          ? {
              id: review.booking_id,
              tasker_service: bookingsMap.has(review.booking_id)
                ? {
                    id: bookingsMap.get(review.booking_id)!.id,
                    title: bookingsMap.get(review.booking_id)!.serviceTitle,
                  }
                : null,
            }
          : null,
        job: review.job_id && jobsMap.has(review.job_id)
          ? {
              id: review.job_id,
              title: jobsMap.get(review.job_id)!.title,
            }
          : null,
        serviceTitle: serviceTitle, // For easy access
      };
    });

    // Fetch tasker profile stats (stored values, automatically updated by triggers)
    const { data: taskerProfile } = await supabase
      .from("tasker_profiles")
      .select("tasker_rating, total_reviews")
      .eq("id", taskerId)
      .maybeSingle();

    // Use stored values from tasker_profiles (updated automatically by triggers when reviews are created/updated/deleted)
    // No fallback calculation needed - triggers guarantee these values are always up-to-date
    const totalReviews = taskerProfile?.total_reviews ?? 0;
    const avgRating = taskerProfile?.tasker_rating ?? 0;

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

    // Calculate responseRate and fiveStarCount from the reviews we already fetched (needed for display anyway)
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

    // Get stored stats from tasker_profiles (optimized)
    const { data: taskerProfile, error: profileError } = await supabase
      .from("tasker_profiles")
      .select("tasker_rating, total_reviews")
      .eq("id", taskerId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching tasker profile stats:", profileError);
      return { data: null, error: profileError.message };
    }

    const avgRating = taskerProfile?.tasker_rating || 0;
    const totalReviews = taskerProfile?.total_reviews || 0;

    // Only fetch reviews for responseRate and fiveStarCount (less frequent stats)
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("overall_rating, reply_comment")
      .eq("reviewee_id", taskerId);

    if (reviewsError) {
      console.error("Error fetching reviews for stats:", reviewsError);
      // Return stored stats even if we can't get responseRate/fiveStarCount
      return {
        data: {
          avgRating,
          totalReviews,
          responseRate: 0,
          fiveStarCount: 0,
        },
        error: null,
      };
    }

    const reviews = reviewsData || [];
    const responseRate = totalReviews > 0
      ? Math.round((reviews.filter((r) => r.reply_comment).length / totalReviews) * 100)
      : 0;
    const fiveStarCount = reviews.filter((r) => r.overall_rating === 5).length;

    return {
      data: {
        avgRating: Number(avgRating.toFixed(1)),
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
// Input validation for review creation
function validateReviewData(data: {
  jobId?: string;
  bookingId?: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  timelinessRating?: number;
  comment?: string;
}): { isValid: boolean; error?: string } {
  // At least one of jobId or bookingId must be provided
  if (!data.jobId && !data.bookingId) {
    return { isValid: false, error: "Either jobId or bookingId must be provided" };
  }

  // Cannot provide both
  if (data.jobId && data.bookingId) {
    return { isValid: false, error: "Cannot provide both jobId and bookingId" };
  }

  // Overall rating is required and must be between 1 and 5
  if (!data.overallRating || data.overallRating < 1 || data.overallRating > 5) {
    return { isValid: false, error: "Overall rating must be between 1 and 5" };
  }

  // Detailed ratings must be between 1 and 5 if provided
  if (data.qualityRating && (data.qualityRating < 1 || data.qualityRating > 5)) {
    return { isValid: false, error: "Quality rating must be between 1 and 5" };
  }
  if (data.communicationRating && (data.communicationRating < 1 || data.communicationRating > 5)) {
    return { isValid: false, error: "Communication rating must be between 1 and 5" };
  }
  if (data.timelinessRating && (data.timelinessRating < 1 || data.timelinessRating > 5)) {
    return { isValid: false, error: "Timeliness rating must be between 1 and 5" };
  }

  // Comment length validation
  if (data.comment && data.comment.trim().length > 2000) {
    return { isValid: false, error: "Comment cannot exceed 2000 characters" };
  }

  return { isValid: true };
}

export async function createReview(data: {
  jobId?: string;
  bookingId?: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  timelinessRating?: number;
  comment?: string;
}): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  try {
    // Validate input
    const validation = validateReviewData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const reviewerId = user.id;
    let revieweeId: string | null = null;
    let jobTitle: string | null = null;
    let bookingTitle: string | null = null;

    // Validate job or booking and get tasker ID
    if (data.jobId) {
      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id, customer_id, assigned_tasker_id, customer_confirmed_at, title")
        .eq("id", data.jobId)
        .single();

      if (jobError || !job) {
        return { success: false, error: "Job not found" };
      }

      // Verify customer owns the job
      if (job.customer_id !== reviewerId) {
        return { success: false, error: "Unauthorized: You can only review your own jobs" };
      }

      // Verify job is confirmed
      if (!job.customer_confirmed_at) {
        return { success: false, error: "Job must be confirmed before leaving a review" };
      }

      // Verify tasker is assigned
      if (!job.assigned_tasker_id) {
        return { success: false, error: "Job must have an assigned tasker" };
      }

      revieweeId = job.assigned_tasker_id;
      jobTitle = job.title;

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("job_id", data.jobId)
        .eq("reviewer_id", reviewerId)
        .maybeSingle();

      if (existingReview) {
        return { success: false, error: "You have already left a review for this job" };
      }
    } else if (data.bookingId) {
      // Fetch booking details
      const { data: booking, error: bookingError } = await supabase
        .from("service_bookings")
        .select(`
          id,
          customer_id,
          tasker_id,
          customer_confirmed_at,
          tasker_service:tasker_services(title)
        `)
        .eq("id", data.bookingId)
        .single();

      if (bookingError || !booking) {
        return { success: false, error: "Booking not found" };
      }

      // Verify customer owns the booking
      if (booking.customer_id !== reviewerId) {
        return { success: false, error: "Unauthorized: You can only review your own bookings" };
      }

      // Verify booking is confirmed
      if (!booking.customer_confirmed_at) {
        return { success: false, error: "Booking must be confirmed before leaving a review" };
      }

      // Verify tasker is assigned
      if (!booking.tasker_id) {
        return { success: false, error: "Booking must have an assigned tasker" };
      }

      revieweeId = booking.tasker_id;
      bookingTitle = (booking.tasker_service as any)?.title || "Service";

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", data.bookingId)
        .eq("reviewer_id", reviewerId)
        .maybeSingle();

      if (existingReview) {
        return { success: false, error: "You have already left a review for this booking" };
      }
    }

    if (!revieweeId) {
      return { success: false, error: "Unable to determine tasker for review" };
    }

    // Create the review
    const reviewData: any = {
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      overall_rating: data.overallRating,
      quality_rating: data.qualityRating || null,
      communication_rating: data.communicationRating || null,
      timeliness_rating: data.timelinessRating || null,
      comment: data.comment?.trim() || null,
    };

    if (data.jobId) {
      reviewData.job_id = data.jobId;
    } else if (data.bookingId) {
      reviewData.booking_id = data.bookingId;
    }

    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select("id")
      .single();

    if (reviewError || !newReview) {
      console.error("Error creating review:", reviewError);
      return { success: false, error: reviewError?.message || "Failed to create review" };
    }

    // Note: tasker_rating and total_reviews are automatically updated by database trigger
    // (see add_tasker_review_stats_with_trigger.sql)
    // No need to update them manually here - the trigger handles it efficiently

    // Send notification to tasker
    try {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: revieweeId,
          type: "payment_received", // Using existing notification type
          title: "New Review Received",
          message: `You received a ${data.overallRating}-star review${jobTitle ? ` for "${jobTitle}"` : bookingTitle ? ` for "${bookingTitle}"` : ""}`,
          metadata: {
            review_id: newReview.id,
            job_id: data.jobId || null,
            booking_id: data.bookingId || null,
          },
        });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the review creation if notification fails
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Don't fail the review creation if notification fails
    }

    // Revalidate relevant paths
    revalidatePath("/tasker/reviews");
    if (data.jobId) {
      revalidatePath(`/customer/my-jobs/${data.jobId}`);
    }
    if (data.bookingId) {
      revalidatePath(`/customer/bookings/${data.bookingId}`);
    }

    return { success: true, reviewId: String(newReview.id) };
  } catch (error) {
    console.error("Error in createReview:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}

// Check if a review already exists for a job or booking
export async function checkReviewExists(
  jobId?: string,
  bookingId?: string
): Promise<{ exists: boolean; reviewId?: string }> {
  try {
    if (!jobId && !bookingId) {
      return { exists: false };
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { exists: false };
    }

    let query = supabase.from("reviews").select("id").eq("reviewer_id", user.id);

    if (jobId) {
      query = query.eq("job_id", jobId);
    } else if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { exists: false };
    }

    return { exists: true, reviewId: String(data.id) };
  } catch (error) {
    console.error("Error checking review existence:", error);
    return { exists: false };
  }
}

