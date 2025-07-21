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
import { Label } from "@/components/ui/label";
import {
  User,
  MapPin,
  Shield,
  CreditCard,
  Bell,
  Globe,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  X,
  Camera,
  Phone,
  Mail,
  Trash2,
  Upload,
  BadgeCheck,
  BellDot,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ProfileSection =
  | "personal"
  | "addresses"
  | "security"
  | "payment"
  | "notifications"
  | "preferences"
  | "verification";

interface ProfileCompletionItem {
  id: string;
  section: ProfileSection;
  title: string;
  completed: boolean;
  required: boolean;
}

interface Address {
  id?: number;
  label: string;
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export default function CustomerProfilePage() {
  const { user, setUser } = useUserStore();
  const t = useTranslations("profile");

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth || "",
    avatar_url: user?.avatar_url || "",
  });

  const [newAddress, setNewAddress] = useState<Address>({
    label: "home",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  // Add a mock notifications array and state
  const [notifications] = useState([
    {
      id: 1,
      title: "Welcome!",
      body: "Thanks for joining.",
      date: "2024-06-01",
      read: false,
    },
    {
      id: 2,
      title: "Profile Updated",
      body: "Your profile was updated.",
      date: "2024-06-02",
      read: true,
    },
    {
      id: 3,
      title: "New Message",
      body: "You have a new message.",
      date: "2024-06-03",
      read: false,
    },
  ]);

  // Calculate profile completion
  const completionItems: ProfileCompletionItem[] = [
    {
      id: "basic_info",
      section: "personal",
      title: t("completion.basicInfo"),
      completed: !!(user?.first_name && user?.last_name),
      required: true,
    },
    {
      id: "contact_info",
      section: "personal",
      title: t("completion.contactInfo"),
      completed: !!(user?.email && user?.phone),
      required: true,
    },
    {
      id: "profile_photo",
      section: "personal",
      title: t("completion.profilePhoto"),
      completed: !!user?.avatar_url,
      required: false,
    },
    {
      id: "address",
      section: "addresses",
      title: t("completion.address"),
      completed: addresses.length > 0,
      required: true,
    },
    {
      id: "email_verified",
      section: "verification",
      title: t("completion.emailVerified"),
      completed: !!user?.email_verified,
      required: true,
    },
    {
      id: "phone_verified",
      section: "verification",
      title: t("completion.phoneVerified"),
      completed: !!user?.phone_confirmed_at,
      required: false,
    },
  ];

  const completedCount = completionItems.filter(
    (item) => item.completed
  ).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  // Fetch addresses on component mount
  const fetchAddresses = React.useCallback(async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      toast.error(t("errors.fetchAddresses"));
    } else {
      setAddresses(data || []);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id, fetchAddresses]);

  const updatePersonalInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        phone: personalInfo.phone,
        date_of_birth: personalInfo.date_of_birth,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(t("errors.updateProfile"));
      console.error("Error updating profile:", error);
    } else {
      // Update local user state
      setUser({
        ...user,
        ...personalInfo,
        updated_at: new Date().toISOString(),
      });
      toast.success(t("success.profileUpdated"));
      setIsEditing((prev) => ({ ...prev, personal: false }));
    }

    setLoading(false);
  };

  const addAddress = async () => {
    if (!user?.id || !newAddress.street_address || !newAddress.city) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("addresses").insert([
      {
        ...newAddress,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error(t("errors.addAddress"));
      console.error("Error adding address:", error);
    } else {
      toast.success(t("success.addressAdded"));
      setNewAddress({
        label: "home",
        street_address: "",
        city: "",
        region: "",
        postal_code: "",
        country: "MA",
        is_default: false,
      });
      setShowNewAddressForm(false);
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
      toast.error(t("errors.deleteAddress"));
      console.error("Error deleting address:", error);
    } else {
      toast.success(t("success.addressDeleted"));
      fetchAddresses();
    }

    setLoading(false);
  };

  const sectionIcons: Record<ProfileSection, React.ReactNode> = {
    personal: <User className="h-4 w-4" />,
    addresses: <MapPin className="h-4 w-4" />,
    security: <Shield className="h-4 w-4" />,
    payment: <CreditCard className="h-4 w-4" />,
    notifications: <Bell className="h-4 w-4" />,
    preferences: <Globe className="h-4 w-4" />,
    verification: <CheckCircle className="h-4 w-4" />,
  };

  const sections = [
    { id: "personal" as ProfileSection, title: t("sections.personal") },
    { id: "addresses" as ProfileSection, title: t("sections.addresses") },
    {
      id: "notifications" as ProfileSection,
      title: t("sections.notifications"),
    },
    { id: "payment" as ProfileSection, title: t("sections.payment") },
    { id: "preferences" as ProfileSection, title: t("sections.preferences") },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {t("errors.notLoggedIn")}
          </h2>
          <p className="text-muted-foreground">{t("errors.loginRequired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with completion status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {completionPercentage}%
            </div>
            <p className="text-sm text-muted-foreground">
              {t("completion.complete")}
            </p>
          </div>
        </div>

        {/* Completion Progress Card */}
        {completionPercentage < 100 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {t("completion.title")}
                </CardTitle>
              </div>
              <CardDescription>{t("completion.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completionItems
                  .filter((item) => !item.completed)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-background cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setActiveSection(item.section)}
                    >
                      {sectionIcons[item.section]}
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.required && (
                        <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                          {t("completion.required")}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{t("navigation.title")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors hover:bg-accent ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sectionIcons[section.id]}
                    <span>{section.title}</span>
                    {completionItems.some(
                      (item) => item.section === section.id && !item.completed
                    ) && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information Section (now includes Verification) */}
          {activeSection === "personal" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t("sections.personal")}
                    </CardTitle>
                    <CardDescription>
                      {t("personal.description")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIsEditing((prev) => ({
                        ...prev,
                        personal: !prev.personal,
                      }))
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing.personal
                      ? t("actions.cancel")
                      : t("actions.edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Profile Photo Section */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={t("personal.avatar")}
                          className="h-full w-full object-cover"
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                          priority
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    {isEditing.personal && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{t("personal.avatar")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("personal.avatarDescription")}
                    </p>
                  </div>
                </div>

                {/* Personal Info Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      {t("personal.firstName")}
                    </Label>
                    <Input
                      id="first_name"
                      value={personalInfo.first_name}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      disabled={!isEditing.personal}
                      placeholder={t("personal.firstNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t("personal.lastName")}</Label>
                    <Input
                      id="last_name"
                      value={personalInfo.last_name}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      disabled={!isEditing.personal}
                      placeholder={t("personal.lastNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("personal.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      disabled={true}
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("personal.emailNote")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("personal.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      disabled={!isEditing.personal}
                      placeholder={t("personal.phonePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="date_of_birth">
                      {t("personal.birthDate")}
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={personalInfo.date_of_birth}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          date_of_birth: e.target.value,
                        }))
                      }
                      disabled={!isEditing.personal}
                    />
                  </div>
                </div>

                {isEditing.personal && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={updatePersonalInfo} disabled={loading}>
                      {loading ? t("actions.saving") : t("actions.save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPersonalInfo({
                          first_name: user?.first_name || "",
                          last_name: user?.last_name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          date_of_birth: user?.date_of_birth || "",
                          avatar_url: user?.avatar_url || "",
                        });
                        setIsEditing((prev) => ({ ...prev, personal: false }));
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                  </div>
                )}

                {/* Verification Section (moved here) */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {t("sections.verification")}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("verification.email")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {t("verification.verified")}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <Button size="sm">
                              {t("verification.verify")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Phone Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {t("verification.phone")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.phone || t("verification.phoneNotAdded")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.phone_confirmed_at ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {t("verification.verified")}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <Button size="sm" disabled={!user.phone}>
                              {t("verification.verify")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Identity Verification */}
                    <div className="p-4 border border-dashed rounded-lg bg-background md:col-span-2">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <h3 className="font-medium mb-1">
                          {t("verification.identity")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("verification.identityDescription")}
                        </p>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          {t("verification.uploadDocument")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses Section */}
          {activeSection === "addresses" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("sections.addresses")}
                    </CardTitle>
                    <CardDescription>
                      {t("addresses.description")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addresses.add")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 && !showNewAddressForm && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">{t("addresses.empty")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("addresses.emptyDescription")}
                    </p>
                    <Button onClick={() => setShowNewAddressForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addresses.addFirst")}
                    </Button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <Card className="border-dashed border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {t("addresses.newAddress")}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="address_label">
                            {t("addresses.label")}
                          </Label>
                          <select
                            id="address_label"
                            value={newAddress.label}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                label: e.target.value,
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                          >
                            <option value="home">{t("addresses.home")}</option>
                            <option value="work">{t("addresses.work")}</option>
                            <option value="other">
                              {t("addresses.other")}
                            </option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">
                            {t("addresses.country")}
                          </Label>
                          <select
                            id="country"
                            value={newAddress.country}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                          >
                            <option value="MA">Morocco</option>
                            <option value="FR">France</option>
                            <option value="ES">Spain</option>
                          </select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="street_address">
                            {t("addresses.street")}
                          </Label>
                          <Input
                            id="street_address"
                            value={newAddress.street_address}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                street_address: e.target.value,
                              }))
                            }
                            placeholder={t("addresses.streetPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">{t("addresses.city")}</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            placeholder={t("addresses.cityPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">
                            {t("addresses.region")}
                          </Label>
                          <Input
                            id="region"
                            value={newAddress.region}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                region: e.target.value,
                              }))
                            }
                            placeholder={t("addresses.regionPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">
                            {t("addresses.postalCode")}
                          </Label>
                          <Input
                            id="postal_code"
                            value={newAddress.postal_code}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                postal_code: e.target.value,
                              }))
                            }
                            placeholder={t("addresses.postalCodePlaceholder")}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={addAddress} disabled={loading}>
                          {loading ? t("actions.saving") : t("actions.save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          {t("actions.cancel")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Addresses */}
                {addresses.map((address) => (
                  <Card key={address.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {t("addresses.default")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street_address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.region}{" "}
                            {address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              address.id && deleteAddress(address.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Methods Section */}
          {activeSection === "payment" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t("sections.payment")}
                    </CardTitle>
                    <CardDescription>
                      {t("payment.description")}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("payment.addMethod")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t("payment.noMethods")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("payment.noMethodsDescription")}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("payment.addFirst")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("sections.preferences")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label>{t("preferences.language")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label>{t("preferences.timezone")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                    <option value="CET">CET (Central European Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>{t("preferences.currency")}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="MAD">MAD (Moroccan Dirham)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellDot className="h-5 w-5" />
                  {t("sections.notifications")}
                </CardTitle>
                <CardDescription>
                  {t("notifications.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellDot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">
                      {t("notifications.empty")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t("notifications.emptyDescription")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-background ${
                          !notif.read ? "border-primary/40" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{notif.title}</span>
                            {!notif.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                {t("notifications.unread")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notif.body}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <span className="text-xs text-muted-foreground">
                            {notif.date}
                          </span>
                          {notif.read && (
                            <BadgeCheck
                              className="h-4 w-4 text-green-500"
                              aria-label={t("notifications.seen") || "Seen"}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
