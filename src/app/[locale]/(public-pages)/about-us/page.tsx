import React from "react";
import { Link } from "@/i18n/navigation";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Introducing ManzelHelp
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Your All-in-One Service Solution
          </p>
          <p className="text-base sm:text-lg opacity-90 leading-relaxed max-w-2xl mx-auto">
            Welcome to ManzelHelp, your ultimate service marketplace. We bring
            together a diverse range of services to cater to your needs, making
            your life simpler and more enjoyable.
          </p>
        </div>
      </section>

      {/* Evolution Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              From Cleaning Services to Comprehensive Solutions
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  Our Foundation
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Our journey began with a focus on providing top-notch cleaning
                  services, inspired by the successful model of Helpling. We
                  successfully built a foundation of trust and excellence within
                  this domain.
                </p>
              </div>

              <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  Our Evolution
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Looking ahead, we're excited to expand our offerings to
                  encompass a wide spectrum of services. ManzelHelp is evolving
                  into a comprehensive platform where your every need will be
                  met with professionalism and care.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    Cleaning Excellence
                  </h4>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Professional cleaning services for homes and offices
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    TaskRabbit-like Services
                  </h4>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Furniture assembly, delivery, and maintenance
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    Comprehensive Platform
                  </h4>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    All your service needs in one trusted place
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The ManzelHelp Advantage */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Why Choose ManzelHelp?
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Easy Booking
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Simple scheduling and real-time availability
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Verified Providers
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Skilled and trusted service professionals
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Transparent Pricing
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Clear rates with no hidden fees
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Secure Payments
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Safe and reliable payment options
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Quality Experience
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                High-quality service delivery guaranteed
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Community Focus
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Supporting local economy and neighbors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Explore Our Diverse Service Categories
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Cleaning Services
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Professional home and office cleaning
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Handyman & Repairs
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Furniture assembly and maintenance
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Pet Care
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Pet sitting and walking services
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Tutoring & Education
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Academic support and learning assistance
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Event Services
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Party planning and event assistance
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Technical Support
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                IT assistance and device setup
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              How It Works
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Sign Up
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Create your free account as a helper or customer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Browse & Book
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Find services or post your needs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Connect
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Message and agree on terms
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Complete
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Get it done and leave reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Looking Ahead: Our Vision
          </h2>
          <p className="text-lg mb-8 leading-relaxed max-w-3xl mx-auto">
            We're committed to continuously improving our platform based on user
            feedback. Our vision is to make ManzelHelp the comprehensive,
            one-stop solution for all your service needs.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Trust & Reliability</h3>
              <p className="text-sm opacity-90">
                Building lasting relationships with verified professionals
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Community Growth</h3>
              <p className="text-sm opacity-90">
                Supporting local economy and neighbor connections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Join ManzelHelp Today
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Whether you want to offer your skills or need a helping hand,
            ManzelHelp is your go-to platform for safe, reliable, and local
            services. Experience the convenience, quality, and reliability that
            ManzelHelp offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-block bg-[var(--color-primary)] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-[var(--color-primary-light)] transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/services"
              className="inline-block bg-[var(--color-secondary)] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-[var(--color-secondary-light)] transition-all duration-300 transform hover:scale-105"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
