"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  MessageSquare,
  Clock,
} from "lucide-react";

interface SortDropdownProps {
  currentSort?: string;
  type?: "services" | "jobs";
}

export default function SortDropdown({
  currentSort = "created_at",
  type = "services",
}: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("search");

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "created_at") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // Reset to page 1 when sorting changes
    params.delete("page");

    router.push(`/${locale}/search/${type}?${params.toString()}`);
  };

  const sortOptions = [
    { value: "created_at", label: t("sortOptions.newestFirst"), icon: Clock },
    {
      value: "price_low",
      label: type === "jobs" ? t("sortOptions.budgetLowToHigh") : t("sortOptions.priceLowToHigh"),
      icon: ArrowUp,
    },
    {
      value: "price_high",
      label: type === "jobs" ? t("sortOptions.budgetHighToLow") : t("sortOptions.priceHighToLow"),
      icon: ArrowDown,
    },
    ...(type === "services"
      ? [
          { value: "rating", label: t("sortOptions.highestRated"), icon: Star },
          { value: "reviews", label: t("sortOptions.mostReviews"), icon: MessageSquare },
        ]
      : [
          { value: "date", label: t("sortOptions.dateEarliestFirst"), icon: Clock },
          {
            value: "applications",
            label: t("sortOptions.mostApplications"),
            icon: MessageSquare,
          },
        ]),
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          {t("sortBy")}
        </label>
      </div>
      <div className="relative">
        <select
          className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-10 border-2 border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] font-medium focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all duration-200 cursor-pointer min-w-[180px] text-sm sm:text-base"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-[var(--color-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
