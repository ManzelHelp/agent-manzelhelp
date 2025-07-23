"use client";

import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-8 px-4 text-[var(--color-text-secondary)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about")}
          </h3>
          <p className="text-sm">{t("aboutDescription")}</p>
        </div>
        {/* Company */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("company")}
          </h3>
          <ul className="space-y-1 text-sm">
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
          </ul>
        </div>
        {/* Join Us */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("joinUs")}
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/sign-up"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {t("signUp")}
              </Link>
            </li>
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
                href="/newsletter"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {t("newsletter")}
              </Link>
            </li>
          </ul>
        </div>
        {/* Most Used Services */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("popularServices")}
          </h3>
          <ul className="space-y-1 text-sm">
            <li>{t("housekeeping")}</li>
            <li>{t("tutoring")}</li>
            <li>{t("petCare")}</li>
            <li>{t("gardening")}</li>
            <li>{t("handyman")}</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
        {/* Social Media Links */}
        <div className="flex gap-4 mb-4 md:mb-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            <Facebook size={22} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            <Twitter size={22} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            <Instagram size={22} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            <Linkedin size={22} />
          </a>
        </div>
        <div className="text-xs">
          &copy; {new Date().getFullYear()} Manzel Help. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
