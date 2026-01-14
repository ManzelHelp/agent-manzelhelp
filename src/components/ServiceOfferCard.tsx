"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, TaskerService } from "@/types/supabase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  MapPin,
  Star,
  Clock,
  Shield,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import { ServiceDetailDrawer } from "./drawers/ServiceDetailDrawer";
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("serviceCard");
  const locale = useLocale();
  const [avatarError, setAvatarError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getCurrencySymbol = () => {
    return locale === "ar" ? "د.م." : "MAD";
  };

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-secondary)]/30 hover:-translate-y-2">
      <div className="relative flex flex-col h-full">
        {/* Profile */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-0.5">
                <div className="relative h-full w-full rounded-full bg-[var(--color-surface)] p-0.5 flex items-center justify-center">
                  {tasker.avatar_url && !avatarError ? (
                    <Image
                      src={tasker.avatar_url}
                      alt={`${tasker.first_name || "Tasker"}'s profile`}
                      className="rounded-full object-cover"
                      fill
                      unoptimized
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                      <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base sm:text-lg truncate">
                  {tasker.first_name} {tasker.last_name?.[0]}.
                </h3>
                {tasker.verification_status === "verified" && (
                  <Shield className="w-4 h-4 text-[var(--color-secondary)]" />
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                <MapPin size={14} />
                <span className="truncate">
                  {typeof service.service_area === "string"
                    ? service.service_area
                    : t("multipleAreas")}
                </span>
              </div>

              {rating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    ({totalReviews}{" "}
                    {totalReviews > 1 ? t("reviews") : t("review")})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1">
          <h4 className="font-bold mb-3 text-lg sm:text-xl line-clamp-2">
            {service.title}
          </h4>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] line-clamp-3 mb-4">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {service.minimum_duration && (
              <span className="px-2 py-1 bg-[var(--color-accent)]/10 rounded-full text-xs flex items-center gap-1">
                <Clock size={12} />
                {t("minDuration", { hours: service.minimum_duration })}
              </span>
            )}
          </div>
        </div>

        {/* PRICE + BUTTON */}
        <div className="p-4 sm:p-6 border-t border-[var(--color-border)] mt-auto space-y-3">
          {/* Ligne 1 : Prix */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold">
              {service.price} {getCurrencySymbol()}
            </span>
            {service.pricing_type === "hourly" && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("perHour")}
              </span>
            )}
          </div>

          {/* Ligne 2 : Bouton */}
          <Button
            onClick={() => setDrawerOpen(true)}
            className="
              w-full
              inline-flex items-center justify-center gap-2
              px-6 py-3
              bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)]
              text-white rounded-xl
              transition-all duration-200
              text-sm font-semibold
              shadow-lg hover:shadow-xl
            "
          >
            {t("viewDetails")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {service.id && (
        <ServiceDetailDrawer
          serviceId={String(service.id)}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </Card>
  );
}

export default ServiceOfferCard;
