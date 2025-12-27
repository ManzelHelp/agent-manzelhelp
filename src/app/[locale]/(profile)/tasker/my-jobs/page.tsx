import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserProfileAction } from "@/actions/auth";
import { getTaskerJobs, JobWithDetails } from "@/actions/jobs";
import {
  Plus,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Euro,
  Star,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";

// Loading component for better UX
function JobsLoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl px-4 pb-8">
      <div className="grid grid-cols-1 gap-4 mt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm animate-pulse"
          >
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Job card component
async function JobCard({
  job,
  taskerId,
}: {
  job: JobWithDetails;
  taskerId: string;
}) {
  const t = await getTranslations("myJobs");
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
        return <CheckCircle className="h-4 w-4" />;
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

  const getStatusLabel = (status?: string | null) => {
    switch (status) {
      case "active":
        return t("status.open");
      case "under_review":
        return t("status.under_review");
      case "assigned":
        return t("status.assigned");
      case "in_progress":
        return t("status.in_progress");
      case "completed":
        return t("status.completed");
      case "cancelled":
        return t("status.cancelled");
      default:
        return t("status.unknown");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    try {
      return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
    } catch {
      return timeString;
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Job Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-base sm:text-lg truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-1">
                {job.status === "active" ? (
                  <Eye className="h-4 w-4 text-[var(--color-success)]" />
                ) : (
                  <EyeOff className="h-4 w-4 text-[var(--color-text-secondary)]" />
                )}
              </div>
            </div>

            {/* Service Category */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 bg-[var(--color-secondary)] rounded-md flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {job.category_name_en || t("jobCard.unknownCategory")}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {job.city && job.region
                  ? `${job.city}, ${job.region}`
                  : job.street_address || t("jobCard.locationNotSpecified")}
              </span>
            </div>
          </div>

          {/* Budget Display */}
          <div className="flex flex-col items-end gap-1">
            {job.customer_budget && (
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4 text-[var(--color-secondary)]" />
                <span className="font-bold text-[var(--color-secondary)] text-lg">
                  €{job.customer_budget}
                </span>
              </div>
            )}
            {job.estimated_duration && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <Clock className="h-3 w-3" />
                <span>{job.estimated_duration}h</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Content */}
      <div className="p-4">
        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 leading-relaxed">
          {job.description || t("jobCard.noDescription")}
        </p>

        {/* Job Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <Calendar className="h-3 w-3" />
            <span>
              {job.preferred_date
                ? formatDate(job.preferred_date)
                : t("jobCard.noDateSet")}
            </span>
            {job.preferred_time_start && (
              <>
                <span>•</span>
                <span>{formatTime(job.preferred_time_start)}</span>
              </>
            )}
            <span>•</span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>
                {job.application_count || 0}{" "}
                {(job.application_count || 0) === 1
                  ? t("jobCard.application")
                  : t("jobCard.applications")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              {getStatusIcon(job.status)}
              <span className="ml-1">{getStatusLabel(job.status)}</span>
            </Badge>
            {job.is_promoted && (
              <Badge className="bg-[var(--color-secondary)] text-white">
                {t("jobCard.promoted")}
              </Badge>
            )}
          </div>
        </div>

        {/* Assigned Tasker Info */}
        {job.assigned_tasker_id && (
          <div className="mb-4 p-3 bg-[var(--color-accent)]/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {t("jobCard.assignedTo")} {job.assigned_tasker_first_name}{" "}
                  {job.assigned_tasker_last_name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t("jobCard.taskerAssigned")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {job.status === "active" && job.application_count > 0 && (
              <Button
                asChild
                size="sm"
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
              >
                <Link href={`./my-jobs/${job.id}`}>
                  {t("jobCard.viewApplications")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
            {job.status === "assigned" && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-[var(--color-border)]"
              >
                <Link href={`./my-jobs/${job.id}`}>
                  {t("jobCard.viewDetails")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[var(--color-border)]"
            >
              <Link href={`./my-jobs/${job.id}/applications`}>
                <Users className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[var(--color-border)]"
            >
              <Link href={`./my-jobs/${job.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {/* Taskers cannot delete jobs assigned to them */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Jobs list component
async function JobsList({ taskerId }: { taskerId: string }) {
  const t = await getTranslations("myJobs");

  try {
    const { jobs } = await getTaskerJobs(taskerId);

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
            {t("yourJobPosts")} ({jobs.length})
          </h3>
          <Link
            href="./post-job"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-semibold text-base shadow hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] mobile-button whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t("postNewJob")}</span>
            <span className="sm:hidden">{t("postJob")}</span>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 bg-[var(--color-surface)] rounded-xl shadow-inner border border-dashed border-[var(--color-border)] mt-2">
            <span className="text-6xl mb-4">💼</span>
            <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
              {t("noJobs")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4 max-w-xs text-center">
              {t("noAssignedJobsDescription") || "You don't have any assigned jobs yet. Keep checking for new opportunities!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {await Promise.all(
              jobs.map(async (job) => (
                <JobCard key={job.id} job={job} taskerId={taskerId} />
              ))
            )}
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error("Error loading jobs:", error);
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-16 bg-[var(--color-surface)] rounded-xl shadow-inner border border-dashed border-[var(--color-border)] mt-2">
        <span className="text-6xl mb-4">⚠️</span>
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
          {t("errorLoading")}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4 max-w-xs text-center">
          {t("errorDescription")}
        </p>
        <Link
          href="/customer/my-jobs"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-secondary)] text-white font-semibold hover:bg-[var(--color-secondary-dark)] transition-all text-base shadow"
        >
          {t("refreshPage")}
        </Link>
      </div>
    );
  }
}

export default async function MyJobsPage() {
  const t = await getTranslations("myJobs");

  // Get current user (customer)
  const { user } = await getUserProfileAction();
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
          {t("notSignedIn")}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4">
          {t("pleaseLogin")}
        </p>
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-[var(--color-secondary)] text-white font-medium hover:bg-[var(--color-secondary-dark)] transition-all"
        >
          {t("goToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-[100dvh] bg-[var(--color-bg)] flex flex-col items-center px-0 sm:px-4 py-0">
      {/* Header Section */}
      <section className="w-full max-w-2xl px-4 pt-6 pb-2">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-md p-4 sm:p-6 border border-[var(--color-border)] mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {t("pageTitle")}
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4 text-sm sm:text-base">
            {t("pageDescription")}
          </p>
          <div>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-1 text-base">
              {t("quickSteps")}
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)] text-sm sm:text-base">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
              <li>{t("step4")}</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Jobs Section with Suspense for better loading */}
      <section className="w-full max-w-2xl px-4 pb-8 flex-1 flex flex-col">
        <Suspense fallback={<JobsLoadingSkeleton />}>
          <JobsList taskerId={user.id} />
        </Suspense>
      </section>
    </main>
  );
}
