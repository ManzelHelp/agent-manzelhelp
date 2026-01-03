"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

interface SearchBarProps {
  defaultValue?: string;
  type?: "services" | "jobs";
}

function SearchBarContent({
  defaultValue = "",
  type = "services",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("search");
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/${locale}/search/${type}?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Search Input with Enhanced Styling */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={type === "jobs" ? t("jobPlaceholder") : t("placeholder")}
            className={`h-14 sm:h-16 text-base sm:text-lg px-6 sm:px-8 pr-16 sm:pr-20 rounded-2xl border-2 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${
              isFocused
                ? "border-[var(--color-secondary)] ring-4 ring-[var(--color-secondary)]/20"
                : "border-white/20 hover:border-[var(--color-secondary)]/50"
            }`}
          />

          {/* Search Button */}
          <Button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${
              searchQuery.trim() ? "opacity-100" : "opacity-80"
            }`}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline ml-2">{t("searchButton")}</span>
          </Button>
        </div>

        {/* Popular Searches Suggestion */}
        {!searchQuery && !isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[var(--color-surface)] dark:bg-[var(--color-surface)] backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {t("popularSearches")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                t.raw(type === "jobs" ? "popularJobTerms" : "popularTerms") as Record<string, string>
              ).map(([key, term]) => (
                <button
                  key={key}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 text-xs bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-text-primary)] rounded-full transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default function SearchBar(props: SearchBarProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show loading state until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-14 sm:h-16 bg-white/95 rounded-2xl animate-pulse" />
      </div>
    );
  }
  
  // Wrap in error boundary to handle next-intl context errors
  try {
    return <SearchBarContent {...props} />;
  } catch (error) {
    // If next-intl context is not available, show a simple fallback
    console.warn("SearchBar: next-intl context not available", error);
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-14 sm:h-16 bg-white/95 rounded-2xl animate-pulse" />
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/${locale}/search/${type}?q=${encodeURIComponent(query)}`);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-14 sm:h-16 bg-white/95 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Search Input with Enhanced Styling */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={type === "jobs" ? t("jobPlaceholder") : t("placeholder")}
            className={`h-14 sm:h-16 text-base sm:text-lg px-6 sm:px-8 pr-16 sm:pr-20 rounded-2xl border-2 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${
              isFocused
                ? "border-[var(--color-secondary)] ring-4 ring-[var(--color-secondary)]/20"
                : "border-white/20 hover:border-[var(--color-secondary)]/50"
            }`}
          />

          {/* Search Button */}
          <Button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${
              searchQuery.trim() ? "opacity-100" : "opacity-80"
            }`}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline ml-2">{t("searchButton")}</span>
          </Button>
        </div>

        {/* Popular Searches Suggestion */}
        {!searchQuery && !isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[var(--color-surface)] dark:bg-[var(--color-surface)] backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {t("popularSearches")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                t.raw(type === "jobs" ? "popularJobTerms" : "popularTerms") as Record<string, string>
              ).map(([key, term]) => (
                <button
                  key={key}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 text-xs bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-text-primary)] rounded-full transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
