"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import {
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  Eye,
  ChevronRight,
  Bell,
  Calendar,
  Loader2,
  AlertCircle,
  Star,
  Award,
  Target,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Briefcase,
  Wallet,
} from "lucide-react";

// Utils and Types
import { useUserStore } from "@/stores/userStore";
import type { Notification } from "@/types/supabase";
import {
  fetchAllDashboardData,
  type DashboardStats,
  type RecentActivity,
  type ProcessedMessage,
} from "@/actions/dashboard";

/**
 * Modern Tasker Dashboard Component
 *
 * Features:
 * - Comprehensive business metrics and KPIs
 * - Real-time activity feed
 * - Mobile-first responsive design
 * - Optimized Supabase data fetching
 * - Modern UI with animations and interactions
 */
export default function DashboardPage() {
  // State management for dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: 0,
    completionRate: 0,
    totalServices: 0,
    activeServices: 0,
    upcomingBookings: 0,
    recentBookings: 0,
    walletBalance: 0,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ProcessedMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Loading states for different sections
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setError(null);
      setStatsLoading(true);
      setNotificationsLoading(true);
      setMessagesLoading(true);
      setActivityLoading(true);

      try {
        const data = await fetchAllDashboardData(user.id);

        if (data.stats) {
          setStats(data.stats);
        }
        setNotifications(data.notifications);
        setMessages(data.messages);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
        setStatsLoading(false);
        setNotificationsLoading(false);
        setMessagesLoading(false);
        setActivityLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper functions for notification display
  const getNotificationIcon = (type: string) => {
    const iconMap = {
      payment_received: <DollarSign className="h-4 w-4 text-green-600" />,
      payment_confirmed: <DollarSign className="h-4 w-4 text-green-600" />,
      booking_confirmed: <Calendar className="h-4 w-4 text-blue-600" />,
      booking_created: <Calendar className="h-4 w-4 text-blue-600" />,
      booking_accepted: <Calendar className="h-4 w-4 text-blue-600" />,
      message_received: <MessageSquare className="h-4 w-4 text-purple-600" />,
      job_completed: <CheckCircle className="h-4 w-4 text-green-600" />,
    };
    return (
      iconMap[type as keyof typeof iconMap] || (
        <Bell className="h-4 w-4 text-gray-600" />
      )
    );
  };

  const getNotificationBgColor = (type: string) => {
    const colorMap = {
      payment_received: "bg-green-100 group-hover:bg-green-200",
      payment_confirmed: "bg-green-100 group-hover:bg-green-200",
      booking_confirmed: "bg-blue-100 group-hover:bg-blue-200",
      booking_created: "bg-blue-100 group-hover:bg-blue-200",
      booking_accepted: "bg-blue-100 group-hover:bg-blue-200",
      message_received: "bg-purple-100 group-hover:bg-purple-200",
      job_completed: "bg-green-100 group-hover:bg-green-200",
    };
    return (
      colorMap[type as keyof typeof colorMap] ||
      "bg-gray-100 group-hover:bg-gray-200"
    );
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

  // Helper functions for activity display
  const getActivityIcon = (type: string) => {
    const iconMap = {
      booking: <Calendar className="h-4 w-4 text-blue-600" />,
      message: <MessageSquare className="h-4 w-4 text-purple-600" />,
      review: <Star className="h-4 w-4 text-yellow-600" />,
      payment: <DollarSign className="h-4 w-4 text-green-600" />,
    };
    return (
      iconMap[type as keyof typeof iconMap] || (
        <Activity className="h-4 w-4 text-gray-600" />
      )
    );
  };

  const getActivityBgColor = (type: string) => {
    const colorMap = {
      booking: "bg-blue-100 group-hover:bg-blue-200",
      message: "bg-purple-100 group-hover:bg-purple-200",
      review: "bg-yellow-100 group-hover:bg-yellow-200",
      payment: "bg-green-100 group-hover:bg-green-200",
    };
    return (
      colorMap[type as keyof typeof colorMap] ||
      "bg-gray-100 group-hover:bg-gray-200"
    );
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
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
      <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
        {/* Modern Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mobile-text-optimized">
                Welcome back! 👋
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mobile-leading">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tasker/post-service">
                <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-lg hover:shadow-xl transition-all duration-300 mobile-button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Service
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wallet Balance Section */}
        <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] border-0 shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Wallet Balance</h3>
            </div>
            <div className="text-3xl font-bold mb-2">
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                `${stats.walletBalance.toLocaleString()} MAD`
              )}
            </div>
            <p className="text-sm opacity-90">
              Available for withdrawals and payments
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Active Jobs */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-800">
                Active Jobs
              </CardTitle>
              <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors duration-200">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {stats.activeJobs}
                  </div>
                  <p className="text-sm text-blue-700">Currently in progress</p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(stats.activeJobs, 0)}
                    <span className="text-xs text-blue-600">Active now</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-800">
                Total Earnings
              </CardTitle>
              <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors duration-200">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {stats.totalEarnings.toLocaleString()} MAD
                  </div>
                  <p className="text-sm text-green-700">All time earnings</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      Lifetime total
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Rating */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-800">
                Rating
              </CardTitle>
              <div className="p-3 bg-yellow-500 rounded-xl group-hover:bg-yellow-600 transition-colors duration-200">
                <Star className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-yellow-900 mb-1">
                    {stats.averageRating > 0
                      ? stats.averageRating.toFixed(1)
                      : "N/A"}
                  </div>
                  <p className="text-sm text-yellow-700">
                    {stats.totalReviews} reviews
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Award className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs text-yellow-600">
                      Customer rating
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-800">
                Success Rate
              </CardTitle>
              <div className="p-3 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors duration-200">
                <Target className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-900 mb-1">
                    {stats.completionRate}%
                  </div>
                  <p className="text-sm text-purple-700">Job completion rate</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">Excellent</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Manage your business efficiently
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasker/post-service" className="block">
                <Button
                  className="w-full justify-between h-14 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-base font-semibold">
                      Add New Service
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/tasker/bookings" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Eye className="h-4 w-4 text-[var(--color-secondary)]" />
                      <span className="text-xs font-medium">Bookings</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/tasker/finance" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium">Earnings</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/tasker/messages" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring relative"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium">Messages</span>
                    </div>
                    {messages.filter((m) => m.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {messages.filter((m) => m.unread).length}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/tasker/reviews" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium">Reviews</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-secondary)] rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Recent Activity
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Latest updates from your business
              </p>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 4).map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 rounded-xl border border-[var(--color-border)] hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getActivityBgColor(
                            activity.type
                          )} transition-colors duration-200`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                              {activity.title}
                            </h3>
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                {activity.amount} MAD
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                            {activity.description}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Notifications
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Stay updated with important alerts
              </p>
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
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        !notification.is_read
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                          : "bg-[var(--color-accent)] border-[var(--color-border)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getNotificationBgColor(
                            notification.type
                          )} transition-colors duration-200`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
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
                        className="w-full h-12 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
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
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Recent Messages
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Latest conversations with customers
                </p>
              </div>
              <Link href="/tasker/messages">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                >
                  View All
                </Button>
              </Link>
            </div>
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
                <p className="text-xs mt-1">
                  Start conversations with your customers
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 3).map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer group ${
                      message.unread
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                        : "bg-[var(--color-accent)] border-[var(--color-border)] hover:border-[var(--color-secondary)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {message.client.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                            {message.client}
                          </h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                          {formatTimeAgo(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
