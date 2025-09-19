"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  getJobApplications,
  acceptJobApplication,
  rejectJobApplication,
  JobApplicationWithDetails,
} from "@/actions/jobs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Clock,
  Euro,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Crown,
  Shield,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Loading skeleton component
function ApplicationLoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl px-4 pb-8">
      <div className="grid grid-cols-1 gap-4 mt-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border border-[var(--color-border)]">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Empty state component
function EmptyApplicationsState({
  t,
}: {
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="w-full max-w-4xl px-4 pb-8">
      <Card className="p-8 text-center border border-[var(--color-border)]">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center">
            <User className="w-8 h-8 text-[var(--color-text-secondary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {t("applications.noApplications")}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {t("applications.noApplicationsDescription")}
          </p>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Application card component
function ApplicationCard({
  application,
  t,
  onAccept,
  onReject,
}: {
  application: JobApplicationWithDetails;
  t: ReturnType<typeof useTranslations>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-[var(--color-success)] text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("applications.status.accepted")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-[var(--color-error)] text-white">
            <XCircle className="w-3 h-3 mr-1" />
            {t("applications.status.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[var(--color-warning)] text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t("applications.status.pending")}
          </Badge>
        );
    }
  };

  const getExperienceLevel = (level: string | null) => {
    switch (level) {
      case "beginner":
        return "Beginner (0-1 years)";
      case "intermediate":
        return "Intermediate (1-3 years)";
      case "experienced":
        return "Experienced (3-5 years)";
      case "expert":
        return "Expert (5+ years)";
      default:
        return "Not specified";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "Not specified";
    return `${duration} hour${duration > 1 ? "s" : ""}`;
  };

  return (
    <Card className="p-4 border border-[var(--color-border)] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center overflow-hidden">
            {application.tasker_avatar_url ? (
              <Image
                src={application.tasker_avatar_url}
                alt={`${application.tasker_first_name} ${application.tasker_last_name}`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-[var(--color-text-secondary)]" />
            )}
          </div>
          {application.is_premium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                  {application.tasker_first_name} {application.tasker_last_name}
                </h3>
                {application.tasker_verification_status === "verified" && (
                  <Shield className="w-4 h-4 text-[var(--color-success)]" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(application.created_at), "MMM dd, yyyy")}
                </div>
                {getStatusBadge(application.status)}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Euro className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">
                {t("applications.applicationCard.proposedPrice")}:
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {formatPrice(application.proposed_price)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">
                {t("applications.applicationCard.estimatedDuration")}:
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {formatDuration(application.estimated_duration)}
              </span>
            </div>

            {application.experience_level && (
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">
                  {t("applications.applicationCard.experience")}:
                </span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {getExperienceLevel(application.experience_level)}
                </span>
              </div>
            )}

            {application.availability && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">
                  {t("applications.applicationCard.availability")}:
                </span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {application.availability}
                </span>
              </div>
            )}
          </div>

          {/* Message */}
          {application.message && (
            <div className="mb-4 p-3 bg-[var(--color-accent-light)] rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--color-text-secondary)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    {t("applications.applicationCard.message")}
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {application.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="mb-4 p-3 bg-[var(--color-bg)] rounded-lg">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {t("applications.applicationCard.contactInfo")}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {application.tasker_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[var(--color-text-secondary)]" />
                  <span className="text-[var(--color-text-primary)]">
                    {application.tasker_phone}
                  </span>
                </div>
              )}
              {application.tasker_email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[var(--color-text-secondary)]" />
                  <span className="text-[var(--color-text-primary)]">
                    {application.tasker_email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {application.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onAccept(application.id)}
                className="bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 touch-target"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("applications.actions.accept")}
              </Button>
              <Button
                onClick={() => onReject(application.id)}
                variant="outline"
                className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 touch-target"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t("applications.actions.reject")}
              </Button>
              <Button
                variant="outline"
                className="border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] touch-target"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t("applications.actions.viewProfile")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const jobId = params["job-id"] as string;

  const [applications, setApplications] = useState<JobApplicationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "accept" | "reject" | null;
    applicationId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: null,
    applicationId: null,
    isLoading: false,
  });

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJobApplications(jobId);
        setApplications(data);
      } catch (err) {
        console.error("Error loading applications:", err);
        setError(
          err instanceof Error
            ? err.message
            : t("applications.errors.loadFailed")
        );
        toast.error(t("applications.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadApplications();
    }
  }, [jobId, t]);

  const handleAccept = (applicationId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: "accept",
      applicationId,
      isLoading: false,
    });
  };

  const handleReject = (applicationId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: "reject",
      applicationId,
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.applicationId || !confirmDialog.type) return;

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      let result;
      if (confirmDialog.type === "accept") {
        result = await acceptJobApplication(confirmDialog.applicationId);
      } else {
        result = await rejectJobApplication(confirmDialog.applicationId);
      }

      if (result.success) {
        // Update the application in the local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === confirmDialog.applicationId
              ? {
                  ...app,
                  status:
                    confirmDialog.type === "accept" ? "accepted" : "rejected",
                }
              : app
          )
        );

        toast.success(
          confirmDialog.type === "accept"
            ? "Application accepted successfully"
            : "Application rejected successfully"
        );
      } else {
        toast.error(result.error || "Action failed");
      }
    } catch (err) {
      console.error("Error performing action:", err);
      toast.error("Action failed");
    } finally {
      setConfirmDialog({
        isOpen: false,
        type: null,
        applicationId: null,
        isLoading: false,
      });
    }
  };

  const handleCloseDialog = () => {
    if (!confirmDialog.isLoading) {
      setConfirmDialog({
        isOpen: false,
        type: null,
        applicationId: null,
        isLoading: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto pt-6">
          <div className="px-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              {t("applications.title")}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {t("applications.subtitle")}
            </p>
          </div>
          <ApplicationLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto pt-6">
          <div className="px-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              {t("applications.title")}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {t("applications.subtitle")}
            </p>
          </div>
          <div className="px-4">
            <Card className="p-8 text-center border border-[var(--color-border)]">
              <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Error Loading Applications
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
              >
                Try Again
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto pt-6">
        {/* Header */}
        <div className="px-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {t("applications.title")}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {t("applications.subtitle")}
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <EmptyApplicationsState t={t} />
        ) : (
          <div className="w-full max-w-4xl px-4 pb-8">
            <div className="grid grid-cols-1 gap-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  t={t}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmAction}
          title={
            confirmDialog.type === "accept"
              ? t("applications.confirmations.acceptTitle")
              : t("applications.confirmations.rejectTitle")
          }
          description={
            confirmDialog.type === "accept"
              ? t("applications.confirmations.acceptDescription")
              : t("applications.confirmations.rejectDescription")
          }
          confirmText={
            confirmDialog.type === "accept"
              ? t("applications.confirmations.confirmAccept")
              : t("applications.confirmations.confirmReject")
          }
          cancelText={t("applications.confirmations.cancel")}
          variant={confirmDialog.type === "accept" ? "success" : "danger"}
          isLoading={confirmDialog.isLoading}
        />
      </div>
    </div>
  );
}
