-- Reuse the provider-neutral session identifier for Stripe Checkout Sessions.
ALTER TABLE "Order" RENAME COLUMN "paymentPreferenceId" TO "paymentSessionId";
CREATE UNIQUE INDEX "Order_paymentSessionId_key" ON "Order"("paymentSessionId");
