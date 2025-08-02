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
  AlertCircle,
  Home,
  Briefcase,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import type {
  Notification,
  Message,
  ServiceBooking,
  Job,
} from "@/types/supabase";

interface DashboardStats {
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  monthlySpent: number;
  activeJobs: number;
  completedJobs: number;
  savedAddresses: number;
}

interface BookingWithDetails extends ServiceBooking {
  tasker?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  tasker_service?: {
    title?: string;
  };
}

interface JobWithDetails extends Job {
  service?: {
    name_en?: string;
    name_fr?: string;
    name_ar?: string;
  };
}

interface MessageWithDetails extends Message {
  client: string;
  unread: boolean;
  conversation?: {
    participant1_id: string;
    participant2_id: string;
  };
}

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    monthlySpent: 0,
    activeJobs: 0,
    completedJobs: 0,
    savedAddresses: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [activeBookings, setActiveBookings] = useState<BookingWithDetails[]>(
    []
  );
  const [activeJobs, setActiveJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setError(null);
      const supabase = createClient();

      try {
        // Fetch all data in parallel for better performance
        await Promise.allSettled([
          fetchStats(supabase),
          fetchNotifications(supabase),
          fetchMessages(supabase),
          fetchActiveBookings(supabase),
          fetchActiveJobs(supabase),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
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
        .maybeSingle();

      if (statsError && statsError.code !== "PGRST116") {
        console.error("Error fetching user stats:", statsError);
        throw statsError;
      }

      // Get active bookings (confirmed, in_progress)
      const { data: activeBookings, error: activeBookingsError } =
        await supabase
          .from("service_bookings")
          .select("id, status, agreed_price")
          .eq("customer_id", user.id)
          .in("status", ["confirmed", "in_progress"]);

      if (activeBookingsError) {
        console.error("Error fetching active bookings:", activeBookingsError);
        throw activeBookingsError;
      }

      // Get completed bookings
      const { data: completedBookings, error: completedBookingsError } =
        await supabase
          .from("service_bookings")
          .select("id, agreed_price, completed_at")
          .eq("customer_id", user.id)
          .eq("status", "completed");

      if (completedBookingsError) {
        console.error(
          "Error fetching completed bookings:",
          completedBookingsError
        );
        throw completedBookingsError;
      }

      // Get active jobs (active, assigned, in_progress)
      const { data: activeJobs, error: activeJobsError } = await supabase
        .from("jobs")
        .select("id, status")
        .eq("customer_id", user.id)
        .in("status", ["active", "assigned", "in_progress"]);

      if (activeJobsError) {
        console.error("Error fetching active jobs:", activeJobsError);
        throw activeJobsError;
      }

      // Get completed jobs
      const { data: completedJobs, error: completedJobsError } = await supabase
        .from("jobs")
        .select("id, completed_at")
        .eq("customer_id", user.id)
        .eq("status", "completed");

      if (completedJobsError) {
        console.error("Error fetching completed jobs:", completedJobsError);
        throw completedJobsError;
      }

      // Get this month's spending
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

      const { data: monthlyBookings, error: monthlyBookingsError } =
        await supabase
          .from("service_bookings")
          .select("agreed_price")
          .eq("customer_id", user.id)
          .eq("status", "completed")
          .gte("completed_at", firstDayOfMonth.toISOString())
          .lte("completed_at", lastDayOfMonth.toISOString());

      if (monthlyBookingsError) {
        console.error("Error fetching monthly bookings:", monthlyBookingsError);
        throw monthlyBookingsError;
      }

      // Get saved addresses
      const { data: addresses, error: addressesError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id);

      if (addressesError) {
        console.error("Error fetching addresses:", addressesError);
        throw addressesError;
      }

      // Calculate stats with fallbacks for missing data
      const totalSpent = userStats?.total_spent || 0;
      const activeBookingsCount = activeBookings?.length || 0;
      const completedBookingsCount = completedBookings?.length || 0;
      const activeJobsCount = activeJobs?.length || 0;
      const completedJobsCount = completedJobs?.length || 0;
      const savedAddressesCount = addresses?.length || 0;
      const monthlySpent =
        monthlyBookings?.reduce(
          (sum, booking) => sum + (booking.agreed_price || 0),
          0
        ) || 0;

      setStats({
        activeBookings: activeBookingsCount,
        completedBookings: completedBookingsCount,
        totalSpent,
        monthlySpent,
        activeJobs: activeJobsCount,
        completedJobs: completedJobsCount,
        savedAddresses: savedAddressesCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Don't throw here, just log the error and continue with default values
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
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Continue with empty array
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchMessages = async (supabase: ReturnType<typeof createClient>) => {
    if (!user) return;

    setMessagesLoading(true);
    try {
      // Get conversations where user is a participant
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })
        .limit(5);

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw conversationsError;
      }

      if (!conversations || conversations.length === 0) {
        setMessages([]);
        return;
      }

      // Get recent messages from these conversations
      const conversationIds = conversations.map((c) => c.id);
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(first_name, last_name, avatar_url),
          conversation:conversations!messages_conversation_id_fkey(participant1_id, participant2_id)
        `
        )
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        throw messagesError;
      }

      // Process messages to show the other person's name and determine if unread
      const processedMessages = (messages || []).map(
        (
          message: Message & {
            sender?: { first_name?: string; last_name?: string };
            conversation?: { participant1_id: string; participant2_id: string };
          }
        ) => {
          return {
            ...message,
            client:
              `${message.sender?.first_name || ""} ${
                message.sender?.last_name || ""
              }`.trim() || "Unknown",
            unread: !message.is_read && message.sender_id !== user.id,
          };
        }
      );

      // Sort by conversation and take the latest message from each
      const latestMessages = processedMessages
        .sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
        .filter(
          (message, index, self) =>
            index ===
            self.findIndex((m) => m.conversation_id === message.conversation_id)
        )
        .slice(0, 5);

      setMessages(latestMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Continue with empty array
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchActiveBookings = async (
    supabase: ReturnType<typeof createClient>
  ) => {
    if (!user) return;

    setBookingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_bookings")
        .select(
          `
          *,
          tasker:users!service_bookings_tasker_id_fkey(first_name, last_name, avatar_url),
          tasker_service:tasker_services!service_bookings_tasker_service_id_fkey(title)
        `
        )
        .eq("customer_id", user.id)
        .in("status", ["confirmed", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching active bookings:", error);
        throw error;
      }

      setActiveBookings(data || []);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      setActiveBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchActiveJobs = async (supabase: ReturnType<typeof createClient>) => {
    if (!user) return;

    setJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          service:services!jobs_service_id_fkey(name_en, name_fr, name_ar)
        `
        )
        .eq("customer_id", user.id)
        .in("status", ["active", "assigned", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching active jobs:", error);
        throw error;
      }

      setActiveJobs(data || []);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      setActiveJobs([]);
    } finally {
      setJobsLoading(false);
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Something went wrong
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-md">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            Try Again
          </Button>
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
              Customer Dashboard
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 mobile-leading">
              Welcome back! Here's an overview of your service requests
            </p>
          </div>
        </div>

        {/* Stats Overview - Mobile First Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Active Bookings
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.activeBookings}
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
                Active Jobs
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-200">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
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
                    Posted jobs
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Total Spent
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
                    {stats.totalSpent.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    All time spending
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
                    {stats.monthlySpent.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Monthly spending
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
              <Link href="/customer/create-offer" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white border-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Post New Job
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/customer/bookings" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-secondary)]/10 rounded-full">
                      <Eye className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Bookings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/customer/finance" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Spending
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/customer/messages" className="block">
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

              <Link href="/customer/profile#addresses" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Home className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Manage Addresses
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
                    <Link href="/customer/notifications" className="block">
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

        {/* Active Bookings Section */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--color-secondary)]" />
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active bookings</p>
                <Link href="/customer/create-offer">
                  <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
                    Book a Service
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 sm:p-4 rounded-xl border bg-[var(--color-accent)] border-[var(--color-border)] transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)]">
                            {booking.tasker_service?.title || "Service"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                          {booking.tasker?.first_name}{" "}
                          {booking.tasker?.last_name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                          {formatDate(booking.scheduled_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base text-[var(--color-text-primary)]">
                          {booking.agreed_price} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {activeBookings.length > 3 && (
                  <Link href="/customer/bookings" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12 sm:h-14 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                    >
                      View All Bookings
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs Section */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[var(--color-secondary)]" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active jobs</p>
                <Link href="/customer/create-offer">
                  <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
                    Post a Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 sm:p-4 rounded-xl border bg-[var(--color-accent)] border-[var(--color-border)] transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)]">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === "active"
                                ? "bg-yellow-100 text-yellow-700"
                                : job.status === "assigned"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                          {job.service?.name_en || "Service"}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                          {formatDate(job.preferred_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base text-[var(--color-text-primary)]">
                          {job.customer_budget} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {activeJobs.length > 3 && (
                  <Link href="/customer/create-offer" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12 sm:h-14 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                    >
                      View All Jobs
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <Link href="/customer/messages" className="block">
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
