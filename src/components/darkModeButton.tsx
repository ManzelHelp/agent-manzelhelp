"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function DarkModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();

  // If theme is system, resolvedTheme will be either 'light' or 'dark'
  const currentTheme = resolvedTheme || theme;

  const handleToggle = () => {
    if (currentTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      {currentTheme === "dark" ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </Button>
  );
}

export default DarkModeToggle;
