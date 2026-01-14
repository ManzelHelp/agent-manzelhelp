"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { Edit, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { availabilityFormSchema } from "@/lib/schemas/profile";
import type { TaskerProfile, AvailabilitySlot } from "@/types/supabase";
import { updateTaskerAvailability } from "@/actions/profile";
import { convertOperationHoursToSlots } from "@/lib/availability-utils";

interface AvailabilitySectionProps {
  taskerProfile: TaskerProfile | null;
  loading: boolean;
  onProfileUpdate: (updatedProfile: TaskerProfile) => void;
  onProfileRefresh: () => Promise<void>;
  missingFields: any[];
}

export default function AvailabilitySection({
  taskerProfile,
  loading,
  onProfileUpdate,
  onProfileRefresh,
  missingFields,
}: AvailabilitySectionProps) {
  // On utilise "profile" comme namespace pour correspondre au fichier profile.json
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  // Utilisation des clés de traduction pour les jours
  const weekdays = [
    { key: "monday", label: t("days.monday") },
    { key: "tuesday", label: t("days.tuesday") },
    { key: "wednesday", label: t("days.wednesday") },
    { key: "thursday", label: t("days.thursday") },
    { key: "friday", label: t("days.friday") },
    { key: "saturday", label: t("days.saturday") },
    { key: "sunday", label: t("days.sunday") },
  ];

  const [editAvailabilityOpen, setEditAvailabilityOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (taskerProfile) {
      const validSlots = convertOperationHoursToSlots(taskerProfile.operation_hours);
      setAvailabilityForm(validSlots);
    }
  }, [taskerProfile]);

  const availabilityMissingFields = missingFields.filter(
    (field) => field.section === "availability"
  );

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = availabilityFormSchema.safeParse(availabilityForm);
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: tCommon("error"), // Utilisation de common
        description: validation.error.issues[0].message,
      });
      return;
    }

    if (!taskerProfile?.id) return;

    try {
      const result = await updateTaskerAvailability(taskerProfile.id, availabilityForm);

      if (result.success && result.taskerProfile) {
        onProfileUpdate(result.taskerProfile);
        await onProfileRefresh();
        toast({
          variant: "success",
          title: t("success.genericSuccess"),
          description: t("success.availabilityUpdated"),
        });
        setEditAvailabilityOpen(false);
      } else {
        toast({ variant: "destructive", description: t("availability.errors.updateFailed") });
      }
    } catch (error) {
      toast({ variant: "destructive", description: tCommon("unknown") });
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm dark:bg-slate-900/50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/20">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                {t("availability.title")}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                {t("availability.setWorkingHours")}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {availabilityMissingFields.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500">
                  {t("availability.incomplete")}
                </span>
              </div>
            )}
            
            <Dialog open={editAvailabilityOpen} onOpenChange={setEditAvailabilityOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="dark:border-slate-700 dark:hover:bg-slate-800">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("actions.edit")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
                <form onSubmit={handleUpdateAvailability} noValidate className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">{t("availability.editAvailability")}</DialogTitle>
                    <DialogDescription className="dark:text-slate-400">
                      {t("availability.description")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {weekdays.map((day, index) => {
                      const slot = availabilityForm[index] || { day: day.key, enabled: false, startTime: "09:00", endTime: "17:00" };
                      return (
                        <div key={day.key} className="p-3 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={slot.enabled}
                              onChange={(e) => {
                                const newForm = [...availabilityForm];
                                newForm[index] = { ...slot, enabled: e.target.checked };
                                setAvailabilityForm(newForm);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <Label className="font-semibold text-sm cursor-pointer dark:text-slate-200">{day.label}</Label>
                          </div>
                          
                          {slot.enabled && (
                            <div className="flex items-center gap-2 ml-7">
                              <Input 
                                type="time" 
                                value={slot.startTime} 
                                onChange={(e) => {
                                  const newForm = [...availabilityForm];
                                  newForm[index] = { ...slot, startTime: e.target.value };
                                  setAvailabilityForm(newForm);
                                }}
                                className="h-9"
                              />
                              <span className="text-xs text-slate-400">{t("availability.to")}</span>
                              <Input 
                                type="time" 
                                value={slot.endTime} 
                                onChange={(e) => {
                                  const newForm = [...availabilityForm];
                                  newForm[index] = { ...slot, endTime: e.target.value };
                                  setAvailabilityForm(newForm);
                                }}
                                className="h-9"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <DialogFooter className="pt-4 gap-2">
                    <Button type="button" variant="ghost" onClick={() => setEditAvailabilityOpen(false)}>
                      {tCommon("cancel")}
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                      {loading ? tCommon("saving") : t("actions.save")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {weekdays.map((day, index) => {
            const slot = availabilityForm[index];
            const isEnabled = slot?.enabled;
            return (
              <div 
                key={day.key} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isEnabled 
                    ? "bg-white dark:bg-slate-800 border-purple-100 dark:border-purple-900/50 shadow-sm" 
                    : "bg-slate-50/50 dark:bg-slate-800/20 border-transparent opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isEnabled 
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                  }`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isEnabled ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                      {day.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {isEnabled ? `${slot.startTime} - ${slot.endTime}` : t("availability.notAvailable")}
                    </p>
                  </div>
                </div>
                {isEnabled && <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}