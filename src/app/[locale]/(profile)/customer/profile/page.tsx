"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Address } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  User as UserIcon,
  MapPin,
  CreditCard,
  Settings,
  ChevronDown,
  Menu,
  AlertTriangle,
  Camera,
  Edit,
  Plus,
  X,
  Trash2,
  AlertCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";
import {
  getCustomerProfileData,
  getCustomerProfileCompletion,
  updateCustomerPersonalInfo,
  addCustomerAddress,
  deleteCustomerAddress,
  uploadProfileImage,
  updateUserAvatar,
} from "@/actions/profile";

type ProfileSection = "personal" | "addresses" | "payment";

interface MissingField {
  id: string;
  label: string;
  section: ProfileSection;
  icon: React.ReactNode;
  description: string;
  required: boolean;
}

interface ProfileStats {
  completionPercentage: number;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    required: boolean;
  }>;
}

export default function CustomerProfilePage() {
  const { user, setUser } = useUserStore();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  // Create sections with translations
  const sections = useMemo(
    () => [
      {
        id: "personal" as ProfileSection,
        title: t("sections.personal.title"),
        icon: UserIcon,
        description: t("sections.personal.description"),
        color: "from-blue-500 to-blue-600",
      },
      {
        id: "addresses" as ProfileSection,
        title: t("sections.addresses.title"),
        icon: MapPin,
        description: t("sections.addresses.description"),
        color: "from-orange-500 to-orange-600",
      },
      {
        id: "payment" as ProfileSection,
        title: t("sections.payment.title"),
        icon: CreditCard,
        description: t("sections.payment.description"),
        color: "from-indigo-500 to-indigo-600",
      },
    ],
    [t]
  );

  // Core state
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    completionPercentage: 0,
    missingFields: [],
  });

  // Dialog state
  const [personalInfoDialogOpen, setPersonalInfoDialogOpen] = useState(false);

  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  // Image validation and compression constants
  const IMAGE_CONSTRAINTS = {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxDimensions: { width: 1024, height: 1024 },
    minDimensions: { width: 200, height: 200 },
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    quality: 0.8,
  };

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth || "",
    avatar_url: user?.avatar_url || "",
  });

  const [newAddress, setNewAddress] = useState<{
    label: string;
    street_address: string;
    city: string;
    region: string;
    postal_code?: string;
    country: string;
    is_default: boolean;
  }>({
    label: "home",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Data fetching
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCustomerProfileData();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.user) {
        setUser(result.user);
      }
      setAddresses(result.addresses);

      // Fetch profile completion stats
      const stats = await getCustomerProfileCompletion();
      setProfileStats(stats);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error(t("errors.loadProfileData"));
    } finally {
      setLoading(false);
    }
  }, [setUser, t]);

  // Effects - fetch data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id, fetchProfileData]);

  // Helper function to get field icons
  const getFieldIcon = useCallback((fieldId: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      profile_photo: <Camera className="h-4 w-4" />,
      full_name: <UserIcon className="h-4 w-4" />,
      phone: <UserIcon className="h-4 w-4" />,
      address: <MapPin className="h-4 w-4" />,
    };
    return iconMap[fieldId] || <AlertTriangle className="h-4 w-4" />;
  }, []);

  // Helper function to get field descriptions
  const getFieldDescription = useCallback(
    (fieldId: string): string => {
      const descriptionMap: Record<string, string> = {
        profile_photo: t("fieldDescriptions.profilePhoto"),
        full_name: t("fieldDescriptions.fullName"),
        phone: t("fieldDescriptions.phone"),
        address: t("fieldDescriptions.address"),
      };
      return descriptionMap[fieldId] || t("fieldDescriptions.default");
    },
    [t]
  );

  // Convert server missing fields to client format
  const missingFields = useMemo((): MissingField[] => {
    return profileStats.missingFields.map((field) => ({
      id: field.id,
      label: field.label,
      section: field.section as ProfileSection,
      icon: getFieldIcon(field.id),
      description: getFieldDescription(field.id),
      required: field.required,
    }));
  }, [profileStats.missingFields, getFieldIcon, getFieldDescription]);

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

  // Handle photo upload
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

  // Perform photo upload to Supabase
  const performPhotoUpload = async (file: File) => {
    if (!user?.id) return;

    setUploadingPhoto(true);
    try {
      // Upload to Supabase storage using server action
      const uploadResult = await uploadProfileImage(user.id, file);

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Failed to upload image");
        return;
      }

      // Update user avatar using server action
      const result = await updateUserAvatar(user.id, uploadResult.url!);

      if (result.success && result.user) {
        // Update store immediately with new avatar URL
        setUser(result.user);
        // Also update personalInfo state to reflect the change
        setPersonalInfo((prev) => ({
          ...prev,
          avatar_url: result.user!.avatar_url || "",
        }));
        // Refresh profile data to ensure consistency
        await fetchProfileData();
        toast.success("Profile photo updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Update personal info
  const updatePersonalInfo = async () => {
    setLoading(true);

    const result = await updateCustomerPersonalInfo({
      first_name: personalInfo.first_name,
      last_name: personalInfo.last_name,
      phone: personalInfo.phone,
      date_of_birth: personalInfo.date_of_birth || undefined,
    });

    if (result.success && result.user) {
      setUser(result.user);
      toast.success(t("success.profileUpdated"));
      setPersonalInfoDialogOpen(false);
      // Refresh profile data to update completion stats
      fetchProfileData();
    } else {
      toast.error(result.error || t("errors.updateProfile"));
    }

    setLoading(false);
  };

  // Add address
  const addAddress = async () => {
    if (!newAddress.street_address || !newAddress.city) return;

    setLoading(true);

    const result = await addCustomerAddress(newAddress);

    if (result.success) {
      toast.success(t("success.addressAdded"));
      setNewAddress({
        label: "home",
        street_address: "",
        city: "",
        region: "",
        postal_code: "",
        country: "MA",
        is_default: false,
      });
      setShowNewAddressForm(false);
      // Refresh profile data to update completion stats
      fetchProfileData();
    } else {
      toast.error(result.error || t("errors.addAddress"));
    }

    setLoading(false);
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    setLoading(true);

    const result = await deleteCustomerAddress(addressId);

    if (result.success) {
      toast.success(t("success.addressDeleted"));
      // Refresh profile data to update completion stats
      fetchProfileData();
    } else {
      toast.error(result.error || t("errors.deleteAddress"));
    }

    setLoading(false);
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
            {t("errors.notLoggedIn")}
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            {t("errors.loginRequired")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Enhanced Header Section with Progress */}
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
                {t("navigation.title")}
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)] text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Profile Completion Progress */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-accent)]/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--color-success)] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {profileStats.completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-lg">
                      {t("completion.title")}
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      {profileStats.completionPercentage === 100
                        ? t("completion.complete")
                        : t("completion.requiredFieldsRemaining", {
                            count: profileStats.missingFields.filter(
                              (f) => f.required
                            ).length,
                          })}
                    </p>
                  </div>
                </div>

                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-[var(--color-accent)]/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${profileStats.completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 text-center">
                    {t("completion.percentageComplete", {
                      percentage: profileStats.completionPercentage,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className="lg:hidden">
          <Card className="border-0 shadow-lg bg-[var(--color-surface)]/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[var(--color-text-primary)]">
                  {tCommon("navigation")}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  {mobileMenuOpen ? tCommon("close") : tCommon("menu")}
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${
                      mobileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
            </CardHeader>
            {mobileMenuOpen && (
              <CardContent className="pt-0">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const sectionMissingFields = missingFields.filter(
                      (field) => field.section === section.id
                    );
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 text-left transition-all duration-200 rounded-xl ${
                          activeSection === section.id
                            ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${
                              activeSection === section.id
                                ? "bg-white/20"
                                : "bg-[var(--color-accent)]/50"
                            }`}
                          >
                            <section.icon className="h-4 w-4" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {section.title}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {section.description}
                            </div>
                          </div>
                        </div>
                        {sectionMissingFields.length > 0 && (
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <AlertTriangle className="h-3 w-3 text-[var(--color-error)]" />
                            <span className="text-xs font-medium text-[var(--color-error)]">
                              {sectionMissingFields.length}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Enhanced Desktop Navigation */}
        <div className="hidden lg:block">
          <Card className="border-0 shadow-lg bg-[var(--color-surface)]/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <nav className="grid grid-cols-3 gap-3">
                {sections.map((section) => {
                  const sectionMissingFields = missingFields.filter(
                    (field) => field.section === section.id
                  );
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`relative flex flex-col items-center gap-3 p-4 text-center transition-all duration-200 rounded-xl ${
                        activeSection === section.id
                          ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105`
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/30 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          activeSection === section.id
                            ? "bg-white/20"
                            : "bg-[var(--color-accent)]/50"
                        }`}
                      >
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {section.title}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {section.description}
                        </div>
                      </div>
                      {sectionMissingFields.length > 0 && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-[var(--color-error)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {sectionMissingFields.length}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Personal Information Section */}
          {activeSection === "personal" && (
            <Card className="border-0 shadow-lg bg-[var(--color-surface)]/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                      <UserIcon className="h-5 w-5" />
                      {t("sections.personal.title")}
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      {t("sections.personal.description")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPersonalInfoDialogOpen(true)}
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("sections.personal.editProfile")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Profile Photo Section */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                          priority
                          unoptimized
                          key={user.avatar_url} // Force re-render when URL changes
                          onError={(e) => {
                            console.error("Failed to load avatar image:", user.avatar_url);
                            e.currentTarget.src = "/default-avatar.svg";
                          }}
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)]">
                      {t("sections.personal.profilePhoto")}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("sections.personal.profilePhotoDescription")}
                    </p>
                  </div>
                </div>

                {/* Personal Info Display */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      {t("sections.personal.firstName")}
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.first_name || tCommon("notProvided")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      {t("sections.personal.lastName")}
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.last_name || tCommon("notProvided")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      {t("sections.personal.email")}
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      {t("sections.personal.phoneNumber")}
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.phone || tCommon("notProvided")}
                    </p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      {t("sections.personal.dateOfBirth")}
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.date_of_birth
                        ? new Date(user.date_of_birth).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : tCommon("notProvided")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses Section */}
          {activeSection === "addresses" && (
            <Card className="border-0 shadow-lg bg-[var(--color-surface)]/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                      <MapPin className="h-5 w-5" />
                      {t("sections.addresses.title")}
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      {t("sections.addresses.description")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddressForm(true)}
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("sections.addresses.addAddress")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 && !showNewAddressForm && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                    <h3 className="font-medium mb-2 text-[var(--color-text-primary)]">
                      {t("sections.addresses.noAddressesAdded")}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {t("sections.addresses.addFirstAddressDescription")}
                    </p>
                    <Button
                      onClick={() => setShowNewAddressForm(true)}
                      className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("sections.addresses.addFirstAddress")}
                    </Button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <Card className="border-2 border-dashed border-[var(--color-border)] bg-[var(--color-accent)]/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[var(--color-text-primary)]">
                          {t("sections.addresses.addNewAddress")}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="address_label"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.label")}
                          </Label>
                          <select
                            id="address_label"
                            value={newAddress.label}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                label: e.target.value,
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm shadow-xs focus:border-[var(--color-primary)]"
                          >
                            <option value="home">{tCommon("home")}</option>
                            <option value="work">{tCommon("work")}</option>
                            <option value="other">{tCommon("other")}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.country")}
                          </Label>
                          <select
                            id="country"
                            value={newAddress.country}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm shadow-xs focus:border-[var(--color-primary)]"
                          >
                            <option value="MA">Morocco</option>
                            <option value="FR">France</option>
                            <option value="ES">Spain</option>
                          </select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label
                            htmlFor="street_address"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.streetAddress")} *
                          </Label>
                          <Input
                            id="street_address"
                            value={newAddress.street_address}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                street_address: e.target.value,
                              }))
                            }
                            placeholder={t(
                              "sections.addresses.enterStreetAddress"
                            )}
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.city")} *
                          </Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            placeholder={t("sections.addresses.enterCity")}
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="region"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.region")} *
                          </Label>
                          <Input
                            id="region"
                            value={newAddress.region}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                region: e.target.value,
                              }))
                            }
                            placeholder={t("sections.addresses.enterRegion")}
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="postal_code"
                            className="text-[var(--color-text-primary)]"
                          >
                            {t("sections.addresses.postalCode")}
                          </Label>
                          <Input
                            id="postal_code"
                            value={newAddress.postal_code}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                postal_code: e.target.value,
                              }))
                            }
                            placeholder={t(
                              "sections.addresses.enterPostalCode"
                            )}
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={addAddress}
                          disabled={loading}
                          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
                        >
                          {loading ? tCommon("saving") : tCommon("saveAddress")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAddressForm(false)}
                          className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                        >
                          {tCommon("cancel")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Addresses */}
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    className="border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize text-[var(--color-text-primary)]">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-2 py-1 rounded">
                                {tCommon("default")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {address.street_address}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {address.city}, {address.region}{" "}
                            {address.postal_code}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {address.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              address.id && deleteAddress(address.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Methods Section */}
          {activeSection === "payment" && (
            <Card className="border-0 shadow-lg bg-[var(--color-surface)]/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                      <CreditCard className="h-5 w-5" />
                      {t("sections.payment.title")}
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      {t("sections.payment.description")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("sections.payment.addPaymentMethod")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Balance */}
                <div className="p-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">
                      {t("sections.payment.walletBalance")}
                    </h3>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {user.wallet_balance
                      ? `${user.wallet_balance} MAD`
                      : "0 MAD"}
                  </div>
                  <p className="text-sm opacity-90">
                    {t("sections.payment.availableForPayments")}
                  </p>
                </div>

                {/* Payment Methods Placeholder */}
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                  <h3 className="font-medium mb-2 text-[var(--color-text-primary)]">
                    {t("sections.payment.noPaymentMethods")}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {t("sections.payment.addPaymentMethodDescription")}
                  </p>
                  <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("sections.payment.addFirstPaymentMethod")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Personal Info Edit Dialog */}
      <Dialog
        open={personalInfoDialogOpen}
        onOpenChange={setPersonalInfoDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {t("dialog.editPersonalInfo.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dialog.editPersonalInfo.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Profile Photo Upload Section */}
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
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
                      unoptimized
                      onError={(e) => {
                        console.error("Failed to load avatar image:", user.avatar_url);
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-[var(--color-text-secondary)]" />
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
                  id="customer-photo-upload"
                  disabled={uploadingPhoto || processingPhoto}
                />
                <label
                  htmlFor="customer-photo-upload"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white cursor-pointer flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {uploadingPhoto || processingPhoto ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </label>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--color-text-primary)]">
                  Profile Photo
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {user?.avatar_url
                    ? "Click the camera icon to change"
                    : "Add a profile photo"}
                </p>
                <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--color-border)]/50">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    <strong>📸 Photo Requirements:</strong>
                  </p>
                  <ul className="text-xs text-[var(--color-text-secondary)] mt-1 space-y-1">
                    <li>• Formats: JPEG, PNG, or WebP</li>
                    <li>
                      • Max size: {IMAGE_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB
                    </li>
                    <li>
                      • Min dimensions: {IMAGE_CONSTRAINTS.minDimensions.width}x
                      {IMAGE_CONSTRAINTS.minDimensions.height}px
                    </li>
                    <li>
                      • Max dimensions: {IMAGE_CONSTRAINTS.maxDimensions.width}x
                      {IMAGE_CONSTRAINTS.maxDimensions.height}px
                    </li>
                    <li>
                      • Auto-resized and compressed for optimal performance
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_first_name"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("dialog.editPersonalInfo.firstName")}
                </Label>
                <Input
                  id="dialog_first_name"
                  value={personalInfo.first_name}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  placeholder={t("dialog.editPersonalInfo.enterFirstName")}
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_last_name"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("dialog.editPersonalInfo.lastName")}
                </Label>
                <Input
                  id="dialog_last_name"
                  value={personalInfo.last_name}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  placeholder={t("dialog.editPersonalInfo.enterLastName")}
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_email"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("dialog.editPersonalInfo.email")}
                </Label>
                <Input
                  id="dialog_email"
                  type="email"
                  value={personalInfo.email}
                  disabled={true}
                  className="bg-[var(--color-accent)]/30 border-[var(--color-border)]"
                />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t("dialog.editPersonalInfo.emailCannotBeChanged")}
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_phone"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("dialog.editPersonalInfo.phoneNumber")}
                </Label>
                <Input
                  id="dialog_phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder={t("dialog.editPersonalInfo.enterPhoneNumber")}
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="dialog_date_of_birth"
                  className="text-[var(--color-text-primary)]"
                >
                  {t("dialog.editPersonalInfo.dateOfBirth")}
                </Label>
                <Input
                  id="dialog_date_of_birth"
                  type="date"
                  value={personalInfo.date_of_birth}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({
                      ...prev,
                      date_of_birth: e.target.value,
                    }))
                  }
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPersonalInfo({
                  first_name: user?.first_name || "",
                  last_name: user?.last_name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                  date_of_birth: user?.date_of_birth || "",
                  avatar_url: user?.avatar_url || "",
                });
                setPersonalInfoDialogOpen(false);
              }}
              className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={updatePersonalInfo}
              disabled={loading}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
            >
              {loading ? tCommon("saving") : tCommon("saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
