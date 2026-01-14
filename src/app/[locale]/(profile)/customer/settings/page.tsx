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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Bell, Palette, Mail, CheckCircle, Eye, EyeOff, Lock, Link as LinkIcon, ChevronRight, Settings, User, AlertTriangle, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateNotificationPreferences } from "@/actions/profile";
import { useUserStore } from "@/stores/userStore";
import { getUserProfileAction, updatePasswordAction, updateEmailAction, verifyCurrentPasswordAction, resetPasswordAction } from "@/actions/auth";
import { BackButton } from "@/components/ui/BackButton";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tToast = useTranslations("toasts");
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("security");
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailDialogKey, setEmailDialogKey] = useState(0);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "GMT",
    currency: "MAD",
    theme: "system",
  });

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load theme from localStorage or system
  useEffect(() => {
    if (mounted) {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setTheme(savedTheme);
        setPreferences((prev) => ({ ...prev, theme: savedTheme }));
      } else {
        const currentTheme = resolvedTheme || theme || "system";
        setPreferences((prev) => ({ ...prev, theme: currentTheme === "dark" ? "dark" : currentTheme === "light" ? "light" : "system" }));
      }
    }
  }, [mounted, theme, resolvedTheme, setTheme]);

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

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    } else {
      // Get current locale from pathname
      const currentLocale = pathname.split("/")[1] || "en";
      if (["en", "ar", "de", "fr"].includes(currentLocale)) {
        setPreferences((prev) => ({ ...prev, language: currentLocale }));
      }
    }
  }, [pathname]);

  type NotificationKey = "push" | "marketing";
  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    push: false,
    marketing: false,
  });
  
  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load from localStorage first (for immediate UI update)
        const saved = localStorage.getItem("notification_preferences");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only keep push and marketing keys, ignore old email and sms keys
          const filtered = {
            push: parsed.push || false,
            marketing: parsed.marketing || false,
          };
          setNotifications(filtered);
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  // Clear email dialog fields when dialog opens
  useEffect(() => {
    if (changeEmailOpen) {
      // Force clear fields when dialog opens
      setNewEmail("");
      setEmailCurrentPassword("");
      setShowEmailPassword(false);
    }
  }, [changeEmailOpen]);

  const handleToggle = async (key: NotificationKey) => {
    const newValue = !notifications[key];
    const updated = { ...notifications, [key]: newValue };
    setNotifications(updated);
    
    // Save to localStorage immediately
    localStorage.setItem("notification_preferences", JSON.stringify(updated));
    
    // Save to database
    setLoading(true);
    try {
      const result = await updateNotificationPreferences(updated);
      if (!result.success) {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: result.error || tToast("failedToSavePreferences"),
        });
        // Revert on error
        setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      } else {
        toast({
          variant: "success",
          title: tToast("success"),
          description: tToast("preferencesSaved"),
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("failedToSavePreferences"),
      });
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: t("changePasswordDialog.weak"), color: "text-red-500" };
    if (strength <= 3) return { strength, label: t("changePasswordDialog.medium"), color: "text-orange-500" };
    if (strength <= 4) return { strength, label: t("changePasswordDialog.strong"), color: "text-green-500" };
    return { strength, label: t("changePasswordDialog.veryStrong"), color: "text-green-600" };
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("pleaseFillAllFieldsRequired"),
      });
      return;
    }

    // Verify current password first
    setChangingPassword(true);
    try {
      const verifyResult = await verifyCurrentPasswordAction(currentPassword);
      if (!verifyResult.success) {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: verifyResult.errorMessage || tToast("emailNotFound"),
        });
        setChangingPassword(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: tToast("passwordMinLength"),
        });
        setChangingPassword(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: tToast("passwordsDoNotMatch"),
        });
        setChangingPassword(false);
        return;
      }

      const result = await updatePasswordAction(newPassword);
      if (result.success) {
        toast({
          variant: "success",
          title: tToast("success"),
          description: tToast("passwordUpdated"),
        });
        setChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: result.errorMessage || tToast("failedToUpdatePassword"),
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("failedToUpdatePassword"),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("emailNotFound"),
      });
      return;
    }

    try {
      const result = await resetPasswordAction(user.email);
      if (result.errorMessage) {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: result.errorMessage,
        });
      } else {
        toast({
          variant: "success",
          title: tToast("emailSent"),
          description: tToast("resetEmailSent"),
        });
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("failedToUpdateEmail"),
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailCurrentPassword) {
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("pleaseFillAllFieldsRequired"),
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("pleaseEnterValidEmail"),
      });
      return;
    }

    setChangingEmail(true);
    try {
      const result = await updateEmailAction(newEmail, emailCurrentPassword);
      if (result.success) {
        toast({
          variant: "success",
          title: tToast("verificationEmailSent"),
          description: tToast("checkNewEmail", { email: newEmail }),
        });
        setChangeEmailOpen(false);
        setNewEmail("");
        setEmailCurrentPassword("");
        // Refresh user data
        const profileResult = await getUserProfileAction();
        if (profileResult.success && profileResult.user) {
          setUser(profileResult.user);
        }
      } else {
        toast({
          variant: "destructive",
          title: tToast("error"),
          description: result.errorMessage || tToast("failedToUpdateEmail"),
        });
      }
    } catch (error) {
      console.error("Error changing email:", error);
      toast({
        variant: "destructive",
        title: tToast("error"),
        description: tToast("failedToUpdateEmail"),
      });
    } finally {
      setChangingEmail(false);
    }
  };

  const handlePreferenceChange = (key: string, value: string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem("user_preferences", JSON.stringify(updated));

    // If language changed, redirect to new locale
    if (key === "language") {
      if (value !== currentLocale) {
        router.push(pathname, { locale: value });
      }
    } else if (key === "theme") {
      // Handle theme change
      setTheme(value);
      localStorage.setItem("theme", value);
      toast({
        variant: "success",
        title: tToast("success"),
        description: tToast("themeUpdated"),
      });
    } else {
      toast({
        variant: "success",
        title: tToast("success"),
        description: tToast("preferencesSaved"),
      });
    }
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
    {
      id: "preferences",
      title: t("preferences", { default: "Preferences" }),
      icon: Palette,
      description: t("managePreferences", { default: "Manage your preferences" }),
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
                                onClick={() => {
                                  // Clear fields and force re-render
                                  setNewEmail("");
                                  setEmailCurrentPassword("");
                                  setShowEmailPassword(false);
                                  setEmailDialogKey(prev => prev + 1);
                                  setChangeEmailOpen(true);
                                }}
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
                            onClick={() => setChangePasswordOpen(true)}
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
                          key: "push",
                          title: t("pushNotifications"),
                          description: t("getInstantNotifications"),
                          icon: Bell,
                        },
                        {
                          key: "marketing",
                          title: t("marketingEmails"),
                          description: t("receivePromotionalOffers"),
                          icon: Mail,
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
                          <div>
                            <p className="font-medium text-color-text-primary">
                              {notification.title}
                            </p>
                            <p className="text-sm text-color-text-secondary">
                              {notification.description}
                            </p>
                          </div>
                          <button
                            disabled={loading}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2 focus-visible:ring-offset-color-surface disabled:opacity-50 disabled:cursor-not-allowed ${
                              notifications[notification.key]
                                ? "bg-color-primary"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            onClick={() => handleToggle(notification.key)}
                            aria-pressed={notifications[notification.key]}
                            aria-label={`Toggle ${notification.title}`}
                            type="button"
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-200 shadow-lg ring-0 transition duration-200 ease-in-out ${
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

              {/* Preferences Section */}
              {activeSection === "preferences" && (
                <Card className="border-color-border bg-color-surface shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-color-text-primary">
                      <div className="p-2 bg-color-primary/10 rounded-lg">
                        <Palette className="h-5 w-5 text-color-primary" />
                      </div>
                      {t("preferences", { default: "Preferences" })}
                    </CardTitle>
                    <CardDescription className="text-color-text-secondary">
                      {t("managePreferences", { default: "Manage your preferences" })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-color-text-primary">
                          {t("language", { default: "Language" })}
                        </Label>
                        <select 
                          className="w-full rounded-md border border-color-border bg-color-surface dark:bg-slate-800 text-color-text-primary dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2"
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange("language", e.target.value)}
                        >
                          <option value="en" className="dark:bg-slate-800 dark:text-slate-100">English</option>
                          <option value="ar" className="dark:bg-slate-800 dark:text-slate-100">العربية (Arabic)</option>
                          <option value="de" className="dark:bg-slate-800 dark:text-slate-100">Deutsch</option>
                          <option value="fr" className="dark:bg-slate-800 dark:text-slate-100">Français</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-color-text-primary">
                          {t("timezone", { default: "Timezone" })}
                        </Label>
                        <select 
                          className="w-full rounded-md border border-color-border bg-color-surface dark:bg-slate-800 text-color-text-primary dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2"
                          value={preferences.timezone}
                          onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                        >
                          <option value="GMT" className="dark:bg-slate-800 dark:text-slate-100">GMT (Greenwich Mean Time)</option>
                          <option value="CET" className="dark:bg-slate-800 dark:text-slate-100">CET (Central European Time)</option>
                          <option value="EST" className="dark:bg-slate-800 dark:text-slate-100">EST (Eastern Standard Time)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-color-text-primary">
                          {t("currency", { default: "Currency" })}
                        </Label>
                        <select 
                          className="w-full rounded-md border border-color-border bg-color-surface dark:bg-slate-800 text-color-text-primary dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2"
                          value={preferences.currency}
                          onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                        >
                          <option value="MAD" className="dark:bg-slate-800 dark:text-slate-100">MAD (Moroccan Dirham)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-color-text-primary flex items-center gap-2">
                          {mounted && (resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
                          {t("theme", { default: "Theme" })}
                        </Label>
                        <select 
                          className="w-full rounded-md border border-color-border bg-color-surface dark:bg-slate-800 text-color-text-primary dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary focus-visible:ring-offset-2"
                          value={preferences.theme}
                          onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                        >
                          <option value="system" className="dark:bg-slate-800 dark:text-slate-100">{t("themeSystem", { default: "System" })}</option>
                          <option value="light" className="dark:bg-slate-800 dark:text-slate-100">{t("themeLight", { default: "Light" })}</option>
                          <option value="dark" className="dark:bg-slate-800 dark:text-slate-100">{t("themeDark", { default: "Dark" })}</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md bg-color-surface border-color-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-color-text-primary">
              <Lock className="h-5 w-5" />
              {t("changePasswordDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-color-text-secondary">
              {t("changePasswordDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-color-text-primary">{t("changePasswordDialog.currentPassword")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("changePasswordDialog.currentPasswordPlaceholder")}
                  className="pr-10 bg-color-surface text-color-text-primary border-color-border"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-color-text-primary">{t("changePasswordDialog.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("changePasswordDialog.newPasswordPlaceholder")}
                  className="pr-10 bg-color-surface text-color-text-primary border-color-border"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={getPasswordStrength(newPassword).color}>
                      {t("changePasswordDialog.passwordStrength")}: {getPasswordStrength(newPassword).label}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded ${
                            level <= getPasswordStrength(newPassword).strength
                              ? getPasswordStrength(newPassword).strength <= 2
                                ? "bg-red-500"
                                : getPasswordStrength(newPassword).strength <= 3
                                ? "bg-orange-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-color-text-primary">{t("changePasswordDialog.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("changePasswordDialog.confirmPasswordPlaceholder")}
                  className="pr-10 bg-color-surface text-color-text-primary border-color-border"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">{t("changePasswordDialog.passwordsDoNotMatch")}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-color-primary hover:underline flex items-center gap-1"
              >
                <LinkIcon className="h-3 w-3" />
                {t("changePasswordDialog.forgotPassword")}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePasswordOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="border-color-border"
            >
              {t("changePasswordDialog.cancel")}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {changingPassword ? t("changePasswordDialog.changing") : t("changePasswordDialog.change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog 
        open={changeEmailOpen} 
        onOpenChange={(open) => {
          setChangeEmailOpen(open);
          if (!open) {
            // Clear fields when dialog closes
            setNewEmail("");
            setEmailCurrentPassword("");
            setShowEmailPassword(false);
            setEmailDialogKey(prev => prev + 1); // force re-render
          }
        }}
      >
        <DialogContent className="max-w-md bg-color-surface border-color-border" key={emailDialogKey}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-color-text-primary">
              <Mail className="h-5 w-5" />
              {t("changeEmailDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-color-text-secondary">
              {t("changeEmailDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="currentEmail" className="text-color-text-primary">{t("changeEmailDialog.currentEmail")}</Label>
              <Input
                id="currentEmail"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-color-accent/30 cursor-not-allowed"
              />
            </div>

            {/* New Email */}
            <div className="space-y-2">
              <Label htmlFor="newEmail" className="text-color-text-primary">{t("changeEmailDialog.newEmail")}</Label>
              <Input
                key={`new-email-input-${emailDialogKey}`}
                id={`newEmail-${emailDialogKey}`}
                name={`newEmail-${emailDialogKey}`}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("changeEmailDialog.newEmailPlaceholder")}
                autoComplete="off"
                autoFocus
                className="bg-color-surface text-color-text-primary border-color-border"
              />
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="emailCurrentPassword" className="text-color-text-primary">{t("changeEmailDialog.currentPassword")}</Label>
              <div className="relative">
                <Input
                  key={`email-password-input-${emailDialogKey}`}
                  id={`emailCurrentPassword-${emailDialogKey}`}
                  name={`emailCurrentPassword-${emailDialogKey}`}
                  type={showEmailPassword ? "text" : "password"}
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder={t("changeEmailDialog.currentPasswordPlaceholder")}
                  className="pr-10 bg-color-surface text-color-text-primary border-color-border"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showEmailPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-color-text-secondary">
                {t("changeEmailDialog.passwordRequired")}
              </p>
            </div>

            {/* Info Message */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>{t("changeEmailDialog.importantNote")}</strong> {t("changeEmailDialog.verificationEmailNote")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeEmailOpen(false);
                setNewEmail("");
                setEmailCurrentPassword("");
                setShowEmailPassword(false);
                setEmailDialogKey(prev => prev + 1);
              }}
              className="border-color-border"
            >
              {t("changeEmailDialog.cancel")}
            </Button>
            <Button
              onClick={handleChangeEmail}
              disabled={changingEmail || !newEmail || !emailCurrentPassword}
            >
              {changingEmail ? t("changeEmailDialog.changing") : t("changeEmailDialog.change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
