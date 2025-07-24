"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ServiceCategory } from "@/types/supabase";

interface PopularServicesProps {
  categories: Pick<ServiceCategory, "id" | "name_en" | "name_fr" | "name_ar">[];
  locale: string;
}

export default function PopularServices({
  categories,
  locale,
}: PopularServicesProps) {
  const router = useRouter();

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/${locale}/search?category=${categoryId}`);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mb-12">
      <h2
        className="text-xl font-semibold mb-6 text-center"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Popular Services
      </h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.slice(0, 8).map((category) => (
          <Badge
            key={category.id}
            variant="default"
            onClick={() => handleCategoryClick(category.id)}
            className="text-base hover:scale-105 transition-transform"
          >
            {category[`name_${locale}` as keyof typeof category] ||
              category.name_en}
          </Badge>
        ))}
      </div>
    </section>
  );
}
