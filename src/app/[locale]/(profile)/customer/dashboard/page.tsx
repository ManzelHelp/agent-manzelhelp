"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CheckCircle,
  Plus,
  MessageSquare,
  AlertCircle,
  Eye,
  ChevronRight,
  Briefcase,
  CreditCard,
  Home,
} from "lucide-react";
import Link from "next/link";

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

export default function CustomerDashboardPage() {
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

  // Removed payments variable

  // Removed messages variable

  // Removed reviews variable

  // Removed addresses variable

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

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
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
                    <p className="text-xs text-muted-foreground">{job.date}</p>
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
            <Link href="/customer/profile#addresses" className="block">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Addresses
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
  );
}
