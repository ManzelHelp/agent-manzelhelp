"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  CheckCircle,
} from "lucide-react";
import { getTaskerRefundRequests, type WalletRefundRequest } from "@/actions/wallet-refunds";
import { formatDateShort } from "@/lib/date-utils";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ConfirmPaymentDialog } from "@/components/wallet/ConfirmPaymentDialog";

interface PendingRefundRequestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendingRefundRequestsDrawer({
  isOpen,
  onClose,
}: PendingRefundRequestsDrawerProps) {
  const t = useTranslations("finance.walletRefund");
  const locale = useLocale();
  const router = useRouter();
  const [requests, setRequests] = useState<WalletRefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedRequestForConfirmation, setSelectedRequestForConfirmation] = useState<WalletRefundRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    } else {
      setRequests([]);
    }
  }, [isOpen]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await getTaskerRefundRequests();
      if (result.success && result.requests) {
        // Filter only pending, payment_confirmed, and admin_verifying requests
        const pendingRequests = result.requests.filter(
          (r) => r.status === "pending" || r.status === "payment_confirmed" || r.status === "admin_verifying"
        );
        setRequests(pendingRequests);
      } else {
        toast.error(result.error || t("errors.loadFailed", { default: "Failed to load requests" }));
      }
    } catch (error) {
      console.error("Error loading pending refund requests:", error);
      toast.error(t("errors.loadFailed", { default: "Failed to load requests" }));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    // Map locale to proper locale format for NumberFormat
    const localeMap: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      ar: "ar-MA",
    };
    const numberLocale = localeMap[locale] || "en-US";
    
    return new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return formatDateShort(dateString);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: t("status.pending", { default: "Pending" }) },
      payment_confirmed: { variant: "default", label: t("status.payment_confirmed", { default: "Payment Confirmed" }) },
      admin_verifying: { variant: "default", label: t("status.admin_verifying", { default: "Under Review" }) },
    };

    const statusInfo = statusMap[status] || { variant: "outline" as const, label: status };
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const copyToClipboard = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      toast.success(t("codeCopied", { default: "Code copied!" }));
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error(t("errors.copyFailed", { default: "Failed to copy code" }));
    }
  };

  const handleConfirmPayment = (request: WalletRefundRequest) => {
    setSelectedRequestForConfirmation(request);
  };

  const handleConfirmationSuccess = () => {
    setSelectedRequestForConfirmation(null);
    loadRequests(); // Reload requests to update status
  };

  const handleConfirmationClose = () => {
    setSelectedRequestForConfirmation(null);
  };

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b shrink-0 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("pendingRequestsDrawer.title", { default: "Pending Refund Requests" })}
              </DrawerTitle>
              <DrawerDescription>
                {t("pendingRequestsDrawer.description", { default: "Your active refund requests in progress" })}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadRequests}
                disabled={loading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && requests.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {t("pendingRequestsDrawer.noPending", { default: "No pending requests" })}
              </h3>
              <p className="text-muted-foreground">
                {t("pendingRequestsDrawer.noPendingDescription", { default: "All your refund requests have been processed" })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-bold text-lg">
                          {formatCurrency(request.amount)}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{t("requests.createdAt", { default: "Created" })}: {formatDate(request.created_at)}</span>
                        </div>
                        {request.confirmed_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{t("requests.confirmedAt", { default: "Confirmed" })}: {formatDate(request.confirmed_at)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {request.reference_code}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(request.reference_code, request.id)}
                        >
                          {copiedCode === request.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                            {t("instructions.title")}:
                          </p>
                          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                            <li>{t("instructions.step1", { default: "Use the reference code above for your bank transfer" })}</li>
                            <li>{t("instructions.step2", { default: "Complete the bank transfer with the specified amount" })}</li>
                            <li>{t("instructions.step3", { default: "Click 'Confirm Payment' and upload your receipt" })}</li>
                          </ol>
                        </div>
                        <Button
                          onClick={() => {
                            handleConfirmPayment(request);
                          }}
                          className="w-full"
                          variant="default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t("confirmPayment", { default: "Confirm Payment" })}
                        </Button>
                      </div>
                    </>
                  )}

                  {request.status === "payment_confirmed" || request.status === "admin_verifying" ? (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          {t("waitingForAdmin", { default: "Waiting for admin to activate the fund" })}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={() => {
              router.push("/tasker/finance/refunds");
              onClose();
            }}
            className="w-full"
          >
            {t("viewAllRequests", { default: "View All Requests" })}
          </Button>
          <DrawerClose asChild>
            <Button variant="default" className="w-full">
              {t("close", { default: "Close" })}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    {/* Confirm Payment Dialog */}
    {selectedRequestForConfirmation && (
      <ConfirmPaymentDialog
        isOpen={!!selectedRequestForConfirmation}
        onClose={handleConfirmationClose}
        request={selectedRequestForConfirmation}
        onSuccess={handleConfirmationSuccess}
        adminWhatsAppPhone={process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE}
      />
    )}
  </>
  );
}
