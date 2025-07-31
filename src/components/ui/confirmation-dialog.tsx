"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "success":
      return {
        icon: CheckCircle,
        iconColor: "text-color-success",
        buttonColor:
          "bg-color-success text-color-surface hover:bg-color-success-dark",
      };
    case "warning":
      return {
        icon: AlertCircle,
        iconColor: "text-color-warning",
        buttonColor:
          "bg-color-warning text-color-surface hover:bg-color-warning-dark",
      };
    case "danger":
      return {
        icon: X,
        iconColor: "text-color-error",
        buttonColor:
          "bg-color-error text-color-surface hover:bg-color-error-dark",
      };
    default:
      return {
        icon: AlertCircle,
        iconColor: "text-color-primary",
        buttonColor:
          "bg-color-primary text-color-surface hover:bg-color-primary-dark",
      };
  }
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const variantStyles = getVariantStyles(variant);
  const IconComponent = variantStyles.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${variantStyles.iconColor}`} />
            <DialogTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-color-text-secondary mobile-leading">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border-color-border text-color-text-secondary hover:bg-color-accent-light"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto ${variantStyles.buttonColor} touch-target mobile-focus`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
