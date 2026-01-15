"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  Eye,
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
import { useToast } from "@/hooks/use-toast";
import { formatDateShort } from "@/lib/date-utils";
import { FundActionsCard } from "@/components/finance/FundActionsCard";
import { TransactionDetailDrawer } from "@/components/finance/TransactionDetailDrawer";

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("finance");
  const locale = useLocale();
  const { toast } = useToast();

  const fetchFinanceData = useCallback(async (append = false, offsetOverride?: number) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentOffset(0);
      }
      
      const offset = offsetOverride !== undefined ? offsetOverride : (append ? transactions.length : 0);
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
        setCurrentOffset(offset + transactionHistory.transactions.length);
      } else {
        setTransactions(transactionHistory.transactions);
        setCurrentOffset(transactionHistory.transactions.length);
      }
      setHasMore(transactionHistory.hasMore);
      setChartData(chart);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast({
        variant: "destructive",
        title: t("errors.error", { default: "Error" }),
        description: t("errors.loadFailed", { default: "Failed to load finance data. Please try again." }),
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedPeriod]);

  // Lazy loading avec Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoadingMore || loading || transactions.length === 0) return;

    const loadMore = async () => {
      const currentOffsetValue = transactions.length;
      setIsLoadingMore(true);
      try {
        const result = await getTransactionHistory(10, currentOffsetValue);
        if (result.transactions.length > 0) {
          setTransactions((prev) => [...prev, ...result.transactions]);
          setCurrentOffset(currentOffsetValue + result.transactions.length);
        }
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error loading more transactions:", error);
        toast({
          variant: "destructive",
          title: t("errors.error", { default: "Error" }),
          description: t("errors.loadMoreFailed", { default: "Failed to load more transactions" }),
        });
      } finally {
        setIsLoadingMore(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loading, transactions.length]);

  // Fetch data on component mount only (no auto-refresh to avoid multiple calls)
  useEffect(() => {
    fetchFinanceData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when fetchFinanceData changes

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleViewHistory = () => {
    // Scroll to transactions section
    const transactionsSection = document.getElementById("transactions-section");
    if (transactionsSection) {
      transactionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatCurrency = (amount: number, currency: string = "MAD") => {
    // Map locale to proper locale format for NumberFormat
    const localeMap: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      ar: "ar-MA",
    };
    const numberLocale = localeMap[locale] || "en-US";
    
    return new Intl.NumberFormat(numberLocale, {
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
        toast({
          variant: "destructive",
          title: t("errors.error", { default: "Error" }),
          description: t("errors.loadChartFailed", { default: "Failed to load chart data" }),
        });
    }
  };

  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      toast({
        variant: "destructive",
        title: t("errors.error", { default: "Error" }),
        description: t("errors.noTransactionsToExport", { default: "No transactions to export" }),
      });
      return;
    }

    try {
      // Create CSV content
      const headers = [
        t("export.id", { default: "ID" }),
        t("export.date", { default: "Date" }),
        t("export.service", { default: "Service" }),
        t("export.amount", { default: "Amount" }),
        t("export.netAmount", { default: "Net Amount" }),
        t("export.fee", { default: "Fee" }),
        t("export.status", { default: "Status" }),
        t("export.currency", { default: "Currency" }),
      ];

      const rows = transactions.map((transaction) => [
        transaction.id,
        formatDate(transaction.createdAt),
        transaction.serviceTitle || t("exportColumns.servicePayment", { default: "Service Payment" }),
        formatCurrency(transaction.amount, transaction.currency),
        formatCurrency(transaction.netAmount, transaction.currency),
        formatCurrency(transaction.platformFee, transaction.currency),
        transaction.paymentStatus,
        transaction.currency,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        variant: "success",
        title: t("exportMessages.successTitle", { default: "Success" }),
        description: t("exportMessages.success", { default: "Transactions exported successfully" }),
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast({
        variant: "destructive",
        title: t("errors.error", { default: "Error" }),
        description: t("errors.exportFailed", { default: "Failed to export transactions" }),
      });
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in-up sm:container sm:mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
      </div>
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Period Selector and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("chartPeriod")}</span>
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
                {t(`periods.${period}`, { default: period.charAt(0).toUpperCase() + period.slice(1) })}
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
          {t("refresh")}
        </Button>
      </div>

      {/* Earnings Overview */}
      {loading ? (
        <FinanceStatsSkeleton />
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("today")}</CardTitle>
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
                <span className="text-muted-foreground">{t("vsYesterday")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("thisWeek")}</CardTitle>
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
                <span className="text-muted-foreground">{t("vsLastWeek")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("thisMonth")}</CardTitle>
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
                <span className="text-muted-foreground">{t("vsLastMonth")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalEarnings")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(earningsData?.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground">{t("allTimeEarnings")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>{t("performanceMetrics")}</span>
          </CardTitle>
          <CardDescription>
            {t("performanceMetricsDescription")}
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
                  {t("completedJobs")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {performanceMetrics?.totalReviews || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("totalReviews")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-primary flex items-center justify-center space-x-1">
                  <Star className="h-6 w-6 fill-current" />
                  <span>{performanceMetrics?.averageRating || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("averageRating")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {performanceMetrics?.responseTime || 0}h
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("avgResponseTime")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {performanceMetrics?.positiveReviews || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("positiveReviews")}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fund Actions Card - Remplace Earnings Trend */}
        <FundActionsCard key={locale} onViewHistory={handleViewHistory} />

        {/* Transaction History */}
        <Card id="transactions-section" className="hover-lift">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">
              {t("transactionHistory.title")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("transactionHistoryDescription")}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={handleExportTransactions}
              disabled={loading || transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TransactionSkeleton />
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noTransactions")}
                </h3>
                <p className="text-muted-foreground">
                  {t("noTransactionsDescription")}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => handleTransactionClick(transaction)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer hover:shadow-md gap-3 sm:gap-0 group"
                  >
                    <div className="space-y-2 sm:space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.paymentStatus)}
                        <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                          {transaction.serviceTitle || t("transactionHistory.servicePayment", { default: "Service Payment" })}
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
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right sm:space-y-2">
                      <p className="text-lg sm:text-xl font-bold">
                        {formatCurrency(
                          transaction.netAmount,
                          transaction.currency
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(transaction.paymentStatus)}
                        <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Lazy Loading Trigger */}
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading more transactions...</span>
                      </div>
                    ) : (
                      <div className="h-1 w-full" /> // Invisible trigger for intersection observer
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}
