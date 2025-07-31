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
  // Get missing fields for this section
  const paymentMissingFields = missingFields.filter(
    (field) => field.section === "payment"
  );

  return (
    <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-color-text-primary">
              Payment Methods
            </CardTitle>
            <CardDescription className="text-color-text-secondary">
              Manage your payment methods and billing information
            </CardDescription>
          </div>
          {paymentMissingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
              <AlertTriangle className="h-4 w-4 text-color-error" />
              <span className="text-sm font-medium text-color-error">
                {paymentMissingFields.length} missing
              </span>
            </div>
          )}
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-color-text-secondary" />
          </div>
          <h3 className="font-semibold text-color-text-primary mb-2">
            No payment methods
          </h3>
          <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
            Add payment methods to receive payments for your services
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Payment Method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
