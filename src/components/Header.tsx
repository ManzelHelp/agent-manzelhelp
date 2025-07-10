import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Manzel Help
          </span>
        </div>
        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link
            href="#about"
            className="hover:text-[var(--color-primary)] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            About Us
          </Link>
          <Button asChild variant="secondary">
            <Link href="#login" style={{ fontFamily: "var(--font-sans)" }}>
              Login
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="#signout" style={{ fontFamily: "var(--font-sans)" }}>
              Sign Out
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
