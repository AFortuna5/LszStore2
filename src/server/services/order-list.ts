export function buildOrderListWhere(
  session: { id: string; role: string },
  filters: { userId?: string; status?: string },
) {
  return {
    ...(session.role === "ADMIN"
      ? (filters.userId ? { userId: filters.userId } : {})
      : { userId: session.id }),
    ...(filters.status ? { status: filters.status } : {}),
  };
}
