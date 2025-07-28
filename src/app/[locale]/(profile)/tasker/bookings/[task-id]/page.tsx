"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MessageSquare,
  FileText,
  DollarSign,
  Shield,
  Clock3,
  CalendarDays,
  Info,
  X,
  Edit,
  MoreHorizontal,
} from "lucide-react";

interface TaskDetail {
  id: string;
  serviceTitle: string;
  serviceDescription: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  agreedPrice: number;
  currency: string;
  status: string;
  bookingType: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  estimatedDuration: number;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
  };
  customerRequirements: string;
  taskerNotes?: string;
  createdAt?: string;
  acceptedAt?: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  paymentMethod: string;
  cancellationFee: number;
  rating?: number;
  review?: string;
}

export default function TaskDetailPage({
  params,
}: {
  params: { "task-id": string };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  // Mock data - replace with real data fetching based on params["task-id"]
  const task: TaskDetail = {
    id: params["task-id"],
    serviceTitle: "House Cleaning Service",
    serviceDescription:
      "Professional house cleaning service including kitchen, bathroom, living areas, and bedrooms. Deep cleaning with eco-friendly products.",
    customerName: "Sarah M. Johnson",
    customerEmail: "sarah.johnson@email.com",
    customerPhone: "+1 (555) 123-4567",
    customerAvatar: "/api/placeholder/40/40",
    agreedPrice: 120,
    currency: "USD",
    status: "confirmed",
    bookingType: "scheduled",
    scheduledDate: "2024-01-15",
    scheduledTimeStart: "09:00",
    scheduledTimeEnd: "12:00",
    estimatedDuration: 180,
    address: {
      street: "123 Main Street",
      city: "Downtown",
      region: "New York",
      postalCode: "10001",
    },
    customerRequirements:
      "Please focus on the kitchen area as we're having guests over. Use eco-friendly cleaning products only. The master bedroom needs extra attention to dusting.",
    taskerNotes:
      "Customer prefers natural cleaning products. Kitchen has marble countertops - use appropriate cleaner. Master bedroom has allergies - use hypoallergenic products.",
    acceptedAt: "2024-01-10T14:30:00Z",
    confirmedAt: "2024-01-12T09:15:00Z",
    paymentMethod: "online",
    cancellationFee: 20,
    rating: 5,
    review:
      "Excellent service! Very thorough and professional. Will definitely book again.",
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-color-warning text-color-surface",
          icon: AlertCircle,
          description: "Waiting for your response",
        };
      case "accepted":
        return {
          label: "Accepted",
          color: "bg-color-info text-color-surface",
          icon: CheckCircle,
          description: "You've accepted this booking",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-color-success text-color-surface",
          icon: CheckCircle,
          description: "Booking is confirmed and ready",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-color-primary text-color-surface",
          icon: Play,
          description: "Task is currently being performed",
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-color-success text-color-surface",
          icon: CheckCircle,
          description: "Task has been completed",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-color-error text-color-surface",
          icon: X,
          description: "Booking has been cancelled",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-color-accent text-color-text-secondary",
          icon: Info,
          description: "Status unknown",
        };
    }
  };

  const getBookingTypeInfo = (type: string) => {
    switch (type) {
      case "instant":
        return { label: "Instant", icon: Clock3 };
      case "scheduled":
        return { label: "Scheduled", icon: CalendarDays };
      case "recurring":
        return { label: "Recurring", icon: Calendar };
      default:
        return { label: "Scheduled", icon: CalendarDays };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const statusInfo = getStatusInfo(task.status);
  const bookingTypeInfo = getBookingTypeInfo(task.bookingType);

  const handleStatusAction = async (action: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Handle status change
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setShowNotes(false);
  };

  return (
    <div className="min-h-screen bg-color-bg smooth-scroll">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-color-surface border-b border-color-border shadow-sm">
        <div className="container mx-auto px-4 py-4 mobile-spacing">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target mobile-focus"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-color-text-primary mobile-text-lg mobile-leading">
                Task Details
              </h1>
              <p className="text-color-text-secondary text-sm mobile-text-sm">
                {task.serviceTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target mobile-focus"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 mobile-spacing">
        {/* Status Banner */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardContent className="p-4 mobile-spacing">
            <div className="flex items-center gap-3">
              <Badge className={`${statusInfo.color} text-sm font-medium`}>
                <statusInfo.icon className="h-4 w-4 mr-1" />
                {statusInfo.label}
              </Badge>
              <span className="text-sm text-color-text-secondary mobile-text-sm">
                {statusInfo.description}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-color-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-color-surface" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-color-text-primary mobile-text-base">
                  {task.customerName}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-color-text-secondary mobile-text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {task.customerEmail}
                  </span>
                  {task.customerPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {task.customerPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {task.rating && (
              <div className="flex items-center gap-2 pt-2 border-t border-color-border">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-color-warning text-color-warning" />
                  <span className="font-medium text-color-text-primary mobile-text-sm">
                    {task.rating}/5
                  </span>
                </div>
                {task.review && (
                  <span className="text-sm text-color-text-secondary mobile-text-sm">
                    "{task.review}"
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-color-text-primary mobile-text-base mb-2">
                {task.serviceTitle}
              </h3>
              <p className="text-sm text-color-text-secondary mobile-leading">
                {task.serviceDescription}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-color-border">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-color-success" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Price
                  </p>
                  <p className="font-semibold text-color-text-primary mobile-text-base">
                    {formatCurrency(task.agreedPrice, task.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-color-info" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Duration
                  </p>
                  <p className="font-semibold text-color-text-primary mobile-text-base">
                    {formatDuration(task.estimatedDuration)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-color-primary" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Date
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {formatDate(task.scheduledDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-color-primary" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Time
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {formatTime(task.scheduledTimeStart)} -{" "}
                    {formatTime(task.scheduledTimeEnd)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <bookingTypeInfo.icon className="h-5 w-5 text-color-secondary" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Type
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {bookingTypeInfo.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-color-warning" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Payment
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base capitalize">
                    {task.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-color-error mt-0.5" />
              <div>
                <p className="font-medium text-color-text-primary mobile-text-base">
                  {task.address.street}
                </p>
                <p className="text-sm text-color-text-secondary mobile-text-sm">
                  {task.address.city}, {task.address.region}
                  {task.address.postalCode && ` ${task.address.postalCode}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Notes */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Requirements & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-color-text-primary mobile-text-base mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Customer Requirements
              </h4>
              <p className="text-sm text-color-text-secondary mobile-leading bg-color-accent-light p-3 rounded-lg">
                {task.customerRequirements}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-color-text-primary mobile-text-base flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Your Notes
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-color-primary hover:text-color-primary-dark"
                >
                  {showNotes ? "Cancel" : "Edit"}
                </Button>
              </div>
              {showNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this task..."
                    className="w-full p-3 border border-color-border rounded-lg bg-color-surface text-color-text-primary mobile-text-sm resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveNotes}
                      disabled={isLoading}
                      className="bg-color-primary text-color-surface hover:bg-color-primary-dark"
                    >
                      {isLoading ? "Saving..." : "Save Notes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNotes(false)}
                      className="border-color-primary text-color-primary hover:bg-color-primary/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-color-text-secondary mobile-leading bg-color-accent-light p-3 rounded-lg">
                  {task.taskerNotes ||
                    "No notes added yet. Click 'Edit' to add your notes."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {task.status === "confirmed" && (
            <Button
              onClick={() => handleStatusAction("start")}
              disabled={isLoading}
              className="w-full bg-color-success text-color-surface hover:bg-color-success-dark touch-target mobile-focus"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Task
            </Button>
          )}

          {task.status === "in_progress" && (
            <div className="space-y-3">
              <Button
                onClick={() => handleStatusAction("pause")}
                disabled={isLoading}
                className="w-full bg-color-warning text-color-surface hover:bg-color-warning-dark touch-target mobile-focus"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Task
              </Button>
              <Button
                onClick={() => handleStatusAction("complete")}
                disabled={isLoading}
                className="w-full bg-color-success text-color-surface hover:bg-color-success-dark touch-target mobile-focus"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Task
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-color-primary text-color-primary hover:bg-color-primary/10 touch-target mobile-focus"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              className="border-color-secondary text-color-secondary hover:bg-color-secondary/10 touch-target mobile-focus"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    Booking Created
                  </p>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    {formatDate(task.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              {task.acceptedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-info rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Booking Accepted
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(task.acceptedAt)}
                    </p>
                  </div>
                </div>
              )}

              {task.confirmedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Booking Confirmed
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(task.confirmedAt)}
                    </p>
                  </div>
                </div>
              )}

              {task.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Task Started
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(task.startedAt)}
                    </p>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Task Completed
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(task.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
