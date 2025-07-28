"use client";

import React, { useState, useEffect } from "react";
import type { AvailabilitySlot } from "@/types/supabase";
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
  User,
  MapPin,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  X,
  Camera,
  Phone,
  Mail,
  Trash2,
  Upload,
  Clock,
  FileText,
  Zap,
  BadgeCheck,
  MapPinIcon,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

type ProfileSection =
  | "personal"
  | "availability"
  | "verification"
  | "bio"
  | "addresses"
  | "security"
  | "payment";

interface ProfileCompletionItem {
  id: string;
  section: ProfileSection;
  title: string;
  completed: boolean;
  required: boolean;
}

interface TaskerProfile {
  id: string;
  experience_level?: string;
  bio?: string;
  identity_document_url?: string;
  verification_status?: "pending" | "verified" | "rejected";
  service_radius_km?: number;
  is_available?: boolean;
  updated_at?: string;
  operation_hours?: AvailabilitySlot[] | null; // JSONB column for operation hours
}

interface Address {
  id?: number;
  label: string;
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "Beginner (0-1 years)",
    labelKey: "bio.experienceLevels.beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate (1-3 years)",
    labelKey: "bio.experienceLevels.intermediate",
  },
  {
    value: "experienced",
    label: "Experienced (3-5 years)",
    labelKey: "bio.experienceLevels.experienced",
  },
  {
    value: "expert",
    label: "Expert (5+ years)",
    labelKey: "bio.experienceLevels.expert",
  },
];

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function TaskerProfilePage() {
  const { user, setUser } = useUserStore();
  const t = useTranslations("taskerProfile");
  const searchParams = useSearchParams();

  const validSections: ProfileSection[] = [
    "personal",
    "availability",
    "verification",
    "bio",
    "addresses",
    "security",
    "payment",
  ];

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Data states
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth || "",
    avatar_url: user?.avatar_url || "",
  });

  const [bioInfo, setBioInfo] = useState({
    bio: "",
    experience_level: "beginner",
    service_radius_km: 25,
  });

  const defaultAvailability = React.useMemo<AvailabilitySlot[]>(
    () => [
      { day: "monday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "tuesday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "wednesday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "thursday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "friday", enabled: true, startTime: "09:00", endTime: "17:00" },
      { day: "saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
      { day: "sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
    ],
    []
  );
  const [availability, setAvailability] =
    useState<AvailabilitySlot[]>(defaultAvailability);
  const [originalAvailability, setOriginalAvailability] =
    useState<AvailabilitySlot[]>(defaultAvailability);

  const [newAddress, setNewAddress] = useState<Address>({
    label: "home",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Add state for profile photo upload near other states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Mobile dropdown state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate profile completion
  const completionItems: ProfileCompletionItem[] = [
    {
      id: "basic_info",
      section: "personal",
      title: t("completion.basicInfo"),
      completed: !!(user?.first_name && user?.last_name),
      required: true,
    },
    {
      id: "profile_photo",
      section: "personal",
      title: t("completion.profilePhoto"),
      completed: !!user?.avatar_url,
      required: true,
    },

    {
      id: "bio_experience",
      section: "bio",
      title: t("completion.bioExperience"),
      completed: !!(taskerProfile?.bio && taskerProfile?.experience_level),
      required: true,
    },

    {
      id: "availability",
      section: "availability",
      title: t("completion.availability"),
      completed: availability.some((slot) => slot.enabled),
      required: true,
    },
    {
      id: "address",
      section: "addresses",
      title: t("completion.address"),
      completed: addresses.length > 0,
      required: true,
    },
    {
      id: "identity_verified",
      section: "verification",
      title: t("completion.identityVerified"),
      completed: taskerProfile?.verification_status === "verified",
      required: true,
    },
    {
      id: "email_verified",
      section: "verification",
      title: t("completion.emailVerified"),
      completed: !!user?.email_verified,
      required: true,
    },
  ];

  const completedCount = completionItems.filter(
    (item) => item.completed
  ).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  // Fetch data on component mount
  const fetchTaskerData = React.useCallback(async () => {
    if (!user?.id) return;

    const supabase = createClient();

    // Fetch tasker profile
    const { data: profile, error: profileError } = await supabase
      .from("tasker_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching tasker profile:", profileError);
    } else if (profile) {
      setTaskerProfile(profile);
      // Set availability from profile JSONB, fallback to default
      const availabilityData =
        profile.operation_hours && Array.isArray(profile.operation_hours)
          ? profile.operation_hours
          : defaultAvailability;
      setAvailability(availabilityData);
      setOriginalAvailability(availabilityData);
    }
  }, [user?.id, defaultAvailability]);

  const fetchAddresses = React.useCallback(async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      toast.error(t("errors.fetchAddresses"));
    } else {
      setAddresses(data || []);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) {
      fetchTaskerData();
      fetchAddresses();
    }
  }, [user?.id, fetchTaskerData, fetchAddresses]);

  useEffect(() => {
    if (taskerProfile) {
      setBioInfo({
        bio: taskerProfile.bio || "",
        experience_level: taskerProfile.experience_level || "beginner",
        service_radius_km: taskerProfile.service_radius_km || 25,
      });
    }
  }, [taskerProfile]);

  // Set section from query param on mount and when it changes
  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (
      sectionParam &&
      validSections.includes(sectionParam as ProfileSection)
    ) {
      setActiveSection(sectionParam as ProfileSection);
    }
  }, [searchParams]);

  const updatePersonalInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        phone: personalInfo.phone,
        date_of_birth: personalInfo.date_of_birth,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(t("errors.updateProfile"));
      console.error("Error updating profile:", error);
    } else {
      setUser({
        ...user,
        ...personalInfo,
        updated_at: new Date().toISOString(),
      });
      toast.success(t("success.profileUpdated"));
      setIsEditing((prev) => ({ ...prev, personal: false }));
    }

    setLoading(false);
  };

  const updateBioInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      bio: bioInfo.bio,
      experience_level: bioInfo.experience_level,
      service_radius_km: bioInfo.service_radius_km,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(t("errors.updateBio"));
      console.error("Error updating bio:", error);
    } else {
      setTaskerProfile((prev) => ({
        ...prev,
        id: user.id,
        bio: bioInfo.bio,
        experience_level: bioInfo.experience_level,
        service_radius_km: bioInfo.service_radius_km,
        updated_at: new Date().toISOString(),
      }));
      toast.success(t("success.bioUpdated"));
      setIsEditing((prev) => ({ ...prev, bio: false }));
    }

    setLoading(false);
  };

  // Add profile photo upload function
  const handlePhotoUpload = async (file: File) => {
    if (!user?.id) return;

    setUploadingPhoto(true);
    try {
      const supabase = createClient();

      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

      if (!publicUrl) throw new Error("Failed to get public URL");

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setUser({
        ...user,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });
      setPersonalInfo((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      toast.success(
        t("success.profilePhotoUpdated") || "Profile photo updated successfully"
      );
    } catch (error) {
      console.error("Error uploading photo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload photo";
      toast.error(t("errors.profilePhotoUpload") || errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add optimized addAddress function with better error handling
  const addAddress = async () => {
    if (
      !user?.id ||
      !newAddress.street_address.trim() ||
      !newAddress.city.trim()
    ) {
      toast.error(
        t("errors.requiredFields") || "Please fill in all required fields"
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from("addresses").insert([
        {
          ...newAddress,
          user_id: user.id,
          street_address: newAddress.street_address.trim(),
          city: newAddress.city.trim(),
          region: newAddress.region.trim(),
          postal_code: newAddress.postal_code?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success(
        t("success.addressAdded") || "Service location added successfully"
      );

      // Reset form
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

      // Refresh addresses
      await fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add service location";
      toast.error(t("errors.addAddress") || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      toast.error(t("errors.deleteAddress"));
      console.error("Error deleting address:", error);
    } else {
      toast.success(t("success.addressDeleted"));
      fetchAddresses();
    }

    setLoading(false);
  };

  const updateAvailability = (
    dayIndex: number,
    field: keyof AvailabilitySlot,
    value: string | boolean
  ) => {
    setAvailability((prev) =>
      prev.map((slot, index) =>
        index === dayIndex ? { ...slot, [field]: value } : slot
      )
    );
  };

  const saveAvailability = async () => {
    if (!user?.id) return;
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      operation_hours: availability,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(t("errors.updateProfile") || "Failed to update availability");
      console.error("Error updating availability:", error);
    } else {
      toast.success(
        t("success.availabilityUpdated") || "Availability updated successfully"
      );
      // Update the local profile state
      setTaskerProfile((prev) => ({
        ...prev,
        id: user.id,
        operation_hours: availability,
        updated_at: new Date().toISOString(),
      }));
      setOriginalAvailability(availability); // Update the original state
      setIsEditing((prev) => ({ ...prev, availability: false }));
    }
    setLoading(false);
  };

  const sectionIcons: Record<ProfileSection, React.ReactNode> = {
    personal: <User className="h-4 w-4" />,
    availability: <Clock className="h-4 w-4" />,
    verification: <BadgeCheck className="h-4 w-4" />,
    bio: <FileText className="h-4 w-4" />,
    addresses: <MapPin className="h-4 w-4" />,
    security: <Shield className="h-4 w-4" />,
    payment: <CreditCard className="h-4 w-4" />,
  };

  const sections = [
    { id: "personal" as ProfileSection, title: t("sections.personal") },
    { id: "bio" as ProfileSection, title: t("sections.bio") },
    { id: "availability" as ProfileSection, title: t("sections.availability") },
    { id: "addresses" as ProfileSection, title: t("sections.addresses") },
    { id: "payment" as ProfileSection, title: t("sections.payment") },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {t("errors.notLoggedIn")}
          </h2>
          <p className="text-muted-foreground">{t("errors.loginRequired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-color-bg via-color-surface to-color-bg/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header with completion status */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-color-text-primary leading-tight">
                {t("title")}
              </h1>
              <p className="text-color-text-secondary text-sm sm:text-base">
                {t("subtitle")}
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end space-y-1">
              <div className="relative">
                <div className="text-2xl sm:text-3xl font-bold text-color-primary">
                  {completionPercentage}%
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-color-secondary rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs sm:text-sm text-color-text-secondary">
                {t("completion.complete")}
              </p>
            </div>
          </div>

          {/* Completion Progress Card */}
          {completionPercentage < 100 && (
            <Card className="hidden lg:block border-0 shadow-lg bg-gradient-to-r from-color-primary/5 to-color-secondary/5 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-color-primary/10">
                    <AlertCircle className="h-5 w-5 text-color-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-color-text-primary">
                      {t("completion.title")}
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      {t("completion.description")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {completionItems
                    .filter((item) => !item.completed)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 p-4 rounded-xl border border-color-border/50 bg-color-surface/50 backdrop-blur-sm cursor-pointer hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200 hover:shadow-md"
                        onClick={() => setActiveSection(item.section)}
                      >
                        <div className="p-2 rounded-lg bg-color-primary/10 group-hover:bg-color-primary/20 transition-colors">
                          {sectionIcons[item.section]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-color-text-primary block truncate">
                            {item.title}
                          </span>
                          {item.required && (
                            <span className="inline-block mt-1 text-xs bg-color-error/10 text-color-error px-2 py-1 rounded-full">
                              {t("completion.required")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Navigation Dropdown */}
          <div className="lg:hidden">
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-color-text-primary">
                    {t("navigation.title")}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    {mobileMenuOpen ? "Close" : "Menu"}
                    <ChevronDown
                      className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                        mobileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              {mobileMenuOpen && (
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const hasIncompleteItems = completionItems.some(
                        (item) => item.section === section.id && !item.completed
                      );
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all duration-200 rounded-lg ${
                            activeSection === section.id
                              ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                              : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-md transition-colors ${
                                activeSection === section.id
                                  ? "bg-color-primary/20"
                                  : "bg-color-accent/20"
                              }`}
                            >
                              {sectionIcons[section.id]}
                            </div>
                            <span>{section.title}</span>
                          </div>
                          {hasIncompleteItems && (
                            <span className="text-xs bg-color-error text-white px-2 py-1 rounded-full font-medium">
                              Missing
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-6 border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-color-text-primary">
                  {t("navigation.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const hasIncompleteItems = completionItems.some(
                      (item) => item.section === section.id && !item.completed
                    );
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-all duration-200 rounded-lg mx-2 ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                            : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-md transition-colors ${
                            activeSection === section.id
                              ? "bg-color-primary/20"
                              : "bg-color-accent/20"
                          }`}
                        >
                          {sectionIcons[section.id]}
                        </div>
                        <span className="flex-1">{section.title}</span>
                        {hasIncompleteItems && (
                          <div className="w-2 h-2 rounded-full bg-color-error animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information Section */}
            {activeSection === "personal" && (
              <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl text-color-text-primary">
                        <div className="p-2 rounded-lg bg-color-primary/10">
                          <User className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("sections.personal")}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("personal.description")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditing((prev) => ({
                          ...prev,
                          personal: !prev.personal,
                        }))
                      }
                      className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing.personal
                        ? t("actions.cancel")
                        : t("actions.edit")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-color-primary/10 to-color-secondary/10 flex items-center justify-center overflow-hidden border-4 border-color-surface shadow-lg">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={t("personal.avatar")}
                            className="h-full w-full object-cover"
                            fill
                            sizes="112px"
                            style={{ objectFit: "cover" }}
                            priority
                          />
                        ) : (
                          <User className="h-10 w-10 sm:h-12 sm:w-12 text-color-text-secondary" />
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
                        disabled={uploadingPhoto}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-color-primary to-color-secondary text-white hover:from-color-primary-light hover:to-color-secondary-light cursor-pointer flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="font-semibold text-color-text-primary">
                          {t("personal.avatar")}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("photo-upload")?.click()
                          }
                          disabled={uploadingPhoto}
                          className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingPhoto
                            ? t("actions.uploading") || "Uploading..."
                            : t("personal.uploadPhoto") || "Upload Photo"}
                        </Button>
                      </div>
                      <p className="text-sm text-color-text-secondary">
                        {t("personal.avatarDescription")}
                      </p>
                    </div>
                  </div>
                  {/* Personal Info Form */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label
                        htmlFor="first_name"
                        className="text-color-text-primary font-medium"
                      >
                        {t("personal.firstName")}
                      </Label>
                      <Input
                        id="first_name"
                        value={personalInfo.first_name}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        disabled={!isEditing.personal}
                        placeholder={t("personal.firstNamePlaceholder")}
                        className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="last_name"
                        className="text-color-text-primary font-medium"
                      >
                        {t("personal.lastName")}
                      </Label>
                      <Input
                        id="last_name"
                        value={personalInfo.last_name}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        disabled={!isEditing.personal}
                        placeholder={t("personal.lastNamePlaceholder")}
                        className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-color-text-primary font-medium"
                      >
                        {t("personal.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        disabled={true}
                        className="bg-color-accent/30 border-color-border text-color-text-secondary"
                      />
                      <p className="text-xs text-color-text-secondary">
                        {t("personal.emailNote")}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="phone"
                        className="text-color-text-primary font-medium"
                      >
                        {t("personal.phone")}{" "}
                        <span className="text-color-text-secondary text-xs">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        disabled={!isEditing.personal}
                        placeholder={t("personal.phonePlaceholder")}
                        className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                      />
                      <p className="text-xs text-color-text-secondary">
                        {t("personal.phoneNote") ||
                          "Phone number is optional but recommended for better communication"}
                      </p>
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <Label
                        htmlFor="date_of_birth"
                        className="text-color-text-primary font-medium"
                      >
                        {t("personal.birthDate")}
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={personalInfo.date_of_birth}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            date_of_birth: e.target.value,
                          }))
                        }
                        disabled={!isEditing.personal}
                        className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  {isEditing.personal && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        onClick={updatePersonalInfo}
                        disabled={loading}
                        className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                      >
                        {loading ? t("actions.saving") : t("actions.save")}
                      </Button>
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
                          setIsEditing((prev) => ({
                            ...prev,
                            personal: false,
                          }));
                        }}
                        className="border-color-border hover:bg-color-accent/30 transition-all duration-200"
                      >
                        {t("actions.cancel")}
                      </Button>
                    </div>
                  )}
                  {/* Verification Section */}
                  <div className="mt-8 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-3 text-color-text-primary">
                      <div className="p-2 rounded-lg bg-color-success/10">
                        <CheckCircle className="h-5 w-5 text-color-success" />
                      </div>
                      {t("sections.verification")}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Identity Verification */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-color-border/50 bg-color-surface/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-color-primary/10">
                            <Upload className="h-5 w-5 text-color-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {t("verification.identity")}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {taskerProfile?.verification_status === "verified"
                                ? t("verification.verified")
                                : t("verification.identityDescription")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {taskerProfile?.verification_status === "verified" ? (
                            <div className="flex items-center gap-2">
                              <BadgeCheck
                                className="h-4 w-4 text-color-success"
                                aria-label={
                                  t("verification.verified") || "Verified"
                                }
                              />
                              <span className="text-xs text-color-success font-medium">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                            >
                              {t("verification.uploadDocument")}
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* Email Verification */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-color-border/50 bg-color-surface/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-color-primary/10">
                            <Mail className="h-5 w-5 text-color-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {t("verification.email")}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.email_verified ? (
                            <div className="flex items-center gap-2">
                              <BadgeCheck
                                className="h-4 w-4 text-color-success"
                                aria-label={
                                  t("verification.verified") || "Verified"
                                }
                              />
                              <span className="text-xs text-color-success font-medium">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                            >
                              {t("verification.verify")}
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* Phone Verification */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-color-border/50 bg-color-surface/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-color-primary/10">
                            <Phone className="h-5 w-5 text-color-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {t("verification.phone")}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {user.phone || t("verification.phoneNotAdded")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.phone ? (
                            <div className="flex items-center gap-2">
                              <BadgeCheck
                                className="h-4 w-4 text-color-success"
                                aria-label="Added"
                              />
                              <span className="text-xs text-color-success font-medium">
                                Added
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-color-text-secondary">
                              Add phone number
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio & Experience Section */}
            {activeSection === "bio" && (
              <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl text-color-text-primary">
                        <div className="p-2 rounded-lg bg-color-primary/10">
                          <FileText className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("sections.bio")}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("bio.description")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditing((prev) => ({ ...prev, bio: !prev.bio }))
                      }
                      className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing.bio ? t("actions.cancel") : t("actions.edit")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="bio"
                        className="text-color-text-primary font-medium"
                      >
                        {t("bio.bioTitle")}
                      </Label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={bioInfo.bio}
                        onChange={(e) =>
                          setBioInfo((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        disabled={!isEditing.bio}
                        placeholder={t("bio.bioPlaceholder")}
                        className="w-full px-3 py-2 border border-color-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200 disabled:bg-color-accent/30 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-color-text-secondary">
                        {t("bio.bioHint")}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="experience_level"
                        className="text-color-text-primary font-medium"
                      >
                        {t("bio.experienceLevel")}
                      </Label>
                      <select
                        id="experience_level"
                        value={bioInfo.experience_level}
                        onChange={(e) =>
                          setBioInfo((prev) => ({
                            ...prev,
                            experience_level: e.target.value,
                          }))
                        }
                        disabled={!isEditing.bio}
                        className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200 disabled:bg-color-accent/30 disabled:cursor-not-allowed"
                      >
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="service_radius"
                        className="text-color-text-primary font-medium"
                      >
                        {t("bio.serviceRadius")}
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="service_radius"
                          type="number"
                          min="1"
                          max="100"
                          value={bioInfo.service_radius_km}
                          onChange={(e) =>
                            setBioInfo((prev) => ({
                              ...prev,
                              service_radius_km: parseInt(e.target.value) || 25,
                            }))
                          }
                          disabled={!isEditing.bio}
                          className="w-24 border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                        />
                        <span className="text-sm text-color-text-secondary">
                          km
                        </span>
                      </div>
                      <p className="text-xs text-color-text-secondary">
                        {t("bio.serviceRadiusHint")}
                      </p>
                    </div>
                  </div>

                  {isEditing.bio && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        onClick={updateBioInfo}
                        disabled={loading}
                        className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                      >
                        {loading ? t("actions.saving") : t("actions.save")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBioInfo({
                            bio: taskerProfile?.bio || "",
                            experience_level:
                              taskerProfile?.experience_level || "beginner",
                            service_radius_km:
                              taskerProfile?.service_radius_km || 25,
                          });
                          setIsEditing((prev) => ({ ...prev, bio: false }));
                        }}
                        className="border-color-border hover:bg-color-accent/30 transition-all duration-200"
                      >
                        {t("actions.cancel")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Availability Schedule Section */}
            {activeSection === "availability" && (
              <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl text-color-text-primary">
                        <div className="p-2 rounded-lg bg-color-primary/10">
                          <Clock className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("sections.availability")}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("availability.description")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditing((prev) => ({
                          ...prev,
                          availability: !prev.availability,
                        }))
                      }
                      className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing.availability
                        ? t("actions.cancel")
                        : t("actions.edit")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {WEEKDAYS.map((day, index) => {
                      const slot = availability[index];
                      return (
                        <div
                          key={day.key}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-color-border/50 bg-color-surface/50 backdrop-blur-sm"
                        >
                          <div className="w-full sm:w-32">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.enabled}
                                onChange={(e) =>
                                  updateAvailability(
                                    index,
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                                disabled={!isEditing.availability}
                                className="rounded border-color-border focus:ring-color-primary/20 transition-all duration-200"
                              />
                              <span className="font-medium text-color-text-primary text-sm">
                                {day.label}
                              </span>
                            </label>
                          </div>
                          {slot.enabled && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  updateAvailability(
                                    index,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing.availability}
                                className="w-full sm:w-32 border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                              />
                              <span className="text-color-text-secondary text-sm">
                                to
                              </span>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  updateAvailability(
                                    index,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing.availability}
                                className="w-full sm:w-32 border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                              />
                            </div>
                          )}
                          {!slot.enabled && (
                            <span className="text-color-text-secondary text-sm">
                              {t("availability.unavailable")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gradient-to-r from-color-info/10 to-color-secondary/10 border border-color-info/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-color-info/20">
                        <Zap className="h-5 w-5 text-color-info" />
                      </div>
                      <div>
                        <h4 className="font-medium text-color-text-primary">
                          {t("availability.quickBookingTitle")}
                        </h4>
                        <p className="text-sm text-color-text-secondary mt-1">
                          {t("availability.quickBookingDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isEditing.availability && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        onClick={saveAvailability}
                        disabled={loading}
                        className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                      >
                        {loading ? t("actions.saving") : t("actions.save")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAvailability(originalAvailability);
                          setIsEditing((prev) => ({
                            ...prev,
                            availability: false,
                          }));
                        }}
                        className="border-color-border hover:bg-color-accent/30 transition-all duration-200"
                      >
                        {t("actions.cancel")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Addresses Section */}
            {activeSection === "addresses" && (
              <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl text-color-text-primary">
                        <div className="p-2 rounded-lg bg-color-primary/10">
                          <MapPin className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("sections.serviceLocations") || "Service Locations"}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("serviceLocations.description") ||
                          "Manage where you provide your services."}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewAddressForm(true)}
                      className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("serviceLocations.addLocation") ||
                        "Add Service Location"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {addresses.length === 0 && !showNewAddressForm && (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <MapPinIcon className="h-8 w-8 text-color-text-secondary" />
                      </div>
                      <h3 className="font-semibold text-color-text-primary mb-2">
                        {t("addresses.empty")}
                      </h3>
                      <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
                        {t("addresses.emptyDescription")}
                      </p>
                      <Button
                        onClick={() => setShowNewAddressForm(true)}
                        className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addresses.addFirst")}
                      </Button>
                    </div>
                  )}

                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <Card className="border-2 border-dashed border-color-border bg-color-surface/50 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-color-text-primary">
                            {t("addresses.newAddress")}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNewAddressForm(false)}
                            className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30 transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-3">
                            <Label
                              htmlFor="address_label"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.label")}
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
                              className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                            >
                              <option value="home">
                                {t("addresses.home")}
                              </option>
                              <option value="work">
                                {t("addresses.work")}
                              </option>
                              <option value="other">
                                {t("addresses.other")}
                              </option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="country"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.country")}
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
                              className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                            >
                              <option value="MA">Morocco</option>
                              <option value="FR">France</option>
                              <option value="ES">Spain</option>
                            </select>
                          </div>
                          <div className="space-y-3 sm:col-span-2">
                            <Label
                              htmlFor="street_address"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.street")}
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
                              placeholder={t("addresses.streetPlaceholder")}
                              className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="city"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.city")}
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
                              placeholder={t("addresses.cityPlaceholder")}
                              className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="region"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.region")}
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
                              placeholder={t("addresses.regionPlaceholder")}
                              className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="postal_code"
                              className="text-color-text-primary font-medium"
                            >
                              {t("addresses.postalCode")}
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
                              placeholder={t("addresses.postalCodePlaceholder")}
                              className="border-color-border focus:border-color-primary focus:ring-color-primary/20 transition-all duration-200"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                          <Button
                            onClick={addAddress}
                            disabled={loading}
                            className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200"
                          >
                            {loading ? t("actions.saving") : t("actions.save")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowNewAddressForm(false)}
                            className="border-color-border hover:bg-color-accent/30 transition-all duration-200"
                          >
                            {t("actions.cancel")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Addresses */}
                  {addresses.map((address) => (
                    <Card
                      key={address.id}
                      className="border border-color-border/50 bg-color-surface/50 backdrop-blur-sm"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-semibold text-color-text-primary capitalize">
                                {address.label}
                              </span>
                              {address.is_default && (
                                <span className="text-xs bg-color-primary/10 text-color-primary px-2 py-1 rounded-full font-medium">
                                  {t("addresses.default")}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-color-text-secondary">
                                {address.street_address}
                              </p>
                              <p className="text-sm text-color-text-secondary">
                                {address.city}, {address.region}{" "}
                                {address.postal_code}
                              </p>
                              <p className="text-sm text-color-text-secondary">
                                {address.country}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                address.id && deleteAddress(address.id)
                              }
                              className="text-color-error hover:text-color-error hover:bg-color-error/10 transition-all duration-200"
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
              <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl text-color-text-primary">
                        <div className="p-2 rounded-lg bg-color-primary/10">
                          <CreditCard className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("sections.payment")}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("payment.description")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-color-border hover:bg-color-primary/5 hover:border-color-primary/30 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("payment.addMethod")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-color-text-secondary" />
                    </div>
                    <h3 className="font-semibold text-color-text-primary mb-2">
                      {t("payment.noMethods")}
                    </h3>
                    <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
                      {t("payment.noMethodsDescription")}
                    </p>
                    <Button className="bg-gradient-to-r from-color-primary to-color-secondary hover:from-color-primary-light hover:to-color-secondary-light text-white shadow-lg transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("payment.addFirst")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
