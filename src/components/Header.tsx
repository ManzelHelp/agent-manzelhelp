"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DarkModeButton from "./buttons/DarkModeButton";
import LanguageDropDown from "./buttons/LanguageDropDown";
import ProfileDropDown from "./buttons/ProfileDropDown";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Header() {
  const { user } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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
            <Image
              src="/logo-manzil.webp"
              alt="Manzel Help"
              width={120}
              height={100}
              priority
              className="rounded-lg transition-transform duration-200 hover:scale-105"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Right */}
        <div className="hidden lg:flex items-center justify-end space-x-8 flex-1 px-8">
          <Link
            href="/services"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
          >
            {t("services")}
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>
          <Link
            href="/about-us"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all duration-200 font-medium relative group"
          >
            {t("about_us")}
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>
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
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="font-medium hover:bg-[var(--color-primary-light)] transition-colors duration-200"
              >
                <Link href={`/${user.role}/create-offer`}>
                  {t("create_offer")}
                </Link>
              </Button>
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
          {/* Mobile Navigation Links */}
          <div className="space-y-4">
            <Link
              href="/services"
              className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("services")}
            </Link>
            <Link
              href="/about-us"
              className="block py-2 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("about_us")}
            </Link>
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
                <div className="mb-4">
                  <ProfileDropDown />
                </div>
                <Button
                  asChild
                  variant="default"
                  className="w-full justify-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={`/${user.role}/create-offer`}>
                    {t("create_offer")}
                  </Link>
                </Button>
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
