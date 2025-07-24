"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceCategory } from "@/types/supabase";
import { useState } from "react";

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
    <Card className="p-4 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">{t.filters}</h2>

      {/* Categories */}
      <div className="space-y-4 mb-6">
        <Label>{t.categories}</Label>
        <select
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)]"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
      <div className="space-y-4 mb-6">
        <Label>{t.priceRange}</Label>
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Area */}
      <div className="space-y-4 mb-6">
        <Label>{t.location}</Label>
        <Input
          placeholder={t.enterLocation}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Rating Filter */}
      <div className="space-y-4 mb-6">
        <Label>{t.rating}</Label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-[var(--color-border)]"
                checked={selectedRatings.includes(rating.toString())}
                onChange={() => handleRatingChange(rating.toString())}
              />
              <span className="flex items-center">
                {"★".repeat(rating)}
                <span className="text-[var(--color-text-secondary)]">
                  {"☆".repeat(5 - rating)}
                </span>
                & up
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
        onClick={applyFilters}
      >
        {t.applyFilters}
      </Button>
    </Card>
  );
}
