"use server";

//if smaller function were to be exported we need to make the id and supabase const props optional and therefore created inside the function if not provided

import { createClient } from "@/supabase/server";
import type { Notification, Message } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Types for dashboard data
export interface DashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  completionRate: number;
  totalServices: number;
  activeServices: number;
  upcomingBookings: number;
  recentBookings: number;
  walletBalance: number;
}

export interface RecentActivity {
  id: string;
  type: "booking" | "message" | "review";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

export interface ProcessedMessage extends Message {
  client: string;
  unread: boolean;
}

// Customer-specific dashboard stats
export interface CustomerDashboardStats {
  activeBookings: number;
  completedBookings: number;
  activeJobs: number;
  completedJobs: number;
  totalSpent: number;
  monthlySpent: number;
  weeklySpent: number;
  upcomingBookings: number;
  recentBookings: number;
}

/**
 * Fetch comprehensive dashboard statistics for a tasker
 */
export async function fetchDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  try {
    // Get user wallet balance and comprehensive user stats
    // Use cache: 'no-store' to ensure fresh wallet balance data
    const [userResult, userStatsResult, taskerProfileResult] = await Promise.allSettled([
      supabase.from("users").select("wallet_balance").eq("id", userId).single(),
      supabase.from("user_stats").select("*").eq("id", userId).maybeSingle(),
      supabase.from("tasker_profiles").select("tasker_rating, total_reviews").eq("id", userId).maybeSingle(),
    ]);
    
    // Log wallet balance for debugging
    if (userResult.status === "fulfilled" && userResult.value.data) {
      console.log(`[fetchDashboardStats] Wallet balance for user ${userId}:`, userResult.value.data.wallet_balance);
    } else if (userResult.status === "rejected") {
      console.error(`[fetchDashboardStats] Error fetching wallet for user ${userId}:`, userResult.reason);
    }

    const user =
      userResult.status === "fulfilled" ? userResult.value.data : null;
    const userStats =
      userStatsResult.status === "fulfilled"
        ? userStatsResult.value.data
        : null;
    const taskerProfile =
      taskerProfileResult.status === "fulfilled"
        ? taskerProfileResult.value.data
        : null;

    if (
      userResult.status === "rejected" &&
      userResult.reason.code !== "PGRST116"
    ) {
      console.error("Error fetching user data:", userResult.reason);
      throw userResult.reason;
    }

    if (
      userStatsResult.status === "rejected" &&
      userStatsResult.reason.code !== "PGRST116"
    ) {
      console.error("Error fetching user stats:", userStatsResult.reason);
      throw userStatsResult.reason;
    }

    // Get all bookings and jobs data in parallel
    const [
      activeBookingsResult,
      completedBookingsResult,
      upcomingBookingsResult,
      recentBookingsResult,
      completedJobsResult,
    ] = await Promise.allSettled([
      // Active bookings
      supabase
        .from("service_bookings")
        .select("id, status, agreed_price")
        .eq("tasker_id", userId)
        .in("status", ["confirmed", "in_progress"]),

      // Completed bookings (get all completed, filter by customer_confirmed_at in JS)
      supabase
        .from("service_bookings")
        .select("id, agreed_price, completed_at, customer_confirmed_at")
        .eq("tasker_id", userId)
        .eq("status", "completed"),

      // Upcoming bookings (next 7 days)
      supabase
        .from("service_bookings")
        .select("id, scheduled_date")
        .eq("tasker_id", userId)
        .in("status", ["confirmed", "in_progress"])
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .lte(
          "scheduled_date",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        ),

      // Recent bookings (last 7 days)
      supabase
        .from("service_bookings")
        .select("id, created_at")
        .eq("tasker_id", userId)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),

      // Completed jobs (get all completed, filter by customer_confirmed_at in JS)
      supabase
        .from("jobs")
        .select("id, final_price, completed_at, customer_confirmed_at")
        .eq("assigned_tasker_id", userId)
        .eq("status", "completed"),
    ]);

    // Get services data
    const { data: servicesData } = await supabase
      .from("tasker_services")
      .select("id, service_status")
      .eq("tasker_id", userId);

    // Get earnings data for different periods from transactions
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Process results
    const activeBookings =
      activeBookingsResult.status === "fulfilled"
        ? activeBookingsResult.value.data || []
        : [];
    const allCompletedBookings =
      completedBookingsResult.status === "fulfilled"
        ? completedBookingsResult.value.data || []
        : [];
    const upcomingBookings =
      upcomingBookingsResult.status === "fulfilled"
        ? upcomingBookingsResult.value.data || []
        : [];
    const recentBookings =
      recentBookingsResult.status === "fulfilled"
        ? recentBookingsResult.value.data || []
        : [];
    
    const allCompletedJobs =
      completedJobsResult.status === "fulfilled"
        ? completedJobsResult.value.data || []
        : [];

    // Filter to only confirmed bookings/jobs (customer_confirmed_at IS NOT NULL)
    const completedBookings = allCompletedBookings.filter(
      (b) => b.customer_confirmed_at !== null && b.customer_confirmed_at !== undefined
    );
    const completedJobs = allCompletedJobs.filter(
      (j) => j.customer_confirmed_at !== null && j.customer_confirmed_at !== undefined
    );

    // Calculate earnings from transactions (net amount after platform fee)
    // Fetch all paid transactions to calculate totalEarnings, then filter by date for monthly/weekly

    const [allTransactionsResult, monthlyTransactionsResult, weeklyTransactionsResult] =
      await Promise.allSettled([
        // All transactions for total earnings
        supabase
          .from("transactions")
          .select("amount, platform_fee")
          .eq("payee_id", userId)
          .eq("payment_status", "paid"),

        // Monthly transactions
        supabase
          .from("transactions")
          .select("amount, platform_fee")
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", firstDayOfMonth.toISOString()),

        // Weekly transactions
        supabase
          .from("transactions")
          .select("amount, platform_fee")
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", firstDayOfWeek.toISOString()),
      ]);

    const calculateNetEarnings = (transactions: Array<{ amount: string | number; platform_fee: string | number }>) => {
      return transactions.reduce((sum, t) => {
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : (t.amount || 0);
        const fee = typeof t.platform_fee === 'string' ? parseFloat(t.platform_fee) : (t.platform_fee || 0);
        return sum + (amount - fee);
      }, 0);
    };

    const totalEarnings =
      allTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(allTransactionsResult.value.data || [])
        : (userStats?.total_earnings || 0);

    const monthlyEarnings =
      monthlyTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(monthlyTransactionsResult.value.data || [])
        : 0;

    const weeklyEarnings =
      weeklyTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(weeklyTransactionsResult.value.data || [])
        : 0;

    // Calculate completion rate
    const totalBookings = activeBookings.length + completedBookings.length;
    const completionRate =
      totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0;

    // Calculate active services
    const activeServices =
      servicesData?.filter((service) => service.service_status === "active")
        .length || 0;

    // Total completed jobs = confirmed bookings + confirmed jobs
    const totalCompletedJobs = completedBookings.length + completedJobs.length;

    // Use stored values from tasker_profiles (calculated when review is created)
    const averageRating = taskerProfile?.tasker_rating || 0;
    const totalReviews = taskerProfile?.total_reviews || 0;

    return {
      activeJobs: activeBookings.length,
      completedJobs: totalCompletedJobs, // Now calculated from bookings + jobs, not user_stats
      totalEarnings, // Now calculated from transactions, not user_stats
      monthlyEarnings,
      weeklyEarnings,
      averageRating, // Now calculated from reviews table, not user_stats
      totalReviews, // Now calculated from reviews table, not user_stats
      responseTime: userStats?.response_time_hours || 0,
      completionRate: Math.round(completionRate),
      totalServices: servicesData?.length || 0,
      activeServices,
      upcomingBookings: upcomingBookings.length,
      recentBookings: recentBookings.length,
      walletBalance: user?.wallet_balance || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

/**
 * Fetch recent notifications for a user
 */
export async function fetchDashboardNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Fetch recent messages with user details
 */
export async function fetchDashboardMessages(
  supabase: SupabaseClient,
  userId: string
): Promise<ProcessedMessage[]> {
  try {
    // Get conversations where user is a participant
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("id, participant1_id, participant2_id")
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (conversationsError) {
      console.error("Error fetching conversations:", conversationsError);
      throw conversationsError;
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((conv) => conv.id);

    // Get recent messages from these conversations
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(first_name, last_name, avatar_url)
      `
      )
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })
      .limit(5);

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // Process messages to show the other person's name
    const processedMessages = (messages || []).map(
      (message: {
        id: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        is_read: boolean;
        created_at: string;
        sender?: {
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
        };
      }) => {
        return {
          ...message,
          client:
            message.sender_id === userId
              ? "You" // Message sent by current user
              : `${message.sender?.first_name || ""} ${
                  message.sender?.last_name || ""
                }`.trim() || "Unknown",
          unread: !message.is_read && message.sender_id !== userId,
        };
      }
    );

    return processedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Fetch and process recent activity from multiple sources
 */
export async function fetchDashboardRecentActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<RecentActivity[]> {
  try {
    // Get recent bookings, messages, reviews, and job applications
    const [bookingsResult, messagesResult, reviewsResult, applicationsResult] =
      await Promise.allSettled([
        supabase
          .from("service_bookings")
          .select("id, status, agreed_price, created_at, scheduled_date")
          .eq("tasker_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),

        supabase
          .from("conversations")
          .select(
            `
            id,
            messages!inner(
              id, 
              content, 
              created_at, 
              sender_id,
              sender:users!messages_sender_id_fkey(first_name, last_name)
            )
          `
          )
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
          .order("messages(created_at)", { ascending: false })
          .limit(10),

        supabase
          .from("reviews")
          .select(
            "id, overall_rating, comment, created_at, reviewer:users!reviews_reviewer_id_fkey(first_name, last_name)"
          )
          .eq("reviewee_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),

        supabase
          .from("job_applications")
          .select(
            `
            id,
            status,
            proposed_price,
            created_at,
            job:jobs!job_applications_job_id_fkey(
              id,
              title,
              status
            )
          `
          )
          .eq("tasker_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

    const activities: RecentActivity[] = [];

    // Process bookings
    if (bookingsResult.status === "fulfilled") {
      if (bookingsResult.value.error) {
        console.error("Error fetching bookings:", bookingsResult.value.error);
      } else if (bookingsResult.value.data) {
        bookingsResult.value.data.forEach((booking) => {
          activities.push({
            id: booking.id,
            type: "booking",
            title: `New ${booking.status} booking`,
            description: `Booking for ${booking.agreed_price || 0} MAD`,
            timestamp: booking.created_at,
            status: booking.status,
            amount: booking.agreed_price,
          });
        });
      }
    } else {
      console.error("Bookings fetch failed:", bookingsResult.reason);
    }

    // Process messages
    if (messagesResult.status === "fulfilled") {
      if (messagesResult.value.error) {
        console.error("Error fetching messages:", messagesResult.value.error);
      } else if (messagesResult.value.data) {
        const conversations = messagesResult.value.data as Array<{
          id: string;
          messages: Array<{
            id: string;
            content: string;
            created_at: string;
            sender_id: string;
            sender?: { first_name?: string; last_name?: string };
          }>;
        }>;

        conversations.forEach((conversation) => {
          conversation.messages.forEach((message) => {
            if (message.sender_id !== userId) {
              // Only show messages from others
              activities.push({
                id: message.id,
                type: "message",
                title: `Message from ${message.sender?.first_name || "Customer"}`,
                description:
                  message.content.substring(0, 50) +
                  (message.content.length > 50 ? "..." : ""),
                timestamp: message.created_at,
              });
            }
          });
        });
      }
    } else {
      console.error("Messages fetch failed:", messagesResult.reason);
    }

    // Process reviews
    if (reviewsResult.status === "fulfilled") {
      if (reviewsResult.value.error) {
        console.error("Error fetching reviews:", reviewsResult.value.error);
      } else if (reviewsResult.value.data) {
        const reviews = reviewsResult.value.data as Array<{
          id: string;
          overall_rating: number;
          comment?: string;
          created_at: string;
          reviewer?: { first_name?: string; last_name?: string };
        }>;

        reviews.forEach((review) => {
          activities.push({
            id: review.id,
            type: "review",
            title: `${review.overall_rating}⭐ review from ${
              review.reviewer?.first_name || "Customer"
            }`,
            description:
              review.comment?.substring(0, 50) +
                (review.comment && review.comment.length > 50 ? "..." : "") ||
              "No comment",
            timestamp: review.created_at,
          });
        });
      }
    } else {
      console.error("Reviews fetch failed:", reviewsResult.reason);
    }

    // Process job applications
    if (applicationsResult.status === "fulfilled") {
      if (applicationsResult.value.error) {
        console.error("Error fetching applications:", applicationsResult.value.error);
      } else if (applicationsResult.value.data) {
        const applications = applicationsResult.value.data as Array<{
          id: string;
          status: string;
          proposed_price: number;
          created_at: string;
          job?: { id: string; title?: string; status?: string } | Array<{ id: string; title?: string; status?: string }>;
        }>;

        applications.forEach((application) => {
          // Handle job as object or array (Supabase can return either)
          const jobData = Array.isArray(application.job) 
            ? application.job[0] 
            : application.job;
          
          activities.push({
            id: application.id,
            type: "booking", // Using booking type for consistency
            title: `Application ${application.status} for job`,
            description: jobData?.title 
              ? `Applied to "${jobData.title.substring(0, 40)}${jobData.title.length > 40 ? '...' : ''}"`
              : `Application for ${application.proposed_price || 0} MAD`,
            timestamp: application.created_at,
            status: application.status,
            amount: application.proposed_price,
          });
        });
      }
    } else {
      console.error("Applications fetch failed:", applicationsResult.reason);
    }

    // Sort by timestamp and take the most recent 3
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    console.log(`[fetchDashboardRecentActivity] Found ${activities.length} activities for user ${userId}`);
    return activities.slice(0, 3);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

/**
 * Fetch comprehensive dashboard statistics for a customer
 */
export async function fetchCustomerDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<CustomerDashboardStats> {
  try {
    // Get all customer data in parallel
    const [
      activeBookingsResult,
      completedBookingsResult,
      activeJobsResult,
      completedJobsResult,
      upcomingBookingsResult,
      recentBookingsResult,
    ] = await Promise.allSettled([
      // Active bookings (confirmed, in_progress)
      supabase
        .from("service_bookings")
        .select("id, status, agreed_price")
        .eq("customer_id", userId)
        .in("status", ["confirmed", "in_progress"]),

      // Completed bookings - fetch all, then filter by customer_confirmed_at in JS
      supabase
        .from("service_bookings")
        .select("id, agreed_price, completed_at, customer_confirmed_at")
        .eq("customer_id", userId)
        .eq("status", "completed"),

      // Active jobs (active, assigned, in_progress)
      supabase
        .from("jobs")
        .select("id, status, customer_budget")
        .eq("customer_id", userId)
        .in("status", ["active", "assigned", "in_progress"]),

      // Completed jobs - fetch all, then filter by customer_confirmed_at in JS
      supabase
        .from("jobs")
        .select("id, final_price, completed_at, customer_confirmed_at")
        .eq("customer_id", userId)
        .eq("status", "completed"),

      // Upcoming bookings (next 7 days)
      supabase
        .from("service_bookings")
        .select("id, scheduled_date")
        .eq("customer_id", userId)
        .in("status", ["confirmed", "in_progress"])
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .lte(
          "scheduled_date",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        ),

      // Recent bookings (last 7 days)
      supabase
        .from("service_bookings")
        .select("id, created_at")
        .eq("customer_id", userId)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

    // Process results
    const activeBookings =
      activeBookingsResult.status === "fulfilled"
        ? activeBookingsResult.value.data || []
        : [];
    const allCompletedBookings =
      completedBookingsResult.status === "fulfilled"
        ? completedBookingsResult.value.data || []
        : [];
    const activeJobs =
      activeJobsResult.status === "fulfilled"
        ? activeJobsResult.value.data || []
        : [];
    const allCompletedJobs =
      completedJobsResult.status === "fulfilled"
        ? completedJobsResult.value.data || []
        : [];

    // Filter to only confirmed bookings/jobs (customer_confirmed_at IS NOT NULL)
    const completedBookings = allCompletedBookings.filter(
      (b) => b.customer_confirmed_at !== null && b.customer_confirmed_at !== undefined
    );
    const completedJobs = allCompletedJobs.filter(
      (j) => j.customer_confirmed_at !== null && j.customer_confirmed_at !== undefined
    );
    const upcomingBookings =
      upcomingBookingsResult.status === "fulfilled"
        ? upcomingBookingsResult.value.data || []
        : [];
    const recentBookings =
      recentBookingsResult.status === "fulfilled"
        ? recentBookingsResult.value.data || []
        : [];

    // Calculate spending data from transactions (preferred) or bookings/jobs (fallback)
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Fetch transactions for spending calculation (customer is payer)
    // Note: We need to ensure transactions are linked to confirmed bookings/jobs
    // For now, we'll fetch all transactions, but ideally we should filter by booking_id/job_id
    // that have customer_confirmed_at set. However, for simplicity, we'll use all paid transactions
    // as they should only be created when customer confirms.
    const [allTransactionsResult, monthlyTransactionsResult, weeklyTransactionsResult] = await Promise.allSettled([
      // All transactions for total spent (all time)
      supabase
        .from("transactions")
        .select("amount, booking_id, job_id")
        .eq("payer_id", userId)
        .eq("payment_status", "paid"),

      // Monthly transactions
      supabase
        .from("transactions")
        .select("amount, booking_id, job_id")
        .eq("payer_id", userId)
        .eq("payment_status", "paid")
        .gte("created_at", firstDayOfMonth.toISOString()),

      // Weekly transactions
      supabase
        .from("transactions")
        .select("amount, booking_id, job_id")
        .eq("payer_id", userId)
        .eq("payment_status", "paid")
        .gte("created_at", firstDayOfWeek.toISOString()),
    ]);

    // Calculate total spent from transactions (if any exist)
    // Dashboard shows "All time spending", so we use all transactions without date filter
    // But we should still prefer transactions over bookings/jobs for accuracy
    let totalSpent = allTransactionsResult.status === "fulfilled"
      ? (allTransactionsResult.value.data || []).reduce(
          (sum, t) => sum + parseFloat(String(t.amount || "0")),
          0
        )
      : 0;

    // Fallback: If no transactions but confirmed bookings/jobs exist, use their total
    // This ensures consistency - only count confirmed bookings/jobs
    if (totalSpent === 0 && (completedBookings.length > 0 || completedJobs.length > 0)) {
      const bookingsTotal = completedBookings.reduce(
        (sum, b) => sum + parseFloat(String(b.agreed_price || "0")),
        0
      );
      const jobsTotal = completedJobs.reduce(
        (sum, j) => sum + parseFloat(String(j.final_price || "0")),
        0
      );
      totalSpent = bookingsTotal + jobsTotal;
    }
    
    // IMPORTANT: If transactions exist, always use them (they are the source of truth)
    // Transactions are only created when customer confirms, so they represent actual payments
    // The fallback to bookings/jobs is only for cases where transactions haven't been created yet

    // Calculate monthly spent from transactions (if any exist)
    let monthlySpent = monthlyTransactionsResult.status === "fulfilled"
      ? (monthlyTransactionsResult.value.data || []).reduce(
          (sum, t) => sum + parseFloat(String(t.amount || "0")),
          0
        )
      : 0;

    // Fallback for monthly spent
    if (monthlySpent === 0) {
      const monthlyBookings = completedBookings.filter(
        (b) => b.completed_at && new Date(b.completed_at) >= firstDayOfMonth
      );
      const monthlyJobs = completedJobs.filter(
        (j) => j.completed_at && new Date(j.completed_at) >= firstDayOfMonth
      );
      monthlySpent = monthlyBookings.reduce(
        (sum, b) => sum + parseFloat(String(b.agreed_price || "0")),
        0
      ) + monthlyJobs.reduce(
        (sum, j) => sum + parseFloat(String(j.final_price || "0")),
        0
      );
    }

    // Calculate weekly spent from transactions (if any exist)
    let weeklySpent = weeklyTransactionsResult.status === "fulfilled"
      ? (weeklyTransactionsResult.value.data || []).reduce(
          (sum, t) => sum + parseFloat(String(t.amount || "0")),
          0
        )
      : 0;

    // Fallback for weekly spent
    if (weeklySpent === 0) {
      const weeklyBookings = completedBookings.filter(
        (b) => b.completed_at && new Date(b.completed_at) >= firstDayOfWeek
      );
      const weeklyJobs = completedJobs.filter(
        (j) => j.completed_at && new Date(j.completed_at) >= firstDayOfWeek
      );
      weeklySpent = weeklyBookings.reduce(
        (sum, b) => sum + parseFloat(String(b.agreed_price || "0")),
        0
      ) + weeklyJobs.reduce(
        (sum, j) => sum + parseFloat(String(j.final_price || "0")),
        0
      );
    }

    return {
      activeBookings: activeBookings.length,
      completedBookings: completedBookings.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      totalSpent,
      monthlySpent,
      weeklySpent,
      upcomingBookings: upcomingBookings.length,
      recentBookings: recentBookings.length,
    };
  } catch (error) {
    console.error("Error fetching customer dashboard stats:", error);
    throw error;
  }
}

/**
 * Fetch customer-specific recent activity
 */
export async function fetchCustomerRecentActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<RecentActivity[]> {
  try {
    // Get recent bookings, jobs, and messages
    const [bookingsResult, jobsResult, messagesResult] =
      await Promise.allSettled([
        supabase
          .from("service_bookings")
          .select("id, status, agreed_price, created_at, scheduled_date")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),

        supabase
          .from("jobs")
          .select("id, status, customer_budget, created_at, preferred_date")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),

        supabase
          .from("conversations")
          .select(
            `
            id,
            messages!inner(
              id, 
              content, 
              created_at, 
              sender_id,
              sender:users!messages_sender_id_fkey(first_name, last_name)
            )
          `
          )
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
          .order("messages(created_at)", { ascending: false })
          .limit(3),
      ]);

    const activities: RecentActivity[] = [];

    // Process bookings
    if (bookingsResult.status === "fulfilled" && bookingsResult.value.data) {
      bookingsResult.value.data.forEach((booking) => {
        activities.push({
          id: booking.id,
          type: "booking",
          title: `Booking ${booking.status}`,
          description: `Service booking for ${booking.agreed_price} MAD`,
          timestamp: booking.created_at,
          status: booking.status,
          amount: booking.agreed_price,
        });
      });
    }

    // Process jobs
    if (jobsResult.status === "fulfilled" && jobsResult.value.data) {
      jobsResult.value.data.forEach((job) => {
        activities.push({
          id: job.id,
          type: "booking", // Using booking type for consistency
          title: `Job ${job.status}`,
          description: `Posted job with budget ${job.customer_budget} MAD`,
          timestamp: job.created_at,
          status: job.status,
          amount: job.customer_budget,
        });
      });
    }

    // Process messages
    if (messagesResult.status === "fulfilled" && messagesResult.value.data) {
      const conversations = messagesResult.value.data as Array<{
        id: string;
        messages: Array<{
          id: string;
          content: string;
          created_at: string;
          sender_id: string;
          sender?: { first_name?: string; last_name?: string };
        }>;
      }>;

      conversations.forEach((conversation) => {
        conversation.messages.forEach((message) => {
          if (message.sender_id !== userId) {
            // Only show messages from others
            activities.push({
              id: message.id,
              type: "message",
              title: `Message from ${message.sender?.first_name || "Tasker"}`,
              description:
                message.content.substring(0, 50) +
                (message.content.length > 50 ? "..." : ""),
              timestamp: message.created_at,
            });
          }
        });
      });
    }

    // Sort by timestamp and take the most recent 3
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, 3);
  } catch (error) {
    console.error("Error fetching customer recent activity:", error);
    return [];
  }
}

/**
 * Fetch all customer dashboard data in parallel
 */
export async function fetchAllCustomerDashboardData() {
  const supabase = await createClient();

  // Get the authenticated user once
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const [stats, notifications, messages, recentActivity] =
      await Promise.allSettled([
        fetchCustomerDashboardStats(supabase, user.id),
        fetchDashboardNotifications(supabase, user.id),
        fetchDashboardMessages(supabase, user.id),
        fetchCustomerRecentActivity(supabase, user.id),
      ]);

    return {
      stats: stats.status === "fulfilled" ? stats.value : null,
      notifications:
        notifications.status === "fulfilled" ? notifications.value : [],
      messages: messages.status === "fulfilled" ? messages.value : [],
      recentActivity:
        recentActivity.status === "fulfilled" ? recentActivity.value : [],
    };
  } catch (error) {
    console.error("Error fetching customer dashboard data:", error);
    throw error;
  }
}

/**
 * Fetch all dashboard data in parallel (for taskers)
 */
export async function fetchAllDashboardData() {
  const supabase = await createClient();

  // Get the authenticated user once
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const [stats, notifications, messages, recentActivity] =
      await Promise.allSettled([
        fetchDashboardStats(supabase, user.id),
        fetchDashboardNotifications(supabase, user.id),
        fetchDashboardMessages(supabase, user.id),
        fetchDashboardRecentActivity(supabase, user.id),
      ]);

    return {
      stats: stats.status === "fulfilled" ? stats.value : null,
      notifications:
        notifications.status === "fulfilled" ? notifications.value : [],
      messages: messages.status === "fulfilled" ? messages.value : [],
      recentActivity:
        recentActivity.status === "fulfilled" ? recentActivity.value : [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
