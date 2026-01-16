"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setPreferredLanguageAction } from "@/actions/auth";

const languages = [
  {
    code: "en",
    short: "EN",
    name: "English",
    flag: "https://flagcdn.com/w40/gb.png",
  },
  {
    code: "de",
    short: "DE",
    name: "Deutsch",
    flag: "https://flagcdn.com/w40/de.png",
  },
  {
    code: "fr",
    short: "FR",
    name: "Français",
    flag: "https://flagcdn.com/w40/fr.png",
  },
  {
    code: "ar",
    short: "AR",
    name: "العربية",
    flag: "https://flagcdn.com/w40/ma.png",
  },
];

export default function LanguageDropDown({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  // LOGIQUE ANTI-HYDRATION ERROR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (locale: string) => {
    if (locale !== currentLocale) {
      // Persist on profile so DB triggers send notifications in the selected language
      void setPreferredLanguageAction(locale);
      router.push(pathname, { locale });
    }
  };

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  // Tant que le client n'est pas prêt, on rend un bouton inactif 
  // qui ressemble exactement au vrai bouton pour éviter le saut visuel.
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={cn("flex items-center", className)} disabled>
        <div className="mr-2 w-6 h-4 bg-muted animate-pulse rounded" />
        <span className="font-semibold text-sm">{currentLang.short}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center", className)}
          aria-label="Change language"
        >
          <img
            src={currentLang.flag}
            alt={currentLang.name}
            className="mr-2 w-6 h-4 object-cover rounded shadow-sm border border-border/50"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-semibold text-sm">{currentLang.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-md transition-colors",
              lang.code === currentLocale ? "bg-accent text-accent-foreground font-bold" : "hover:bg-accent/50"
            )}
          >
            <div className="relative w-6 h-4 shrink-0">
              <img
                src={lang.flag}
                alt={lang.name}
                className="w-full h-full object-cover rounded shadow-sm border border-border/50"
              />
            </div>
            <span className="flex-1 text-sm font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}