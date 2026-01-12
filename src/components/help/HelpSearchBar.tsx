"use client";

import { Search } from "lucide-react";
import { useHelpSearch } from "./HelpSearchContext";

interface HelpSearchBarProps {
  placeholder: string;
}

export default function HelpSearchBar({ placeholder }: HelpSearchBarProps) {
  const { searchQuery, setSearchQuery } = useHelpSearch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
      />
    </div>
  );
}
