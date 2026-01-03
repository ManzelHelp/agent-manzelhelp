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
}

export function BackButton({
  className,
  variant = "ghost",
  size = "sm",
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
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

