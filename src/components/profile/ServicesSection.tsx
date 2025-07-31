"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, AlertTriangle } from "lucide-react";
import type { TaskerService } from "@/types/supabase";

interface ServicesSectionProps {
  taskerServices: TaskerService[];
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

export default function ServicesSection({
  taskerServices,
  missingFields,
}: ServicesSectionProps) {
  // Get missing fields for this section
  const servicesMissingFields = missingFields.filter(
    (field) => field.section === "services"
  );

  return (
    <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-color-text-primary">
              My Services
            </CardTitle>
            <CardDescription className="text-color-text-secondary">
              Manage your offered services and pricing
            </CardDescription>
          </div>
          {servicesMissingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
              <AlertTriangle className="h-4 w-4 text-color-error" />
              <span className="text-sm font-medium text-color-error">
                {servicesMissingFields.length} missing
              </span>
            </div>
          )}
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {taskerServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-color-text-secondary" />
            </div>
            <h3 className="font-semibold text-color-text-primary mb-2">
              No services yet
            </h3>
            <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
              Start offering services to customers by adding your first service
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Service
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {taskerServices.map((service) => (
              <div
                key={service.id}
                className="flex items-start justify-between p-4 rounded-lg border border-color-border/50 bg-color-surface/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-color-text-primary">
                      {service.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        service.verification_status === "verified"
                          ? "bg-color-success/10 text-color-success"
                          : service.verification_status === "rejected"
                          ? "bg-color-error/10 text-color-error"
                          : "bg-color-warning/10 text-color-warning"
                      }`}
                    >
                      {service.verification_status}
                    </span>
                  </div>
                  <p className="text-sm text-color-text-secondary mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-color-text-primary font-medium">
                      {service.pricing_type === "fixed"
                        ? `$${service.base_price}`
                        : service.pricing_type === "hourly"
                        ? `$${service.hourly_rate}/hr`
                        : "Custom pricing"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_available
                          ? "bg-color-success/10 text-color-success"
                          : "bg-color-accent/10 text-color-text-secondary"
                      }`}
                    >
                      {service.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-color-error hover:text-color-error hover:bg-color-error/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
