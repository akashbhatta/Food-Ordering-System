"use client";

import * as React from "react";
import { MapPin, Plus, Check, Trash2, Home, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAddressAction, deleteAddressAction } from "@/server/actions/address";
import { toast } from "sonner";

export interface AddressData {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  addresses: AddressData[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onAddressAdded?: (address: AddressData) => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressAdded,
}: AddressSelectorProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [label, setLabel] = React.useState("Home");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("Kathmandu");
  const [state, setState] = React.useState("Bagmati");
  const [zipCode, setZipCode] = React.useState("44600");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-select default address if none selected
  React.useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      onSelectAddress(defaultAddr.id);
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await createAddressAction({
        label,
        street,
        city,
        state,
        zipCode,
        isDefault: addresses.length === 0,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to save address.");
        return;
      }

      toast.success("Delivery address saved!");
      if (res.data?.addressId) {
        onSelectAddress(res.data.addressId);
        onAddressAdded?.({
          id: res.data.addressId,
          label,
          street,
          city,
          state,
          zipCode,
          isDefault: addresses.length === 0,
        });
      }

      setIsAdding(false);
      setStreet("");
    } catch (err) {
      console.error(err);
      toast.error("Error creating address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelIcon = (lbl: string) => {
    const l = lbl.toLowerCase();
    if (l.includes("work") || l.includes("office")) return Briefcase;
    if (l.includes("apt") || l.includes("apartment") || l.includes("condo")) return Building2;
    return Home;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          1. Delivery Address
        </h3>

        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs h-8 gap-1.5 rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Address
          </Button>
        )}
      </div>

      {/* Address Form (inline if adding) */}
      {isAdding ? (
        <Card className="border-primary/40 bg-card p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground">Add New Delivery Location</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateAddress} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="addr-label" className="text-xs">Address Label</Label>
                <select
                  id="addr-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                >
                  <option value="Home">Home</option>
                  <option value="Work / Office">Work / Office</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="addr-street" className="text-xs">Street Address</Label>
                <Input
                  id="addr-street"
                  placeholder="e.g. Thamel Marg, near Garden of Dreams"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="addr-city" className="text-xs">City</Label>
                <Input
                  id="addr-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="addr-state" className="text-xs">Province</Label>
                <Input
                  id="addr-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="addr-zip" className="text-xs">Postal Code</Label>
                <Input
                  id="addr-zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full h-9 rounded-xl font-bold text-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Delivery Address"}
            </Button>
          </form>
        </Card>
      ) : addresses.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            No saved addresses found. Please add an address to continue.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="rounded-xl text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Delivery Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            const Icon = getLabelIcon(addr.label);

            return (
              <button
                key={addr.id}
                type="button"
                onClick={() => onSelectAddress(addr.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                    : "border-border/80 bg-card hover:bg-muted"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-foreground truncate">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{addr.street}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>

                {isSelected && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
