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
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  Star,
  User,
  AlertCircle,
  Eye,
  ChevronRight,
  MapPin,
  Briefcase,
  Activity,
  CreditCard,
  Home,
} from "lucide-react";
import Link from "next/link";

type TabType =
  | "overview"
  | "tasks"
  | "payments"
  | "messages"
  | "reviews"
  | "addresses";
type TaskStatus = "active" | "pending" | "completed" | "cancelled";

interface JobItem {
  id: string;
  title: string;
  service: string;
  tasker: string;
  price: number;
  location: string;
  date: string;
  time?: string;
  status: "pending" | "active" | "completed" | "cancelled";
  rating?: number;
  urgent?: boolean;
  progress?: number;
}

interface Payment {
  id: number;
  jobTitle: string;
  tasker: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

interface Address {
  id: number;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Mock data - replace with real data fetching
  const profileCompleteness = 70;

  const stats = {
    activeJobs: 2,
    completedJobs: 15,
    totalSpent: 1840,
    savedAddresses: 3,
  };

  const jobs: Record<TaskStatus, JobItem[]> = {
    active: [
      {
        id: "1",
        title: "House Deep Clean",
        service: "Cleaning",
        tasker: "Maria S.",
        price: 120,
        location: "Downtown",
        date: "2024-01-16",
        time: "09:00",
        status: "active",
        progress: 60,
      },
      {
        id: "2",
        title: "Furniture Assembly",
        service: "Handyman",
        tasker: "John D.",
        price: 80,
        location: "Westside",
        date: "2024-01-17",
        time: "14:00",
        status: "active",
        progress: 25,
      },
    ],
    pending: [
      {
        id: "3",
        title: "Garden Maintenance",
        service: "Gardening",
        tasker: "Lisa K.",
        price: 65,
        location: "Suburbs",
        date: "2024-01-18",
        time: "10:00",
        status: "pending",
        urgent: true,
      },
    ],
    completed: [
      {
        id: "4",
        title: "Kitchen Deep Clean",
        service: "Cleaning",
        tasker: "Robert S.",
        price: 95,
        location: "Downtown",
        date: "2024-01-12",
        status: "completed",
        rating: 5,
      },
      {
        id: "5",
        title: "Plumbing Repair",
        service: "Plumbing",
        tasker: "Anna L.",
        price: 150,
        location: "Suburbs",
        date: "2024-01-10",
        status: "completed",
        rating: 4,
      },
      {
        id: "6",
        title: "Moving Help",
        service: "Moving",
        tasker: "Mike R.",
        price: 200,
        location: "Eastside",
        date: "2024-01-08",
        status: "completed",
        rating: 5,
      },
    ],
    cancelled: [
      {
        id: "7",
        title: "Window Cleaning",
        service: "Cleaning",
        tasker: "Emma T.",
        price: 60,
        location: "Midtown",
        date: "2024-01-05",
        status: "cancelled",
      },
    ],
  };

  const payments: Payment[] = [
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

  const messages = [
    {
      id: 1,
      tasker: "Maria S.",
      message: "I'll arrive 10 minutes early to set up my equipment.",
      time: "1 hour ago",
      unread: true,
      jobTitle: "House Deep Clean",
    },
    {
      id: 2,
      tasker: "John D.",
      message: "Could you confirm the furniture pieces that need assembly?",
      time: "3 hours ago",
      unread: true,
      jobTitle: "Furniture Assembly",
    },
    {
      id: 3,
      tasker: "Lisa K.",
      message: "Thanks for booking! I'll bring all necessary tools.",
      time: "1 day ago",
      unread: false,
      jobTitle: "Garden Maintenance",
    },
  ];

  const reviews = [
    {
      id: 1,
      tasker: "Robert S.",
      rating: 5,
      comment: "Excellent cleaning service! Very thorough and professional.",
      date: "2024-01-12",
      service: "Kitchen Deep Clean",
    },
    {
      id: 2,
      tasker: "Anna L.",
      rating: 4,
      comment: "Fixed the issue quickly and efficiently.",
      date: "2024-01-10",
      service: "Plumbing Repair",
    },
    {
      id: 3,
      tasker: "Mike R.",
      rating: 5,
      comment: "Very helpful and careful with our belongings.",
      date: "2024-01-08",
      service: "Moving Help",
    },
  ];

  const addresses: Address[] = [
    { id: 1, label: "Home", address: "123 Main St, Downtown", isDefault: true },
    {
      id: 2,
      label: "Office",
      address: "456 Business Ave, Business District",
      isDefault: false,
    },
    {
      id: 3,
      label: "Parents House",
      address: "789 Oak Rd, Suburbs",
      isDefault: false,
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
              Customer Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your service bookings and requests
            </p>
          </div>
          <Link href="/customer/customer-offer">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
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
                    <Link href="/customer/dashboard/settings">
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
                    Complete your profile to get better service matches
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
        <TabButton tab="reviews">
          <Star className="h-4 w-4" />
          Reviews
        </TabButton>
        <TabButton tab="addresses">
          <Home className="h-4 w-4" />
          Addresses
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
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpent}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Addresses</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.savedAddresses}</div>
                <p className="text-xs text-muted-foreground">Saved locations</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.active.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.tasker} • {job.location}
                        </p>
                        {typeof job.progress === "number" && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {job.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${job.price}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.date}
                        </p>
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
                <Link href="/customer/bookings" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Bookings
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/customer/finance" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Finance
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/customer/messages" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/customer/customer-offer">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Post New Job
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpent}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$565</div>
                <p className="text-xs text-green-600">-12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {payments
                    .filter((p) => p.status === "pending")
                    .reduce((sum, p) => sum + p.amount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-semibold">{payment.jobTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {payment.tasker}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {payment.method}
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
      )}

      {activeTab === "messages" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communications with taskers</CardDescription>
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
                          <h3 className="font-semibold">{message.tasker}</h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {message.jobTitle}
                        </p>
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
                  Reviews Given
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reviews.length}</div>
                <p className="text-xs text-muted-foreground">Total reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Given
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    {(
                      reviews.reduce((sum, r) => sum + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)}
                  </div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">Your ratings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  5-Star Given
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
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
                        <h3 className="font-semibold">{review.tasker}</h3>
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

      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{address.label}</h3>
                        {address.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {address.address}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button size="sm" variant="outline">
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
