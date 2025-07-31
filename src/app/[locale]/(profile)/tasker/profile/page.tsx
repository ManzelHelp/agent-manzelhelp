"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskerProfile, Address, TaskerService } from "@/types/supabase";
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
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import BioExperienceSection from "@/components/profile/BioExperienceSection";
import AvailabilitySection from "@/components/profile/AvailabilitySection";
import AddressesSection from "@/components/profile/AddressesSection";
import ServicesSection from "@/components/profile/ServicesSection";
import PaymentSection from "@/components/profile/PaymentSection";

type ProfileSection =
  | "personal"
  | "bio"
  | "availability"
  | "addresses"
  | "services"
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
  },
  { id: "bio" as ProfileSection, title: "Bio & Experience", icon: FileText },
  { id: "availability" as ProfileSection, title: "Availability", icon: Clock },
  {
    id: "addresses" as ProfileSection,
    title: "Service Locations",
    icon: MapPin,
  },
  {
    id: "services" as ProfileSection,
    title: "My Services",
    icon: FileText,
  },
  {
    id: "payment" as ProfileSection,
    title: "Payment Methods",
    icon: CreditCard,
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
  const [taskerServices, setTaskerServices] = useState<TaskerService[]>([]);
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

  const fetchTaskerServices = useCallback(async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasker_services")
        .select(
          `
          *,
          service:services(*),
          category:services(service_categories(*))
        `
        )
        .eq("tasker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasker services:", error);
        // Don't show error toast for empty results
        if (error.code !== "PGRST116") {
          toast.error("Failed to load services");
        }
        return;
      }

      setTaskerServices(data || []);
    } catch (error) {
      console.error("Error fetching tasker services:", error);
      toast.error("Failed to load services");
    }
  }, [user?.id]);

  // Effects - fetch data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchTaskerData();
      fetchAddresses();
      fetchTaskerServices();
    }
  }, [user?.id, fetchTaskerData, fetchAddresses, fetchTaskerServices]);

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
      <div className="min-h-screen bg-gradient-to-br from-color-bg via-color-surface to-color-bg/50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-color-primary border-t-transparent" />
          </div>
          <h3 className="font-semibold text-color-text-primary mb-2">
            Loading Profile
          </h3>
          <p className="text-color-text-secondary">
            Please wait while we load your profile data
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

          {/* Services Section */}
          {activeSection === "services" && (
            <ServicesSection
              taskerServices={taskerServices}
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
