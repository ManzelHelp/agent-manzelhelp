"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
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
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  ArrowLeft,
  Users,
  User,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { serviceCategories } from "@/lib/categories";
import {
  getJobById,
  getJobApplications,
  assignTaskerToJob,
  JobApplicationWithDetails,
} from "@/actions/jobs";
import { getUserProfileAction } from "@/actions/auth";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";

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
        // Get current user
        const { user } = await getUserProfileAction();
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Fetch job details
        const jobData = await getJobById(params["job-id"], user.id);
        if (!jobData) {
          setError("Job not found");
          setLoading(false);
          return;
        }

        setData(jobData);

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

        // Fetch applications if job is open
        if (jobData.status === "open") {
          try {
            const jobApplications = await getJobApplications(
              params["job-id"],
              user.id
            );
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
      const supabase = createClient();
      const { error } = await supabase
        .from("jobs")
        .update({
          title: editForm.title,
          description: editForm.description,
          customer_budget: editForm.customer_budget,
          estimated_duration: editForm.estimated_duration,
          preferred_date: editForm.preferred_date,
          preferred_time_start: editForm.preferred_time_start || null,
          preferred_time_end: editForm.preferred_time_end || null,
          is_flexible: editForm.is_flexible,
          requirements: editForm.requirements,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) {
        throw new Error(`Failed to update job: ${error.message}`);
      }

      // Refresh data
      const { user } = await getUserProfileAction();
      if (user) {
        const updatedData = await getJobById(data.id, user.id);
        if (updatedData) {
          setData(updatedData);
        }
      }

      setIsEditing(false);
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
      const { user } = await getUserProfileAction();
      if (!user) {
        setError("Not authenticated");
        return;
      }

      const result = await assignTaskerToJob(data.id, user.id, taskerId);

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
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
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
      case "open":
        return <Eye className="h-4 w-4" />;
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
      case "open":
        return "Open";
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
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
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
  const category = serviceCategories.find(
    (cat) => cat.id.toString() === data.service_id.toString()
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Status Card */}
            <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {data.status === "open" ? (
                        <Eye className="h-5 w-5 text-[var(--color-success)]" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-[var(--color-text-secondary)]" />
                      )}
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {data.status === "open"
                          ? "Open for Applications"
                          : "Closed"}
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
            <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
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

              <CardContent className="p-6">
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
                          Budget (€)
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
                            <Euro className="h-5 w-5 text-[var(--color-secondary)]" />
                            <span className="text-2xl font-bold text-[var(--color-secondary)]">
                              €{data.customer_budget}
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Applications Card */}
            {data.status === "open" && applications.length > 0 && (
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-[var(--color-secondary)]" />
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      Applications ({applications.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((application) => (
                      <div
                        key={application.id}
                        className="p-3 border border-[var(--color-border)] rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {application.tasker_first_name}{" "}
                              {application.tasker_last_name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {formatDate(application.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-[var(--color-secondary)]" />
                            <span className="text-sm font-medium text-[var(--color-secondary)]">
                              €{application.proposed_price}
                            </span>
                          </div>
                          {application.estimated_duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[var(--color-text-secondary)]" />
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {application.estimated_duration}h
                              </span>
                            </div>
                          )}
                        </div>
                        {application.message && (
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                            {application.message}
                          </p>
                        )}
                        <Button
                          onClick={() =>
                            handleAssignTasker(application.tasker_id)
                          }
                          disabled={isAssigning === application.tasker_id}
                          size="sm"
                          className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                        >
                          {isAssigning === application.tasker_id ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Assign Tasker
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[var(--color-border)]"
                      >
                        View All Applications
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assigned Tasker Card */}
            {data.assigned_tasker_id && (
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-[var(--color-secondary)]" />
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      Assigned Tasker
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {data.assigned_tasker_first_name}{" "}
                        {data.assigned_tasker_last_name}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Assigned to this job
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {!data.assigned_tasker_id && data.status === "open" && (
                    <JobDeleteButton
                      jobId={data.id}
                      customerId={data.customer_id}
                      jobTitle={data.title}
                    />
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-[var(--color-border)]"
                    onClick={() => router.push("/customer/my-jobs")}
                  >
                    Back to My Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
