"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogOutButton from "./buttons/LogOutButton";

function Header() {
  const { user } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const t = useTranslations("Header");

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 md:py-4">
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
        <div className="hidden lg:flex items-center justify-end space-x-8 flex-1 px-8">
          {user?.role === "tasker" && (
            <>
              <Link
                href="/search/jobs"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("jobs")}
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
                href="/tasker/reviews"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("reviews")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            </>
          )}
          {user?.role === "customer" && (
            <>
              <Link
                href="/customer/bookings"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("bookings")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/customer/finance"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("finance")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/customer/messages"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("messages")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            </>
          )}
          {!user && (
            <>
              <Link
                href="/become-a-helper"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("become_helper")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
              <Link
                href="/find-a-helper"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
              >
                {t("find_helper")}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            </>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                {/* My Jobs Button - Always visible for all users */}
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Link href={`/${user.role}/my-jobs`}>{t("myJobs")}</Link>
                </Button>
                {/* My Services Button - Only for taskers */}
                {user.role === "tasker" && (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="font-medium bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href="/tasker/my-services">{t("myServices")}</Link>
                  </Button>
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

          {/* Language & Theme Toggles */}
          <div className="flex items-center space-x-2">
            <LanguageDropDown />
            <DarkModeButton />
          </div>

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
        <div className="px-4 py-6 space-y-6">
          {/* User Profile Section - Only show if logged in */}
          {user && (
            <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-foreground)]">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  href={`/${user.role}/profile`}
                  className="flex items-center gap-2 py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href={`/${user.role}/dashboard`}
                  className="flex items-center gap-2 py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href={`/${user.role}/notifications`}
                  className="flex items-center gap-2 py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
                <Link
                  href={`/${user.role}/settings`}
                  className="flex items-center gap-2 py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="space-y-4">
            {user?.role === "tasker" && (
              <>
                <Link
                  href="/search/jobs"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("jobs")}
                </Link>
                <Link
                  href="/tasker/bookings"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("bookings")}
                </Link>
                <Link
                  href="/tasker/finance"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("finance")}
                </Link>
                <Link
                  href="/tasker/messages"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("messages")}
                </Link>
                <Link
                  href="/tasker/reviews"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("reviews")}
                </Link>
              </>
            )}
            {user?.role === "customer" && (
              <>
                <Link
                  href="/customer/bookings"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("bookings")}
                </Link>
                <Link
                  href="/customer/finance"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("finance")}
                </Link>
                <Link
                  href="/customer/messages"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("messages")}
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/become-a-helper"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("become_helper")}
                </Link>
                <Link
                  href="/find-a-helper"
                  className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("find_helper")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Auth Section */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            {user ? (
              <>
                {/* My Jobs Button - Always visible for all users */}
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-center font-medium mb-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={`/${user.role}/my-jobs`}>{t("myJobs")}</Link>
                </Button>
                {/* My Services Button - Only for taskers */}
                {user.role === "tasker" && (
                  <Button
                    asChild
                    variant="default"
                    className="w-full justify-center font-medium mb-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/tasker/my-services">{t("myServices")}</Link>
                  </Button>
                )}
                <div className="flex items-center gap-2 py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200">
                  <LogOut className="h-4 w-4" />
                  <LogOutButton />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/sign-up">{t("sign_up")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
