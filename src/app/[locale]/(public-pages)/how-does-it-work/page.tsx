"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
  UserPlus,
  Briefcase,
  FileText,
  CheckCircle2,
  Calendar,
  DollarSign,
  MessageSquare,
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

  const customerSteps = [
    {
      icon: FileText,
      title: "Post Your Job",
      description:
        "Create a detailed job posting under 'My Jobs' with requirements, budget, and timeline",
      details: [
        "Describe what you need help with",
        "Set your budget range",
        "Specify location and timing",
        "Add any special requirements",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Users,
      title: "Review Applications",
      description:
        "Taskers will apply to your job posting. Review their profiles, ratings, and proposals",
      details: [
        "Compare multiple tasker applications",
        "Check ratings and reviews",
        "Read their proposals and pricing",
        "View their portfolio and experience",
      ],
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: MessageCircle,
      title: "Connect & Discuss",
      description:
        "Message selected taskers to discuss details, ask questions, and finalize arrangements",
      details: [
        "Chat directly with taskers",
        "Clarify job requirements",
        "Negotiate pricing if needed",
        "Schedule the service",
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: CheckCircle,
      title: "Get It Done",
      description:
        "Tasker completes the work, you review and pay securely through the platform",
      details: [
        "Tasker completes the service",
        "Review the completed work",
        "Pay securely through ManzelHelp",
        "Leave a rating and review",
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const taskerSteps = [
    {
      icon: UserPlus,
      title: "Sign Up & Get Approved",
      description:
        "Create your account, complete your profile, and wait for platform approval",
      details: [
        "Create your ManzelHelp account",
        "Complete your profile with skills and experience",
        "Upload verification documents",
        "Wait for approval (usually 24-48 hours)",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Briefcase,
      title: "Set Up Your Services",
      description:
        "Create service listings under 'My Services' and apply to customer job postings",
      details: [
        "List your services with descriptions and pricing",
        "Set your availability and service areas",
        "Browse and apply to customer job postings",
        "Create compelling proposals for jobs",
      ],
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: MessageSquare,
      title: "Communicate & Book",
      description:
        "Respond to customer messages, discuss job details, and secure bookings",
      details: [
        "Respond quickly to customer inquiries",
        "Answer questions about your services",
        "Negotiate terms and pricing",
        "Confirm bookings and schedules",
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: DollarSign,
      title: "Complete & Get Paid",
      description:
        "Deliver excellent service, get paid securely, and build your reputation",
      details: [
        "Complete the service to customer satisfaction",
        "Get paid securely through the platform",
        "Receive ratings and reviews",
        "Build your reputation for future jobs",
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const customerFeatures = [
    {
      icon: FileText,
      title: "Post Jobs",
      description: "Create detailed job postings and let taskers apply to you",
      benefits: [
        "Multiple applications to choose from",
        "Compare pricing and experience",
        "Set your own timeline",
      ],
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description:
        "Message any tasker offering services to discuss and book directly",
      benefits: [
        "Instant communication",
        "Ask questions before booking",
        "Build relationships",
      ],
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Pay safely through our platform with money-back guarantee",
      benefits: [
        "Protected transactions",
        "Dispute resolution",
        "Refund protection",
      ],
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "All taskers are verified with reviews and ratings",
      benefits: ["Background checks", "Customer reviews", "Quality ratings"],
    },
  ];

  const taskerFeatures = [
    {
      icon: Briefcase,
      title: "Dual Opportunities",
      description: "Apply to customer jobs AND offer your own services",
      benefits: [
        "Multiple income streams",
        "Flexible work options",
        "Customer privileges too",
      ],
    },
    {
      icon: CheckCircle2,
      title: "Verification Process",
      description: "Get approved to build trust with customers",
      benefits: [
        "Background verification",
        "Skill assessment",
        "Profile verification",
      ],
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Set your own availability and work when you want",
      benefits: [
        "Choose your hours",
        "Work part-time or full-time",
        "Take breaks when needed",
      ],
    },
    {
      icon: DollarSign,
      title: "Secure Earnings",
      description: "Get paid quickly and securely for completed work",
      benefits: ["Fast payments", "Secure transactions", "No payment delays"],
    },
  ];

  const platformFeatures = [
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

      {/* How It Works Overview */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How ManzelHelp Works
          </h2>
          <p className="text-lg text-white/80">
            Two ways to connect: Post jobs for taskers to apply, or browse and
            book services directly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Overview */}
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                For Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Get help with any task by posting jobs or booking services
                directly from taskers.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Post detailed job requests under "My Jobs"
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Review multiple tasker applications
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Message taskers offering services directly
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Pay securely when satisfied
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tasker Overview */}
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                For Taskers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Earn money by applying to customer jobs and offering your own
                services.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Get approved after verification
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Apply to customer job postings
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Offer services under "My Services"
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Enjoy customer privileges too
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Step-by-Step Guide */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Customer Guide: How to Get Help
          </h2>
          <p className="text-lg text-white/80">
            Follow these steps to find the perfect tasker for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {customerSteps.map((step, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} dark:bg-opacity-20 rounded-full flex-shrink-0`}
                  >
                    <step.icon className={`h-6 w-6 ${step.color} dark:opacity-80`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                        >
                          <div className="w-1.5 h-1.5 bg-[var(--color-secondary)] rounded-full flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tasker Step-by-Step Guide */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tasker Guide: How to Start Earning
          </h2>
          <p className="text-lg text-white/80">
            Follow these steps to become a successful ManzelHelp tasker
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {taskerSteps.map((step, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} dark:bg-opacity-20 rounded-full flex-shrink-0`}
                  >
                    <step.icon className={`h-6 w-6 ${step.color} dark:opacity-80`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                        >
                          <div className="w-1.5 h-1.5 bg-[var(--color-secondary)] rounded-full flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Features */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Customer Benefits
          </h2>
          <p className="text-lg text-white/80">
            Everything you need to find reliable help for any task
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerFeatures.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {feature.description}
                </p>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
                    >
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tasker Features */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tasker Benefits
          </h2>
          <p className="text-lg text-white/80">
            Maximize your earning potential with dual opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {taskerFeatures.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {feature.description}
                </p>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
                    >
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Features */}
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
          {platformFeatures.map((feature, index) => (
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

      {/* Key Differences Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Two Ways to Connect
          </h2>
          <p className="text-lg text-white/80">
            Choose the method that works best for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Posting Method */}
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Post a Job (Customer)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Create a detailed job posting and let taskers apply to you.
                Perfect when you want to compare multiple options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Multiple taskers compete for your job
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Compare proposals and pricing
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Choose the best fit for your needs
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Set your own timeline and budget
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Direct Booking Method */}
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Book Directly (Customer)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Browse tasker services and message them directly. Perfect when
                you know what you need and want to book quickly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Browse available services instantly
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Message taskers directly
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Book immediately if available
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                  Build ongoing relationships
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm text-center">
          <CardContent className="p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8">
              Join thousands of users who are already connecting, helping, and
              earning on ManzelHelp
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Post a job or browse services to find the perfect tasker
                </p>
                <Button
                  onClick={() => router.push("/sign-up")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Up as Customer
                </Button>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Want to Earn?
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Apply to jobs and offer services to start earning money
                </p>
                <Button
                  onClick={() => router.push("/become-a-helper")}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Become a Tasker
                </Button>
              </div>
            </div>

            {user && (
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
