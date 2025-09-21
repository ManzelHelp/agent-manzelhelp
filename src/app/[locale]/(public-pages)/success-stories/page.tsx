import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Success Stories - ManzelHelp",
    description:
      "Read inspiring success stories from ManzelHelp taskers and customers. Learn how our platform has helped people achieve their goals.",
    openGraph: {
      title: "Success Stories - ManzelHelp",
      description:
        "Read inspiring success stories from ManzelHelp taskers and customers. Learn how our platform has helped people achieve their goals.",
      locale: locale,
      type: "website",
    },
  };
}

const SUCCESS_STORIES = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Cleaning Specialist",
    location: "Berlin, Germany",
    avatar: "👩‍💼",
    earnings: "€2,500/month",
    rating: 4.9,
    reviews: 127,
    story:
      "I started cleaning part-time while studying, and now it's my full-time career. ManzelHelp gave me the flexibility to work around my schedule and build a loyal customer base.",
    quote:
      "ManzelHelp transformed my life. I went from struggling student to successful business owner in just 8 months.",
    services: ["House Cleaning", "Deep Cleaning", "Office Cleaning"],
    joinDate: "March 2023",
    achievements: ["Top Rated Tasker", "100+ Happy Customers", "€30K+ Earned"],
  },
  {
    id: 2,
    name: "Marcus Weber",
    role: "Handyman",
    location: "Munich, Germany",
    avatar: "👨‍🔧",
    earnings: "€3,200/month",
    rating: 4.8,
    reviews: 89,
    story:
      "After losing my job, I turned to ManzelHelp to use my handyman skills. Now I'm earning more than I ever did in my previous career, and I love being my own boss.",
    quote:
      "The platform connected me with customers who appreciate quality work. I've built lasting relationships and a thriving business.",
    services: ["Furniture Assembly", "Minor Repairs", "Painting"],
    joinDate: "January 2023",
    achievements: ["Featured Tasker", "5-Star Rating", "€40K+ Earned"],
  },
  {
    id: 3,
    name: "Emma Schmidt",
    role: "Pet Care Specialist",
    location: "Hamburg, Germany",
    avatar: "👩‍⚕️",
    earnings: "€1,800/month",
    rating: 5.0,
    reviews: 156,
    story:
      "As a veterinary student, ManzelHelp allowed me to gain practical experience while earning money. I've helped over 200 pets and their families.",
    quote:
      "Every day is different, and I get to do what I love while helping pets and their owners. It's the perfect job for me.",
    services: ["Dog Walking", "Pet Sitting", "Pet Grooming"],
    joinDate: "September 2022",
    achievements: ["Pet Care Expert", "200+ Pets Helped", "€25K+ Earned"],
  },
  {
    id: 4,
    name: "David Chen",
    role: "Tutor",
    location: "Frankfurt, Germany",
    avatar: "👨‍🏫",
    earnings: "€2,800/month",
    rating: 4.9,
    reviews: 98,
    story:
      "I started tutoring to help students during the pandemic. Now I have a full schedule of students and have helped dozens improve their grades.",
    quote:
      "Seeing my students succeed is the most rewarding part of this job. ManzelHelp made it easy to find students who need help.",
    services: ["Math Tutoring", "Science Tutoring", "Test Preparation"],
    joinDate: "November 2022",
    achievements: [
      "Academic Success Coach",
      "50+ Students Helped",
      "€35K+ Earned",
    ],
  },
  {
    id: 5,
    name: "Lisa Müller",
    role: "Customer",
    location: "Cologne, Germany",
    avatar: "👩‍💻",
    story:
      "As a busy working mom, ManzelHelp has been a lifesaver. I've found reliable help for cleaning, pet care, and even tutoring for my kids.",
    quote:
      "The quality of service is outstanding, and I love supporting local taskers. It's like having a personal assistant for everything I need.",
    services: ["House Cleaning", "Pet Care", "Tutoring"],
    joinDate: "February 2023",
    achievements: [
      "50+ Services Booked",
      "Loyal Customer",
      "5-Star Reviews Given",
    ],
  },
  {
    id: 6,
    name: "Thomas Wagner",
    role: "Gardening Specialist",
    location: "Stuttgart, Germany",
    avatar: "👨‍🌾",
    earnings: "€2,200/month",
    rating: 4.8,
    reviews: 73,
    story:
      "I turned my passion for gardening into a profitable business. ManzelHelp helped me find customers who appreciate beautiful outdoor spaces.",
    quote:
      "I get to work outdoors doing what I love, and the income is steady and reliable. It's the perfect career change.",
    services: ["Garden Maintenance", "Landscaping", "Plant Care"],
    joinDate: "April 2023",
    achievements: ["Garden Expert", "80+ Gardens Transformed", "€28K+ Earned"],
  },
];

const STATISTICS = [
  {
    number: "10,000+",
    label: "Active Taskers",
    icon: <Users className="w-6 h-6" />,
  },
  {
    number: "€2M+",
    label: "Total Earnings",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    number: "4.9★",
    label: "Average Rating",
    icon: <Star className="w-6 h-6" />,
  },
  {
    number: "50,000+",
    label: "Happy Customers",
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

export default async function SuccessStoriesPage({
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
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Success Stories
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Discover how ManzelHelp has transformed lives and created
            opportunities for thousands of people. Read inspiring stories from
            our community of successful taskers and satisfied customers.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Our Community Impact
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATISTICS.map((stat, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Featured Success Stories
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {SUCCESS_STORIES.map((story) => (
              <Card
                key={story.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{story.avatar}</div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">
                        {story.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-2">
                        <span>{story.role}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </div>
                      </div>
                      {story.earnings && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{story.rating}</span>
                            <span className="text-[var(--color-text-secondary)]">
                              ({story.reviews} reviews)
                            </span>
                          </div>
                          <div className="text-[var(--color-primary)] font-semibold">
                            {story.earnings}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Quote className="w-5 h-5 text-[var(--color-primary)] mb-2" />
                    <p className="text-[var(--color-text-secondary)] italic mb-4">
                      "{story.quote}"
                    </p>
                    <p className="text-[var(--color-text-secondary)]">
                      {story.story}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                        Services Offered:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {story.services.map((service, serviceIndex) => (
                          <span
                            key={serviceIndex}
                            className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                        Key Achievements:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {story.achievements.map(
                          (achievement, achievementIndex) => (
                            <span
                              key={achievementIndex}
                              className="text-xs bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-2 py-1 rounded-full"
                            >
                              {achievement}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <Clock className="w-3 h-3" />
                      <span>Joined {story.joinDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of successful taskers and customers who have found
            their perfect match on ManzelHelp. Your success story could be next!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              Become a Tasker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
            >
              Find a Helper
            </Button>
          </div>
        </div>
      </section>

      {/* Share Your Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Share Your Story
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Have a success story to share? We'd love to hear how ManzelHelp has
            helped you achieve your goals.
          </p>
          <Button
            size="lg"
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
          >
            Submit Your Story
          </Button>
        </div>
      </section>
    </div>
  );
}
