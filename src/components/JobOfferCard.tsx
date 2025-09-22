import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types/supabase";
import { Card } from "./ui/card";
import {
  Clock,
  Shield,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { useLocale } from "next-intl";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:-translate-y-2">
      <div className="relative flex flex-col h-full min-h-[500px]">
        {/* Enhanced Customer Profile Section with Gradient Background */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-[var(--color-accent)]/5 to-[var(--color-primary)]/5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] p-0.5">
                <div className="h-full w-full rounded-full bg-[var(--color-surface)] p-0.5">
                  <Image
                    src={customer.avatar_url || "/default-avatar.svg"}
                    alt={`${customer.first_name}'s profile`}
                    className="rounded-full object-cover"
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-base sm:text-lg truncate">
                  {customer.first_name || "Unknown"}{" "}
                  {customer.last_name?.[0] || ""}.
                </h3>
                {customer.verification_status === "verified" && (
                  <Shield className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(job.preferred_date)}
                  </span>
                </div>
                {job.is_flexible && (
                  <div className="px-2 py-1 bg-[var(--color-accent)]/10 rounded-full text-xs text-[var(--color-accent)] font-medium">
                    Flexible
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Job Details */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <h4 className="font-bold mb-4 text-[var(--color-text-primary)] text-lg sm:text-xl line-clamp-2 leading-tight">
            {job.title}
          </h4>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] line-clamp-4 leading-relaxed mb-6 flex-1">
            {job.description}
          </p>

          {/* Job Features */}
          <div className="flex flex-wrap gap-2 mt-auto">
            <div className="flex items-center gap-1 px-3 py-2 bg-[var(--color-primary)]/10 rounded-full text-xs text-[var(--color-text-secondary)]">
              <Clock size={12} />
              <span>{job.estimated_duration}h estimated</span>
            </div>
            {job.is_promoted && (
              <div className="px-3 py-2 bg-[var(--color-secondary)]/10 rounded-full text-xs text-[var(--color-secondary)] font-medium">
                Promoted
              </div>
            )}
            <div className="flex items-center gap-1 px-3 py-2 bg-[var(--color-accent)]/10 rounded-full text-xs text-[var(--color-text-secondary)] font-medium">
              <Users size={12} />
              <span>
                {job.current_applications}/{job.max_applications} applied
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Budget Section with Modern Styling */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-primary)]/5 border-t border-[var(--color-border)] mt-auto flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
            <div className="flex items-baseline gap-2">
              <DollarSign className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(job.customer_budget, job.currency)}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">
                budget
              </span>
            </div>
            <Link
              href={`/${locale}/job-offer/${job.id}`}
              className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white rounded-xl hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px]"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default JobOfferCard;
