import { PaymentMethod } from "@prisma/client";

export interface ProcessPaymentInput {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  orderNumber: string;
  customerEmail: string;
  cardDetails?: {
    cardNumber?: string;
    expDate?: string;
    cvv?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: "COMPLETED" | "PENDING_CASH" | "FAILED";
  message: string;
}

/**
 * Payment Provider Abstraction
 * Allows seamless swapping of mock processor with real Stripe/PayPal gateways later.
 */
export async function processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
  const { paymentMethod, amount, orderNumber } = input;

  if (paymentMethod === "CASH_ON_DELIVERY") {
    return {
      success: true,
      transactionId: `COD-${orderNumber}`,
      status: "PENDING_CASH",
      message: "Cash on delivery confirmed. Please pay upon arrival.",
    };
  }

  if (paymentMethod === "CARD") {
    // Simulated mock card gateway processing
    // In production, this would call stripe.paymentIntents.create()
    const mockTransactionId = `TXN_MOCK_${Date.now()}_${Math.random().toString(36).slice(-6).toUpperCase()}`;

    return {
      success: true,
      transactionId: mockTransactionId,
      status: "COMPLETED",
      message: `Online card payment of $${amount.toFixed(2)} approved.`,
    };
  }

  return {
    success: false,
    transactionId: "",
    status: "FAILED",
    message: "Unsupported payment method.",
  };
}
