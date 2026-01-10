"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  getAllRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  type WalletRefundRequest,
  type WalletRefundStatus,
} from "@/actions/wallet-refunds";
import { formatDistanceToNow } from "date-fns";
import { formatDateShort } from "@/lib/date-utils";

export default function AdminWalletRefundsPage() {
  const t = useTranslations("admin.walletRefunds");
  const [requests, setRequests] = useState<WalletRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    WalletRefundStatus | undefined
  >();
  const [selectedRequest, setSelectedRequest] =
    useState<WalletRefundRequest | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await getAllRefundRequests(selectedStatus);
      if (result.success && result.requests) {
        setRequests(result.requests);
      } else {
        toast.error(result.error || t("errors.loadFailed"));
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const getStatusBadgeColor = (status: WalletRefundStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "payment_confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "admin_verifying":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: WalletRefundStatus) => {
    return t(`status.${status}`);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setUpdating(selectedRequest.id);
    try {
      const result = await approveRefundRequest(selectedRequest.id);
      if (result.success) {
        toast.success(t("success.approved"));
        fetchRequests();
        setApproveDialogOpen(false);
        setSelectedRequest(null);
      } else {
        toast.error(result.error || t("errors.approveFailed"));
      }
    } catch (error) {
      console.error("Error approving refund request:", error);
      toast.error(t("errors.approveFailed"));
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionNotes.trim()) {
      toast.error(t("confirm.rejectReasonRequired"));
      return;
    }

    setUpdating(selectedRequest.id);
    try {
      const result = await rejectRefundRequest(
        selectedRequest.id,
        rejectionNotes
      );
      if (result.success) {
        toast.success(t("success.rejected"));
        fetchRequests();
        setRejectDialogOpen(false);
        setSelectedRequest(null);
        setRejectionNotes("");
      } else {
        toast.error(result.error || t("errors.rejectFailed"));
      }
    } catch (error) {
      console.error("Error rejecting refund request:", error);
      toast.error(t("errors.rejectFailed"));
    } finally {
      setUpdating(null);
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {t("title")}
          </h1>
          <p className="text-[var(--color-text-secondary)]">{t("description")}</p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t("filters.status")}:
              </span>
            </div>
            <Button
              variant={selectedStatus === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(undefined)}
            >
              {t("filters.all")}
            </Button>
            <Button
              variant={selectedStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("pending")}
            >
              {t("filters.pending")}
            </Button>
            <Button
              variant={
                selectedStatus === "payment_confirmed" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedStatus("payment_confirmed")}
            >
              {t("filters.payment_confirmed")}
            </Button>
            <Button
              variant={
                selectedStatus === "admin_verifying" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedStatus("admin_verifying")}
            >
              {t("filters.admin_verifying")}
            </Button>
            <Button
              variant={selectedStatus === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("approved")}
            >
              {t("filters.approved")}
            </Button>
            <Button
              variant={selectedStatus === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("rejected")}
            >
              {t("filters.rejected")}
            </Button>
          </div>
        </Card>

        {/* Requests List */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--color-primary)]" />
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-secondary)]" />
            <p className="text-[var(--color-text-secondary)]">{t("noRequests")}</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card
                key={request.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedRequest?.id === request.id
                    ? "ring-2 ring-[var(--color-primary)]"
                    : ""
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {request.tasker?.first_name} {request.tasker?.last_name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              request.status
                            )}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                          {request.tasker?.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-primary)] mb-2">
                          <span className="font-semibold">
                            {t("detail.amount")}: {request.amount} MAD
                          </span>
                          <span className="font-mono">
                            {t("detail.referenceCode")}: {request.reference_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                      {request.created_at
                        ? formatDistanceToNow(new Date(request.created_at), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("actions.view")}
                    </Button>
                    {request.status === "payment_confirmed" ||
                    request.status === "admin_verifying" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
                          }}
                          disabled={updating === request.id}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t("actions.approve")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                          disabled={updating === request.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t("actions.reject")}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <Dialog
            open={!!selectedRequest}
            onOpenChange={() => setSelectedRequest(null)}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {t("actions.view")} - {selectedRequest.reference_code}
                </DialogTitle>
                <DialogDescription>
                  {selectedRequest.tasker?.first_name}{" "}
                  {selectedRequest.tasker?.last_name} - {selectedRequest.tasker?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {t("detail.amount")}
                    </Label>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {selectedRequest.amount} MAD
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {t("detail.referenceCode")}
                    </Label>
                    <p className="font-mono text-[var(--color-text-primary)]">
                      {selectedRequest.reference_code}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {t("detail.createdAt")}
                    </Label>
                    <p className="text-[var(--color-text-primary)]">
                      {selectedRequest.created_at
                        ? formatDateShort(selectedRequest.created_at)
                        : "N/A"}
                    </p>
                  </div>
                  {selectedRequest.confirmed_at && (
                    <div>
                      <Label className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {t("detail.confirmedAt")}
                      </Label>
                      <p className="text-[var(--color-text-primary)]">
                        {formatDateShort(selectedRequest.confirmed_at)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.approved_at && (
                    <div>
                      <Label className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {t("detail.approvedAt")}
                      </Label>
                      <p className="text-[var(--color-text-primary)]">
                        {formatDateShort(selectedRequest.approved_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Receipt */}
                {selectedRequest.receipt_url && (
                  <div>
                    <Label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
                      {t("detail.receipt")}
                    </Label>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleViewReceipt(selectedRequest.receipt_url!)
                      }
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("actions.viewReceipt")}
                    </Button>
                    {selectedRequest.receipt_url.includes("image") && (
                      <div className="mt-4">
                        <img
                          src={selectedRequest.receipt_url}
                          alt="Receipt"
                          className="max-w-full max-h-96 rounded-lg border border-[var(--color-border)]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRequest.admin_notes && (
                  <div className="p-4 bg-[var(--color-surface)] rounded-lg">
                    <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                      {t("detail.adminNotes")}
                    </Label>
                    <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {(selectedRequest.status === "payment_confirmed" ||
                  selectedRequest.status === "admin_verifying") && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setApproveDialogOpen(true);
                      }}
                      disabled={updating === selectedRequest.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {updating === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {t("actions.approve")}
                    </Button>
                    <Button
                      onClick={() => {
                        setRejectDialogOpen(true);
                      }}
                      disabled={updating === selectedRequest.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {updating === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {t("actions.reject")}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Approve Confirmation Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("confirm.approveTitle")}</DialogTitle>
              <DialogDescription>
                {t("confirm.approveMessage")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={updating === selectedRequest?.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updating === selectedRequest?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("actions.approve")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("confirm.rejectTitle")}</DialogTitle>
              <DialogDescription>
                {t("confirm.rejectMessage")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="rejectionNotes">
                  {t("detail.rejectionReason")}
                </Label>
                <Textarea
                  id="rejectionNotes"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder={t("detail.enterNotes")}
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setRejectionNotes("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={
                    updating === selectedRequest?.id || !rejectionNotes.trim()
                  }
                  variant="destructive"
                  className="flex-1"
                >
                  {updating === selectedRequest?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {t("actions.reject")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
