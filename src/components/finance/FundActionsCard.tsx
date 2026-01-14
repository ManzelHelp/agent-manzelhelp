"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Wallet,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Eye,
  History,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getWalletBalance } from "@/actions/finance";
import { getTaskerRefundRequests } from "@/actions/wallet-refunds";
import { RefundRequestDialog } from "@/components/wallet/RefundRequestDialog";
import { RefundRequestsHistoryDrawer } from "@/components/finance/RefundRequestsHistoryDrawer";
import { PendingRefundRequestsDrawer } from "@/components/finance/PendingRefundRequestsDrawer";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

interface FundActionsCardProps {
  onViewHistory?: () => void;
}

export function FundActionsCard({ onViewHistory }: FundActionsCardProps) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [pendingDrawerOpen, setPendingDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Re-create actions array when locale or pendingRequests change to ensure translations update
  // Note: We include locale explicitly to force recalculation when language changes
  // t() function reference doesn't change, but its return values do based on locale context
  const actions = useMemo(() => [
    {
      id: "request-refund",
      icon: <ArrowDown className="h-5 w-5" />,
      title: t("walletRefund.requestRefund", { default: "Request Refund" }),
      description: t("walletRefund.withdrawFromWallet", { default: "Withdraw from wallet" }),
      onClick: () => setRefundDialogOpen(true),
      variant: "default" as const,
      disabled: !walletBalance || walletBalance <= 0,
    },
    {
      id: "view-refunds",
      icon: <History className="h-5 w-5" />,
      title: t("walletRefund.viewRefunds", { default: "My Refund Requests" }),
      description: pendingRequests > 0 
        ? pendingRequests === 1
          ? t("walletRefund.pendingRequest", { count: 1, default: "1 pending" })
          : t("walletRefund.pendingRequests", { count: pendingRequests, default: `${pendingRequests} pending` })
        : t("walletRefund.viewPendingRequests", { default: "View pending requests" }),
      onClick: () => setPendingDrawerOpen(true),
      variant: "outline" as const,
      badge: pendingRequests > 0 ? pendingRequests : undefined,
    },
    {
      id: "view-transactions",
      icon: <Receipt className="h-5 w-5" />,
      title: t("walletRefund.refundRequestHistory", { default: "Refund Request History" }),
      description: t("walletRefund.allRefundRequests", { default: "All refund requests" }),
      onClick: () => setHistoryDrawerOpen(true),
      variant: "outline" as const,
    },
  ], [locale, pendingRequests, walletBalance, t]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balance, requests] = await Promise.all([
        getWalletBalance(),
        getTaskerRefundRequests(),
      ]);

      setWalletBalance(balance.available);
      
      // Count pending requests
      const pending = requests.requests?.filter(
        (r) => r.status === "pending" || r.status === "payment_confirmed" || r.status === "admin_verifying"
      ).length || 0;
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error loading fund actions data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "MAD") => {
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
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>{t("walletRefund.fundActions", { default: "Fund Actions" })}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadData}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            {t("walletRefund.manageFunds", { default: "Manage your wallet and refund requests" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1: Wallet Balance Display */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("walletRefund.currentBalance", { default: "Current Balance" })}
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(walletBalance || 0)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Ligne 2: Request Refund Button (pleine largeur) */}
          {actions
            .filter((action) => action.id === "request-refund")
            .map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                className="h-auto p-4 w-full mobile-button flex flex-col items-start justify-start gap-2 relative bg-primary/90 hover:bg-primary text-primary-foreground border border-primary/50"
                onClick={action.onClick}
                disabled={action.disabled || loading}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-foreground/20 text-primary-foreground">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base text-primary-foreground">
                        {action.title}
                      </div>
                      <div className="text-sm mt-0.5 text-primary-foreground/80">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            ))}

          {/* Ligne 3: My Refund Requests & Refund Request History (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions
              .filter((action) => action.id !== "request-refund")
              .map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className="h-auto p-4 mobile-button flex flex-col items-start justify-start gap-2 relative"
                  onClick={action.onClick}
                  disabled={action.disabled || loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                        {action.icon}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{action.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                    {action.badge && action.badge > 0 && (
                      <Badge 
                        variant="default" 
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white text-xs h-5 min-w-5 px-1.5 flex-shrink-0 flex items-center justify-center"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
          </div>

          {/* Quick Stats */}
          {pendingRequests > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {pendingRequests === 1 
                    ? t("walletRefund.pendingRequest", { count: 1, default: "1 request pending" })
                    : t("walletRefund.pendingRequests", { count: pendingRequests, default: `${pendingRequests} requests pending` })
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RefundRequestDialog
        isOpen={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        onSuccess={() => {
          loadData();
          setTimeout(() => {
            setPendingDrawerOpen(true);
          }, 2000);
        }}
      />

      <RefundRequestsHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
      />

      <PendingRefundRequestsDrawer
        isOpen={pendingDrawerOpen}
        onClose={() => setPendingDrawerOpen(false)}
      />
    </>
  );
}
