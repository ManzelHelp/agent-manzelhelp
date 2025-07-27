"use client";

import React from "react";
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
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart2,
  Plus,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinancePage() {
  // Mock data - replace with real data fetching
  const earnings = {
    today: 125,
    yesterday: 110,
    thisWeek: 890,
    lastWeek: 820,
    thisMonth: 3250,
    lastMonth: 2800,
    total: 12840,
  };

  const transactions = [
    {
      id: 1,
      type: "income",
      title: "House Cleaning",
      client: "Sarah M.",
      amount: 80,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      type: "income",
      title: "Office Cleaning",
      client: "Tech Corp",
      amount: 200,
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      type: "withdrawal",
      title: "Bank Transfer",
      amount: 250,
      date: "2024-01-13",
      status: "processed",
    },
    {
      id: 4,
      type: "income",
      title: "Furniture Assembly",
      client: "John D.",
      amount: 60,
      date: "2024-01-12",
      status: "completed",
    },
  ];

  const stats = {
    avgEarningsPerTask: 85,
    completionRate: 98,
    totalTasks: 47,
    activeBookings: 3,
  };

  const paymentMethods = [
    {
      id: 1,
      type: "Bank Account",
      last4: "4389",
      isDefault: true,
    },
    {
      id: 2,
      type: "PayPal",
      email: "j***@example.com",
      isDefault: false,
    },
  ];

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

  return (
    <div className="min-h-screen bg-color-bg">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-color-surface border-b border-color-border shadow-sm">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 touch-target"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 touch-target"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter</span>
              </Button>
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
                {formatCurrency(earnings.today)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {earnings.today > earnings.yesterday ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    earnings.today > earnings.yesterday
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(
                    earnings.today,
                    earnings.yesterday
                  )}
                  %
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
                {formatCurrency(earnings.thisWeek)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {earnings.thisWeek > earnings.lastWeek ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    earnings.thisWeek > earnings.lastWeek
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(
                    earnings.thisWeek,
                    earnings.lastWeek
                  )}
                  %
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
                {formatCurrency(earnings.thisMonth)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {earnings.thisMonth > earnings.lastMonth ? (
                  <TrendingUp className="h-3 w-3 text-color-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-color-error" />
                )}
                <p
                  className={`text-xs ${
                    earnings.thisMonth > earnings.lastMonth
                      ? "text-color-success"
                      : "text-color-error"
                  }`}
                >
                  {calculatePercentageChange(
                    earnings.thisMonth,
                    earnings.lastMonth
                  )}
                  %
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
                {formatCurrency(earnings.total)}
              </div>
              <p className="text-xs text-color-text-secondary mt-1">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics & Payment Methods */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Performance Metrics */}
          <Card className="border-color-border bg-color-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-color-text-primary">
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-color-text-secondary">
                Your service statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-color-accent-light rounded-lg">
                  <p className="text-sm font-medium text-color-text-secondary mb-1">
                    Avg. per Task
                  </p>
                  <p className="text-xl font-bold text-color-text-primary">
                    {formatCurrency(stats.avgEarningsPerTask)}
                  </p>
                </div>
                <div className="text-center p-3 bg-color-accent-light rounded-lg">
                  <p className="text-sm font-medium text-color-text-secondary mb-1">
                    Completion Rate
                  </p>
                  <p className="text-xl font-bold text-color-success">
                    {stats.completionRate}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-color-accent-light rounded-lg">
                  <p className="text-sm font-medium text-color-text-secondary mb-1">
                    Total Tasks
                  </p>
                  <p className="text-xl font-bold text-color-text-primary">
                    {stats.totalTasks}
                  </p>
                </div>
                <div className="text-center p-3 bg-color-accent-light rounded-lg">
                  <p className="text-sm font-medium text-color-text-secondary mb-1">
                    Active Bookings
                  </p>
                  <p className="text-xl font-bold text-color-info">
                    {stats.activeBookings}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border-color-border bg-color-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-color-text-primary">
                Payment Methods
              </CardTitle>
              <CardDescription className="text-color-text-secondary">
                Manage your payout options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-color-accent-light rounded-lg border border-color-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-color-secondary/10 rounded-full">
                      <CreditCard className="h-4 w-4 text-color-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-color-text-primary text-sm">
                        {method.type}
                      </p>
                      <p className="text-xs text-color-text-secondary">
                        {method.last4 ? `****${method.last4}` : method.email}
                      </p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="text-xs bg-color-secondary/10 text-color-secondary px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full touch-target border-color-border text-color-text-primary hover:bg-color-accent-light"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

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
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex touch-target"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-color-accent-light rounded-lg border border-color-border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-color-success/10"
                          : "bg-color-warning/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight
                          className={`h-4 w-4 ${
                            transaction.type === "income"
                              ? "text-color-success"
                              : "text-color-warning"
                          }`}
                        />
                      ) : (
                        <ArrowDownRight
                          className={`h-4 w-4 ${
                            transaction.type === "income"
                              ? "text-color-success"
                              : "text-color-warning"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-color-text-primary text-sm truncate">
                        {transaction.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-color-text-secondary mt-1">
                        <span>{transaction.date}</span>
                        {transaction.client && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {transaction.client}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "income"
                          ? "text-color-success"
                          : "text-color-warning"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-color-text-secondary capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-4 sm:hidden">
              <Button
                variant="outline"
                className="w-full touch-target border-color-border text-color-text-primary hover:bg-color-accent-light"
              >
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
