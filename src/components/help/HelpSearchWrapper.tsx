"use client";

import { useState } from "react";
import HelpSearchBar from "./HelpSearchBar";

interface HelpSearchWrapperProps {
  searchPlaceholder: string;
  onSearchChange: (query: string) => void;
}

export default function HelpSearchWrapper({
  searchPlaceholder,
  onSearchChange,
}: HelpSearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
  };

  return (
    <HelpSearchBar
      placeholder={searchPlaceholder}
      onSearch={handleSearch}
    />
  );
}
