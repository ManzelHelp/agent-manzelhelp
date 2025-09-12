import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Heart, Zap, Globe, Award, Coffee } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: t("careers"),
    description:
      "Join the ManzelHelp team! Explore career opportunities and help us build the future of local services.",
    openGraph: {
      title: t("careers"),
      description:
        "Join the ManzelHelp team! Explore career opportunities and help us build the future of local services.",
      locale: locale,
      type: "website",
    },
  };
}

const BENEFITS = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Health & Wellness",
    description: "Comprehensive health insurance and wellness programs",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Flexible Work",
    description: "Remote work options and flexible schedules",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Impact",
    description: "Make a difference in communities worldwide",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Career Growth",
    description: "Professional development and advancement opportunities",
  },
  {
    icon: <Coffee className="w-6 h-6" />,
    title: "Great Culture",
    description: "Collaborative environment with amazing colleagues",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Building",
    description: "Regular team events and company retreats",
  },
];

const OPEN_POSITIONS = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build amazing user experiences with React and Next.js",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Berlin, Germany",
    type: "Full-time",
    description: "Shape the future of our platform and user experience",
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    description: "Help our users succeed and grow our community",
  },
  {
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Drive growth and brand awareness across channels",
  },
];

export default async function CareersPage({
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Help us build the future of local services. Join a passionate team
            that's making a real difference in communities around the world.
          </p>
          <Button
            size="lg"
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
          >
            View Open Positions
          </Button>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Why Work With Us?
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {benefit.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
            At ManzelHelp, we believe in the power of community and the value of
            human connection. We're building a platform that brings people
            together, creates economic opportunities, and makes life easier for
            everyone. Join us in creating a world where help is always just a
            click away.
          </p>
          <div className="grid sm:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                10K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Active Helpers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                50K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                100K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Services Completed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Open Positions
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-6">
            {OPEN_POSITIONS.map((position, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-1 rounded-full text-xs">
                        {position.type}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">
                      {position.description}
                    </p>
                  </div>
                  <Button variant="outline" className="md:ml-4">
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[var(--color-text-secondary)] mb-4">
              Don't see a position that fits? We're always looking for talented
              people.
            </p>
            <Button variant="outline">Send Us Your Resume</Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Our Culture & Values
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                Innovation
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We embrace new ideas and technologies to solve real-world
                problems and improve user experiences.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                Community
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We believe in the power of community and work to strengthen
                connections between people.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                Trust
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We build trust through transparency, reliability, and putting
                our users first in everything we do.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                Growth
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We're committed to personal and professional growth for our team
                members and our community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
