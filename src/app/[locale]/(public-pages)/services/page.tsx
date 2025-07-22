"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import type { ServiceCategory } from "@/types/supabase";
import Image from "next/image";

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("service_categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching service categories:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Our Most Popular Services
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)] flex flex-col items-center animate-pulse"
            >
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Our Most Popular Services
        </h1>
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Our Most Popular Services
      </h1>

      {categories.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg mb-4">No services available at the moment.</p>
          <p>Check back later for new service categories!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)] flex flex-col items-center group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                {category.icon_url ? (
                  <Image
                    src={category.icon_url}
                    alt={category.name_en}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-2xl text-primary">🔧</span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center group-hover:text-primary transition-colors">
                {category.name_en}
              </h2>
              <p className="text-gray-700 dark:text-gray-200 text-center text-sm leading-relaxed">
                {category.description_en ||
                  `Professional ${category.name_en.toLowerCase()} services tailored to your needs.`}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Looking for something specific? Our helpers offer a wide range of
          services within each category.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Find a Helper
          </button>
          <button className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
            Become a Helper
          </button>
        </div>
      </div>
    </div>
  );
}
