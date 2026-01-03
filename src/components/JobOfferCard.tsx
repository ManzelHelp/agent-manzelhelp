"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "@/types/supabase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Clock,
  Shield,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/date-utils";
import { JobDetailDrawer } from "./drawers/JobDetailDrawer";

interface Job {
  id: string;
  title: string;
  description: string;
  customer_budget: number;
  currency: string;
  estimated_duration: number;
  preferred_date: string;
  is_flexible: boolean;
  is_promoted: boolean;
  current_applications: number;
  max_applications: number;
  created_at: string;
}

interface JobOfferCardProps {
  job: Job;
  customer: User;
}

function JobOfferCard({ job, customer }: JobOfferCardProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Format relative time on client side only to avoid hydration mismatch
  useEffect(() => {
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) return t("timeAgo.justNow");
      if (diffInMinutes < 60)
        return t("timeAgo.minutesAgo", { count: diffInMinutes });
      if (diffInHours < 24)
        return t("timeAgo.hoursAgo", { count: diffInHours });
      if (diffInDays === 1)
        return t("timeAgo.dayAgo");
      return t("timeAgo.daysAgo", { count: diffInDays });
    };

    setRelativeTime(formatRelativeTime(job.created_at));
  }, [job.created_at, t]);

  const formatDate = (dateString: string) => {
    return formatDateShort(dateString);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last || "U";
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-0.5 rounded-xl">
      <div className="relative flex flex-col h-full">
        {/* Promoted Badge */}
        {job.is_promoted && (
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>{t("promoted")}</span>
          </div>
        )}

        {/* Header: Customer Profile */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative h-12 w-12 flex-shrink-0">
              {customer.avatar_url && !imageError ? (
                <div className="absolute inset-0 rounded-full ring-2 ring-slate-200 dark:ring-slate-600">
                  <Image
                    src={customer.avatar_url}
                    alt={`${customer.first_name}'s profile`}
                    className="rounded-full object-cover"
                    fill
                    sizes="48px"
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : null}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-slate-200 dark:ring-slate-600 ${
                  customer.avatar_url && !imageError ? "hidden" : ""
                }`}
              >
                {getInitials(
                  customer.first_name || "U",
                  customer.last_name || ""
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {customer.first_name || "Unknown"}{" "}
                  {customer.last_name?.[0] || ""}.
                </h3>
                {customer.verification_status === "verified" && (
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={12} />
                  <span>{relativeTime || formatDate(job.created_at)}</span>
                </div>
                {job.is_flexible && (
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">
                    {t("flexible")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content: Job Details */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Title */}
          <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {job.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
            {job.description}
          </p>

          {/* Metrics Row */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <Clock size={13} className="text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {job.estimated_duration}h
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <Users size={13} className="text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {job.current_applications}/{job.max_applications}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <Calendar size={13} className="text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {formatDate(job.preferred_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Budget & CTA */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            {/* Budget */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(job.customer_budget, job.currency)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("budget")}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => setDrawerOpen(true)}
              className="group/btn inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md transform hover:scale-105 whitespace-nowrap flex-shrink-0"
            >
              {t("view")}
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
      {job.id && (
        <JobDetailDrawer
          jobId={String(job.id)}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </Card>
  );
}

export default JobOfferCard;
