"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Star,
  User,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Plus,
  Filter,
  Search,
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
  status: TaskStatus;
  rating?: number;
  urgent?: boolean;
  progress?: number;
  description?: string;
  duration?: string;
}

export default function CustomerBookingsPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with real data fetching
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
        description:
          "Complete house cleaning including kitchen, bathrooms, and living areas",
        duration: "4 hours",
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
        description:
          "Assembly of new furniture including bed frame and dresser",
        duration: "2 hours",
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
        description: "Regular garden maintenance including pruning and weeding",
        duration: "3 hours",
      },
      {
        id: "4",
        title: "Window Cleaning",
        service: "Cleaning",
        tasker: "Emma T.",
        price: 45,
        location: "Midtown",
        date: "2024-01-19",
        time: "11:00",
        status: "pending",
        description: "Exterior and interior window cleaning",
        duration: "2 hours",
      },
    ],
    completed: [
      {
        id: "5",
        title: "Kitchen Deep Clean",
        service: "Cleaning",
        tasker: "Robert S.",
        price: 95,
        location: "Downtown",
        date: "2024-01-12",
        status: "completed",
        rating: 5,
        description:
          "Deep cleaning of kitchen including appliances and cabinets",
        duration: "3 hours",
      },
      {
        id: "6",
        title: "Plumbing Repair",
        service: "Plumbing",
        tasker: "Anna L.",
        price: 150,
        location: "Suburbs",
        date: "2024-01-10",
        status: "completed",
        rating: 4,
        description: "Fixing leaky faucet and replacing shower head",
        duration: "1.5 hours",
      },
      {
        id: "7",
        title: "Moving Help",
        service: "Moving",
        tasker: "Mike R.",
        price: 200,
        location: "Eastside",
        date: "2024-01-08",
        status: "completed",
        rating: 5,
        description: "Assistance with moving furniture and boxes",
        duration: "6 hours",
      },
    ],
    cancelled: [
      {
        id: "8",
        title: "Window Cleaning",
        service: "Cleaning",
        tasker: "Emma T.",
        price: 60,
        location: "Midtown",
        date: "2024-01-05",
        status: "cancelled",
        description: "Exterior window cleaning service",
        duration: "2 hours",
      },
    ],
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "active":
        return "Active Jobs";
      case "pending":
        return "Pending Jobs";
      case "completed":
        return "Completed Jobs";
      case "cancelled":
        return "Cancelled Jobs";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  const TabButton = ({
    status,
    count,
  }: {
    status: TaskStatus;
    count: number;
  }) => (
    <button
      onClick={() => setActiveTab(status)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
        activeTab === status
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {getStatusIcon(status)}
      <span className="hidden sm:inline">{getStatusLabel(status)}</span>
      <span className="inline sm:hidden capitalize">{status}</span>
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 ${
            activeTab === status
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted-foreground/20"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const filteredJobs = jobs[activeTab].filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tasker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
            <p className="text-muted-foreground">
              Track and manage all your service bookings
            </p>
          </div>
          <Link href="/customer/create-offer">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, taskers, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Service Type
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="">All Services</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="handyman">Handyman</option>
                    <option value="gardening">Gardening</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="moving">Moving</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="">All Prices</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200+">$200+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Date Range
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="past">Past Jobs</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-muted p-2 rounded-lg">
        {(["active", "pending", "completed", "cancelled"] as TaskStatus[]).map(
          (status) => (
            <TabButton
              key={status}
              status={status}
              count={jobs[status].length}
            />
          )
        )}
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        {job.urgent && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Urgent
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    {job.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {job.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {job.tasker}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.date}
                    </span>
                    {job.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.time}
                      </span>
                    )}
                    {job.duration && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {job.duration}
                      </span>
                    )}
                  </div>

                  {job.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-xs font-medium">
                          {job.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-4 min-w-[140px]">
                  <div className="text-right">
                    <p className="text-2xl font-bold">${job.price}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.service}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {job.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Message
                      </Button>
                    )}
                    <Button size="sm" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {getStatusIcon(activeTab)}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  No {getStatusLabel(activeTab).toLowerCase()}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {activeTab === "active"
                    ? "You have no jobs currently in progress."
                    : activeTab === "pending"
                    ? "You have no pending job requests."
                    : activeTab === "completed"
                    ? "You haven't completed any jobs yet."
                    : "You have no cancelled jobs."}
                </p>
              </div>
              {activeTab === "pending" && (
                <Link href="/customer/create-offer">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Post Your First Job
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {filteredJobs.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{jobs.active.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.pending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.completed.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${jobs.completed.reduce((sum, job) => sum + job.price, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
