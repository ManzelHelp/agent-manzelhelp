"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Edit,
  Camera,
  Mail,
  BadgeCheck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // CHANGEMENT
import { personalInfoSchema } from "@/lib/schemas/profile"; // CHANGEMENT
import Image from "next/image";
import type { User as UserType, TaskerProfile } from "@/types/supabase";
import {
  updateUserPersonalInfo,
  updateUserAvatar,
  uploadProfileImage,
  uploadVerificationDocument,
  updateVerificationDocument,
  fixAvatarUrlAction,
} from "@/actions/profile";
import { formatDateShort } from "@/lib/date-utils";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PersonalInfoSectionProps {
  user: UserType | null;
  taskerProfile?: TaskerProfile | null;
  loading: boolean;
  onUserUpdate: (updatedUser: UserType) => void;
  onProfileRefresh: () => Promise<void>;
  missingFields: any[];
}

const IMAGE_CONSTRAINTS = {
  maxFileSize: 2 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

export default function PersonalInfoSection({
  user,
  taskerProfile,
  loading,
  onUserUpdate,
  onProfileRefresh,
  missingFields,
}: PersonalInfoSectionProps) {
  const t = useTranslations("profile");
  const { toast } = useToast();
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      date_of_birth: user?.date_of_birth ? user.date_of_birth.split("T")[0] : "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      });
    }
  }, [user, form]);

  // Reset form when dialog opens/closes - only reset if dialog is closed
  useEffect(() => {
    if (!editPersonalOpen && user) {
      // Ne pas réinitialiser avec les valeurs de l'utilisateur si le formulaire a été modifié
      // On réinitialise seulement quand le dialog se ferme après une sauvegarde réussie
      form.clearErrors();
    }
  }, [editPersonalOpen, form]);
  
  // Reset form when dialog opens with current user values
  useEffect(() => {
    if (editPersonalOpen && user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      });
      form.clearErrors();
    }
  }, [editPersonalOpen, user, form]);

  // --- LOGIQUE MISE À JOUR (ZOD + TOAST) ---
  const handleUpdatePersonalInfo = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth: string;
  }) => {
    if (!user?.id) return;

    try {
      const result = await updateUserPersonalInfo(user.id, {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone.trim() || undefined,
        date_of_birth: data.date_of_birth && data.date_of_birth.trim() ? data.date_of_birth : undefined,
      });

      if (result.success && result.user) {
        onUserUpdate(result.user);
        await onProfileRefresh();
        // Réinitialiser le formulaire avec les nouvelles valeurs après succès
        form.reset({
          first_name: result.user.first_name || "",
          last_name: result.user.last_name || "",
          phone: result.user.phone || "",
          date_of_birth: result.user.date_of_birth ? result.user.date_of_birth.split("T")[0] : "",
        });
        toast({ variant: "success", title: "Succès", description: "Profil mis à jour" });
        setEditPersonalOpen(false);
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.error || "Échec de la mise à jour" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur serveur" });
    }
  };

  // --- LOGIQUE PHOTO ---
  const handlePhotoUpload = async (file: File) => {
    if (!user?.id) return;
    if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      toast({ variant: "destructive", description: "Format invalide" });
      return;
    }
    setUploadingPhoto(true);
    try {
      const uploadResult = await uploadProfileImage(user.id, file);
      if (!uploadResult.success) throw new Error(uploadResult.error);
      const result = await updateUserAvatar(user.id, uploadResult.url!);
      if (result.success) {
        onUserUpdate(result.user!);
        await onProfileRefresh();
        toast({ variant: "success", title: "Photo mise à jour" });
      }
    } catch (e: any) {
      toast({ variant: "destructive", description: e.message });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const personalMissingFields = missingFields.filter((f) => f.section === "personal");

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                {t("personalInformation")}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                {t("yourBasicProfileInformation")}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {personalMissingFields.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-error)]/20 border border-[var(--color-error)]/30">
                <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
                <span className="text-sm font-medium text-[var(--color-error)]">
                  {t("missing", { count: personalMissingFields.length })}
                </span>
              </div>
            )}
            <Dialog open={editPersonalOpen} onOpenChange={setEditPersonalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <form onSubmit={form.handleSubmit(handleUpdatePersonalInfo)} noValidate className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{t("editPersonalInformation")}</DialogTitle>
                    <DialogDescription>{t("updatePersonalInformation")}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">{t("sections.personal.firstName")}</Label>
                      <Input 
                        id="first_name"
                        {...form.register("first_name")}
                        className={cn(
                          form.formState.errors.first_name
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {form.formState.errors.first_name && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {form.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">{t("sections.personal.lastName")}</Label>
                      <Input 
                        id="last_name"
                        {...form.register("last_name")}
                        className={cn(
                          form.formState.errors.last_name
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {form.formState.errors.last_name && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {form.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">{t("sections.personal.email")}</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={user?.email || ""} 
                        disabled
                        className="bg-[var(--color-accent)]/30 cursor-not-allowed"
                      />
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {t("sections.personal.emailReadOnly", { default: "L'email ne peut pas être modifié ici" })}
                      </p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">{t("sections.personal.phoneNumber")}</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        {...form.register("phone")}
                        placeholder={t("sections.personal.phonePlaceholder", { default: "+212 6XX XXX XXX" })}
                        className={cn(
                          form.formState.errors.phone
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="date_of_birth">{t("sections.personal.dateOfBirth")}</Label>
                      <Input 
                        id="date_of_birth"
                        type="date"
                        {...form.register("date_of_birth")}
                        className={cn(
                          form.formState.errors.date_of_birth
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {form.formState.errors.date_of_birth && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {form.formState.errors.date_of_birth.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                      {loading || form.formState.isSubmitting ? t("actions.saving", { default: "Enregistrement..." }) : t("actions.save", { default: "Sauvegarder" })}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* L'AFFICHAGE ORIGINAL QUE TU VOULAIS GARDER */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {user?.avatar_url ? (
                <Image src={user.avatar_url} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" unoptimized />
              ) : (
                <User className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 text-white cursor-pointer flex items-center justify-center shadow-lg">
              {uploadingPhoto ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {t("sections.personal.email")}
            </Label>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.email || "Non renseigné"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {t("sections.personal.phoneNumber")}
            </Label>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.phone || "Non renseigné"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {t("sections.personal.dateOfBirth")}
            </Label>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {user?.date_of_birth ? formatDateShort(user.date_of_birth) : "Non renseignée"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {t("role", { default: "Rôle" })}
            </Label>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {user?.role === "tasker" ? "Tasker" : user?.role === "customer" ? "Client" : "Non défini"}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Statut de vérification</h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-600">Email vérifié</p>
            </div>
            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Actif</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}