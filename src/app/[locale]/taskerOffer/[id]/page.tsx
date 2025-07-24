"use client";

import React from "react";
import { createClient } from "@/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import type {
  TaskerService,
  User,
  TaskerProfile,
  UserStats,
} from "@/types/supabase";
import { MessageSquare, MapPin, Star, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TaskerOfferData {
  service: TaskerService & {
    portfolio_images: string[] | null;
  };
  tasker: User & { profile: TaskerProfile };
  stats: UserStats;
}

export default function TaskerOfferPage() {
  const params = useParams();
  const [data, setData] = useState<TaskerOfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskerOffer = async () => {
      try {
        const supabase = createClient();

        // Fetch tasker service and related data
        const { data: serviceData, error: serviceError } = await supabase
          .from("tasker_services")
          .select(
            `
            *,
            tasker:tasker_id (
              *,
              profile:tasker_profiles (*)
            ),
            service:service_id (*)
          `
          )
          .eq("id", params.id)
          .single();

        if (serviceError) throw serviceError;
        if (!serviceData) throw new Error("Service not found");

        // Fetch tasker stats
        const { data: statsData, error: statsError } = await supabase
          .from("user_stats")
          .select("*")
          .eq("id", serviceData.tasker_id)
          .single();

        if (statsError) throw statsError;

        setData({
          service: serviceData,
          tasker: serviceData.tasker,
          stats: statsData || {},
        });
      } catch (err) {
        console.error("Error fetching tasker offer:", err);
        setError("Failed to load the service offer. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskerOffer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">Oops!</h2>
            <p className="text-muted-foreground mb-6">
              {error || "Service not found"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { service, tasker, stats } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Details Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{service.title}</h1>

          {/* Service Images */}
          {service.portfolio_images && service.portfolio_images.length > 0 && (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={service.portfolio_images[0] || "/placeholder-service.jpg"}
                alt={service.title || "Service image"}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{service.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{service.service_area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Listed on{" "}
                    {format(new Date(service.created_at!), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasker Profile and Booking Section */}
        <div className="space-y-6">
          {/* Tasker Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src={tasker.avatar_url || "/placeholder-avatar.jpg"}
                    alt={`${tasker.first_name} ${tasker.last_name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle>{`${tasker.first_name} ${tasker.last_name}`}</CardTitle>
                  <p className="text-muted-foreground">
                    {tasker.profile.experience_level}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-semibold">
                      {stats.tasker_rating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {stats.completed_jobs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jobs Completed
                  </p>
                </div>
              </div>

              <p className="mb-6">{tasker.profile.bio}</p>

              {/* Pricing Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Pricing</h3>
                <div className="flex justify-between items-center mb-4">
                  <span>
                    {service.pricing_type === "hourly"
                      ? "Hourly Rate"
                      : "Fixed Price"}
                  </span>
                  <span className="text-xl font-bold">
                    €
                    {service.pricing_type === "hourly"
                      ? service.hourly_rate
                      : service.base_price}
                    {service.pricing_type === "hourly" && "/hr"}
                  </span>
                </div>
                {service.minimum_duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Minimum duration: {service.minimum_duration} hours
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Button */}
              <Button className="w-full mt-6" size="lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Tasker
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
