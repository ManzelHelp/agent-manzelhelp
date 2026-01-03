"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function ServiceSearchBar({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("search");
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
    );
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
            placeholder={t("placeholder")}
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
          <div className="absolute top-full left-0 right-0 mt-2 p-3 sm:p-4 bg-[var(--color-surface)] dark:bg-[var(--color-surface)] backdrop-blur-sm rounded-xl border border-[var(--color-border)] shadow-lg z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t("popularSearches")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                t("popularTerms.houseCleaning"),
                t("popularTerms.petCare"),
                t("popularTerms.furnitureAssembly"),
                t("popularTerms.eventPlanning"),
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    router.push(
                      `/${locale}/search?q=${encodeURIComponent(term)}`
                    );
                  }}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-[var(--color-accent)]/10 hover:bg-[var(--color-secondary)]/10 text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/50"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestions */}
        {searchQuery && isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg z-10">
            <div className="text-sm text-[var(--color-text-secondary)] mb-2">
              {t("pressEnterToSearch", { query: searchQuery })}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {t("trySearchingFor")}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
