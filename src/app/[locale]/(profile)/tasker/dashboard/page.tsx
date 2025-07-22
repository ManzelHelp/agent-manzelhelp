"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  Star,
  User,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight,
  MapPin,
  Briefcase,
  Activity,
} from "lucide-react";
import Link from "next/link";

type TabType =
  | "overview"
  | "tasks"
  | "earnings"
  | "bookings"
  | "messages"
  | "reviews";
type TaskStatus = "requests" | "pending" | "active" | "completed";

interface Task {
  id: number;
  title: string;
  client: string;
  price: number;
  location: string;
  date: string;
  urgent?: boolean;
  status?: string;
  progress?: number;
  rating?: number;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [taskFilter, setTaskFilter] = useState<TaskStatus>("requests");

  // Mock data - replace with real data fetching
  const profileCompleteness = 65;
  const earnings = {
    today: 125,
    thisWeek: 890,
    thisMonth: 3250,
    total: 12840,
  };

  const stats = {
    activeJobs: 3,
    completedJobs: 47,
    avgRating: 4.8,
    responseTime: "2h",
  };

  const tasks = {
    requests: [
      {
        id: 1,
        title: "House Cleaning",
        client: "Sarah M.",
        price: 80,
        location: "Downtown",
        date: "2024-01-15",
        urgent: true,
      },
      {
        id: 2,
        title: "Furniture Assembly",
        client: "John D.",
        price: 60,
        location: "Westside",
        date: "2024-01-16",
        urgent: false,
      },
      {
        id: 3,
        title: "Garden Maintenance",
        client: "Lisa K.",
        price: 45,
        location: "Suburbs",
        date: "2024-01-17",
        urgent: false,
      },
    ],
    pending: [
      {
        id: 4,
        title: "Moving Help",
        client: "Mike R.",
        price: 120,
        location: "Eastside",
        date: "2024-01-18",
        status: "awaiting_approval",
      },
    ],
    active: [
      {
        id: 5,
        title: "Office Cleaning",
        client: "Tech Corp",
        price: 200,
        location: "Business District",
        date: "2024-01-14",
        progress: 75,
      },
      {
        id: 6,
        title: "Pet Sitting",
        client: "Emma T.",
        price: 35,
        location: "Midtown",
        date: "2024-01-13",
        progress: 50,
      },
    ],
    completed: [
      {
        id: 7,
        title: "Kitchen Deep Clean",
        client: "Robert S.",
        price: 95,
        location: "Downtown",
        date: "2024-01-12",
        rating: 5,
      },
      {
        id: 8,
        title: "Plumbing Fix",
        client: "Anna L.",
        price: 75,
        location: "Suburbs",
        date: "2024-01-10",
        rating: 4,
      },
    ],
  };

  const upcomingBookings = [
    {
      id: 1,
      service: "House Cleaning",
      client: "Sarah M.",
      date: "2024-01-16",
      time: "09:00",
      duration: "3h",
      price: 80,
    },
    {
      id: 2,
      service: "Furniture Assembly",
      client: "John D.",
      date: "2024-01-17",
      time: "14:00",
      duration: "2h",
      price: 60,
    },
  ];

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

  const reviews = [
    {
      id: 1,
      client: "Robert S.",
      rating: 5,
      comment: "Excellent work! Very thorough and professional.",
      date: "2024-01-12",
      service: "Kitchen Deep Clean",
    },
    {
      id: 2,
      client: "Anna L.",
      rating: 4,
      comment: "Good service, arrived on time.",
      date: "2024-01-10",
      service: "Plumbing Fix",
    },
    {
      id: 3,
      client: "Mike T.",
      rating: 5,
      comment: "Highly recommend! Will book again.",
      date: "2024-01-08",
      service: "Garden Work",
    },
  ];

  const TabButton = ({
    tab,
    children,
    count,
  }: {
    tab: TabType;
    children: React.ReactNode;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
        activeTab === tab
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Profile Completeness */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tasker Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your services and bookings
            </p>
          </div>
          <Link href="/tasker/create-offer">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </Link>
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
                    <Link href="/tasker/dashboard/settings">
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-muted p-2 rounded-lg">
        <TabButton tab="overview">
          <Activity className="h-4 w-4" />
          Overview
        </TabButton>
        <TabButton tab="tasks" count={tasks.requests.length}>
          <Briefcase className="h-4 w-4" />
          Tasks
        </TabButton>
        <TabButton tab="earnings">
          <DollarSign className="h-4 w-4" />
          Earnings
        </TabButton>
        <TabButton tab="bookings">
          <Calendar className="h-4 w-4" />
          Bookings
        </TabButton>
        <TabButton
          tab="messages"
          count={messages.filter((m) => m.unread).length}
        >
          <MessageSquare className="h-4 w-4" />
          Messages
        </TabButton>
        <TabButton tab="reviews">
          <Star className="h-4 w-4" />
          Reviews
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">
                  Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.responseTime}</div>
                <p className="text-xs text-muted-foreground">
                  Average response
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.requests.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.client} • {task.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${task.price}</p>
                        {task.urgent && (
                          <span className="text-xs text-red-600">Urgent</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setActiveTab("tasks")}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View New Requests
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setActiveTab("messages")}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Check Messages
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setActiveTab("earnings")}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Earnings
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(
              ["requests", "pending", "active", "completed"] as TaskStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => setTaskFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  taskFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {status} ({tasks[status].length})
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {tasks[taskFilter].map((task: Task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.urgent && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.date}
                        </span>
                      </div>
                      {task.progress && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Progress:</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">${task.price}</p>
                        {task.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{task.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm">
                        {taskFilter === "requests" ? "Accept" : "View Details"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.today}</div>
                <p className="text-xs text-green-600">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.thisWeek}</div>
                <p className="text-xs text-green-600">+8% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.thisMonth}</div>
                <p className="text-xs text-green-600">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.total}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.completed.slice(0, 5).map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.client} • {task.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +${task.price}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-semibold">{booking.service}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {booking.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.time} ({booking.duration})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${booking.price}</p>
                      <Button size="sm" variant="outline">
                        Contact Client
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communications with clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      message.unread ? "bg-blue-50 border-blue-200" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{message.client}</h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {message.time}
                        </p>
                      </div>
                      <Button size="sm">Reply</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{stats.avgRating}</div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {reviews.length} reviews
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  5-Star Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {reviews.filter((r) => r.rating === 5).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (reviews.filter((r) => r.rating === 5).length /
                      reviews.length) *
                      100
                  )}
                  % of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  Client satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="space-y-3 pb-6 border-b last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{review.client}</h3>
                        <p className="text-sm text-muted-foreground">
                          {review.service} • {review.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
