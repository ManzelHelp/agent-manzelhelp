import React from "react";
import Image from "next/image";
import { User, TaskerService } from "@/types/supabase";
import { Card } from "./ui/card";
import { MapPin } from "lucide-react";

interface ServiceOfferCardProps {
  service: TaskerService;
  tasker: User;
}

function ServiceOfferCard({ service, tasker }: ServiceOfferCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative flex flex-col h-full">
        {/* Profile Section */}
        <div className="p-4 flex items-center gap-3 border-b border-[var(--color-border)]">
          <div className="relative h-12 w-12">
            <Image
              src={tasker.avatar_url || "/default-avatar.png"}
              alt={`${tasker.first_name}'s profile`}
              className="rounded-full object-cover"
              fill
              sizes="48px"
            />
          </div>
          <div>
            <h3 className="font-medium text-[var(--color-text-primary)]">
              {tasker.first_name} {tasker.last_name?.[0]}.
            </h3>
            <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
              <MapPin size={14} className="mr-1" />
              <span>{service.service_area}</span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-4 flex-1">
          <h4 className="font-semibold mb-2 text-[var(--color-text-primary)]">
            {service.title}
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Price Section */}
        <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                ${service.base_price}
              </span>
              {service.pricing_type === "hourly" && (
                <span className="text-sm text-[var(--color-text-secondary)]">
                  /hour
                </span>
              )}
            </div>
            <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-opacity">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ServiceOfferCard;
