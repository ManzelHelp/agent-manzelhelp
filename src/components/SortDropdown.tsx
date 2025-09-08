"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

interface SortDropdownProps {
  currentSort?: string;
}

export default function SortDropdown({
  currentSort = "created_at",
}: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "created_at") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // Reset to page 1 when sorting changes
    params.delete("page");

    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-text-secondary)]">
        Sort by:
      </label>
      <select
        className="px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-primary)]"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
      >
        <option value="created_at">Newest First</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="reviews">Most Reviews</option>
      </select>
    </div>
  );
}
