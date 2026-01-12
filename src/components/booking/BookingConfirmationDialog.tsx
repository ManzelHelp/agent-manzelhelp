"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"; // CHANGEMENT
import { createBookingSchema } from "@/lib/schemas/bookings"; // CHANGEMENT
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
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function BookingConfirmationDialog({ isOpen, onClose, onSuccess, serviceData }: any) {
  const { toast } = useToast(); // HOOK TOAST
  const t = useTranslations("taskerOffer.bookingDialog");
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
              // Convertir l'ID en string pour correspondre au schéma Zod
              setFormData(prev => ({...prev, address_id: String(res.addresses[0].id)}));
            }
            setIsLoading(false);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation Zod (Front-end) - Messages inline sous les champs
    // z.coerce dans le schéma gère automatiquement les conversions de type
    const validationData = {
        ...formData,
        tasker_id: serviceData.tasker.id,
        tasker_service_id: serviceData.id,
        agreed_price: serviceData.price,
    };

    const validation = createBookingSchema.safeParse(validationData);

    if (!validation.success) {
      // Afficher les erreurs sous les champs concernés
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      
      // Afficher aussi un toast avec le premier message d'erreur pour attirer l'attention
      const firstError = validation.error.issues[0];
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: firstError.message,
      });
      return;
    }

    // Clear errors if validation passes
    setFormErrors({});

    setIsSubmitting(true);
    try {
      const result = await createServiceBooking(validationData); // FIX TYPESCRIPT ICI

      if (result.success) {
        toast({
          variant: "success",
          title: "Demande envoyée !",
          description: "L'assistant a été notifié de votre réservation.",
        });
        onSuccess(result.bookingId!);
        onClose();
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Une erreur est survenue." });
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

          {/* TON DESIGN ORIGINAL CONSERVÉ ICI */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500 font-bold">Service</p><p className="font-semibold">{serviceData.title}</p></div>
                <div><p className="text-xs text-slate-500 font-bold">Total</p><p className="font-bold text-green-600">MAD {getTotalPrice().toFixed(2)}</p></div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Besoins spécifiques (min 100 caractères) *</Label>
              <textarea 
                className={`w-full min-h-[120px] p-4 border rounded-xl dark:bg-slate-900 outline-none focus:ring-2 ${
                  formErrors.customer_requirements 
                    ? "border-red-500 focus:ring-red-500" 
                    : "focus:ring-green-500"
                }`}
                value={formData.customer_requirements}
                onChange={(e) => {
                  setFormData({...formData, customer_requirements: e.target.value});
                  // Clear error when user types
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
                <span>Min. 100 caractères</span>
                <span className={formData.customer_requirements.length < 100 ? "text-red-500" : "text-green-500"}>
                    {formData.customer_requirements.length} / 2000
                </span>
              </div>
              {formErrors.customer_requirements && (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.customer_requirements}</p>
              )}
            </div>

            <div className="space-y-3">
                <Label className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-blue-500" /> Adresse</Label>
                <select 
                    className={`w-full h-12 border rounded-xl px-4 dark:bg-slate-900 ${
                      formErrors.address_id ? "border-red-500" : ""
                    }`}
                    value={formData.address_id}
                    onChange={(e) => {
                      setFormData({...formData, address_id: String(e.target.value)});
                      // Clear error when user selects an address
                      if (formErrors.address_id) {
                        setFormErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.address_id;
                          return newErrors;
                        });
                      }
                    }}
                >
                    <option value="">Sélectionner une adresse</option>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Confirmer la réservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}