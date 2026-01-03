"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import {
  createTaskerProfileAction,
  hasTaskerCompletedProfileAction,
  getUserProfileAction,
} from "@/actions/auth";
import { uploadIDDocumentsAction } from "@/actions/file-uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
  Shield,
  Star,
  Loader2,
  Phone,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import type { ExperienceLevel } from "@/types/supabase";

interface FinishSignUpFormData {
  experience_level: ExperienceLevel;
  bio: string;
  service_radius_km: number;
  is_available: boolean;
  phone?: string;
  operation_hours: {
    monday: { enabled: boolean; startTime: string; endTime: string };
    tuesday: { enabled: boolean; startTime: string; endTime: string };
    wednesday: { enabled: boolean; startTime: string; endTime: string };
    thursday: { enabled: boolean; startTime: string; endTime: string };
    friday: { enabled: boolean; startTime: string; endTime: string };
    saturday: { enabled: boolean; startTime: string; endTime: string };
    sunday: { enabled: boolean; startTime: string; endTime: string };
  };
}

interface IDDocument {
  file: File;
  preview: string;
  type: "front" | "back";
}

interface UploadStatus {
  uploading: boolean;
  progress: number;
  error?: string;
}

export default function FinishSignUpPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ID Document upload state
  const [idDocuments, setIdDocuments] = useState<{
    front?: IDDocument;
    back?: IDDocument;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    progress: 0,
  });

  // Form state
  const [formData, setFormData] = useState<FinishSignUpFormData>({
    experience_level: "beginner",
    bio: "",
    service_radius_km: 50,
    is_available: true,
    operation_hours: {
      monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    },
  });

  // Check user authentication, role, and profile completion status on mount
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        if (user?.role == "customer") {
          toast.error(t("pages.finishSignUp.onlyForTaskers"));
          router.push("/customer/dashboard");
          return;
        }

        // Check if tasker has already completed their profile
        const profileCheck = await hasTaskerCompletedProfileAction();

        if (profileCheck.hasCompleted) {
          toast.success(t("pages.finishSignUp.alreadyCompleted"));
          router.push("/tasker/dashboard");
          return;
        }

        if (profileCheck.errorMessage) {
          toast.error(t("pages.finishSignUp.failedToVerify"));
          router.push("/login");
          return;
        }
      } catch {
        toast.error(t("pages.finishSignUp.failedToVerifyUser"));
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [user, router, t]);

  const handleInputChange = (
    field: keyof FinishSignUpFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOperationHoursChange = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      operation_hours: {
        ...prev.operation_hours,
        [day]: {
          ...prev.operation_hours[day as keyof typeof prev.operation_hours],
          [field]: value,
        },
      },
    }));
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return t("pages.finishSignUp.invalidFileType");
    }

    if (file.size > maxSize) {
      return t("pages.finishSignUp.fileTooLarge");
    }

    return null;
  };

  // Handle ID document upload
  const handleIDDocumentUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const preview = URL.createObjectURL(file);
    const document: IDDocument = { file, preview, type };

    setIdDocuments((prev) => ({
      ...prev,
      [type]: document,
    }));

    toast.success(t(`pages.finishSignUp.${type}IdUploaded`));
  };

  // Remove ID document
  const removeIDDocument = (type: "front" | "back") => {
    setIdDocuments((prev) => {
      const newDocs = { ...prev };
      if (newDocs[type]?.preview) {
        URL.revokeObjectURL(newDocs[type]!.preview);
      }
      delete newDocs[type];
      return newDocs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus({ uploading: true, progress: 0 });

    try {
      // Validate required ID documents
      if (!idDocuments.front || !idDocuments.back) {
        toast.error(t("pages.finishSignUp.uploadBothIdSides"));
        setUploadStatus({ uploading: false, progress: 0 });
        setIsSubmitting(false);
        return;
      }

      // Get user ID
      if (!user?.id) {
        toast.error(t("pages.finishSignUp.userNotFound"));
        setUploadStatus({ uploading: false, progress: 0 });
        setIsSubmitting(false);
        return;
      }

      // Upload ID documents first
      setUploadStatus({ uploading: true, progress: 30 });
      const uploadResult = await uploadIDDocumentsAction(
        user.id,
        idDocuments.front!.file,
        idDocuments.back!.file
      );

      if (!uploadResult.success) {
        toast.error(
          uploadResult.errorMessage || t("pages.finishSignUp.failedToUpload")
        );
        setUploadStatus({ uploading: false, progress: 0 });
        setIsSubmitting(false);
        return;
      }

      setUploadStatus({ uploading: true, progress: 70 });

      // Create tasker profile with document path
      // Save the path (not the signed URL) so we can generate fresh URLs when needed
      const result = await createTaskerProfileAction({
        ...formData,
        identity_document_url: uploadResult.frontPath || uploadResult.frontUrl || "",
      });

      if (result.success) {
        setUploadStatus({ uploading: true, progress: 100 });
        toast.success(t("pages.finishSignUp.profileCompleted"));

        // Clean up preview URLs
        if (idDocuments.front?.preview) {
          URL.revokeObjectURL(idDocuments.front.preview);
        }
        if (idDocuments.back?.preview) {
          URL.revokeObjectURL(idDocuments.back.preview);
        }

        // Update user store with updated role
        if (result.user) {
          setUser(result.user);
        } else {
          // Fallback: Refresh user profile to get updated role
          const profileResult = await getUserProfileAction();
          if (profileResult.success && profileResult.user) {
            setUser(profileResult.user);
          }
        }

        // Small delay to ensure database changes are propagated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Redirect directly to dashboard after successful profile completion
        router.replace("/tasker/dashboard");
      } else {
        toast.error(
          result.errorMessage || t("pages.finishSignUp.failedToComplete")
        );
        setUploadStatus({ uploading: false, progress: 0 });
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error(t("pages.finishSignUp.unexpectedError"));
      setUploadStatus({
        uploading: false,
        progress: 0,
        error: "Upload failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">{t("pages.finishSignUp.loading")}</p>
        </div>
      </div>
    );
  }

  const experienceLevels: {
    value: ExperienceLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: "beginner",
      label: t("pages.finishSignUp.experienceLevels.beginner.label"),
      description: t(
        "pages.finishSignUp.experienceLevels.beginner.description"
      ),
    },
    {
      value: "intermediate",
      label: t("pages.finishSignUp.experienceLevels.intermediate.label"),
      description: t(
        "pages.finishSignUp.experienceLevels.intermediate.description"
      ),
    },
    {
      value: "expert",
      label: t("pages.finishSignUp.experienceLevels.expert.label"),
      description: t("pages.finishSignUp.experienceLevels.expert.description"),
    },
  ];

  const days = [
    { key: "monday", label: t("pages.finishSignUp.days.monday") },
    { key: "tuesday", label: t("pages.finishSignUp.days.tuesday") },
    { key: "wednesday", label: t("pages.finishSignUp.days.wednesday") },
    { key: "thursday", label: t("pages.finishSignUp.days.thursday") },
    { key: "friday", label: t("pages.finishSignUp.days.friday") },
    { key: "saturday", label: t("pages.finishSignUp.days.saturday") },
    { key: "sunday", label: t("pages.finishSignUp.days.sunday") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] dark:from-[var(--color-primary-dark)] dark:via-[var(--color-primary)] dark:to-[var(--color-primary-light)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--color-secondary)] rounded-full opacity-5 sm:opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--color-accent)] rounded-full opacity-5 sm:opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              {t("pages.finishSignUp.completeProfile")}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              <span className="gradient-text">
                {t("pages.finishSignUp.finishSettingUp")}
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t("pages.finishSignUp.almostThere")}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Experience Level */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Star className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.experienceLevel")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experienceLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.experience_level === level.value
                        ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-secondary)]/50"
                    }`}
                    onClick={() =>
                      handleInputChange("experience_level", level.value)
                    }
                  >
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {level.label}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {level.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <FileText className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.professionalBio")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("pages.finishSignUp.bioLabel")}
                </Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={t("pages.finishSignUp.bioPlaceholder")}
                  className="w-full min-h-[120px] p-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent resize-none text-[var(--color-text-primary)]"
                  required
                />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("pages.finishSignUp.charactersMin50", {
                    count: formData.bio.length,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Phone className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.contactInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("pages.finishSignUp.phoneNumberOptional")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("pages.finishSignUp.enterPhoneNumber")}
                  className="w-full"
                />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("pages.finishSignUp.phoneHelp")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Radius */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <MapPin className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.serviceArea")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="radius"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("pages.finishSignUp.serviceRadius")}
                </Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.service_radius_km}
                  onChange={(e) =>
                    handleInputChange(
                      "service_radius_km",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  required
                />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("pages.finishSignUp.travelDistance")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Clock className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.availability")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) =>
                      handleInputChange("is_available", e.target.checked)
                    }
                    className="rounded border-[var(--color-border)]"
                  />
                  <Label
                    htmlFor="is_available"
                    className="text-[var(--color-text-primary)]"
                  >
                    {t("pages.finishSignUp.currentlyAvailable")}
                  </Label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    {t("pages.finishSignUp.operatingHours")}
                  </h4>
                  {days.map((day) => (
                    <div
                      key={day.key}
                      className="flex items-center space-x-4 p-3 bg-[var(--color-background-secondary)] rounded-lg"
                    >
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        <input
                          type="checkbox"
                          checked={
                            formData.operation_hours[
                              day.key as keyof typeof formData.operation_hours
                            ].enabled
                          }
                          onChange={(e) =>
                            handleOperationHoursChange(
                              day.key,
                              "enabled",
                              e.target.checked
                            )
                          }
                          className="rounded border-[var(--color-border)]"
                        />
                        <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                          {day.label}
                        </Label>
                      </div>

                      {formData.operation_hours[
                        day.key as keyof typeof formData.operation_hours
                      ].enabled && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={
                              formData.operation_hours[
                                day.key as keyof typeof formData.operation_hours
                              ].startTime
                            }
                            onChange={(e) =>
                              handleOperationHoursChange(
                                day.key,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <span className="text-[var(--color-text-secondary)]">
                            {t("pages.finishSignUp.to")}
                          </span>
                          <Input
                            type="time"
                            value={
                              formData.operation_hours[
                                day.key as keyof typeof formData.operation_hours
                              ].endTime
                            }
                            onChange={(e) =>
                              handleOperationHoursChange(
                                day.key,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Document Upload */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Shield className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("pages.finishSignUp.identityVerification")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("pages.finishSignUp.uploadIdDescription")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front ID Upload */}
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-primary)] font-medium">
                      {t("pages.finishSignUp.frontOfId")} *
                    </Label>
                    <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4 text-center">
                      {idDocuments.front ? (
                        <div className="space-y-2">
                          <Image
                            src={idDocuments.front.preview}
                            alt="Front ID preview"
                            width={300}
                            height={128}
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              {t("pages.finishSignUp.uploaded")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeIDDocument("front")}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]" />
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {t("pages.finishSignUp.clickToUploadFront")}
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => handleIDDocumentUpload(e, "front")}
                            className="hidden"
                            id="front-id-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("front-id-upload")
                                ?.click()
                            }
                          >
                            {t("pages.finishSignUp.chooseFile")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back ID Upload */}
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-primary)] font-medium">
                      {t("pages.finishSignUp.backOfId")} *
                    </Label>
                    <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4 text-center">
                      {idDocuments.back ? (
                        <div className="space-y-2">
                          <Image
                            src={idDocuments.back.preview}
                            alt="Back ID preview"
                            width={300}
                            height={128}
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              {t("pages.finishSignUp.uploaded")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeIDDocument("back")}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]" />
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {t("pages.finishSignUp.clickToUploadBack")}
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => handleIDDocumentUpload(e, "back")}
                            className="hidden"
                            id="back-id-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("back-id-upload")?.click()
                            }
                          >
                            {t("pages.finishSignUp.chooseFile")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  <p>• {t("pages.finishSignUp.supportedFormats")}</p>
                  <p>• {t("pages.finishSignUp.maxFileSize")}</p>
                  <p>• {t("pages.finishSignUp.ensureClear")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Submit */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-[var(--color-secondary)]/10 to-[var(--color-accent)]/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">
                    {t("pages.finishSignUp.profileReview")}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    formData.bio.length < 50 ||
                    !idDocuments.front ||
                    !idDocuments.back
                  }
                  size="lg"
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {uploadStatus.uploading
                        ? t("pages.finishSignUp.uploading", {
                            progress: uploadStatus.progress,
                          })
                        : t("pages.finishSignUp.completingProfile")}
                    </>
                  ) : (
                    <>
                      {t("pages.finishSignUp.completeProfile")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {(!idDocuments.front || !idDocuments.back) && (
                  <p className="text-sm text-red-500">
                    {t("pages.finishSignUp.uploadBothIdSides")}
                  </p>
                )}

                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t("pages.finishSignUp.termsAndPrivacy")}
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
