"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast"; // Changement
import { bioExperienceSchema } from "@/lib/schemas/profile"; // Changement
import { createTaskerProfileAction, hasTaskerCompletedProfileAction } from "@/actions/auth";
import { uploadIDDocumentsAction } from "@/actions/file-uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ArrowRight, Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { Label } from "@/components/ui/label";

export default function FinishSignUpPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDocuments, setIdDocuments] = useState<any>({});
  
  const [formData, setFormData] = useState({
    bio: "",
    experience_level: "beginner" as any,
    service_radius_km: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Senior move
    setIsSubmitting(true);

    // 1. Validation Zod (Bio/Rayon)
    const validation = bioExperienceSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: validation.error.issues[0].message,
      });
      setIsSubmitting(false);
      return;
    }

    // 2. Validation Documents ID
    if (!idDocuments.front || !idDocuments.back) {
      toast({ variant: "destructive", title: "ID Manquante", description: "Veuillez uploader les deux faces de votre pièce d'identité." });
      setIsSubmitting(false);
      return;
    }

    try {
      // 3. Upload des documents
      const uploadResult = await uploadIDDocumentsAction(user!.id, idDocuments.front, idDocuments.back);
      if (!uploadResult.success) throw new Error("Erreur upload");

      // 4. Création du profil
      const result = await createTaskerProfileAction({
        ...formData,
        identity_document_url: uploadResult.frontPath,
        is_available: true,
        operation_hours: {} 
      });

      if (result.success) {
        toast({ variant: "success", title: "Bienvenue !", description: "Votre compte Assistant est maintenant actif." });
        router.replace("/tasker/dashboard");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Une erreur est survenue lors de la création du profil." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <form onSubmit={handleSubmit} noValidate>
        <Card className="shadow-2xl border-0 bg-white/95">
          <CardHeader className="text-center">
             <Sparkles className="mx-auto text-orange-500 mb-2" />
             <CardTitle className="text-3xl font-bold">Complétez votre profil Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="space-y-3">
                <Label>Décrivez votre expérience (min 50 caractères)</Label>
                <textarea 
                  className="w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Ex: J'ai 5 ans d'expérience dans le nettoyage..."
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
                <p className="text-xs text-slate-400">Caractères : {formData.bio.length} / 500</p>
             </div>

             {/* Bouton de soumission stylisé */}
             <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Valider mon profil"}
             </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}