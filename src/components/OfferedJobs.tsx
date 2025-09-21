import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Briefcase, Users, DollarSign } from "lucide-react";
import JobOfferCard from "./JobOfferCard";
import { User } from "@/types/supabase";

interface Job {
  id: string;
  title: string;
  description: string;
  customer_budget: number;
  currency: string;
  estimated_duration: number;
  preferred_date: string;
  is_flexible: boolean;
  is_promoted: boolean;
  current_applications: number;
  max_applications: number;
  created_at: string;
}

interface OfferedJobsProps {
  jobs: Array<{
    job: Job;
    customer: User;
  }>;
  locale: string;
}

function OfferedJobs({ jobs, locale }: OfferedJobsProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3 bg-[var(--color-accent)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-accent)]/20">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-accent)]">
              Available Jobs
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[var(--color-primary)] px-2 leading-tight">
            Find Your Next Job
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto px-2 leading-relaxed font-light">
            Browse available jobs posted by customers and apply to start earning
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {jobs.map((offer, index) => (
              <div
                key={offer.job.id}
                className="group transform transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <JobOfferCard job={offer.job} customer={offer.customer} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-primary)]" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-secondary)] rounded-full animate-ping"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
              No jobs available at the moment
            </h3>
            <p className="text-[var(--color-text-secondary)] px-2 max-w-md mx-auto">
              Check back soon for new job opportunities from our customers!
            </p>
          </div>
        )}

        {/* Enhanced View All Jobs Button */}
        <div className="text-center mt-12 sm:mt-16">
          <Link href={`/${locale}/search/jobs`}>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] hover:from-[var(--color-accent-dark)] hover:to-[var(--color-accent)] text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold min-h-[56px] sm:min-h-[64px] rounded-2xl border-0"
            >
              <span className="flex items-center gap-3">
                View All Jobs
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Job Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-accent)]" />
            </div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
              New Jobs Daily
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Fresh opportunities posted regularly
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
            </div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
              Competitive Rates
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Fair compensation for quality work
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-secondary)]" />
            </div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
              Verified Customers
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Work with trusted clients
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfferedJobs;
