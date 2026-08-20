"use client";

import * as React from "react";
import { Banknote, CreditCard, ShieldCheck, Check, Sparkles } from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        2. Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cash on Delivery */}
        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.CASH_ON_DELIVERY)}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedMethod === PaymentMethod.CASH_ON_DELIVERY
              ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
              : "border-border/80 bg-card hover:bg-muted"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              selectedMethod === PaymentMethod.CASH_ON_DELIVERY
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Banknote className="h-5 w-5" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">Cash on Delivery</span>
              {selectedMethod === PaymentMethod.CASH_ON_DELIVERY && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pay with cash directly to your courier upon meal delivery.
            </p>
          </div>
        </button>

        {/* Mock Online Card */}
        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.CARD)}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedMethod === PaymentMethod.CARD
              ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
              : "border-border/80 bg-card hover:bg-muted"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              selectedMethod === PaymentMethod.CARD
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-foreground">Credit / Debit Card</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-emerald-500/10 text-emerald-600 border-none font-bold">
                  Instant
                </Badge>
              </div>
              {selectedMethod === PaymentMethod.CARD && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant mock card transaction (Auto-approved for testing).
            </p>
          </div>
        </button>
      </div>

      {selectedMethod === PaymentMethod.CARD && (
        <div className="p-3 rounded-xl border border-border/80 bg-muted/40 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Test Payment Sandbox: No real card required. Transaction will be simulated and confirmed instantly.</span>
        </div>
      )}
    </div>
  );
}
