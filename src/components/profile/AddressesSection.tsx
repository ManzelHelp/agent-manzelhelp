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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Plus, Trash2, MapPinIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { addressSchema } from "@/lib/schemas/profile";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/supabase";
import {
  addAddress,
  deleteAddress,
  checkAddressUsage,
} from "@/actions/profile";

interface AddressesSectionProps {
  addresses: Address[];
  loading: boolean;
  onAddressesUpdate: (addresses: Address[]) => void;
  onProfileRefresh: () => Promise<void>;
  missingFields: any[];
  userId?: string;
}

export default function AddressesSection({
  addresses,
  loading,
  onProfileRefresh,
  missingFields,
  userId,
}: AddressesSectionProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { toast } = useToast(); // HOOK TOAST
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "home",
      street_address: "",
      city: "",
      region: "",
      postal_code: "",
      country: "MA",
      is_default: false,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!addAddressOpen) {
      form.reset({
        label: "home",
        street_address: "",
        city: "",
        region: "",
        postal_code: "",
        country: "MA",
        is_default: false,
      });
      form.clearErrors();
    }
  }, [addAddressOpen, form]);

  const addressesMissingFields = missingFields.filter(
    (field) => field.section === "addresses"
  );

  const handleAddAddress = async (data: {
    label: string;
    street_address: string;
    city: string;
    region: string;
    postal_code?: string;
    country: string;
    is_default: boolean;
  }) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Erreur", description: "Utilisateur non trouvé." });
      return;
    }

    try {
      const result = await addAddress(userId, data);

      if (result.success && result.address) {
        toast({
          variant: "success",
          title: "Adresse ajoutée",
          description: "Votre nouvelle adresse a été enregistrée.",
        });
        setAddAddressOpen(false);
        await onProfileRefresh();
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.error || "Échec de l'ajout." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Une erreur est survenue." });
    }
  };

  const handleDeleteClick = async (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (!address) return;

    try {
      const usageCheck = await checkAddressUsage(addressId);
      if (usageCheck.success && usageCheck.isUsed) {
        toast({
          variant: "destructive",
          title: "Impossible de supprimer",
          description: "Cette adresse est utilisée dans des annonces actives.",
        });
        return;
      }
      setAddressToDelete(address);
      setDeleteConfirmOpen(true);
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur de vérification." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      const result = await deleteAddress(addressToDelete.id);
      if (result.success) {
        toast({ variant: "success", title: "Supprimé", description: "L'adresse a été retirée." });
        await onProfileRefresh();
      } else {
        toast({ variant: "destructive", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Échec de la suppression." });
    } finally {
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/20">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--color-text-primary)]">
                {t("serviceLocations")}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                {t("manageYourLocations")}
              </CardDescription>
            </div>
          </div>
          <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addLocation")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[var(--color-surface)] dark:bg-slate-900 border-[var(--color-border)] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <form onSubmit={form.handleSubmit(handleAddAddress)} noValidate className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-[var(--color-text-primary)]">{t("addServiceLocation")}</DialogTitle>
                  <DialogDescription className="text-[var(--color-text-secondary)]">{t("addServiceLocationDescription", { default: "Ajoutez un nouvel emplacement de service" })}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-[var(--color-text-primary)]">{tCommon("label")}</Label>
                    <select
                      id="label"
                      {...form.register("label")}
                      className={cn(
                        "flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20",
                        form.formState.errors.label
                          ? "!border-red-500 !border-2 focus:ring-red-500/50"
                          : ""
                      )}
                    >
                      <option value="home">Domicile</option>
                      <option value="work">Travail</option>
                      <option value="other">Autre</option>
                    </select>
                    {form.formState.errors.label && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.label.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[var(--color-text-primary)]">{t("sections.addresses.city")}</Label>
                    <Input 
                      id="city"
                      {...form.register("city")}
                      className={cn(
                        "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]",
                        form.formState.errors.city
                          ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                          : ""
                      )}
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-[var(--color-text-primary)]">{t("sections.addresses.region")}</Label>
                  <Input 
                    id="region"
                    {...form.register("region")}
                    placeholder="Ex: Casablanca-Settat"
                    className={cn(
                      "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]",
                      form.formState.errors.region
                        ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                        : ""
                    )}
                  />
                  {form.formState.errors.region && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {form.formState.errors.region.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street_address" className="text-[var(--color-text-primary)]">{t("sections.addresses.streetAddress")}</Label>
                  <Input 
                    id="street_address"
                    {...form.register("street_address")}
                    className={cn(
                      "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]",
                      form.formState.errors.street_address
                        ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                        : ""
                    )}
                  />
                  {form.formState.errors.street_address && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {form.formState.errors.street_address.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-[var(--color-text-primary)]">{t("sections.addresses.postalCode")}</Label>
                    <Input 
                      id="postal_code"
                      {...form.register("postal_code")}
                      className={cn(
                        "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]",
                        form.formState.errors.postal_code
                          ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                          : ""
                      )}
                    />
                    {form.formState.errors.postal_code && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.postal_code.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[var(--color-text-primary)]">{t("sections.addresses.country")}</Label>
                    <Input 
                      id="country"
                      {...form.register("country")}
                      className={cn(
                        "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]",
                        form.formState.errors.country
                          ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                          : ""
                      )}
                    />
                    {form.formState.errors.country && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddAddressOpen(false)}>
                    {tCommon("cancel")}
                  </Button>
                  <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                    {loading || form.formState.isSubmitting ? tCommon("adding") : t("addLocation")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* L'affichage de tes cartes d'adresses reste strictement identique à l'original */}
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic">Aucune adresse.</div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="border-0 shadow-md bg-white/50 dark:bg-slate-800/30">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold capitalize">{address.label}</p>
                    <p className="text-sm text-slate-500">{address.street_address}, {address.city}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => address.id && handleDeleteClick(address.id)}
                    className="text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("actions.delete", { default: "Supprimer" })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        title={t("deleteAddress", { default: "Supprimer l'adresse" })}
        description={addressToDelete ? t("deleteAddressConfirmation", { 
          default: `Êtes-vous sûr de vouloir supprimer l'adresse "${addressToDelete.label}" ? Cette action est irréversible.` 
        }) : ""}
        confirmText={t("actions.delete", { default: "Supprimer" })}
        cancelText={tCommon("cancel")}
      />
    </Card>
  );
}