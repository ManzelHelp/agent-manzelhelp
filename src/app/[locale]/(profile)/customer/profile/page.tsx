"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
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

const SECTIONS = [
  {
    id: "personal" as ProfileSection,
    title: "Personal Information",
    icon: UserIcon,
    description: "Manage your basic profile details",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "addresses" as ProfileSection,
    title: "Addresses",
    icon: MapPin,
    description: "Manage your service locations",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "payment" as ProfileSection,
    title: "Payment Methods",
    icon: CreditCard,
    description: "Manage your payment info",
    color: "from-indigo-500 to-indigo-600",
  },
];

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

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

  // Redirect tasker users to their dashboard
  useEffect(() => {
    if (user?.role === "tasker") {
      router.replace("/tasker/profile");
    }
  }, [user?.role, router]);

  // Data fetching
  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await getCustomerProfileData(user.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.user) {
        setUser(result.user);
      }
      setAddresses(result.addresses);

      // Fetch profile completion stats
      const stats = await getCustomerProfileCompletion(user.id);
      setProfileStats(stats);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, setUser]);

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
  const getFieldDescription = useCallback((fieldId: string): string => {
    const descriptionMap: Record<string, string> = {
      profile_photo: "Add a profile photo to personalize your account",
      full_name: "Complete your name for better recognition",
      phone: "Add your phone number for contact purposes",
      address: "Add your address for service delivery",
    };
    return (
      descriptionMap[fieldId] || "Complete this field to improve your profile"
    );
  }, []);

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

  // Update personal info
  const updatePersonalInfo = async () => {
    if (!user?.id) return;

    setLoading(true);

    const result = await updateCustomerPersonalInfo(user.id, {
      first_name: personalInfo.first_name,
      last_name: personalInfo.last_name,
      phone: personalInfo.phone,
      date_of_birth: personalInfo.date_of_birth || undefined,
    });

    if (result.success && result.user) {
      setUser(result.user);
      toast.success("Profile updated successfully");
      setPersonalInfoDialogOpen(false);
      // Refresh profile data to update completion stats
      fetchProfileData();
    } else {
      toast.error(result.error || "Failed to update profile");
    }

    setLoading(false);
  };

  // Add address
  const addAddress = async () => {
    if (!user?.id || !newAddress.street_address || !newAddress.city) return;

    setLoading(true);

    const result = await addCustomerAddress(user.id, newAddress);

    if (result.success) {
      toast.success("Address added successfully");
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
      toast.error(result.error || "Failed to add address");
    }

    setLoading(false);
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    if (!user?.id) return;

    setLoading(true);

    const result = await deleteCustomerAddress(addressId, user.id);

    if (result.success) {
      toast.success("Address deleted successfully");
      // Refresh profile data to update completion stats
      fetchProfileData();
    } else {
      toast.error(result.error || "Failed to delete address");
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
            Not Logged In
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Please log in to access your profile
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
                Profile Settings
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Manage your account information and preferences
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
                      Profile Completion
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      {profileStats.completionPercentage === 100
                        ? "Your profile is complete! 🎉"
                        : `${
                            profileStats.missingFields.filter((f) => f.required)
                              .length
                          } required fields remaining`}
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
                    {profileStats.completionPercentage}% complete
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
                  Navigation
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
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
                <nav className="space-y-2">
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
                {SECTIONS.map((section) => {
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
                      Personal Information
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      Manage your basic profile details
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPersonalInfoDialogOpen(true)}
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
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
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)]">
                      Profile Photo
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Add a profile photo to personalize your account
                    </p>
                  </div>
                </div>

                {/* Personal Info Display */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      First Name
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.first_name || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      Last Name
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.last_name || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      Email
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      Phone Number
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-[var(--color-text-secondary)] text-sm font-medium">
                      Date of Birth
                    </Label>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {user.date_of_birth
                        ? new Date(user.date_of_birth).toLocaleDateString()
                        : "Not provided"}
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
                      Addresses
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      Manage your service locations
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddressForm(true)}
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 && !showNewAddressForm && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                    <h3 className="font-medium mb-2 text-[var(--color-text-primary)]">
                      No Addresses Added
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      Add your first address to get started
                    </p>
                    <Button
                      onClick={() => setShowNewAddressForm(true)}
                      className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Address
                    </Button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <Card className="border-2 border-dashed border-[var(--color-border)] bg-[var(--color-accent)]/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[var(--color-text-primary)]">
                          Add New Address
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
                            Label
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
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-[var(--color-text-primary)]"
                          >
                            Country
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
                            Street Address *
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
                            placeholder="Enter street address"
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-[var(--color-text-primary)]"
                          >
                            City *
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
                            placeholder="Enter city"
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="region"
                            className="text-[var(--color-text-primary)]"
                          >
                            Region *
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
                            placeholder="Enter region"
                            className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="postal_code"
                            className="text-[var(--color-text-primary)]"
                          >
                            Postal Code
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
                            placeholder="Enter postal code"
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
                          {loading ? "Saving..." : "Save Address"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAddressForm(false)}
                          className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                        >
                          Cancel
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
                                Default
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
                      Payment Methods
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      Manage your payment information
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--color-border)] hover:bg-[var(--color-primary)]/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Balance */}
                <div className="p-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Wallet Balance</h3>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {user.wallet_balance
                      ? `${user.wallet_balance} MAD`
                      : "0 MAD"}
                  </div>
                  <p className="text-sm opacity-90">
                    Available for payments and refunds
                  </p>
                </div>

                {/* Payment Methods Placeholder */}
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                  <h3 className="font-medium mb-2 text-[var(--color-text-primary)]">
                    No Payment Methods
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    Add a payment method to make purchases
                  </p>
                  <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Payment Method
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
              Edit Personal Information
            </DialogTitle>
            <DialogDescription>
              Update your personal information. Fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_first_name"
                  className="text-[var(--color-text-primary)]"
                >
                  First Name *
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
                  placeholder="Enter your first name"
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_last_name"
                  className="text-[var(--color-text-primary)]"
                >
                  Last Name *
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
                  placeholder="Enter your last name"
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_email"
                  className="text-[var(--color-text-primary)]"
                >
                  Email
                </Label>
                <Input
                  id="dialog_email"
                  type="email"
                  value={personalInfo.email}
                  disabled={true}
                  className="bg-[var(--color-accent)]/30 border-[var(--color-border)]"
                />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dialog_phone"
                  className="text-[var(--color-text-primary)]"
                >
                  Phone Number
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
                  placeholder="Enter your phone number"
                  className="border-[var(--color-border)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="dialog_date_of_birth"
                  className="text-[var(--color-text-primary)]"
                >
                  Date of Birth
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
              Cancel
            </Button>
            <Button
              onClick={updatePersonalInfo}
              disabled={loading}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
