import React from "react";
import BecomeTaskerButton from "@/components/buttons/BecomeTaskerButton";
import {
  DollarSign,
  Users,
  Star,
  Clock,
  Shield,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react";

export default function BecomeAHelperPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Money",
      description: "Set your own rates and get paid for your skills and time",
    },
    {
      icon: Users,
      title: "Help Your Community",
      description:
        "Make a real difference in people's lives while building your reputation",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Earn reviews and ratings that showcase your expertise",
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description:
        "Work when you want, where you want - complete control over your time",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid safely through our protected payment system",
    },
    {
      icon: Heart,
      title: "Make Connections",
      description:
        "Build lasting relationships with clients who value your work",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up in minutes with just your email and basic information",
    },
    {
      number: "02",
      title: "Build Your Profile",
      description:
        "Add your skills, experience, and showcase what makes you unique",
    },
    {
      number: "03",
      title: "List Your Services",
      description:
        "Describe what you offer, set your rates, and define your service area",
    },
    {
      number: "04",
      title: "Start Earning",
      description:
        "Connect with clients, complete tasks, and get paid for your expertise",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              Join thousands of successful helpers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up animate-delay-100">
              <span className="gradient-text">Turn Your Skills</span>
              <br />
              Into Income
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              Ready to earn money doing what you love? Join ManzelHelp as a
              helper and connect with people who need your expertise.
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {" "}
                Whether you clean, fix, tutor, or assist in any way, you can
                make a difference and get paid for it!
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
              <BecomeTaskerButton variant="gradient" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  10K+
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Active Helpers
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  $2M+
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Earned by Helpers
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  4.9★
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">ManzelHelp?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join a platform designed to help you succeed and grow your
              business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift border border-slate-200 dark:border-slate-700"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How to <span className="gradient-text">Get Started</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start earning in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-teal-200 dark:from-blue-700 dark:to-teal-700 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Ready to start earning?
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Our Community of
            <br />
            <span className="text-yellow-300">Successful Helpers</span>
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't wait - start your journey today and begin earning money doing
            what you love. Join thousands of helpers who are already making a
            difference in their communities.
          </p>

          <BecomeTaskerButton variant="white" />

          <p className="text-blue-100 text-sm mt-4">
            ✓ Free to join ✓ No monthly fees ✓ Start earning immediately
          </p>
        </div>
      </div>
    </div>
  );
}
