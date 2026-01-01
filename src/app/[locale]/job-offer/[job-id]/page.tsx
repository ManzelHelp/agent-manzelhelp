"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  MessageSquare,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  User as UserIcon,
  Award,
  Loader2,
  CheckCircle,
  Briefcase,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "@/stores/userStore";
import {
  getJobWithCustomerDetails,
  type JobWithCustomerDetails,
} from "@/actions/jobs";
import { createConversationAction } from "@/actions/messages";
import { JobApplicationDialog } from "@/components/booking/JobApplicationDialog";
import { toast } from "sonner";

export default function JobOfferPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("jobOffer");
  const { user } = useUserStore();
  const [jobData, setJobData] = useState<JobWithCustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  const jobId = params["job-id"] as string;

  // Fetch job data
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError(null);
        const result = await getJobWithCustomerDetails(jobId);

        if (result) {
          setJobData(result);
        } else {
          setError(t("jobNotFound"));
        }
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError(t("failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, t]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return t("status.active");
      case "under_review":
        return t("status.underReview");
      case "assigned":
        return t("status.assigned");
      case "completed":
        return t("status.completed");
      case "cancelled":
        return t("status.cancelled");
      default:
        return t("status.unknown");
    }
  };

  const handleApplyForJob = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!jobData) return;
    setShowApplicationDialog(true);
  };

  const handleApplicationSuccess = () => {
    toast.success(t("applicationSubmittedSuccess"));
    // Optionally redirect to applications page
    // router.push("/tasker/my-jobs");
  };

  const handleContactCustomer = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!jobData) return;

    try {
      setIsContacting(true);
      const result = await createConversationAction(
        jobData.customer_id,
        jobData.id, // jobId
        undefined, // serviceId
        undefined, // bookingId
        `Hi! I'm interested in your job: "${jobData.title}". I'd like to discuss the details with you.` // initialMessage
      );

      if (result.conversation) {
        toast.success(t("conversationStartedSuccess"));
        router.push(`/tasker/messages/${result.conversation.id}`);
      } else {
        toast.error(result.errorMessage || t("failedToStartConversation"));
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error(t("failedToStartConversation"));
    } finally {
      setIsContacting(false);
    }
  };

  const canApply = () => {
    if (!user || !jobData) return false;
    if (user.role === "customer") return false;
    if (jobData.customer_id === user.id) return false;
    if (jobData.status !== "active" && jobData.status !== "under_review")
      return false;
    if (jobData.assigned_tasker_id) return false;
    return true;
  };

  const canContact = () => {
    if (!user || !jobData) return false;
    if (user.role === "customer") return false;
    if (jobData.customer_id === user.id) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 text-center p-12">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {t("error")}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  {error || t("jobNotFound")}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("tryAgain")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/search/jobs")}
                  className="w-full h-12 text-lg font-semibold rounded-2xl"
                >
                  {t("browseJobs")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            <div className="flex-1" />
            <Badge
              className={`px-4 py-2 text-sm font-semibold ${getStatusColor(
                jobData.status || undefined
              )}`}
            >
              {getStatusText(jobData.status || undefined)}
            </Badge>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            {/* Job Header */}
            <div className="relative h-80 md:h-96 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <div className="text-center max-w-4xl px-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/20 dark:bg-slate-500/20 rounded-full flex items-center justify-center">
                  <Briefcase className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4 leading-tight">
                  {jobData.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      {t("postedOn")}{" "}
                      {format(new Date(jobData.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-lg">
                      {jobData.application_count} {t("applications")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="p-8 md:p-12">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  {t("jobDescription")}
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {jobData.description || t("noDescription")}
                  </p>
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Budget */}
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-green-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t("budget")}
                      </h4>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {jobData.customer_budget
                          ? `${jobData.currency || "MAD"} ${
                              jobData.customer_budget
                            }`
                          : t("notSpecified")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preferred Date */}
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t("preferredDate")}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {format(
                          new Date(jobData.preferred_date),
                          "MMMM d, yyyy"
                        )}
                      </p>
                      {jobData.preferred_time_start &&
                        jobData.preferred_time_end && (
                          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                            {jobData.preferred_time_start} -{" "}
                            {jobData.preferred_time_end}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                {jobData.estimated_duration && (
                  <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-purple-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {t("estimatedDuration")}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {jobData.estimated_duration} {t("hours")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-orange-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t("location")}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {jobData.street_address &&
                        jobData.city &&
                        jobData.region
                          ? `${jobData.street_address}, ${jobData.city}, ${jobData.region}`
                          : t("locationNotSpecified")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-teal-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t("category")}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {jobData.category_name_en || t("unknownCategory")}
                      </p>
                      {jobData.service_name_en && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                          {jobData.service_name_en}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {jobData.requirements && (
                  <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-indigo-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {t("requirements")}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {jobData.requirements}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {t("aboutCustomer")}
              </h2>
            </div>

            <div className="p-8">
              {/* Customer Header */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                    {jobData.customer_avatar_url ? (
                      <Image
                        src={jobData.customer_avatar_url}
                        alt={`${jobData.customer_first_name || "Customer"} ${
                          jobData.customer_last_name || ""
                        }`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`avatar-fallback absolute inset-0 flex items-center justify-center text-white font-bold text-3xl ${jobData.customer_avatar_url ? "hidden" : ""}`}>
                      {jobData.customer_first_name?.[0]?.toUpperCase() || "U"}
                      {jobData.customer_last_name?.[0]?.toUpperCase() || ""}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {`${jobData.customer_first_name || "Customer"} ${
                        jobData.customer_last_name || ""
                      }`.trim() || "Anonymous Customer"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {t("jobPoster")}
                    </p>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {jobData.customer_created_at
                              ? format(
                                  new Date(jobData.customer_created_at),
                                  "MMM yy"
                                )
                              : "N/A"}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("memberSince")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {jobData.application_count}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("applicationsReceived")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
                {user?.role === "customer" ? (
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {t("customersOnly")}
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                        {t("customersOnlyDescription")}
                      </p>
                      <Button
                        onClick={() => router.push("/become-a-helper")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {t("becomeTasker")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Apply Button */}
                      {canApply() ? (
                        <Button
                          onClick={handleApplyForJob}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          <CheckCircle className="h-6 w-6 mr-3" />
                          {t("applyForJob")}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-16 text-xl font-semibold bg-gray-400 text-white rounded-2xl"
                          size="lg"
                        >
                          <AlertCircle className="h-6 w-6 mr-3" />
                          {jobData.status === "assigned"
                            ? t("jobAssigned")
                            : jobData.status === "completed"
                            ? t("jobCompleted")
                            : jobData.status === "cancelled"
                            ? t("jobCancelled")
                            : t("cannotApply")}
                        </Button>
                      )}

                      {/* Contact Button */}
                      {canContact() ? (
                        <Button
                          onClick={handleContactCustomer}
                          disabled={isContacting}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          {isContacting ? (
                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          ) : (
                            <MessageSquare className="h-6 w-6 mr-3" />
                          )}
                          {isContacting
                            ? t("contacting")
                            : t("contactCustomer")}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-16 text-xl font-semibold bg-gray-400 text-white rounded-2xl"
                          size="lg"
                        >
                          <AlertCircle className="h-6 w-6 mr-3" />
                          {t("cannotContact")}
                        </Button>
                      )}
                    </div>

                    {/* Status Messages */}
                    {!canApply() && (
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                          <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                            {jobData.status === "assigned"
                              ? t("jobAlreadyAssigned")
                              : jobData.status === "completed"
                              ? t("jobAlreadyCompleted")
                              : jobData.status === "cancelled"
                              ? t("jobCancelled")
                              : t("jobNotAvailable")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Application Dialog */}
      {jobData && user && (
        <JobApplicationDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          onSuccess={handleApplicationSuccess}
          jobData={{
            id: jobData.id,
            title: jobData.title,
            customer_budget: jobData.customer_budget,
            currency: jobData.currency,
            customer: {
              first_name: jobData.customer_first_name,
              last_name: jobData.customer_last_name,
              avatar_url: jobData.customer_avatar_url,
            },
          }}
        />
      )}
    </div>
  );
}
