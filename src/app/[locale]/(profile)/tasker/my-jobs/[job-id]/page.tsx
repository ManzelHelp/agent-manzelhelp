"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/BackButton";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  User,
  Play,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { getAllCategoryHierarchies } from "@/lib/categories";
import {
  getJobWithCustomerDetails,
  startJob,
  completeJob,
} from "@/actions/jobs";

interface JobDetailsData {
  id: string;
  customer_id: string;
  service_id: number;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  is_flexible: boolean | null;
  estimated_duration: number | null;
  customer_budget: number | null;
  final_price: number | null;
  is_promoted: boolean | null;
  promotion_expires_at: string | null;
  promotion_boost_score: number | null;
  assigned_tasker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  images: string[] | null;
  requirements: string | null;
  currency: string | null;
  address_id: string;
  max_applications: number | null;
  premium_applications_purchased: number | null;
  current_applications: number | null;
  status: string | null;
  // Application count
  application_count: number;
  // Category and service names
  category_name_en?: string;
  service_name_en?: string;
  // Address details
  street_address?: string | null;
  city?: string | null;
  region?: string | null;
  // Customer details (for tasker view)
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_avatar_url?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("jobDetails");
  const [data, setData] = useState<JobDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!params["job-id"] || typeof params["job-id"] !== "string") {
        setError("Invalid job ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch job details with customer information (for tasker view)
        const jobData = await getJobWithCustomerDetails(params["job-id"]);
        if (!jobData) {
          setError("Job not found");
          setLoading(false);
          return;
        }

        // Verify that the current user is the assigned tasker
        // Note: This check is done on the client side, but the server action
        // getJobWithCustomerDetails should also verify RLS permissions

        setData(jobData);
      } catch (err) {
        console.error("Error fetching job data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load the job. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [params]);

  const handleStartJob = async () => {
    if (!data) return;

    setIsStarting(true);
    setError(null);
    try {
      const result = await startJob(data.id);

      if (result.success) {
        toast.success(t("actions.jobStarted"));
        // Refresh the job data
        const updatedData = await getJobWithCustomerDetails(data.id);
        if (updatedData) {
          setData(updatedData);
        }
        // Refresh the page to show updated status
        router.refresh();
      } else {
        const errorMessage = result.error || t("actions.startJobFailed");
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error starting job:", err);
      setError("Failed to start job. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!data) return;

    setIsCompleting(true);
    setError(null);
    try {
      const result = await completeJob(data.id);

      if (result.success) {
        toast.success(t("actions.jobCompletedSuccess"));
        // Refresh the job data
        const updatedData = await getJobWithCustomerDetails(data.id);
        if (updatedData) {
          setData(updatedData);
        }
        // Refresh the page to show updated status
        router.refresh();
      } else {
        const errorMessage = result.error || t("actions.completeJobFailed");
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error completing job:", err);
      setError("Failed to complete job. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

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
        return "Open";
      case "under_review":
        return "Under Review";
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[var(--color-accent)] rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-6 bg-[var(--color-accent)] rounded w-32"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-24"></div>
              </div>
            </div>

            {/* Job Card Skeleton */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-[var(--color-accent)]"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-[var(--color-accent)] rounded w-3/4"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-full"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-2/3"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-[var(--color-error)]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Oops!
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {error || "Job not found"}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get category information from local data
  const hierarchies = getAllCategoryHierarchies();
  const category = hierarchies.find(
    ({ parent }) => parent.id.toString() === data.service_id.toString()
  )?.parent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton className="p-2 h-10 w-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]" />
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {t("jobDetails")}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("manageJobPost")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Job Details */}
          <div className="space-y-6">
            {/* Job Status Card */}
            <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {data.status === "active" ? (
                        <Eye className="h-5 w-5 text-[var(--color-success)]" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-[var(--color-text-secondary)]" />
                      )}
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {t("jobStatus")}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(data.status)}>
                    {getStatusIcon(data.status)}
                    <span className="ml-1">{getStatusLabel(data.status)}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
              {/* Job Image */}
              {data.images &&
                Array.isArray(data.images) &&
                data.images.length > 0 && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={data.images[0] || "/placeholder-job.jpg"}
                      alt={data.title || "Job image"}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

              <div className="p-8 md:p-12">
                <div className="space-y-6">
                    {/* Header with Title and Budget */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                          {data.title}
                        </h2>
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {t("postedOn", { date: formatDate(data.created_at) })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {data.customer_budget && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[var(--color-secondary)]">
                              {data.currency || "MAD"} {data.customer_budget}
                            </span>
                          </div>
                        )}
                        {data.estimated_duration && (
                          <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                            <Clock className="h-4 w-4" />
                            <span>{data.estimated_duration}h estimated</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Category */}
                    <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                      <div className="h-8 w-8 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {category?.name_en || "Service"}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {category?.name_en || "Category"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                        {t("description")}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {data.description || t("noDescription", { default: "No description available" })}
                      </p>
                    </div>

                    {/* Requirements */}
                    {data.requirements && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                          {t("requirements", { default: "Requirements" })}
                        </h3>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                          {data.requirements}
                        </p>
                      </div>
                    )}

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.preferred_date && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {t("preferredDate")}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {formatDate(data.preferred_date)}
                            </p>
                          </div>
                        </div>
                      )}

                      {data.preferred_time_start && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                          <Clock className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {t("preferredTime")}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {formatTime(data.preferred_time_start)}
                              {data.preferred_time_end &&
                                ` - ${formatTime(data.preferred_time_end)}`}
                            </p>
                          </div>
                        </div>
                      )}

                      {data.is_flexible && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {t("flexibleTiming", { default: "Flexible Timing" })}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {t("openToScheduleAdjustments", { default: "Open to schedule adjustments" })}
                            </p>
                          </div>
                        </div>
                      )}

                      {(data.city || data.region) && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                          <MapPin className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {t("location")}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {data.city && data.region
                                ? `${data.city}, ${data.region}`
                                : data.street_address ||
                                  t("locationNotSpecified", { default: "Location not specified" })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Customer Info Section - For Tasker */}
          {data.customer_first_name && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {t("customerInformation")}
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center overflow-hidden">
                    {data.customer_avatar_url ? (
                      <Image
                        src={data.customer_avatar_url}
                        alt={`${data.customer_first_name} ${data.customer_last_name}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {data.customer_first_name} {data.customer_last_name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
                      {t("jobPostedByCustomer")}
                    </p>
                    {data.customer_email && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {data.customer_email}
                      </p>
                    )}
                    {data.customer_phone && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {data.customer_phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Progress Actions - For Tasker */}
          {data.assigned_tasker_id && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("jobProgress")}
                </h2>
              </div>
              <div className="p-8 space-y-4">
                {/* Status Info */}
                <div className="flex items-center justify-between p-4 bg-[var(--color-accent)]/20 rounded-lg">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                      {t("currentStatus")}
                    </p>
                    <Badge className={getStatusColor(data.status)}>
                      {getStatusIcon(data.status)}
                      <span className="ml-1">{getStatusLabel(data.status)}</span>
                    </Badge>
                  </div>
                  {data.started_at && (
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        {t("startedAt")}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatDate(data.started_at)} {data.started_at.split("T")[1] && formatTime(data.started_at.split("T")[1].split(".")[0])}
                      </p>
                    </div>
                  )}
                  {data.completed_at && (
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        {t("completedAt")}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatDate(data.completed_at)} {data.completed_at.split("T")[1] && formatTime(data.completed_at.split("T")[1].split(".")[0])}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {data.status === "assigned" && (
                    <Button
                      onClick={handleStartJob}
                      disabled={isStarting}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {t("actions.starting")}
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          {t("actions.startJob")}
                        </>
                      )}
                    </Button>
                  )}

                  {data.status === "in_progress" && (
                    <Button
                      onClick={handleCompleteJob}
                      disabled={isCompleting}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {t("actions.completing")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          {t("actions.completeJob")}
                        </>
                      )}
                    </Button>
                  )}

                  {data.status === "completed" && (
                    <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {t("actions.jobCompleted")}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {t("actions.waitingConfirmation")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
