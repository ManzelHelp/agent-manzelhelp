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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
        <p className="text-muted-foreground">
          Track your earnings and manage payments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.today}</div>
            <div className="flex items-center space-x-2">
              {earnings.today > earnings.yesterday ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-xs ${
                  earnings.today > earnings.yesterday
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Math.round(
                  ((earnings.today - earnings.yesterday) / earnings.yesterday) *
                    100
                )}
                % from yesterday
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Earnings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.thisWeek}</div>
            <div className="flex items-center space-x-2">
              {earnings.thisWeek > earnings.lastWeek ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-xs ${
                  earnings.thisWeek > earnings.lastWeek
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Math.round(
                  ((earnings.thisWeek - earnings.lastWeek) /
                    earnings.lastWeek) *
                    100
                )}
                % from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Earnings
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.thisMonth}</div>
            <div className="flex items-center space-x-2">
              {earnings.thisMonth > earnings.lastMonth ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-xs ${
                  earnings.thisMonth > earnings.lastMonth
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Math.round(
                  ((earnings.thisMonth - earnings.lastMonth) /
                    earnings.lastMonth) *
                    100
                )}
                % from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.total}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your service statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Average Earnings per Task</p>
                <p className="text-2xl font-bold">
                  ${stats.avgEarningsPerTask}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Task Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Tasks Completed</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Active Bookings</p>
                <p className="text-2xl font-bold">{stats.activeBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payout options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{method.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.last4 ? `****${method.last4}` : method.email}
                    </p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-amber-100"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight
                        className={`h-4 w-4 ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <ArrowDownRight
                        className={`h-4 w-4 ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transaction.date}</span>
                      {transaction.client && (
                        <>
                          <span>•</span>
                          <span>{transaction.client}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
