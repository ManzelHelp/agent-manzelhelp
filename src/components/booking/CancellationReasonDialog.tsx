"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface CancellationReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customComment?: string) => void;
  isLoading?: boolean;
}

const PREDEFINED_REASONS = [
  "changed_my_mind",
  "found_another_tasker",
  "no_longer_needed",
  "scheduling_conflict",
  "price_too_high",
  "other",
] as const;

export function CancellationReasonDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CancellationReasonDialogProps) {
  const t = useTranslations("bookingDetails.cancellation");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customComment, setCustomComment] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleConfirm = () => {
    if (!selectedReason) {
      setError(t("errors.reasonRequired") || "Please select a reason");
      return;
    }

    if (selectedReason === "other" && !customComment.trim()) {
      setError(t("errors.customCommentRequired") || "Please provide a custom comment");
      return;
    }

    setError("");
    const reasonText = selectedReason === "other" 
      ? customComment.trim()
      : t(`reasons.${selectedReason}`) || selectedReason;
    
    onConfirm(reasonText, selectedReason === "other" ? customComment.trim() : undefined);
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomComment("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <DialogTitle className="text-lg font-semibold">
              {t("title") || "Cancel Booking"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {t("description") || "Please tell us why you're canceling this booking"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("reasonLabel") || "Reason for cancellation"} *
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={(value) => {
                setSelectedReason(value);
                setError("");
                if (value !== "other") {
                  setCustomComment("");
                }
              }}
              className="space-y-3"
            >
              {PREDEFINED_REASONS.map((reason) => (
                <div key={reason} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={reason}
                    id={reason}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={reason}
                    className="flex-1 cursor-pointer font-normal leading-tight"
                  >
                    {t(`reasons.${reason}`) || reason.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-comment">
                {t("customCommentLabel") || "Please provide details"} *
              </Label>
              <Textarea
                id="custom-comment"
                value={customComment}
                onChange={(e) => {
                  setCustomComment(e.target.value);
                  setError("");
                }}
                placeholder={t("customCommentPlaceholder") || "Tell us why you're canceling..."}
                className="min-h-[100px]"
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isLoading
              ? t("confirming") || "Confirming..."
              : t("confirm") || "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

