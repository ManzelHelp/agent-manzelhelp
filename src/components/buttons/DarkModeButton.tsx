"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function DarkModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // If theme is system, resolvedTheme will be either 'light' or 'dark'
  const currentTheme = resolvedTheme || theme;

  const handleToggle = () => {
    if (currentTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={handleToggle}
      >
        <div className="size-5" /> {/* Placeholder with same dimensions */}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className="h-8 w-8 hover:bg-background transition-colors shrink-0"
    >
      {currentTheme === "dark" ? (
        <Moon className="h-4 w-4 text-blue-400 fill-blue-400" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      )}
    </Button>
  );
}

export default DarkModeToggle;
