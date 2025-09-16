"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceCategory } from "@/types/supabase";
import { useState } from "react";
import { Filter, X, Star, MapPin, DollarSign, Tag } from "lucide-react";

interface SearchFiltersProps {
  categories: Pick<ServiceCategory, "id" | "name_en" | "name_fr" | "name_ar">[];
  locale: string;
  translations: {
    filters: string;
    priceRange: string;
    location: string;
    enterLocation: string;
    rating: string;
    applyFilters: string;
    categories: string;
    allCategories: string;
  };
}

export default function SearchFilters({
  categories,
  locale,
  translations: t,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-secondary)]/10 rounded-lg">
            <Filter className="w-5 h-5 text-[var(--color-secondary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {t.filters}
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <Tag className="w-4 h-4" />
            {t.categories}
          </Label>
          <select
            className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[var(--color-text-primary)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all duration-200"
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

              router.push(`/${locale}/search?${params.toString()}`);
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

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <DollarSign className="w-4 h-4" />
            {t.priceRange}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
                className="rounded-xl border-2 border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
                className="rounded-xl border-2 border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <MapPin className="w-4 h-4" />
            {t.location}
          </Label>
          <Input
            placeholder={t.enterLocation}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border-2 border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all duration-200"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <Star className="w-4 h-4" />
            {t.rating}
          </Label>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--color-accent)]/5 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-[var(--color-border)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]/20"
                  checked={selectedRatings.includes(rating.toString())}
                  onChange={() => handleRatingChange(rating.toString())}
                />
                <span className="flex items-center text-sm text-[var(--color-text-primary)]">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
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

        {/* Apply Button */}
        <Button
          className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          onClick={applyFilters}
        >
          {t.applyFilters}
        </Button>
      </div>
    </Card>
  );
}
