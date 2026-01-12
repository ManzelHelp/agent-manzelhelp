"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { Link } from "@/i18n/navigation";
import {
  getTaskerRefundRequests,
  type WalletRefundRequest,
  type WalletRefundStatus,
} from "@/actions/wallet-refunds";
import { ConfirmPaymentDialog } from "@/components/wallet/ConfirmPaymentDialog";
import { formatDateShort } from "@/lib/date-utils";

export default function RefundRequestsPage() {
  const t = useTranslations("finance.walletRefund");
  const { toast } = useToast();
  const [requests, setRequests] = useState<WalletRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<WalletRefundRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await getTaskerRefundRequests();
      if (result.success && result.requests) {
        setRequests(result.requests);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load refund requests",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      toast({
        variant: "destructive",
        title: t("errors.loadFailed", { default: "Failed to load refund requests" }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status: WalletRefundStatus) => {
    const statusConfig = {
      pending: {
        label: t("status.pending"),
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      },
      payment_confirmed: {
        label: t("status.payment_confirmed"),
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: FileText,
      },
      admin_verifying: {
        label: t("status.admin_verifying"),
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        icon: AlertCircle,
      },
      approved: {
        label: t("status.approved"),
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      },
      rejected: {
        label: t("status.rejected"),
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleConfirmPayment = (request: WalletRefundRequest) => {
    setSelectedRequest(request);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSuccess = () => {
    fetchRequests();
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
  };

  const adminWhatsAppPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              {t("requests.title")}
            </h1>
          </div>
          <Link href="/tasker/finance">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance
            </Button>
          </Link>
        </div>

        {/* Requests List */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--color-primary)]" />
            <p className="text-[var(--color-text-secondary)]">Loading...</p>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-secondary)]" />
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
              {t("requests.noRequests")}
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              {t("requests.noRequestsDescription")}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {t("requests.amount")}: {request.amount} MAD
                        </CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                        <div>
                          <span className="font-medium">{t("requests.referenceCode")}:</span>{" "}
                          <span className="font-mono">{request.reference_code}</span>
                        </div>
                        <div>
                          <span className="font-medium">{t("requests.createdAt")}:</span>{" "}
                          {formatDateShort(request.created_at)}
                        </div>
                        {request.confirmed_at && (
                          <div>
                            <span className="font-medium">{t("requests.confirmedAt")}:</span>{" "}
                            {formatDateShort(request.confirmed_at)}
                          </div>
                        )}
                        {request.approved_at && (
                          <div>
                            <span className="font-medium">{t("requests.approvedAt")}:</span>{" "}
                            {formatDateShort(request.approved_at)}
                          </div>
                        )}
                        {(request.status === "payment_confirmed" ||
                          request.status === "admin_verifying") && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              {t("waitingForAdmin")}
                            </p>
                          </div>
                        )}
                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <span className="font-medium">Admin Notes:</span>{" "}
                            {request.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <Button
                          onClick={() => handleConfirmPayment(request)}
                          size="sm"
                          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                        >
                          {t("confirmPayment")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Confirm Payment Dialog */}
        {selectedRequest && (
          <ConfirmPaymentDialog
            isOpen={confirmDialogOpen}
            onClose={() => {
              setConfirmDialogOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onSuccess={handleConfirmSuccess}
            adminWhatsAppPhone={process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE}
          />
        )}
      </div>
    </div>
  );
}
