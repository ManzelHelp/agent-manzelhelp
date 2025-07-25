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
  Globe,
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
  Briefcase,
  FileText,
  DollarSign,
  Zap,
  BadgeCheck,
  MapPinIcon,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type ProfileSection =
  | "personal"
  | "skills"
  | "availability"
  | "verification"
  | "bio"
  | "addresses"
  | "security"
  | "payment"
  | "preferences";

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

interface TaskerService {
  id: number;
  tasker_id: string;
  service_id: number;
  pricing_type: "fixed" | "hourly" | "per_item";
  base_price: number;
  hourly_rate?: number;
  is_available: boolean;
  service?: {
    id: number;
    name_en: string;
    name_fr: string;
    name_ar: string;
    category_id: number;
    category?: {
      name_en: string;
      name_fr: string;
      name_ar: string;
    };
  };
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
    "skills",
    "availability",
    "verification",
    "bio",
    "addresses",
    "security",
    "payment",
    "preferences",
  ];

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Data states
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );
  const [taskerServices, setTaskerServices] = useState<TaskerService[]>([]);
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

  // Calculate profile completion
  const completionItems: ProfileCompletionItem[] = [
    {
      id: "basic_info",
      section: "personal",
      title: t("completion.basicInfo"),
      completed: !!(user?.first_name && user?.last_name && user?.phone),
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
      id: "services_skills",
      section: "skills",
      title: t("completion.servicesSkills"),
      completed: taskerServices.length > 0,
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

    // Fetch tasker services
    const { data: services, error: servicesError } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        service:services(
          *,
          category:service_categories(*)
        )
      `
      )
      .eq("tasker_id", user.id);

    if (servicesError) {
      console.error("Error fetching tasker services:", servicesError);
    } else {
      setTaskerServices(services || []);
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

  const removeTaskerService = async (serviceId: number) => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("tasker_services")
      .delete()
      .eq("id", serviceId)
      .eq("tasker_id", user.id);

    if (error) {
      toast.error(t("errors.removeService"));
      console.error("Error removing service:", error);
    } else {
      toast.success(t("success.serviceRemoved"));
      fetchTaskerData();
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
    skills: <Briefcase className="h-4 w-4" />,
    availability: <Clock className="h-4 w-4" />,
    verification: <BadgeCheck className="h-4 w-4" />,
    bio: <FileText className="h-4 w-4" />,
    addresses: <MapPin className="h-4 w-4" />,
    security: <Shield className="h-4 w-4" />,
    payment: <CreditCard className="h-4 w-4" />,
    preferences: <Globe className="h-4 w-4" />,
  };

  const sections = [
    { id: "personal" as ProfileSection, title: t("sections.personal") },
    { id: "bio" as ProfileSection, title: t("sections.bio") },
    { id: "skills" as ProfileSection, title: t("sections.skills") },
    { id: "availability" as ProfileSection, title: t("sections.availability") },
    { id: "addresses" as ProfileSection, title: t("sections.addresses") },
    { id: "payment" as ProfileSection, title: t("sections.payment") },
    { id: "preferences" as ProfileSection, title: t("sections.preferences") },
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with completion status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {completionPercentage}%
            </div>
            <p className="text-sm text-muted-foreground">
              {t("completion.complete")}
            </p>
          </div>
        </div>

        {/* Completion Progress Card */}
        {completionPercentage < 100 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {t("completion.title")}
                </CardTitle>
              </div>
              <CardDescription>{t("completion.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completionItems
                  .filter((item) => !item.completed)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-background cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setActiveSection(item.section)}
                    >
                      {sectionIcons[item.section]}
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.required && (
                        <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                          {t("completion.required")}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{t("navigation.title")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors hover:bg-accent ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sectionIcons[section.id]}
                    <span>{section.title}</span>
                    {completionItems.some(
                      (item) => item.section === section.id && !item.completed
                    ) && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information Section */}
          {activeSection === "personal" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t("sections.personal")}
                    </CardTitle>
                    <CardDescription>
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
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={t("personal.avatar")}
                          className="h-full w-full object-cover"
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                          priority
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
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
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{t("personal.avatar")}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("photo-upload")?.click()
                        }
                        disabled={uploadingPhoto}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhoto
                          ? t("actions.uploading") || "Uploading..."
                          : t("personal.uploadPhoto") || "Upload Photo"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("personal.avatarDescription")}
                    </p>
                  </div>
                </div>
                {/* Personal Info Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t("personal.lastName")}</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("personal.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      disabled={true}
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("personal.emailNote")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("personal.phone")}</Label>
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
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="date_of_birth">
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
                    />
                  </div>
                </div>
                {isEditing.personal && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={updatePersonalInfo} disabled={loading}>
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
                        setIsEditing((prev) => ({ ...prev, personal: false }));
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                  </div>
                )}
                {/* Verification Section (moved here) */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {t("sections.verification")}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Identity Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("verification.identity")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {taskerProfile?.verification_status === "verified"
                              ? t("verification.verified")
                              : t("verification.identityDescription")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {taskerProfile?.verification_status === "verified" ? (
                          <BadgeCheck
                            className="h-4 w-4 text-green-600"
                            aria-label={
                              t("verification.verified") || "Verified"
                            }
                          />
                        ) : (
                          <Button size="sm" variant="outline">
                            {t("verification.uploadDocument")}
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Email Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("verification.email")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <BadgeCheck
                            className="h-4 w-4 text-green-600"
                            aria-label={
                              t("verification.verified") || "Verified"
                            }
                          />
                        ) : (
                          <Button size="sm">{t("verification.verify")}</Button>
                        )}
                      </div>
                    </div>
                    {/* Phone Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("verification.phone")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.phone || t("verification.phoneNotAdded")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.phone ? (
                          <BadgeCheck
                            className="h-4 w-4 text-green-600"
                            aria-label={
                              t("verification.verified") || "Verified"
                            }
                          />
                        ) : (
                          <Button size="sm" disabled={!user.phone}>
                            {t("verification.verify")}
                          </Button>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("sections.bio")}
                    </CardTitle>
                    <CardDescription>{t("bio.description")}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIsEditing((prev) => ({ ...prev, bio: !prev.bio }))
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing.bio ? t("actions.cancel") : t("actions.edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t("bio.bioTitle")}</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bioInfo.bio}
                      onChange={(e) =>
                        setBioInfo((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      disabled={!isEditing.bio}
                      placeholder={t("bio.bioPlaceholder")}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("bio.bioHint")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">
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
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_radius">
                      {t("bio.serviceRadius")}
                    </Label>
                    <div className="flex items-center gap-2">
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
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">km</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("bio.serviceRadiusHint")}
                    </p>
                  </div>
                </div>

                {isEditing.bio && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={updateBioInfo} disabled={loading}>
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
                    >
                      {t("actions.cancel")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills & Services Section */}
          {activeSection === "skills" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {t("sections.skills")}
                    </CardTitle>
                    <CardDescription>{t("skills.description")}</CardDescription>
                  </div>
                  <Link href="/tasker/create-offer">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("skills.addService")}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskerServices.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">
                      {t("skills.noServices")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t("skills.noServicesDescription")}
                    </p>
                    <Link href="/tasker/create-offer">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("skills.addFirstService")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {taskerServices.map((taskerService) => (
                      <Card key={taskerService.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">
                                  {taskerService.service?.name_en}
                                </h3>
                                {taskerService.is_available ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {t("skills.active")}
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    {t("skills.inactive")}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {taskerService.service?.category?.name_en}
                              </p>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {taskerService.pricing_type === "hourly"
                                    ? `€${taskerService.hourly_rate}/hour`
                                    : `€${taskerService.base_price} fixed`}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/tasker/create-offer?edit=${taskerService.id}`}
                              >
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeTaskerService(taskerService.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Availability Schedule Section */}
          {activeSection === "availability" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t("sections.availability")}
                    </CardTitle>
                    <CardDescription>
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
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing.availability
                      ? t("actions.cancel")
                      : t("actions.edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {WEEKDAYS.map((day, index) => {
                    const slot = availability[index];
                    return (
                      <div
                        key={day.key}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="w-24">
                          <label className="flex items-center gap-2">
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
                              className="rounded"
                            />
                            <span className="font-medium text-sm">
                              {day.label}
                            </span>
                          </label>
                        </div>
                        {slot.enabled && (
                          <div className="flex items-center gap-2">
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
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
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
                              className="w-32"
                            />
                          </div>
                        )}
                        {!slot.enabled && (
                          <span className="text-muted-foreground text-sm">
                            {t("availability.unavailable")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {t("availability.quickBookingTitle")}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {t("availability.quickBookingDescription")}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing.availability && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveAvailability} disabled={loading}>
                      {loading ? t("actions.saving") : t("actions.save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset to original state
                        setAvailability(originalAvailability);
                        setIsEditing((prev) => ({
                          ...prev,
                          availability: false,
                        }));
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Addresses Section - Same as customer but with different context */}
          {activeSection === "addresses" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("sections.serviceLocations") || "Service Locations"}
                    </CardTitle>
                    <CardDescription>
                      {t("serviceLocations.description") ||
                        "Manage where you provide your services."}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("serviceLocations.addLocation") ||
                      "Add Service Location"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 && !showNewAddressForm && (
                  <div className="text-center py-8">
                    <MapPinIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">{t("addresses.empty")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("addresses.emptyDescription")}
                    </p>
                    <Button onClick={() => setShowNewAddressForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addresses.addFirst")}
                    </Button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <Card className="border-dashed border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {t("addresses.newAddress")}
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
                          <Label htmlFor="address_label">
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
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                          >
                            <option value="home">{t("addresses.home")}</option>
                            <option value="work">{t("addresses.work")}</option>
                            <option value="other">
                              {t("addresses.other")}
                            </option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">
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
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                          >
                            <option value="MA">Morocco</option>
                            <option value="FR">France</option>
                            <option value="ES">Spain</option>
                          </select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="street_address">
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">{t("addresses.city")}</Label>
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">
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
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={addAddress} disabled={loading}>
                          {loading ? t("actions.saving") : t("actions.save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          {t("actions.cancel")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Addresses */}
                {addresses.map((address) => (
                  <Card key={address.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {t("addresses.default")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street_address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.region}{" "}
                            {address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">
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

          {/* Payment Methods Section - Same as customer */}
          {activeSection === "payment" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t("sections.payment")}
                    </CardTitle>
                    <CardDescription>
                      {t("payment.description")}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("payment.addMethod")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t("payment.noMethods")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("payment.noMethodsDescription")}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("payment.addFirst")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Section - Same as customer */}
          {activeSection === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("sections.preferences")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label>{t("preferences.language")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label>{t("preferences.timezone")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                    <option value="CET">CET (Central European Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>{t("preferences.currency")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="MAD">MAD (Moroccan Dirham)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
