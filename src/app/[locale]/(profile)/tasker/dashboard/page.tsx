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
  AlertCircle,
  Eye,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - replace with real data fetching
  const profileCompleteness = 65;
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Profile Completeness */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tasker Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business
          </p>
        </div>

        {/* Profile Completeness Bar */}
        {profileCompleteness < 100 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Profile {profileCompleteness}% complete
                    </span>
                    <Link href="/tasker/profile">
                      <Button variant="outline" size="sm">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompleteness}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete your profile to get more bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/tasker/create-offer" className="block">
              <Button className="w-full justify-between" variant="default">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Service
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasker/bookings" className="block">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Tasks & Bookings
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasker/finance" className="block">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  View Earnings
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasker/messages" className="block">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Check Messages
                  {messages.filter((m) => m.unread).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messages.filter((m) => m.unread).length}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasker/reviews" className="block">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  View Reviews
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.unread ? "bg-blue-50 border-blue-200" : "bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{message.client}</h3>
                        {message.unread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-1">{message.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {messages.length > 3 && (
                <Link href="/tasker/messages" className="block">
                  <Button variant="ghost" className="w-full">
                    View All Messages
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
