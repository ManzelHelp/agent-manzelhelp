"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  CreditCard,
  BarChart2,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  getCustomerFinanceSummary,
  getCustomerTransactionHistory,
  type FinanceSummary,
  type Transaction,
} from "@/actions/finance";
import { useToast } from "@/hooks/use-toast";
import { formatDateShort } from "@/lib/date-utils";
import { BackButton } from "@/components/ui/BackButton";
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
export default function CustomerFinancePage() {
  const t = useTranslations("finance");
  const locale = useLocale();
  const { toast } = useToast();
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchFinanceData = useCallback(async (append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentOffset(0);
      }
      
      const offset = append ? currentOffset : 0;
      const [summary, transactionHistory] = await Promise.all([
        getCustomerFinanceSummary(
          selectedPeriod,
          selectedPeriod === "month" || selectedPeriod === "year" ? selectedMonth : undefined,
          selectedPeriod === "year" ? selectedYear : undefined
        ),
        getCustomerTransactionHistory(5, offset),
      ]);

      setFinanceSummary(summary);
      
      if (append) {
        setTransactions((prev) => [...prev, ...transactionHistory.transactions]);
        setCurrentOffset((prev) => prev + transactionHistory.transactions.length);
      } else {
        setTransactions(transactionHistory.transactions);
        setCurrentOffset(transactionHistory.transactions.length);
      }
      setHasMore(transactionHistory.hasMore);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("errors.loadFailed"),
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedPeriod, selectedMonth, selectedYear, currentOffset, t]);

  const loadMoreTransactions = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      fetchFinanceData(true);
    }
  }, [isLoadingMore, hasMore, loading, fetchFinanceData]);

  // Set mounted flag to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data on component mount and when period/month/year changes
  useEffect(() => {
    fetchFinanceData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedMonth, selectedYear]); // Re-fetch when period/month/year changes

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

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune transaction à exporter",
      });
      return;
    }

    try {
      // Create CSV content with proper escaping for CSV format
      const headers = [
        "Date",
        "Service",
        "Montant",
        "Devise",
        "Méthode de paiement",
        "Statut",
        "Statut de réservation",
      ];

      const csvRows = [
        headers.join(","),
        ...transactions.map((t) => {
          // Escape values that contain commas or quotes
          const escapeCSV = (value: string | number | null | undefined) => {
            if (value === null || value === undefined) return "";
            const str = String(value);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          };

          return [
            escapeCSV(formatDate(t.createdAt)),
            escapeCSV(t.serviceTitle || "Service"),
            escapeCSV(t.amount),
            escapeCSV(t.currency),
            escapeCSV(t.paymentMethod || "Inconnu"),
            escapeCSV(t.paymentStatus),
            escapeCSV(t.bookingStatus || ""),
          ].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      // Add BOM for UTF-8 to ensure Excel opens it correctly
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        variant: "success",
        title: "Succès",
        description: "Transactions exportées avec succès",
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'export des transactions",
      });
    }
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
        {t(`status.${status}`, { default: status })}
      </Badge>
    );
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
      </div>
      {/* Header */}
      <div className="text-center sm:text-start">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("period")}</span>
          </div>
          <div className="flex gap-1 w-full sm:w-auto">
            {(["week", "month", "year"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                {t(period)}
              </Button>
            ))}
          </div>
        </div>

        {/* Month and Year Selectors for month/year periods */}
        {(selectedPeriod === "month" || selectedPeriod === "year") && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {selectedPeriod === "month" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="month-select" className="text-sm font-medium">
                  {t("month") || "Month"}
                </Label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isMounted ? (
                    Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1, 1).toLocaleString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : "en-US", {
                          month: "long",
                        })}
                      </option>
                    ))
                  ) : (
                    Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="year-select" className="text-sm font-medium">
                {t("year") || "Year"}
              </Label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {loading ? (
        <FinanceStatsSkeleton />
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.totalSpent")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(
                  financeSummary?.totalSpent || 0,
                  financeSummary?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === "week"
                  ? t("stats.thisWeek")
                  : selectedPeriod === "month"
                  ? t("stats.thisMonth")
                  : t("stats.thisYear")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.completedJobs")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {financeSummary?.completedJobs || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("stats.average")}{" "}
                {formatCurrency(
                  financeSummary?.averageJobValue || 0,
                  financeSummary?.currency
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.pendingPayments")}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(
                  financeSummary?.pendingPayments || 0,
                  financeSummary?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("stats.awaitingPayment")}
              </p>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Transaction History */}
      <Card className="hover-lift">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              {t("transactionHistory.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("transactionHistory.subtitle")}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("transactionHistory.export")}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TransactionSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("transactionHistory.noTransactions")}
              </h3>
              <p className="text-muted-foreground">
                {t("transactionHistory.noTransactionsDescription")}
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
                      <h3 className="font-semibold text-sm sm:text-base">
                        {transaction.serviceTitle ||
                          t("transactionHistory.servicePayment")}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {t(`status.${transaction.paymentMethod?.toLowerCase()}`, { default: transaction.paymentMethod || "Unknown" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.createdAt)}
                      </span>
                      {transaction.bookingStatus && (
                        <span className="flex items-center gap-1">
                          <BarChart2 className="h-3 w-3" />
                          {t(`bookingStatuses.${transaction.bookingStatus}`, { default: transaction.bookingStatus })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:text-right sm:space-y-2">
                    <p className="text-lg sm:text-xl font-bold">
                      {formatCurrency(transaction.amount, transaction.currency)}
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
                        {t("actions.loading") || "Loading..."}
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        {t("actions.loadMore") || "Load More"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
