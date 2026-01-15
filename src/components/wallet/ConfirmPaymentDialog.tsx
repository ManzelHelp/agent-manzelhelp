"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { receiptFileSchema } from "@/lib/schemas/wallet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, X, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  confirmRefundPayment,
  type WalletRefundRequest,
} from "@/actions/wallet-refunds";
import { uploadRefundReceipt } from "@/actions/file-uploads";

interface ConfirmPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: WalletRefundRequest;
  onSuccess?: () => void;
  adminWhatsAppPhone?: string;
}

export function ConfirmPaymentDialog({
  isOpen,
  onClose,
  request,
  onSuccess,
  adminWhatsAppPhone: propAdminWhatsAppPhone,
}: ConfirmPaymentDialogProps) {
  const t = useTranslations("finance.walletRefund");
  const { toast } = useToast();
  // Try to get admin WhatsApp phone from prop first, then from env
  const adminWhatsAppPhone = propAdminWhatsAppPhone || process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;
  
  // Debug: Log WhatsApp phone configuration
  if (isOpen) {
    console.log("🔍 WhatsApp Config:", {
      hasProp: !!propAdminWhatsAppPhone,
      propValue: propAdminWhatsAppPhone,
      hasEnv: !!process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE,
      envValue: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE,
      finalValue: adminWhatsAppPhone,
    });
  }
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate with Zod
    const validation = receiptFileSchema.safeParse(file);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Fichier invalide";
      setFileError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: errorMessage,
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFileError(null);
    setReceiptFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmPayment = async () => {
    if (!receiptFile) {
      setFileError(t("receiptRequired"));
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("receiptRequired"),
      });
      return;
    }

    // Validate file again before submission
    const validation = receiptFileSchema.safeParse(receiptFile);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Fichier invalide";
      setFileError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: errorMessage,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload receipt
      const uploadResult = await uploadRefundReceipt(request.id, receiptFile);

      if (!uploadResult.success || !uploadResult.url) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: uploadResult.errorMessage || t("errors.uploadFailed"),
        });
        setIsUploading(false);
        return;
      }

      // Confirm payment
      const confirmResult = await confirmRefundPayment(
        request.id,
        uploadResult.url
      );

      if (confirmResult.success) {
        // Prepare WhatsApp URL BEFORE closing dialog (while user interaction context is valid)
        let whatsappUrl: string | null = null;
        if (adminWhatsAppPhone && adminWhatsAppPhone.trim()) {
          const message = t("whatsapp.message", {
            referenceCode: request.reference_code,
            amount: request.amount,
          });
          const cleanPhone = adminWhatsAppPhone.replace(/[^0-9]/g, "");
          
          if (cleanPhone) {
            whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          } else {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: t("errors.whatsappInvalidPhone"),
            });
          }
        } else {
          toast({
            variant: "default",
            title: "Avertissement",
            description: t("errors.whatsappNotConfigured"),
          });
        }

        toast({
          variant: "success",
          title: "Succès",
          description: t("success.paymentConfirmed"),
        });

        // Close dialog
        handleClose();

        // Open WhatsApp - use direct navigation which always works
        if (whatsappUrl) {
          console.log("📱 Opening WhatsApp:", whatsappUrl);
          
          // Small delay to ensure dialog is closed first, then redirect
          setTimeout(() => {
            // Direct navigation always works, even if popup is blocked
            window.location.href = whatsappUrl;
          }, 300);
        }

        if (onSuccess) {
          // Call onSuccess after a short delay to allow dialog to close
          setTimeout(() => {
            onSuccess();
          }, 200);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: confirmResult.error || t("errors.confirmFailed"),
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("errors.confirmFailed"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                {t("confirmPayment")}
              </DialogTitle>
              <DialogDescription className="text-[var(--color-text-secondary)]">
                {t("uploadReceiptDescription", { default: "Upload your bank transfer receipt to confirm the payment" })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Request Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("referenceCode")}
              </span>
              <span className="font-mono font-semibold text-[var(--color-text-primary)]">
                {request.reference_code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("amount")}
              </span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {request.amount} MAD
              </span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
              {t("uploadReceipt")}
            </Label>
            {!receiptFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  fileError
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                )}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-secondary)]" />
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t("clickToUploadReceipt", { default: "Click to upload receipt (JPG, PNG, WebP, or PDF)" })}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {t("maxFileSize", { default: "Max file size: 5MB" })}
                </div>
              </div>
            ) : (
              <div className="border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[var(--color-primary)]" />
                    <div>
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {receiptFile.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {receiptPreview && (
                  <div className="mt-4">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="max-w-full max-h-64 mx-auto rounded-lg border border-[var(--color-border)]"
                    />
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
              aria-invalid={!!fileError}
            />
            {fileError && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                {fileError}
              </p>
            )}
          </div>

          {/* Info Message */}
          {adminWhatsAppPhone && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-400">
                {t("whatsappRedirectMessage", { default: "After uploading the receipt, you will be redirected to WhatsApp to send it to the admin." })}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmPayment}
            disabled={!receiptFile || isUploading}
            className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("confirmPayment")}...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t("confirmPayment")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
