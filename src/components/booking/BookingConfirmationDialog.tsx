"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createBookingSchema } from "@/lib/schemas/bookings";
import { getCustomerProfileData } from "@/actions/profile";
import { createServiceBooking } from "@/actions/bookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export function BookingConfirmationDialog({ isOpen, onClose, onSuccess, serviceData }: any) {
  const { toast } = useToast();
  const t = useTranslations("taskerOffer.bookingDialog");
  const tCommon = useTranslations("common");

  const [formData, setFormData] = useState({
    booking_type: "instant" as any,
    scheduled_date: "",
    scheduled_time_start: "",
    scheduled_time_end: "",
    estimated_duration: 1,
    address_id: "",
    customer_requirements: "",
    payment_method: "wallet" as any
  });
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
        setIsLoading(true);
        getCustomerProfileData().then(res => {
            setAddresses(res.addresses || []);
            if (res.addresses?.length > 0) {
              setFormData(prev => ({...prev, address_id: String(res.addresses[0].id)}));
            }
            setIsLoading(false);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationData = {
        ...formData,
        tasker_id: serviceData.tasker.id,
        tasker_service_id: serviceData.id,
        agreed_price: serviceData.price,
    };

    const validation = createBookingSchema.safeParse(validationData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      
      toast({
        variant: "destructive",
        title: t("validationError"),
        description: validation.error.issues[0].message,
      });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    try {
      const result = await createServiceBooking(validationData);

      if (result.success) {
        toast({
          variant: "success",
          title: t("successTitle"),
          description: t("successDescription"),
        });
        onSuccess(result.bookingId!);
        onClose();
      } else {
        toast({ variant: "destructive", title: tCommon("error"), description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: tCommon("error"), description: tCommon("unknown") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalPrice = () => {
    return serviceData.pricing_type === "hourly" ? serviceData.price * formData.estimated_duration : serviceData.price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-slate-950">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-bold">{t("title")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500 font-bold">{t("service")}</p><p className="font-semibold">{serviceData.title}</p></div>
                <div><p className="text-xs text-slate-500 font-bold">{t("total")}</p><p className="font-bold text-green-600">MAD {getTotalPrice().toFixed(2)}</p></div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">{t("requirementsLabel")}</Label>
              <textarea 
                className={`w-full min-h-[120px] p-4 border rounded-xl dark:bg-slate-900 outline-none focus:ring-2 ${
                  formErrors.customer_requirements ? "border-red-500 focus:ring-red-500" : "focus:ring-green-500"
                }`}
                value={formData.customer_requirements}
                onChange={(e) => {
                  setFormData({...formData, customer_requirements: e.target.value});
                  if (formErrors.customer_requirements) {
                    setFormErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.customer_requirements;
                      return newErrors;
                    });
                  }
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{t("minCharacters")}</span>
                <span className={formData.customer_requirements.length < 100 ? "text-red-500" : "text-green-500"}>
                    {formData.customer_requirements.length} / 2000
                </span>
              </div>
              {formErrors.customer_requirements && (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.customer_requirements}</p>
              )}
            </div>

            <div className="space-y-3">
                <Label className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-blue-500" /> {t("addressLabel")}</Label>
                <select 
                    className={`w-full h-12 border rounded-xl px-4 dark:bg-slate-900 ${
                      formErrors.address_id ? "border-red-500" : ""
                    }`}
                    value={formData.address_id}
                    onChange={(e) => {
                      setFormData({...formData, address_id: String(e.target.value)});
                      if (formErrors.address_id) {
                        setFormErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.address_id;
                          return newErrors;
                        });
                      }
                    }}
                >
                    <option value="">{t("selectAddress")}</option>
                    {addresses.map((addr: any) => (
                      <option key={addr.id} value={String(addr.id)}>
                        {addr.label} - {addr.street_address}
                      </option>
                    ))}
                </select>
                {formErrors.address_id && (
                  <p className="text-sm text-red-600 dark:text-red-400">{formErrors.address_id}</p>
                )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{tCommon("cancel")}</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : t("confirmButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}