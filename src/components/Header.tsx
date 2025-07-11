import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import DarkModeButton from "./buttons/darkModeButton";
import LogOutButton from "./buttons/logOutButton";
import LanguageDropDown from "./buttons/languageDropDown";

async function Header() {
  const user = 0;
  const t = await getTranslations("Header");

  return (
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 md:py-5">
        {/* Logo Section - Left */}
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-manzil.webp"
              alt="Manzel Help"
              width={36}
              height={36}
              priority
              className="rounded-lg"
            />
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Manzel Help
            </span>
          </div>
        </Link>

        {/* Navigation and Auth - Right */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/services"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Services
          </Link>
          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about-us"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 font-medium"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              About Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <LogOutButton />
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <Link
                    href="/sign-up"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Sign Up
                  </Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link
                    href="/login"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="ml-2">
            <LanguageDropDown />
          </div>

          <div className="ml-2">
            <DarkModeButton />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
