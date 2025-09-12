"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import type { Notification, NotificationType } from "@/types/supabase";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  bulkUpdateNotifications,
} from "@/actions/notifications";
import {
  NotificationListSkeleton,
  NotificationStatsSkeleton,
} from "@/components/notifications/NotificationSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BellDot,
  CheckCircle,
  Clock,
  Filter,
  MailOpen,
  Trash2,
  X,
  ArrowLeft,
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

// Notification type icons mapping
const getNotificationIcon = (type: NotificationType) => {
  const iconMap: Record<NotificationType, React.ReactNode> = {
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
    service_created: <Star className="h-4 w-4" />,
    service_updated: <Settings className="h-4 w-4" />,
    payment_confirmed: <CreditCard className="h-4 w-4" />,
    payment_pending: <AlertTriangle className="h-4 w-4" />,
  };
  return iconMap[type] || <BellDot className="h-4 w-4" />;
};

// Notification type colors
const getNotificationColor = (type: NotificationType) => {
  const colorMap: Record<NotificationType, string> = {
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
    service_created:
      "text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-800",
    service_updated:
      "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800",
    payment_confirmed:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
    payment_pending:
      "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800",
  };
  return (
    colorMap[type] ||
    "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800"
  );
};

// Notification type labels
const getNotificationTypeLabel = (type: NotificationType) => {
  const labelMap: Record<NotificationType, string> = {
    job_created: "New Job",
    application_received: "Application",
    application_accepted: "Accepted",
    job_completed: "Completed",
    payment_received: "Payment",
    message_received: "Message",
    booking_created: "Booking",
    booking_accepted: "Accepted",
    booking_confirmed: "Confirmed",
    booking_cancelled: "Cancelled",
    booking_completed: "Completed",
    booking_reminder: "Reminder",
    service_created: "Service",
    service_updated: "Updated",
    payment_confirmed: "Confirmed",
    payment_pending: "Pending",
  };
  return labelMap[type] || "Notification";
};

export default function NotificationsPage() {
  const { user } = useUserStore();
  const t = useTranslations("notifications");
  const router = useRouter();

  // Check user role and redirect if needed
  useEffect(() => {
    if (user && user.role === "customer") {
      router.push("/customer/dashboard");
    }
  }, [user, router]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Fetch notifications using server action
  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await getNotifications(
          user.id,
          {
            is_read: filter === "all" ? undefined : filter === "read",
          },
          {
            field: "created_at",
            ascending: sortBy === "oldest",
          }
        );

        if (result.error) {
          console.error("Error fetching notifications:", result.error);
          setError(t("errors.fetchFailed"));
          toast.error(t("errors.fetchFailed"));
        } else {
          setNotifications(result.data || []);
          setUnreadCount(result.data?.filter((n) => !n.is_read).length || 0);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t("errors.fetchFailed"));
        toast.error(t("errors.fetchFailed"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, t, filter, sortBy]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh notifications when filter or sort changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(true);
    }
  }, [filter, sortBy, user?.id, fetchNotifications]);

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
        toast.success(t("success.markedAsRead"));
      } else {
        toast.error(result.error || t("errors.markReadFailed"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.markReadFailed"));
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
        toast.success(t("success.deleted"));
      } else {
        toast.error(result.error || t("errors.deleteFailed"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.deleteFailed"));
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
        toast.success(t("success.allMarkedAsRead"));
      } else {
        toast.error(result.error || t("errors.markAllReadFailed"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.markAllReadFailed"));
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
          toast.success(
            t("success.bulkDeleted", {
              count: result.count || notificationIds.length,
            })
          );
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

          toast.success(
            t(`success.bulkMarked${action}`, {
              count: result.count || notificationIds.length,
            })
          );
        }

        setSelectedNotifications(new Set());
        setBulkActionMode(false);
      } else {
        toast.error(result.error || t("errors.bulkActionFailed"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.bulkActionFailed"));
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
          getNotificationTypeLabel(notification.type)
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

  // Group notifications by date with memoization
  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce<{
      [date: string]: Notification[];
    }>((groups, notification) => {
      const date = new Date(notification.created_at!).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  }, [filteredNotifications]);

  // Get notification statistics
  const notificationStats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.is_read).length;
    const read = total - unread;

    return { total, unread, read };
  }, [notifications]);

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
    return date.toLocaleDateString();
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mobile-button p-3 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                    {notifications.map((notification, index) => (
                      <Card
                        key={notification.id}
                        className={`group notification-card mobile-focus-ring transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          !notification.is_read
                            ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30 shadow-md"
                            : "bg-card hover:bg-accent/20 border-border/50"
                        } ${
                          selectedNotifications.has(notification.id)
                            ? "ring-2 ring-primary/50 bg-primary/5"
                            : ""
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
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
                                      {notification.title}
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
                                        notification.type
                                      )}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mobile-leading leading-relaxed">
                                    {notification.message}
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
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
