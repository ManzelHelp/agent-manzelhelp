"use client";

import React from "react";
import { createClient } from "@/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import type {
  TaskerService,
  User,
  TaskerProfile,
  UserStats,
} from "@/types/supabase";
import {
  MessageSquare,
  MapPin,
  Star,
  Clock,
  Calendar,
  AlertCircle,
  Euro,
  User as UserIcon,
  Award,
  Clock as ClockIcon,
} from "lucide-react";
import { format } from "date-fns";

interface TaskerOfferData {
  taskerService: TaskerService;
  tasker: User & { profile: TaskerProfile };
  stats: UserStats | null;
}

export default function TaskerOfferPage() {
  const params = useParams();
  const [data, setData] = useState<TaskerOfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskerOffer = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid service ID");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch tasker service with related data
        const { data: taskerServiceData, error: taskerServiceError } =
          await supabase
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

        if (taskerServiceError) {
          console.error("Tasker service error:", taskerServiceError);
          if (taskerServiceError.code === "PGRST116") {
            throw new Error("Service not found");
          }
          throw taskerServiceError;
        }

        if (!taskerServiceData) {
          throw new Error("Service not found");
        }

        // Fetch tasker stats
        const { data: statsData, error: statsError } = await supabase
          .from("user_stats")
          .select("*")
          .eq("id", taskerServiceData.tasker_id)
          .single();

        // Stats error is not critical, we can continue without stats
        if (statsError && statsError.code !== "PGRST116") {
          console.warn("Failed to fetch user stats:", statsError);
        }

        setData({
          taskerService: taskerServiceData,
          tasker: taskerServiceData.tasker,
          stats: statsData || null,
        });
      } catch (err) {
        console.error("Error fetching tasker offer:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load the service offer. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTaskerOffer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            {/* Service Card Skeleton */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-muted"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-32"></div>
                </div>
              </CardContent>
            </Card>

            {/* Tasker Card Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Oops!</h2>
                <p className="text-muted-foreground">
                  {error || "Service not found"}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { taskerService, tasker, stats } = data;

  const getPricingDisplay = () => {
    if (taskerService.pricing_type === "hourly") {
      return `€${taskerService.price}/hr`;
    } else if (taskerService.pricing_type === "per_item") {
      return `€${taskerService.price}/item`;
    } else {
      return `€${taskerService.price}`;
    }
  };

  const getExperienceLevelColor = (level?: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "beginner":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Service Details Card */}
          <Card className="overflow-hidden shadow-lg border-0">
            {/* Service Image */}
            {taskerService.portfolio_images &&
              Array.isArray(taskerService.portfolio_images) &&
              taskerService.portfolio_images.length > 0 && (
                <div className="relative h-64 md:h-80 w-full">
                  <Image
                    src={
                      taskerService.portfolio_images[0] ||
                      "/placeholder-service.jpg"
                    }
                    alt={taskerService.title || "Service image"}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

            <CardContent className="p-6 md:p-8">
              {/* Header with Title and Price */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {taskerService.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Listed on{" "}
                      {format(
                        new Date(taskerService.created_at!),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-primary" />
                    <span className="text-2xl md:text-3xl font-bold text-primary">
                      {getPricingDisplay()}
                    </span>
                  </div>
                  {taskerService.minimum_duration && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ClockIcon className="h-4 w-4" />
                      <span>Min. {taskerService.minimum_duration}h</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  About this service
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {taskerService.description || "No description available"}
                </p>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskerService.service_area && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Service Area</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof taskerService.service_area === "string"
                          ? taskerService.service_area
                          : taskerService.service_area
                          ? JSON.stringify(taskerService.service_area)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Pricing Type</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {taskerService.pricing_type || "Fixed"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasker Profile Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                About the Tasker
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {/* Tasker Header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                {/* Profile Picture */}
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-primary/10 flex-shrink-0">
                  <Image
                    src={tasker.avatar_url || "/placeholder-avatar.jpg"}
                    alt={`${tasker.first_name || "Tasker"} ${
                      tasker.last_name || ""
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Tasker Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {`${tasker.first_name || "Tasker"} ${
                        tasker.last_name || ""
                      }`}
                    </h2>
                    {tasker.profile?.experience_level && (
                      <Badge
                        className={`mt-2 ${getExperienceLevelColor(
                          tasker.profile.experience_level
                        )}`}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {tasker.profile.experience_level
                          .charAt(0)
                          .toUpperCase() +
                          tasker.profile.experience_level.slice(1)}
                      </Badge>
                    )}
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">
                          {stats?.tasker_rating
                            ? stats.tasker_rating.toFixed(1)
                            : "New"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Rating
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {stats?.completed_jobs || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Jobs completed
                      </span>
                    </div>

                    {stats?.response_time_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {stats.response_time_hours}h avg response
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {tasker.profile?.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {tasker.profile.bio}
                  </p>
                </div>
              )}

              {/* Tasker Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats?.completed_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Jobs</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats?.total_reviews || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats?.tasker_rating
                      ? `${stats.tasker_rating.toFixed(1)}★`
                      : "New"}
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {tasker.created_at
                      ? format(new Date(tasker.created_at), "MMM 'yy")
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                </div>
              </div>

              {/* Contact Button */}
              <div className="mt-6">
                <Button className="w-full h-12 text-lg font-semibold" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Tasker
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
