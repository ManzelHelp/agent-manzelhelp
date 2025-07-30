import { useState, useEffect, useCallback, useMemo } from "react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import type {
  AvailabilitySlot,
  TaskerProfile,
  Address,
  ExperienceLevel,
} from "@/types/supabase";

export function useTaskerProfile() {
  const { user, setUser } = useUserStore();

  // Core state
  const [loading, setLoading] = useState(false);
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  // Update functions
  const updatePersonalInfo = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth: string;
  }) => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update personal information");
    } else {
      setUser({ ...user, ...data });
      toast.success("Personal information updated successfully");
    }
    setLoading(false);
  };

  const updateBioInfo = async (data: {
    bio: string;
    experience_level: ExperienceLevel;
    service_radius_km: number;
  }) => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to update bio information");
    } else {
      setTaskerProfile((prev) => (prev ? { ...prev, ...data } : null));
      toast.success("Bio information updated successfully");
    }
    setLoading(false);
  };

  const updateAvailability = async (availabilityForm: AvailabilitySlot[]) => {
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

  const addAddress = async (address: Omit<Address, "id" | "user_id">) => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("addresses").insert([
      {
        ...address,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      toast.error("Failed to add address");
    } else {
      toast.success("Address added successfully");
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
  const getMissingFields = useCallback(() => {
    if (!user || !taskerProfile) return [];

    const missingFields = [];

    // Personal Information Section
    if (!user.avatar_url) {
      missingFields.push({
        id: "profile_photo",
        label: "Profile Photo",
        section: "personal" as const,
        icon: "Camera",
        description: "Add a professional profile photo to build trust",
        required: true,
      });
    }

    if (!user.first_name || !user.last_name) {
      missingFields.push({
        id: "full_name",
        label: "Full Name",
        section: "personal" as const,
        icon: "User",
        description: "Complete your name for better recognition",
        required: true,
      });
    }

    if (taskerProfile.verification_status !== "verified") {
      missingFields.push({
        id: "identity_verification",
        label: "Identity Verification",
        section: "personal" as const,
        icon: "BadgeCheck",
        description: "Verify your identity to increase trust",
        required: true,
      });
    }

    // Bio & Experience Section
    if (!taskerProfile.bio || taskerProfile.bio.trim().length === 0) {
      missingFields.push({
        id: "bio",
        label: "Bio & Experience",
        section: "bio" as const,
        icon: "FileText",
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
        section: "bio" as const,
        icon: "MapPin",
        description: "Define your service coverage area",
        required: true,
      });
    }

    return missingFields;
  }, [user, taskerProfile]);

  const missingFields = useMemo(() => getMissingFields(), [getMissingFields]);

  return {
    user,
    taskerProfile,
    addresses,
    loading,
    uploadingPhoto,
    missingFields,
    updatePersonalInfo,
    updateBioInfo,
    updateAvailability,
    handlePhotoUpload,
    addAddress,
    deleteAddress,
    fetchAddresses,
  };
}
