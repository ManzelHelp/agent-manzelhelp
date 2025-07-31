"use client";

import React, { useState } from "react";
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
import {
  User,
  Edit,
  Camera,
  Mail,
  BadgeCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import type { User as UserType } from "@/types/supabase";

interface PersonalInfoSectionProps {
  user: UserType | null;
  loading: boolean;
  onUserUpdate: (updatedUser: UserType) => void;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

interface PersonalFormData {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
}

// Image validation and compression constants
const IMAGE_CONSTRAINTS = {
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxDimensions: { width: 1024, height: 1024 },
  minDimensions: { width: 200, height: 200 },
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  quality: 0.8,
};

export default function PersonalInfoSection({
  user,
  loading,
  onUserUpdate,
  missingFields,
}: PersonalInfoSectionProps) {
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const [personalForm, setPersonalForm] = useState<PersonalFormData>({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split("T")[0] : "",
  });

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth
          ? user.date_of_birth.split("T")[0]
          : "",
      });
    }
  }, [user]);

  // Compress and resize image using canvas
  const compressAndResizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

      img.onload = () => {
        const { width: maxWidth, height: maxHeight } =
          IMAGE_CONSTRAINTS.maxDimensions;

        let { width, height } = img;

        // Scale down if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Ensure minimum dimensions
        if (
          width < IMAGE_CONSTRAINTS.minDimensions.width ||
          height < IMAGE_CONSTRAINTS.minDimensions.height
        ) {
          const ratio = Math.max(
            IMAGE_CONSTRAINTS.minDimensions.width / width,
            IMAGE_CONSTRAINTS.minDimensions.height / height
          );
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type,
          IMAGE_CONSTRAINTS.quality
        );
      };

      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user?.id) return;

    // Validate file type
    if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > IMAGE_CONSTRAINTS.maxFileSize) {
      toast.error(
        `File size must be less than ${
          IMAGE_CONSTRAINTS.maxFileSize / (1024 * 1024)
        }MB`
      );
      return;
    }

    // Validate initial dimensions before compression
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      // Check minimum dimensions
      if (
        img.width < IMAGE_CONSTRAINTS.minDimensions.width ||
        img.height < IMAGE_CONSTRAINTS.minDimensions.height
      ) {
        toast.error(
          `Image must be at least ${IMAGE_CONSTRAINTS.minDimensions.width}x${IMAGE_CONSTRAINTS.minDimensions.height} pixels`
        );
        return;
      }

      try {
        setProcessingPhoto(true);
        const compressedFile = await compressAndResizeImage(file);

        if (compressedFile.size > IMAGE_CONSTRAINTS.maxFileSize) {
          toast.error(
            "Image is still too large after compression. Please try a smaller image."
          );
          return;
        }

        await performPhotoUpload(compressedFile);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image. Please try again.");
      } finally {
        setProcessingPhoto(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Invalid image file");
    };

    img.src = url;
  };

  const performPhotoUpload = async (file: File) => {
    if (!user?.id) return;

    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user avatar:", updateError);
        throw updateError;
      }

      // Update userStore with new avatar
      if (user) {
        onUserUpdate({
          ...user,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });
      }
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const updatePersonalInfo = async () => {
    if (!user?.id) return;

    // Basic validation
    if (!personalForm.first_name.trim() || !personalForm.last_name.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    // Validate phone number format if provided
    if (personalForm.phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(personalForm.phone.trim())) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }

    // Validate date format if provided
    if (
      personalForm.date_of_birth &&
      personalForm.date_of_birth.trim() !== ""
    ) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(personalForm.date_of_birth)) {
        toast.error("Please enter a valid date in YYYY-MM-DD format");
        return;
      }
    }

    try {
      const supabase = createClient();

      const updateData: {
        first_name: string;
        last_name: string;
        phone: string | null;
        date_of_birth?: string | null;
        updated_at: string;
      } = {
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        phone: personalForm.phone.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (
        personalForm.date_of_birth &&
        personalForm.date_of_birth.trim() !== ""
      ) {
        updateData.date_of_birth = personalForm.date_of_birth;
      } else {
        updateData.date_of_birth = null;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Error updating personal info:", error);
        toast.error("Failed to update personal information");
        return;
      }

      // Update userStore with new data
      if (user) {
        onUserUpdate({
          ...user,
          first_name: personalForm.first_name.trim(),
          last_name: personalForm.last_name.trim(),
          phone: personalForm.phone.trim() || undefined,
          date_of_birth: updateData.date_of_birth || undefined,
          updated_at: new Date().toISOString(),
        });
      }
      toast.success("Personal information updated successfully");
      setEditPersonalOpen(false);
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Failed to update personal information");
    }
  };

  // Memoize user display data for performance
  const userDisplayData = React.useMemo(
    () => ({
      fullName: user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "",
      email: user?.email || "",
      phone: user?.phone || "Not provided",
      dateOfBirth: user?.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString()
        : "Not provided",
      avatarUrl: user?.avatar_url,
      emailVerified: user?.email_verified || false,
    }),
    [user]
  );

  const personalMissingFields = missingFields.filter(
    (field) => field.section === "personal"
  );

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                Personal Information
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                Your basic profile information
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {personalMissingFields.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
                <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
                <span className="text-sm font-medium text-[var(--color-error)]">
                  {personalMissingFields.length} missing
                </span>
              </div>
            )}
            <Dialog open={editPersonalOpen} onOpenChange={setEditPersonalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Personal Information</DialogTitle>
                  <DialogDescription>
                    Update your personal information and profile photo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Profile Photo */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center overflow-hidden border-4 border-[var(--color-surface)] shadow-lg">
                        {user?.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="h-full w-full object-cover rounded-full"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <User className="h-8 w-8 text-[var(--color-text-secondary)]" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                        className="hidden"
                        id="photo-upload"
                        disabled={uploadingPhoto || processingPhoto}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white cursor-pointer flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50"
                      >
                        {uploadingPhoto || processingPhoto ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                      </label>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)]">
                        Profile Photo
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {user?.avatar_url
                          ? "Click the camera icon to change"
                          : "Add a profile photo"}
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-[var(--color-accent)]/20 border border-[var(--color-border)]/50">
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          <strong>Requirements:</strong> JPEG, PNG, or WebP
                          format. Max{" "}
                          {IMAGE_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB, min{" "}
                          {IMAGE_CONSTRAINTS.minDimensions.width}x
                          {IMAGE_CONSTRAINTS.minDimensions.height}px, max{" "}
                          {IMAGE_CONSTRAINTS.maxDimensions.width}x
                          {IMAGE_CONSTRAINTS.maxDimensions.height}px. Image will
                          be automatically resized and compressed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={personalForm.first_name}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={personalForm.last_name}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-color-accent/30"
                      />
                      <p className="text-xs text-color-text-secondary">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalForm.phone}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={personalForm.date_of_birth}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            date_of_birth: e.target.value,
                          }))
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      <p className="text-xs text-color-text-secondary">
                        Leave empty if you don't want to provide your date of
                        birth
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditPersonalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={updatePersonalInfo} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo Display */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-color-primary/10 to-color-secondary/10 flex items-center justify-center overflow-hidden border-4 border-color-surface shadow-lg">
            {userDisplayData.avatarUrl ? (
              <Image
                src={userDisplayData.avatarUrl}
                alt="Profile"
                width={64}
                height={64}
                className="h-full w-full object-cover rounded-full"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <User className="h-6 w-6 text-color-text-secondary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-color-text-primary">
              {userDisplayData.fullName}
            </h3>
            <p className="text-sm text-color-text-secondary">
              {userDisplayData.email}
            </p>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-color-text-secondary">
              Phone Number
            </Label>
            <p className="text-color-text-primary">{userDisplayData.phone}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-color-text-secondary">
              Date of Birth
            </Label>
            <p className="text-color-text-primary">
              {userDisplayData.dateOfBirth}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-color-text-primary">
            Verification Status
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-color-border/50 bg-color-surface/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-color-primary/10">
                  <Mail className="h-4 w-4 text-color-primary" />
                </div>
                <div>
                  <p className="font-medium text-color-text-primary">Email</p>
                  <p className="text-sm text-color-text-secondary">
                    {userDisplayData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userDisplayData.emailVerified ? (
                  <div className="flex items-center gap-2 text-color-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <Button size="sm" variant="outline">
                    Verify
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-color-border/50 bg-color-surface/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-color-primary/10">
                  <BadgeCheck className="h-4 w-4 text-color-primary" />
                </div>
                <div>
                  <p className="font-medium text-color-text-primary">
                    Identity
                  </p>
                  <p className="text-sm text-color-text-secondary">
                    Not verified
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
