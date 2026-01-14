"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // CHANGEMENT
import { useTranslations } from "next-intl";

interface PaymentSectionProps {
  missingFields: any[];
}

export default function PaymentSection({ missingFields }: PaymentSectionProps) {
  const t = useTranslations("profile");
  const { toast } = useToast(); // HOOK TOAST

  const paymentMissingFields = missingFields.filter(
    (field) => field.section === "payment"
  );

  const handleAddPaymentClick = () => {
    // Intégration Toast Premium pour informer l'utilisateur
    toast({
      title: t("sections.payment.comingSoon"),
      description: t("sections.payment.comingSoonDescription"),
    });
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm dark:bg-slate-900/50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-lg shadow-indigo-500/20">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                {t("paymentMethods")}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                {t("managePaymentMethods")}
              </CardDescription>
            </div>
          </div>
          {paymentMissingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-500">
                {t("missing", { count: paymentMissingFields.length })}
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleAddPaymentClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addMethod")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-white/40 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
            {t("noPaymentMethods")}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto text-sm">
            {t("addPaymentMethodsDescription")}
          </p>
          <Button onClick={handleAddPaymentClick} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("addFirstPaymentMethod")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}