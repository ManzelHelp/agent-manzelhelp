import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, TaskerService } from "@/types/supabase";
import { Card } from "./ui/card";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";

interface ServiceOfferCardProps {
  service: TaskerService;
  tasker: User;
}

function ServiceOfferCard({ service, tasker }: ServiceOfferCardProps) {
  const locale = useLocale();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative flex flex-col h-full">
        {/* Profile Section - Mobile Optimized */}
        <div className="p-3 sm:p-4 flex items-center gap-3 border-b border-[var(--color-border)]">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <Image
              src={tasker.avatar_url || "/default-avatar.png"}
              alt={`${tasker.first_name}'s profile`}
              className="rounded-full object-cover"
              fill
              sizes="(max-width: 640px) 40px, 48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[var(--color-text-primary)] text-sm sm:text-base truncate">
              {tasker.first_name} {tasker.last_name?.[0]}.
            </h3>
            <div className="flex items-center text-xs sm:text-sm text-[var(--color-text-secondary)]">
              <MapPin size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {typeof service.service_area === "string"
                  ? service.service_area
                  : service.service_area
                  ? JSON.stringify(service.service_area)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Service Details - Mobile Optimized */}
        <div className="p-3 sm:p-4 flex-1">
          <h4 className="font-semibold mb-2 text-[var(--color-text-primary)] text-sm sm:text-base line-clamp-2">
            {service.title}
          </h4>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Price Section - Mobile Optimized */}
        <div className="p-3 sm:p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
                ${service.price}
              </span>
              {service.pricing_type === "hourly" && (
                <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] ml-1">
                  /hour
                </span>
              )}
            </div>
            <Link
              href={`/${locale}/taskerOffer/${service.id}`}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-dark)] transition-all duration-200 text-xs sm:text-sm font-medium text-center min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ServiceOfferCard;
