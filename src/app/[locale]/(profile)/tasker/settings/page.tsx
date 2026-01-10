"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Bell,
  Mail,
  CheckCircle,
  ChevronRight,
  Settings,
  User,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { useUserStore } from "@/stores/userStore";
import { getUserProfileAction } from "@/actions/auth";
import { BackButton } from "@/components/ui/BackButton";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");
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

  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  // Load user profile if not in store
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        try {
          setLoading(true);
          const result = await getUserProfileAction();
          if (result.success && result.user) {
            setUser(result.user);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadUserProfile();
  }, [user, setUser]);

  const handleToggle = (key: NotificationKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      id: "security",
      title: t("securityAndPrivacy"),
      icon: Shield,
      description: t("manageAccountSecurity"),
    },
    {
      id: "notifications",
      title: t("notifications"),
      icon: Bell,
      description: t("chooseNotifications"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-color-bg to-color-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-color-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-color-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-color-text-primary">
                {t("settings", { default: "Settings" })}
              </h1>
              <p className="text-color-text-secondary mt-1">
                {t("manageAccountPreferences", { default: "Manage your account preferences and security" })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 touch-target ${
                      activeSection === section.id
                        ? "border-color-primary bg-color-primary/5 text-color-primary shadow-lg"
                        : "border-color-border bg-color-surface text-color-text-secondary hover:border-color-primary/50 hover:text-color-text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="space-y-2 sticky top-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                      activeSection === section.id
                        ? "bg-color-primary text-color-surface shadow-lg"
                        : "text-color-text-secondary hover:bg-color-accent/50 hover:text-color-text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{section.title}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          activeSection === section.id
                            ? "text-color-surface/80"
                            : "text-color-text-secondary"
                        }`}
                      >
                        {section.description}
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        activeSection === section.id
                          ? "rotate-90"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="space-y-6">
              {/* Security Section */}
              {activeSection === "security" && (
                <div className="space-y-6">
                  <Card className="border-color-border bg-color-surface shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-color-text-primary">
                        <div className="p-2 bg-color-primary/10 rounded-lg">
                          <Shield className="h-5 w-5 text-color-primary" />
                        </div>
                        {t("securityAndPrivacy")}
                      </CardTitle>
                      <CardDescription className="text-color-text-secondary">
                        {t("manageAccountSecurity")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Sign-in Methods */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-color-text-primary flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t("signInMethods")}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-color-border rounded-xl bg-color-surface hover:bg-color-accent/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-color-success/10 rounded-lg">
                                <Mail className="h-4 w-4 text-color-success" />
                              </div>
                              <div>
                                <p className="font-medium text-color-text-primary">
                                  {t("email")}
                                </p>
                                <p className="text-sm text-color-text-secondary">
                                  {user?.email || "user@email.com"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-color-success" />
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-color-border hover:bg-color-primary hover:text-color-surface touch-target"
                              >
                                {t("change")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-color-text-primary flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t("password")}
                        </h3>
                        <div className="flex items-center justify-between p-4 border border-color-border rounded-xl bg-color-surface hover:bg-color-accent/30 transition-colors">
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {t("password")}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {t("useStrongPassword")}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-color-border hover:bg-color-primary hover:text-color-surface touch-target"
                          >
                            {t("changePassword")}
                          </Button>
                        </div>
                      </div>

                      {/* Account Deactivation */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-color-error flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {t("dangerZone")}
                        </h3>
                        <div className="p-4 border border-color-error/20 rounded-xl bg-color-error/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-color-error">
                                {t("deactivateAccount")}
                              </p>
                              <p className="text-sm text-color-text-secondary">
                                {t("deactivateDescription")}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-color-error hover:bg-color-error/90 touch-target"
                            >
                              {t("deactivate")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card className="border-color-border bg-color-surface shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-color-text-primary">
                      <div className="p-2 bg-color-primary/10 rounded-lg">
                        <Bell className="h-5 w-5 text-color-primary" />
                      </div>
                      {t("notifications")}
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      {t("chooseNotifications")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(
                      [
                        {
                          key: "email",
                          title: t("emailNotifications"),
                          description: t("receiveUpdatesViaEmail"),
                          icon: Mail,
                        },
                        {
                          key: "push",
                          title: t("pushNotifications"),
                          description: t("getInstantNotifications"),
                          icon: Bell,
                        },
                        {
                          key: "sms",
                          title: t("smsNotifications"),
                          description: t("receiveUrgentAlerts"),
                          icon: Bell,
                        },
                        {
                          key: "marketing",
                          title: t("marketingEmails"),
                          description: t("receivePromotionalOffers"),
                          icon: Mail,
                        },
                        {
                          key: "jobAlerts",
                          title: t("activityAlerts"),
                          description: t("getNotifiedAboutActivities"),
                          icon: Bell,
                        },
                      ] as {
                        key: NotificationKey;
                        title: string;
                        description: string;
                        icon: React.ComponentType<{ className?: string }>;
                      }[]
                    ).map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.key}
                          className="flex items-center justify-between p-4 border border-color-border rounded-xl bg-color-surface hover:bg-color-accent/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-color-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-color-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-color-text-primary">
                                {notification.title}
                              </p>
                              <p className="text-sm text-color-text-secondary">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2 touch-target ${
                              notifications[notification.key]
                                ? "bg-color-primary"
                                : "bg-color-border"
                            }`}
                            onClick={() => handleToggle(notification.key)}
                            aria-pressed={notifications[notification.key]}
                            aria-label={`Toggle ${notification.title}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-color-surface shadow-lg ring-0 transition duration-200 ease-in-out ${
                                notifications[notification.key]
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
