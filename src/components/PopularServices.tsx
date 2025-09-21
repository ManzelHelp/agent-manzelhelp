import React from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Zap,
  Heart,
  Shield,
  CheckCircle,
} from "lucide-react";
import { getCategoryName } from "@/lib/categories";
import { Category } from "@/lib/categories";

interface PopularServicesProps {
  categories: Pick<
    Category,
    "id" | "name_en" | "name_de" | "name_fr" | "name_ar"
  >[];
  locale: string;
}

// Icon mapping for different service categories
const categoryIcons: Record<
  number,
  React.ComponentType<{ className?: string }>
> = {
  1: Users, // House Cleaning
  2: Zap, // Handyman Services
  3: Heart, // Gardening
  4: Heart, // Pet Care
  5: Star, // Tutoring
  6: Users, // Moving & Packing
  7: Zap, // Car Services
  8: Sparkles, // Event Planning
};

// Color mapping for different service categories
const categoryColors: Record<number, string> = {
  1: "from-[var(--color-primary)] to-[var(--color-primary-light)]", // House Cleaning
  2: "from-[var(--color-secondary)] to-[var(--color-secondary-light)]", // Handyman Services
  3: "from-[var(--color-accent)] to-[var(--color-accent-light)]", // Gardening
  4: "from-[var(--color-primary)] to-[var(--color-primary-light)]", // Pet Care
  5: "from-[var(--color-secondary)] to-[var(--color-secondary-light)]", // Tutoring
  6: "from-[var(--color-accent)] to-[var(--color-accent-light)]", // Moving & Packing
  7: "from-[var(--color-primary)] to-[var(--color-primary-light)]", // Car Services
  8: "from-[var(--color-secondary)] to-[var(--color-secondary-light)]", // Event Planning
};

function PopularServices({ categories, locale }: PopularServicesProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3 bg-[var(--color-primary)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-primary)]/20">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-primary)]">
              Popular Services
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[var(--color-primary)] px-2 leading-tight">
            Explore Our Services
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto px-2 leading-relaxed font-light">
            Discover the most popular service categories and find the perfect
            tasker for your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.id] || Star;
            const gradientClass =
              categoryColors[category.id] ||
              "from-[var(--color-primary)] to-[var(--color-primary-light)]";

            return (
              <Link
                key={category.id}
                href={`/${locale}/search/services?category=${category.id}`}
                className="group transform transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="group h-full p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient top border */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}
                  ></div>

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>

                    {/* Category Name */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                      {getCategoryName(category, locale)}
                    </h3>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                      Professional services in this category
                    </p>

                    {/* CTA Button */}
                    <div className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold group-hover:gap-3 transition-all duration-300">
                      <span>Explore Services</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Enhanced View All Services Button */}
        <div className="text-center mt-12 sm:mt-16">
          <Link href={`/${locale}/search/services`}>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold min-h-[56px] sm:min-h-[64px] rounded-2xl border-0"
            >
              <span className="flex items-center gap-3">
                View All Services
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-12 sm:mt-16 text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--color-secondary)]" />
            <span className="text-sm font-medium">Verified Taskers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="text-sm font-medium">Quality Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Top Rated</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PopularServices;
