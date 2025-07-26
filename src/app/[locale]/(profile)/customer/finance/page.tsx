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
  Wallet,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerFinancePage() {
  // Mock data - replace with real data fetching
  const stats = {
    totalSpent: 1840,
    thisMonth: 565,
    lastMonth: 640,
    pending: 120,
  };

  const payments = [
    {
      id: 1,
      jobTitle: "Kitchen Deep Clean",
      tasker: "Robert S.",
      amount: 95,
      date: "2024-01-12",
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 2,
      jobTitle: "Plumbing Repair",
      tasker: "Anna L.",
      amount: 150,
      date: "2024-01-10",
      status: "completed",
      method: "PayPal",
    },
    {
      id: 3,
      jobTitle: "Moving Help",
      tasker: "Mike R.",
      amount: 200,
      date: "2024-01-08",
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 4,
      jobTitle: "House Deep Clean",
      tasker: "Maria S.",
      amount: 120,
      date: "2024-01-16",
      status: "pending",
      method: "Credit Card",
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "Credit Card",
      last4: "1234",
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
          Track your payments and manage your spending
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonth}</div>
            <div className="flex items-center space-x-2">
              {stats.thisMonth > stats.lastMonth ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-xs ${
                  stats.thisMonth > stats.lastMonth
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Math.round(
                  ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
                )}
                % from last month
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Methods
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{method.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.last4 ? `****${method.last4}` : method.email}
                    </p>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold">{payment.jobTitle}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {payment.method}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {payment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {payment.tasker}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${payment.amount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
