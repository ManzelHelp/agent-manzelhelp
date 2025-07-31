"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  Eye,
  ChevronRight,
  TrendingUp,
  Users,
  Bell,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import type { Notification, Message } from "@/types/supabase";

interface DashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<
    (Message & { client: string; unread: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      const supabase = createClient();

      try {
        // Fetch stats
        await fetchStats(supabase);

        // Fetch notifications
        await fetchNotifications(supabase);

        // Fetch recent messages
        await fetchMessages(supabase);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchStats = async (supabase: ReturnType<typeof createClient>) => {
    if (!user) return;

    setStatsLoading(true);
    try {
      // Get user stats
      const { data: userStats, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("id", user.id)
        .single();

      // Get active bookings (in_progress, confirmed)
      const { data: activeBookings, error: activeError } = await supabase
        .from("service_bookings")
        .select("id, status, agreed_price")
        .eq("tasker_id", user.id)
        .in("status", ["confirmed", "in_progress"]);

      // Get completed bookings
      const { data: completedBookings, error: completedError } = await supabase
        .from("service_bookings")
        .select("id, agreed_price, completed_at")
        .eq("tasker_id", user.id)
        .eq("status", "completed");

      // Get this month's earnings
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const { data: monthlyBookings, error: monthlyError } = await supabase
        .from("service_bookings")
        .select("agreed_price")
        .eq("tasker_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", firstDayOfMonth.toISOString())
        .lte("completed_at", lastDayOfMonth.toISOString());

      if (statsError) console.error("Error fetching user stats:", statsError);
      if (activeError)
        console.error("Error fetching active bookings:", activeError);
      if (completedError)
        console.error("Error fetching completed bookings:", completedError);
      if (monthlyError)
        console.error("Error fetching monthly bookings:", monthlyError);

      const totalEarnings = userStats?.total_earnings || 0;
      const completedJobs =
        userStats?.completed_jobs || completedBookings?.length || 0;
      const activeJobs = activeBookings?.length || 0;
      const monthlyEarnings =
        monthlyBookings?.reduce(
          (sum, booking) => sum + (booking.agreed_price || 0),
          0
        ) || 0;

      setStats({
        activeJobs,
        completedJobs,
        totalEarnings,
        monthlyEarnings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchNotifications = async (
    supabase: ReturnType<typeof createClient>
  ) => {
    if (!user) return;

    setNotificationsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchMessages = async (supabase: ReturnType<typeof createClient>) => {
    if (!user) return;

    setMessagesLoading(true);
    try {
      // Get recent messages where user is either sender or receiver
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(first_name, last_name, avatar_url),
          receiver:users!messages_receiver_id_fkey(first_name, last_name, avatar_url)
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      // Process messages to show the other person's name
      const processedMessages = (data || []).map(
        (
          message: Message & {
            sender?: { first_name?: string; last_name?: string };
            receiver?: { first_name?: string; last_name?: string };
          }
        ) => ({
          ...message,
          client:
            message.sender_id === user.id
              ? `${message.receiver?.first_name || ""} ${
                  message.receiver?.last_name || ""
                }`.trim() || "Unknown"
              : `${message.sender?.first_name || ""} ${
                  message.sender?.last_name || ""
                }`.trim() || "Unknown",
          unread: !message.is_read && message.receiver_id === user.id,
        })
      );

      setMessages(processedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_received":
      case "payment_confirmed":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "booking_confirmed":
      case "booking_created":
      case "booking_accepted":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "message_received":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "job_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "payment_received":
      case "payment_confirmed":
        return "bg-green-100 group-hover:bg-green-200";
      case "booking_confirmed":
      case "booking_created":
      case "booking_accepted":
        return "bg-blue-100 group-hover:bg-blue-200";
      case "message_received":
        return "bg-purple-100 group-hover:bg-purple-200";
      case "job_completed":
        return "bg-green-100 group-hover:bg-green-200";
      default:
        return "bg-gray-100 group-hover:bg-gray-200";
    }
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-lg text-[var(--color-text-primary)]">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mobile-text-optimized">
              Tasker Dashboard
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 mobile-leading">
              Welcome back! Here's an overview of your business
            </p>
          </div>
        </div>

        {/* Stats Overview - Mobile First Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Active Jobs
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.activeJobs}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Currently in progress
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Completed
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.completedJobs}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Total completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Total Earnings
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-200">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.totalEarnings.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    All time earnings
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                This Month
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-200">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.monthlyEarnings.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Monthly earnings
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Notifications - Mobile Optimized Layout */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasker/post-service" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white border-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Add New Service
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/bookings" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-secondary)]/10 rounded-full">
                      <Eye className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Tasks & Bookings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/finance" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Earnings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/messages" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full relative">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      {messages.filter((m) => m.unread).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {messages.filter((m) => m.unread).length}
                        </span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Check Messages
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/reviews" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Reviews
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Bell className="h-5 w-5 text-[var(--color-secondary)]" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        !notification.is_read
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                          : "bg-[var(--color-accent)] border-[var(--color-border)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${getNotificationBgColor(
                            notification.type
                          )} transition-colors duration-200`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)]">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <Link href="/tasker/notifications" className="block">
                      <Button
                        variant="ghost"
                        className="w-full h-12 sm:h-14 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                      >
                        View All Notifications
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages Section */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--color-secondary)]" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {messages.slice(0, 3).map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                      message.unread
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                        : "bg-[var(--color-accent)] border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)]">
                            {message.client}
                          </h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                          {formatTimeAgo(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length > 3 && (
                  <Link href="/tasker/messages" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12 sm:h-14 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                    >
                      View All Messages
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
