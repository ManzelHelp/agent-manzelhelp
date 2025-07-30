"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  ProfileNavigation,
  type ProfileSection,
} from "@/components/profile/ProfileNavigation";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { useTaskerProfile } from "@/hooks/useTaskerProfile";
import { User, FileText, Clock, MapPin, CreditCard } from "lucide-react";

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
  const {
    user,
    taskerProfile,
    loading,
    uploadingPhoto,
    missingFields,
    updatePersonalInfo,
    handlePhotoUpload,
  } = useTaskerProfile();

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is logged in
  if (!user) {
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

        {/* Navigation */}
        <ProfileNavigation
          sections={SECTIONS}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          missingFields={missingFields}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Content */}
        <div className="space-y-6">
          {/* Personal Information Section */}
          {activeSection === "personal" && (
            <PersonalInfoSection
              user={user}
              taskerProfile={taskerProfile}
              onUpdate={updatePersonalInfo}
              onPhotoUpload={handlePhotoUpload}
              uploadingPhoto={uploadingPhoto}
              loading={loading}
            />
          )}

          {/* Bio & Experience Section */}
          {activeSection === "bio" && (
            <div className="text-center py-12">
              <p className="text-color-text-secondary">
                Bio & Experience section - Component to be created
              </p>
            </div>
          )}

          {/* Availability Section */}
          {activeSection === "availability" && (
            <div className="text-center py-12">
              <p className="text-color-text-secondary">
                Availability section - Component to be created
              </p>
            </div>
          )}

          {/* Addresses Section */}
          {activeSection === "addresses" && (
            <div className="text-center py-12">
              <p className="text-color-text-secondary">
                Addresses section - Component to be created
              </p>
            </div>
          )}

          {/* Payment Section */}
          {activeSection === "payment" && (
            <div className="text-center py-12">
              <p className="text-color-text-secondary">
                Payment section - Component to be created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
