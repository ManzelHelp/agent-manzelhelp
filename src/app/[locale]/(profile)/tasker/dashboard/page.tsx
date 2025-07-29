"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  Star,
  Clock,
  Eye,
  ChevronRight,
  Activity,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - replace with real data fetching
  const stats = {
    activeJobs: 3,
    completedJobs: 47,
    avgRating: 4.8,
    responseTime: "2h",
  };

  const messages = [
    {
      id: 1,
      client: "Sarah M.",
      message: "What cleaning supplies do you need me to provide?",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      client: "Tech Corp",
      message: "Can we reschedule for tomorrow?",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      client: "Emma T.",
      message: "Thank you for the great service!",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mobile-text-optimized">
              Tasker Dashboard
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 mobile-leading">
              Welcome back! Here's an overview of your business
            </p>
          </div>
        </div>

        {/* Stats Overview - Mobile First Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Active Jobs
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.activeJobs}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Completed
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.completedJobs}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Total completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Rating
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors duration-200">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.avgRating}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Average rating
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                Response Time
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-200">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.responseTime}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Messages - Mobile Optimized Layout */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasker/create-offer" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white border-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Add New Service
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/bookings" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-secondary)]/10 rounded-full">
                      <Eye className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Tasks & Bookings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/finance" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Earnings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/messages" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full relative">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      {messages.filter((m) => m.unread).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {messages.filter((m) => m.unread).length}
                        </span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      Check Messages
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tasker/reviews" className="block">
                <Button
                  className="w-full justify-between h-12 sm:h-14 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-all duration-200 mobile-button mobile-focus-ring"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      View Reviews
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--color-secondary)]" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {messages.slice(0, 3).map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                      message.unread
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                        : "bg-[var(--color-accent)] border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)]">
                            {message.client}
                          </h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {message.message}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length > 3 && (
                  <Link href="/tasker/messages" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12 sm:h-14 text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)]/10 transition-all duration-200 mobile-button"
                    >
                      View All Messages
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
