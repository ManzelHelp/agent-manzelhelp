"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type { Notification, NotificationType } from "@/types/supabase";

export interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  search?: string;
}

export interface NotificationSort {
  field: "created_at" | "is_read" | "type";
  ascending: boolean;
}

/**
 * Fetch notifications for a user with optional filtering and sorting
 * Default limit is 10 notifications per page for optimization
 */
export async function getNotifications(
  userId: string,
  filters?: NotificationFilters,
  sort?: NotificationSort,
  limit: number = 10,
  offset: number = 0,
  includeTotal?: boolean
): Promise<{
  data: Notification[] | null;
  error: string | null;
  total?: number;
  totalRead?: number;
  totalUnread?: number;
  hasMore?: boolean;
}> {
  try {
    const supabase = await createClient();

    // Get total counts (all, read, unread) from database when needed
    // Optimized: Use a single query with conditional aggregation instead of 3 separate queries
    let total: number | undefined = undefined;
    let totalRead: number | undefined = undefined;
    let totalUnread: number | undefined = undefined;
    
    if (includeTotal || offset === 0) {
      // Build base query for counts
      let baseCountQuery = supabase
        .from("notifications")
        .select("id, is_read", { count: "exact", head: false })
        .eq("user_id", userId);

      if (filters?.type) {
        baseCountQuery = baseCountQuery.eq("type", filters.type);
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        baseCountQuery = baseCountQuery.or(
          `title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`
        );
      }

      // Get all notifications for counting (with minimal fields)
      const { data: countData, error: countError, count } = await baseCountQuery;

      if (countError) {
        console.error("Error fetching notifications count:", countError);
      } else {
        total = Number(count) || 0;
        // Calculate read and unread counts from the data
        if (countData) {
          totalRead = countData.filter((n) => n.is_read === true).length;
          totalUnread = countData.filter((n) => n.is_read === false).length;
        } else {
          // Fallback: if countData is null but count exists, use separate queries
          const { count: readCount } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_read", true);
          totalRead = Number(readCount) || 0;
          totalUnread = total - totalRead;
        }
      }
    }

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId);

    // Apply filters
    if (filters?.is_read !== undefined) {
      query = query.eq("is_read", filters.is_read);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(
        `title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.ascending });
    } else {
      // Default sort by created_at descending
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination (always applied with default limit=10)
    // range is inclusive, so we need offset to offset+limit-1
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
      });
      return { data: null, error: "Failed to fetch notifications" };
    }

    // Calculate hasMore: true if there are more items to fetch from the database
    // This means: if we got a full page (data.length >= limit), there might be more
    // If total is available, use it to be more precise
    let hasMore = false;
    if (data && data.length >= limit) {
      if (total !== undefined && total !== null && total > 0) {
        // If we have total count, check if there are more items
        const itemsFetched = (offset || 0) + data.length;
        hasMore = itemsFetched < total;
      } else {
        // If total is not available (e.g., during "Load More"), assume there might be more
        // if we got a full page
        hasMore = true;
      }
    }

    console.log("Notifications fetched successfully:", {
      userId,
      count: data?.length || 0,
      unreadCount: data?.filter((n) => !n.is_read).length || 0,
      total,
      totalRead,
      totalUnread,
      limit,
      offset,
      hasMore,
      displayedCount: data?.length || 0,
      remainingInDB: total !== undefined ? total - ((offset || 0) + (data?.length || 0)) : "N/A",
    });

    return { 
      data: data || [], 
      error: null,
      total: total !== undefined ? Number(total) : undefined,
      totalRead: totalRead !== undefined ? Number(totalRead) : undefined,
      totalUnread: totalUnread !== undefined ? Number(totalUnread) : undefined,
      hasMore: Boolean(hasMore) || false,
    };
  } catch (error) {
    console.error("Unexpected error in getNotifications:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      total: 0,
      totalRead: 0,
      totalUnread: 0,
      hasMore: false,
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: "Failed to mark notification as read" };
    }

    // Revalidate the notifications page
    revalidatePath("/tasker/notifications");
    revalidatePath("/customer/notifications");

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in markNotificationAsRead:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Mark a single notification as unread
 */
export async function markNotificationAsUnread(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: false })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notification as unread:", error);
      return { success: false, error: "Failed to mark notification as unread" };
    }

    // Revalidate the notifications page
    revalidatePath("/tasker/notifications");
    revalidatePath("/customer/notifications");

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in markNotificationAsUnread:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a single notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting notification:", error);
      return { success: false, error: "Failed to delete notification" };
    }

    // Revalidate the notifications page
    revalidatePath("/tasker/notifications");
    revalidatePath("/customer/notifications");

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in deleteNotification:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; error: string | null; count?: number }> {
  try {
    const supabase = await createClient();

    // First, get the count of unread notifications
    const { count, error: countError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (countError) {
      console.error("Error counting unread notifications:", countError);
      return { success: false, error: "Failed to count unread notifications" };
    }

    // Update all unread notifications
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: "Failed to mark all notifications as read",
      };
    }

    // Revalidate the notifications page
    revalidatePath("/tasker/notifications");
    revalidatePath("/customer/notifications");

    return { success: true, error: null, count: Number(count) || 0 };
  } catch (error) {
    console.error("Unexpected error in markAllNotificationsAsRead:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Bulk operations on notifications
 */
export async function bulkUpdateNotifications(
  notificationIds: string[],
  userId: string,
  action: "read" | "unread" | "delete"
): Promise<{ success: boolean; error: string | null; count?: number }> {
  try {
    const supabase = await createClient();

    if (notificationIds.length === 0) {
      return { success: true, error: null, count: 0 };
    }

    let result;
    const count = notificationIds.length;

    if (action === "delete") {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .in("id", notificationIds);

      result = { error };
    } else {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: action === "read" })
        .eq("user_id", userId)
        .in("id", notificationIds);

      result = { error };
    }

    if (result.error) {
      console.error(
        `Error performing bulk ${action} on notifications:`,
        result.error
      );
      return { success: false, error: `Failed to ${action} notifications` };
    }

    // Revalidate the notifications page
    revalidatePath("/tasker/notifications");
    revalidatePath("/customer/notifications");

    return { success: true, error: null, count: Number(count) || 0 };
  } catch (error) {
    console.error("Unexpected error in bulkUpdateNotifications:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(userId: string): Promise<{
  data: { total: number; unread: number; read: number } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalError) {
      console.error("Error counting total notifications:", totalError);
      return { data: null, error: "Failed to count notifications" };
    }

    // Get unread count
    const { count: unread, error: unreadError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (unreadError) {
      console.error("Error counting unread notifications:", unreadError);
      return { data: null, error: "Failed to count unread notifications" };
    }

    const read = (total || 0) - (unread || 0);

    return {
      data: {
        total: Number(total) || 0,
        unread: Number(unread) || 0,
        read: Number(read) || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getNotificationStats:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}
