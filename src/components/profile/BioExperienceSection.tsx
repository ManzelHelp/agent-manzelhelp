"use client";

import React, { useState, useEffect } from "react";
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
import { Edit, AlertTriangle, FileText } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import type { TaskerProfile, ExperienceLevel } from "@/types/supabase";

interface BioExperienceSectionProps {
  taskerProfile: TaskerProfile | null;
  loading: boolean;
  onProfileUpdate: (updatedProfile: TaskerProfile) => void;
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

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "expert", label: "Expert (3+ years)" },
];

export default function BioExperienceSection({
  taskerProfile,
  loading,
  onProfileUpdate,
  missingFields,
}: BioExperienceSectionProps) {
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

    try {
      const supabase = createClient();

      const { data, error } = await supabase.from("tasker_profiles").upsert(
        {
          id: taskerProfile?.id,
          bio: bioForm.bio.trim(),
          experience_level: bioForm.experience_level,
          service_radius_km: bioForm.service_radius_km,
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Error updating bio info:", error);
        toast.error("Failed to update bio information");
        return;
      }

      if (data) {
        onProfileUpdate(data[0]);
        setEditBioOpen(false);
        toast.success("Bio information updated successfully");
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
                Bio & Experience
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                Tell customers about your experience and skills
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bioMissingFields.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
                <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
                <span className="text-sm font-medium text-[var(--color-error)]">
                  {bioMissingFields.length} missing
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
                  <DialogTitle>Edit Bio & Experience</DialogTitle>
                  <DialogDescription>
                    Update your bio, experience level, and service area
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
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
                      placeholder="Tell customers about your experience, skills, and what you offer..."
                      className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200 ${
                        bioFormErrors.bio
                          ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                    {bioFormErrors.bio && (
                      <p className="text-xs text-[var(--color-error)]">
                        {bioFormErrors.bio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level</Label>
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
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_radius_km">
                      Service Area Radius (km)
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
                      placeholder="Enter service radius in kilometers"
                      className={
                        bioFormErrors.service_radius_km
                          ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                          : ""
                      }
                    />
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
                    Cancel
                  </Button>
                  <Button onClick={updateBioInfo} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
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
                  Bio
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {taskerProfile?.bio || "No bio added yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  Experience Level
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] capitalize">
                  {taskerProfile?.experience_level || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  Service Area
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {taskerProfile?.service_radius_km
                    ? `${taskerProfile.service_radius_km} km radius`
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
