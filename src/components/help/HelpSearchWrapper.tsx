"use client";

import HelpSearchBar from "./HelpSearchBar";

interface HelpSearchWrapperProps {
  searchPlaceholder: string;
}

export default function HelpSearchWrapper({
  searchPlaceholder,
}: HelpSearchWrapperProps) {
  // HelpSearchBar uses useHelpSearch context internally for search state
  return (
    <HelpSearchBar placeholder={searchPlaceholder} />
  );
}
