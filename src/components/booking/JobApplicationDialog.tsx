"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jobApplicationSchema } from "@/lib/schemas/jobs";
import { useTranslations } from "next-intl";
import {
  createJobApplication,
  type CreateJobApplicationData,
} from "@/actions/jobs";

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
  jobData: {
    id: string;
    title: string;
    customer_budget: number | null;
    currency: string | null;
    customer: {
      first_name: string | null;
      last_name: string | null;
      avatar_url?: string | null;
    };
  };
}

interface ApplicationFormData {
  proposed_price: number;
  estimated_duration: number;
  message: string;
  availability: string;
  experience_level: string;
  experience_description: string;
  availability_details: string;
  is_flexible_schedule: boolean;
}

const initialFormData: ApplicationFormData = {
  proposed_price: 0,
  estimated_duration: 1,
  message: "",
  availability: "",
  experience_level: "",
  experience_description: "",
  availability_details: "",
  is_flexible_schedule: false,
};

export function JobApplicationDialog({
  isOpen,
  onClose,
  onSuccess,
  jobData,
}: JobApplicationDialogProps) {
  const t = useTranslations("jobOffer.applicationDialog");
  const { toast } = useToast();
  const [formData, setFormData] =
    useState<ApplicationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when job data changes
  React.useEffect(() => {
    if (jobData && jobData.customer_budget) {
      setFormData((prev) => ({
        ...prev,
        proposed_price: jobData.customer_budget || 0,
      }));
    }
  }, [jobData]);

  const validateForm = (): boolean => {
    // Use Zod validation
    const validation = jobApplicationSchema.safeParse({
      proposed_price: formData.proposed_price,
      estimated_duration: formData.estimated_duration,
      message: formData.message.trim(),
      availability: formData.availability.trim(),
      experience_level: formData.experience_level,
      experience_description: formData.experience_description.trim() || undefined,
      availability_details: formData.availability_details.trim() || undefined,
      is_flexible_schedule: formData.is_flexible_schedule,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const applicationData: CreateJobApplicationData = {
        job_id: jobData.id,
        proposed_price: formData.proposed_price,
        estimated_duration: formData.estimated_duration,
        message: formData.message.trim(),
        availability: formData.availability.trim(),
        experience_level: formData.experience_level,
        experience_description:
          formData.experience_description.trim() || undefined,
        availability_details: formData.availability_details.trim() || undefined,
        is_flexible_schedule: formData.is_flexible_schedule,
      };

      const result = await createJobApplication(applicationData);

      if (result.success && result.applicationId) {
        toast({
          variant: "success",
          title: "Succès",
          description: t("toasts.applicationSubmittedSuccess"),
        });
        onSuccess(result.applicationId);
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || t("toasts.failedToSubmitApplication"),
        });
      }
    } catch (error) {
      console.error("Error submitting job application:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("toasts.failedToSubmitApplication"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const getCurrencySymbol = () => {
    return "MAD";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t("description", {
                  jobTitle: jobData.title,
                  customerName: `${jobData.customer.first_name || ""} ${
                    jobData.customer.last_name || ""
                  }`.trim(),
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t("jobDetails")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("jobTitle")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {jobData.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("customer")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {`${jobData.customer.first_name || ""} ${
                    jobData.customer.last_name || ""
                  }`.trim() || "Anonymous"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("customerBudget")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {jobData.customer_budget
                    ? `${getCurrencySymbol()} ${jobData.customer_budget}`
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="space-y-6">
            {/* Proposed Price */}
            <div className="space-y-2">
              <Label
                htmlFor="proposed_price"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {t("proposedPrice")} *
              </Label>
              <div className="relative">
                <Input
                  id="proposed_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.proposed_price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      proposed_price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`pl-10 ${
                    errors.proposed_price ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.proposed_price && (
                <p className="text-sm text-red-500">{errors.proposed_price}</p>
              )}
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label
                htmlFor="estimated_duration"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {t("estimatedDuration")} *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="estimated_duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimated_duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimated_duration: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`pl-10 ${
                    errors.estimated_duration ? "border-red-500" : ""
                  }`}
                  placeholder="1.0"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("durationInHours")}
              </p>
              {errors.estimated_duration && (
                <p className="text-sm text-red-500">
                  {errors.estimated_duration}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-900 dark:text-white">
                {t("experienceLevel")} *
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "beginner", label: t("beginner") },
                  { value: "intermediate", label: t("intermediate") },
                  { value: "expert", label: t("expert") },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        experience_level: value,
                      }))
                    }
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.experience_level === value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {label}
                    </p>
                  </button>
                ))}
              </div>
              {errors.experience_level && (
                <p className="text-sm text-red-500">
                  {errors.experience_level}
                </p>
              )}
            </div>

            {/* Experience Description */}
            <div className="space-y-2">
              <Label htmlFor="experience_description">
                {t("experienceDescription")}
              </Label>
              <textarea
                id="experience_description"
                value={formData.experience_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience_description: e.target.value,
                  }))
                }
                placeholder={t("experienceDescriptionPlaceholder")}
                className="w-full min-h-[100px] p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label
                htmlFor="availability"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {t("availability")} *
              </Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: e.target.value,
                  }))
                }
                placeholder={t("availabilityPlaceholder")}
                className={errors.availability ? "border-red-500" : ""}
              />
              {errors.availability && (
                <p className="text-sm text-red-500">{errors.availability}</p>
              )}
            </div>

            {/* Availability Details */}
            <div className="space-y-2">
              <Label htmlFor="availability_details">
                {t("availabilityDetails")}
              </Label>
              <textarea
                id="availability_details"
                value={formData.availability_details}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability_details: e.target.value,
                  }))
                }
                placeholder={t("availabilityDetailsPlaceholder")}
                className="w-full min-h-[80px] p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Flexible Schedule */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_flexible_schedule"
                checked={formData.is_flexible_schedule}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_flexible_schedule: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label
                htmlFor="is_flexible_schedule"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                {t("flexibleSchedule")}
              </Label>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {t("message")} *
              </Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder={t("messagePlaceholder")}
                className={`w-full min-h-[120px] p-4 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              />
              <div className="flex justify-between items-center">
                <div>
                  {errors.message && (
                    <p className="text-sm text-red-500 font-medium">
                      {errors.message}
                    </p>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("charactersCount", {
                    count: formData.message.length,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">
                  {t("tipsTitle")}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>{t("tips.tip1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>{t("tips.tip2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>{t("tips.tip3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("submittingApplication")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("submitApplication")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
