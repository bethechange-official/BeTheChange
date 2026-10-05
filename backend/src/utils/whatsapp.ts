import { prisma } from "../config/db";
import { env } from "../config/env";

/**
 * Sends the admin a WhatsApp message with the full details of a new order, via Meta's
 * WhatsApp Business Cloud API, and records the outcome on the order (shown in the admin panel).
 *
 * Never throws: a WhatsApp problem must not affect the order itself.
 */

const rupees = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

type OrderForMessage = Awaited<ReturnType<typeof loadOrder>>;

const loadOrder = (orderId: string) =>
  prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });

const orderFacts = (o: NonNullable<OrderForMessage>) => {
  const subtotal = Number(o.subtotal);
  const discount = Number(o.discountAmount);
  const shipping = Number(o.shippingFee);
  return {
    number: o.orderNumber,
    placedAt: o.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }),
    customer: o.customerName,
    contact: `${o.customerPhone} · ${o.customerEmail}`,
    address: [o.addressLine1, o.addressLine2, `${o.city}, ${o.state} ${o.pincode}`].filter(Boolean).join(", "),
    items: o.items.map((i) => `${i.quantity} × ${i.productName} (${rupees(Number(i.price) * i.quantity)})`),
    charges: [
      `Subtotal ${rupees(subtotal)}`,
      discount > 0 ? `Coupon${o.couponCode ? ` ${o.couponCode}` : ""} −${rupees(discount)}` : null,
      `Shipping ${shipping > 0 ? rupees(shipping) : "Free"}`,
    ].filter(Boolean).join(" · "),
    total: rupees(Number(o.totalAmount)),
    payment: o.paymentMethod === "COD" ? "Cash on Delivery" : o.paymentMethod,
  };
};

/** Free-form message ("text" mode): full multi-line details. */
export const buildOrderText = (o: NonNullable<OrderForMessage>) => {
  const f = orderFacts(o);
  return [
    `🛍️ *New order ${f.number}*`,
    f.placedAt,
    "",
    `*Customer:* ${f.customer}`,
    `*Contact:* ${f.contact}`,
    `*Deliver to:* ${f.address}`,
    "",
    "*Items:*",
    ...f.items.map((line) => `• ${line}`),
    "",
    f.charges,
    `*Total: ${f.total}* (${f.payment})`,
  ].join("\n");
};

// Meta rejects template parameters containing newlines/tabs or 4+ consecutive spaces, and caps their length.
const templateParam = (s: string, max = 900) => {
  const clean = s.replace(/[\r\n\t]+/g, " ").replace(/ {4,}/g, "   ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

/**
 * Body parameters for the approved template, in order. The template registered in WhatsApp Manager
 * must use exactly these 8 placeholders — see backend/WHATSAPP.md.
 */
export const buildTemplateParams = (o: NonNullable<OrderForMessage>) => {
  const f = orderFacts(o);
  return [f.number, f.customer, f.contact, f.address, f.items.join("; "), f.charges, f.total, f.payment].map((v) => templateParam(v));
};

const sendToWhatsApp = async (o: NonNullable<OrderForMessage>) => {
  const message = env.WHATSAPP_MESSAGE_MODE === "text"
    ? { type: "text", text: { body: buildOrderText(o), preview_url: false } }
    : {
        type: "template",
        template: {
          name: env.WHATSAPP_ORDER_TEMPLATE,
          language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE },
          components: [{ type: "body", parameters: buildTemplateParams(o).map((text) => ({ type: "text", text })) }],
        },
      };

  const response = await fetch(`${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: env.ADMIN_WHATSAPP_NUMBER, ...message }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string; code?: number } } | null;
    throw new Error(`WhatsApp API ${response.status}: ${body?.error?.message ?? response.statusText}${body?.error?.code ? ` (code ${body.error.code})` : ""}`);
  }
};

export type WhatsappResult = { status: "SENT" | "FAILED" | "NOT_CONFIGURED"; error: string | null };

export const isWhatsappConfigured = () => Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);

export const notifyAdminOfOrder = async (orderId: string): Promise<WhatsappResult> => {
  let result: WhatsappResult;
  try {
    if (!isWhatsappConfigured()) {
      result = { status: "NOT_CONFIGURED", error: "WhatsApp is not set up: add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to the backend .env" };
    } else {
      await sendToWhatsApp(await loadOrder(orderId));
      result = { status: "SENT", error: null };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`WhatsApp notification failed for order ${orderId}:`, message);
    result = { status: "FAILED", error: message.slice(0, 1000) };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { whatsappStatus: result.status, whatsappError: result.error, whatsappSentAt: result.status === "SENT" ? new Date() : undefined },
  }).catch((error) => console.error(`Could not record WhatsApp status for order ${orderId}:`, error));

  return result;
};
