"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type TaskerBookingTab =
  | "my-bookings"
  | "booked-taskers"
  | "my-applications";

interface TaskerBookingTabsProps {
  activeTab: TaskerBookingTab;
  onTabChange: (tab: TaskerBookingTab) => void;
  bookingCounts: {
    myBookings: number;
    bookedTaskers: number;
    myApplications: number;
  };
  isNavExpanded: boolean;
  onNavToggle: () => void;
  filteredCount: number;
}

const tabConfig = {
  "my-bookings": {
    label: "My Bookings",
    icon: Calendar,
    description: "Bookings for your services",
  },
  "booked-taskers": {
    label: "Booked Taskers",
    icon: Users,
    description: "Services you've booked",
  },
  "my-applications": {
    label: "My Applications",
    icon: FileText,
    description: "Jobs you've applied to",
  },
};

export function TaskerBookingTabs({
  activeTab,
  onTabChange,
  bookingCounts,
  isNavExpanded,
  onNavToggle,
  filteredCount,
}: TaskerBookingTabsProps) {
  const tabs = Object.entries(tabConfig) as [
    TaskerBookingTab,
    (typeof tabConfig)[TaskerBookingTab]
  ][];

  return (
    <div className="space-y-4">
      {/* Mobile Navigation Toggle */}
      <div className="md:hidden">
        <Button
          onClick={onNavToggle}
          variant="outline"
          className="w-full justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <div className="flex items-center space-x-2">
            {React.createElement(tabConfig[activeTab].icon, {
              className: "w-4 h-4 text-slate-600 dark:text-slate-400",
            })}
            <span className="font-medium text-slate-900 dark:text-white">
              {tabConfig[activeTab].label}
            </span>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {filteredCount}
            </Badge>
          </div>
          {isNavExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </Button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {tabs.map(([tab, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === tab;
            const count =
              bookingCounts[
                tab === "my-bookings"
                  ? "myBookings"
                  : tab === "booked-taskers"
                  ? "bookedTaskers"
                  : "myApplications"
              ];

            return (
              <Button
                key={tab}
                onClick={() => onTabChange(tab)}
                variant={isActive ? "default" : "ghost"}
                className={`flex-1 justify-start space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
                <Badge
                  className={`${
                    isActive
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isNavExpanded && (
        <div className="md:hidden space-y-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-lg">
          {tabs.map(([tab, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === tab;
            const count =
              bookingCounts[
                tab === "my-bookings"
                  ? "myBookings"
                  : tab === "booked-taskers"
                  ? "bookedTaskers"
                  : "myApplications"
              ];

            return (
              <Button
                key={tab}
                onClick={() => onTabChange(tab)}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs opacity-75">{config.description}</div>
                </div>
                <Badge
                  className={`${
                    isActive
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      )}

      {/* Active Tab Description */}
      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tabConfig[activeTab].description}
        </p>
      </div>
    </div>
  );
}
