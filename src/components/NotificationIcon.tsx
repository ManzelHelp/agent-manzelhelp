"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Bell } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { getNotificationStats } from "@/actions/notifications";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  /** If true, renders as a button instead of a Link (to avoid nested <a> tags) */
  asButton?: boolean;
  /** Custom className */
  className?: string;
}

export function NotificationIcon({ asButton = false, className }: NotificationIconProps) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if we're on the notifications page - memoized to prevent dependency array size changes
  const isOnNotificationsPage = useMemo(() => {
    if (!pathname) return false;
    // Check if pathname contains notifications path (works with or without locale prefix)
    // Pathname can be: /notifications, /en/notifications, /customer/notifications, /tasker/notifications, /en/tasker/notifications, etc.
    const normalizedPath = pathname.toLowerCase().trim();
    
    // Simple check: if pathname ends with /notifications, we're on the notifications page
    if (normalizedPath.endsWith("/notifications")) {
      return true;
    }
    
    // Also check for patterns like /customer/notifications or /tasker/notifications
    if (normalizedPath.includes("/customer/notifications") || 
        normalizedPath.includes("/tasker/notifications")) {
      return true;
    }
    
    return false;
  }, [pathname]);

  // Use realtime hook instead of polling
  const { unreadCount: realtimeUnreadCount, setInitialCount } = useNotificationRealtime({
    userId: user?.id || null,
    enabled: !isOnNotificationsPage && !!user?.id,
  });

  // Fetch initial count on mount and sync with realtime
  useEffect(() => {
    if (isOnNotificationsPage) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchInitialCount = async () => {
      try {
        const result = await getNotificationStats(user.id);
        if (result.data) {
          const initialUnread = result.data.unread;
          setUnreadCount(initialUnread);
          // Set initial count in realtime hook
          setInitialCount(initialUnread);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialCount();
  }, [user?.id, isOnNotificationsPage, setInitialCount]);

  // Update unread count from realtime
  useEffect(() => {
    if (!isOnNotificationsPage && user?.id && !isLoading) {
      setUnreadCount(realtimeUnreadCount);
    }
  }, [realtimeUnreadCount, isOnNotificationsPage, isLoading, user?.id]);

  if (!user) {
    return null;
  }

  const notificationsPath = user.role === "tasker" 
    ? "/tasker/notifications" 
    : "/customer/notifications";

  const handleClick = () => {
    router.push(notificationsPath);
  };

  // Force badge to be hidden when on notifications page
  const shouldShowBadge = unreadCount > 0 && !isOnNotificationsPage;
  
  const iconContent = (
    <>
      <Bell className="h-5 w-5" />
      {shouldShowBadge && (
        <span
          className={cn(
            "absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full",
            "bg-red-500 animate-pulse"
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </>
  );

  if (asButton) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-200",
          className
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {iconContent}
      </button>
    );
  }

  return (
    <Link
      href={notificationsPath}
      className={cn(
        "relative inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-200",
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      {iconContent}
    </Link>
  );
}

