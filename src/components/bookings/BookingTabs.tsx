"use client";

import React from "react";
import {
  User,
  AlertCircle,
  CheckCircle,
  Play,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type TaskStatus =
  | "all"
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

interface BookingTabsProps {
  activeTab: TaskStatus;
  onTabChange: (tab: TaskStatus) => void;
  bookingCounts: Record<TaskStatus, number>;
  isNavExpanded: boolean;
  onNavToggle: () => void;
  filteredBookingsLength: number;
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

const getStatusLabel = (status: TaskStatus) => {
  const labels = {
    all: "All Bookings",
    pending: "Pending Requests",
    accepted: "Accepted",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
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

const TabButton = React.memo<{
  status: TaskStatus;
  count: number;
  isActive: boolean;
  onClick: () => void;
}>(({ status, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all touch-target mobile-focus shadow-sm
    ${
      isActive
        ? "bg-color-primary text-color-surface shadow-md scale-105 z-10 ring-2 ring-color-primary-dark !border-none"
        : "bg-transparent text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent-light !border-none"
    }
  `}
    style={{ minWidth: 0 }}
    aria-current={isActive ? "page" : undefined}
  >
    <div
      className={`${isActive ? "text-color-surface" : getStatusColor(status)}`}
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
          isActive
            ? "bg-color-surface/20 text-color-surface"
            : "bg-color-accent text-color-text-secondary"
        }`}
      >
        {count}
      </span>
    )}
  </button>
));

TabButton.displayName = "TabButton";

const MobileNavDropdown = React.memo<{
  isExpanded: boolean;
  activeTab: TaskStatus;
  onTabChange: (tab: TaskStatus) => void;
  onToggle: () => void;
  bookingCounts: Record<TaskStatus, number>;
  filteredBookingsLength: number;
}>(
  ({
    isExpanded,
    activeTab,
    onTabChange,
    onToggle,
    bookingCounts,
    filteredBookingsLength,
  }) => (
    <div className="sm:hidden">
      <button
        onClick={onToggle}
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
            {filteredBookingsLength}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 p-2 bg-color-surface border border-color-border rounded-lg shadow-sm space-y-1">
          {(
            [
              "all",
              "pending",
              "accepted",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ] as TaskStatus[]
          ).map((status) => (
            <button
              key={status}
              onClick={() => {
                onTabChange(status);
                onToggle();
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
                {bookingCounts[status]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
);

MobileNavDropdown.displayName = "MobileNavDropdown";

export const BookingTabs = React.memo<BookingTabsProps>(
  ({
    activeTab,
    onTabChange,
    bookingCounts,
    isNavExpanded,
    onNavToggle,
    filteredBookingsLength,
  }) => {
    const handleTabChange = (status: TaskStatus) => {
      onTabChange(status);
      onNavToggle();
    };

    return (
      <>
        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex gap-1 bg-color-accent-light p-2 rounded-xl">
          {(
            [
              "all",
              "pending",
              "accepted",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ] as TaskStatus[]
          ).map((status) => (
            <TabButton
              key={status}
              status={status}
              count={bookingCounts[status]}
              isActive={activeTab === status}
              onClick={() => onTabChange(status)}
            />
          ))}
        </div>

        {/* Mobile Navigation Dropdown */}
        <MobileNavDropdown
          isExpanded={isNavExpanded}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onToggle={onNavToggle}
          bookingCounts={bookingCounts}
          filteredBookingsLength={filteredBookingsLength}
        />
      </>
    );
  }
);

BookingTabs.displayName = "BookingTabs";
