"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import type { Notification } from "@/types/supabase";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";

export default function NotificationsPage() {
  const { user } = useUserStore();
  const t = useTranslations("notifications");
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        setError(t("errors.fetchFailed"));
        toast.error(t("errors.fetchFailed"));
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t("errors.fetchFailed"));
      toast.error(t("errors.fetchFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    // Subscribe to notifications table changes
    const subscription = supabase
      .channel("notifications_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            // Show toast for new notification
            toast(payload.new.title, {
              description: payload.new.message,
              action: {
                label: t("actions.view"),
                onClick: () => router.push("/tasker/notifications"),
              },
            });
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
            if (!payload.old.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
            // Update unread count if read status changed
            if (payload.old.is_read !== payload.new.is_read) {
              setUnreadCount((prev) =>
                payload.new.is_read ? prev - 1 : prev + 1
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, router, t]);

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error marking notification as read:", error);
        toast.error(t("errors.markReadFailed"));
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success(t("success.markedAsRead"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.markReadFailed"));
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting notification:", error);
        toast.error(t("errors.deleteFailed"));
      } else {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success(t("success.deleted"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.deleteFailed"));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        toast.error(t("errors.markAllReadFailed"));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success(t("success.allMarkedAsRead"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t("errors.markAllReadFailed"));
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce<{
    [date: string]: Notification[];
  }>((groups, notification) => {
    const date = new Date(notification.created_at!).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

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
    <div className="min-h-screen bg-background">
      {/* Mobile-first container with proper spacing */}
      <div className="max-w-4xl mx-auto mobile-spacing space-y-6">
        {/* Header Section - Mobile Optimized */}
        <div className="space-y-4">
          {/* Back Button and Title Row */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mobile-button p-2 rounded-full hover:bg-accent/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="mobile-text-xl sm:text-3xl font-bold flex items-center gap-2 text-foreground">
                <BellDot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                {t("title")}
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs sm:text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mobile-text-sm sm:text-base mt-1 mobile-leading">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mobile-button flex-1"
                  >
                    <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {t("filters." + filter)}
                    </span>
                    <span className="sm:hidden">{t("filters." + filter)}</span>
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

              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={!notifications.some((n) => !n.is_read)}
                className="mobile-button flex-1"
              >
                <MailOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline truncate">
                  {t("actions.markAllRead")}
                </span>
                <span className="sm:hidden truncate">Mark All</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="mobile-button w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? t("actions.refreshing") : t("actions.refresh")}
            </Button>
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

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-muted-foreground mobile-text-sm">
                Loading notifications...
              </p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="mobile-spacing">
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <BellDot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="mobile-text-lg font-medium mb-2 text-foreground text-center">
                {t("empty.title")}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mobile-leading">
                {t("empty.description")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 smooth-scroll">
            {Object.entries(groupedNotifications).map(
              ([date, notifications]) => (
                <div key={date}>
                  <h2 className="text-sm font-medium text-muted-foreground mb-4 px-1">
                    {date}
                  </h2>
                  <div className="notification-spacing">
                    {notifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`notification-card mobile-focus-ring ${
                          !notification.is_read
                            ? "bg-primary/5 border-primary/20 shadow-sm"
                            : "bg-card hover:bg-accent/30"
                        }`}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium truncate text-foreground mobile-text-base mobile-text-optimized">
                                  {notification.title}
                                </h3>
                                {!notification.is_read && (
                                  <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {t("badges.new")}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 mobile-leading">
                                {notification.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getRelativeTime(notification.created_at!)}
                                </span>
                                {notification.related_job_id && (
                                  <Link
                                    href={`/jobs/${notification.related_job_id}`}
                                    className="text-primary hover:underline touch-target"
                                  >
                                    {t("actions.viewJob")}
                                  </Link>
                                )}
                                {notification.related_user_id && (
                                  <Link
                                    href={`/profile/${notification.related_user_id}`}
                                    className="text-primary hover:underline touch-target"
                                  >
                                    {t("actions.viewProfile")}
                                  </Link>
                                )}
                                {notification.action_url && (
                                  <Link
                                    href={notification.action_url}
                                    className="text-primary hover:underline touch-target"
                                  >
                                    {t("actions.viewDetails")}
                                  </Link>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  title={t("actions.markAsRead")}
                                  className="mobile-button p-2 rounded-full hover:bg-accent/50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                title={t("actions.delete")}
                                className="mobile-button p-2 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
