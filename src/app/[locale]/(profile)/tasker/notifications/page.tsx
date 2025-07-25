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
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      toast.error(t("errors.fetchFailed"));
    } else {
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    }
    setLoading(false);
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
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    if (!user?.id) return;

    const supabase = createClient();
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
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success(t("success.markedAsRead"));
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    if (!user?.id) return;

    const supabase = createClient();
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
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    const supabase = createClient();
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {t("errors.notLoggedIn")}
          </h2>
          <p className="text-muted-foreground">{t("errors.loginRequired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BellDot className="h-8 w-8" />
              {t("title")}
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("filters." + filter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
          >
            <MailOpen className="h-4 w-4 mr-2" />
            {t("actions.markAllRead")}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BellDot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("empty.title")}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                {date}
              </h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-colors ${
                      !notification.is_read
                        ? "bg-primary/5 border-primary/20"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {t("badges.new")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                notification.created_at!
                              ).toLocaleTimeString()}
                            </span>
                            {notification.related_job_id && (
                              <Link
                                href={`/jobs/${notification.related_job_id}`}
                                className="text-primary hover:underline"
                              >
                                {t("actions.viewJob")}
                              </Link>
                            )}
                            {notification.related_user_id && (
                              <Link
                                href={`/profile/${notification.related_user_id}`}
                                className="text-primary hover:underline"
                              >
                                {t("actions.viewProfile")}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
