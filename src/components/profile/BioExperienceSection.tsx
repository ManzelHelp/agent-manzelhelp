"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, AlertTriangle, FileText, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import type { TaskerProfile, ExperienceLevel } from "@/types/supabase";
import { updateTaskerBio } from "@/actions/profile";

interface BioExperienceSectionProps {
  taskerProfile: TaskerProfile | null;
  loading: boolean;
  onProfileUpdate: (updatedProfile: TaskerProfile) => void;
  onProfileRefresh: () => Promise<void>;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

interface BioFormData {
  bio: string;
  experience_level: ExperienceLevel;
  service_radius_km: number | undefined;
}

const getExperienceLevels = (t: ReturnType<typeof useTranslations>) => [
  { value: "beginner", label: t("experienceLevels.beginner", { default: "Beginner (0-1 years)" }) },
  { value: "intermediate", label: t("experienceLevels.intermediate", { default: "Intermediate (1-3 years)" }) },
  { value: "expert", label: t("experienceLevels.expert", { default: "Expert (3+ years)" }) },
];

export default function BioExperienceSection({
  taskerProfile,
  loading,
  onProfileUpdate,
  onProfileRefresh,
  missingFields,
}: BioExperienceSectionProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const experienceLevels = getExperienceLevels(t);
  const [editBioOpen, setEditBioOpen] = useState(false);
  const [bioForm, setBioForm] = useState<BioFormData>({
    bio: "",
    experience_level: "beginner",
    service_radius_km: 50,
  });

  const [bioFormErrors, setBioFormErrors] = useState<{
    bio?: string;
    service_radius_km?: string;
  }>({});

  // Update form when profile changes
  useEffect(() => {
    if (taskerProfile) {
      setBioForm({
        bio: taskerProfile.bio || "",
        experience_level:
          (taskerProfile.experience_level as ExperienceLevel) || "beginner",
        service_radius_km: taskerProfile.service_radius_km || 50,
      });
    }
  }, [taskerProfile]);

  // Get missing fields for this section
  const bioMissingFields = missingFields.filter(
    (field) => field.section === "bio"
  );

  const updateBioInfo = async () => {
    // Clear previous errors
    setBioFormErrors({});

    // Basic validation
    const errors: typeof bioFormErrors = {};

    if (!bioForm.bio.trim()) {
      errors.bio = "Bio is required";
    }

    if (
      !bioForm.service_radius_km ||
      bioForm.service_radius_km < 1 ||
      bioForm.service_radius_km > 200
    ) {
      errors.service_radius_km = "Service radius must be between 1 and 200 km";
    }

    // If there are errors, show them and return
    if (Object.keys(errors).length > 0) {
      setBioFormErrors(errors);
      toast.error("Please fix the errors before saving");
      return;
    }

    // Check if we have a valid tasker profile
    if (!taskerProfile?.id) {
      toast.error("Profile not found. Please refresh the page and try again.");
      return;
    }

    try {
      const result = await updateTaskerBio(taskerProfile.id, {
        bio: bioForm.bio.trim(),
        experience_level: bioForm.experience_level,
        service_radius_km: bioForm.service_radius_km,
      });

      if (result.success && result.taskerProfile) {
        onProfileUpdate(result.taskerProfile);
        await onProfileRefresh(); // Refresh profile data
        setEditBioOpen(false);
        toast.success("Bio information updated successfully");
      } else {
        toast.error(result.error || "Failed to update bio information");
      }
    } catch (error) {
      console.error("Error updating bio info:", error);
      toast.error("Failed to update bio information");
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                {t("bioExperience")}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                {t("tellCustomersAbout")}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bioMissingFields.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
                <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
                <span className="text-sm font-medium text-[var(--color-error)]">
                  {t("missing", { count: bioMissingFields.length })}
                </span>
              </div>
            )}
            <Dialog
              open={editBioOpen}
              onOpenChange={(open) => {
                setEditBioOpen(open);
                if (!open) {
                  // Clear errors when dialog is closed
                  setBioFormErrors({});
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("editBioExperience", { default: "Edit Bio & Experience" })}</DialogTitle>
                  <DialogDescription>
                    {t("updateBioExperience", { default: "Update your bio, experience level, and service area" })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t("bio")}</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bioForm.bio}
                      onChange={(e) => {
                        setBioForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }));
                        // Clear error when user starts typing
                        if (bioFormErrors.bio) {
                          setBioFormErrors((prev) => ({
                            ...prev,
                            bio: undefined,
                          }));
                        }
                      }}
                      placeholder={t("bioPlaceholder", { default: "Tell customers about your experience, skills, and what you offer..." })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200 ${
                        bioFormErrors.bio
                          ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                    <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--color-border)]/50">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        <strong>{t("bioTips.title", { default: "💡 Tips for a great bio:" })}</strong>
                      </p>
                      <ul className="text-xs text-[var(--color-text-secondary)] mt-1 space-y-1">
                        <li>• {t("bioTips.mentionExperience", { default: "Mention your relevant experience and skills" })}</li>
                        <li>• {t("bioTips.highlightUnique", { default: "Highlight what makes you unique" })}</li>
                        <li>• {t("bioTips.beSpecific", { default: "Be specific about the services you offer" })}</li>
                        <li>• {t("bioTips.keepProfessional", { default: "Keep it professional but friendly" })}</li>
                        <li>• {t("bioTips.aimForSentences", { default: "Aim for 2-3 sentences that capture your expertise" })}</li>
                      </ul>
                    </div>
                    {bioFormErrors.bio && (
                      <p className="text-xs text-[var(--color-error)]">
                        {bioFormErrors.bio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">{t("experienceLevel")}</Label>
                    <select
                      id="experience_level"
                      value={bioForm.experience_level}
                      onChange={(e) =>
                        setBioForm((prev) => ({
                          ...prev,
                          experience_level: e.target.value as ExperienceLevel,
                        }))
                      }
                      className="flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_radius_km">
                      {t("serviceAreaRadius", { default: "Service Area Radius (km)" })}
                    </Label>
                    <Input
                      id="service_radius_km"
                      type="number"
                      min="1"
                      max="200"
                      value={bioForm.service_radius_km || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBioForm((prev) => ({
                          ...prev,
                          service_radius_km: value
                            ? parseInt(value)
                            : undefined,
                        }));
                        // Clear error when user starts typing
                        if (bioFormErrors.service_radius_km) {
                          setBioFormErrors((prev) => ({
                            ...prev,
                            service_radius_km: undefined,
                          }));
                        }
                      }}
                      placeholder={t("serviceRadiusPlaceholder", { default: "Enter service radius in kilometers" })}
                      className={
                        bioFormErrors.service_radius_km
                          ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                          : ""
                      }
                    />
                    <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--color-border)]/50">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        <strong>{t("serviceAreaGuidelines.title", { default: "📍 Service Area Guidelines:" })}</strong>
                      </p>
                      <ul className="text-xs text-[var(--color-text-secondary)] mt-1 space-y-1">
                        <li>• {t("serviceAreaGuidelines.local", { default: "10-25 km: Local neighborhood service" })}</li>
                        <li>• {t("serviceAreaGuidelines.citywide", { default: "25-50 km: City-wide coverage" })}</li>
                        <li>• {t("serviceAreaGuidelines.regional", { default: "50-100 km: Regional service area" })}</li>
                        <li>• {t("serviceAreaGuidelines.extended", { default: "100+ km: Extended coverage (consider travel costs)" })}</li>
                      </ul>
                    </div>
                    {bioFormErrors.service_radius_km && (
                      <p className="text-xs text-[var(--color-error)]">
                        {bioFormErrors.service_radius_km}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditBioOpen(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button onClick={updateBioInfo} disabled={loading}>
                    {loading ? tCommon("saving") : tCommon("saveChanges")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  {t("bio")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {taskerProfile?.bio || t("noBioAddedYet")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  {t("experienceLevel")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] capitalize">
                  {taskerProfile?.experience_level || t("notSpecified")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  {t("serviceArea")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {taskerProfile?.service_radius_km
                    ? t("serviceRadius", { radius: taskerProfile.service_radius_km })
                    : t("notSpecified")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
