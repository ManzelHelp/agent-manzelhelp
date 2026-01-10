"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", short: "EN" },
  { code: "de", short: "DE" },
  { code: "fr", short: "FR" },
  { code: "ar", short: "AR" },
];

export default function LanguageDropDown({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common.languages");

  const handleChange = (locale: string) => {
    if (locale !== currentLocale) {
      // Use next-intl's router which handles locale switching properly
      router.push(pathname, { locale });
    }
  };

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

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
            {t(lang.code as "en" | "de" | "fr" | "ar")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
