import * as React from "react";
import { OrderStatus } from "@prisma/client";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  Home,
  XCircle,
  MapPin,
  Navigation,
} from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryAddress?: string;
}

const STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    icon: Clock,
    description: "Your order has been received and is waiting for confirmation.",
    location: "Awaiting restaurant",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: CheckCircle2,
    description: "The restaurant has accepted your order!",
    location: "Restaurant kitchen",
  },
  {
    key: "PREPARING",
    label: "In Kitchen",
    icon: ChefHat,
    description: "Your food is being freshly prepared by the kitchen team.",
    location: "Being cooked now",
  },
  {
    key: "READY",
    label: "Ready",
    icon: PackageCheck,
    description: "Your order is packed and ready for pickup by the delivery rider.",
    location: "Pickup counter",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: Bike,
    description: "A rider has picked up your order and is on the way!",
    location: "En route to you",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: Home,
    description: "Your order has been delivered. Enjoy your meal!",
    location: "At your doorstep",
  },
];

export function OrderTimeline({ status, restaurantName, restaurantAddress, deliveryAddress }: OrderTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/10 flex items-center gap-3 text-destructive">
        <XCircle className="h-6 w-6 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs opacity-90">
            This order has been cancelled and will not be prepared or delivered.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="w-full space-y-6">
      {/* Current Status Hero Card */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md animate-pulse">
            {currentStep && <currentStep.icon className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">{currentStep?.label}</h4>
            <p className="text-xs text-muted-foreground">{currentStep?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Navigation className="h-3.5 w-3.5" />
          <span>{currentStep?.location}</span>
        </div>
      </div>

      {/* Route Info: Restaurant → Customer (shown for active deliveries) */}
      {(restaurantAddress || deliveryAddress) && status !== "DELIVERED" && (
        <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 space-y-3">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider">Delivery Route</div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Origin */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Pickup From</div>
                <div className="text-xs font-bold text-foreground truncate">{restaurantName || "Restaurant"}</div>
                {restaurantAddress && (
                  <div className="text-[11px] text-muted-foreground truncate">{restaurantAddress}</div>
                )}
              </div>
            </div>

            {/* Arrow / Dotted Line */}
            <div className="hidden sm:flex items-center gap-1 text-muted-foreground px-2">
              <div className="w-8 h-px border-t-2 border-dashed border-muted-foreground/40" />
              <Bike className="h-4 w-4 text-primary animate-pulse" />
              <div className="w-8 h-px border-t-2 border-dashed border-muted-foreground/40" />
            </div>

            {/* Destination */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary mt-0.5">
                <Home className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Deliver To</div>
                <div className="text-xs font-bold text-foreground truncate">{deliveryAddress || "Your location"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Stepper */}
      <div className="py-4">
        <div className="relative flex items-center justify-between">
          {/* Background connector line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-muted rounded-full -z-0" />

          {/* Active colored line */}
          <div
            className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-primary rounded-full -z-0 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isPassed = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center text-center space-y-1.5 select-none"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isPassed
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isCurrent
                      ? "border-primary bg-background text-primary ring-4 ring-primary/20 animate-pulse shadow-md"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={`hidden md:inline-block text-[11px] font-semibold whitespace-nowrap ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isPassed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
