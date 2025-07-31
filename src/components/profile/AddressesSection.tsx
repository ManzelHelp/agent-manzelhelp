"use client";

import React, { useState } from "react";
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
import { Plus, Trash2, MapPinIcon, AlertTriangle } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import type { Address } from "@/types/supabase";

interface AddressesSectionProps {
  addresses: Address[];
  loading: boolean;
  onAddressesUpdate: (addresses: Address[]) => void;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    icon: React.ReactNode;
    description: string;
    required: boolean;
  }>;
}

interface NewAddressForm {
  label: string;
  street_address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function AddressesSection({
  addresses,
  loading,
  onAddressesUpdate,
  missingFields,
}: AddressesSectionProps) {
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState<NewAddressForm>({
    label: "home",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  // Get missing fields for this section
  const addressesMissingFields = missingFields.filter(
    (field) => field.section === "addresses"
  );

  const addAddress = async () => {
    // Basic validation
    if (
      !newAddressForm.street_address.trim() ||
      !newAddressForm.city.trim() ||
      !newAddressForm.region.trim()
    ) {
      toast.error("Street address, city, and region are required");
      return;
    }

    // Validate country code format (2 characters)
    if (newAddressForm.country && newAddressForm.country.length !== 2) {
      toast.error("Country code must be exactly 2 characters");
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.from("addresses").insert([
        {
          label: newAddressForm.label,
          street_address: newAddressForm.street_address.trim(),
          city: newAddressForm.city.trim(),
          region: newAddressForm.region.trim(),
          postal_code: newAddressForm.postal_code?.trim() || null,
          country: newAddressForm.country,
          is_default: newAddressForm.is_default,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error adding address:", error);
        toast.error("Failed to add address");
        return;
      }

      toast.success("Address added successfully");
      setAddAddressOpen(false);
      // Reset form
      setNewAddressForm({
        label: "home",
        street_address: "",
        city: "",
        region: "",
        postal_code: "",
        country: "MA",
        is_default: false,
      });

      // Refresh addresses list
      const { data: updatedAddresses, error: fetchError } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (fetchError) {
        console.error("Error fetching addresses:", fetchError);
        return;
      }

      onAddressesUpdate(updatedAddresses || []);
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) {
        console.error("Error deleting address:", error);
        toast.error("Failed to delete address");
        return;
      }

      toast.success("Address deleted successfully");

      // Refresh addresses list
      const { data: updatedAddresses, error: fetchError } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (fetchError) {
        console.error("Error fetching addresses:", fetchError);
        return;
      }

      onAddressesUpdate(updatedAddresses || []);
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-color-text-primary">
              Service Locations
            </CardTitle>
            <CardDescription className="text-color-text-secondary">
              Manage your service locations
            </CardDescription>
          </div>
          {addressesMissingFields.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-color-error/20 border border-color-error/30">
              <AlertTriangle className="h-4 w-4 text-color-error" />
              <span className="text-sm font-medium text-color-error">
                {addressesMissingFields.length} missing
              </span>
            </div>
          )}
          <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Service Location</DialogTitle>
                <DialogDescription>
                  Add a new location where you provide services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address_label">Label</Label>
                    <select
                      id="address_label"
                      value={newAddressForm.label}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      value={newAddressForm.country}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-color-primary/20 focus:border-color-primary transition-all duration-200"
                    >
                      <option value="MA">Morocco</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_address">Street Address</Label>
                  <Input
                    id="street_address"
                    value={newAddressForm.street_address}
                    onChange={(e) =>
                      setNewAddressForm((prev) => ({
                        ...prev,
                        street_address: e.target.value,
                      }))
                    }
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddressForm.city}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={newAddressForm.region}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({
                          ...prev,
                          region: e.target.value,
                        }))
                      }
                      placeholder="Enter region"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={newAddressForm.postal_code}
                    onChange={(e) =>
                      setNewAddressForm((prev) => ({
                        ...prev,
                        postal_code: e.target.value,
                      }))
                    }
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddAddressOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addAddress} disabled={loading}>
                  {loading ? "Adding..." : "Add Location"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-color-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPinIcon className="h-8 w-8 text-color-text-secondary" />
            </div>
            <h3 className="font-semibold text-color-text-primary mb-2">
              No service locations
            </h3>
            <p className="text-color-text-secondary mb-6 max-w-md mx-auto">
              Add locations where you provide your services to help customers
              find you
            </p>
            <Button onClick={() => setAddAddressOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Location
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start justify-between p-4 rounded-lg border border-color-border/50 bg-color-surface/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-color-text-primary capitalize">
                      {address.label}
                    </span>
                    {address.is_default && (
                      <span className="text-xs bg-color-primary/10 text-color-primary px-2 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-color-text-secondary">
                      {address.street_address}
                    </p>
                    <p className="text-sm text-color-text-secondary">
                      {address.city}, {address.region} {address.postal_code}
                    </p>
                    <p className="text-sm text-color-text-secondary">
                      {address.country}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => address.id && deleteAddress(address.id)}
                  className="text-color-error hover:text-color-error hover:bg-color-error/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
