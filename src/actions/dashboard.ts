"use server";

import { createClient } from "@/supabase/server";
import type { Notification, Message } from "@/types/supabase";

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

/**
 * Fetch comprehensive dashboard statistics for a tasker
 */
export async function fetchDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  try {
    // Get comprehensive user stats
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError);
      throw statsError;
    }

    // Get all bookings data in parallel
    const [
      activeBookingsResult,
      completedBookingsResult,
      upcomingBookingsResult,
      recentBookingsResult,
    ] = await Promise.allSettled([
      // Active bookings
      supabase
        .from("service_bookings")
        .select("id, status, agreed_price")
        .eq("tasker_id", userId)
        .in("status", ["confirmed", "in_progress"]),

      // Completed bookings
      supabase
        .from("service_bookings")
        .select("id, agreed_price, completed_at")
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
    ]);

    // Get services data
    const { data: servicesData } = await supabase
      .from("tasker_services")
      .select("id, service_status")
      .eq("tasker_id", userId);

    // Get earnings data for different periods
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );

    const [monthlyEarningsResult, weeklyEarningsResult] =
      await Promise.allSettled([
        supabase
          .from("service_bookings")
          .select("agreed_price")
          .eq("tasker_id", userId)
          .eq("status", "completed")
          .gte("completed_at", firstDayOfMonth.toISOString()),

        supabase
          .from("service_bookings")
          .select("agreed_price")
          .eq("tasker_id", userId)
          .eq("status", "completed")
          .gte("completed_at", firstDayOfWeek.toISOString()),
      ]);

    // Process results
    const activeBookings =
      activeBookingsResult.status === "fulfilled"
        ? activeBookingsResult.value.data || []
        : [];
    const completedBookings =
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
    const monthlyEarnings =
      monthlyEarningsResult.status === "fulfilled"
        ? (monthlyEarningsResult.value.data || []).reduce(
            (sum, booking) => sum + (booking.agreed_price || 0),
            0
          )
        : 0;
    const weeklyEarnings =
      weeklyEarningsResult.status === "fulfilled"
        ? (weeklyEarningsResult.value.data || []).reduce(
            (sum, booking) => sum + (booking.agreed_price || 0),
            0
          )
        : 0;

    // Calculate completion rate
    const totalBookings = activeBookings.length + completedBookings.length;
    const completionRate =
      totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0;

    // Calculate active services
    const activeServices =
      servicesData?.filter((service) => service.service_status === "active")
        .length || 0;

    return {
      activeJobs: activeBookings.length,
      completedJobs: userStats?.completed_jobs || completedBookings.length,
      totalEarnings: userStats?.total_earnings || 0,
      monthlyEarnings,
      weeklyEarnings,
      averageRating: userStats?.tasker_rating || 0,
      totalReviews: userStats?.total_reviews || 0,
      responseTime: userStats?.response_time_hours || 0,
      completionRate: Math.round(completionRate),
      totalServices: servicesData?.length || 0,
      activeServices,
      upcomingBookings: upcomingBookings.length,
      recentBookings: recentBookings.length,
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
  userId: string
): Promise<Notification[]> {
  const supabase = await createClient();

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
  userId: string
): Promise<ProcessedMessage[]> {
  const supabase = await createClient();

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
  userId: string
): Promise<RecentActivity[]> {
  const supabase = await createClient();

  try {
    // Get recent bookings, messages, and reviews
    const [bookingsResult, messagesResult, reviewsResult] =
      await Promise.allSettled([
        supabase
          .from("service_bookings")
          .select("id, status, agreed_price, created_at, scheduled_date")
          .eq("tasker_id", userId)
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

        supabase
          .from("reviews")
          .select(
            "id, overall_rating, comment, created_at, reviewer:users!reviews_reviewer_id_fkey(first_name, last_name)"
          )
          .eq("reviewee_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

    const activities: RecentActivity[] = [];

    // Process bookings
    if (bookingsResult.status === "fulfilled" && bookingsResult.value.data) {
      bookingsResult.value.data.forEach((booking) => {
        activities.push({
          id: booking.id,
          type: "booking",
          title: `New ${booking.status} booking`,
          description: `Booking for ${booking.agreed_price} MAD`,
          timestamp: booking.created_at,
          status: booking.status,
          amount: booking.agreed_price,
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

    // Process reviews
    if (reviewsResult.status === "fulfilled" && reviewsResult.value.data) {
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

    // Sort by timestamp and take the most recent 6
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, 6);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

/**
 * Fetch all dashboard data in parallel
 */
export async function fetchAllDashboardData(userId: string) {
  try {
    const [stats, notifications, messages, recentActivity] =
      await Promise.allSettled([
        fetchDashboardStats(userId),
        fetchDashboardNotifications(userId),
        fetchDashboardMessages(userId),
        fetchDashboardRecentActivity(userId),
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
