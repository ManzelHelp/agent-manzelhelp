"use client";

import HelpSearchBar from "./HelpSearchBar";

interface HelpPageContentProps {
  searchPlaceholder: string;
}

export default function HelpPageContent({
  searchPlaceholder,
}: HelpPageContentProps) {
  return <HelpSearchBar placeholder={searchPlaceholder} />;
}
