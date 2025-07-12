import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-8 px-4 text-[var(--color-text-secondary)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            About Us
          </h3>
          <p className="text-sm">
            Manzel Help connects people who need services with those who can
            provide them. Our mission is to make help accessible, friendly, and
            secure for everyone.
          </p>
        </div>
        {/* Company */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Company
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="#about"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#careers"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
        {/* Join Us */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Join Us
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="#signup"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                Sign Up
              </a>
            </li>
            <li>
              <a
                href="#become-helper"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                Become a Helper
              </a>
            </li>
            <li>
              <a
                href="#newsletter"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                Newsletter
              </a>
            </li>
          </ul>
        </div>
        {/* Most Used Services */}
        <div>
          <h3
            className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Most Used Services
          </h3>
          <ul className="space-y-1 text-sm">
            <li>Housekeeping</li>
            <li>Tutoring</li>
            <li>Pet Care</li>
            <li>Gardening</li>
            <li>Handyman</li>
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
