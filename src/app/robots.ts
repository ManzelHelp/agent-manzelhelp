import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/customer/",
          "/tasker/",
          "/api/",
          "/_next/",
          "/admin/",
          "/*.json$",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/customer/", "/tasker/", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://manzelhelp.com/sitemap.xml",
  };
}
