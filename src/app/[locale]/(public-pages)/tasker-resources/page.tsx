import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Video,
  FileText,
  Users,
  Download,
  ExternalLink,
  Star,
  Clock,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Tasker Resources - ManzelHelp",
    description:
      "Essential resources for ManzelHelp taskers. Guides, tutorials, tools, and tips to help you succeed as a service provider.",
    openGraph: {
      title: "Tasker Resources - ManzelHelp",
      description:
        "Essential resources for ManzelHelp taskers. Guides, tutorials, tools, and tips to help you succeed as a service provider.",
      locale: locale,
      type: "website",
    },
  };
}

const RESOURCE_CATEGORIES = [
  {
    title: "Getting Started",
    icon: <BookOpen className="w-6 h-6" />,
    resources: [
      {
        title: "Complete Tasker Guide",
        type: "PDF Guide",
        description: "Step-by-step guide to becoming a successful tasker",
        download: true,
        rating: 4.9,
        downloads: "2.5K",
      },
      {
        title: "Profile Optimization Tips",
        type: "Article",
        description:
          "Learn how to create an attractive profile that gets bookings",
        download: false,
        rating: 4.8,
        downloads: "1.8K",
      },
      {
        title: "Setting Your Rates",
        type: "Calculator",
        description: "Interactive tool to help you set competitive pricing",
        download: false,
        rating: 4.7,
        downloads: "3.2K",
      },
    ],
  },
  {
    title: "Video Tutorials",
    icon: <Video className="w-6 h-6" />,
    resources: [
      {
        title: "Platform Walkthrough",
        type: "Video",
        description: "Complete tour of the ManzelHelp platform for new taskers",
        download: false,
        rating: 4.9,
        downloads: "5.1K",
      },
      {
        title: "Customer Communication",
        type: "Video",
        description: "Best practices for communicating with customers",
        download: false,
        rating: 4.8,
        downloads: "2.9K",
      },
      {
        title: "Service Delivery Tips",
        type: "Video",
        description: "How to deliver exceptional service and get great reviews",
        download: false,
        rating: 4.9,
        downloads: "4.3K",
      },
    ],
  },
  {
    title: "Business Tools",
    icon: <FileText className="w-6 h-6" />,
    resources: [
      {
        title: "Invoice Template",
        type: "Template",
        description: "Professional invoice template for your services",
        download: true,
        rating: 4.6,
        downloads: "1.2K",
      },
      {
        title: "Service Agreement Template",
        type: "Template",
        description: "Standard service agreement for your customers",
        download: true,
        rating: 4.7,
        downloads: "980",
      },
      {
        title: "Tax Guide for Taskers",
        type: "PDF Guide",
        description: "Everything you need to know about taxes as a tasker",
        download: true,
        rating: 4.8,
        downloads: "1.5K",
      },
    ],
  },
  {
    title: "Community",
    icon: <Users className="w-6 h-6" />,
    resources: [
      {
        title: "Tasker Forum",
        type: "Community",
        description: "Connect with other taskers and share experiences",
        download: false,
        rating: 4.8,
        downloads: "Active",
      },
      {
        title: "Success Stories",
        type: "Articles",
        description: "Read inspiring stories from successful taskers",
        download: false,
        rating: 4.9,
        downloads: "2.1K",
      },
      {
        title: "Monthly Webinars",
        type: "Live Events",
        description: "Join our monthly webinars for tips and updates",
        download: false,
        rating: 4.7,
        downloads: "Live",
      },
    ],
  },
];

const QUICK_TIPS = [
  {
    tip: "Always respond to messages within 2 hours to increase your chances of getting hired",
    category: "Communication",
  },
  {
    tip: "Take high-quality photos of your work to showcase your skills in your profile",
    category: "Profile",
  },
  {
    tip: "Set competitive but fair rates based on your experience and local market",
    category: "Pricing",
  },
  {
    tip: "Keep your availability updated to get more booking requests",
    category: "Availability",
  },
  {
    tip: "Ask satisfied customers for reviews to build your reputation",
    category: "Reviews",
  },
  {
    tip: "Invest in quality tools and equipment to deliver better service",
    category: "Equipment",
  },
];

export default async function TaskerResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Tasker Resources
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Everything you need to succeed as a ManzelHelp tasker. Guides,
            tools, templates, and community support to help you grow your
            business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Browse Resources
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Resource Library
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="space-y-12">
            {RESOURCE_CATEGORIES.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    {category.title}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.resources.map((resource, resourceIndex) => (
                    <Card
                      key={resourceIndex}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">
                              {resource.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                                {resource.type}
                              </span>
                              {resource.download && (
                                <Download className="w-3 h-3 text-[var(--color-text-secondary)]" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-[var(--color-text-secondary)]">
                              {resource.rating}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {resource.downloads}{" "}
                            {resource.download ? "downloads" : "views"}
                          </span>
                          <Button
                            size="sm"
                            variant={resource.download ? "default" : "outline"}
                            className="text-xs"
                          >
                            {resource.download ? (
                              <>
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Quick Success Tips
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_TIPS.map((item, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-primary)] font-semibold mb-1">
                      {item.category}
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {item.tip}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Join Our Tasker Community
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Connect with thousands of successful taskers, share experiences, and
            learn from each other in our vibrant community.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Users className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Tasker Forum
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Ask questions, share tips, and connect with other taskers
              </p>
              <Button variant="outline" size="sm">
                Join Forum
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <Video className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Live Webinars
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Monthly webinars with tips, updates, and Q&A sessions
              </p>
              <Button variant="outline" size="sm">
                View Schedule
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Ready to Start Your Tasker Journey?
          </h2>
          <p className="text-lg mb-8 text-[var(--color-accent-light)]">
            Join thousands of successful taskers who are already earning money
            on ManzelHelp. Use these resources to build your business and
            achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Become a Tasker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Browse All Resources
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
