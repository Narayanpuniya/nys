import "server-only";
import crypto from "crypto";

// Payment abstraction: Razorpay keys मौजूद हों तो live, वरना MOCK mode।
// SECURITY: payment success कभी सिर्फ frontend पर भरोसा करके न मानें —
// verifyPayment() server-side signature verify करता है।

export function isMockMode(): boolean {
  return !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;
}

export type CreatedOrder = {
  orderId: string;
  amount: number; // rupees
  currency: string;
  mock: boolean;
};

export async function createOrder(amountRupees: number, receipt: string): Promise<CreatedOrder> {
  if (isMockMode()) {
    return {
      orderId: `mock_order_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountRupees,
      currency: "INR",
      mock: true,
    };
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountRupees * 100, // paise
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Razorpay order failed: ${res.status}`);
  }
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return { orderId: data.id, amount: data.amount / 100, currency: data.currency, mock: false };
}

// Razorpay signature verification (server-side)।
export function verifyPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (isMockMode()) {
    // Mock mode: signature "mock_sig_<orderId>" स्वीकार करें (dev testing)।
    return params.signature === `mock_sig_${params.orderId}`;
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
}

export function mockSignature(orderId: string): string {
  return `mock_sig_${orderId}`;
}
