"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FileText, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bioExperienceSchema } from "@/lib/schemas/profile";
import { updateTaskerBio } from "@/actions/profile";
import { useTranslations } from "next-intl";

export default function BioExperienceSection({ taskerProfile, loading, onProfileRefresh }: any) {
  const { toast } = useToast();
  const t = useTranslations("profile");
  const [editBioOpen, setEditBioOpen] = useState(false);
  
  const [bioForm, setBioForm] = useState({
    bio: taskerProfile?.bio || "",
    experience_level: taskerProfile?.experience_level || "beginner",
    service_radius_km: taskerProfile?.service_radius_km || 50,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = bioExperienceSchema.safeParse(bioForm);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validation échouée",
        description: validation.error.issues[0].message,
      });
      return;
    }

    try {
      const result = await updateTaskerBio(taskerProfile.id, bioForm);
      if (result.success) {
        toast({ variant: "success", title: "Mis à jour", description: "Vos informations professionnelles sont à jour." });
        setEditBioOpen(false);
        await onProfileRefresh();
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur lors de la mise à jour" });
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"><FileText className="text-white" /></div>
             <CardTitle>Bio & Expérience</CardTitle>
          </div>
          <Dialog open={editBioOpen} onOpenChange={setEditBioOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />{t("edit")}</Button></DialogTrigger>
            <DialogContent>
               <form onSubmit={handleUpdate} noValidate className="space-y-4">
                 <DialogHeader><DialogTitle>Modifier votre Bio</DialogTitle></DialogHeader>
                 <div className="space-y-2">
                    <Label>Biographie (min 50 caractères)</Label>
                    <textarea 
                       className="w-full p-3 border rounded-lg h-32 text-sm focus:ring-2 focus:ring-green-500"
                       value={bioForm.bio}
                       onChange={(e) => setBioForm({...bioForm, bio: e.target.value})}
                    />
                    <p className="text-[10px] text-right text-slate-400">{bioForm.bio.length} / 500</p>
                 </div>
                 <DialogFooter><Button type="submit">Sauvegarder</Button></DialogFooter>
               </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "{taskerProfile?.bio || "Aucune biographie ajoutée."}"
          </p>
      </CardContent>
    </Card>
  );
}