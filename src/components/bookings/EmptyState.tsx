"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, AlertCircle, CheckCircle, Play, X } from "lucide-react";

type TaskStatus =
  | "all"
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

interface EmptyStateProps {
  activeTab: TaskStatus;
}

// Utility functions moved outside component
const getStatusIcon = (status: TaskStatus) => {
  const icons = {
    all: User,
    pending: AlertCircle,
    accepted: CheckCircle,
    confirmed: CheckCircle,
    in_progress: Play,
    completed: CheckCircle,
    cancelled: X,
  };
  const Icon = icons[status];
  return <Icon className="h-4 w-4" />;
};

const getStatusColor = (status: TaskStatus) => {
  const colors = {
    all: "text-color-primary",
    pending: "text-color-warning",
    accepted: "text-color-info",
    confirmed: "text-color-success",
    in_progress: "text-color-primary",
    completed: "text-color-success",
    cancelled: "text-color-error",
  };
  return colors[status];
};

const getStatusBgColor = (status: TaskStatus) => {
  const bgColors = {
    all: "bg-color-primary/10",
    pending: "bg-color-warning/10",
    accepted: "bg-color-info/10",
    confirmed: "bg-color-success/10",
    in_progress: "bg-color-primary/10",
    completed: "bg-color-success/10",
    cancelled: "bg-color-error/10",
  };
  return bgColors[status];
};

const getEmptyStateMessage = (activeTab: TaskStatus) => {
  const messages = {
    all: {
      title: "No bookings found",
      description: "You have no bookings yet.",
    },
    pending: {
      title: "No pending requests",
      description: "You have no new booking requests at the moment.",
    },
    completed: {
      title: "No completed bookings",
      description: "You have no completed bookings yet.",
    },
    accepted: {
      title: "No accepted bookings",
      description: "You have no accepted bookings at the moment.",
    },
    confirmed: {
      title: "No confirmed bookings",
      description: "You have no confirmed bookings at the moment.",
    },
    in_progress: {
      title: "No active tasks",
      description: "You have no tasks in progress at the moment.",
    },
    cancelled: {
      title: "No cancelled bookings",
      description: "You have no cancelled bookings.",
    },
  };
  return messages[activeTab];
};

export const EmptyState = React.memo<EmptyStateProps>(({ activeTab }) => {
  const message = getEmptyStateMessage(activeTab);

  return (
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
            {message.title}
          </h3>
          <p className="text-sm text-color-text-secondary mobile-leading">
            {message.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

EmptyState.displayName = "EmptyState";
