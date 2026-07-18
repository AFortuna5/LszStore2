import "server-only";

export type MoneyValue = number | string | { toString(): string };

export function moneyToNumber(value: MoneyValue) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error("MONEY_VALUE_INVALID");
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

export function moneyToCents(value: MoneyValue) {
  return Math.round(moneyToNumber(value) * 100);
}

export function moneySum(values: MoneyValue[]) {
  const cents = values.reduce<number>(
    (sum, value) => sum + Math.round(moneyToNumber(value) * 100),
    0,
  );
  return cents / 100;
}
