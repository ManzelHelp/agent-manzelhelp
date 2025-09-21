import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowRight, Search } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Blog - ManzelHelp",
    description:
      "Read the latest insights, tips, and stories from the ManzelHelp community. Learn about service industry trends, success stories, and best practices.",
    openGraph: {
      title: "Blog - ManzelHelp",
      description:
        "Read the latest insights, tips, and stories from the ManzelHelp community. Learn about service industry trends, success stories, and best practices.",
      locale: locale,
      type: "website",
    },
  };
}

const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Tips for New Taskers to Build a Successful Business",
    excerpt:
      "Learn the essential strategies that successful taskers use to build their reputation and grow their business on ManzelHelp.",
    author: "Sarah Johnson",
    authorRole: "Community Manager",
    publishDate: "2024-01-15",
    readTime: "5 min read",
    category: "Tasker Tips",
    image: "📈",
    featured: true,
  },
  {
    id: 2,
    title: "How to Choose the Right Helper for Your Home Cleaning Needs",
    excerpt:
      "A comprehensive guide for customers on selecting the perfect cleaning service provider for their specific requirements.",
    author: "Marcus Weber",
    authorRole: "Customer Success",
    publishDate: "2024-01-12",
    readTime: "4 min read",
    category: "Customer Guide",
    image: "🧹",
    featured: false,
  },
  {
    id: 3,
    title: "The Future of the Gig Economy: Trends and Predictions",
    excerpt:
      "Explore the latest trends in the gig economy and how platforms like ManzelHelp are shaping the future of work.",
    author: "Dr. Lisa Müller",
    authorRole: "Industry Expert",
    publishDate: "2024-01-10",
    readTime: "7 min read",
    category: "Industry Insights",
    image: "🚀",
    featured: false,
  },
  {
    id: 4,
    title: "Success Story: From Part-Time to Full-Time Tasker",
    excerpt:
      "Read how Emma transformed her part-time pet care gig into a thriving full-time business earning €2,500+ monthly.",
    author: "Emma Schmidt",
    authorRole: "Featured Tasker",
    publishDate: "2024-01-08",
    readTime: "6 min read",
    category: "Success Stories",
    image: "🐕",
    featured: true,
  },
  {
    id: 5,
    title: "Safety First: Best Practices for Taskers and Customers",
    excerpt:
      "Essential safety guidelines and best practices to ensure secure and positive experiences for everyone on the platform.",
    author: "Thomas Wagner",
    authorRole: "Safety Coordinator",
    publishDate: "2024-01-05",
    readTime: "5 min read",
    category: "Safety",
    image: "🛡️",
    featured: false,
  },
  {
    id: 6,
    title: "Pricing Your Services: A Complete Guide for Taskers",
    excerpt:
      "Learn how to set competitive and profitable rates for your services while remaining attractive to customers.",
    author: "David Chen",
    authorRole: "Business Advisor",
    publishDate: "2024-01-03",
    readTime: "8 min read",
    category: "Business Tips",
    image: "💰",
    featured: false,
  },
];

const CATEGORIES = [
  { name: "All", count: 6 },
  { name: "Tasker Tips", count: 2 },
  { name: "Customer Guide", count: 1 },
  { name: "Success Stories", count: 1 },
  { name: "Industry Insights", count: 1 },
  { name: "Safety", count: 1 },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featuredPosts = BLOG_POSTS.filter((post) => post.featured);
  const regularPosts = BLOG_POSTS.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            ManzelHelp Blog
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Insights, tips, and stories from our community. Stay updated with
            the latest trends, success stories, and best practices in the
            service industry.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category.name}
                <span className="ml-1 text-xs opacity-75">
                  ({category.count})
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Featured Articles
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card
                key={post.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{post.image}</span>
                    <div>
                      <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-3">{post.title}</CardTitle>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.authorRole}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(post.publishDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Latest Articles
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card
                key={post.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{post.image}</span>
                    <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg mb-3">{post.title}</CardTitle>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
            <CardContent>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Stay Updated
              </h2>
              <p className="text-lg mb-6 text-[var(--color-accent-light)]">
                Subscribe to our newsletter and never miss the latest insights,
                tips, and success stories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button
                  size="lg"
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
                >
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Whether you're looking for help or want to offer your services,
            ManzelHelp connects you with the right people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              Find a Helper
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
            >
              Become a Tasker
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
