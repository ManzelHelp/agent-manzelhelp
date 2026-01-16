"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/date-utils";
import { useUserStore } from "@/stores/userStore";
import type { Notification, NotificationType } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  bulkUpdateNotifications,
} from "@/actions/notifications";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import {
  NotificationListSkeleton,
  NotificationStatsSkeleton,
} from "@/components/notifications/NotificationSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/BackButton";
import {
  BellDot,
  CheckCircle,
  Clock,
  Filter,
  MailOpen,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  CreditCard,
  Calendar,
  User,
  Briefcase,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  SortAsc,
  SortDesc,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/supabase/client";

// Notification type icons mapping
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    job_created: <Briefcase className="h-4 w-4" />,
    application_received: <User className="h-4 w-4" />,
    application_accepted: <CheckCircle2 className="h-4 w-4" />,
    job_completed: <CheckCircle className="h-4 w-4" />,
    payment_received: <CreditCard className="h-4 w-4" />,
    message_received: <MessageSquare className="h-4 w-4" />,
    booking_created: <Calendar className="h-4 w-4" />,
    booking_accepted: <CheckCircle2 className="h-4 w-4" />,
    booking_confirmed: <CheckCircle className="h-4 w-4" />,
    booking_cancelled: <XCircle className="h-4 w-4" />,
    booking_completed: <CheckCircle className="h-4 w-4" />,
    booking_reminder: <Clock className="h-4 w-4" />,
    review_reminder: <Star className="h-4 w-4" />,
    job_review_reminder: <Star className="h-4 w-4" />,
    review_received: <Star className="h-4 w-4" />,
    service_created: <Star className="h-4 w-4" />,
    service_updated: <Settings className="h-4 w-4" />,
    payment_confirmed: <CreditCard className="h-4 w-4" />,
    payment_pending: <AlertTriangle className="h-4 w-4" />,
    job_approved: <CheckCircle2 className="h-4 w-4" />,
    job_started: <Briefcase className="h-4 w-4" />,
    wallet_refund_request_created: <CreditCard className="h-4 w-4" />,
    wallet_refund_payment_confirmed: <CheckCircle className="h-4 w-4" />,
    wallet_refund_verifying: <Clock className="h-4 w-4" />,
    wallet_refund_approved: <CheckCircle2 className="h-4 w-4" />,
    wallet_refund_rejected: <XCircle className="h-4 w-4" />,
    wallet_low_balance: <AlertTriangle className="h-4 w-4" />,
  };
  return iconMap[type] || <BellDot className="h-4 w-4" />;
};

// Notification type colors
const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    job_created:
      "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800",
    application_received:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
    application_accepted:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800",
    job_completed:
      "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-800",
    payment_received:
      "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800",
    message_received:
      "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-800",
    booking_created:
      "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800",
    booking_accepted:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800",
    booking_confirmed:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
    booking_cancelled:
      "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800",
    booking_completed:
      "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-800",
    booking_reminder:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800",
    review_reminder:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800",
    job_review_reminder:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800",
    review_received:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800",
    service_created:
      "text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-800",
    service_updated:
      "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800",
    payment_confirmed:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
    payment_pending:
      "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800",
    job_approved:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800",
    job_started:
      "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800",
    wallet_refund_request_created:
      "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800",
    wallet_refund_payment_confirmed:
      "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/20 dark:border-cyan-800",
    wallet_refund_verifying:
      "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800",
    wallet_refund_approved:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
    wallet_refund_rejected:
      "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800",
    wallet_low_balance:
      "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800",
  };
  return (
    colorMap[type] ||
    "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800"
  );
};

// Notification type labels - now uses translations
const getNotificationTypeLabel = (type: string, t: (key: string) => string) => {
  const translationKey = `types.${type}`;
  const translated = t(translationKey);
  // Fallback to "General" if translation not found
  return translated !== translationKey ? translated : t("types.general");
};

function NotificationScrollHandler({ notificationId, notifications, user, markAsRead, router }: {
  notificationId: string | null;
  notifications: Notification[];
  user: { id: string } | null;
  markAsRead: (id: string) => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const hasScrolled = React.useRef(false);
  
  useEffect(() => {
    if (notificationId && notifications.length > 0 && !hasScrolled.current) {
      hasScrolled.current = true;
      
      // Wait for DOM to be ready
      setTimeout(() => {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight the notification
          element.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
          }, 3000);
          // Mark as read only once
          if (user?.id) {
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.is_read) {
              markAsRead(notificationId).catch(console.error);
            }
          }
          // Remove notificationId from URL
          router.replace("/tasker/notifications");
        }
      }, 500);
    }
  }, [notificationId, notifications.length, user?.id, router, markAsRead]);
  
  return null;
}

export default function NotificationsPage() {
  const { user } = useUserStore();
  const t = useTranslations("notifications");
  const tToast = useTranslations("toasts");
  const router = useRouter();
  const { toast } = useToast();

  // Check user role and redirect if needed
  useEffect(() => {
    if (user && user.role === "customer") {
      router.push("/customer/dashboard");
    }
  }, [user, router]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [bookingTitles, setBookingTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const currentOffsetRef = useRef(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalRead, setTotalRead] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch related titles (jobs + booking service titles) to render translated messages
  useEffect(() => {
    let cancelled = false;

    async function loadTitles() {
      try {
        const supabase = createClient();

        const jobIds = Array.from(
          new Set(
            notifications
              .map((n) => n.related_job_id)
              .filter((id): id is string => !!id)
              .filter((id) => !jobTitles[id])
          )
        );

        const bookingIds = Array.from(
          new Set(
            notifications
              .map((n) => n.related_booking_id)
              .filter((id): id is string => !!id)
              .filter((id) => !bookingTitles[id])
          )
        );

        if (jobIds.length > 0) {
          const { data } = await supabase.from("jobs").select("id, title").in("id", jobIds);
          if (!cancelled && data) {
            setJobTitles((prev) => {
              const next = { ...prev };
              data.forEach((j: any) => {
                if (j?.id) next[String(j.id)] = String(j.title || "");
              });
              return next;
            });
          }
        }

        if (bookingIds.length > 0) {
          const { data } = await supabase
            .from("service_bookings")
            .select("id, tasker_services(title)")
            .in("id", bookingIds);

          if (!cancelled && data) {
            setBookingTitles((prev) => {
              const next = { ...prev };
              data.forEach((b: any) => {
                const title = Array.isArray(b?.tasker_services)
                  ? b.tasker_services[0]?.title
                  : b?.tasker_services?.title;
                if (b?.id && title) next[String(b.id)] = String(title);
              });
              return next;
            });
          }
        }
      } catch {
        // ignore
      }
    }

    if (notifications.length > 0) loadTitles();

    return () => {
      cancelled = true;
    };
  }, [notifications, jobTitles, bookingTitles]);

  const getDisplayText = useCallback(
    (notification: Notification) => {
      const jobTitle = notification.related_job_id ? jobTitles[notification.related_job_id] : undefined;
      const bookingTitle = notification.related_booking_id ? bookingTitles[notification.related_booking_id] : undefined;

      // Prefer translated templates for consistent UI language
      const type = String(notification.type);
      switch (type) {
        case "wallet_refund_verifying":
          return {
            title: t("titles.refundRequestUnderReview"),
            message: notification.message || t("messages.refundRequestUnderReview", { referenceCode: "", amount: "" }),
          };
        case "wallet_refund_approved":
          return {
            title: t("titles.refundRequestApproved"),
            message: notification.message || t("messages.refundRequestApproved", { referenceCode: "", amount: "" }),
          };
        case "wallet_refund_rejected":
          return {
            title: t("titles.refundRequestRejected"),
            message: notification.message || t("messages.refundRequestRejected", { referenceCode: "", amount: "", reason: "" }),
          };
        case "job_started":
          return {
            title: t("titles.jobStarted"),
            message: t("messages.jobStarted", { jobTitle: jobTitle || "" }),
          };
        case "job_completed":
          return {
            title: t("titles.jobCompleted"),
            message: t("messages.jobCompleted", { jobTitle: jobTitle || "" }),
          };
        case "application_accepted":
          return {
            title: t("titles.applicationAccepted"),
            message: t("messages.applicationAccepted", { jobTitle: jobTitle || "" }),
          };
        case "application_received":
          return {
            title: t("titles.newApplicationReceived"),
            message: t("messages.newApplicationReceived", { jobTitle: jobTitle || "" }),
          };
        case "booking_created":
          return {
            title: t("titles.bookingCreated"),
            message: bookingTitle ? `${t("messages.bookingCreated")} "${bookingTitle}".` : t("messages.bookingCreated"),
          };
        case "booking_accepted":
          return {
            title: t("titles.bookingAccepted"),
            message: bookingTitle ? `${t("messages.bookingAccepted")} "${bookingTitle}".` : t("messages.bookingAccepted"),
          };
        case "booking_confirmed":
          return {
            title: t("titles.bookingConfirmed"),
            message: bookingTitle ? `${t("messages.bookingConfirmed")} "${bookingTitle}".` : t("messages.bookingConfirmed"),
          };
        case "booking_cancelled":
          return {
            title: t("titles.bookingCancelled"),
            message: bookingTitle ? `${t("messages.bookingCancelled")} "${bookingTitle}".` : t("messages.bookingCancelled"),
          };
        case "booking_completed":
          return {
            title: t("titles.bookingCompleted"),
            message: bookingTitle ? `${t("messages.bookingCompleted")} "${bookingTitle}".` : t("messages.bookingCompleted"),
          };
        case "review_reminder":
        case "job_review_reminder": {
          const context = bookingTitle
            ? ` "${bookingTitle}"`
            : jobTitle
              ? ` "${jobTitle}"`
              : "";
          return {
            title: t("titles.reviewReminder"),
            message: t("messages.reviewReminder", { context }),
          };
        }
        default: {
          // For payment-related notifications, keep stored message (amount/currency often embedded),
          // but still fix any leftover placeholders when possible.
          const safeTitle = notification.title || t("titles.general");
          const safeMessage = (notification.message || t("messages.general"))
            .replaceAll("{jobTitle}", jobTitle || "")
            .replaceAll("{bookingTitle}", bookingTitle || "");
          return { title: safeTitle, message: safeMessage };
        }
      }
    },
    [jobTitles, bookingTitles, t]
  );

  // Function to get redirect URL based on notification type and related fields
  const getNotificationRedirectUrl = useCallback((notification: Notification): string | null => {
    // Priority 1: Use action_url if available
    if (notification.action_url) {
      return notification.action_url;
    }

    // Priority 2: Booking-related notifications
    if (notification.related_booking_id) {
      return `/tasker/bookings/${notification.related_booking_id}`;
    }

    // Priority 3: Job-related notifications
    if (notification.related_job_id) {
      // For tasker's assigned jobs
      if (
        notification.type === "application_accepted" ||
        notification.type === "job_started" ||
        notification.type === "job_completed" ||
        notification.type === "payment_received"
      ) {
        return `/tasker/my-jobs/${notification.related_job_id}`;
      }
      // For job offers visible to taskers
      return `/job-offer/${notification.related_job_id}`;
    }

    // Priority 4: Service-related notifications
    if (notification.related_service_id) {
      // For tasker's own services
      if (
        notification.type === "service_created" ||
        notification.type === "service_updated"
      ) {
        return `/tasker/my-services/${notification.related_service_id}`;
      }
      // For public service offers
      return `/service-offer/${notification.related_service_id}`;
    }

    // Priority 5: Message-related notifications (redirect to messages page)
    if (notification.type === "message_received") {
      // If related to a job, try to find the conversation
      if (notification.related_job_id) {
        return `/tasker/messages`; // Will need to find conversation by job_id
      }
      return `/tasker/messages`;
    }

    // Priority 6: User profile
    if (notification.related_user_id) {
      return `/profile/${notification.related_user_id}`;
    }

    // Default: no redirect
    return null;
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      const redirectUrl = getNotificationRedirectUrl(notification);
      
      if (redirectUrl) {
        // Mark as read if not already read
        if (!notification.is_read && user?.id) {
          try {
            await markNotificationAsRead(notification.id, user.id);
            // Update local state
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notification.id ? { ...n, is_read: true } : n
              )
            );
            // Update counts
            if (totalUnread > 0) {
              setTotalUnread((prev) => Math.max(0, prev - 1));
              setTotalRead((prev) => prev + 1);
            }
          } catch (error) {
            console.error("Error marking notification as read:", error);
          }
        }
        
        // Navigate to the redirect URL
        router.push(redirectUrl);
      }
    },
    [getNotificationRedirectUrl, router, totalUnread]
  );

  // Fetch notifications with pagination (10 per page)
  const fetchNotifications = useCallback(
    async (isRefresh = false, append = false) => {
      if (!user?.id) return;

      if (append) {
        setIsLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const offset = append ? currentOffsetRef.current : 0;
        const result = await getNotifications(
          user.id,
          {
            is_read: filter === "all" ? undefined : filter === "read",
          },
          {
            field: "created_at",
            ascending: sortBy === "oldest",
          },
          10, // limit: 10 notifications per page
          offset,
          !append || offset === 0 // includeTotal only on first load or refresh
        );

        if (result.error) {
          console.error("Error fetching notifications:", result.error);
          setError(t("errors.fetchFailed"));
          if (!append) {
            toast({
              variant: "destructive",
              title: t("errors.fetchFailed"),
            });
          }
        } else {
          if (append) {
            // Append new notifications to existing ones
            setNotifications((prev) => {
              const newData = result.data || [];
              // Avoid duplicates
              const existingIds = new Set(prev.map(n => n.id));
              const uniqueNew = newData.filter(n => !existingIds.has(n.id));
              return [...prev, ...uniqueNew];
            });
            const newOffset = currentOffsetRef.current + (result.data || []).length;
            setCurrentOffset(newOffset);
            currentOffsetRef.current = newOffset;
          } else {
            // Replace notifications on initial load or refresh
            setNotifications(result.data || []);
            const newOffset = (result.data || []).length;
            setCurrentOffset(newOffset);
            currentOffsetRef.current = newOffset;
          }
          
          // Update counts from database (true values) - only if provided
          // Don't update if undefined (e.g., during "Load More" when includeTotal is false)
          if (result.total !== undefined && result.total !== null) {
            setTotal(result.total);
          }
          if (result.totalRead !== undefined && result.totalRead !== null) {
            setTotalRead(result.totalRead);
          }
          if (result.totalUnread !== undefined && result.totalUnread !== null) {
            setTotalUnread(result.totalUnread);
            setUnreadCount(result.totalUnread);
          }
          
          // Update pagination state - always update hasMore
          setHasMore(result.hasMore ?? false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t("errors.fetchFailed"));
        if (!append) {
          toast({
            variant: "destructive",
            title: t("errors.fetchFailed"),
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [user?.id, t, filter, sortBy]
  );

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      fetchNotifications(false, true);
    }
  }, [isLoadingMore, hasMore, loading, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(false, false);
    }
  }, [user?.id]);

  // Refresh notifications when filter or sort changes (reset pagination)
  useEffect(() => {
    if (user?.id) {
      setCurrentOffset(0);
      currentOffsetRef.current = 0;
      setHasMore(false);
      fetchNotifications(false, false);
    }
  }, [filter, sortBy]);

  // Use realtime hook to update notifications in real-time
  // Memoize callbacks to prevent reconnection loops
  const handleNewNotification = useCallback((notification: Notification) => {
    // Add new notification to the top of the list
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });
    // Update counts
    if (!notification.is_read) {
      setUnreadCount((prev) => prev + 1);
      setTotalUnread((prev) => prev + 1);
    }
    setTotal((prev) => prev + 1);
  }, []);

  const handleNotificationUpdate = useCallback((notification: Notification) => {
    // Update existing notification and counts
    setNotifications((prev) => {
      const oldNotification = prev.find((n) => n.id === notification.id);
      const updated = prev.map((n) => (n.id === notification.id ? notification : n));
      
      // Update counts if read status changed
      if (oldNotification && oldNotification.is_read !== notification.is_read) {
        if (notification.is_read) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
          setTotalUnread((prevCount) => Math.max(0, prevCount - 1));
          setTotalRead((prevCount) => prevCount + 1);
        } else {
          setUnreadCount((prevCount) => prevCount + 1);
          setTotalUnread((prevCount) => prevCount + 1);
          setTotalRead((prevCount) => Math.max(0, prevCount - 1));
        }
      }
      return updated;
    });
  }, []);

  useNotificationRealtime({
    userId: user?.id || null,
    enabled: !!user?.id,
    onNewNotification: handleNewNotification,
    onNotificationUpdate: handleNotificationUpdate,
  });

  // Removed automatic scroll loading - user must click "Load More" button

  // Get notificationId from URL using window.location (client-side only)
  const [notificationId, setNotificationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("notificationId");
      setNotificationId(id);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await markNotificationAsRead(notificationId, user.id);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast({
          variant: "success",
          title: t("success.markedAsRead"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("errors.markReadFailed"),
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: t("errors.markReadFailed"),
      });
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteNotification(notificationId, user.id);

      if (result.success) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast({
          variant: "success",
          title: t("success.deleted"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("errors.deleteFailed"),
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: t("errors.deleteFailed"),
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const result = await markAllNotificationsAsRead(user.id);

      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast({
          variant: "success",
          title: t("success.allMarkedAsRead"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("errors.markAllReadFailed"),
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: t("errors.markAllReadFailed"),
      });
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "read" | "unread" | "delete") => {
    if (!user?.id || selectedNotifications.size === 0) return;

    const notificationIds = Array.from(selectedNotifications);

    try {
      const result = await bulkUpdateNotifications(
        notificationIds,
        user.id,
        action
      );

      if (result.success) {
        if (action === "delete") {
          setNotifications((prev) =>
            prev.filter((n) => !selectedNotifications.has(n.id))
          );
          const deletedUnreadCount = notifications.filter(
            (n) => selectedNotifications.has(n.id) && !n.is_read
          ).length;
          setUnreadCount((prev) => Math.max(0, prev - deletedUnreadCount));
          toast({
            variant: "success",
            title: t("success.bulkDeleted", {
              count: result.count || notificationIds.length,
            }),
          });
        } else {
          setNotifications((prev) =>
            prev.map((n) =>
              selectedNotifications.has(n.id)
                ? { ...n, is_read: action === "read" }
                : n
            )
          );

          const affectedUnreadCount = notifications.filter(
            (n) => selectedNotifications.has(n.id) && !n.is_read
          ).length;

          if (action === "read") {
            setUnreadCount((prev) => Math.max(0, prev - affectedUnreadCount));
          } else {
            setUnreadCount((prev) => prev + affectedUnreadCount);
          }

          toast({
            variant: "success",
            title: t(`success.bulkMarked${action}`, {
              count: result.count || notificationIds.length,
            }),
          });
        }

        setSelectedNotifications(new Set());
        setBulkActionMode(false);
      } else {
        toast({
          variant: "destructive",
          title: t("errors.bulkActionFailed"),
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: t("errors.bulkActionFailed"),
      });
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Select all visible notifications
  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map((n) => n.id);
    setSelectedNotifications(new Set(visibleIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications(new Set());
    setBulkActionMode(false);
  };

  // Filter and sort notifications with memoization
  const filteredNotifications = useMemo(() => {
    const filtered = notifications.filter((notification) => {
      // Filter by read status
      if (filter === "unread") {
        if (notification.is_read) return false;
      } else if (filter === "read") {
        if (!notification.is_read) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query) ||
          getNotificationTypeLabel(notification.type, t)
            .toLowerCase()
            .includes(query)
        );
      }

      return true;
    });

    // Sort notifications
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at!).getTime();
      const dateB = new Date(b.created_at!).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [notifications, filter, searchQuery, sortBy]);

  // Display all filtered notifications (no lazy loading)
  const displayedNotifications = filteredNotifications;

  // Group notifications by date with memoization
  const groupedNotifications = useMemo(() => {
    return displayedNotifications.reduce<{
      [date: string]: Notification[];
    }>((groups, notification) => {
      // Use short date format DD.MM.YYYY
      const date = formatDateShort(notification.created_at!);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  }, [displayedNotifications]);

  // Use database values for stats (true counts from DB)
  const notificationStats = useMemo(() => {
    return { total, unread: totalUnread, read: totalRead };
  }, [total, totalUnread, totalRead]);

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return t("time.justNow");
    if (diffInMinutes < 60)
      return t("time.minutesAgo", { minutes: diffInMinutes });
    if (diffInHours < 24) return t("time.hoursAgo", { hours: diffInHours });
    if (diffInDays < 7) return t("time.daysAgo", { days: diffInDays });
    // HYDRATION-SAFE: Use explicit locale to prevent hydration mismatches
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] mobile-spacing">
        <div className="text-center max-w-sm mx-auto">
          <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="mobile-text-lg font-semibold mb-2 text-foreground">
            {t("errors.notLoggedIn")}
          </h2>
          <p className="text-muted-foreground mobile-leading">
            {t("errors.loginRequired")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Modern container with enhanced spacing */}
      <div className="max-w-6xl mx-auto mobile-spacing space-y-8">
        {/* Enhanced Header Section */}
        <div className="space-y-6">
          {/* Back Button and Title Row with enhanced styling */}
          <div className="flex items-center gap-4">
            <BackButton className="mobile-button p-3 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BellDot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h1 className="mobile-text-xl sm:text-3xl font-bold text-foreground">
                  {t("title")}
                </h1>
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 animate-pulse"
                  >
                    {unreadCount} {t("badges.new")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mobile-text-sm sm:text-base mobile-leading">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Enhanced Action Bar with Statistics */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 space-y-4">
            {/* Statistics Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-foreground">
                    {notificationStats.total} {t("stats.total")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-foreground">
                    {notificationStats.unread} {t("stats.unread")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-foreground">
                    {notificationStats.read} {t("stats.read")}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(true)}
                disabled={refreshing}
                className="mobile-button"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? t("actions.refreshing") : t("actions.refresh")}
              </Button>
            </div>

            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent mobile-focus-ring"
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mobile-button flex-1 hover:bg-accent/50"
                    >
                      <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">
                        {t("filters." + filter)}
                      </span>
                      <span className="sm:hidden">
                        {t("filters." + filter)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setFilter("all")}>
                      {t("filters.all")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("unread")}>
                      {t("filters.unread")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("read")}>
                      {t("filters.read")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mobile-button flex-1 hover:bg-accent/50"
                    >
                      {sortBy === "newest" ? (
                        <SortDesc className="h-4 w-4 mr-2 flex-shrink-0" />
                      ) : (
                        <SortAsc className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="hidden sm:inline">
                        {t("sort." + sortBy)}
                      </span>
                      <span className="sm:hidden">{t("sort." + sortBy)}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      {t("sort.newest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      {t("sort.oldest")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={!notifications.some((n) => !n.is_read)}
                  className="mobile-button flex-1 hover:bg-accent/50"
                >
                  <MailOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {t("actions.markAllRead")}
                  </span>
                  <span className="sm:hidden truncate">Mark All</span>
                </Button>

                {filteredNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkActionMode(!bulkActionMode)}
                    className="mobile-button flex-1 hover:bg-accent/50"
                  >
                    <MoreVertical className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">
                      {bulkActionMode
                        ? t("actions.cancelSelection")
                        : t("actions.selectMultiple")}
                    </span>
                    <span className="sm:hidden truncate">Select</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {bulkActionMode && (
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-accent/50">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllVisible}
                    className="mobile-button"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("actions.selectAll")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="mobile-button"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("actions.clearSelection")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedNotifications.size} {t("actions.selected")}
                  </span>
                </div>

                {selectedNotifications.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("read")}
                      className="mobile-button"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("actions.markRead")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("unread")}
                      className="mobile-button"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      {t("actions.markUnread")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction("delete")}
                      className="mobile-button"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("actions.delete")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 mobile-spacing">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-destructive mobile-leading">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(true)}
                className="mobile-button flex-shrink-0"
              >
                {t("actions.retry")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Notifications List */}
        {loading ? (
          <div className="space-y-8">
            <NotificationStatsSkeleton />
            <NotificationListSkeleton count={6} />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-dashed border-2 border-muted/50 bg-gradient-to-br from-card to-accent/5">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 rounded-full bg-muted/20 mb-6">
                <BellDot className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mobile-text-lg font-semibold mb-3 text-foreground text-center">
                {t("empty.title")}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mobile-leading">
                {t("empty.description")}
              </p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border-dashed border-2 border-muted/50 bg-gradient-to-br from-card to-accent/5">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 rounded-full bg-muted/20 mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mobile-text-lg font-semibold mb-3 text-foreground text-center">
                {t("search.noResults")}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mobile-leading mb-6">
                {t("search.noResultsDescription")}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="mobile-button"
              >
                <X className="h-4 w-4 mr-2" />
                {t("search.clearFilters")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 smooth-scroll">
            {Object.entries(groupedNotifications).map(
              ([date, notifications]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
                    <h2 className="text-sm font-semibold text-muted-foreground bg-background px-4 py-2 rounded-full border">
                      {date}
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((notification, index) => {
                      const redirectUrl = getNotificationRedirectUrl(notification);
                      const isClickable = !!redirectUrl;
                      
                      return (
                      <Card
                        key={notification.id}
                        id={`notification-${notification.id}`}
                        className={`group notification-card mobile-focus-ring transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          !notification.is_read
                            ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30 shadow-md"
                            : "bg-card hover:bg-accent/20 border-border/50"
                        } ${
                          selectedNotifications.has(notification.id)
                            ? "ring-2 ring-primary/50 bg-primary/5"
                            : ""
                        } ${
                          isClickable && !bulkActionMode
                            ? "cursor-pointer"
                            : ""
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                        onClick={() => {
                          if (isClickable && !bulkActionMode) {
                            handleNotificationClick(notification);
                          }
                        }}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start gap-4">
                            {/* Selection Checkbox */}
                            {bulkActionMode && (
                              <div className="flex items-center pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedNotifications.has(
                                    notification.id
                                  )}
                                  onChange={() =>
                                    toggleNotificationSelection(notification.id)
                                  }
                                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                />
                              </div>
                            )}

                            {/* Notification Icon */}
                            <div
                              className={`p-3 rounded-xl border ${getNotificationColor(
                                notification.type
                              )} flex-shrink-0`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground mobile-text-base mobile-text-optimized leading-tight">
                                      {getDisplayText(notification).title}
                                    </h3>
                                    {!notification.is_read && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 text-xs"
                                      >
                                        {t("badges.new")}
                                      </Badge>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getNotificationTypeLabel(
                                        notification.type,
                                        t
                                      )}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mobile-leading leading-relaxed">
                                    {getDisplayText(notification).message}
                                  </p>
                                </div>
                              </div>

                              {/* Action Links and Metadata */}
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {getRelativeTime(notification.created_at!)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {notification.related_job_id && (
                                    <Link
                                      href={`/jobs/${notification.related_job_id}`}
                                      className="text-primary hover:text-primary/80 hover:underline touch-target font-medium transition-colors"
                                    >
                                      {t("actions.viewJob")}
                                    </Link>
                                  )}
                                  {notification.related_user_id && (
                                    <Link
                                      href={`/profile/${notification.related_user_id}`}
                                      className="text-primary hover:text-primary/80 hover:underline touch-target font-medium transition-colors"
                                    >
                                      {t("actions.viewProfile")}
                                    </Link>
                                  )}
                                  {notification.action_url && (
                                    <Link
                                      href={notification.action_url}
                                      className="text-primary hover:text-primary/80 hover:underline touch-target font-medium transition-colors"
                                    >
                                      {t("actions.viewDetails")}
                                    </Link>
                                  )}
                                  {/* Lien vers les refunds pour les notifications wallet */}
                                  {(notification.type === 'wallet_refund_approved' || 
                                    notification.type === 'wallet_refund_rejected' ||
                                    notification.type === 'wallet_refund_request_created' ||
                                    notification.type === 'wallet_refund_payment_confirmed' ||
                                    notification.type === 'wallet_low_balance') && (
                                    <Link
                                      href="/tasker/finance/refunds"
                                      className="text-primary hover:text-primary/80 hover:underline touch-target font-medium transition-colors"
                                    >
                                      {notification.type === 'wallet_low_balance' 
                                        ? t("actions.viewFinance", { default: "View Finance" })
                                        : t("actions.viewRefunds", { default: "View Refunds" })}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {!bulkActionMode && (
                              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    title={t("actions.markAsRead")}
                                    className="mobile-button p-2 rounded-full hover:bg-accent/50 transition-colors"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mobile-button p-2 rounded-full hover:bg-accent/50 transition-colors"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    {!notification.is_read ? (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {t("actions.markAsRead")}
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        {t("actions.markAsUnread")}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteNotification(
                                          notification.id
                                        )
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t("actions.delete")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                </div>
              )
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={loadMoreNotifications}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="mobile-button"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t("actions.loading")}
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 mr-2" />
                      {t("actions.loadMore")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

      </div>
      <NotificationScrollHandler
        notificationId={notificationId}
        notifications={notifications}
        user={user}
        markAsRead={markAsRead}
        router={router}
      />
    </div>
  );
}
