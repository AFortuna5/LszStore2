import "server-only";

import { Prisma } from "@prisma/client";

import type { SessionUser } from "@/server/auth/session";
import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";

export async function findManagedStore(user: SessionUser, storeId?: string) {
  return prisma.store.findFirst({
    where: {
      ...(storeId ? { id: storeId } : {}),
      ...(user.role === "ADMIN" ? {} : {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } } } }],
      }),
    },
  });
}

export function commissionPercentage(store: { commissionPercentage: Prisma.Decimal | null }) {
  const percentage = store.commissionPercentage === null
    ? env.stripeDefaultCommissionPercentage
    : Number(store.commissionPercentage);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("Percentual de comissao invalido");
  }
  return percentage;
}

export function platformFee(totalCents: number, percentage: number) {
  if (!Number.isInteger(totalCents) || totalCents <= 0) throw new Error("Total do pedido invalido");
  const fee = Math.round(totalCents * percentage / 100);
  if (fee < 0 || fee >= totalCents) throw new Error("Comissao deve ser menor que o total do pedido");
  return fee;
}

export function accountStatus(account: { charges_enabled: boolean; payouts_enabled: boolean; details_submitted: boolean; requirements?: { currently_due?: string[] | null; disabled_reason?: string | null } | null }) {
  const due = account.requirements?.currently_due ?? [];
  if (account.charges_enabled && account.payouts_enabled) return "ACTIVE";
  if (account.requirements?.disabled_reason) return "SUSPENDED";
  if (account.details_submitted && due.length) return "PENDING_REVIEW";
  if (due.length) return "RESTRICTED";
  return account.details_submitted ? "PENDING_REVIEW" : "ONBOARDING_INCOMPLETE";
}

export async function syncStoreStripeAccount(storeId: string, account: { id: string; charges_enabled: boolean; payouts_enabled: boolean; details_submitted: boolean; requirements?: { currently_due?: string[] | null; eventually_due?: string[] | null; disabled_reason?: string | null } | null }) {
  const requirements = [...new Set([...(account.requirements?.currently_due ?? []), ...(account.requirements?.eventually_due ?? [])])].slice(0, 50);
  return prisma.store.update({
    where: { id: storeId },
    data: {
      stripeAccountId: account.id,
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
      stripeOnboardingCompleted: account.details_submitted && requirements.length === 0,
      stripeAccountStatus: accountStatus(account),
      stripeRequirements: requirements,
    },
  });
}
