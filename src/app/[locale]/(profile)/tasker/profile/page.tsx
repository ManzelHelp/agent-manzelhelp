"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskerProfile, Address } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  BadgeCheck,
  ChevronDown,
  Menu,
  AlertTriangle,
  Camera,
  Settings,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import BioExperienceSection from "@/components/profile/BioExperienceSection";
import AvailabilitySection from "@/components/profile/AvailabilitySection";
import AddressesSection from "@/components/profile/AddressesSection";

import PaymentSection from "@/components/profile/PaymentSection";

type ProfileSection =
  | "personal"
  | "bio"
  | "availability"
  | "addresses"
  | "payment";

interface MissingField {
  id: string;
  label: string;
  section: ProfileSection;
  icon: React.ReactNode;
  description: string;
  required: boolean;
}

const SECTIONS = [
  {
    id: "personal" as ProfileSection,
    title: "Personal Information",
    icon: User,
    description: "Manage your basic profile details",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "bio" as ProfileSection,
    title: "Bio & Experience",
    icon: FileText,
    description: "Tell customers about your skills",
    color: "from-green-500 to-green-600",
  },
  {
    id: "availability" as ProfileSection,
    title: "Availability",
    icon: Clock,
    description: "Set your working hours",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "addresses" as ProfileSection,
    title: "Service Locations",
    icon: MapPin,
    description: "Manage your service areas",
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

export default function TaskerProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  // Core state
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [loading, setLoading] = useState(false);
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect customer users to their dashboard
  useEffect(() => {
    if (user?.role === "customer") {
      router.replace("/customer/profile");
    }
  }, [user?.role, router]);

  // Data fetching
  const fetchTaskerData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("tasker_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching tasker data:", error);
        toast.error("Failed to load profile data");
        return;
      }

      if (profile) {
        setTaskerProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching tasker data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses");
        return;
      }

      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    }
  }, [user?.id]);

  // Effects - fetch data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchTaskerData();
      fetchAddresses();
    }
  }, [user?.id, fetchTaskerData, fetchAddresses]);

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

  // Memoized computed values for performance
  const missingFields = useMemo(() => getMissingFields(), [getMissingFields]);

  // Loading state
  if (loading && !taskerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
            Loading Profile
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            Please wait while we load your profile data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Enhanced Header Section */}
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
                      className={`flex flex-col items-center gap-3 p-4 text-center transition-all duration-200 rounded-xl ${
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
            <PersonalInfoSection
              user={user}
              loading={loading}
              onUserUpdate={setUser}
              missingFields={missingFields}
            />
          )}

          {/* Bio & Experience Section */}
          {activeSection === "bio" && (
            <BioExperienceSection
              taskerProfile={taskerProfile}
              loading={loading}
              onProfileUpdate={setTaskerProfile}
              missingFields={missingFields}
            />
          )}

          {/* Availability Section */}
          {activeSection === "availability" && (
            <AvailabilitySection
              taskerProfile={taskerProfile}
              loading={loading}
              onProfileUpdate={setTaskerProfile}
              missingFields={missingFields}
            />
          )}

          {/* Addresses Section */}
          {activeSection === "addresses" && (
            <AddressesSection
              addresses={addresses}
              loading={loading}
              onAddressesUpdate={setAddresses}
              missingFields={missingFields}
            />
          )}

          {/* Payment Section */}
          {activeSection === "payment" && (
            <PaymentSection missingFields={missingFields} />
          )}
        </div>
      </div>
    </div>
  );
}
