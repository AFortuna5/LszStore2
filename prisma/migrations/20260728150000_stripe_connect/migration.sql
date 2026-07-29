-- Additive Stripe Connect / multi-store foundation. Existing catalog and orders
-- are assigned to a legacy store so no operational data is discarded.
CREATE TABLE "Store" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "ownerId" TEXT,
  "stripeAccountId" TEXT,
  "stripeOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
  "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "stripeAccountStatus" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
  "stripeRequirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "commissionPercentage" DECIMAL(5,2),
  "stripeConnectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Store_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE UNIQUE INDEX "Store_stripeAccountId_key" ON "Store"("stripeAccountId");
CREATE INDEX "Store_ownerId_idx" ON "Store"("ownerId");
CREATE INDEX "Store_stripeAccountStatus_idx" ON "Store"("stripeAccountStatus");

INSERT INTO "Store" ("id", "name", "slug", "ownerId")
SELECT 'legacy_store', COALESCE(NULLIF(current_setting('app.store_name', true), ''), 'LSZ Store'), 'lsz-store',
       (SELECT "id" FROM "User" WHERE "role" = 'ADMIN' ORDER BY "createdAt" LIMIT 1);

CREATE TABLE "StoreMember" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StoreMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StoreMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StoreMember_storeId_userId_key" ON "StoreMember"("storeId", "userId");
CREATE INDEX "StoreMember_userId_idx" ON "StoreMember"("userId");

ALTER TABLE "Product" ADD COLUMN "storeId" TEXT;
UPDATE "Product" SET "storeId" = 'legacy_store';
ALTER TABLE "Product" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

ALTER TABLE "Order"
  ADD COLUMN "storeId" TEXT,
  ADD COLUMN "stripeCheckoutSessionId" TEXT,
  ADD COLUMN "stripePaymentIntentId" TEXT,
  ADD COLUMN "stripeChargeId" TEXT,
  ADD COLUMN "stripeConnectedAccountId" TEXT,
  ADD COLUMN "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'brl',
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "refundedAt" TIMESTAMP(3),
  ADD COLUMN "disputedAt" TIMESTAMP(3);
UPDATE "Order" SET "storeId" = 'legacy_store', "stripeCheckoutSessionId" = "paymentSessionId", "stripePaymentIntentId" = "paymentId";
ALTER TABLE "Order" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
CREATE INDEX "Order_storeId_createdAt_idx" ON "Order"("storeId", "createdAt");
CREATE INDEX "Order_stripePaymentIntentId_idx" ON "Order"("stripePaymentIntentId");
CREATE INDEX "Order_stripeConnectedAccountId_idx" ON "Order"("stripeConnectedAccountId");

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "connectedAccountId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "errorMessage" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");
CREATE INDEX "StripeWebhookEvent_connectedAccountId_createdAt_idx" ON "StripeWebhookEvent"("connectedAccountId", "createdAt");
CREATE INDEX "StripeWebhookEvent_status_createdAt_idx" ON "StripeWebhookEvent"("status", "createdAt");
