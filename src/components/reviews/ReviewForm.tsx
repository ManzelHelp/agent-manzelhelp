"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { createReview } from "@/actions/reviews";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { reviewSchema } from "@/lib/schemas/profile";
import { Label } from "@radix-ui/react-label";

export default function ReviewForm({ jobId, bookingId, onSuccess, onCancel }: any) {
  const { toast } = useToast();
  const t = useTranslations("reviews");
  const tToasts = useTranslations("toasts");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    overallRating: 0,
    qualityRating: 0,
    communicationRating: 0,
    timelinessRating: 0,
    comment: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasManuallySetSpecificRatings, setHasManuallySetSpecificRatings] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation Zod (Front-end) - Messages inline sous les champs
    const validation = reviewSchema.safeParse({
      overallRating: form.overallRating,
      qualityRating: form.qualityRating > 0 ? form.qualityRating : undefined,
      communicationRating: form.communicationRating > 0 ? form.communicationRating : undefined,
      timelinessRating: form.timelinessRating > 0 ? form.timelinessRating : undefined,
      comment: form.comment.trim() || undefined,
    });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      // Pas de toast pour les erreurs de validation front-end
      return;
    }

    // Clear errors if validation passes
    setFormErrors({});

    setIsSubmitting(true);
    try {
      const result = await createReview({
        jobId,
        bookingId,
        overallRating: form.overallRating,
        qualityRating: form.qualityRating > 0 ? form.qualityRating : undefined,
        communicationRating: form.communicationRating > 0 ? form.communicationRating : undefined,
        timelinessRating: form.timelinessRating > 0 ? form.timelinessRating : undefined,
        comment: form.comment.trim() || undefined,
      });

      if (result.success) {
        // Succès serveur - Toast
        toast({ 
          variant: "success", 
          title: t("thankYou"), 
          description: t("reviewPublished") 
        });
        if (onSuccess) onSuccess();
      } else {
        // Erreur serveur (back-end) - Toast uniquement
        toast({ 
          variant: "destructive", 
          title: tToasts("error"),
          description: result.error || tToasts("anErrorOccurred") 
        });
      }
    } catch (error) {
      // Erreur serveur (back-end) - Toast uniquement
      toast({ 
        variant: "destructive", 
        title: tToasts("error"),
        description: tToasts("anErrorOccurred") 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-6">
        {/* Note Globale */}
        <div className="space-y-4">
          <Label className="text-lg font-bold">{t("overallRating")}</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                type="button" 
                onClick={() => {
                  // Si les notes spécifiques n'ont pas été modifiées manuellement, auto-remplir avec la note globale
                  const newOverallRating = star;
                  const newForm = {
                    ...form,
                    overallRating: newOverallRating,
                  };
                  
                  // Auto-remplir les notes spécifiques seulement si elles n'ont pas été modifiées manuellement
                  if (!hasManuallySetSpecificRatings) {
                    newForm.qualityRating = newOverallRating;
                    newForm.communicationRating = newOverallRating;
                    newForm.timelinessRating = newOverallRating;
                  }
                  
                  setForm(newForm);
                  // Clear error when user selects a rating
                  if (formErrors.overallRating) {
                    setFormErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.overallRating;
                      return newErrors;
                    });
                  }
                }} 
                className="transition-transform hover:scale-110"
              >
                <Star className={`h-8 w-8 ${star <= form.overallRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          {formErrors.overallRating && (
            <p className="text-sm text-red-600 dark:text-red-400">{formErrors.overallRating}</p>
          )}
        </div>

        {/* Notes Spécifiques */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">{t("detailedRatings")}</Label>
          
          {/* Qualité */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">{t("qualityOfWork")}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => {
                    setForm({...form, qualityRating: star});
                    setHasManuallySetSpecificRatings(true);
                  }} 
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-6 w-6 ${star <= form.qualityRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">{t("communication")}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => {
                    setForm({...form, communicationRating: star});
                    setHasManuallySetSpecificRatings(true);
                  }} 
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-6 w-6 ${star <= form.communicationRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Ponctualité */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">{t("timeliness")}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => {
                    setForm({...form, timelinessRating: star});
                    setHasManuallySetSpecificRatings(true);
                  }} 
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-6 w-6 ${star <= form.timelinessRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("commentOptional")}</Label>
        <Textarea 
          placeholder={t("tellYourExperience")} 
          value={form.comment} 
          onChange={(e) => {
            setForm({...form, comment: e.target.value});
            // Clear error when user types
            if (formErrors.comment) {
              setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.comment;
                return newErrors;
              });
            }
          }}
          className={`h-32 dark:bg-slate-800 ${formErrors.comment ? "border-red-500" : ""}`}
          maxLength={2000}
        />
        {formErrors.comment && (
          <p className="text-sm text-red-600 dark:text-red-400">{formErrors.comment}</p>
        )}
        {!formErrors.comment && form.comment.length > 0 && (
          <p className="text-xs text-gray-500">{t("characterCount2000", { count: form.comment.length })}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t("cancel")}</Button>}
        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          {isSubmitting ? <Loader2 className="animate-spin" /> : t("publishReview")}
        </Button>
      </div>
    </form>
  );
}