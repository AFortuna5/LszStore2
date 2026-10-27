import { describe, expect, it } from "vitest";

import { buildOrderListWhere } from "../src/server/services/order-list";

describe("escopo da listagem de pedidos", () => {
  it("cliente comum so ve os proprios pedidos, mesmo informando outro userId", () => {
    const where = buildOrderListWhere(
      { id: "cliente-1", role: "USER" },
      { userId: "outro-usuario", status: "PAID" },
    );

    expect(where).toEqual({ userId: "cliente-1", status: "PAID" });
  });

  it("admin pode filtrar por userId", () => {
    const where = buildOrderListWhere(
      { id: "admin-1", role: "ADMIN" },
      { userId: "cliente-9" },
    );

    expect(where).toEqual({ userId: "cliente-9" });
  });

  it("admin sem filtro lista todos os pedidos", () => {
    const where = buildOrderListWhere({ id: "admin-1", role: "ADMIN" }, {});

    expect(where).toEqual({});
  });
});
