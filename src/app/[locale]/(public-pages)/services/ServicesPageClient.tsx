"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  services: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

interface ServicesPageClientProps {
  serviceCategories: ServiceCategory[];
  locale: string;
  translations: {
    hero: {
      searchPlaceholder: string;
    };
    categories: {
      title: string;
      servicesCount: string;
    };
    servicesGrid: {
      title: string;
      description: string;
      rating: string;
      duration: string;
      location: string;
      viewServices: string;
    };
  };
}

export default function ServicesPageClient({
  serviceCategories,
  locale,
  translations,
}: ServicesPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    serviceCategories[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll to services on mobile when category is selected
  useEffect(() => {
    if (isMobile && servicesSectionRef.current) {
      setTimeout(() => {
        servicesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedCategory, isMobile]);

  const filteredCategories = serviceCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.services.some((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Helper function to format title and description with category name
  const formatText = (template: string, categoryName: string, lowercase = false) => {
    const name = lowercase ? categoryName.toLowerCase() : categoryName;
    return template.replace(/{category}/g, name);
  };

  return (
    <>
      {/* Search Bar */}
      <section className="bg-[var(--color-surface)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" />
            <input
              type="text"
              placeholder={translations.hero.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="relative bg-[var(--color-surface)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              {translations.categories.title}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide smooth-scroll pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`flex-shrink-0 w-64 sm:w-72 cursor-pointer transition-all duration-300 ${
                  selectedCategory.id === category.id
                    ? "scale-105 shadow-xl"
                    : "hover:scale-102"
                }`}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white h-full">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm opacity-75">
                        {translations.categories.servicesCount.replace(
                          "{count}",
                          category.services.length.toString()
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {isMobile && selectedCategory.id === category.id && (
                          <span className="text-xs opacity-75">
                            {translations.servicesGrid.viewServices}
                          </span>
                        )}
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section
        ref={servicesSectionRef}
        className="bg-[var(--color-bg)] py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {formatText(translations.servicesGrid.title, selectedCategory.name)}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {formatText(
                translations.servicesGrid.description,
                selectedCategory.name,
                true
              )}
            </p>
            {/* Mobile indicator */}
            {isMobile && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                <span>{selectedCategory.services.length} {translations.categories.servicesCount.replace("{count}", "").trim()}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCategory.services.map((service) => (
              <Card
                key={service.id}
                className="border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white dark:bg-[var(--color-surface)]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-white text-xl">
                      {selectedCategory.icon}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-secondary)]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {translations.servicesGrid.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Clock className="w-4 h-4" />
                      <span>{translations.servicesGrid.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <MapPin className="w-4 h-4" />
                      <span>{translations.servicesGrid.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
