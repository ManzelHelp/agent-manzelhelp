import { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const host = "https://manzelhelp.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/search",
    "/services",
    "/about-us",
    "/become-a-helper",
    "/find-a-helper",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const page of staticPages) {
      const pathname = await getPathname({ locale, href: page });

      // Generate language alternates
      const languageAlternates: Record<string, string> = {};
      for (const loc of routing.locales) {
        const altPathname = await getPathname({ locale: loc, href: page });
        languageAlternates[loc] = host + altPathname;
      }

      sitemapEntries.push({
        url: host + pathname,
        lastModified: new Date(),
        alternates: {
          languages: languageAlternates,
        },
      });
    }
  }

  return sitemapEntries;
}
