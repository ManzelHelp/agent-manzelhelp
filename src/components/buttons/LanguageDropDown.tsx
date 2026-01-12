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

const languages = [
  { code: "en", short: "EN", name: "English" },
  { code: "de", short: "DE", name: "Deutsch" },
  { code: "fr", short: "FR", name: "Français" },
  { code: "ar", short: "AR", name: "العربية" },
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
      router.push(pathname, { locale });
    }
  };

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  // Tant que le client n'est pas prêt, on rend un bouton inactif 
  // qui ressemble exactement au vrai bouton pour éviter le saut visuel.
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={className} disabled>
        <span className="font-semibold">{currentLang.short}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Change language"
        >
          <span className="font-semibold">{currentLang.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={lang.code === currentLocale ? "font-bold" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}