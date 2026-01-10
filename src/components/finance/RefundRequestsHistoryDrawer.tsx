"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import { getTaskerRefundRequests, type WalletRefundRequest } from "@/actions/wallet-refunds";
import { formatDateShort } from "@/lib/date-utils";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

interface RefundRequestsHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RefundRequestsHistoryDrawer({
  isOpen,
  onClose,
}: RefundRequestsHistoryDrawerProps) {
  const t = useTranslations("finance.walletRefund");
  const [requests, setRequests] = useState<WalletRefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    } else {
      // Reset when drawer closes
      setRequests([]);
      setHasMore(false);
    }
  }, [isOpen]);

  // Lazy loading avec Intersection Observer
  useEffect(() => {
    if (!isOpen || !hasMore || isLoadingMore || loading || requests.length === 0) return;

    const loadMore = async () => {
      setIsLoadingMore(true);
      try {
        const result = await getTaskerRefundRequests();
        if (result.success && result.requests) {
          // Get already loaded IDs to avoid duplicates
          const existingIds = new Set(requests.map((r) => r.id));
          const newRequests = result.requests.filter((r) => !existingIds.has(r.id));
          
          if (newRequests.length > 0) {
            setRequests((prev) => [...prev, ...newRequests]);
          }
          // Since getTaskerRefundRequests returns all requests, we assume no more if we get all
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more requests:", error);
        toast.error(t("errors.loadFailed", { default: "Failed to load more requests" }));
      } finally {
        setIsLoadingMore(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isOpen, hasMore, isLoadingMore, loading, requests, t]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await getTaskerRefundRequests();
      if (result.success && result.requests) {
        setRequests(result.requests);
        // Since getTaskerRefundRequests returns all, we assume no more for now
        setHasMore(false);
      } else {
        toast.error(result.error || t("errors.loadFailed", { default: "Failed to load requests" }));
      }
    } catch (error) {
      console.error("Error loading refund requests:", error);
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
      approved: { variant: "default", label: t("status.approved", { default: "Approved" }) },
      rejected: { variant: "destructive", label: t("status.rejected", { default: "Rejected" }) },
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

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b shrink-0 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("refundHistory.title", { default: "Refund Request History" })}
              </DrawerTitle>
              <DrawerDescription>
                {t("refundHistory.description", { default: "View all your refund requests" })}
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
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {t("requests.noRequests", { default: "No refund requests yet" })}
              </h3>
              <p className="text-muted-foreground">
                {t("requests.noRequestsDescription", { default: "Your refund requests will appear here" })}
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
                        {request.approved_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{t("requests.approvedAt", { default: "Approved" })}: {formatDate(request.approved_at)}</span>
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

                  {request.admin_notes && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{t("adminNotes", { default: "Admin Notes" })}:</p>
                        <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                      </div>
                    </>
                  )}

                  {request.status === "pending" && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {t("waitingForAdmin", { default: "Waiting for admin to activate the fund" })}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Lazy Loading Trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-4">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  ) : (
                    <div className="h-1 w-full" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t shrink-0 bg-background">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              {t("close", { default: "Close" })}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
