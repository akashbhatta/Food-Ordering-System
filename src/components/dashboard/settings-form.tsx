"use client";

import * as React from "react";
import { updateRestaurantSettingsAction } from "@/server/actions/restaurant";
import { DAYS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Store,
  Clock,
  Bike,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettingsFormProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryFee: number | string;
    minOrderAmount: number | string;
    avgDeliveryMin: number;
    image: string | null;
    coverImage: string | null;
    isActive: boolean;
    operatingHours: {
      id?: string;
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }[];
  };
}

export function SettingsForm({ restaurant }: SettingsFormProps) {
  const [name, setName] = React.useState(restaurant.name);
  const [description, setDescription] = React.useState(restaurant.description);
  const [phone, setPhone] = React.useState(restaurant.phone);
  const [email, setEmail] = React.useState(restaurant.email);
  const [street, setStreet] = React.useState(restaurant.street);
  const [city, setCity] = React.useState(restaurant.city);
  const [state, setState] = React.useState(restaurant.state);
  const [zipCode, setZipCode] = React.useState(restaurant.zipCode);

  const [deliveryFee, setDeliveryFee] = React.useState(
    String(restaurant.deliveryFee ?? 0)
  );
  const [minOrderAmount, setMinOrderAmount] = React.useState(
    String(restaurant.minOrderAmount ?? 0)
  );
  const [avgDeliveryMin, setAvgDeliveryMin] = React.useState(
    String(restaurant.avgDeliveryMin || 30)
  );

  const [image, setImage] = React.useState(restaurant.image || "");
  const [coverImage, setCoverImage] = React.useState(restaurant.coverImage || "");
  const [isActive, setIsActive] = React.useState(restaurant.isActive);

  // Initialize 7 days of operating hours
  const [hours, setHours] = React.useState(() => {
    const defaultHours = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: "11:00",
      closeTime: "22:00",
      isClosed: false,
    }));

    if (restaurant.operatingHours && restaurant.operatingHours.length > 0) {
      restaurant.operatingHours.forEach((h) => {
        defaultHours[h.dayOfWeek] = {
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        };
      });
    }

    return defaultHours;
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateDayHour = (
    dayIndex: number,
    field: "openTime" | "closeTime" | "isClosed",
    val: any
  ) => {
    setHours((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateRestaurantSettingsAction({
        name,
        description,
        phone,
        email,
        street,
        city,
        state,
        zipCode,
        deliveryFee: parseFloat(deliveryFee) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        avgDeliveryMin: parseInt(avgDeliveryMin, 10) || 30,
        image: image || undefined,
        coverImage: coverImage || undefined,
        isActive,
        operatingHours: hours,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to update settings.");
        return;
      }

      toast.success("Restaurant settings updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving restaurant settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* ─── 1. RESTAURANT BASIC INFO ──────────────────────── */}
      <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">General Information</h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-active-toggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <Label htmlFor="is-active-toggle" className="text-xs font-bold cursor-pointer">
              {isActive ? "Accepting Customer Orders" : "Store Paused"}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-name" className="text-xs font-bold">Restaurant Name</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-phone" className="text-xs font-bold">Business Phone</Label>
            <Input
              id="r-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="r-desc" className="text-xs font-bold">Store Description</Label>
          <textarea
            id="r-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="r-street" className="text-xs font-bold">Street Address</Label>
            <Input
              id="r-street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-city" className="text-xs font-bold">City</Label>
            <Input
              id="r-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-state" className="text-xs font-bold">State / Zip</Label>
            <div className="flex gap-2">
              <Input
                id="r-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-9 text-xs rounded-xl w-16"
                required
              />
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="h-9 text-xs rounded-xl flex-1"
                required
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── 2. DELIVERY & PRICING CONFIGURATION ─────────── */}
      <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Bike className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Delivery & Order Thresholds</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-del-fee" className="text-xs font-bold">
              Delivery Fee ($ USD)
            </Label>
            <Input
              id="r-del-fee"
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-min-order" className="text-xs font-bold">
              Minimum Order Amount ($ USD)
            </Label>
            <Input
              id="r-min-order"
              type="number"
              step="0.01"
              min="0"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-speed" className="text-xs font-bold">
              Avg. Delivery Speed (Minutes)
            </Label>
            <Input
              id="r-speed"
              type="number"
              min="5"
              value={avgDeliveryMin}
              onChange={(e) => setAvgDeliveryMin(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>
        </div>
      </Card>

      {/* ─── 3. STORE BRANDING & MEDIA ────────────────────── */}
      <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Branding & Store Images</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-avatar" className="text-xs font-bold">Logo / Avatar URL</Label>
            <Input
              id="r-avatar"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-cover" className="text-xs font-bold">Hero Cover Banner URL</Label>
            <Input
              id="r-cover"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="h-10 rounded-xl text-xs"
            />
          </div>
        </div>
      </Card>

      {/* ─── 4. 7-DAY OPERATING HOURS SCHEDULE ────────────── */}
      <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Weekly Operating Hours</h3>
        </div>

        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border text-xs gap-3 transition-all ${
                h.isClosed
                  ? "border-border/40 bg-muted/30 text-muted-foreground"
                  : "border-border/80 bg-card text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 w-32">
                <span className="font-bold">{DAYS[h.dayOfWeek]}</span>
              </div>

              {h.isClosed ? (
                <span className="text-xs font-semibold text-muted-foreground italic">
                  Kitchen Closed for Orders
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => updateDayHour(idx, "openTime", e.target.value)}
                    className="h-8 text-xs w-28 rounded-lg"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => updateDayHour(idx, "closeTime", e.target.value)}
                    className="h-8 text-xs w-28 rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`closed-${idx}`}
                  checked={h.isClosed}
                  onChange={(e) => updateDayHour(idx, "isClosed", e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <Label htmlFor={`closed-${idx}`} className="text-xs cursor-pointer">
                  Closed
                </Label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="h-12 px-8 rounded-xl text-base font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Restaurant Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
