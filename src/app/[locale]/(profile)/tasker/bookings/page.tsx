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
} from "lucide-react";

type TaskStatus = "requests" | "upcoming" | "active" | "completed";

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
  const [activeTab, setActiveTab] = useState<TaskStatus>("requests");

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

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
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
      <span className="inline sm:hidden">{status}</span>
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Manage your booking requests and ongoing tasks
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-muted p-2 rounded-lg">
        {(["requests", "upcoming", "active", "completed"] as TaskStatus[]).map(
          (status) => (
            <TabButton
              key={status}
              status={status}
              count={tasks[status].length}
            />
          )
        )}
      </div>

      {/* Task Cards */}
      <div className="grid gap-4">
        {tasks[activeTab].map((task: Task) => (
          <Card key={task.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.urgent && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    )}
                    {task.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{task.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
                          <span className="text-xs text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-xs font-medium">
                            {task.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:min-w-[140px]">
                  <p className="text-2xl font-bold">${task.price}</p>
                  <Button
                    size="sm"
                    variant={activeTab === "requests" ? "default" : "outline"}
                  >
                    {activeTab === "requests"
                      ? "Accept Request"
                      : activeTab === "completed"
                      ? "View Details"
                      : "Manage Task"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tasks[activeTab].length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {getStatusIcon(activeTab)}
              </div>
              <h3 className="font-semibold">
                No {getStatusLabel(activeTab).toLowerCase()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "requests"
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
  );
}
