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
import { AlertCircle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isLoading?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "destructive":
      return {
        icon: X,
        iconColor: "text-red-600 dark:text-red-400",
        buttonColor: "bg-red-600 text-white hover:bg-red-700",
      };
    case "outline":
      return {
        icon: AlertCircle,
        iconColor: "text-blue-600 dark:text-blue-400",
        buttonColor:
          "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      };
    case "secondary":
      return {
        icon: AlertCircle,
        iconColor: "text-slate-600 dark:text-slate-400",
        buttonColor:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      };
    case "ghost":
      return {
        icon: AlertCircle,
        iconColor: "text-slate-600 dark:text-slate-400",
        buttonColor: "hover:bg-slate-100 dark:hover:bg-slate-800",
      };
    case "link":
      return {
        icon: AlertCircle,
        iconColor: "text-blue-600 dark:text-blue-400",
        buttonColor:
          "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      };
    default:
      return {
        icon: AlertCircle,
        iconColor: "text-blue-600 dark:text-blue-400",
        buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
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
