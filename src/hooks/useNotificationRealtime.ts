"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/supabase/client";
import type { Notification } from "@/types/supabase";

interface UseNotificationRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onNewNotification?: (notification: Notification) => void;
  onNotificationUpdate?: (notification: Notification) => void;
}

interface UseNotificationRealtimeReturn {
  unreadCount: number;
  isConnected: boolean;
  setInitialCount: (count: number) => void;
}

/**
 * Hook to manage realtime subscriptions for notifications
 * Replaces polling with Supabase realtime subscriptions
 */
export function useNotificationRealtime(
  options: UseNotificationRealtimeOptions
): UseNotificationRealtimeReturn {
  const { userId, enabled = true, onNewNotification, onNotificationUpdate } = options;
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [initialCountSet, setInitialCountSet] = useState(false);

  // Store callbacks in refs to avoid reconnection loops and dependency array size issues
  // Initialize refs with current callbacks (or empty functions if undefined)
  const onNewNotificationRef = useRef(onNewNotification || (() => {}));
  const onNotificationUpdateRef = useRef(onNotificationUpdate || (() => {}));

  // Update refs when callbacks change (but don't trigger reconnection)
  // Use a separate effect to avoid dependency issues
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification || (() => {});
    onNotificationUpdateRef.current = onNotificationUpdate || (() => {});
  }, [onNewNotification, onNotificationUpdate]);

  // Function to set initial count from server
  const setInitialCount = useCallback((count: number) => {
    if (!initialCountSet) {
      setUnreadCount(count);
      setInitialCountSet(true);
    }
  }, [initialCountSet]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `notifications:${userId}`;

    // Create a channel for this user's notifications
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log("New notification received:", newNotification);
          
          // Update unread count
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
          
          // Call callback if provided
          if (onNewNotificationRef.current) {
            onNewNotificationRef.current(newNotification);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          const oldNotification = payload.old as Notification;
          console.log("Notification updated:", updatedNotification);
          
          // Update unread count based on is_read changes
          if (oldNotification.is_read !== updatedNotification.is_read) {
            if (updatedNotification.is_read && !oldNotification.is_read) {
              // Marked as read
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else if (!updatedNotification.is_read && oldNotification.is_read) {
              // Marked as unread
              setUnreadCount((prev) => prev + 1);
            }
          }
          
          // Call callback if provided
          if (onNotificationUpdateRef.current) {
            onNotificationUpdateRef.current(updatedNotification);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          console.log("Notification deleted:", deletedNotification);
          
          // Update unread count if deleted notification was unread
          if (!deletedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log("Notification channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up notification channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    unreadCount,
    isConnected,
    setInitialCount,
  };
}

