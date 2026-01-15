"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  currentLocale?: string; // langue actuelle
}

export function BackButton({
  className,
  variant = "ghost",
  size = "sm",
  onClick,
  currentLocale = "en",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Vérifie si l'historique du navigateur permet un retour
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback : redirige vers la page d'accueil de la locale actuelle
        router.push(`/${currentLocale}`);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "touch-target mobile-focus transition-all duration-200",
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
    </Button>
  );
}
