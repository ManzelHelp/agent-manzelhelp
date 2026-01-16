"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  X,
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

interface JobDetailDrawerProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailDrawer({
  jobId,
  open,
  onOpenChange,
}: JobDetailDrawerProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("jobOffer");
  const { user } = useUserStore();
  const [jobData, setJobData] = useState<JobWithCustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  // Fetch job data when drawer opens
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId || !open) return;

      // Ensure jobId is a string
      const jobIdString = String(jobId);
      if (!jobIdString || jobIdString === "undefined" || jobIdString === "null") {
        setError("Invalid job ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await getJobWithCustomerDetails(jobIdString);

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
  }, [jobId, open, t]);

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
    onOpenChange(false);
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
        jobData.id,
        undefined,
        undefined,
        `Hi! I'm interested in your job: "${jobData.title}". I'd like to discuss the details with you.`
      );

      if (result.conversation) {
        toast.success(t("conversationStartedSuccess"));
        onOpenChange(false);
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
    if (!jobData) return false;
    if (!user) return false; // User not logged in
    if (user.role === "customer") return false;
    if (jobData.customer_id === user.id) return false;
    if (jobData.status !== "active" && jobData.status !== "under_review")
      return false;
    if (jobData.assigned_tasker_id) return false;
    return true;
  };

  const canContact = () => {
    if (!jobData) return false;
    if (!user) return false; // User not logged in
    if (user.role === "customer") return false;
    if (jobData.customer_id === user.id) return false;
    return true;
  };

  const isNotLoggedIn = () => {
    return !user;
  };

  const handleApplyRedirect = () => {
    onOpenChange(false);
    // Use window.location to ensure proper locale handling
    setTimeout(() => {
      window.location.href = `/${locale}/login`;
    }, 100);
  };

  const handleContactRedirect = () => {
    onOpenChange(false);
    // Use window.location to ensure proper locale handling
    setTimeout(() => {
      window.location.href = `/${locale}/login`;
    }, 100);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[96vh] flex flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto min-h-0 scrollbar-hide">
            {isLoading ? (
              <>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">{t("loading")}</DrawerTitle>
                </DrawerHeader>
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {t("loading")}
                    </p>
                  </div>
                </div>
              </>
            ) : error || !jobData ? (
              <>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">{t("error")}</DrawerTitle>
                </DrawerHeader>
                <div className="flex items-center justify-center py-20 px-4">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {t("error")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {error || t("jobNotFound")}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-6 pb-8">
                {/* Header */}
                <DrawerHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DrawerTitle className="text-2xl md:text-3xl font-bold">
                          {jobData.title}
                        </DrawerTitle>
                        <Badge
                          className={`px-3 py-1 text-sm font-semibold ${getStatusColor(
                            jobData.status || undefined
                          )}`}
                        >
                          {getStatusText(jobData.status || undefined)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t("postedOn")}{" "}
                          {format(new Date(jobData.created_at), "MMMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {jobData.application_count} {t("applications")}
                        </div>
                      </div>
                    </div>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                {/* Job Header Image */}
                <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 dark:bg-slate-500/20 rounded-full flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t("jobDescription")}
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                      {jobData.description || t("noDescription")}
                    </p>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Budget */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t("budget")}
                    </h4>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {jobData.customer_budget
                        ? `${jobData.currency || "MAD"} ${
                            jobData.customer_budget
                          }`
                        : t("notSpecified")}
                    </p>
                  </div>

                  {/* Preferred Date */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {t("preferredDate")}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {format(
                            new Date(jobData.preferred_date),
                            "MMMM d, yyyy"
                          )}
                        </p>
                        {jobData.preferred_time_start &&
                          jobData.preferred_time_end && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {jobData.preferred_time_start} -{" "}
                              {jobData.preferred_time_end}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  {jobData.estimated_duration && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {t("estimatedDuration")}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {jobData.estimated_duration} {t("hours")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {t("location")}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
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
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {t("category")}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {jobData.category_name_en || t("unknownCategory")}
                        </p>
                        {jobData.service_name_en && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {jobData.service_name_en}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {jobData.requirements && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {t("requirements")}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {jobData.requirements}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Profile */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {t("aboutCustomer")}
                  </h3>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative group">
                      <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                        {jobData.customer_avatar_url ? (
                          <Image
                            src={jobData.customer_avatar_url}
                            alt={`${jobData.customer_first_name || "Customer"} ${
                              jobData.customer_last_name || ""
                            }`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {`${jobData.customer_first_name || "Customer"} ${
                            jobData.customer_last_name || ""
                          }`.trim() || "Anonymous Customer"}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {t("jobPoster")}
                        </p>
                      </div>

                      {/* Customer Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {jobData.customer_created_at
                                  ? format(
                                      new Date(jobData.customer_created_at),
                                      "MMM yy"
                                    )
                                  : "N/A"}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {t("memberSince")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {jobData.application_count}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {t("applicationsReceived")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-600/50">
                    {user?.role === "customer" ? (
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {t("customersOnly")}
                            </h3>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {t("customersOnlyDescription")}
                          </p>
                          <Button
                            onClick={() => {
                              onOpenChange(false);
                              router.push("/become-a-helper");
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {t("becomeTasker")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Primary Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Apply Button */}
                          {isNotLoggedIn() ? (
                            <Button
                              onClick={handleApplyRedirect}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              {t("applyForJob")}
                            </Button>
                          ) : canApply() ? (
                            <Button
                              onClick={handleApplyForJob}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              {t("applyForJob")}
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="w-full h-14 text-lg font-semibold bg-gray-400 text-white rounded-xl"
                              size="lg"
                            >
                              <AlertCircle className="h-5 w-5 mr-2" />
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
                          {isNotLoggedIn() ? (
                            <Button
                              onClick={handleContactRedirect}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <MessageSquare className="h-5 w-5 mr-2" />
                              {t("contactCustomer")}
                            </Button>
                          ) : canContact() ? (
                            <Button
                              onClick={handleContactCustomer}
                              disabled={isContacting}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              {isContacting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              ) : (
                                <MessageSquare className="h-5 w-5 mr-2" />
                              )}
                              {isContacting
                                ? t("contacting")
                                : t("contactCustomer")}
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="w-full h-14 text-lg font-semibold bg-gray-400 text-white rounded-xl"
                              size="lg"
                            >
                              <AlertCircle className="h-5 w-5 mr-2" />
                              {t("cannotContact")}
                            </Button>
                          )}
                        </div>

                        {/* Status Messages */}
                        {!isNotLoggedIn() && !canApply() && (
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 border border-orange-200/50 dark:border-orange-700/50">
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
            )}
          </div>
        </DrawerContent>
      </Drawer>

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
    </>
  );
}

