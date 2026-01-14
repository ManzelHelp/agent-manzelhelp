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
import { Plus, Trash2, MapPinIcon } from "lucide-react";
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
  const { toast } = useToast();
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

  const handleAddAddress = async (data: any) => {
    if (!userId) {
      toast({ variant: "destructive", title: tCommon("error"), description: t("errors.userNotFound") });
      return;
    }

    try {
      const result = await addAddress(userId, data);
      if (result.success) {
        toast({
          variant: "success",
          title: t("toasts.addressAdded"),
          description: t("toasts.addressSavedSuccess"),
        });
        setAddAddressOpen(false);
        await onProfileRefresh();
      } else {
        toast({ variant: "destructive", title: tCommon("error"), description: result.error || t("errors.failedToAdd") });
      }
    } catch (error) {
      toast({ variant: "destructive", title: tCommon("error"), description: tCommon("unknown") });
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
          title: t("errors.cannotDelete"),
          description: t("errors.addressInUse"),
        });
        return;
      }
      setAddressToDelete(address);
      setDeleteConfirmOpen(true);
    } catch (error) {
      toast({ variant: "destructive", description: tCommon("error") });
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      const result = await deleteAddress(addressToDelete.id);
      if (result.success) {
        toast({ variant: "success", title: tCommon("complete"), description: t("toasts.addressDeleted") });
        await onProfileRefresh();
      } else {
        toast({ variant: "destructive", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", description: tCommon("unknown") });
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
            <DialogContent className="sm:max-w-md bg-[var(--color-surface)] dark:bg-slate-900 border-[var(--color-border)]">
              <form onSubmit={form.handleSubmit(handleAddAddress)} noValidate className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{t("addServiceLocation")}</DialogTitle>
                  <DialogDescription>{t("addServiceLocationDescription")}</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="label">{tCommon("label")}</Label>
                    <select
                      id="label"
                      {...form.register("label")}
                      className={cn("flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm")}
                    >
                      <option value="home">{tCommon("home")}</option>
                      <option value="work">{tCommon("work")}</option>
                      <option value="other">{tCommon("other")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{tCommon("city")}</Label>
                    <Input id="city" {...form.register("city")} placeholder={tCommon("enterCity")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">{tCommon("region")}</Label>
                  <Input id="region" {...form.register("region")} placeholder={tCommon("enterRegion")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_address">{tCommon("streetAddress")}</Label>
                  <Input id="street_address" {...form.register("street_address")} placeholder={tCommon("enterStreetAddress")} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">{tCommon("postalCode")}</Label>
                    <Input id="postal_code" {...form.register("postal_code")} placeholder={tCommon("enterPostalCode")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{tCommon("country")}</Label>
                    <Input id="country" {...form.register("country")} />
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
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic">{t("noAddresses")}</div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="border-0 shadow-md bg-white/50 dark:bg-slate-800/30">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold capitalize">
                      {["home", "work", "other"].includes(address.label?.toLowerCase?.() ?? "")
                        ? tCommon(address.label?.toLowerCase?.() as any)
                        : address.label || ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      {address.street_address || ""}{address.street_address && address.city ? ", " : ""}{address.city || ""}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => address.id && handleDeleteClick(address.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tCommon("delete")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        title={t("deleteAddress")}
        description={t("deleteAddressConfirmation", { label: addressToDelete?.label ?? "" })}
        confirmText={tCommon("delete")}
        cancelText={tCommon("cancel")}
      />
    </Card>
  );
}