"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  ArrowLeft,
  Users,
  User,
  UserCheck,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllCategoryHierarchies } from "@/lib/categories";
import {
  getJobById,
  getJobApplications,
  assignTaskerToJob,
  updateJob,
  confirmJobCompletion,
  createJob,
  JobApplicationWithDetails,
} from "@/actions/jobs";
import { checkReviewExists } from "@/actions/reviews";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";
import ReviewForm from "@/components/reviews/ReviewForm";

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
  customer_confirmed_at: string | null;
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
  // Assigned tasker details
  assigned_tasker_first_name?: string | null;
  assigned_tasker_last_name?: string | null;
  assigned_tasker_avatar?: string | null;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<JobDetailsData | null>(null);
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [reviewExists, setReviewExists] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    customer_budget: 0,
    estimated_duration: 0,
    preferred_date: "",
    preferred_time_start: "",
    preferred_time_end: "",
    is_flexible: false,
    requirements: "",
  });

  useEffect(() => {
    const fetchJobData = async () => {
      if (!params["job-id"] || typeof params["job-id"] !== "string") {
        setError("Invalid job ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch job details
        const jobData = await getJobById(params["job-id"]);
        if (!jobData) {
          setError("Job not found");
          setLoading(false);
          return;
        }

        setData(jobData);

        // Check if review already exists
        if (jobData.customer_confirmed_at) {
          const reviewCheck = await checkReviewExists(jobData.id, undefined);
          setReviewExists(reviewCheck.exists);
        }

        // Initialize edit form
        setEditForm({
          title: jobData.title || "",
          description: jobData.description || "",
          customer_budget: jobData.customer_budget || 0,
          estimated_duration: jobData.estimated_duration || 0,
          preferred_date: jobData.preferred_date || "",
          preferred_time_start: jobData.preferred_time_start || "",
          preferred_time_end: jobData.preferred_time_end || "",
          is_flexible: jobData.is_flexible || false,
          requirements: jobData.requirements || "",
        });

        // Fetch applications if job is active
        if (jobData.status === "active") {
          try {
            const jobApplications = await getJobApplications(params["job-id"]);
            setApplications(jobApplications);
          } catch (appError) {
            console.error("Error fetching applications:", appError);
            // Don't fail the whole page if applications fail to load
          }
        }
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

  const handleSave = async () => {
    if (!data) return;

    try {
      const result = await updateJob(data.id, {
        title: editForm.title,
        description: editForm.description,
        customer_budget: editForm.customer_budget,
        estimated_duration: editForm.estimated_duration,
        preferred_date: editForm.preferred_date,
        preferred_time_start: editForm.preferred_time_start || null,
        preferred_time_end: editForm.preferred_time_end || null,
        is_flexible: editForm.is_flexible,
        requirements: editForm.requirements,
      });

      if (result.success) {
        // Refresh data
        const updatedData = await getJobById(data.id);
        if (updatedData) {
          setData(updatedData);
        }
        setIsEditing(false);
      } else {
        setError(result.error || "Failed to update job");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update job. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (data) {
      setEditForm({
        title: data.title || "",
        description: data.description || "",
        customer_budget: data.customer_budget || 0,
        estimated_duration: data.estimated_duration || 0,
        preferred_date: data.preferred_date || "",
        preferred_time_start: data.preferred_time_start || "",
        preferred_time_end: data.preferred_time_end || "",
        is_flexible: data.is_flexible || false,
        requirements: data.requirements || "",
      });
    }
    setIsEditing(false);
  };

  const handleAssignTasker = async (taskerId: string) => {
    if (!data) return;

    setIsAssigning(taskerId);
    try {
      const result = await assignTaskerToJob(data.id, taskerId);

      if (result.success) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        setError(result.error || "Failed to assign tasker");
      }
    } catch (err) {
      console.error("Error assigning tasker:", err);
      setError("Failed to assign tasker. Please try again.");
    } finally {
      setIsAssigning(null);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 h-10 w-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Job Details
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Manage your job post
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                {data.status !== "completed" && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {data.status === "completed" && (
                  <Button
                    onClick={async () => {
                      try {
                        // Clone job by creating a new job with the same data
                        const result = await createJob({
                          title: `${data.title} (Copy)`,
                          description: data.description || "",
                          service_id: data.service_id,
                          preferred_date: new Date().toISOString().split('T')[0], // Today's date
                          preferred_time_start: data.preferred_time_start || undefined,
                          preferred_time_end: data.preferred_time_end || undefined,
                          is_flexible: data.is_flexible || false,
                          estimated_duration: data.estimated_duration || undefined,
                          customer_budget: data.customer_budget || 0,
                          currency: data.currency || "MAD",
                          address_id: data.address_id,
                          max_applications: data.max_applications || undefined,
                          requirements: data.requirements || undefined,
                          images: data.images || undefined,
                        });
                        
                        if (result.success && result.jobId) {
                          toast.success("Job cloned successfully!");
                          router.push(`/customer/my-jobs/${result.jobId}`);
                        } else {
                          toast.error(result.error || "Failed to clone job");
                        }
                      } catch (error) {
                        console.error("Error cloning job:", error);
                        toast.error("Failed to clone job");
                      }
                    }}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="border-[var(--color-border)]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
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
                        Job Status
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
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Budget (MAD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.customer_budget}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              customer_budget: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Estimated Duration (hours)
                        </label>
                        <input
                          type="number"
                          value={editForm.estimated_duration}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              estimated_duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={editForm.preferred_date}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              preferred_date: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Preferred Time
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={editForm.preferred_time_start}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                preferred_time_start: e.target.value,
                              })
                            }
                            className="flex-1 p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                          />
                          <input
                            type="time"
                            value={editForm.preferred_time_end}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                preferred_time_end: e.target.value,
                              })
                            }
                            className="flex-1 p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Requirements
                      </label>
                      <textarea
                        value={editForm.requirements}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            requirements: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_flexible"
                        checked={editForm.is_flexible}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            is_flexible: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] border-[var(--color-border)] rounded"
                      />
                      <label
                        htmlFor="is_flexible"
                        className="text-sm text-[var(--color-text-primary)]"
                      >
                        Flexible with timing
                      </label>
                    </div>
                  </div>
                ) : (
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
                            Posted on {formatDate(data.created_at)}
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
                        Description
                      </h3>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {data.description || "No description available"}
                      </p>
                    </div>

                    {/* Requirements */}
                    {data.requirements && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                          Requirements
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
                              Preferred Date
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
                              Preferred Time
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
                              Flexible Timing
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Open to schedule adjustments
                            </p>
                          </div>
                        </div>
                      )}

                      {(data.city || data.region) && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                          <MapPin className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              Location
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {data.city && data.region
                                ? `${data.city}, ${data.region}`
                                : data.street_address ||
                                  "Location not specified"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Applications Section */}
          {/* Only show applications if job is active AND no tasker is assigned yet */}
          {data.status === "active" && !data.assigned_tasker_id && applications.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Applications ({applications.length})
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applications
                    .filter((app) => app.status === "pending") // Only show pending applications
                    .map((application) => (
                      <div
                        key={application.id}
                        className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {application.tasker_first_name}{" "}
                              {application.tasker_last_name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(application.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              MAD {application.proposed_price}
                            </span>
                          </div>
                          {application.estimated_duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {application.estimated_duration}h
                              </span>
                            </div>
                          )}
                        </div>
                        {application.message && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                            {application.message}
                          </p>
                        )}
                        <Button
                          onClick={() =>
                            handleAssignTasker(application.tasker_id)
                          }
                          disabled={isAssigning === application.tasker_id || !!data.assigned_tasker_id}
                          className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigning === application.tasker_id ? (
                            <>
                              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-5 w-5 mr-2" />
                              Assign Tasker
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Assigned Tasker Section */}
          {data.assigned_tasker_id && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Assigned Tasker
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <User className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {data.assigned_tasker_first_name}{" "}
                      {data.assigned_tasker_last_name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Assigned to this job
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Completion Confirmation Section */}
          {data.status === "completed" && 
           data.completed_at && 
           !data.customer_confirmed_at && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-8 py-6 border-b border-blue-200 dark:border-blue-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Job Completed - Awaiting Your Confirmation
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  The tasker has marked this job as completed. Please review the work and confirm completion.
                </p>
                {data.completed_at && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Completed on: {format(new Date(data.completed_at), "PPP 'at' p")}
                  </p>
                )}
                <Button
                  onClick={async () => {
                    if (!data.id) return;
                    setIsConfirming(true);
                    try {
                      const result = await confirmJobCompletion(data.id);
                      if (result.success) {
                        // Refresh the page to show updated status
                        window.location.reload();
                      } else {
                        setError(result.error || "Failed to confirm job completion");
                      }
                    } catch (err) {
                      console.error("Error confirming job:", err);
                      setError("Failed to confirm job completion");
                    } finally {
                      setIsConfirming(false);
                    }
                  }}
                  disabled={isConfirming}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Job Completion
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Job Confirmed Section */}
          {data.status === "completed" && 
           data.completed_at && 
           data.customer_confirmed_at && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-700 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-8 py-6 border-b border-emerald-200 dark:border-emerald-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Job Confirmed
                </h2>
              </div>
              <div className="p-8">
                <p className="text-slate-700 dark:text-slate-300 text-lg mb-4">
                  You have confirmed that this job has been completed successfully.
                </p>
                {data.customer_confirmed_at && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Confirmed on: {format(new Date(data.customer_confirmed_at), "PPP 'at' p")}
                  </p>
                )}
                {!reviewExists && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Leave a Review
                  </Button>
                )}
                {reviewExists && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ You have already left a review for this job
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review Form Section */}
          {showReviewForm && data.customer_confirmed_at && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  Leave a Review
                </h2>
              </div>
              <div className="p-8">
                <ReviewForm
                  jobId={data.id}
                  onSuccess={() => {
                    setReviewExists(true);
                    setShowReviewForm(false);
                    // Refresh the page to show updated status
                    window.location.reload();
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!data.assigned_tasker_id && data.status === "active" && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-8">
                <JobDeleteButton
                  jobId={data.id}
                  customerId={data.customer_id}
                  jobTitle={data.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
