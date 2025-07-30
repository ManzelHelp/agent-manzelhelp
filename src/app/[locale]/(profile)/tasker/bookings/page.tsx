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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type TaskStatus = "all" | "requests" | "upcoming" | "active" | "completed";

interface Task {
  id: number;
  title: string;
  client: string;
  price: number;
  location: string;
  date: string;
  time?: string;
  duration?: string;
  urgent?: boolean;
  status?: string;
  progress?: number;
  rating?: number;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>("all");
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Mock data - replace with real data fetching
  const tasks = {
    requests: [
      {
        id: 1,
        title: "House Cleaning",
        client: "Sarah M.",
        price: 80,
        location: "Downtown",
        date: "2024-01-15",
        time: "09:00",
        duration: "3h",
        urgent: true,
      },
      {
        id: 2,
        title: "Furniture Assembly",
        client: "John D.",
        price: 60,
        location: "Westside",
        date: "2024-01-16",
        time: "14:00",
        duration: "2h",
      },
    ],
    upcoming: [
      {
        id: 3,
        title: "Moving Help",
        client: "Mike R.",
        price: 120,
        location: "Eastside",
        date: "2024-01-18",
        time: "10:00",
        duration: "4h",
      },
      {
        id: 4,
        title: "Garden Maintenance",
        client: "Lisa K.",
        price: 45,
        location: "Suburbs",
        date: "2024-01-20",
        time: "15:00",
        duration: "2h",
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
        time: "08:00",
        duration: "6h",
        progress: 75,
      },
      {
        id: 6,
        title: "Home Renovation",
        client: "Emma T.",
        price: 350,
        location: "Midtown",
        date: "2024-01-13",
        time: "09:00",
        duration: "3 days",
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
        time: "10:00",
        duration: "4h",
        rating: 5,
      },
      {
        id: 8,
        title: "Plumbing Fix",
        client: "Anna L.",
        price: 75,
        location: "Suburbs",
        date: "2024-01-10",
        time: "13:00",
        duration: "1h",
        rating: 4,
      },
    ],
  };
  // Aggregate all tasks for the 'all' tab
  const allTasks = [
    ...tasks.requests,
    ...tasks.upcoming,
    ...tasks.active,
    ...tasks.completed,
  ];
  // Add 'all' to tasks object for easier access
  const tasksWithAll = { ...tasks, all: allTasks };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "all":
        return <User className="h-4 w-4" />;
      case "requests":
        return <AlertCircle className="h-4 w-4" />;
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "active":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "all":
        return "All Tasks";
      case "requests":
        return "Booking Requests";
      case "upcoming":
        return "Upcoming Tasks";
      case "active":
        return "Active Tasks";
      case "completed":
        return "Completed Tasks";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "all":
        return "text-color-primary";
      case "requests":
        return "text-color-warning";
      case "upcoming":
        return "text-color-info";
      case "active":
        return "text-color-success";
      case "completed":
        return "text-color-text-secondary";
    }
  };

  const getStatusBgColor = (status: TaskStatus) => {
    switch (status) {
      case "all":
        return "bg-color-primary/10";
      case "requests":
        return "bg-color-warning/10";
      case "upcoming":
        return "bg-color-info/10";
      case "active":
        return "bg-color-success/10";
      case "completed":
        return "bg-color-accent-light";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const TabButton = ({
    status,
    count,
  }: {
    status: TaskStatus;
    count: number;
  }) => (
    <button
      onClick={() => {
        setActiveTab(status);
        setIsNavExpanded(false); // Close dropdown when tab is selected
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all touch-target mobile-focus shadow-sm
        ${
          activeTab === status
            ? "bg-color-primary text-color-surface shadow-md scale-105 z-10 ring-2 ring-color-primary-dark !border-none"
            : "bg-transparent text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent-light !border-none"
        }
      `}
      style={{ minWidth: 0 }}
      aria-current={activeTab === status ? "page" : undefined}
    >
      <div
        className={`$ {
          activeTab === status ? "text-color-surface" : getStatusColor(status)
        }`}
      >
        {getStatusIcon(status)}
      </div>
      <span className="text-sm font-medium hidden sm:inline mobile-text-base">
        {getStatusLabel(status)}
      </span>
      <span className="text-xs font-medium sm:hidden mobile-text-sm">
        {status}
      </span>
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 font-medium ${
            activeTab === status
              ? "bg-color-surface/20 text-color-surface"
              : "bg-color-accent text-color-text-secondary"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const MobileNavDropdown = () => {
    return (
      <div className="sm:hidden">
        <button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="flex items-center justify-between w-full p-3 bg-color-accent-light border border-color-border rounded-lg text-color-text-primary hover:bg-color-accent transition-all touch-target mobile-focus"
        >
          <div className="flex items-center gap-2">
            <div className={`${getStatusColor(activeTab)}`}>
              {getStatusIcon(activeTab)}
            </div>
            <span className="font-medium mobile-text-base">
              {getStatusLabel(activeTab)}
            </span>
            <span className="text-xs bg-color-accent text-color-text-secondary px-2 py-0.5 rounded-full font-medium">
              {tasksWithAll[activeTab].length}
            </span>
          </div>
          {isNavExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isNavExpanded && (
          <div className="mt-2 p-2 bg-color-surface border border-color-border rounded-lg shadow-sm space-y-1">
            {(
              [
                "all",
                "requests",
                "upcoming",
                "active",
                "completed",
              ] as TaskStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setActiveTab(status);
                  setIsNavExpanded(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all touch-target mobile-focus ${
                  activeTab === status
                    ? "bg-color-primary text-color-surface"
                    : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent-light"
                }`}
              >
                <div
                  className={`${
                    activeTab === status
                      ? "text-color-surface"
                      : getStatusColor(status)
                  }`}
                >
                  {getStatusIcon(status)}
                </div>
                <span className="text-sm font-medium mobile-text-base">
                  {getStatusLabel(status)}
                </span>
                <span className="text-xs bg-color-accent text-color-text-secondary px-2 py-0.5 rounded-full font-medium ml-auto">
                  {tasksWithAll[status].length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-color-bg smooth-scroll">
      <div className="container mx-auto px-4 py-6 space-y-6 mobile-spacing">
        {/* Page Header - Now part of normal page flow */}
        <div className="bg-color-surface border-b border-color-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-color-text-primary mobile-text-xl mobile-leading">
              Task Management
            </h1>
            <p className="text-color-text-secondary text-sm mt-1 mobile-leading">
              Manage your booking requests and ongoing tasks
            </p>
          </div>
        </div>
        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex gap-1 bg-color-accent-light p-2 rounded-xl">
          {(
            [
              "all",
              "requests",
              "upcoming",
              "active",
              "completed",
            ] as TaskStatus[]
          ).map((status) => (
            <TabButton
              key={status}
              status={status}
              count={tasksWithAll[status].length}
            />
          ))}
        </div>

        {/* Mobile Navigation Dropdown */}
        <MobileNavDropdown />

        {/* Task Cards */}
        <div className="space-y-4">
          {tasksWithAll[activeTab].map((task: Task) => (
            <Card
              key={task.id}
              className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 mobile-spacing">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-color-text-primary text-base mobile-text-base">
                        {task.title}
                      </h3>
                      {task.urgent && (
                        <span className="bg-color-warning/10 text-color-warning text-xs px-2 py-1 rounded-full font-medium">
                          Urgent
                        </span>
                      )}
                      {task.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-color-warning text-color-warning" />
                          <span className="text-sm text-color-text-primary mobile-text-sm">
                            {task.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-color-text-secondary mobile-leading">
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
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time} ({task.duration})
                        </span>
                      )}
                    </div>
                    {task.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-color-text-secondary mobile-text-sm">
                              Progress
                            </span>
                            <span className="text-xs font-medium text-color-text-primary mobile-text-sm">
                              {task.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-color-accent rounded-full h-2">
                            <div
                              className="bg-color-success h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[120px] w-full sm:w-auto">
                    <p className="text-xl font-bold text-color-text-primary mobile-text-lg">
                      {formatCurrency(task.price)}
                    </p>
                    <Button
                      size="sm"
                      className={`touch-target mobile-focus shadow-sm transition-all duration-200 w-full sm:w-auto
                        ${
                          activeTab === "requests"
                            ? "bg-color-secondary text-color-surface hover:bg-color-secondary-dark border-color-secondary-dark"
                            : activeTab === "completed"
                            ? "bg-color-success text-color-surface hover:bg-color-success-dark border-color-success-dark"
                            : activeTab === "active"
                            ? "bg-color-info text-color-surface hover:bg-color-info-dark border-color-info-dark"
                            : "bg-color-primary text-color-surface hover:bg-color-primary-dark border-color-primary-dark"
                        }
                      `}
                    >
                      {activeTab === "requests"
                        ? "Accept Request"
                        : activeTab === "completed"
                        ? "View Details"
                        : activeTab === "active"
                        ? "Update Progress"
                        : "Start Task"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="touch-target mobile-focus w-full sm:w-auto mt-1 sm:mt-0 border-color-primary text-color-primary hover:bg-color-primary/10"
                    >
                      View Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tasksWithAll[activeTab].length === 0 && (
          <Card className="border-color-border bg-color-surface shadow-sm">
            <CardContent className="py-8 mobile-spacing">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div
                    className={`p-3 rounded-full ${getStatusBgColor(
                      activeTab
                    )} ${getStatusColor(activeTab)}`}
                  >
                    {getStatusIcon(activeTab)}
                  </div>
                </div>
                <h3 className="font-semibold text-color-text-primary mobile-text-lg mobile-leading">
                  {activeTab === "all"
                    ? "No tasks found"
                    : `No ${getStatusLabel(activeTab).toLowerCase()}`}
                </h3>
                <p className="text-sm text-color-text-secondary mobile-leading">
                  {activeTab === "all"
                    ? "You have no tasks yet."
                    : activeTab === "requests"
                    ? "You have no new booking requests at the moment."
                    : activeTab === "upcoming"
                    ? "You have no upcoming tasks scheduled."
                    : activeTab === "active"
                    ? "You have no tasks currently in progress."
                    : "You have no completed tasks yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
