"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface HelpSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const HelpSearchContext = createContext<HelpSearchContextType | undefined>(
  undefined
);

export function HelpSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <HelpSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </HelpSearchContext.Provider>
  );
}

export function useHelpSearch() {
  const context = useContext(HelpSearchContext);
  if (!context) {
    throw new Error("useHelpSearch must be used within HelpSearchProvider");
  }
  return context;
}
