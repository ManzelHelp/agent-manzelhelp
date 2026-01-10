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
import { useTranslations } from "next-intl";

interface PaymentSectionProps {
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

export default function PaymentSection({ missingFields }: PaymentSectionProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  // Get missing fields for this section
  const paymentMissingFields = missingFields.filter(
    (field) => field.section === "payment"
  );

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full">
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
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
              <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
              <span className="text-sm font-medium text-[var(--color-error)]">
                {t("missing", { count: paymentMissingFields.length })}
              </span>
            </div>
          )}
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("addMethod")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-[var(--color-accent)]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-[var(--color-text-secondary)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
            {t("noPaymentMethods")}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
            {t("addPaymentMethodsDescription")}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addFirstPaymentMethod")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
