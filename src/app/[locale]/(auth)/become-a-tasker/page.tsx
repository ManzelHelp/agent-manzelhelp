"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import {
  becomeTaskerAction,
  getCurrentUserRole,
  type BecomeTaskerFormData,
} from "@/actions/become-tasker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
  Shield,
  Star,
  Loader2,
} from "lucide-react";
import type { ExperienceLevel } from "@/types/supabase";

export default function BecomeATaskerPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BecomeTaskerFormData>({
    experience_level: "beginner",
    bio: "",
    service_radius_km: 50,
    is_available: true,
    operation_hours: {
      monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    },
  });

  // Check user role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true);
      try {
        const { isTasker } = await getCurrentUserRole();

        if (isTasker) {
          toast.success("You are already a tasker!");
          router.push("/tasker/dashboard");
          return;
        }

        if (!user) {
          toast.error("Please log in to become a tasker");
          router.push("/login");
          return;
        }
      } catch {
        toast.error("Failed to check user status");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, router]);

  const handleInputChange = (
    field: keyof BecomeTaskerFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOperationHoursChange = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      operation_hours: {
        ...prev.operation_hours,
        [day]: {
          ...prev.operation_hours[day as keyof typeof prev.operation_hours],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await becomeTaskerAction(formData);

      if (result.success && result.user) {
        setUser(result.user);
        toast.success(
          "Congratulations! You are now a tasker. Your profile is under review."
        );
        router.push("/tasker/dashboard");
      } else {
        toast.error(result.errorMessage || "Failed to become a tasker");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const experienceLevels: {
    value: ExperienceLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to providing services professionally",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience in your field",
    },
    {
      value: "expert",
      label: "Expert",
      description: "Highly experienced and skilled",
    },
  ];

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Start Your Tasker Journey
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text">Become a Tasker</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join our community of skilled professionals and start earning by
              helping others. Complete your profile to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Experience Level */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Experience Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experienceLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.experience_level === level.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      handleInputChange("experience_level", level.value)
                    }
                  >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {level.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {level.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Professional Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="bio">
                  Tell us about yourself and your skills
                </Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Describe your experience, skills, and what services you can provide. This will help clients understand your expertise."
                  className="w-full min-h-[120px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-sm text-slate-500">
                  {formData.bio.length}/500 characters (minimum 50)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Radius */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="radius">Service radius (kilometers)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.service_radius_km}
                  onChange={(e) =>
                    handleInputChange(
                      "service_radius_km",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  required
                />
                <p className="text-sm text-slate-500">
                  How far are you willing to travel for jobs? (1-200 km)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) =>
                      handleInputChange("is_available", e.target.checked)
                    }
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="is_available">
                    I am currently available for new jobs
                  </Label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    Operating Hours
                  </h4>
                  {days.map((day) => (
                    <div
                      key={day.key}
                      className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        <input
                          type="checkbox"
                          checked={
                            formData.operation_hours[
                              day.key as keyof typeof formData.operation_hours
                            ].enabled
                          }
                          onChange={(e) =>
                            handleOperationHoursChange(
                              day.key,
                              "enabled",
                              e.target.checked
                            )
                          }
                          className="rounded border-slate-300"
                        />
                        <Label className="text-sm font-medium">
                          {day.label}
                        </Label>
                      </div>

                      {formData.operation_hours[
                        day.key as keyof typeof formData.operation_hours
                      ].enabled && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={
                              formData.operation_hours[
                                day.key as keyof typeof formData.operation_hours
                              ].startTime
                            }
                            onChange={(e) =>
                              handleOperationHoursChange(
                                day.key,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <span className="text-slate-500">to</span>
                          <Input
                            type="time"
                            value={
                              formData.operation_hours[
                                day.key as keyof typeof formData.operation_hours
                              ].endTime
                            }
                            onChange={(e) =>
                              handleOperationHoursChange(
                                day.key,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Submit */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">
                    Your profile will be reviewed before going live. This
                    usually takes 24-48 hours.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || formData.bio.length < 50}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift btn-modern"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Becoming a Tasker...
                    </>
                  ) : (
                    <>
                      Become a Tasker
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500">
                  By becoming a tasker, you agree to our terms of service and
                  privacy policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
