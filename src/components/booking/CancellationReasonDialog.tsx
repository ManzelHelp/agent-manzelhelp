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
import { cancellationReasonSchema } from "@/lib/schemas/messages";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customComment, setCustomComment] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleConfirm = () => {
    // 1. Validation Zod (Front-end) - Messages inline sous les champs
    const validation = cancellationReasonSchema.safeParse({
      reason: selectedReason,
      customComment: customComment.trim() || undefined,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      // Pas de toast pour les erreurs de validation front-end
      return;
    }

    // Clear errors if validation passes
    setFormErrors({});
    
    const reasonText = selectedReason === "other" 
      ? customComment.trim()
      : t(`reasons.${selectedReason}`) || selectedReason;
    
    onConfirm(reasonText, selectedReason === "other" ? customComment.trim() : undefined);
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomComment("");
    setFormErrors({});
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
                // Clear error when user selects a reason
                if (formErrors.reason) {
                  setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.reason;
                    return newErrors;
                  });
                }
                if (value !== "other") {
                  setCustomComment("");
                  // Clear custom comment error if switching away from "other"
                  if (formErrors.customComment) {
                    setFormErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.customComment;
                      return newErrors;
                    });
                  }
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
                    {t.has(`reasons.${reason}`) ? t(`reasons.${reason}`) : reason.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {formErrors.reason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.reason}</p>
            )}
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
                  // Clear error when user types
                  if (formErrors.customComment) {
                    setFormErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.customComment;
                      return newErrors;
                    });
                  }
                }}
                placeholder={t("customCommentPlaceholder") || "Tell us why you're canceling..."}
                className={`min-h-[100px] ${formErrors.customComment ? "border-red-500" : ""}`}
                maxLength={500}
              />
              {formErrors.customComment && (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.customComment}</p>
              )}
              {!formErrors.customComment && customComment.length > 0 && (
                <p className="text-xs text-gray-500">{customComment.length}/500</p>
              )}
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

