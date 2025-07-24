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
      className="w-full max-w-md mx-auto mb-10 flex items-center gap-2"
    >
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search services..."
        className="h-12 text-lg px-5 flex-1"
      />
      <Button type="submit" size="lg" className="h-12 px-4">
        <Search className="size-5" />
      </Button>
    </form>
  );
}
