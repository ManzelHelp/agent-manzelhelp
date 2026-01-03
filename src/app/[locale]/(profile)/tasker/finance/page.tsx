"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Download,
  Users,
  RefreshCw,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/BackButton";
import {
  getEarningsData,
  getPerformanceMetrics,
  getTransactionHistory,
  getChartData,
  type EarningsData,
  type PerformanceMetrics,
  type Transaction,
  type ChartData,
} from "@/actions/finance";
import { toast } from "sonner";
import { formatDateShort } from "@/lib/date-utils";

// Loading skeleton components
function FinanceStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 sm:h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted rounded-lg gap-3 sm:gap-0"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:text-right sm:space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Main component
export default function TaskerFinancePage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("week");

  const fetchFinanceData = useCallback(async (append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentOffset(0);
      }
      
      const offset = append ? currentOffset : 0;
      const [earnings, performance, transactionHistory, chart] =
        await Promise.all([
          getEarningsData(),
          getPerformanceMetrics(),
          getTransactionHistory(10, offset),
          getChartData(selectedPeriod),
        ]);

      setEarningsData(earnings);
      setPerformanceMetrics(performance);
      
      if (append) {
        setTransactions((prev) => [...prev, ...transactionHistory.transactions]);
        setCurrentOffset((prev) => prev + transactionHistory.transactions.length);
      } else {
        setTransactions(transactionHistory.transactions);
        setCurrentOffset(transactionHistory.transactions.length);
      }
      setHasMore(transactionHistory.hasMore);
      setChartData(chart);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast.error("Failed to load finance data. Please try again.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedPeriod, currentOffset]);

  const loadMoreTransactions = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      fetchFinanceData(true);
    }
  }, [isLoadingMore, hasMore, loading, fetchFinanceData]);

  // Fetch data on component mount only (no auto-refresh to avoid multiple calls)
  useEffect(() => {
    fetchFinanceData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when fetchFinanceData changes

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return formatDateShort(dateString);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] || variants.pending
        }
      >
        {status}
      </Badge>
    );
  };

  const handleChartPeriodChange = async (period: "day" | "week" | "month") => {
    setSelectedPeriod(period);
    try {
      const newChartData = await getChartData(period);
      setChartData(newChartData);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      toast.error("Failed to load chart data");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
      </div>
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
          Finance Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Track your earnings, performance, and transaction history
        </p>
      </div>

      {/* Period Selector and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Chart Period</span>
          </div>
          <div className="flex gap-1 w-full sm:w-auto">
            {(["day", "week", "month"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => handleChartPeriodChange(period)}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFinanceData()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Earnings Overview */}
      {loading ? (
        <FinanceStatsSkeleton />
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(earningsData?.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>
        </div>
      )}

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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
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
                <div className="text-sm text-muted-foreground">
                  Total Reviews
                </div>
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
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Earnings Trend</span>
            </CardTitle>
            <CardDescription>
              Your earnings over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length > 0 ? (
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
                          {selectedPeriod === "day"
                            ? new Date(data.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : selectedPeriod === "week"
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
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-sm">
                Your latest payment transactions and earnings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TransactionSkeleton />
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="space-y-2 sm:space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.paymentStatus)}
                        <h3 className="font-semibold text-sm sm:text-base">
                          {transaction.serviceTitle || "Service Payment"}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.createdAt)}
                        </span>
                        {transaction.bookingStatus && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {transaction.bookingStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:text-right sm:space-y-2">
                      <p className="text-lg sm:text-xl font-bold">
                        {formatCurrency(
                          transaction.netAmount,
                          transaction.currency
                        )}
                      </p>
                      {getStatusBadge(transaction.paymentStatus)}
                    </div>
                  </div>
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      onClick={loadMoreTransactions}
                      disabled={isLoadingMore}
                      variant="outline"
                      className="mobile-button"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
