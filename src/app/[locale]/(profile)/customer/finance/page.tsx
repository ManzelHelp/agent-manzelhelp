"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
  Wallet,
  BarChart2,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCustomerFinanceSummary,
  getCustomerTransactionHistory,
  getWalletBalance,
  type FinanceSummary,
  type Transaction,
  type WalletBalance,
} from "@/actions/finance";
import { toast } from "sonner";

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
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, transactionHistory, balance] = await Promise.all([
        getCustomerFinanceSummary(selectedPeriod),
        getCustomerTransactionHistory(20, 0),
        getWalletBalance(),
      ]);

      setFinanceSummary(summary);
      setTransactions(transactionHistory);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, t]);

  // Fetch data on component mount
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        {t(`status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Period Selector */}
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

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.walletBalance")}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(
                  walletBalance?.available || 0,
                  walletBalance?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("stats.pending")}{" "}
                {formatCurrency(
                  walletBalance?.pending || 0,
                  walletBalance?.currency
                )}
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
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors gap-3 sm:gap-0"
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
                        {transaction.paymentMethod || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.createdAt)}
                      </span>
                      {transaction.bookingStatus && (
                        <span className="flex items-center gap-1">
                          <BarChart2 className="h-3 w-3" />
                          {transaction.bookingStatus}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
