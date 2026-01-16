"use client";

import React from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { Transaction } from "@/actions/finance";
import { formatDateShort, formatCurrency as formatCurrencyUtil } from "@/lib/date-utils";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/supabase/client";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailDrawerProps) {
  const t = useTranslations("finance.walletRefund.transactionDetail");
  const tFinance = useTranslations("finance");
  const locale = useLocale();
  const [relatedInfo, setRelatedInfo] = React.useState<{
    jobTitle?: string | null;
    serviceTitle?: string | null;
  }>({});

  React.useEffect(() => {
    if (!isOpen || !transaction) return;
    const tx = transaction;
    let cancelled = false;

    async function loadRelated() {
      try {
        const supabase = createClient();

        const [jobRes, bookingRes] = await Promise.all([
          tx.jobId
            ? supabase.from("jobs").select("id, title").eq("id", tx.jobId).maybeSingle()
            : Promise.resolve({ data: null, error: null } as any),
          tx.bookingId
            ? supabase
                .from("service_bookings")
                .select("id, tasker_service_id, tasker_services(title)")
                .eq("id", tx.bookingId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null } as any),
        ]);

        if (cancelled) return;

        const jobTitle = jobRes?.data?.title ? String(jobRes.data.title) : null;

        let serviceTitle: string | null = null;
        const booking: any = bookingRes?.data;
        if (booking) {
          serviceTitle = Array.isArray(booking.tasker_services)
            ? booking.tasker_services[0]?.title
            : booking.tasker_services?.title || null;
        }

        setRelatedInfo({ jobTitle, serviceTitle });
      } catch {
        if (!cancelled) setRelatedInfo({});
      }
    }

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [isOpen, transaction?.bookingId, transaction?.jobId]);

  const formatCurrency = (amount: number, currency: string = "MAD") => {
    return formatCurrencyUtil(amount, currency, locale);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return formatDateShort(dateString, locale);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] || variants.pending
        }
      >
        {tFinance(`status.${status}`, { default: status })}
      </Badge>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    return t(`transactionTypes.${type}`, { default: type });
  };

  // Important: hooks must run on every render; only return null AFTER hooks.
  if (!transaction) return null;
  const tx = transaction;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[90vh] flex flex-col overflow-hidden">
        <DrawerHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(tx.paymentStatus)}
              <div>
                <DrawerTitle className="text-xl font-bold">
                  {t("title", { default: "Transaction Details" })}
                </DrawerTitle>
                <DrawerDescription>
                  {t("subtitle", { default: "View complete transaction information" })}
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          {/* Amount Section */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("amount", { default: "Amount" })}</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(tx.netAmount, tx.currency)}
                </p>
                {tx.platformFee > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("gross", { default: "Gross" })}: {formatCurrency(tx.amount, tx.currency)} 
                    {" - "}
                    {t("fee", { default: "Fee" })}: {formatCurrency(tx.platformFee, tx.currency)}
                  </p>
                )}
              </div>
              <div className="text-right">
                {getStatusBadge(tx.paymentStatus)}
                <p className="text-xs text-muted-foreground mt-2">
                  {getTransactionTypeLabel(tx.transactionType)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("transactionInformation", { default: "Transaction Information" })}
            </h3>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("transactionId", { default: "Transaction ID" })}</p>
                <p className="font-mono text-sm font-medium">{tx.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("type", { default: "Type" })}</p>
                <p className="font-medium">{getTransactionTypeLabel(tx.transactionType)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t("createdAt", { default: "Created At" })}
                </p>
                <p className="font-medium">{formatDate(tx.createdAt)}</p>
              </div>

              {tx.processedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t("processedAt", { default: "Processed At" })}
                  </p>
                  <p className="font-medium">{formatDate(tx.processedAt)}</p>
                </div>
              )}

              {tx.paymentMethod && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("paymentMethod", { default: "Payment Method" })}</p>
                  <p className="font-medium">{tFinance(`status.${tx.paymentMethod?.toLowerCase()}`, { default: tx.paymentMethod })}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("currency", { default: "Currency" })}</p>
                <p className="font-medium">{tx.currency}</p>
              </div>
            </div>
          </div>

          {/* Service/Job Information */}
          {(tx.relatedTitle || relatedInfo.jobTitle || relatedInfo.serviceTitle || tx.bookingId || tx.jobId) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t("serviceInformation", { default: "Service / Job Information" })}
                </h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("serviceTitle", { default: "Title" })}</p>
                    <p className="font-medium">
                      {relatedInfo.jobTitle ||
                        relatedInfo.serviceTitle ||
                        tx.relatedTitle ||
                        tx.serviceTitle ||
                        "—"}
                    </p>
                  </div>
                  {tx.bookingStatus && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("bookingStatus", { default: "Booking Status" })}</p>
                      <Badge variant="outline" className="capitalize">
                        {tFinance(`bookingStatuses.${tx.bookingStatus}`, {
                          default: tx.bookingStatus,
                        })}
                      </Badge>
                    </div>
                  )}
                  {tx.bookingId && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("bookingId", { default: "Booking ID" })}</p>
                      <p className="font-mono text-sm">{tx.bookingId}</p>
                    </div>
                  )}
                  {tx.jobId && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("jobId", { default: "Job ID" })}</p>
                      <p className="font-mono text-sm">{tx.jobId}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Fee Breakdown */}
          {tx.platformFee > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("feeBreakdown", { default: "Fee Breakdown" })}</h3>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("grossAmount", { default: "Gross Amount" })}</span>
                    <span className="font-medium">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("platformFee", { default: "Platform Fee" })}</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(tx.platformFee, tx.currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{t("netAmount", { default: "Net Amount" })}</span>
                    <span className="text-primary">
                      {formatCurrency(tx.netAmount, tx.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="border-t flex-shrink-0">
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
