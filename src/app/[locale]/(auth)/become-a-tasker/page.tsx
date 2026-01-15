"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast"; // CHANGEMENT
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import { becomeTaskerAction, getCurrentUserRole } from "@/actions/become-tasker";
import { bioExperienceSchema } from "@/lib/schemas/profile"; // CHANGEMENT
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, FileText, ArrowRight, Sparkles, Shield, Star, Loader2 } from "lucide-react";

export default function BecomeATaskerPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { toast } = useToast();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    experience_level: "beginner" as any,
    bio: "",
    service_radius_km: 50,
    is_available: true,
    operation_hours: {
      monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
      saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Validation Zod
    const validation = bioExperienceSchema.safeParse({
        bio: formData.bio,
        experience_level: formData.experience_level,
        service_radius_km: formData.service_radius_km
    });

    if (!validation.success) {
      toast({ variant: "destructive", title: "Profil incomplet", description: validation.error.issues[0].message });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await becomeTaskerAction(formData);
      if (result.success && result.user) {
        setUser(result.user);
        toast({ variant: "success", title: "Félicitations !", description: t("pages.becomeTasker.congratulations") });
        router.push("/tasker/dashboard");
      } else {
        toast({ variant: "destructive", description: result.errorMessage });
      }
    } catch {
      toast({ variant: "destructive", description: t("pages.becomeTasker.unexpectedError") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <Card className="shadow-2xl border-0 dark:bg-slate-900/90">
             <CardHeader className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <CardTitle className="text-3xl font-bold dark:text-white">{t("pages.becomeTasker.title")}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <Label className="dark:text-slate-200">Biographie professionnelle (min 50 caractères)</Label>
                   <textarea 
                      className="w-full h-40 p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Décrivez vos compétences..."
                   />
                   <p className="text-xs text-slate-500">{formData.bio.length}/500 caractères</p>
                </div>
                {/* Autres sections simplifiées pour l'exemple */}
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : "Devenir Assistant"}
                </Button>
             </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}