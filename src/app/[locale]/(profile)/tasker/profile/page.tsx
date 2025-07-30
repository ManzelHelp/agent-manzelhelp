"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Camera,
  Mail,
  Trash2,
  Clock,
  FileText,
  BadgeCheck,
  MapPinIcon,
  ChevronDown,
  Menu,
  AlertTriangle,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

type ProfileSection =
  | "personal"
  | "bio"
  | "availability"
  | "addresses"
  | "payment";

interface TaskerProfile {
  id: string;
  experience_level?: string;
  bio?: string;
  identity_document_url?: string;
  verification_status?: "pending" | "verified" | "rejected";
  service_radius_km?: number;
  is_available?: boolean;
  updated_at?: string;
  operation_hours?: AvailabilitySlot[] | null;
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

interface MissingField {
  id: string;
  label: string;
  section: ProfileSection;
  icon: React.ReactNode;
  description: string;
  required: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "experienced", label: "Experienced (3-5 years)" },
  { value: "expert", label: "Expert (5+ years)" },
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

const SECTIONS = [
  {
    id: "personal" as ProfileSection,
    title: "Personal Information",
    icon: User,
  },
  { id: "bio" as ProfileSection, title: "Bio & Experience", icon: FileText },
  { id: "availability" as ProfileSection, title: "Availability", icon: Clock },
  {
    id: "addresses" as ProfileSection,
    title: "Service Locations",
    icon: MapPin,
  },
  {
    id: "payment" as ProfileSection,
    title: "Payment Methods",
    icon: CreditCard,
  },
];

export default function TaskerProfilePage() {
  const { user, setUser } = useUserStore();

  // Core state
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [loading, setLoading] = useState(false);
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dialog states
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editBioOpen, setEditBioOpen] = useState(false);
  const [editAvailabilityOpen, setEditAvailabilityOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });

  const [bioForm, setBioForm] = useState({
    bio: "",
    experience_level: "beginner",
    service_radius_km: 25,
  });

  const [availabilityForm, setAvailabilityForm] = useState<AvailabilitySlot[]>(
    []
  );
  const [newAddressForm, setNewAddressForm] = useState<Address>({
    label: "home",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  // Data fetching
  const fetchTaskerData = useCallback(async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("tasker_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && profile) {
      setTaskerProfile(profile);
      setBioForm({
        bio: profile.bio || "",
        experience_level: profile.experience_level || "beginner",
        service_radius_km: profile.service_radius_km || 25,
      });
      setAvailabilityForm(profile.operation_hours || []);
    }
  }, [user?.id]);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (!error) {
      setAddresses(data || []);
    }
  }, [user?.id]);

  // Effects
  useEffect(() => {
    if (user?.id) {
      fetchTaskerData();
      fetchAddresses();
    }
  }, [user?.id, fetchTaskerData, fetchAddresses]);

  useEffect(() => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth || "",
      });
    }
  }, [user]);

  // Update functions
  const updatePersonalInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        first_name: personalForm.first_name,
        last_name: personalForm.last_name,
        phone: personalForm.phone,
        date_of_birth: personalForm.date_of_birth,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update personal information");
    } else {
      setUser({ ...user, ...personalForm });
      toast.success("Personal information updated successfully");
      setEditPersonalOpen(false);
    }
    setLoading(false);
  };

  const updateBioInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      bio: bioForm.bio,
      experience_level: bioForm.experience_level,
      service_radius_km: bioForm.service_radius_km,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to update bio information");
    } else {
      setTaskerProfile((prev) => (prev ? { ...prev, ...bioForm } : null));
      toast.success("Bio information updated successfully");
      setEditBioOpen(false);
    }
    setLoading(false);
  };

  const updateAvailability = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      operation_hours: availabilityForm,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to update availability");
    } else {
      setTaskerProfile((prev) =>
        prev
          ? {
              ...prev,
              operation_hours: availabilityForm,
            }
          : null
      );
      toast.success("Availability updated successfully");
      setEditAvailabilityOpen(false);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (file: File) => {
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

      if (uploadError) throw uploadError;

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

      if (updateError) throw updateError;

      setUser({ ...user, avatar_url: publicUrl });
      toast.success("Profile photo updated successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addAddress = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("addresses").insert([
      {
        ...newAddressForm,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      toast.error("Failed to add address");
    } else {
      toast.success("Address added successfully");
      setAddAddressOpen(false);
      fetchAddresses();
    }
    setLoading(false);
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
      toast.error("Failed to delete address");
    } else {
      toast.success("Address deleted successfully");
      fetchAddresses();
    }
    setLoading(false);
  };

  // Missing fields detection
  const getMissingFields = useCallback((): MissingField[] => {
    if (!user || !taskerProfile) return [];

    const missingFields: MissingField[] = [];

    // Personal Information Section
    if (!user.avatar_url) {
      missingFields.push({
        id: "profile_photo",
        label: "Profile Photo",
        section: "personal",
        icon: <Camera className="h-4 w-4" />,
        description: "Add a professional profile photo to build trust",
        required: true,
      });
    }

    if (!user.first_name || !user.last_name) {
      missingFields.push({
        id: "full_name",
        label: "Full Name",
        section: "personal",
        icon: <User className="h-4 w-4" />,
        description: "Complete your name for better recognition",
        required: true,
      });
    }

    if (taskerProfile.verification_status !== "verified") {
      missingFields.push({
        id: "identity_verification",
        label: "Identity Verification",
        section: "personal",
        icon: <BadgeCheck className="h-4 w-4" />,
        description: "Verify your identity to increase trust",
        required: true,
      });
    }

    // Bio & Experience Section
    if (!taskerProfile.bio || taskerProfile.bio.trim().length === 0) {
      missingFields.push({
        id: "bio",
        label: "Bio & Experience",
        section: "bio",
        icon: <FileText className="h-4 w-4" />,
        description: "Tell customers about your experience and skills",
        required: true,
      });
    }

    if (
      !taskerProfile.service_radius_km ||
      taskerProfile.service_radius_km <= 0
    ) {
      missingFields.push({
        id: "service_area",
        label: "Service Area",
        section: "bio",
        icon: <MapPin className="h-4 w-4" />,
        description: "Define your service coverage area",
        required: true,
      });
    }

    return missingFields;
  }, [user, taskerProfile]);

  const missingFields = useMemo(() => getMissingFields(), [getMissingFields]);
  const personalMissingFields = useMemo(
    () => missingFields.filter((field) => field.section === "personal"),
    [missingFields]
  );
  const bioMissingFields = useMemo(
    () => missingFields.filter((field) => field.section === "bio"),
    [missingFields]
  );

  // Memoized values
  const isLoggedIn = useMemo(() => !!user, [user]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Not logged in</h2>
          <p className="text-muted-foreground">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-color-bg via-color-surface to-color-bg/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-color-text-primary">
            Profile
          </h1>
          <p className="text-color-text-secondary">
            Manage your account information and preferences
          </p>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-color-text-primary">
                  Navigation
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="border-color-border hover:bg-color-primary/5"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  {mobileMenuOpen ? "Close" : "Menu"}
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
                <nav className="space-y-1">
                  {SECTIONS.map((section) => {
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
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all duration-200 rounded-lg ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                            : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </div>
                        {sectionMissingFields.length > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-color-error" />
                            <span className="text-xs font-medium text-color-error">
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

        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <nav className="flex space-x-1">
                {SECTIONS.map((section) => {
                  const sectionMissingFields = missingFields.filter(
                    (field) => field.section === section.id
                  );
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                          : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                      {sectionMissingFields.length > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-color-error" />
                          <span className="text-xs font-medium text-color-error">
                            {sectionMissingFields.length}
                          </span>
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
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-color-text-primary">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      Your basic profile information
                    </CardDescription>
                  </div>
                  {personalMissingFields.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
                      <AlertTriangle className="h-4 w-4 text-color-error" />
                      <span className="text-sm font-medium text-color-error">
                        {personalMissingFields.length} missing
                      </span>
                    </div>
                  )}
                  <Dialog
                    open={editPersonalOpen}
                    onOpenChange={setEditPersonalOpen}
                  >
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
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-color-primary/10 to-color-secondary/10 flex items-center justify-center overflow-hidden border-4 border-color-surface shadow-lg">
                              {user?.avatar_url ? (
                                <Image
                                  src={user.avatar_url}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                  fill
                                  sizes="80px"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <User className="h-8 w-8 text-color-text-secondary" />
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
                              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-color-primary to-color-secondary text-white cursor-pointer flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50"
                            >
                              {uploadingPhoto ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Camera className="h-3 w-3" />
                              )}
                            </label>
                          </div>
                          <div>
                            <h4 className="font-semibold text-color-text-primary">
                              Profile Photo
                            </h4>
                            <p className="text-sm text-color-text-secondary">
                              {user?.avatar_url
                                ? "Click the camera icon to change"
                                : "Add a profile photo"}
                            </p>
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
                            />
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
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Display */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-color-primary/10 to-color-secondary/10 flex items-center justify-center overflow-hidden border-4 border-color-surface shadow-lg">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        fill
                        sizes="64px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <User className="h-6 w-6 text-color-text-secondary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-color-text-primary">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-color-text-secondary">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-color-text-secondary">
                      Phone Number
                    </Label>
                    <p className="text-color-text-primary">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-color-text-secondary">
                      Date of Birth
                    </Label>
                    <p className="text-color-text-primary">
                      {user.date_of_birth
                        ? new Date(user.date_of_birth).toLocaleDateString()
                        : "Not provided"}
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
                          <p className="font-medium text-color-text-primary">
                            Email
                          </p>
                          <p className="text-sm text-color-text-secondary">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <div className="flex items-center gap-2 text-color-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Verified
                            </span>
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
                            {taskerProfile?.verification_status === "verified"
                              ? "Verified"
                              : "Not verified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {taskerProfile?.verification_status === "verified" ? (
                          <div className="flex items-center gap-2 text-color-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline">
                            Upload
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
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-color-text-primary">
                      Bio & Experience
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      Tell customers about your experience and skills
                    </CardDescription>
                  </div>
                  {bioMissingFields.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
                      <AlertTriangle className="h-4 w-4 text-color-error" />
                      <span className="text-sm font-medium text-color-error">
                        {bioMissingFields.length} missing
                      </span>
                    </div>
                  )}
                  <Dialog open={editBioOpen} onOpenChange={setEditBioOpen}>
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
                            onChange={(e) =>
                              setBioForm((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder="Tell customers about your experience, skills, and what you offer..."
                            className="w-full px-3 py-2 border border-color-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience_level">
                            Experience Level
                          </Label>
                          <select
                            id="experience_level"
                            value={bioForm.experience_level}
                            onChange={(e) =>
                              setBioForm((prev) => ({
                                ...prev,
                                experience_level: e.target.value,
                              }))
                            }
                            className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
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
                            Service Area (km)
                          </Label>
                          <div className="flex items-center gap-3">
                            <Input
                              id="service_radius"
                              type="number"
                              min="1"
                              max="100"
                              value={bioForm.service_radius_km}
                              onChange={(e) =>
                                setBioForm((prev) => ({
                                  ...prev,
                                  service_radius_km:
                                    parseInt(e.target.value) || 25,
                                }))
                              }
                              className="w-24"
                            />
                            <span className="text-sm text-color-text-secondary">
                              km
                            </span>
                          </div>
                          <p className="text-xs text-color-text-secondary">
                            Define your service coverage area
                          </p>
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
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-color-text-secondary">
                      Bio
                    </Label>
                    <p className="text-color-text-primary">
                      {taskerProfile?.bio || "No bio provided"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-color-text-secondary">
                      Experience Level
                    </Label>
                    <p className="text-color-text-primary">
                      {EXPERIENCE_LEVELS.find(
                        (level) =>
                          level.value === taskerProfile?.experience_level
                      )?.label || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-color-text-secondary">
                      Service Area
                    </Label>
                    <p className="text-color-text-primary">
                      {taskerProfile?.service_radius_km
                        ? `${taskerProfile.service_radius_km} km`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability Section */}
          {activeSection === "availability" && (
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-color-text-primary">
                      Availability
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      Set your working hours and availability
                    </CardDescription>
                  </div>
                  <Dialog
                    open={editAvailabilityOpen}
                    onOpenChange={setEditAvailabilityOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Availability</DialogTitle>
                        <DialogDescription>
                          Set your working hours for each day of the week
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {WEEKDAYS.map((day, index) => {
                          const slot = availabilityForm[index] || {
                            day: day.key,
                            enabled: false,
                            startTime: "09:00",
                            endTime: "17:00",
                          };
                          return (
                            <div
                              key={day.key}
                              className="space-y-3 p-3 rounded-lg border border-color-border/50"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={slot.enabled}
                                  onChange={(e) => {
                                    const newForm = [...availabilityForm];
                                    newForm[index] = {
                                      ...slot,
                                      enabled: e.target.checked,
                                    };
                                    setAvailabilityForm(newForm);
                                  }}
                                  className="rounded border-color-border focus:ring-color-primary/20"
                                />
                                <span className="font-medium text-color-text-primary">
                                  {day.label}
                                </span>
                              </div>
                              {slot.enabled && (
                                <div className="flex items-center gap-3 ml-6">
                                  <Input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => {
                                      const newForm = [...availabilityForm];
                                      newForm[index] = {
                                        ...slot,
                                        startTime: e.target.value,
                                      };
                                      setAvailabilityForm(newForm);
                                    }}
                                    className="w-32"
                                  />
                                  <span className="text-color-text-secondary">
                                    to
                                  </span>
                                  <Input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => {
                                      const newForm = [...availabilityForm];
                                      newForm[index] = {
                                        ...slot,
                                        endTime: e.target.value,
                                      };
                                      setAvailabilityForm(newForm);
                                    }}
                                    className="w-32"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setEditAvailabilityOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={updateAvailability} disabled={loading}>
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {WEEKDAYS.map((day, index) => {
                    const slot = availabilityForm[index] || {
                      day: day.key,
                      enabled: false,
                      startTime: "09:00",
                      endTime: "17:00",
                    };
                    return (
                      <div
                        key={day.key}
                        className="flex items-center justify-between p-3 rounded-lg border border-color-border/50 bg-color-surface/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              slot.enabled
                                ? "bg-color-success/10"
                                : "bg-color-accent/10"
                            }`}
                          >
                            <Clock
                              className={`h-4 w-4 ${
                                slot.enabled
                                  ? "text-color-success"
                                  : "text-color-text-secondary"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {day.label}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {slot.enabled
                                ? `${slot.startTime} - ${slot.endTime}`
                                : "Not available"}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slot.enabled
                              ? "bg-color-success/10 text-color-success"
                              : "bg-color-accent/10 text-color-text-secondary"
                          }`}
                        >
                          {slot.enabled ? "Available" : "Unavailable"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses Section */}
          {activeSection === "addresses" && (
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-color-text-primary">
                      Service Locations
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      Manage your service locations
                    </CardDescription>
                  </div>
                  <Dialog
                    open={addAddressOpen}
                    onOpenChange={setAddAddressOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Service Location</DialogTitle>
                        <DialogDescription>
                          Add a new location where you provide services
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="address_label">Label</Label>
                            <select
                              id="address_label"
                              value={newAddressForm.label}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({
                                  ...prev,
                                  label: e.target.value,
                                }))
                              }
                              className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <select
                              id="country"
                              value={newAddressForm.country}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="street_address">Street Address</Label>
                          <Input
                            id="street_address"
                            value={newAddressForm.street_address}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({
                                ...prev,
                                street_address: e.target.value,
                              }))
                            }
                            placeholder="Enter street address"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newAddressForm.city}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="region">Region</Label>
                            <Input
                              id="region"
                              value={newAddressForm.region}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({
                                  ...prev,
                                  region: e.target.value,
                                }))
                              }
                              placeholder="Enter region"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={newAddressForm.postal_code}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({
                                ...prev,
                                postal_code: e.target.value,
                              }))
                            }
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAddAddressOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addAddress} disabled={loading}>
                          {loading ? "Adding..." : "Add Location"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MapPinIcon className="h-8 w-8 text-color-text-secondary" />
                    </div>
                    <h3 className="font-semibold text-color-text-primary mb-2">
                      No service locations
                    </h3>
                    <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
                      Add locations where you provide your services to help
                      customers find you
                    </p>
                    <Button onClick={() => setAddAddressOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-color-border/50 bg-color-surface/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-color-text-primary capitalize">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-color-primary/10 text-color-primary px-2 py-1 rounded-full font-medium">
                                Default
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            address.id && deleteAddress(address.id)
                          }
                          className="text-color-error hover:text-color-error hover:bg-color-error/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Section */}
          {activeSection === "payment" && (
            <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-color-text-primary">
                      Payment Methods
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      Manage your payment methods and billing information
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-color-text-secondary" />
                  </div>
                  <h3 className="font-semibold text-color-text-primary mb-2">
                    No payment methods
                  </h3>
                  <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
                    Add payment methods to receive payments for your services
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
