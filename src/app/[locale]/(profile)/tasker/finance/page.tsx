"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Star,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  getEarningsData,
  getPerformanceMetrics,
  getTransactionHistory,
  getChartData,
  refreshFinanceData,
  type EarningsData,
  type PerformanceMetrics,
  type Transaction,
  type ChartData,
} from "@/actions/finance";
import { useUserStore } from "@/stores/userStore";

export default function FinancePage() {
  const { user } = useUserStore();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month">(
    "week"
  );
  const [transactionPage, setTransactionPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const TRANSACTIONS_PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const [earnings, performance, transactionHistory, chart] =
        await Promise.all([
          getEarningsData(user.id),
          getPerformanceMetrics(user.id),
          getTransactionHistory(user.id, TRANSACTIONS_PER_PAGE, 0),
          getChartData(user.id, chartPeriod),
        ]);

      setEarningsData(earnings);
      setPerformanceMetrics(performance);
      setTransactions(transactionHistory);
      setChartData(chart);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load finance data. Please try again.";
      setError(errorMessage);
      console.error("Error fetching finance data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, chartPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await refreshFinanceData();
      await fetchData();
    }
    setRefreshing(false);
  };

  const loadMoreTransactions = async () => {
    if (!user?.id) return;

    try {
      const newTransactions = await getTransactionHistory(
        user.id,
        TRANSACTIONS_PER_PAGE,
        (transactionPage + 1) * TRANSACTIONS_PER_PAGE
      );
      setTransactions((prev) => [...prev, ...newTransactions]);
      setTransactionPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error loading more transactions:", err);
      // You could add a toast notification here for better UX
    }
  };

  const handleChartPeriodChange = async (period: "day" | "week" | "month") => {
    setChartPeriod(period);
    if (user?.id) {
      try {
        const newChartData = await getChartData(user.id, period);
        setChartData(newChartData);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        // You could add a toast notification here for better UX
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold">Error Loading Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your earnings, performance, and transaction history
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mobile-button"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earningsData?.today || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(earningsData?.todayChange || 0)}
              <span className={getTrendColor(earningsData?.todayChange || 0)}>
                {formatPercentage(earningsData?.todayChange || 0)}
              </span>
              <span className="text-muted-foreground">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earningsData?.week || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(earningsData?.weekChange || 0)}
              <span className={getTrendColor(earningsData?.weekChange || 0)}>
                {formatPercentage(earningsData?.weekChange || 0)}
              </span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earningsData?.month || 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(earningsData?.monthChange || 0)}
              <span className={getTrendColor(earningsData?.monthChange || 0)}>
                {formatPercentage(earningsData?.monthChange || 0)}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earningsData?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
          <CardDescription>
            Your key performance indicators and customer satisfaction metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {performanceMetrics?.completedJobs || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Completed Jobs
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {performanceMetrics?.totalReviews || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary flex items-center justify-center space-x-1">
                <Star className="h-6 w-6 fill-current" />
                <span>{performanceMetrics?.averageRating || 0}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Average Rating
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {performanceMetrics?.responseTime || 0}h
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Response Time
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {performanceMetrics?.positiveReviews || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Positive Reviews
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Earnings Trend</span>
              </CardTitle>
              <div className="flex space-x-1">
                {(["day", "week", "month"] as const).map((period) => (
                  <Button
                    key={period}
                    variant={chartPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChartPeriodChange(period)}
                    className="mobile-button"
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between space-x-1">
                  {chartData.map((data, index) => {
                    const maxEarnings = Math.max(
                      ...chartData.map((d) => d.earnings)
                    );
                    const height =
                      maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-2 flex-1"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                          title={`${data.date}: ${formatCurrency(
                            data.earnings
                          )}`}
                        />
                        <div className="text-xs text-muted-foreground text-center">
                          {chartPeriod === "day"
                            ? new Date(data.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : chartPeriod === "week"
                            ? new Date(data.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : new Date(data.date).toLocaleDateString("en-US", {
                                month: "short",
                                year: "2-digit",
                              })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Total:{" "}
                  {formatCurrency(
                    chartData.reduce((sum, data) => sum + data.earnings, 0)
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available for the selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Your latest payment transactions and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {transaction.paymentStatus === "paid" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {transaction.serviceTitle || "Service Payment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(transaction.netAmount)}
                      </p>
                      <Badge
                        variant={
                          transaction.paymentStatus === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}

                {transactions.length >= TRANSACTIONS_PER_PAGE && (
                  <Button
                    variant="outline"
                    onClick={loadMoreTransactions}
                    className="w-full mobile-button"
                  >
                    Load More Transactions
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
                <p className="text-sm">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your finances and view detailed reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 mobile-button">
              <div className="text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Withdraw Funds</div>
                <div className="text-xs text-muted-foreground">
                  Transfer to bank
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 mobile-button">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Detailed Reports</div>
                <div className="text-xs text-muted-foreground">Export data</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 mobile-button">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Tax Documents</div>
                <div className="text-xs text-muted-foreground">
                  Download 1099
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 mobile-button">
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Payment Schedule</div>
                <div className="text-xs text-muted-foreground">
                  View calendar
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
