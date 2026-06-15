// src/services/emailService.js
//
// Usage:
//   import { sendOrderConfirmation, sendOrderCancellation } from "./emailService";
//   await sendOrderConfirmation({ ...order, to_email, to_name });
//
// Returns Promises. They throw on failure — wrap in try/catch at the call site
// and DO NOT block your checkout/cancel flow on email success.

import emailjs from "@emailjs/browser";

const cfg = (key, fallback) =>
  (typeof window !== "undefined" && window.__APP_CONFIG__ && window.__APP_CONFIG__[key]) ||
  import.meta.env[`VITE_${key}`] ||
  fallback;

const PUBLIC_KEY = cfg("EMAILJS_PUBLIC_KEY");
const SERVICE_ID = cfg("EMAILJS_SERVICE_ID");

const TEMPLATES = {
  confirmation: cfg("EMAILJS_TEMPLATE_CONFIRMATION"),
  cancellation: cfg("EMAILJS_TEMPLATE_CANCELLATION"),
};

export function initEmailService() {
  emailjs.init({ publicKey: PUBLIC_KEY });
}

// Converts [{ name, qty, price }, ...] into the multi-line text block
// that {{order_items}} expects (white-space: pre-line in the template).
function formatItems(items = []) {
  return items
    .map((item) => `${item.name}  x${item.qty}  —  ₹${item.price}`)
    .join("\n");
}

/**
 * Order confirmation -> customer
 * Matches 01-order-confirmation.html exactly.
 */
export async function sendOrderConfirmation(order) {
  const templateParams = {
    to_email: order.to_email,
    to_name: order.to_name,
    order_id: order.order_id,
    order_date: order.order_date,
    payment_method: order.payment_method,
    order_status: order.order_status,
    order_items: formatItems(order.items),
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    total_amount: order.total_amount,
    shipping_address: order.shipping_address,
    support_email: "beyondbound889@gmail.com",
    support_phone: "+91 98765 43210",
  };

  return emailjs.send(SERVICE_ID, TEMPLATES.confirmation, templateParams);
}

/**
 * Order cancellation -> customer
 * Field names below are my best match based on the confirmation template's
 * style. Once you share 02-order-cancellation.html (or its variable list),
 * I'll adjust these to match exactly — but this will work as-is if you keep
 * the variable names consistent in both files.
 */
export async function sendOrderCancellation(order) {
  const templateParams = {
    to_email: order.to_email,
    to_name: order.to_name,
    order_id: order.order_id,
    order_date: order.order_date,
    order_items: formatItems(order.items),
    order_status: order.order_status || "Cancelled",
    cancellation_reason: order.cancellation_reason || "Cancelled by customer",
    refund_amount: order.refund_amount,
    refund_timeline: order.refund_timeline || "5-7 business days",
    total_amount: order.total_amount,
    support_email: "beyondbound889@gmail.com",
    support_phone: "+91 98765 43210",
  };

  return emailjs.send(SERVICE_ID, TEMPLATES.cancellation, templateParams);
}