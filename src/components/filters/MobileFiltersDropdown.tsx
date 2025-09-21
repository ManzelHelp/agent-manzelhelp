"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ServiceCategory } from "@/types/supabase";
import { Filter, X, ChevronDown } from "lucide-react";

interface MobileFiltersDropdownProps {
  categories: Pick<ServiceCategory, "id" | "name_en" | "name_fr" | "name_ar">[];
  locale: string;
  type?: "services" | "jobs";
  translations: {
    filters: string;
    priceRange: string;
    budgetRange: string;
    location: string;
    enterLocation: string;
    rating: string;
    applyFilters: string;
    categories: string;
    allCategories: string;
  };
}

export default function MobileFiltersDropdown({
  categories,
  locale,
  type = "services",
  translations: t,
}: MobileFiltersDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // State for filter values
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedRatings, setSelectedRatings] = useState<string[]>(
    searchParams.get("ratings")?.split(",") || []
  );

  // Handle rating checkbox changes
  const handleRatingChange = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setSelectedCategory("");
    setSelectedRatings([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    minPrice ||
    maxPrice ||
    location ||
    selectedCategory ||
    selectedRatings.length > 0;

  // Count active filters
  const activeFilterCount = [
    minPrice,
    maxPrice,
    location,
    selectedCategory,
    ...selectedRatings,
  ].filter(Boolean).length;

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    // Update search params
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (location) params.set("location", location);
    else params.delete("location");

    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedRatings.length > 0)
      params.set("ratings", selectedRatings.join(","));
    else params.delete("ratings");

    // Keep the search query if it exists
    const searchQuery = searchParams.get("q");
    if (searchQuery) params.set("q", searchQuery);

    // Navigate with updated filters
    router.push(`/${locale}/search/${type}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden relative" ref={dropdownRef}>
      {/* Mobile Filter Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/5 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">{t.filters}</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-[var(--color-secondary)] text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Mobile Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                {t.filters}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                {t.categories}
              </label>
              <select
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] text-sm"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // Apply category filter instantly
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    params.set("category", e.target.value);
                  } else {
                    params.delete("category");
                  }
                  // Keep other filters
                  const searchQuery = searchParams.get("q");
                  if (searchQuery) params.set("q", searchQuery);
                  if (minPrice) params.set("minPrice", minPrice);
                  if (maxPrice) params.set("maxPrice", maxPrice);
                  if (location) params.set("location", location);
                  if (selectedRatings.length > 0)
                    params.set("ratings", selectedRatings.join(","));

                  router.push(`/${locale}/search/${type}?${params.toString()}`);
                }}
              >
                <option value="">{t.allCategories}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category[`name_${locale}` as keyof typeof category] ||
                      category.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Price/Budget Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                {type === "jobs" ? t.budgetRange : t.priceRange}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min={0}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] text-sm"
                />
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                {t.location}
              </label>
              <input
                type="text"
                placeholder={t.enterLocation}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] text-sm"
              />
            </div>

            {/* Rating Filter - Only for services */}
            {type === "services" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  {t.rating}
                </label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--color-accent)]/5 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border border-[var(--color-border)] text-[var(--color-secondary)]"
                        checked={selectedRatings.includes(rating.toString())}
                        onChange={() => handleRatingChange(rating.toString())}
                      />
                      <span className="flex items-center text-sm text-[var(--color-text-primary)]">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-[var(--color-text-secondary)]">
                          {rating} star{rating > 1 ? "s" : ""} & up
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button
              className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-medium py-2 rounded-lg"
              onClick={applyFilters}
            >
              {t.applyFilters}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
