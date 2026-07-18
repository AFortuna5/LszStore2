-- Store monetary values exactly to two decimal places.
ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);
ALTER TABLE "Product" ALTER COLUMN "promoPrice" TYPE DECIMAL(12,2) USING ROUND("promoPrice"::numeric, 2);
ALTER TABLE "ProductVariant" ALTER COLUMN "priceOverride" TYPE DECIMAL(12,2) USING ROUND("priceOverride"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "subtotal" TYPE DECIMAL(12,2) USING ROUND("subtotal"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "shippingCost" TYPE DECIMAL(12,2) USING ROUND("shippingCost"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);
ALTER TABLE "OrderItem" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);

-- A browser checkout attempt can create at most one order.
ALTER TABLE "Order" ADD COLUMN "checkoutKey" TEXT;
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");

-- Shared rate-limit state for all serverless instances.
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
