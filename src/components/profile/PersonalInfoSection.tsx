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
  CheckCircle,
  BadgeCheck,
  Edit,
  Camera,
  Mail,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import type { User as UserType, TaskerProfile } from "@/types/supabase";

interface PersonalInfoSectionProps {
  user: UserType;
  taskerProfile: TaskerProfile | null;
  onUpdate: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth: string;
  }) => Promise<void>;
  onPhotoUpload: (file: File) => Promise<void>;
  uploadingPhoto: boolean;
  loading: boolean;
}

export function PersonalInfoSection({
  user,
  taskerProfile,
  onUpdate,
  onPhotoUpload,
  uploadingPhoto,
  loading,
}: PersonalInfoSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    date_of_birth: user.date_of_birth || "",
  });

  const handleSubmit = async () => {
    await onUpdate(form);
    setEditOpen(false);
  };

  const missingFields = [];
  if (!user.avatar_url) {
    missingFields.push({
      id: "profile_photo",
      label: "Profile Photo",
      icon: <Camera className="h-4 w-4" />,
      description: "Add a professional profile photo to build trust",
      required: true,
    });
  }
  if (!user.first_name || !user.last_name) {
    missingFields.push({
      id: "full_name",
      label: "Full Name",
      icon: <User className="h-4 w-4" />,
      description: "Complete your name for better recognition",
      required: true,
    });
  }
  if (taskerProfile?.verification_status !== "verified") {
    missingFields.push({
      id: "identity_verification",
      label: "Identity Verification",
      icon: <BadgeCheck className="h-4 w-4" />,
      description: "Verify your identity to increase trust",
      required: true,
    });
  }

  return (
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
          {missingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
              <AlertTriangle className="h-4 w-4 text-color-error" />
              <span className="text-sm font-medium text-color-error">
                {missingFields.length} missing
              </span>
            </div>
          )}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
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
                      {user.avatar_url ? (
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
                        if (file) onPhotoUpload(file);
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
                      {user.avatar_url
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
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((prev) => ({
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
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((prev) => ({
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
                      value={user.email || ""}
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
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({
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
                      value={form.date_of_birth}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          date_of_birth: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
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
            <p className="text-sm text-color-text-secondary">{user.email}</p>
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
                  <p className="font-medium text-color-text-primary">Email</p>
                  <p className="text-sm text-color-text-secondary">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.email_verified ? (
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
                    <span className="text-xs font-medium">Verified</span>
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
  );
}
