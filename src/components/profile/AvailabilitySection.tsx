"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { TaskerProfile, AvailabilitySlot } from "@/types/supabase";
import { updateTaskerAvailability } from "@/actions/profile";

interface AvailabilitySectionProps {
  taskerProfile: TaskerProfile | null;
  loading: boolean;
  onProfileUpdate: (updatedProfile: TaskerProfile) => void;
  onProfileRefresh: () => Promise<void>;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function AvailabilitySection({
  taskerProfile,
  loading,
  onProfileUpdate,
  onProfileRefresh,
  missingFields,
}: AvailabilitySectionProps) {
  const [editAvailabilityOpen, setEditAvailabilityOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilitySlot[]>(
    []
  );

  // Update form when profile changes
  useEffect(() => {
    if (taskerProfile) {
      setAvailabilityForm(taskerProfile.operation_hours || []);
    }
  }, [taskerProfile]);

  // Get missing fields for this section
  const availabilityMissingFields = missingFields.filter(
    (field) => field.section === "availability"
  );

  const updateAvailability = async () => {
    // Validate that at least one day is enabled
    const enabledDays = availabilityForm.filter((slot) => slot.enabled);
    if (enabledDays.length === 0) {
      toast.error("Please enable at least one day of availability");
      return;
    }

    // Validate time format for enabled days
    for (const slot of enabledDays) {
      if (!slot.startTime || !slot.endTime) {
        toast.error("Please set start and end times for all enabled days");
        return;
      }

      // Validate that end time is after start time
      if (slot.startTime >= slot.endTime) {
        toast.error("End time must be after start time");
        return;
      }
    }

    // Check if we have a valid tasker profile
    if (!taskerProfile?.id) {
      toast.error("Profile not found. Please refresh the page and try again.");
      return;
    }

    try {
      const result = await updateTaskerAvailability(
        taskerProfile.id,
        availabilityForm
      );

      if (result.success && result.taskerProfile) {
        onProfileUpdate(result.taskerProfile);
        await onProfileRefresh(); // Refresh profile data
        toast.success("Availability updated successfully");
        setEditAvailabilityOpen(false);
      } else {
        toast.error(result.error || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                Availability
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                Set your working hours and availability
              </CardDescription>
            </div>
          </div>
          {availabilityMissingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
              <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
              <span className="text-sm font-medium text-[var(--color-error)]">
                {availabilityMissingFields.length} missing
              </span>
            </div>
          )}
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
                          <span className="text-color-text-secondary">to</span>
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
  );
}
