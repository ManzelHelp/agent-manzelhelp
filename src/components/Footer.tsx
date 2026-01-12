"use client";

import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Get the current year in a hydration-safe way.
 * This constant is evaluated once at module load time on the client,
 * preventing hydration mismatches between server and client renders.
 * 
 * Note: The year changes once per year, so this is safe for hydration.
 * If the year changes between server and client render, React will handle
 * the update gracefully during hydration.
 */
const CURRENT_YEAR = new Date().getFullYear();

function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12 px-4 text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* About Us */}
          <div className="lg:col-span-1">
            <h3
              className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("about")}
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              {t("aboutDescription")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("company")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("forCustomers")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/find-a-helper"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("findHelper")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-does-it-work"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("browseServices")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("pricingGuide")}
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("safetyTrust")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Taskers */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("forTaskers")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/become-a-helper"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("becomeHelper")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tasker-guide"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("gettingStarted")}
                </Link>
              </li>
              <li>
                <Link
                  href="/earnings"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("earningsCalculator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tasker-resources"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("resources")}
                </Link>
              </li>
              <li>
                <Link
                  href="/success-stories"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("successStories")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("support")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("cookiePolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/newsletter"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("newsletter")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--color-text-secondary)]">
              &copy; {CURRENT_YEAR} ManzelHelp.{" "}
              {t("allRightsReserved")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
