"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import DarkModeButton from "./buttons/DarkModeButton";
import LanguageDropDown from "./buttons/LanguageDropDown";
import ProfileDropDown from "./buttons/ProfileDropDown";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Bell,
  Briefcase,
  Wrench,
  MessageSquare,
  Calendar,
  Wallet,
  Star,
  Search,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogOutButton from "./buttons/LogOutButton";
import { NotificationIcon } from "./NotificationIcon";

function Header() {
  const { user } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const t = useTranslations("Header");

  // Role logic: tasker role includes all customer capabilities
  const isCustomer = user?.role === "customer" || user?.role === "tasker";
  const isTasker = user?.role === "tasker";

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="w-full max-w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm fixed top-0 left-0 right-0 z-50 overflow-x-hidden">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 md:py-4 w-full">
        {/* Logo Section - Left */}
        <div className="flex items-center">
          <Link href="/" className="relative flex items-center">
            {/* 
              HYDRATION-SAFE IMAGE LOADING
              Using unoptimized to prevent Next.js image optimization issues.
              The image is served directly from /public without optimization.
              
              Image dimensions: 400x110px (aspect ratio: 3.64:1)
              Display size: 200x55px (maintains aspect ratio)
            */}
            {!logoError ? (
              <img
                src="/logo-manzelhelp-.png"
                alt="ManzelHelp"
                width={200}
                height={55}
                onError={() => {
                  console.error("Failed to load logo image from /logo-manzelhelp-.png");
                  setLogoError(true);
                }}
                className="rounded-lg transition-transform duration-200 hover:scale-105 object-contain"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            ) : (
              <div className="flex items-center h-[55px]">
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  ManzelHelp
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation - Right */}
        <div className="hidden lg:flex items-center justify-end space-x-6 flex-1 px-4">
          {/* Priorité Client : Messages (4), Bookings (5) */}
          {user && user.role === "customer" && (
            <>
              <Link
                href="/customer/messages"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("messages")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/customer/bookings"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("bookings")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            </>
          )}

          {/* Priorité Tasker : Finance (4), Messages (5), Bookings (6), Reviews (7) */}
          {isTasker && (
            <>
              <Link
                href="/tasker/finance"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("finance")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/tasker/messages"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("messages")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/tasker/bookings"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("bookings")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/tasker/reviews"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("reviews")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            </>
          )}

          {!user && (
            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="default"
                size="sm"
                className="font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link href="/find-a-helper">{t("find_service")}</Link>
              </Button>
              <Button
                asChild
                variant="default"
                size="sm"
                className="font-medium bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link href="/become-a-helper">{t("post_service")}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                {/* Ordre Tasker : Rechercher Jobs (1), My Jobs (2), Post Service (3) */}
                {user.role === "tasker" && (
                  <>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/search/jobs">{t("jobs")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/tasker/my-jobs">{t("myJobs")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/tasker/post-service">{t("postService")}</Link>
                    </Button>
                  </>
                )}

                {/* Ordre Client : Parcourir Services (1), Post Job (2), My Jobs (3) */}
                {user.role === "customer" && (
                  <>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/search/services">{t("browseServices")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-slate-400 hover:bg-slate-500 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/customer/post-job">{t("postJob")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href="/customer/my-jobs">{t("myJobs")}</Link>
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="font-medium hover:bg-[var(--color-primary-light)] transition-colors duration-200"
                >
                  <Link href="/sign-up">{t("sign_up")}</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Link href="/login">{t("login")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Language & Theme Toggles - Only visible when NOT logged in (moved to profile dropdown when logged in) */}
          {!user && (
            <div className="flex items-center space-x-2">
              <LanguageDropDown />
              <DarkModeButton />
            </div>
          )}

          {/* Notification Icon - Only for authenticated users */}
          {user && (
            <div className="hidden lg:block">
              <NotificationIcon />
            </div>
          )}

          {/* Profile Dropdown - Always at the end for desktop */}
          {user && (
            <div className="hidden lg:block">
              <ProfileDropDown />
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t("close_menu") : t("open_menu")}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed right-0 top-[57px] w-full max-w-xs h-[calc(100vh-57px)] bg-[var(--color-surface)] shadow-xl z-50 lg:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="px-4 py-6 space-y-8">
          {/* User Section (Authenticated) */}
          {user && (
            <>
              {/* 1️⃣ Identité utilisateur */}
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-6">
                <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-foreground)] text-lg font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate text-[var(--color-text-primary)]">
                    {user.email}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full inline-block mt-1">
                    {user.role ? t(user.role as "tasker" | "customer") : ""}
                  </div>
                </div>
              </div>

              {/* 2️⃣ 🔥 Actions principales (Buttons) */}
              <div className="space-y-3">
                {user.role === "customer" ? (
                  <>
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/customer/my-jobs">{t("myJobs")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/search/services">{t("browseServices")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center font-bold bg-slate-400 hover:bg-slate-500 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/customer/post-job">{t("postJob")}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/tasker/post-service" className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        {t("postService")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/tasker/my-jobs" className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {t("myJobs")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* 3️⃣ Navigation métier */}
              <div className="space-y-1">
                <DropdownMenuLabel className="px-0 pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                  {user.role === "tasker" ? t("navigation") : t("clientActions")}
                </DropdownMenuLabel>
                {isTasker && (
                  <Link
                    href="/search/jobs"
                    className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    {t("jobs")}
                  </Link>
                )}
                <Link
                  href={`/${user.role}/messages`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-5 w-5" />
                  {t("messages")}
                </Link>
                <Link
                  href={`/${user.role}/bookings`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  {t("bookings")}
                </Link>
                <Link
                  href={`/${user.role}/finance`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wallet className="h-5 w-5" />
                  {t("finance")}
                </Link>
                {isTasker && (
                  <>
                    <Link
                      href="/tasker/reviews"
                      className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="h-5 w-5" />
                      {t("reviews")}
                    </Link>

                    {/* Autres options (Client actions for tasker) */}
                    <div className="pt-4">
                      <DropdownMenuLabel className="px-0 pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                        {t("quickActions")}
                      </DropdownMenuLabel>
                      <Link
                        href="/search/services"
                        className="flex items-center gap-3 py-2.5 text-base font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Search className="h-5 w-5" />
                        {t("browseServices")}
                      </Link>
                      <Link
                        href="/customer/post-job"
                        className="flex items-center gap-3 py-2.5 text-base font-medium text-slate-600 hover:text-slate-700 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PlusCircle className="h-5 w-5" />
                        {t("postJob")}
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* 4️⃣ Navigation personnelle */}
              <div className="space-y-1 pt-2">
                <DropdownMenuLabel className="px-0 pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                  {t("profile")}
                </DropdownMenuLabel>
                <Link
                  href={`/${user.role}/profile`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5" />
                  {t("profile")}
                </Link>
                <Link
                  href={`/${user.role}/dashboard`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {t("dashboard")}
                </Link>
                <div className="flex items-center gap-3 py-2.5">
                  <Link
                    href={`/${user.role}/notifications`}
                    className="flex items-center gap-3 flex-1 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5" />
                    {t("notifications")}
                  </Link>
                  <NotificationIcon asButton />
                </div>
              </div>

              {/* 5️⃣ Paramètres & préférences */}
              <div className="space-y-4 pt-2">
                <Link
                  href={`/${user.role}/settings`}
                  className="flex items-center gap-3 py-2.5 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  {t("settings")}
                </Link>

                <div className="flex items-center bg-muted/50 rounded-xl p-1.5 gap-1 shadow-inner border border-[var(--color-border)]">
                  <div className="flex-[3] flex items-center justify-start overflow-hidden">
                    <LanguageDropDown className="h-10 w-full justify-start px-3 hover:bg-background transition-all border-none shadow-none bg-transparent" />
                  </div>
                  <div className="w-px h-6 bg-border shrink-0 mx-1" />
                  <div className="flex-1 flex items-center justify-center">
                    <DarkModeButton />
                  </div>
                </div>
              </div>

              {/* 6️⃣ Action critique */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3 py-3 text-base font-bold text-red-500 hover:text-red-600 transition-colors duration-200 cursor-pointer">
                  <LogOut className="h-5 w-5" />
                  <LogOutButton />
                </div>
              </div>
            </>
          )}

          {/* Guest User Menu */}
          {!user && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-center font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white h-12"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/find-a-helper">{t("find_service")}</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-center font-bold bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white h-12"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/become-a-helper">{t("post_service")}</Link>
                </Button>
              </div>
              
              <div className="space-y-1">
                <Link
                  href="/search/jobs"
                  className="flex items-center gap-3 py-3 text-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="h-6 w-6" />
                  {t("jobs")}
                </Link>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center font-bold h-12"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-center font-bold h-12"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/sign-up">{t("sign_up")}</Link>
                </Button>
              </div>

              <div className="flex items-center bg-muted/50 rounded-xl p-1.5 gap-1 shadow-inner border border-[var(--color-border)]">
                <div className="flex-[3] flex items-center justify-start overflow-hidden">
                  <LanguageDropDown className="h-10 w-full justify-start px-3 hover:bg-background transition-all border-none shadow-none bg-transparent" />
                </div>
                <div className="w-px h-6 bg-border shrink-0 mx-1" />
                <div className="flex-1 flex items-center justify-center">
                  <DarkModeButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
