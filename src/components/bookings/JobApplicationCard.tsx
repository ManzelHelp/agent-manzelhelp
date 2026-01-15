"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, User, MessageSquare, AlertCircle } from "lucide-react";
import type { TaskerJobApplicationWithDetails } from "@/actions/bookings";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/date-utils";

interface JobApplicationCardProps {
  application: TaskerJobApplicationWithDetails;
  onActionClick?: (application: TaskerJobApplicationWithDetails) => void;
  isUpdating?: boolean;
  actionButton?: {
    text: string;
    variant:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    action: string;
    className: string;
  };
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "withdrawn":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  }
};

const getJobStatusColor = (status: string | null) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export function JobApplicationCard({
  application,
  onActionClick,
  isUpdating,
  actionButton,
}: JobApplicationCardProps) {
  const t = useTranslations("jobApplications");
  const [imageError, setImageError] = useState(false);
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("labels.flexible");
    return formatDateShort(dateString);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  const getCustomerName = () => {
    const firstName = application.customer_first_name || "";
    const lastName = application.customer_last_name || "";
    return `${firstName} ${lastName}`.trim() || t("labels.jobPoster");
  };

  // Use the status from the application (already processed in getTaskerJobApplications)
  const displayStatus = application.status || "pending";

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
              {application.job_title || "Job Application"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {application.job_description || "No description available"}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <Badge className={getStatusColor(displayStatus)}>
              {t(`status.${displayStatus}`)}
            </Badge>
            {/* Only show job status if job is still active/relevant */}
            {application.job_status && 
             application.job_status !== "completed" && 
             application.job_status !== "cancelled" && (
              <Badge className={getJobStatusColor(application.job_status)}>
                {t(`jobStatus.${application.job_status}`)}
              </Badge>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {application.customer_avatar && !imageError ? (
              <Image
                src={application.customer_avatar}
                alt={getCustomerName()}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {getCustomerName()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {t("labels.jobPoster")}
            </p>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {formatPrice(application.proposed_price)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.proposedPrice")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {application.estimated_duration
                  ? `${application.estimated_duration}h`
                  : t("labels.flexible")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.estimatedDuration")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {formatDate(application.preferred_date ?? null)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.preferredDate")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {application.customer_budget
                  ? formatPrice(application.customer_budget)
                  : t("labels.notSpecified")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.customerBudget")}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {application.message && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {application.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {actionButton && actionButton.action !== "none" && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => onActionClick?.(application)}
              disabled={isUpdating}
              className={`w-full ${actionButton.className}`}
              variant={actionButton.variant}
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                actionButton.text
              )}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("labels.appliedOn")}{" "}
            {formatDateShort(application.created_at)}
          </p>
        </div>
      </div>
    </Card>
  );
}
