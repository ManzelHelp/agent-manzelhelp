"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import {
  getTaskerFinanceData,
  getTaskerTransactions,
  getTaskerEarningsByPeriod,
  type FinanceData,
  type TransactionWithDetails,
} from "@/actions/finance";

export default function FinancePage() {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [earningsData, setEarningsData] = useState<
    { date: string; earnings: number }[]
  >([]);
  const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month">(
    "month"
  );
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.id) {
      loadFinanceData();
    }
  }, [user?.id, chartPeriod]);

  const loadFinanceData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [data, earnings] = await Promise.all([
        getTaskerFinanceData(user.id),
        getTaskerEarningsByPeriod(user.id, chartPeriod, 30),
      ]);

      setFinanceData(data);
      setTransactions(data.transactions);
      setEarningsData(earnings);
    } catch (err) {
      console.error("Error loading finance data:", err);
      setError("Failed to load finance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, chartPeriod]);

  const loadMoreTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const moreTransactions = await getTaskerTransactions(
        user.id,
        20,
        transactions.length
      );
      setTransactions((prev) => [...prev, ...moreTransactions]);
      setShowAllTransactions(true);
    } catch (err) {
      console.error("Error loading more transactions:", err);
      setError("Failed to load more transactions.");
    }
  }, [user?.id, transactions.length]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTransactionIcon = (transactionType: string) => {
    switch (transactionType) {
      case "service_payment":
      case "booking_payment":
        return <ArrowUpRight className="h-4 w-4 text-color-success" />;
      case "platform_fee":
        return <ArrowDownRight className="h-4 w-4 text-color-warning" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-color-secondary" />;
    }
  };

  const getTransactionTypeLabel = (transactionType: string) => {
    switch (transactionType) {
      case "service_payment":
        return "Service Payment";
      case "booking_payment":
        return "Booking Payment";
      case "platform_fee":
        return "Platform Fee";
      case "refund":
        return "Refund";
      default:
        return "Payment";
    }
  };

  // Earnings Chart Component
  const EarningsChart = ({
    data,
    period,
  }: {
    data: { date: string; earnings: number }[];
    period: "day" | "week" | "month";
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-color-accent-light rounded-lg">
          <div className="text-center">
            <div className="text-color-text-secondary text-sm mb-2">
              No earnings data available
            </div>
            <div className="text-color-text-secondary text-xs">
              Complete bookings to see your earnings chart
            </div>
          </div>
        </div>
      );
    }

    const maxEarnings = Math.max(...data.map((d) => d.earnings));
    const minEarnings = Math.min(...data.map((d) => d.earnings));
    const range = maxEarnings - minEarnings;

    const formatChartDate = (dateStr: string) => {
      const date = new Date(dateStr);
      switch (period) {
        case "day":
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        case "week":
          return `Week ${date.getDate()}`;
        case "month":
          return date.toLocaleDateString("en-US", { month: "short" });
        default:
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
      }
    };

    return (
      <div className="bg-color-surface border border-color-border rounded-lg p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-color-text-primary mb-1">
            Earnings Trend
          </h3>
          <p className="text-sm text-color-text-secondary">
            {period === "day"
              ? "Daily"
              : period === "week"
              ? "Weekly"
              : "Monthly"}{" "}
            earnings overview
          </p>
        </div>

        <div className="relative">
          <div className="h-48 flex items-end justify-between gap-1">
            {data.map((item, index) => {
              const height =
                range > 0 ? ((item.earnings - minEarnings) / range) * 100 : 0;
              const isHighest = item.earnings === maxEarnings;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full">
                    <div
                      className={`w-full transition-all duration-300 ease-in-out ${
                        isHighest
                          ? "bg-color-secondary"
                          : "bg-color-secondary/60"
                      } rounded-t-sm hover:bg-color-secondary/80`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-color-surface border border-color-border rounded text-xs text-color-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatCurrency(item.earnings)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-color-text-secondary mt-2 text-center">
                    {formatChartDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-color-text-secondary">
            <span>{formatCurrency(maxEarnings)}</span>
            <span>{formatCurrency(Math.round(maxEarnings / 2))}</span>
            <span>{formatCurrency(minEarnings)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-color-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-color-text-secondary">Total</div>
              <div className="text-lg font-semibold text-color-text-primary">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.earnings, 0)
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-color-text-secondary">Average</div>
              <div className="text-lg font-semibold text-color-text-primary">
                {formatCurrency(
                  Math.round(
                    data.reduce((sum, item) => sum + item.earnings, 0) /
                      data.length
                  )
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-color-text-secondary">Highest</div>
              <div className="text-lg font-semibold text-color-success">
                {formatCurrency(maxEarnings)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-color-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-color-secondary" />
          <p className="text-color-text-secondary">Loading finance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-color-bg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-color-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-color-text-primary mb-2">
                Error Loading Finance Data
              </h2>
              <p className="text-color-text-secondary mb-4">{error}</p>
              <Button onClick={loadFinanceData} className="touch-target">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!financeData) {
    return (
      <div className="min-h-screen bg-color-bg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-color-secondary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-color-text-primary mb-2">
                No Finance Data Available
              </h2>
              <p className="text-color-text-secondary">
                Complete some bookings to see your finance data here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, userStats } = financeData;
  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  return (
    <div className="min-h-screen bg-color-bg">
      {/* Header Section */}
      <div className="bg-color-surface border-b border-color-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-color-text-primary mobile-text-xl">
                Finance Overview
              </h1>
              <p className="text-color-text-secondary text-sm mt-1">
                Track your earnings and manage payments
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Today's Earnings */}
          <Card className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-color-text-secondary">
                Today
              </CardTitle>
              <DollarSign className="h-4 w-4 text-color-secondary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-color-text-primary sm:text-2xl">
                {formatCurrency(stats.today)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stats.today > stats.yesterday ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    stats.today > stats.yesterday
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(stats.today, stats.yesterday)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Earnings */}
          <Card className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-color-text-secondary">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-color-secondary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-color-text-primary sm:text-2xl">
                {formatCurrency(stats.thisWeek)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stats.thisWeek > stats.lastWeek ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    stats.thisWeek > stats.lastWeek
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(stats.thisWeek, stats.lastWeek)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-color-text-secondary">
                This Month
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-color-secondary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-color-text-primary sm:text-2xl">
                {formatCurrency(stats.thisMonth)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stats.thisMonth > stats.lastMonth ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    stats.thisMonth > stats.lastMonth
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(stats.thisMonth, stats.lastMonth)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-color-text-secondary">
                Total
              </CardTitle>
              <Wallet className="h-4 w-4 text-color-secondary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-color-text-primary sm:text-2xl">
                {formatCurrency(stats.total)}
              </div>
              <p className="text-xs text-color-text-secondary mt-1">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Stats Summary */}
        {userStats && (
          <Card className="border-color-border bg-color-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-color-text-primary">
                Performance Summary
              </CardTitle>
              <CardDescription className="text-color-text-secondary">
                Your overall performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-color-text-primary">
                    {userStats.completed_jobs || 0}
                  </div>
                  <div className="text-sm text-color-text-secondary">
                    Completed Jobs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-color-text-primary">
                    {userStats.total_reviews || 0}
                  </div>
                  <div className="text-sm text-color-text-secondary">
                    Total Reviews
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-color-text-primary">
                    {userStats.tasker_rating
                      ? userStats.tasker_rating.toFixed(1)
                      : "N/A"}
                  </div>
                  <div className="text-sm text-color-text-secondary">
                    Average Rating
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-color-text-primary">
                    {userStats.response_time_hours || "N/A"}
                  </div>
                  <div className="text-sm text-color-text-secondary">
                    Avg Response (hrs)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Chart */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-color-text-primary">
                  Earnings Overview
                </CardTitle>
                <CardDescription className="text-color-text-secondary">
                  Visualize your earnings trends
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartPeriod === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartPeriod("day")}
                  className="touch-target"
                >
                  Day
                </Button>
                <Button
                  variant={chartPeriod === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartPeriod("week")}
                  className="touch-target"
                >
                  Week
                </Button>
                <Button
                  variant={chartPeriod === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartPeriod("month")}
                  className="touch-target"
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EarningsChart data={earningsData} period={chartPeriod} />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-color-text-primary">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-color-text-secondary">
                  Your latest financial activity
                </CardDescription>
              </div>
              {!showAllTransactions && transactions.length > 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex touch-target"
                  onClick={loadMoreTransactions}
                >
                  Load More
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {displayedTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-color-secondary mx-auto mb-4" />
                <p className="text-color-text-secondary">No transactions yet</p>
                <p className="text-sm text-color-text-secondary mt-1">
                  Complete your first booking to see transactions here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-color-accent-light rounded-lg border border-color-border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.transaction_type === "platform_fee"
                            ? "bg-color-warning/10"
                            : "bg-color-success/10"
                        }`}
                      >
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-color-text-primary text-sm truncate">
                          {transaction.booking_title ||
                            getTransactionTypeLabel(
                              transaction.transaction_type
                            )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-color-text-secondary mt-1">
                          <span>{formatDate(transaction.created_at)}</span>
                          {transaction.customer_name && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {transaction.customer_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p
                        className={`text-lg font-bold ${
                          transaction.transaction_type === "platform_fee"
                            ? "text-color-warning"
                            : "text-color-success"
                        }`}
                      >
                        {transaction.transaction_type === "platform_fee"
                          ? "-"
                          : "+"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-color-text-secondary capitalize">
                        {transaction.payment_status || "completed"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Load More Button */}
            {!showAllTransactions && transactions.length > 4 && (
              <div className="mt-4 sm:hidden">
                <Button
                  variant="outline"
                  className="w-full touch-target border-color-border text-color-text-primary hover:bg-color-accent-light"
                  onClick={loadMoreTransactions}
                >
                  Load More Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
