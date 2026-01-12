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
import { Shield, Bell, Palette, Mail, CheckCircle, Eye, EyeOff, Lock, Link as LinkIcon, Moon, Sun } from "lucide-react";
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
  const t = useTranslations("profile");
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
          title: "Erreur",
          description: result.error || "Failed to save preferences",
        });
        // Revert on error
        setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      } else {
        toast({
          variant: "success",
          title: "Succès",
          description: "Preferences saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Failed to save preferences",
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
    
    if (strength <= 2) return { strength, label: "Faible", color: "text-red-500" };
    if (strength <= 3) return { strength, label: "Moyen", color: "text-orange-500" };
    if (strength <= 4) return { strength, label: "Fort", color: "text-green-500" };
    return { strength, label: "Très fort", color: "text-green-600" };
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
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
          title: "Erreur",
          description: verifyResult.errorMessage || "Mot de passe actuel incorrect",
        });
        setChangingPassword(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 6 caractères",
        });
        setChangingPassword(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
        });
        setChangingPassword(false);
        return;
      }

      const result = await updatePasswordAction(newPassword);
      if (result.success) {
        toast({
          variant: "success",
          title: "Succès",
          description: "Mot de passe mis à jour avec succès",
        });
        setChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.errorMessage || "Échec de la mise à jour du mot de passe",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour du mot de passe",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Email non trouvé",
      });
      return;
    }

    try {
      const result = await resetPasswordAction(user.email);
      if (result.errorMessage) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.errorMessage,
        });
      } else {
        toast({
          variant: "success",
          title: "Email envoyé",
          description: "Un email de réinitialisation a été envoyé à votre adresse",
        });
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de l'envoi de l'email",
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailCurrentPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
      });
      return;
    }

    setChangingEmail(true);
    try {
      const result = await updateEmailAction(newEmail, emailCurrentPassword);
      if (result.success) {
        toast({
          variant: "success",
          title: "Email de vérification envoyé",
          description: "Veuillez vérifier votre nouvelle adresse e-mail. Un email de confirmation a été envoyé à " + newEmail,
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
          title: "Erreur",
          description: result.errorMessage || "Échec de la mise à jour de l'email",
        });
      }
    } catch (error) {
      console.error("Error changing email:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour de l'email",
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
        title: "Succès",
        description: "Thème mis à jour avec succès",
      });
    } else {
      toast({
        variant: "success",
        title: "Succès",
        description: "Preference saved successfully",
      });
    }
  };

  const sections = [
    { id: "security", title: t("sections.security.title") },
    { id: "notifications", title: t("sections.notifications.title") },
    { id: "preferences", title: t("sections.preferences.title") },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
      </div>
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
                  {t("sections.security.title")}
                </CardTitle>
                <CardDescription>{t("sections.security.description")}</CardDescription>
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
                            {user?.email || "user@email.com"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Clear fields and force re-render
                            setNewEmail("");
                            setEmailCurrentPassword("");
                            setShowEmailPassword(false);
                            setEmailDialogKey(prev => prev + 1);
                            setChangeEmailOpen(true);
                          }}
                        >
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
                    <Button 
                      variant="outline"
                      onClick={() => setChangePasswordOpen(true)}
                    >
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
                  {t("sections.notifications.title")}
                </CardTitle>
                <CardDescription>
                  {t("sections.notifications.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {(
                    [
                      {
                        key: "push",
                        title: t("notifications.push"),
                        description: t("notifications.pushDescription"),
                      },
                      {
                        key: "marketing",
                        title: t("notifications.marketing"),
                        description: t("notifications.marketingDescription"),
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
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  {t("sections.preferences.title")}
                </CardTitle>
                <CardDescription>
                  {t("sections.preferences.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("preferences.language")}
                    </Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    <Label className="text-sm font-medium">
                      {t("preferences.timezone")}
                    </Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                    >
                      <option value="GMT" className="dark:bg-slate-800 dark:text-slate-100">GMT (Greenwich Mean Time)</option>
                      <option value="CET" className="dark:bg-slate-800 dark:text-slate-100">CET (Central European Time)</option>
                      <option value="EST" className="dark:bg-slate-800 dark:text-slate-100">EST (Eastern Standard Time)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("preferences.currency")}
                    </Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={preferences.currency}
                      onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                    >
                      <option value="MAD" className="dark:bg-slate-800 dark:text-slate-100">MAD (Moroccan Dirham)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      {mounted && (resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
                      {t("preferences.theme", { default: "Theme" })}
                    </Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                    >
                      <option value="system" className="dark:bg-slate-800 dark:text-slate-100">Système</option>
                      <option value="light" className="dark:bg-slate-800 dark:text-slate-100">Clair</option>
                      <option value="dark" className="dark:bg-slate-800 dark:text-slate-100">Sombre</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Changer le mot de passe
            </DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel et votre nouveau mot de passe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      Force: {getPasswordStrength(newPassword).label}
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
              <Label htmlFor="confirmPassword">Confirmation du nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <LinkIcon className="h-3 w-3" />
                Mot de passe oublié ?
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
            >
              Annuler
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {changingPassword ? "Changement..." : "Changer le mot de passe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
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
  <DialogContent className="max-w-md" key={emailDialogKey}>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Changer l'adresse e-mail
      </DialogTitle>
      <DialogDescription>
        Entrez votre nouvelle adresse e-mail et votre mot de passe actuel pour confirmer
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Current Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="currentEmail">Adresse e-mail actuelle</Label>
        <Input
          id="currentEmail"
          type="email"
          value={user?.email || ""}
          disabled
          className="bg-muted"
        />
      </div>

      {/* New Email */}
      <div className="space-y-2">
        <Label htmlFor="newEmail">Nouvelle adresse e-mail *</Label>
        <Input
          key={`new-email-input-${emailDialogKey}`}
          id={`newEmail-${emailDialogKey}`}
          name={`newEmail-${emailDialogKey}`}
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Entrez votre nouvelle adresse e-mail"
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="emailCurrentPassword">Mot de passe actuel *</Label>
        <div className="relative">
          <Input
            key={`email-password-input-${emailDialogKey}`}
            id={`emailCurrentPassword-${emailDialogKey}`}
            name={`emailCurrentPassword-${emailDialogKey}`}
            type={showEmailPassword ? "text" : "password"}
            value={emailCurrentPassword}
            onChange={(e) => setEmailCurrentPassword(e.target.value)}
            placeholder="Entrez votre mot de passe actuel"
            className="pr-10"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowEmailPassword(!showEmailPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showEmailPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Votre mot de passe actuel est requis pour confirmer le changement
        </p>
      </div>

      {/* Info Message */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Note importante :</strong> Un email de vérification sera envoyé à votre nouvelle adresse. 
          L'email ne sera modifié qu'après confirmation via le lien dans l'email.
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
      >
        Annuler
      </Button>
      <Button
        onClick={handleChangeEmail}
        disabled={changingEmail || !newEmail || !emailCurrentPassword}
      >
        {changingEmail ? "Envoi..." : "Changer l'email"}
      </Button>
     </DialogFooter>
     </DialogContent>
   </Dialog>
    </div>
  );
}
