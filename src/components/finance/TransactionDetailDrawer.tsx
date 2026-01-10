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
import { formatDateShort } from "@/lib/date-utils";

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
  if (!transaction) return null;

  const formatCurrency = (amount: number, currency: string = "MAD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return formatDateShort(dateString);
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
        {status}
      </Badge>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      job_payment: "Job Payment",
      platform_fee: "Platform Fee",
      premium_application: "Premium Application",
      refund: "Refund",
      job_promotion: "Job Promotion",
      service_promotion: "Service Promotion",
      withdrawal: "Withdrawal",
      deposit: "Deposit",
    };
    return labels[type] || type;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(transaction.paymentStatus)}
              <div>
                <DrawerTitle className="text-xl font-bold">
                  Transaction Details
                </DrawerTitle>
                <DrawerDescription>
                  View complete transaction information
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

        <div className="p-6 space-y-6">
          {/* Amount Section */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(transaction.netAmount, transaction.currency)}
                </p>
                {transaction.platformFee > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Gross: {formatCurrency(transaction.amount, transaction.currency)} 
                    {" - "}
                    Fee: {formatCurrency(transaction.platformFee, transaction.currency)}
                  </p>
                )}
              </div>
              <div className="text-right">
                {getStatusBadge(transaction.paymentStatus)}
                <p className="text-xs text-muted-foreground mt-2">
                  {getTransactionTypeLabel(transaction.transactionType)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Information
            </h3>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm font-medium">{transaction.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{getTransactionTypeLabel(transaction.transactionType)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created At
                </p>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>

              {transaction.processedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Processed At
                  </p>
                  <p className="font-medium">{formatDate(transaction.processedAt)}</p>
                </div>
              )}

              {transaction.paymentMethod && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{transaction.paymentMethod}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium">{transaction.currency}</p>
              </div>
            </div>
          </div>

          {/* Service/Job Information */}
          {transaction.serviceTitle && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Service Information
                </h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Service Title</p>
                    <p className="font-medium">{transaction.serviceTitle}</p>
                  </div>
                  {transaction.bookingStatus && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Booking Status</p>
                      <Badge variant="outline" className="capitalize">
                        {transaction.bookingStatus}
                      </Badge>
                    </div>
                  )}
                  {transaction.bookingId && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="font-mono text-sm">{transaction.bookingId}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Fee Breakdown */}
          {transaction.platformFee > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Fee Breakdown</h3>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross Amount</span>
                    <span className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Fee</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(transaction.platformFee, transaction.currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Net Amount</span>
                    <span className="text-primary">
                      {formatCurrency(transaction.netAmount, transaction.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
