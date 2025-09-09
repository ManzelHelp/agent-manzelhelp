"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { getDetailedCategories } from "@/lib/categories";

// Use centralized service categories
const serviceCategories = getDetailedCategories();

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState(
    serviceCategories[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = serviceCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.services.some((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-[var(--color-accent-light)] max-w-3xl mx-auto">
              Discover professional services tailored to your needs. From home
              maintenance to personal care, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative bg-[var(--color-surface)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              Service Categories
            </h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors mobile-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors mobile-button"
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
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 w-64 sm:w-72 cursor-pointer transition-all duration-300 mobile-button ${
                  selectedCategory.id === category.id
                    ? "scale-105 shadow-xl"
                    : "hover:scale-102"
                }`}
              >
                <div
                  className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white h-full flex flex-col justify-between`}
                >
                  <div>
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm opacity-75">
                      {category.services.length} services
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              {selectedCategory.name} Services
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Professional {selectedCategory.name.toLowerCase()} services
              delivered by verified experts in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCategory.services.map((service) => (
              <div
                key={service.id}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 cursor-pointer group mobile-button"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-white text-xl">
                    {selectedCategory.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--color-secondary)]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
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
                    <span>2-4 hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    <span>Local</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-[var(--color-accent-light)]">
            Connect with verified professionals in your area and get the job
            done right.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[var(--color-secondary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary-light)] transition-colors mobile-button">
              Find a Helper
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors mobile-button">
              Become a Helper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
