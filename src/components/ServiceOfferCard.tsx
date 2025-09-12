import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, TaskerService } from "@/types/supabase";
import { Card } from "./ui/card";
import { MapPin, Star, Clock, Shield, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

interface ServiceOfferCardProps {
  service: TaskerService;
  tasker: User;
  rating?: number;
  totalReviews?: number;
}

function ServiceOfferCard({
  service,
  tasker,
  rating = 0,
  totalReviews = 0,
}: ServiceOfferCardProps) {
  const locale = useLocale();

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-secondary)]/30 hover:-translate-y-2">
      <div className="relative flex flex-col h-full">
        {/* Enhanced Profile Section with Gradient Background */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-0.5">
                <div className="h-full w-full rounded-full bg-[var(--color-surface)] p-0.5">
                  <Image
                    src={tasker.avatar_url || "/default-avatar.svg"}
                    alt={`${tasker.first_name}'s profile`}
                    className="rounded-full object-cover"
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-base sm:text-lg truncate">
                  {tasker.first_name} {tasker.last_name?.[0]}.
                </h3>
                {tasker.verification_status === "verified" && (
                  <Shield className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">
                    {service.service_area &&
                    typeof service.service_area === "string"
                      ? service.service_area
                      : service.service_area
                      ? "Multiple areas"
                      : "Area not specified"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Service Details */}
        <div className="p-4 sm:p-6 flex-1">
          <h4 className="font-bold mb-3 text-[var(--color-text-primary)] text-lg sm:text-xl line-clamp-2 leading-tight">
            {service.title}
          </h4>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed mb-4">
            {service.description}
          </p>

          {/* Service Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {service.minimum_duration && (
              <div className="flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)]/10 rounded-full text-xs text-[var(--color-text-secondary)]">
                <Clock size={12} />
                <span>Min {service.minimum_duration}h</span>
              </div>
            )}
            {service.pricing_type === "hourly" && (
              <div className="px-2 py-1 bg-[var(--color-secondary)]/10 rounded-full text-xs text-[var(--color-secondary)] font-medium">
                Hourly Rate
              </div>
            )}
            {service.pricing_type === "per_item" && (
              <div className="px-2 py-1 bg-[var(--color-primary)]/10 rounded-full text-xs text-[var(--color-primary)] font-medium">
                Per Item
              </div>
            )}
            {service.pricing_type === "fixed" && (
              <div className="px-2 py-1 bg-[var(--color-accent)]/10 rounded-full text-xs text-[var(--color-text-secondary)] font-medium">
                Fixed Price
              </div>
            )}
            {service.verification_status === "verified" && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                <Shield size={12} />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Price Section with Modern Styling */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-accent)]/5 border-t border-[var(--color-border)] mt-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                ${service.price}
              </span>
              {service.pricing_type === "hourly" && (
                <span className="text-sm text-[var(--color-text-secondary)] font-medium">
                  /hour
                </span>
              )}
              {service.pricing_type === "per_item" && (
                <span className="text-sm text-[var(--color-text-secondary)] font-medium">
                  /item
                </span>
              )}
              {service.extra_fees && service.extra_fees > 0 && (
                <span className="text-xs text-[var(--color-text-secondary)]">
                  + fees
                </span>
              )}
            </div>
            <Link
              href={`/${locale}/tasker-offer/${service.id}`}
              className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white rounded-xl hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ServiceOfferCard;
