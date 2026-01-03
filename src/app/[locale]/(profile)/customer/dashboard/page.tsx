"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Home,
  CreditCard,
  Users,
} from "lucide-react";

// Utils and Types
import type { Notification } from "@/types/supabase";
import {
  fetchAllCustomerDashboardData,
  type CustomerDashboardStats,
  type RecentActivity,
  type ProcessedMessage,
} from "@/actions/dashboard";
import { useTranslations } from "next-intl";

/**
 * Modern Customer Dashboard Component
 *
 * Features:
 * - Comprehensive service metrics and spending analytics
 * - Real-time activity feed
 * - Mobile-first responsive design
 * - Optimized Supabase data fetching
 * - Modern UI with animations and interactions
 */
export default function CustomerDashboardPage() {
  const router = useRouter();
  const t = useTranslations("dashboard.customer");
  const tCommon = useTranslations("common");
  
  // State management for dashboard data
  const [stats, setStats] = useState<CustomerDashboardStats>({
    activeBookings: 0,
    completedBookings: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
    monthlySpent: 0,
    weeklySpent: 0,
    upcomingBookings: 0,
    recentBookings: 0,
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null);
      setStatsLoading(true);
      setNotificationsLoading(true);
      setMessagesLoading(true);
      setActivityLoading(true);

      try {
        const data = await fetchAllCustomerDashboardData();

        if (data.error) {
          console.error("Error fetching dashboard data:", data.error);
          setError(data.error);
          toast.error(data.error);
          return;
        }

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
  }, []);

  // Helper functions for notification display
  const getNotificationIcon = (type: string) => {
    const iconMap = {
      payment_received: <DollarSign className="h-4 w-4 text-[var(--color-success)]" />,
      payment_confirmed: <DollarSign className="h-4 w-4 text-[var(--color-success)]" />,
      booking_confirmed: <Calendar className="h-4 w-4 text-[var(--color-info)]" />,
      booking_created: <Calendar className="h-4 w-4 text-[var(--color-info)]" />,
      booking_accepted: <Calendar className="h-4 w-4 text-[var(--color-info)]" />,
      message_received: <MessageSquare className="h-4 w-4 text-[var(--color-purple)]" />,
      job_completed: <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />,
    };
    return (
      iconMap[type as keyof typeof iconMap] || (
        <Bell className="h-4 w-4 text-[var(--color-gray-dark)]" />
      )
    );
  };

  const getNotificationBgColor = (type: string) => {
    const colorMap = {
      payment_received: "bg-[var(--color-success-light)] group-hover:bg-[var(--color-success-dark)]",
      payment_confirmed: "bg-[var(--color-success-light)] group-hover:bg-[var(--color-success-dark)]",
      booking_confirmed: "bg-[var(--color-info-light)] group-hover:bg-[var(--color-info-dark)]",
      booking_created: "bg-[var(--color-info-light)] group-hover:bg-[var(--color-info-dark)]",
      booking_accepted: "bg-[var(--color-info-light)] group-hover:bg-[var(--color-info-dark)]",
      message_received: "bg-[var(--color-purple-light)] group-hover:bg-[var(--color-purple-dark)]",
      job_completed: "bg-[var(--color-success-light)] group-hover:bg-[var(--color-success-dark)]",
    };
    return (
      colorMap[type as keyof typeof colorMap] ||
      "bg-[var(--color-gray-light)] group-hover:bg-[var(--color-gray-dark)]"
    );
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return tCommon("timeAgo.justNow");
    if (diffInHours < 24) return tCommon("timeAgo.hoursAgo", { count: diffInHours });
    if (diffInHours < 48) return tCommon("timeAgo.dayAgo");
    return tCommon("timeAgo.daysAgo", { count: Math.floor(diffInHours / 24) });
  };

  // Helper functions for activity display
  const getActivityIcon = (type: string) => {
    const iconMap = {
      booking: <Calendar className="h-4 w-4 text-[var(--color-info)]" />,
      message: <MessageSquare className="h-4 w-4 text-[var(--color-purple)]" />,
      review: <Star className="h-4 w-4 text-[var(--color-warning)]" />,
      payment: <DollarSign className="h-4 w-4 text-[var(--color-success)]" />,
    };
    return (
      iconMap[type as keyof typeof iconMap] || (
        <Activity className="h-4 w-4 text-[var(--color-gray-dark)]" />
      )
    );
  };

  const getActivityBgColor = (type: string) => {
    const colorMap = {
      booking: "bg-[var(--color-info-light)] group-hover:bg-[var(--color-info-dark)]",
      message: "bg-[var(--color-purple-light)] group-hover:bg-[var(--color-purple-dark)]",
      review: "bg-[var(--color-warning-light)] group-hover:bg-[var(--color-warning-dark)]",
      payment: "bg-[var(--color-success-light)] group-hover:bg-[var(--color-success-dark)]",
    };
    return (
      colorMap[type as keyof typeof colorMap] ||
      "bg-[var(--color-gray-light)] group-hover:bg-[var(--color-gray-dark)]"
    );
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="h-4 w-4 text-[var(--color-success)]" />;
    } else if (current < previous) {
      return <ArrowDownRight className="h-4 w-4 text-[var(--color-error)]" />;
    }
    return <Activity className="h-4 w-4 text-[var(--color-gray-dark)]" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-lg text-[var(--color-text-primary)]">
            {t("loadingDashboard")}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-[var(--color-error)] mx-auto" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {t("somethingWentWrong")}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-md">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            {t("tryAgain")}
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
                {t("welcomeBack")}
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mobile-leading">
                {t("overview")}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/customer/post-job">
                <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-lg hover:shadow-xl transition-all duration-300 mobile-button">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("postJob")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Active Bookings */}
          <Card className="bg-gradient-to-br from-[var(--color-info-light)] to-[var(--color-info-light)] border-[var(--color-info)]/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t("activeBookings")}
              </CardTitle>
              <div className="p-3 bg-[var(--color-info)] rounded-xl group-hover:bg-[var(--color-info-dark)] transition-colors duration-200">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-info)]" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                    {stats.activeBookings}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("currentlyInProgress")}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(stats.activeBookings, 0)}
                    <span className="text-xs text-[var(--color-info)]">{t("inProgress")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="bg-gradient-to-br from-[var(--color-success-light)] to-[var(--color-success-light)] border-[var(--color-success)]/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t("totalSpent")}
              </CardTitle>
              <div className="p-3 bg-[var(--color-success)] rounded-xl group-hover:bg-[var(--color-success-dark)] transition-colors duration-200">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-success)]" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                    {stats.totalSpent.toLocaleString()} MAD
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("allTimeSpending")}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className="h-3 w-3 text-[var(--color-success)]" />
                    <span className="text-xs text-[var(--color-success)]">
                      {t("lifetimeTotal")}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="bg-gradient-to-br from-[var(--color-purple-light)] to-[var(--color-purple-light)] border-[var(--color-purple)]/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t("activeJobs")}
              </CardTitle>
              <div className="p-3 bg-[var(--color-purple)] rounded-xl group-hover:bg-[var(--color-purple-dark)] transition-colors duration-200">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-purple)]" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                    {stats.activeJobs}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("postedJobs")}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Target className="h-3 w-3 text-[var(--color-purple)]" />
                    <span className="text-xs text-[var(--color-purple)]">{t("inProgress")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Completed Jobs */}
          <Card className="bg-gradient-to-br from-[var(--color-warning-light)] to-[var(--color-warning-light)] border-[var(--color-warning)]/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t("completedJobs")}
              </CardTitle>
              <div className="p-3 bg-[var(--color-warning)] rounded-xl group-hover:bg-[var(--color-warning-dark)] transition-colors duration-200">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-warning)]" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                    {stats.completedJobs}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("jobsCompleted")}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Award className="h-3 w-3 text-[var(--color-warning)]" />
                    <span className="text-xs text-[var(--color-warning)]">{t("greatWork")}</span>
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
                {t("quickActions")}
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("manageJobs")}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/customer/my-jobs" className="block">
                <Button
                  className="w-full justify-between h-14 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-base font-semibold">
                      {t("postNewJob")}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/search/services" className="block">
                <Button
                  className="w-full justify-between h-14 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)] hover:from-[var(--color-secondary-light)] hover:to-[var(--color-secondary)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-base font-semibold">
                      {t("browseServices")}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-3">

                <Link href="/customer/bookings" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Eye className="h-4 w-4 text-[var(--color-secondary)]" />
                      <span className="text-xs font-medium">{t("bookings")}</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/customer/finance" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <CreditCard className="h-4 w-4 text-[var(--color-success)]" />
                      <span className="text-xs font-medium">{t("finance")}</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/customer/messages" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring relative"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-[var(--color-info)]" />
                      <span className="text-xs font-medium">{t("messages")}</span>
                    </div>
                    {messages.filter((m) => m.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {messages.filter((m) => m.unread).length}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/customer/profile#addresses" className="block">
                  <Button
                    className="w-full h-12 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                    variant="outline"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Home className="h-4 w-4 text-[var(--color-warning)]" />
                      <span className="text-xs font-medium">{t("addresses")}</span>
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
                {t("recentActivity")}
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("latestUpdates")}
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
                  <p>{t("noRecentActivity")}</p>
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
                              <span className="text-xs font-medium text-[var(--color-success)] bg-[var(--color-success-light)] px-2 py-1 rounded-full">
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
                <div className="p-2 bg-[var(--color-warning)] rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                {t("recentNotifications")}
              </CardTitle>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("stayUpdated")}
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
                  <p>{t("noNotifications")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => router.push(`/customer/notifications?notificationId=${notification.id}`)}
                      className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        !notification.is_read
                          ? "bg-gradient-to-r from-[var(--color-info-light)] to-[var(--color-info-light)] border-[var(--color-info)]/30 shadow-sm"
                          : "bg-[var(--color-surface)] border-[var(--color-border)]"
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
                              <span className="w-2 h-2 bg-[var(--color-info)] rounded-full animate-pulse"></span>
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
                    <Link href="/customer/notifications" className="block">
                      <Button
                        variant="ghost"
                        className="w-full h-12 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                      >
                        {t("viewAll")}
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
                  <div className="p-2 bg-[var(--color-info)] rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  {t("recentMessages")}
                </CardTitle>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {t("latestConversations")}
                </p>
              </div>
              <Link href="/customer/messages">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                >
                  {t("viewAll")}
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
                <p>{t("noMessages")}</p>
                <p className="text-xs mt-1">
                  {t("startConversations")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 3).map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer group ${
                      message.unread
                        ? "bg-gradient-to-r from-[var(--color-info-light)] to-[var(--color-info-light)] border-[var(--color-info)]/30 shadow-sm"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-secondary)]"
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
                            <span className="w-2 h-2 bg-[var(--color-info)] rounded-full animate-pulse"></span>
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
