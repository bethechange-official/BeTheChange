-- Track the admin WhatsApp notification sent for each new order.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "whatsappStatus" VARCHAR(20);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "whatsappError" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "whatsappSentAt" TIMESTAMP(3);
