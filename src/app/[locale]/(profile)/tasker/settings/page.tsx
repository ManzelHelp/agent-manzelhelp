"use client";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Bell,
  Palette,
  Mail,
  CheckCircle,
  Clock,
  Edit,
  Zap,
} from "lucide-react";
import { useState } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/supabase/client";
import { useUserStore } from "@/stores/userStore";
import type { OperationHours } from "@/types/supabase";
import { toast } from "sonner";

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const defaultAvailability: OperationHours[] = WEEKDAYS.map((d) => ({
  day: d.key,
  enabled: false,
  startTime: "09:00",
  endTime: "17:00",
}));

export default function SettingsPage() {
  const t = useTranslations("taskerProfile");
  const [activeSection, setActiveSection] = useState("security");
  type NotificationKey = "email" | "push" | "sms" | "marketing" | "jobAlerts";
  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    email: true,
    push: false,
    sms: false,
    marketing: false,
    jobAlerts: true,
  });

  const { user } = useUserStore();
  const [availability, setAvailability] =
    useState<OperationHours[]>(defaultAvailability);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Store the original availability for canceling edits
  const [originalAvailability, setOriginalAvailability] =
    useState<OperationHours[]>(defaultAvailability);

  // Fetch availability from profile
  React.useEffect(() => {
    async function fetchAvailability() {
      if (!user?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasker_profiles")
        .select("operation_hours")
        .eq("id", user.id)
        .single();

      if (
        !error &&
        data?.operation_hours &&
        Array.isArray(data.operation_hours)
      ) {
        setAvailability(data.operation_hours);
        setOriginalAvailability(data.operation_hours);
      }
    }
    fetchAvailability();
  }, [user?.id]);

  const updateAvailability = (
    dayIndex: number,
    field: keyof OperationHours,
    value: string | boolean
  ) => {
    setAvailability((prev) =>
      prev.map((slot, index) =>
        index === dayIndex ? { ...slot, [field]: value } : slot
      )
    );
  };

  const saveAvailability = async () => {
    if (!user?.id) return;
    setLoadingAvailability(true);
    const supabase = createClient();

    const { error } = await supabase.from("tasker_profiles").upsert({
      id: user.id,
      operation_hours: availability,
      updated_at: new Date().toISOString(),
    });

    setLoadingAvailability(false);

    if (!error) {
      toast.success(
        t("success.availabilityUpdated") || "Availability updated successfully"
      );
      setOriginalAvailability(availability); // Update the original state
      setIsEditingAvailability(false);
    } else {
      toast.error(t("errors.updateProfile") || "Failed to update availability");
      console.error("Error updating availability:", error);
    }
  };

  const handleToggle = (key: NotificationKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { id: "security", title: t("sections.security") },
    { id: "notifications", title: t("sections.notifications") },
    { id: "preferences", title: t("sections.preferences") },
    { id: "availability", title: t("sections.availability") },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors hover:bg-accent rounded-lg ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Security Section */}
          {activeSection === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("sections.security")}
                </CardTitle>
                <CardDescription>{t("security.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sign-in Methods */}
                <div className="space-y-4">
                  <h3 className="font-medium">{t("security.signInMethods")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("security.emailPassword")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            user@email.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm">
                          {t("security.change")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Password */}
                <div className="space-y-4">
                  <h3 className="font-medium">{t("security.password")}</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {t("security.passwordTitle")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("security.passwordDescription")}
                      </p>
                    </div>
                    <Button variant="outline">
                      {t("security.changePassword")}
                    </Button>
                  </div>
                </div>
                {/* Account Deactivation */}
                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">
                    {t("security.dangerZone")}
                  </h3>
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {t("security.deactivateAccount")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("security.deactivateDescription")}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        {t("security.deactivate")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("sections.notifications")}
                </CardTitle>
                <CardDescription>
                  {t("notifications.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {(
                    [
                      {
                        key: "email",
                        title: t("notifications.email"),
                        description: t("notifications.emailDescription"),
                      },
                      {
                        key: "push",
                        title: t("notifications.push"),
                        description: t("notifications.pushDescription"),
                      },
                      {
                        key: "sms",
                        title: t("notifications.sms"),
                        description: t("notifications.smsDescription"),
                      },
                      {
                        key: "marketing",
                        title: t("notifications.marketing"),
                        description: t("notifications.marketingDescription"),
                      },
                      {
                        key: "jobAlerts",
                        title: t("notifications.jobAlerts"),
                        description: t("notifications.jobAlertsDescription"),
                      },
                    ] as {
                      key: NotificationKey;
                      title: string;
                      description: string;
                    }[]
                  ).map((notification) => (
                    <div
                      key={notification.key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                          notifications[notification.key]
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                        onClick={() => handleToggle(notification.key)}
                        aria-pressed={notifications[notification.key]}
                        aria-label={`Toggle ${notification.title}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            notifications[notification.key]
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t("sections.preferences")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("preferences.language")}
                    </Label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("preferences.timezone")}
                    </Label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="GMT">GMT (Greenwich Mean Time)</option>
                      <option value="CET">CET (Central European Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("preferences.currency")}
                    </Label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="MAD">MAD (Moroccan Dirham)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Availability Section */}
          {activeSection === "availability" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t("sections.availability")}
                    </CardTitle>
                    <CardDescription>
                      {t("availability.description") ||
                        "Set your weekly working hours for bookings."}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingAvailability((v) => !v)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditingAvailability
                      ? t("actions.cancel")
                      : t("actions.edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {WEEKDAYS.map((day, index) => {
                    const slot = availability[index];
                    return (
                      <div
                        key={day.key}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="w-24">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={slot.enabled}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                              disabled={!isEditingAvailability}
                              className="rounded"
                            />
                            <span className="font-medium text-sm">
                              {day.label}
                            </span>
                          </label>
                        </div>
                        {slot.enabled && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={!isEditingAvailability}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              disabled={!isEditingAvailability}
                              className="w-32"
                            />
                          </div>
                        )}
                        {!slot.enabled && (
                          <span className="text-muted-foreground text-sm">
                            {t("availability.unavailable") || "Unavailable"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {t("availability.quickBookingTitle") || "Quick Booking"}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {t("availability.quickBookingDescription") ||
                          "Set your hours for faster bookings."}
                      </p>
                    </div>
                  </div>
                </div>
                {isEditingAvailability && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={saveAvailability}
                      disabled={loadingAvailability}
                    >
                      {loadingAvailability
                        ? t("actions.saving")
                        : t("actions.save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAvailability(originalAvailability);
                        setIsEditingAvailability(false);
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
