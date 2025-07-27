"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";

export default function ServiceSearchBar({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-md mx-auto flex items-center gap-2 sm:gap-3"
    >
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search services..."
        className="h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-5 flex-1 rounded-lg sm:rounded-xl border-2 focus:border-[var(--color-secondary)] transition-all duration-200"
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 sm:h-14 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] transition-all duration-200 min-w-[48px] sm:min-w-[56px]"
      >
        <Search className="size-5 sm:size-6" />
      </Button>
    </form>
  );
}
