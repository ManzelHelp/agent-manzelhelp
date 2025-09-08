"use client";

import React from "react";
import { createClient } from "@/supabase/client";
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
  const serviceId = params["service-id"] as string;
  const [data, setData] = useState<TaskerOfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskerOffer = async () => {
      if (!serviceId || typeof serviceId !== "string") {
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
            )
          `
            )
            .eq("id", serviceId)
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
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="animate-pulse space-y-8">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
              <div className="h-80 md:h-96 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"></div>
              <div className="absolute top-6 right-6">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="h-12 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
              </div>
            </div>

            {/* Service Details Skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8">
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-6"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              </div>
            </div>

            {/* Tasker Profile Skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6">
                <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/4"></div>
              </div>
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                  <div className="h-32 w-32 bg-slate-300 dark:bg-slate-600 rounded-2xl"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
                <div className="h-16 bg-slate-300 dark:bg-slate-600 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 text-center p-12">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Oops!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  {error || "Service not found"}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Again
              </Button>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            {/* Service Image with Modern Overlay */}
            {taskerService.portfolio_images &&
            Array.isArray(taskerService.portfolio_images) &&
            taskerService.portfolio_images.length > 0 ? (
              <div className="relative h-80 md:h-96 w-full">
                <Image
                  src={
                    taskerService.portfolio_images[0] ||
                    "/placeholder-service.jpg"
                  }
                  alt={taskerService.title || "Service image"}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

                {/* Floating Price Badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-white/20">
                    <div className="flex items-center gap-2">
                      <Euro className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {getPricingDisplay()}
                      </span>
                    </div>
                    {taskerService.minimum_duration && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Min. {taskerService.minimum_duration}h</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      {taskerService.title}
                    </h1>
                    <div className="flex items-center gap-3 text-white/90">
                      <Calendar className="h-5 w-5" />
                      <span className="text-lg">
                        Listed on{" "}
                        {format(
                          new Date(taskerService.created_at!),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-80 md:h-96 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 dark:bg-slate-500/20 rounded-full flex items-center justify-center">
                    <Euro className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
                    {taskerService.title}
                  </h1>
                  <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      Listed on{" "}
                      {format(
                        new Date(taskerService.created_at!),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Service Details Section */}
            <div className="p-8 md:p-12">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  About this service
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {taskerService.description || "No description available"}
                  </p>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {taskerService.service_area && (
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          Service Area
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {typeof taskerService.service_area === "string"
                            ? taskerService.service_area
                            : taskerService.service_area
                            ? JSON.stringify(taskerService.service_area)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Pricing Type
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 capitalize">
                        {taskerService.pricing_type || "Fixed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasker Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                About the Tasker
              </h2>
            </div>

            <div className="p-8">
              {/* Tasker Header */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                    <Image
                      src={tasker.avatar_url || "/placeholder-avatar.jpg"}
                      alt={`${tasker.first_name || "Tasker"} ${
                        tasker.last_name || ""
                      }`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {tasker.profile?.experience_level && (
                    <div className="absolute -bottom-2 -right-2">
                      <Badge
                        className={`px-4 py-2 text-sm font-semibold shadow-lg ${getExperienceLevelColor(
                          tasker.profile.experience_level
                        )}`}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {tasker.profile.experience_level
                          .charAt(0)
                          .toUpperCase() +
                          tasker.profile.experience_level.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Tasker Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {`${tasker.first_name || "Tasker"} ${
                        tasker.last_name || ""
                      }`}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Professional Service Provider
                    </p>
                  </div>

                  {/* Rating and Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200/50 dark:border-yellow-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                          <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.tasker_rating
                              ? stats.tasker_rating.toFixed(1)
                              : "New"}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Rating
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stats?.completed_jobs || 0}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Jobs completed
                          </p>
                        </div>
                      </div>
                    </div>

                    {stats?.response_time_hours && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {stats.response_time_hours}h
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Avg response
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {tasker.profile?.bio && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                    About
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {tasker.profile.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Tasker Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {stats?.completed_jobs || 0}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Jobs
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {stats?.total_reviews || 0}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Reviews
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {stats?.tasker_rating
                        ? `${stats.tasker_rating.toFixed(1)}★`
                        : "New"}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Rating
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {tasker.created_at
                        ? format(new Date(tasker.created_at), "MMM 'yy")
                        : "N/A"}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Member since
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
                <Button
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  <MessageSquare className="h-6 w-6 mr-3" />
                  Contact Tasker
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
