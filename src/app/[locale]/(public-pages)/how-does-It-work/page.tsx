"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  MessageCircle,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Heart,
} from "lucide-react";

export default function HowItWorksPage() {
  const router = useRouter();
  const { user } = useUserStore();

  const handleGetStarted = () => {
    if (user) {
      // Redirect to appropriate dashboard based on user role
      router.push(`/${user.role}/dashboard`);
    } else {
      // Redirect to sign up
      router.push("/sign-up");
    }
  };

  const steps = [
    {
      icon: Search,
      title: "Find or Post",
      description: "Browse available services or post your own job request",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: MessageCircle,
      title: "Connect",
      description: "Chat with taskers or customers to discuss details",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: CheckCircle,
      title: "Get It Done",
      description: "Complete the task and leave reviews for each other",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Safe",
      description:
        "All transactions are protected with our secure payment system",
    },
    {
      icon: Star,
      title: "Quality Assured",
      description:
        "Verified taskers with reviews and ratings from real customers",
    },
    {
      icon: Clock,
      title: "Quick & Easy",
      description: "Find help or get hired in minutes, not days",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of users helping each other succeed",
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "For Customers",
      description:
        "Get help with tasks from skilled professionals in your area",
      items: [
        "Post any task you need help with",
        "Choose from verified taskers",
        "Pay securely when satisfied",
        "Rate and review your experience",
      ],
    },
    {
      icon: Heart,
      title: "For Taskers",
      description:
        "Earn money by helping others with your skills and expertise",
      items: [
        "Set your own schedule and rates",
        "Build your reputation with reviews",
        "Get paid quickly and securely",
        "Help your community while earning",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--color-secondary)] rounded-full opacity-5 sm:opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--color-accent)] rounded-full opacity-5 sm:opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Welcome to ManzelHelp
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              <span className="gradient-text">How It Works</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Connecting people who need help with those who can provide it.
              Simple, secure, and community-driven.
            </p>

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-lg text-white/80">
            Getting help or providing services has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 backdrop-blur-sm text-center"
            >
              <CardContent className="p-6 sm:p-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${step.bgColor} rounded-full mb-4`}
                >
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose ManzelHelp?
          </h2>
          <p className="text-lg text-white/80">
            Built with trust, security, and community in mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 backdrop-blur-sm text-center"
            >
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Benefits for Everyone
          </h2>
          <p className="text-lg text-white/80">
            Whether you need help or want to help others
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-[var(--color-secondary)]/10 rounded-full">
                    <benefit.icon className="h-5 w-5 text-[var(--color-secondary)]" />
                  </div>
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {benefit.description}
                </p>
                <ul className="space-y-2">
                  {benefit.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]"
                    >
                      <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm text-center">
          <CardContent className="p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              Join our community today and start helping or getting help
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {user ? "Go to Dashboard" : "Sign Up Now"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
