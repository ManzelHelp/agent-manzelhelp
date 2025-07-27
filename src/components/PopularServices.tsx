"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ServiceCategory } from "@/types/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface PopularServicesProps {
  categories: Pick<ServiceCategory, "id" | "name_en" | "name_fr" | "name_ar">[];
  locale: string;
}

export default function PopularServices({
  categories,
  locale,
}: PopularServicesProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/${locale}/search?category=${categoryId}`);
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h2
        className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center px-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Popular Services
      </h2>

      {/* Mobile: Horizontal Scrollable Container */}
      <div className="relative">
        {/* Scroll Left Button - Mobile Only */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 lg:hidden transition-all duration-200 hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        {/* Scroll Right Button - Mobile Only */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 lg:hidden transition-all duration-200 hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-2 lg:px-0 lg:flex-wrap lg:justify-center lg:overflow-visible"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.slice(0, 8).map((category) => (
            <Badge
              key={category.id}
              variant="default"
              onClick={() => handleCategoryClick(category.id)}
              className="text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5 hover:scale-105 transition-transform cursor-pointer bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white border-0 shadow-sm hover:shadow-md flex-shrink-0 lg:flex-shrink"
            >
              {category[`name_${locale}` as keyof typeof category] ||
                category.name_en}
            </Badge>
          ))}
        </div>
      </div>

      {/* Scroll Indicators - Mobile Only */}
      <div className="flex justify-center gap-1 mt-4 lg:hidden">
        {Array.from({ length: Math.ceil(categories.length / 4) }).map(
          (_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200"
            />
          )
        )}
      </div>
    </section>
  );
}
