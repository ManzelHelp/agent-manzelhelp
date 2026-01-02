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
      // Continue with null user instead of throwing
    }

    if (
      userStatsResult.status === "rejected" &&
      userStatsResult.reason.code !== "PGRST116"
    ) {
      console.error("Error fetching user stats:", userStatsResult.reason);
      // Continue with null userStats instead of throwing
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
        const netAmount = (Number(amount) || 0) - (Number(fee) || 0);
        return Number(sum) + (isNaN(netAmount) ? 0 : netAmount);
      }, 0);
    };

    const totalEarnings = Number(
      allTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(allTransactionsResult.value.data || [])
        : (userStats?.total_earnings || 0)
    ) || 0;

    const monthlyEarnings = Number(
      monthlyTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(monthlyTransactionsResult.value.data || [])
        : 0
    ) || 0;

    const weeklyEarnings = Number(
      weeklyTransactionsResult.status === "fulfilled"
        ? calculateNetEarnings(weeklyTransactionsResult.value.data || [])
        : 0
    ) || 0;

    // Calculate completion rate
    const totalBookings = activeBookings.length + completedBookings.length;
    const completionRate = totalBookings > 0 
      ? (completedBookings.length / totalBookings) * 100 
      : 0;

    // Calculate active services
    const activeServices =
      servicesData?.filter((service) => service.service_status === "active")
        .length || 0;

    // Total completed jobs = confirmed bookings + confirmed jobs
    const totalCompletedJobs = completedBookings.length + completedJobs.length;

    // Use stored values from tasker_profiles (calculated when review is created)
    const averageRating = taskerProfile?.tasker_rating ?? 0;
    const totalReviews = taskerProfile?.total_reviews ?? 0;

    // Helper function to safely convert to number (prevents NaN and undefined)
    const safeNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    return {
      activeJobs: safeNumber(activeBookings.length),
      completedJobs: safeNumber(totalCompletedJobs),
      totalEarnings: safeNumber(totalEarnings),
      monthlyEarnings: safeNumber(monthlyEarnings),
      weeklyEarnings: safeNumber(weeklyEarnings),
      averageRating: safeNumber(averageRating),
      totalReviews: safeNumber(totalReviews),
      responseTime: safeNumber(userStats?.response_time_hours),
      completionRate: safeNumber(Math.round(completionRate || 0)),
      totalServices: safeNumber(servicesData?.length),
      activeServices: safeNumber(activeServices),
      upcomingBookings: safeNumber(upcomingBookings.length),
      recentBookings: safeNumber(recentBookings.length),
      walletBalance: safeNumber(user?.wallet_balance),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values instead of throwing
    return {
      activeJobs: 0,
      completedJobs: 0,
      totalEarnings: 0,
      monthlyEarnings: 0,
      weeklyEarnings: 0,
      averageRating: 0,
      totalReviews: 0,
      responseTime: 0,
      completionRate: 0,
      totalServices: 0,
      activeServices: 0,
      upcomingBookings: 0,
      recentBookings: 0,
      walletBalance: 0,
    };
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
      return [];
    }

    // Ensure all notification fields are properly serialized
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((notification) => ({
      ...notification,
      id: String(notification.id),
      user_id: String(notification.user_id),
      title: String(notification.title || ""),
      message: String(notification.message || ""),
      type: String(notification.type || ""),
      is_read: Boolean(notification.is_read),
      created_at: String(notification.created_at || ""),
      metadata: notification.metadata ? JSON.parse(JSON.stringify(notification.metadata)) : null,
    })) as Notification[];
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
      return [];
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
      // Return empty array instead of throwing to prevent serialization errors
      return [];
    }
    
    // Ensure all messages are properly serializable
    if (!messages || !Array.isArray(messages)) {
      return [];
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
          id: String(message.id),
          conversation_id: String(message.conversation_id),
          sender_id: String(message.sender_id),
          content: String(message.content || ""),
          is_read: Boolean(message.is_read),
          created_at: String(message.created_at),
          sender: message.sender ? {
            first_name: message.sender.first_name ? String(message.sender.first_name) : undefined,
            last_name: message.sender.last_name ? String(message.sender.last_name) : undefined,
            avatar_url: message.sender.avatar_url ? String(message.sender.avatar_url) : undefined,
          } : undefined,
          client: String(
            message.sender_id === userId
              ? "You"
              : `${message.sender?.first_name || ""} ${
                  message.sender?.last_name || ""
                }`.trim() || "Unknown"
          ),
          unread: Boolean(!message.is_read && message.sender_id !== userId),
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
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`),

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
            id: String(booking.id),
            type: "booking",
            title: String(`New ${booking.status} booking`),
            description: String(`Booking for ${Number(booking.agreed_price) || 0} MAD`),
            timestamp: String(booking.created_at),
            status: String(booking.status || ""),
            amount: Number(booking.agreed_price) || 0,
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

        // Collect all messages and sort by created_at
        const allMessages: Array<{
          id: string;
          content: string;
          created_at: string;
          sender_id: string;
          sender?: { first_name?: string; last_name?: string };
        }> = [];
        
        conversations.forEach((conversation) => {
          conversation.messages.forEach((message) => {
            if (message.sender_id !== userId) {
              // Only show messages from others
              allMessages.push(message);
            }
          });
        });

        // Sort by created_at descending (most recent first)
        allMessages.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Take only the most recent messages and add to activities
        allMessages.slice(0, 10).forEach((message) => {
          activities.push({
            id: String(message.id),
            type: "message",
            title: String(`Message from ${message.sender?.first_name || "Customer"}`),
            description: String(
              message.content.substring(0, 50) +
              (message.content.length > 50 ? "..." : "")
            ),
            timestamp: String(message.created_at),
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
            id: String(review.id),
            type: "review",
            title: String(`${Number(review.overall_rating) || 0}⭐ review from ${
              review.reviewer?.first_name || "Customer"
            }`),
            description: String(
              review.comment?.substring(0, 50) +
                (review.comment && review.comment.length > 50 ? "..." : "") ||
              "No comment"
            ),
            timestamp: String(review.created_at),
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
            id: String(application.id),
            type: "booking", // Using booking type for consistency
            title: String(`Application ${application.status} for job`),
            description: String(
              jobData?.title 
                ? `Applied to "${jobData.title.substring(0, 40)}${jobData.title.length > 40 ? '...' : ''}"`
                : `Application for ${Number(application.proposed_price) || 0} MAD`
            ),
            timestamp: String(application.created_at),
            status: String(application.status || ""),
            amount: Number(application.proposed_price) || 0,
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

    // Helper function to safely convert to number (prevents NaN and undefined)
    const safeNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    return {
      activeBookings: safeNumber(activeBookings.length),
      completedBookings: safeNumber(completedBookings.length),
      activeJobs: safeNumber(activeJobs.length),
      completedJobs: safeNumber(completedJobs.length),
      totalSpent: safeNumber(totalSpent),
      monthlySpent: safeNumber(monthlySpent),
      weeklySpent: safeNumber(weeklySpent),
      upcomingBookings: safeNumber(upcomingBookings.length),
      recentBookings: safeNumber(recentBookings.length),
    };
  } catch (error) {
    console.error("Error fetching customer dashboard stats:", error);
    // Return default values instead of throwing
    return {
      activeBookings: 0,
      completedBookings: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalSpent: 0,
      monthlySpent: 0,
      weeklySpent: 0,
      upcomingBookings: 0,
      recentBookings: 0,
    };
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
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`),
      ]);

    const activities: RecentActivity[] = [];

    // Process bookings
    if (bookingsResult.status === "fulfilled" && bookingsResult.value.data) {
      bookingsResult.value.data.forEach((booking) => {
        activities.push({
          id: String(booking.id),
          type: "booking",
          title: String(`Booking ${booking.status}`),
          description: String(`Service booking for ${Number(booking.agreed_price) || 0} MAD`),
          timestamp: String(booking.created_at),
          status: String(booking.status || ""),
          amount: Number(booking.agreed_price) || 0,
        });
      });
    }

    // Process jobs
    if (jobsResult.status === "fulfilled" && jobsResult.value.data) {
      jobsResult.value.data.forEach((job) => {
        activities.push({
          id: String(job.id),
          type: "booking", // Using booking type for consistency
          title: String(`Job ${job.status}`),
          description: String(`Posted job with budget ${Number(job.customer_budget) || 0} MAD`),
          timestamp: String(job.created_at),
          status: String(job.status || ""),
          amount: Number(job.customer_budget) || 0,
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

      // Collect all messages and sort by created_at
      const allMessages: Array<{
        id: string;
        content: string;
        created_at: string;
        sender_id: string;
        sender?: { first_name?: string; last_name?: string };
      }> = [];
      
      conversations.forEach((conversation) => {
        conversation.messages.forEach((message) => {
          if (message.sender_id !== userId) {
            // Only show messages from others
            allMessages.push(message);
          }
        });
      });

      // Sort by created_at descending (most recent first)
      allMessages.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Take only the most recent messages and add to activities
        allMessages.slice(0, 3).forEach((message) => {
          activities.push({
            id: String(message.id),
            type: "message",
            title: String(`Message from ${message.sender?.first_name || "Tasker"}`),
            description: String(
              message.content.substring(0, 50) +
              (message.content.length > 50 ? "..." : "")
            ),
            timestamp: String(message.created_at),
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
  try {
    const supabase = await createClient();

    // Get the authenticated user once
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        stats: null,
        notifications: [],
        messages: [],
        recentActivity: [],
        error: "User not authenticated",
      };
    }

    const [stats, notifications, messages, recentActivity] =
      await Promise.allSettled([
        fetchCustomerDashboardStats(supabase, user.id),
        fetchDashboardNotifications(supabase, user.id),
        fetchDashboardMessages(supabase, user.id),
        fetchCustomerRecentActivity(supabase, user.id),
      ]);

    // Ensure all data is properly serialized
    const statsData = stats.status === "fulfilled" ? stats.value : null;
    const notificationsData = notifications.status === "fulfilled" ? notifications.value : [];
    const messagesData = messages.status === "fulfilled" ? messages.value : [];
    const activityData = recentActivity.status === "fulfilled" ? recentActivity.value : [];

    // Ensure statsData is fully serializable (for customer dashboard)
    // Convert all values to ensure they're valid numbers (not NaN or undefined)
    const serializeNumber = (value: any): number => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    const serializedStats = statsData ? {
      activeBookings: serializeNumber(statsData.activeBookings ?? 0),
      completedBookings: serializeNumber(statsData.completedBookings ?? 0),
      activeJobs: serializeNumber(statsData.activeJobs ?? 0),
      completedJobs: serializeNumber(statsData.completedJobs ?? 0),
      totalSpent: serializeNumber(statsData.totalSpent ?? 0),
      monthlySpent: serializeNumber(statsData.monthlySpent ?? 0),
      weeklySpent: serializeNumber(statsData.weeklySpent ?? 0),
      upcomingBookings: serializeNumber(statsData.upcomingBookings ?? 0),
      recentBookings: serializeNumber(statsData.recentBookings ?? 0),
    } : null;

    // Ensure all arrays are properly serialized
    const serializedNotifications = Array.isArray(notificationsData) 
      ? JSON.parse(JSON.stringify(notificationsData))
      : [];
    const serializedMessages = Array.isArray(messagesData)
      ? JSON.parse(JSON.stringify(messagesData))
      : [];
    const serializedActivity = Array.isArray(activityData)
      ? JSON.parse(JSON.stringify(activityData))
      : [];

    return {
      stats: serializedStats,
      notifications: serializedNotifications,
      messages: serializedMessages,
      recentActivity: serializedActivity,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching customer dashboard data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      stats: null,
      notifications: [],
      messages: [],
      recentActivity: [],
      error: String(errorMessage),
    };
  }
}

/**
 * Fetch all dashboard data in parallel (for taskers)
 */
export async function fetchAllDashboardData() {
  try {
    const supabase = await createClient();

    // Get the authenticated user once
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        stats: null,
        notifications: [],
        messages: [],
        recentActivity: [],
        error: "User not authenticated",
      };
    }

    const [stats, notifications, messages, recentActivity] =
      await Promise.allSettled([
        fetchDashboardStats(supabase, user.id),
        fetchDashboardNotifications(supabase, user.id),
        fetchDashboardMessages(supabase, user.id),
        fetchDashboardRecentActivity(supabase, user.id),
      ]);

    // Ensure all data is properly serialized
    const statsData = stats.status === "fulfilled" ? stats.value : null;
    const notificationsData = notifications.status === "fulfilled" ? notifications.value : [];
    const messagesData = messages.status === "fulfilled" ? messages.value : [];
    const activityData = recentActivity.status === "fulfilled" ? recentActivity.value : [];

    // Ensure statsData is fully serializable (for tasker dashboard)
    // Convert all values to ensure they're valid numbers (not NaN or undefined)
    const serializeNumber = (value: any): number => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    const serializedStats = statsData ? {
      activeJobs: serializeNumber(statsData.activeJobs ?? 0),
      completedJobs: serializeNumber(statsData.completedJobs ?? 0),
      totalEarnings: serializeNumber(statsData.totalEarnings ?? 0),
      monthlyEarnings: serializeNumber(statsData.monthlyEarnings ?? 0),
      weeklyEarnings: serializeNumber(statsData.weeklyEarnings ?? 0),
      averageRating: serializeNumber(statsData.averageRating ?? 0),
      totalReviews: serializeNumber(statsData.totalReviews ?? 0),
      responseTime: serializeNumber(statsData.responseTime ?? 0),
      completionRate: serializeNumber(statsData.completionRate ?? 0),
      totalServices: serializeNumber(statsData.totalServices ?? 0),
      activeServices: serializeNumber(statsData.activeServices ?? 0),
      upcomingBookings: serializeNumber(statsData.upcomingBookings ?? 0),
      recentBookings: serializeNumber(statsData.recentBookings ?? 0),
      walletBalance: serializeNumber(statsData.walletBalance ?? 0),
    } : null;

    // Ensure all arrays are properly serialized
    const serializedNotifications = Array.isArray(notificationsData) 
      ? JSON.parse(JSON.stringify(notificationsData))
      : [];
    const serializedMessages = Array.isArray(messagesData)
      ? JSON.parse(JSON.stringify(messagesData))
      : [];
    const serializedActivity = Array.isArray(activityData)
      ? JSON.parse(JSON.stringify(activityData))
      : [];

    return {
      stats: serializedStats,
      notifications: serializedNotifications,
      messages: serializedMessages,
      recentActivity: serializedActivity,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      stats: null,
      notifications: [],
      messages: [],
      recentActivity: [],
      error: String(errorMessage),
    };
  }
}
