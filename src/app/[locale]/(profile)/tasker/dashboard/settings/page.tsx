import { getTranslations } from "next-intl/server";
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
  Shield,
  Bell,
  Settings as SettingsIcon,
  Palette,
  Camera,
  Mail,
  Phone,
  Eye,
  Trash2,
  Save,
  X,
  RotateCcw,
} from "lucide-react";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("description")}</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("profile.title")}
            </CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-6 w-6 p-0"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {t("profile.fields.avatar")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("placeholder.notImplemented")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("profile.fields.firstName")}
                </Label>
                <Input
                  id="firstName"
                  placeholder={t("profile.placeholder.firstName")}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("profile.fields.lastName")}</Label>
                <Input
                  id="lastName"
                  placeholder={t("profile.placeholder.lastName")}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.fields.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("profile.placeholder.email")}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile.fields.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("profile.placeholder.phone")}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("profile.fields.location")}</Label>
              <Input
                id="location"
                placeholder={t("profile.placeholder.location")}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.fields.bio")}</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("profile.placeholder.bio")}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("account.title")}
            </CardTitle>
            <CardDescription>{t("account.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("account.fields.password")}</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className="flex-1"
                />
                <Button variant="outline" size="sm" disabled>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                {t("account.actions.changePassword")}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">{t("account.fields.language")}</Label>
                <select
                  id="language"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("account.fields.timezone")}</Label>
                <select
                  id="timezone"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  <option value="UTC">UTC</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("account.fields.currency")}</Label>
              <select
                id="currency"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" size="sm" disabled>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("account.actions.deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications.title")}
            </CardTitle>
            <CardDescription>{t("notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {t("notifications.types.email")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("placeholder.notImplemented")}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {t("notifications.types.push")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("placeholder.notImplemented")}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {t("notifications.types.sms")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("placeholder.notImplemented")}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium">Notification Events</h4>
              <div className="space-y-2">
                {Object.entries({
                  newRequests: t("notifications.events.newRequests"),
                  messages: t("notifications.events.messages"),
                  payments: t("notifications.events.payments"),
                  reminders: t("notifications.events.reminders"),
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <div className="h-4 w-8 rounded-full bg-muted"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("privacy.title")}
            </CardTitle>
            <CardDescription>{t("privacy.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries({
                profileVisibility: t("privacy.options.profileVisibility"),
                locationSharing: t("privacy.options.locationSharing"),
                dataUsage: t("privacy.options.dataUsage"),
                twoFactorAuth: t("privacy.options.twoFactorAuth"),
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("placeholder.notImplemented")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("preferences.title")}
            </CardTitle>
            <CardDescription>{t("preferences.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("preferences.options.theme")}
                </Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Light
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Dark
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Auto
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("placeholder.notImplemented")}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("preferences.options.language")}
                </Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {t("placeholder.notImplemented")}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("preferences.options.timezone")}
                </Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  <option value="UTC">UTC</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {t("placeholder.notImplemented")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" disabled>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("actions.reset")}
            </Button>
            <Button variant="outline" disabled>
              <X className="h-4 w-4 mr-2" />
              {t("actions.cancel")}
            </Button>
            <Button disabled>
              <Save className="h-4 w-4 mr-2" />
              {t("actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium">{t("placeholder.comingSoon")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("placeholder.featureDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
