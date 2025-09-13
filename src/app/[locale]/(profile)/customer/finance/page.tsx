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
import { useUserStore } from "@/stores/userStore";
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-2">
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
  const { user } = useUserStore();
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
    if (!user?.id) return;

    try {
      setLoading(true);
      const [summary, transactionHistory, balance] = await Promise.all([
        getCustomerFinanceSummary(user.id, selectedPeriod),
        getCustomerTransactionHistory(user.id, 20, 0),
        getWalletBalance(user.id),
      ]);

      setFinanceSummary(summary);
      setTransactions(transactionHistory);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast.error("Failed to load finance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedPeriod]);

  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchFinanceData();
    }
  }, [user?.id, fetchFinanceData]);

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
        {status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please log in to view your finance information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Finance Overview
        </h1>
        <p className="text-muted-foreground mobile-text-optimized">
          Track your payments and manage your spending
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Period:</span>
        <div className="flex gap-1">
          {(["week", "month", "year"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="mobile-button"
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <FinanceStatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  financeSummary?.totalSpent || 0,
                  financeSummary?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === "week"
                  ? "This week"
                  : selectedPeriod === "month"
                  ? "This month"
                  : "This year"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Jobs
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financeSummary?.completedJobs || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Average:{" "}
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
                Pending Payments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  financeSummary?.pendingPayments || 0,
                  financeSummary?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  walletBalance?.available || 0,
                  walletBalance?.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending:{" "}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your latest payment activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="mobile-button">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TransactionSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground">
                Your transaction history will appear here once you start booking
                services.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.paymentStatus)}
                      <h3 className="font-semibold">
                        {transaction.serviceTitle || "Service Payment"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="text-right space-y-2">
                    <p className="text-xl font-bold">
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
