"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getCustomerJobs, JobWithDetails } from "@/actions/jobs";
import { useJobsRealtime } from "@/hooks/useJobsRealtime";
import { useUserStore } from "@/stores/userStore";
import {
  Plus,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Star,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";
import ConfirmJobCompletionButton from "@/components/jobs/ConfirmJobCompletionButton";
import JobCloneButton from "@/components/jobs/JobCloneButton";
import { useToast } from "@/hooks/use-toast";

// Job card component
function JobCard({
  job,
  customerId,
}: {
  job: JobWithDetails;
  customerId: string;
}) {
  const t = useTranslations("myJobs");

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "under_review":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case "active":
        return <Eye className="h-4 w-4" />;
      case "under_review":
        return <Clock className="h-4 w-4" />;
      case "assigned":
        return <Users className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-base sm:text-lg truncate">
                {job.title}
              </h3>
              <Badge className={getStatusColor(job.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(job.status)}
                  {job.status?.replace("_", " ") || "Unknown"}
                </span>
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
              {(job.city || job.region || job.street_address) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.city && job.region
                    ? `${job.city}, ${job.region}`
                    : job.street_address || "Location not specified"}
                </span>
              )}
              {job.customer_budget && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {job.customer_budget} {job.currency || "MAD"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
          {job.description}
        </p>
        <div className="flex items-center justify-between">
          <Link
            href={`/customer/my-jobs/${job.id}`}
            className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
          >
            {t("jobCard.viewDetails")}
            <ArrowRight className="h-3 w-3" />
          </Link>
          <div className="flex gap-2">
            {job.status === "completed" && (
              <JobCloneButton job={job} />
            )}
            {job.status !== "completed" && (
              <Link
                href={`/customer/my-jobs/${job.id}/edit`}
                className="px-3 py-1.5 text-xs rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all"
              >
                {t("jobCard.editJob")}
              </Link>
            )}
            <JobDeleteButton jobId={job.id} customerId={customerId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsListClient({ customerId }: { customerId: string }) {
  const t = useTranslations("myJobs");
  const { user } = useUserStore();
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Use realtime hook for jobs updates
  useJobsRealtime({
    userId: user?.id || null,
    enabled: !!user?.id && user.id === customerId,
    onJobUpdate: (jobId, updates) => {
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
      );
    },
    onNewJob: (job) => {
      // Only add if it matches current filters (would need to check status, etc.)
      setJobs((prev) => {
        if (prev.some((j) => j.id === job.id)) {
          return prev;
        }
        return [job as JobWithDetails, ...prev];
      });
    },
  });

  const fetchJobs = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const result = await getCustomerJobs(
          customerId,
          ITEMS_PER_PAGE,
          page * ITEMS_PER_PAGE,
          !append
        );

        if (result.error) {
          console.error("Error fetching jobs:", result.error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: result.error,
          });
          setHasMore(false);
          return;
        }

        if (append) {
          setJobs((prev) => [...prev, ...result.jobs]);
        } else {
          setJobs(result.jobs);
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error loading jobs:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: t("errorLoading"),
        });
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [customerId, t]
  );

  useEffect(() => {
    fetchJobs(0);
  }, [fetchJobs]);

  const handleLoadMore = () => {
    fetchJobs(currentPage + 1, true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-16 bg-[var(--color-surface)] rounded-xl shadow-inner border border-dashed border-[var(--color-border)] mt-2">
        <span className="text-6xl mb-4">💼</span>
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
          {t("noJobs")}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4 max-w-xs text-center">
          {t("noJobsDescription")}
        </p>
        <Link
          href="/customer/post-job"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-secondary)] text-white font-semibold hover:bg-[var(--color-secondary-dark)] transition-all text-base shadow"
        >
          {t("createJob")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
          {t("yourJobPosts")} ({jobs.length})
        </h3>
        <Link
          href="/customer/post-job"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-semibold text-base shadow hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] mobile-button whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t("postNewJob")}</span>
          <span className="sm:hidden">{t("postJob")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} customerId={customerId} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("loading")}
              </span>
            ) : (
              t("loadMore") || "Load More"
            )}
          </Button>
        </div>
      )}
    </>
  );
}

