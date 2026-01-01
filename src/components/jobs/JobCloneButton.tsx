"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Copy } from "lucide-react";
import { createJob } from "@/actions/jobs";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { JobWithDetails } from "@/actions/jobs";

interface JobCloneButtonProps {
  job: JobWithDetails;
}

export default function JobCloneButton({ job }: JobCloneButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const router = useRouter();
  const t = useTranslations("myJobs");

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const result = await createJob({
        title: `${job.title} (Copy)`,
        description: job.description || "",
        service_id: job.service_id,
        preferred_date: new Date().toISOString().split('T')[0], // Today's date
        preferred_time_start: job.preferred_time_start || undefined,
        preferred_time_end: job.preferred_time_end || undefined,
        is_flexible: job.is_flexible || false,
        estimated_duration: job.estimated_duration || undefined,
        customer_budget: job.customer_budget || 0,
        currency: job.currency || "MAD",
        address_id: job.address_id,
        max_applications: job.max_applications || undefined,
        requirements: job.requirements || undefined,
        images: job.images || undefined,
      });
      
      if (result.success && result.jobId) {
        toast.success(t("jobCard.cloneSuccess") || "Job cloned successfully!");
        setIsOpen(false);
        router.push(`/customer/my-jobs/${result.jobId}`);
      } else {
        toast.error(result.error || t("jobCard.cloneError") || "Failed to clone job");
      }
    } catch (error) {
      console.error("Error cloning job:", error);
      toast.error(t("jobCard.cloneError") || "Failed to clone job");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
      >
        <Copy className="h-4 w-4 mr-2" />
        {t("jobCard.clone") || "Clone"}
      </Button>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleClone}
        title={t("jobCard.cloneConfirmTitle") || "Clone Job"}
        description={t("jobCard.cloneConfirmDescription") || `Are you sure you want to clone "${job.title}"? A new job will be created with the same details that you can edit.`}
        confirmText={t("jobCard.cloneConfirm") || "Clone Job"}
        cancelText={t("jobCard.cancel") || "Cancel"}
        variant="default"
        isLoading={isCloning}
      />
    </>
  );
}

